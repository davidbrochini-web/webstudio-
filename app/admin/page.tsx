import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function AdminHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, is_super_admin')
    .eq('id', user.id)
    .single()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, nome, status')
    .is('deleted_at', null)

  return (
    <div className="min-h-screen bg-[var(--off)] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">
              Painel super-admin
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Logado como {profile?.nome ?? user.email} · {user.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="font-display font-bold text-base text-[var(--ink)] mb-4">
            Tenants ({tenants?.length ?? 0})
          </h2>
          {!tenants || tenants.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Nenhum tenant cadastrado ainda.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--border)]">
              {tenants.map(t => (
                <li key={t.id} className="py-3 flex items-center justify-between">
                  <span className="text-sm text-[var(--ink)]">{t.nome}</span>
                  <span className="text-xs text-[var(--muted)]">{t.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-[var(--muted)] mt-6">
          Etapa 1 concluída — próxima etapa adiciona criar/editar tenant aqui.
        </p>
      </div>
    </div>
  )
}
