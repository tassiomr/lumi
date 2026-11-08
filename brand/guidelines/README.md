# Identidade visual — Lumi

Fonte única dos ativos de marca, compartilhada pelo app iOS e pelo site, sem acoplamento de código: cada projeto copia ou referencia o arquivo de que precisa.

## Símbolo

Família visual do **Luminous** (`~/Documents/lumionous`, `Design/icon/luminous-icon.svg`). O Lumi usa o mesmo fundo carvão, a mesma luz e o mesmo ponto de brilho. O Luminous é um eclipse, a luz escondida. O Lumi é a mesma luz, acesa: um globo com base. O degradê da luz vai do branco quente ao azul frio, o mesmo eixo de temperatura de cor que o app controla.

- `icons/lumi-app-icon.svg` / `-1024.png`: ícone do app, sem cantos (o iOS aplica a máscara) e sem transparência. Também é usado na aparência escura.
- `icons/lumi-app-icon-tinted.svg` / `-1024.png`: variante em tons de cinza para a aparência colorida do iOS 18 ou mais recente.
- `logo/lumi-mark.svg`: símbolo com cantos arredondados (site, favicon, documentos). É copiado para `apps/website/app/icon.svg`, e a mesma geometria está em `apps/website/components/LumiMark.tsx`.

Para gerar os PNGs: `qlmanage -t -s 1024 -o <pasta> <arquivo>.svg`. Depois remova o canal alfa (converta para JPEG e de volta para PNG com `sips`).

## Cores

| Token | Hex | Uso |
|---|---|---|
| Carvão | `#1E2029` → `#08090C` | Fundo do ícone (radial) |
| Luz | `#FFFAF2` → `#E2D6FF` → `#A086EC` → `#6096E8` → `#4078D6` | Luz do símbolo, compartilhada com o Luminous |
| Brilho | `#FFFBF4` | Ponto de brilho |
| Azul elétrico | `#2F6BFF` | Destaques e links do site |
| Violeta | `#8B5CF6` | Selos "Em breve" no site |
| Fundo claro | `#FBFBFD` | Fundo do site (modo claro) |
| Fundo escuro | `#07080C` | Fundo do site (modo escuro) |

O site ainda usa o azul elétrico e o violeta nos destaques. Aproximá-los da paleta "Luz" é uma decisão em aberto.

## Tipografia

Fonte do sistema (SF Pro no iPhone/Mac), igual ao app SwiftUI. Títulos com peso semibold e espaçamento levemente negativo.

## Movimento

Animações suaves e lentas (brilho "respirando", revelação ao rolar), sempre desativadas com `prefers-reduced-motion` / Reduzir Movimento.
