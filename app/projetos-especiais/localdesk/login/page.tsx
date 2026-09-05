'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Login próprio do projeto especial LocalDesk.
 * Exibe campos de "Usuário" + "Senha" (sem expor email técnico).
 * Mapa: usuário "localdesk" (case-insensitive) → contato@localdesk.local
 * Após login, vai direto pra /app/localdesk (painel do cliente).
 */

const USUARIO_MAP: Record<string, string> = {
  localdesk: 'contato@localdesk.local',
}

export default function LoginPage() {
  const router = useRouter()
  const [usuario, setUsuario]   = useState('')
  const [senha, setSenha]       = useState('')
  const [erro, setErro]         = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
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

    router.push('/app/localdesk')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F6F8', fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* Topo com identidade da LocalDesk */}
      <div className="bg-[#10151F] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="font-extrabold text-white text-base leading-tight">LocalDesk</p>
          <p className="text-[#12B886] text-[10px] font-bold uppercase tracking-widest">
            Área do Painel
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#1E4FD8]/20 flex items-center justify-center">
          <span className="text-[#1E4FD8] text-lg">🖥️</span>
        </div>
      </div>

      {/* Formulário centralizado */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#DDE1E7] overflow-hidden">

            {/* Cabeçalho do card */}
            <div className="bg-gradient-to-r from-[#10151F] to-[#1a2233] px-7 pt-8 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#1E4FD8]/20 flex items-center justify-center mb-4 border border-[#1E4FD8]/30">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1E4FD8" strokeWidth="1.8" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                </svg>
              </div>
              <h1 className="text-white font-bold text-xl leading-tight">Entrar no Painel</h1>
              <p className="text-white/60 text-sm mt-1">Gerencie o conteúdo do seu site</p>
            </div>

            {/* Campos */}
            <div className="px-7 py-7">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                <div>
                  <label className="block text-xs font-semibold text-[#545C6B] uppercase tracking-wider mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-[#DDE1E7] text-[#10151F] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4FD8] focus:border-transparent transition-all placeholder:text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#545C6B] uppercase tracking-wider mb-2">
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
                      className="w-full px-4 py-3 rounded-xl border border-[#DDE1E7] text-[#10151F] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4FD8] focus:border-transparent transition-all pr-11 placeholder:text-slate-300"
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

                {/* Erro */}
                {erro && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                    </svg>
                    {erro}
                  </div>
                )}

                {/* Botão */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#10151F] hover:bg-[#1E4FD8] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide mt-1"
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

          <p className="text-center text-xs text-[#545C6B] mt-6">
            Painel exclusivo · Acesso restrito
          </p>
        </div>
      </div>
    </div>
  )
}
