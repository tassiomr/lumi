import Link from "next/link";
import { AppStoreButton } from "@/components/AppStoreButton";
import { Container } from "@/components/Container";
import { LumiMark } from "@/components/LumiMark";
import { PhoneMockup } from "@/components/PhoneMockup";
import { type CapabilityId, capabilities } from "@/lib/capabilities";
import { pageMetadata } from "@/lib/metadata";
import { legalNav, routes } from "@/lib/routes";
import { site } from "@/lib/site";

export const metadata = {
  ...pageMetadata({
    title: "Your lighting, your way",
    description:
      "Lumi by TR Media changes the way you control your smart lights. A simple, elegant and intuitive experience built for iPhone.",
    path: "/en",
    locale: "en_US",
  }),
  alternates: { canonical: "/en", languages: { "pt-BR": "/", en: "/en" } },
};

const features: { title: string; body: string; capability: CapabilityId }[] = [
  { title: "Smart control", body: "Turn lights on and off and adjust them from a single interface.", capability: "lightControl" },
  { title: "Personal lighting", body: "Brightness, color and white temperature — as supported by each bulb.", capability: "colorAndTemperature" },
  { title: "Scenes", body: "Create moods for every moment of your day.", capability: "scenes" },
  { title: "Integrations", body: "Apple HomeKit accessories and Tuya-platform devices. Compatibility depends on the device and service.", capability: "tuya" },
  { title: "Automations", body: "Routines and schedules, where supported.", capability: "automations" },
  { title: "Native experience", body: "Built in SwiftUI for iPhone.", capability: "nativeExperience" },
];

const enStatus = { available: null, unconfirmed: "In validation", planned: "Coming soon" } as const;

export default function EnglishHome() {
  return (
    <div lang="en">
      <section className="glow-backdrop overflow-hidden">
        <Container className="grid items-center gap-14 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-elevated/70 py-1 pl-1 pr-3.5 text-sm text-muted">
              <LumiMark size={24} />
              For iPhone · by {site.developer}
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
              Lumi.
              <br />
              <span className="text-gradient">Your lighting, your way.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Change the way you control your smart lights. A simple, elegant and intuitive experience, built for your
              iPhone.
            </p>
            <div className="mt-9">
              <AppStoreButton locale="en" />
            </div>
          </div>
          <PhoneMockup />
        </Container>
      </section>

      <section aria-labelledby="features-en" className="py-20">
        <Container>
          <h2 id="features-en" className="text-3xl font-semibold tracking-tight sm:text-4xl">Features</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const badge = enStatus[capabilities[f.capability].status];
              return (
                <li key={f.title} className="rounded-3xl border border-line bg-elevated p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    {badge ? (
                      <span className="rounded-full bg-violet-500/12 px-2.5 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-300">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-muted">{f.body}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="legal-en">
        <Container>
          <div className="rounded-3xl border border-line bg-elevated p-6 sm:p-8">
            <h2 id="legal-en" className="text-xl font-semibold">Support & legal</h2>
            <p className="mt-2 text-muted">
              Our support center and legal documents are currently available in Brazilian Portuguese.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {[{ label: "Suporte (Support)", href: routes.support }, ...legalNav].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} hrefLang="pt-BR" className="font-medium text-electric-500 hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </div>
  );
}
