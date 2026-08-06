'use client'

import { useState, useTransition } from 'react'
import { toggleSecaoVisivel } from '@/app/app/(hub)/projeto-especial/editor/actions'

type Campo = 'secao_tratamentos_visivel' | 'secao_cursos_visivel' | 'secao_equipe_visivel'
  | 'secao_faq_visivel' | 'secao_artigos_visivel'

// Oculta a seção inteira (menu + prévia na Home + página dedicada) sem
// apagar nenhum conteúdo — pra dar tempo de alimentar uma área aos
// poucos sem ela ficar exposta no site enquanto isso.
export default function VisibilidadeSecaoToggle({ siteId, campo, visivel, readOnly }: {
  siteId: string
  campo: Campo
  visivel: boolean
  readOnly: boolean
}) {
  const [estado, setEstado] = useState(visivel)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  if (readOnly) return null

  function alternar() {
    const novo = !estado
    const anterior = estado
    setErro(null)
    setEstado(novo) // otimista — mas revertido abaixo se a gravação falhar
    startTransition(async () => {
      try {
        await toggleSecaoVisivel(siteId, campo, novo)
      } catch (e) {
        setEstado(anterior)
        setErro(e instanceof Error ? e.message : 'Não foi possível salvar. Tente de novo.')
      }
    })
  }

  return (
    <div className={`flex items-center justify-between gap-3 mb-6 rounded-xl px-4 py-3 border-2 transition-colors ${
      estado ? 'border-[var(--dj-primary)]/30 bg-[var(--dj-primary)]/5' : 'border-amber-400 bg-amber-50'
    }`}>
      <span className={`text-sm font-bold ${estado ? 'text-[var(--dj-secondary)]' : 'text-amber-700'}`}>
        {estado ? '👁️ Visível no site' : '🙈 Oculto — só aparece pra você aqui no painel'}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={alternar}
        title={estado ? 'Ocultar esta seção do site' : 'Tornar esta seção visível no site'}
        className={`relative w-14 h-8 rounded-full flex-shrink-0 transition-colors disabled:opacity-50 ${estado ? 'bg-[var(--dj-primary)]' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${estado ? 'right-1' : 'left-1'}`} />
      </button>
      {erro && (
        <p className="absolute mt-16 text-xs text-red-600 bg-white px-2 py-1 rounded shadow-sm">{erro}</p>
      )}
    </div>
  )
}
