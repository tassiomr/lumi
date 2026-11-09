"use client";

import { trModeScript, trTheme } from "@/lib/tr-theme";
import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR" data-tr-theme={trTheme} data-tr-mode="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: trModeScript }} />
      </head>
      <body className="grid min-h-dvh place-items-center text-center">
        <div>
          <h1 className="text-2xl font-semibold">Lumi — erro inesperado</h1>
          <p className="mt-2 text-muted">Não foi possível carregar o site.</p>
          <button type="button" onClick={reset} className="mt-6 rounded-full border border-line px-5 py-2.5 font-medium hover:bg-fg/5">
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
