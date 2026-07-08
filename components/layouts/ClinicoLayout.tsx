import type { NicheConfig } from '@/lib/templates'
import { unsplashPhoto, unsplashPhotoFrom } from '@/lib/photos'
import InstagramFeedStrip from '@/components/site-template/InstagramFeedStrip'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function ClinicoLayout({ config }: { config: NicheConfig }) {
  const { businessName, tagline, heroTitle, heroSub, ctaLabel, accent, solidBg, services, posts, testimonials, igHandle, photoIds } = config

  return (
    <>
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-display font-extrabold text-lg text-[var(--ink)]">{businessName}</span>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className={`${solidBg} text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity`}>
          {ctaLabel}
        </a>
      </nav>

      {/* Hero split */}
      <section className="px-6 py-16 sm:py-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)] uppercase tracking-widest mb-4">{tagline}</p>
            <h1 className="font-display font-extrabold text-[clamp(30px,5vw,48px)] leading-[1.12] text-[var(--ink)] mb-5">
              {heroTitle}
            </h1>
            <p className="text-base text-[var(--muted)] leading-relaxed max-w-md mb-8">{heroSub}</p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3.5 rounded-xl hover:-translate-y-px hover:shadow-lg transition-all">
              💬 {ctaLabel}
            </a>
          </div>
          <div className="relative">
            <div className={`absolute -inset-3 rounded-[28px] bg-gradient-to-br ${accent} opacity-15 blur-xl`} />
            <img src={unsplashPhoto(photoIds[0], 800, 600)} alt="" className="relative aspect-[4/3] w-full object-cover rounded-3xl shadow-xl" />
          </div>
        </div>
      </section>

      {/* Barra de confiança */}
      <div className={`bg-gradient-to-r ${accent} py-5`}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
          {[['+15', 'anos de experiência'], ['+3.200', 'pacientes atendidos'], ['4.9★', 'avaliação média']].map(([n, l]) => (
            <div key={l}>
              <span className="font-display font-extrabold text-xl sm:text-2xl text-white block">{n}</span>
              <span className="text-[11px] sm:text-xs text-white/80">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Serviços — lista horizontal */}
      <section className="px-6 py-16 sm:py-20 max-w-3xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] text-center mb-10">
          O que oferecemos
        </h2>
        <div className="flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {services.map(({ icon, title, desc }) => (
            <div key={title} className="flex items-center gap-5 py-5">
              <span className="text-2xl w-10 text-center flex-shrink-0">{icon}</span>
              <div className="flex-1">
                <h3 className="font-display font-bold text-base text-[var(--ink)]">{title}</h3>
                <p className="text-sm text-[var(--muted)]">{desc}</p>
              </div>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-[var(--purple)] flex-shrink-0 hidden sm:block">
                Agendar →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Feed */}
      <InstagramFeedStrip posts={posts} igHandle={igHandle} businessName={businessName} accent={accent} photoIds={photoIds} />

      {/* Um depoimento grande em destaque */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-3xl mb-4">⭐⭐⭐⭐⭐</div>
          <blockquote className="font-display text-xl sm:text-2xl text-[var(--ink)] leading-snug mb-5">
            &ldquo;{testimonials[0].text}&rdquo;
          </blockquote>
          <p className="text-sm font-semibold text-[var(--muted)]">{testimonials[0].name}</p>
        </div>
      </section>

      {/* CTA */}
      <section className={`bg-gradient-to-br ${accent} px-6 py-16 sm:py-20 text-center`}>
        <div className="max-w-xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-4">Agende sua avaliação</h2>
          <p className="text-white/85 mb-8">Atendimento rápido pelo WhatsApp — sem compromisso.</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[var(--ink)] font-bold px-7 py-3.5 rounded-xl hover:-translate-y-px hover:shadow-xl transition-all">
            💬 {ctaLabel}
          </a>
        </div>
      </section>
    </>
  )
}
