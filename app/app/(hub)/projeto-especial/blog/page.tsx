import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import BlogEditor from '@/components/app/BlogEditor'
import VisibilidadeSecaoToggle from '@/components/dentista-joao-editor/VisibilidadeSecaoToggle'
import EditableTextoCustomizado from '@/components/site-editor/EditableTextoCustomizado'
import { upsertArtigo, deleteArtigo } from '@/app/app/(hub)/projeto-especial/actions'

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
    supabase.from('sites').select('secao_artigos_visivel, textos_customizados').eq('id', info.siteId).single(),
  ])

  const textos = site?.textos_customizados ?? {}

  const publicados = artigos?.filter(a => a.publicado).length ?? 0
  const rascunhos = artigos?.filter(a => !a.publicado).length ?? 0

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Blog / Artigos</span>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Blog / Artigos</h1>
          <p className="text-[var(--muted)] text-sm">
            <span className="font-semibold text-[var(--ink)]">{publicados}</span> publicados
            {rascunhos > 0 && <> · <span className="text-amber-600 font-semibold">{rascunhos}</span> rascunhos</>}
          </p>
        </div>
      </div>

      <VisibilidadeSecaoToggle siteId={info.siteId} campo="secao_artigos_visivel" visivel={site?.secao_artigos_visivel ?? true} readOnly={false} />

      <div className="mb-6 p-4 bg-[var(--off)] rounded-xl">
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
          Título da seção na Home (&quot;Novidades Clínicas&quot;)
        </p>
        <EditableTextoCustomizado
          siteId={info.siteId} readOnly={false} chave="home_novidades_titulo"
          valor={textos.home_novidades_titulo ?? 'Novidades Clínicas'}
          as="p" className="font-display font-bold text-lg text-[var(--ink)] block"
        />
        <EditableTextoCustomizado
          siteId={info.siteId} readOnly={false} chave="home_novidades_subtitulo"
          valor={textos.home_novidades_subtitulo ?? 'Acompanhe nossos artigos e fique atualizado com os principais temas da área.'}
          as="p" className="text-sm text-[var(--muted)] mt-1 block"
        />
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
