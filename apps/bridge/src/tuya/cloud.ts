// Cliente mínimo da Tuya OpenAPI (Cloud Development / IoT Platform), usado apenas para obter,
// com as credenciais do projeto do próprio usuário, a lista de dispositivos, a local key e o
// modelo de DPs. O controle cotidiano é feito pela rede local.
//
// Assinatura: https://developer.tuya.com/en/docs/iot/new-singnature

import { createHash, createHmac, randomUUID } from "node:crypto";

export const dataCenters = {
  us: "https://openapi.tuyaus.com",
  ueaz: "https://openapi-ueaz.tuyaus.com",
  eu: "https://openapi.tuyaeu.com",
  weaz: "https://openapi-weaz.tuyaeu.com",
  cn: "https://openapi.tuyacn.com",
  in: "https://openapi.tuyain.com",
} as const;

export type DataCenter = keyof typeof dataCenters;

export type CloudCredentials = { accessId: string; accessSecret: string; region: DataCenter };

export type CloudDevice = {
  id: string;
  name: string;
  localKey: string;
  productId?: string;
  productName?: string;
  category?: string;
  model?: string;
  online?: boolean;
};

export type DpSpec = { id: string; code: string; type: string; min?: number; max?: number; range?: string[] };

export class TuyaCloudError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}

export class TuyaCloud {
  private token?: { value: string; expires: number };
  private readonly creds: CloudCredentials;

  constructor(creds: CloudCredentials) {
    this.creds = creds;
  }

  /** Dispositivos das contas Smart Life/Tuya Smart vinculadas ao projeto. */
  async devices(): Promise<CloudDevice[]> {
    const out: CloudDevice[] = [];
    let lastRowKey = "";
    for (let page = 0; page < 20; page++) {
      const query: Record<string, string> = { size: "100" };
      if (lastRowKey) query.last_row_key = lastRowKey;
      const r = (await this.request("GET", "/v1.0/iot-01/associated-users/devices", query)) as {
        devices?: Record<string, unknown>[];
        has_more?: boolean;
        last_row_key?: string;
      };
      for (const d of r.devices ?? []) {
        out.push({
          id: String(d.id),
          name: String(d.name ?? d.id),
          localKey: String(d.local_key ?? ""),
          productId: d.product_id as string | undefined,
          productName: d.product_name as string | undefined,
          category: d.category as string | undefined,
          model: d.model as string | undefined,
          online: d.online as boolean | undefined,
        });
      }
      if (!r.has_more || !r.last_row_key) break;
      lastRowKey = r.last_row_key;
    }
    return out;
  }

  /** Modelo de dados do dispositivo: relaciona o número de cada DP ao código padrão e aos limites. */
  async dpSpecs(deviceId: string): Promise<DpSpec[]> {
    const r = (await this.request("GET", `/v2.0/cloud/thing/${encodeURIComponent(deviceId)}/model`)) as { model?: string };
    const model = JSON.parse(r.model ?? "{}") as {
      services?: { properties?: { abilityId: number; code: string; typeSpec?: Record<string, unknown> }[] }[];
    };
    const specs: DpSpec[] = [];
    for (const service of model.services ?? []) {
      for (const p of service.properties ?? []) {
        const t = p.typeSpec ?? {};
        specs.push({
          id: String(p.abilityId),
          code: p.code,
          type: String(t.type ?? "unknown"),
          min: typeof t.min === "number" ? t.min : undefined,
          max: typeof t.max === "number" ? t.max : undefined,
          range: Array.isArray(t.range) ? (t.range as string[]) : undefined,
        });
      }
    }
    return specs;
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expires > Date.now() + 60_000) return this.token.value;
    const r = (await this.request("GET", "/v1.0/token", { grant_type: "1" }, undefined, false)) as {
      access_token: string;
      expire_time: number;
    };
    this.token = { value: r.access_token, expires: Date.now() + r.expire_time * 1000 };
    return r.access_token;
  }

  private async request(method: string, path: string, query: Record<string, string> = {}, body?: object, auth = true) {
    const token = auth ? await this.accessToken() : "";
    const sortedQuery = Object.keys(query)
      .sort()
      .map((k) => `${k}=${query[k]}`)
      .join("&");
    const url = sortedQuery ? `${path}?${sortedQuery}` : path;
    const bodyText = body ? JSON.stringify(body) : "";
    const t = Date.now().toString();
    const nonce = randomUUID();
    const contentHash = createHash("sha256").update(bodyText).digest("hex");
    const stringToSign = [method, contentHash, "", url].join("\n");
    const sign = createHmac("sha256", this.creds.accessSecret)
      .update(this.creds.accessId + token + t + nonce + stringToSign)
      .digest("hex")
      .toUpperCase();

    const response = await fetch(dataCenters[this.creds.region] + url, {
      method,
      headers: {
        client_id: this.creds.accessId,
        sign,
        t,
        nonce,
        sign_method: "HMAC-SHA256",
        ...(token ? { access_token: token } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? bodyText : undefined,
      signal: AbortSignal.timeout(10_000),
    });
    const json = (await response.json()) as { success: boolean; result?: unknown; code?: number; msg?: string };
    if (!json.success) throw new TuyaCloudError(`Tuya OpenAPI: ${json.msg ?? "erro"} (${json.code ?? response.status})`, json.code);
    return json.result;
  }
}
