import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BlogPostList from '@/components/blog/BlogPostList'
import { listarPostsPublicados } from '@/lib/blog-omnidesign'
import { slugify } from '@/lib/blog-omnidesign-shared'
import { CATEGORIAS_BLOG } from '@/lib/blog-categorias'

export const revalidate = 300

export async function generateMetadata(
  { params }: { params: Promise<{ categoria: string }> }
): Promise<Metadata> {
  const { categoria } = await params
  const posts = await listarPostsPublicados()
  const postsDaCategoria = posts.filter(p => p.categoria && slugify(p.categoria) === categoria)
  if (postsDaCategoria.length === 0) return {}

  const label = CATEGORIAS_BLOG[categoria]?.label ?? postsDaCategoria[0].categoria!
  const descricao =
    CATEGORIAS_BLOG[categoria]?.descricao ??
    `Artigos sobre ${label.toLowerCase()} para pequenas e médias empresas.`

  return {
    title: { absolute: `${label} — Blog | Omnidesign` },
    description: descricao,
    alternates: { canonical: `/blog/categoria/${categoria}` },
    openGraph: {
      title: `${label} — Blog | Omnidesign`,
      description: descricao,
      type: 'website',
      url: `https://omnidesign.com.br/blog/categoria/${categoria}`,
    },
  }
}

export default async function BlogCategoriaPage(
  { params }: { params: Promise<{ categoria: string }> }
) {
  const { categoria } = await params
  const posts = await listarPostsPublicados()
  const postsDaCategoria = posts.filter(p => p.categoria && slugify(p.categoria) === categoria)
  if (postsDaCategoria.length === 0) notFound()

  const label = CATEGORIAS_BLOG[categoria]?.label ?? postsDaCategoria[0].categoria!
  const descricao = CATEGORIAS_BLOG[categoria]?.descricao

  // Outras categorias, pra navegação cruzada — mesma lógica de /blog.
  const outrasCategorias = Array.from(
    new Map(
      posts
        .filter(p => p.categoria && slugify(p.categoria) !== categoria)
        .map(p => [slugify(p.categoria!), p.categoria!] as const)
    ).entries()
  )

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <Link href="/blog" className="text-xs font-bold tracking-widest uppercase text-[var(--brand)] mb-3 inline-block hover:underline">
          ← Blog
        </Link>
        <h1 className="font-display font-extrabold text-[clamp(28px,5.5vw,44px)] leading-tight text-[var(--ink)] mb-4">
          {label}
        </h1>
        {descricao && (
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-xl mb-8">
            {descricao}
          </p>
        )}

        {outrasCategorias.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/blog"
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
            >
              Todos
            </Link>
            {outrasCategorias.map(([slug, catLabel]) => (
              <Link
                key={slug}
                href={`/blog/categoria/${slug}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
              >
                {catLabel}
              </Link>
            ))}
          </div>
        )}

        <BlogPostList posts={postsDaCategoria} />
      </main>
      <Footer />
    </>
  )
}
