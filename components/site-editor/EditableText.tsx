'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onSave: (value: string) => Promise<void>
  readOnly?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  className?: string
  multiline?: boolean
  placeholder?: string
}

export default function EditableText({ value, onSave, readOnly, as: Tag = 'span', className = '', multiline, placeholder }: Props) {
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
    if (draft === value) { setEditing(false); return }
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

  function cancel() {
    setDraft(value)
    setEditing(false)
    setError(null)
  }

  if (readOnly) {
    return <Tag className={className}>{value || placeholder}</Tag>
  }

  if (editing) {
    return (
      <div className="inline-block w-full">
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Escape') cancel() }}
            rows={3}
            className={`${className} w-full bg-white outline-none ring-2 ring-[var(--brand)] rounded-md px-2 py-1 resize-none text-current`}
          />
        ) : (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commit() }
              if (e.key === 'Escape') cancel()
            }}
            className={`${className} w-full bg-white outline-none ring-2 ring-[var(--brand)] rounded-md px-2 py-1 text-current`}
          />
        )}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <Tag
      onClick={() => setEditing(true)}
      className={`${className} cursor-pointer rounded-md px-0.5 -mx-0.5 outline-dashed outline-1 outline-transparent hover:outline-[var(--brand)] hover:bg-[var(--brand)]/5 transition-all ${saving ? 'opacity-50' : ''}`}
      title="Clique para editar"
    >
      {value || <span className="opacity-40 italic">{placeholder ?? 'Clique para editar'}</span>}
    </Tag>
  )
}
