'use client'

import { useState, useTransition } from 'react'
import EditableTextoCE from './EditableTextoCE'
import EditableImage from '@/components/site-editor/EditableImage'
import { texto, type TextosCustomizados } from '@/lib/textos-customizados'
import { updateTextoCustomizadoCE } from '@/app/app/(hub)/colegio-elite/actions'

const BASE_URL = 'https://evlrrtwobsegggvykphr.supabase.co/storage/v1/object/public/site-fotos/colegio-elite/b9b5f561-f53d-4f8d-b932-3696e1c30d96'

const ITENS = [
  {
    prefixo: 'topo_webcanal',
    titulo: 'WebCanal da Escola',
    imgPadrao: `${BASE_URL}/webcanal-escola.png`,
    urlPadrao: 'https://webcanaldaescola.com.br/100/',
  },
  {
    prefixo: 'topo_aluno',
    titulo: 'Área do Aluno',
    imgPadrao: `${BASE_URL}/btn-area-aluno.png`,
    urlPadrao: 'http://www.colegioelite.g12.br/',
  },
] as const

function VisibilidadeMini({ siteId, chave, visivel }: { siteId: string; chave: string; visivel: boolean }) {
  const [estado, setEstado] = useState(visivel)
  const [pending, startTransition] = useTransition()

  function alternar() {
    const novo = !estado
    setEstado(novo)
    startTransition(() => updateTextoCustomizadoCE(siteId, chave, novo ? 'true' : 'false'))
  }

  return (
    <button type="button" disabled={pending} onClick={alternar}
      className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors disabled:opacity-50 ${
        estado ? 'bg-[var(--ce-primary)]/20 text-[var(--ce-primary)]' : 'bg-slate-200 text-slate-400'
      }`}>
      {estado ? '👁️ visível' : '🙈 oculto'}
    </button>
  )
}

/** Os 2 botões-imagem fixos do topo do site (sistemas de terceiros:
 *  WebCanal da Escola, Área do Aluno). Imagem, link e visibilidade —
 *  tudo editável, caso a escola troque de sistema ou queira tirar do
 *  ar algum dos dois. Gravado em textos_customizados. */
export default function TopoLinksSectionEditor({ siteId, textos, readOnly, defaultExpanded }: {
  siteId: string
  textos: TextosCustomizados | null | undefined
  readOnly: boolean
  defaultExpanded?: boolean
}) {
  const [expandido, setExpandido] = useState(defaultExpanded ?? false)

  if (readOnly) return null

  if (!expandido) {
    return (
      <div className="bg-slate-100 px-5 sm:px-6 py-2 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <button type="button" onClick={() => setExpandido(true)}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5">
            <span>▸</span> Botões do topo (WebCanal da Escola / Área do Aluno)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-100 px-5 sm:px-6 py-4 border-b border-slate-200">
      <div className="max-w-4xl mx-auto">
        <button type="button" onClick={() => setExpandido(false)}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5 mb-3">
          <span>▾</span> Botões do topo
        </button>
        <p className="text-[11px] text-slate-400 mb-3 max-w-lg">
          Esses 2 botões linkam pra sistemas de terceiros (não fazem parte deste site). Dá pra trocar a imagem, o link, ou ocultar caso a escola não use mais algum deles.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ITENS.map(item => {
            const chaveVisivel = `${item.prefixo}_visivel`
            const chaveUrl = `${item.prefixo}_url`
            const chaveImg = `${item.prefixo}_img`
            const visivel = texto(textos, chaveVisivel, 'true') !== 'false'
            return (
              <div key={item.prefixo} className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{item.titulo}</p>
                  <VisibilidadeMini siteId={siteId} chave={chaveVisivel} visivel={visivel} />
                </div>
                <EditableImage
                  src={texto(textos, chaveImg, item.imgPadrao)}
                  siteId={siteId} readOnly={readOnly} aspect={200 / 75}
                  className="w-full h-14 bg-slate-50 rounded-lg border border-dashed border-slate-200 mb-2"
                  alt={item.titulo}
                  onReplace={async (url) => { await updateTextoCustomizadoCE(siteId, chaveImg, url) }}
                />
                <label className="block">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Link (URL completa)</span>
                  <EditableTextoCE siteId={siteId} chave={chaveUrl} readOnly={readOnly}
                    valor={texto(textos, chaveUrl, item.urlPadrao)} as="span"
                    className="block text-xs text-slate-600 font-mono mt-1" />
                </label>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
