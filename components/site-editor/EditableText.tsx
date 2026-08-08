'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onSave: (value: string) => Promise<void>
  onRemove?: () => Promise<void>
  readOnly?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  className?: string
  multiline?: boolean
  placeholder?: string
}

// Fluxo explícito Editar → Salvar/Cancelar. Antes o campo salvava sozinho
// no blur e cancelava só com Escape — no touch, tocar em qualquer lugar
// fora do campo dispara blur (salva sem querer) e não existe tecla
// Escape no teclado do celular (não tinha como cancelar). Agora: toca
// pra editar, aparecem botões visíveis de Salvar e Cancelar, nada
// acontece sozinho.
export default function EditableText({ value, onSave, onRemove, readOnly, as: Tag = 'span', className = '', multiline, placeholder }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue && !editing) {
    setLastValue(value)
    setDraft(value)
  }
  useEffect(() => {
    if (editing) (multiline ? textareaRef.current : inputRef.current)?.focus()
  }, [editing, multiline])

  async function commit() {
    if (draft === value) { setEditing(false); setError(null); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(draft)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  // Ação explícita, separada de "apagar tudo e salvar" — evita ambiguidade
  // (campo vazio por engano vs. decisão real de deixar sem texto) e dá um
  // ponto único no código pra tratar a ausência do campo (ver HeroCarousel:
  // esconde o <h1>/<p> por completo em vez de renderizar vazio com margem
  // sobrando). Só aparece quando o caller passa onRemove E já tem valor.
  async function remove() {
    if (!onRemove) return
    setSaving(true)
    setError(null)
    try {
      await onRemove()
      setDraft('')
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover.')
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setDraft(value)
    setEditing(false)
    setError(null)
  }

  if (readOnly) {
    return <Tag className={className}>{value || placeholder}</Tag>
  }

  // Em modo edição o input/textarea precisa de texto escuro sobre fundo
  // branco, independente da cor original do campo (ex: títulos brancos
  // sobre foto). Filtrar as classes de cor do className antes de passar
  // pro input — no Tailwind v4 os cascade layers podem vencer inline
  // styles, então não basta setar style={{color}} quando a className
  // inclui text-white ou text-[#fff] ou text-slate-xxx/opacity.
  const editClassName = className
    .split(' ')
    .filter(c => !/^text-(white|black|current|transparent|inherit|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|\[#)/.test(c))
    .filter(c => !/^text-\[var\(/.test(c))
    .filter(c => !/^opacity-/.test(c))
    .join(' ')

  if (editing) {
    return (
      <span className="inline-block w-full align-top">
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            className={`${editClassName} w-full bg-white text-[#0B2B3C] outline-none ring-2 ring-[var(--brand)] rounded-md px-2 py-1.5 resize-none`}
          />
        ) : (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className={`${editClassName} w-full bg-white text-[#0B2B3C] outline-none ring-2 ring-[var(--brand)] rounded-md px-2 py-1.5`}
          />
        )}
        <span className="flex items-center gap-2 mt-1.5 flex-wrap">
          <button type="button" onClick={commit} disabled={saving}
            className="text-xs font-bold text-white bg-[var(--brand)] rounded-full px-3.5 py-1.5 disabled:opacity-50">
            {saving ? 'Salvando…' : '💾 Salvar'}
          </button>
          <button type="button" onClick={cancel} disabled={saving}
            className="text-xs font-bold text-[var(--ink)] bg-[var(--off)] border border-[var(--border)] rounded-full px-3.5 py-1.5 disabled:opacity-50">
            ✕ Cancelar
          </button>
          {onRemove && value && (
            <button type="button" onClick={remove} disabled={saving}
              className="text-xs font-bold text-white bg-red-600/90 hover:bg-red-600 rounded-full px-3.5 py-1.5 disabled:opacity-50">
              🗑️ Remover
            </button>
          )}
        </span>
        {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
      </span>
    )
  }

  return (
    <Tag
      onClick={() => setEditing(true)}
      className={`${className} cursor-pointer rounded-md px-1 -mx-1 outline-dashed outline-1 outline-[var(--brand)]/40 bg-[var(--brand)]/[0.06] active:bg-[var(--brand)]/20 transition-colors`}
      title="Toque para editar"
    >
      {value || <span className="opacity-40 italic">{placeholder ?? 'Toque para editar'}</span>}
      <span className="inline-block ml-1.5 text-[0.7em] align-middle opacity-70">✏️</span>
    </Tag>
  )
}
