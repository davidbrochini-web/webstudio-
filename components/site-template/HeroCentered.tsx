import type { NicheConfig } from '@/lib/templates'
import { themedPhoto } from '@/lib/photos'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function HeroCentered({ config }: { config: NicheConfig }) {
  const { heroTitle, heroSub, ctaLabel, accent, tagline, photoKeywords } = config
  return (
    <section className="relative px-6 pt-20 sm:pt-24 pb-12 overflow-hidden">
      <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-3xl`} />
      <div className={`absolute top-40 -left-24 w-72 h-72 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-3xl`} />

      <div className="relative max-w-2xl mx-auto text-center mb-12">
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

      {/* Banner de foto do ambiente */}
      <div className="relative max-w-4xl mx-auto">
        <img
          src={themedPhoto(photoKeywords, 3, 1400, 600)}
          alt=""
          className="w-full aspect-[21/9] object-cover rounded-3xl shadow-2xl"
        />
      </div>
    </section>
  )
}
