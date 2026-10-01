import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import { getResumoGoogleAds } from '@/lib/google-ads-resumo'
import { getResumoAnalytics } from '@/lib/google-analytics-resumo'
import GoogleDashboard from '@/components/google-dashboard/GoogleDashboard'
import AnalyticsCard from '@/components/google-dashboard/AnalyticsCard'
import ResumoRapido from '@/components/google-dashboard/ResumoRapido'
import ImprimirBotao from '@/components/google-dashboard/ImprimirBotao'

/**
 * Aba Google = mini relatório do cliente: resumo do período (site +
 * anúncios), campanhas, buscas que trouxeram gente e visitas do site.
 * Nunca renderiza vazia: cada caso mostra o motivo. Os dados do Google
 * carregam em Suspense pra não segurar a página.
 */
const PERIODOS = [7, 30, 90] as const

function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="text-sm bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-4">{children}</p>
}

async function Relatorio({
  identificador,
  dias,
  links,
}: {
  identificador: string
  dias: number
  links: { analytics: string | null; searchConsole: string | null; meuNegocio: string | null; ads: string | null }
}) {
  // Uma chamada por fonte (ambas têm cache): os componentes só recebem o resultado.
  const [ads, ga] = await Promise.all([getResumoGoogleAds(identificador, dias), getResumoAnalytics(identificador, dias)])

  return (
    <div className="flex flex-col gap-6">
      <ResumoRapido ads={ads} ga={ga} dias={dias} />
      <GoogleDashboard
        resumo={ads}
        analyticsUrl={links.analytics}
        searchConsoleUrl={links.searchConsole}
        meuNegocioUrl={links.meuNegocio}
        adsUrl={links.ads}
      />
      <AnalyticsCard resumo={ga} />
    </div>
  )
}

export default async function GooglePage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const { periodo } = await searchParams
  const pedido = Number(periodo)
  const dias = (PERIODOS as readonly number[]).includes(pedido) ? pedido : 30

  const info = await getCurrentTenant()
  const titulo = <h1 className="font-display font-bold text-2xl text-[var(--ink)] print:text-black">Google</h1>

  if (!info) return <div>{titulo}<Aviso>Nenhuma empresa vinculada a este login.</Aviso></div>
  if (!info.siteId || !info.projetoEspecialSlug) {
    return (
      <div>
        {titulo}
        <Aviso>
          Você está no painel de <strong>{info.tenantNome}</strong>, que não tem esta aba de Google.
          {!info.impersonating &&
            ' Se queria ver o Dentista João como o cliente vê: volte ao admin e clique em "Admin" no card dele. A sessão "ver como" dura 4 horas; se esta tela ficou aberta além disso, o menu pode mostrar o cliente por engano.'}
        </Aviso>
      </div>
    )
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
      <style>{`@media print { nav, .print-esconder { display: none !important } body { background: #fff !important } }`}</style>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {titulo}
        <div className="flex items-center gap-2 print:hidden">
          <div className="flex rounded-lg border border-slate-300 overflow-hidden text-xs font-semibold">
            {PERIODOS.map(p => (
              <Link
                key={p}
                href={`?periodo=${p}`}
                className={`px-3 py-1.5 transition-colors ${p === dias ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                {p} dias
              </Link>
            ))}
          </div>
          <ImprimirBotao />
        </div>
      </div>

      <Suspense key={dias} fallback={<Aviso>Carregando dados do Google…</Aviso>}>
        <Relatorio
          identificador={info.projetoEspecialSlug}
          dias={dias}
          links={{
            analytics: site.google_analytics_url,
            searchConsole: site.google_search_console_url,
            meuNegocio: site.google_meu_negocio_url,
            ads: site.google_ads_url,
          }}
        />
      </Suspense>
    </div>
  )
}
