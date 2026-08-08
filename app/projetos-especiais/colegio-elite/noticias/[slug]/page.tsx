import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/colegio-elite'
import PageShell from '@/components/colegio-elite/PageShell'
import PageBanner from '@/components/colegio-elite/PageBanner'
import Reveal from '@/components/colegio-elite/Reveal'

interface Props { params: Promise<{ slug: string }> }

async function getArtigo(slug: string) {
  const site = await getSiteEspecial()
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_blog_posts')
    .select('titulo, resumo, conteudo, capa_url, meta_titulo, meta_descricao')
    .eq('site_id', site.id).eq('slug', slug).eq('publicado', true).is('deleted_at', null)
    .maybeSingle()
  return { site, artigo: data }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { artigo } = await getArtigo(slug)
  if (!artigo) return {}
  return {
    title: artigo.meta_titulo || artigo.titulo,
    description: artigo.meta_descricao || artigo.resumo,
    alternates: { canonical: `${SITE_URL_BASE}/noticias/${slug}` },
  }
}

export default async function ArtigoDetalhePage({ params }: Props) {
  const { slug } = await params
  const { site, artigo } = await getArtigo(slug)
  const base = await getBasePath()
  if (!artigo) notFound()

  return (
    <PageShell site={site}>
      <PageBanner title={artigo.titulo} imageUrl={artigo.capa_url || site.hero_imagem_url} base={base} crumbs={[{ label: 'Notícias', href: `${base}/noticias` }]} />

      <section className="px-6 py-16 max-w-3xl mx-auto">
        <Reveal>
          {artigo.conteudo.split('\n\n').filter(Boolean).map((par: string, i: number) => (
            <p key={i} className="text-slate-700 leading-relaxed mb-4 whitespace-pre-line">{par}</p>
          ))}
        </Reveal>
      </section>
    </PageShell>
  )
}
