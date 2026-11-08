import { mailto, site } from "@/lib/site";
import { Pending } from "./Pending";

type Kind = "support" | "privacy";

export function ContactEmail({ kind, subject }: { kind: Kind; subject: string }) {
  const email = kind === "privacy" ? site.privacyEmail : site.supportEmail;
  if (!email) {
    return <Pending>{kind === "privacy" ? "e-mail de privacidade" : "e-mail de suporte"}</Pending>;
  }
  return (
    <a href={mailto(email, subject)} className="font-medium text-electric-500 underline underline-offset-4">
      {email}
    </a>
  );
}

export function ContactCard({
  kind,
  subject,
  title,
  children,
}: {
  kind: Kind;
  subject: string;
  title: string;
  children: React.ReactNode;
}) {
  const email = kind === "privacy" ? site.privacyEmail : site.supportEmail;
  return (
    <div className="rounded-3xl border border-line bg-elevated p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 text-muted">{children}</div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {email ? (
          <a
            href={mailto(email, subject)}
            className="inline-flex items-center rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg hover:opacity-85"
          >
            Enviar e-mail
          </a>
        ) : null}
        <ContactEmail kind={kind} subject={subject} />
      </div>
    </div>
  );
}
