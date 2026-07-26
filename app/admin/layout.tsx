import { createClient } from '@/lib/supabase/server'
import AdminTopNav from '@/components/admin/AdminTopNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth/permissão de super-admin já são resolvidas centralmente pelo
  // proxy.ts (equivalente ao middleware) antes de chegar aqui — esse
  // fetch é só pra exibir o e-mail no menu do usuário, não é o guard.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[var(--off)]">
      <AdminTopNav email={user?.email ?? ''} />
      <main className="px-6 py-10">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
