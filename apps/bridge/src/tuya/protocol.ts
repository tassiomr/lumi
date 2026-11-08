// Framing e criptografia do protocolo local Tuya (TCP 6668 / UDP 6666, 6667, 7000).
//
// Não há especificação pública oficial deste protocolo. A implementação segue o comportamento
// documentado por projetos open source (TinyTuya, MIT; tuyapi, MIT) e foi conferida contra os
// broadcasts reais do dispositivo da rede local (versão 3.5, prefixo 0x6699).
//
// 3.1–3.4: 000055AA | seq | cmd | len | [retcode] payload | CRC32 ou HMAC-SHA256 | 0000AA55
// 3.5:     00006699 | 0000 | seq | cmd | len | IV(12) | AES-GCM(payload) | tag(16) | 00009966

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

export type ProtocolVersion = "3.3" | "3.4" | "3.5";

export const Command = {
  sessKeyNegStart: 0x03,
  sessKeyNegResp: 0x04,
  sessKeyNegFinish: 0x05,
  control: 0x07,
  status: 0x08,
  heartBeat: 0x09,
  dpQuery: 0x0a,
  controlNew: 0x0d,
  dpQueryNew: 0x10,
  updateDps: 0x12,
  udpNew: 0x13,
  broadcastLpv34: 0x23,
} as const;

/** Comandos enviados sem o cabeçalho de versão ("3.x" + 12 bytes zerados). */
const noVersionHeader = new Set<number>([
  Command.dpQuery,
  Command.dpQueryNew,
  Command.updateDps,
  Command.heartBeat,
  Command.sessKeyNegStart,
  Command.sessKeyNegResp,
  Command.sessKeyNegFinish,
]);

const PREFIX_55AA = 0x000055aa;
const SUFFIX_55AA = 0x0000aa55;
const PREFIX_6699 = 0x00006699;
const SUFFIX_6699 = 0x00009966;

/** Chave pública usada por todos os dispositivos para cifrar os broadcasts de descoberta. */
export const udpKey = createHash("md5").update("yGAdlopoPVldABfn").digest();

export type Frame = {
  seq: number;
  cmd: number;
  /** Payload já decifrado, sem retcode nem cabeçalho de versão. */
  payload: Buffer;
  retcode?: number;
};

export class ProtocolError extends Error {}

// MARK: - Criptografia

export function aesEcbEncrypt(key: Buffer, data: Buffer, pad = true): Buffer {
  const c = createCipheriv("aes-128-ecb", key, null);
  c.setAutoPadding(pad);
  return Buffer.concat([c.update(data), c.final()]);
}

export function aesEcbDecrypt(key: Buffer, data: Buffer, pad = true): Buffer {
  const d = createDecipheriv("aes-128-ecb", key, null);
  d.setAutoPadding(pad);
  return Buffer.concat([d.update(data), d.final()]);
}

