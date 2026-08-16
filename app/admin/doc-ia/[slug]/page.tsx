import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DocIaViewer from '@/components/admin/DocIaViewer'

const DAVID_USER_ID = 'b8035bb4-79ed-4996-9bc8-0b3ca345ef41'

export const dynamic = 'force-dynamic'

export default async function DocIaSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== DAVID_USER_ID) notFound()

  const { data: doc, error } = await supabase
    .from('doc_ia')
    .select('titulo, conteudo, updated_at, atualizado_por')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!doc) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/admin/doc-ia" className="hover:text-[var(--ink)] transition-colors">Doc IA</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">{doc.titulo}</span>
      </div>

      <DocIaViewer
        titulo={doc.titulo}
        conteudo={doc.conteudo}
        updatedAt={doc.updated_at}
        atualizadoPor={doc.atualizado_por}
      />
    </div>
  )
}
