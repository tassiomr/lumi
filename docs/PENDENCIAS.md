# Pendências de publicação — Lumi

O site **ainda não está pronto para publicação**. `npm run check:publish` (em `apps/website`) falha até os itens bloqueantes abaixo serem resolvidos.

Contexto: quando o site foi criado, **o projeto iOS do Lumi não existia nesta pasta** nem em outro lugar do Mac (o projeto `~/Documents/lumionous` é o Luminous, app de música `com.trmusic.luminous`, sem relação com o Lumi). Por isso, os textos legais descrevem o **funcionamento previsto** do Lumi, com base no escopo informado (HomeKit + Tuya, sem backend próprio). Tudo precisa ser conferido contra o app real.

---

## 1. Decisões de arquitetura

**Decidido (2026-11-08):** a Tuya é integrada pelo **Smart Life App SDK, com conta anônima do Lumi**, sem e-mail, usuário ou senha (`tuyaAccountModel = "app-sdk"`). Consequências, já refletidas no site e no app:

- Na primeira lâmpada Tuya, o app cria automaticamente uma *conta anônima* na nuvem Tuya, separada das contas Smart Life/Tuya Smart. Ela fica presa ao app instalado: se o usuário apagar o Lumi sem excluir a conta, perde o acesso e precisa resetar as lâmpadas.
- A TR Media não consegue localizar a conta de um usuário por e-mail; exclusão e remoção de lâmpadas são feitas no app.
- Pareamento no **modo AP** (o modo EZ exige o entitlement de multicast, que depende de aprovação da Apple). O SSID é digitado, então o app **não pede localização nem Bluetooth**.
- A TR Media é a controladora dos dados e a Tuya atua como operadora (Política §5 e §9).
- **Exclusão de conta dentro do app** (Guideline 5.1.1(v)): implementada com `deleteAnonymousAccount` em `ThingTuyaClient`. Segundo a Tuya, a remoção é imediata.
- AppKey, AppSecret e a imagem de segurança do SDK ficam somente no app, nunca no site nem no repositório público.
- O App Privacy declara User ID e dados dos dispositivos; nada de dados de contato (`docs/app-store/app-privacy.md`).

**Decidido (2026-11-08):** o Lumi é um **app local, sem servidor, analytics ou crash reporting da TR Media** (`hasTrMediaBackend = false`), e o **único SDK de terceiros é o da Tuya**. HomeKit é framework da Apple, não SDK de terceiros. Atenção: "local" quer dizer sem backend próprio. A conta do Lumi e os dados dos dispositivos Tuya continuam passando pela nuvem da Tuya, e a Política não pode dizer que tudo fica no aparelho.

Se no futuro entrar outro SDK (analytics, crash reporting, anúncios) ou um servidor próprio, atualize a Política, o App Privacy e `hasTrMediaBackend` **antes** de publicar a versão do app.

## 2. Funcionalidades a confirmar (bloqueante)

Em `apps/website/lib/capabilities.ts`, mude cada item `unconfirmed` para `available` (implementado e testado) ou `planned` (o site passa a mostrar "Em breve"):

- Ligar, desligar e brilho · Cor e temperatura · Ambientes · Cenas
- HomeKit · Matter via app Casa · Conta Tuya · Controle local Tuya · Pareamento Tuya pelo Lumi
- Experiência nativa (Dynamic Type, VoiceOver, Modo Escuro)

Enquanto um item estiver `unconfirmed`, o site exibe o selo **"Em validação"**.

## 3. Afirmações da Política de Privacidade a verificar no código do app

Cada linha abaixo é uma afirmação publicada. Confirme no código, ou ajuste o texto em `app/privacy/page.tsx`:

