import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { listarPostsPublicados } from '@/lib/blog-omnidesign'

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

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function BlogPage() {
  const posts = await listarPostsPublicados()

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--brand)] mb-3">Blog</p>
        <h1 className="font-display font-extrabold text-[clamp(30px,6vw,48px)] leading-tight text-[var(--ink)] mb-4">
          Negócio pequeno, problema real.
        </h1>
        <p className="text-base text-[var(--muted)] leading-relaxed max-w-xl mb-14">
          Como site, sistema interno e presença no Google resolvem o que trava um
          negócio pequeno ou médio no dia a dia — sem termo técnico, sem enrolação.
        </p>

        {posts.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhum post publicado ainda — volte em breve.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group py-8 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2"
              >
                <div className="min-w-0">
                  {post.categoria && (
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--brand2)]">
                      {post.categoria}
                    </span>
                  )}
                  <h2 className="font-display font-bold text-lg text-[var(--ink)] mt-1 group-hover:text-[var(--brand)] transition-colors">
                    {post.titulo}
                  </h2>
                  <p className="text-sm text-[var(--muted)] leading-relaxed mt-1.5 max-w-2xl">
                    {post.resumo}
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs text-[var(--muted)] sm:text-right">
                  {post.publicado_em && formatarData(post.publicado_em)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
