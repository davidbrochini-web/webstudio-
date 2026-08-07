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
]

export default function AdminTopNav({ email, fotoUrl }: { email: string; fotoUrl?: string | null }) {
  return <DarkTopNav items={NAV} email={email} badge="admin" homeHref="/admin" fotoUrl={fotoUrl} />
}
