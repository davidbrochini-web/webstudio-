import DarkTopNav, { type DarkNavItem } from '@/components/layout/DarkTopNav'

const NAV: DarkNavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  {
    label: 'Tenants',
    children: [
      { label: 'Todos os tenants', href: '/admin/tenants' },
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
]

export default function AdminTopNav({ email }: { email: string }) {
  return <DarkTopNav items={NAV} email={email} badge="admin" homeHref="/admin" />
}
