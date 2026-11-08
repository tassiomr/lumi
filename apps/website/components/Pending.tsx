import type { ReactNode } from "react";

/**
 * Marca visível para informações que a TR Media ainda precisa fornecer.
 * Nunca substitua por um valor de exemplo — o checklist de publicação depende deste aviso.
 */
export function Pending({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[0.85em] font-medium text-amber-700 dark:text-amber-300">
      <span aria-hidden="true">⚠</span>
      <span>Pendente: {children}</span>
    </span>
  );
}

export function OrPending({ value, label }: { value: string | null; label: string }) {
  return value ? <>{value}</> : <Pending>{label}</Pending>;
}
