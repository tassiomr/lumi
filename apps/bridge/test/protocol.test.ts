import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Command, crc32, decodeDiscovery, decodeFrame, encodeFrame, udpKey, type ProtocolVersion } from "../src/tuya/protocol.ts";

const key = Buffer.from("0123456789abcdef", "latin1");

describe("protocolo local Tuya", () => {
  it("CRC32 confere com o vetor padrão", () => {
    assert.equal(crc32(Buffer.from("123456789")), 0xcbf43926);
  });

  for (const version of ["3.3", "3.4", "3.5"] as ProtocolVersion[]) {
    it(`codifica e decodifica frames ${version}, com e sem cabeçalho de versão`, () => {
      for (const cmd of [Command.controlNew, Command.dpQueryNew]) {
        const payload = Buffer.from('{"dps":{"20":true}}');
        const frame = encodeFrame({ version, key, seq: 7, cmd, payload });
        const decoded = decodeFrame(frame, version, key);
        assert.ok(decoded);
        assert.equal(decoded.consumed, frame.length);
        assert.equal(decoded.frame.seq, 7);
        assert.equal(decoded.frame.cmd, cmd);
        assert.equal(decoded.frame.payload.toString(), payload.toString());
      }
    });

    it(`separa o retcode das respostas do dispositivo (${version})`, () => {
      const frame = encodeFrame({ version, key, seq: 1, cmd: Command.status, payload: Buffer.from('{"dps":{}}'), retcode: 0 });
      const decoded = decodeFrame(frame, version, key)!;
      assert.equal(decoded.frame.retcode, 0);
      assert.equal(decoded.frame.payload.toString(), '{"dps":{}}');
    });

    it(`aguarda frames incompletos e rejeita chave errada (${version})`, () => {
      const frame = encodeFrame({ version, key, seq: 1, cmd: Command.control, payload: Buffer.from("{}") });
      assert.equal(decodeFrame(frame.subarray(0, frame.length - 3), version, key), undefined);
      const wrong = Buffer.from("fedcba9876543210", "latin1");
      assert.throws(() => decodeFrame(frame, version, wrong));
    });
  }

  it("decodifica broadcast de descoberta 3.5 (porta 6667)", () => {
    const info = { ip: "192.168.0.10", gwId: "device-id", productKey: "pk", version: "3.5", encrypt: true };
    const packet = encodeFrame({ version: "3.5", key: udpKey, seq: 0, cmd: Command.udpNew, payload: Buffer.from(JSON.stringify(info)), retcode: 0 });
    assert.deepEqual(decodeDiscovery(packet), info);
  });

  it("decodifica broadcast de descoberta 3.3 (porta 6667)", () => {
    const info = { ip: "192.168.0.11", gwId: "device-33", version: "3.3" };
    const packet = encodeFrame({ version: "3.3", key: udpKey, seq: 0, cmd: Command.dpQuery, payload: Buffer.from(JSON.stringify(info)), retcode: 0 });
    assert.deepEqual(decodeDiscovery(packet), info);
  });
});
