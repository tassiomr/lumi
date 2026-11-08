/**
 * Configuração pública do site. Tudo vem de variáveis NEXT_PUBLIC_* (ver .env.example).
 * Valores ausentes ficam `null` e as páginas exibem um aviso "pendente" em vez de dados inventados.
 */

function env(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

const rawSiteUrl = env(process.env.NEXT_PUBLIC_SITE_URL);

export const site = {
  name: "Lumi",
  developer: "TR Media",
  bundleId: "com.trmedia.lumi",
  tagline: "Sua iluminação, do seu jeito.",
  description:
    "Transforme a maneira como você controla suas luzes inteligentes. Uma experiência simples, elegante e intuitiva, criada para o seu iPhone.",

  /** Domínio oficial. Sem ele, URLs absolutas usam localhost (apenas desenvolvimento). */
  url: (rawSiteUrl ?? "http://localhost:3000").replace(/\/+$/, ""),
  hasProductionUrl: rawSiteUrl !== null,

  appStoreUrl: env(process.env.NEXT_PUBLIC_APP_STORE_URL),
  supportEmail: env(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),
  privacyEmail:
    env(process.env.NEXT_PUBLIC_PRIVACY_EMAIL) ?? env(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),

  controller: {
    name: env(process.env.NEXT_PUBLIC_CONTROLLER_NAME),
    document: env(process.env.NEXT_PUBLIC_CONTROLLER_DOCUMENT),
    address: env(process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS),
    dpoName: env(process.env.NEXT_PUBLIC_DPO_NAME),
  },

  jurisdictionCity: env(process.env.NEXT_PUBLIC_JURISDICTION_CITY),
  legalReviewed: process.env.NEXT_PUBLIC_LEGAL_REVIEWED === "true",
} as const;

export function absoluteUrl(path: string): string {
  return `${site.url}${path === "/" ? "" : path}`;
}

export function mailto(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
