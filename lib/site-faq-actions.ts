'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/** Genérico — mesma lógica de lib/site-diferenciais-actions.ts, pra
 *  tabela `site_faq`. Reaproveitável por qualquer cliente futuro. */

export interface FaqFormState {
  error?: string
  success?: boolean
}

export async function upsertFaq(
  path: string,
  _prev: FaqFormState,
  formData: FormData
): Promise<FaqFormState> {
  const id = formData.get('id') as string | null
  const siteId = formData.get('site_id') as string
  const pergunta = (formData.get('pergunta') as string)?.trim()
  const resposta = (formData.get('resposta') as string)?.trim()
  const categoria = (formData.get('categoria') as string)?.trim() || null

  if (!siteId || !pergunta || !resposta) return { error: 'Pergunta e resposta são obrigatórias.' }

  const supabase = await createClient()

  if (id) {
    const { error } = await supabase
      .from('site_faq')
      .update({ pergunta, resposta, categoria })
      .eq('id', id)
    if (error) return { error: `Erro ao salvar: ${error.message}` }
  } else {
    const { data: max } = await supabase
      .from('site_faq')
      .select('ordem')
      .eq('site_id', siteId)
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error } = await supabase
      .from('site_faq')
      .insert({ site_id: siteId, pergunta, resposta, categoria, ordem: (max?.ordem ?? -1) + 1 })
    if (error) return { error: `Erro ao criar: ${error.message}` }
  }

  revalidatePath(path)
  return { success: true }
}

export async function deleteFaq(id: string, path: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_faq').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(path)
}
