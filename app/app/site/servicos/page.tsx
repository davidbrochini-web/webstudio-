import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import ServicosManager from '@/components/app/ServicosManager'

export default async function SiteServicosPage() {
  const info = await getCurrentTenant()
  if (!info?.siteId) return null

  const supabase = await createClient()
  const { data: servicos } = await supabase
    .from('site_servicos')
    .select('id, icon, title, description')
    .eq('site_id', info.siteId)
    .is('deleted_at', null)
    .order('ordem')

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return <ServicosManager siteId={info.siteId} servicos={servicos ?? []} readOnly={!podeEditar} />
}
