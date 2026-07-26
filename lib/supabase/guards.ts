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
