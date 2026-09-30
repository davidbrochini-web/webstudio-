import type { ResumoAnalytics } from '@/lib/google-analytics-resumo'

function variacao(atual: number, anterior: number) {
  // Base muito pequena gera percentuais enganosos (1 → 13 pessoas = +1200%).
  if (anterior < 5) return null
  const p = Math.round(((atual - anterior) / anterior) * 100)
  return { texto: `${p > 0 ? '+' : ''}${p}%`, positivo: p >= 0 }
}

function Numero({ rotulo, valor, anterior }: { rotulo: string; valor: string; anterior?: { atual: number; ant: number } }) {
  const v = anterior ? variacao(anterior.atual, anterior.ant) : null
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-500">{rotulo}</p>
      <p className="text-2xl font-bold text-slate-800">{valor}</p>
      {v && <p className={`text-xs font-semibold ${v.positivo ? 'text-emerald-600' : 'text-rose-600'}`}>{v.texto} vs. período anterior</p>}
    </div>
  )
}

const NOME_PAGINA: Record<string, string> = {
  '/': 'Página inicial',
  '/tratamentos': 'Tratamentos',
  '/contato': 'Contato',
  '/a-clinica': 'A Clínica',
  '/equipe': 'Equipe',
  '/duvidas-frequentes': 'Dúvidas frequentes',
  '/artigos': 'Artigos',
}

function nomePagina(caminho: string) {
  if (NOME_PAGINA[caminho]) return NOME_PAGINA[caminho]
  const [, secao, slug] = caminho.split('/')
  if (slug) return `${secao === 'tratamentos' ? 'Tratamento' : secao === 'artigos' ? 'Artigo' : secao}: ${slug.replace(/-/g, ' ')}`
  return caminho
}

export default function AnalyticsCard({ resumo: r }: { resumo: ResumoAnalytics }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="font-bold text-lg text-slate-800 mb-1">Visitas no site</h2>
      <p className="text-xs text-slate-400 mb-5">
        Últimos {r.periodoDias} dias · Google Analytics · atualizado {new Date(r.atualizadoEm).toLocaleString('pt-BR')}
      </p>

      {!r.disponivel ? (
        <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-4">{r.motivoIndisponivel}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Numero rotulo="Pessoas que visitaram" valor={String(r.usuarios)} anterior={{ atual: r.usuarios, ant: r.usuariosAnterior }} />
            <Numero rotulo="Visitas" valor={String(r.sessoes)} anterior={{ atual: r.sessoes, ant: r.sessoesAnterior }} />
            <Numero rotulo="Cliques no WhatsApp" valor={String(r.cliquesWhatsapp)} />
            <Numero rotulo="Tempo médio por visita" valor={`${Math.floor(r.duracaoMediaSeg / 60)}m${String(Math.round(r.duracaoMediaSeg % 60)).padStart(2, '0')}s`} />
          </div>

          {r.porDia.length > 1 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Pessoas por dia</p>
              <div className="flex items-end gap-[2px] h-24" role="img" aria-label="Gráfico de pessoas por dia">
                {(() => {
                  const max = Math.max(...r.porDia.map(d => d.usuarios), 1)
                  return r.porDia.map(d => (
                    <div
                      key={d.data}
                      title={`${d.data.slice(6, 8)}/${d.data.slice(4, 6)}: ${d.usuarios}`}
                      className="flex-1 bg-emerald-500/80 rounded-t"
                      style={{ height: `${Math.max((d.usuarios / max) * 100, 3)}%` }}
                    />
                  ))
                })()}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">De onde vieram</p>
              <ul className="flex flex-col gap-1.5">
                {r.canais.map(c => (
                  <li key={c.nome} className="flex justify-between text-sm text-slate-600">
                    <span>{c.nome}</span><span className="font-semibold text-slate-800">{c.sessoes}</span>
                  </li>
                ))}
                {r.canais.length === 0 && <li className="text-sm text-slate-400">Sem dados ainda.</li>}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Páginas mais vistas</p>
              <ul className="flex flex-col gap-1.5">
                {r.paginas.map(p => (
                  <li key={p.caminho} className="flex justify-between gap-3 text-sm text-slate-600">
                    <span className="truncate">{nomePagina(p.caminho)}</span>
                    <span className="font-semibold text-slate-800">{p.visualizacoes}</span>
                  </li>
                ))}
                {r.paginas.length === 0 && <li className="text-sm text-slate-400">Sem dados ainda.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
