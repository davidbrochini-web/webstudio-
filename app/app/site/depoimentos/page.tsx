import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import SiteSubNav from '@/components/app/SiteSubNav'
import DepoimentosManager from '@/components/app/DepoimentosManager'

export default async function SiteDepoimentosPage() {
  const info = await getCurrentTenant()
  if (!info) return <p className="text-sm text-[var(--muted)]">Sua conta não está vinculada a nenhuma empresa.</p>
  if (!info.siteId) return <p className="text-sm text-[var(--muted)]">Seu site ainda não foi criado.</p>

  const supabase = await createClient()
  const { data: depoimentos } = await supabase
    .from('site_depoimentos')
    .select('id, nome, texto')
    .eq('site_id', info.siteId)
    .is('deleted_at', null)
    .order('ordem')

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">Meu site</h1>
      <SiteSubNav />
      <DepoimentosManager siteId={info.siteId} depoimentos={depoimentos ?? []} readOnly={!podeEditar} />
    </div>
  )
}
