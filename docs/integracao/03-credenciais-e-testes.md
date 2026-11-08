# O que você precisa fornecer e como testar com a lâmpada real

Para controlar a lâmpada, falta uma coisa: a **local key** dela. Só a nuvem Tuya a entrega, para a conta em que a lâmpada está pareada.

## Passo 1: confirmar que o dispositivo encontrado é a T100

```
cd apps/bridge && node src/cli.ts discover
```

Desligue a lâmpada da tomada e rode o comando de novo. Se o anúncio de `192.168.1.2` sumir, é ela. Também dá para comparar o ID virtual no Elgin Smart: ⋯ › Informações do dispositivo.

## Passo 2: obter a local key (caminho recomendado)

> ⚠️ Este caminho **tira a lâmpada do Elgin Smart**. Um dispositivo Tuya pertence a uma só conta. Depois dele, o "app externo" do Teste 4 passa a ser o Smart Life.

1. Instale o **Smart Life** e crie uma conta, com Brasil como região.
2. No Elgin Smart, remova a lâmpada. Depois, pareie-a no Smart Life.
3. Crie uma conta em <https://platform.tuya.com>. Depois:
   1. Vá em **Cloud › Development › Create Cloud Project**.
   2. Preencha:
      - **Development Method:** Smart Home
      - **Data Center:** o mesmo da sua conta Smart Life. Para o Brasil costuma ser *Western America*. Se não aparecer nenhum dispositivo, tente *Eastern America*.
   3. Autorize as APIs **IoT Core** e **Authorization**. O plano de avaliação do IoT Core expira e pode ser renovado em *Cloud › Cloud Services*.
4. No projeto, abra **Devices › Link App Account › Add App Account** e escaneie o QR com o Smart Life (aba Eu, ícone de leitura).
5. Copie o **Access ID** e o **Access Secret** em *Overview*. Não envie esses valores por chat nem os coloque em arquivos.
6. No Mac:

```
node src/cli.ts cloud-setup    # pede Access ID, Secret (sem eco) e data center; grava no Keychain
node src/cli.ts cloud-sync     # importa a lâmpada, a local key (direto para o Keychain) e o modelo de DPs
node src/cli.ts list
```

### Tentativa sem Smart Life (a lâmpada continua no Elgin Smart)

Faça os passos 3 a 6 acima **sem** os passos 1 e 2. No passo 4, tente ler o QR do *Link App Account* com o próprio Elgin Smart: procure um leitor de QR na aba Eu/Perfil ou o ícone de escanear na tela inicial.

- **Funcionou?** O projeto mostra a conta vinculada. `cloud-setup` informa quantos dispositivos estão visíveis, e `cloud-sync` importa a lâmpada sem tirá-la do Elgin Smart.
- **Não funcionou?** O app não tem leitor, recusa o QR, ou `cloud-setup` mostra 0 dispositivos. Então o Elgin Smart não pode ser vinculado, que é o resultado esperado para apps de marca: as credenciais desse app pertencem à Elgin, não ao seu projeto. Projetos da comunidade que controlam lâmpadas Elgin localmente relatam exatamente essa limitação.

Nesse caso, sobram dois caminhos legítimos, e os dois tiram a lâmpada do Elgin Smart:

1. Parear no Smart Life (passos 1 e 2).
2. Parear pelo próprio Lumi, com o Tuya App SDK. Isso exige configurar o SDK no app iOS.

**Descartado:** extrair a local key do armazenamento do Elgin Smart ou interceptar o tráfego TLS dele. Isso exigiria contornar proteções do app de terceiros.

**Se você já tem a local key** obtida de forma legítima:

```
node src/cli.ts add <id> 192.168.1.2 3.5
```

A chave é pedida sem eco.

## Passo 3: roteiro de validação (hardware real)

Rode com `LUMI_DEBUG=1` para ver o diagnóstico do protocolo.

| Teste | Comando | O que esperar |
|---|---|---|
| 1. Comunicação | `node src/cli.ts status <nome>` | `online`, o estado real e as capacidades. Se der "local key não confere", a chave ou a versão estão erradas. |
| 2. Energia | `… on <nome>`, depois `… off <nome>` | A lâmpada acende e apaga. Aparece "Confirmado pelo dispositivo em N ms". |
| 3. Iluminação | `… brightness <nome> 30` · `… temp <nome> 0` · `… color <nome> 240` · `… mode <nome> scene` | O brilho, o branco quente, o azul e o modo mudam. Anote a latência. |
| 4. Sincronização externa | `… watch <nome>`, depois mude a lâmpada pelo Smart Life (ou pelo Elgin Smart) | Uma linha nova aparece para cada mudança. |
| 9. Recuperação | Durante o `watch`: tire a lâmpada da tomada, religue, desligue o Wi‑Fi do roteador ou a internet | `offline`, novas tentativas e depois `online`. Sem internet, o controle local deve continuar. |

Os testes 5 a 8 (bridge, app Casa, Siri e app fechado) pertencem à fase 4 e dependem destes resultados.

Registre os resultados em `docs/integracao/resultados.md`: data, comando, saída e latência. Só depois disso as funções podem ser marcadas como disponíveis.

**O que já foi validado:**

- A descoberta na rede real e a decodificação de 13 de 13 broadcasts reais.
- A porta TCP 6668 aberta.
- 34 testes automatizados contra um **dispositivo simulado**. Eles validam a lógica, **não são evidência de compatibilidade com o hardware**.
