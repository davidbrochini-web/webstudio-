import Link from 'next/link'
import BlogPostForm from '@/components/admin/BlogPostForm'

export default function NovoPostPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/admin/blog" className="hover:text-[var(--ink)] transition-colors">Blog</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Novo post</span>
      </div>

      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Novo post</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Deixe como rascunho pra terminar depois, ou publique já com data pra agendar.
      </p>

      <BlogPostForm />
    </div>
  )
}
