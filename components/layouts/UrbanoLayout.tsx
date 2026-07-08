import type { NicheConfig } from '@/lib/templates'
import { unsplashPhoto, unsplashPhotoFrom } from '@/lib/photos'
import InstagramFeedStrip from '@/components/site-template/InstagramFeedStrip'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

const prices = ['R$ 45', 'R$ 35', 'R$ 70', 'R$ 90']

export default function UrbanoLayout({ config }: { config: NicheConfig }) {
  const { businessName, tagline, heroTitle, heroSub, ctaLabel, accent, services, posts, testimonials, igHandle, photoIds } = config

  return (
    <div className="bg-[#18181B]">
      {/* Nav */}
      <nav className="px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-display font-extrabold text-lg text-white">{businessName}</span>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className={`bg-gradient-to-r ${accent} text-white text-sm font-bold px-4 py-2 rounded hover:opacity-90 transition-opacity`}>
          {ctaLabel}
        </a>
      </nav>

      {/* Hero com faixa diagonal */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-90`}
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 62%, 0 100%)' }} />
        <img src={unsplashPhoto(photoIds[0], 1600, 700)} alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-30"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 62%, 0 100%)' }} />
        <div className="relative px-6 pt-16 pb-28 max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80 mb-4">{tagline}</p>
          <h1 className="font-display font-extrabold text-[clamp(30px,6vw,50px)] leading-[1.05] text-white mb-5">
            {heroTitle}
          </h1>
          <p className="text-base text-white/85 leading-relaxed mb-8">{heroSub}</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#18181B] font-bold px-7 py-3.5 rounded hover:-translate-y-px hover:shadow-2xl transition-all">
            {ctaLabel} →
          </a>
        </div>
      </section>

      {/* Serviços — cardápio/tabela de preços */}
      <section className="px-6 py-16 sm:py-20 max-w-2xl mx-auto -mt-10 relative">
        <div className="bg-[#27272A] rounded-2xl p-6 sm:p-8">
          <h2 className="font-display font-extrabold text-xl text-white mb-6 text-center uppercase tracking-wide">
            Nossos serviços
          </h2>
          <div className="flex flex-col divide-y divide-white/10">
            {services.map(({ icon, title, desc }, i) => (
              <div key={title} className="flex items-center gap-3 py-4">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm text-white">{title}</h3>
                  <p className="text-xs text-white/40 truncate">{desc}</p>
                </div>
                <span className={`font-display font-extrabold text-sm bg-gradient-to-r ${accent} bg-clip-text text-transparent flex-shrink-0`}>
                  {prices[i % prices.length]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria escalonada — alturas diferentes, sobrepostas */}
      <section className="px-6 py-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-3 items-start">
          <img src={unsplashPhotoFrom(photoIds, 1, 400, 480)} alt="" className="w-full aspect-[4/5] object-cover rounded-lg" />
          <img src={unsplashPhotoFrom(photoIds, 2, 400, 560)} alt="" className="w-full aspect-[4/6] object-cover rounded-lg mt-8" />
          <img src={unsplashPhotoFrom(photoIds, 0, 400, 480)} alt="" className="w-full aspect-[4/5] object-cover rounded-lg" />
        </div>
      </section>

      <InstagramFeedStrip posts={posts} igHandle={igHandle} businessName={businessName} accent={accent} photoIds={photoIds} />

      {/* Depoimento */}
      <section className="px-6 py-16 sm:py-20 text-center">
        <div className="max-w-lg mx-auto">
          <p className="text-2xl mb-4">🔥</p>
          <blockquote className="text-lg text-white/80 leading-relaxed mb-4">
            &ldquo;{testimonials[0].text}&rdquo;
          </blockquote>
          <p className="text-sm font-semibold text-white/40">— {testimonials[0].name}</p>
        </div>
      </section>

      {/* CTA */}
      <section className={`bg-gradient-to-r ${accent} px-6 py-14 text-center`}>
        <h2 className="font-display font-extrabold text-2xl text-white mb-5">Chega de esperar. Marca aí.</h2>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-[#18181B] font-bold px-7 py-3.5 rounded hover:-translate-y-px transition-all">
          💬 {ctaLabel}
        </a>
      </section>
    </div>
  )
}
