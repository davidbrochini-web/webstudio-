'use client'

import { useState, useTransition } from 'react'
import { toggleSeoIndexavelCE } from '@/app/app/(hub)/colegio-elite/actions'

export default function SeoIndexToggle({ siteId, indexavel }: { siteId: string; indexavel: boolean }) {
  const [estado, setEstado] = useState(indexavel)
  const [confirmando, setConfirmando] = useState(false)
  const [pending, startTransition] = useTransition()

  function aplicar(novo: boolean) {
    setEstado(novo)
    setConfirmando(false)
    startTransition(() => toggleSeoIndexavelCE(siteId, novo))
  }

  return (
    <div className={`rounded-2xl border-2 p-5 transition-colors ${
      estado ? 'border-[var(--ce-primary)] bg-[var(--ce-primary)]/5' : 'border-slate-300 bg-[var(--off)]'
    }`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)] mb-1">Visibilidade no Google</p>
          <p className={`font-display font-extrabold text-lg ${estado ? 'text-[#0B7A73]' : 'text-[var(--ink)]'}`}>
            {estado ? '🌍 Site visível no Google' : '🙈 Site oculto do Google'}
          </p>
        </div>

        {confirmando ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)] font-semibold">
              {estado ? 'Ocultar de novo?' : 'Confirmar que já pode ir pro Google?'}
            </span>
            <button onClick={() => aplicar(!estado)} disabled={pending}
              className="text-xs font-bold text-white bg-[var(--brand)] rounded-full px-3 py-1.5 disabled:opacity-50">
              Confirmar
            </button>
            <button onClick={() => setConfirmando(false)}
              className="text-xs font-bold text-[var(--muted)] bg-white rounded-full px-3 py-1.5 border border-[var(--border)]">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmando(true)}
            disabled={pending}
            className={`relative w-16 h-9 rounded-full flex-shrink-0 transition-colors disabled:opacity-50 ${estado ? 'bg-[var(--ce-primary)]' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${estado ? 'right-1' : 'left-1'}`} />
          </button>
        )}
      </div>

      <p className="text-xs text-[var(--muted)] mt-3 leading-relaxed">
        {estado
          ? 'O Google já pode indexar o site. Se precisar corrigir algo com urgência, pode ocultar de novo a qualquer momento.'
          : 'Enquanto estiver oculto, o Google não indexa nenhuma página do site. Assim que o conteúdo estiver pronto de verdade, pode ligar aqui.'}
      </p>
    </div>
  )
}
