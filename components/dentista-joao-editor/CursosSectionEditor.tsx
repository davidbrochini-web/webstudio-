'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import EditableTextoCustomizado from '@/components/site-editor/EditableTextoCustomizado'
import VisibilidadeSecaoToggle from './VisibilidadeSecaoToggle'
import { upsertCursoInline, deleteCursoInline, type CursoData } from '@/app/app/(hub)/projeto-especial/editor/actions'

export interface Curso {
  id: string; titulo: string; slug: string; descricao: string; descricao_completa: string | null; data_evento: string | null
  imagem_url: string | null; alt_text: string | null
  meta_titulo: string | null; meta_descricao: string | null; publicado: boolean
}

function slugify(txt: string) {
  return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60)
}

function CursoCard({ siteId, c, readOnly, onUpdate, onDelete }: {
  siteId: string; c: Curso; readOnly: boolean
  onUpdate: (c: Curso) => void; onDelete: (id: string) => void
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [expandido, setExpandido] = useState(false)
  const [confirmar, setConfirmar] = useState(false)

  async function salvar(patch: Partial<CursoData>) {
    setErro(null)
    try { const row = await upsertCursoInline(siteId, c.id, patch); if (row) onUpdate({ ...c, ...row } as Curso) }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
  }

  return (
    <div className="group relative border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
      <EditableImage
        src={c.imagem_url || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=60'}
        siteId={siteId} readOnly={readOnly} className="w-full aspect-[4/3]" alt="" aspect={4 / 3}
        onReplace={(url) => salvar({ imagem_url: url })}
      />
      <div className="p-5">
        <EditableText as="p" readOnly={readOnly} value={c.titulo} placeholder="Título do evento"
          className="font-display font-bold text-base text-[#0B2B3C] mb-1.5 block"
          onSave={v => salvar({ titulo: v })} />
        <EditableText as="p" readOnly={readOnly} value={c.descricao} placeholder="Descrição do evento" multiline
          className="text-sm text-slate-500 leading-relaxed block mb-2"
          onSave={v => salvar({ descricao: v })} />
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>📅</span>
          <input type="date" defaultValue={c.data_evento ?? ''} disabled={readOnly}
            onChange={e => salvar({ data_evento: e.target.value || null })}
            className="text-xs border-0 bg-transparent focus:outline-none disabled:opacity-60" />
        </div>
        {!c.publicado && (
          <span className="inline-block mt-2 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Rascunho — não aparece no site</span>
        )}
      </div>

      {!readOnly && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setExpandido(x => !x)}
            className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs flex items-center justify-center backdrop-blur-sm" title="Mais detalhes">⚙</button>
          {confirmar ? (
            <button onClick={() => onDelete(c.id)} className="text-[10px] font-bold bg-red-500 text-white px-2 rounded-full">Confirmar?</button>
          ) : (
            <button onClick={() => setConfirmar(true)} onBlur={() => setConfirmar(false)}
              className="w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white text-xs flex items-center justify-center backdrop-blur-sm">✕</button>
          )}
        </div>
      )}

      {expandido && !readOnly && (
        <div className="absolute inset-0 bg-white p-4 overflow-y-auto text-left z-10">
          <button onClick={() => setExpandido(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
          <p className="text-[10px] font-bold text-[#0EA5A0] uppercase tracking-wider mb-2">Detalhes do evento</p>
          <p className="text-[9px] text-slate-400 mb-2">O texto de cima (no card) é o resumo. Aqui embaixo é o texto completo que aparece quando alguém clica pra ver mais.</p>
          <label className="block mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Texto completo (página de detalhe)</span>
            <textarea defaultValue={c.descricao_completa ?? ''} rows={5}
              placeholder="Programação, o que será abordado, público-alvo, carga horária, certificado, etc."
              onBlur={e => salvar({ descricao_completa: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </label>
          <label className="block mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Endereço na URL (slug)</span>
            <input defaultValue={c.slug} onBlur={e => { const v = slugify(e.target.value); if (v) salvar({ slug: v }) }}
              placeholder="ex: palestra-saude-bucal"
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono" />
          </label>
          <label className="block mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Título para o Google (SEO)</span>
            <input defaultValue={c.meta_titulo ?? ''} onBlur={e => salvar({ meta_titulo: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </label>
          <label className="block mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Descrição para o Google (SEO)</span>
            <textarea defaultValue={c.meta_descricao ?? ''} rows={2} onBlur={e => salvar({ meta_descricao: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </label>
          <label className="flex items-center gap-2 mt-3">
            <input type="checkbox" defaultChecked={c.publicado} onChange={e => salvar({ publicado: e.target.checked })} />
            <span className="text-xs font-semibold text-slate-600">Publicado no site</span>
          </label>
        </div>
      )}
      {erro && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500">{erro}</p>}
    </div>
  )
}

export default function CursosSectionEditor({ siteId, cursosIniciais, readOnly, visivel, textos }: {
  siteId: string; cursosIniciais: Curso[]; readOnly: boolean; visivel: boolean
  textos: Record<string, string>
}) {
  const [itens, setItens] = useState(cursosIniciais)
  const [adicionando, setAdicionando] = useState(false)

  async function adicionar() {
    setAdicionando(true)
    try {
      const row = await upsertCursoInline(siteId, null, { titulo: 'Novo evento', slug: `evento-${Date.now()}` })
      if (row) setItens(xs => [...xs, row as Curso])
    } finally { setAdicionando(false) }
  }

  return (
    <section className="px-6 py-14 max-w-5xl mx-auto">
      <VisibilidadeSecaoToggle siteId={siteId} campo="secao_cursos_visivel" visivel={visivel} readOnly={readOnly} />
      <EditableTextoCustomizado
        siteId={siteId} readOnly={readOnly} chave="home_cursos_titulo"
        valor={textos.home_cursos_titulo ?? 'Agenda de Cursos e Palestras'}
        as="h2" className="font-display font-extrabold text-2xl text-[#0B2B3C] text-center mb-2 block"
      />
      <EditableTextoCustomizado
        siteId={siteId} readOnly={readOnly} chave="home_cursos_subtitulo"
        valor={textos.home_cursos_subtitulo ?? 'Também atuamos como palestrantes em instituições de ensino e eventos.'}
        as="p" className="text-center text-slate-500 text-sm mb-2 block"
      />
      <p className="text-center text-slate-400 text-xs mb-6">Aparece na Home e na página Cursos e Eventos</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {itens.map(c => (
          <CursoCard key={c.id} siteId={siteId} c={c} readOnly={readOnly}
            onUpdate={upd => setItens(xs => xs.map(x => x.id === upd.id ? upd : x))}
            onDelete={async id => { await deleteCursoInline(id); setItens(xs => xs.filter(x => x.id !== id)) }}
          />
        ))}

        {!readOnly && (
          <button onClick={adicionar} disabled={adicionando}
            className="aspect-[4/3] sm:aspect-auto rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#0EA5A0] text-slate-400 hover:text-[#0EA5A0] flex flex-col items-center justify-center gap-1.5 transition-colors min-h-[220px]">
            <span className="text-2xl">{adicionando ? '…' : '+'}</span>
            <span className="text-xs font-semibold">Novo evento</span>
          </button>
        )}
      </div>
    </section>
  )
}
