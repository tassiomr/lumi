import type { ReactNode } from "react";
import { formatDate } from "@/lib/legal";
import { site } from "@/lib/site";
import { Container } from "./Container";

export type TocItem = { id: string; title: string };

export function DraftNotice() {
  if (site.legalReviewed) return null;
  return (
    <div
      role="note"
      className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200"
    >
      <strong className="font-semibold">Rascunho em revisão.</strong> Este documento descreve o funcionamento
      previsto do Lumi e ainda precisa ser confirmado pela {site.developer} contra a versão publicada do aplicativo.
      Itens marcados como “Pendente” serão preenchidos antes da publicação.
    </div>
  );
}

export function LegalPage({
  eyebrow,
  title,
  intro,
  version,
  updated,
  toc,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro: ReactNode;
  version?: string;
  updated?: string;
  toc?: TocItem[];
  children: ReactNode;
}) {
  return (
    <Container className="pt-14 sm:pt-20">
      <div className="max-w-3xl">
        {eyebrow ? <p className="text-sm font-medium text-electric-500">{eyebrow}</p> : null}
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <div className="mt-4 text-lg text-muted">{intro}</div>
        {version && updated ? (
          <p className="mt-4 text-sm text-muted">
            Versão {version} · Última atualização: <time dateTime={updated}>{formatDate(updated)}</time>
          </p>
        ) : null}
        <DraftNotice />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[14rem_1fr]">
        {toc && toc.length > 0 ? (
          <nav aria-label="Nesta página" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Nesta página</p>
              <ol className="mt-3 space-y-2 border-l border-line text-sm">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="-ml-px block border-l border-transparent pl-3 text-muted hover:border-electric-500 hover:text-fg">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        ) : (
          <div className="hidden lg:block" />
        )}
        <article className="prose-legal min-w-0 max-w-3xl">{children}</article>
      </div>
    </Container>
  );
}

export function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}
