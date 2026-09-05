'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/app/localdesk', label: '🏠 Identidade' },
  { href: '/app/localdesk/servicos', label: '🛠️ Serviços' },
  { href: '/app/localdesk/diferenciais', label: '⭐ Diferenciais' },
  { href: '/app/localdesk/faq', label: '❓ FAQ' },
  { href: '/app/localdesk/depoimentos', label: '💬 Depoimentos' },
  { href: '/app/localdesk/cores', label: '🎨 Cores' },
]

export default function LocaldeskSubNav() {
  const pathname = usePathname()
  return (
    <div className="flex items-center gap-1 mb-6 border-b border-[var(--border)] overflow-x-auto">
      {ITEMS.map(item => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              active
                ? 'border-[var(--brand)] text-[var(--ink)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
