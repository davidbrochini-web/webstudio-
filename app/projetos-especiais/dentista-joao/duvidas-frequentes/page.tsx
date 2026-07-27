import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import FaqSection from '@/components/site-template/FaqSection'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return { title: `Dúvidas Frequentes — ${site.business_name}`, robots: { index: site.status === 'publicado' } }
}

export default async function DuvidasFrequentesPage() {
  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { data: faq } = await supabase
    .from('site_faq')
    .select('pergunta, resposta, categoria')
    .eq('site_id', site.id)
    .is('deleted_at', null)
    .order('ordem')

  const porCategoria = new Map<string, { pergunta: string; resposta: string }[]>()
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
      <div className="px-6 pt-16">
        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] max-w-3xl mx-auto mb-4">Dúvidas Frequentes</h1>
      </div>
      {!faq?.length ? (
        <p className="text-center text-slate-500 pb-16">Nenhuma dúvida cadastrada ainda.</p>
      ) : (
        [...porCategoria.entries()].map(([categoria, itens]) => (
          <div key={categoria}>
            {porCategoria.size > 1 && (
              <p className="text-center text-xs font-bold uppercase tracking-wide text-[#0EA5A0] -mb-6">{categoria}</p>
            )}
            <FaqSection faq={itens} accent="from-[#0EA5A0] to-[#0B2B3C]" />
          </div>
        ))
      )}
    </PageShell>
  )
}
