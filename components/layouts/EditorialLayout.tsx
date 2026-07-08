import type { NicheConfig } from '@/lib/templates'
import { unsplashPhoto } from '@/lib/photos'
import InstagramFeedStrip from '@/components/site-template/InstagramFeedStrip'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function EditorialLayout({ config }: { config: NicheConfig }) {
  const { businessName, tagline, heroTitle, heroSub, ctaLabel, accent, services, posts, testimonials, igHandle, photoIds } = config

  return (
    <div className="bg-[var(--dark)]">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-display font-extrabold text-lg text-white">{businessName}</span>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className="border border-white/25 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-white/10 transition-colors">
          {ctaLabel}
        </a>
      </nav>

      {/* Hero — tipografia grande, foto pequena como assinatura visual */}
      <section className="px-6 pt-20 pb-14 max-w-4xl mx-auto">
        <p className={`text-xs font-bold uppercase tracking-[0.2em] bg-gradient-to-r ${accent} bg-clip-text text-transparent mb-6`}>
          {tagline}
        </p>
        <h1 className="font-display font-extrabold text-[clamp(32px,6vw,54px)] leading-[1.08] text-white mb-6 max-w-2xl">
          {heroTitle}
        </h1>
        <p className="text-base text-white/55 leading-relaxed max-w-lg mb-8">{heroSub}</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 bg-gradient-to-r ${accent} text-white font-bold px-6 py-3 rounded hover:-translate-y-px transition-all`}>
          {ctaLabel} →
        </a>
      </section>

      {/* Áreas de atuação — sidebar + conteúdo, estilo sumário editorial */}
      <section className="px-6 py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Índice</p>
            <p className="font-display font-bold text-lg text-white">Áreas de atuação</p>
          </div>
          <div className="flex flex-col divide-y divide-white/10">
            {services.map(({ icon, title, desc }, i) => (
              <div key={title} className="flex gap-5 py-6">
                <span className="font-display text-white/25 text-2xl w-8 flex-shrink-0">0{i + 1}</span>
                <div>
                  <h3 className="font-display font-bold text-base text-white mb-1.5">{icon} {title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Estatísticas discretas */}
      <div className="border-y border-white/10 py-6">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
          {[['+18', 'anos de atuação'], ['+400', 'casos atendidos'], ['92%', 'êxito em acordos']].map(([n, l]) => (
            <div key={l}>
              <span className={`font-display font-extrabold text-xl sm:text-2xl bg-gradient-to-r ${accent} bg-clip-text text-transparent block`}>{n}</span>
              <span className="text-[11px] text-white/40">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Foto do escritório — única, editorial */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <img src={unsplashPhoto(photoIds[1] ?? photoIds[0], 1200, 500)} alt="" className="w-full aspect-[21/9] object-cover rounded-sm grayscale-[15%]" />
      </section>

      <InstagramFeedStrip posts={posts} igHandle={igHandle} businessName={businessName} accent={accent} photoIds={photoIds} />

      {/* Depoimento — texto puro, sem card, estilo citação de livro */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="max-w-2xl mx-auto">
          <p className="text-4xl text-white/20 font-display leading-none mb-4">&ldquo;</p>
          <blockquote className="text-lg text-white/70 leading-relaxed italic mb-6">
            {testimonials[0].text}
          </blockquote>
          <p className="text-sm font-semibold text-white/40">— {testimonials[0].name}</p>
        </div>
      </section>

      {/* CTA sóbria */}
      <section className="px-6 py-16 border-t border-white/10 text-center">
        <h2 className="font-display font-extrabold text-2xl text-white mb-4">Converse com nosso time</h2>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 bg-gradient-to-r ${accent} text-white font-bold px-7 py-3.5 rounded hover:-translate-y-px transition-all`}>
          {ctaLabel} →
        </a>
      </section>
    </div>
  )
}
