import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import LiveEditor from '@/components/dentista-joao-editor/LiveEditor'

export default async function EditorPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const [{ data: site }, { data: tratamentos }, { data: equipe }, { data: cursos }, { data: faq }, { data: fotos }] =
    await Promise.all([
      supabase.from('sites')
        .select('id, business_name, tagline, hero_title, hero_sub, hero_imagem_url, telefone, whatsapp, instagram_handle, endereco, status, missao, visao, valores')
        .eq('id', info.siteId).single(),
      supabase.from('site_tratamentos')
        .select('id, titulo, slug, descricao_curta, descricao_completa, beneficios, duracao, indicado_para, imagem_url, alt_text, meta_titulo, meta_descricao, publicado')
        .eq('site_id', info.siteId).is('deleted_at', null).order('ordem'),
      supabase.from('site_equipe')
        .select('id, nome, foto_url, alt_text, formacao, especialidade, bio')
        .eq('site_id', info.siteId).is('deleted_at', null).order('ordem'),
      supabase.from('site_cursos_eventos')
        .select('id, titulo, slug, descricao, descricao_completa, data_evento, imagem_url, alt_text, meta_titulo, meta_descricao, publicado')
        .eq('site_id', info.siteId).is('deleted_at', null).order('ordem'),
      supabase.from('site_faq')
        .select('id, pergunta, resposta, categoria')
        .eq('site_id', info.siteId).is('deleted_at', null).order('ordem'),
      supabase.from('site_fotos')
        .select('id, url')
        .eq('site_id', info.siteId).is('deleted_at', null).order('ordem'),
    ])

  if (!site) return null
  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <LiveEditor
      site={site}
      tratamentos={tratamentos ?? []}
      equipe={equipe ?? []}
      cursos={cursos ?? []}
      faq={faq ?? []}
      fotos={fotos ?? []}
      readOnly={!podeEditar}
    />
  )
}
