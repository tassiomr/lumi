/**
 * Fonte única de verdade sobre o que o Lumi faz. Landing page, compatibilidade, suporte e
 * o checklist de publicação leem daqui — nenhuma página deve afirmar algo que não esteja aqui.
 *
 *   available   → implementado no app e confirmado pela TR Media
 *   unconfirmed → faz parte do escopo, mas ainda não foi conferido contra o build do app
 *   planned     → em desenvolvimento; o site anuncia como "Em breve"
 *
 * Antes de publicar, cada item "unconfirmed" deve virar "available" ou "planned".
 *
 * Situação em 2026-11-08: o app (apps/ios) implementa todos os itens "unconfirmed" abaixo, mas eles ainda
 * não foram testados em iPhone real com lâmpadas reais — e a integração Tuya depende do SDK instalado.
 */

export type CapabilityStatus = "available" | "unconfirmed" | "planned";

export type CapabilityId =
  | "lightControl"
  | "colorAndTemperature"
  | "rooms"
  | "scenes"
  | "homekit"
  | "matterViaHomeKit"
  | "tuya"
  | "tuyaLocalControl"
  | "tuyaPairing"
  | "automations"
  | "siriShortcuts"
  | "widgets"
  | "nativeExperience";

export const capabilities: Record<CapabilityId, { label: string; status: CapabilityStatus }> = {
  lightControl: { label: "Ligar, desligar e ajustar brilho", status: "unconfirmed" },
  colorAndTemperature: { label: "Cor e temperatura de branco", status: "unconfirmed" },
  rooms: { label: "Organização por ambientes", status: "unconfirmed" },
  scenes: { label: "Cenas personalizadas", status: "unconfirmed" },
  homekit: { label: "Integração com Apple HomeKit", status: "unconfirmed" },
  matterViaHomeKit: { label: "Dispositivos Matter adicionados ao app Casa", status: "unconfirmed" },
  tuya: { label: "Integração Tuya (conta anônima)", status: "unconfirmed" },
  tuyaLocalControl: { label: "Controle local (rede Wi‑Fi) de dispositivos Tuya", status: "unconfirmed" },
  tuyaPairing: { label: "Parear lâmpadas Tuya pelo Lumi (modo AP)", status: "unconfirmed" },
  automations: { label: "Automações e agendamentos", status: "planned" },
  siriShortcuts: { label: "Atalhos e Siri para ações do Lumi", status: "planned" },
  widgets: { label: "Widgets", status: "planned" },
  nativeExperience: { label: "SwiftUI, Modo Escuro, Dynamic Type e VoiceOver", status: "unconfirmed" },
};

/**
 * Como a conta Tuya funciona no Lumi. Decidido pela TR Media em 2026-11-08: "app-sdk".
 *
 *   "app-sdk" → o Lumi usa o Smart Life App SDK da Tuya com CONTA ANÔNIMA (sem e-mail, telefone ou
 *               senha), criada automaticamente na primeira lâmpada e hospedada na nuvem Tuya em nome da
 *               TR Media. Separada da conta do app Smart Life/Tuya Smart. Único modelo viável sem backend.
 *   "linked"  → o usuário vincula uma conta Smart Life/Tuya existente (exige backend com OAuth/Cloud API,
 *               que hoje não existe).
 */
export const tuyaAccountModel: "app-sdk" | "linked" = "app-sdk";

/**
 * O Lumi possui conta própria? No modelo "app-sdk" sim: a conta criada no Lumi é uma conta de usuário
 * do Lumi (armazenada pela Tuya). A Apple exige então exclusão de conta iniciável dentro do app
 * (App Review Guideline 5.1.1(v)) — ver apps/ios/LumiLegal (AccountDeletion).
 */
export const hasLumiAccount = tuyaAccountModel === "app-sdk";

/**
 * O Lumi envia dados a algum servidor operado pela TR Media? (backend, analytics, crash reporting próprio)
 * Decidido pela TR Media em 2026-11-08: app local, sem backend; único SDK de terceiros = Tuya.
 * Se mudar para `true`, a Política de Privacidade precisa de uma seção nova.
 */
export const hasTrMediaBackend = false;

export function isAvailable(id: CapabilityId): boolean {
  return capabilities[id].status === "available";
}

export const statusLabel: Record<CapabilityStatus, string | null> = {
  available: null,
  unconfirmed: "Em validação",
  planned: "Em breve",
};
