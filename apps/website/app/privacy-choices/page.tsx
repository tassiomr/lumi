import Link from "next/link";
import { ContactCard } from "@/components/Contact";
import { Container } from "@/components/Container";
import { DraftNotice } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Preferências de Privacidade",
  description: "Controle seus dados no Lumi: permissões do iOS, integrações, dados locais e solicitações de acesso, correção e eliminação.",
  path: routes.privacyChoices,
});

type Choice = { title: string; where: string; body: React.ReactNode };

const inDevice: Choice[] = [
  {
    title: "Revogar permissões",
    where: "Ajustes › Lumi",
    body: <>Desative Dados da Casa ou Rede Local. As funções dependentes param até você reativar. O Lumi não usa Bluetooth nem localização.</>,
  },
  {
    title: "Desconectar o HomeKit",
    where: "Ajustes › Privacidade e Segurança › Dados da Casa",
    body: <>Retira o acesso do Lumi à sua casa. Nada é apagado do app Casa.</>,
  },
  {
    title: "Remover lâmpadas Tuya",
    where: "Lumi › lâmpada › Remover dispositivo",
    body: <>Desvincula a lâmpada da conta anônima do Lumi na nuvem da Tuya.</>,
  },
  {
    title: "Excluir informações locais",
    where: "Lumi › Configurações › Sobre e Legal",
    body: <>Apaga ambientes, cenas e preferências salvos no iPhone.</>,
  },
  {
    title: "Diagnóstico compartilhado",
    where: "Ajustes › Privacidade e Segurança › Análise e Melhorias",
    body: <>Desative “Compartilhar com Desenvolvedores” para não enviar relatórios de falha via Apple.</>,
  },
  {
    title: "Excluir a conta",
    where: "Lumi › Configurações › Sobre e Legal",
    body: (
      <>
        Remove a conta do Lumi e os dados dela na Tuya.{" "}
        <Link href={routes.deleteAccount} className="text-electric-500 hover:underline">Detalhes</Link>
      </>
    ),
  },
];

const requests = [
  { title: "Acesso", body: "Saber quais dados seus tratamos e receber uma cópia." },
  { title: "Correção", body: "Corrigir dados incompletos ou desatualizados, como o e-mail da conta." },
  { title: "Eliminação", body: "Apagar dados, inclusive quando você não consegue acessar o app." },
  { title: "Portabilidade", body: "Receber seus dados em formato estruturado." },
  { title: "Informações", body: "Saber com quem compartilhamos e como seus dados são protegidos." },
  { title: "Oposição e revogação", body: "Opor-se a um tratamento ou revogar um consentimento dado." },
];

export default function PrivacyChoicesPage() {
  return (
    <Container className="pt-14 sm:pt-20">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-electric-500">Privacidade</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Preferências de Privacidade</h1>
        <p className="mt-4 text-lg text-muted">
          A maior parte dos seus dados no {site.name} é controlada diretamente no iPhone. Veja onde ajustar cada coisa e
          como fazer solicitações à {site.developer}.
        </p>
        <DraftNotice />
      </div>

      <section aria-labelledby="no-iphone" className="mt-14">
        <h2 id="no-iphone" className="text-2xl font-semibold tracking-tight">No seu iPhone</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inDevice.map((c) => (
            <li key={c.title} className="rounded-3xl border border-line bg-elevated p-6">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm font-medium text-electric-500">{c.where}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{c.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="solicitacoes" className="mt-16">
        <h2 id="solicitacoes" className="text-2xl font-semibold tracking-tight">Solicitações à {site.developer}</h2>
        <p className="mt-2 max-w-3xl text-muted">
          Para os direitos da LGPD que não podem ser exercidos pelo app, envie um e-mail informando o tipo de solicitação.
          Como a conta do Lumi é anônima, não conseguimos localizá-la por e-mail — exclusão da conta e dos dados é feita
          no próprio app. Respondemos em até 15 dias.
        </p>
        <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => (
            <li key={r.title} className="border-t border-line pt-4">
              <h3 className="font-semibold">{r.title}</h3>
              <p className="mt-1 text-sm text-muted">{r.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 max-w-3xl">
          <ContactCard kind="privacy" subject="LGPD — Solicitação de titular" title="Enviar uma solicitação">
            <p>
              A solicitação é enviada pelo seu app de e-mail. Não há formulário neste site, e ele não coleta nenhum dado.
              Detalhes em <Link href={routes.privacy} className="text-electric-500 hover:underline">Política de Privacidade</Link>.
            </p>
          </ContactCard>
        </div>
      </section>

      <section aria-labelledby="rastreamento" className="mt-16 max-w-3xl">
        <h2 id="rastreamento" className="text-2xl font-semibold tracking-tight">Rastreamento e publicidade</h2>
        <p className="mt-2 text-muted">
          O Lumi não rastreia você entre apps e sites de outras empresas, não exibe anúncios e não usa o identificador de
          publicidade. Por isso, não há opção de rastreamento a ativar ou desativar. Este site também não usa cookies.
        </p>
      </section>
    </Container>
  );
}
