'use client'

import { useState, useTransition } from 'react'
import { updateCores } from '@/app/app/(hub)/projeto-especial/editor/actions'

// Presets rápidos — inclui a paleta extraída do logo enviado pelo
// cliente (prata/grafite metálico), pra ele trocar num clique sem
// precisar saber código de cor.
const PRESETS = [
  { nome: 'Teal (padrão)', primaria: '#0EA5A0', secundaria: '#0B2B3C' },
  { nome: 'Paleta do logo', primaria: '#8a8a8a', secundaria: '#2a2a2a' },
  { nome: 'Azul clássico', primaria: '#2563EB', secundaria: '#0F172A' },
  { nome: 'Verde clínico', primaria: '#059669', secundaria: '#064E3B' },
]

export default function CoresEditor({ siteId, corPrimariaInicial, corSecundariaInicial, readOnly }: {
  siteId: string
  corPrimariaInicial: string
  corSecundariaInicial: string
  readOnly: boolean
}) {
  const [primaria, setPrimaria] = useState(corPrimariaInicial)
  const [secundaria, setSecundaria] = useState(corSecundariaInicial)
  const [salvo, setSalvo] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function aplicar(p: string, s: string) {
    setPrimaria(p)
    setSecundaria(s)
    setSalvo(false)
  }

  function salvar() {
    setErro(null)
    startTransition(async () => {
      try { await updateCores(siteId, primaria, secundaria); setSalvo(true) }
      catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
    })
  }

  if (readOnly) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-[var(--muted)]">Você não tem permissão pra alterar as cores do site.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[var(--muted)] text-sm mb-6">
        Essas cores definem a identidade visual do site — botões, links, cabeçalho e rodapé. Mudam na hora, em todas as páginas.
      </p>

      {/* Presets */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Sugestões rápidas</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map(p => (
            <button
              key={p.nome}
              type="button"
              onClick={() => aplicar(p.primaria, p.secundaria)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                primaria === p.primaria && secundaria === p.secundaria
                  ? 'border-[var(--brand)]'
                  : 'border-[var(--border)] hover:border-[var(--brand)]/50'
              }`}
            >
              <div className="flex gap-1 mb-2">
                <span className="w-6 h-6 rounded-full border border-black/10" style={{ background: p.primaria }} />
                <span className="w-6 h-6 rounded-full border border-black/10" style={{ background: p.secundaria }} />
              </div>
              <span className="text-xs font-semibold text-[var(--ink)]">{p.nome}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[var(--muted)] mt-2">
          &quot;Paleta do logo&quot; usa os tons prata/grafite do seu logo atual.
        </p>
      </div>

      {/* Cores individuais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
            Cor de destaque (botões, links)
          </label>
          <div className="flex items-center gap-3">
            <input type="color" value={primaria}
              onChange={e => aplicar(e.target.value, secundaria)}
              className="w-12 h-12 rounded-lg border border-[var(--border)] cursor-pointer" />
            <input type="text" value={primaria}
              onChange={e => aplicar(e.target.value, secundaria)}
              className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)] font-mono uppercase" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
            Cor escura de base (menu, rodapé)
          </label>
          <div className="flex items-center gap-3">
            <input type="color" value={secundaria}
              onChange={e => aplicar(primaria, e.target.value)}
              className="w-12 h-12 rounded-lg border border-[var(--border)] cursor-pointer" />
            <input type="text" value={secundaria}
              onChange={e => aplicar(primaria, e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)] font-mono uppercase" />
          </div>
        </div>
      </div>

      {/* Preview simples */}
      <div className="rounded-2xl overflow-hidden border border-[var(--border)] mb-6">
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: secundaria }}>
          <span className="text-white text-sm font-bold">Prévia</span>
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: primaria, color: '#fff' }}>
            Marcar consulta
          </span>
        </div>
        <div className="px-4 py-4 bg-white">
          <p className="text-sm" style={{ color: primaria }}>Este é o tom usado em links e destaques.</p>
        </div>
      </div>

      {erro && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mb-4">{erro}</p>}

      <button type="button" onClick={salvar} disabled={pending || salvo}
        className="text-sm font-semibold text-white bg-[var(--brand)] rounded-xl px-6 py-2.5 disabled:opacity-50">
        {pending ? 'Salvando…' : salvo ? 'Salvo ✓' : 'Salvar cores'}
      </button>
    </div>
  )
}
