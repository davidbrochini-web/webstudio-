'use client'

// Renderização leve de markdown sem dependência nova: o doc é interno,
// controlado (só o Claude escreve), então um subset básico resolve —
// headers, negrito, código inline, listas, tabelas viram texto mono.
// Se um dia precisar de render rico, trocar por react-markdown.

function renderLinha(linha: string, i: number) {
  if (linha.startsWith('# ')) return <h1 key={i} className="font-display font-extrabold text-xl text-[var(--ink)] mt-6 mb-2">{linha.slice(2)}</h1>
  if (linha.startsWith('## ')) return <h2 key={i} className="font-display font-bold text-lg text-[var(--ink)] mt-6 mb-2">{linha.slice(3)}</h2>
  if (linha.startsWith('### ')) return <h3 key={i} className="font-bold text-sm text-[var(--ink)] mt-4 mb-1.5">{linha.slice(4)}</h3>
  if (linha.startsWith('> ')) return <p key={i} className="text-xs text-[var(--muted)] italic border-l-2 border-[var(--border)] pl-3 my-1">{linha.slice(2)}</p>
  if (linha.trim() === '---') return <hr key={i} className="border-[var(--border)] my-4" />
  if (linha.startsWith('|')) return <p key={i} className="text-[11px] font-mono text-[var(--ink)] whitespace-pre overflow-x-auto">{linha}</p>
  if (linha.startsWith('- ')) return <p key={i} className="text-xs text-[var(--ink)] pl-4 my-0.5">• {renderInline(linha.slice(2))}</p>
  if (/^\d+\.\s/.test(linha)) return <p key={i} className="text-xs text-[var(--ink)] pl-4 my-0.5">{renderInline(linha)}</p>
  if (linha.trim() === '') return <div key={i} className="h-2" />
  return <p key={i} className="text-xs text-[var(--ink)] my-0.5 leading-relaxed">{renderInline(linha)}</p>
}

function renderInline(texto: string): React.ReactNode {
  // negrito **x** e código `x` — simples, sem nesting
  const partes = texto.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return partes.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="bg-[var(--off)] px-1 rounded text-[11px]">{p.slice(1, -1)}</code>
    return p
  })
}

export default function DocIaViewer({
  titulo,
  conteudo,
  updatedAt,
  atualizadoPor,
}: {
  titulo: string
  conteudo: string
  updatedAt: string
  atualizadoPor: string
}) {
  function handleDownload() {
    const blob = new Blob([conteudo], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DOC_IA_OMNIDESIGN_${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <p className="text-xs text-[var(--muted)]">
          Atualizado em {new Date(updatedAt).toLocaleString('pt-BR')} · por {atualizadoPor}
        </p>
        <button
          onClick={handleDownload}
          className="text-xs font-semibold text-white bg-[var(--dark)] px-3.5 py-2 rounded-lg"
        >
          ⬇️ Baixar .md
        </button>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
        {conteudo.split('\n').map((linha, i) => renderLinha(linha, i))}
      </div>
    </div>
  )
}
