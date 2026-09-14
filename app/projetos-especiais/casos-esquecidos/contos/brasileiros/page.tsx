import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import { getSiteEspecial, getAllContos, SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Contos de Terror Brasileiros', // ≤60 c/ template
  description: 'Contos de terror brasileiros, ambientados no Brasil real — motoboy, elevador de prédio, herança de família — grátis e completos, sem cadastro.',
  alternates: { canonical: `${SITE_URL_BASE}/contos/brasileiros` },
  robots: { index: true, follow: true, 'max-image-preview': 'large' } as Metadata['robots'],
  openGraph: {
    title: 'Contos de Terror Brasileiros — Casos Esquecidos',
    description: 'Terror ambientado no Brasil de verdade: prédios, entregas, herança de família. Grátis, sem cadastro.',
    url: `${SITE_URL_BASE}/contos/brasileiros`,
    type: 'website',
    images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: 'Contos de Terror Brasileiros' }],
  },
}

export default async function ContosBrasileirosPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const todos = await getAllContos(site.id)
  const ordenados = [...todos].sort((a, b) => b.numero - a.numero)

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL_BASE}/contos/brasileiros`,
    name: 'Contos de Terror Brasileiros',
    description: metadata.description,
    url: `${SITE_URL_BASE}/contos/brasileiros`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL_BASE}/#website`, name: 'Casos Esquecidos', url: SITE_URL_BASE },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ordenados.length,
      itemListElement: ordenados.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL_BASE}/contos/${c.slug}`, name: c.titulo })),
    },
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL_BASE },
      { '@type': 'ListItem', position: 2, name: 'Contos', item: `${SITE_URL_BASE}/contos` },
      { '@type': 'ListItem', position: 3, name: 'Contos Brasileiros', item: `${SITE_URL_BASE}/contos/brasileiros` },
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
            <Link href={base || '/'}>Início</Link> <span>›</span> <Link href={`${base}/contos`}>Contos</Link> <span>›</span> <strong>Contos Brasileiros</strong>
          </nav>
          <div className="section-head">
            <span className="eyebrow">Terror nacional — {ordenados.length} casos</span>
            <h1>Contos de terror brasileiros</h1>
            <p>Nada de castelo escocês ou floresta europeia: o medo aqui mora no elevador de serviço, na moto do entregador, no apartamento alugado barato demais. Terror escrito e ambientado no Brasil, por um autor brasileiro.</p>
          </div>
          <div className="lore" style={{ maxWidth: '68ch', marginBottom: '2.5rem' }}>
            <p>Terror brasileiro tem sotaque próprio. Não é só trocar &quot;castle&quot; por &quot;casarão&quot; — é o medo que nasce de coisas bem daqui: o motoboy que reconhece rotas demais, o prédio antigo com um andar que a reforma esqueceu de contar pra todo mundo, a herança de família que vem com uma cláusula estranha demais pra ser coincidência. D. Broch escreve esse tipo de terror: urbano, cotidiano, brasileiro — sem precisar importar cenário de fora pra assustar gente daqui.</p>
          </div>
          <div className="case-grid">
            {ordenados.slice(0, 13).map((conto, i) => (
              <CaseCard key={conto.id} conto={conto} prefix={`${base}/contos`} priority={i < 3} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link className="btn btn-primary" href={`${base}/contos`}>Ver todos os {ordenados.length} contos</Link>
          </div>
        </div>
      </section>
      </main>
      <Footer base={base} />
    </>
  )
}
