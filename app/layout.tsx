import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeScript } from '@/components/layout/ThemeScript'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'

// Antes: @import do Google Fonts em globals.css — render-blocking (761ms
// medidos no Lighthouse) em TODO domínio da plataforma, incluindo os que
// nem usam essas fontes (Casos Esquecidos usa Cinzel/Garamond isolados em
// `.ce-site`, ver ce-styles.css). next/font faz self-host em build time
// (sem round-trip pro Google em runtime) e injeta como CSS var — mesmo
// resultado visual pra Omnidesign/Dentista João, zero bloqueio a mais.
// preload:false nos três: são a tipografia do site institucional (raiz)
// e do admin, mas o next/font por padrão injeta um <link rel="preload">
// de alta prioridade em TODA página do monorepo, mesmo em rotas que
// nunca renderizam texto nessas fontes (ex: Casos Esquecidos usa
// Cinzel/Garamond isolados, tem SEU PRÓPRIO next/font — as 3 fontes
// daqui nunca aparecem visualmente lá). Medido em produção: essas 3
// fontes eram ~148KB de download de alta prioridade desperdiçado em
// TODA página do Casos Esquecidos. preload:false não muda qual fonte
// renderiza em lugar nenhum — só para de forçar o download antecipado
// em páginas que não usam. Onde a fonte É usada (Omnidesign, admin),
// o navegador busca normalmente ao encontrar o texto — comportamento
// padrão, sem regressão visual.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap', preload: false })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-space-grotesk', display: 'swap', preload: false })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains-mono', display: 'swap', preload: false })

export const metadata: Metadata = {
  metadataBase: new URL('https://omnidesign.com.br'),
  // Verificação do Google Search Console — ativa quando a env
  // NEXT_PUBLIC_GSC_VERIFICATION for setada na Vercel (só o token,
  // sem a tag inteira). Essa é SÓ a do domínio da própria Omnidesign.
  // Cada Projeto Especial com domínio próprio tem seu próprio token
  // no generateMetadata do layout dele (mesmo padrão do GA4 em
  // GoogleAnalytics.tsx) — nunca reaproveitar este aqui pra outro
  // domínio, o Google não conseguiria confirmar a propriedade certa.
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
  title: {
    default: 'Omnidesign — Sites Inteligentes Conectados ao Instagram + Sistemas Internos',
    template: '%s | Omnidesign',
  },
  description:
    'Sites profissionais conectados ao Instagram e sistemas internos sob medida para pequenos e médios negócios. Automação, organização e presença digital em um só lugar.',
  keywords: [
    'criação de site', 'site para pequena empresa', 'site conectado ao instagram',
    'sistema interno para empresa', 'site institucional', 'CRM para pequena empresa',
    'agência de marketing digital', 'gestão de google ads para pequena empresa',
    'google meu negócio', 'chatgpt ads',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: 'Omnidesign — Sites Inteligentes Conectados ao Instagram',
    description: 'Sites que se atualizam sozinhos e sistemas internos que organizam sua empresa. Tudo automatizado, sem trabalho extra.',
    type: 'website',
    url: 'https://omnidesign.com.br',
    siteName: 'Omnidesign',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omnidesign — Sites Inteligentes Conectados ao Instagram',
    description: 'Sites que se atualizam sozinhos e sistemas internos que organizam sua empresa.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060606',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // O WhatsApp da Omnidesign é ocultado nos domínios de Projeto Especial
  // pelo próprio WhatsAppFloat, no cliente — ver comentário lá. Não ler
  // headers() aqui: isso tornava dinâmica TODA rota da plataforma.

  return (
    <html lang="pt-BR" className={`scroll-smooth ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        {children}
        <WhatsAppFloat />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  )
}
