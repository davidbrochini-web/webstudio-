const WA_LINK = 'https://wa.me/55XXXXXXXXXXX'

const items = [
  'Site profissional criado para o seu negócio',
  'Feed do Instagram atualizado automaticamente',
  'Hospedagem + SSL incluso',
  'Domínio .com.br no 1º ano grátis',
  'Suporte via WhatsApp',
  'Google Analytics configurado',
  '1 ajuste de layout por mês incluso',
]

export default function Pricing() {
  return (
    <section id="preco" className="py-20 px-6 bg-[var(--off)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--purple)] mb-3">
            Preço
          </p>
          <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--dark)] mb-3">
            Simples e sem surpresa
          </h2>
          <p className="text-base text-[var(--muted)]">
            Tudo incluso no plano mensal. Sem taxa de setup, sem contrato de fidelidade.
          </p>
        </div>

        {/* Card */}
        <div className="max-w-sm mx-auto grad-border rounded-2xl bg-white p-9 shadow-2xl shadow-purple-100">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--purple)] mb-2">
            Site + Instagram
          </p>
          <div className="font-display font-extrabold text-5xl text-[var(--dark)] leading-none mb-1">
            R$&thinsp;149
            <span className="text-xl font-medium text-[var(--muted)]">/mês</span>
          </div>
          <p className="text-xs text-[var(--muted)] mb-7">
            Cancela quando quiser. Sem multa.
          </p>

          <ul className="space-y-3 mb-8">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[var(--slate)]">
                <span className="w-[18px] h-[18px] flex-shrink-0 mt-0.5 rounded-full bg-green-50 text-[var(--green)] text-[10px] font-bold flex items-center justify-center">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl grad-bg text-white font-semibold text-base hover:opacity-90 transition-all hover:-translate-y-px"
          >
            Começar agora →
          </a>

          <p className="text-xs text-[var(--muted)] text-center mt-4">
            Site no ar em até 48 horas após o contrato.
          </p>
        </div>
      </div>
    </section>
  )
}
