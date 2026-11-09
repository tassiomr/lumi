import Link from "next/link";
import { ContactCard } from "@/components/Contact";
import { Container } from "@/components/Container";
import { FaqItem } from "@/components/Faq";
import { CapabilityBadge } from "@/components/StatusBadge";
import { isAvailable } from "@/lib/capabilities";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Suporte",
  description: "Central de suporte do Lumi: como conectar lâmpadas, usar HomeKit e Tuya, criar cenas, resolver problemas e falar com a TR Media.",
  path: routes.support,
});

type Guide = { id: string; title: string; steps: React.ReactNode[]; note?: React.ReactNode };

const guides: Guide[] = [
  {
    id: "conectar-lampada",
    title: "Conectar uma lâmpada",
    steps: [
      <>Confira se a lâmpada é compatível com o HomeKit (ou Matter) ou com a plataforma Tuya.</>,
      <>
        <strong>HomeKit/Matter:</strong> adicione a lâmpada no app Casa da Apple, escaneando o código de configuração. Ela
        aparecerá no Lumi automaticamente.
      </>,
      <>
        <strong>Tuya:</strong> toque em <em>+</em> › <em>Lâmpada Tuya (Wi‑Fi)</em>. Coloque a lâmpada em modo AP (ela pisca
        devagar), informe a sua rede Wi‑Fi de 2,4 GHz e conecte o iPhone à rede temporária da lâmpada quando o app pedir.
      </>,
      <>Mantenha o iPhone próximo à lâmpada durante o pareamento, que pode levar até 2 minutos.</>,
    ],
  },
  {
    id: "tuya",
    title: "Usar dispositivos Tuya",
    steps: [
      <>Não há cadastro: ao adicionar a primeira lâmpada Tuya, o Lumi cria uma conta anônima automaticamente.</>,
      <>
        A conta fica vinculada ao app neste iPhone. Se você apagar o Lumi, as lâmpadas Tuya precisarão ser resetadas e
        pareadas de novo — para sair de forma limpa, use <em>Excluir conta</em> antes.
      </>,
      <>
        A conta do Lumi é separada das contas Smart Life e Tuya Smart. Para trazer uma lâmpada de lá, remova-a do outro
        app e pareie-a no Lumi.
      </>,
    ],
  },
  {
    id: "homekit",
    title: "Usar o HomeKit",
    steps: [
      <>Ao abrir o Lumi pela primeira vez, permita o acesso aos dados da Casa.</>,
      <>Os acessórios, cômodos e cenas do app Casa passam a aparecer no Lumi.</>,
      <>
        Para controlar fora de casa, configure uma central da casa (Apple TV ou HomePod) no app Casa.
      </>,
      <>
        Se você negou o acesso, ative-o em <em>Ajustes › Privacidade e Segurança › Dados da Casa › Lumi</em>.
      </>,
    ],
  },
  {
    id: "ambientes",
    title: "Configurar ambientes",
    steps: [
      <>Ambientes do HomeKit seguem os cômodos definidos no app Casa — renomeie ou reorganize por lá.</>,
      <>Para lâmpadas Tuya, abra a lâmpada no Lumi e preencha o campo <em>Ambiente</em> (ex.: Sala).</>,
    ],
  },
  {
    id: "cenas",
    title: "Criar cenas",
    steps: [
      <>Ajuste as lâmpadas do jeito que quiser — ligadas, brilho, cor ou temperatura.</>,
      <>Salve como uma cena e dê um nome, como “Leitura” ou “Filme”.</>,
      <>Toque na cena para aplicá-la a todas as lâmpadas de uma vez.</>,
    ],
    note: <CapabilityBadge id="scenes" />,
  },
  {
    id: "conexao",
    title: "Resolver problemas de conexão",
    steps: [
      <>Confira se a lâmpada está energizada (interruptor ligado) e se responde no app do fabricante.</>,
      <>Verifique se o iPhone tem internet e, para controle local, se está na mesma rede Wi‑Fi.</>,
      <>Para Tuya, confirme a permissão de <em>Rede Local</em> em <em>Ajustes › Lumi</em>.</>,
      <>Para HomeKit fora de casa, confirme que a central da casa está ligada e conectada.</>,
      <>Feche e abra o Lumi. Se persistir, desligue a lâmpada por 10 segundos e ligue novamente.</>,
      <>Como último recurso, remova o dispositivo e adicione-o de novo.</>,
    ],
  },
  {
    id: "atualizar",
    title: "Atualizar dispositivos",
    steps: [
      <>
        <strong>HomeKit:</strong> atualizações de firmware aparecem no app Casa ou no app do fabricante.
      </>,
      <>
        <strong>Tuya:</strong> atualizações de firmware são disponibilizadas pelo fabricante pela plataforma Tuya; mantenha
        a lâmpada ligada e conectada durante o processo.
      </>,
      <>Mantenha o Lumi e o iOS atualizados pela App Store.</>,
    ],
  },
  {
    id: "permissoes",
    title: "Revogar permissões",
    steps: [
      <>Abra <em>Ajustes › Lumi</em> no iPhone.</>,
      <>Desative Dados da Casa ou Rede Local, conforme desejar.</>,
      <>Sem uma permissão, as funções que dependem dela deixam de funcionar até você reativá-la.</>,
    ],
    note: (
      <Link href={routes.privacyChoices} className="text-sm font-medium text-accent hover:underline">
        Mais em Preferências de Privacidade →
      </Link>
    ),
  },
];

