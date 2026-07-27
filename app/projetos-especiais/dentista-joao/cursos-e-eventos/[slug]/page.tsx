import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'

async function getCursoEvento(siteId: string, slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_cursos_eventos')
    .select('titulo, descricao, data_evento, imagem_url, alt_text, meta_titulo, meta_descricao, imagem_og')
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
  const item = await getCursoEvento(site.id, slug)
  if (!item) return {}
  return {
    title: item.meta_titulo || `${item.titulo} — ${site.business_name}`,
    description: item.meta_descricao || item.descricao.slice(0, 160),
    openGraph: item.imagem_og ? { images: [item.imagem_og] } : undefined,
    robots: { index: site.status === 'publicado' },
  }
}

export default async function CursoEventoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const site = await getSiteEspecial()
  const item = await getCursoEvento(site.id, slug)
  if (!item) notFound()

  return (
    <PageShell site={site}>
      <article className="px-6 py-16 max-w-3xl mx-auto">
        {item.imagem_url && (
          <img src={item.imagem_url} alt={item.alt_text || ''} className="w-full aspect-[16/8] object-cover rounded-2xl mb-8" />
        )}
        {item.data_evento && (
          <p className="text-sm font-bold text-[#0EA5A0] mb-2">
            {new Date(item.data_evento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        )}
        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-4">{item.titulo}</h1>
        <div className="text-[15px] text-slate-600 leading-[1.8] whitespace-pre-wrap">{item.descricao}</div>
      </article>
    </PageShell>
  )
}
