import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_cache } from 'next/cache'

// Resumo de campanhas Google Ads, pra exibir no painel do cliente sem
// nunca expor a credencial bruta (developer_token/client_secret/refresh_token
// nunca saem desta função — só números agregados). Genérico: qualquer
// cliente com uma linha em `google_ads_acessos` usa a mesma função.

export interface CampanhaResumo {
  id: string
  nome: string
  status: string
  orcamentoDiario: number
  cliques: number
  impressoes: number
  custo: number
  ctr: number
  conversoes: number
  /** Situação real de veiculação (campaign.primary_status), não só o "ligado/desligado". */
  situacao: 'no_ar' | 'pausada' | 'analise' | 'parada'
}

export interface ConversaoPorTipo {
  nome: string
  quantidade: number
}

export interface KeywordResumo {
  texto: string
  matchType: string
  status: string
  campanha: string
  cliques: number
  impressoes: number
  cpcMedio: number
}

export interface ResumoGoogleAds {
  disponivel: boolean
  motivoIndisponivel?: string
  atualizadoEm: string
  periodoDias: number
  campanhas: CampanhaResumo[]
  keywords: KeywordResumo[]
  conversoesPorTipo: ConversaoPorTipo[]
  totais: { custo: number; cliques: number; impressoes: number; conversoes: number }
}

// Período em datas explícitas (fuso da conta: America/Sao_Paulo). Os
// literais LAST_7_DAYS/LAST_30_DAYS do GAQL não cobrem 90 dias.
function filtroPeriodo(dias: number) {
  const fmt = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const fim = new Date()
  const ini = new Date(fim.getTime() - (dias - 1) * 86_400_000)
  return `segments.date BETWEEN '${fmt(ini)}' AND '${fmt(fim)}'`
}

const SITUACAO: Record<string, CampanhaResumo['situacao']> = {
  ELIGIBLE: 'no_ar',
  PAUSED: 'pausada',
  PENDING: 'analise',
}

async function renovarAccessToken(creds: {
  client_id: string
  client_secret: string
  refresh_token: string
}): Promise<string | null> {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  if (!resp.ok) return null
  const data = await resp.json()
  return data.access_token ?? null
}

// Versão mínima da API do Google Ads. O Google desativa versões antigas
// sem aviso no nosso lado: a v22 foi bloqueada em 16/10/2026 e derrubou a
// aba Google, porque a versão estava fixa aqui e a coluna
// google_ads_acessos.api_version era ignorada. Agora vale a MAIOR entre
// esta constante e a do banco: dá pra subir a versão só pelo banco (sem
// deploy), e uma linha antiga no banco nunca rebaixa a versão do código.
const GOOGLE_ADS_API_VERSION = 'v25'

function versaoEfetiva(doBanco: string | null | undefined): string {
  const n = (v: string | null | undefined) => Number(/^v(\d+)$/.exec(v ?? '')?.[1] ?? 0)
  return n(doBanco) > n(GOOGLE_ADS_API_VERSION) ? (doBanco as string) : GOOGLE_ADS_API_VERSION
}

async function gadsQuery(
  customerId: string,
  mccId: string,
  accessToken: string,
  developerToken: string,
  query: string,
  versao: string = GOOGLE_ADS_API_VERSION
) {
  const resp = await fetch(
    `https://googleads.googleapis.com/${versao}/customers/${customerId}/googleAds:search`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'login-customer-id': mccId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  )
  if (!resp.ok) return null
  const data = await resp.json()
  return data.results ?? []
}

