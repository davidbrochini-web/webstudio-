'use client'

import { useState } from 'react'
import EditableImage from '@/components/site-editor/EditableImage'
import { uploadSiteFoto } from '@/lib/storage'
import { replaceFoto, addFotoToPool, deleteFotoFromPool } from '@/app/app/editor/actions'

interface Foto { id: string; url: string }

/** Galeria de fotos (pool compartilhado site_fotos) — aparece na
 *  página "A Clínica" do site. A primeira foto do pool também é a
 *  usada na seção Bem-vindo da home (editada ali). */
export default function GaleriaSectionEditor({ siteId, fotosIniciais, readOnly }: {
  siteId: string
  fotosIniciais: Foto[]
  readOnly: boolean
}) {
  const [fotos, setFotos] = useState(fotosIniciais)
  const [erro, setErro] = useState<string | null>(null)
  const [adicionando, setAdicionando] = useState(false)

  return (
    <section className="px-6 py-14 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-wide text-[#0EA5A0] mb-1">Página &ldquo;A Clínica&rdquo;</p>
        <h3 className="font-display font-bold text-xl text-[#0B2B3C] mb-6">Galeria de fotos</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {fotos.map((f, i) => (
            <div key={f.id} className="relative group">
              <EditableImage
                src={f.url} siteId={siteId} readOnly={readOnly}
                className="w-full aspect-square rounded-xl overflow-hidden"
                alt=""
                onReplace={async (url) => {
                  setErro(null)
                  try { await replaceFoto(f.id, url); setFotos(fs => fs.map(x => x.id === f.id ? { ...x, url } : x)) }
                  catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
                }}
              />
              {!readOnly && (
                <button
                  onClick={async () => {
                    try { await deleteFotoFromPool(f.id); setFotos(fs => fs.filter(x => x.id !== f.id)) }
                    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao remover.') }
                  }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white text-sm transition-colors flex items-center justify-center shadow-md hover:bg-red-600"
                  title="Remover foto"
                >×</button>
              )}
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-full">Também na Home</span>
              )}
            </div>
          ))}

          {!readOnly && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0EA5A0] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors text-slate-400 hover:text-[#0EA5A0]">
              <span className="text-2xl">{adicionando ? '…' : '+'}</span>
              <span className="text-xs font-semibold">Adicionar foto</span>
              <input
                type="file" accept="image/*" className="hidden" disabled={adicionando}
                onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setAdicionando(true); setErro(null)
                  try {
                    const url = await uploadSiteFoto(siteId, file)
                    const created = await addFotoToPool(siteId, url)
                    if (created) setFotos(fs => [...fs, created])
                  } catch (err) { setErro(err instanceof Error ? err.message : 'Erro ao enviar foto.') }
                  finally { setAdicionando(false); e.target.value = '' }
                }}
              />
            </label>
          )}
        </div>
        {erro && <p className="text-xs text-red-600 mt-3">{erro}</p>}
      </div>
    </section>
  )
}
