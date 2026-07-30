import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import EditorShell from '@/components/app/EditorShell'
import EditorSecao, { type CampoConfig } from '@/components/app/EditorSecao'
import { upsertEquipe, deleteEquipe } from '@/app/app/(hub)/projeto-especial/actions'

const CAMPOS: CampoConfig[] = [
  { name: 'nome', label: 'Nome completo', required: true, span: 'full', placeholder: 'Dr. João da Silva' },
  { name: 'cargo', label: 'Cargo / especialidade', span: 'half', placeholder: 'Ortodontista' },
  { name: 'ordem', label: 'Ordem de exibição', span: 'half', placeholder: '0, 1, 2...' },
  { name: 'foto_url', label: 'URL da foto', type: 'url', span: 'full', placeholder: 'https://...', dica: 'Foto de perfil do profissional' },
  { name: 'bio', label: 'Biografia', type: 'textarea', span: 'full', placeholder: 'Formação, experiência e especialidades do profissional' },
]

export default async function EditorEquipePage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null
  const supabase = await createClient()
  const { data: itens } = await supabase
    .from('site_equipe')
    .select('id, nome, cargo, foto_url, bio, ordem')
    .eq('site_id', info.siteId).is('deleted_at', null).order('ordem')

  return (
    <EditorShell icon="👨‍⚕️" label="Equipe" cor="#1e6b8a"
      desc="Profissionais que aparecem na página Equipe."
      onde="Página Equipe">
      <EditorSecao
        siteId={info.siteId} itens={itens ?? []} campos={CAMPOS}
        colunas={[{ key: 'nome', label: 'Nome' }, { key: 'cargo', label: 'Cargo' }]}
        upsertAction={upsertEquipe} deleteAction={deleteEquipe}
        addLabel="Novo profissional" emptyLabel="Nenhum profissional cadastrado ainda."
        imagemKey="foto_url" nomeKey="nome"
      />
    </EditorShell>
  )
}
