# App Store Connect — App Privacy ("Nutrition Label") do Lumi

Rascunho das respostas da seção **App Privacy**, com base na arquitetura prevista: HomeKit no dispositivo, Tuya via Smart Life App SDK e nenhum servidor da TR Media. **Confira cada linha contra o build final e o `PrivacyInfo.xcprivacy` do SDK da Tuya** na versão usada antes de enviar. Veja também `docs/PENDENCIAS.md`.

Regra da Apple: "coletar" = transmitir dados para fora do dispositivo de forma que você **ou um parceiro/SDK de terceiro** possa acessá-los por mais tempo do que o necessário para atender a solicitação em tempo real. Dados enviados à nuvem Tuya pelo SDK **contam como coletados**.

## 1. Você ou seus parceiros coletam dados deste app?

**Sim** (por causa da conta e dos dispositivos na nuvem Tuya).

> Se o app for lançado só com HomeKit (sem Tuya), a resposta passa a ser **"Não, não coletamos dados deste app"**, já que o HomeKit é processado no dispositivo e pela Apple.

## 2. Tipos de dados

A conta Tuya é **anônima**: o Lumi não pede e-mail, telefone, nome nem senha.

| Tipo de dado (App Store Connect) | Declarar? | Vinculado ao usuário? | Rastreamento? | Finalidade | Origem |
|---|---|---|---|---|---|
| Identifiers › **User ID** | Sim | Sim | Não | App Functionality | ID da conta anônima na Tuya |
| Identifiers › **Device ID** | **Verificar** no PrivacyInfo do SDK Tuya (ex.: IDFV ou identificador próprio) | Sim | Não | App Functionality | SDK Tuya |
| Diagnostics › **Crash Data** / **Performance Data** / **Other Diagnostic Data** | **Verificar** no PrivacyInfo do SDK Tuya | Conforme o SDK | Não | App Functionality | SDK Tuya |
| **Other Data Types** | Sim: nomes e estados das lâmpadas Tuya, comandos enviados | Sim | Não | App Functionality | Nuvem Tuya |
| Contact Info (e-mail, telefone, nome, endereço) | **Não**: conta anônima | — | — | — | — |
| Location › Precise/Coarse | **Não**: o app não pede localização (o SSID é digitado) — verificar se o SDK envia algo | — | — | — | — |
| Usage Data › Product Interaction | **Não**: não há analytics | — | — | — | — |
| Contacts, Photos, Audio, Browsing/Search History, Financial, Health, Sensitive Info, Purchases | **Não** | — | — | — | — |

O manifesto do app (`apps/ios/Lumi/Resources/PrivacyInfo.xcprivacy`) já declara User ID e Other Data (App Functionality, sem rastreamento) e o uso de `UserDefaults` (CA92.1).

### Não declarar

- **Dados do HomeKit**: processados no dispositivo e pela Apple; o Lumi não os transmite.
- **Cenas, ambientes, favoritos e preferências do Lumi**: ficam só no iPhone (`Application Support/Lumi/local.json`, sem iCloud).
- **Senha do Wi‑Fi**: digitada no pareamento e enviada à lâmpada só naquele momento, sem retenção pelo Lumi. Confirme com a Tuya que ela não é retida na nuvem.
- **Relatórios de falha da Apple** (Compartilhar com Desenvolvedores): coletados pela Apple. Inclua apenas se você integrar outro serviço de crash reporting.

## 3. Rastreamento (Tracking)

**Não.** O Lumi não vincula dados a dados de terceiros para publicidade nem os compartilha com data brokers. Não usar App Tracking Transparency nem IDFA. Se algum SDK passar a fazer isso, a resposta muda e o ATT passa a ser obrigatório.

## 4. Privacy Manifest (`PrivacyInfo.xcprivacy`) do app

Já incluído em `apps/ios/Lumi/Resources/PrivacyInfo.xcprivacy`, com:

- `NSPrivacyTracking = false`
- `NSPrivacyCollectedDataTypes` coerente com a tabela acima
- `NSPrivacyAccessedAPITypes`: `UserDefaults` → `CA92.1`

O SDK da Tuya traz o próprio manifesto. O Xcode agrega todos em *Product › Archive › Generate Privacy Report*: use esse relatório para conferir a tabela antes de enviar.

## 5. URLs (seção App Information / App Privacy)

Veja `docs/app-store/urls.md`.
