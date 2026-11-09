import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { trToken } from "@/lib/tr-tokens";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.developer}`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: trToken("background-primary", "dark"),
    theme_color: trToken("action-primary"),
    lang: "pt-BR",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
