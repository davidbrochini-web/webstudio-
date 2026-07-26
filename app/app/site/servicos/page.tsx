import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import SiteSubNav from '@/components/app/SiteSubNav'
import ServicosManager from '@/components/app/ServicosManager'

export default async function SiteServicosPage() {
  const info = await getCurrentTenant()
  if (!info) return <p className="text-sm text-[var(--muted)]">Sua conta não está vinculada a nenhuma empresa.</p>
  if (!info.siteId) return <p className="text-sm text-[var(--muted)]">Seu site ainda não foi criado.</p>

  const supabase = await createClient()
  const { data: servicos } = await supabase
    .from('site_servicos')
    .select('id, icon, title, description')
    .eq('site_id', info.siteId)
    .is('deleted_at', null)
    .order('ordem')

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">Meu site</h1>
      <SiteSubNav />
      <ServicosManager siteId={info.siteId} servicos={servicos ?? []} readOnly={!podeEditar} />
    </div>
  )
}
