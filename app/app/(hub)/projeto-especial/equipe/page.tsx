import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import ProjetoEspecialSubNav from '@/components/app/ProjetoEspecialSubNav'
import ConteudoManager, { type FieldConfig } from '@/components/app/ConteudoManager'
import { upsertEquipe, deleteEquipe } from '@/app/app/(hub)/projeto-especial/actions'

const FIELDS: FieldConfig[] = [
  { name: 'nome', label: 'Nome', required: true },
  { name: 'especialidade', label: 'Especialidade' },
  { name: 'formacao', label: 'Formação' },
  { name: 'foto_url', label: 'URL da foto' },
  { name: 'alt_text', label: 'Texto alternativo da foto' },
  { name: 'ordem', label: 'Ordem de exibição (0, 1, 2...)' },
]

const COLUMNS = [
  { key: 'nome', label: 'Nome' },
  { key: 'especialidade', label: 'Especialidade' },
  { key: 'formacao', label: 'Formação' },
]

export default async function EquipeAdminPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return <p className="text-sm text-[var(--muted)]">Site não encontrado pra esse tenant.</p>

  const supabase = await createClient()
  const { data: itens } = await supabase
    .from('site_equipe')
    .select('id, nome, especialidade, formacao, foto_url, alt_text, ordem')
    .eq('site_id', info.siteId)
    .is('deleted_at', null)
    .order('ordem')

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">Site</h1>
      <ProjetoEspecialSubNav />
      <ConteudoManager
        siteId={info.siteId}
        itens={itens ?? []}
        fields={FIELDS}
        columns={COLUMNS}
        upsertAction={upsertEquipe}
        deleteAction={deleteEquipe}
        addLabel="Adicionar membro da equipe"
        emptyLabel="Nenhum membro cadastrado ainda."
        readOnly={!podeEditar}
      />
    </div>
  )
}