export function hmacSha256(key: Buffer, data: Buffer): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(data: Buffer): number {
  let c = 0xffffffff;
  for (const byte of data) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function versionHeader(version: ProtocolVersion): Buffer {
  return Buffer.concat([Buffer.from(version, "latin1"), Buffer.alloc(12)]);
}

// MARK: - Codificação

export type EncodeOptions = {
  version: ProtocolVersion;
  /** local_key (até a negociação) ou chave de sessão (3.4/3.5). */
  key: Buffer;
  seq: number;
  cmd: number;
  payload: Buffer;
  /** Código de retorno, presente apenas em mensagens enviadas pelo dispositivo (usado pelo dispositivo simulado nos testes). */
  retcode?: number;
  /** Para testes: IV fixo em 3.5. */
  iv?: Buffer;
};

export function encodeFrame(o: EncodeOptions): Buffer {
  const withHeader = !noVersionHeader.has(o.cmd);
  const ret = o.retcode === undefined ? Buffer.alloc(0) : u32(o.retcode);
  switch (o.version) {
    case "3.3": {
      let body = aesEcbEncrypt(o.key, o.payload);
      if (withHeader) body = Buffer.concat([versionHeader("3.3"), body]);
      return frame55AA(o.seq, o.cmd, Buffer.concat([ret, body]), (h) => u32(crc32(h)));
    }
    case "3.4": {
      const plain = withHeader ? Buffer.concat([versionHeader("3.4"), o.payload]) : o.payload;
      const body = Buffer.concat([ret, aesEcbEncrypt(o.key, plain)]);
      return frame55AA(o.seq, o.cmd, body, (h) => hmacSha256(o.key, h));
    }
    case "3.5": {
      const plain = Buffer.concat([ret, withHeader ? versionHeader("3.5") : Buffer.alloc(0), o.payload]);
      const iv = o.iv ?? randomBytes(12);
      const header = Buffer.alloc(18);
      header.writeUInt32BE(PREFIX_6699, 0);
      header.writeUInt16BE(0, 4);
      header.writeUInt32BE(o.seq >>> 0, 6);
      header.writeUInt32BE(o.cmd, 10);
      header.writeUInt32BE(12 + plain.length + 16, 14);
      const c = createCipheriv("aes-128-gcm", o.key, iv);
      c.setAAD(header.subarray(4));
      const ct = Buffer.concat([c.update(plain), c.final()]);
      return Buffer.concat([header, iv, ct, c.getAuthTag(), u32(SUFFIX_6699)]);
    }
  }
}

function frame55AA(seq: number, cmd: number, body: Buffer, mac: (headerAndBody: Buffer) => Buffer): Buffer {
  const macLength = mac(Buffer.alloc(0)).length;
  const header = Buffer.alloc(16);
  header.writeUInt32BE(PREFIX_55AA, 0);
  header.writeUInt32BE(seq >>> 0, 4);
  header.writeUInt32BE(cmd, 8);
  header.writeUInt32BE(body.length + macLength + 4, 12);
  const signed = Buffer.concat([header, body]);
  return Buffer.concat([signed, mac(signed), u32(SUFFIX_55AA)]);
}

function u32(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0);
  return b;
}

// MARK: - Decodificação

/**
 * Extrai um frame completo do início de `buffer`. Retorna `undefined` se ainda faltam bytes.
 * `consumed` indica quantos bytes remover do buffer de leitura.
 */
export function decodeFrame(
  buffer: Buffer,
  version: ProtocolVersion,
  key: Buffer,
): { frame: Frame; consumed: number } | undefined {
  if (buffer.length < 4) return undefined;
  const prefix = buffer.readUInt32BE(0);
  if (prefix === PREFIX_6699) return decode6699(buffer, key);
  if (prefix === PREFIX_55AA) return decode55AA(buffer, version, key);
  throw new ProtocolError(`Prefixo desconhecido 0x${prefix.toString(16)}`);
}

function decode6699(buffer: Buffer, key: Buffer) {
  if (buffer.length < 18) return undefined;
  const length = buffer.readUInt32BE(14);
  const total = 18 + length + 4;
  if (buffer.length < total) return undefined;
  if (buffer.readUInt32BE(18 + length) !== SUFFIX_6699) throw new ProtocolError("Sufixo 3.5 inválido");
  const iv = buffer.subarray(18, 30);
  const ct = buffer.subarray(30, 18 + length - 16);
  const tag = buffer.subarray(18 + length - 16, 18 + length);
  const d = createDecipheriv("aes-128-gcm", key, iv);
  d.setAAD(buffer.subarray(4, 18));
  d.setAuthTag(tag);
  let plain: Buffer;
  try {
    plain = Buffer.concat([d.update(ct), d.final()]);
  } catch {
    throw new ProtocolError("Falha na autenticação AES-GCM (chave incorreta?)");
  }
  const seq = buffer.readUInt32BE(6);
  const cmd = buffer.readUInt32BE(10);
  // Respostas do dispositivo trazem um retcode de 4 bytes dentro do payload cifrado.
  let retcode: number | undefined;
  if (plain.length >= 4 && plain.readUInt32BE(0) <= 0xff && !looksLikePayloadStart(plain)) {
    retcode = plain.readUInt32BE(0);
    plain = plain.subarray(4);
  }
  return { frame: { seq, cmd, retcode, payload: stripVersionHeader(plain) }, consumed: total };
}

