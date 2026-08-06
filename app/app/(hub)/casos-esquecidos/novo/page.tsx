import Link from 'next/link'
import { getCurrentTenant } from '@/lib/current-tenant'
import ContoForm from '@/components/casos-esquecidos-admin/ContoForm'
import { criarConto } from '@/app/app/(hub)/casos-esquecidos/actions'

export default async function NovoContoPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/casos-esquecidos" className="hover:text-[var(--ink)] transition-colors">Casos Esquecidos</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Novo caso</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-6">Publicar novo caso</h1>

      <ContoForm siteId={info.siteId} action={criarConto} />
    </div>
  )
}
