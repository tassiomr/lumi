import { site } from "@/lib/site";

/**
 * Antes do lançamento (sem NEXT_PUBLIC_APP_STORE_URL) mostra "Em breve" sem link.
 * Após o lançamento, recomenda-se trocar pelo selo oficial "Download on the App Store"
 * (Apple Marketing Resources) — o selo não é incluído aqui por ser arte licenciada pela Apple.
 */
export function AppStoreButton({ locale = "pt" }: { locale?: "pt" | "en" }) {
  const t =
    locale === "en"
      ? { available: "Download on the App Store", soon: "Coming soon to the App Store", sub: "For iPhone" }
      : { available: "Baixar na App Store", soon: "Em breve na App Store", sub: "Para iPhone" };

  const inner = (label: string) => (
    <>
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 2.5v10m0 0-4-4m4 4 4-4M4 16.5h12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[0.7rem] opacity-70">{t.sub}</span>
        <span className="text-[0.95rem] font-semibold">{label}</span>
      </span>
    </>
  );

  const base = "inline-flex items-center gap-3 rounded-card px-5 py-3 transition";

  if (!site.appStoreUrl) {
    return (
      <span className={`${base} cursor-default border border-line bg-elevated text-muted`} aria-disabled="true">
        {inner(t.soon)}
      </span>
    );
  }

  return (
    <a
      href={site.appStoreUrl}
      className={`${base} bg-fg text-bg shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-primary/30`}
      rel="noopener"
    >
      {inner(t.available)}
    </a>
  );
}
