import { createClient } from '@/lib/supabase/server'
import DarkTopNav, { type DarkNavItem } from '@/components/layout/DarkTopNav'
import SuporteFloatingButton from '@/components/layout/SuporteFloatingButton'
import ImpersonationBanner from '@/components/layout/ImpersonationBanner'
import { modules } from '@/lib/modules'
import { getPendenciaAtual } from '@/lib/assinatura-server'
import { getCurrentTenant } from '@/lib/current-tenant'

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let tenantNome = ''
  const navItems: DarkNavItem[] = [{ label: 'Dashboard', href: '/app' }]

  const { data: profile } = user
    ? await supabase.from('profiles').select('foto_perfil_url').eq('id', user.id).single()
    : { data: null }

  const info = await getCurrentTenant()

  if (info) {
    tenantNome = info.tenantNome

    // Projeto Especial: painel próprio, NÃO passa pelo catálogo de
    // módulos (nunca cobrado por assinatura de módulo) — gate é só a
    // flag do tenant, não uma subscription. Pula o loop de módulos do
    // catálogo inteiro, mesmo que exista uma subscription 'site' de
    // compatibilidade (o projeto especial tem editor próprio, mais
    // completo que o módulo genérico "Site + Instagram").
    if (!info.projetoEspecialSlug) {
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('modulo')
        .eq('tenant_id', info.tenantId)
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

    if (info.projetoEspecialSlug === 'dentista-joao') {
      const { totalCentavos: pendenciaCentavos } = await getPendenciaAtual(info.tenantId)
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

    if (info.projetoEspecialSlug === 'casos-esquecidos') {
      navItems.push({
        label: '📖 Casos',
        href: '/app/casos-esquecidos',
      })
      navItems.push({
        label: '✍️ Novo caso',
        href: '/app/casos-esquecidos/novo',
      })
      navItems.push({
        label: '🎨 Editor do Site',
        href: '/app/casos-esquecidos/editor',
      })
      navItems.push({
        label: '🎨 Cores',
        href: '/app/casos-esquecidos/cores',
      })
      navItems.push({
        label: '💳 Assinatura',
        href: '/app/projeto-especial/assinatura',
      })
    }

    if (info.projetoEspecialSlug === 'localdesk') {
      navItems.push({
        label: '📥 Leads',
        href: '/app/localdesk/leads',
      })
      navItems.push({
        label: '🎨 Editor do Site',
        href: '/app/localdesk',
      })
      navItems.push({
        label: '🎨 Cores',
        href: '/app/localdesk/cores',
      })
      navItems.push({
        label: '💳 Assinatura',
        href: '/app/projeto-especial/assinatura',
      })
    }

    if (info.projetoEspecialSlug === 'colegio-elite') {
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
      navItems.push({
        label: '🎨 Cores',
        href: '/app/projeto-especial/cores',
      })
      navItems.push({
        label: '💳 Assinatura',
        href: '/app/projeto-especial/assinatura',
      })
    }
  }

  return (
    <>
      {info?.impersonating && <ImpersonationBanner tenantNome={info.tenantNome} />}
      <DarkTopNav items={navItems} email={user?.email ?? ''} badge={tenantNome} homeHref="/app" fotoUrl={profile?.foto_perfil_url} />
      <main className="px-6 py-10">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>
      <SuporteFloatingButton />
    </>
  )
}
