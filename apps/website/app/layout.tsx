import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
import { trModeScript, trTheme } from "@/lib/tr-theme";
import { trToken } from "@/lib/tr-tokens";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.developer }],
  creator: site.developer,
  publisher: site.developer,
  alternates: { canonical: "/", languages: { "pt-BR": "/", en: "/en" } },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "pt_BR",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  // Sem domínio de produção configurado (ex.: previews), não indexar.
  robots: site.hasProductionUrl ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: trToken("background-primary", "light") },
    { media: "(prefers-color-scheme: dark)", color: trToken("background-primary", "dark") },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" data-tr-theme={trTheme} data-tr-mode="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: trModeScript }} />
      </head>
      <body className="min-h-dvh">
        <SiteHeader />
        <main id="conteudo">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
