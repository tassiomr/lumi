# Fase 1: investigação técnica da Elgin T100

Data: 2026-11-08. Cada afirmação traz um nível de evidência:

- **Comprovado:** observado diretamente, nesta rede, com os comandos indicados.
- **Indício:** vem de fonte pública, mas não foi verificado aqui.
- **Não verificado:** é uma hipótese ainda sem evidência.

## Resumo

| Pergunta | Resposta | Evidência |
|---|---|---|
| A lâmpada usa a plataforma Tuya? | Há um dispositivo Tuya Wi‑Fi na rede local. Ainda falta confirmar que ele é a T100. | **Comprovado** que é Tuya. **Não verificado** que é a T100. |
| Protocolo local | Tuya LAN **3.5**: TCP 6668, AES‑128‑GCM, negociação de chave de sessão | **Comprovado** |
| Existe comunicação local? | Sim. O dispositivo anuncia por UDP e aceita conexão TCP na porta 6668. | **Comprovado** |
| Depende obrigatoriamente da nuvem? | Não para controlar, desde que se tenha a *local key*. A local key, por sua vez, só se obtém pela nuvem Tuya. | Comprovado em parte (ver §4) |
| O app Elgin Smart é baseado em Tuya? | Provavelmente é um app OEM da Tuya | **Indício** |
| Pode ser vinculada ao Smart Life? | Lojistas afirmam compatibilidade com Smart Life e Tuya Smart | **Indício** |

## 1. Evidência na rede local

### Escuta passiva

O Mac (192.168.1.3) escutou as portas UDP 6666, 6667 e 7000 por 40 segundos. Nenhum pacote foi enviado à rede.

Nesse intervalo, o endereço **192.168.1.2** enviou 13 broadcasts para a porta UDP 6667:

```
0000669900000000000000000013000000ee … 00009966   (260 bytes)
```

Como ler o pacote:

- **Moldura:** prefixo `0x6699`, comando `0x13` (`UDP_NEW`) e sufixo `0x9966`. Essa é a moldura do protocolo Tuya 3.5.
- **Criptografia:** o corpo é AES‑128‑GCM com a chave de broadcast que todos os dispositivos Tuya usam (pública, `md5("yGAdlopoPVldABfn")`). A tag GCM foi validada nos 13 pacotes, o que exclui uma coincidência de formato.
- **Conteúdo decifrado** (o id foi abreviado aqui de propósito):

```json
{"ip":"192.168.1.2","gwId":"ebccc1…xyif","uuid":"…","active":2,"ablilty":0,
 "encrypt":true,"productKey":"key8u54q9dtru5jw","version":"3.5","token":true,
 "wf_cfg":true,"clientLink":3}
```

Para reproduzir:

```
node apps/bridge/src/cli.ts discover
```

A saída foi `192.168.1.2  v3.5  id ebccc1…xyif  produto key8u54q9dtru5jw`.

### Conexão TCP

`nc -z 192.168.1.2 6668` conectou. A porta de controle local está aberta. Nenhum comando foi enviado, porque isso exige a local key (§4).

### Conclusões

- O dispositivo tem um módulo Wi‑Fi Tuya com firmware recente (protocolo 3.5).
- Os campos `gwId`, `productKey` e `version` seguem o formato da plataforma Tuya.
- **Falta confirmar que é a T100.** Foi o único dispositivo Tuya anunciado. Para confirmar, abra a lâmpada no app Elgin Smart, toque em ⋯ › Informações do dispositivo, e compare o ID virtual (deve começar com `ebccc1`) e o IP. Outra forma: desligue a lâmpada da tomada e rode `discover`. Se o anúncio parar, é ela.

## 2. App Elgin Smart

- **App Store:** id1485365674, publicado por "Elgin". No Google Play o publicador é ELGIN SA.
- **Indícios de Tuya:**
  - Lojistas anunciam a lâmpada como controlável pelo Elgin Smart, pelo Smart Life e pelo Tuya Smart.
  - Projetos open source independentes controlam lâmpadas **Elgin Smart Color** (A70, 15 W) pela rede local com TinyTuya, depois de obter a local key. Eles relatam que a conta do Elgin Smart não pode ser vinculada à Tuya Developer Platform e que é preciso parear de novo pelo Smart Life. São indícios fortes, mas não cobrem especificamente a T100.
  - Uma análise do Canaltech observa que o app é o mesmo usado por outra marca (Smarteck). Isso é típico dos apps OEM da Tuya, que reaproveitam o mesmo app com outra marca.
- **O que não foi feito, e por quê:**
  - Não descriptografei nem decompilei o binário iOS, que é protegido por FairPlay. Remover essa proteção seria contornar um mecanismo de segurança.
  - Não interceptei o tráfego TLS do app, o que exigiria um proxy MITM. Isso só mostraria a API privada da Elgin/Tuya, e não vamos depender dela.
  - Não tentei extrair a AppKey nem o AppSecret da Elgin.
  - Uma alternativa legítima, se for necessária, é analisar o APK Android para listar os SDKs incluídos, sem extrair segredos. Mas ela não muda a arquitetura: o protocolo local já está identificado pelo próprio dispositivo.

### Respostas às perguntas da especificação

