// Checklist de publicação. Falha (exit 1) enquanto houver pendências que impeçam usar o site
// como Privacy Policy/Support URL no App Store Connect. Lê as mesmas variáveis do build
// (process.env e, se existir, .env.local / .env.production.local).
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
for (const file of [".env.production.local", ".env.local", ".env.production", ".env"]) {
  const path = `${root}${file}`;
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const env = (k) => (process.env[k] ?? "").trim();
const blockers = [];
const warnings = [];

const siteUrl = env("NEXT_PUBLIC_SITE_URL");
if (!siteUrl) blockers.push("NEXT_PUBLIC_SITE_URL não definido (domínio oficial).");
else if (!/^https:\/\/[^/]+$/.test(siteUrl.replace(/\/$/, ""))) blockers.push(`NEXT_PUBLIC_SITE_URL deve ser https://dominio, sem caminho: "${siteUrl}"`);
else if (/vercel\.app$/.test(siteUrl)) warnings.push("NEXT_PUBLIC_SITE_URL usa *.vercel.app — prefira o domínio oficial antes de cadastrar no App Store Connect.");

const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email.test(env("NEXT_PUBLIC_SUPPORT_EMAIL"))) blockers.push("NEXT_PUBLIC_SUPPORT_EMAIL ausente ou inválido.");
if (env("NEXT_PUBLIC_PRIVACY_EMAIL") && !email.test(env("NEXT_PUBLIC_PRIVACY_EMAIL"))) blockers.push("NEXT_PUBLIC_PRIVACY_EMAIL inválido.");
if (!env("NEXT_PUBLIC_CONTROLLER_NAME")) blockers.push("NEXT_PUBLIC_CONTROLLER_NAME ausente (identificação do controlador — LGPD art. 9º).");
if (!env("NEXT_PUBLIC_CONTROLLER_DOCUMENT")) warnings.push("NEXT_PUBLIC_CONTROLLER_DOCUMENT vazio (CNPJ/registro) — recomendado.");
if (env("NEXT_PUBLIC_LEGAL_REVIEWED") !== "true") blockers.push("NEXT_PUBLIC_LEGAL_REVIEWED ≠ true — os textos legais ainda não foram revisados contra o app real (ver docs/PENDENCIAS.md).");
if (!env("NEXT_PUBLIC_APP_STORE_URL")) warnings.push("NEXT_PUBLIC_APP_STORE_URL vazio — o botão mostra “Em breve” (ok antes do lançamento).");
else if (!/^https:\/\/apps\.apple\.com\//.test(env("NEXT_PUBLIC_APP_STORE_URL"))) blockers.push("NEXT_PUBLIC_APP_STORE_URL deve começar com https://apps.apple.com/");

const caps = readFileSync(`${root}lib/capabilities.ts`, "utf8");
const unconfirmed = [...caps.matchAll(/(\w+): \{ label: "([^"]+)", status: "unconfirmed" \}/g)].map((m) => m[2]);
if (unconfirmed.length) blockers.push(`Funcionalidades ainda “unconfirmed” em lib/capabilities.ts: ${unconfirmed.join("; ")}.`);
if (/tuyaAccountModel: [^=]+= "linked"/.test(caps)) blockers.push('tuyaAccountModel = "linked": reescreva as seções Tuya da Política de Privacidade e da Exclusão de Conta.');
if (/hasTrMediaBackend = true/.test(caps)) blockers.push("hasTrMediaBackend = true: a Política de Privacidade precisa de uma seção sobre o backend da TR Media.");

const compat = readFileSync(`${root}lib/compatibility.ts`, "utf8");
if (!/testedDevices: TestedDevice\[\] = \[[\s\S]*?\{\s*brand:/.test(compat.replace(/\/\/.*$/gm, ""))) {
  warnings.push("Nenhum dispositivo testado em lib/compatibility.ts — a página de Compatibilidade mostrará listas vazias.");
}

for (const w of warnings) console.warn(`⚠  ${w}`);
for (const b of blockers) console.error(`✖  ${b}`);
if (blockers.length) {
  console.error(`\n${blockers.length} pendência(s) bloqueiam a publicação.`);
  process.exit(1);
}
console.log("✔ Pronto para publicação (confira também docs/PENDENCIAS.md).");
