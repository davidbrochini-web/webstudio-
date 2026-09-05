'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Genérico — não hardcoded pra nenhum cliente específico. Opera na
 * tabela genérica `site_diferenciais`, usada hoje pelo LocalDesk e
 * disponível pra qualquer Projeto Especial ou cliente futuro que
 * precise de uma seção de diferenciais. `revalidatePath` recebe o
 * path de quem chamou, pra não acoplar esse arquivo a uma rota fixa.
 */

export interface DiferencialFormState {
  error?: string
  success?: boolean
}

export async function upsertDiferencial(
  path: string,
  _prev: DiferencialFormState,
  formData: FormData
): Promise<DiferencialFormState> {
  const id = formData.get('id') as string | null
  const siteId = formData.get('site_id') as string
  const icone = (formData.get('icone') as string)?.trim() || '✅'
  const titulo = (formData.get('titulo') as string)?.trim()
  const texto = (formData.get('texto') as string)?.trim()

  if (!siteId || !titulo || !texto) return { error: 'Título e texto são obrigatórios.' }

  const supabase = await createClient()

  if (id) {
    const { error } = await supabase
      .from('site_diferenciais')
      .update({ icone, titulo, texto })
      .eq('id', id)
    if (error) return { error: `Erro ao salvar: ${error.message}` }
  } else {
    const { data: max } = await supabase
      .from('site_diferenciais')
      .select('ordem')
      .eq('site_id', siteId)
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error } = await supabase
      .from('site_diferenciais')
      .insert({ site_id: siteId, icone, titulo, texto, ordem: (max?.ordem ?? -1) + 1 })
    if (error) return { error: `Erro ao criar: ${error.message}` }
  }

  revalidatePath(path)
  return { success: true }
}

export async function deleteDiferencial(id: string, path: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_diferenciais').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(path)
}
