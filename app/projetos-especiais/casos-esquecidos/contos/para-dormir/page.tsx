import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import { getSiteEspecial, getAllContos, SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'

export const revalidate = 3600

const TEMAS_ATMOSFERICOS = ['sobrenatural', 'assombracao', 'terror-psicologico']
const LIMITE_MINUTOS = 10

function minutosDe(tempoLeitura: string | null): number {
  const m = (tempoLeitura || '').match(/\d+/)
  return m ? Number(m[0]) : 99
}

export const metadata: Metadata = {
  title: 'Contos de Terror para Ler Antes de Dormir', // ≤60 c/ template
  description: 'Contos de terror curtos e atmosféricos, pra ler antes de dormir — sem gore, com aquele desconforto que fica na cabeça depois que a luz apaga.',
  alternates: { canonical: `${SITE_URL_BASE}/contos/para-dormir` },
  robots: { index: true, follow: true, 'max-image-preview': 'large' } as Metadata['robots'],
  openGraph: {
    title: 'Contos de Terror para Ler Antes de Dormir — Casos Esquecidos',
    description: 'Histórias curtas e atmosféricas, prontas pra ler no escuro antes de apagar a luz.',
    url: `${SITE_URL_BASE}/contos/para-dormir`,
    type: 'website',
    images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: 'Contos de Terror para Ler Antes de Dormir' }],
  },
}

export default async function ContosParaDormirPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const todos = await getAllContos(site.id)

  // Critério real: leitura curta (cabe antes do sono chegar) + temas
  // atmosféricos/psicológicos — sem criaturas explícitas, que puxam
  // mais pro susto de adrenalina do que pro desconforto de quem vai
  // apagar a luz em seguida. Fallback pros mais recentes se o filtro
  // esvaziar demais (proteção contra lista vazia em algum momento
  // futuro do catálogo).
  let selecionados = [...todos]
    .filter(c => minutosDe(c.tempo_leitura) <= LIMITE_MINUTOS && (c.temas || []).some(t => TEMAS_ATMOSFERICOS.includes(t)))
    .sort((a, b) => b.numero - a.numero)
  if (selecionados.length < 6) {
    selecionados = [...todos].sort((a, b) => b.numero - a.numero).slice(0, 9)
  }

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL_BASE}/contos/para-dormir`,
    name: 'Contos de Terror para Ler Antes de Dormir',
    description: metadata.description,
    url: `${SITE_URL_BASE}/contos/para-dormir`,
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
      { '@type': 'ListItem', position: 2, name: 'Contos', item: `${SITE_URL_BASE}/contos` },
      { '@type': 'ListItem', position: 3, name: 'Para Ler Antes de Dormir', item: `${SITE_URL_BASE}/contos/para-dormir` },
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
            <Link href={base || '/'}>Início</Link> <span>›</span> <Link href={`${base}/contos`}>Contos</Link> <span>›</span> <strong>Para Ler Antes de Dormir</strong>
          </nav>
          <div className="section-head">
            <span className="eyebrow">Um caso, luz apagada — {selecionados.length} indicados</span>
            <h1>Contos de terror para ler antes de dormir</h1>
            <p>Nada de criatura pulando na cara. Esta seleção é de desconforto lento — o tipo de história que não assusta na hora, mas volta quando a casa fica quieta.</p>
          </div>
          <div className="case-grid">
            {selecionados.map((conto, i) => (
              <CaseCard key={conto.id} conto={conto} prefix={`${base}/contos`} priority={i < 3} />
            ))}
          </div>
        </div>
      </section>
      </main>
      <Footer base={base} />
    </>
  )
}
