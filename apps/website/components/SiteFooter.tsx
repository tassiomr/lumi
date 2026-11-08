import Link from "next/link";
import { helpNav, legalNav } from "@/lib/routes";
import { site } from "@/lib/site";
import { Container } from "./Container";
import { LumiWordmark } from "./LumiMark";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <LumiWordmark size={24} />
          <p className="mt-3 max-w-sm text-sm text-muted">
            {site.tagline} Um aplicativo para iPhone desenvolvido pela {site.developer}.
          </p>
          <p className="mt-4 text-sm">
            <Link href="/en" hrefLang="en" className="text-muted underline-offset-4 hover:text-fg hover:underline">
              English
            </Link>
          </p>
        </div>
        <nav aria-label="Legal">
          <h2 className="text-sm font-semibold">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted hover:text-fg">{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Ajuda">
          <h2 className="text-sm font-semibold">Ajuda</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {helpNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted hover:text-fg">{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>© {year} {site.developer}. Todos os direitos reservados.</p>
        <p>
          Apple, iPhone, HomeKit e Siri são marcas da Apple Inc. Tuya é marca da Tuya Inc. Elgin é marca de seus
          respectivos titulares. O Lumi não é afiliado a essas empresas.
        </p>
      </Container>
    </footer>
  );
}
