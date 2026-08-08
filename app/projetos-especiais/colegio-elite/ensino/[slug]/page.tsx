import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/colegio-elite'
import PageShell from '@/components/colegio-elite/PageShell'
import PageBanner from '@/components/colegio-elite/PageBanner'
import Reveal from '@/components/colegio-elite/Reveal'

interface Props { params: Promise<{ slug: string }> }

async function getSegmento(slug: string) {
  const site = await getSiteEspecial()
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_segmentos_ensino')
    .select('titulo, resumo, texto_completo, imagem_url, meta_titulo, meta_descricao')
    .eq('site_id', site.id).eq('slug', slug).eq('publicado', true).is('deleted_at', null)
    .maybeSingle()
  return { site, segmento: data }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { segmento } = await getSegmento(slug)
  if (!segmento) return {}
  return {
    title: segmento.meta_titulo || segmento.titulo,
    description: segmento.meta_descricao || segmento.resumo,
    alternates: { canonical: `${SITE_URL_BASE}/ensino/${slug}` },
  }
}

export default async function SegmentoDetalhePage({ params }: Props) {
  const { slug } = await params
  const { site, segmento } = await getSegmento(slug)
  const base = await getBasePath()
  if (!segmento) notFound()

  return (
    <PageShell site={site}>
      <PageBanner title={segmento.titulo} imageUrl={segmento.imagem_url || site.hero_imagem_url} base={base} crumbs={[{ label: 'Ensino', href: `${base}/ensino` }]} />

      <section className="px-6 py-16 max-w-3xl mx-auto">
        <Reveal>
          {segmento.texto_completo.split('\n\n').filter(Boolean).map((par: string, i: number) => (
            <p key={i} className="text-slate-700 leading-relaxed mb-4 whitespace-pre-line">{par}</p>
          ))}
        </Reveal>
      </section>
    </PageShell>
  )
}
