import type { NichePlano } from '@/lib/templates'

/**
 * Tabela de preços/planos — exibição estática. NÃO é sistema de
 * assinatura/cobrança (sem checkout, sem recorrência de verdade) —
 * isso é módulo futuro (pendência registrada em separado). Aqui é
 * só vitrine informativa, obrigatória em todos os templates.
 */
export default function PlanosSection({
  planos,
  accent,
  solidBg,
  waLink,
  ctaLabel = 'Falar no WhatsApp',
  dark = false,
}: {
  planos: NichePlano[]
  accent: string
  solidBg: string
  waLink: string
  ctaLabel?: string
  dark?: boolean
}) {
  if (!planos.length) return null

  return (
    <section className="px-6 py-16 sm:py-20 max-w-5xl mx-auto">
      <h2 className={`font-display font-extrabold text-2xl sm:text-3xl text-center mb-10 ${dark ? 'text-white' : 'text-[var(--ink)]'}`}>
        Valores
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
        {planos.map(({ nome, preco, periodo, destaque, features }) => (
          <div
            key={nome}
            className={`relative rounded-2xl p-6 flex flex-col border ${
              destaque
                ? `bg-gradient-to-br ${accent} border-transparent text-white shadow-xl sm:-translate-y-2`
                : dark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--ink)]'
            }`}
          >
            {destaque && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wide bg-white text-[var(--ink)] px-3 py-1 rounded-full shadow">
                Mais escolhido
              </span>
            )}
            <h3 className={`font-display font-bold text-lg mb-1 ${destaque || dark ? 'text-white' : 'text-[var(--ink)]'}`}>{nome}</h3>
            <p className="mb-4">
              <span className="font-display font-extrabold text-2xl">{preco}</span>
              {periodo && <span className={`text-sm ml-1 ${destaque ? 'text-white/80' : dark ? 'text-white/50' : 'text-[var(--muted)]'}`}>{periodo}</span>}
            </p>
            <ul className="flex flex-col gap-2 mb-6 flex-1">
              {features.map(f => (
                <li key={f} className={`text-sm flex items-start gap-2 ${destaque ? 'text-white/90' : dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
                  <span className={destaque ? 'text-white' : ''}>✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-center text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-px ${
                destaque ? 'bg-white text-[var(--ink)]' : `${solidBg} text-white`
              }`}
            >
              {ctaLabel}
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
