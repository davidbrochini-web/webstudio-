import type { Metadata } from 'next'
import ContosArchive from '@/components/casos-esquecidos/ContosArchive'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'

export const revalidate = 3600 // ISR — conteúdo público, republica a cada 1h no máximo

export const metadata: Metadata = {
  title: 'Contos de Terror — Histórias de Terror Grátis Toda Semana',
  description: 'Contos de terror e histórias de terror gratuitas, publicadas toda semana por D. Broch. Horror psicológico e investigação paranormal — leia agora.',
  alternates: {
    canonical: `${SITE_URL_BASE}/contos`,
    types: { 'application/rss+xml': `${SITE_URL_BASE}/feed.xml` },
  },
  openGraph: {
    title: 'Arquivo de Casos — Contos de Terror por D. Broch',
    description: 'Contos de terror publicados toda semana. Histórias contadas por quem sobreviveu — ou por quem não teve essa sorte.',
    images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: 'Casos Esquecidos — Contos de Terror' }],
  },
}

export default async function ContosPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  return <ContosArchive siteId={site.id} pagina={1} base={base} />
}
