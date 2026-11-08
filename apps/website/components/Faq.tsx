import type { ReactNode } from "react";

export function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <details className="group border-b border-line py-1">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="prose-legal pb-5 [&>p:first-child]:mt-0">{children}</div>
    </details>
  );
}
