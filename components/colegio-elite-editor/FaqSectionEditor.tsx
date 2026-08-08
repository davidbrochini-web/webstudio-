'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import VisibilidadeSecaoToggle from './VisibilidadeSecaoToggle'
import { upsertFaqInlineCE, deleteFaqInlineCE, type FaqData } from '@/app/app/(hub)/colegio-elite/actions'

export interface Faq { id: string; pergunta: string; resposta: string }

export default function FaqSectionEditor({ siteId, faqIniciais, readOnly, visivel }: {
  siteId: string; faqIniciais: Faq[]; readOnly: boolean; visivel: boolean
}) {
  const [itens, setItens] = useState(faqIniciais)
  const [aberto, setAberto] = useState<string | null>(itens[0]?.id ?? null)
  const [adicionando, setAdicionando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar(f: Faq, patch: Partial<FaqData>) {
    setErro(null)
    try { const row = await upsertFaqInlineCE(siteId, f.id, patch); if (row) setItens(xs => xs.map(x => x.id === f.id ? { ...x, ...row } as Faq : x)) }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
  }

  async function adicionar() {
    setAdicionando(true)
    try {
      const row = await upsertFaqInlineCE(siteId, null, { pergunta: 'Nova pergunta', resposta: 'Resposta...' })
      if (row) { setItens(xs => [...xs, row as Faq]); setAberto((row as Faq).id) }
    } finally { setAdicionando(false) }
  }

  return (
    <section className="px-5 sm:px-6 py-16 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <VisibilidadeSecaoToggle siteId={siteId} campo="secao_faq_visivel" visivel={visivel} readOnly={readOnly} />
        <p className="text-center text-slate-400 text-xs mb-8">Aparece na Home</p>

        <div className="flex flex-col gap-3">
          {itens.map(f => {
            const open = aberto === f.id
            return (
              <div key={f.id} className="group bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm relative">
                <button onClick={() => setAberto(open ? null : f.id)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className={`font-display font-bold text-sm transition-colors flex-1 ${open ? 'text-[var(--ce-primary)]' : 'text-[var(--ce-secondary)]'}`}>
                    {readOnly ? f.pergunta : (
                      <EditableText as="span" readOnly={readOnly} value={f.pergunta} placeholder="Pergunta"
                        className="block" onSave={v => salvar(f, { pergunta: v })} />
                    )}
                  </span>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${open ? 'border-[var(--ce-primary)] bg-[var(--ce-primary)] text-white rotate-45' : 'border-slate-200 text-slate-400'}`}>+</span>
                </button>
                <div style={{ maxHeight: open ? '400px' : '0', transition: 'max-height 0.35s ease' }} className="overflow-hidden">
                  <div className="px-5 pb-5">
                    <EditableText as="p" readOnly={readOnly} value={f.resposta} placeholder="Resposta" multiline
                      className="text-sm text-slate-500 leading-relaxed block" onSave={v => salvar(f, { resposta: v })} />
                  </div>
                </div>
                {!readOnly && (
                  <button onClick={async () => { await deleteFaqInlineCE(f.id); setItens(xs => xs.filter(x => x.id !== f.id)) }}
                    className="absolute top-3 right-11 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 text-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">✕</button>
                )}
              </div>
            )
          })}
        </div>

        {!readOnly && (
          <button onClick={adicionar} disabled={adicionando}
            className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-[var(--ce-primary)] text-slate-400 hover:text-[var(--ce-primary)] text-sm font-semibold transition-colors">
            {adicionando ? 'Adicionando…' : '+ Nova pergunta'}
          </button>
        )}
        {erro && <p className="text-xs text-red-600 mt-3">{erro}</p>}
      </div>
    </section>
  )
}
