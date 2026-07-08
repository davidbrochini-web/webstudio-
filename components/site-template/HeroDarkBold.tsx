import type { NicheConfig } from '@/lib/templates'
import { unsplashPhoto } from '@/lib/photos'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function HeroDarkBold({ config }: { config: NicheConfig }) {
  const { heroTitle, heroSub, ctaLabel, accent, tagline, photoId } = config
  return (
    <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
      {/* Foto de fundo com overlay escuro */}
      <img
        src={unsplashPhoto(photoId, 1600, 900)}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[var(--dark)]/80" />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${accent} opacity-15 blur-[100px]`} />

      <div className="relative max-w-2xl mx-auto text-center">
        <span className={`inline-block text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${accent} bg-clip-text text-transparent mb-4`}>
          {tagline}
        </span>
        <h1 className="font-display font-extrabold text-[clamp(30px,6vw,50px)] leading-[1.1] text-white mb-5">
          {heroTitle}
        </h1>
        <p className="text-base text-white/70 leading-relaxed max-w-lg mx-auto mb-8">{heroSub}</p>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 bg-gradient-to-r ${accent} text-white font-bold px-7 py-3.5 rounded-xl hover:-translate-y-px hover:shadow-2xl transition-all`}
        >
          💬 {ctaLabel}
        </a>
      </div>
    </section>
  )
}
