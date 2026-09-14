import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { DOMAIN_MAP } from '@/lib/domain-map'
import {
  SITE_SLUG,
  SITE_URL_BASE,
  imagemAbsoluta,
  slugify,
  markdownToHtml,
  htmlToText,
  estimarTempoLeitura,
  type Conto,
} from '@/lib/casos-esquecidos-shared'

/**
 * Projeto Especial #2 (migrado do repo standalone casosesquecidos-web —
 * ver HANDOFF-casosesquecidos-para-webstudio.md). Helper dedicado, mesmo
 * espírito do lib/dentista-joao.ts: NÃO passa pelo pipeline genérico de
 * nicho. Diferença chave em relação ao original: a tabela `contos` agora
 * é multi-tenant (`site_id`), então toda query aqui é isolada por site.
 *
 * Funções puras e tipos (sem dependência de next/headers) ficam em
 * lib/casos-esquecidos-shared.ts, pra poderem ser importadas também por
 * client components (ex: ContoForm) sem quebrar o build.
 */
export { SITE_SLUG, SITE_URL_BASE, imagemAbsoluta, slugify, markdownToHtml, htmlToText, estimarTempoLeitura }
export type { Conto }

// Path interno onde as páginas realmente moram no Next.js.
const INTERNAL_PATH = '/projetos-especiais/casos-esquecidos'

// Tag única de cache pra todo o conteúdo público (contos + agendados)
// deste site. `atualizarConto`/`criarConto`/`cores/actions.ts` chamam
// `revalidateTag(CACHE_TAG_CONTOS)` depois de qualquer escrita — sem
// isso, a mudança só apareceria no ar depois dos `revalidate` abaixo
// (até 1h). Uma tag só é suficiente aqui: publicação é ~1x/semana via
// admin, não em massa, então invalidar tudo de uma vez é barato e
// simples — não precisa de granularidade por conto/tema.
export const CACHE_TAG_CONTOS = 'casos-esquecidos-contos'

/**
 * Path a usar em TODO link interno do site (nav, footer, cards, etc).
 * No domínio próprio, retorna '' — link fica limpo, ex: `${base}/contos`
 * vira `/contos`, sem vazar `/projetos-especiais/casos-esquecidos` pra
 * URL que o visitante vê, pro Google indexar, ou pro sitemap. No domínio
 * de fallback (*.vercel.app, sem o rewrite do proxy.ts), retorna o path
 * interno completo, senão os links quebrariam lá.
 * Mesmo padrão de lib/dentista-joao.ts getBasePath().
 */
export async function getBasePath(): Promise<string> {
  const h = await headers()
  const host = h.get('host')?.replace(/:\d+$/, '') ?? ''
  const isCustomDomain = Boolean(DOMAIN_MAP[host])
  return isCustomDomain ? '' : INTERNAL_PATH
}

export interface SiteEspecial {
  id: string
  tenant_id: string
  business_name: string
  tagline: string | null
  status: 'rascunho' | 'publicado'
  seo_indexavel: boolean
  textos_customizados: Record<string, string>
}

const buscarSiteEspecialSemCache = async (): Promise<SiteEspecial | null> => {
  const supabase = await createPublicClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, tenant_id, business_name, tagline, status, seo_indexavel, textos_customizados')
    .eq('slug', SITE_SLUG)
    .is('deleted_at', null)
    .single()
  return (site as SiteEspecial) || null
}

// Cache de 1h — antes desta mudança, TODA página do Casos Esquecidos
// disparava essa query (e mais 2-5 outras) do zero a cada request,
// porque getBasePath() (abaixo) chama headers() e isso força a rota
// inteira a renderizar como dynamic, anulando o `revalidate = 3600`
// declarado em cada page.tsx (ISR nunca rodou de verdade nesse
// projeto). unstable_cache cacheia o RESULTADO da query mesmo em rota
// dynamic — é isso que derruba o TTFB (medido em 1,2-3,5s) pra
// ~dezenas de ms no cache-hit. Revalidação: automática em 1h, ou
// imediata via revalidateTag(CACHE_TAG_CONTOS) nas actions do admin.
const getSiteEspecialCached = unstable_cache(
  buscarSiteEspecialSemCache,
  ['casos-esquecidos-site-especial'],
  { revalidate: 3600, tags: [CACHE_TAG_CONTOS] }
)

export async function getSiteEspecial(): Promise<SiteEspecial> {
  const site = await getSiteEspecialCached()
  if (!site) notFound()
  return site
}

export async function getSiteId(): Promise<string> {
  const site = await getSiteEspecial()
  return site.id
}

export const getAllContos = unstable_cache(
  async (siteId: string): Promise<Conto[]> => {
    const supabase = await createPublicClient()
    const { data, error } = await supabase
      .from('contos')
      .select('*')
      .eq('site_id', siteId)
      .eq('publicado', true)
      .order('numero', { ascending: true })
    if (error) throw error
    return data || []
  },
  ['casos-esquecidos-get-all-contos'],
  { revalidate: 3600, tags: [CACHE_TAG_CONTOS] }
)

