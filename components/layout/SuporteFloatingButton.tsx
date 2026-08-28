'use client'

import { useActionState, useRef, useState, useEffect } from 'react'
import { enviarChamadoSuporte, type SuporteFormState } from '@/app/app/(hub)/suporte-actions'

export default function SuporteFloatingButton() {
  const [aberto, setAberto] = useState(false)
  const [tipo, setTipo] = useState<'erro' | 'novo_escopo'>('erro')
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState<SuporteFormState, FormData>(enviarChamadoSuporte, { ok: false })
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setNomeArquivo(null)
      const t = setTimeout(() => setAberto(false), 2000)
      return () => clearTimeout(t)
    }
  }, [state.ok])

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        aria-label="Suporte"
        className="cursor-pointer fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-transform hover:scale-105"
        style={{ background: 'var(--brand2, #0EA5A0)' }}
      >
        🎧
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
          onClick={() => setAberto(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <p className="font-display font-bold text-slate-800">Falar com o suporte</p>
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="cursor-pointer text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {state.ok ? (
              <div className="px-6 py-10 text-center">
                <p className="text-3xl mb-3">✅</p>
                <p className="font-bold text-slate-800 mb-1">Chamado enviado!</p>
                <p className="text-sm text-slate-500">A gente já foi avisado e vai te responder em breve.</p>
              </div>
            ) : (
              <form ref={formRef} action={formAction} className="px-6 py-6 flex flex-col gap-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo('erro')}
                    className={`cursor-pointer flex-1 text-sm font-bold px-3 py-2.5 rounded-xl border-2 transition-colors ${
                      tipo === 'erro' ? 'border-[var(--dj-primary,#0EA5A0)] text-[var(--dj-primary,#0EA5A0)] bg-[var(--dj-primary,#0EA5A0)]/5' : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    🐞 Achei um erro
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('novo_escopo')}
                    className={`cursor-pointer flex-1 text-sm font-bold px-3 py-2.5 rounded-xl border-2 transition-colors ${
                      tipo === 'novo_escopo' ? 'border-[var(--dj-primary,#0EA5A0)] text-[var(--dj-primary,#0EA5A0)] bg-[var(--dj-primary,#0EA5A0)]/5' : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    💡 Tenho uma ideia
                  </button>
                </div>
                <input type="hidden" name="tipo" value={tipo} />

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">
                    {tipo === 'erro' ? 'O que aconteceu?' : 'Conta sua ideia'}
                  </label>
                  <textarea
                    name="mensagem"
                    rows={4}
                    required
                    minLength={5}
                    placeholder={tipo === 'erro' ? 'Ex: quando clico em Salvar na aba Blog, dá um erro na tela...' : 'Ex: seria legal ter um botão pra...'}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-[var(--dj-primary,#0EA5A0)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Print da tela (opcional)</label>
                  <label className="cursor-pointer flex items-center justify-center gap-2 text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-xl px-3.5 py-3 hover:border-[var(--dj-primary,#0EA5A0)] transition-colors">
                    📎 {nomeArquivo ?? 'Escolher imagem (JPG ou PNG)'}
                    <input
                      type="file"
                      name="imagem"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={e => setNomeArquivo(e.target.files?.[0]?.name ?? null)}
                    />
                  </label>
                </div>

                {state.error && <p className="text-sm text-red-600">{state.error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 text-sm font-bold px-4 py-2.5 rounded-full text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--dj-primary, #0EA5A0)' }}
                >
                  {pending ? 'Enviando...' : 'Enviar pro suporte'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
