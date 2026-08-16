'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateLeadDadosCompletos, type LeadDadosCompletos } from '@/app/admin/crm/actions'

export interface LeadEditarModalProps {
  leadId: string
  dadosIniciais: LeadDadosCompletos
  onClose: () => void
  onSalvo: (dados: LeadDadosCompletos) => void
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-[var(--muted)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
      />
    </label>
  )
}

export default function LeadEditarModal({ leadId, dadosIniciais, onClose, onSalvo }: LeadEditarModalProps) {
  const router = useRouter()
  const [dados, setDados] = useState<LeadDadosCompletos>(dadosIniciais)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function set<K extends keyof LeadDadosCompletos>(campo: K, valor: string) {
    setDados(d => ({ ...d, [campo]: valor }))
  }

  async function handleSalvar() {
    setErro(null)
    if (!dados.nome.trim()) {
      setErro('Nome da empresa é obrigatório.')
      return
    }
    setSalvando(true)
    try {
      const res = await updateLeadDadosCompletos(leadId, dados)
      if (res.error) {
        setErro(res.error)
        return
      }
      onSalvo(dados)
      router.refresh()
      onClose()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-[var(--card-bg)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--border)]">
          <p className="font-display font-bold text-[var(--ink)] text-base">✏️ Editar cliente</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--off)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center text-lg"
            title="Fechar (Esc)"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <Campo label="Nome da empresa *" value={dados.nome} onChange={v => set('nome', v)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="Telefone / WhatsApp" value={dados.telefone ?? ''} onChange={v => set('telefone', v)} />
            <Campo label="E-mail" value={dados.email ?? ''} onChange={v => set('email', v)} type="email" />
          </div>

          <Campo label="Segmento" value={dados.segmento ?? ''} onChange={v => set('segmento', v)} placeholder="ex: dentista, advocacia" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="Bairro" value={dados.bairro ?? ''} onChange={v => set('bairro', v)} />
            <Campo label="Endereço" value={dados.endereco ?? ''} onChange={v => set('endereco', v)} />
          </div>

          <div className="border-t border-[var(--border)] pt-3 mt-1">
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Presença online do lead</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Campo label="Site atual (se tiver)" value={dados.siteAtualUrl ?? ''} onChange={v => set('siteAtualUrl', v)} placeholder="ex: negocio.com.br" />
              <Campo label="Instagram" value={dados.instagramUrl ?? ''} onChange={v => set('instagramUrl', v)} placeholder="ex: instagram.com/negocio" />
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[var(--muted)]">Observação</span>
            <textarea
              value={dados.notas ?? ''}
              onChange={e => set('notas', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none resize-none focus:border-[var(--brand)]"
            />
          </label>

          {erro && <p className="text-xs text-red-500">{erro}</p>}

          <div className="flex gap-2 mt-1">
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="flex-1 bg-[var(--brand)] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--ink)] font-semibold hover:border-[var(--muted)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
