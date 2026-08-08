import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import BlogEditor from '@/components/app/BlogEditor'
import VisibilidadeSecaoToggle from '@/components/colegio-elite-editor/VisibilidadeSecaoToggle'
import { upsertArtigoCE, deleteArtigoCE } from '@/app/app/(hub)/colegio-elite/actions'

export default async function BlogPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const [{ data: artigos }, { data: site }] = await Promise.all([
    supabase.from('site_blog_posts')
      .select('id, titulo, slug, resumo, conteudo, capa_url, alt_text, meta_titulo, meta_descricao, publicado, created_at')
      .eq('site_id', info.siteId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase.from('sites').select('secao_artigos_visivel').eq('id', info.siteId).single(),
  ])

  const publicados = artigos?.filter(a => a.publicado).length ?? 0
  const rascunhos = artigos?.filter(a => !a.publicado).length ?? 0

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/colegio-elite" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Notícias / Blog</span>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Notícias / Blog</h1>
          <p className="text-[var(--muted)] text-sm">
            <span className="font-semibold text-[var(--ink)]">{publicados}</span> publicadas ·{' '}
            <span className="font-semibold text-[var(--ink)]">{rascunhos}</span> rascunho(s)
          </p>
        </div>
      </div>

      {site && (
        <div className="mb-6">
          <VisibilidadeSecaoToggle siteId={info.siteId} campo="secao_artigos_visivel" visivel={site.secao_artigos_visivel} readOnly={false} />
        </div>
      )}

      <BlogEditor siteId={info.siteId} artigos={artigos ?? []} upsertAction={upsertArtigoCE} deleteAction={deleteArtigoCE} />
    </div>
  )
}
