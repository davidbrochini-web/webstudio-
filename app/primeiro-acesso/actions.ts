'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PrimeiroAcessoState {
  error?: string
  success?: boolean
}

/**
 * Troca a senha da pessoa logada + salva a foto de perfil (se ela
 * subiu uma, é opcional) + limpa must_change_password. Tudo em uma
 * ação só pra garantir que a pessoa não fica numa senha provisória
 * sem querer se a etapa falhar no meio.
 */
export async function concluirPrimeiroAcesso(
  _prev: PrimeiroAcessoState,
  formData: FormData
): Promise<PrimeiroAcessoState> {
  const novaSenha = formData.get('nova_senha') as string
  const confirmarSenha = formData.get('confirmar_senha') as string
  const fotoUrl = (formData.get('foto_url') as string) || null

  if (!novaSenha || novaSenha.length < 8) {
    return { error: 'A nova senha precisa ter no mínimo 8 caracteres.' }
  }
  if (novaSenha !== confirmarSenha) {
    return { error: 'As senhas não coincidem.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  const { error: senhaError } = await supabase.auth.updateUser({ password: novaSenha })
  if (senhaError) {
    return { error: `Erro ao trocar senha: ${senhaError.message}` }
  }

  const { error: perfilError } = await supabase
    .from('profiles')
    .update({
      must_change_password: false,
      ...(fotoUrl ? { foto_perfil_url: fotoUrl } : {}),
    })
    .eq('id', user.id)

  if (perfilError) {
    return { error: `Senha trocada, mas houve um erro ao salvar o perfil: ${perfilError.message}` }
  }

  revalidatePath('/admin')
  revalidatePath('/app')
  return { success: true }
}
