import type { NicheConfig } from '@/lib/templates'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function HeroCentered({ config }: { config: NicheConfig }) {
  const { heroTitle, heroSub, ctaLabel, accent, tagline } = config
  return (
    <section className={`relative px-6 py-20 sm:py-28 bg-gradient-to-b ${accent} bg-opacity-10 overflow-hidden`}>
      {/* soft blob decorativo */}
      <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-3xl`} />
      <div className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-3xl`} />

      <div className="relative max-w-2xl mx-auto text-center">
        <span className={`inline-block text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${accent} bg-clip-text text-transparent mb-4`}>
          {tagline}
        </span>
        <h1 className="font-display font-extrabold text-[clamp(28px,6vw,46px)] leading-[1.15] text-[var(--dark)] mb-5">
          {heroTitle}
        </h1>
        <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg mx-auto mb-8">{heroSub}</p>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 bg-gradient-to-r ${accent} text-white font-bold px-7 py-3.5 rounded-full hover:-translate-y-px hover:shadow-xl transition-all`}
        >
          💬 {ctaLabel}
        </a>
      </div>
    </section>
  )
}
