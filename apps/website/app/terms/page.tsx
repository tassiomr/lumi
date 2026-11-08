import Link from "next/link";
import { ContactEmail } from "@/components/Contact";
import { DocSection, LegalPage, type TocItem } from "@/components/LegalPage";
import { legalVersions } from "@/lib/legal";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Termos de Uso",
  description: "Condições de uso do aplicativo Lumi, da TR Media: integrações, responsabilidades, disponibilidade e direitos do consumidor.",
  path: routes.terms,
});

const toc: TocItem[] = [
  { id: "aceite", title: "1. Aceite" },
  { id: "descricao", title: "2. O que é o Lumi" },
  { id: "requisitos", title: "3. Requisitos" },
  { id: "conta", title: "4. Conta" },
  { id: "integracoes", title: "5. Integrações" },
  { id: "uso", title: "6. Uso adequado" },
  { id: "disponibilidade", title: "7. Disponibilidade" },
  { id: "limitacoes", title: "8. Limitações técnicas" },
  { id: "atualizacoes", title: "9. Atualizações" },
  { id: "precos", title: "10. Preços" },
  { id: "propriedade", title: "11. Propriedade intelectual" },
  { id: "responsabilidade", title: "12. Responsabilidade" },
  { id: "encerramento", title: "13. Encerramento" },
  { id: "modificacoes", title: "14. Modificações" },
  { id: "lei", title: "15. Legislação e foro" },
  { id: "contato", title: "16. Contato" },
];

