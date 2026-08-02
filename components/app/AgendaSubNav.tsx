'use client'

// Tabs da seção Agenda. Só "Configurações" existe até agora (E2 do
// checklist de Agendamento) — os demais aparecem desabilitados pra já
// deixar a estrutura visível e virarem rotas reais em E3 (Tipos de
// Consulta), E4 (Bloqueios) e E5 (Agenda da Semana) sem precisar
// remontar esse componente.
const TABS = [
  { label: 'Configurações', href: '/app/projeto-especial/agenda', disponivel: true },
  { label: 'Tipos de Consulta', href: null, disponivel: false },
  { label: 'Bloqueios', href: null, disponivel: false },
  { label: 'Agenda da Semana', href: null, disponivel: false },
]

export default function AgendaSubNav() {
  return (
    <div className="flex items-center gap-1 mb-6 border-b border-[var(--border)] overflow-x-auto">
      {TABS.map(tab => (
        tab.disponivel ? (
          <span
            key={tab.label}
            className="text-sm font-medium px-3 py-2.5 border-b-2 border-[var(--brand)] text-[var(--ink)] whitespace-nowrap"
          >
            {tab.label}
          </span>
        ) : (
          <span
            key={tab.label}
            title="Em breve"
            className="text-sm font-medium px-3 py-2.5 border-b-2 border-transparent text-[var(--muted)]/50 whitespace-nowrap cursor-default"
          >
            {tab.label} <span className="text-[10px] align-super">em breve</span>
          </span>
        )
      ))}
    </div>
  )
}
