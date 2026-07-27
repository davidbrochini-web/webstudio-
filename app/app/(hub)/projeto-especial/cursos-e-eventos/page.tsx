import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import ProjetoEspecialSubNav from '@/components/app/ProjetoEspecialSubNav'
import ConteudoManager, { type FieldConfig } from '@/components/app/ConteudoManager'
import { upsertCursoEvento, deleteCursoEvento } from '@/app/app/(hub)/projeto-especial/actions'

const FIELDS: FieldConfig[] = [
  { name: 'titulo', label: 'Título', required: true },
  { name: 'slug', label: 'Slug (URL)', required: true },
  { name: 'data_evento', label: 'Data', type: 'date' },
  { name: 'descricao', label: 'Descrição', type: 'textarea', required: true },
  { name: 'imagem_url', label: 'URL da imagem' },
  { name: 'alt_text', label: 'Texto alternativo da imagem' },
  { name: 'meta_titulo', label: 'Meta título (SEO, opcional)' },
  { name: 'meta_descricao', label: 'Meta descrição (SEO, opcional)', type: 'textarea' },
  { name: 'ordem', label: 'Ordem de exibição' },
  { name: 'publicado', label: 'Publicado', type: 'checkbox' },
]

const COLUMNS = [
  { key: 'titulo', label: 'Título' },
  { key: 'data_evento', label: 'Data' },
  { key: 'publicado', label: 'Publicado' },
]

export default async function CursosEventosAdminPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return <p className="text-sm text-[var(--muted)]">Site não encontrado pra esse tenant.</p>

  const supabase = await createClient()
  const { data: itens } = await supabase
    .from('site_cursos_eventos')
    .select('id, titulo, slug, data_evento, descricao, imagem_url, alt_text, meta_titulo, meta_descricao, ordem, publicado')
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
        upsertAction={upsertCursoEvento}
        deleteAction={deleteCursoEvento}
        addLabel="Adicionar curso ou evento"
        emptyLabel="Nenhum curso/evento cadastrado ainda."
        readOnly={!podeEditar}
      />
    </div>
  )
}
