import { niches, getNiche } from '@/lib/templates'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import HeroSplit from '@/components/site-template/HeroSplit'
import HeroCentered from '@/components/site-template/HeroCentered'
import HeroDarkBold from '@/components/site-template/HeroDarkBold'
import InstagramFeedStrip from '@/components/site-template/InstagramFeedStrip'

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
    robots: { index: false },
  }
}

const heroByLayout = {
  split: HeroSplit,
  centered: HeroCentered,
  'dark-bold': HeroDarkBold,
}

export default async function NichePreview(
  { params }: { params: Promise<{ nicho: string }> }
) {
  const { nicho } = await params
  const config = getNiche(nicho)
  if (!config) notFound()

  const { businessName, solidBg, services, posts, testimonials, igHandle, accent, heroLayout, ctaLabel } = config
  const HeroComponent = heroByLayout[heroLayout]

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
          <Link href="/#templates" className="text-xs font-medium text-white/60 hover:text-white transition-colors px-2 py-1">
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

      {/* ── Hero — varia por arquétipo (split / centered / dark-bold) ── */}
      <HeroComponent config={config} />

      {/* ── Instagram em destaque — logo após o hero, ponta a ponta ── */}
      <InstagramFeedStrip posts={posts} igHandle={igHandle} businessName={businessName} accent={accent} />

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

      {/* ── Depoimentos ─────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20 bg-[var(--off)] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--dark)] text-center mb-12">
            Quem já conhece, recomenda
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {testimonials.map(({ name, text }) => (
              <figure key={name} className="p-6 bg-white border border-[var(--border)] rounded-2xl">
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
