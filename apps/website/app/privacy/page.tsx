import Link from "next/link";
import { ContactEmail } from "@/components/Contact";
import { ControllerInfo } from "@/components/ControllerInfo";
import { DocSection, LegalPage, type TocItem } from "@/components/LegalPage";
import { legalVersions } from "@/lib/legal";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Política de Privacidade",
  description:
    "Como o Lumi, da TR Media, trata dados pessoais: HomeKit, conta Tuya, dados locais, bases legais da LGPD, segurança e seus direitos.",
  path: routes.privacy,
});

const toc: TocItem[] = [
  { id: "responsavel", title: "1. Responsável" },
  { id: "resumo", title: "2. Resumo" },
  { id: "dados", title: "3. Dados tratados" },
  { id: "homekit", title: "4. Apple HomeKit" },
  { id: "tuya", title: "5. Tuya" },
  { id: "apple", title: "6. Outros serviços da Apple" },
  { id: "permissoes", title: "7. Permissões do iOS" },
  { id: "finalidades", title: "8. Finalidades e bases legais" },
  { id: "compartilhamento", title: "9. Compartilhamento" },
  { id: "transferencia", title: "10. Transferência internacional" },
  { id: "retencao", title: "11. Retenção" },
  { id: "seguranca", title: "12. Segurança" },
  { id: "direitos", title: "13. Seus direitos" },
  { id: "exclusao", title: "14. Exclusão de dados" },
  { id: "criancas", title: "15. Crianças e adolescentes" },
  { id: "site", title: "16. Este site" },
  { id: "alteracoes", title: "17. Alterações" },
];

