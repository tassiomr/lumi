"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "-apple-system, system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem" }}>Lumi — erro inesperado</h1>
          <p>Não foi possível carregar o site.</p>
          <button type="button" onClick={reset} style={{ padding: "0.6rem 1.2rem", borderRadius: 999, border: "1px solid #ccc", cursor: "pointer" }}>
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
