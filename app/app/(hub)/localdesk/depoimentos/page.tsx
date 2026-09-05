import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import DepoimentosManager from '@/components/app/DepoimentosManager'

export default async function LocaldeskDepoimentosPage() {
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

  return (
    <div>
      <p className="text-sm text-[var(--muted)] mb-4">
        A seção de depoimentos continua desligada no site até existir uma avaliação real de cliente
        (decisão registrada: sem depoimento fictício). Cadastre aqui assim que tiver um depoimento real —
        aviso o David quando estiver pronto pra ligar a seção no site.
      </p>
      <DepoimentosManager siteId={info.siteId} depoimentos={depoimentos ?? []} readOnly={!podeEditar} />
    </div>
  )
}
