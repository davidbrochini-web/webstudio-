import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import ProjetoEspecialSubNav from '@/components/app/ProjetoEspecialSubNav'
import ConteudoManager, { type FieldConfig } from '@/components/app/ConteudoManager'
import { upsertFaqItem, deleteFaqItem } from '@/app/app/(hub)/projeto-especial/actions'

const FIELDS: FieldConfig[] = [
  { name: 'pergunta', label: 'Pergunta', required: true },
  { name: 'resposta', label: 'Resposta', type: 'textarea', required: true },
  { name: 'categoria', label: 'Categoria/tema (opcional, ex: Tratamentos, Convênios)' },
  { name: 'ordem', label: 'Ordem de exibição' },
]

const COLUMNS = [
  { key: 'pergunta', label: 'Pergunta' },
  { key: 'categoria', label: 'Categoria' },
]

export default async function FaqAdminPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return <p className="text-sm text-[var(--muted)]">Site não encontrado pra esse tenant.</p>

  const supabase = await createClient()
  const { data: itens } = await supabase
    .from('site_faq')
    .select('id, pergunta, resposta, categoria, ordem')
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
        upsertAction={upsertFaqItem}
        deleteAction={deleteFaqItem}
        addLabel="Adicionar pergunta"
        emptyLabel="Nenhuma pergunta cadastrada ainda."
        readOnly={!podeEditar}
      />
    </div>
  )
}
