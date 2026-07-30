'use client'
import Link from 'next/link'

/**
 * Shell visual do editor de seções do projeto especial.
 * Cada seção tem: breadcrumb, título da seção com ícone,
 * tag de contexto "o que aparece no site", e slot pra o form.
 */
export default function EditorShell({
  icon,
  label,
  desc,
  cor = '#0EA5A0',
  onde,
  children,
}: {
  icon: string
  label: string
  desc: string
  cor?: string
  onde: string   // "Aparece em: Home → Áreas de Atuação"
  children: React.ReactNode
}) {
  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <Link href="/app/projeto-especial/editor" className="hover:text-[var(--ink)] transition-colors">Editor do Site</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">{label}</span>
      </div>

      {/* Cabeçalho da seção */}
      <div className="flex items-start gap-4 mb-2">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${cor}18` }}>
          {icon}
        </div>
        <div>
          <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">{label}</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">{desc}</p>
        </div>
      </div>

      {/* Tag "onde aparece" */}
      <div className="flex items-center gap-2 mb-8 ml-16">
        <span className="text-xs font-semibold px-3 py-1 rounded-full border"
          style={{ color: cor, borderColor: `${cor}40`, background: `${cor}10` }}>
          📍 {onde}
        </span>
        <a
          href="/projetos-especiais/dentista-joao"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          Ver no site ↗
        </a>
      </div>

      {/* Conteúdo (formulário) */}
      {children}
    </div>
  )
}
