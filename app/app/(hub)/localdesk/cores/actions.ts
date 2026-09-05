'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCoresLocaldesk(siteId: string, corPrimaria: string, corSecundaria: string) {
  const hex = /^#[0-9a-fA-F]{6}$/
  if (!hex.test(corPrimaria) || !hex.test(corSecundaria)) throw new Error('Cor inválida — use o formato #RRGGBB.')
  const supabase = await createClient()
  const { error } = await supabase.from('sites')
    .update({ cor_primaria: corPrimaria, cor_secundaria: corSecundaria }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidatePath('/app/localdesk/cores')
  revalidatePath('/projetos-especiais/localdesk')
}
