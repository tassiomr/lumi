import Link from "next/link";
import { mainNav } from "@/lib/routes";
import { CloseOnNavigate } from "./CloseOnNavigate";
import { Container } from "./Container";
import { LumiWordmark } from "./LumiMark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-xl backdrop-saturate-150">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-small focus:bg-elevated focus:px-3 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" aria-label="Lumi — página inicial" className="rounded-small">
          <LumiWordmark size={26} />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 text-sm md:flex">
          {mainNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted transition-colors hover:text-fg">
              {item.label}
            </Link>
          ))}
          <Link
            href="/#download"
            className="rounded-full bg-fg px-4 py-1.5 font-medium text-bg transition-opacity hover:opacity-85"
          >
            Download
          </Link>
        </nav>

        <details className="group relative md:hidden">
          <summary
            className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-line [&::-webkit-details-marker]:hidden"
            aria-label="Abrir menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="group-open:hidden">
              <path d="M2 4.5h12M2 8h12M2 11.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="hidden group-open:block">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </summary>
          <CloseOnNavigate>
          <nav
            aria-label="Principal (móvel)"
            className="absolute right-0 top-12 w-56 rounded-card border border-line bg-elevated p-2 shadow-xl shadow-black/10"
          >
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-control px-3 py-2.5 text-sm hover:bg-fg/5">
                {item.label}
              </Link>
            ))}
            <Link href="/#download" className="mt-1 block rounded-control bg-fg px-3 py-2.5 text-sm font-medium text-bg">
              Download
            </Link>
          </nav>
          </CloseOnNavigate>
        </details>
      </Container>
    </header>
  );
}
