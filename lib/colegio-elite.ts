import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { DOMAIN_MAP } from '@/lib/domain-map'

/**
 * Projeto Especial #3 — Colégio Elite. Mesmo padrão do dentista-joao/
 * casos-esquecidos: helper dedicado, NÃO passa pelo pipeline genérico
 * de nicho (lib/templates.ts / lib/site-content.ts) — página própria
 * por seção, não "rolagem única" com config de nicho.
 */
export const SITE_SLUG = 'colegio-elite'

export function formatTelefoneExibicao(numero: string): string {
  const digits = numero.replace(/\D/g, '').replace(/^55/, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return numero
}

export interface SiteEspecial {
  id: string
  tenant_id: string
  business_name: string
  tagline: string | null
  hero_title: string | null
  hero_sub: string | null
  hero_imagem_url: string | null
  logo_url: string | null
  whatsapp: string | null
  instagram_handle: string | null
  instagram_visivel: boolean
  telefone: string | null
  endereco: string | null
  status: 'rascunho' | 'publicado'
  missao: string | null
  visao: string | null
  valores: string | null
  secao_diferenciais_visivel: boolean
  secao_segmentos_visivel: boolean
  secao_faq_visivel: boolean
  secao_artigos_visivel: boolean
  seo_indexavel: boolean
  textos_customizados: Record<string, string>
  cor_primaria: string
  cor_secundaria: string
  logo_posicao: 'esquerda' | 'centro'
}

/** Busca o site — 404 se não existir. Não filtra por status: quem
 *  decide o que aparece pra visitante sem sessão é a RLS de cada
 *  tabela filha (is_site_publicado). */
export async function getSiteEspecial(): Promise<SiteEspecial> {
  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, tenant_id, business_name, tagline, hero_title, hero_sub, hero_imagem_url, logo_url, whatsapp, instagram_handle, instagram_visivel, telefone, endereco, status, missao, visao, valores, secao_diferenciais_visivel, secao_segmentos_visivel, secao_faq_visivel, secao_artigos_visivel, seo_indexavel, textos_customizados, cor_primaria, cor_secundaria, logo_posicao')
    .eq('slug', SITE_SLUG)
    .is('deleted_at', null)
    .single()

  if (!site) notFound()
  return site as SiteEspecial
}

export const SITE_URL_BASE = `https://elite.g12.br`

// Path interno onde as páginas realmente moram no Next.js.
const INTERNAL_PATH = '/projetos-especiais/colegio-elite'

/** Domínio próprio → links limpos (''); fallback .vercel.app → path
 *  interno completo. Fonte do mapeamento: lib/domain-map.ts (também
 *  usada pelo proxy.ts). Enquanto elite.g12.br não está no DOMAIN_MAP
 *  (ver nota lá), sempre devolve o path interno — é o comportamento
 *  correto pra fase de homologação em staging. */
export async function getBasePath(): Promise<string> {
  const h = await headers()
  const host = h.get('host')?.replace(/:\d+$/, '') ?? ''
  const isCustomDomain = Object.entries(DOMAIN_MAP).some(
    ([domain, path]) => domain === host && path === INTERNAL_PATH
  )
  return isCustomDomain ? '' : INTERNAL_PATH
}
