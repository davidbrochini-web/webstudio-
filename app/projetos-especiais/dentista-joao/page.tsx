import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    title: site.business_name,
    description: site.tagline ?? undefined,
    robots: { index: site.status === 'publicado' },
  }
}

export default async function HomePage() {
  const site = await getSiteEspecial()
  const supabase = await createClient()

  const [{ data: tratamentos }, { data: faqPrevia }] = await Promise.all([
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
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: site.business_name,
    ...(site.telefone && { telephone: site.telefone }),
    ...(site.endereco && { address: site.endereco }),
  }

  return (
    <PageShell site={site}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#0B2B3C] mb-4">
          {site.hero_title || site.business_name}
        </h1>
        {site.hero_sub && <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">{site.hero_sub}</p>}
        <div className="flex items-center justify-center gap-3">
          <Link href="/projetos-especiais/dentista-joao/contato" className="bg-[#0EA5A0] text-white font-bold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity">
            Marcar consulta
          </Link>
          <Link href="/projetos-especiais/dentista-joao/tratamentos" className="border border-slate-200 text-[#0B2B3C] font-bold px-6 py-3.5 rounded-full hover:bg-slate-50 transition-colors">
            Ver tratamentos
          </Link>
        </div>
      </section>

      {/* Tratamentos em destaque */}
      {!!tratamentos?.length && (
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] text-center mb-10">Especialidades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {tratamentos.map(t => (
              <Link key={t.slug} href={`/projetos-especiais/dentista-joao/tratamentos/${t.slug}`} className="block group border border-slate-100 rounded-2xl p-6 hover:border-[#0EA5A0] transition-colors">
                <h3 className="font-display font-bold text-base text-[#0B2B3C] mb-2">{t.titulo}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{t.descricao_curta}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Prévia de FAQ */}
      {!!faqPrevia?.length && (
        <section className="px-6 py-16 max-w-3xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] text-center mb-10">Dúvidas frequentes</h2>
          <div className="flex flex-col gap-3">
            {faqPrevia.map(f => (
              <div key={f.pergunta} className="border border-slate-100 rounded-xl p-4">
                <p className="font-display font-bold text-sm text-[#0B2B3C] mb-1">{f.pergunta}</p>
                <p className="text-sm text-slate-500">{f.resposta}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/projetos-especiais/dentista-joao/duvidas-frequentes" className="text-sm font-semibold text-[#0EA5A0]">
              Ver todas as dúvidas →
            </Link>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="px-6 py-16 text-center bg-slate-50">
        <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] mb-4">Vamos cuidar do seu sorriso?</h2>
        <Link href="/projetos-especiais/dentista-joao/contato" className="inline-block bg-[#0EA5A0] text-white font-bold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity">
          Marcar consulta
        </Link>
      </section>
    </PageShell>
  )
}
