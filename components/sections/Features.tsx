const features = [
  {
    icon: '🌐',
    title: 'Site profissional',
    desc: 'Design limpo, moderno e responsivo. Funciona em celular, tablet e computador. Passa credibilidade para qualquer cliente.',
  },
  {
    icon: '⚡',
    title: 'Feed automático do Instagram',
    desc: 'Posts e fotos aparecem no site em minutos após a publicação. Seu catálogo e novidades sempre atualizados.',
  },
  {
    icon: '🔒',
    title: 'Hospedagem + SSL incluso',
    desc: 'Site seguro, rápido e no ar 24h. Sem se preocupar com servidor ou certificado — está tudo no plano.',
  },
  {
    icon: '🌍',
    title: 'Domínio .com.br no 1º ano',
    desc: 'Registramos o domínio do seu negócio gratuitamente no primeiro ano. Você sai com o endereço certo desde o dia um.',
  },
  {
    icon: '💬',
    title: 'Suporte real pelo WhatsApp',
    desc: 'Precisou de ajuda? A gente responde direto no WhatsApp. Sem ticket, sem fila de atendimento, sem chatbot.',
  },
  {
    icon: '📊',
    title: 'Google Analytics configurado',
    desc: 'Veja quantas pessoas acessam o site e de onde vieram. Dados simples, enviados para você toda semana.',
  },
]

export default function Features() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--purple)] mb-3">
            O que está incluso
          </p>
          <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--dark)] mb-3">
            Tudo que seu negócio precisa
          </h2>
          <p className="text-base text-[var(--muted)] max-w-md mx-auto">
            Um plano simples, sem cobrar à parte por cada detalhe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="p-7 border border-[var(--border)] rounded-2xl hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-xl mb-4">
                {icon}
              </div>
              <h3 className="font-display font-bold text-base text-[var(--dark)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
