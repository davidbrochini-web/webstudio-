import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { DOMAIN_MAP } from '@/lib/domain-map'

/**
 * Projeto Especial — LocalDesk (suporte técnico e manutenção de
 * computadores, público geral). Mesmo padrão de dentista-joao/
 * casos-esquecidos/colegio-elite: helper dedicado, página própria
 * por seção, sem pipeline genérico de nicho.
 *
 * PENDÊNCIAS DE CONTEÚDO (placeholder até o David confirmar):
 * - whatsapp/telefone reais
 * - cidade/região do atendimento a domicílio
 * - depoimentos de clientes reais (seção fica desligada até existir
 *   avaliação de verdade — nunca fabricar depoimento fictício)
 */
export const SITE_SLUG = 'localdesk'

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
  telefone: string | null
  endereco: string | null
  status: 'rascunho' | 'publicado'
  missao: string | null
  visao: string | null
  valores: string | null
  cta_heading: string | null
  cta_subtext: string | null
  secao_diferenciais_visivel: boolean
  secao_faq_visivel: boolean
  secao_depoimentos_visivel: boolean
  seo_indexavel: boolean
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
    .select('id, tenant_id, business_name, tagline, hero_title, hero_sub, hero_imagem_url, logo_url, whatsapp, telefone, endereco, status, missao, visao, valores, cta_heading, cta_subtext, secao_diferenciais_visivel, secao_faq_visivel, secao_depoimentos_visivel, seo_indexavel, cor_primaria, cor_secundaria, logo_posicao')
    .eq('slug', SITE_SLUG)
    .is('deleted_at', null)
    .single()

  if (!site) notFound()
  return site as SiteEspecial
}

export const SITE_URL_BASE = `https://localdesk.com.br`

/** CTA principal do site: WhatsApp quando existir, senão a página de
 *  Contato — nunca um link quebrado ("#"). O David pediu pra tirar
 *  o WhatsApp por enquanto (01/09/2026), então hoje isso sempre cai
 *  no Contato; volta a usar WhatsApp automaticamente assim que o
 *  campo `whatsapp` for preenchido de novo. */
export function getCtaPrincipal(site: Pick<SiteEspecial, 'whatsapp'>, base: string): { href: string; label: string; externo: boolean } {
  if (site.whatsapp) {
    return {
      href: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Olá! Preciso de ajuda com meu computador.')}`,
      label: 'Chamar no WhatsApp',
      externo: true,
    }
  }
  return { href: `${base}/contato`, label: 'Fazer contato', externo: false }
}

// Path interno onde as páginas realmente moram no Next.js.
const INTERNAL_PATH = '/projetos-especiais/localdesk'

/** Domínio próprio → links limpos (''); fallback .vercel.app → path
 *  interno completo. Enquanto localdesk.com.br não está no
 *  DOMAIN_MAP (aguardando o David apontar o DNS), sempre devolve o
 *  path interno. */
export async function getBasePath(): Promise<string> {
  const h = await headers()
  const host = h.get('host')?.replace(/:\d+$/, '') ?? ''
  const isCustomDomain = Object.entries(DOMAIN_MAP).some(
    ([domain, path]) => domain === host && path === INTERNAL_PATH
  )
  return isCustomDomain ? '' : INTERNAL_PATH
}
