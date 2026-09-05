'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ServicoFormState {
  error?: string
  success?: boolean
}

export async function upsertServico(
  _prev: ServicoFormState,
  formData: FormData
): Promise<ServicoFormState> {
  const id = formData.get('id') as string | null
  const siteId = formData.get('site_id') as string
  const icon = (formData.get('icon') as string)?.trim() || '✨'
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() ?? ''

  if (!siteId || !title) return { error: 'Título é obrigatório.' }

  const supabase = await createClient()

  if (id) {
    const { error } = await supabase
      .from('site_servicos')
      .update({ icon, title, description })
      .eq('id', id)
    if (error) return { error: `Erro ao salvar: ${error.message}` }
  } else {
    const { data: max } = await supabase
      .from('site_servicos')
      .select('ordem')
      .eq('site_id', siteId)
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error } = await supabase
      .from('site_servicos')
      .insert({ site_id: siteId, icon, title, description, ordem: (max?.ordem ?? -1) + 1 })
    if (error) return { error: `Erro ao criar: ${error.message}` }
  }

  revalidatePath('/app/site/servicos')
  revalidatePath('/app/localdesk/servicos')
  return { success: true }
}

export async function deleteServico(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_servicos').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/site/servicos')
  revalidatePath('/app/localdesk/servicos')
}
