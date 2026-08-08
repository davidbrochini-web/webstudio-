'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import VisibilidadeSecaoToggle from './VisibilidadeSecaoToggle'
import { upsertSegmentoInline, deleteSegmentoInline, type SegmentoData } from '@/app/app/(hub)/colegio-elite/actions'

export interface Segmento {
  id: string; titulo: string; slug: string; resumo: string; texto_completo: string
  imagem_url: string | null; meta_titulo: string | null; publicado: boolean
}

function slugify(txt: string) {
  return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60)
}

function Card({ siteId, s, readOnly, onUpdate, onDelete }: {
  siteId: string; s: Segmento; readOnly: boolean
  onUpdate: (s: Segmento) => void; onDelete: (id: string) => void
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [expandido, setExpandido] = useState(false)
  const [confirmar, setConfirmar] = useState(false)

  async function salvar(patch: Partial<SegmentoData>) {
    setErro(null)
    try { const row = await upsertSegmentoInline(siteId, s.id, patch); if (row) onUpdate({ ...s, ...row } as Segmento) }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
  }

  return (
    <div className="group relative block overflow-hidden rounded-2xl shadow-lg bg-slate-900">
      <EditableImage
        src={s.imagem_url || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=60'}
        siteId={siteId} readOnly={readOnly} aspect={4 / 3}
        className="w-full aspect-[4/3]" alt={s.titulo}
        onReplace={(url) => salvar({ imagem_url: url })}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--ce-secondary)]/90 via-[var(--ce-secondary)]/20 to-transparent pointer-events-none" />

      <div className={`absolute bottom-0 left-0 right-0 p-4 ${!readOnly ? 'pb-14' : ''}`}>
        <EditableText as="p" readOnly={readOnly} value={s.titulo} placeholder="Nome do segmento"
          className="font-display font-bold text-white text-sm leading-snug drop-shadow block" onSave={v => salvar({ titulo: v })} />
        <EditableText as="p" readOnly={readOnly} value={s.resumo} placeholder="Texto curto do card" multiline
          className="text-white/80 text-xs mt-1 leading-snug block" onSave={v => salvar({ resumo: v })} />
      </div>

      {!readOnly && (
        <div className="absolute top-2 right-2 z-20 flex gap-1">
          <button onClick={() => setExpandido(x => !x)}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white text-sm flex items-center justify-center backdrop-blur-sm" title="Mais detalhes">⚙</button>
          {confirmar ? (
            <button onClick={() => onDelete(s.id)} className="text-[11px] font-bold bg-red-500 text-white px-2.5 rounded-full">Confirmar?</button>
          ) : (
            <button onClick={() => setConfirmar(true)}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-red-500 text-white text-sm flex items-center justify-center backdrop-blur-sm">✕</button>
          )}
        </div>
      )}

      {expandido && !readOnly && (
        <div className="absolute inset-0 bg-white p-4 overflow-y-auto text-left z-10">
          <button onClick={() => setExpandido(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
          <p className="text-[10px] font-bold text-[var(--ce-primary)] uppercase tracking-wider mb-2">Detalhes do segmento</p>
          <label className="block mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Endereço na URL (slug)</span>
            <input defaultValue={s.slug} onBlur={e => { const v = slugify(e.target.value); if (v) salvar({ slug: v }) }}
              placeholder="ex: ensino-bilingue"
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono" />
            <span className="text-[9px] text-slate-400">Aparece em /ensino/{s.slug} — evite mudar depois de divulgado</span>
          </label>
          <label className="block mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Texto completo (página de detalhe)</span>
            <textarea defaultValue={s.texto_completo} rows={6}
              placeholder="Explique o segmento em detalhes"
              onBlur={e => salvar({ texto_completo: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </label>
          <label className="block mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Título para o Google (SEO)</span>
            <input defaultValue={s.meta_titulo ?? ''} onBlur={e => salvar({ meta_titulo: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </label>
          <label className="flex items-center gap-2 mt-3">
            <input type="checkbox" defaultChecked={s.publicado} onChange={e => salvar({ publicado: e.target.checked })} />
            <span className="text-xs font-semibold text-slate-600">Publicado no site</span>
          </label>
        </div>
      )}
      {erro && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500">{erro}</p>}
    </div>
  )
}

export default function SegmentosSectionEditor({ siteId, segmentosIniciais, readOnly, visivel }: {
  siteId: string; segmentosIniciais: Segmento[]; readOnly: boolean; visivel: boolean
}) {
  const [itens, setItens] = useState(segmentosIniciais)
  const [adicionando, setAdicionando] = useState(false)

  async function adicionar() {
    setAdicionando(true)
    try {
      const row = await upsertSegmentoInline(siteId, null, { titulo: 'Novo segmento', slug: `segmento-${Date.now()}` })
      if (row) setItens(xs => [...xs, row as Segmento])
    } finally { setAdicionando(false) }
  }

  return (
    <section className="px-6 py-14 bg-[var(--ce-primary)]">
      <div className="max-w-5xl mx-auto">
        <VisibilidadeSecaoToggle siteId={siteId} campo="secao_segmentos_visivel" visivel={visivel} readOnly={readOnly} />
        <p className="text-center text-white/50 text-xs mb-8">Aparece na Home e na página Ensino</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {itens.map(s => (
            <Card key={s.id} siteId={siteId} s={s} readOnly={readOnly}
              onUpdate={upd => setItens(xs => xs.map(x => x.id === upd.id ? upd : x))}
              onDelete={async id => { await deleteSegmentoInline(id); setItens(xs => xs.filter(x => x.id !== id)) }}
            />
          ))}

          {!readOnly && (
            <button onClick={adicionar} disabled={adicionando}
              className="aspect-[4/3] rounded-2xl border-2 border-dashed border-white/40 hover:border-white text-white/70 hover:text-white flex flex-col items-center justify-center gap-1.5 transition-colors">
              <span className="text-2xl">{adicionando ? '…' : '+'}</span>
              <span className="text-xs font-semibold">Novo segmento</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
