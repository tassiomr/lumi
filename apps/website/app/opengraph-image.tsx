import { ImageResponse } from "next/og";
import { lumiMarkDataUri } from "@/lib/brand-image";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function OpengraphImage() {
  const src = await lumiMarkDataUri();
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
          background: "radial-gradient(900px 500px at 15% 0%, rgba(47,107,255,0.45), transparent), radial-gradient(800px 500px at 90% 20%, rgba(139,92,246,0.4), transparent), #07080c",
          color: "#f4f5f8",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={120} height={120} alt="" />
        <div style={{ marginTop: 40, fontSize: 84, fontWeight: 700, letterSpacing: "-0.03em" }}>{site.name}</div>
        <div style={{ marginTop: 8, fontSize: 44, color: "#c9c4ff" }}>{site.tagline}</div>
        <div style={{ marginTop: 36, fontSize: 26, color: "#a1a6b4" }}>{`Para iPhone · ${site.developer}`}</div>
      </div>
    ),
    size,
  );
}
