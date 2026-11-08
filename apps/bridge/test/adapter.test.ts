// Testes contra um dispositivo SIMULADO (test/fakeDevice.ts): validam a lógica de sessão,
// confirmação e sincronização, não a compatibilidade com o hardware real.

import assert from "node:assert/strict";
import { once } from "node:events";
import { after, describe, it } from "node:test";
import type { Device } from "../src/core/types.ts";
import { MemoryStore, accounts } from "../src/store/secrets.ts";
import { TuyaDeviceAdapter } from "../src/tuya/adapter.ts";
import { TuyaLanDevice } from "../src/tuya/lan.ts";
import type { ProtocolVersion } from "../src/tuya/protocol.ts";
import { FakeDevice } from "./fakeDevice.ts";

const localKey = "0123456789abcdef";
const initial = { "20": false, "21": "white", "22": 500, "23": 500, "24": "000003e803e8" };
const cleanups: (() => Promise<void>)[] = [];
after(async () => {
  for (const c of cleanups) await c();
});

async function setup(version: ProtocolVersion, opts: { ignoreControl?: boolean } = {}) {
  const fake = new FakeDevice({ version, localKey, dps: initial, ...opts });
  const port = await fake.listen();
  const secrets = new MemoryStore();
  await secrets.set(accounts.localKey("dev1"), localKey);
  const adapter = new TuyaDeviceAdapter([{ id: "dev1", name: "Quarto", ip: "127.0.0.1", version }], {
    secrets,
    confirmTimeoutMs: 300,
    connect: (o) => new TuyaLanDevice({ ...o, port, timeoutMs: 500, heartbeatMs: 60_000 }),
  });
  cleanups.push(async () => {
    await adapter.stop();
    await fake.close();
  });
  return { fake, adapter };
}

for (const version of ["3.3", "3.4", "3.5"] as ProtocolVersion[]) {
  describe(`adapter Tuya, protocolo ${version} (dispositivo simulado)`, () => {
    it("lê o estado e as capacidades", async () => {
      const { adapter } = await setup(version);
      const d = await adapter.refresh("dev1");
      assert.equal(d.connectivity, "online");
      assert.deepEqual(d.capabilities, ["power", "brightness", "colorTemperature", "color", "mode"]);
      assert.equal(d.state?.on, false);
    });

    it("só atualiza o estado após a confirmação do dispositivo", async () => {
      const { adapter, fake } = await setup(version);
      const d = await adapter.execute("dev1", { type: "color", hue: 240, saturation: 1 });
      assert.equal(d.state?.mode, "colour");
      assert.equal(d.state?.hue, 240);
      assert.equal(fake.dps["24"], "00f003e801ef"); // brilho atual (50%) preservado
    });

    it("rejeita quando o dispositivo não aplica o comando, sem alterar o estado", async () => {
      const { adapter } = await setup(version, { ignoreControl: true });
      await adapter.refresh("dev1");
      await assert.rejects(adapter.execute("dev1", { type: "power", on: true }));
      assert.equal(adapter.devices()[0].state?.on, false);
    });

    it("propaga alterações feitas por outro app", async () => {
      const { adapter, fake } = await setup(version);
      await adapter.start();
      const update = once(adapter, "update");
      fake.externalChange({ "20": true });
      const [d] = (await update) as [Device];
      assert.equal(d.state?.on, true);
    });

    it("marca offline e reconecta quando a conexão cai", async () => {
      const { adapter, fake } = await setup(version);
      await adapter.start();
      const offline = new Promise<void>((r) => adapter.on("update", (d: Device) => d.connectivity === "offline" && r()));
      fake.dropConnections();
      await offline;
      const online = new Promise<void>((r) => adapter.on("update", (d: Device) => d.connectivity === "online" && r()));
      await online;
      assert.equal(adapter.devices()[0].connectivity, "online");
    });
  });
}

describe("local key", () => {
  it("falha a negociação 3.5 com a chave errada", async () => {
    const fake = new FakeDevice({ version: "3.5", localKey, dps: initial });
    const port = await fake.listen();
    const lan = new TuyaLanDevice({ id: "dev1", ip: "127.0.0.1", port, version: "3.5", localKey: "ffffffffffffffff", timeoutMs: 500 });
    await assert.rejects(lan.connect());
    await fake.close();
  });
});
