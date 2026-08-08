import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/colegio-elite'
import { texto } from '@/lib/textos-customizados'
import PageShell from '@/components/colegio-elite/PageShell'
import Reveal from '@/components/colegio-elite/Reveal'
import ContatoForm from '@/components/colegio-elite/ContatoForm'
import InstagramFeedStrip from '@/components/colegio-elite/InstagramFeedStrip'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    title: { absolute: site.business_name },
    description: site.tagline ?? undefined,
    alternates: { canonical: SITE_URL_BASE },
  }
}

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=60'
const STUDENTS_FALLBACK = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=60'

// Fotos reais recortadas do print do Instagram do colégio (@colegioelite)
// que o David mandou — usadas na faixa de Instagram até a integração
// real com a API ser habilitada (pendência de plataforma).
const IG_BASE = 'https://evlrrtwobsegggvykphr.supabase.co/storage/v1/object/public/site-fotos/colegio-elite/b9b5f561-f53d-4f8d-b932-3696e1c30d96/instagram'
const IG_PHOTOS = Array.from({ length: 8 }, (_, i) => `${IG_BASE}/post-${String(i).padStart(2, '0')}.jpg`)

const SEGMENTO_FALLBACK: Record<string, string> = {
  'educacao-infantil': 'https://images.unsplash.com/photo-1587616211892-b3fc0e7e5db8?w=900&q=60',
  'ensino-bilingue': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=60',
  'ensino-fundamental': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=60',
  'ensino-medio': STUDENTS_FALLBACK,
}

