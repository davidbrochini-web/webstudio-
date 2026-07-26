import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import SiteSubNav from '@/components/app/SiteSubNav'
import SiteIdentityForm from '@/components/app/SiteIdentityForm'

export default async function SiteIdentityPage() {
  const info = await getCurrentTenant()

  if (!info) {
    return <p className="text-sm text-[var(--muted)]">Sua conta não está vinculada a nenhuma empresa.</p>
  }
  if (!info.siteId) {
    return (
      <div>
        <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
        <p className="text-sm text-[var(--muted)]">Seu site ainda não foi criado. Fale com a omnidesign.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, slug, business_name, tagline, hero_title, hero_sub, cta_label, whatsapp, instagram_handle, status')
    .eq('id', info.siteId)
    .single()

  if (!site) return null

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">Meu site</h1>
        <a
          href={`/sandbox/${site.slug}`}
          target="_blank"
          className="text-xs font-semibold text-[var(--brand)] px-3 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--off)] transition-colors"
        >
          Ver site →
        </a>
      </div>
      <p className="text-sm text-[var(--muted)] mb-6">
        /sandbox/{site.slug} · status: {site.status}
        {!podeEditar && ' · você só tem acesso de leitura'}
      </p>

      <SiteSubNav />
      <SiteIdentityForm site={site} readOnly={!podeEditar} />
    </div>
  )
}