- [ ] Onde o SDK da Tuya persiste a sessão da conta anônima (a Política diz apenas "no iPhone, mantidos pelo SDK da Tuya").
- [ ] A senha do Wi‑Fi usada no pareamento **não** é armazenada pelo Lumi.
- [ ] Ambientes, cenas e preferências do Lumi ficam **somente no iPhone** (sem iCloud/CloudKit). Se usar CloudKit, acrescente o iCloud na Política.
- [ ] Dados do HomeKit **não** são enviados à Tuya nem a outro serviço.
- [ ] O SDK da Tuya não solicita Bluetooth/localização por conta própria no fluxo AP (o app só declara HomeKit e Rede Local).
- [ ] Dados técnicos que o SDK da Tuya coleta (é a única fonte possível de dados de diagnóstico no App Privacy). Confira o `PrivacyInfo.xcprivacy` do SDK, na versão usada.
- [ ] Região/data center configurados no projeto da Tuya IoT Platform para usuários do Brasil.
- [ ] Exclusão imediata da conta anônima (`deleteAnonymousAccount`) na versão do SDK usada.
- [ ] O que a Tuya faz com contas anônimas órfãs (app apagado sem excluir a conta) — a Política diz que seguem as regras do provedor.
- [ ] Centro de dados Tuya usado para contas do Brasil (Política §10).
- [ ] Prazo de 5 anos para mensagens de suporte (Política §11). É uma sugestão baseada no CDC; confirme com assessoria jurídica.

Recomendado: revisão por advogado(a) especializado(a) em LGPD antes de definir `NEXT_PUBLIC_LEGAL_REVIEWED=true`.

## 4. Dados da TR Media (bloqueante)

Configure na Vercel (veja `apps/website/.env.example`). Nenhum valor foi inventado:

- [ ] `NEXT_PUBLIC_SITE_URL`: domínio oficial (nenhum domínio foi presumido)
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL`: caixa existente e monitorada
- [ ] `NEXT_PUBLIC_PRIVACY_EMAIL`: opcional; se vazio, usa o de suporte
- [ ] `NEXT_PUBLIC_CONTROLLER_NAME`: razão social ou nome do responsável
- [ ] `NEXT_PUBLIC_CONTROLLER_DOCUMENT` / `NEXT_PUBLIC_CONTROLLER_ADDRESS`: opcionais, recomendados
- [ ] `NEXT_PUBLIC_DPO_NAME`: se houver encarregado designado
- [ ] `NEXT_PUBLIC_JURISDICTION_CITY`: opcional (foro para não consumidores)
- [ ] `NEXT_PUBLIC_LEGAL_REVIEWED=true`: só depois das seções 1–3

Teste o e-mail: envie uma mensagem pelo link "Enviar e-mail" de `/support` e confirme o recebimento.

## 5. App iOS

O app está em `apps/ios` (SwiftUI, iOS 18+, `com.trmedia.lumi`). Compila, passa nos testes e roda no simulador, inclusive em modo demonstração. Falta:

- [ ] **Instalar o SDK da Tuya** (CocoaPods, com o `ThingSmartCryption` gerado para o app na Tuya IoT Platform), colocar `t_s.bmp` em `Lumi/Resources/` e preencher `Config/Secrets.xcconfig` (veja `apps/ios/README.md`). Sem isso, a integração Tuya fica desativada no app.
- [ ] **Compilar e revisar `ThingTuyaClient.swift`**: foi escrito pela documentação pública e ainda não compilou contra o SDK real.
- [ ] Testar em **iPhone real**: lâmpadas HomeKit/Matter e Tuya (liga/desliga, brilho, cor, temperatura, cenas, pareamento AP, remoção, exclusão de conta). Depois, marcar as funções como `available` em `lib/capabilities.ts`.
- [ ] Selecionar o **Team** de assinatura e habilitar o HomeKit no App ID `com.trmedia.lumi`.
- [ ] Definir `LUMI_WEBSITE_URL` em `Config/Secrets.xcconfig` (o mesmo domínio de `NEXT_PUBLIC_SITE_URL`).

## 6. Conteúdo e marca

- [ ] Compatibilidade: registrar modelos testados (sobretudo Elgin) em `lib/compatibility.ts`, com versão do app e data.
- [ ] Substituir a ilustração do hero (`components/PhoneMockup.tsx`) por capturas reais do app.
- [ ] Após o lançamento: definir `NEXT_PUBLIC_APP_STORE_URL` e trocar o botão pelo selo oficial "Download on the App Store" (Apple Marketing Resources).
- [ ] Ícone do app: o símbolo em `brand/` é uma proposta. Se o app já tiver logotipo próprio, substitua `brand/logo/lumi-mark.svg`, `apps/website/app/icon.svg` e `components/LumiMark.tsx`.
- [ ] Versões em inglês das páginas legais e de suporte: hoje só a landing tem versão em inglês (`/en`). Traduzir depois que o texto em pt-BR for validado, para não manter dois textos não revisados.
