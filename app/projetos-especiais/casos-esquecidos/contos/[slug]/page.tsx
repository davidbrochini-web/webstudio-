import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import { getSiteEspecial, getContoBySlug, getContosRelacionados, getContoAdjacente, imagemAbsoluta, SITE_URL_BASE } from '@/lib/casos-esquecidos'
import { getTema } from '@/lib/temas-casos-esquecidos'

const BASE = '/projetos-especiais/casos-esquecidos'
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const site = await getSiteEspecial()
  const conto = await getContoBySlug(site.id, slug)
  if (!conto) return {}
  const ogImage = imagemAbsoluta(conto.imagem_url)
  return {
    title: `${conto.titulo} — Caso Nº ${String(conto.numero).padStart(3, '0')}`,
    description: conto.resumo,
    robots: { index: true, follow: true, 'max-image-preview': 'large' } as Metadata['robots'],
    openGraph: {
      title: `${conto.titulo} — Conto de Terror por D. Broch`,
      description: conto.resumo,
      images: ogImage
        ? [{ url: ogImage, width: 1600, height: 700, alt: `Ilustração do conto ${conto.titulo}` }]
        : [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: conto.created_at,
      modifiedTime: conto.updated_at || conto.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${conto.titulo} — Conto de Terror por D. Broch`,
      description: conto.resumo,
      images: ogImage ? [ogImage] : [`${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`],
    },
    alternates: { canonical: `${SITE_URL_BASE}/contos/${conto.slug}` },
  }
}

export default async function ContoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const site = await getSiteEspecial()
  const conto = await getContoBySlug(site.id, slug)
  if (!conto) notFound()

  const [relacionados, anterior, proximo] = await Promise.all([
    getContosRelacionados(site.id, conto.temas || [], conto.numero, 3),
    getContoAdjacente(site.id, conto.numero, 'anterior'),
    getContoAdjacente(site.id, conto.numero, 'proximo'),
  ])

  const dataPub = new Date(conto.created_at)
  const dataFormatada = dataPub.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ShortStory',
    name: conto.titulo,
    author: { '@type': 'Person', name: 'D. Broch', url: `${SITE_URL_BASE}/sobre` },
    url: `${SITE_URL_BASE}/contos/${conto.slug}`,
    genre: 'Terror',
    inLanguage: 'pt-BR',
    datePublished: conto.created_at,
    dateModified: conto.updated_at || conto.created_at,
    image: imagemAbsoluta(conto.imagem_url) || undefined,
    isPartOf: { '@type': 'WebSite', name: 'Casos Esquecidos', url: SITE_URL_BASE },
  })

  const breadcrumbJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL_BASE },
      { '@type': 'ListItem', position: 2, name: 'Contos', item: `${SITE_URL_BASE}/contos` },
      { '@type': 'ListItem', position: 3, name: conto.titulo, item: `${SITE_URL_BASE}/contos/${conto.slug}` },
    ],
  })

  const banner = imagemAbsoluta(conto.imagem_url)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJson }} />
      <Header />

      <div className="story-header section-bg" style={{ backgroundImage: "url('/assets/casos-esquecidos/bg/livro-desk.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container">
          <nav className="breadcrumbs" aria-label="Você está aqui">
            <Link href={BASE}>Início</Link> <span>›</span> <Link href={`${BASE}/contos`}>Contos</Link> <span>›</span> <strong>{conto.titulo}</strong>
          </nav>
          <span className="case-number">Caso Nº {String(conto.numero).padStart(3, '0')} — Arquivo aberto</span>
          <h1>{conto.titulo}</h1>
          <p className="byline">Por <Link href={`${BASE}/sobre`} style={{ color: 'var(--gold)' }}>D. Broch</Link> · Arquivado em {dataFormatada}</p>
          {conto.temas && conto.temas.length > 0 && (
            <div className="tema-tags">
              {conto.temas.map(t => {
                const tema = getTema(t)
                return tema ? (
                  <Link key={t} href={`${BASE}/contos/tema/${t}`} className="tema-tag">{tema.nomeCurto}</Link>
                ) : null
              })}
            </div>
          )}
        </div>
      </div>

      {banner && (
        <Image
          src={banner}
          alt={`Ilustração do conto ${conto.titulo}`}
          width={1600}
          height={700}
          className="story-banner"
          priority
          sizes="100vw"
        />
      )}

      <article
        className="story-body"
        dangerouslySetInnerHTML={{ __html: conto.texto_html }}
      />

      {(anterior || proximo) && (
        <nav className="story-adjacent-nav container" aria-label="Navegação entre casos">
          {anterior ? (
            <Link href={`${BASE}/contos/${anterior.slug}`} className="adjacent-link adjacent-prev">
              <span className="adjacent-label">← Caso anterior</span>
              <span className="adjacent-title">{anterior.titulo}</span>
            </Link>
          ) : <span />}
          {proximo ? (
            <Link href={`${BASE}/contos/${proximo.slug}`} className="adjacent-link adjacent-next">
              <span className="adjacent-label">Próximo caso →</span>
              <span className="adjacent-title">{proximo.titulo}</span>
            </Link>
          ) : <span />}
        </nav>
      )}

      {relacionados.length > 0 && (
        <section className="container related-cases">
          <span className="eyebrow">Outros casos do arquivo</span>
          <div className="case-grid">
            {relacionados.map(r => <CaseCard key={r.slug} conto={r} />)}
          </div>
        </section>
      )}

      <div className="story-end">
        <span className="eyebrow">Gostou deste caso?</span>
        <p style={{ color: 'var(--paper-dim)' }}>Os contos são gratuitos, mas levam tempo pra escrever. Se este te tirou o sono, considere apoiar o trabalho.</p>
        <div className="story-end-actions">
          <a className="btn btn-primary" href="https://www.amazon.com.br/dp/B0F6D1LXSV" target="_blank" rel="noopener">Comprar o livro na Amazon</a>
          <Link className="btn btn-ghost" href={`${BASE}#apoio`}>Apoiar via Pix</Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
