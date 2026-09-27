import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import DocCard from '@/components/casos-esquecidos/DocCard'
import { getSiteEspecial, SITE_URL_BASE, getBasePath, ogBase } from '@/lib/casos-esquecidos'
import { getAllDocumentarios } from '@/lib/documentarios'

export const revalidate = 300

const DESC = 'Casos reais inexplicáveis e mistérios que a polícia não resolveu — Dyatlov, Máscaras de Chumbo, Mary Celeste — contados pelo Observador. Grátis.'

export const metadata: Metadata = {
  title: 'Casos Reais Inexplicáveis e Mistérios Sem Solução', // ≤60 c/ template
  description: DESC,
  keywords: ['casos reais inexplicáveis', 'mistérios reais não resolvidos', 'casos misteriosos reais', 'mistérios sem solução', 'passo dyatlov', 'máscaras de chumbo', 'mary celeste', 'colônia de roanoke'],
  alternates: { canonical: `${SITE_URL_BASE}/arquivos` },
  robots: { index: true, follow: true, 'max-image-preview': 'large' } as Metadata['robots'],
  openGraph: {
    ...ogBase('/arquivos'),
    title: 'Casos Reais Inexplicáveis — Arquivos do Observador',
    description: DESC,
    type: 'website',
    images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: 'Arquivos do Observador' }],
  },
}

export default async function ArquivosPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const docs = [...(await getAllDocumentarios(site.id))].sort((a, b) => b.numero - a.numero)

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL_BASE}/arquivos`,
    name: 'Arquivos do Observador — casos reais inexplicáveis',
    description: DESC,
    url: `${SITE_URL_BASE}/arquivos`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL_BASE}/#website`, name: 'Casos Esquecidos', url: SITE_URL_BASE },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: docs.length,
      itemListElement: docs.map((d, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL_BASE}/arquivos/${d.slug}`, name: d.titulo })),
    },
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL_BASE },
      { '@type': 'ListItem', position: 2, name: 'Casos Reais', item: `${SITE_URL_BASE}/arquivos` },
    ],
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
            <Link href={base || '/'}>Início</Link> <span>›</span> <strong>Casos Reais</strong>
          </nav>
          <div className="section-head">
            <span className="eyebrow">Arquivos do Observador — {docs.length} {docs.length === 1 ? 'caso aberto' : 'casos abertos'}</span>
            <h1>Casos reais inexplicáveis</h1>
            <p>Mistérios reais que a polícia arquivou sem resposta, contados por quem foi até lá conferir.</p>
          </div>
          <div className="lore" style={{ maxWidth: '68ch', marginBottom: '2.5rem' }}>
            <p>Nove esquiadores que rasgaram a própria barraca por dentro nos Montes Urais. Dois técnicos encontrados mortos com máscaras de chumbo num morro de Niterói. Um navio achado navegando sozinho no meio do Atlântico. Três faroleiros que sumiram de uma ilha de pedra. Uma colônia inteira que deixou só uma palavra entalhada num poste.</p>
            <p>Os Arquivos do Observador reúnem casos reais com mais de cinquenta anos que nunca tiveram explicação satisfatória. Cada documentário apresenta os fatos verdadeiros — datas, nomes, laudos, testemunhas — e as teorias que os humanos criaram para explicá-los. Depois, o Observador viaja até o local e dá a própria versão do que aconteceu. Os fatos são reais e documentados. A conclusão do Observador é ficção. Ou é o que dizem.</p>
          </div>
          {docs.length > 0 ? (
            <div className="case-grid">
              {docs.map((d, i) => <DocCard key={d.id} doc={d} priority={i < 3} />)}
            </div>
          ) : (
            <p className="lore" style={{ textAlign: 'center' }}>O primeiro arquivo está sendo aberto. Volte em breve.</p>
          )}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link className="btn btn-ghost" href={`${base}/contos`}>Prefere ficção? Leia os contos de terror</Link>
          </div>
        </div>
      </section>
      </main>
      <Footer base={base} />
    </>
  )
}
