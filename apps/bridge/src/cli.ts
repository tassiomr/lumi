// lumi — prova de conceito: descobre e controla lâmpadas Tuya/Elgin pela rede local.
//
//   node src/cli.ts help

import { createInterface } from "node:readline";
import type { Device, LightCommand } from "./core/types.ts";
import { ConfigStore, type TuyaDeviceRecord } from "./store/config.ts";
import { accounts, KeychainStore } from "./store/secrets.ts";
import { TuyaDeviceAdapter } from "./tuya/adapter.ts";
import { dataCenters, TuyaCloud, type CloudCredentials, type DataCenter } from "./tuya/cloud.ts";
import { discover, isSupportedVersion, type DiscoveredDevice } from "./tuya/discovery.ts";
import { dpMapFromSpecs } from "./tuya/lightMapper.ts";

const usage = `Uso: lumi <comando> [argumentos]

Descoberta e configuração
  discover [segundos]          Escuta os anúncios Tuya na rede local (padrão: 10 s)
  cloud-setup                  Guarda no Keychain o Access ID/Secret do seu projeto Tuya
  cloud-sync                   Importa dispositivos, local keys e modelo de DPs da sua conta
  add <id> <ip> <versão>       Cadastra manualmente (a local key é pedida sem eco)
  remove <dispositivo>         Remove do Lumi (não desvincula da conta Tuya)
  list                         Dispositivos cadastrados

Controle (dispositivo = nome ou id)
  status <dispositivo>         Estado atual lido do hardware
  on | off <dispositivo>
  brightness <dispositivo> <1-100>
  temp <dispositivo> <0-100>   0 = branco mais quente, 100 = mais frio
  color <dispositivo> <matiz 0-360> [saturação 0-100]
  mode <dispositivo> <modo>    Modos informados pelo dispositivo (veja status)
  watch [dispositivo]          Mantém a conexão e mostra alterações feitas por outros apps
  raw <dispositivo>            DPs brutos (diagnóstico)
`;

const config = new ConfigStore();
const secrets = new KeychainStore();
const verbose = process.env.LUMI_DEBUG === "1";
const log = verbose ? (m: string) => console.error(`· ${m}`) : undefined;

async function main(argv: string[]): Promise<void> {
  const [command, ...args] = argv;
  switch (command) {
    case "discover":
      return cmdDiscover(Number(args[0] ?? 10));
    case "cloud-setup":
      return cmdCloudSetup();
    case "cloud-sync":
      return cmdCloudSync();
    case "add":
      return cmdAdd(args);
    case "remove":
      return cmdRemove(args[0]);
    case "list":
      return cmdList();
    case "status":
      return withDevice(args[0], async (a, d) => print(await a.refresh(d.id)));
    case "raw":
      return withDevice(args[0], async (a, d) => {
        await a.refresh(d.id);
        console.log(JSON.stringify(a.rawDps(d.id), null, 2));
      });
    case "on":
    case "off":
      return control(args[0], { type: "power", on: command === "on" });
    case "brightness":
      return control(args[0], { type: "brightness", value: percent(args[1], 1) });
    case "temp":
      return control(args[0], { type: "colorTemperature", value: percent(args[1], 0) });
    case "color":
      return control(args[0], {
        type: "color",
        hue: number(args[1], 0, 360, "matiz"),
        saturation: args[2] === undefined ? 1 : percent(args[2], 0),
      });
    case "mode":
      return withDevice(args[0], async (a, d) => {
        const device = await a.refresh(d.id);
        if (!args[1] || !device.modes.includes(args[1])) {
          throw new Error(`Modos aceitos por ${device.name}: ${device.modes.join(", ") || "nenhum"}`);
        }
        print(await a.execute(d.id, { type: "mode", mode: args[1] }));
      });
    case "watch":
      return cmdWatch(args[0]);
    case undefined:
    case "help":
    case "--help":
      console.log(usage);
      return;
    default:
      throw new Error(`Comando desconhecido: ${command}\n\n${usage}`);
  }
}

// MARK: - Comandos

