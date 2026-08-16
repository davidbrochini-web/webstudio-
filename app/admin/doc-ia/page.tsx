import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const DAVID_USER_ID = 'b8035bb4-79ed-4996-9bc8-0b3ca345ef41'

export const dynamic = 'force-dynamic'

export default async function DocIaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== DAVID_USER_ID) notFound()

  const { data: docs, error } = await supabase
    .from('doc_ia')
    .select('slug, titulo, conteudo, updated_at')
    .order('slug')

  if (error) throw new Error(error.message)

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Doc IA</h1>
      <p className="text-sm text-[var(--muted)] mb-8 max-w-2xl">
        Documentação viva do projeto, separada por área — mantida pelo Claude. Ele lê isto no início de cada
        sessão e atualiza quando você pedir (&quot;atualiza a doc&quot;). Acesso exclusivo seu.
      </p>

      {!docs || docs.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhum documento ainda — peça pro Claude criar na próxima sessão.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {docs.map(doc => {
            const excerto = doc.conteudo
              .split('\n')
              .find((l: string) => l.trim() && !l.startsWith('#') && !l.startsWith('>')) ?? ''
            return (
              <Link
                key={doc.slug}
                href={`/admin/doc-ia/${doc.slug}`}
                className="block bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--brand)] transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display font-bold text-[var(--ink)]">{doc.titulo}</p>
                  <span className="text-[10px] font-semibold text-[var(--muted)] flex-shrink-0">
                    {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1 line-clamp-1">{excerto}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
