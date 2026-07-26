'use server'

import { createClient } from '@/lib/supabase/server'
import { getNiche } from '@/lib/templates'
import { revalidatePath } from 'next/cache'

export interface SiteFormState {
  error?: string
  success?: boolean
}

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Cria o site do tenant a partir de um dos 7 templates de nicho —
 * o conteúdo nasce copiado do demo daquele nicho (serviços,
 * depoimentos, fotos, posts do feed), pronto pra o cliente editar
 * depois em /app/site em vez de começar do zero.
 */
export async function createSiteFromTemplate(
  _prev: SiteFormState,
  formData: FormData
): Promise<SiteFormState> {
  const tenantId = formData.get('tenant_id') as string
  const nicheSlug = formData.get('niche_slug') as string
  const slug = (formData.get('slug') as string)?.trim().toLowerCase()

  if (!tenantId || !nicheSlug || !slug) {
    return { error: 'Preencha todos os campos.' }
  }
  if (!SLUG_REGEX.test(slug)) {
    return { error: 'Slug inválido — use só letras minúsculas, números e hífen (ex: sorrir-odonto).' }
  }

  const niche = getNiche(nicheSlug)
  if (!niche) return { error: 'Template inválido.' }

  const supabase = await createClient()

  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      tenant_id: tenantId,
      slug,
      pagelayout: niche.pageLayout,
      accent_key: niche.slug,
      business_name: niche.businessName,
      tagline: niche.tagline,
      hero_title: niche.heroTitle,
      hero_sub: niche.heroSub,
      cta_label: niche.ctaLabel,
      instagram_handle: niche.igHandle,
      status: 'rascunho',
    })
    .select('id')
    .single()

  if (siteError || !site) {
    if (siteError?.code === '23505') {
      return { error: 'Esse slug já está em uso, ou esse tenant já tem um site — escolha outro slug.' }
    }
    return { error: `Erro ao criar site: ${siteError?.message ?? 'desconhecido'}` }
  }

  const siteId = site.id

  const URBANO_PRECOS = ['R$ 45', 'R$ 35', 'R$ 70', 'R$ 90']

  const [servicosRes, depoimentosRes, fotosRes, postsRes, statsRes] = await Promise.all([
    supabase.from('site_servicos').insert(
      niche.services.map((s, i) => ({
        site_id: siteId, icon: s.icon, title: s.title, description: s.desc, ordem: i,
        preco: niche.pageLayout === 'urbano' ? URBANO_PRECOS[i % URBANO_PRECOS.length] : null,
      }))
    ),
    supabase.from('site_depoimentos').insert(
      niche.testimonials.map((t, i) => ({ site_id: siteId, nome: t.name, texto: t.text, ordem: i }))
    ),
    supabase.from('site_fotos').insert(
      niche.photoIds.map((url, i) => ({ site_id: siteId, url, ordem: i }))
    ),
    supabase.from('site_posts').insert(
      niche.posts.map((p, i) => ({ site_id: siteId, caption: p.caption, likes: p.likes, ordem: i }))
    ),
    // A barra/bloco de números em destaque varia por nicho — cada um
    // com seus valores originais (antes hardcoded dentro do próprio
    // componente de layout, agora viram conteúdo real do tenant).
    (() => {
      if (niche.pageLayout === 'clinico') {
        return supabase.from('site_stats').insert([
          { site_id: siteId, valor: '+15', rotulo: 'anos de experiência', ordem: 0 },
          { site_id: siteId, valor: '+3.200', rotulo: 'pacientes atendidos', ordem: 1 },
          { site_id: siteId, valor: '4.9★', rotulo: 'avaliação média', ordem: 2 },
        ])
      }
      if (niche.pageLayout === 'editorial') {
        return supabase.from('site_stats').insert([
          { site_id: siteId, valor: '+18', rotulo: 'anos de atuação', ordem: 0 },
          { site_id: siteId, valor: '+400', rotulo: 'casos atendidos', ordem: 1 },
          { site_id: siteId, valor: '92%', rotulo: 'êxito em acordos', ordem: 2 },
        ])
      }
      if (niche.pageLayout === 'performance') {
        // ordem 0 = número gigante do hero; 1-4 = grade pequena
        return supabase.from('site_stats').insert([
          { site_id: siteId, valor: '500+', rotulo: 'alunos transformados', ordem: 0 },
          { site_id: siteId, valor: '+8', rotulo: 'anos', ordem: 1 },
          { site_id: siteId, valor: '24/7', rotulo: 'acesso', ordem: 2 },
          { site_id: siteId, valor: '4.8★', rotulo: 'avaliação', ordem: 3 },
          { site_id: siteId, valor: '+30', rotulo: 'aulas/semana', ordem: 4 },
        ])
      }
      return Promise.resolve({ error: null })
    })(),
  ])

  const childError = servicosRes.error || depoimentosRes.error || fotosRes.error || postsRes.error || statsRes.error
  if (childError) {
    // limpa o site criado se o conteúdo demo falhou ao copiar — evita
    // site "casca vazia" sem nenhum conteúdo
    await supabase.from('sites').delete().eq('id', siteId)
    return { error: `Site criado, mas erro ao copiar conteúdo demo: ${childError.message}. Tente novamente.` }
  }

  // O site é o módulo "Site + Instagram" — ativa a assinatura junto,
  // senão o cliente vê o site criado mas o painel dele bloqueia como
  // se o módulo não estivesse contratado.
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('modulo', 'site')
    .maybeSingle()

  if (existingSub) {
    await supabase.from('subscriptions').update({ status: 'ativo' }).eq('id', existingSub.id)
  } else {
    await supabase.from('subscriptions').insert({ tenant_id: tenantId, modulo: 'site', status: 'ativo' })
  }

  revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true }
}

export async function toggleSitePublish(siteId: string, tenantId: string, publicar: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sites')
    .update({ status: publicar ? 'publicado' : 'rascunho' })
    .eq('id', siteId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/tenants/${tenantId}`)
}
