const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

const templates = [
  {
    icon: '🦷',
    nicho: 'Clínica odontológica',
    desc: 'Agendamento pelo WhatsApp, tratamentos em destaque e antes/depois direto do Instagram.',
    accent: 'from-[#4facfe] to-[#00f2fe]',
  },
  {
    icon: '🎓',
    nicho: 'Escola / Curso',
    desc: 'Captação de matrículas, grade de cursos e mural de atividades atualizado pelo Instagram.',
    accent: 'from-[#5ee7df] to-[#b490ca]',
  },
  {
    icon: '📸',
    nicho: 'Estúdio de fotografia',
    desc: 'Portfólio que se atualiza sozinho a cada ensaio postado. Orçamento em um clique.',
    accent: 'from-[#f6d365] to-[#fda085]',
  },
  {
    icon: '⚖️',
    nicho: 'Escritório / Advocacia',
    desc: 'Presença profissional, áreas de atuação e formulário de contato direto para triagem.',
    accent: 'from-[#667eea] to-[#764ba2]',
  },
  {
    icon: '💈',
    nicho: 'Barbearia / Salão',
    desc: 'Agenda pelo WhatsApp, tabela de serviços e feed dos trabalhos mais recentes.',
    accent: 'from-[#f093fb] to-[#f5576c]',
  },
  {
    icon: '🏋️',
    nicho: 'Academia / Personal',
    desc: 'Planos em destaque, aula experimental via WhatsApp e resultados dos alunos no feed.',
    accent: 'from-[#43e97b] to-[#38f9d7]',
  },
]

export default function Templates() {
  return (
    <section id="templates" className="py-20 px-6 bg-[var(--off)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--purple)] mb-3">
            Esse site pode ser seu
          </p>
          <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--dark)] mb-3">
            Feito para o seu tipo de negócio
          </h2>
          <p className="text-base text-[var(--muted)] max-w-lg mx-auto">
            Sites pensados para atrair clientes e gerar contato — cada nicho com
            estrutura própria, pronto para captar leads pelo WhatsApp.
          </p>
        </div>

        {/* Grid de templates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map(({ icon, nicho, desc, accent }) => (
            <div
              key={nicho}
              className="group bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-purple-50 hover:border-purple-200 transition-all"
            >
              {/* Preview mockup mini */}
              <div className={`relative h-36 bg-gradient-to-br ${accent} flex items-center justify-center`}>
                <span className="text-5xl drop-shadow-lg">{icon}</span>
                {/* Fake browser chrome */}
                <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 bg-white/20 backdrop-blur rounded-md px-2 py-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    ))}
                  </div>
                  <span className="text-[8px] text-white/80 font-medium">seunegocio.com.br</span>
                </div>
                {/* Badge preview em breve */}
                <span className="absolute bottom-3 right-3 text-[10px] font-bold text-white bg-black/30 backdrop-blur px-2.5 py-1 rounded-full">
                  Preview em breve
                </span>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="font-display font-bold text-base text-[var(--dark)] mb-2">
                  {nicho}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">{desc}</p>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--purple)] group-hover:gap-2.5 transition-all"
                >
                  Quero esse site →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Nota de rodapé */}
        <p className="text-center text-sm text-[var(--muted)] mt-10">
          Não achou o seu nicho? A gente monta sob medida —{' '}
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--purple)] underline underline-offset-2">
            chama no WhatsApp
          </a>.
        </p>
      </div>
    </section>
  )
}
