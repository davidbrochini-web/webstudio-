'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import { upsertTratamentoInline, deleteTratamentoInline, type TratamentoData } from '@/app/app/(hub)/projeto-especial/editor/actions'

export interface Tratamento {
  id: string; titulo: string; slug: string; descricao_curta: string; descricao_completa: string
  imagem_url: string | null; alt_text: string | null
  meta_titulo: string | null; meta_descricao: string | null; publicado: boolean
}

function slugify(txt: string) {
  return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60)
}

function Card({ siteId, t, readOnly, onUpdate, onDelete }: {
  siteId: string; t: Tratamento; readOnly: boolean
  onUpdate: (t: Tratamento) => void; onDelete: (id: string) => void
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [expandido, setExpandido] = useState(false)
  const [confirmar, setConfirmar] = useState(false)

  async function salvar(patch: Partial<TratamentoData>) {
    setErro(null)
    try { const row = await upsertTratamentoInline(siteId, t.id, patch); if (row) onUpdate({ ...t, ...row } as Tratamento) }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
  }

  return (
    <div className="group relative block overflow-hidden rounded-2xl shadow-lg bg-slate-900">
      <EditableImage
        src={t.imagem_url || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=60'}
        siteId={siteId} readOnly={readOnly}
        className="w-full aspect-[4/3]"
        alt={t.titulo}
        onReplace={(url) => salvar({ imagem_url: url })}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B3C]/90 via-[#0B2B3C]/20 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <EditableText
          as="p" readOnly={readOnly} value={t.titulo} placeholder="Nome do tratamento"
          className="font-display font-bold text-white text-sm leading-snug drop-shadow block"
          onSave={v => salvar({ titulo: v })}
        />
        <EditableText
          as="p" readOnly={readOnly} value={t.descricao_curta} placeholder="Texto curto do card" multiline
          className="text-white/80 text-xs mt-1 leading-snug block"
          onSave={v => salvar({ descricao_curta: v })}
        />
      </div>

      {!readOnly && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setExpandido(x => !x)}
            className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs flex items-center justify-center backdrop-blur-sm" title="Mais detalhes">
            ⚙
          </button>
          {confirmar ? (
            <button onClick={() => onDelete(t.id)} className="text-[10px] font-bold bg-red-500 text-white px-2 rounded-full">Confirmar?</button>
          ) : (
            <button onClick={() => setConfirmar(true)} onBlur={() => setConfirmar(false)}
              className="w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white text-xs flex items-center justify-center backdrop-blur-sm">✕</button>
          )}
        </div>
      )}

      {expandido && !readOnly && (
        <div className="absolute inset-0 bg-white p-4 overflow-y-auto text-left z-10">
          <button onClick={() => setExpandido(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
          <p className="text-[10px] font-bold text-[#0EA5A0] uppercase tracking-wider mb-2">Detalhes do tratamento</p>
          <label className="block mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Endereço na URL (slug)</span>
            <input defaultValue={t.slug} onBlur={e => { const v = slugify(e.target.value); if (v) salvar({ slug: v }) }}
              placeholder="ex: clareamento-dental"
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono" />
            <span className="text-[9px] text-slate-400">Aparece em /tratamentos/{t.slug} — evite mudar depois de divulgado</span>
          </label>
          <label className="block mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Descrição completa (página de detalhe)</span>
            <textarea defaultValue={t.descricao_completa} rows={3}
              onBlur={e => salvar({ descricao_completa: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </label>
          <label className="block mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Título para o Google (SEO)</span>
            <input defaultValue={t.meta_titulo ?? ''} onBlur={e => salvar({ meta_titulo: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </label>
          <label className="flex items-center gap-2 mt-3">
            <input type="checkbox" defaultChecked={t.publicado} onChange={e => salvar({ publicado: e.target.checked })} />
            <span className="text-xs font-semibold text-slate-600">Publicado no site</span>
          </label>
        </div>
      )}
      {erro && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500">{erro}</p>}
    </div>
  )
}

export default function TratamentosSectionEditor({ siteId, tratamentosIniciais, readOnly }: {
  siteId: string; tratamentosIniciais: Tratamento[]; readOnly: boolean
}) {
  const [itens, setItens] = useState(tratamentosIniciais)
  const [adicionando, setAdicionando] = useState(false)

  async function adicionar() {
    setAdicionando(true)
    try {
      const row = await upsertTratamentoInline(siteId, null, { titulo: 'Novo tratamento', slug: `tratamento-${Date.now()}` })
      if (row) setItens(xs => [...xs, row as Tratamento])
    } finally { setAdicionando(false) }
  }

  return (
    <section className="px-6 py-14 bg-[#0EA5A0]">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl text-white text-center mb-2">
          Áreas de <strong>Atuação</strong>
        </h2>
        <p className="text-center text-white/80 text-sm mb-8">Aparece na Home e na página Tratamentos</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {itens.map(t => (
            <Card key={t.id} siteId={siteId} t={t} readOnly={readOnly}
              onUpdate={upd => setItens(xs => xs.map(x => x.id === upd.id ? upd : x))}
              onDelete={async id => { await deleteTratamentoInline(id); setItens(xs => xs.filter(x => x.id !== id)) }}
            />
          ))}

          {!readOnly && (
            <button onClick={adicionar} disabled={adicionando}
              className="aspect-[4/3] rounded-2xl border-2 border-dashed border-white/40 hover:border-white text-white/70 hover:text-white flex flex-col items-center justify-center gap-1.5 transition-colors">
              <span className="text-2xl">{adicionando ? '…' : '+'}</span>
              <span className="text-xs font-semibold">Novo tratamento</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
