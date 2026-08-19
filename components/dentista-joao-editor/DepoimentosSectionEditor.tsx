'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import VisibilidadeSecaoToggle from './VisibilidadeSecaoToggle'
import { upsertDepoimentoInline, deleteDepoimentoInline, type DepoimentoData } from '@/app/app/(hub)/projeto-especial/editor/actions'

export interface Depoimento {
  id: string; nome: string; cargo_ou_contexto: string | null; texto: string
  nota: number; foto_url: string | null; alt_text: string | null; publicado: boolean
}

function EstrelaPicker({ nota, readOnly, onChange }: { nota: number; readOnly: boolean; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n} type="button" disabled={readOnly}
          onClick={() => onChange(n)}
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
          className={`text-lg leading-none transition-colors disabled:cursor-default ${n <= nota ? 'text-amber-400' : 'text-slate-200'} ${!readOnly ? 'hover:text-amber-400 cursor-pointer' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function DepoimentosSectionEditor({ siteId, depoimentosInicial, readOnly, visivel }: {
  siteId: string; depoimentosInicial: Depoimento[]; readOnly: boolean; visivel: boolean
}) {
  const [itens, setItens] = useState(depoimentosInicial)
  const [adicionando, setAdicionando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar(d: Depoimento, patch: Partial<DepoimentoData>) {
    setErro(null)
    try { const row = await upsertDepoimentoInline(siteId, d.id, patch); if (row) setItens(xs => xs.map(x => x.id === d.id ? { ...x, ...row } as Depoimento : x)) }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
  }

  async function adicionar() {
    setAdicionando(true)
    setErro(null)
    try {
      const row = await upsertDepoimentoInline(siteId, null, { nome: 'Nome do paciente', texto: 'Escreva aqui o depoimento do paciente.' })
      if (row) setItens(xs => [...xs, row as Depoimento])
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao adicionar.') }
    finally { setAdicionando(false) }
  }

  async function remover(id: string) {
    setErro(null)
    try { await deleteDepoimentoInline(id); setItens(xs => xs.filter(x => x.id !== id)) }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao remover.') }
  }

  return (
    <section className="px-6 py-16 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <VisibilidadeSecaoToggle siteId={siteId} campo="secao_depoimentos_visivel" visivel={visivel} readOnly={readOnly} />
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--dj-primary)] mb-1 text-center">Seção na Home</p>
        <h2 className="font-display font-extrabold text-2xl text-[var(--dj-secondary)] text-center mb-8">Depoimentos de Clientes</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {itens.map(d => (
            <div key={d.id} className="group relative bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-2">
              {!d.publicado && (
                <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full self-start mb-1">Oculto — não aparece no site</span>
              )}
              <EstrelaPicker nota={d.nota} readOnly={readOnly} onChange={n => salvar(d, { nota: n })} />
              <EditableText as="p" readOnly={readOnly} value={d.texto} placeholder="Depoimento do paciente" multiline
                className="text-sm text-slate-600 leading-relaxed block flex-1"
                onSave={v => salvar(d, { texto: v })} />
              <div className="flex items-center gap-3 mt-2 pt-3 border-t border-slate-100">
                <EditableImage
                  src={d.foto_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=60'}
                  siteId={siteId} readOnly={readOnly}
                  className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                  alt={d.nome} aspect={1}
                  onReplace={(url) => salvar(d, { foto_url: url })}
                  onRemove={d.foto_url ? () => salvar(d, { foto_url: null }) : undefined}
                />
                <div className="min-w-0">
                  <EditableText as="p" readOnly={readOnly} value={d.nome} placeholder="Nome do paciente"
                    className="font-display font-bold text-sm text-[var(--dj-secondary)] block truncate"
                    onSave={v => salvar(d, { nome: v })} />
                  <EditableText as="p" readOnly={readOnly} value={d.cargo_ou_contexto ?? ''} placeholder="Contexto (ex: Paciente de implante)"
                    className="text-xs text-slate-400 block truncate"
                    onSave={v => salvar(d, { cargo_ou_contexto: v })} />
                </div>
              </div>
              {!readOnly && (
                <>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="checkbox" defaultChecked={d.publicado} onChange={e => salvar(d, { publicado: e.target.checked })} />
                    <span className="text-[10px] font-semibold text-slate-500">Publicado no site</span>
                  </label>
                  <button onClick={() => remover(d.id)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 text-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">✕</button>
                </>
              )}
            </div>
          ))}
        </div>

        {!readOnly && (
          <button onClick={adicionar} disabled={adicionando}
            className="mt-5 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-[var(--dj-primary)] text-slate-400 hover:text-[var(--dj-primary)] text-sm font-semibold transition-colors">
            {adicionando ? 'Adicionando…' : '+ Novo depoimento'}
          </button>
        )}
        {erro && <p className="text-xs text-red-600 mt-3 text-center">{erro}</p>}
      </div>
    </section>
  )
}
