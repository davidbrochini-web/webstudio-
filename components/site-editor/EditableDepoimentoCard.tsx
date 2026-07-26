'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import { upsertDepoimentoInline, deleteDepoimentoInline } from '@/app/app/editor/actions'

export interface Depoimento { id: string; nome: string; texto: string }

export function EditableDepoimentoCard({ siteId, depoimento, readOnly, onUpdate, onDelete, className = '', textClassName = '', nameClassName = '' }: {
  siteId: string
  depoimento: Depoimento
  readOnly: boolean
  onUpdate: (d: Depoimento) => void
  onDelete: (id: string) => void
  className?: string
  textClassName?: string
  nameClassName?: string
}) {
  const [erro, setErro] = useState<string | null>(null)

  return (
    <div className={`group relative ${className}`}>
      <EditableText
        as="p" readOnly={readOnly} value={depoimento.texto} multiline className={textClassName}
        onSave={async v => {
          try { const r = await upsertDepoimentoInline(siteId, depoimento.id, { nome: depoimento.nome, texto: v }); onUpdate(r as Depoimento) }
          catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
        }}
      />
      <EditableText
        as="p" readOnly={readOnly} value={depoimento.nome} className={nameClassName}
        onSave={async v => {
          try { const r = await upsertDepoimentoInline(siteId, depoimento.id, { nome: v, texto: depoimento.texto }); onUpdate(r as Depoimento) }
          catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
        }}
      />
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      {!readOnly && (
        <button
          onClick={async () => { try { await deleteDepoimentoInline(depoimento.id); onDelete(depoimento.id) } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao remover') } }}
          className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-white bg-red-500/80 rounded-full w-5 h-5 flex items-center justify-center transition-opacity"
          title="Remover"
        >
          ✕
        </button>
      )}
    </div>
  )
}
