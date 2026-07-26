import type { SupabaseClient } from '@supabase/supabase-js'
import { getNiche } from '@/lib/templates'
import { unsplashPhoto } from '@/lib/photos'

const URBANO_PRECOS = ['R$ 45', 'R$ 35', 'R$ 70', 'R$ 90']

export interface SeedResult {
  siteId?: string
  error?: string
}

/**
 * Cria um site completo (registro + serviços + depoimentos + fotos +
 * posts + stats) a partir de um dos 7 templates de nicho, copiando o
 * conteúdo demo daquele nicho. Usado tanto pelo admin (criar site de
 * cliente de verdade) quanto pela demo instantânea (tenant efêmero).
 *
 * Recebe qualquer SupabaseClient com permissão de escrita nessas
 * tabelas — normalmente o client normal (RLS: admin do tenant) no
 * admin, ou o client de service_role na demo (tenant ainda não tem
 * membership no momento da criação, então RLS bloquearia).
 */
export async function seedSiteFromNiche(
  supabase: SupabaseClient,
  tenantId: string,
  nicheSlug: string,
  slug: string,
  status: 'rascunho' | 'publicado' = 'rascunho'
): Promise<SeedResult> {
  const niche = getNiche(nicheSlug)
  if (!niche) return { error: 'Template inválido.' }

  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      tenant_id: tenantId,
      slug,
      pagelayout: niche.pageLayout,
      accent_key: niche.slug,
      business_name: niche.businessName,
      tagline: niche.tagline,
      hero_title: niche.heroTitle,
      hero_sub: niche.heroSub,
      cta_label: niche.ctaLabel,
      instagram_handle: niche.igHandle,
      status,
    })
    .select('id')
    .single()

  if (siteError || !site) {
    if (siteError?.code === '23505') {
      return { error: 'Esse slug já está em uso, ou esse tenant já tem um site — escolha outro slug.' }
    }
    return { error: `Erro ao criar site: ${siteError?.message ?? 'desconhecido'}` }
  }

  const siteId = site.id as string

  const [servicosRes, depoimentosRes, fotosRes, postsRes, statsRes, faqRes, planosRes, blogRes] = await Promise.all([
    supabase.from('site_servicos').insert(
      niche.services.map((s, i) => ({
        site_id: siteId, icon: s.icon, title: s.title, description: s.desc, ordem: i,
        preco: niche.pageLayout === 'urbano' ? URBANO_PRECOS[i % URBANO_PRECOS.length] : null,
      }))
    ),
    supabase.from('site_depoimentos').insert(
      niche.testimonials.map((t, i) => ({ site_id: siteId, nome: t.name, texto: t.text, ordem: i }))
    ),
    supabase.from('site_fotos').insert(
      // niche.photoIds guarda só o ID do Unsplash (ex: '1506126613408-...'),
      // não a URL completa — precisa passar por unsplashPhoto() antes de
      // salvar, senão o <img src> no editor (que lê direto de site_fotos.url)
      // fica quebrado. Os componentes *Layout.tsx estáticos não tinham esse
      // bug porque leem niche.photoIds direto do config e já aplicam
      // unsplashPhoto() na hora de renderizar.
      niche.photoIds.map((id, i) => ({ site_id: siteId, url: unsplashPhoto(id, 900, 1100), ordem: i }))
    ),
    supabase.from('site_posts').insert(
      niche.posts.map((p, i) => ({ site_id: siteId, caption: p.caption, likes: p.likes, ordem: i }))
    ),
    (() => {
      if (niche.pageLayout === 'clinico') {
        return supabase.from('site_stats').insert([
          { site_id: siteId, valor: '+15', rotulo: 'anos de experiência', ordem: 0 },
          { site_id: siteId, valor: '+3.200', rotulo: 'pacientes atendidos', ordem: 1 },
          { site_id: siteId, valor: '4.9★', rotulo: 'avaliação média', ordem: 2 },
        ])
      }
      if (niche.pageLayout === 'editorial') {
        return supabase.from('site_stats').insert([
          { site_id: siteId, valor: '+18', rotulo: 'anos de atuação', ordem: 0 },
          { site_id: siteId, valor: '+400', rotulo: 'casos atendidos', ordem: 1 },
          { site_id: siteId, valor: '92%', rotulo: 'êxito em acordos', ordem: 2 },
        ])
      }
      if (niche.pageLayout === 'performance') {
        return supabase.from('site_stats').insert([
          { site_id: siteId, valor: '500+', rotulo: 'alunos transformados', ordem: 0 },
          { site_id: siteId, valor: '+8', rotulo: 'anos', ordem: 1 },
          { site_id: siteId, valor: '24/7', rotulo: 'acesso', ordem: 2 },
          { site_id: siteId, valor: '4.8★', rotulo: 'avaliação', ordem: 3 },
          { site_id: siteId, valor: '+30', rotulo: 'aulas/semana', ordem: 4 },
        ])
      }
      return Promise.resolve({ error: null })
    })(),
    supabase.from('site_faq').insert(
      niche.faq.map((f, i) => ({ site_id: siteId, pergunta: f.pergunta, resposta: f.resposta, ordem: i }))
    ),
    supabase.from('site_planos').insert(
      niche.planos.map((p, i) => ({
        site_id: siteId, nome: p.nome, preco: p.preco, periodo: p.periodo ?? null,
        destaque: p.destaque ?? false, features: p.features, ordem: i,
      }))
    ),
    supabase.from('site_blog_posts').insert(
      niche.blogPosts.map((b, i) => ({
        site_id: siteId, slug: b.slug, titulo: b.titulo, resumo: b.resumo,
        conteudo: b.resumo, publicado: true, ordem: i,
      }))
    ),
  ])

  const childError = servicosRes.error || depoimentosRes.error || fotosRes.error || postsRes.error || statsRes.error
    || faqRes.error || planosRes.error || blogRes.error
  if (childError) {
    await supabase.from('sites').delete().eq('id', siteId)
    return { error: `Site criado, mas erro ao copiar conteúdo demo: ${childError.message}.` }
  }

  return { siteId }
}
