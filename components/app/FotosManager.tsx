'use client'

/* eslint-disable @next/next/no-img-element */

import { useActionState, useState } from 'react'
import { addFoto, deleteFoto, type FotoFormState } from '@/app/app/(hub)/site/fotos/actions'

export interface Foto {
  id: string
  url: string
}

function AddFotoForm({ siteId }: { siteId: string }) {
  const [state, formAction, pending] = useActionState<FotoFormState, FormData>(addFoto, {})
  return (
    <form action={formAction} className="bg-[var(--off)] rounded-xl p-4 flex flex-col sm:flex-row gap-3 mb-5">
      <input type="hidden" name="site_id" value={siteId} />
      <input
        name="url"
        required
        placeholder="https://... (URL da foto)"
        className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
      />
      <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
        {pending ? 'Adicionando...' : '+ Adicionar foto'}
      </button>
      {state.error && <p className="text-xs text-red-600 sm:self-center">{state.error}</p>}
    </form>
  )
}

export default function FotosManager({ siteId, fotos, readOnly }: { siteId: string; fotos: Foto[]; readOnly: boolean }) {
  const [erro, setErro] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setErro(null)
    try {
      await deleteFoto(id)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover.')
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
      <p className="text-xs text-[var(--muted)] mb-4">
        A primeira foto da lista é usada como foto principal do site (hero). As demais aparecem
        no feed de demonstração, ciclando entre elas.
      </p>

      {!readOnly && <AddFotoForm siteId={siteId} />}
      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {fotos.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhuma foto cadastrada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fotos.map((f, i) => (
            <div key={f.id} className="relative rounded-xl overflow-hidden aspect-square bg-[var(--off)] group">
              <img src={f.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-white bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
                  principal
                </span>
              )}
              {!readOnly && (
                <button
                  onClick={() => handleDelete(f.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remover foto"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
