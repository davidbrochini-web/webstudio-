import type { NicheConfig } from '@/lib/templates'
import { unsplashPhoto, unsplashPhotoFrom } from '@/lib/photos'
import InstagramFeedStrip from '@/components/site-template/InstagramFeedStrip'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

const progress = [92, 78, 85, 65]

export default function PerformanceLayout({ config }: { config: NicheConfig }) {
  const { businessName, tagline, heroTitle, heroSub, ctaLabel, accent, services, posts, testimonials, igHandle, photoIds } = config

  return (
    <div className="bg-[#0A0F0D]">
      {/* Nav */}
      <nav className="px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-display font-extrabold text-lg text-white">{businessName}</span>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className={`bg-gradient-to-r ${accent} text-[#0A0F0D] text-sm font-extrabold px-4 py-2 rounded-full hover:opacity-90 transition-opacity`}>
          {ctaLabel}
        </a>
      </nav>

      {/* Hero com foto de fundo + numero gigante sobreposto */}
      <section className="relative px-6 py-20 sm:py-28 overflow-hidden">
        <img src={unsplashPhoto(photoIds[0], 1600, 900)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F0D] via-[#0A0F0D]/70 to-[#0A0F0D]/40" />

        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-3">{tagline}</p>
          <h1 className="font-display font-extrabold text-[clamp(28px,6vw,48px)] leading-[1.08] text-white mb-3">
            {heroTitle}
          </h1>
          {/* numero gigante em destaque */}
          <div className="my-8">
            <span className={`font-display font-extrabold text-[clamp(60px,15vw,120px)] leading-none bg-gradient-to-r ${accent} bg-clip-text text-transparent block`}>
              500+
            </span>
            <span className="text-sm text-white/50 uppercase tracking-widest">alunos transformados</span>
          </div>
          <p className="text-base text-white/60 max-w-lg mx-auto mb-8">{heroSub}</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 bg-gradient-to-r ${accent} text-[#0A0F0D] font-extrabold px-8 py-4 rounded-full hover:-translate-y-px hover:shadow-2xl transition-all`}>
            {ctaLabel} →
          </a>
        </div>
      </section>

      {/* Estatísticas grid — bem grande, protagonista */}
      <section className="px-6 py-10 border-y border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[['+8', 'anos'], ['24/7', 'acesso'], ['4.8★', 'avaliação'], ['+30', 'aulas/semana']].map(([n, l]) => (
            <div key={l}>
              <span className={`font-display font-extrabold text-2xl sm:text-3xl bg-gradient-to-r ${accent} bg-clip-text text-transparent block`}>{n}</span>
              <span className="text-[11px] text-white/40 uppercase tracking-wide">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Serviços — ficha de treino com barra de progresso */}
      <section className="px-6 py-16 sm:py-20 max-w-2xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl text-white mb-8 text-center">Nossa ficha de treino</h2>
        <div className="flex flex-col gap-5">
          {services.map(({ icon, title, desc }, i) => (
            <div key={title}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-lg">{icon}</span>
                <span className="font-display font-bold text-sm text-white flex-1">{title}</span>
                <span className={`font-display font-extrabold text-xs bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>{progress[i % progress.length]}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden ml-8">
                <div className={`h-full bg-gradient-to-r ${accent} rounded-full`} style={{ width: `${progress[i % progress.length]}%` }} />
              </div>
              <p className="text-xs text-white/40 mt-1 ml-8">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <InstagramFeedStrip posts={posts} igHandle={igHandle} businessName={businessName} accent={accent} photoIds={photoIds} />

      {/* Antes/depois lado a lado */}
      <section className="px-6 py-16 sm:py-20 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {testimonials.map(({ name, text }, i) => (
            <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <img src={unsplashPhotoFrom(photoIds, i + 1, 500, 300)} alt="" className="w-full aspect-video object-cover rounded-lg mb-4" />
              <p className="text-sm text-white/70 leading-relaxed mb-3">&ldquo;{text}&rdquo;</p>
              <p className="text-xs font-bold text-white/40">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center border-t border-white/10">
        <h2 className="font-display font-extrabold text-2xl text-white mb-6">Sua transformação começa hoje</h2>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 bg-gradient-to-r ${accent} text-[#0A0F0D] font-extrabold px-8 py-4 rounded-full hover:-translate-y-px hover:shadow-2xl transition-all`}>
          {ctaLabel} →
        </a>
      </section>
    </div>
  )
}