function decode55AA(buffer: Buffer, version: ProtocolVersion, key: Buffer) {
  if (buffer.length < 16) return undefined;
  const length = buffer.readUInt32BE(12);
  const total = 16 + length;
  if (buffer.length < total) return undefined;
  if (buffer.readUInt32BE(total - 4) !== SUFFIX_55AA) throw new ProtocolError("Sufixo 55AA inválido");
  const macLength = version === "3.4" ? 32 : 4;
  const signed = buffer.subarray(0, total - 4 - macLength);
  const mac = buffer.subarray(total - 4 - macLength, total - 4);
  if (version === "3.4") {
    if (!hmacSha256(key, signed).equals(mac)) throw new ProtocolError("HMAC inválido (chave incorreta?)");
  } else if (crc32(signed) !== mac.readUInt32BE(0)) {
    throw new ProtocolError("CRC inválido");
  }
  let body = buffer.subarray(16, total - 4 - macLength);
  let retcode: number | undefined;
  // Respostas do dispositivo começam com retcode. Em 3.4 o corpo cifrado é múltiplo de 16.
  if (body.length % 16 === 4 || (version === "3.3" && body.length >= 4 && body.readUInt32BE(0) <= 0xff)) {
    retcode = body.readUInt32BE(0);
    body = body.subarray(4);
  }
  if (version === "3.3") body = stripVersionHeader(body);
  const plain = body.length === 0 ? body : aesEcbDecrypt(key, body);
  return {
    frame: { seq: buffer.readUInt32BE(4), cmd: buffer.readUInt32BE(8), retcode, payload: stripVersionHeader(plain) },
    consumed: total,
  };
}

function looksLikePayloadStart(b: Buffer): boolean {
  return b[0] === 0x7b /* { */ || b.subarray(0, 2).toString("latin1") === "3.";
}

function stripVersionHeader(b: Buffer): Buffer {
  if (b.length >= 15 && /^3\.\d$/.test(b.subarray(0, 3).toString("latin1"))) return b.subarray(15);
  return b;
}

/** Decodifica um broadcast UDP de descoberta (portas 6666, 6667 ou 7000). */
export function decodeDiscovery(packet: Buffer): Record<string, unknown> | undefined {
  try {
    const prefix = packet.readUInt32BE(0);
    let payload: Buffer;
    if (prefix === PREFIX_6699) {
      payload = decode6699(packet, udpKey)?.frame.payload ?? Buffer.alloc(0);
    } else if (prefix === PREFIX_55AA) {
      const length = packet.readUInt32BE(12);
      let body = packet.subarray(16, 16 + length - 8);
      if (body.length % 16 === 4) body = body.subarray(4);
      payload = body[0] === 0x7b ? body : aesEcbDecrypt(udpKey, body);
    } else {
      return undefined;
    }
    const text = payload.toString("utf8");
    const start = text.indexOf("{");
    return start >= 0 ? (JSON.parse(text.slice(start)) as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

// MARK: - Negociação de chave de sessão (3.4 e 3.5)

export function sessionKey(version: "3.4" | "3.5", localKey: Buffer, localNonce: Buffer, remoteNonce: Buffer): Buffer {
  const xored = Buffer.alloc(16);
  for (let i = 0; i < 16; i++) xored[i] = localNonce[i] ^ remoteNonce[i];
  if (version === "3.4") return aesEcbEncrypt(localKey, xored, false);
  const c = createCipheriv("aes-128-gcm", localKey, localNonce.subarray(0, 12));
  return Buffer.concat([c.update(xored), c.final()]).subarray(0, 16);
}