async function cmdDiscover(seconds: number) {
  console.log(`Escutando anúncios Tuya por ${seconds} s (UDP 6666, 6667, 7000)…`);
  const found = await discover(seconds, (d) => console.log(`  ${d.ip.padEnd(15)} v${d.version}  id ${d.id}  produto ${d.productKey ?? "?"}`));
  if (found.length === 0) {
    console.log("Nenhum dispositivo anunciado. Verifique se o Mac está na mesma rede (2,4 GHz/mesma sub-rede) que a lâmpada.");
  }
}

async function cmdCloudSetup() {
  console.log("Credenciais do projeto em https://platform.tuya.com › Cloud › Development › Overview.");
  const accessId = (await ask("Access ID: ")).trim();
  const accessSecret = (await ask("Access Secret: ", true)).trim();
  const region = (await ask(`Data center (${Object.keys(dataCenters).join(", ")}) [us]: `)).trim() || "us";
  if (!(region in dataCenters)) throw new Error(`Data center inválido: ${region}`);
  const creds: CloudCredentials = { accessId, accessSecret, region: region as DataCenter };
  const devices = await new TuyaCloud(creds).devices(); // valida antes de gravar
  await secrets.set(accounts.cloud, JSON.stringify(creds));
  console.log("Credenciais válidas e guardadas no Keychain (com.trmedia.lumi.bridge).");
  console.log(`${devices.length} dispositivo(s) visível(is) no projeto.`);
  if (devices.length === 0) console.log(noDevicesHint);
}

async function cmdCloudSync() {
  const raw = await secrets.get(accounts.cloud);
  if (!raw) throw new Error("Rode `lumi cloud-setup` primeiro.");
  const cloud = new TuyaCloud(JSON.parse(raw) as CloudCredentials);
  console.log("Consultando dispositivos da conta vinculada…");
  const devices = await cloud.devices();
  if (devices.length === 0) return console.log(noDevicesHint);
  console.log("Procurando os dispositivos na rede local (10 s)…");
  const local = new Map<string, DiscoveredDevice>((await discover(10)).map((d) => [d.id, d]));

  for (const d of devices) {
    const lan = local.get(d.id);
    const specs = await cloud.dpSpecs(d.id).catch((e) => {
      console.log(`  ${d.name}: modelo de DPs indisponível (${(e as Error).message}); será inferido localmente.`);
      return [];
    });
    if (!lan) {
      console.log(`  ${d.name}: não anunciou na rede local — sem controle local por enquanto.`);
      continue;
    }
    if (!isSupportedVersion(lan.version)) {
      console.log(`  ${d.name}: protocolo ${lan.version} ainda não suportado.`);
      continue;
    }
    if (!d.localKey) {
      console.log(`  ${d.name}: a nuvem não retornou a local key.`);
      continue;
    }
    await secrets.set(accounts.localKey(d.id), d.localKey);
    const record: TuyaDeviceRecord = {
      id: d.id,
      name: d.name,
      ip: lan.ip,
      version: lan.version,
      productKey: lan.productKey ?? d.productId,
      productName: d.productName,
      category: d.category,
      model: d.model,
      dpMap: specs.length ? dpMapFromSpecs(specs) : undefined,
    };
    await config.upsert(record);
    console.log(`  ✓ ${d.name} (${d.productName ?? d.category ?? "?"}) em ${lan.ip}, v${lan.version}`);
  }
  console.log(`Configuração: ${config.path}`);
}

async function cmdAdd([id, ip, version]: string[]) {
  if (!id || !ip || !version) throw new Error("Uso: lumi add <id> <ip> <versão>");
  if (!isSupportedVersion(version)) throw new Error("Versões suportadas: 3.3, 3.4, 3.5");
  const localKey = await ask("Local key (16 caracteres): ", true);
  if (localKey.length !== 16) throw new Error("A local key deve ter 16 caracteres.");
  const name = (await ask("Nome [Lâmpada]: ")).trim() || "Lâmpada";
  await secrets.set(accounts.localKey(id), localKey);
  await config.upsert({ id, ip, version, name });
  console.log(`Cadastrado. Teste com: lumi status "${name}"`);
}

async function cmdRemove(query?: string) {
  const record = await find(query);
  await config.remove(record.id);
  await secrets.delete(accounts.localKey(record.id));
  console.log(`${record.name} removido do Lumi. Ele continua na sua conta Tuya/Smart Life e no app Casa, se estiver lá.`);
}

