/**
 * Representação ilustrativa da interface (não é captura de tela).
 * Substitua por capturas reais do app quando o build estiver disponível.
 */
export function PhoneMockup() {
  // Cores das lâmpadas representam a luz emitida (dado do dispositivo), não cores do tema.
  const lights = [
    { name: "Sala", on: true, level: 72, hue: "bg-gradient-to-br from-amber-200 to-orange-300" },
    { name: "Quarto", on: true, level: 35, hue: "bg-gradient-to-br from-violet-300 to-fuchsia-300" },
    { name: "Cozinha", on: false, level: 0, hue: "bg-line" },
    { name: "Escritório", on: true, level: 90, hue: "bg-gradient-to-br from-sky-200 to-blue-300" },
  ];
  return (
    <div className="relative mx-auto w-[17rem] sm:w-[19rem]" role="img" aria-label="Ilustração da interface do Lumi com controles de iluminação por ambiente">
      <div aria-hidden="true" className="animate-breathe absolute -inset-10 rounded-full bg-gradient-to-br from-primary/35 to-glow blur-3xl" />
      <div aria-hidden="true" className="relative rounded-[2.75rem] border border-line bg-inverse p-2.5 shadow-2xl shadow-primary/25">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-surface px-4 pb-6 pt-10 text-fg">
          <div className="absolute left-1/2 top-2.5 h-6 w-24 -translate-x-1/2 rounded-full bg-inverse" />
          <p className="text-[0.7rem] uppercase tracking-widest text-muted">Casa</p>
          <p className="mt-1 font-display text-xl font-semibold">Boa noite</p>
          <div className="mt-4 rounded-card bg-gradient-to-br from-primary to-highlight p-3.5 text-on-primary">
            <p className="text-[0.7rem] opacity-80">Cena</p>
            <p className="text-sm font-semibold">Fim de tarde</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {lights.map((l) => (
              <div key={l.name} className={`rounded-card p-3 ${l.on ? "bg-elevated" : "bg-tertiary"}`}>
                <div className={`h-7 w-7 rounded-full ${l.hue} ${l.on ? "shadow-[0_0_18px_var(--color-glow)]" : ""}`} />
                <p className="mt-2.5 text-xs font-medium">{l.name}</p>
                <p className="font-mono text-[0.68rem] text-muted">{l.on ? `${l.level}%` : "Desligada"}</p>
                <div className="mt-2 h-1 rounded-full bg-line">
                  <div className="h-1 rounded-full bg-primary" style={{ width: `${l.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
