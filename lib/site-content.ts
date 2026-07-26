import { createClient } from '@/lib/supabase/server'
import { niches, type NicheConfig } from '@/lib/templates'

/**
 * Resolve accent_key -> { accent, solidBg } reaproveitando as classes
 * tailwind já existentes em lib/templates.ts (todas literais no código-
 * fonte, então o Tailwind consegue gerar o CSS em build time). Nunca
 * monte essas classes dinamicamente a partir de hex vindo do banco —
 * o Tailwind não vai gerar a classe e a cor simplesmente não aparece.
 */
export function resolveAccent(accentKey: string): { accent: string; solidBg: string } {
  const found = niches.find(n => n.slug === accentKey)
  if (found) return { accent: found.accent, solidBg: found.solidBg }
  // fallback neutro, nunca deve ser usado na prática (accent_key sempre
  // vem de um dos 7 slugs conhecidos, validado na criação do site)
  return { accent: 'from-[#4facfe] to-[#00f2fe]', solidBg: 'bg-[#0ea5e9]' }
}

export interface SiteRow {
  id: string
  tenant_id: string
  slug: string
  pagelayout: NicheConfig['pageLayout']
  accent_key: string
  business_name: string
  tagline: string
  hero_title: string
  hero_sub: string
  cta_label: string
  whatsapp: string | null
  instagram_handle: string | null
  status: 'rascunho' | 'publicado'
}

/**
 * Busca o site pelo slug (RLS decide o que aparece: dono do tenant e
 * super-admin veem rascunho, visitante anônimo só vê publicado) e monta
 * o NicheConfig equivalente, pronto pra passar pro mesmo componente de
 * layout usado nas vitrines estáticas — zero adaptação nos 7 arquétipos.
 */
export async function getSiteConfigBySlug(
  slug: string
): Promise<{ site: SiteRow; config: NicheConfig } | null> {
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('sites')
    .select('id, tenant_id, slug, pagelayout, accent_key, business_name, tagline, hero_title, hero_sub, cta_label, whatsapp, instagram_handle, status')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (!site) return null

  const [{ data: servicos }, { data: depoimentos }, { data: fotos }, { data: posts }, { data: stats }] = await Promise.all([
    supabase.from('site_servicos').select('icon, title, description').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_depoimentos').select('nome, texto').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_fotos').select('url').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_posts').select('caption, likes').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_stats').select('valor, rotulo').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
  ])

  const { accent, solidBg } = resolveAccent(site.accent_key)

  const config: NicheConfig = {
    slug: site.slug,
    label: site.business_name,
    businessName: site.business_name,
    tagline: site.tagline,
    heroTitle: site.hero_title,
    heroSub: site.hero_sub,
    ctaLabel: site.cta_label,
    pageLayout: site.pagelayout,
    accent,
    solidBg,
    igHandle: site.instagram_handle || '@seunegocio',
    whatsapp: site.whatsapp || undefined,
    photoIds: (fotos ?? []).map(f => f.url),
    services: (servicos ?? []).map(s => ({ icon: s.icon, title: s.title, desc: s.description })),
    testimonials: (depoimentos ?? []).map(d => ({ name: d.nome, text: d.texto })),
    posts: (posts ?? []).map(p => ({ emoji: '', bg: accent, likes: p.likes, caption: p.caption })),
    stats: (stats ?? []).map(s => ({ valor: s.valor, rotulo: s.rotulo })),
  }

  return { site: site as SiteRow, config }
}
