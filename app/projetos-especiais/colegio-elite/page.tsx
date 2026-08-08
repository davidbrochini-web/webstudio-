import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/colegio-elite'
import { texto } from '@/lib/textos-customizados'
import PageShell from '@/components/colegio-elite/PageShell'
import Reveal from '@/components/colegio-elite/Reveal'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    title: { absolute: site.business_name },
    description: site.tagline ?? undefined,
    alternates: { canonical: SITE_URL_BASE },
  }
}

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=60'

export default async function HomePage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const supabase = await createClient()

  const [{ data: diferenciaisRaw }, { data: segmentosRaw }, { data: faqPreviaRaw }, { data: artigosRaw }] = await Promise.all([
    supabase.from('site_diferenciais').select('icone, titulo, texto').eq('site_id', site.id).is('deleted_at', null).order('ordem').limit(5),
    supabase.from('site_segmentos_ensino').select('slug, titulo, resumo, imagem_url').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null).order('ordem').limit(3),
    supabase.from('site_faq').select('pergunta, resposta').eq('site_id', site.id).is('deleted_at', null).order('ordem').limit(3),
    supabase.from('site_blog_posts').select('slug, titulo, resumo, capa_url').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null).order('ordem').limit(3),
  ])

  const diferenciais = site.secao_diferenciais_visivel ? diferenciaisRaw : []
  const segmentos = site.secao_segmentos_visivel ? segmentosRaw : []
  const faqPrevia = site.secao_faq_visivel ? faqPreviaRaw : []
  const artigos = site.secao_artigos_visivel ? artigosRaw : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'School',
    name: site.business_name,
    url: SITE_URL_BASE,
    ...(site.tagline && { description: site.tagline }),
    ...(site.hero_imagem_url && { image: site.hero_imagem_url }),
    ...(site.telefone && { telephone: site.telefone }),
    ...(site.endereco && { address: site.endereco }),
    ...(site.instagram_handle && {
      sameAs: [`https://instagram.com/${site.instagram_handle.replace('@', '')}`],
    }),
  }

  return (
    <PageShell site={site}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[420px] sm:min-h-[520px] flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={site.hero_imagem_url || HERO_FALLBACK}
          alt=""
          className="ce-hero-drone absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ce-secondary)]/92 via-[var(--ce-secondary)]/60 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-6 py-16">
          <p className="text-[var(--ce-primary)] font-bold text-xs uppercase tracking-widest mb-3">Colégio Elite · 42 anos de história</p>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white mb-4 max-w-xl leading-tight">
            {site.hero_title || site.business_name}
          </h1>
          <p className="text-white/85 text-sm sm:text-lg max-w-lg mb-8">
            {site.hero_sub}
          </p>
          <Link
            href={`${base}/contato`}
            className="inline-block bg-white text-[var(--ce-secondary)] font-bold px-6 py-3.5 rounded-full text-sm shadow-lg hover:opacity-90 transition-opacity"
          >
            {texto(site.textos_customizados, 'nav_cta', 'Fale Conosco')}
          </Link>
        </div>
      </section>

      {/* Diferenciais */}
      {!!diferenciais?.length && (
        <section className="px-5 sm:px-6 py-16 bg-[var(--ce-primary)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-extrabold text-2xl text-white text-center mb-2">
              {texto(site.textos_customizados, 'home_diferenciais_titulo', 'Diferenciais da nossa escola')}
            </h2>
            <p className="text-center text-white/80 text-sm mb-10">Estrutura e cuidado pensados pra cada fase do seu filho</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {diferenciais.map((d, i) => (
                <Reveal key={d.titulo} delay={i * 60}>
                  <div className="bg-white/10 rounded-2xl p-5 text-center h-full">
                    <p className="text-3xl mb-2">{d.icone}</p>
                    <p className="font-display font-bold text-white text-sm">{d.titulo}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bem-vindo / institucional */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <Reveal>
          <p className="text-[var(--ce-primary)] font-bold text-xs uppercase tracking-widest mb-3">Bem-vindo ao</p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ce-secondary)] mb-4">{site.business_name}</h2>
          <p className="text-slate-600 leading-relaxed">
            {site.tagline}
          </p>
        </Reveal>
      </section>

      {/* Segmentos de ensino */}
      {!!segmentos?.length && (
        <section className="px-5 sm:px-6 py-16 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] text-center mb-2">
              {texto(site.textos_customizados, 'home_ensino_titulo', 'Nossos Segmentos de Ensino')}
            </h2>
            <p className="text-center text-slate-500 text-sm mb-10">Do maternal ao Ensino Médio, uma formação contínua e sólida</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {segmentos.map((s, i) => (
                <Reveal key={s.slug} delay={i * 80}>
                  <Link href={`${base}/ensino/${s.slug}`} className="group block rounded-2xl overflow-hidden shadow-lg bg-white h-full">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.imagem_url || HERO_FALLBACK} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <p className="font-display font-bold text-[var(--ce-secondary)] mb-1.5">{s.titulo}</p>
                      <p className="text-sm text-slate-500 leading-snug">{s.resumo}</p>
                      <p className="text-xs font-bold text-[var(--ce-primary)] mt-3">Saiba mais →</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ prévia */}
      {!!faqPrevia?.length && (
        <section className="px-5 sm:px-6 py-16 max-w-3xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] text-center mb-8">Dúvidas Frequentes</h2>
          <div className="flex flex-col gap-3">
            {faqPrevia.map(f => (
              <div key={f.pergunta} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                <p className="font-display font-bold text-sm text-[var(--ce-secondary)] mb-1.5">{f.pergunta}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{f.resposta}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notícias */}
      {!!artigos?.length && (
        <section className="px-5 sm:px-6 py-16 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] text-center mb-10">Fique por dentro</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {artigos.map(a => (
                <Link key={a.slug} href={`${base}/noticias/${a.slug}`} className="group block rounded-2xl overflow-hidden shadow-lg bg-white">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.capa_url || HERO_FALLBACK} alt={a.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <p className="font-display font-bold text-[var(--ce-secondary)] mb-1.5 text-sm leading-snug">{a.titulo}</p>
                    <p className="text-xs text-slate-500 leading-snug">{a.resumo}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  )
}
