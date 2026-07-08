import type { NicheConfig } from '@/lib/templates'
import { unsplashPhoto, unsplashPhotoFrom } from '@/lib/photos'
import InstagramFeedStrip from '@/components/site-template/InstagramFeedStrip'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function ZenLayout({ config }: { config: NicheConfig }) {
  const { businessName, tagline, heroTitle, heroSub, ctaLabel, services, posts, testimonials, igHandle, photoIds, accent } = config

  return (
    <div className="bg-[#FAF7F2]">
      {/* Nav minimal */}
      <nav className="px-6 h-20 flex items-center justify-between max-w-2xl mx-auto">
        <span className="font-display text-lg text-[#4A5548] tracking-wide">{businessName}</span>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className="text-sm text-[#8B7355] font-medium hover:text-[#4A5548] transition-colors underline underline-offset-4">
          {ctaLabel}
        </a>
      </nav>

      {/* Hero — texto solto, sem caixa, muito respiro */}
      <section className="px-6 pt-12 pb-16 max-w-xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8B7355] mb-6">{tagline}</p>
        <h1 className="font-display text-[clamp(28px,5vw,42px)] leading-[1.3] text-[#4A5548] mb-6 font-normal">
          {heroTitle}
        </h1>
        <p className="text-base text-[#6B7565] leading-loose max-w-md mx-auto">{heroSub}</p>
      </section>

      {/* Galeria vem PRIMEIRO — ambiente vende antes de qualquer coisa. Foto única, full-bleed */}
      <section className="max-w-2xl mx-auto px-6">
        <img src={unsplashPhoto(photoIds[0], 1200, 800)} alt="" className="w-full aspect-[3/2] object-cover rounded-sm" />
      </section>

      {/* CTA discreta, tipo link, logo após a foto */}
      <div className="text-center py-10">
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#4A5548] font-medium border border-[#4A5548]/25 px-7 py-3 rounded-full hover:bg-[#4A5548] hover:text-white transition-all">
          {ctaLabel}
        </a>
      </div>

      {/* Serviços — lista minimalista, sem cards, muito espaçamento vertical */}
      <section className="px-6 py-16 max-w-lg mx-auto">
        <div className="flex flex-col gap-10">
          {services.map(({ icon, title, desc }) => (
            <div key={title} className="text-center">
              <span className="text-2xl block mb-3">{icon}</span>
              <h3 className="font-display text-lg text-[#4A5548] mb-2">{title}</h3>
              <p className="text-sm text-[#6B7565] leading-relaxed max-w-sm mx-auto">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Segunda foto solta, assimétrica */}
      <section className="max-w-md mx-auto px-6 mb-16">
        <img src={unsplashPhotoFrom(photoIds, 1, 700, 500)} alt="" className="w-full aspect-[7/5] object-cover rounded-sm ml-auto" style={{ width: '85%' }} />
      </section>

      <InstagramFeedStrip posts={posts} igHandle={igHandle} businessName={businessName} accent={accent} photoIds={photoIds} />

      {/* Um único depoimento, centralizado, elegante */}
      <section className="px-6 py-20 max-w-xl mx-auto text-center">
        <p className="text-3xl text-[#8B7355]/30 font-display leading-none mb-2">&ldquo;</p>
        <blockquote className="font-display text-lg text-[#4A5548] leading-relaxed italic mb-5">
          {testimonials[0].text}
        </blockquote>
        <p className="text-sm text-[#8B7355]">{testimonials[0].name}</p>
      </section>

      {/* Fechamento — sem CTA pesada, so um convite final */}
      <section className="px-6 py-16 text-center border-t border-[#4A5548]/10">
        <p className="text-base text-[#6B7565] mb-6">Reserve um momento só seu.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#4A5548] font-medium border border-[#4A5548]/25 px-7 py-3 rounded-full hover:bg-[#4A5548] hover:text-white transition-all">
          {ctaLabel}
        </a>
      </section>
    </div>
  )
}
