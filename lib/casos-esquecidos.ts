import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
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

export interface SiteEspecial {
  id: string
  tenant_id: string
  business_name: string
  tagline: string | null
  status: 'rascunho' | 'publicado'
  seo_indexavel: boolean
}

export async function getSiteEspecial(): Promise<SiteEspecial> {
  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, tenant_id, business_name, tagline, status, seo_indexavel')
    .eq('slug', SITE_SLUG)
    .is('deleted_at', null)
    .single()

  if (!site) notFound()
  return site as SiteEspecial
}

export async function getSiteId(): Promise<string> {
  const site = await getSiteEspecial()
  return site.id
}

export async function getAllContos(siteId: string): Promise<Conto[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contos')
    .select('*')
    .eq('site_id', siteId)
    .eq('publicado', true)
    .order('numero', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getContoBySlug(siteId: string, slug: string): Promise<Conto | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contos')
    .select('*')
    .eq('site_id', siteId)
    .eq('slug', slug)
    .eq('publicado', true)
    .single()
  if (error) return null
  return data
}

export async function getRecentContos(siteId: string, limit = 3): Promise<Conto[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contos')
    .select('*')
    .eq('site_id', siteId)
    .eq('publicado', true)
    .order('numero', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function getTotalContos(siteId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('contos')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', siteId)
    .eq('publicado', true)
  if (error) throw error
  return count || 0
}

export async function getContosByTema(siteId: string, tema: string): Promise<Conto[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contos')
    .select('*')
    .eq('site_id', siteId)
    .eq('publicado', true)
    .contains('temas', [tema])
    .order('numero', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getContosRelacionados(siteId: string, temas: string[], numeroAtual: number, limit = 3): Promise<Conto[]> {
  if (!temas || temas.length === 0) return []
  const supabase = await createClient()
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

export async function getContoAdjacente(siteId: string, numero: number, direcao: 'anterior' | 'proximo'): Promise<Conto | null> {
  const supabase = await createClient()
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
}

export type CasoAgendado = { numero: number; titulo: string; data_publicacao: string }

export async function getCasosAgendados(siteId: string): Promise<CasoAgendado[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('casos_agendados_publicos', { p_site_id: siteId })
  if (error) throw error
  return data || []
}

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
