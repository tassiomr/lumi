# Site oficial do Lumi

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4. Todas as páginas são **estáticas**: não há backend, banco de dados, cookies nem analytics.

## Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Landing page (pt-BR) |
| `/en` | Landing page em inglês |
| `/privacy` | Política de Privacidade (LGPD) |
| `/terms` | Termos de Uso |
| `/support` | Central de suporte, FAQ e contato |
| `/compatibility` | Integrações e modelos testados |
| `/privacy-choices` | Preferências de privacidade |
| `/delete-account` | Exclusão de conta e dados |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image`, `/icon.svg`, `/apple-icon` | SEO e ícones gerados no build |

Redirecionamentos permanentes: `/privacidade`, `/termos`, `/suporte`, `/compatibilidade`, `/excluir-conta`, entre outros (veja `next.config.ts`).

## Onde editar

- `lib/site.ts`: configuração lida das variáveis `NEXT_PUBLIC_*` (veja `.env.example`). Valor ausente aparece no site como **"Pendente"**, nunca como um dado inventado.
- `lib/capabilities.ts`: o que o app faz de fato. Landing, suporte e compatibilidade leem daqui.
- `lib/compatibility.ts`: modelos testados.
- `lib/legal.ts`: versão e data da Política e dos Termos (atualize a cada mudança de conteúdo).
- `lib/routes.ts`: caminhos oficiais, compartilhados com o app iOS.

## Comandos

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # build de produção
npm run lint           # checagem de tipos
npm run check:links    # rotas do site == rotas do app iOS (apps/ios/LumiLegal)
npm run check:publish  # falha enquanto houver pendências de publicação
```

## Deploy na Vercel

1. Envie o repositório ao GitHub e importe-o na Vercel, com **Root Directory = `apps/website`**. O framework é detectado como Next.js. A cada push na branch principal, a Vercel publica em produção; os pull requests geram previews.
2. Em *Settings › Environment Variables* (ambiente **Production**), configure as variáveis de `.env.example`. Em **Preview**, deixe `NEXT_PUBLIC_SITE_URL` vazio: as previews ficam com `noindex` e `robots.txt` bloqueado.
3. Em *Settings › Domains*, adicione o domínio oficial e siga as instruções de DNS. O HTTPS é emitido automaticamente. Opcionalmente, redirecione `www` → domínio raiz (ou o contrário) pela própria tela de domínios.
4. Rode `npm run check:publish` com as variáveis de produção num `.env.production.local` local e só então cadastre as URLs no App Store Connect (`docs/app-store/urls.md`).

Segurança: nenhuma chave da Tuya (AppKey/AppSecret) ou credencial deve ser colocada aqui. Todas as variáveis `NEXT_PUBLIC_*` são públicas por definição. Os cabeçalhos de segurança (HSTS, nosniff, frame-deny, referrer, permissions) ficam em `next.config.ts`.

A telemetria anônima do Next.js durante o build pode ser desativada com `npx next telemetry disable`. Ela não afeta os visitantes do site.
