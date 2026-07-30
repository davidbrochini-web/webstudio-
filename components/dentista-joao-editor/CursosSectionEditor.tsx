'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import { upsertCursoInline, deleteCursoInline, type CursoData } from '@/app/app/(hub)/projeto-especial/editor/actions'

interface Curso {
  id: string; titulo: string; slug: string; descricao: string; data_evento: string | null
  imagem_url: string | null; alt_text: string | null
  meta_titulo: string | null; meta_descricao: string | null; publicado: boolean
}

export default function CursosSectionEditor({ siteId, cursosIniciais, readOnly }: {
  siteId: string; cursosIniciais: Curso[]; readOnly: boolean
}) {
  const [itens, setItens] = useState(cursosIniciais)
  const [adicionando, setAdicionando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar(c: Curso, patch: Partial<CursoData>) {
    setErro(null)
    try { const row = await upsertCursoInline(siteId, c.id, patch); if (row) setItens(xs => xs.map(x => x.id === c.id ? { ...x, ...row } as Curso : x)) }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
  }

  async function adicionar() {
    setAdicionando(true)
    try {
      const row = await upsertCursoInline(siteId, null, { titulo: 'Novo evento', slug: `evento-${Date.now()}` })
      if (row) setItens(xs => [...xs, row as Curso])
    } finally { setAdicionando(false) }
  }

  return (
    <section className="px-6 py-14 max-w-5xl mx-auto">
      <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] text-center mb-2">
        Agenda de <strong>Cursos e Palestras</strong>
      </h2>
      <p className="text-center text-slate-500 text-sm mb-8">Aparece na Home e na página Cursos e Eventos</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {itens.map(c => (
          <div key={c.id} className="group relative border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
            <EditableImage
              src={c.imagem_url || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=60'}
              siteId={siteId} readOnly={readOnly} className="w-full aspect-[4/3]" alt=""
              onReplace={(url) => salvar(c, { imagem_url: url })}
            />
            <div className="p-5">
              <EditableText as="p" readOnly={readOnly} value={c.titulo} placeholder="Título do evento"
                className="font-display font-bold text-base text-[#0B2B3C] mb-1.5 block"
                onSave={v => salvar(c, { titulo: v })} />
              <EditableText as="p" readOnly={readOnly} value={c.descricao} placeholder="Descrição do evento" multiline
                className="text-sm text-slate-500 leading-relaxed block mb-2"
                onSave={v => salvar(c, { descricao: v })} />
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>📅</span>
                <input type="date" defaultValue={c.data_evento ?? ''} disabled={readOnly}
                  onChange={e => salvar(c, { data_evento: e.target.value || null })}
                  className="text-xs border-0 bg-transparent focus:outline-none disabled:opacity-60" />
              </div>
            </div>
            {!readOnly && (
              <button onClick={async () => { await deleteCursoInline(c.id); setItens(xs => xs.filter(x => x.id !== c.id)) }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">✕</button>
            )}
          </div>
        ))}

        {!readOnly && (
          <button onClick={adicionar} disabled={adicionando}
            className="aspect-[4/3] sm:aspect-auto rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#0EA5A0] text-slate-400 hover:text-[#0EA5A0] flex flex-col items-center justify-center gap-1.5 transition-colors min-h-[220px]">
            <span className="text-2xl">{adicionando ? '…' : '+'}</span>
            <span className="text-xs font-semibold">Novo evento</span>
          </button>
        )}
      </div>
      {erro && <p className="text-xs text-red-600 mt-3">{erro}</p>}
    </section>
  )
}
