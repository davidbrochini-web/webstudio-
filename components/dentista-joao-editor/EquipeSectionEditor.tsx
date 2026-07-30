'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import { upsertEquipeInline, deleteEquipeInline, type EquipeData } from '@/app/app/(hub)/projeto-especial/editor/actions'

interface Membro {
  id: string; nome: string; foto_url: string | null; alt_text: string | null
  formacao: string | null; especialidade: string | null; bio: string | null
}

export default function EquipeSectionEditor({ siteId, equipeInicial, readOnly }: {
  siteId: string; equipeInicial: Membro[]; readOnly: boolean
}) {
  const [itens, setItens] = useState(equipeInicial)
  const [adicionando, setAdicionando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar(m: Membro, patch: Partial<EquipeData>) {
    setErro(null)
    try { const row = await upsertEquipeInline(siteId, m.id, patch); if (row) setItens(xs => xs.map(x => x.id === m.id ? { ...x, ...row } as Membro : x)) }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
  }

  async function adicionar() {
    setAdicionando(true)
    try {
      const row = await upsertEquipeInline(siteId, null, { nome: 'Novo profissional' })
      if (row) setItens(xs => [...xs, row as Membro])
    } finally { setAdicionando(false) }
  }

  return (
    <section className="px-6 py-16 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-wide text-[#0EA5A0] mb-1 text-center">Página Equipe</p>
        <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] text-center mb-8">Equipe</h2>

        <div className="flex flex-col gap-10">
          {itens.map(m => (
            <div key={m.id} className="group relative grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-start pb-8 border-b border-slate-100 last:border-0">
              <EditableImage
                src={m.foto_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=60'}
                siteId={siteId} readOnly={readOnly}
                className="w-40 h-40 rounded-full mx-auto sm:mx-0 overflow-hidden"
                alt={m.nome}
                onReplace={(url) => salvar(m, { foto_url: url })}
              />
              <div className="text-center sm:text-left">
                <EditableText as="p" readOnly={readOnly} value={m.nome} placeholder="Nome completo"
                  className="font-display font-bold text-xl text-[#0B2B3C] block"
                  onSave={v => salvar(m, { nome: v })} />
                <EditableText as="p" readOnly={readOnly} value={m.especialidade ?? ''} placeholder="Especialidade"
                  className="text-sm text-[#0EA5A0] font-semibold mt-0.5 block"
                  onSave={v => salvar(m, { especialidade: v })} />
                <EditableText as="p" readOnly={readOnly} value={m.formacao ?? ''} placeholder="Formação"
                  className="text-sm text-slate-500 mt-1 block"
                  onSave={v => salvar(m, { formacao: v })} />
                <EditableText as="p" readOnly={readOnly} value={m.bio ?? ''} placeholder="Biografia — trajetória e credenciais" multiline
                  className="text-sm text-slate-600 leading-relaxed mt-3 block"
                  onSave={v => salvar(m, { bio: v })} />
              </div>
              {!readOnly && (
                <button onClick={async () => { await deleteEquipeInline(m.id); setItens(xs => xs.filter(x => x.id !== m.id)) }}
                  className="absolute top-0 right-0 w-7 h-7 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 text-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">✕</button>
              )}
            </div>
          ))}
        </div>

        {!readOnly && (
          <button onClick={adicionar} disabled={adicionando}
            className="mt-6 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0EA5A0] text-slate-400 hover:text-[#0EA5A0] text-sm font-semibold transition-colors">
            {adicionando ? 'Adicionando…' : '+ Novo profissional'}
          </button>
        )}
        {erro && <p className="text-xs text-red-600 mt-3">{erro}</p>}
      </div>
    </section>
  )
}
