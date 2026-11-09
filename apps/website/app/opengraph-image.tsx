import { ImageResponse } from "next/og";
import { lumiMarkDataUri } from "@/lib/brand-image";
import { site } from "@/lib/site";
import { trToken } from "@/lib/tr-tokens";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function OpengraphImage() {
  const src = await lumiMarkDataUri();
  // Imagens geradas não leem variáveis CSS: os valores vêm do tema no modo escuro.
  const glow = trToken("custom-glow", "dark");
  const primary = trToken("action-primary", "dark");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: `radial-gradient(900px 500px at 15% 0%, ${primary}5C, transparent), radial-gradient(800px 500px at 90% 20%, ${glow}, transparent), ${trToken("background-primary", "dark")}`,
          color: trToken("foreground-primary", "dark"),
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={120} height={120} alt="" />
        <div style={{ marginTop: 40, fontSize: 84, fontWeight: 700, letterSpacing: "-0.03em" }}>{site.name}</div>
        <div style={{ marginTop: 8, fontSize: 44, color: trToken("foreground-accent", "dark") }}>{site.tagline}</div>
        <div style={{ marginTop: 36, fontSize: 26, color: trToken("foreground-secondary", "dark") }}>{`Para iPhone · ${site.developer}`}</div>
      </div>
    ),
    size,
  );
}
