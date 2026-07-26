'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import { upsertServicoInline, deleteServicoInline } from '@/app/app/editor/actions'

export interface Servico { id: string; icon: string; title: string; description: string; preco?: string | null }

export function EditableServicoRow({ siteId, servico, readOnly, onUpdate, onDelete, showIcon = true, showPrice = false, className = '', iconClassName = '', titleClassName = '', descClassName = '', priceClassName = '' }: {
  siteId: string
  servico: Servico
  readOnly: boolean
  onUpdate: (s: Servico) => void
  onDelete: (id: string) => void
  showIcon?: boolean
  showPrice?: boolean
  className?: string
  iconClassName?: string
  titleClassName?: string
  descClassName?: string
  priceClassName?: string
}) {
  const [erro, setErro] = useState<string | null>(null)

  async function save(patch: Partial<Servico>) {
    const data = { icon: servico.icon, title: servico.title, description: servico.description, preco: servico.preco ?? null, ...patch }
    try {
      const r = await upsertServicoInline(siteId, servico.id, data)
      onUpdate(r as Servico)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
    }
  }

  return (
    <div className={`group relative ${className}`}>
      <div className="flex items-center gap-3">
        {showIcon && (
          <EditableText as="span" readOnly={readOnly} value={servico.icon} className={iconClassName} onSave={v => save({ icon: v })} />
        )}
        <div className="flex-1 min-w-0">
          <EditableText as="span" readOnly={readOnly} value={servico.title} className={titleClassName} onSave={v => save({ title: v })} />
          <EditableText as="span" readOnly={readOnly} value={servico.description} className={descClassName} onSave={v => save({ description: v })} multiline />
        </div>
        {showPrice && (
          <EditableText as="span" readOnly={readOnly} value={servico.preco ?? ''} placeholder="R$ 0" className={priceClassName} onSave={v => save({ preco: v })} />
        )}
      </div>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      {!readOnly && (
        <button
          onClick={async () => { try { await deleteServicoInline(servico.id); onDelete(servico.id) } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao remover') } }}
          className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-white bg-red-500/80 rounded-full w-5 h-5 flex items-center justify-center transition-opacity"
          title="Remover"
        >
          ✕
        </button>
      )}
    </div>
  )
}
