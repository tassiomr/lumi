import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Data URI do símbolo do Lumi para uso em ImageResponse (ícones e Open Graph gerados no build). */
export async function lumiMarkDataUri(): Promise<string> {
  const svg = await readFile(join(process.cwd(), "app", "icon.svg"), "utf8");
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
