import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'

async function getTratamento(siteId: string, slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_tratamentos')
    .select('titulo, descricao_curta, descricao_completa, beneficios, duracao, indicado_para, imagem_url, alt_text, meta_titulo, meta_descricao, imagem_og')
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
    title: tratamento.meta_titulo ? { absolute: tratamento.meta_titulo } : tratamento.titulo,
    description: tratamento.meta_descricao || tratamento.descricao_curta,
    alternates: { canonical: `${SITE_URL_BASE}/tratamentos/${slug}` },
    openGraph: tratamento.imagem_og ? { images: [tratamento.imagem_og] } : undefined,
  }
}

export default async function TratamentoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const site = await getSiteEspecial()
  const tratamento = await getTratamento(site.id, slug)
  if (!tratamento) notFound()

  const beneficios: string[] = (tratamento.beneficios ?? '').split('\n').map((b: string) => b.trim()).filter(Boolean)

  return (
    <PageShell site={site}>
      <article className="px-6 py-16 max-w-3xl mx-auto">
        {tratamento.imagem_url && (
          <img src={tratamento.imagem_url} alt={tratamento.alt_text || ''} className="w-full aspect-[16/8] object-cover rounded-2xl mb-8" />
        )}

        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-3">{tratamento.titulo}</h1>

        {/* Chips de info rápida */}
        {(tratamento.duracao || tratamento.indicado_para) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {tratamento.duracao && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0EA5A0] bg-[#0EA5A0]/10 px-3 py-1.5 rounded-full">
                ⏱ {tratamento.duracao}
              </span>
            )}
            {tratamento.indicado_para && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2B3C] bg-slate-100 px-3 py-1.5 rounded-full">
                👤 Indicado para {tratamento.indicado_para}
              </span>
            )}
          </div>
        )}

        {/* Texto principal */}
        <div className="text-[15px] text-slate-600 leading-[1.8] whitespace-pre-wrap mb-10">
          {tratamento.descricao_completa || tratamento.descricao_curta}
        </div>

        {/* Benefícios */}
        {beneficios.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-6 mb-10">
            <h2 className="font-display font-bold text-lg text-[#0B2B3C] mb-4">Benefícios</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {beneficios.map(b => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-[#0EA5A0]/15 text-[#0EA5A0] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA final */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-slate-500 text-sm mb-4">Quer saber mais ou já marcar sua consulta?</p>
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
