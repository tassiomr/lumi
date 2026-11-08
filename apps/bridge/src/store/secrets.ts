// Segredos (local keys e credenciais da Tuya OpenAPI) ficam no Keychain do macOS.
//
// Usamos `security -i` pelo stdin para que o segredo não apareça na lista de processos (argv).
// O valor é gravado em hexadecimal para dispensar escaping.

import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

export interface SecretStore {
  get(account: string): Promise<string | undefined>;
  set(account: string, value: string): Promise<void>;
  delete(account: string): Promise<void>;
}

const service = "com.trmedia.lumi.bridge";
const run = promisify(execFile);

export class KeychainStore implements SecretStore {
  async get(account: string): Promise<string | undefined> {
    try {
      const { stdout } = await run("/usr/bin/security", ["find-generic-password", "-s", service, "-a", account, "-w"]);
      return Buffer.from(stdout.trim(), "hex").toString("utf8");
    } catch {
      return undefined;
    }
  }

  async set(account: string, value: string): Promise<void> {
    assertSafe(account);
    const hex = Buffer.from(value, "utf8").toString("hex");
    await new Promise<void>((resolve, reject) => {
      const p = spawn("/usr/bin/security", ["-i"], { stdio: ["pipe", "ignore", "pipe"] });
      let stderr = "";
      p.stderr.on("data", (d) => (stderr += d));
      p.on("error", reject);
      p.on("close", (code) => (code === 0 && !stderr.trim() ? resolve() : reject(new Error(`Keychain: ${stderr.trim() || code}`))));
      p.stdin.end(`add-generic-password -U -s ${service} -a ${account} -l "Lumi Bridge" -w ${hex}\n`);
    });
  }

  async delete(account: string): Promise<void> {
    await run("/usr/bin/security", ["delete-generic-password", "-s", service, "-a", account]).catch(() => undefined);
  }
}

/** Para testes. */
export class MemoryStore implements SecretStore {
  private values = new Map<string, string>();
  async get(account: string) {
    return this.values.get(account);
  }
  async set(account: string, value: string) {
    this.values.set(account, value);
  }
  async delete(account: string) {
    this.values.delete(account);
  }
}

function assertSafe(account: string) {
  if (!/^[\w.:-]+$/.test(account)) throw new Error(`Identificador inválido para o Keychain: ${account}`);
}

export const accounts = {
  cloud: "tuya-openapi",
  localKey: (deviceId: string) => `tuya-local-key:${deviceId}`,
};
