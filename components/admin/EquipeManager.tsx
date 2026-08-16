'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  criarMembroEquipe,
  atualizarNivelAcesso,
  removerMembroEquipe,
  type MembroEquipe,
} from '@/app/admin/equipe/actions'

const NIVEL_LABEL: Record<string, string> = {
  super_admin: 'Super admin',
  admin_nivel_1: 'Admin nível 1',
}

export default function EquipeManager({
  membros,
  meuId,
  souSuperAdmin,
}: {
  membros: MembroEquipe[]
  meuId: string
  souSuperAdmin: boolean
}) {
  const router = useRouter()
  const [formAberto, setFormAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nivel, setNivel] = useState<'super_admin' | 'admin_nivel_1'>('admin_nivel_1')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [removendoId, setRemovendoId] = useState<string | null>(null)

  async function handleCriar() {
    setErro(null)
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      return setErro('Preenche nome, e-mail e senha inicial.')
    }
    setSalvando(true)
    const result = await criarMembroEquipe({ nome, email, senhaInicial: senha, nivel_acesso: nivel })
    setSalvando(false)
    if (result.error) return setErro(result.error)
    setFormAberto(false)
    setNome(''); setEmail(''); setSenha(''); setNivel('admin_nivel_1')
    router.refresh()
  }

  async function handleMudarNivel(id: string, novo: 'super_admin' | 'admin_nivel_1') {
    await atualizarNivelAcesso(id, novo)
    router.refresh()
  }

  async function handleRemover(id: string) {
    setRemovendoId(id)
    const result = await removerMembroEquipe(id)
    setRemovendoId(null)
    if (result.error) alert(result.error) // pontual — fora do fluxo principal, sem tela de erro dedicada
    router.refresh()
  }

  return (
    <div>
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)] overflow-hidden mb-6">
        {membros.map(m => (
          <div key={m.id} className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="min-w-0">
              <p className="font-display font-bold text-sm text-[var(--ink)]">
                {m.nome} {m.id === meuId && <span className="text-xs font-normal text-[var(--muted)]">(você)</span>}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{m.email}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {m.must_change_password && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                  Aguardando 1º acesso
                </span>
              )}
              {souSuperAdmin ? (
                <select
                  value={m.nivel_acesso}
                  onChange={e => handleMudarNivel(m.id, e.target.value as 'super_admin' | 'admin_nivel_1')}
                  disabled={m.id === meuId}
                  className="text-xs font-semibold border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-[var(--card-bg)] disabled:opacity-50"
                >
                  <option value="super_admin">Super admin</option>
                  <option value="admin_nivel_1">Admin nível 1</option>
                </select>
              ) : (
                <span className="text-xs font-semibold text-[var(--muted)]">{NIVEL_LABEL[m.nivel_acesso]}</span>
              )}
              {souSuperAdmin && m.id !== meuId && (
                <button
                  onClick={() => handleRemover(m.id)}
                  disabled={removendoId === m.id}
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  {removendoId === m.id ? 'Removendo...' : 'Remover'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!souSuperAdmin && (
        <p className="text-sm text-[var(--muted)] mb-6">
          Você vê a equipe, mas só um super admin pode adicionar, remover ou trocar nível de acesso.
        </p>
      )}

      {souSuperAdmin && (
        formAberto ? (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 max-w-lg">
            <h3 className="font-display font-bold text-base text-[var(--ink)] mb-4">Novo membro</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Nome</label>
                <input value={nome} onChange={e => setNome(e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">E-mail de login</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                  className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Senha inicial (ela troca no 1º acesso)</label>
                <input value={senha} onChange={e => setSenha(e.target.value)} type="text"
                  className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--brand)]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Nível de acesso</label>
                <select value={nivel} onChange={e => setNivel(e.target.value as 'super_admin' | 'admin_nivel_1')}
                  className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm bg-[var(--card-bg)] focus:outline-none focus:border-[var(--brand)]">
                  <option value="admin_nivel_1">Admin nível 1 — vê tudo, não gerencia equipe</option>
                  <option value="super_admin">Super admin — acesso completo</option>
                </select>
              </div>
              {erro && <p className="text-sm text-red-500">{erro}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={handleCriar} disabled={salvando}
                  className="bg-[var(--dark)] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
                  {salvando ? 'Criando...' : 'Criar acesso'}
                </button>
                <button onClick={() => setFormAberto(false)}
                  className="text-sm font-semibold text-[var(--muted)] px-4 py-2.5 hover:text-[var(--ink)]">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => setFormAberto(true)}
            className="bg-[var(--dark)] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            + Novo membro da equipe
          </button>
        )
      )}
    </div>
  )
}