async function cmdList() {
  const { tuya } = await config.load();
  if (tuya.length === 0) return console.log("Nenhum dispositivo. Use `lumi cloud-sync` ou `lumi add`.");
  for (const d of tuya) console.log(`${d.name.padEnd(24)} ${d.ip.padEnd(15)} v${d.version}  ${d.id}`);
}

async function cmdWatch(query?: string) {
  const { tuya } = await config.load();
  const records = query ? [await find(query)] : tuya;
  const adapter = new TuyaDeviceAdapter(records, { secrets, log: (m) => console.error(`· ${m}`) });
  adapter.on("update", (d: Device) => print(d, true));
  await adapter.start();
  console.log("Observando. Altere a lâmpada por outro app ou pelo interruptor. Ctrl+C para sair.");
  process.on("SIGINT", () => adapter.stop().then(() => process.exit(0)));
  await new Promise(() => {});
}

// MARK: - Auxiliares

const noDevicesHint = `Nenhuma conta de app com dispositivos está vinculada ao projeto.
  · Em platform.tuya.com › projeto › Devices › Link App Account, confira se o vínculo aparece.
  · Contas de apps de marca (como o Elgin Smart) normalmente não podem ser vinculadas; nesse caso,
    a alternativa é parear a lâmpada no Smart Life (veja docs/integracao/03-credenciais-e-testes.md).
  · O data center do projeto precisa ser o mesmo da conta do app.`;

async function control(query: string | undefined, command: LightCommand) {
  return withDevice(query, async (a, d) => {
    const started = performance.now();
    const device = await a.execute(d.id, command);
    print(device);
    console.log(`Confirmado pelo dispositivo em ${Math.round(performance.now() - started)} ms`);
  });
}

async function withDevice(query: string | undefined, work: (a: TuyaDeviceAdapter, d: Device) => Promise<void>) {
  const record = await find(query);
  const adapter = new TuyaDeviceAdapter([record], { secrets, log });
  try {
    await work(adapter, adapter.devices()[0]);
  } finally {
    await adapter.stop();
  }
}

async function find(query?: string): Promise<TuyaDeviceRecord> {
  if (!query) throw new Error("Informe o nome ou o id do dispositivo.");
  const { tuya } = await config.load();
  const q = query.toLowerCase();
  const record = tuya.find((d) => d.id === query || d.name.toLowerCase() === q) ?? tuya.find((d) => d.name.toLowerCase().includes(q));
  if (!record) throw new Error(`Dispositivo não encontrado: ${query}. Veja \`lumi list\`.`);
  return record;
}

function print(d: Device, timestamp = false) {
  const s = d.state;
  const parts = [
    d.connectivity,
    s ? (s.on ? "ligada" : "desligada") : "estado desconhecido",
    s?.mode && `modo ${s.mode}`,
    s?.brightness !== undefined && `brilho ${Math.round(s.brightness * 100)}%`,
    s?.colorTemperature !== undefined && s.mode !== "colour" && `temperatura ${Math.round(s.colorTemperature * 100)}%`,
    s?.mode === "colour" && s.hue !== undefined && `cor ${Math.round(s.hue)}° / ${Math.round((s.saturation ?? 0) * 100)}%`,
  ].filter(Boolean);
  const prefix = timestamp ? `${new Date().toLocaleTimeString("pt-BR")}  ` : "";
  console.log(`${prefix}${d.name}: ${parts.join(" · ")}`);
  if (!timestamp) {
    console.log(`  capacidades: ${d.capabilities.join(", ") || "desconhecidas"}${d.modes.length ? ` · modos: ${d.modes.join(", ")}` : ""}`);
  }
  if (d.lastError) console.log(`  erro: ${d.lastError}`);
}

function percent(value: string | undefined, min: number): number {
  return number(value, min, 100, "porcentagem") / 100;
}

function number(value: string | undefined, min: number, max: number, what: string): number {
  const n = Number(value);
  if (value === undefined || !Number.isFinite(n) || n < min || n > max) throw new Error(`${what} deve estar entre ${min} e ${max}`);
  return n;
}

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
      if (s.startsWith(question)) write.call(rl, question);
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      if (hidden) process.stdout.write("\n");
      rl.close();
      resolve(answer);
    }),
  );
}

main(process.argv.slice(2)).then(
  () => process.exit(0),
  (e: Error) => {
    console.error(`Erro: ${e.message}`);
    process.exit(1);
  },
);
