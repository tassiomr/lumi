// TuyaDeviceAdapter: mantém uma conexão local por lâmpada, com reconexão, cache de estado e
// confirmação de comandos. Não conhece HomeKit nem a CLI.

import { EventEmitter } from "node:events";
import type { Device, DeviceAdapter, LightCommand } from "../core/types.ts";
import type { TuyaDeviceRecord } from "../store/config.ts";
import { accounts, type SecretStore } from "../store/secrets.ts";
import { TuyaLanDevice, type Dps, type LanDeviceOptions } from "./lan.ts";
import { capabilities, dpsForCommand, inferDpMap, modes, stateFromDps, type DpMap } from "./lightMapper.ts";

type Entry = {
  record: TuyaDeviceRecord;
  lan?: TuyaLanDevice;
  dps: Dps;
  map?: DpMap;
  device: Device;
  retryMs: number;
  retryTimer?: NodeJS.Timeout;
  connecting?: Promise<void>;
};

export type AdapterOptions = {
  secrets: SecretStore;
  log?: (message: string) => void;
  /** Tempo máximo para o dispositivo confirmar um comando. */
  confirmTimeoutMs?: number;
  /** Injetável para testes. */
  connect?: (o: LanDeviceOptions) => TuyaLanDevice;
};

const maxRetryMs = 60_000;

export class TuyaDeviceAdapter extends EventEmitter implements DeviceAdapter {
  readonly provider = "tuya";
  private entries = new Map<string, Entry>();
  private running = false;
  private readonly opts: AdapterOptions;

  constructor(records: TuyaDeviceRecord[], opts: AdapterOptions) {
    super();
    this.opts = opts;
    for (const record of records) {
      this.entries.set(`tuya:${record.id}`, {
        record,
        dps: {},
        map: record.dpMap,
        retryMs: 1000,
        device: {
          id: `tuya:${record.id}`,
          name: record.name,
          manufacturer: record.productName?.toLowerCase().includes("elgin") ? "Elgin" : "Tuya",
          model: record.model ?? record.productName ?? record.productKey ?? "Desconhecido",
          type: "light",
          provider: this.provider,
          connectivity: "offline",
          capabilities: record.dpMap ? capabilities(record.dpMap) : [],
          modes: [],
        },
      });
    }
  }

  devices(): Device[] {
    return [...this.entries.values()].map((e) => e.device);
  }

  async start(): Promise<void> {
    this.running = true;
    await Promise.all([...this.entries.values()].map((e) => this.ensureConnected(e).catch(() => undefined)));
  }

  async stop(): Promise<void> {
    this.running = false;
    for (const e of this.entries.values()) {
      clearTimeout(e.retryTimer);
      e.lan?.removeAllListeners();
      e.lan?.close();
      e.lan = undefined;
    }
  }

  async refresh(deviceId: string): Promise<Device> {
    const e = this.entry(deviceId);
    await this.ensureConnected(e);
    this.merge(e, await e.lan!.query());
    return e.device;
  }

  async execute(deviceId: string, command: LightCommand): Promise<Device> {
    const e = this.entry(deviceId);
    await this.ensureConnected(e);
    if (!e.map) throw new Error("Mapa de DPs desconhecido: rode `lumi cloud-sync`");
    const dps = dpsForCommand(e.map, command, e.device.state);
    const lan = e.lan!;
    // O estado só muda quando o próprio dispositivo reporta os novos DPs.
    const confirmed = waitForDps(lan, dps, this.opts.confirmTimeoutMs ?? 3000);
    try {
      await lan.set(dps);
      await confirmed.promise;
    } catch (error) {
      confirmed.cancel();
      // Sem confirmação por push: consulta o estado real antes de desistir.
      const actual = await lan.query().catch(() => undefined);
      if (actual) this.merge(e, actual);
      if (!actual || !matches(actual, dps)) throw error;
    }
    return e.device;
  }

  // MARK: - Conexão

  private entry(deviceId: string): Entry {
    const e = this.entries.get(deviceId) ?? this.entries.get(`tuya:${deviceId}`);
    if (!e) throw new Error(`Dispositivo desconhecido: ${deviceId}`);
    return e;
  }

