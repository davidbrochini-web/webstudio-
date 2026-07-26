import Link from 'next/link'
import { getModule } from '@/lib/modules'

/**
 * Tela de espera pro módulo que já tem rota/menu criado mas ainda não
 * foi construído (`disponivel: false` em lib/modules.ts). Existir
 * como página de verdade — em vez de simplesmente não ter rota — é
 * o que permite ativar o módulo (trocar por conteúdo real) sem
 * precisar montar infra de novo: só isso, sem fingir funcionalidade
 * que ainda não existe.
 */
export default function ModuloEmConstrucao({ slug }: { slug: string }) {
  const mod = getModule(slug)

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-8 text-center">
        <span className="text-4xl mb-4 inline-block">{mod?.icon ?? '🛠️'}</span>
        <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-2">{mod?.label ?? 'Módulo'}</h1>
        <p className="text-sm text-[var(--muted)] max-w-md mx-auto mb-1">{mod?.desc}</p>
        <p className="text-xs font-semibold text-[var(--brand)] mt-4">Em construção — chega em breve.</p>
      </div>
    </div>
  )
}
