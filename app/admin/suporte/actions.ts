'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/supabase/guards'
import { revalidatePath } from 'next/cache'

const STATUS_VALIDOS = ['aberto', 'em_andamento', 'resolvido']

export async function updateSuporteStatus(id: string, status: string) {
  await requireSuperAdmin()
  if (!STATUS_VALIDOS.includes(status)) throw new Error('Status inválido.')

  const supabase = await createClient()
  const { error } = await supabase.from('suporte_tickets').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/suporte')
}
