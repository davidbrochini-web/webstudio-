import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import HeroCarousel, { type CarouselSlide } from '@/components/dentista-joao/HeroCarousel'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    title: site.business_name,
    description: site.tagline ?? undefined,
    robots: { index: false }, // rascunho — nunca indexar antes do conteúdo final aprovado
  }
}

export default async function HomePage() {
  const site = await getSiteEspecial()
  const supabase = await createClient()

  const [{ data: tratamentos }, { data: faqPrevia }, { data: cursos }, { data: artigos }, { data: fotos }] = await Promise.all([
    supabase
      .from('site_tratamentos')
      .select('slug, titulo, descricao_curta, imagem_url')
      .eq('site_id', site.id)
      .eq('publicado', true)
      .is('deleted_at', null)
      .order('ordem')
      .limit(6),
    supabase
      .from('site_faq')
      .select('pergunta, resposta')
      .eq('site_id', site.id)
      .is('deleted_at', null)
      .order('ordem')
      .limit(3),
    supabase
      .from('site_cursos_eventos')
      .select('slug, titulo, descricao, imagem_url')
      .eq('site_id', site.id)
      .eq('publicado', true)
      .is('deleted_at', null)
      .order('ordem')
      .limit(3),
    supabase
      .from('site_blog_posts')
      .select('slug, titulo, resumo, capa_url')
      .eq('site_id', site.id)
      .eq('publicado', true)
      .is('deleted_at', null)
      .order('ordem')
      .limit(3),
    supabase
      .from('site_fotos')
      .select('url')
      .eq('site_id', site.id)
      .is('deleted_at', null)
      .order('ordem')
      .limit(1),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: site.business_name,
    ...(site.telefone && { telephone: site.telefone }),
    ...(site.endereco && { address: site.endereco }),
  }

  // 3 slides — o principal (config do site) + os 2 primeiros
  // tratamentos em destaque, mesmo padrão do site de referência
  // (slide 1 = apresentação, slides 2-3 = chamada pra tratamento
  // específico). Sem tabela nova: reaproveita o que já existe.
  const slides: CarouselSlide[] = [
    {
      titulo: site.hero_title || site.business_name,
      subtitulo: site.hero_sub || '',
      imagem_url: site.hero_imagem_url,
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

      <HeroCarousel slides={slides} />

      {/* Bem-vindo — foto emoldurada + texto + CTA pra A Clínica (mesmo
          padrão do site de referência: "Bem vindo à Clínica do X") */}
      {fotos?.[0] && (
        <section className="px-6 py-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <img src={fotos[0].url} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl border-4 border-[#0EA5A0]/20" />
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-400 mb-1">Bem-vindo à</h2>
            <p className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-4">{site.business_name}</p>
            <p className="text-slate-500 leading-relaxed mb-6">
              {site.tagline || 'Conheça nossa filosofia de trabalho e nossa infraestrutura completa. (Texto de exemplo.)'}
            </p>
            <Link href="/projetos-especiais/dentista-joao/a-clinica" className="inline-block bg-[#0B2B3C] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
              Conheça a Clínica
            </Link>
          </div>
        </section>
      )}

      {/* Áreas de Atuação — faixa cheia colorida, igual referência */}
      {!!tratamentos?.length && (
        <section className="px-6 py-16 bg-[#0EA5A0]">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-extrabold text-2xl text-white text-center mb-2">Áreas de Atuação</h2>
            <p className="text-center text-white/80 text-sm mb-10">Tratamentos pensados pra sua saúde e bem-estar.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {tratamentos.map(t => (
                <div key={t.slug} className="border border-white/30 rounded-2xl p-6 flex flex-col">
                  <h3 className="font-display font-bold text-base text-white mb-2">{t.titulo}</h3>
                  <p className="text-sm text-white/80 leading-relaxed mb-4 flex-1">{t.descricao_curta}</p>
                  <Link href={`/projetos-especiais/dentista-joao/tratamentos/${t.slug}`} className="self-start text-xs font-bold uppercase tracking-wide text-white border border-white/50 rounded-full px-4 py-2 hover:bg-white hover:text-[#0EA5A0] transition-colors">
                    Saiba Mais
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Agenda de Cursos e Palestras */}
      {!!cursos?.length && (
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] text-center mb-2">Agenda de Cursos e Palestras</h2>
          <p className="text-center text-slate-500 text-sm mb-10">Também atuamos como palestrantes em instituições de ensino e eventos.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {cursos.map(c => (
              <Link key={c.slug} href={`/projetos-especiais/dentista-joao/cursos-e-eventos/${c.slug}`} className="block group border border-slate-100 rounded-2xl overflow-hidden hover:border-[#0EA5A0] transition-colors">
                {c.imagem_url && <img src={c.imagem_url} alt="" className="w-full aspect-[4/3] object-cover" />}
                <div className="p-5">
                  <h3 className="font-display font-bold text-base text-[#0B2B3C] mb-1.5">{c.titulo}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{c.descricao}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/projetos-especiais/dentista-joao/cursos-e-eventos" className="inline-block bg-[#0B2B3C] text-white font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
              Ver todos os cursos e eventos
            </Link>
          </div>
        </section>
      )}

      {/* Prévia de FAQ */}
      {!!faqPrevia?.length && (
        <section className="px-6 py-16 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] text-center mb-10">Dúvidas Frequentes</h2>
            <div className="flex flex-col gap-3">
              {faqPrevia.map(f => (
                <div key={f.pergunta} className="bg-white border border-slate-100 rounded-xl p-4">
                  <p className="font-display font-bold text-sm text-[#0B2B3C] mb-1">{f.pergunta}</p>
                  <p className="text-sm text-slate-500">{f.resposta}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/projetos-especiais/dentista-joao/duvidas-frequentes" className="text-sm font-semibold text-[#0EA5A0]">
                Ver todas as perguntas →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Novidades — prévia do blog, igual "Novidades Clínicas" da referência */}
      {!!artigos?.length && (
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] text-center mb-2">Novidades</h2>
          <p className="text-center text-slate-500 text-sm mb-10">Acompanhe nossos artigos e fique atualizado.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {artigos.map(a => (
              <Link key={a.slug} href={`/projetos-especiais/dentista-joao/artigos/${a.slug}`} className="block group">
                {a.capa_url && <img src={a.capa_url} alt="" className="w-full aspect-[16/10] object-cover rounded-2xl mb-3" />}
                <h3 className="font-display font-bold text-sm text-[#0B2B3C] mb-1 leading-snug">{a.titulo}</h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{a.resumo}</p>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/projetos-especiais/dentista-joao/artigos" className="inline-block border border-slate-200 text-[#0B2B3C] font-bold text-sm px-6 py-3 rounded-full hover:bg-slate-50 transition-colors">
              Ver todos os artigos
            </Link>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="px-6 py-16 text-center bg-[#0B2B3C]">
        <h2 className="font-display font-extrabold text-2xl text-white mb-4">Vamos cuidar do seu sorriso?</h2>
        <Link href="/projetos-especiais/dentista-joao/contato" className="inline-block bg-[#0EA5A0] text-white font-bold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity">
          Marcar consulta
        </Link>
      </section>
    </PageShell>
  )
}
