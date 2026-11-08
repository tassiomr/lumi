// Configuração não secreta dos dispositivos (IP, versão, mapa de DPs). As local keys ficam no Keychain.

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ProtocolVersion } from "../tuya/protocol.ts";
import type { DpMap } from "../tuya/lightMapper.ts";

export type TuyaDeviceRecord = {
  id: string;
  name: string;
  ip: string;
  version: ProtocolVersion;
  productKey?: string;
  productName?: string;
  category?: string;
  model?: string;
  room?: string;
  /** Do modelo de dados da nuvem. Ausente = inferido do estado local. */
  dpMap?: DpMap;
};

export type BridgeConfig = { tuya: TuyaDeviceRecord[] };

export const defaultConfigDir = join(homedir(), "Library", "Application Support", "Lumi Bridge");

export class ConfigStore {
  readonly path: string;
  private readonly dir: string;

  constructor(dir = process.env.LUMI_BRIDGE_DIR ?? defaultConfigDir) {
    this.dir = dir;
    this.path = join(dir, "devices.json");
  }

  async load(): Promise<BridgeConfig> {
    try {
      return JSON.parse(await readFile(this.path, "utf8")) as BridgeConfig;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return { tuya: [] };
      throw e;
    }
  }

  async save(config: BridgeConfig): Promise<void> {
    await mkdir(this.dir, { recursive: true, mode: 0o700 });
    const tmp = `${this.path}.tmp`;
    await writeFile(tmp, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
    await rename(tmp, this.path);
  }

  async upsert(record: TuyaDeviceRecord): Promise<void> {
    const config = await this.load();
    const i = config.tuya.findIndex((d) => d.id === record.id);
    if (i >= 0) config.tuya[i] = { ...config.tuya[i], ...record };
    else config.tuya.push(record);
    await this.save(config);
  }

  async remove(id: string): Promise<boolean> {
    const config = await this.load();
    const before = config.tuya.length;
    config.tuya = config.tuya.filter((d) => d.id !== id);
    await this.save(config);
    return config.tuya.length < before;
  }
}
