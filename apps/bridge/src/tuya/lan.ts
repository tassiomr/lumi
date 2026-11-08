// Conexão TCP com um dispositivo Tuya na rede local (porta 6668).
//
// Uma conexão por dispositivo, com comandos serializados: muitos dispositivos Tuya aceitam
// poucas conexões simultâneas e respondem fora de ordem quando recebem comandos em paralelo.

import { EventEmitter } from "node:events";
import { randomBytes } from "node:crypto";
import { Socket } from "node:net";
import {
  Command,
  decodeFrame,
  encodeFrame,
  hmacSha256,
  ProtocolError,
  sessionKey,
  type Frame,
  type ProtocolVersion,
} from "./protocol.ts";

export type DpValue = boolean | number | string;
export type Dps = Record<string, DpValue>;

export type LanDeviceOptions = {
  id: string;
  ip: string;
  localKey: string;
  version: ProtocolVersion;
  port?: number;
  timeoutMs?: number;
  heartbeatMs?: number;
  log?: (message: string) => void;
};

export class TuyaTimeoutError extends Error {}

type Waiter = { accept: (f: Frame) => boolean; resolve: (f: Frame) => void; reject: (e: Error) => void; timer: NodeJS.Timeout };

/**
 * Eventos: `dps` (Dps parciais enviados pelo dispositivo, inclusive após comandos de outros apps),
 * `close` (Error | undefined).
 */
export class TuyaLanDevice extends EventEmitter {
  readonly options: Required<Omit<LanDeviceOptions, "log">> & Pick<LanDeviceOptions, "log">;
  private socket?: Socket;
  private buffer = Buffer.alloc(0);
  private seq = 1;
  private key: Buffer;
  private readonly localKey: Buffer;
  private waiters: Waiter[] = [];
  private queue: Promise<unknown> = Promise.resolve();
  private heartbeat?: NodeJS.Timeout;

  constructor(options: LanDeviceOptions) {
    super();
    this.options = { port: 6668, timeoutMs: 5000, heartbeatMs: 10_000, ...options };
    if (Buffer.byteLength(options.localKey, "latin1") !== 16) throw new Error("A local key deve ter 16 caracteres");
    this.localKey = Buffer.from(options.localKey, "latin1");
    this.key = this.localKey;
  }

