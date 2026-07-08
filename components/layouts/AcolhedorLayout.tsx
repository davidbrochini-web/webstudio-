import type { NicheConfig } from '@/lib/templates'
import { unsplashPhoto, unsplashPhotoFrom } from '@/lib/photos'
import InstagramFeedStrip from '@/components/site-template/InstagramFeedStrip'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function AcolhedorLayout({ config }: { config: NicheConfig }) {
  const { businessName, tagline, heroTitle, heroSub, ctaLabel, accent, services, posts, testimonials, igHandle, photoIds } = config

  return (
    <>
      {/* Nav */}
      <nav className="px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-display font-extrabold text-lg text-[var(--ink)]">{businessName}</span>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className={`bg-gradient-to-r ${accent} text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity`}>
          {ctaLabel}
        </a>
      </nav>

      {/* Hero centralizado com blob */}
      <section className="relative px-6 pt-12 pb-10 overflow-hidden">
        <div className={`absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-3xl`} />
        <div className={`absolute top-32 -left-20 w-64 h-64 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-3xl`} />
        <div className="relative max-w-xl mx-auto text-center">
          <span className={`inline-block text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${accent} bg-clip-text text-transparent mb-4`}>
            {tagline}
          </span>
          <h1 className="font-display font-extrabold text-[clamp(28px,6vw,46px)] leading-[1.15] text-[var(--ink)] mb-5">
            {heroTitle}
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-md mx-auto mb-8">{heroSub}</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 bg-gradient-to-r ${accent} text-white font-bold px-7 py-3.5 rounded-full hover:-translate-y-px hover:shadow-xl transition-all`}>
            💬 {ctaLabel}
          </a>
        </div>
      </section>

      {/* Cards grandes com foto no topo, cantos bem arredondados */}
      <section className="px-6 py-14 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {services.map(({ icon, title, desc }, i) => (
            <div key={title} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[28px] overflow-hidden">
              <img src={unsplashPhotoFrom(photoIds, i, 500, 280)} alt="" className="w-full aspect-[16/9] object-cover" />
              <div className="p-6">
                <h3 className="font-display font-bold text-base text-[var(--ink)] mb-1.5">{icon} {title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Galeria arredondada */}
      <section className="px-6 py-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <img key={i} src={unsplashPhotoFrom(photoIds, i + 2, 500, 650)} alt="" className="w-full aspect-[4/5] object-cover rounded-3xl" />
          ))}
        </div>
      </section>

      <InstagramFeedStrip posts={posts} igHandle={igHandle} businessName={businessName} accent={accent} photoIds={photoIds} />

      {/* Depoimentos lado a lado, cards arredondados */}
      <section className="px-6 py-16 sm:py-20 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {testimonials.map(({ name, text }) => (
            <div key={name} className="bg-[var(--off)] rounded-3xl p-6">
              <div className="flex gap-0.5 mb-3 text-sm">{'⭐'.repeat(5)}</div>
              <p className="text-sm text-[var(--slate)] leading-relaxed mb-3">&ldquo;{text}&rdquo;</p>
              <p className="text-xs font-bold text-[var(--muted)]">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA em pílula */}
      <section className={`bg-gradient-to-br ${accent} px-6 py-16 sm:py-20 text-center rounded-t-[40px]`}>
        <div className="max-w-lg mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-6">Vem fazer parte!</h2>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[var(--ink)] font-bold px-8 py-4 rounded-full hover:-translate-y-px hover:shadow-xl transition-all">
            💬 {ctaLabel}
          </a>
        </div>
      </section>
    </>
  )
}
