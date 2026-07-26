'use client'

import { useActionState } from 'react'
import { updateSiteIdentity, type SiteIdentityFormState } from '@/app/app/site/actions'

interface SiteData {
  id: string
  business_name: string
  tagline: string
  hero_title: string
  hero_sub: string
  cta_label: string
  whatsapp: string | null
  instagram_handle: string | null
}

function Field({ label, name, defaultValue, readOnly, textarea, placeholder }: {
  label: string
  name: string
  defaultValue?: string | null
  readOnly?: boolean
  textarea?: boolean
  placeholder?: string
}) {
  const className = "w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-60 disabled:cursor-not-allowed"
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">{label}</label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue ?? ''} disabled={readOnly} rows={3} placeholder={placeholder} className={className} />
      ) : (
        <input name={name} defaultValue={defaultValue ?? ''} disabled={readOnly} placeholder={placeholder} className={className} />
      )}
    </div>
  )
}

export default function SiteIdentityForm({ site, readOnly }: { site: SiteData; readOnly: boolean }) {
  const [state, formAction, pending] = useActionState<SiteIdentityFormState, FormData>(updateSiteIdentity, {})

  return (
    <form action={formAction} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      <input type="hidden" name="site_id" value={site.id} />

      <Field label="Nome do negócio" name="business_name" defaultValue={site.business_name} readOnly={readOnly} />
      <Field label="Tagline" name="tagline" defaultValue={site.tagline} readOnly={readOnly} placeholder="Ex: Clínica odontológica" />
      <Field label="Título do hero" name="hero_title" defaultValue={site.hero_title} readOnly={readOnly} />
      <Field label="Subtítulo do hero" name="hero_sub" defaultValue={site.hero_sub} readOnly={readOnly} textarea />
      <Field label="Texto do botão principal" name="cta_label" defaultValue={site.cta_label} readOnly={readOnly} placeholder="Ex: Agendar avaliação" />
      <Field label="WhatsApp (só números, com DDD e 55)" name="whatsapp" defaultValue={site.whatsapp} readOnly={readOnly} placeholder="5511999999999" />
      <Field label="Instagram (com @)" name="instagram_handle" defaultValue={site.instagram_handle} readOnly={readOnly} placeholder="@seunegocio" />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-[var(--green)]">Salvo!</p>}

      {!readOnly && (
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-lg grad-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 self-start"
        >
          {pending ? 'Salvando...' : 'Salvar alterações'}
        </button>
      )}
    </form>
  )
}
