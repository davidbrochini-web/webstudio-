import { createClient } from '@/lib/supabase/server'
import DarkTopNav, { type DarkNavItem } from '@/components/layout/DarkTopNav'
import { modules } from '@/lib/modules'

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let tenantNome = ''
  const navItems: DarkNavItem[] = [{ label: 'Dashboard', href: '/app' }]

  if (user) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('tenants(id, nome, projeto_especial_slug)')
      .eq('user_id', user.id)
      .single()

    const tenant = membership?.tenants as unknown as { id: string; nome: string; projeto_especial_slug: string | null } | null

    if (tenant) {
      tenantNome = tenant.nome

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('modulo')
        .eq('tenant_id', tenant.id)
        .eq('status', 'ativo')
        .is('deleted_at', null)

      const ativos = new Set((subscriptions ?? []).map(s => s.modulo))

      // 1 menu por módulo ativo — ativando/desativando aqui conforme a
      // contratação, sem precisar tocar em código (decisão de produto,
      // julho/2026). Segue a ordem do catálogo em lib/modules.ts.
      for (const m of modules) {
        if (!ativos.has(m.slug) || !m.href) continue
        if (m.submenu?.length) {
          navItems.push({ label: m.label, children: m.submenu })
        } else {
          navItems.push({ label: m.label, href: m.href })
        }
      }

      // Projeto Especial: painel próprio, NÃO passa pelo catálogo de
      // módulos (nunca cobrado por assinatura de módulo) — gate é só a
      // flag do tenant, não uma subscription.
      if (tenant.projeto_especial_slug) {
        navItems.push({
          label: 'Site',
          children: [
            { label: 'Configurações', href: '/app/projeto-especial/config' },
            { label: 'Tratamentos', href: '/app/projeto-especial/tratamentos' },
            { label: 'Equipe', href: '/app/projeto-especial/equipe' },
            { label: 'Cursos e Eventos', href: '/app/projeto-especial/cursos-e-eventos' },
            { label: 'Dúvidas Frequentes', href: '/app/projeto-especial/faq' },
            { label: 'Artigos', href: '/app/projeto-especial/artigos' },
            { label: 'Leads recebidos', href: '/app/projeto-especial/leads' },
          ],
        })
      }
    }
  }

  return (
    <>
      <DarkTopNav items={navItems} email={user?.email ?? ''} badge={tenantNome} homeHref="/app" />
      <main className="px-6 py-10">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>
    </>
  )
}
