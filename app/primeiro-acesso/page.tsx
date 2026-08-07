'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { uploadPerfilFoto } from '@/lib/storage-perfil'
import { concluirPrimeiroAcesso, type PrimeiroAcessoState } from './actions'

export default function PrimeiroAcessoPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<PrimeiroAcessoState, FormData>(concluirPrimeiroAcesso, {})

  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoUrl, setFotoUrl] = useState('')
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [erroFoto, setErroFoto] = useState<string | null>(null)

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErroFoto('Envie um arquivo de imagem (JPG, PNG, WEBP...).')
      return
    }
    setErroFoto(null)
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))

    setUploadingFoto(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sessão expirada.')
      const url = await uploadPerfilFoto(user.id, file)
      setFotoUrl(url)
    } catch (err) {
      setErroFoto(err instanceof Error ? err.message : 'Erro ao enviar foto.')
      setFotoFile(null)
      setFotoPreview(null)
    } finally {
      setUploadingFoto(false)
    }
  }

  useEffect(() => {
    if (!state.success) return
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
      router.push(profile?.is_super_admin ? '/admin' : '/app')
      router.refresh()
    })()
  }, [state.success, router])

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
          <p className="text-sm text-[var(--muted)] mt-2">Primeiro acesso — vamos configurar sua conta</p>
        </div>

        <form action={formAction} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
          <div>
            <p className="font-display font-bold text-[var(--ink)] mb-1">Crie sua senha</p>
            <p className="text-xs text-[var(--muted)] mb-3">A senha provisória não pode continuar sendo usada.</p>
            <input
              type="password"
              name="nova_senha"
              placeholder="Nova senha (mín. 8 caracteres)"
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)] mb-2"
            />
            <input
              type="password"
              name="confirmar_senha"
              placeholder="Confirmar nova senha"
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div className="pt-2 border-t border-[var(--border)]">
            <p className="font-display font-bold text-[var(--ink)] mb-1">Foto de perfil</p>
            <p className="text-xs text-[var(--muted)] mb-3">
              Opcional — vamos usar pra montar a assinatura de e-mail da equipe mais pra frente. Pode pular se quiser.
            </p>
            <div className="flex items-center gap-3">
              {fotoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoPreview} alt="" className="w-14 h-14 rounded-full object-cover border border-[var(--border)]" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[var(--off)] border border-dashed border-[var(--border)] flex items-center justify-center text-lg">
                  🙂
                </div>
              )}
              <label className="flex-1 text-center cursor-pointer text-sm font-semibold text-[var(--brand)] border border-[var(--border)] rounded-xl py-2.5 hover:border-[var(--brand)] transition-colors">
                {uploadingFoto ? 'Enviando...' : fotoFile ? 'Trocar foto' : 'Escolher foto'}
                <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} disabled={uploadingFoto} />
              </label>
            </div>
            {erroFoto && <p className="text-xs text-red-500 mt-2">{erroFoto}</p>}
            <input type="hidden" name="foto_url" value={fotoUrl} />
          </div>

          {state.error && <p className="text-xs text-red-500">{state.error}</p>}

          <button
            type="submit"
            disabled={pending || uploadingFoto}
            className="grad-bg text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {pending ? 'Salvando...' : 'Concluir e entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
