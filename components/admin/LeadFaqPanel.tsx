'use client'

import { useEffect, useState, useTransition } from 'react'
import { getLeadFaq, addLeadFaqPerguntaAberta, deleteLeadFaqItem, type LeadFaqItem } from '@/app/admin/crm/actions'

export default function LeadFaqPanel({ leadId }: { leadId: string }) {
  const [itens, setItens] = useState<LeadFaqItem[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    if (!aberto || itens) return
    getLeadFaq(leadId)
      .then(setItens)
      .catch(err => setErro(err instanceof Error ? err.message : 'Erro ao carregar FAQ.'))
  }, [leadId, aberto, itens])

  const preDefinidas = itens?.filter(i => i.tipo === 'pre_definida') ?? []
  const abertas = itens?.filter(i => i.tipo === 'pergunta_aberta') ?? []
  const total = itens?.length ?? null

  function recarregar() {
    getLeadFaq(leadId).then(setItens).catch(() => {})
  }

  function handleRemover(id: string) {
    startTransition(async () => {
      try {
        await deleteLeadFaqItem(id, leadId)
        recarregar()
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao remover.')
      }
    })
  }

  return (
    <div className="pt-4 mt-4 border-t border-[var(--border)]">
      <button
        onClick={() => setAberto(a => !a)}
        className="w-full flex items-center gap-2 text-left"
      >
        <span className={`text-[var(--muted)] text-[10px] flex-shrink-0 transition-transform ${aberto ? 'rotate-90' : ''}`}>▶</span>
        <p className="text-[11px] font-semibold text-[var(--muted)]">
          FAQ do cliente{total != null && <span className="ml-1 font-normal">({total})</span>}
        </p>
      </button>

      {aberto && (
        <div className="mt-2">
          {!itens && !erro && <p className="text-xs text-[var(--muted)]">Carregando...</p>}
          {erro && <p className="text-xs text-red-500">{erro}</p>}

          {preDefinidas.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide">Script do segmento</p>
              {preDefinidas.map(item => (
                <div key={item.id} className="bg-[var(--off)] rounded-xl px-3 py-2.5">
                  <p className="text-xs font-bold text-[var(--ink)]">{item.pergunta}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{item.resposta}</p>
                </div>
              ))}
            </div>
          )}

          {abertas.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide">Perguntas reais do cliente</p>
              {abertas.map(item => (
                <div key={item.id} className="border border-[var(--border)] rounded-xl px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[var(--ink)]">{item.pergunta}</p>
                    <button
                      onClick={() => handleRemover(item.id)}
                      disabled={pending}
                      className="text-[10px] text-[var(--muted)] hover:text-red-500 flex-shrink-0"
                    >
                      remover
                    </button>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{item.resposta}</p>
                </div>
              ))}
            </div>
          )}

          <NovaPerguntaForm leadId={leadId} onAdded={recarregar} />
        </div>
      )}
    </div>
  )
}

function NovaPerguntaForm({ leadId, onAdded }: { leadId: string; onAdded: () => void }) {
  const [pergunta, setPergunta] = useState('')
  const [resposta, setResposta] = useState('')
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleAdicionar() {
    setErro(null)
    startTransition(async () => {
      try {
        await addLeadFaqPerguntaAberta(leadId, pergunta, resposta)
        setPergunta('')
        setResposta('')
        onAdded()
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao registrar.')
      }
    })
  }

  return (
    <div className="bg-[var(--off)] rounded-xl p-3">
      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-2">
        Registrar pergunta que o cliente fez
      </p>
      <input
        value={pergunta}
        onChange={e => setPergunta(e.target.value)}
        placeholder="O que o cliente perguntou..."
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-xs outline-none mb-2 focus:border-[var(--brand)]"
      />
      <textarea
        value={resposta}
        onChange={e => setResposta(e.target.value)}
        placeholder="Resposta (com base no FAQ / o que combinamos com o Claude no chat)..."
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-xs outline-none resize-none mb-2 focus:border-[var(--brand)]"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleAdicionar}
          disabled={pending || !pergunta.trim() || !resposta.trim()}
          className="text-xs font-semibold text-white bg-[var(--dark)] px-3 py-1.5 rounded-lg disabled:opacity-40"
        >
          {pending ? 'Salvando...' : '+ Adicionar'}
        </button>
        {erro && <p className="text-[10px] text-red-500">{erro}</p>}
      </div>
    </div>
  )
}
