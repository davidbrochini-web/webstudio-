import type { NicheConfig } from '@/lib/templates'
import { unsplashPhoto, unsplashPhotoFrom } from '@/lib/photos'
import InstagramFeedStrip from '@/components/site-template/InstagramFeedStrip'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function ZenLayout({ config }: { config: NicheConfig }) {
  const { businessName, tagline, heroTitle, heroSub, ctaLabel, services, posts, testimonials, igHandle, photoIds, accent } = config

  return (
    <div className="bg-[#FAF7F2]">
      {/* Nav minimal */}
      <nav className="px-6 h-20 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-display text-lg text-[#4A5548] tracking-wide">{businessName}</span>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className="text-sm text-[#8B7355] font-medium hover:text-[#4A5548] transition-colors underline underline-offset-4">
          {ctaLabel}
        </a>
      </nav>

      {/* Hero — texto à esquerda, foto grande à direita ocupando altura toda */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">
          <div className="lg:pr-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8B7355] mb-6">{tagline}</p>
            <h1 className="font-display text-[clamp(30px,5vw,46px)] leading-[1.25] text-[#4A5548] mb-6 font-normal">
              {heroTitle}
            </h1>
            <p className="text-base text-[#6B7565] leading-loose mb-8 max-w-md">{heroSub}</p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#4A5548] text-white font-medium px-8 py-4 rounded-full hover:bg-[#3a433a] transition-all">
              {ctaLabel}
            </a>
          </div>
          <div className="relative">
            <img src={unsplashPhoto(photoIds[0], 900, 1100)} alt=""
              className="w-full aspect-[4/5] object-cover rounded-[32px] shadow-lg" />
          </div>
        </div>
      </section>

      {/* Faixa de foto full-bleed, grande, imersiva */}
      <section className="relative h-[52vh] min-h-[380px] my-4">
        <img src={unsplashPhotoFrom(photoIds, 1, 1800, 900)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#4A5548]/25" />
        <div className="relative h-full flex items-center justify-center px-6">
          <p className="font-display text-2xl sm:text-3xl text-white text-center max-w-lg leading-relaxed drop-shadow">
            Um espaço pensado para o seu bem-estar.
          </p>
        </div>
      </section>

      {/* Serviços — cards grandes com foto, 2 colunas (preenche o espaço) */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl text-[#4A5548] text-center mb-3 font-normal">Nossos tratamentos</h2>
        <p className="text-center text-sm text-[#8B7355] mb-12 max-w-md mx-auto">Cada sessão é conduzida por profissionais certificados.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map(({ icon, title, desc }, i) => (
            <div key={title} className="flex gap-5 items-center bg-white rounded-[28px] p-5 shadow-sm">
              <img src={unsplashPhotoFrom(photoIds, i, 260, 260)} alt=""
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl flex-shrink-0" />
              <div>
                <h3 className="font-display text-lg text-[#4A5548] mb-1.5">{icon} {title}</h3>
                <p className="text-sm text-[#6B7565] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Duas fotos grandes lado a lado antes do feed */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 gap-4">
          <img src={unsplashPhotoFrom(photoIds, 2, 800, 900)} alt="" className="w-full aspect-[4/5] object-cover rounded-[28px]" />
          <img src={unsplashPhotoFrom(photoIds, 0, 800, 900)} alt="" className="w-full aspect-[4/5] object-cover rounded-[28px]" />
        </div>
      </section>

      <InstagramFeedStrip posts={posts} igHandle={igHandle} businessName={businessName} accent={accent} photoIds={photoIds} />

      {/* Depoimento único, centralizado, elegante */}
      <section className="px-6 py-20 max-w-xl mx-auto text-center">
        <p className="text-4xl text-[#8B7355]/30 font-display leading-none mb-3">&ldquo;</p>
        <blockquote className="font-display text-xl text-[#4A5548] leading-relaxed italic mb-5">
          {testimonials[0].text}
        </blockquote>
        <p className="text-sm text-[#8B7355]">{testimonials[0].name}</p>
      </section>

      {/* Fechamento */}
      <section className="px-6 py-20 text-center bg-[#4A5548]">
        <p className="text-lg text-white/80 mb-2">Reserve um momento só seu.</p>
        <p className="text-sm text-white/50 mb-8 max-w-sm mx-auto">Agende sua sessão e sinta a diferença de um cuidado de verdade.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-[#4A5548] font-semibold px-8 py-4 rounded-full hover:-translate-y-px hover:shadow-xl transition-all">
          {ctaLabel}
        </a>
      </section>
    </div>
  )
}