  private ensureConnected(e: Entry): Promise<void> {
    if (e.lan?.isConnected) return Promise.resolve();
    e.connecting ??= this.connect(e).finally(() => (e.connecting = undefined));
    return e.connecting;
  }

  private async connect(e: Entry): Promise<void> {
    const localKey = await this.opts.secrets.get(accounts.localKey(e.record.id));
    if (!localKey) {
      this.setConnectivity(e, "offline", "Local key ausente no Keychain");
      throw new Error(`Local key de ${e.record.name} não encontrada no Keychain`);
    }
    this.setConnectivity(e, "connecting");
    const options: LanDeviceOptions = {
      id: e.record.id,
      ip: e.record.ip,
      version: e.record.version,
      localKey,
      log: this.opts.log,
    };
    const lan = this.opts.connect?.(options) ?? new TuyaLanDevice(options);
    try {
      await lan.connect();
      lan.on("dps", (dps: Dps) => this.merge(e, dps));
      lan.on("close", (error?: Error) => this.onClose(e, lan, error));
      e.lan = lan;
      e.retryMs = 1000;
      this.merge(e, await lan.query());
      this.setConnectivity(e, "online");
    } catch (error) {
      lan.removeAllListeners();
      lan.close();
      if (e.lan === lan) e.lan = undefined;
      this.setConnectivity(e, "offline", (error as Error).message);
      this.scheduleReconnect(e);
      throw error;
    }
  }

  private onClose(e: Entry, lan: TuyaLanDevice, error?: Error) {
    if (e.lan !== lan) return;
    e.lan = undefined;
    this.setConnectivity(e, "offline", error?.message);
    this.scheduleReconnect(e);
  }

  private scheduleReconnect(e: Entry) {
    if (!this.running || e.retryTimer) return;
    const delay = e.retryMs;
    e.retryMs = Math.min(e.retryMs * 2, maxRetryMs);
    this.opts.log?.(`${e.record.name}: nova tentativa em ${delay / 1000}s`);
    e.retryTimer = setTimeout(() => {
      e.retryTimer = undefined;
      this.ensureConnected(e).catch(() => undefined);
    }, delay);
  }

  // MARK: - Estado

  private merge(e: Entry, dps: Dps) {
    e.dps = { ...e.dps, ...dps };
    e.map ??= inferDpMap(e.dps);
    if (!e.map) {
      e.device = { ...e.device, lastError: "DPs não reconhecidos como lâmpada; rode `lumi cloud-sync`" };
      this.emit("update", e.device);
      return;
    }
    e.device = {
      ...e.device,
      capabilities: capabilities(e.map),
      modes: modes(e.map, e.dps),
      state: stateFromDps(e.map, e.dps),
      stateUpdatedAt: new Date(),
      connectivity: "online",
      lastError: undefined,
    };
    this.emit("update", e.device);
  }

  private setConnectivity(e: Entry, connectivity: Device["connectivity"], lastError?: string) {
    if (e.device.connectivity === connectivity && e.device.lastError === lastError) return;
    e.device = { ...e.device, connectivity, lastError };
    this.emit("update", e.device);
  }

  /** DPs brutos, para diagnóstico. */
  rawDps(deviceId: string): Dps {
    return { ...this.entry(deviceId).dps };
  }
}

function matches(actual: Dps, expected: Dps): boolean {
  return Object.entries(expected).every(([k, v]) => actual[k] === v);
}

function waitForDps(lan: TuyaLanDevice, expected: Dps, timeoutMs: number) {
  const seen: Dps = {};
  let cancel = () => {};
  const promise = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      lan.off("dps", onDps);
      reject(new Error("O dispositivo não confirmou o comando"));
    }, timeoutMs);
    const onDps = (dps: Dps) => {
      Object.assign(seen, dps);
      if (matches(seen, expected)) {
        clearTimeout(timer);
        lan.off("dps", onDps);
        resolve();
      }
    };
    lan.on("dps", onDps);
    cancel = () => {
      clearTimeout(timer);
      lan.off("dps", onDps);
    };
  });
  promise.catch(() => undefined);
  return { promise, cancel };
}
