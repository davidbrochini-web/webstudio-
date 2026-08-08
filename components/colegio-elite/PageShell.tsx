import SiteNav from '@/components/colegio-elite/SiteNav'
import SiteFooter from '@/components/colegio-elite/SiteFooter'
import WhatsAppFloat from '@/components/colegio-elite/WhatsAppFloat'
import TopLinksBar from '@/components/colegio-elite/TopLinksBar'
import type { SiteEspecial } from '@/lib/colegio-elite'
import { getBasePath } from '@/lib/colegio-elite'

export default async function PageShell({ site, children }: { site: SiteEspecial; children: React.ReactNode }) {
  const base = await getBasePath()
  return (
    <div
      className="min-h-screen bg-white"
      style={{
        // Paleta customizável (aba Cores no painel). Default = azul/grafite
        // institucional, até o cliente customizar (mesmo mecanismo do
        // dentista-joao, só com variáveis --ce-* pra não colidir).
        '--ce-primary': site.cor_primaria || '#1B3A6B',
        '--ce-secondary': site.cor_secundaria || '#0F1F3D',
      } as React.CSSProperties}
    >
      <TopLinksBar site={site} />
      <SiteNav site={site} base={base} />
      <main>{children}</main>
      <SiteFooter site={site} base={base} />
      <WhatsAppFloat whatsapp={site.whatsapp} />
    </div>
  )
}
