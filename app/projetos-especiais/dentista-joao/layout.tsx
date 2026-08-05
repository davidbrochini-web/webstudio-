import type { Metadata } from 'next'
import { getSiteEspecial, SITE_INDEXAVEL, SITE_URL_BASE } from '@/lib/dentista-joao'

/**
 * SEO base de todo o site do projeto especial. As páginas filhas só
 * precisam definir title/description/canonical próprios — robots,
 * OpenGraph default e template de título vêm daqui (Next faz merge:
 * campo não definido na filha herda do layout).
 *
 * Pra liberar a indexação quando o conteúdo real for aprovado, mudar
 * APENAS `SITE_INDEXAVEL` em lib/dentista-joao.ts (kill-switch único —
 * os robots por página antigos foram removidos de propósito).
 */
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    metadataBase: new URL(SITE_URL_BASE),
    title: {
      default: site.business_name,
      template: `%s — ${site.business_name}`,
    },
    description: site.tagline ?? undefined,
    robots: { index: SITE_INDEXAVEL, follow: SITE_INDEXAVEL },
    alternates: { canonical: SITE_URL_BASE },
    openGraph: {
      siteName: site.business_name,
      type: 'website',
      locale: 'pt_BR',
      url: SITE_URL_BASE,
      ...(site.hero_imagem_url ? { images: [site.hero_imagem_url] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: site.business_name,
      ...(site.tagline ? { description: site.tagline } : {}),
      ...(site.hero_imagem_url ? { images: [site.hero_imagem_url] } : {}),
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
