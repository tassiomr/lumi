// Dispositivo Tuya SIMULADO, apenas para testes automatizados do protocolo e do adapter.
// Não é evidência de funcionamento com hardware real.

import { randomBytes } from "node:crypto";
import { createServer, type AddressInfo, type Server, type Socket } from "node:net";
import type { Dps } from "../src/tuya/lan.ts";
import { Command, decodeFrame, encodeFrame, hmacSha256, sessionKey, type ProtocolVersion } from "../src/tuya/protocol.ts";

export type FakeDeviceOptions = { version: ProtocolVersion; localKey: string; dps: Dps; ignoreControl?: boolean };

export class FakeDevice {
  dps: Dps;
  readonly received: number[] = [];
  private server: Server;
  private sockets = new Set<Socket>();
  private readonly o: FakeDeviceOptions;

  constructor(o: FakeDeviceOptions) {
    this.o = o;
    this.dps = { ...o.dps };
    this.server = createServer((s) => this.handle(s));
  }

  async listen(): Promise<number> {
    await new Promise<void>((r) => this.server.listen(0, "127.0.0.1", r));
    return (this.server.address() as AddressInfo).port;
  }

  /** Simula uma alteração feita por outro app ou pelo interruptor. */
  externalChange(dps: Dps) {
    Object.assign(this.dps, dps);
    for (const s of this.sockets) this.push(s, dps);
  }

  dropConnections() {
    for (const s of this.sockets) s.destroy();
  }

  async close() {
    this.dropConnections();
    await new Promise((r) => this.server.close(r));
  }

  private keys = new WeakMap<Socket, Buffer>();

  private handle(socket: Socket) {
    this.sockets.add(socket);
    socket.on("close", () => this.sockets.delete(socket));
    socket.on("error", () => undefined);
    const localKey = Buffer.from(this.o.localKey, "latin1");
    this.keys.set(socket, localKey);
    let buffer = Buffer.alloc(0);
    let localNonce: Buffer | undefined;
    let remoteNonce: Buffer | undefined;

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        let decoded;
        try {
          decoded = decodeFrame(buffer, this.o.version, this.keys.get(socket)!);
        } catch {
          socket.destroy(); // chave errada: o dispositivo real também encerra a conexão
          return;
        }
        if (!decoded) return;
        buffer = buffer.subarray(decoded.consumed);
        const { cmd, payload, seq } = decoded.frame;
        this.received.push(cmd);
        const reply = (c: number, body: Buffer | object) => this.send(socket, seq, c, body);

        switch (cmd) {
          case Command.sessKeyNegStart:
            localNonce = payload.subarray(0, 16);
            remoteNonce = randomBytes(16);
            reply(Command.sessKeyNegResp, Buffer.concat([remoteNonce, hmacSha256(localKey, localNonce)]));
            break;
          case Command.sessKeyNegFinish:
            if (!remoteNonce || !localNonce || !hmacSha256(localKey, remoteNonce).equals(payload)) {
              socket.destroy();
              return;
            }
            this.keys.set(socket, sessionKey(this.o.version as "3.4" | "3.5", localKey, localNonce, remoteNonce));
            break;
          case Command.heartBeat:
            reply(Command.heartBeat, Buffer.alloc(0));
            break;
          case Command.dpQuery:
          case Command.dpQueryNew:
            reply(cmd, this.o.version === "3.3" ? { devId: "fake", dps: this.dps } : { protocol: 4, t: 0, data: { dps: this.dps } });
            break;
          case Command.control:
          case Command.controlNew: {
            reply(cmd, Buffer.alloc(0));
            if (this.o.ignoreControl) break;
            const json = JSON.parse(payload.toString("utf8")) as { dps?: Dps; data?: { dps: Dps } };
            const changed = json.dps ?? json.data!.dps;
            Object.assign(this.dps, changed);
            this.push(socket, changed);
            break;
          }
        }
      }
    });
  }

  private push(socket: Socket, dps: Dps) {
    this.send(socket, 0, Command.status, this.o.version === "3.3" ? { devId: "fake", dps } : { protocol: 4, t: 0, data: { dps } });
  }

  private send(socket: Socket, seq: number, cmd: number, body: Buffer | object) {
    const payload = Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body));
    socket.write(encodeFrame({ version: this.o.version, key: this.keys.get(socket)!, seq, cmd, payload, retcode: 0 }));
  }
}
