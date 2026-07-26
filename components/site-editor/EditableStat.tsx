'use client'

import EditableText from '@/components/site-editor/EditableText'
import { upsertStatInline, deleteStatInline } from '@/app/app/editor/actions'

export interface Stat { id: string; valor: string; rotulo: string }

export function EditableStat({ siteId, stat, readOnly, onUpdate, onDelete, valorClassName = '', rotuloClassName = '', className = '' }: {
  siteId: string
  stat: Stat
  readOnly: boolean
  onUpdate: (s: Stat) => void
  onDelete: (id: string) => void
  valorClassName?: string
  rotuloClassName?: string
  className?: string
}) {
  return (
    <div className={`relative group ${className}`}>
      <EditableText
        as="span" readOnly={readOnly} value={stat.valor} className={valorClassName}
        onSave={async v => { const r = await upsertStatInline(siteId, stat.id, { valor: v, rotulo: stat.rotulo }); onUpdate(r as Stat) }}
      />
      <EditableText
        as="span" readOnly={readOnly} value={stat.rotulo} className={rotuloClassName}
        onSave={async v => { const r = await upsertStatInline(siteId, stat.id, { valor: stat.valor, rotulo: v }); onUpdate(r as Stat) }}
      />
      {!readOnly && (
        <button
          onClick={async () => { await deleteStatInline(stat.id); onDelete(stat.id) }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/30 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remover"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export async function addStat(siteId: string, valor: string, rotulo: string) {
  return upsertStatInline(siteId, null, { valor, rotulo })
}