async function buscarResumoSemCache(identificador: string, dias = 30): Promise<ResumoGoogleAds> {
  const vazio: ResumoGoogleAds = {
    disponivel: false,
    atualizadoEm: new Date().toISOString(),
    periodoDias: dias,
    campanhas: [],
    keywords: [],
    conversoesPorTipo: [],
    totais: { custo: 0, cliques: 0, impressoes: 0, conversoes: 0 },
  }

  const admin = createAdminClient()
  const { data: creds } = await admin
    .from('google_ads_acessos')
    .select('developer_token, client_id, client_secret, refresh_token, mcc_id, customer_id, api_version')
    .eq('identificador', identificador)
    .eq('ativo', true)
    .maybeSingle()

  if (!creds) {
    return { ...vazio, motivoIndisponivel: 'Nenhuma conta Google Ads conectada ainda.' }
  }

  const accessToken = await renovarAccessToken(creds)
  if (!accessToken) {
    return { ...vazio, motivoIndisponivel: 'Sessão do Google Ads expirada — peça pro time técnico reconectar.' }
  }

  // Campanhas REMOVED (deletadas) não têm valor nenhum pro cliente ver —
  // ficam de fora do resumo inteiro (campanhas, keywords e contagem de anúncios).
  const filtroAtivas = `campaign.status != 'REMOVED'`

  const periodo = filtroPeriodo(dias)
  const versao = versaoEfetiva(creds.api_version)
  const campQuery = `
    SELECT campaign.id, campaign.name, campaign.status, campaign.primary_status, campaign_budget.amount_micros,
           metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.ctr,
           metrics.conversions
    FROM campaign
    WHERE ${periodo} AND ${filtroAtivas}
  `
  const kwQuery = `
    SELECT campaign.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
           ad_group_criterion.status, metrics.clicks, metrics.impressions, metrics.average_cpc
    FROM keyword_view
    WHERE ${periodo} AND ${filtroAtivas}
    ORDER BY metrics.clicks DESC
    LIMIT 20
  `
  // Conversões por tipo de ação (Agendamento/WhatsApp/Chamada) — nomes vêm
  // exatamente como cadastrados em conversionActions:mutate, sem precisar
  // hardcodar o texto aqui (funciona pra qualquer cliente com suas próprias
  // ações de conversão, não só o nome específico das 3 do Dr. João).
  const convQuery = `
    SELECT conversion_action.name, metrics.conversions
    FROM conversion_action
    WHERE ${periodo}
  `

  const [campRows, kwRows, convRows] = await Promise.all([
    gadsQuery(creds.customer_id, creds.mcc_id, accessToken, creds.developer_token, campQuery, versao),
    gadsQuery(creds.customer_id, creds.mcc_id, accessToken, creds.developer_token, kwQuery, versao),
    gadsQuery(creds.customer_id, creds.mcc_id, accessToken, creds.developer_token, convQuery, versao),
  ])

  if (campRows === null) {
    return { ...vazio, motivoIndisponivel: 'Não foi possível consultar o Google Ads agora. Tente novamente em alguns minutos.' }
  }

  const ordemStatus: Record<string, number> = { ENABLED: 0, PAUSED: 1 }
  const campanhas: CampanhaResumo[] = campRows
    .map((r: any) => ({
      id: r.campaign.id,
      nome: r.campaign.name,
      status: r.campaign.status,
      orcamentoDiario: Number(r.campaignBudget?.amountMicros ?? 0) / 1e6,
      cliques: Number(r.metrics?.clicks ?? 0),
      impressoes: Number(r.metrics?.impressions ?? 0),
      custo: Number(r.metrics?.costMicros ?? 0) / 1e6,
      ctr: Number(r.metrics?.ctr ?? 0),
      conversoes: Number(r.metrics?.conversions ?? 0),
      situacao: SITUACAO[r.campaign.primaryStatus] ?? 'parada',
    }))
    .sort((a: CampanhaResumo, b: CampanhaResumo) => (ordemStatus[a.status] ?? 2) - (ordemStatus[b.status] ?? 2))

  const keywords: KeywordResumo[] = (kwRows ?? []).map((r: any) => ({
    texto: r.adGroupCriterion?.keyword?.text ?? '',
    matchType: r.adGroupCriterion?.keyword?.matchType ?? '',
    status: r.adGroupCriterion?.status ?? '',
    campanha: r.campaign?.name ?? '',
    cliques: Number(r.metrics?.clicks ?? 0),
    impressoes: Number(r.metrics?.impressions ?? 0),
    cpcMedio: Number(r.metrics?.averageCpc ?? 0) / 1e6,
  }))

  const conversoesPorTipo: ConversaoPorTipo[] = (convRows ?? [])
    .map((r: any) => ({
      nome: r.conversionAction?.name ?? '',
      quantidade: Number(r.metrics?.conversions ?? 0),
    }))
    .filter((c: ConversaoPorTipo) => c.nome)

  return {
    disponivel: true,
    atualizadoEm: new Date().toISOString(),
    periodoDias: dias,
    campanhas,
    keywords,
    conversoesPorTipo,
    totais: {
      custo: campanhas.reduce((s, c) => s + c.custo, 0),
      cliques: campanhas.reduce((s, c) => s + c.cliques, 0),
      impressoes: campanhas.reduce((s, c) => s + c.impressoes, 0),
      conversoes: campanhas.reduce((s, c) => s + c.conversoes, 0),
    },
  }
}

// Cache de 15min — evita bater na API do Google a cada carregamento de página.
export const getResumoGoogleAds = unstable_cache(
  buscarResumoSemCache,
  ['resumo-google-ads'],
  { revalidate: 900 }
)

