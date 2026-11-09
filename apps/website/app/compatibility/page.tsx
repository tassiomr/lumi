import Link from "next/link";
import { Container } from "@/components/Container";
import { CapabilityBadge } from "@/components/StatusBadge";
import type { CapabilityId } from "@/lib/capabilities";
import { type CompatStatus, type TestedDevice, compatStatusInfo, devicesFor } from "@/lib/compatibility";
import { formatDate } from "@/lib/legal";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Compatibilidade",
  description: "Integrações e dispositivos compatíveis com o Lumi: Apple HomeKit, Matter, Tuya e modelos Elgin testados pela TR Media.",
  path: routes.compatibility,
});

const statusStyle: Record<CompatStatus, string> = {
  tested: "bg-success-subtle text-success",
  partial: "bg-warning-subtle text-warning",
  untested: "bg-tertiary text-muted",
  unsupported: "bg-error-subtle text-error",
};

function StatusPill({ status }: { status: CompatStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[status]}`}>
      {compatStatusInfo[status].label}
    </span>
  );
}

function DeviceTable({ devices, empty }: { devices: TestedDevice[]; empty: string }) {
  if (devices.length === 0) {
    return <p className="mt-4 rounded-card border border-dashed border-line p-5 text-sm text-muted">{empty}</p>;
  }
  return (
    <div className="mt-4 overflow-x-auto rounded-card border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-fg/[0.03]">
          <tr>
            <th scope="col" className="p-3 font-semibold">Marca e modelo</th>
            <th scope="col" className="p-3 font-semibold">Situação</th>
            <th scope="col" className="p-3 font-semibold">Funções</th>
            <th scope="col" className="p-3 font-semibold">Testado em</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={`${d.brand}-${d.model}-${d.integration}`} className="border-t border-line align-top">
              <td className="p-3">
                <span className="font-medium">{d.brand} {d.model}</span>
                {d.notes ? <span className="mt-1 block text-muted">{d.notes}</span> : null}
              </td>
              <td className="p-3"><StatusPill status={d.status} /></td>
              <td className="p-3 text-muted">{d.features.join(", ")}</td>
              <td className="p-3 text-muted">
                {formatDate(d.testedOn)}
                <span className="block text-xs">Lumi {d.appVersion}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Integration({
  id,
  title,
  capability,
  children,
  devices,
  empty,
}: {
  id: string;
  title: string;
  capability: CapabilityId;
  children: React.ReactNode;
  devices: TestedDevice[];
  empty: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="scroll-mt-24 rounded-card border border-line bg-elevated p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id={`${id}-t`} className="text-2xl font-semibold tracking-tight">{title}</h2>
        <CapabilityBadge id={capability} />
      </div>
      <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
      <DeviceTable devices={devices} empty={empty} />
    </section>
  );
}

export default function CompatibilityPage() {
  const noTests = "Ainda não há modelos testados registrados para esta integração.";
  return (
    <Container className="pt-14 sm:pt-20">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-accent">Compatibilidade</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">O que funciona com o Lumi</h1>
        <p className="mt-4 text-lg text-muted">
          O {site.name} controla dispositivos por meio de integrações. A compatibilidade depende da integração, do modelo e
          do firmware de cada dispositivo — não há compatibilidade universal com nenhuma marca.
        </p>
      </div>

      <section aria-labelledby="legenda" className="mt-10">
        <h2 id="legenda" className="sr-only">Legenda</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(compatStatusInfo) as CompatStatus[]).map((s) => (
            <div key={s} className="rounded-card border border-line p-4">
              <dt><StatusPill status={s} /></dt>
              <dd className="mt-2 text-sm text-muted">{compatStatusInfo[s].description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10 grid gap-6">
        <Integration
          id="homekit"
          title="Apple HomeKit"
          capability="homekit"
          devices={devicesFor((d) => d.integration === "HomeKit")}
          empty={noTests}
        >
          <p>
            Lâmpadas e acessórios de iluminação oficialmente compatíveis com o HomeKit (com o selo “Works with Apple
            Home”) e já adicionados ao app Casa. O Lumi usa as funções que o acessório expõe ao HomeKit: liga/desliga,
            brilho, cor e temperatura, quando disponíveis.
          </p>
        </Integration>

        <Integration
          id="matter"
          title="Matter"
          capability="matterViaHomeKit"
          devices={devicesFor((d) => d.integration === "Matter")}
          empty={noTests}
        >
          <p>
            Dispositivos Matter funcionam com o Lumi <strong>depois de adicionados ao app Casa</strong>, pois passam a ser
            acessados pelo HomeKit. O Lumi não faz o pareamento Matter diretamente.
          </p>
        </Integration>

        <Integration
          id="tuya"
          title="Tuya"
          capability="tuya"
          devices={devicesFor((d) => d.integration === "Tuya" && d.brand.toLowerCase() !== "elgin")}
          empty={noTests}
        >
          <p>
            Dispositivos de iluminação da plataforma Tuya adicionados à sua conta do Lumi. Muitas marcas usam essa
            plataforma; a disponibilidade de cada função depende do que o fabricante disponibiliza na integração autorizada.
          </p>
          <p>Dispositivos que só funcionam com apps próprios do fabricante, fora da plataforma Tuya, não são suportados.</p>
        </Integration>

        <Integration
          id="elgin"
          title="Elgin"
          capability="tuya"
          devices={devicesFor((d) => d.brand.toLowerCase() === "elgin")}
          empty="Nenhum modelo Elgin foi testado e confirmado até o momento. Não declaramos compatibilidade com a linha Elgin enquanto os testes não forem registrados aqui."
        >
          <p>
            Alguns produtos de casa inteligente da Elgin podem funcionar pelas integrações acima. Listamos aqui apenas os
            modelos testados pela {site.developer}, com a versão do Lumi usada no teste.
          </p>
        </Integration>
      </div>

      <p className="mt-10 max-w-3xl text-muted">
        Testou um dispositivo que não está na lista?{" "}
        <Link href={`${routes.support}#contato`} className="font-medium text-accent hover:underline">
          Conte para o suporte
        </Link>{" "}
        — incluindo marca, modelo e integração.
      </p>
    </Container>
  );
}
