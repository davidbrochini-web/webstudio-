'use client'

import { useActionState, useState, useEffect } from 'react'

export interface CampoConfig {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'checkbox' | 'date' | 'url'
  required?: boolean
  placeholder?: string
  dica?: string            // texto pequeno abaixo do campo
  span?: 'full' | 'half'  // half = lado a lado em grid
  grupo?: string           // agrupa campos com um separador visual
}

export interface ColunasConfig {
  key: string
  label: string
  render?: (val: unknown) => string | number | boolean
}

export interface PEFormState { error?: string; success?: boolean }

interface Item { id: string; [k: string]: string | number | boolean | null | undefined }

/**
 * CRUD visual para seções do editor do projeto especial.
 * Diferente do ConteudoManager genérico, esse componente:
 * - Usa grid de cards (não tabela) pra listar itens
 * - Form inline expandido no card (não modal separado)
 * - Grupos de campos com separadores
 * - Campos URL com dica de "cole o link da imagem"
 */
export default function EditorSecao({
  siteId, itens, campos, colunas, upsertAction, deleteAction,
  addLabel, emptyLabel, imagemKey, nomeKey = 'titulo',
}: {
  siteId: string
  itens: Item[]
  campos: CampoConfig[]
  colunas: ColunasConfig[]
  upsertAction: (prev: PEFormState, fd: FormData) => Promise<PEFormState>
  deleteAction: (id: string) => Promise<void>
  addLabel: string
  emptyLabel: string
  imagemKey?: string   // campo de URL de imagem para preview
  nomeKey?: string
}) {
  const [editando, setEditando] = useState<Item | 'novo' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deletando, setDeletando] = useState(false)
  const [state, formAction, pending] = useActionState<PEFormState, FormData>(upsertAction, {})

  useEffect(() => {
    if (state.success) setEditando(null)
  }, [state.success])

  const item = editando !== 'novo' ? editando : null

  async function handleDelete(id: string) {
    setDeletando(true)
    try { await deleteAction(id) } finally { setDeletando(false); setConfirmDelete(null) }
  }

  const gruposUnicos = Array.from(new Set(campos.filter(c => c.grupo).map(c => c.grupo)))

  function renderCampos(itemAtual: Item | null) {
    let ultimoGrupo: string | undefined = undefined
    return campos.map((c) => {
      const separator = c.grupo && c.grupo !== ultimoGrupo ? (
        <div key={`sep-${c.grupo}`} className="col-span-2 flex items-center gap-3 mt-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{c.grupo}</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
      ) : null
      ultimoGrupo = c.grupo
      const val = itemAtual ? String(itemAtual[c.name] ?? '') : ''
      const col = c.span === 'half' ? '' : 'col-span-2'

      if (c.type === 'checkbox') {
        return (
          <label key={c.name} className={`col-span-2 flex items-center gap-2.5 cursor-pointer`}>
            <input type="checkbox" name={c.name} defaultChecked={itemAtual ? Boolean(itemAtual[c.name]) : false}
              className="w-4 h-4 accent-[var(--brand)]" />
            <span className="text-sm font-medium text-[var(--ink)]">{c.label}</span>
          </label>
        )
      }
      const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all resize-none"
      const field = c.type === 'textarea' ? (
        <textarea name={c.name} defaultValue={val} required={c.required}
          placeholder={c.placeholder} rows={3} className={inputClass} />
      ) : (
        <input type={c.type === 'url' ? 'url' : c.type === 'date' ? 'date' : 'text'}
          name={c.name} defaultValue={val} required={c.required}
          placeholder={c.placeholder} className={inputClass} />
      )
      return (
        <div key={c.name} className={col}>
          {separator}
          <label className="block">
            <span className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
              {c.label}{c.required && <span className="text-red-400 ml-0.5">*</span>}
            </span>
            {field}
            {c.dica && <p className="text-xs text-[var(--muted)] mt-1">{c.dica}</p>}
          </label>
        </div>
      )
    })
  }

  return (
    <div>
      {/* Botão adicionar */}
      {editando === null && (
        <button
          onClick={() => setEditando('novo')}
          className="mb-6 flex items-center gap-2 bg-[var(--brand)] hover:opacity-90 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-opacity shadow-sm"
        >
          <span className="text-lg leading-none">+</span> {addLabel}
        </button>
      )}

      {/* Formulário novo item */}
      {editando === 'novo' && (
        <div className="bg-[var(--card-bg)] border-2 border-[var(--brand)] rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-[var(--ink)] text-base">{addLabel}</h3>
            <button onClick={() => setEditando(null)} className="text-[var(--muted)] hover:text-[var(--ink)] text-xl leading-none">×</button>
          </div>
          <form action={formAction}>
            <input type="hidden" name="site_id" value={siteId} />
            <div className="grid grid-cols-2 gap-4 mb-5">
              {renderCampos(null)}
            </div>
            {state.error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={pending}
                className="bg-[var(--brand)] hover:opacity-90 disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-opacity">
                {pending ? 'Salvando…' : 'Salvar'}
              </button>
              <button type="button" onClick={() => setEditando(null)}
                className="text-sm text-[var(--muted)] hover:text-[var(--ink)] px-4 py-2.5 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de itens */}
      {itens.length === 0 && editando === null ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
          <p className="text-[var(--muted)] text-sm">{emptyLabel}</p>
          <button onClick={() => setEditando('novo')}
            className="mt-4 text-sm font-semibold text-[var(--brand)] hover:opacity-80 transition-opacity">
            + Adicionar o primeiro
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {itens.map((it) => (
            <div key={it.id}
              className={`bg-[var(--card-bg)] border rounded-2xl overflow-hidden transition-all ${
                editando === it ? 'border-[var(--brand)] shadow-lg' : 'border-[var(--border)]'
              }`}>

              {/* Card colapsado */}
              {editando !== it && (
                <div className="flex items-center gap-4 p-4">
                  {/* Preview de imagem */}
                  {imagemKey && it[imagemKey] && (
                    <img src={String(it[imagemKey] ?? "")} alt=""
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-[var(--border)]" />
                  )}
                  {imagemKey && !it[imagemKey] && (
                    <div className="w-14 h-14 rounded-xl bg-[var(--off)] border border-[var(--border)] flex items-center justify-center text-xl flex-shrink-0">
                      🖼️
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--ink)] text-sm truncate">{String(it[nomeKey] ?? '—')}</p>
                    {colunas.filter(c => c.key !== nomeKey).map(c => (
                      <p key={c.key} className="text-xs text-[var(--muted)] truncate">
                        {c.label}: {String(c.render ? c.render(it[c.key]) : (it[c.key] ?? '—'))}
                      </p>
                    ))}
                  </div>

                  {/* Badge publicado */}
                  {'publicado' in it && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                      it.publicado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {it.publicado ? 'Publicado' : 'Rascunho'}
                    </span>
                  )}

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setEditando(it)}
                      className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--brand)] px-3 py-1.5 rounded-lg hover:bg-[var(--off)] transition-all">
                      Editar
                    </button>
                    {confirmDelete === it.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(it.id)} disabled={deletando}
                          className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                          {deletando ? '…' : 'Confirmar'}
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="text-xs text-[var(--muted)] px-2 py-1.5">
                          Não
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(it.id)}
                        className="text-xs text-[var(--muted)] hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Form de edição expandido inline */}
              {editando === it && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display font-bold text-[var(--ink)] text-base">Editando: {String(it[nomeKey])}</h3>
                    <button onClick={() => setEditando(null)} className="text-[var(--muted)] hover:text-[var(--ink)] text-xl leading-none">×</button>
                  </div>
                  <form action={formAction}>
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="site_id" value={siteId} />
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      {renderCampos(it)}
                    </div>
                    {state.error && editando === it && (
                      <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
                    )}
                    <div className="flex gap-3">
                      <button type="submit" disabled={pending}
                        className="bg-[var(--brand)] hover:opacity-90 disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-opacity">
                        {pending ? 'Salvando…' : 'Salvar alterações'}
                      </button>
                      <button type="button" onClick={() => setEditando(null)}
                        className="text-sm text-[var(--muted)] hover:text-[var(--ink)] px-4 py-2.5 transition-colors">
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
