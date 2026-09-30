import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/**
 * Casca das páginas legais da Omnidesign (/privacidade, /termos).
 * Texto corrido em prose simples: o conteúdo é revisado por gente e por
 * revisor do Google (tela de consentimento OAuth), então priorizamos
 * legibilidade e títulos claros em vez de componentes.
 */
export default function PaginaLegal({
  titulo,
  atualizadoEm,
  children,
}: {
  titulo: string
  atualizadoEm: string
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
        <h1 className="font-display font-extrabold text-[clamp(28px,5vw,40px)] leading-tight text-[var(--ink)] mb-2">
          {titulo}
        </h1>
        <p className="text-sm text-[var(--muted)] mb-10">Última atualização: {atualizadoEm}</p>
        <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-[var(--muted)] [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-xl [&_h2]:text-[var(--ink)] [&_h2]:mt-8 [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_a]:text-[var(--brand)] [&_a]:underline [&_strong]:text-[var(--ink)]">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}
