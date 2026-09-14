import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import { getSiteEspecial, getContoBySlug, getAllContos, getContosRelacionados, getContoAdjacente, imagemAbsoluta, htmlToText, SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'
import SectionBg from '@/components/casos-esquecidos/SectionBg'
import { getTema } from '@/lib/temas-casos-esquecidos'

export const revalidate = 3600 // ISR — conteúdo público, republica a cada 1h no máximo

export async function generateStaticParams() {
  // Defensivo: se as env vars do Supabase não estiverem disponíveis no
  // ambiente de build (ex: CI sem os secrets configurados), não trava o
  // build — as páginas simplesmente renderizam sob demanda no primeiro
  // acesso e entram no cache do ISR a partir daí (mesmo efeito prático).
  try {
    const site = await getSiteEspecial()
    const contos = await getAllContos(site.id)
    return contos.map(c => ({ slug: c.slug }))
  } catch {
    return []
  }
}

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
      publishedTime: conto.data_publicacao || conto.created_at,
      modifiedTime: conto.updated_at || conto.data_publicacao || conto.created_at,
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
  const base = await getBasePath()
  const conto = await getContoBySlug(site.id, slug)
  if (!conto) notFound()

  const [relacionados, anterior, proximo] = await Promise.all([
    getContosRelacionados(site.id, conto.temas || [], conto.numero, 3),
    getContoAdjacente(site.id, conto.numero, 'anterior'),
    getContoAdjacente(site.id, conto.numero, 'proximo'),
  ])

  // data_publicacao é a data real em que o caso ficou público (contos
  // agendados são inseridos no banco dias antes — created_at seria a
  // data de inserção, não a de publicação). Vale pro texto da página,
  // pro OG e pro JSON-LD: é o sinal de "frescor" que o Google lê.
  const dataPubIso = conto.data_publicacao || conto.created_at
  const dataPub = new Date(dataPubIso)
  const dataFormatada = dataPub.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' })

  const textoPuro = htmlToText(conto.texto_html)
  const wordCount = textoPuro.split(/\s+/).filter(Boolean).length
  const minutosLeitura = Number((conto.tempo_leitura || '').match(/\d+/)?.[0] || Math.max(1, Math.round(wordCount / 205)))
  const nomesTemas = (conto.temas || []).map(t => getTema(t)?.nomeCurto).filter(Boolean) as string[]
  const imagemAbs = imagemAbsoluta(conto.imagem_url)

  // ShortStory + Article no mesmo nó: ShortStory descreve o que a página
  // é de verdade; Article é o tipo que o Google usa pra elegibilidade de
  // rich result de artigo (headline/image/datePublished/author). Multi-
  // type é JSON-LD válido. isAccessibleForFree é o sinal explícito de
  // "grátis" — casa com a intenção de busca "para ler grátis".
  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': ['ShortStory', 'Article'],
    '@id': `${SITE_URL_BASE}/contos/${conto.slug}#conto`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL_BASE}/contos/${conto.slug}` },
    headline: conto.titulo,
    name: conto.titulo,
    alternativeHeadline: `Caso Nº ${String(conto.numero).padStart(3, '0')}`,
    description: conto.resumo,
    author: {
      '@type': 'Person',
      name: 'D. Broch',
      url: `${SITE_URL_BASE}/sobre`,
      sameAs: ['https://www.amazon.com.br/dp/B0F6D1LXSV', 'https://www.instagram.com/db.casosesquecidos/'],
    },
    publisher: { '@type': 'Person', name: 'D. Broch', url: `${SITE_URL_BASE}/sobre` },
    url: `${SITE_URL_BASE}/contos/${conto.slug}`,
    genre: ['Terror', 'Horror', ...nomesTemas],
    keywords: ['conto de terror', 'história de terror grátis', ...nomesTemas.map(t => `terror ${t.toLowerCase()}`)].join(', '),
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    isFamilyFriendly: false,
    datePublished: dataPubIso,
    dateModified: conto.updated_at || dataPubIso,
    wordCount,
    timeRequired: `PT${minutosLeitura}M`,
    position: conto.numero,
    image: imagemAbs ? { '@type': 'ImageObject', url: imagemAbs, width: 1600, height: 700 } : undefined,
    isPartOf: {
      '@type': ['WebSite', 'CreativeWorkSeries'],
      '@id': `${SITE_URL_BASE}/#website`,
      name: 'Casos Esquecidos',
      url: SITE_URL_BASE,
    },
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

  // Banner na página usa o valor cru — relativo funciona direto contra
  // o host atual. imagemAbsoluta() só é necessária pra metadata/OG/
  // JSON-LD acima, que exigem URL totalmente qualificada.
  const banner = conto.imagem_url

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJson }} />
      <Header base={base} />
      <main>

      <SectionBg as="div" className="story-header" src="/assets/casos-esquecidos/bg/livro-desk.webp" priority>
        <div className="container">
          <nav className="breadcrumbs" aria-label="Você está aqui">
            <Link href={base || '/'}>Início</Link> <span>›</span> <Link href={`${base}/contos`}>Contos</Link> <span>›</span> <strong>{conto.titulo}</strong>
          </nav>
          <span className="case-number">Caso Nº {String(conto.numero).padStart(3, '0')} — Arquivo aberto</span>
          <h1>{conto.titulo}</h1>
          <p className="byline">Por <Link href={`${base}/sobre`} style={{ color: 'var(--gold)' }}>D. Broch</Link> · Arquivado em {dataFormatada}</p>
          {conto.temas && conto.temas.length > 0 && (
            <div className="tema-tags">
              {conto.temas.map(t => {
                const tema = getTema(t)
                return tema ? (
                  <Link key={t} href={`${base}/contos/tema/${t}`} className="tema-tag">{tema.nomeCurto}</Link>
                ) : null
              })}
            </div>
          )}
        </div>
      </SectionBg>

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
            <Link href={`${base}/contos/${anterior.slug}`} className="adjacent-link adjacent-prev">
              <span className="adjacent-label">← Caso anterior</span>
              <span className="adjacent-title">{anterior.titulo}</span>
            </Link>
          ) : <span />}
          {proximo ? (
            <Link href={`${base}/contos/${proximo.slug}`} className="adjacent-link adjacent-next">
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
            {relacionados.map(r => <CaseCard key={r.slug} conto={r} prefix={`${base}/contos`} />)}
          </div>
        </section>
      )}

      <div className="story-end">
        <span className="eyebrow">Gostou deste caso?</span>
        <p style={{ color: 'var(--paper-dim)' }}>Os contos são gratuitos, mas levam tempo pra escrever. Se este te tirou o sono, considere apoiar o trabalho.</p>
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
