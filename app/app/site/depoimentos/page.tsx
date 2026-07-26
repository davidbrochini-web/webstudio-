import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import DepoimentosManager from '@/components/app/DepoimentosManager'

export default async function SiteDepoimentosPage() {
  const info = await getCurrentTenant()
  if (!info?.siteId) return null

  const supabase = await createClient()
  const { data: depoimentos } = await supabase
    .from('site_depoimentos')
    .select('id, nome, texto')
    .eq('site_id', info.siteId)
    .is('deleted_at', null)
    .order('ordem')

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return <DepoimentosManager siteId={info.siteId} depoimentos={depoimentos ?? []} readOnly={!podeEditar} />
}
