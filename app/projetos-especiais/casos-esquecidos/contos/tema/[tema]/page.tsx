import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import { getSiteEspecial, getContosByTema, SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'
import { getTema, getAllTemas } from '@/lib/temas-casos-esquecidos'

export const revalidate = 3600 // ISR — conteúdo público, republica a cada 1h no máximo

export async function generateStaticParams() {
  return getAllTemas().map(t => ({ tema: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ tema: string }> }): Promise<Metadata> {
  const { tema: temaSlug } = await params
  const tema = getTema(temaSlug)
  if (!tema) return {}
  return {
    title: tema.titleSeo,
    description: tema.descricao,
    alternates: { canonical: `${SITE_URL_BASE}/contos/tema/${tema.slug}` },
    openGraph: {
      title: tema.nome,
      description: tema.descricao,
      images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: tema.nome }],
    },
  }
}

export default async function TemaPage({ params }: { params: Promise<{ tema: string }> }) {
  const { tema: temaSlug } = await params
  const tema = getTema(temaSlug)
  if (!tema) notFound()

  const site = await getSiteEspecial()
  const base = await getBasePath()
  const contos = await getContosByTema(site.id, tema.slug)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL_BASE },
      { '@type': 'ListItem', position: 2, name: 'Contos', item: `${SITE_URL_BASE}/contos` },
      { '@type': 'ListItem', position: 3, name: tema.nome, item: `${SITE_URL_BASE}/contos/tema/${tema.slug}` },
    ],
  }

  // CollectionPage + ItemList: diz ao Google que esta é uma página de
  // listagem por tema (não conteúdo duplicado do arquivo) e lista os
  // casos que pertencem a ela — mesmo padrão do arquivo e do hub.
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL_BASE}/contos/tema/${tema.slug}`,
    name: tema.nome,
    description: tema.descricao,
    url: `${SITE_URL_BASE}/contos/tema/${tema.slug}`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL_BASE}/#website`, name: 'Casos Esquecidos', url: SITE_URL_BASE },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: contos.length,
      itemListElement: [...contos].sort((a, b) => b.numero - a.numero).map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL_BASE}/contos/${c.slug}`,
        name: c.titulo,
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header base={base} />
      <main>
      <section>
        <div className="container">
          <nav className="breadcrumbs" aria-label="Você está aqui">
            <Link href={base || '/'}>Início</Link> <span>›</span> <Link href={`${base}/contos`}>Contos</Link> <span>›</span> <strong>{tema.nome}</strong>
          </nav>
          <div className="section-head">
            <span className="eyebrow">Arquivo de Casos — Grátis para ler</span>
            <h1>{tema.nome}</h1>
            <p>{tema.descricao}</p>
          </div>
          <div className="lore" style={{ marginBottom: '2.5rem' }}>
            <p>{tema.texto}</p>
          </div>
          {contos.length > 0 ? (
            <div className="case-grid">
              {contos.map(conto => <CaseCard key={conto.id} conto={conto} prefix={`${base}/contos`} />)}
            </div>
          ) : (
            <p style={{ color: 'var(--paper-dim)' }}>Nenhum caso arquivado neste tema ainda. Novos contos chegam toda semana.</p>
          )}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link className="btn btn-ghost" href={`${base}/contos`}>Ver todos os contos de terror →</Link>
          </div>
        </div>
      </section>
      </main>
      <Footer base={base} />
    </>
  )
}
