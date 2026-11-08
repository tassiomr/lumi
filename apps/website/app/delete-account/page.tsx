import Link from "next/link";
import { ContactEmail } from "@/components/Contact";
import { DocSection, LegalPage, type TocItem } from "@/components/LegalPage";
import { hasLumiAccount } from "@/lib/capabilities";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Exclusão de Conta e Dados",
  description:
    "Como excluir a conta do Lumi, apagar dados locais, remover dispositivos Tuya e revogar o acesso ao HomeKit — e o que cada ação remove.",
  path: routes.deleteAccount,
});

const toc: TocItem[] = [
  { id: "resumo", title: "Resumo" },
  { id: "locais", title: "1. Dados locais" },
  { id: "tuya", title: "2. Dispositivos e conta Tuya" },
  { id: "homekit", title: "3. HomeKit" },
  { id: "conta", title: "4. Conta do Lumi" },
  { id: "sem-acesso", title: "Sem acesso ao app" },
  { id: "o-que-permanece", title: "O que pode permanecer" },
];

export default function DeleteAccountPage() {
  return (
    <LegalPage
      eyebrow="Privacidade"
      title="Exclusão de Conta e Dados"
      intro={
        <>
          Seus dados no {site.name} ficam em lugares diferentes — no iPhone, na Apple e na Tuya. Cada um é removido de um
          jeito. Esta página explica o que cada ação apaga e o que depende de outros serviços.
        </>
      }
      toc={toc}
    >
      <DocSection id="resumo" title="Resumo">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th scope="col">Ação</th>
                <th scope="col">O que remove</th>
                <th scope="col">O que não remove</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Apagar dados locais</strong></td>
                <td>Cenas, ambientes, favoritos e preferências do Lumi no iPhone.</td>
                <td>A conta anônima na Tuya e suas lâmpadas Tuya; dados do HomeKit.</td>
              </tr>
              <tr>
                <td><strong>Remover dispositivo Tuya</strong></td>
                <td>O dispositivo da sua conta do Lumi.</td>
                <td>A conta e os demais dispositivos.</td>
              </tr>
              <tr>
                <td><strong>Revogar acesso ao HomeKit</strong></td>
                <td>O acesso do Lumi aos dados da Casa.</td>
                <td>Sua casa, acessórios e cenas no app Casa.</td>
              </tr>
              {hasLumiAccount ? (
                <tr>
                  <td><strong>Excluir conta do Lumi</strong></td>
                  <td>A conta anônima e as lâmpadas vinculadas a ela na nuvem da Tuya.</td>
                  <td>Contas Smart Life/Tuya Smart; dados do HomeKit.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="locais" title="1. Excluir os dados locais do Lumi">
        <p>Ambientes, cenas, favoritos e preferências criados no Lumi ficam somente no seu iPhone.</p>
        <ul>
          <li>
            <strong>No app:</strong> em <em>Configurações › Sobre e Legal › Exclusão de Conta e Dados</em>, use{" "}
            <em>Apagar dados locais</em>.
          </li>
          <li>
            <strong>Pelo iOS:</strong> remover o app (pressione o ícone › Remover App › Apagar App) apaga todos os dados
            locais.
          </li>
        </ul>
        <p>
          <strong>Atenção:</strong> apagar os dados locais <strong>não exclui</strong> a conta anônima do Lumi na Tuya nem
          os dados do HomeKit. E <strong>remover o app sem excluir a conta</strong> deixa a conta inacessível na Tuya, já
          que ela não tem e-mail nem senha para ser recuperada. Exclua a conta no app antes de removê-lo (seção 4).
        </p>
      </DocSection>

      <DocSection id="tuya" title="2. Desvincular lâmpadas Tuya">
        <p>
          No Lumi, abra a lâmpada e toque em <em>Remover dispositivo</em>. Ela é desvinculada da conta anônima e pode ser
          pareada de novo, no Lumi ou em outro app.
        </p>
        <p>
          A conta anônima do Lumi é independente dos apps Smart Life e Tuya Smart. Excluir dados no Lumi não altera
          contas que você tenha nesses apps — elas devem ser gerenciadas por lá.
        </p>
      </DocSection>

      <DocSection id="homekit" title="3. Revogar as permissões do HomeKit">
        <ol>
          <li>Abra <em>Ajustes</em> no iPhone.</li>
          <li>Toque em <em>Privacidade e Segurança › Dados da Casa</em> (ou em <em>Ajustes › Lumi</em>).</li>
          <li>Desative o acesso do Lumi.</li>
        </ol>
        <p>
          O Lumi não guarda cópia dos dados do HomeKit fora do iPhone. Sua casa, cômodos, acessórios e cenas continuam no
          app Casa e só podem ser removidos por lá ou pela Apple.
        </p>
      </DocSection>

      <DocSection id="conta" title="4. Excluir a conta do Lumi">
        {hasLumiAccount ? (
          <>
            <p>
              Ao adicionar a primeira lâmpada Tuya, o Lumi cria uma conta anônima, sem e-mail nem senha. A exclusão é
              feita <strong>dentro do aplicativo</strong>, a qualquer momento:
            </p>
            <ol>
              <li>Abra o Lumi.</li>
              <li>Acesse <em>Configurações › Sobre e Legal › Exclusão de Conta e Dados</em>.</li>
              <li>Toque em <em>Excluir conta</em> e confirme.</li>
            </ol>
            <p>A exclusão remove, na nuvem da Tuya:</p>
            <ul>
              <li>a conta anônima (identificador de usuário, nome de usuário aleatório e código de país);</li>
              <li>a casa e as lâmpadas vinculadas à conta.</li>
            </ul>
            <p>
              No iPhone, o Lumi também apaga os dados locais. Segundo a Tuya, a conta anônima é excluída imediatamente.
              Depois disso, as lâmpadas precisam ser resetadas para serem pareadas de novo.
            </p>
          </>
        ) : (
          <p>
            O {site.name} não possui conta própria: não há cadastro na {site.developer} a ser excluído. Use as seções
            anteriores para remover dados locais, dispositivos e permissões.
          </p>
        )}
      </DocSection>

      <DocSection id="sem-acesso" title="Não consegue acessar o app?">
        <p>
          A conta do Lumi é anônima e fica vinculada ao app instalado. Se você não tem mais o iPhone ou já removeu o app,
          não há e-mail ou telefone que permita à {site.developer} localizar a sua conta. Nesse caso, resetar as lâmpadas
          (conforme o manual do fabricante) as desvincula da conta antiga. Para dúvidas, escreva para{" "}
          <ContactEmail kind="privacy" subject="Exclusão de conta — Lumi" />.
        </p>
      </DocSection>

      <DocSection id="o-que-permanece" title="O que pode permanecer">
        <ul>
          <li>
            <strong>Obrigações legais:</strong> registros que a lei exija guardar, pelo prazo exigido, e mensagens de
            suporte necessárias para defesa em reclamações (ver{" "}
            <Link href={`${routes.privacy}#retencao`}>Retenção</Link>).
          </li>
          <li>
            <strong>Serviços externos:</strong> dados mantidos pela Apple (HomeKit, App Store) e cópias de segurança da
            Tuya seguem as políticas e prazos desses provedores.
          </li>
          <li>
            <strong>Backups do iPhone:</strong> backups do iCloud ou do computador feitos antes da exclusão podem conter
            dados locais do Lumi até serem substituídos ou apagados.
          </li>
        </ul>
      </DocSection>
    </LegalPage>
  );
}
