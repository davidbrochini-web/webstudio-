'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin, requireNivelSuperAdmin } from '@/lib/supabase/guards'
import { revalidatePath } from 'next/cache'

export interface MembroEquipe {
  id: string
  email: string
  nome: string
  nivel_acesso: 'super_admin' | 'admin_nivel_1'
  must_change_password: boolean
  created_at: string
}

export interface EquipeFormState {
  error?: string
  success?: boolean
}

/** Lista só contas internas (is_super_admin=true) — não mistura com login de cliente/tenant. */
export async function listarEquipe(): Promise<MembroEquipe[]> {
  await requireSuperAdmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('id, nome, nivel_acesso, must_change_password, created_at')
    .eq('is_super_admin', true)
    .order('created_at')

  if (!data) return []

  // E-mail vive em auth.users, não em profiles — busca via admin API.
  const admin = createAdminClient()
  const membros: MembroEquipe[] = []
  for (const p of data) {
    const { data: userData } = await admin.auth.admin.getUserById(p.id)
    membros.push({
      id: p.id,
      email: userData.user?.email ?? '(sem e-mail)',
      nome: p.nome,
      nivel_acesso: p.nivel_acesso,
      must_change_password: p.must_change_password,
      created_at: p.created_at,
    })
  }
  return membros
}

export async function criarMembroEquipe(input: {
  nome: string
  email: string
  senhaInicial: string
  nivel_acesso: 'super_admin' | 'admin_nivel_1'
}): Promise<EquipeFormState> {
  await requireNivelSuperAdmin()

  if (!input.email.includes('@')) return { error: 'E-mail inválido.' }
  if (input.senhaInicial.length < 6) return { error: 'Senha inicial precisa de pelo menos 6 caracteres.' }

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.senhaInicial,
    email_confirm: true,
  })

  if (error || !data.user) {
    if (error?.message?.includes('already been registered')) {
      return { error: 'Já existe uma conta com esse e-mail.' }
    }
    return { error: error?.message ?? 'Erro ao criar usuário.' }
  }

  const supabase = await createClient()
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    nome: input.nome,
    is_super_admin: true, // continua "vendo tudo" — o que muda é nivel_acesso
    nivel_acesso: input.nivel_acesso,
    must_change_password: true,
  })

  if (profileError) {
    // limpa o usuário órfão no Auth se o profile falhar
    await admin.auth.admin.deleteUser(data.user.id)
    return { error: profileError.message }
  }

  revalidatePath('/admin/equipe')
  return { success: true }
}

export async function atualizarNivelAcesso(
  id: string,
  nivel_acesso: 'super_admin' | 'admin_nivel_1'
): Promise<EquipeFormState> {
  await requireNivelSuperAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ nivel_acesso })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/equipe')
  return { success: true }
}

export async function removerMembroEquipe(id: string): Promise<EquipeFormState> {
  await requireNivelSuperAdmin()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === id) return { error: 'Você não pode remover a própria conta.' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }

  revalidatePath('/admin/equipe')
  return { success: true }
}
