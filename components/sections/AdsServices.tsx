const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

const servicos = [
  {
    icon: '🎯',
    title: 'Google Ads',
    badge: null,
    desc: 'Campanhas configuradas e geridas pra aparecer pra quem já está procurando o que você vende — sem desperdiçar verba com clique de quem nunca ia comprar.',
  },
  {
    icon: '💬',
    title: 'ChatGPT Ads',
    badge: 'Novo',
    desc: 'A publicidade chegou nas conversas com IA. A gente já está pronto pra colocar seu negócio nesse espaço desde o começo, antes da concorrência.',
  },
  {
    icon: '📍',
    title: 'Google Meu Negócio',
    badge: null,
    desc: 'Cadastro e configuração completa do perfil da sua empresa no Google — endereço, horário, fotos e avaliações sempre em dia. A base de qualquer busca local.',
  },
]

export default function AdsServices() {
  return (
    <section id="marketing-digital" className="py-20 px-6 bg-[var(--page-bg)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--brand2)] mb-3">
            Marketing digital
          </p>
          <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--ink)] mb-3">
            Não basta ter site. Precisa ser encontrado.
          </h2>
          <p className="text-base text-[var(--muted)] max-w-lg mx-auto">
            A gente também cuida de onde o seu cliente te encontra — não só de
            onde ele cai depois de te encontrar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {servicos.map(({ icon, title, badge, desc }) => (
            <div
              key={title}
              className="p-7 border border-[var(--border)] rounded-2xl hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-50 transition-all relative"
            >
              {badge && (
                <span className="absolute top-5 right-5 text-[10px] font-bold px-2.5 py-1 rounded-full text-white bg-[var(--brand2)]">
                  {badge}
                </span>
              )}
              <div className="w-11 h-11 rounded-xl bg-cyan-50 flex items-center justify-center text-xl mb-4">
                {icon}
              </div>
              <h3 className="font-display font-bold text-base text-[var(--ink)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl grad-bg text-white text-sm font-bold hover:opacity-90 hover:scale-105 transition-all"
          >
            💬 Quero saber mais
          </a>
          <p className="text-center text-sm text-[var(--muted)]">
            Orçamento sob medida pro seu negócio — sem plano fechado, sem letra miúda.
          </p>
        </div>
      </div>
    </section>
  )
}
