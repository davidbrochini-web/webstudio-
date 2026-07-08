import type { NicheConfig } from '@/lib/templates'
import { unsplashPhoto, unsplashPhotoFrom } from '@/lib/photos'
import InstagramFeedStrip from '@/components/site-template/InstagramFeedStrip'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function PortfolioLayout({ config }: { config: NicheConfig }) {
  const { businessName, tagline, heroTitle, ctaLabel, accent, services, posts, testimonials, igHandle, photoIds } = config

  return (
    <>
      {/* Nav flutuante sobre a foto */}
      <nav className="absolute top-[52px] left-0 right-0 z-10 px-6 h-16 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-display font-extrabold text-lg text-white drop-shadow">{businessName}</span>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className="bg-white/90 backdrop-blur text-[var(--ink)] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white transition-colors">
          {ctaLabel}
        </a>
      </nav>

      {/* Hero = mosaico assimétrico de fotos com título sobreposto */}
      <section className="relative grid grid-cols-4 grid-rows-2 gap-1.5 h-[70vh] min-h-[440px] px-1.5 pt-1.5">
        <div className="col-span-2 row-span-2 relative overflow-hidden rounded-sm">
          <img src={unsplashPhoto(photoIds[0], 900, 1000)} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-1 row-span-1 relative overflow-hidden rounded-sm">
          <img src={unsplashPhotoFrom(photoIds, 1, 500, 500)} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-1 row-span-1 relative overflow-hidden rounded-sm">
          <img src={unsplashPhotoFrom(photoIds, 2, 500, 500)} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2 row-span-1 relative overflow-hidden rounded-sm">
          <img src={unsplashPhotoFrom(photoIds, 3, 900, 500)} alt="" className="w-full h-full object-cover" />
        </div>

        {/* título sobreposto, canto inferior esquerdo */}
        <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:max-w-md">
          <p className="text-xs font-bold uppercase tracking-widest text-white/90 mb-2 drop-shadow">{tagline}</p>
          <h1 className="font-display font-extrabold text-[clamp(26px,5vw,42px)] leading-[1.1] text-white drop-shadow-lg">
            {heroTitle}
          </h1>
        </div>
      </section>

      {/* Serviços — cards com foto de fundo (overlay), não ícone+texto */}
      <section className="px-6 py-16 sm:py-20 max-w-6xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] text-center mb-10">
          Especialidades
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map(({ title, desc }, i) => (
            <div key={title} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
              <img src={unsplashPhotoFrom(photoIds, i + 4, 400, 550)} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-display font-bold text-sm text-white mb-1">{title}</h3>
                <p className="text-[11px] text-white/70 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feed = continuação natural do portfólio */}
      <InstagramFeedStrip posts={posts} igHandle={igHandle} businessName={businessName} accent={accent} photoIds={photoIds} />

      {/* Depoimento flutuando sobre foto */}
      <section className="relative py-24 px-6">
        <img src={unsplashPhoto(photoIds[0], 1600, 700)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative max-w-lg mx-auto text-center">
          <blockquote className="font-display text-xl sm:text-2xl text-white leading-snug mb-4">
            &ldquo;{testimonials[0].text}&rdquo;
          </blockquote>
          <p className="text-sm text-white/70">{testimonials[0].name}</p>
        </div>
      </section>

      {/* CTA */}
      <section className={`bg-gradient-to-br ${accent} px-6 py-16 sm:py-20 text-center`}>
        <div className="max-w-xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-4">Vamos criar algo juntos?</h2>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[var(--ink)] font-bold px-7 py-3.5 rounded-xl hover:-translate-y-px hover:shadow-xl transition-all">
            💬 {ctaLabel}
          </a>
        </div>
      </section>
    </>
  )
}
