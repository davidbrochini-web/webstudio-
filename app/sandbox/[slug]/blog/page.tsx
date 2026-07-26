import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSiteConfigBySlug, getSiteBlogPosts } from '@/lib/site-content'
import { unsplashPhotoFrom } from '@/lib/photos'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const result = await getSiteConfigBySlug(slug)
  if (!result) return {}
  return {
    title: `Blog — ${result.config.businessName}`,
    robots: { index: result.site.status === 'publicado' },
  }
}

export default async function SiteBlogIndex(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const result = await getSiteConfigBySlug(slug)
  if (!result) notFound()
  const { site, config } = result
  const posts = await getSiteBlogPosts(site.id)

  return (
    <div className="min-h-screen bg-[var(--off)]">
      <nav className="border-b border-[var(--border)] px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <a href={`/sandbox/${slug}`} className="font-display font-extrabold text-lg text-[var(--ink)]">
          {config.businessName}
        </a>
        <a href={`/sandbox/${slug}`} className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">← Voltar ao site</a>
      </nav>

      <section className="px-6 py-14 max-w-5xl mx-auto">
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-10">Blog</h1>

        {posts.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhum post publicado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {posts.map(({ slug: postSlug, titulo, resumo, capa_url }, i) => (
              <a key={postSlug} href={`/sandbox/${slug}/blog/${postSlug}`} className="block group">
                <div className="overflow-hidden rounded-2xl mb-4">
                  <img
                    src={capa_url || unsplashPhotoFrom(config.photoIds, i + 2, 500, 320)}
                    alt=""
                    className="w-full aspect-[16/10] object-cover group-hover:scale-[1.02] transition-transform"
                  />
                </div>
                <h2 className="font-display font-bold text-base text-[var(--ink)] mb-1.5 leading-snug">{titulo}</h2>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{resumo}</p>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