export default function SupportPage() {
  return (
    <Container className="pt-14 sm:pt-20">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-accent">Central de suporte</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Como podemos ajudar?</h1>
        <p className="mt-4 text-lg text-muted">
          Guias rápidos para começar a usar o {site.name}, respostas para dúvidas comuns e um canal direto com a{" "}
          {site.developer}.
        </p>
      </div>

      <nav aria-label="Guias" className="mt-10 flex flex-wrap gap-2">
        {guides.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted hover:border-primary hover:text-fg">
            {g.title}
          </a>
        ))}
        <a href="#faq" className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted hover:border-primary hover:text-fg">
          Perguntas frequentes
        </a>
        <a href="#contato" className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted hover:border-primary hover:text-fg">
          Contato
        </a>
      </nav>

      <section aria-label="Guias" className="mt-12 grid gap-4 md:grid-cols-2">
        {guides.map((g) => (
          <article key={g.id} id={g.id} className="scroll-mt-24 rounded-card border border-line bg-elevated p-6 sm:p-7">
            <h2 className="text-lg font-semibold tracking-tight">{g.title}</h2>
            <ol className="mt-4 space-y-2.5 text-muted">
              {g.steps.map((step, i) => (
                <li key={i} className="flex gap-3 leading-relaxed">
                  <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-selected text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {g.note ? <div className="mt-4">{g.note}</div> : null}
          </article>
        ))}
      </section>

      <section id="faq" aria-labelledby="faq-titulo" className="mt-20 max-w-3xl scroll-mt-24">
        <h2 id="faq-titulo" className="text-3xl font-semibold tracking-tight">Perguntas frequentes</h2>
        <div className="mt-6 border-t border-line">
          <FaqItem question="O Lumi funciona com qualquer lâmpada inteligente?">
            <p>
              Não. O Lumi funciona com dispositivos acessíveis pelas integrações suportadas: acessórios do Apple HomeKit
              (incluindo Matter adicionados ao app Casa) e dispositivos da plataforma Tuya. Mesmo nesses casos, as funções
              dependem do modelo. Veja a <Link href={routes.compatibility}>página de compatibilidade</Link>.
            </p>
          </FaqItem>
          <FaqItem question="Preciso de uma conta Tuya?">
            <p>
              Não. O Lumi não pede e-mail, telefone nem senha. Para lâmpadas Tuya, o app cria automaticamente uma conta
              anônima na nuvem da Tuya; sua conta Smart Life ou Tuya Smart não é usada. Para acessórios HomeKit, nenhuma
              conta é criada: basta permitir o acesso aos dados da Casa.
            </p>
          </FaqItem>
          <FaqItem question="O aplicativo funciona sem internet?">
            <p>
              <strong>HomeKit:</strong> em casa, na mesma rede, os acessórios costumam responder sem internet, pois a
              comunicação é local. Fora de casa é preciso internet e uma central da casa.
            </p>
            <p>
              <strong>Tuya:</strong> o login, a lista de dispositivos e o controle remoto dependem da nuvem da Tuya. Alguns
              dispositivos aceitam comandos pela rede local quando o iPhone está no mesmo Wi‑Fi, mas isso varia por modelo.{" "}
              <CapabilityBadge id="tuyaLocalControl" />
            </p>
          </FaqItem>
          <FaqItem question="Posso usar o Lumi com a Siri?">
            <p>
              Acessórios do HomeKit podem ser controlados pela Siri por meio do app Casa da Apple, independentemente do
              Lumi — por exemplo, “E aí Siri, apague as luzes da sala”.
            </p>
            {isAvailable("siriShortcuts") ? (
              <p>O Lumi também oferece ações no app Atalhos que podem ser usadas pela Siri.</p>
            ) : (
              <p>
                Comandos e atalhos próprios do Lumi na Siri ainda não estão disponíveis. <CapabilityBadge id="siriShortcuts" />
              </p>
            )}
          </FaqItem>
          <FaqItem question="Como remover uma lâmpada?">
            <p>
              <strong>HomeKit:</strong> no app Casa, abra o acessório, toque em Ajustes e escolha <em>Remover Acessório</em>.
              Ele deixará de aparecer no Lumi.
            </p>
            <p>
              <strong>Tuya:</strong> no Lumi, abra o dispositivo, acesse os ajustes dele e escolha <em>Remover
              dispositivo</em>. A lâmpada sai da sua conta e pode ser pareada novamente.
            </p>
          </FaqItem>
          <FaqItem question="O Lumi funciona com lâmpadas Elgin?">
            <p>
              Alguns modelos podem funcionar pelas integrações suportadas, mas não declaramos compatibilidade com toda a
              linha. Consulte os modelos testados em <Link href={routes.compatibility}>Compatibilidade</Link>.
            </p>
          </FaqItem>
          <FaqItem question="Como excluo minha conta e meus dados?">
            <p>
              Veja o passo a passo em <Link href={routes.deleteAccount}>Exclusão de Conta e Dados</Link>.
            </p>
          </FaqItem>
        </div>
      </section>

      <section id="contato" aria-label="Contato" className="mt-20 max-w-3xl scroll-mt-24">
        <ContactCard kind="support" subject="Suporte — Lumi" title="Fale com o suporte">
          <p>
            Envie sua dúvida com o modelo do iPhone, a versão do iOS e do Lumi (em <em>Configurações › Sobre e Legal</em> no app), a
            marca e o modelo da lâmpada e a integração usada (HomeKit ou Tuya). Não envie senhas.
          </p>
        </ContactCard>
      </section>
    </Container>
  );
}
