import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import BlogEditor from '@/components/app/BlogEditor'
import { upsertArtigo, deleteArtigo } from '@/app/app/(hub)/projeto-especial/actions'

export default async function BlogPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const { data: artigos } = await supabase
    .from('site_blog_posts')
    .select('id, titulo, slug, resumo, conteudo, capa_url, alt_text, meta_titulo, meta_descricao, publicado, created_at')
    .eq('site_id', info.siteId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const publicados = artigos?.filter(a => a.publicado).length ?? 0
  const rascunhos = artigos?.filter(a => !a.publicado).length ?? 0

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Blog / Artigos</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Blog / Artigos</h1>
          <p className="text-[var(--muted)] text-sm">
            <span className="font-semibold text-[var(--ink)]">{publicados}</span> publicados
            {rascunhos > 0 && <> · <span className="text-amber-600 font-semibold">{rascunhos}</span> rascunhos</>}
          </p>
        </div>
      </div>

      <BlogEditor
        siteId={info.siteId}
        artigos={artigos ?? []}
        upsertAction={upsertArtigo}
        deleteAction={deleteArtigo}
      />
    </div>
  )
}
