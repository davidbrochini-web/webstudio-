import type { ResumoGoogleAds } from '@/lib/google-ads-resumo'
import type { ResumoAnalytics } from '@/lib/google-analytics-resumo'

const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const inteiro = (v: number) => v.toLocaleString('pt-BR')

function variacao(atual: number, anterior: number) {
  // Base muito pequena gera percentuais enganosos (1 → 13 pessoas = +1200%).
  if (anterior < 5) return null
  const p = Math.round(((atual - anterior) / anterior) * 100)
  return `${p > 0 ? '+' : ''}${p}%`
}

function Kpi({ rotulo, valor, nota }: { rotulo: string; valor: string; nota?: string | null }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-500">{rotulo}</p>
      <p className="text-2xl font-bold text-slate-800">{valor}</p>
      {nota && <p className="text-xs font-semibold text-emerald-600">{nota}</p>}
    </div>
  )
}

/**
 * Mini relatório: os números que importam numa olhada só, mais uma frase
 * pronta pra ler em voz alta numa reunião. Texto gerado por regra fixa
 * (sem IA) a partir dos mesmos dados dos cards abaixo.
 */
export default function ResumoRapido({ ads, ga, dias }: { ads: ResumoGoogleAds; ga: ResumoAnalytics; dias: number }) {
  const partes: string[] = []

  if (ga.disponivel) {
    const v = variacao(ga.usuarios, ga.usuariosAnterior)
    partes.push(
      `Nos últimos ${dias} dias, ${inteiro(ga.usuarios)} ${ga.usuarios === 1 ? 'pessoa visitou' : 'pessoas visitaram'} o site` +
        (v ? ` (${v} em relação ao período anterior)` : '') +
        (ga.cliquesWhatsapp > 0
          ? ` e ${inteiro(ga.cliquesWhatsapp)} ${ga.cliquesWhatsapp === 1 ? 'clicou' : 'clicaram'} para chamar no WhatsApp.`
          : '.'),
    )
  }

  if (ads.disponivel) {
    const noAr = ads.campanhas.filter(c => c.situacao === 'no_ar').length
    if (ads.totais.impressoes > 0) {
      partes.push(
        `Os anúncios apareceram ${inteiro(ads.totais.impressoes)} vezes, geraram ${inteiro(ads.totais.cliques)} cliques ` +
          `e ${inteiro(Math.round(ads.totais.conversoes))} contatos, com investimento de ${moeda(ads.totais.custo)}.`,
      )
    } else if (noAr > 0) {
      partes.push('Os anúncios estão no ar e ainda não acumularam resultados neste período.')
    } else {
      partes.push('As campanhas de anúncios estão configuradas e aguardando o início da veiculação.')
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="font-bold text-lg text-slate-800 mb-1">Resumo do período</h2>
      <p className="text-xs text-slate-400 mb-5">Últimos {dias} dias · site e anúncios</p>

      {partes.length > 0 && <p className="text-sm text-slate-700 leading-relaxed mb-5">{partes.join(' ')}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ga.disponivel && (
          <>
            <Kpi rotulo="Pessoas no site" valor={inteiro(ga.usuarios)} nota={variacao(ga.usuarios, ga.usuariosAnterior)} />
            <Kpi rotulo="Cliques no WhatsApp" valor={inteiro(ga.cliquesWhatsapp)} />
          </>
        )}
        {ads.disponivel && (
          <>
            <Kpi rotulo="Investido em anúncios" valor={moeda(ads.totais.custo)} />
            <Kpi rotulo="Contatos pelos anúncios" valor={inteiro(Math.round(ads.totais.conversoes))} />
          </>
        )}
      </div>
    </div>
  )
}
