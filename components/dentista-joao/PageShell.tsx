import SiteNav from '@/components/dentista-joao/SiteNav'
import SiteFooter from '@/components/dentista-joao/SiteFooter'
import WhatsAppFloat from '@/components/dentista-joao/WhatsAppFloat'
import type { SiteEspecial } from '@/lib/dentista-joao'
import { getBasePath } from '@/lib/dentista-joao'

export default async function PageShell({ site, children }: { site: SiteEspecial; children: React.ReactNode }) {
  const base = await getBasePath()
  return (
    <div
      className="min-h-screen bg-white"
      style={{
        // Paleta customizável (aba Cores no painel). Default = teal/navy
        // do template original, então nada muda até o cliente customizar.
        '--dj-primary': site.cor_primaria || '#0EA5A0',
        '--dj-secondary': site.cor_secundaria || '#0B2B3C',
      } as React.CSSProperties}
    >
      <SiteNav site={site} base={base} />
      <main>{children}</main>
      <SiteFooter site={site} base={base} />
      <WhatsAppFloat whatsapp={site.whatsapp} />
    </div>
  )
}
