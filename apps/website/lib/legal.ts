/** Versão e data dos documentos legais. Atualize a cada alteração material de conteúdo. */
export const legalVersions = {
  privacy: { version: "0.1", updated: "2026-11-07" },
  terms: { version: "0.1", updated: "2026-11-07" },
} as const;

export function formatDate(iso: string, locale = "pt-BR"): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
