import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WebStudio — Seu site conectado ao Instagram',
  description:
    'Sites profissionais para pequenos negócios que se atualizam automaticamente com o feed do Instagram. Do contrato ao ar em 48 horas.',
  openGraph: {
    title: 'WebStudio — Postou no Instagram, atualizou o site.',
    description: 'Site profissional conectado ao seu Instagram. Automático, sem trabalho extra.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7C3AED',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  )
}
