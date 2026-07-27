'use client'

import { useActionState } from 'react'
import { atualizarConfig, type PEFormState } from '@/app/app/(hub)/projeto-especial/actions'

interface Site {
  id: string
  business_name: string
  tagline: string | null
  hero_title: string | null
  hero_sub: string | null
  hero_imagem_url: string | null
  telefone: string | null
  whatsapp: string | null
  instagram_handle: string | null
  endereco: string | null
  status: string
}

export default function ConfigForm({ site, readOnly }: { site: Site; readOnly: boolean }) {
  const [state, formAction, pending] = useActionState<PEFormState, FormData>(atualizarConfig, {})

  if (readOnly) {
    return <p className="text-sm text-[var(--muted)]">Só owner/admin pode editar as configurações do site.</p>
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-xl">
      <input type="hidden" name="site_id" value={site.id} />

      <label className="text-sm font-semibold text-[var(--ink)]">
        Status do site
        <select name="status" defaultValue={site.status} className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm">
          <option value="rascunho">Rascunho (não visível ao público)</option>
          <option value="publicado">Publicado</option>
        </select>
      </label>

      <input name="business_name" required defaultValue={site.business_name} placeholder="Nome do negócio" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm" />
      <input name="tagline" defaultValue={site.tagline ?? ''} placeholder="Texto institucional (Sobre / A Clínica)" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm" />
      <input name="hero_title" defaultValue={site.hero_title ?? ''} placeholder="Título de destaque na home" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm" />
      <input name="hero_sub" defaultValue={site.hero_sub ?? ''} placeholder="Subtítulo na home" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm" />
      <input name="hero_imagem_url" defaultValue={site.hero_imagem_url ?? ''} placeholder="URL da foto de destaque (hero)" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm" />

      <div className="grid grid-cols-2 gap-3">
        <input name="telefone" defaultValue={site.telefone ?? ''} placeholder="Telefone" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm" />
        <input name="whatsapp" defaultValue={site.whatsapp ?? ''} placeholder="WhatsApp (só números)" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm" />
      </div>
      <input name="instagram_handle" defaultValue={site.instagram_handle ?? ''} placeholder="Instagram (@usuario) — só ícone/link, sem feed automático" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm" />
      <textarea name="endereco" defaultValue={site.endereco ?? ''} placeholder="Endereço completo" rows={2} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm resize-none" />

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-[var(--green)]">Salvo!</p>}

      <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 self-start">
        {pending ? 'Salvando...' : 'Salvar configurações'}
      </button>
    </form>
  )
}
