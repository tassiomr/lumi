# Lumi Bridge

Controle local de lâmpadas Tuya/Elgin a partir do Mac. É a fase 2 do [plano de integração](../../docs/integracao/02-arquitetura.md). A exposição ao Apple Home (HAP) entra na fase 4, neste mesmo pacote.

Requisitos: Node.js 24 ou mais recente (roda TypeScript direto, sem build) e macOS (para usar o Keychain).

```
npm install            # só ferramentas de desenvolvimento (typescript, @types/node)
node src/cli.ts help
npm test               # testes contra um dispositivo simulado
npm run typecheck
```

| Pasta | Conteúdo |
|---|---|
| `src/core` | Modelo de domínio (`Device`, `LightState`, `LightCommand`, `DeviceAdapter`), sem nada de Tuya |
| `src/tuya` | `protocol.ts` (framing 3.3/3.4/3.5), `lan.ts` (conexão TCP), `discovery.ts` (UDP), `cloud.ts` (OpenAPI, só setup), `lightMapper.ts` (DPs ↔ domínio), `adapter.ts` (`TuyaDeviceAdapter`) |
| `src/store` | Keychain (segredos) e `devices.json` (dados não secretos) |
| `src/cli.ts` | CLI da prova de conceito |

Não há dependências em tempo de execução: só `node:crypto`, `node:net` e `node:dgram`.

Para configurar a lâmpada real, siga [docs/integracao/03-credenciais-e-testes.md](../../docs/integracao/03-credenciais-e-testes.md).
