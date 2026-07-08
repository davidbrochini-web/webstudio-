import type { NicheConfig } from '@/lib/templates'
import { unsplashPhoto } from '@/lib/photos'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function HeroSplit({ config }: { config: NicheConfig }) {
  const { heroTitle, heroSub, ctaLabel, accent, tagline, photoId } = config
  return (
    <section className="px-6 py-16 sm:py-20 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-sm font-semibold text-[var(--muted)] uppercase tracking-widest mb-4">{tagline}</p>
          <h1 className="font-display font-extrabold text-[clamp(30px,5vw,48px)] leading-[1.12] text-[var(--dark)] mb-5">
            {heroTitle}
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-md mb-8">{heroSub}</p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3.5 rounded-xl hover:-translate-y-px hover:shadow-lg transition-all"
          >
            💬 {ctaLabel}
          </a>
        </div>
        <div className="relative">
          <div className={`absolute -inset-3 rounded-[28px] bg-gradient-to-br ${accent} opacity-15 blur-xl`} />
          <img
            src={unsplashPhoto(photoId, 800, 600)}
            alt=""
            className="relative aspect-[4/3] w-full object-cover rounded-3xl shadow-xl"
          />
        </div>
      </div>
    </section>
  )
}
