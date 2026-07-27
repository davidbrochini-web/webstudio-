import SiteNav from '@/components/dentista-joao/SiteNav'
import SiteFooter from '@/components/dentista-joao/SiteFooter'
import WhatsAppFloat from '@/components/dentista-joao/WhatsAppFloat'
import type { SiteEspecial } from '@/lib/dentista-joao'

export default function PageShell({ site, children }: { site: SiteEspecial; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav site={site} />
      <main>{children}</main>
      <SiteFooter site={site} />
      <WhatsAppFloat whatsapp={site.whatsapp} />
    </div>
  )
}
