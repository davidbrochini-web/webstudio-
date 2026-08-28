import { createClient } from '@/lib/supabase/server'
import DarkTopNav, { type DarkNavItem } from '@/components/layout/DarkTopNav'
import SuporteFloatingButton from '@/components/layout/SuporteFloatingButton'
import { modules } from '@/lib/modules'
import { getPendenciaAtual } from '@/lib/assinatura-server'

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let tenantNome = ''
  const navItems: DarkNavItem[] = [{ label: 'Dashboard', href: '/app' }]

  const { data: profile } = user
    ? await supabase.from('profiles').select('foto_perfil_url').eq('id', user.id).single()
    : { data: null }

  if (user) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('tenants(id, nome, projeto_especial_slug)')
      .eq('user_id', user.id)
      .single()

    const tenant = membership?.tenants as unknown as { id: string; nome: string; projeto_especial_slug: string | null } | null

    if (tenant) {
      tenantNome = tenant.nome

      // Projeto Especial: painel próprio, NÃO passa pelo catálogo de
      // módulos (nunca cobrado por assinatura de módulo) — gate é só a
      // flag do tenant, não uma subscription. Pula o loop de módulos do
      // catálogo inteiro, mesmo que exista uma subscription 'site' de
      // compatibilidade (o projeto especial tem editor próprio, mais
      // completo que o módulo genérico "Site + Instagram").
      if (!tenant.projeto_especial_slug) {
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
      }

      if (tenant.projeto_especial_slug === 'dentista-joao') {
        const { totalCentavos: pendenciaCentavos } = await getPendenciaAtual(tenant.id)
        navItems.push({
          label: '📥 Leads',
          href: '/app/projeto-especial/leads',
        })
        navItems.push({
          label: '🎨 Editor do Site',
          href: '/app/projeto-especial/editor',
        })
        navItems.push({
          label: '🗓️ Agenda',
          href: '/app/projeto-especial/agenda',
        })
        navItems.push({
          label: '✍️ Blog',
          href: '/app/projeto-especial/blog',
        })
        navItems.push({
          label: '🔍 SEO',
          href: '/app/projeto-especial/seo',
        })
        navItems.push({
          label: '🎨 Cores',
          href: '/app/projeto-especial/cores',
        })
        navItems.push({
          label: '💳 Assinatura',
          href: '/app/projeto-especial/assinatura',
          dot: pendenciaCentavos > 0,
        })
      }

      if (tenant.projeto_especial_slug === 'casos-esquecidos') {
        navItems.push({
          label: '📖 Casos',
          href: '/app/casos-esquecidos',
        })
        navItems.push({
          label: '✍️ Novo caso',
          href: '/app/casos-esquecidos/novo',
        })
      }

      if (tenant.projeto_especial_slug === 'colegio-elite') {
        navItems.push({
          label: '📥 Leads',
          href: '/app/colegio-elite/leads',
        })
        navItems.push({
          label: '🎨 Editor do Site',
          href: '/app/colegio-elite/editor',
        })
        navItems.push({
          label: '✍️ Notícias',
          href: '/app/colegio-elite/blog',
        })
        navItems.push({
          label: '🔍 SEO',
          href: '/app/colegio-elite/seo',
        })
      }
    }
  }

  return (
    <>
      <DarkTopNav items={navItems} email={user?.email ?? ''} badge={tenantNome} homeHref="/app" fotoUrl={profile?.foto_perfil_url} />
      <main className="px-6 py-10">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>
      <SuporteFloatingButton />
    </>
  )
}
