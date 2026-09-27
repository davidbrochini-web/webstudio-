import Link from 'next/link'
import Image from 'next/image'
import type { Documentario } from '@/lib/documentarios'
import { numeroArquivo } from '@/lib/documentarios'

export default function DocCard({ doc, priority = false }: { doc: Documentario; priority?: boolean }) {
  return (
    <article className="case-card">
      {doc.imagem_url && (
        <Image
          src={doc.imagem_url}
          alt={doc.imagem_alt || `Imagem do caso ${doc.caso}`}
          width={800}
          height={350}
          className="case-card-img"
          sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
          priority={priority}
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}
      <span className="case-number">{numeroArquivo(doc.numero)} · {doc.local_caso}, {doc.ano_caso}</span>
      <h2>{doc.titulo}</h2>
      <p className="case-excerpt">{doc.resumo}</p>
      <div className="case-meta">
        <span>{doc.tempo_leitura || '— min'}</span>
        <span className="status-tag">Caso real</span>
      </div>
      <Link className="btn btn-ghost" href={`/arquivos/${doc.slug}`}>Abrir o arquivo</Link>
    </article>
  )
}
