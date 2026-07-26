import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSiteConfigBySlug, getSiteBlogPost } from '@/lib/site-content'
import { unsplashPhotoFrom } from '@/lib/photos'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; postSlug: string }> }
): Promise<Metadata> {
  const { slug, postSlug } = await params
  const result = await getSiteConfigBySlug(slug)
  if (!result) return {}
  const post = await getSiteBlogPost(result.site.id, postSlug)
  if (!post) return {}
  return {
    title: `${post.titulo} — ${result.config.businessName}`,
    description: post.resumo,
    robots: { index: result.site.status === 'publicado' },
  }
}

export default async function SiteBlogPostPage(
  { params }: { params: Promise<{ slug: string; postSlug: string }> }
) {
  const { slug, postSlug } = await params
  const result = await getSiteConfigBySlug(slug)
  if (!result) notFound()
  const { site, config } = result
  const post = await getSiteBlogPost(site.id, postSlug)
  if (!post) notFound()

  const cover = post.capa_url || unsplashPhotoFrom(config.photoIds, 2, 1400, 700)

  return (
    <div className="min-h-screen bg-[var(--off)]">
      <nav className="border-b border-[var(--border)] px-6 h-16 flex items-center justify-between max-w-3xl mx-auto">
        <a href={`/sandbox/${slug}`} className="font-display font-extrabold text-lg text-[var(--ink)]">
          {config.businessName}
        </a>
        <a href={`/sandbox/${slug}/blog`} className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">← Blog</a>
      </nav>

      <article className="px-6 py-14 max-w-3xl mx-auto">
        <img src={cover} alt="" className="w-full aspect-[16/8] object-cover rounded-2xl mb-8" />
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-4 leading-tight">{post.titulo}</h1>
        <p className="text-base text-[var(--muted)] leading-relaxed mb-8">{post.resumo}</p>
        <div className="text-[15px] text-[var(--ink)] leading-[1.8] whitespace-pre-wrap">
          {post.conteudo}
        </div>
      </article>
    </div>
  )
}
