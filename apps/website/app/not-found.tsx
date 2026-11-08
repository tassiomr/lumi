import Link from "next/link";
import { Container } from "@/components/Container";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-gradient text-7xl font-semibold tracking-tight">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Esta página ficou no escuro.</h1>
      <p className="mt-2 max-w-md text-muted">O endereço pode ter mudado ou não existir. Tente uma das opções abaixo.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <Link href="/" className="rounded-full bg-fg px-5 py-2.5 font-medium text-bg hover:opacity-85">Página inicial</Link>
        <Link href={routes.support} className="rounded-full border border-line px-5 py-2.5 font-medium hover:bg-fg/5">Suporte</Link>
        <Link href={routes.privacy} className="rounded-full border border-line px-5 py-2.5 font-medium hover:bg-fg/5">Privacidade</Link>
      </div>
    </Container>
  );
}
