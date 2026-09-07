import { getResumoGoogleAds } from '@/lib/google-ads-resumo'

interface GoogleDashboardProps {
  identificadorGoogleAds: string
  analyticsUrl: string | null
  searchConsoleUrl: string | null
  meuNegocioUrl: string | null
}

function formatMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function LinkExterno({ href, label, icone }: { href: string; label: string; icone: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3.5 font-semibold text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all text-sm"
    >
      <span className="text-lg">{icone}</span>
      {label}
    </a>
  )
}

const statusLabel: Record<string, string> = {
  ENABLED: 'Ativa',
  PAUSED: 'Pausada',
  REMOVED: 'Removida',
}

export default async function GoogleDashboard({
  identificadorGoogleAds,
  analyticsUrl,
  searchConsoleUrl,
  meuNegocioUrl,
}: GoogleDashboardProps) {
  const resumo = await getResumoGoogleAds(identificadorGoogleAds)

  return (
    <div className="flex flex-col gap-6">
      {/* Links externos */}
      <div className="flex flex-col sm:flex-row gap-3">
        {analyticsUrl && <LinkExterno href={analyticsUrl} label="Google Analytics" icone="📊" />}
        {searchConsoleUrl && <LinkExterno href={searchConsoleUrl} label="Search Console" icone="🔍" />}
        {meuNegocioUrl && <LinkExterno href={meuNegocioUrl} label="Google Meu Negócio" icone="📍" />}
      </div>

      {/* Resumo de campanhas Google Ads */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-bold text-lg text-slate-800 mb-1">Campanhas Google Ads</h2>
        <p className="text-xs text-slate-400 mb-5">
          Últimos 30 dias · atualizado {new Date(resumo.atualizadoEm).toLocaleString('pt-BR')}
        </p>

        {!resumo.disponivel && (
          <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-4">
            {resumo.motivoIndisponivel}
          </p>
        )}

        {resumo.disponivel && resumo.campanhas.length === 0 && (
          <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-4">
            Nenhuma campanha encontrada.
          </p>
        )}

        {resumo.disponivel && resumo.campanhas.length > 0 && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              {resumo.campanhas.map(c => (
                <div key={c.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-800">{c.nome}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'ENABLED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {statusLabel[c.status] ?? c.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div>Gasto por dia: <span className="font-semibold text-slate-700">{formatMoeda(c.orcamentoDiario)}</span></div>
                    <div>Cliques no anúncio: <span className="font-semibold text-slate-700">{c.cliques}</span></div>
                    <div>Quantas vezes apareceu: <span className="font-semibold text-slate-700">{c.impressoes}</span></div>
                    <div>Gasto até agora: <span className="font-semibold text-slate-700">{formatMoeda(c.custo)}</span></div>
                    <div className="col-span-2">Pessoas que agendaram, chamaram ou mandaram mensagem: <span className="font-semibold text-emerald-700">{c.conversoes}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 pb-6 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-700 mb-3">O que as campanhas trouxeram (últimos 30 dias)</h3>
              {resumo.conversoesPorTipo.length === 0 ? (
                <p className="text-sm text-slate-400">Ainda não teve nenhum resultado registrado.</p>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {resumo.conversoesPorTipo.map((cv, i) => (
                    <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
                      <div className="text-xs text-slate-500">{cv.nome}</div>
                      <div className="text-lg font-bold text-emerald-700">{cv.quantidade}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h3 className="font-semibold text-sm text-slate-700 mb-1">O que as pessoas buscaram no Google</h3>
            <p className="text-xs text-slate-400 mb-3">Termos que fizeram seu anúncio aparecer</p>
            {resumo.keywords.length === 0 ? (
              <p className="text-sm text-slate-400">Ainda não tem dados suficientes.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                      <th className="pb-2 pr-4 font-medium">Termo buscado</th>
                      <th className="pb-2 pr-4 font-medium">Campanha</th>
                      <th className="pb-2 pr-4 font-medium">Cliques</th>
                      <th className="pb-2 pr-4 font-medium">Vezes que apareceu</th>
                      <th className="pb-2 font-medium">Custo médio por clique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.keywords.map((k, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0">
                        <td className="py-2 pr-4 text-slate-700">{k.texto}</td>
                        <td className="py-2 pr-4 text-slate-400 text-xs">{k.campanha}</td>
                        <td className="py-2 pr-4 text-slate-600">{k.cliques}</td>
                        <td className="py-2 pr-4 text-slate-600">{k.impressoes}</td>
                        <td className="py-2 text-slate-600">{formatMoeda(k.cpcMedio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
