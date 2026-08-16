import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DocIaViewer from '@/components/admin/DocIaViewer'

const DAVID_USER_ID = 'b8035bb4-79ed-4996-9bc8-0b3ca345ef41'

export const dynamic = 'force-dynamic'

export default async function DocIaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Guard duplo: aqui (404 pra quem não é o David, nem revela que a
  // página existe) + RLS na tabela (mesmo que alguém chame a query
  // direto, não enxerga nada).
  if (!user || user.id !== DAVID_USER_ID) notFound()

  const { data: doc, error } = await supabase
    .from('doc_ia')
    .select('titulo, conteudo, updated_at, atualizado_por')
    .eq('slug', 'principal')
    .maybeSingle()

  if (error) throw new Error(error.message)

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Doc IA</h1>
      <p className="text-sm text-[var(--muted)] mb-8 max-w-2xl">
        Documentação viva do projeto, mantida pelo Claude. Ele lê isto no início de cada sessão e atualiza
        quando você pedir (&quot;atualiza a doc&quot;). Acesso exclusivo seu — nem outros super-admins enxergam.
      </p>

      {!doc ? (
        <p className="text-sm text-[var(--muted)]">Nenhum documento ainda — peça pro Claude criar na próxima sessão.</p>
      ) : (
        <DocIaViewer
          titulo={doc.titulo}
          conteudo={doc.conteudo}
          updatedAt={doc.updated_at}
          atualizadoPor={doc.atualizado_por}
        />
      )}
    </div>
  )
}
