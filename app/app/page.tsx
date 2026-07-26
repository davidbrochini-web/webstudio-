import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function AppHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('papel, tenants(id, nome)')
    .eq('user_id', user.id)
    .single()

  const tenant = membership?.tenants as unknown as { id: string; nome: string } | null

  return (
    <div className="min-h-screen bg-[var(--off)] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">
              {tenant?.nome ?? 'Sem empresa vinculada'}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {user.email} · papel: {membership?.papel ?? 'nenhum'}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
          {!tenant ? (
            <p className="text-sm text-[var(--muted)]">
              Sua conta ainda não está vinculada a nenhuma empresa. Fale com a omnidesign.
            </p>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Bem-vindo! Os módulos de cadastro (clientes, fornecedores, funcionários,
              produtos/serviços) chegam na próxima etapa aqui.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
