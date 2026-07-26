'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface UserFormState {
  error?: string
  success?: boolean
}

/**
 * Cria o usuário do cliente: conta de autenticação (via service_role,
 * porque criar conta de outra pessoa exige privilégio admin) + profile
 * + membership vinculando ao tenant.
 */
export async function createTenantUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const tenantId = formData.get('tenant_id') as string
  const nome = (formData.get('nome') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const senha = formData.get('senha') as string
  const papel = formData.get('papel') as string

  if (!tenantId || !nome || !email || !senha) {
    return { error: 'Preencha todos os campos.' }
  }
  if (senha.length < 8) {
    return { error: 'A senha precisa ter no mínimo 8 caracteres.' }
  }

  const admin = createAdminClient()

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (authError || !authUser.user) {
    return { error: `Erro ao criar login: ${authError?.message ?? 'desconhecido'}` }
  }

  const userId = authUser.user.id

  const { error: profileError } = await admin.from('profiles').insert({ id: userId, nome })
  if (profileError) {
    return { error: `Login criado, mas erro ao salvar perfil: ${profileError.message}` }
  }

  const { error: membershipError } = await admin
    .from('memberships')
    .insert({ tenant_id: tenantId, user_id: userId, papel })

  if (membershipError) {
    return { error: `Login e perfil criados, mas erro ao vincular ao tenant: ${membershipError.message}` }
  }

  revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true }
}

export async function updateMembershipRole(membershipId: string, papel: string, tenantId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('memberships')
    .update({ papel })
    .eq('id', membershipId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/tenants/${tenantId}`)
}

/**
 * Ativa/desativa um módulo pro tenant. Se a assinatura já existe,
 * atualiza o status; se não existe, cria.
 */
export async function toggleModule(tenantId: string, modulo: string, ativar: boolean) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('modulo', modulo)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: ativar ? 'ativo' : 'pausado' })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('subscriptions')
      .insert({ tenant_id: tenantId, modulo, status: ativar ? 'ativo' : 'pausado' })
    if (error) throw new Error(error.message)
  }

  revalidatePath(`/admin/tenants/${tenantId}`)
}
