import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import HeroCarousel, { type CarouselSlide } from '@/components/dentista-joao/HeroCarousel'
import Reveal from '@/components/dentista-joao/Reveal'
import WaveDivider from '@/components/dentista-joao/WaveDivider'
import FaqAccordion from '@/components/dentista-joao/FaqAccordion'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    title: { absolute: site.business_name },
    description: site.tagline ?? undefined,
    alternates: { canonical: SITE_URL_BASE },
  }
}

export default async function HomePage() {
  const site = await getSiteEspecial()
  const supabase = await createClient()

  const [{ data: tratamentosRaw }, { data: faqPreviaRaw }, { data: cursosRaw }, { data: artigosRaw }, { data: fotos }] = await Promise.all([
    supabase.from('site_tratamentos').select('slug, titulo, descricao_curta, imagem_url').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null).order('ordem').limit(6),
    supabase.from('site_faq').select('pergunta, resposta').eq('site_id', site.id).is('deleted_at', null).order('ordem').limit(3),
    supabase.from('site_cursos_eventos').select('slug, titulo, descricao, imagem_url').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null).order('ordem').limit(3),
    supabase.from('site_blog_posts').select('slug, titulo, resumo, capa_url').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null).order('ordem').limit(3),
    supabase.from('site_fotos').select('url').eq('site_id', site.id).is('deleted_at', null).order('ordem').limit(1),
  ])

  // Seção marcada como oculta no painel (VisibilidadeSecaoToggle) some da
  // Home também — os dados continuam no banco, só a prévia não aparece.
  const tratamentos = site.secao_tratamentos_visivel ? tratamentosRaw : []
  const faqPrevia = site.secao_faq_visivel ? faqPreviaRaw : []
  const cursos = site.secao_cursos_visivel ? cursosRaw : []
  const artigos = site.secao_artigos_visivel ? artigosRaw : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
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

  // Fallback pro slide principal: se o cliente remover a foto do banner
  // pelo Editor (EditableImage > Remover), o site não pode ficar sem
  // nenhuma imagem no hero — mesma foto padrão usada como placeholder
  // no preview do Editor (HeroSectionEditor), pra ficar consistente.
  const HERO_FALLBACK = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=60'

  const slides: CarouselSlide[] = [
    {
      titulo: site.hero_title || site.business_name,
      subtitulo: site.hero_sub || '',
      imagem_url: site.hero_imagem_url || HERO_FALLBACK,
      ctaLabel: 'Marcar consulta',
      ctaHref: '/projetos-especiais/dentista-joao/contato',
    },
    ...(tratamentos ?? []).slice(0, 2).map((t): CarouselSlide => ({
      titulo: t.titulo,
      subtitulo: t.descricao_curta,
      imagem_url: t.imagem_url,
      ctaLabel: 'Saiba Mais',
      ctaHref: `/projetos-especiais/dentista-joao/tratamentos/${t.slug}`,
    })),
  ]

  return (
    <PageShell site={site}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Carrossel hero */}
      <HeroCarousel slides={slides} />

      {/* Faixa de números/credenciais — imediatamente após o hero, mesmo
          padrão de clínicas de referência pra transmitir confiança rápido */}
      <div className="bg-[#0B2B3C] px-5 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          {[
            { numero: '10+', label: 'Anos de experiência' },
            { numero: '6',   label: 'Especialidades' },
            { numero: '100%', label: 'Dedicação ao paciente' },
            { numero: '5★',  label: 'Atendimento humanizado' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-[#0EA5A0]">{stat.numero}</p>
              <p className="text-xs sm:text-sm text-white/60 mt-1 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bem-vindo */}
      {fotos?.[0] && (
        <section className="px-6 py-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <img loading="lazy" decoding="async" src={fotos[0].url} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl border-4 border-[#0EA5A0]/20 shadow-lg" />
          </Reveal>
          <Reveal delay={150}>
            <h2 className="font-display font-bold text-2xl text-slate-400 mb-1">Bem-vindo à</h2>
            <p className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-4">{site.business_name}</p>
            <p className="text-slate-500 leading-relaxed mb-6">
              {site.tagline || 'Conheça nossa filosofia de trabalho e nossa infraestrutura completa.'}
            </p>
            <Link href="/projetos-especiais/dentista-joao/a-clinica" className="inline-block bg-[#0B2B3C] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0EA5A0] transition-colors">
              Conheça a Clínica
            </Link>
          </Reveal>
        </section>
      )}

      {/* Áreas de Atuação — seção com ondas */}
      {!!tratamentos?.length && (
        <>
          <WaveDivider fill="#0EA5A0" bg="white" />
          <section className="px-6 py-16 bg-[#0EA5A0]">
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <h2 className="font-display font-extrabold text-2xl text-white text-center mb-2">
                  Áreas de <strong className="font-extrabold">Atuação</strong>
                </h2>
                <p className="text-center text-white/80 text-sm mb-10">
                  Trabalhamos com inovação, dedicação e tecnologia para garantir o melhor tratamento aos nossos pacientes.
                </p>
              </Reveal>
              {/* Grade estilo revista — imagem full com overlay e título sobreposto */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {tratamentos.map((t, i) => (
                  <Reveal key={t.slug} delay={i * 70}
                    className={i === 0 ? 'col-span-2 sm:col-span-1' : ''}
                  >
                    <Link
                      href={`/projetos-especiais/dentista-joao/tratamentos/${t.slug}`}
                      className="group relative block overflow-hidden rounded-2xl shadow-lg"
                    >
                      {/* Imagem de fundo */}
                      {t.imagem_url ? (
                        <img
                          loading="lazy" decoding="async"
                          src={t.imagem_url}
                          alt={t.titulo}
                          className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${i === 0 ? 'aspect-[3/2] sm:aspect-[4/3]' : 'aspect-[4/3]'}`}
                        />
                      ) : (
                        <div className={`w-full bg-white/20 ${i === 0 ? 'aspect-[3/2] sm:aspect-[4/3]' : 'aspect-[4/3]'}`} />
                      )}
                      {/* Overlay gradiente sempre visível na base */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B3C]/90 via-[#0B2B3C]/20 to-transparent" />
                      {/* Hover: teal suave */}
                      <div className="absolute inset-0 bg-[#0EA5A0]/0 group-hover:bg-[#0EA5A0]/20 transition-colors duration-300" />
                      {/* Texto */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="font-display font-bold text-white text-sm leading-snug drop-shadow">
                          {t.titulo}
                        </p>
                        <p className="text-white/80 text-xs mt-1 line-clamp-2 leading-snug hidden group-hover:block">
                          {t.descricao_curta}
                        </p>
                        <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider text-[#0EA5A0] opacity-0 group-hover:opacity-100 transition-opacity">
                          Saiba Mais →
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
          <WaveDivider fill="#0EA5A0" bg="white" flip />
        </>
      )}

      {/* Cursos e Palestras */}
      {!!cursos?.length && (
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] text-center mb-2">
              Agenda de <strong>Cursos e Palestras</strong>
            </h2>
            <p className="text-center text-slate-500 text-sm mb-10">
              Também atuamos como palestrantes em instituições de ensino e eventos.
            </p>
          </Reveal>
          {/* Mobile: scroll horizontal tipo carrossel; tablet+: grid normal */}
          <div className="cursos-scroll sm:grid sm:grid-cols-3 sm:gap-6 mb-8">
            {cursos.map((c, i) => (
              <Link
                key={c.slug}
                href={`/projetos-especiais/dentista-joao/cursos-e-eventos/${c.slug}`}
                className="cursos-card group border border-slate-100 rounded-2xl overflow-hidden hover:border-[#0EA5A0] hover:shadow-lg transition-all flex-shrink-0 sm:flex-shrink sm:block"
              >
                {c.imagem_url && (
                  <div className="overflow-hidden">
                    <img loading="lazy" decoding="async" src={c.imagem_url} alt="" className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  {/* Badge de índice */}
                  <span className="inline-block bg-[#0EA5A0]/10 text-[#0EA5A0] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2">
                    Evento {i + 1}
                  </span>
                  <h3 className="font-display font-bold text-base text-[#0B2B3C] mb-1.5 group-hover:text-[#0EA5A0] transition-colors">{c.titulo}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{c.descricao}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/projetos-especiais/dentista-joao/cursos-e-eventos" className="inline-block bg-[#0B2B3C] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#0EA5A0] transition-colors">
              Ver todos os cursos e eventos
            </Link>
          </div>
        </section>
      )}

      {/* FAQ + foto do profissional */}
      {!!faqPrevia?.length && (
        <section className="px-5 sm:px-6 py-16 sm:py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_300px] gap-12 items-start">
            <div>
              <Reveal>
                <p className="text-[#0EA5A0] font-bold text-xs uppercase tracking-widest mb-2">Tire suas dúvidas</p>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#0B2B3C] mb-8 leading-tight">
                  Dúvidas<br className="hidden sm:block" /> Frequentes
                </h2>
              </Reveal>
              <FaqAccordion itens={faqPrevia ?? []} />
              <div className="mt-8">
                <Link href="/projetos-especiais/dentista-joao/duvidas-frequentes" className="inline-block bg-[#0B2B3C] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#0EA5A0] transition-colors shadow-md">
                  Ver todas as perguntas →
                </Link>
              </div>
            </div>
            {site.hero_imagem_url && (
              <Reveal className="hidden md:flex flex-col items-center gap-6">
                {/* Foto maior com moldura decorativa */}
                <div className="relative w-full max-w-[280px]">
                  <div className="absolute -top-3 -left-3 w-full h-full rounded-3xl border-2 border-[#0EA5A0]/40" />
                  <div className="absolute -bottom-3 -right-3 w-full h-full rounded-3xl bg-[#0B2B3C]/10" />
                  <img loading="lazy" decoding="async"
                    src={site.hero_imagem_url}
                    alt={site.business_name}
                    className="relative w-full aspect-[3/4] rounded-3xl object-cover shadow-2xl border-4 border-white"
                  />
                  {/* Chip de destaque */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#0EA5A0] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                    ✦ Atendimento humanizado
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <p className="font-display font-bold text-[#0B2B3C] text-base">{site.business_name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">Clínica Odontológica</p>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* Novidades */}
      {!!artigos?.length && (
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] text-center mb-2">
              Novidades <strong>Clínicas</strong>
            </h2>
            <p className="text-center text-slate-500 text-sm mb-10">
              Acompanhe nossos artigos e fique atualizado com os principais temas da área.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {artigos.map((a, i) => (
              <Reveal key={a.slug} delay={i * 100}>
                <Link href={`/projetos-especiais/dentista-joao/artigos/${a.slug}`} className="block group">
                  {a.capa_url && (
                    <div className="overflow-hidden rounded-2xl mb-3">
                      <img loading="lazy" decoding="async" src={a.capa_url} alt="" className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <h3 className="font-display font-bold text-sm text-[#0B2B3C] mb-1 leading-snug group-hover:text-[#0EA5A0] transition-colors">{a.titulo}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{a.resumo}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="text-center">
            <Link href="/projetos-especiais/dentista-joao/artigos" className="inline-block border border-slate-200 text-[#0B2B3C] font-bold text-sm px-6 py-3 rounded-full hover:bg-[#0B2B3C] hover:text-white transition-colors">
              Ver todos os artigos
            </Link>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="px-6 py-16 text-center bg-[#0B2B3C]">
        <Reveal>
          <h2 className="font-display font-extrabold text-2xl text-white mb-4">Vamos cuidar do seu sorriso?</h2>
          <Link href="/projetos-especiais/dentista-joao/contato" className="inline-block bg-[#0EA5A0] text-white font-bold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity">
            Marcar consulta
          </Link>
        </Reveal>
      </section>
    </PageShell>
  )
}
