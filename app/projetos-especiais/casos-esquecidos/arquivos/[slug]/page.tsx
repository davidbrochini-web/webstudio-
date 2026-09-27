import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import DocCard from '@/components/casos-esquecidos/DocCard'
import SectionBg from '@/components/casos-esquecidos/SectionBg'
import { getSiteEspecial, imagemAbsoluta, htmlToText, SITE_URL_BASE, getBasePath, ogBase, metaDescricao, dataModificacao } from '@/lib/casos-esquecidos'
import { getAllDocumentarios, getDocumentarioBySlug, numeroArquivo } from '@/lib/documentarios'

export const revalidate = 300

export async function generateStaticParams() {
  try {
    const site = await getSiteEspecial()
    const docs = await getAllDocumentarios(site.id)
    return docs.map(d => ({ slug: d.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const site = await getSiteEspecial()
  const doc = await getDocumentarioBySlug(site.id, slug)
  if (!doc) return {}
  const ogImage = imagemAbsoluta(doc.imagem_url)
  const titulo = `${doc.caso} (${doc.ano_caso}): o que aconteceu?`
  return {
    title: { absolute: titulo },
    description: metaDescricao(doc.resumo),
    keywords: doc.palavras_chave,
    robots: { index: true, follow: true, 'max-image-preview': 'large' } as Metadata['robots'],
    openGraph: {
      ...ogBase(`/arquivos/${doc.slug}`),
      title: doc.titulo,
      description: doc.resumo,
      images: ogImage
        ? [{ url: ogImage, width: 1600, height: 700, alt: doc.imagem_alt || doc.caso }]
        : [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: doc.data_publicacao,
      modifiedTime: dataModificacao(doc),
      tags: doc.palavras_chave,
    },
    twitter: {
      card: 'summary_large_image',
      title: doc.titulo,
      description: doc.resumo,
      images: ogImage ? [ogImage] : [`${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`],
    },
    alternates: { canonical: `${SITE_URL_BASE}/arquivos/${doc.slug}` },
  }
}

export default async function DocumentarioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const doc = await getDocumentarioBySlug(site.id, slug)
  if (!doc) notFound()

  const outros = (await getAllDocumentarios(site.id)).filter(d => d.id !== doc.id).slice(-3).reverse()
  const dataFormatada = new Date(doc.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' })
  const wordCount = htmlToText(doc.texto_html).split(/\s+/).filter(Boolean).length
  const minutos = Number((doc.tempo_leitura || '').match(/\d+/)?.[0] || Math.max(1, Math.round(wordCount / 200)))
  const imagemAbs = imagemAbsoluta(doc.imagem_url)
  const url = `${SITE_URL_BASE}/arquivos/${doc.slug}`

  // Article + `about` com o acontecimento real (Event). É o que liga a
  // página à entidade do caso no Knowledge Graph (busca por "Passo
  // Dyatlov", "Mary Celeste" etc.) e o que respostas de IA citam.
  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#arquivo`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: doc.titulo,
    alternativeHeadline: numeroArquivo(doc.numero),
    description: doc.resumo,
    about: { '@type': 'Event', name: doc.caso, startDate: String(doc.ano_caso), location: { '@type': 'Place', name: doc.local_caso } },
    author: { '@type': 'Person', name: 'D. Broch', url: `${SITE_URL_BASE}/sobre` },
    publisher: { '@type': 'Person', name: 'D. Broch', url: `${SITE_URL_BASE}/sobre` },
    url,
    genre: ['Mistério', 'Casos reais', 'Terror'],
    keywords: doc.palavras_chave.join(', '),
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    datePublished: doc.data_publicacao,
    dateModified: dataModificacao(doc),
    wordCount,
    timeRequired: `PT${minutos}M`,
    image: imagemAbs ? { '@type': 'ImageObject', url: imagemAbs, width: 1600, height: 700 } : undefined,
    isPartOf: { '@type': 'CreativeWorkSeries', name: 'Arquivos do Observador', url: `${SITE_URL_BASE}/arquivos` },
  })
  const breadcrumbJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL_BASE },
      { '@type': 'ListItem', position: 2, name: 'Casos Reais', item: `${SITE_URL_BASE}/arquivos` },
      { '@type': 'ListItem', position: 3, name: doc.caso, item: url },
    ],
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJson }} />
      <Header base={base} />
      <main>
      <SectionBg as="div" className="story-header" src="/assets/casos-esquecidos/bg/livro-desk.webp" priority>
        <div className="container">
          <nav className="breadcrumbs" aria-label="Você está aqui">
            <Link href={base || '/'}>Início</Link> <span>›</span> <Link href={`${base}/arquivos`}>Casos Reais</Link> <span>›</span> <strong>{doc.caso}</strong>
          </nav>
          <span className="case-number">{numeroArquivo(doc.numero)} — {doc.local_caso}, {doc.ano_caso}</span>
          <h1>{doc.titulo}</h1>
          <p className="byline">Arquivos do Observador · por <Link href={`${base}/sobre`} style={{ color: 'var(--gold)' }}>D. Broch</Link> · {dataFormatada}</p>
          {doc.palavras_chave.length > 0 && (
            <ul className="tema-tags" aria-label="Palavras-chave" style={{ listStyle: 'none', padding: 0 }}>
              {doc.palavras_chave.map(k => <li key={k} className="tema-tag">{k}</li>)}
            </ul>
          )}
        </div>
      </SectionBg>

      {doc.imagem_url && (
        <Image src={doc.imagem_url} alt={doc.imagem_alt || doc.caso} width={1600} height={700} className="story-banner" priority sizes="100vw" />
      )}

      <article className="story-body" dangerouslySetInnerHTML={{ __html: doc.texto_html }} />

      {outros.length > 0 && (
        <section className="container related-cases">
          <span className="eyebrow">Outros arquivos do Observador</span>
          <div className="case-grid">
            {outros.map(d => <DocCard key={d.id} doc={d} />)}
          </div>
        </section>
      )}

      <div className="story-end">
        <span className="eyebrow">Gostou deste arquivo?</span>
        <p style={{ color: 'var(--paper-dim)' }}>Os documentários e os contos são gratuitos. Se este caso te tirou o sono, considere apoiar o trabalho.</p>
        <div className="story-end-actions">
          <a className="btn btn-primary" href="https://www.amazon.com.br/dp/B0F6D1LXSV" target="_blank" rel="noopener">Comprar o livro na Amazon</a>
          <Link className="btn btn-ghost" href={`${base}/#apoio`}>Apoiar via Pix</Link>
        </div>
      </div>
      </main>
      <Footer base={base} />
    </>
  )
}
