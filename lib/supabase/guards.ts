import { createClient } from '@/lib/supabase/server'

/**
 * Confirma que a sessão atual é de um super-admin autenticado.
 * Toda server action que usa createAdminClient() (service_role, bypassa RLS)
 * DEVE chamar isso primeiro — o proxy.ts só protege páginas, não actions,
 * que viram endpoints POST expostos independente da rota que os chama.
 *
 * Lança erro se não for super-admin; quem chamar deve deixar o erro
 * propagar (ou tratar como error state, dependendo do formato de retorno).
 */
export async function requireSuperAdmin(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Não autenticado.')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) {
    throw new Error('Acesso negado.')
  }
}

/**
 * Mais estrito que requireSuperAdmin(): exige nivel_acesso='super_admin'
 * especificamente (não basta is_super_admin=true — isso cobre também
 * quem tem nivel_acesso='admin_nivel_1' mas vê tudo). Usar em ações
 * administrativas sensíveis onde nem todo super-admin de dados deve
 * poder mexer — hoje: gerenciar a própria equipe (criar/editar login).
 */
export async function requireNivelSuperAdmin(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Não autenticado.')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('nivel_acesso')
    .eq('id', user.id)
    .single()

  if (profile?.nivel_acesso !== 'super_admin') {
    throw new Error('Só um administrador de nível super pode fazer isso.')
  }
}
