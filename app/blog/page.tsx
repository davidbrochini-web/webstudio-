import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BlogPostList from '@/components/blog/BlogPostList'
import { listarPostsPublicados } from '@/lib/blog-omnidesign'
import { slugify } from '@/lib/blog-omnidesign-shared'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Como sites, sistemas internos e marketing digital resolvem problemas reais de pequenas e médias empresas.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Omnidesign',
    description: 'Como sites, sistemas internos e marketing digital resolvem problemas reais de pequenas e médias empresas.',
    type: 'website',
    url: 'https://omnidesign.com.br/blog',
  },
}

export const revalidate = 300

export default async function BlogPage() {
  const posts = await listarPostsPublicados()

  // Categorias distintas, na ordem em que aparecem entre os posts —
  // mesma fonte de verdade dos posts (categoria salva no banco), sem
  // lista fixa que possa ficar desatualizada.
  const categorias = Array.from(
    new Map(
      posts
        .filter(p => p.categoria)
        .map(p => [slugify(p.categoria!), p.categoria!] as const)
    ).entries()
  )

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--brand)] mb-3">Blog</p>
        <h1 className="font-display font-extrabold text-[clamp(30px,6vw,48px)] leading-tight text-[var(--ink)] mb-4">
          Negócio pequeno, problema real.
        </h1>
        <p className="text-base text-[var(--muted)] leading-relaxed max-w-xl mb-8">
          Como site, sistema interno e presença no Google resolvem o que trava um
          negócio pequeno ou médio no dia a dia — sem termo técnico, sem enrolação.
        </p>

        {categorias.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {categorias.map(([slug, label]) => (
              <Link
                key={slug}
                href={`/blog/categoria/${slug}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        <BlogPostList posts={posts} />
      </main>
      <Footer />
    </>
  )
}