export default async function HomePage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const supabase = await createClient()

  const [{ data: diferenciaisRaw }, { data: segmentosRaw }, { data: faqPreviaRaw }, { data: artigosRaw }] = await Promise.all([
    supabase.from('site_diferenciais').select('icone, titulo, texto').eq('site_id', site.id).is('deleted_at', null).order('ordem').limit(5),
    supabase.from('site_segmentos_ensino').select('slug, titulo, resumo, texto_completo, imagem_url').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null).order('ordem').limit(4),
    supabase.from('site_faq').select('pergunta, resposta').eq('site_id', site.id).is('deleted_at', null).order('ordem').limit(4),
    supabase.from('site_blog_posts').select('slug, titulo, resumo, capa_url').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null).order('ordem').limit(3),
  ])

  const diferenciais = site.secao_diferenciais_visivel ? (diferenciaisRaw ?? []) : []
  const segmentos = site.secao_segmentos_visivel ? (segmentosRaw ?? []) : []
  const faqPrevia = site.secao_faq_visivel ? (faqPreviaRaw ?? []) : []
  const artigos = site.secao_artigos_visivel ? (artigosRaw ?? []) : []
  const porSlug = (slug: string) => segmentos.find(s => s.slug === slug)

  const infantil = porSlug('educacao-infantil')
  const bilingue = porSlug('ensino-bilingue')
  const fundamental = porSlug('ensino-fundamental')
  const medio = porSlug('ensino-medio')

  const mapsQuery = site.endereco ? encodeURIComponent(site.endereco) : null

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

      {/* 1 — Banner aéreo com animação de sobrevoo */}
      <section className="relative overflow-hidden min-h-[480px] sm:min-h-[620px] lg:min-h-[700px] flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={site.hero_imagem_url || HERO_FALLBACK}
          alt=""
          className="ce-hero-drone absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '50% 38%' }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 140px 40px rgba(15,31,61,0.35)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ce-secondary)]/92 via-[var(--ce-secondary)]/55 to-transparent" />
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

      <InstagramFeedStrip site={site} fotos={IG_PHOTOS} />

      {/* 2 — Proposta, com o texto inteiro (inclui Sistema Bilíngue) */}
      <section id="proposta" className="px-6 py-16 sm:py-20 max-w-3xl mx-auto">
        <Reveal>
          <p className="text-[var(--ce-primary)] font-bold text-xs uppercase tracking-widest mb-2 text-center">Nossa proposta</p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ce-secondary)] mb-6 text-center">Proposta Pedagógica</h2>
          {site.tagline?.split('\n\n').filter(Boolean).map((par: string, i: number) => (
            <p key={i} className="text-slate-600 leading-relaxed mb-4">{par}</p>
          ))}
        </Reveal>
        {bilingue && (
          <Reveal delay={100}>
            <div className="mt-10 pt-10 border-t border-slate-100">
              <h3 className="font-display font-bold text-xl text-[var(--ce-secondary)] mb-4">Sistema Bilíngue — English Stars</h3>
              {bilingue.texto_completo.split('\n\n').filter(Boolean).map((par: string, i: number) => (
                <p key={i} className="text-slate-600 leading-relaxed mb-4">{par}</p>
              ))}
            </div>
          </Reveal>
        )}
      </section>

      {/* 3 — Foto das crianças + diferenciais rápidos */}
      <section className="px-6 py-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <Reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STUDENTS_FALLBACK} alt="Alunos do Colégio Elite" className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg" />
        </Reveal>
        <Reveal delay={100}>
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: '🎓', label: 'Professores Qualificados' },
              { icon: '🧪', label: 'Laboratórios equipados' },
              { icon: '💻', label: 'Sistema Informatizado' },
              { icon: '🛡️', label: 'Segurança 24 Horas' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{b.icon}</span>
                <span className="text-sm font-semibold text-[var(--ce-secondary)] leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 4 — História, com o texto */}
      <section id="historia" className="px-6 py-16 sm:py-20 bg-[var(--ce-secondary)]">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="text-[var(--ce-primary)] font-bold text-xs uppercase tracking-widest mb-2 text-center">42 anos</p>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-6 text-center">Nossa História</h2>
            {texto(site.textos_customizados, 'home_historia_texto', '').split('\n\n').filter(Boolean).map((par: string, i: number) => (
              <p key={i} className="text-white/80 leading-relaxed mb-4">{par}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 5 — Ensino Infantil */}
      {infantil && (
        <section id="ensino-infantil" className="px-6 py-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <p className="text-[var(--ce-primary)] font-bold text-xs uppercase tracking-widest mb-2">Do maternal ao 5º ano</p>
            <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] mb-4">{infantil.titulo}</h2>
            {infantil.texto_completo.split('\n\n').filter(Boolean).map((par: string, i: number) => (
              <p key={i} className="text-slate-600 leading-relaxed mb-3 text-sm">{par}</p>
            ))}
          </Reveal>
          <Reveal delay={100}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={infantil.imagem_url || SEGMENTO_FALLBACK['educacao-infantil']} alt={infantil.titulo} className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg" />
          </Reveal>
        </section>
      )}

      {/* 6 — Ensino Fundamental I e II */}
      {fundamental && (
        <section id="ensino-fundamental" className="px-6 py-16 bg-slate-50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <Reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fundamental.imagem_url || SEGMENTO_FALLBACK['ensino-fundamental']} alt={fundamental.titulo} className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg" />
            </Reveal>
            <Reveal delay={100}>
              <p className="text-[var(--ce-primary)] font-bold text-xs uppercase tracking-widest mb-2">1º ao 9º ano</p>
              <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] mb-4">{fundamental.titulo}</h2>
              {fundamental.texto_completo.split('\n\n').filter(Boolean).map((par: string, i: number) => (
                <p key={i} className="text-slate-600 leading-relaxed mb-3 text-sm">{par}</p>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* 7 — Ensino Médio */}
      {medio && (
        <section id="ensino-medio" className="px-6 py-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <p className="text-[var(--ce-primary)] font-bold text-xs uppercase tracking-widest mb-2">Rumo ao futuro</p>
            <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] mb-4">{medio.titulo}</h2>
            {medio.texto_completo.split('\n\n').filter(Boolean).map((par: string, i: number) => (
              <p key={i} className="text-slate-600 leading-relaxed mb-3 text-sm">{par}</p>
            ))}
          </Reveal>
          <Reveal delay={100}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={medio.imagem_url || SEGMENTO_FALLBACK['ensino-medio']} alt={medio.titulo} className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg" />
          </Reveal>
        </section>
      )}

      {/* 8 — Sistema Anglo de Ensino */}
      <section id="sistema-anglo" className="px-6 py-16 sm:py-20 bg-[var(--ce-primary)]">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="text-white/70 font-bold text-xs uppercase tracking-widest mb-2">Escola parceira do</p>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-6">Sistema Anglo de Ensino</h2>
            {texto(site.textos_customizados, 'home_sistema_anglo_texto', '').split('\n\n').filter(Boolean).map((par: string, i: number) => (
              <p key={i} className="text-white/85 leading-relaxed mb-4 text-left sm:text-center">{par}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Diferenciais */}
      {!!diferenciais.length && (
        <section className="px-5 sm:px-6 py-16 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] text-center mb-2">
              {texto(site.textos_customizados, 'home_diferenciais_titulo', 'Diferenciais da nossa escola')}
            </h2>
            <p className="text-center text-slate-500 text-sm mb-10">Estrutura e cuidado pensados pra cada fase do seu filho</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {diferenciais.map((d, i) => (
                <Reveal key={d.titulo} delay={i * 60}>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 h-full flex gap-4">
                    <span className="text-2xl flex-shrink-0">{d.icone}</span>
                    <div>
                      <p className="font-display font-bold text-[var(--ce-secondary)] text-sm mb-1">{d.titulo}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{d.texto}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9 — Estrutura, com fotos diversas (link pra galeria completa) */}
      <section id="estrutura" className="px-5 sm:px-6 py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] text-center mb-2">Estrutura</h2>
          <p className="text-center text-slate-500 text-sm mb-10">Mais de 2.600m² pensados pro bem-estar dos alunos</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {IG_PHOTOS.slice(3, 7).map((url, i) => (
              <Reveal key={url} delay={i * 60}>
                <div className="overflow-hidden rounded-2xl aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href={`${base}/estrutura`} className="text-sm font-bold text-[var(--ce-primary)] hover:opacity-80">
              Ver todos os diferenciais →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ — bônus, não numerado, mas útil antes do contato */}
      {!!faqPrevia.length && (
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

      {/* 10 — Notícias, com exemplos reais de novidades */}
      {!!artigos.length && (
        <section id="noticias" className="px-5 sm:px-6 py-16 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] text-center mb-2">Notícias</h2>
            <p className="text-center text-slate-500 text-sm mb-10">Fique por dentro de tudo que acontece no Colégio Elite!</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {artigos.map(a => (
                <Link key={a.slug} href={`${base}/noticias/${a.slug}`} className="group block rounded-2xl overflow-hidden shadow-lg bg-slate-50">
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

      {/* 11 — Localização, com mapa e endereço */}
      <section id="localizacao" className="px-5 sm:px-6 py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] text-center mb-2">Localização</h2>
          {site.endereco && <p className="text-center text-slate-500 text-sm mb-8">📍 {site.endereco}</p>}
          {mapsQuery && (
            <div className="rounded-2xl overflow-hidden shadow-lg aspect-[16/7]">
              <iframe
                title="Localização do Colégio Elite"
                src={`https://maps.google.com/maps?q=${mapsQuery}&t=m&z=15&output=embed&iwloc=near`}
                width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </section>

      {/* 12 — Contato, formulário e dados */}
      <section id="contato" className="px-5 sm:px-6 py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Reveal>
            <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] mb-2">Contato</h2>
            <p className="text-slate-500 text-sm mb-6">Para esclarecer dúvidas, enviar críticas, elogios ou sugestões, envie sua mensagem ou fale conosco.</p>
            <ContatoForm />
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-col gap-3 text-sm text-slate-600 bg-slate-50 rounded-2xl p-6">
              {site.telefone && <p>📞 {site.telefone}</p>}
              {site.whatsapp && <p>💬 WhatsApp disponível</p>}
              {site.endereco && <p>📍 {site.endereco}</p>}
              {site.instagram_visivel && site.instagram_handle && (
                <p>📷 <a href={`https://instagram.com/${site.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-[var(--ce-primary)] font-semibold">@{site.instagram_handle}</a></p>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  )
}
