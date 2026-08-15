import Link from 'next/link'
import { listarPostsAdmin, statusExibicao } from '@/lib/blog-omnidesign'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const posts = await listarPostsAdmin()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Blog</h1>
          <p className="text-[var(--muted)] text-sm">
            {posts.length} post{posts.length === 1 ? '' : 's'} — rascunho, agendado e publicado.
          </p>
        </div>
        <Link
          href="/admin/blog/novo"
          className="bg-[var(--dark)] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          + Novo post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
          <p className="text-sm text-[var(--muted)]">Nenhum post ainda.</p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)] overflow-hidden">
          {posts.map(post => {
            const exibicao = statusExibicao(post)
            const cor = exibicao === 'Publicado'
              ? 'text-white bg-[var(--brand)]'
              : exibicao.startsWith('Agendado')
                ? 'text-[var(--brand2)] bg-cyan-50 border border-cyan-200'
                : 'text-[var(--muted)] bg-[var(--off)] border border-[var(--border)]'

            return (
              <Link
                key={post.id}
                href={`/admin/blog/${post.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[var(--off)] transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm text-[var(--ink)] truncate">{post.titulo}</p>
                  <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                    /blog/{post.slug}{post.categoria ? ` · ${post.categoria}` : ''}
                  </p>
                </div>
                <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${cor}`}>
                  {exibicao}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
