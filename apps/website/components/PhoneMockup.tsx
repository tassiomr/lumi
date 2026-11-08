/**
 * Representação ilustrativa da interface (não é captura de tela).
 * Substitua por capturas reais do app quando o build estiver disponível.
 */
export function PhoneMockup() {
  const lights = [
    { name: "Sala", on: true, level: 72, hue: "from-amber-200 to-orange-300" },
    { name: "Quarto", on: true, level: 35, hue: "from-violet-300 to-fuchsia-300" },
    { name: "Cozinha", on: false, level: 0, hue: "from-zinc-300 to-zinc-400" },
    { name: "Escritório", on: true, level: 90, hue: "from-sky-200 to-blue-300" },
  ];
  return (
    <div className="relative mx-auto w-[17rem] sm:w-[19rem]" role="img" aria-label="Ilustração da interface do Lumi com controles de iluminação por ambiente">
      <div aria-hidden="true" className="animate-breathe absolute -inset-10 rounded-full bg-gradient-to-br from-electric-500/35 to-violet-500/35 blur-3xl" />
      <div aria-hidden="true" className="relative rounded-[2.75rem] border border-white/10 bg-zinc-950 p-2.5 shadow-2xl shadow-electric-600/25">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-b from-[#0e1020] to-[#08090f] px-4 pb-6 pt-10 text-white">
          <div className="absolute left-1/2 top-2.5 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <p className="text-[0.7rem] uppercase tracking-widest text-white/50">Casa</p>
          <p className="mt-1 text-xl font-semibold">Boa noite</p>
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-electric-500/80 to-violet-500/80 p-3.5">
            <p className="text-[0.7rem] text-white/75">Cena</p>
            <p className="text-sm font-semibold">Fim de tarde</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {lights.map((l) => (
              <div key={l.name} className={`rounded-2xl p-3 ${l.on ? "bg-white/10" : "bg-white/[0.04]"}`}>
                <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${l.hue} ${l.on ? "shadow-[0_0_18px_rgba(255,220,160,0.55)]" : "opacity-40"}`} />
                <p className="mt-2.5 text-xs font-medium">{l.name}</p>
                <p className="text-[0.68rem] text-white/50">{l.on ? `${l.level}%` : "Desligada"}</p>
                <div className="mt-2 h-1 rounded-full bg-white/10">
                  <div className="h-1 rounded-full bg-white/80" style={{ width: `${l.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
