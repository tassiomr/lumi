# Lumi

Ecossistema do **Lumi**, app de iluminação inteligente para iPhone da **TR Media** (`com.trmedia.lumi`).

```
.
├── apps/
│   ├── ios/                  # App SwiftUI (HomeKit + Tuya) — veja apps/ios/README.md
│   │   ├── Lumi.xcodeproj
│   │   ├── Lumi/
│   │   ├── LumiTests/
│   │   └── LumiLegal/        # Pacote Swift: seção "Sobre e Legal" + exclusão de conta/dados
│   └── website/              # Site oficial (Next.js, estático, deploy na Vercel)
├── brand/
│   ├── logo/                 # Símbolo do Lumi (SVG)
│   ├── icons/                # Base do ícone do app
│   └── guidelines/           # Cores, tipografia, movimento
└── docs/
    ├── PENDENCIAS.md         # O que falta antes de publicar  ← comece aqui
    └── app-store/
        ├── app-privacy.md    # Respostas da seção App Privacy
        └── urls.md           # URLs para o App Store Connect
```

## Situação

- **Site**: implementado e com build de produção funcionando. **Ainda não está pronto para publicação**: faltam os dados da TR Media (domínio, e-mail, controlador) e a confirmação dos textos legais contra o app real. Veja `docs/PENDENCIAS.md`. `cd apps/website && npm run check:publish` lista o que ainda bloqueia.
- **App iOS**: compila, passa nos testes e roda no simulador. HomeKit/Matter, cenas, ambientes e "Sobre e Legal" funcionam. A integração Tuya (conta anônima, pareamento AP, controle e exclusão) está escrita, mas depende de instalar o SDK da Tuya e testar em iPhone real.

## Início rápido

```bash
cd apps/website && npm install && npm run dev
cd apps/ios/LumiLegal && swift test
open apps/ios/Lumi.xcodeproj
```
