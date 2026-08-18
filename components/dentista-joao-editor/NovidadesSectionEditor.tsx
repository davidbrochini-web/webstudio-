'use client'

import EditableTextoCustomizado from '@/components/site-editor/EditableTextoCustomizado'

/**
 * Bloco de edição do título/subtítulo da seção "Novidades Clínicas"
 * (preview de artigos na home, ver app/projetos-especiais/dentista-joao/
 * page.tsx). Faltava no LiveEditor — os textos já liam de
 * textos_customizados com fallback (home_novidades_titulo/subtitulo),
 * mas não tinham EditableTextoCustomizado nenhum apontando pra eles,
 * então não existia UI nenhuma pra editar. Cliente reportou.
 *
 * A seção só aparece na home pública quando existe pelo menos 1 artigo
 * publicado — mas o bloco de edição fica sempre visível aqui, porque
 * faz sentido o cliente poder preparar o texto antes de publicar o
 * primeiro artigo.
 */
export default function NovidadesSectionEditor({ siteId, readOnly, textos }: {
  siteId: string
  readOnly: boolean
  textos: Record<string, string>
}) {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        Novidades Clínicas (seção da home — só aparece com artigos publicados)
      </p>
      <EditableTextoCustomizado
        siteId={siteId} readOnly={readOnly} chave="home_novidades_titulo"
        valor={textos.home_novidades_titulo ?? 'Novidades Clínicas'}
        as="h2" className="font-display font-extrabold text-2xl text-[var(--dj-secondary)] text-center mb-2 block"
      />
      <EditableTextoCustomizado
        siteId={siteId} readOnly={readOnly} chave="home_novidades_subtitulo"
        valor={textos.home_novidades_subtitulo ?? 'Acompanhe nossos artigos e fique atualizado com os principais temas da área.'}
        as="p" className="text-center text-slate-500 text-sm block"
      />
    </section>
  )
}
