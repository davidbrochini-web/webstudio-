'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface DepoimentoFormState {
  error?: string
  success?: boolean
}

export async function upsertDepoimento(
  _prev: DepoimentoFormState,
  formData: FormData
): Promise<DepoimentoFormState> {
  const id = formData.get('id') as string | null
  const siteId = formData.get('site_id') as string
  const nome = (formData.get('nome') as string)?.trim()
  const texto = (formData.get('texto') as string)?.trim()

  if (!siteId || !nome || !texto) return { error: 'Nome e depoimento são obrigatórios.' }

  const supabase = await createClient()

  if (id) {
    const { error } = await supabase.from('site_depoimentos').update({ nome, texto }).eq('id', id)
    if (error) return { error: `Erro ao salvar: ${error.message}` }
  } else {
    const { data: max } = await supabase
      .from('site_depoimentos')
      .select('ordem')
      .eq('site_id', siteId)
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error } = await supabase
      .from('site_depoimentos')
      .insert({ site_id: siteId, nome, texto, ordem: (max?.ordem ?? -1) + 1 })
    if (error) return { error: `Erro ao criar: ${error.message}` }
  }

  revalidatePath('/app/site/depoimentos')
  return { success: true }
}

export async function deleteDepoimento(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_depoimentos').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/site/depoimentos')
}
