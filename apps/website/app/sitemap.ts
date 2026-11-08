import type { MetadataRoute } from "next";
import { legalVersions } from "@/lib/legal";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: { path: string; priority: number; lastModified?: string }[] = [
    { path: routes.home, priority: 1 },
    { path: "/en", priority: 0.6 },
    { path: routes.support, priority: 0.8 },
    { path: routes.compatibility, priority: 0.8 },
    { path: routes.privacy, priority: 0.5, lastModified: legalVersions.privacy.updated },
    { path: routes.terms, priority: 0.5, lastModified: legalVersions.terms.updated },
    { path: routes.privacyChoices, priority: 0.4 },
    { path: routes.deleteAccount, priority: 0.4 },
  ];
  return entries.map((e) => ({
    url: absoluteUrl(e.path),
    priority: e.priority,
    ...(e.lastModified ? { lastModified: e.lastModified } : {}),
  }));
}
