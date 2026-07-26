'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ALLOWED_SITE_FIELDS = [
  'business_name', 'tagline', 'hero_title', 'hero_sub', 'cta_label', 'whatsapp', 'instagram_handle',
] as const
type SiteField = typeof ALLOWED_SITE_FIELDS[number]

export async function updateSiteField(siteId: string, field: SiteField, value: string) {
  if (!ALLOWED_SITE_FIELDS.includes(field)) throw new Error('Campo inválido.')
  const supabase = await createClient()
  const cleanValue = field === 'whatsapp' ? value.replace(/\D/g, '') : value
  const { error } = await supabase.from('sites').update({ [field]: cleanValue }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidatePath('/app/editor')
}

export async function replaceFoto(fotoId: string, newUrl: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_fotos').update({ url: newUrl }).eq('id', fotoId)
  if (error) throw new Error(error.message)
  revalidatePath('/app/editor')
}

export async function addFotoToPool(siteId: string, url: string) {
  const supabase = await createClient()
  const { data: max } = await supabase
    .from('site_fotos')
    .select('ordem')
    .eq('site_id', siteId)
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('site_fotos')
    .insert({ site_id: siteId, url, ordem: (max?.ordem ?? -1) + 1 })
    .select('id, url')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/app/editor')
  return data
}

export async function deleteFotoFromPool(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_fotos').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/editor')
}

export async function upsertServicoInline(
  siteId: string,
  servicoId: string | null,
  data: { icon: string; title: string; description: string }
) {
  const supabase = await createClient()
  if (servicoId) {
    const { error } = await supabase.from('site_servicos').update(data).eq('id', servicoId)
    if (error) throw new Error(error.message)
    return { id: servicoId, ...data }
  }

  const { data: max } = await supabase
    .from('site_servicos')
    .select('ordem')
    .eq('site_id', siteId)
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: created, error } = await supabase
    .from('site_servicos')
    .insert({ site_id: siteId, ...data, ordem: (max?.ordem ?? -1) + 1 })
    .select('id, icon, title, description')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/app/editor')
  return created
}

export async function deleteServicoInline(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_servicos').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/editor')
}

export async function upsertStatInline(
  siteId: string,
  statId: string | null,
  data: { valor: string; rotulo: string }
) {
  const supabase = await createClient()
  if (statId) {
    const { error } = await supabase.from('site_stats').update(data).eq('id', statId)
    if (error) throw new Error(error.message)
    revalidatePath('/app/editor')
    return { id: statId, ...data }
  }

  const { data: max } = await supabase
    .from('site_stats')
    .select('ordem')
    .eq('site_id', siteId)
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: created, error } = await supabase
    .from('site_stats')
    .insert({ site_id: siteId, ...data, ordem: (max?.ordem ?? -1) + 1 })
    .select('id, valor, rotulo')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/app/editor')
  return created
}

export async function deleteStatInline(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_stats').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/editor')
}

export async function upsertDepoimentoInline(
  siteId: string,
  depoimentoId: string | null,
  data: { nome: string; texto: string }
) {
  const supabase = await createClient()
  if (depoimentoId) {
    const { error } = await supabase.from('site_depoimentos').update(data).eq('id', depoimentoId)
    if (error) throw new Error(error.message)
    return { id: depoimentoId, ...data }
  }

  const { data: created, error } = await supabase
    .from('site_depoimentos')
    .insert({ site_id: siteId, ...data, ordem: 0 })
    .select('id, nome, texto')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/app/editor')
  return created
}
