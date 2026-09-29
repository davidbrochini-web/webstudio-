import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import GoogleDashboard from '@/components/google-dashboard/GoogleDashboard'
import AnalyticsCard from '@/components/google-dashboard/AnalyticsCard'

/**
 * Nunca renderizar a página vazia: antes, qualquer condição faltando
 * (tenant sem site, site não encontrado) virava `return null` e a tela
 * ficava em branco sem pista nenhuma. Agora cada caso mostra o motivo, e
 * o resumo do Ads (que chama a API do Google e pode demorar) carrega em
 * Suspense sem segurar o resto da página.
 */
function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="text-sm bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-4">{children}</p>
}

export default async function GooglePage() {
  const info = await getCurrentTenant()
  const titulo = <h1 className="font-display font-bold text-2xl text-[var(--ink)] mb-6">Google</h1>

  if (!info) return <div>{titulo}<Aviso>Nenhuma empresa vinculada a este login.</Aviso></div>
  if (!info.siteId || !info.projetoEspecialSlug) {
    return <div>{titulo}<Aviso>Este painel ainda não tem site configurado (tenant {info.tenantNome}).</Aviso></div>
  }

  const supabase = await createClient()
  const { data: site, error } = await supabase
    .from('sites')
    .select('google_analytics_url, google_search_console_url, google_meu_negocio_url, google_ads_url')
    .eq('id', info.siteId)
    .single()

  if (!site) {
    return <div>{titulo}<Aviso>Não foi possível carregar os dados do site{error ? `: ${error.message}` : ''}.</Aviso></div>
  }

  return (
    <div>
      {titulo}
      <Suspense fallback={<Aviso>Carregando dados do Google…</Aviso>}>
        <GoogleDashboard
          identificadorGoogleAds={info.projetoEspecialSlug}
          analyticsUrl={site.google_analytics_url}
          searchConsoleUrl={site.google_search_console_url}
          meuNegocioUrl={site.google_meu_negocio_url}
          adsUrl={site.google_ads_url}
        />
      </Suspense>
      <div className="mt-6">
        <Suspense fallback={<Aviso>Carregando visitas do site…</Aviso>}>
          <AnalyticsCard identificador={info.projetoEspecialSlug} />
        </Suspense>
      </div>
    </div>
  )
}
