'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface IdentidadeCasosFormState {
  error?: string
  success?: boolean
}

/**
 * Casos Esquecidos não tem os campos de "identidade" que os outros
 * clientes têm (hero_title, whatsapp, cta_label etc. não são
 * renderizados em nenhuma página pública dele — o site é prosa
 * literária fixa, não um template de negócio). O que existe de
 * verdade é business_name/tagline (usados só em metadata/SEO) e o
 * toggle de indexação. Esta action cobre exatamente isso — nada a
 * mais, nada fictício.
 */
export async function updateIdentidadeCasos(
  _prev: IdentidadeCasosFormState,
  formData: FormData
): Promise<IdentidadeCasosFormState> {
  const siteId = formData.get('site_id') as string
  const businessName = (formData.get('business_name') as string)?.trim()
  const tagline = (formData.get('tagline') as string)?.trim() || null

  if (!siteId || !businessName) return { error: 'Nome é obrigatório.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('sites')
    .update({ business_name: businessName, tagline })
    .eq('id', siteId)

  if (error) return { error: `Erro ao salvar: ${error.message}` }

  revalidatePath('/app/casos-esquecidos')
  revalidatePath('/projetos-especiais/casos-esquecidos', 'layout')
  return { success: true }
}
