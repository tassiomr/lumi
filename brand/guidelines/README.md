# Identidade visual — Lumi

Fonte única dos ativos de marca, compartilhada pelo app iOS e pelo site, sem acoplamento de código: cada projeto copia ou referencia o arquivo de que precisa.

## Símbolo

- `logo/lumi-mark.svg`: símbolo com cantos arredondados (site, favicon, documentos). Copiado para `apps/website/app/icon.svg`; a mesma geometria está em `apps/website/components/LumiMark.tsx`.
- `icons/lumi-app-icon.svg`: versão sem cantos (full-bleed) para gerar o ícone do app de 1024×1024. O iOS aplica a máscara de cantos.

> O símbolo é uma proposta criada com o site. Se o app já tiver logotipo, substitua os arquivos acima e o componente `LumiMark`.

## Cores

| Token | Hex | Uso |
|---|---|---|
| Azul elétrico | `#2F6BFF` | Destaque principal, links, início do gradiente |
| Violeta | `#8B5CF6` | Fim do gradiente, selos "Em breve" |
| Fundo claro | `#FBFBFD` | Fundo do site (modo claro) |
| Fundo escuro | `#07080C` | Fundo do site (modo escuro) |

Gradiente de marca: 135°, `#2F6BFF` → `#8B5CF6`. Use-o com moderação: no símbolo, em títulos de destaque e em um bloco de CTA por página.

## Tipografia

Fonte do sistema (SF Pro no iPhone/Mac), igual ao app SwiftUI. Títulos com peso semibold e espaçamento levemente negativo.

## Movimento

Animações suaves e lentas (brilho "respirando", revelação ao rolar), sempre desativadas com `prefers-reduced-motion` / Reduzir Movimento.
