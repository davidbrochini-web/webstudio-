import DarkTopNav, { type DarkNavItem } from '@/components/layout/DarkTopNav'

const NAV: DarkNavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  {
    label: 'Clientes',
    children: [
      { label: 'Todos os clientes', href: '/admin/tenants' },
      { label: 'Demos ativas', href: '/admin/tenants/demos' },
    ],
  },
  {
    label: 'CRM',
    children: [
      { label: 'Leads do site', href: '/admin/crm/leads-site' },
      { label: 'Leads potenciais', href: '/admin/crm/leads-potenciais' },
    ],
  },
  { label: 'Financeiro', href: '/admin/financeiro' },
  { label: 'Suporte', href: '/admin/suporte' },
  { label: 'Blog', href: '/admin/blog' },
  { label: 'Equipe', href: '/admin/equipe' },
]

const NAV_DOC_IA: DarkNavItem = { label: 'Doc IA', href: '/admin/doc-ia' }

export default function AdminTopNav({ email, fotoUrl, mostrarDocIa = false }: { email: string; fotoUrl?: string | null; mostrarDocIa?: boolean }) {
  const items = mostrarDocIa ? [...NAV, NAV_DOC_IA] : NAV
  return <DarkTopNav items={items} email={email} badge="admin" homeHref="/admin" fotoUrl={fotoUrl} />
}
