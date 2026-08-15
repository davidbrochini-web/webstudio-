import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buscarPostPorId } from '@/lib/blog-omnidesign'
import BlogPostForm from '@/components/admin/BlogPostForm'

export const dynamic = 'force-dynamic'

export default async function EditarPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await buscarPostPorId(id)
  if (!post) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/admin/blog" className="hover:text-[var(--ink)] transition-colors">Blog</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium truncate max-w-xs">{post.titulo}</span>
      </div>

      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Editar post</h1>
      <p className="text-[var(--muted)] text-sm mb-8">/blog/{post.slug}</p>

      <BlogPostForm post={post} />
    </div>
  )
}
