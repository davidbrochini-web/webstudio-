'use server'

import { createClient } from '@/lib/supabase/server'
import { seedSiteFromNiche } from '@/lib/site-seed'
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

  const supabase = await createClient()
  const result = await seedSiteFromNiche(supabase, tenantId, nicheSlug, slug, 'rascunho')
  if (result.error || !result.siteId) return { error: result.error ?? 'Erro desconhecido ao criar site.' }

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
