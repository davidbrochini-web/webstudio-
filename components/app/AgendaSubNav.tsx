'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Tabs da seção Agenda. E3 (Tipos de Consulta) já é rota real; Bloqueios
// e Agenda da Semana continuam "em breve" até E4/E5.
const TABS = [
  { label: 'Configurações', href: '/app/projeto-especial/agenda', disponivel: true },
  { label: 'Tipos de Consulta', href: '/app/projeto-especial/agenda/tipos-consulta', disponivel: true },
  { label: 'Bloqueios', href: '/app/projeto-especial/agenda/bloqueios', disponivel: true },
  { label: 'Agenda da Semana', href: '/app/projeto-especial/agenda/semana', disponivel: true },
]

export default function AgendaSubNav() {
  const pathname = usePathname()
  return (
    <div className="flex items-center gap-1 mb-6 border-b border-[var(--border)] overflow-x-auto">
      {TABS.map(tab => {
        if (!tab.disponivel || !tab.href) {
          return (
            <span
              key={tab.label}
              title="Em breve"
              className="text-sm font-medium px-3 py-2.5 border-b-2 border-transparent text-[var(--muted)]/50 whitespace-nowrap cursor-default"
            >
              {tab.label} <span className="text-[10px] align-super">em breve</span>
            </span>
          )
        }
        const active = pathname === tab.href
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`text-sm font-medium px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              active
                ? 'border-[var(--brand)] text-[var(--ink)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
