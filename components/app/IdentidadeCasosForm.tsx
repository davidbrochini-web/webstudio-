'use client'

import { useActionState, useTransition, useState } from 'react'
import { updateIdentidadeCasos, type IdentidadeCasosFormState } from '@/app/app/(hub)/casos-esquecidos/editor/actions'
import { toggleSeoIndexavel } from '@/app/app/(hub)/projeto-especial/editor/actions'

export default function IdentidadeCasosForm({ siteId, businessName, tagline, seoIndexavel, readOnly }: {
  siteId: string
  businessName: string
  tagline: string | null
  seoIndexavel: boolean
  readOnly: boolean
}) {
  const [state, formAction, pending] = useActionState<IdentidadeCasosFormState, FormData>(updateIdentidadeCasos, {})
  const [indexavel, setIndexavel] = useState(seoIndexavel)
  const [confirmando, setConfirmando] = useState(false)
  const [togglePending, startTransition] = useTransition()

  function aplicarToggle(novo: boolean) {
    setIndexavel(novo)
    setConfirmando(false)
    startTransition(() => toggleSeoIndexavel(siteId, novo))
  }

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <form action={formAction} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
        <input type="hidden" name="site_id" value={siteId} />

        <div>
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
            Nome do site
          </label>
          <input name="business_name" required defaultValue={businessName} readOnly={readOnly}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
            Tagline (usada só no título/descrição pro Google, não aparece na página)
          </label>
          <input name="tagline" defaultValue={tagline ?? ''} readOnly={readOnly}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)]" />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-600">Salvo ✓</p>}

        {!readOnly && (
          <button type="submit" disabled={pending}
            className="self-start text-sm font-semibold text-white bg-[var(--brand)] rounded-xl px-6 py-2.5 disabled:opacity-50">
            {pending ? 'Salvando…' : 'Salvar'}
          </button>
        )}
      </form>

      <p className="text-xs text-[var(--muted)] -mt-2">
        O restante do conteúdo do site (bio do autor, textos de capa, hero) é prosa fixa —
        editar isso é trabalho de escrita, não de formulário. Fale comigo se quiser mudar
        algum texto específico.
      </p>

      {!readOnly && (
        <div className={`rounded-2xl border-2 p-5 transition-colors ${
          indexavel ? 'border-[var(--brand)] bg-[var(--brand)]/5' : 'border-[var(--border)] bg-[var(--off)]'
        }`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)] mb-1">Visibilidade no Google</p>
              <p className={`font-display font-extrabold text-lg ${indexavel ? 'text-emerald-600' : 'text-[var(--ink)]'}`}>
                {indexavel ? '🌍 Site visível no Google' : '🙈 Site oculto do Google'}
              </p>
            </div>

            {confirmando ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)] font-semibold">
                  {indexavel ? 'Ocultar de novo?' : 'Confirmar?'}
                </span>
                <button onClick={() => aplicarToggle(!indexavel)} disabled={togglePending}
                  className="text-xs font-bold text-white bg-[var(--brand)] rounded-full px-3 py-1.5 disabled:opacity-50">
                  Confirmar
                </button>
                <button onClick={() => setConfirmando(false)}
                  className="text-xs font-bold text-[var(--muted)] bg-white rounded-full px-3 py-1.5 border border-[var(--border)]">
                  Cancelar
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmando(true)} disabled={togglePending}
                className={`relative w-16 h-9 rounded-full flex-shrink-0 transition-colors disabled:opacity-50 ${indexavel ? 'bg-[var(--brand)]' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${indexavel ? 'right-1' : 'left-1'}`} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