export default function TermsPage() {
  const v = legalVersions.terms;
  return (
    <LegalPage
      eyebrow="Legal"
      title="Termos de Uso"
      intro={<>Estes termos regem o uso do aplicativo {site.name}, desenvolvido pela {site.developer}.</>}
      version={v.version}
      updated={v.updated}
      toc={toc}
    >
      <DocSection id="aceite" title="1. Aceite">
        <p>
          Ao baixar ou usar o {site.name}, você concorda com estes Termos e com a{" "}
          <Link href={routes.privacy}>Política de Privacidade</Link>. Se não concordar, não use o aplicativo. O uso
          também está sujeito aos termos da App Store da Apple.
        </p>
        <p>
          Nada nestes Termos limita os direitos que você tem como consumidor pelo Código de Defesa do Consumidor (Lei nº
          8.078/1990) ou por outras normas obrigatórias.
        </p>
      </DocSection>

      <DocSection id="descricao" title="2. O que é o Lumi">
        <p>
          O {site.name} é um aplicativo para iPhone que permite controlar lâmpadas e outros dispositivos de iluminação
          inteligente por meio de integrações com serviços de terceiros, como o Apple HomeKit e a plataforma Tuya. O Lumi
          não fabrica nem vende os dispositivos e não opera esses serviços.
        </p>
      </DocSection>

      <DocSection id="requisitos" title="3. Requisitos de compatibilidade">
        <ul>
          <li>Um iPhone com a versão do iOS indicada na página do app na App Store.</li>
          <li>Conexão à internet para criar a conta, sincronizar dispositivos e usar serviços de nuvem.</li>
          <li>Dispositivos compatíveis com uma das integrações suportadas e devidamente configurados.</li>
          <li>Para o HomeKit, uma casa configurada no app Casa e, para alguns recursos, uma central da casa.</li>
        </ul>
        <p>
          Nem todo dispositivo oferece todas as funções. Consulte a página de{" "}
          <Link href={routes.compatibility}>Compatibilidade</Link>.
        </p>
      </DocSection>

      <DocSection id="conta" title="4. Conta do Lumi">
        <p>
          Para usar dispositivos Tuya, o Lumi cria automaticamente uma conta anônima, armazenada na plataforma Tuya, sem
          e-mail nem senha. A conta fica vinculada ao app instalado no seu iPhone: se o app for removido sem excluir a
          conta, ela não poderá ser recuperada e as lâmpadas precisarão ser resetadas. Você é responsável pelo uso do
          aparelho em que o Lumi está instalado. Você pode excluir a conta a qualquer momento — veja{" "}
          <Link href={routes.deleteAccount}>Exclusão de Conta e Dados</Link>.
        </p>
      </DocSection>

      <DocSection id="integracoes" title="5. Integrações com serviços de terceiros">
        <p>
          O funcionamento do Lumi depende de serviços e APIs de terceiros, como Apple HomeKit e Tuya, que têm termos e
          políticas próprios. A {site.developer} não controla esses serviços e não responde por alterações, interrupções ou
          descontinuações decididas por eles, nem pelo funcionamento dos dispositivos de outros fabricantes.
        </p>
        <p>
          Se um provedor alterar ou encerrar uma integração, funções do Lumi podem ficar limitadas ou indisponíveis.
          Faremos esforços razoáveis para informar mudanças relevantes com antecedência.
        </p>
      </DocSection>

      <DocSection id="uso" title="6. Uso adequado">
        <p>Ao usar o Lumi, você concorda em:</p>
        <ul>
          <li>controlar apenas dispositivos que lhe pertencem ou que você está autorizado a usar;</li>
          <li>não tentar acessar contas, dispositivos ou sistemas de terceiros sem autorização;</li>
          <li>não fazer engenharia reversa, contornar proteções ou usar o app para fins ilícitos;</li>
          <li>
            não usar o Lumi como único meio de controle em situações críticas de segurança, saúde ou proteção patrimonial;
          </li>
          <li>seguir as instruções de instalação e segurança elétrica dos fabricantes dos dispositivos.</li>
        </ul>
      </DocSection>

      <DocSection id="disponibilidade" title="7. Disponibilidade do serviço">
        <p>
          Trabalhamos para manter o Lumi estável, mas <strong>não garantimos funcionamento ininterrupto ou livre de
          falhas</strong>. O serviço pode ficar indisponível por manutenção, falhas de conexão, instabilidade dos
          provedores, limitações do dispositivo ou da rede, entre outros motivos.
        </p>
      </DocSection>

      <DocSection id="limitacoes" title="8. Limitações técnicas">
        <ul>
          <li>As funções disponíveis dependem do modelo, do firmware e da integração de cada dispositivo.</li>
          <li>O controle remoto depende de internet e dos servidores do provedor.</li>
          <li>Pode haver atraso entre um comando e a resposta do dispositivo.</li>
          <li>Automações e agendamentos, quando disponíveis, dependem do suporte do dispositivo e do provedor.</li>
        </ul>
      </DocSection>

      <DocSection id="atualizacoes" title="9. Atualizações do aplicativo">
        <p>
          Podemos lançar atualizações para corrigir falhas, melhorar a segurança ou adicionar e alterar funções. Algumas
          funções podem exigir a versão mais recente do app ou do iOS. Não removeremos, sem aviso prévio, funções pelas
          quais você tenha pago.
        </p>
      </DocSection>

      <DocSection id="precos" title="10. Funções gratuitas e serviços pagos">
        <p>
          O preço do Lumi, se houver, é informado na App Store. Caso venham a ser oferecidos recursos pagos, como compras
          dentro do app ou assinaturas, preço, periodicidade e condições serão exibidos antes da compra, que é processada
          pela Apple. Cancelamentos e reembolsos seguem as regras da App Store, sem prejuízo dos seus direitos como
          consumidor.
        </p>
      </DocSection>

      <DocSection id="propriedade" title="11. Propriedade intelectual">
        <p>
          O aplicativo, a marca {site.name}, o logotipo, a interface e os textos pertencem à {site.developer} ou a seus
          licenciantes. Concedemos a você uma licença pessoal, não exclusiva e intransferível para usar o app em
          dispositivos Apple que você controla, conforme as regras da App Store. Apple, HomeKit, Tuya e outras marcas
          citadas pertencem aos seus titulares.
        </p>
      </DocSection>

      <DocSection id="responsabilidade" title="12. Responsabilidade">
        <p>
          A {site.developer} responde pelos danos causados por falhas do aplicativo nos termos da legislação aplicável. Não
          respondemos por danos causados exclusivamente por terceiros — como fabricantes de dispositivos, provedores de
          integração, operadoras de internet — ou pelo uso do app em desacordo com estes Termos, na medida permitida por
          lei.
        </p>
      </DocSection>

      <DocSection id="encerramento" title="13. Encerramento">
        <p>
          Você pode deixar de usar o Lumi e excluir sua conta a qualquer momento. Podemos suspender o acesso de quem violar
          estes Termos de forma grave, mediante comunicação, quando possível.
        </p>
      </DocSection>

      <DocSection id="modificacoes" title="14. Modificações dos termos">
        <p>
          Podemos atualizar estes Termos. A versão vigente e a data aparecem no topo desta página. Mudanças relevantes
          serão comunicadas com antecedência razoável; se você não concordar, poderá deixar de usar o app e excluir sua
          conta.
        </p>
      </DocSection>

      <DocSection id="lei" title="15. Legislação aplicável e foro">
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Para consumidores, fica eleito o foro do
          seu domicílio.
          {site.jurisdictionCity
            ? ` Para os demais casos, fica eleito o foro da comarca de ${site.jurisdictionCity}.`
            : null}
        </p>
      </DocSection>

      <DocSection id="contato" title="16. Contato">
        <p>
          Dúvidas sobre estes Termos: <ContactEmail kind="support" subject="Termos de Uso — Lumi" />.
        </p>
      </DocSection>
    </LegalPage>
  );
}
