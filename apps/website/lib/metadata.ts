import type { Metadata } from "next";
import { site } from "./site";

export function pageMetadata({
  title,
  description,
  path,
  locale = "pt_BR",
}: {
  title: string;
  description: string;
  path: string;
  locale?: "pt_BR" | "en_US";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      locale,
      type: "website",
    },
    twitter: { card: "summary_large_image", title: `${title} · ${site.name}`, description },
  };
}