| # | Pergunta | Resposta |
|---|---|---|
| 1–3 | Infraestrutura, uso de Tuya, vínculo com Smart Life | Tuya. O vínculo com o Smart Life ainda precisa ser testado (ver o procedimento em [03](03-credenciais-e-testes.md)). |
| 4 | Provisionamento | Padrão Tuya, modo EZ (SmartConfig) ou AP. O dispositivo se registra na nuvem Tuya com o token da conta do app (`token:true`). **Indício.** |
| 5 | Autenticação | Na nuvem, conta do app OEM e credenciais do app, que pertencem à Elgin. Na rede local, a `local_key` de 16 bytes, gerada a cada pareamento. Em 3.5, a chave de sessão é negociada com HMAC‑SHA256. |
| 6 | Envio de comandos | Na rede local, comando `CONTROL_NEW` (0x0d) com JSON `{"protocol":5,"data":{"dps":{…}}}`, cifrado em AES‑GCM. Na nuvem, MQTT/HTTPS da Tuya. **Indício** para a nuvem. |
| 7 | Recebimento de estados | Na rede local, `STATUS` (0x08) enviado pelo dispositivo a cada mudança, inclusive quando a mudança vem de outros apps. Também é possível consultar com `DP_QUERY_NEW` (0x10). |
| 8 | Comunicação local | Sim (comprovado). |
| 9 | Dependência de nuvem | O controle não depende da nuvem. A obtenção da local key e o pareamento dependem. |
| 10 | Protocolos | UDP broadcast (descoberta), TCP 6668 (controle), AES‑128‑GCM, HMAC‑SHA256. O MQTT/TLS da nuvem não foi observado aqui. |

## 3. Projetos e APIs avaliados

| Solução | Serve para a T100? | Observações |
|---|---|---|
| **Tuya OpenAPI** (Cloud Development) | Sim, para obter a local key e o modelo de DPs | É oficial e documentada. Exige um projeto na Tuya Developer Platform e a conta Smart Life ou Tuya Smart vinculada a ele. Contas de apps OEM, como provavelmente a Elgin Smart, em geral não podem ser vinculadas. |
| **Protocolo local Tuya** | Sim, versão 3.5 confirmada | A Tuya não publica uma especificação oficial para integração por terceiros. O protocolo é documentado por projetos open source. |
| **TinyTuya** (Python, MIT) | Sim, suporta 3.5 | Foi a referência de comportamento. Não é usada como dependência. |
| **tuyapi** (Node, MIT) | Incerto para 3.5 | Não foi adotada. |
| **Homebridge + plugins Tuya** | Depende do plugin | O plugin oficial da Tuya usa a nuvem. Os plugins locais da comunidade variam no suporte a 3.5. Serve como alternativa de comparação. |
| **Home Assistant (Tuya / LocalTuya / Tuya Local)** | Sim | Exige um servidor dedicado. É pesado demais para o primeiro marco. |
| **Tuya App SDK** (o caminho anterior do app iOS) | Sim, com a conta própria do Lumi | Entrega a local key ao parear. Exige aprovação e configuração do SDK, e a lâmpada sai do Elgin Smart. |
| **API privada da Elgin** | Descartada | Não é documentada. Usá-la exigiria extrair credenciais da Elgin. |

## 4. Rede local × nuvem

| Critério | Rede local (protocolo 3.5) | Nuvem (OpenAPI) |
|---|---|---|
| Latência | Dezenas de ms (estimativa, ainda não medida no hardware) | Centenas de ms ou mais, dependendo da internet |
| Funciona sem internet | Sim | Não |
| Segurança | Chave por dispositivo e AES‑GCM. A chave fica no Keychain do Mac. | OAuth com o Access Secret do projeto. Os comandos passam pelo servidor da Tuya. |
| Configuração | Exige a local key (uma vez, via nuvem) | Exige o projeto e a conta vinculada |
| Manutenção | O protocolo não é oficial e pode mudar com o firmware | É estável e versionada, mas o plano de avaliação gratuito do IoT Core expira e precisa ser renovado |
| Receber mudanças externas | Sim, o dispositivo envia o estado a cada mudança | Exige Pulsar/mensageria, mais complexo |

**Decisão:** controle e sincronização pela **rede local**. A **nuvem** só para importar o dispositivo, a local key e o modelo de DPs. O controle pela nuvem fica como possível adapter futuro, atrás da mesma interface `DeviceAdapter`.

Limitações conhecidas:

- A local key muda sempre que a lâmpada é pareada de novo. Depois disso, é preciso rodar `cloud-sync` outra vez.
- Os dispositivos Tuya aceitam poucas conexões TCP simultâneas. Se o app do celular estiver usando a rede local ao mesmo tempo, pode haver disputa. Isso precisa ser medido no hardware.

## Fontes

- [Elgin Smart na App Store](https://apps.apple.com/app/id1485365674)
- [Canaltech: review da Elgin Smart Color](https://canaltech.com.br/lampada-de-led/analise/review-elgin-smart-color-uma-lampada-inteligente-boa-e-barata/)
- [Pelando: anúncio da Elgin Smart Color com Smart Life/Tuya](https://www.pelando.com.br/d/prime-l-mpada-smart-color-10w-elgin-r-89-90-75d2)
- [TinyTuya](https://github.com/jasonacox/tinytuya), referência do protocolo local e do fluxo de vinculação de conta
- [Tuya: assinatura da OpenAPI](https://developer.tuya.com/en/docs/iot/new-singnature)
- [elgin-smart-local](https://github.com/Arthurregiani/elgin-smart-local), [elgin-tray](https://github.com/BrunoNC22/elgin-tray) e [lamp-remote-control](https://github.com/EnzoMVP/lamp-remote-control): controle local de lâmpadas Elgin (comunidade)
- [Relato sobre app OEM (LEDVANCE) que não pode ser vinculado ao IoT Platform](https://community.home-assistant.io/t/ledvance-wifi-bulbs/301478/2) (fonte isolada, tratada como indício)
