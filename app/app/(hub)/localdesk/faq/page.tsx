import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import FaqManager from '@/components/app/FaqManager'

export default async function LocaldeskFaqPage() {
  const info = await getCurrentTenant()
  if (!info?.siteId) return null

  const supabase = await createClient()
  const { data: faqs } = await supabase
    .from('site_faq')
    .select('id, pergunta, resposta, categoria')
    .eq('site_id', info.siteId)
    .is('deleted_at', null)
    .order('ordem')

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <FaqManager
      siteId={info.siteId}
      faqs={faqs ?? []}
      readOnly={!podeEditar}
      revalidatePath="/app/localdesk/faq"
    />
  )
}
