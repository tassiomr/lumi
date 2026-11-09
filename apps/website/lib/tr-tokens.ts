import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type TRMode, trTheme } from "@/lib/tr-theme";

const css = readFileSync(join(process.cwd(), "app/tr-tokens.css"), "utf8");

/**
 * Valor de um token do tema para um modo, lido de app/tr-tokens.css.
 * Para lugares que não leem variáveis CSS: metadados, manifest e imagens geradas.
 */
export function trToken(name: string, mode: TRMode = "light"): string {
  const block = css.split(`[data-tr-theme="${trTheme}"][data-tr-mode="${mode}"]`)[1]?.split("}")[0] ?? "";
  const value = block.match(new RegExp(`--tr-${name}:\\s*([^;]+);`))?.[1]?.trim();
  if (!value) throw new Error(`Token --tr-${name} ausente em ${trTheme}/${mode}`);
  return value;
}
