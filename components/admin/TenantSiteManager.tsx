'use client'

import { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'
import { niches } from '@/lib/templates'
import { createSiteFromTemplate, toggleSitePublish, type SiteFormState } from '@/app/admin/tenants/[id]/site-actions'

interface SiteInfo {
  id: string
  slug: string
  business_name: string
  status: 'rascunho' | 'publicado'
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function CreateSiteForm({ tenantId }: { tenantId: string }) {
  const [state, formAction, pending] = useActionState<SiteFormState, FormData>(createSiteFromTemplate, {})
  const [slug, setSlug] = useState('')
  const [slugEditedManually, setSlugEditedManually] = useState(false)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="tenant_id" value={tenantId} />

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Template de base</label>
        <select
          name="niche_slug"
          required
          onChange={e => {
            if (!slugEditedManually) {
              const niche = niches.find(n => n.slug === e.target.value)
              if (niche) setSlug(slugify(niche.businessName))
            }
          }}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
        >
          <option value="">Selecione...</option>
          {niches.map(n => (
            <option key={n.slug} value={n.slug}>{n.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1">
          Slug (aparece em /sandbox/<b>slug</b>)
        </label>
        <input
          name="slug"
          required
          value={slug}
          onChange={e => { setSlug(slugify(e.target.value)); setSlugEditedManually(true) }}
          placeholder="sorrir-odonto"
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm font-mono"
        />
      </div>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 self-start"
      >
        {pending ? 'Criando site...' : 'Criar site a partir do template'}
      </button>
    </form>
  )
}

function ExistingSite({ tenantId, site }: { tenantId: string; site: SiteInfo }) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const publicado = site.status === 'publicado'

  function handleToggle() {
    setErro(null)
    startTransition(async () => {
      try {
        await toggleSitePublish(site.id, tenantId, !publicado)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao atualizar status do site.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">{site.business_name}</p>
          <p className="text-xs text-[var(--muted)] font-mono">/sandbox/{site.slug}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${publicado ? 'bg-green-50 text-[var(--green)]' : 'bg-amber-50 text-amber-600'}`}>
          {publicado ? 'publicado' : 'rascunho'}
        </span>
      </div>

      {erro && <p className="text-xs text-red-600">{erro}</p>}

      <div className="flex gap-2">
        <Link
          href={`/sandbox/${site.slug}`}
          target="_blank"
          className="text-xs font-semibold text-[var(--brand)] px-3 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--off)] transition-colors"
        >
          Ver site →
        </Link>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] px-3 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--off)] transition-colors disabled:opacity-50"
        >
          {publicado ? 'Voltar pra rascunho' : 'Publicar'}
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        O cliente edita o conteúdo pelo próprio painel dele, em /app/site.
      </p>
    </div>
  )
}

export default function TenantSiteManager({ tenantId, site }: { tenantId: string; site: SiteInfo | null }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
      <h2 className="font-display font-bold text-base text-[var(--ink)] mb-4">Site</h2>
      {site ? <ExistingSite tenantId={tenantId} site={site} /> : <CreateSiteForm tenantId={tenantId} />}
    </div>
  )
}
