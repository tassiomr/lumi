import Link from "next/link";
import { AppStoreButton } from "@/components/AppStoreButton";
import { Container } from "@/components/Container";
import { type Feature, FeatureGrid } from "@/components/FeatureGrid";
import { LumiMark } from "@/components/LumiMark";
import { PhoneMockup } from "@/components/PhoneMockup";
import { CapabilityBadge } from "@/components/StatusBadge";
import { hasTrMediaBackend } from "@/lib/capabilities";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

const features: Feature[] = [
  {
    title: "Controle inteligente",
    body: "Ligue, desligue e ajuste suas lâmpadas em uma única interface, organizada por ambiente.",
    capability: "lightControl",
    icon: "power",
  },
  {
    title: "Iluminação personalizada",
    body: "Controle brilho, cores e temperatura de branco — conforme o que cada lâmpada oferece.",
    capability: "colorAndTemperature",
    icon: "palette",
  },
  {
    title: "Cenas",
    body: "Crie ambientes para cada momento: trabalhar, relaxar, receber amigos ou dormir.",
    capability: "scenes",
    icon: "scene",
  },
  {
    title: "Integrações",
    body: "Use acessórios do Apple HomeKit e dispositivos da plataforma Tuya. A compatibilidade depende do dispositivo e do serviço conectado.",
    capability: "tuya",
    icon: "link",
  },
  {
    title: "Automações",
    body: "Rotinas e agendamentos para que a luz acompanhe seu dia, quando suportados pelo dispositivo.",
    capability: "automations",
    icon: "clock",
  },
  {
    title: "Experiência nativa",
    body: "Feito em SwiftUI para o iPhone, com Modo Escuro, Dynamic Type e VoiceOver.",
    capability: "nativeExperience",
    icon: "apple",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="glow-backdrop relative overflow-hidden">
        <Container className="grid items-center gap-14 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-elevated/70 py-1 pl-1 pr-3.5 text-sm text-muted backdrop-blur">
              <LumiMark size={24} />
              Para iPhone · por {site.developer}
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Lumi.
              <br />
              <span className="text-gradient">Sua iluminação, do seu jeito.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{site.description}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <AppStoreButton />
              <Link href="#funcionalidades" className="text-sm font-medium text-muted hover:text-fg">
                Conheça os recursos ↓
              </Link>
            </div>
          </div>
          <PhoneMockup />
        </Container>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" aria-labelledby="funcionalidades-titulo" className="scroll-mt-20 py-20 sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-accent">Funcionalidades</p>
            <h2 id="funcionalidades-titulo" className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Luz certa, sem complicação.
            </h2>
            <p className="mt-4 text-lg text-muted">
              Tudo o que você precisa para controlar a iluminação da casa, em um app pensado para o iPhone.
            </p>
          </div>
          <div className="mt-12">
            <FeatureGrid features={features} />
          </div>
        </Container>
      </section>

      {/* Integrações */}
      <section aria-labelledby="integracoes-titulo" className="py-8 sm:py-12">
        <Container>
          <div className="reveal overflow-hidden rounded-sheet border border-line bg-elevated">
            <div className="grid gap-px bg-line md:grid-cols-2">
              <div className="bg-elevated p-8 sm:p-10">
                <div className="flex items-center justify-between">
                  <h2 id="integracoes-titulo" className="text-2xl font-semibold tracking-tight">Apple HomeKit</h2>
                  <CapabilityBadge id="homekit" />
                </div>
                <p className="mt-3 text-muted">
                  Use as lâmpadas que você já adicionou ao app Casa. O Lumi acessa os acessórios pelo framework HomeKit
                  da Apple, com a sua permissão — e você pode revogá-la quando quiser.
                </p>
                <p className="mt-3 text-sm text-muted">
                  Dispositivos Matter adicionados ao app Casa também aparecem pelo HomeKit. <CapabilityBadge id="matterViaHomeKit" />
                </p>
              </div>
              <div className="bg-elevated p-8 sm:p-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight">Tuya</h2>
                  <CapabilityBadge id="tuya" />
                </div>
                <p className="mt-3 text-muted">
                  Pareie lâmpadas da plataforma Tuya direto no Lumi, sem cadastro, e-mail ou senha. A conta anônima e
                  os comandos passam pelos serviços da Tuya; a disponibilidade depende deles.
                </p>
                <p className="mt-3 text-sm">
                  <Link href={routes.compatibility} className="font-medium text-accent hover:underline">
                    Ver compatibilidade →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Privacidade */}
      <section aria-labelledby="privacidade-titulo" className="py-20 sm:py-28">
        <Container className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
          <h2 id="privacidade-titulo" className="reveal text-3xl font-semibold tracking-tight sm:text-4xl">
            Sua casa é sua. <span className="text-gradient">Seus dados também.</span>
          </h2>
          <ul className="reveal space-y-4 text-muted">
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Sem anúncios e sem rastreamento entre apps.
            </li>
            {!hasTrMediaBackend ? (
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                A {site.developer} não mantém servidores que recebam os dados da sua casa. Os dados do HomeKit ficam com a
                Apple; os da conta Tuya são tratados pela Tuya.
              </li>
            ) : null}
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                Explicamos com clareza o que é tratado, por quem e como remover.{" "}
                <Link href={routes.privacy} className="font-medium text-accent hover:underline">
                  Política de Privacidade
                </Link>
              </span>
            </li>
          </ul>
        </Container>
      </section>

      {/* Download */}
      <section id="download" aria-labelledby="download-titulo" className="scroll-mt-20">
        <Container>
          <div className="reveal relative overflow-hidden rounded-sheet bg-gradient-to-br from-primary to-highlight px-6 py-16 text-center text-on-primary sm:px-12">
            <div aria-hidden="true" className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-primary/30 blur-3xl" />
            <div className="relative">
              <LumiMark size={64} className="mx-auto rounded-card shadow-2xl shadow-black/30" />
              <h2 id="download-titulo" className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
                Acenda o Lumi no seu iPhone.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-on-primary/80">
                {site.appStoreUrl ? "Disponível na App Store." : "Em breve na App Store."}
              </p>
              <div className="mt-8 flex justify-center [&_a]:bg-bg [&_a]:text-fg [&>span>span]:border-on-primary/30">
                <AppStoreButton />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
