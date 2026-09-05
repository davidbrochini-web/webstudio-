import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import DiferenciaisManager from '@/components/app/DiferenciaisManager'

export default async function LocaldeskDiferenciaisPage() {
  const info = await getCurrentTenant()
  if (!info?.siteId) return null

  const supabase = await createClient()
  const { data: diferenciais } = await supabase
    .from('site_diferenciais')
    .select('id, icone, titulo, texto')
    .eq('site_id', info.siteId)
    .is('deleted_at', null)
    .order('ordem')

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <DiferenciaisManager
      siteId={info.siteId}
      diferenciais={diferenciais ?? []}
      readOnly={!podeEditar}
      revalidatePath="/app/localdesk/diferenciais"
    />
  )
}