export default function PrivacyPage() {
  const v = legalVersions.privacy;
  return (
    <LegalPage
      eyebrow="Legal"
      title="Política de Privacidade"
      intro={
        <>
          Esta política explica quais dados pessoais o aplicativo {site.name} trata, por que, com quem eles são
          compartilhados e como você pode exercer seus direitos, nos termos da Lei Geral de Proteção de Dados
          (Lei nº 13.709/2018 — LGPD).
        </>
      }
      version={v.version}
      updated={v.updated}
      toc={toc}
    >
      <DocSection id="responsavel" title="1. Quem é o responsável">
        <p>
          O {site.name} é desenvolvido pela {site.developer}, que atua como <strong>controladora</strong> dos dados
          pessoais tratados pelo aplicativo — ou seja, quem decide como e para que eles são usados.
        </p>
        <ControllerInfo />
      </DocSection>

      <DocSection id="resumo" title="2. Resumo">
        <ul>
          <li>
            A {site.developer} <strong>não opera servidores</strong> que recebam os dados do Lumi. Não há anúncios,
            rastreamento entre apps nem ferramentas de analytics de terceiros no aplicativo.
          </li>
          <li>
            <strong>HomeKit:</strong> o Lumi lê e controla seus acessórios pelo framework HomeKit da Apple, no próprio
            iPhone. Esses dados não são enviados à {site.developer} nem a terceiros.
          </li>
          <li>
            <strong>Tuya:</strong> ao adicionar a primeira lâmpada Tuya, o Lumi cria automaticamente uma{" "}
            <strong>conta anônima</strong> na nuvem da Tuya, sem e-mail, telefone ou senha. Os dados dessa conta e dos
            seus dispositivos Tuya <strong>são transmitidos e armazenados pela Tuya</strong>, inclusive fora do Brasil.
          </li>
          <li>
            Preferências, ambientes e cenas criados no Lumi ficam armazenados no seu iPhone.
          </li>
          <li>
            Você pode excluir seus dados a qualquer momento — veja{" "}
            <Link href={routes.deleteAccount}>Exclusão de Conta e Dados</Link>.
          </li>
        </ul>
      </DocSection>

      <DocSection id="dados" title="3. Dados tratados">
        <p>A tabela abaixo lista os dados que o Lumi trata, onde eles ficam e para que servem.</p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th scope="col">Categoria</th>
                <th scope="col">Exemplos</th>
                <th scope="col">Onde fica</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Dados da casa no HomeKit</strong></td>
                <td>Nomes de casas, cômodos, zonas e acessórios; estado das lâmpadas (ligada, brilho, cor); cenas do app Casa.</td>
                <td>No iPhone e nos serviços da Apple (iCloud/central da casa). Não sai do controle da Apple pelo Lumi.</td>
              </tr>
              <tr>
                <td><strong>Conta anônima do Lumi (plataforma Tuya)</strong></td>
                <td>Identificador de usuário gerado pela Tuya, nome de usuário aleatório gerado pelo Lumi e código de país. Nenhum e-mail, telefone, nome ou senha.</td>
                <td>Nuvem da Tuya.</td>
              </tr>
              <tr>
                <td><strong>Sessão da conta</strong></td>
                <td>Dados de sessão da conta anônima.</td>
                <td>No iPhone, mantidos pelo SDK da Tuya.</td>
              </tr>
              <tr>
                <td><strong>Dispositivos e casas na Tuya</strong></td>
                <td>Identificadores dos dispositivos, nomes, casas e cômodos da conta, estado, comandos enviados, versão de firmware, chave de controle local.</td>
                <td>Nuvem da Tuya e, em cache, no iPhone.</td>
              </tr>
              <tr>
                <td><strong>Dados de pareamento</strong></td>
                <td>Nome (SSID) e senha da rede Wi‑Fi digitados por você ao adicionar uma lâmpada Tuya.</td>
                <td>Enviados à lâmpada durante o pareamento, pelo SDK da Tuya. O Lumi não guarda a senha da rede.</td>
              </tr>
              <tr>
                <td><strong>Dados técnicos de conexão</strong></td>
                <td>Endereço IP, modelo do iPhone, versão do iOS e do app, idioma e fuso horário.</td>
                <td>Recebidos pela Tuya ao processar as requisições; não são enviados à {site.developer}.</td>
              </tr>
              <tr>
                <td><strong>Dados locais do Lumi</strong></td>
                <td>Ambientes, cenas, favoritos e preferências de exibição criados no Lumi.</td>
                <td>Somente no iPhone.</td>
              </tr>
              <tr>
                <td><strong>Diagnóstico</strong></td>
                <td>Relatórios de falha e métricas de desempenho.</td>
                <td>Somente se você permitir o compartilhamento com desenvolvedores nos Ajustes do iOS (seção 6). O SDK da Tuya pode registrar dados técnicos de funcionamento (seção 5).</td>
              </tr>
              <tr>
                <td><strong>Contato com o suporte</strong></td>
                <td>Seu e-mail, nome e o conteúdo da mensagem.</td>
                <td>Na caixa de e-mail da {site.developer}.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3>O que o Lumi não coleta</h3>
        <p>
          O Lumi não pede e-mail, telefone, nome ou senha. Não acessa contatos, fotos, microfone, câmera, Bluetooth ou
          localização, e não usa o identificador de publicidade (IDFA). Não há venda de dados pessoais.
        </p>
      </DocSection>

      <DocSection id="homekit" title="4. Apple HomeKit">
        <p>
          Quando você autoriza o acesso aos dados da Casa, o Lumi usa o framework HomeKit da Apple para listar e
          controlar os acessórios já configurados no app Casa — incluindo dispositivos Matter adicionados a ele. Esse
          processamento acontece no iPhone; a comunicação com os acessórios e a sincronização entre aparelhos são feitas
          pela própria Apple.
        </p>
        <p>
          Os dados do HomeKit são usados exclusivamente para exibir e controlar sua iluminação. Conforme as regras da
          Apple, eles <strong>não são usados para publicidade nem para mineração de dados</strong>, não são
          transferidos à {site.developer} nem a terceiros, e não são enviados à Tuya.
        </p>
        <p>
          Os dados da sua casa continuam sendo tratados pela Apple conforme a{" "}
          <a href="https://www.apple.com/br/legal/privacy/" rel="noopener">Política de Privacidade da Apple</a>.
        </p>
      </DocSection>

      <DocSection id="tuya" title="5. Tuya">
        <p>
          A integração com dispositivos da plataforma Tuya — usada por diversas marcas de lâmpadas inteligentes — é feita
          pelo kit de desenvolvimento (SDK) da Tuya incorporado ao aplicativo. Ao adicionar a primeira lâmpada Tuya, o Lumi
          cria automaticamente uma <strong>conta anônima</strong>, sem e-mail, telefone ou senha. Essa conta é{" "}
          <strong>armazenada pela Tuya</strong>, que presta o serviço de nuvem à {site.developer}.
        </p>
        <p>
          <strong>Importante:</strong> a conta anônima fica vinculada ao app instalado neste iPhone e é separada das
          contas dos apps Smart Life ou Tuya Smart. Se você apagar o Lumi, não há como recuperar a conta; as lâmpadas
          precisarão ser resetadas e pareadas de novo. Para usar no Lumi um dispositivo que está em outro app, remova-o
          de lá antes de pareá-lo no Lumi.
        </p>
        <h3>Dados transmitidos à Tuya</h3>
        <ul>
          <li>Dados da conta anônima (identificador de usuário, nome de usuário aleatório e código de país).</li>
          <li>Dados dos dispositivos e das casas cadastradas na conta, comandos e estados.</li>
          <li>Dados técnicos de conexão (endereço IP, modelo do aparelho, versões do sistema e do app).</li>
          <li>Registros técnicos coletados pelo próprio SDK para o funcionamento do serviço.</li>
        </ul>
        <h3>Processamento local</h3>
        <p>
          Quando o iPhone e o dispositivo estão na mesma rede Wi‑Fi e o dispositivo suporta, comandos podem ser enviados
          diretamente pela rede local, sem passar pela nuvem. Mesmo assim, a conta, a lista de dispositivos e a
          sincronização de estado dependem dos servidores da Tuya.
        </p>
        <p>
          A Tuya trata esses dados como operadora para a {site.developer} e também segundo suas próprias políticas,
          disponíveis em{" "}
          <a href="https://www.tuya.com/privacy" rel="noopener">tuya.com/privacy</a>.
        </p>
      </DocSection>

      <DocSection id="apple" title="6. Outros serviços da Apple">
        <p>
          O download e eventuais compras são processados pela App Store, sob responsabilidade da Apple. A {site.developer}{" "}
          não recebe seus dados de pagamento.
        </p>
        <p>
          Se você ativar <em>Ajustes › Privacidade e Segurança › Análise e Melhorias › Compartilhar com Desenvolvedores</em>,
          a Apple pode fornecer à {site.developer} relatórios de falha e métricas de uso agregados, sem identificá-lo
          diretamente. Você pode desativar essa opção a qualquer momento.
        </p>
      </DocSection>

      <DocSection id="permissoes" title="7. Permissões do iOS">
        <p>O Lumi solicita apenas duas permissões, quando você usa o recurso correspondente:</p>
        <ul>
          <li><strong>Dados da Casa (HomeKit):</strong> para listar e controlar seus acessórios.</li>
          <li><strong>Rede local:</strong> para parear, encontrar e controlar dispositivos Tuya na mesma rede Wi‑Fi.</li>
        </ul>
        <p>
          O Lumi não pede acesso a Bluetooth nem à sua localização: o nome da rede Wi‑Fi é digitado por você durante o
          pareamento. Você pode revogar qualquer permissão em <em>Ajustes › Lumi</em>. Veja{" "}
          <Link href={routes.privacyChoices}>Preferências de Privacidade</Link>.
        </p>
      </DocSection>

      <DocSection id="finalidades" title="8. Finalidades e bases legais">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th scope="col">Finalidade</th>
                <th scope="col">Dados</th>
                <th scope="col">Base legal (LGPD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Exibir e controlar suas lâmpadas, ambientes e cenas</td>
                <td>HomeKit, dispositivos Tuya, dados locais</td>
                <td>Execução de contrato — art. 7º, V</td>
              </tr>
              <tr>
                <td>Criar e manter a conta anônima do Lumi na plataforma Tuya</td>
                <td>Dados da conta anônima, sessão</td>
                <td>Execução de contrato — art. 7º, V</td>
              </tr>
              <tr>
                <td>Garantir a segurança e o funcionamento técnico do serviço</td>
                <td>Dados técnicos de conexão, registros técnicos</td>
                <td>Legítimo interesse — art. 7º, IX</td>
              </tr>
              <tr>
                <td>Corrigir falhas e melhorar a estabilidade</td>
                <td>Diagnóstico compartilhado pela Apple</td>
                <td>Consentimento dado nos Ajustes do iOS — art. 7º, I</td>
              </tr>
              <tr>
                <td>Responder solicitações de suporte e de titulares</td>
                <td>Dados de contato e da mensagem</td>
                <td>Execução de contrato e cumprimento de obrigação legal — art. 7º, V e II</td>
              </tr>
              <tr>
                <td>Exercer direitos em processos judiciais ou administrativos</td>
                <td>Registros estritamente necessários</td>
                <td>Exercício regular de direitos — art. 7º, VI</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Não realizamos decisões automatizadas que afetem seus interesses nem criamos perfis para publicidade.
        </p>
      </DocSection>

      <DocSection id="compartilhamento" title="9. Compartilhamento">
        <p>Os dados só são compartilhados nas situações abaixo:</p>
        <ul>
          <li><strong>Tuya</strong> — provedora da nuvem que armazena a conta e opera os dispositivos Tuya (seção 5).</li>
          <li><strong>Apple</strong> — HomeKit, App Store e diagnóstico opcional (seções 4 e 6).</li>
          <li>
            <strong>Autoridades</strong> — quando houver obrigação legal ou ordem judicial, limitado ao necessário.
          </li>
        </ul>
        <p>A {site.developer} não vende, aluga nem compartilha dados pessoais para fins de publicidade.</p>
      </DocSection>

      <DocSection id="transferencia" title="10. Transferência internacional">
        <p>
          A Tuya e a Apple podem armazenar e processar dados em servidores fora do Brasil. A Tuya opera centros de dados
          regionais, e a conta é vinculada ao centro de dados correspondente à região escolhida no cadastro. Essas
          transferências ocorrem para executar o serviço que você solicitou (LGPD, art. 33, IX) e com as garantias
          contratuais oferecidas por esses provedores.
        </p>
      </DocSection>

      <DocSection id="retencao" title="11. Retenção">
        <ul>
          <li><strong>Dados locais do Lumi:</strong> até você excluí-los no app ou remover o aplicativo do iPhone.</li>
          <li><strong>Sessão da conta:</strong> até você excluir a conta ou remover o app.</li>
          <li>
            <strong>Conta anônima e dados de dispositivos na Tuya:</strong> enquanto a conta existir. Ao excluir a
            conta pelo app, a Tuya informa que a conta anônima é removida imediatamente; cópias de segurança seguem os
            prazos da Tuya. Se você apagar o app sem excluir a conta, ela permanece inacessível na Tuya até ser removida
            conforme as regras do provedor.
          </li>
          <li><strong>Dados do HomeKit:</strong> controlados por você e pela Apple, no app Casa.</li>
          <li>
            <strong>Mensagens de suporte:</strong> pelo tempo necessário para atender a solicitação e por até 5 anos
            depois, para defesa em eventuais reclamações de consumo, salvo pedido de exclusão quando não houver
            obrigação de guarda.
          </li>
        </ul>
      </DocSection>

      <DocSection id="seguranca" title="12. Segurança">
        <ul>
          <li>Comunicação com a nuvem da Tuya por conexões criptografadas (TLS).</li>
          <li>Não existem senhas de conta: a conta da Tuya é anônima e não guarda dados de contato.</li>
          <li>Os dados locais do Lumi são gravados com a proteção de arquivos do iOS (criptografados enquanto o iPhone está bloqueado).</li>
          <li>A senha do Wi‑Fi informada no pareamento é usada apenas naquele momento e não é armazenada pelo Lumi.</li>
          <li>O acesso ao HomeKit e à rede local depende de permissões que você controla.</li>
          <li>Nenhuma chave secreta da Tuya é exposta neste site.</li>
        </ul>
        <p>
          Nenhum sistema é totalmente imune a incidentes. Se ocorrer um incidente de segurança que possa causar risco ou
          dano relevante, comunicaremos os titulares afetados e a ANPD, conforme o art. 48 da LGPD.
        </p>
      </DocSection>

      <DocSection id="direitos" title="13. Seus direitos">
        <p>Nos termos do art. 18 da LGPD, você pode solicitar a qualquer momento:</p>
        <ul>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
          <li>portabilidade dos dados a outro fornecedor;</li>
          <li>eliminação dos dados tratados com base no consentimento;</li>
          <li>informação sobre com quem compartilhamos seus dados;</li>
          <li>informação sobre a possibilidade de não consentir e suas consequências;</li>
          <li>revogação do consentimento;</li>
          <li>oposição a tratamento realizado em desconformidade com a lei.</li>
        </ul>
        <p>
          Para exercer seus direitos, escreva para <ContactEmail kind="privacy" subject="LGPD — Solicitação de titular" />.
          Como a conta do Lumi é anônima, a {site.developer} não consegue associar uma conta a você por nome ou e-mail;
          por isso, acesso aos dados e exclusão da conta são feitos diretamente no app. Responderemos a solicitações em
          até 15 dias. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados
          (<a href="https://www.gov.br/anpd" rel="noopener">ANPD</a>).
        </p>
        <p>
          Como a {site.developer} não mantém servidores próprios para o app, parte dos dados (como os da conta na Tuya e
          do HomeKit) é acessada e excluída diretamente pelo app ou pelos serviços desses provedores. Nós orientamos e
          intermediamos o que for necessário.
        </p>
      </DocSection>

      <DocSection id="exclusao" title="14. Exclusão de dados">
        <p>
          Você pode excluir a conta anônima do Lumi dentro do aplicativo, apagar os dados locais, revogar o acesso ao HomeKit e
          remover dispositivos. As instruções completas, incluindo o que é removido e o que depende de outros serviços,
          estão em <Link href={routes.deleteAccount}>Exclusão de Conta e Dados</Link>.
        </p>
      </DocSection>

      <DocSection id="criancas" title="15. Crianças e adolescentes">
        <p>
          O Lumi não é direcionado a crianças. A criação de conta é destinada a maiores de 18 anos ou a adolescentes com
          autorização dos responsáveis. Se você acredita que tratamos dados de uma criança sem o consentimento de um
          responsável, entre em contato para que sejam removidos.
        </p>
      </DocSection>

      <DocSection id="site" title="16. Este site">
        <p>
          Este site não usa cookies, analytics, pixels de rastreamento nem formulários que coletem dados. Ele é hospedado
          pela Vercel, que registra dados técnicos das requisições (como endereço IP e navegador) para entregar as
          páginas e proteger o serviço. Ao clicar em um link de e-mail, sua mensagem é enviada pelo seu próprio
          aplicativo de e-mail.
        </p>
      </DocSection>

      <DocSection id="alteracoes" title="17. Alterações nesta política">
        <p>
          Podemos atualizar esta política quando o Lumi ou a legislação mudarem. A versão e a data da última atualização
          aparecem no topo da página. Mudanças relevantes serão comunicadas no aplicativo ou neste site antes de entrarem em vigor.
        </p>
      </DocSection>
    </LegalPage>
  );
}
