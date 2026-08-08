'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Login próprio do projeto especial colegio-elite. Campo "Usuário"
 * (sem expor e-mail técnico) — mesmo padrão do dentista-joao.
 * Usuário "colegio" (case-insensitive) → colegio@colegioelite.local.
 */
const USUARIO_MAP: Record<string, string> = {
  colegio: 'colegio@colegioelite.local',
  elite: 'colegio@colegioelite.local',
  lukas: 'colegio@colegioelite.local',
  lucas: 'colegio@colegioelite.local',
}

export default function LoginPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSenha, setShowSenha] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setLoading(true)

    const email = USUARIO_MAP[usuario.trim().toLowerCase()]
    if (!email) {
      setErro('Usuário não encontrado.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('Usuário ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/app/colegio-elite')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      <div className="bg-[#0F1F3D] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="font-extrabold text-white text-base leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Colégio Elite
          </p>
          <p className="text-[#1B3A6B] text-[10px] font-bold uppercase tracking-widest">
            Área do Painel
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#1B3A6B]/30 flex items-center justify-center">
          <span className="text-white text-lg">🎓</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0F1F3D] to-[#152a52] px-7 pt-8 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h1 className="text-white font-bold text-xl leading-tight">Entrar no Painel</h1>
              <p className="text-white/60 text-sm mt-1">Gerencie o conteúdo do seu site</p>
            </div>

            <div className="px-7 py-7">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Usuário
                  </label>
                  <input
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    required
                    value={usuario}
                    onChange={e => setUsuario(e.target.value)}
                    placeholder="Seu usuário"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition-all placeholder:text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showSenha ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition-all pr-11 placeholder:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showSenha ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {erro && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                    </svg>
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0F1F3D] hover:bg-[#1B3A6B] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide mt-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Entrando…
                    </span>
                  ) : 'Entrar'}
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Painel exclusivo · Acesso restrito
          </p>
        </div>
      </div>
    </div>
  )
}
