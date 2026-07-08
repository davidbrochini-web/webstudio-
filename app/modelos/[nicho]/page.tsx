import { niches, getNiche } from '@/lib/templates'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export function generateStaticParams() {
  return niches.map(n => ({ nicho: n.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ nicho: string }> }
): Promise<Metadata> {
  const { nicho } = await params
  const config = getNiche(nicho)
  if (!config) return {}
  return {
    title: `${config.label} — modelo de site | webstudio`,
    description: config.heroSub,
    robots: { index: false }, // previews não indexam
  }
}

export default async function NichePreview(
  { params }: { params: Promise<{ nicho: string }> }
) {
  const { nicho } = await params
  const config = getNiche(nicho)
  if (!config) notFound()

  const {
    businessName, tagline, heroTitle, heroSub, ctaLabel,
    accent, solidBg, services, posts, testimonials, igHandle,
  } = config

  return (
    <div className="min-h-screen bg-white">

      {/* ── Barra de preview da agência ─────────────────────── */}
      <div className="sticky top-0 z-50 bg-[var(--dark)] text-white px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold grad-text flex-shrink-0">webstudio</span>
          <span className="text-xs text-white/50 truncate">
            — modelo: {config.label}. Esse site pode ser seu.
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/#templates"
            className="text-xs font-medium text-white/60 hover:text-white transition-colors px-2 py-1"
          >
            ← Voltar
          </Link>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold bg-[#25D366] hover:bg-[#22c55e] transition-colors px-3 py-1.5 rounded-lg"
          >
            Quero esse site
          </a>
        </div>
      </div>

      {/* ── Nav do site fictício ────────────────────────────── */}
      <nav className="border-b border-[var(--border)] px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-display font-extrabold text-lg text-[var(--dark)]">{businessName}</span>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className={`${solidBg} text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity`}
        >
          {ctaLabel}
        </a>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className={`bg-gradient-to-br ${accent} px-6 py-20 sm:py-28`}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-4">{tagline}</p>
          <h1 className="font-display font-extrabold text-[clamp(30px,6vw,52px)] leading-[1.1] text-white drop-shadow-sm mb-5">
            {heroTitle}
          </h1>
          <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-xl mx-auto mb-8">
            {heroSub}
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[var(--dark)] font-bold px-7 py-3.5 rounded-xl hover:-translate-y-px hover:shadow-xl transition-all"
          >
            💬 {ctaLabel}
          </a>
        </div>
      </section>

      {/* ── Serviços ────────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--dark)] text-center mb-12">
            O que oferecemos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {services.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 border border-[var(--border)] rounded-2xl hover:shadow-md transition-shadow">
                <span className="text-3xl flex-shrink-0">{icon}</span>
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--dark)] mb-1">{title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feed Instagram (simulado) ───────────────────────── */}
      <section className="px-6 py-16 sm:py-20 bg-[var(--off)] border-y border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center text-white font-bold`}>
                {businessName[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--dark)] leading-tight">{igHandle}</p>
                <p className="text-xs text-[var(--muted)]">Direto do Instagram</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-blink" />
              <span className="text-xs font-semibold text-[var(--green)]">Atualizado agora</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {posts.map(({ emoji, bg, likes, caption }, i) => (
              <div
                key={caption}
                className={`relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${bg} group cursor-default`}
              >
                {i === 0 && (
                  <span className="absolute top-2 left-2 z-10 text-[9px] font-bold text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded-full">
                    ✦ novo
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl">{emoji}</div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 px-2">
                  <span className="text-white text-xs font-bold">❤️ {likes}</span>
                  <span className="text-white/80 text-[10px] text-center leading-tight">{caption}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--muted)] mt-4">
            Este feed se atualiza sozinho a cada publicação no Instagram.
          </p>
        </div>
      </section>

      {/* ── Depoimentos ─────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--dark)] text-center mb-12">
            Quem já conhece, recomenda
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {testimonials.map(({ name, text }) => (
              <figure key={name} className="p-6 bg-[var(--off)] border border-[var(--border)] rounded-2xl">
                <div className="flex gap-0.5 mb-3 text-sm">{'⭐'.repeat(5)}</div>
                <blockquote className="text-sm text-[var(--slate)] leading-relaxed mb-3">
                  &ldquo;{text}&rdquo;
                </blockquote>
                <figcaption className="text-xs font-bold text-[var(--muted)]">{name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────── */}
      <section className={`bg-gradient-to-br ${accent} px-6 py-16 sm:py-20 text-center`}>
        <div className="max-w-xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-4">
            Fale com a gente agora
          </h2>
          <p className="text-white/85 mb-8">Atendimento rápido pelo WhatsApp — sem compromisso.</p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[var(--dark)] font-bold px-7 py-3.5 rounded-xl hover:-translate-y-px hover:shadow-xl transition-all"
          >
            💬 {ctaLabel}
          </a>
        </div>
      </section>

      {/* ── Footer do site fictício ─────────────────────────── */}
      <footer className="bg-[var(--dark)] px-6 py-8 text-center">
        <p className="font-display font-bold text-white mb-1">{businessName}</p>
        <p className="text-xs text-white/30">
          Site criado por{' '}
          <Link href="/" className="grad-text font-bold">webstudio</Link>
        </p>
      </footer>
    </div>
  )
}
