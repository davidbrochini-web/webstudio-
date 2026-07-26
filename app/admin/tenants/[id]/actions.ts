'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/supabase/guards'
import { revalidatePath } from 'next/cache'

export interface UserFormState {
  error?: string
  success?: boolean
}

const PAPEIS_VALIDOS = ['owner', 'admin', 'operador']

/**
 * Cria o usuário do cliente: conta de autenticação (via service_role,
 * porque criar conta de outra pessoa exige privilégio admin) + profile
 * + membership vinculando ao tenant.
 *
 * IMPORTANTE: usa createAdminClient() (service_role), que bypassa todo
 * o RLS. Diferente das outras actions deste arquivo — que usam o client
 * normal e por isso já são protegidas pelas policies de RLS — esta
 * precisa checar explicitamente que quem chamou é super-admin, porque
 * o proxy.ts só protege a página /admin, não o endpoint da action em si.
 */
export async function createTenantUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  try {
    await requireSuperAdmin()
  } catch {
    return { error: 'Acesso negado.' }
  }

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
  if (!PAPEIS_VALIDOS.includes(papel)) {
    return { error: 'Papel inválido.' }
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

  // A partir daqui, qualquer falha precisa desfazer o auth user criado —
  // senão fica órfão no Auth e bloqueia o e-mail pra sempre (retry falha
  // com "email já existe" mesmo sem profile/membership nenhum).
  const { error: profileError } = await admin.from('profiles').insert({ id: userId, nome })
  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    return { error: `Erro ao salvar perfil: ${profileError.message}` }
  }

  const { error: membershipError } = await admin
    .from('memberships')
    .insert({ tenant_id: tenantId, user_id: userId, papel })

  if (membershipError) {
    await admin.auth.admin.deleteUser(userId)
    return { error: `Erro ao vincular ao tenant: ${membershipError.message}` }
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
