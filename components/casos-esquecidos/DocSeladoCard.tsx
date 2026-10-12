import type { DocumentarioAgendado } from '@/lib/documentarios'
import { numeroArquivo } from '@/lib/documentarios'

export function formatarDataAbertura(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

// Card "selado" de documentário agendado — só metadados, sem link
// (o conteúdo ainda está bloqueado pela RLS até a data).
export default function DocSeladoCard({ doc }: { doc: DocumentarioAgendado }) {
  return (
    <article className="case-card locked">
      <span className="case-number">{numeroArquivo(doc.numero)} · {doc.local_caso}, {doc.ano_caso}</span>
      <h2>{doc.titulo}</h2>
      <p className="case-excerpt">Esse arquivo vai abrir dia {formatarDataAbertura(doc.data_publicacao)}.</p>
      <div className="case-meta">
        <span>—</span>
        <span className="status-tag" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>Selado — Agendado</span>
      </div>
    </article>
  )
}
