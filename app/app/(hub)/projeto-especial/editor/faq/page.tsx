import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import EditorShell from '@/components/app/EditorShell'
import EditorSecao, { type CampoConfig } from '@/components/app/EditorSecao'
import { upsertFaqItem as upsertFaq, deleteFaqItem as deleteFaq } from '@/app/app/(hub)/projeto-especial/actions'

const CAMPOS: CampoConfig[] = [
  { name: 'pergunta', label: 'Pergunta', required: true, span: 'full', placeholder: 'Ex: Quanto tempo dura o clareamento?' },
  { name: 'resposta', label: 'Resposta', type: 'textarea', required: true, span: 'full', placeholder: 'Resposta clara e objetiva para o paciente' },
  { name: 'categoria', label: 'Categoria (opcional)', span: 'half', placeholder: 'Ex: Clareamento, Ortodontia...' },
  { name: 'ordem', label: 'Ordem de exibição', span: 'half' },
]

export default async function EditorFaqPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null
  const supabase = await createClient()
  const { data: itens } = await supabase
    .from('site_faq')
    .select('id, pergunta, resposta, categoria, ordem')
    .eq('site_id', info.siteId).is('deleted_at', null).order('ordem')

  return (
    <EditorShell icon="💬" label="Dúvidas Frequentes" cor="#0EA5A0"
      desc="Perguntas e respostas que aparecem no acordeão de FAQ."
      onde="Home → FAQ  ·  Página Dúvidas Frequentes">
      <EditorSecao
        siteId={info.siteId} itens={itens ?? []} campos={CAMPOS}
        colunas={[{ key: 'pergunta', label: 'Pergunta' }, { key: 'categoria', label: 'Categoria' }]}
        upsertAction={upsertFaq} deleteAction={deleteFaq}
        addLabel="Nova pergunta" emptyLabel="Nenhuma pergunta cadastrada ainda."
        nomeKey="pergunta"
      />
    </EditorShell>
  )
}
