# Lumi iOS

App SwiftUI do Lumi (`com.trmedia.lumi`, iOS 18+, iPhone).

```
apps/ios/
├── Lumi.xcodeproj         # pastas sincronizadas: arquivos novos entram no target automaticamente
├── Config/                # Lumi.xcconfig, Secrets.example.xcconfig, Info.plist, entitlements (HomeKit)
├── Lumi/
│   ├── App/               # LumiApp, AppModel (monta as integrações)
│   ├── Models/            # Light, LightState, LightCommand, LumiScene
│   ├── Services/          # LightStore, LocalStore, HomeKitProvider, DemoProvider (Debug)
│   │   └── Tuya/          # TuyaClient (protocolo), TuyaLightMapper (DPs), TuyaProvider, ThingTuyaClient (SDK)
│   ├── Views/             # Luzes, detalhe, Cenas, Configurações, pareamento
│   └── Resources/         # Assets (ícone), PrivacyInfo.xcprivacy
├── LumiTests/             # testes do mapeamento Tuya, cenas e armazenamento local
└── LumiLegal/             # pacote: seção "Sobre e Legal" e tela de exclusão de conta e dados
```

## O que o app faz

- **HomeKit/Matter**: lê e controla, pelo framework HomeKit, as lâmpadas do app Casa: liga/desliga, brilho, cor e temperatura. Executa as cenas do app Casa. Tudo no iPhone.
- **Tuya**: conta **anônima** criada automaticamente na primeira lâmpada (sem e-mail nem senha), pareamento no modo AP, controle por DPs padrão de iluminação (`switch_led`, `bright_value_v2`, `temp_value_v2`, `colour_data_v2`), remoção de lâmpadas e exclusão da conta.
- **Cenas do Lumi**: guardam o estado de várias lâmpadas e são aplicadas com um toque. Ficam só no iPhone, junto com os ambientes das lâmpadas Tuya e as favoritas.
- **Configurações › Sobre e Legal**: links para o site e a tela de exclusão (apagar dados locais e excluir conta).
- Permissões: só **Dados da Casa** e **Rede Local**. Sem Bluetooth, localização, analytics ou servidor próprio.

## Rodar

```bash
open apps/ios/Lumi.xcodeproj
```

No esquema *Lumi*, ative o argumento `-LumiDemo` (Edit Scheme › Run › Arguments) para usar lâmpadas fictícias no simulador. Esse modo só existe em Debug.

Testes:

```bash
xcodebuild -project apps/ios/Lumi.xcodeproj -scheme Lumi -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test
cd apps/ios/LumiLegal && swift test
```

## Configurar

1. Copie `Config/Secrets.example.xcconfig` para `Config/Secrets.xcconfig` (ignorado pelo git) e preencha:
   - `LUMI_WEBSITE_URL`: domínio oficial do site (o mesmo de `NEXT_PUBLIC_SITE_URL`);
   - `TUYA_APP_KEY` / `TUYA_APP_SECRET`: credenciais do app na Tuya IoT Platform.
2. Em *Signing & Capabilities*, escolha o Team. O HomeKit já está nos entitlements.

## Instalar o SDK da Tuya

O código da integração já está pronto, mas `ThingTuyaClient.swift` só compila quando o módulo `ThingSmartHomeKit` existe (`#if canImport`). Sem o SDK, o app funciona com HomeKit e mostra a Tuya como "não configurada".

1. Na [Tuya IoT Platform](https://platform.tuya.com), crie o app com o bundle `com.trmedia.lumi`. Baixe a imagem de segurança `t_s.bmp` e o pacote `ThingSmartCryption` gerado para o app.
2. Coloque `t_s.bmp` em `apps/ios/Lumi/Resources/` (já ignorado pelo git).
3. Crie `apps/ios/Podfile` seguindo a [documentação do Smart Life App SDK](https://developer.tuya.com/en/docs/app-development) (source do repositório de specs da Tuya, `ThingSmartHomeKit` e `ThingSmartCryption` local) e rode `pod install`. Depois disso, abra `Lumi.xcworkspace`.
4. Compile e ajuste `ThingTuyaClient.swift`: ele foi escrito a partir da documentação pública e **ainda não compilou contra o SDK real**.
5. Teste em iPhone real: o pareamento AP não funciona no simulador.

O modo EZ não foi implementado: no iOS 14.5+ ele exige o entitlement `com.apple.developer.networking.multicast`, que depende de aprovação da Apple. A Tuya recomenda o modo AP para iOS.
