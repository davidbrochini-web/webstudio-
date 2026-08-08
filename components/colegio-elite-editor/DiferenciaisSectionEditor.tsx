'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import VisibilidadeSecaoToggle from './VisibilidadeSecaoToggle'
import { upsertDiferencialInline, deleteDiferencialInline, type DiferencialData } from '@/app/app/(hub)/colegio-elite/actions'

export interface Diferencial { id: string; icone: string | null; titulo: string; texto: string }

function Card({ siteId, d, readOnly, onUpdate, onDelete }: {
  siteId: string; d: Diferencial; readOnly: boolean
  onUpdate: (d: Diferencial) => void; onDelete: (id: string) => void
}) {
  const [confirmar, setConfirmar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar(patch: Partial<DiferencialData>) {
    setErro(null)
    try { const row = await upsertDiferencialInline(siteId, d.id, patch); if (row) onUpdate({ ...d, ...row } as Diferencial) }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
  }

  return (
    <div className="relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      {!readOnly && (
        confirmar ? (
          <button onClick={() => onDelete(d.id)} className="absolute top-2 right-2 text-[10px] font-bold bg-red-500 text-white px-2 py-1 rounded-full">Confirmar?</button>
        ) : (
          <button onClick={() => setConfirmar(true)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 text-xs flex items-center justify-center">✕</button>
        )
      )}
      <EditableText as="span" readOnly={readOnly} value={d.icone ?? ''} placeholder="🏫"
        className="text-3xl block mb-2" onSave={v => salvar({ icone: v })} />
      <EditableText as="p" readOnly={readOnly} value={d.titulo} placeholder="Título do diferencial"
        className="font-display font-bold text-[var(--ce-secondary)] block mb-1" onSave={v => salvar({ titulo: v })} />
      <EditableText as="p" readOnly={readOnly} value={d.texto} placeholder="Descrição curta" multiline
        className="text-sm text-slate-500 leading-relaxed block" onSave={v => salvar({ texto: v })} />
      {erro && <p className="text-[10px] text-red-500 mt-1">{erro}</p>}
    </div>
  )
}

export default function DiferenciaisSectionEditor({ siteId, diferenciaisIniciais, readOnly, visivel }: {
  siteId: string; diferenciaisIniciais: Diferencial[]; readOnly: boolean; visivel: boolean
}) {
  const [itens, setItens] = useState(diferenciaisIniciais)
  const [adicionando, setAdicionando] = useState(false)

  async function adicionar() {
    setAdicionando(true)
    try {
      const row = await upsertDiferencialInline(siteId, null, { icone: '⭐', titulo: 'Novo diferencial', texto: 'Descreva aqui...' })
      if (row) setItens(xs => [...xs, row as Diferencial])
    } finally { setAdicionando(false) }
  }

  return (
    <section className="px-6 py-14">
      <div className="max-w-5xl mx-auto">
        <VisibilidadeSecaoToggle siteId={siteId} campo="secao_diferenciais_visivel" visivel={visivel} readOnly={readOnly} />
        <p className="text-sm text-slate-400 mb-6">Aparece na Home e na página Estrutura</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {itens.map(d => (
            <Card key={d.id} siteId={siteId} d={d} readOnly={readOnly}
              onUpdate={upd => setItens(xs => xs.map(x => x.id === upd.id ? upd : x))}
              onDelete={async id => { await deleteDiferencialInline(id); setItens(xs => xs.filter(x => x.id !== id)) }}
            />
          ))}

          {!readOnly && (
            <button onClick={adicionar} disabled={adicionando}
              className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-[var(--ce-primary)] text-slate-400 hover:text-[var(--ce-primary)] flex flex-col items-center justify-center gap-1.5 py-8 transition-colors">
              <span className="text-2xl">{adicionando ? '…' : '+'}</span>
              <span className="text-xs font-semibold">Novo diferencial</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
