import type { ReactNode } from "react";

/**
 * Marca visível para informações que a TR Media ainda precisa fornecer.
 * Nunca substitua por um valor de exemplo — o checklist de publicação depende deste aviso.
 */
export function Pending({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-small border border-warning/40 bg-warning-subtle px-2 py-0.5 text-[0.85em] font-medium text-warning">
      <span aria-hidden="true">⚠</span>
      <span>Pendente: {children}</span>
    </span>
  );
}

export function OrPending({ value, label }: { value: string | null; label: string }) {
  return value ? <>{value}</> : <Pending>{label}</Pending>;
}
