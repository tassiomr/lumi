import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.developer}`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#07080c",
    theme_color: "#2f6bff",
    lang: "pt-BR",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
