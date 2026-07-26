'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface FotoFormState {
  error?: string
  success?: boolean
}

export async function addFoto(
  _prev: FotoFormState,
  formData: FormData
): Promise<FotoFormState> {
  const siteId = formData.get('site_id') as string
  const url = (formData.get('url') as string)?.trim()

  if (!siteId || !url) return { error: 'Cole a URL da foto.' }
  if (!/^https?:\/\//.test(url)) return { error: 'A URL precisa começar com http:// ou https://' }

  const supabase = await createClient()
  const { data: max } = await supabase
    .from('site_fotos')
    .select('ordem')
    .eq('site_id', siteId)
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase
    .from('site_fotos')
    .insert({ site_id: siteId, url, ordem: (max?.ordem ?? -1) + 1 })

  if (error) return { error: `Erro ao adicionar: ${error.message}` }

  revalidatePath('/app/site/fotos')
  return { success: true }
}

export async function deleteFoto(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_fotos').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/site/fotos')
}
