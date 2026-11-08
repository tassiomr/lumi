"use client";

import type { ReactNode } from "react";

/** Fecha o <details> do menu móvel ao tocar em um link (a navegação client-side não recarrega o header). */
export function CloseOnNavigate({ children }: { children: ReactNode }) {
  return (
    <div
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) {
          event.currentTarget.closest("details")?.removeAttribute("open");
        }
      }}
    >
      {children}
    </div>
  );
}
