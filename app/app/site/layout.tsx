import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import SiteSubNav from '@/components/app/SiteSubNav'
import SitePreviewPane from '@/components/app/SitePreviewPane'

export default async function SiteEditorLayout({ children }: { children: React.ReactNode }) {
  const info = await getCurrentTenant()

  if (!info) {
    return <p className="text-sm text-[var(--muted)]">Sua conta não está vinculada a nenhuma empresa.</p>
  }
  if (!info.siteId || !info.siteSlug) {
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
    .select('status')
    .eq('id', info.siteId)
    .single()

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">Meu site</h1>
        <a
          href={`/sandbox/${info.siteSlug}`}
          target="_blank"
          className="text-xs font-semibold text-[var(--brand)] px-3 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--off)] transition-colors"
        >
          Abrir em outra aba →
        </a>
      </div>
      <p className="text-sm text-[var(--muted)] mb-5">
        omnidesign.com.br/sandbox/{info.siteSlug} · status: {site?.status ?? '—'}
        {info.papel === 'operador' && ' · você só tem acesso de leitura'}
      </p>

      <SitePreviewPane slug={info.siteSlug} />

      <p className="text-sm font-semibold text-[var(--ink)] mb-2">Escolha o que editar:</p>
      <SiteSubNav />
      {children}
    </div>
  )
}
