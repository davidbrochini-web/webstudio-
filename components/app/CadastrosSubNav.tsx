'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getModule } from '@/lib/modules'

// Lista de sub-páginas vem de lib/modules.ts (mesma fonte usada pelo
// dropdown do módulo na navbar) — evita manter a mesma lista em 2 lugares.
const ITEMS = getModule('cadastros')?.submenu ?? []

export default function CadastrosSubNav() {
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