  get isConnected(): boolean {
    return this.socket !== undefined && !this.socket.destroyed;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    const { ip, port, timeoutMs } = this.options;
    const socket = new Socket();
    socket.setNoDelay(true);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.destroy();
        reject(new TuyaTimeoutError(`Sem resposta de ${ip}:${port}`));
      }, timeoutMs);
      socket.once("error", (e) => {
        clearTimeout(timer);
        reject(e);
      });
      socket.connect(port, ip, () => {
        clearTimeout(timer);
        resolve();
      });
    });
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.key = this.localKey;
    socket.on("data", (chunk) => this.onData(chunk));
    socket.on("error", (e) => this.teardown(e));
    socket.on("close", () => this.teardown());

    try {
      if (this.options.version !== "3.3") await this.negotiateSessionKey();
    } catch (e) {
      this.teardown(e as Error);
      throw e;
    }
    this.heartbeat = setInterval(() => {
      this.enqueue(() => this.request(Command.heartBeat, this.options.version === "3.3" ? this.basePayload() : {}, [Command.heartBeat]))
        .catch((e) => this.log(`heartbeat: ${(e as Error).message}`));
    }, this.options.heartbeatMs);
  }

  close(): void {
    this.socket?.destroy();
    this.teardown();
  }

  /** Lê todos os DPs atuais. */
  query(): Promise<Dps> {
    return this.enqueue(async () => {
      const v = this.options.version;
      const cmd = v === "3.3" ? Command.dpQuery : Command.dpQueryNew;
      const payload = v === "3.3" ? { ...this.basePayload(), uid: this.options.id, t: now() } : {};
      const frame = await this.request(cmd, payload, [cmd, Command.status]);
      return extractDps(frame.payload) ?? {};
    });
  }

  /** Publica DPs. Resolve quando o dispositivo confirma o recebimento; o novo estado chega pelo evento `dps`. */
  set(dps: Dps): Promise<void> {
    return this.enqueue(async () => {
      const v = this.options.version;
      const cmd = v === "3.3" ? Command.control : Command.controlNew;
      const payload =
        v === "3.3"
          ? { devId: this.options.id, uid: this.options.id, t: now(), dps }
          : { protocol: 5, t: now(), data: { dps } };
      const frame = await this.request(cmd, payload, [cmd]);
      if (frame.retcode !== undefined && frame.retcode !== 0) {
        throw new ProtocolError(`O dispositivo recusou o comando (código ${frame.retcode})`);
      }
    });
  }

  // MARK: - Internos

  private basePayload() {
    return { gwId: this.options.id, devId: this.options.id };
  }

  private enqueue<T>(work: () => Promise<T>): Promise<T> {
    const result = this.queue.then(work, work);
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async negotiateSessionKey(): Promise<void> {
    const version = this.options.version as "3.4" | "3.5";
    const localNonce = randomBytes(16);
    const resp = await this.request(Command.sessKeyNegStart, localNonce, [Command.sessKeyNegResp]);
    const remoteNonce = resp.payload.subarray(0, 16);
    const proof = resp.payload.subarray(16, 48);
    if (remoteNonce.length !== 16 || !hmacSha256(this.localKey, localNonce).equals(proof)) {
      throw new ProtocolError("Negociação de sessão falhou: a local key não confere");
    }
    this.send(Command.sessKeyNegFinish, hmacSha256(this.localKey, remoteNonce));
    this.key = sessionKey(version, this.localKey, localNonce, remoteNonce);
    this.log("chave de sessão negociada");
  }

  private send(cmd: number, payload: object | Buffer): number {
    if (!this.socket || this.socket.destroyed) throw new Error("Não conectado");
    const seq = this.seq++;
    const body = Buffer.isBuffer(payload) ? payload : Buffer.from(JSON.stringify(payload), "utf8");
    this.socket.write(encodeFrame({ version: this.options.version, key: this.key, seq, cmd, payload: body }));
    return seq;
  }

  private request(cmd: number, payload: object | Buffer, expect: number[]): Promise<Frame> {
    return new Promise<Frame>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters = this.waiters.filter((w) => w !== waiter);
        reject(new TuyaTimeoutError(`Tempo esgotado aguardando resposta ao comando 0x${cmd.toString(16)}`));
      }, this.options.timeoutMs);
      const waiter: Waiter = { accept: (f) => expect.includes(f.cmd), resolve, reject, timer };
      this.waiters.push(waiter);
      try {
        this.send(cmd, payload);
      } catch (e) {
        clearTimeout(timer);
        this.waiters = this.waiters.filter((w) => w !== waiter);
        reject(e as Error);
      }
    });
  }

  private onData(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    for (;;) {
      let decoded;
      try {
        decoded = decodeFrame(this.buffer, this.options.version, this.key);
      } catch (e) {
        this.log(`frame descartado: ${(e as Error).message}`);
        this.socket?.destroy(e as Error);
        return;
      }
      if (!decoded) return;
      this.buffer = this.buffer.subarray(decoded.consumed);
      this.dispatch(decoded.frame);
    }
  }

  private dispatch(frame: Frame) {
    const index = this.waiters.findIndex((w) => w.accept(frame));
    const isPush = frame.cmd === Command.status || frame.cmd === Command.updateDps;
    if (index >= 0 && !(isPush && frame.payload.length === 0)) {
      const [waiter] = this.waiters.splice(index, 1);
      clearTimeout(waiter.timer);
      waiter.resolve(frame);
    }
    if (isPush || frame.cmd === Command.dpQuery || frame.cmd === Command.dpQueryNew) {
      const dps = extractDps(frame.payload);
      if (dps && Object.keys(dps).length > 0) this.emit("dps", dps);
    }
  }

  private teardown(error?: Error) {
    if (!this.socket) return;
    this.socket = undefined;
    clearInterval(this.heartbeat);
    for (const w of this.waiters) {
      clearTimeout(w.timer);
      w.reject(error ?? new Error("Conexão encerrada"));
    }
    this.waiters = [];
    this.emit("close", error);
  }

  private log(message: string) {
    this.options.log?.(`[${this.options.ip}] ${message}`);
  }
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

export function extractDps(payload: Buffer): Dps | undefined {
  const text = payload.toString("utf8");
  const start = text.indexOf("{");
  if (start < 0) return undefined;
  try {
    const json = JSON.parse(text.slice(start)) as { dps?: Dps; data?: { dps?: Dps } };
    return json.dps ?? json.data?.dps;
  } catch {
    return undefined;
  }
}
