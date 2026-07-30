import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import EditorShell from '@/components/app/EditorShell'
import EditorSecao, { type CampoConfig } from '@/components/app/EditorSecao'
import { upsertTratamento, deleteTratamento } from '@/app/app/(hub)/projeto-especial/actions'

const CAMPOS: CampoConfig[] = [
  { name: 'titulo', label: 'Nome do tratamento', required: true, span: 'full', placeholder: 'Ex: Clareamento Dental' },
  { name: 'slug', label: 'Slug (URL)', required: true, span: 'half', placeholder: 'clareamento-dental', dica: 'Só letras minúsculas, sem espaço' },
  { name: 'ordem', label: 'Ordem de exibição', span: 'half', placeholder: '0, 1, 2...' },
  { name: 'descricao_curta', label: 'Texto do card (home)', type: 'textarea', required: true, span: 'full', placeholder: 'Aparece no card da home e na listagem' },
  { name: 'imagem_url', label: 'URL da imagem do card', type: 'url', span: 'full', placeholder: 'https://...', dica: 'Cole o link da foto que aparece no card' },
  { name: 'descricao_completa', label: 'Conteúdo da página de detalhe', type: 'textarea', span: 'full', grupo: 'Página de detalhe', placeholder: 'Texto completo que aparece quando o paciente clica no tratamento' },
  { name: 'meta_titulo', label: 'Título para o Google (SEO)', span: 'full', grupo: 'SEO (opcional)', placeholder: 'Ex: Clareamento Dental em [cidade] — Clínica ...' },
  { name: 'meta_descricao', label: 'Descrição para o Google (SEO)', type: 'textarea', span: 'full', placeholder: 'Até 160 caracteres' },
  { name: 'alt_text', label: 'Descrição da imagem (acessibilidade)', span: 'full', placeholder: 'Ex: Paciente sorrindo após tratamento de clareamento' },
  { name: 'publicado', label: 'Publicar no site', type: 'checkbox', span: 'full' },
]

export default async function EditorTratamentosPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null
  const supabase = await createClient()
  const { data: itens } = await supabase
    .from('site_tratamentos')
    .select('id, titulo, slug, descricao_curta, descricao_completa, imagem_url, alt_text, meta_titulo, meta_descricao, ordem, publicado')
    .eq('site_id', info.siteId).is('deleted_at', null).order('ordem')

  return (
    <EditorShell icon="🦷" label="Tratamentos" cor="#0EA5A0"
      desc="Cada tratamento vira um card na home e uma página própria no site."
      onde="Home → Áreas de Atuação  ·  Página Tratamentos">
      <EditorSecao
        siteId={info.siteId} itens={itens ?? []} campos={CAMPOS}
        colunas={[{ key: 'titulo', label: 'Título' }, { key: 'publicado', label: 'Status' }]}
        upsertAction={upsertTratamento} deleteAction={deleteTratamento}
        addLabel="Novo tratamento" emptyLabel="Nenhum tratamento ainda."
        imagemKey="imagem_url"
      />
    </EditorShell>
  )
}
