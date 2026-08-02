'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// "Agenda" (calendário) é a página do dia a dia — fica primeiro e é a
// própria raiz /agenda. Configurações é setup pontual, fica por último.
// Pills grandes em vez de tabs finas: touch target maior, mais fácil
// de acertar no mobile, visual menos "sistema".
const TABS = [
  { icon: '📅', label: 'Agenda', href: '/app/projeto-especial/agenda' },
  { icon: '🩺', label: 'Tipos de Consulta', href: '/app/projeto-especial/agenda/tipos-consulta' },
  { icon: '🚫', label: 'Bloqueios', href: '/app/projeto-especial/agenda/bloqueios' },
  { icon: '⚙️', label: 'Configurações', href: '/app/projeto-especial/agenda/configuracoes' },
]

export default function AgendaSubNav() {
  const pathname = usePathname()
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
      {TABS.map(tab => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
              active
                ? 'bg-[var(--brand)] text-white'
                : 'bg-[var(--off)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--border)]/40'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
