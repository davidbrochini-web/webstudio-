import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_cache } from 'next/cache'

// Resumo do Google Analytics 4 (Data API) pro painel do cliente.
// Usa as MESMAS credenciais OAuth da linha em `google_ads_acessos`
// (refresh_token com escopos adwords + analytics.readonly) e a coluna
// `ga4_property_id`. Credencial nunca sai desta função — só números.

export interface ResumoAnalytics {
  disponivel: boolean
  motivoIndisponivel?: string
  atualizadoEm: string
  periodoDias: number
  usuarios: number
  usuariosAnterior: number
  sessoes: number
  sessoesAnterior: number
  visualizacoes: number
  taxaEngajamento: number // 0..1
  duracaoMediaSeg: number
  porDia: { data: string; usuarios: number }[]
  canais: { nome: string; sessoes: number }[]
  paginas: { caminho: string; visualizacoes: number }[]
  cliquesWhatsapp: number
  formulariosIniciados: number
}

// Rotas do painel/login também passam pelo mesmo domínio e o GA conta.
// Não é tráfego de paciente — fica fora do relatório.
const CAMINHOS_INTERNOS = ['/login', '/app', '/primeiro-acesso', '/redefinir-senha', '/meus-agendamentos']

const NOME_CANAL: Record<string, string> = {
  'Organic Search': 'Busca no Google (orgânico)',
  'Paid Search': 'Anúncios Google',
  Direct: 'Acesso direto',
  'Organic Social': 'Redes sociais',
  'Paid Social': 'Anúncios em redes sociais',
  Referral: 'Links de outros sites',
  'Organic Maps': 'Google Maps',
  Email: 'E-mail',
  Unassigned: 'Não identificado',
}

async function accessToken(c: { client_id: string; client_secret: string; refresh_token: string }) {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...c, grant_type: 'refresh_token' }),
  })
  if (!resp.ok) return null
  return ((await resp.json()).access_token as string) ?? null
}

type Linha = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }

async function report(propertyId: string, token: string, body: object): Promise<Linha[] | null> {
  const resp = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) return null
  return ((await resp.json()).rows as Linha[]) ?? []
}

const num = (l: Linha | undefined, i: number) => Number(l?.metricValues?.[i]?.value ?? 0)
const dim = (l: Linha, i = 0) => l.dimensionValues?.[i]?.value ?? ''

const filtroSemInternas = {
  notExpression: {
    orGroup: {
      expressions: CAMINHOS_INTERNOS.map(p => ({
        filter: { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: p } },
      })),
    },
  },
}

async function buscarSemCache(identificador: string, dias: number): Promise<ResumoAnalytics> {
  const vazio: ResumoAnalytics = {
    disponivel: false, atualizadoEm: new Date().toISOString(), periodoDias: dias,
    usuarios: 0, usuariosAnterior: 0, sessoes: 0, sessoesAnterior: 0, visualizacoes: 0,
    taxaEngajamento: 0, duracaoMediaSeg: 0, porDia: [], canais: [], paginas: [],
    cliquesWhatsapp: 0, formulariosIniciados: 0,
  }

  const { data: c } = await createAdminClient()
    .from('google_ads_acessos')
    .select('client_id, client_secret, refresh_token, ga4_property_id')
    .eq('identificador', identificador)
    .eq('ativo', true)
    .maybeSingle()

  if (!c?.ga4_property_id) return { ...vazio, motivoIndisponivel: 'Google Analytics ainda não conectado.' }
  const token = await accessToken(c)
  if (!token) return { ...vazio, motivoIndisponivel: 'A conexão com o Google expirou — a agência precisa reconectar.' }

  const pid = c.ga4_property_id
  const atual = { startDate: `${dias}daysAgo`, endDate: 'today' }
  const anterior = { startDate: `${dias * 2}daysAgo`, endDate: `${dias + 1}daysAgo` }

  const [totais, porDia, canais, paginas, eventos] = await Promise.all([
    report(pid, token, {
      dateRanges: [atual, anterior],
      metrics: ['activeUsers', 'sessions', 'screenPageViews', 'engagementRate', 'averageSessionDuration'].map(name => ({ name })),
    }),
    report(pid, token, {
      dateRanges: [atual], dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }),
    report(pid, token, {
      dateRanges: [atual], dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    }),
    report(pid, token, {
      dateRanges: [atual], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: filtroSemInternas, limit: 8,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    }),
    report(pid, token, {
      dateRanges: [atual], dimensions: [{ name: 'eventName' }, { name: 'linkUrl' }], metrics: [{ name: 'eventCount' }],
    }),
  ])

  if (!totais) return { ...vazio, motivoIndisponivel: 'Não foi possível consultar o Google Analytics agora.' }

  // Com 2 dateRanges o GA devolve uma linha por período (dimensão dateRange).
  const tAtual = totais.find(l => dim(l) === 'date_range_0')
  const tAnterior = totais.find(l => dim(l) === 'date_range_1')
  const ev = eventos ?? []
  const soma = (f: (l: Linha) => boolean) => ev.filter(f).reduce((s, l) => s + num(l, 0), 0)

  return {
    disponivel: true,
    atualizadoEm: new Date().toISOString(),
    periodoDias: dias,
    usuarios: num(tAtual, 0),
    usuariosAnterior: num(tAnterior, 0),
    sessoes: num(tAtual, 1),
    sessoesAnterior: num(tAnterior, 1),
    visualizacoes: num(tAtual, 2),
    taxaEngajamento: num(tAtual, 3),
    duracaoMediaSeg: num(tAtual, 4),
    porDia: (porDia ?? []).map(l => ({ data: dim(l), usuarios: num(l, 0) })),
    canais: (canais ?? []).map(l => ({ nome: NOME_CANAL[dim(l)] ?? dim(l), sessoes: num(l, 0) })),
    paginas: (paginas ?? []).map(l => ({ caminho: dim(l), visualizacoes: num(l, 0) })),
    cliquesWhatsapp: soma(l => dim(l, 0) === 'click' && /wa\.me|whatsapp/i.test(dim(l, 1))),
    formulariosIniciados: soma(l => dim(l, 0) === 'form_start'),
  }
}

// Cache de 1h: GA4 tem latência de processamento de horas, bater a cada
// carregamento não traz número mais novo e gasta cota da API.
export const getResumoAnalytics = unstable_cache(buscarSemCache, ['resumo-analytics-ga4'], { revalidate: 3600 })
