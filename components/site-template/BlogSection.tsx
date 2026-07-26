import type { NicheBlogPost } from '@/lib/templates'
import { unsplashPhotoFrom } from '@/lib/photos'

/**
 * Teaser de blog na home (bom pra SEO). Autoria pelo painel do
 * cliente é o próximo passo — aqui só a vitrine de leitura.
 * `siteSlug` só vem preenchido quando o config é de um site real
 * (getSiteConfigBySlug); nas vitrines estáticas de /modelos/[nicho]
 * os cards aparecem sem link (preview).
 */
export default function BlogSection({
  posts,
  photoIds,
  siteSlug,
  accent,
  dark = false,
}: {
  posts: NicheBlogPost[]
  photoIds: string[]
  siteSlug?: string
  accent: string
  dark?: boolean
}) {
  if (!posts.length) return null

  return (
    <section className="px-6 py-16 sm:py-20 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-10 gap-4">
        <h2 className={`font-display font-extrabold text-2xl sm:text-3xl ${dark ? 'text-white' : 'text-[var(--ink)]'}`}>Blog</h2>
        {siteSlug && (
          <a href={`/sandbox/${siteSlug}/blog`} className="text-xs font-semibold text-[var(--brand)] whitespace-nowrap hidden sm:block">
            Ver todos →
          </a>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {posts.map(({ slug, titulo, resumo }, i) => {
          const cover = unsplashPhotoFrom(photoIds, i + 2, 500, 320)
          const content = (
            <>
              <div className="relative overflow-hidden rounded-2xl mb-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20`} />
                <img src={cover} alt="" className="w-full aspect-[16/10] object-cover" />
              </div>
              <h3 className={`font-display font-bold text-base mb-1.5 leading-snug ${dark ? 'text-white' : 'text-[var(--ink)]'}`}>{titulo}</h3>
              <p className={`text-sm leading-relaxed ${dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>{resumo}</p>
            </>
          )
          return siteSlug ? (
            <a key={slug} href={`/sandbox/${siteSlug}/blog/${slug}`} className="block group">
              {content}
            </a>
          ) : (
            <div key={slug}>{content}</div>
          )
        })}
      </div>
    </section>
  )
}
