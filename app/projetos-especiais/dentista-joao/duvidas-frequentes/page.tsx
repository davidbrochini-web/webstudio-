import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'
import SecaoOcultaAviso from '@/components/dentista-joao/SecaoOcultaAviso'
import Reveal from '@/components/dentista-joao/Reveal'
import FaqAccordion from '@/components/dentista-joao/FaqAccordion'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dúvidas Frequentes',
    description: 'Tire suas dúvidas sobre tratamentos, agendamento e cuidados odontológicos.',
    alternates: { canonical: `${SITE_URL_BASE}/duvidas-frequentes` },
  }
}

export default async function DuvidasFrequentesPage() {
  const site = await getSiteEspecial()

  if (!site.secao_faq_visivel) {
    return (
      <PageShell site={site}>
        <PageBanner title="Dúvidas Frequentes" imageUrl={site.hero_imagem_url} />
        <SecaoOcultaAviso />
      </PageShell>
    )
  }
  const supabase = await createClient()

  const { data: faq } = await supabase
    .from('site_faq')
    .select('pergunta, resposta, categoria')
    .eq('site_id', site.id)
    .is('deleted_at', null)
    .order('ordem')

  const porCategoria = new Map<string, { pergunta: string; resposta: string; categoria?: string | null }[]>()
  ;(faq ?? []).forEach(f => {
    const cat = f.categoria || 'Geral'
    if (!porCategoria.has(cat)) porCategoria.set(cat, [])
    porCategoria.get(cat)!.push(f)
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faq ?? []).map(f => ({
      '@type': 'Question',
      name: f.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: f.resposta },
    })),
  }

  return (
    <PageShell site={site}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageBanner title="Dúvidas Frequentes" imageUrl={site.hero_imagem_url} />

      {!faq?.length ? (
        <p className="text-center text-slate-500 py-16">Nenhuma dúvida cadastrada ainda.</p>
      ) : (
        <section className="px-4 sm:px-6 py-12 max-w-3xl mx-auto">
          {[...porCategoria.entries()].map(([categoria, itens]) => (
            <div key={categoria} className="mb-10">
              {porCategoria.size > 1 && (
                <Reveal>
                  <h2 className="text-xs font-bold uppercase tracking-wide text-[#0EA5A0] mb-4">{categoria}</h2>
                </Reveal>
              )}
              <Reveal>
                <FaqAccordion itens={itens} />
              </Reveal>
            </div>
          ))}
        </section>
      )}
    </PageShell>
  )
}
