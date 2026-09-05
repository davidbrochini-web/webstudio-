import type { Metadata } from 'next'
import { getSiteEspecial, SITE_URL_BASE } from '@/lib/dentista-joao'

/**
 * SEO base de todo o site do projeto especial. As páginas filhas só
 * precisam definir title/description/canonical próprios — robots,
 * OpenGraph default e template de título vêm daqui (Next faz merge:
 * campo não definido na filha herda do layout).
 *
 * Indexação controlada por `sites.seo_indexavel` (toggle na aba SEO
 * do painel — Admin > SEO). Antes era uma constante fixa no código;
 * virou campo de banco pra dar controle ao cliente sem precisar de
 * deploy toda vez que o conteúdo ficar pronto pra ir pro Google.
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
    // Sem isso, o campo "keywords" (não redefinido nas páginas filhas)
    // herdava por padrão as keywords institucionais da Omnidesign
    // (definidas em app/layout.tsx — "agência de marketing digital",
    // "CRM para pequena empresa" etc.), que não têm nada a ver com o
    // nicho do cliente. Corrigido em 28/08.
    keywords: [
      'cirurgião bucomaxilofacial São Paulo',
      'implante dentário Tucuruvi',
      'cirurgia ortognática São Paulo',
      'extração de siso',
      'trauma facial',
      'ATM articulação temporomandibular',
      'patologia oral',
      'Dr. João Victor Pimenta',
    ],
    // Verificação do Google Search Console — mesmo padrão do GA4: um
    // token por domínio, nunca o global da Omnidesign.
    verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION_DENTISTA_JOAO
      ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION_DENTISTA_JOAO }
      : undefined,
    robots: { index: site.seo_indexavel, follow: site.seo_indexavel },
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
