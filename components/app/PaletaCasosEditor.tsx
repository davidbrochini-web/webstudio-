'use client'

import { useState, useTransition } from 'react'
import { updatePaletaCasos } from '@/app/app/(hub)/casos-esquecidos/cores/actions'

const CAMPOS: { chave: string; label: string; grupo: string }[] = [
  { chave: 'paleta_bg', label: 'Fundo principal', grupo: 'Base' },
  { chave: 'paleta_bg_panel', label: 'Fundo de painel/card', grupo: 'Base' },
  { chave: 'paleta_bg_panel_2', label: 'Fundo de painel (variação)', grupo: 'Base' },
  { chave: 'paleta_line', label: 'Linhas/bordas', grupo: 'Base' },
  { chave: 'paleta_gold', label: 'Dourado (destaque)', grupo: 'Acentos' },
  { chave: 'paleta_gold_dim', label: 'Dourado apagado', grupo: 'Acentos' },
  { chave: 'paleta_blood', label: 'Vermelho-sangue', grupo: 'Acentos' },
  { chave: 'paleta_blood_bright', label: 'Vermelho-sangue vivo', grupo: 'Acentos' },
  { chave: 'paleta_paper', label: 'Texto principal (papel)', grupo: 'Texto' },
  { chave: 'paleta_paper_dim', label: 'Texto secundário', grupo: 'Texto' },
  { chave: 'paleta_muted', label: 'Texto apagado/legendas', grupo: 'Texto' },
]

const DEFAULTS: Record<string, string> = {
  paleta_bg: '#0b0a08', paleta_bg_panel: '#15120e', paleta_bg_panel_2: '#1c1812', paleta_line: '#322c22',
  paleta_gold: '#cdb077', paleta_gold_dim: '#8f7c54', paleta_blood: '#9c2b2b', paleta_blood_bright: '#c43a3a',
  paleta_paper: '#e8dfc8', paleta_paper_dim: '#b7ad94', paleta_muted: '#6f6858',
}

export default function PaletaCasosEditor({ siteId, valoresIniciais, readOnly }: {
  siteId: string
  valoresIniciais: Record<string, string>
  readOnly: boolean
}) {
  const [valores, setValores] = useState<Record<string, string>>({ ...DEFAULTS, ...valoresIniciais })
  const [salvo, setSalvo] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function set(chave: string, valor: string) {
    setValores(v => ({ ...v, [chave]: valor }))
    setSalvo(false)
  }

  function restaurarPadrao() {
    setValores({ ...DEFAULTS })
    setSalvo(false)
  }

  function salvar() {
    setErro(null)
    startTransition(async () => {
      try { await updatePaletaCasos(siteId, valores); setSalvo(true) }
      catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
    })
  }

  if (readOnly) {
    return <p className="text-sm text-[var(--muted)]">Você não tem permissão pra alterar a paleta do site.</p>
  }

  const grupos = ['Base', 'Acentos', 'Texto']

  return (
    <div className="max-w-3xl">
      <p className="text-[var(--muted)] text-sm mb-6">
        Essa é a paleta gótica completa do Casos Esquecidos — 11 tons, não só primária/secundária.
        Muda o visual do site inteiro na hora.
      </p>

      {grupos.map(grupo => (
        <div key={grupo} className="mb-6">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">{grupo}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CAMPOS.filter(c => c.grupo === grupo).map(c => (
              <div key={c.chave}>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">{c.label}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={valores[c.chave]}
                    onChange={e => set(c.chave, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[var(--border)] cursor-pointer flex-shrink-0" />
                  <input type="text" value={valores[c.chave]}
                    onChange={e => set(c.chave, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-xs text-[var(--ink)] font-mono uppercase" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Preview */}
      <div className="rounded-2xl overflow-hidden border border-[var(--border)] mb-6"
        style={{ background: valores.paleta_bg }}>
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${valores.paleta_line}` }}>
          <p style={{ color: valores.paleta_gold, fontWeight: 700 }}>Prévia — Casos Esquecidos</p>
        </div>
        <div className="px-5 py-5" style={{ background: valores.paleta_bg_panel }}>
          <p style={{ color: valores.paleta_paper, marginBottom: 8 }}>
            Um texto de exemplo, como apareceria num conto publicado.
          </p>
          <p style={{ color: valores.paleta_muted, fontSize: 12 }}>Legenda apagada de exemplo.</p>
          <span style={{
            display: 'inline-block', marginTop: 12, padding: '6px 14px', borderRadius: 6,
            background: valores.paleta_blood, color: valores.paleta_paper, fontSize: 12, fontWeight: 700,
          }}>
            Botão de destaque
          </span>
        </div>
      </div>

      {erro && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mb-4">{erro}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={salvar} disabled={pending || salvo}
          className="text-sm font-semibold text-white bg-[var(--brand)] rounded-xl px-6 py-2.5 disabled:opacity-50">
          {pending ? 'Salvando…' : salvo ? 'Salvo ✓' : 'Salvar paleta'}
        </button>
        <button type="button" onClick={restaurarPadrao}
          className="text-sm font-semibold text-[var(--muted)] border border-[var(--border)] rounded-xl px-6 py-2.5">
          Restaurar padrão
        </button>
      </div>
    </div>
  )
}
