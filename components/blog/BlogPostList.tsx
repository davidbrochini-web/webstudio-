import Link from 'next/link'
import { slugify } from '@/lib/blog-omnidesign-shared'
import type { BlogPostResumo } from '@/lib/blog-omnidesign'

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function BlogPostList({ posts }: { posts: BlogPostResumo[] }) {
  if (posts.length === 0) {
    return <p className="text-sm text-[var(--muted)]">Nenhum post publicado ainda — volte em breve.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {posts.map(post => (
        <article key={post.id} className="group py-8 flex flex-col sm:flex-row sm:items-start gap-5">
          {post.capa_url && (
            <Link href={`/blog/${post.slug}`} className="flex-shrink-0">
              <img
                src={post.capa_url}
                alt={post.capa_alt ?? post.titulo}
                loading="lazy"
                className="w-full sm:w-40 h-40 sm:h-24 object-cover rounded-xl border border-[var(--border)]"
              />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            {post.categoria && (
              <Link
                href={`/blog/categoria/${slugify(post.categoria)}`}
                className="inline-block text-[10px] font-bold tracking-widest uppercase text-[var(--brand2)] hover:underline"
              >
                {post.categoria}
              </Link>
            )}
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="font-display font-bold text-lg text-[var(--ink)] mt-1 group-hover:text-[var(--brand)] transition-colors">
                {post.titulo}
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed mt-1.5 max-w-2xl">
                {post.resumo}
              </p>
            </Link>
          </div>
          <span className="flex-shrink-0 text-xs text-[var(--muted)] sm:text-right">
            {post.publicado_em && formatarData(post.publicado_em)}
          </span>
        </article>
      ))}
    </div>
  )
}
