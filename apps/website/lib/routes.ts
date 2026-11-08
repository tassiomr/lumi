/**
 * Caminhos públicos oficiais. O app iOS (apps/ios/LumiLegal) usa exatamente os mesmos —
 * `npm run check:links` falha se divergirem.
 */
export const routes = {
  home: "/",
  privacy: "/privacy",
  terms: "/terms",
  support: "/support",
  compatibility: "/compatibility",
  privacyChoices: "/privacy-choices",
  deleteAccount: "/delete-account",
} as const;

export const mainNav = [
  { label: "Início", href: routes.home },
  { label: "Funcionalidades", href: "/#funcionalidades" },
  { label: "Compatibilidade", href: routes.compatibility },
  { label: "Suporte", href: routes.support },
] as const;

export const legalNav = [
  { label: "Política de Privacidade", href: routes.privacy },
  { label: "Termos de Uso", href: routes.terms },
  { label: "Preferências de Privacidade", href: routes.privacyChoices },
  { label: "Exclusão de Conta e Dados", href: routes.deleteAccount },
] as const;

export const helpNav = [
  { label: "Suporte", href: routes.support },
  { label: "Compatibilidade", href: routes.compatibility },
] as const;
