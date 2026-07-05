const steps = [
  {
    n: '01',
    title: 'Conecta o Instagram',
    desc: 'Você autoriza o acesso ao seu perfil business uma única vez. A gente cuida de tudo — configuração, tokens e renovação automática.',
  },
  {
    n: '02',
    title: 'Publicamos seu site',
    desc: 'Em até 48 horas, seu site profissional está no ar com domínio, hospedagem, SSL e o conteúdo real do seu negócio.',
  },
  {
    n: '03',
    title: 'Continue postando normalmente',
    desc: 'Publicou no Instagram? O site atualiza em minutos. Sem logar em painel, sem enviar foto de novo, sem nada extra.',
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-[var(--dark)] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--pink)] mb-3">
          Como funciona
        </p>
        <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-white mb-4">
          Três passos. Uma vez só.
        </h2>
        <p className="text-base text-white/40 leading-relaxed mb-14 max-w-xl">
          Depois de configurado, não precisa fazer mais nada. O sistema funciona
          enquanto você foca no negócio.
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {steps.map(({ n, title, desc }) => (
            <div
              key={n}
              className="bg-white/[0.03] hover:bg-white/[0.06] transition-colors px-7 py-9"
            >
              <span className="font-display font-extrabold text-5xl grad-text block leading-none mb-4">
                {n}
              </span>
              <h3 className="font-display font-bold text-lg text-white mb-2.5">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
