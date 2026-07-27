import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'

async function getPost(siteId: string, slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_blog_posts')
    .select('titulo, resumo, conteudo, capa_url, alt_text, meta_titulo, meta_descricao, imagem_og, created_at')
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
  const post = await getPost(site.id, slug)
  if (!post) return {}
  return {
    title: post.meta_titulo || `${post.titulo} — ${site.business_name}`,
    description: post.meta_descricao || post.resumo,
    openGraph: post.imagem_og ? { images: [post.imagem_og] } : undefined,
    robots: { index: site.status === 'publicado' },
  }
}

export default async function ArtigoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const site = await getSiteEspecial()
  const post = await getPost(site.id, slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.titulo,
    image: post.imagem_og || post.capa_url || undefined,
    datePublished: post.created_at,
    publisher: { '@type': 'MedicalBusiness', name: site.business_name },
  }

  return (
    <PageShell site={site}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="px-6 py-16 max-w-3xl mx-auto">
        {post.capa_url && <img src={post.capa_url} alt={post.alt_text || ''} className="w-full aspect-[16/8] object-cover rounded-2xl mb-8" />}
        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-4">{post.titulo}</h1>
        <p className="text-base text-slate-500 leading-relaxed mb-8">{post.resumo}</p>
        <div className="text-[15px] text-slate-600 leading-[1.8] whitespace-pre-wrap">{post.conteudo}</div>
      </article>
    </PageShell>
  )
}
