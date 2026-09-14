import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import { getSiteEspecial, getAllContos, SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'

export const revalidate = 3600

const LIMITE_MINUTOS = 8

// Filtro real, não decorativo: extrai o número de "Leitura ~N min" e
// separa os casos que dá pra ler numa pausa curta. Diferente do hub
// (/livros-de-terror-gratis, que fala do arquivo inteiro) e do /contos
// (arquivo completo) — esta página tem um critério concreto que muda
// quem entra na lista, não é o mesmo conteúdo com um H1 trocado.
function minutosDe(tempoLeitura: string | null): number {
  const m = (tempoLeitura || '').match(/\d+/)
  return m ? Number(m[0]) : 99
}

export const metadata: Metadata = {
  title: 'Contos de Terror Curtos para Ler Rápido', // ≤60 c/ template
  description: `Contos de terror curtos, de até ${LIMITE_MINUTOS} minutos de leitura, grátis e completos — pra quem quer um susto rápido sem compromisso.`,
  alternates: { canonical: `${SITE_URL_BASE}/contos/curtos` },
  robots: { index: true, follow: true, 'max-image-preview': 'large' } as Metadata['robots'],
  openGraph: {
    title: 'Contos de Terror Curtos — Casos Esquecidos',
    description: `Histórias de terror completas em até ${LIMITE_MINUTOS} minutos de leitura. Grátis, sem cadastro.`,
    url: `${SITE_URL_BASE}/contos/curtos`,
    type: 'website',
    images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: 'Contos de Terror Curtos' }],
  },
}

export default async function ContosCurtosPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const todos = await getAllContos(site.id)
  const curtos = [...todos]
    .filter(c => minutosDe(c.tempo_leitura) <= LIMITE_MINUTOS)
    .sort((a, b) => b.numero - a.numero)

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL_BASE}/contos/curtos`,
    name: 'Contos de Terror Curtos',
    description: metadata.description,
    url: `${SITE_URL_BASE}/contos/curtos`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL_BASE}/#website`, name: 'Casos Esquecidos', url: SITE_URL_BASE },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: curtos.length,
      itemListElement: curtos.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL_BASE}/contos/${c.slug}`, name: c.titulo })),
    },
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL_BASE },
      { '@type': 'ListItem', position: 2, name: 'Contos', item: `${SITE_URL_BASE}/contos` },
      { '@type': 'ListItem', position: 3, name: 'Contos Curtos', item: `${SITE_URL_BASE}/contos/curtos` },
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
            <Link href={base || '/'}>Início</Link> <span>›</span> <Link href={`${base}/contos`}>Contos</Link> <span>›</span> <strong>Contos Curtos</strong>
          </nav>
          <div className="section-head">
            <span className="eyebrow">Leitura rápida — {curtos.length} casos</span>
            <h1>Contos de terror curtos</h1>
            <p>Histórias completas de até {LIMITE_MINUTOS} minutos de leitura. Sem enrolação, sem cadastro — dá pra ler inteiro na fila do ônibus e já sair arrependido.</p>
          </div>
          <div className="case-grid">
            {curtos.map((conto, i) => (
              <CaseCard key={conto.id} conto={conto} prefix={`${base}/contos`} priority={i < 3} />
            ))}
          </div>
          {curtos.length === 0 && (
            <p style={{ color: 'var(--paper-dim)' }}>Nenhum caso curto no momento — <Link href={`${base}/contos`}>veja o arquivo completo</Link>.</p>
          )}
        </div>
      </section>
      </main>
      <Footer base={base} />
    </>
  )
}
