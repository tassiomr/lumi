# URLs para o App Store Connect

Substitua `https://<DOMINIO-OFICIAL>` pelo valor de `NEXT_PUBLIC_SITE_URL` **depois** que o domínio estiver apontado para a Vercel e `npm run check:publish` passar. Não cadastre URLs de preview (`*.vercel.app`) nem domínios ainda não registrados.

| Campo no App Store Connect | URL | Onde fica |
|---|---|---|
| Privacy Policy URL | `https://<DOMINIO-OFICIAL>/privacy` | App Privacy / App Information |
| Support URL | `https://<DOMINIO-OFICIAL>/support` | Versão › App Information |
| Marketing URL | `https://<DOMINIO-OFICIAL>/` | Versão › App Information (opcional) |
| Privacy Choices URL | `https://<DOMINIO-OFICIAL>/privacy-choices` | App Privacy (opcional) |
| Exclusão de conta/dados | `https://<DOMINIO-OFICIAL>/delete-account` | Notas para o App Review e texto da Política |

Requisitos atendidos pelo site:

- Todas as páginas são estáticas, públicas, sem login, servidas via HTTPS pela Vercel.
- `/privacy` identifica o desenvolvedor e o controlador e explica coleta, uso, compartilhamento, retenção, exclusão e revogação de consentimento (Guideline 5.1.1(i)).
- `/delete-account` descreve a exclusão iniciada dentro do app (Guideline 5.1.1(v)). A ação no app vem do pacote `LumiLegal` (`DataDeletionView`).

Sugestão para as **Notes for App Review**:

> O Lumi não tem login. Para lâmpadas Tuya, o app cria automaticamente uma conta anônima (sem e-mail, telefone ou senha), que pode ser excluída em Configurações › Sobre e Legal › Exclusão de Conta e Dados › Excluir conta. Acessórios HomeKit não criam conta. O controle exige lâmpadas físicas compatíveis; um vídeo de demonstração está disponível em: <link>.
