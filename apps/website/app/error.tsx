"use client";

import Link from "next/link";
import { Container } from "@/components/Container";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Algo deu errado ao carregar esta página.</h1>
      <p className="mt-2 max-w-md text-muted">Tente novamente em instantes.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <button type="button" onClick={reset} className="rounded-full bg-fg px-5 py-2.5 font-medium text-bg hover:opacity-85">
          Tentar novamente
        </button>
        <Link href="/" className="rounded-full border border-line px-5 py-2.5 font-medium hover:bg-fg/5">Página inicial</Link>
      </div>
    </Container>
  );
}
