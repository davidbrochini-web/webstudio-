import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import LocaldeskSubNav from '@/components/app/LocaldeskSubNav'

/**
 * Layout do admin do LocalDesk — path dedicado (/app/localdesk/*),
 * mesmo padrão de casos-esquecidos/colegio-elite. Reaproveita os
 * componentes de formulário genéricos (SiteIdentityForm,
 * ServicosManager, DepoimentosManager, DiferenciaisManager,
 * FaqManager), mas com wrapper próprio — o link de prévia aponta pro
 * site bespoke real (/projetos-especiais/localdesk), não pro
 * pipeline de template genérico "/sandbox/{slug}" que o admin
 * genérico usa.
 */
export default async function LocaldeskLayout({ children }: { children: React.ReactNode }) {
  const info = await getCurrentTenant()

  if (!info) {
    return <p className="text-sm text-[var(--muted)]">Sua conta não está vinculada a nenhuma empresa.</p>
  }
  if (!info.siteId) {
    return (
      <div>
        <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
        <p className="text-sm text-[var(--muted)]">Site ainda não encontrado.</p>
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
        <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">Meu site — LocalDesk</h1>
        <a
          href="/projetos-especiais/localdesk"
          target="_blank"
          className="text-xs font-semibold text-[var(--brand)] px-3 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--off)] transition-colors"
        >
          Abrir em outra aba →
        </a>
      </div>
      <p className="text-sm text-[var(--muted)] mb-5">
        status: {site?.status ?? '—'}
        {info.papel === 'operador' && ' · você só tem acesso de leitura'}
      </p>

      <p className="text-sm font-semibold text-[var(--ink)] mb-2">Escolha o que editar:</p>
      <LocaldeskSubNav />
      {children}
    </div>
  )
}
