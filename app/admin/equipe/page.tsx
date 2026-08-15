import { createClient } from '@/lib/supabase/server'
import { listarEquipe } from '@/app/admin/equipe/actions'
import EquipeManager from '@/components/admin/EquipeManager'

export const dynamic = 'force-dynamic'

export default async function EquipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: meuPerfil } = await supabase
    .from('profiles')
    .select('nivel_acesso')
    .eq('id', user!.id)
    .single()

  const membros = await listarEquipe()

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Equipe</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Quem tem acesso ao painel administrativo e em que nível.
      </p>
      <EquipeManager
        membros={membros}
        meuId={user!.id}
        souSuperAdmin={meuPerfil?.nivel_acesso === 'super_admin'}
      />
    </div>
  )
}
