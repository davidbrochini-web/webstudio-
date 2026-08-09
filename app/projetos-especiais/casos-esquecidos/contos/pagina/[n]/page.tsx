import type { Metadata } from 'next'
import ContosArchive from '@/components/casos-esquecidos/ContosArchive'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR — conteúdo público, republica a cada 1h no máximo

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params
  return {
    title: `Contos de Terror — Página ${n}`,
    description: 'Contos de terror e histórias de terror gratuitas, publicadas toda semana por D. Broch. Horror psicológico e investigação paranormal — leia agora.',
    alternates: {
      canonical: `${SITE_URL_BASE}/contos/pagina/${n}`,
      types: { 'application/rss+xml': `${SITE_URL_BASE}/feed.xml` },
    },
    openGraph: {
      title: `Arquivo de Casos — Página ${n}`,
      description: 'Contos de terror publicados toda semana. Histórias contadas por quem sobreviveu — ou por quem não teve essa sorte.',
      images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: 'Casos Esquecidos — Contos de Terror' }],
    },
  }
}

export default async function ContosPaginaPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params
  const pagina = parseInt(n, 10)
  if (!Number.isInteger(pagina) || pagina < 1) notFound()

  const site = await getSiteEspecial()
  const base = await getBasePath()
  return <ContosArchive siteId={site.id} pagina={pagina} base={base} />
}
