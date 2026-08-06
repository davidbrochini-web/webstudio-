import Link from 'next/link'
import Image from 'next/image'
import { Conto, imagemAbsoluta } from '@/lib/casos-esquecidos'

const BASE = '/projetos-especiais/casos-esquecidos'

export default function CaseCard({ conto, prefix = `${BASE}/contos`, priority = false }: { conto: Conto; prefix?: string; priority?: boolean }) {
  const img = imagemAbsoluta(conto.imagem_url)
  return (
    <article className="case-card">
      {img && (
        <Image
          src={img}
          alt={`Ilustração do conto ${conto.titulo}`}
          width={800}
          height={350}
          className="case-card-img"
          sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
          priority={priority}
        />
      )}
      <span className="case-number">Caso Nº {String(conto.numero).padStart(3, '0')}</span>
      <h3>{conto.titulo}</h3>
      <p className="case-excerpt">{conto.resumo}</p>
      <div className="case-meta">
        <span>{conto.tempo_leitura || '— min'}</span>
        <span className="status-tag">Aberto</span>
      </div>
      <Link className="btn btn-ghost" href={`${prefix}/${conto.slug}`}>Ler o caso</Link>
    </article>
  )
}