export const getContoBySlug = unstable_cache(
  async (siteId: string, slug: string): Promise<Conto | null> => {
    const supabase = await createPublicClient()
    const { data, error } = await supabase
      .from('contos')
      .select('*')
      .eq('site_id', siteId)
      .eq('slug', slug)
      .eq('publicado', true)
      .single()
    if (error) return null
    return data
  },
  ['casos-esquecidos-get-conto-by-slug'],
  { revalidate: 3600, tags: [CACHE_TAG_CONTOS] }
)

export const getRecentContos = unstable_cache(
  async (siteId: string, limit = 3): Promise<Conto[]> => {
    const supabase = await createPublicClient()
    const { data, error } = await supabase
      .from('contos')
      .select('*')
      .eq('site_id', siteId)
      .eq('publicado', true)
      .order('numero', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  },
  ['casos-esquecidos-get-recent-contos'],
  { revalidate: 3600, tags: [CACHE_TAG_CONTOS] }
)

export const getTotalContos = unstable_cache(
  async (siteId: string): Promise<number> => {
    const supabase = await createPublicClient()
    const { count, error } = await supabase
      .from('contos')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .eq('publicado', true)
    if (error) throw error
    return count || 0
  },
  ['casos-esquecidos-get-total-contos'],
  { revalidate: 3600, tags: [CACHE_TAG_CONTOS] }
)

export const getContosByTema = unstable_cache(
  async (siteId: string, tema: string): Promise<Conto[]> => {
    const supabase = await createPublicClient()
    const { data, error } = await supabase
      .from('contos')
      .select('*')
      .eq('site_id', siteId)
      .eq('publicado', true)
      .contains('temas', [tema])
      .order('numero', { ascending: true })
    if (error) throw error
    return data || []
  },
  ['casos-esquecidos-get-contos-by-tema'],
  { revalidate: 3600, tags: [CACHE_TAG_CONTOS] }
)

const buscarContosRelacionadosSemCache = async (siteId: string, temas: string[], numeroAtual: number, limit = 3): Promise<Conto[]> => {
  if (!temas || temas.length === 0) return []
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('contos')
    .select('*')
    .eq('site_id', siteId)
    .eq('publicado', true)
    .neq('numero', numeroAtual)
    .overlaps('temas', temas)
  if (error) throw error
  if (!data) return []

  const comContagem = data.map(c => ({
    conto: c,
    comuns: c.temas ? c.temas.filter((t: string) => temas.includes(t)).length : 0,
  }))
  comContagem.sort((a, b) => b.comuns - a.comuns || a.conto.numero - b.conto.numero)
  return comContagem.slice(0, limit).map(x => x.conto)
}

export const getContosRelacionados = unstable_cache(
  buscarContosRelacionadosSemCache,
  ['casos-esquecidos-get-contos-relacionados'],
  { revalidate: 3600, tags: [CACHE_TAG_CONTOS] }
)

export const getContoAdjacente = unstable_cache(
  async (siteId: string, numero: number, direcao: 'anterior' | 'proximo'): Promise<Conto | null> => {
    const supabase = await createPublicClient()
    const query = supabase
      .from('contos')
      .select('*')
      .eq('site_id', siteId)
      .eq('publicado', true)

    const { data, error } = direcao === 'anterior'
      ? await query.lt('numero', numero).order('numero', { ascending: false }).limit(1)
      : await query.gt('numero', numero).order('numero', { ascending: true }).limit(1)
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },
  ['casos-esquecidos-get-conto-adjacente'],
  { revalidate: 3600, tags: [CACHE_TAG_CONTOS] }
)

export type CasoAgendado = { numero: number; titulo: string; data_publicacao: string }

export const getCasosAgendados = unstable_cache(
  async (siteId: string): Promise<CasoAgendado[]> => {
    const supabase = await createPublicClient()
    const { data, error } = await supabase.rpc('casos_agendados_publicos', { p_site_id: siteId })
    if (error) throw error
    return data || []
  },
  ['casos-esquecidos-get-casos-agendados'],
  // revalidate curto (5min): esta lista muda de "não existe ainda" pra
  // "existe" no exato instante em que a data agendada chega — não é
  // uma escrita do admin (que já invalida via tag), é a passagem do
  // tempo. 1h de cache aqui atrasaria demais o card "selado" virar
  // conto de verdade no arquivo.
  { revalidate: 300, tags: [CACHE_TAG_CONTOS] }
)

// ── Admin: escreve/edita, respeitando RLS (usuário autenticado com
//    membership no tenant — mesmo padrão de login/auth do resto da
//    plataforma, sem bypass via service_role) ───────────────────────

export async function getAllContosAdmin(siteId: string): Promise<Conto[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contos')
    .select('*')
    .eq('site_id', siteId)
    .order('numero', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getContoBySlugAdmin(siteId: string, slug: string): Promise<Conto | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contos')
    .select('*')
    .eq('site_id', siteId)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getUltimoContoPorNumero(siteId: string): Promise<Conto | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contos')
    .select('*')
    .eq('site_id', siteId)
    .order('numero', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}
