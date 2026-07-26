'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    // Descobre se é super-admin pra saber pra onde mandar
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', data.user.id)
      .single()

    const redirect = searchParams.get('redirect')
    const destino = profile?.is_super_admin ? '/admin' : (redirect && redirect.startsWith('/app') ? redirect : '/app')

    router.push(destino)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--off)] px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display font-extrabold text-2xl grad-text">webstudio</span>
          <p className="text-sm text-[var(--muted)] mt-2">Entre com sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--ink)] mb-1.5" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--purple)]"
              placeholder="voce@email.com"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-[var(--ink)] mb-1.5" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--purple)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg grad-bg text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
