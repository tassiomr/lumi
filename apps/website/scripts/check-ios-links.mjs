// Garante que o app iOS (apps/ios/LumiLegal) e o site usam exatamente os mesmos caminhos legais.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const ts = await readFile(fileURLToPath(new URL("lib/routes.ts", root)), "utf8");
const swift = await readFile(
  fileURLToPath(new URL("../ios/LumiLegal/Sources/LumiLegal/LumiLinks.swift", root)),
  "utf8",
);

const routesBlock = ts.slice(ts.indexOf("export const routes"), ts.indexOf("} as const"));
const sitePaths = new Set([...routesBlock.matchAll(/:\s*"(\/[^"]*)"/g)].map((m) => m[1]).filter((p) => p !== "/"));
const appPaths = new Set([...swift.matchAll(/case \.\w+: "(\/[^"]*)"/g)].map((m) => m[1]));

const missingInApp = [...sitePaths].filter((p) => !appPaths.has(p));
const unknownInApp = [...appPaths].filter((p) => !sitePaths.has(p));

if (missingInApp.length || unknownInApp.length) {
  if (missingInApp.length) console.error("Rotas do site ausentes no app iOS:", missingInApp.join(", "));
  if (unknownInApp.length) console.error("Rotas do app iOS que não existem no site:", unknownInApp.join(", "));
  process.exit(1);
}
console.log(`OK — ${appPaths.size} rotas idênticas no site e no app iOS:`, [...appPaths].join(", "));
