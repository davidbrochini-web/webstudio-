'use client'

import { useState } from 'react'
import EditableImage from '@/components/site-editor/EditableImage'
import { replaceFoto, addFotoToPool, deleteFotoFromPool } from '@/app/app/editor/actions'
import { uploadSiteFoto } from '@/lib/storage'

export interface Foto { id: string; url: string }

export default function FotoPoolSection({ siteId, fotos: fotosInit, readOnly, title, hint }: {
  siteId: string
  fotos: Foto[]
  readOnly: boolean
  title?: string
  hint?: string
}) {
  const [fotos, setFotos] = useState(fotosInit)
  const [addingFoto, setAddingFoto] = useState(false)
  // Nunca usar alert() nativo: fica silenciosamente bloqueado em alguns
  // navegadores (não abre e a função só retorna, sem erro) — erro visível
  // na tela em vez disso.
  const [fotoError, setFotoError] = useState<string | null>(null)

  return (
    <section className="px-6 py-10 sm:py-14 bg-[var(--off)]">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display font-bold text-lg text-[var(--ink)] mb-1">{title ?? 'Fotos do seu negócio'}</h2>
        <p className="text-sm text-[var(--muted)] mb-5">
          {hint ?? 'Essas fotos aparecem espalhadas pelo site e no feed de demonstração do Instagram.'}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {fotos.map((f, i) => (
            <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden group">
              <EditableImage
                siteId={siteId}
                src={f.url}
                onReplace={async url => { await replaceFoto(f.id, url); setFotos(fs => fs.map(x => (x.id === f.id ? { ...x, url } : x))) }}
                readOnly={readOnly}
                className="w-full h-full"
                badge={i === 0 ? 'principal' : undefined}
              />
              {!readOnly && (
                <button
                  onClick={async () => { await deleteFotoFromPool(f.id); setFotos(fs => fs.filter(x => x.id !== f.id)) }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Remover foto"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-semibold cursor-pointer hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors">
              {addingFoto ? 'Enviando...' : '+ Adicionar'}
              <input
                type="file" accept="image/*" className="hidden" disabled={addingFoto}
                onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setAddingFoto(true)
                  try {
                    const url = await uploadSiteFoto(siteId, file)
                    const created = await addFotoToPool(siteId, url)
                    if (created) setFotos(fs => [...fs, created])
                  } catch (err) {
                    setFotoError(err instanceof Error ? err.message : 'Erro ao enviar foto.')
                  } finally {
                    setAddingFoto(false)
                    e.target.value = ''
                  }
                }}
              />
            </label>
          )}
          {fotoError && <p className="col-span-full text-xs text-red-600">{fotoError}</p>}
        </div>
      </div>
    </section>
  )
}
