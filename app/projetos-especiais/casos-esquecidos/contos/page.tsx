import type { Metadata } from 'next'
import ContosArchive from '@/components/casos-esquecidos/ContosArchive'
import { getSiteEspecial, SITE_URL_BASE, getBasePath, ogBase } from '@/lib/casos-esquecidos'

export const revalidate = 3600 // ISR — conteúdo público, republica a cada 1h no máximo

export const metadata: Metadata = {
  title: 'Contos de Terror Grátis Toda Semana', // ≤60 c/ template ' | Casos Esquecidos'
  description: 'Arquivo completo de contos de terror para ler grátis, publicados toda semana por D. Broch. Terror psicológico e lendas urbanas — leia agora, sem cadastro.',
  alternates: {
    canonical: `${SITE_URL_BASE}/contos`,
    types: { 'application/rss+xml': `${SITE_URL_BASE}/feed.xml` },
  },
  openGraph: {
    ...ogBase('/contos'), type: 'website',
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
