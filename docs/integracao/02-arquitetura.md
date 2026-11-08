# Decisão arquitetural: Lumi Bridge no Mac

Status: proposta, 2026-11-08. Valida a Fase 2 antes da Fase 4.

## O problema

Para a lâmpada aparecer no app Casa, alguém precisa **implementar o lado acessório** de um protocolo que o Apple Home aceite: o HomeKit Accessory Protocol (HAP) ou o Matter. Precisamos distinguir:

| API | O que faz | Resolve? |
|---|---|---|
| `HomeKit` (`HMHomeManager`) no iOS e macOS | **Controla** acessórios já cadastrados no app Casa | Não. Não publica acessórios. |
| `MatterSupport` (`MatterAddDeviceRequest`) | **Comissiona** dispositivos Matter existentes numa rede | Não. Não cria bridges. |
| Servidor HAP (ex.: HAP‑NodeJS) | **Publica** acessórios ou bridges HAP na rede local | Sim |
| Bridge Matter (ex.: matter.js) | **Publica** um *Aggregator* Matter com lâmpadas | Sim |

Além disso, um app iOS **não consegue** manter um servidor HAP ou Matter ativo continuamente. Ao ir para segundo plano, o app é suspenso, e não existe modo de execução em background para isso. Portanto, **a bridge precisa de um host sempre ligado**.

## Alternativas

| | HAP (HAP‑NodeJS) | Matter (matter.js) | Homebridge pronto | Home Assistant |
|---|---|---|---|---|
| Licença e manutenção | Apache‑2.0, mantido pela equipe do Homebridge | Apache‑2.0, base do Homebridge 2.0 | Apache‑2.0 | Apache‑2.0 |
| Pareamento | Código de 8 dígitos e QR `X-HM://`, ambos gerados pela biblioteca | QR `MT:` e código manual Matter | Igual ao HAP | Via integração HomeKit Bridge |
| Central da casa | Não é necessária para controle local. É necessária para acesso remoto e automações. | Necessária no Apple Home (HomePod ou Apple TV) | Igual ao HAP | Igual |
| Características de luz | On, Brightness, Hue, Saturation, ColorTemperature (mired) | OnOff, LevelControl, ColorControl (HS e CT) | | |
| Implementação própria | Sim, com o adapter Tuya do Lumi | Sim | Não, depende de plugin de terceiros | Não |
| Distribuição comercial | Exige MFi. Para uso pessoal, aparece o aviso "acessório não certificado". | Exige certificação da CSA. Em desenvolvimento, usa VID de teste e mostra aviso. | | |
| Complexidade | Baixa | Média: IPv6, *fabric*, comissionamento | Mínima | Alta |

## Recomendação

```
 Apple Home / Siri / HomePod
          │  HAP sobre IP (fase 4) · Matter (fase posterior, mesmo daemon)
          ▼
 ┌──────────────── Lumi Bridge (Mac, Node.js, LaunchAgent) ────────────────┐
 │  AppleHome/AccessoryMapping ── Bridge/Pairing (dados persistidos)       │
 │              │                                                          │
 │        DeviceManager (Device, LightState, LightCommand)                 │
 │              │                                                          │
 │   TuyaDeviceAdapter ── TuyaLanDevice (3.3/3.4/3.5) ── TuyaCloud (setup) │
 └──────────────┼───────────────────────────────────────────────────────────┘
                ▼ TCP 6668 (AES-GCM)
           Elgin T100
```

1. **Host:** o seu Mac, com um LaunchAgent (`KeepAlive`, `RunAtLoad`). Ele inicia no login, reinicia após falhas e tem acesso ao Keychain da sessão. O Mac precisa ficar ligado e sem dormir com a tela apagada. Se o Mac desligar, a lâmpada aparece como "Sem resposta" no Casa. Mais tarde, o mesmo daemon roda num Raspberry Pi sem mudanças, trocando apenas o armazenamento de segredos.
2. **Primeiro transporte: HAP via HAP‑NodeJS.** Não depende de central para o primeiro teste, é a pilha mais madura e é a mesma do Homebridge. O pareamento usa os códigos reais gerados pela biblioteca, nada fictício.
3. **Matter via matter.js:** segundo transporte, se fizer sentido, sem mudar o adapter. O mapeamento de acessórios é isolado por transporte.
4. **Por que Node.js na bridge:** a Apple não oferece API para publicar acessórios, e não há biblioteca HAP ou Matter mantida em Swift. Em Node, o adapter Tuya e a bridge rodam no mesmo processo, sem IPC.
5. **App Lumi (SwiftUI):**
   - Depois da bridge, a lâmpada **passa a ser um acessório HomeKit de verdade**. O app iOS a controla legitimamente com `HMHomeManager`, como já faz com acessórios nativos.
   - A gestão da bridge (estado, código de pareamento, diagnósticos, sincronizar, reiniciar) vem numa API local autenticada, na fase 7.
   - O caminho Tuya App SDK atual do app iOS fica em espera. Ele não é necessário para este objetivo.

### Sincronização e prevenção de loops

- **Fonte da verdade:** o estado reportado pelo dispositivo (`STATUS` 0x08). Comandos só alteram o estado quando chega a confirmação. Sem confirmação, o adapter consulta o estado real. Se o comando não foi aplicado, o erro é propagado e o estado não muda.
- **Na bridge:** atualizações vindas do dispositivo usam `updateCharacteristic`, que não dispara os handlers de escrita. Só escritas vindas do HomeKit geram comandos. Isso evita loops.
- **Fila de comandos:** uma conexão por lâmpada, com comandos serializados. Comandos rápidos do controle de brilho vão ser agrupados na fase 4.
- **Manutenção da conexão:** heartbeat a cada 10 s. Quando a conexão cai, o dispositivo é marcado offline e há reconexão com backoff exponencial de 1 a 60 s. Comandos para um dispositivo offline falham, e o HomeKit mostra "Sem resposta".
- **Polling:** não é usado. O dispositivo envia o estado a cada mudança. Só há consulta na reconexão e quando falta confirmação.

### Segurança

- **Keychain:** a local key e o Access ID/Secret da Tuya ficam no Keychain do macOS (serviço `com.trmedia.lumi.bridge`). São gravados via `security -i` pelo stdin, para que não apareçam em argv.
- **Configuração:** `~/Library/Application Support/Lumi Bridge/devices.json` (permissão 0600) só guarda IP, versão e mapa de DPs.
- **Logs:** nunca incluem chaves. Os ids de dispositivo só aparecem na CLI local.
- **Nada embutido:** nenhuma chave vai no código nem no app distribuído. As credenciais da Tuya pertencem ao projeto do próprio usuário.

### Riscos e limites

- **Protocolo não oficial:** o protocolo local Tuya é documentado pela comunidade, não pela Tuya. Uma atualização de firmware pode mudá-lo.
- **Uso pessoal:** a solução serve para uso pessoal e técnico. **Distribuir ao público** um produto que expõe acessórios ao Apple Home exige MFi (HAP) ou certificação CSA (Matter), além de avaliação jurídica do uso do protocolo local. Isso não deve ser anunciado no site antes de uma decisão.
- **Site e políticas:** a bridge muda o produto descrito no site (que diz "app local, sem servidor, só SDK Tuya"). Política de Privacidade, Termos e Compatibilidade precisam ser revistos antes de publicar qualquer coisa sobre a bridge.
