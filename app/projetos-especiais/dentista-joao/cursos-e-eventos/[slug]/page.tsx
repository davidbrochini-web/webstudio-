import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'

async function getCursoEvento(siteId: string, slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_cursos_eventos')
    .select('titulo, descricao, descricao_completa, data_evento, imagem_url, alt_text, meta_titulo, meta_descricao, imagem_og')
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
    title: item.meta_titulo ? { absolute: item.meta_titulo } : item.titulo,
    description: item.meta_descricao || item.descricao.slice(0, 160),
    openGraph: item.imagem_og ? { images: [item.imagem_og] } : undefined,
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
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0EA5A0] bg-[#0EA5A0]/10 px-3 py-1.5 rounded-full mb-3">
            📅 {new Date(item.data_evento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        )}

        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-4">{item.titulo}</h1>

        {/* Resumo de destaque */}
        <p className="text-slate-500 text-base leading-relaxed mb-8 italic border-l-4 border-[#0EA5A0]/40 pl-4">
          {item.descricao}
        </p>

        {/* Texto completo — se não tiver, cai no resumo mesmo */}
        {item.descricao_completa && (
          <div className="text-[15px] text-slate-600 leading-[1.8] whitespace-pre-wrap mb-10">
            {item.descricao_completa}
          </div>
        )}

        {/* CTA final */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-slate-500 text-sm mb-4">Interessado em participar ou tem dúvidas?</p>
          <a
            href={`/projetos-especiais/dentista-joao/contato`}
            className="inline-block bg-[#0B2B3C] hover:bg-[#0EA5A0] text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
          >
            Falar com a clínica
          </a>
        </div>
      </article>
    </PageShell>
  )
}
