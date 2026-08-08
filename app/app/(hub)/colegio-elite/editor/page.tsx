import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import LiveEditor from '@/components/colegio-elite-editor/LiveEditor'

export default async function EditorPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const [{ data: site }, { data: diferenciais }, { data: segmentos }, { data: faq }] =
    await Promise.all([
      supabase.from('sites')
        .select('id, business_name, tagline, hero_title, hero_sub, hero_imagem_url, logo_url, logo_posicao, telefone, whatsapp, instagram_handle, instagram_visivel, endereco, status, missao, visao, valores, secao_diferenciais_visivel, secao_segmentos_visivel, secao_faq_visivel, textos_customizados, cor_primaria, cor_secundaria')
        .eq('id', info.siteId).single(),
      supabase.from('site_diferenciais')
        .select('id, icone, titulo, texto')
        .eq('site_id', info.siteId).is('deleted_at', null).order('ordem'),
      supabase.from('site_segmentos_ensino')
        .select('id, titulo, slug, resumo, texto_completo, imagem_url, meta_titulo, publicado')
        .eq('site_id', info.siteId).is('deleted_at', null).order('ordem'),
      supabase.from('site_faq')
        .select('id, pergunta, resposta')
        .eq('site_id', info.siteId).is('deleted_at', null).order('ordem'),
    ])

  if (!site) return null
  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <LiveEditor
      site={site}
      diferenciais={diferenciais ?? []}
      segmentos={segmentos ?? []}
      faq={faq ?? []}
      readOnly={!podeEditar}
    />
  )
}