// ── Relatório por período (e-mail para o cliente) ─────────────────────
// Sem cache de propósito: o e-mail sai com o número do momento do envio.
// Mesmo princípio do resumo: credencial nunca sai daqui, só agregados.
export interface RelatorioGoogleAds {
  disponivel: boolean
  motivoIndisponivel?: string
  desde: string
  ate: string
  totais: { impressoes: number; cliques: number; custo: number; conversoes: number }
  campanhas: { nome: string; impressoes: number; cliques: number; custo: number; conversoes: number; orcamentoDiario: number }[]
  porDia: { data: string; impressoes: number; cliques: number; custo: number }[]
  keywords: { texto: string; campanha: string; impressoes: number; cliques: number; custo: number }[]
  saldoDisponivel: number | null
}

export async function relatorioGoogleAds(identificador: string, desde: string): Promise<RelatorioGoogleAds> {
  const ate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const vazio: RelatorioGoogleAds = {
    disponivel: false, desde, ate,
    totais: { impressoes: 0, cliques: 0, custo: 0, conversoes: 0 },
    campanhas: [], porDia: [], keywords: [], saldoDisponivel: null,
  }

  const admin = createAdminClient()
  const { data: creds } = await admin
    .from('google_ads_acessos')
    .select('developer_token, client_id, client_secret, refresh_token, mcc_id, customer_id, api_version')
    .eq('identificador', identificador)
    .eq('ativo', true)
    .maybeSingle()
  if (!creds) return { ...vazio, motivoIndisponivel: 'Conta Google Ads não conectada.' }

  const token = await renovarAccessToken(creds)
  if (!token) return { ...vazio, motivoIndisponivel: 'Sessão do Google Ads expirada.' }

  const versao = versaoEfetiva(creds.api_version)
  const q = (query: string) =>
    gadsQuery(creds.customer_id, creds.mcc_id, token, creds.developer_token, query, versao)
  const periodo = `segments.date BETWEEN '${desde}' AND '${ate}'`
  const ativas = `campaign.status = 'ENABLED'`

  const [camp, dia, kw, saldo] = await Promise.all([
    q(`SELECT campaign.name, campaign_budget.amount_micros, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
       FROM campaign WHERE ${periodo} AND ${ativas}`),
    q(`SELECT segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros
       FROM customer WHERE ${periodo}`),
    q(`SELECT campaign.name, ad_group_criterion.keyword.text, metrics.impressions, metrics.clicks, metrics.cost_micros
       FROM keyword_view WHERE ${periodo} AND ${ativas} AND metrics.impressions > 0
       ORDER BY metrics.clicks DESC, metrics.impressions DESC LIMIT 10`),
    q(`SELECT account_budget.approved_spending_limit_micros, account_budget.amount_served_micros
       FROM account_budget WHERE account_budget.status = 'APPROVED'`),
  ])
  if (camp === null) return { ...vazio, motivoIndisponivel: 'Não foi possível consultar o Google Ads.' }

  const num = (v: unknown) => Number(v ?? 0)
  const campanhas = camp.map((r: any) => ({
    nome: r.campaign.name as string,
    orcamentoDiario: num(r.campaignBudget?.amountMicros) / 1e6,
    impressoes: num(r.metrics?.impressions),
    cliques: num(r.metrics?.clicks),
    custo: num(r.metrics?.costMicros) / 1e6,
    conversoes: num(r.metrics?.conversions),
  })).sort((a: { cliques: number; impressoes: number }, b: { cliques: number; impressoes: number }) =>
    b.cliques - a.cliques || b.impressoes - a.impressoes)

  const porDia = (dia ?? []).map((r: any) => ({
    data: r.segments.date as string,
    impressoes: num(r.metrics?.impressions),
    cliques: num(r.metrics?.clicks),
    custo: num(r.metrics?.costMicros) / 1e6,
  })).sort((a: { data: string }, b: { data: string }) => a.data.localeCompare(b.data))

  const keywords = (kw ?? []).map((r: any) => ({
    texto: r.adGroupCriterion?.keyword?.text ?? '',
    campanha: r.campaign?.name ?? '',
    impressoes: num(r.metrics?.impressions),
    cliques: num(r.metrics?.clicks),
    custo: num(r.metrics?.costMicros) / 1e6,
  }))

  const saldoDisponivel = saldo && saldo.length
    ? saldo.reduce((s: number, r: any) =>
        s + (num(r.accountBudget?.approvedSpendingLimitMicros) - num(r.accountBudget?.amountServedMicros)) / 1e6, 0)
    : null

  return {
    disponivel: true, desde, ate,
    totais: {
      impressoes: campanhas.reduce((s: number, c: { impressoes: number }) => s + c.impressoes, 0),
      cliques: campanhas.reduce((s: number, c: { cliques: number }) => s + c.cliques, 0),
      custo: campanhas.reduce((s: number, c: { custo: number }) => s + c.custo, 0),
      conversoes: campanhas.reduce((s: number, c: { conversoes: number }) => s + c.conversoes, 0),
    },
    campanhas, porDia, keywords, saldoDisponivel,
  }
}
