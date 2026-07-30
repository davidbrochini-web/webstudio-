import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import EditorShell from '@/components/app/EditorShell'
import EditorSecao, { type CampoConfig } from '@/components/app/EditorSecao'
import { upsertCursoEvento as upsertCurso, deleteCursoEvento as deleteCurso } from '@/app/app/(hub)/projeto-especial/actions'

const CAMPOS: CampoConfig[] = [
  { name: 'titulo', label: 'Título do evento', required: true, span: 'full' },
  { name: 'slug', label: 'Slug (URL)', required: true, span: 'half', placeholder: 'nome-do-evento' },
  { name: 'ordem', label: 'Ordem', span: 'half' },
  { name: 'descricao', label: 'Descrição', type: 'textarea', span: 'full', placeholder: 'Sobre o curso ou palestra' },
  { name: 'data_evento', label: 'Data do evento', type: 'date', span: 'half' },
  { name: 'local', label: 'Local', span: 'half', placeholder: 'Nome do local ou "Online"' },
  { name: 'imagem_url', label: 'URL da imagem', type: 'url', span: 'full', dica: 'Foto de capa do evento' },
  { name: 'link_inscricao', label: 'Link de inscrição', type: 'url', span: 'full', placeholder: 'https://...' },
  { name: 'publicado', label: 'Publicar no site', type: 'checkbox', span: 'full' },
]

export default async function EditorCursosPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null
  const supabase = await createClient()
  const { data: itens } = await supabase
    .from('site_cursos_eventos')
    .select('id, titulo, slug, descricao, data_evento, local, imagem_url, link_inscricao, ordem, publicado')
    .eq('site_id', info.siteId).is('deleted_at', null).order('data_evento', { ascending: false })

  return (
    <EditorShell icon="🎓" label="Cursos e Eventos" cor="#0B2B3C"
      desc="Palestras e cursos que aparecem na agenda da home e na página de Cursos."
      onde="Home → Agenda de Cursos  ·  Página Cursos e Eventos">
      <EditorSecao
        siteId={info.siteId} itens={itens ?? []} campos={CAMPOS}
        colunas={[{ key: 'titulo', label: 'Título' }, { key: 'data_evento', label: 'Data' }]}
        upsertAction={upsertCurso} deleteAction={deleteCurso}
        addLabel="Novo evento" emptyLabel="Nenhum evento cadastrado ainda."
        imagemKey="imagem_url"
      />
    </EditorShell>
  )
}
