'use client'

/**
 * Rota compartilhada da plataforma (igual /primeiro-acesso — ver
 * proxy.ts, precisa estar na lista de exclusão do rewrite de domínio
 * próprio). Destino do link de "Esqueci minha senha" de qualquer
 * login (hoje só dentista-joao usa, mas serve pra qualquer projeto
 * futuro).
 *
 * O link de recuperação (gerado via Auth Admin API, ver
 * app/projetos-especiais/dentista-joao/login/actions.ts) chega aqui
 * com o token de recuperação na URL. O client do Supabase processa
 * isso sozinho ao carregar a página (detectSessionInUrl) e dispara o
 * evento PASSWORD_RECOVERY — só then é seguro deixar a pessoa definir
 * a senha nova.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Status = 'verificando' | 'pronto' | 'invalido' | 'salvando' | 'concluido'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('verificando')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Se o link já processou e já existe sessão de recuperação quando
    // o componente monta, getSession já resolve — não precisa esperar
    // o evento nesse caso.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus('pronto')
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('pronto')
    })

    // Link inválido/expirado nunca dispara PASSWORD_RECOVERY nem cria
    // sessão — depois de um tempo razoável, avisa em vez de deixar a
    // pessoa esperando um spinner pra sempre.
    const timeout = setTimeout(() => {
      setStatus(s => (s === 'verificando' ? 'invalido' : s))
    }, 5000)

    return () => {
      listener.subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (novaSenha.length < 8) {
      setErro('A nova senha precisa ter no mínimo 8 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setStatus('salvando')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      setErro(`Erro ao trocar senha: ${error.message}`)
      setStatus('pronto')
      return
    }

    // Idempotente e defensivo: se por acaso essa conta ainda tivesse
    // must_change_password=true (ex: senha provisória nunca trocada
    // via /primeiro-acesso), limpa aqui também.
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)
    }

    setStatus('concluido')
    setTimeout(() => {
      router.push('/login')
      router.refresh()
    }, 2500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--off)] px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/brand/omnidesign-icon-rain.png"
            alt=""
            width={95}
            height={100}
            className="h-24 w-auto mx-auto mb-2"
          />
          <span className="font-display font-bold text-2xl text-[var(--ink)]">omnidesign</span>
          <p className="text-sm text-[var(--muted)] mt-2">Redefinir senha</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
          {status === 'verificando' && (
            <p className="text-sm text-[var(--muted)] text-center py-6">Verificando o link…</p>
          )}

          {status === 'invalido' && (
            <div className="flex flex-col gap-3 text-center">
              <p className="text-sm text-red-500">
                Esse link não é mais válido — pode ter expirado (1 hora) ou já ter sido usado.
              </p>
              <p className="text-xs text-[var(--muted)]">
                Volte pra tela de login e clique em &quot;Esqueci minha senha&quot; de novo pra receber um link novo.
              </p>
            </div>
          )}

          {status === 'concluido' && (
            <p className="text-sm text-[var(--ink)] text-center py-6">
              Senha alterada! Redirecionando pro login…
            </p>
          )}

          {(status === 'pronto' || status === 'salvando') && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <p className="font-display font-bold text-[var(--ink)] mb-1">Crie sua nova senha</p>
                <input
                  type="password"
                  placeholder="Nova senha (mín. 8 caracteres)"
                  required
                  minLength={8}
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)] mb-2"
                />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  required
                  minLength={8}
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
                />
              </div>

              {erro && <p className="text-xs text-red-500">{erro}</p>}

              <button
                type="submit"
                disabled={status === 'salvando'}
                className="grad-bg text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {status === 'salvando' ? 'Salvando...' : 'Trocar senha e entrar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
