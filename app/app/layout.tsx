import DemoLeadCapture from '@/components/site-editor/DemoLeadCapture'
import { getCurrentTenant } from '@/lib/current-tenant'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const info = await getCurrentTenant()

  return (
    <div className="min-h-screen bg-[var(--off)]">
      {children}
      {info?.isDemo && <DemoLeadCapture tenantId={info.tenantId} />}
    </div>
  )
}
