import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import { getSiteEspecial, getAllContos, SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'

export const revalidate = 3600

const TEMAS_CREEPYPASTA = ['terror-tecnologico', 'lendas-urbanas']

export const metadata: Metadata = {
  title: 'Creepypasta Brasileira', // ≤60 c/ template
  description: 'Creepypasta brasileira de verdade: contos de terror sobre grupos misteriosos, vídeos que não deviam existir e lendas urbanas nacionais. Grátis, sem cadastro.',
  alternates: { canonical: `${SITE_URL_BASE}/creepypasta-brasileira` },
  robots: { index: true, follow: true, 'max-image-preview': 'large' } as Metadata['robots'],
  openGraph: {
    title: 'Creepypasta Brasileira — Casos Esquecidos',
    description: 'Terror da internet e lendas urbanas brasileiras, em formato creepypasta. Grátis, sem cadastro.',
    url: `${SITE_URL_BASE}/creepypasta-brasileira`,
    type: 'website',
    images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: 'Creepypasta Brasileira' }],
  },
}

export default async function CreepypastaBrasileiraPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const todos = await getAllContos(site.id)
  const selecionados = [...todos]
    .filter(c => (c.temas || []).some(t => TEMAS_CREEPYPASTA.includes(t)))
    .sort((a, b) => b.numero - a.numero)

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL_BASE}/creepypasta-brasileira`,
    name: 'Creepypasta Brasileira',
    description: metadata.description,
    url: `${SITE_URL_BASE}/creepypasta-brasileira`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL_BASE}/#website`, name: 'Casos Esquecidos', url: SITE_URL_BASE },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: selecionados.length,
      itemListElement: selecionados.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL_BASE}/contos/${c.slug}`, name: c.titulo })),
    },
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL_BASE },
      { '@type': 'ListItem', position: 2, name: 'Creepypasta Brasileira', item: `${SITE_URL_BASE}/creepypasta-brasileira` },
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
            <Link href={base || '/'}>Início</Link> <span>›</span> <strong>Creepypasta Brasileira</strong>
          </nav>
          <div className="section-head">
            <span className="eyebrow">Terror da internet — {selecionados.length} casos</span>
            <h1>Creepypasta brasileira</h1>
            <p>O medo que nasce em grupo de WhatsApp sem nome, em vídeo que chegou de contato que não devia existir, em lenda urbana que todo mundo jura ter acontecido com um primo de alguém. Creepypasta, à brasileira.</p>
          </div>
          <div className="lore" style={{ maxWidth: '68ch', marginBottom: '2.5rem' }}>
            <p>Creepypasta nasceu na internet americana, mas o formato — histórias curtas, ditas em primeira pessoa, espalhadas como se fossem relato real — encaixa perfeito nas lendas urbanas que já circulavam no Brasil antes da palavra existir. Aqui, o gênero ganha sotaque nacional: motorista de aplicativo, grupo de família no WhatsApp, vídeo viral que ninguém devia ter compartilhado. São contos de D. Broch dentro do universo <em>Alguns Casos Devem Ficar Esquecidos</em>, gratuitos e completos.</p>
          </div>
          <div className="case-grid">
            {selecionados.map((conto, i) => (
              <CaseCard key={conto.id} conto={conto} prefix={`${base}/contos`} priority={i < 3} />
            ))}
          </div>
          {selecionados.length === 0 && (
            <p style={{ color: 'var(--paper-dim)' }}>Nenhum caso deste tipo ainda — <Link href={`${base}/contos`}>veja o arquivo completo</Link>.</p>
          )}
        </div>
      </section>
      </main>
      <Footer base={base} />
    </>
  )
}
