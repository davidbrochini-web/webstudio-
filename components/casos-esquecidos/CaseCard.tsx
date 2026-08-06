import Link from 'next/link'
import Image from 'next/image'
import { Conto } from '@/lib/casos-esquecidos'

export default function CaseCard({ conto, prefix, priority = false }: { conto: Conto; prefix: string; priority?: boolean }) {
  // src relativo/absoluto vai direto pro Image — next/image resolve
  // caminho relativo (contos 001-006) contra o host atual sem problema.
  // imagemAbsoluta() é só pra metadata/OG, que exige URL totalmente
  // qualificada (ver contos/[slug]/page.tsx).
  const img = conto.imagem_url
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
