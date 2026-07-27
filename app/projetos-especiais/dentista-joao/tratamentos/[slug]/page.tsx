import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'

async function getTratamento(siteId: string, slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_tratamentos')
    .select('titulo, descricao_curta, descricao_completa, imagem_url, alt_text, meta_titulo, meta_descricao, imagem_og')
    .eq('site_id', siteId)
    .eq('slug', slug)
    .eq('publicado', true)
    .is('deleted_at', null)
    .single()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const site = await getSiteEspecial()
  const tratamento = await getTratamento(site.id, slug)
  if (!tratamento) return {}
  return {
    title: tratamento.meta_titulo || `${tratamento.titulo} — ${site.business_name}`,
    description: tratamento.meta_descricao || tratamento.descricao_curta,
    openGraph: tratamento.imagem_og ? { images: [tratamento.imagem_og] } : undefined,
    robots: { index: site.status === 'publicado' },
  }
}

export default async function TratamentoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const site = await getSiteEspecial()
  const tratamento = await getTratamento(site.id, slug)
  if (!tratamento) notFound()

  return (
    <PageShell site={site}>
      <article className="px-6 py-16 max-w-3xl mx-auto">
        {tratamento.imagem_url && (
          <img src={tratamento.imagem_url} alt={tratamento.alt_text || ''} className="w-full aspect-[16/8] object-cover rounded-2xl mb-8" />
        )}
        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-4">{tratamento.titulo}</h1>
        <div className="text-[15px] text-slate-600 leading-[1.8] whitespace-pre-wrap">{tratamento.descricao_completa}</div>
      </article>
    </PageShell>
  )
}
