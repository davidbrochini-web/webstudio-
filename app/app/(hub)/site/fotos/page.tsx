import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import FotosManager from '@/components/app/FotosManager'

export default async function SiteFotosPage() {
  const info = await getCurrentTenant()
  if (!info?.siteId) return null

  const supabase = await createClient()
  const { data: fotos } = await supabase
    .from('site_fotos')
    .select('id, url')
    .eq('site_id', info.siteId)
    .is('deleted_at', null)
    .order('ordem')

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return <FotosManager siteId={info.siteId} fotos={fotos ?? []} readOnly={!podeEditar} />
}
