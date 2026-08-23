import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { buscarPostPorSlug } from '@/lib/blog-omnidesign'

export const revalidate = 300

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await buscarPostPorSlug(slug)
  if (!post) return {}

  const titulo = post.meta_titulo || post.titulo
  const descricao = post.meta_descricao || post.resumo

  return {
    // `absolute` ignora o template '%s | Omnidesign' do layout raiz —
    // titulo já vem com o sufixo de marca embutido (meta_titulo do
    // banco ou o próprio post.titulo), sem isso o Next concatenava
    // os dois e duplicava "| Omnidesign" no <title> (bug achado em
    // produção 23/08, afetava blog, modelos e solucoes).
    title: { absolute: titulo },
    description: descricao,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: titulo,
      description: descricao,
      type: 'article',
      url: `https://omnidesign.com.br/blog/${post.slug}`,
      publishedTime: post.publicado_em ?? undefined,
      ...(post.capa_url ? { images: [{ url: post.capa_url, alt: post.capa_alt ?? post.titulo }] } : {}),
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await buscarPostPorSlug(slug)
  if (!post) notFound()

  const paragrafos = post.conteudo.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.titulo,
    description: post.resumo,
    datePublished: post.publicado_em,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: 'Omnidesign' },
    publisher: { '@type': 'Organization', name: 'Omnidesign' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-16 lg:py-24">
        <Link href="/blog" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          ← Blog
        </Link>

        <div className="mt-6 mb-10">
          {post.categoria && (
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--brand2)]">
              {post.categoria}
            </span>
          )}
          <h1 className="font-display font-extrabold text-[clamp(28px,5vw,42px)] leading-tight text-[var(--ink)] mt-2 mb-3">
            {post.titulo}
          </h1>
          {post.publicado_em && (
            <p className="text-sm text-[var(--muted)]">{formatarData(post.publicado_em)}</p>
          )}
        </div>

        {post.capa_url && (
          <img
            src={post.capa_url}
            alt={post.capa_alt ?? post.titulo}
            className="rounded-2xl border border-[var(--border)] w-full mb-10"
            loading="eager"
            fetchPriority="high"
          />
        )}

        <article className="flex flex-col gap-5">
          {paragrafos.map((p, i) =>
            p.startsWith('## ') ? (
              // Subtítulo (H2) — necessário pra artigos profundos de
              // SEO terem estrutura de verdade (escaneabilidade +
              // chance de citação em AI Overviews). Posts antigos sem
              // "## " continuam renderizando igual sempre foi.
              <h2 key={i} className="font-display font-bold text-xl text-[var(--ink)] mt-4">
                {p.slice(3)}
              </h2>
            ) : (
              <p key={i} className="text-base text-[var(--slate)] leading-relaxed">{p}</p>
            )
          )}
        </article>

        <div className="mt-16 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--muted)] mb-4">Quer resolver isso no seu negócio também?</p>
          <Link
            href="/#contato"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl grad-bg text-white text-sm font-bold hover:opacity-90 transition-all"
          >
            📩 Entre em contato
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
