'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TenantFormState {
  error?: string
  success?: boolean
}

export async function createTenant(
  _prev: TenantFormState,
  formData: FormData
): Promise<TenantFormState> {
  const nome = (formData.get('nome') as string)?.trim()
  const cnpj = (formData.get('cnpj') as string)?.trim() || null
  const plano = (formData.get('plano') as string)?.trim() || 'trial'

  if (!nome) return { error: 'Nome é obrigatório.' }

  const supabase = await createClient()
  const { error } = await supabase.from('tenants').insert({ nome, cnpj, plano })

  if (error) return { error: `Erro ao criar: ${error.message}` }

  revalidatePath('/admin/tenants')
  return { success: true }
}

export async function updateTenant(
  _prev: TenantFormState,
  formData: FormData
): Promise<TenantFormState> {
  const id = formData.get('id') as string
  const nome = (formData.get('nome') as string)?.trim()
  const cnpj = (formData.get('cnpj') as string)?.trim() || null
  const plano = (formData.get('plano') as string)?.trim() || 'trial'

  if (!id || !nome) return { error: 'Dados incompletos.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('tenants')
    .update({ nome, cnpj, plano })
    .eq('id', id)

  if (error) return { error: `Erro ao editar: ${error.message}` }

  revalidatePath('/admin/tenants')
  return { success: true }
}

export async function setTenantStatus(id: string, status: 'ativo' | 'suspenso' | 'cancelado') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tenants')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/tenants')
}
