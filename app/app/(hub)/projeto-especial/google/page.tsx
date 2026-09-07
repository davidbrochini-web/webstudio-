import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import GoogleDashboard from '@/components/google-dashboard/GoogleDashboard'

export default async function GooglePage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId || !info.projetoEspecialSlug) return null

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('google_analytics_url, google_search_console_url, google_meu_negocio_url')
    .eq('id', info.siteId)
    .single()

  if (!site) return null

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Google</h1>
      <GoogleDashboard
        identificadorGoogleAds={info.projetoEspecialSlug}
        analyticsUrl={site.google_analytics_url}
        searchConsoleUrl={site.google_search_console_url}
        meuNegocioUrl={site.google_meu_negocio_url}
      />
    </div>
  )
}
