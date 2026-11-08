import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Caminhos alternativos comuns (pt-BR e variações) apontam para as URLs oficiais.
    return [
      { source: "/privacidade", destination: "/privacy", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/politica-de-privacidade", destination: "/privacy", permanent: true },
      { source: "/termos", destination: "/terms", permanent: true },
      { source: "/termos-de-uso", destination: "/terms", permanent: true },
      { source: "/suporte", destination: "/support", permanent: true },
      { source: "/help", destination: "/support", permanent: true },
      { source: "/compatibilidade", destination: "/compatibility", permanent: true },
      { source: "/excluir-conta", destination: "/delete-account", permanent: true },
      { source: "/account-deletion", destination: "/delete-account", permanent: true },
      { source: "/preferencias-de-privacidade", destination: "/privacy-choices", permanent: true },
    ];
  },
};

export default nextConfig;
