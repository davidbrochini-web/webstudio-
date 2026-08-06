import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

/**
 * Projeto Especial #1 (HANDOFF_DEV_Projeto_Especial_01.md). Helper
 * dedicado — NÃO passa pelo pipeline genérico de nicho
 * (lib/templates.ts / lib/site-content.ts), porque esse projeto tem
 * página própria por seção (não é um site de "rolagem única" com
 * config de nicho). Cada projeto especial futuro ganha o seu.
 */
export const SITE_SLUG = 'dentista-joao'

/** Formata um número guardado cru (ex: "5511900000000") pra exibição
 *  amigável (ex: "(11) 90000-0000"). O valor cru continua sendo usado
 *  no link wa.me — isso é só pra exibir na tela. */
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
  telefone: string | null
  endereco: string | null
  status: 'rascunho' | 'publicado'
  missao: string | null
  visao: string | null
  valores: string | null
  secao_tratamentos_visivel: boolean
  secao_cursos_visivel: boolean
  secao_equipe_visivel: boolean
  secao_faq_visivel: boolean
  secao_artigos_visivel: boolean
  seo_indexavel: boolean
}

/** Busca o site — 404 se não existir. Não filtra por status aqui:
 *  quem decide se pode ver conteúdo não-publicado é a RLS de cada
 *  tabela filha (is_site_publicado), então quem vê a shell da página
 *  mas não tem sessão simplesmente não recebe as linhas de conteúdo. */
export async function getSiteEspecial(): Promise<SiteEspecial> {
  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, tenant_id, business_name, tagline, hero_title, hero_sub, hero_imagem_url, logo_url, whatsapp, instagram_handle, telefone, endereco, status, missao, visao, valores, secao_tratamentos_visivel, secao_cursos_visivel, secao_equipe_visivel, secao_faq_visivel, secao_artigos_visivel, seo_indexavel')
    .eq('slug', SITE_SLUG)
    .is('deleted_at', null)
    .single()

  if (!site) notFound()
  return site as SiteEspecial
}

export const SITE_URL_BASE = `https://drjoaobucomaxilofacial.com.br`
// Domínio próprio ativo desde 05/08/2026 (DNS + SSL confirmados,
// rewrite no proxy.ts deixa a URL limpa — sem /projetos-especiais/...).
// Se o domínio mudar de novo, só essa linha precisa mudar.
