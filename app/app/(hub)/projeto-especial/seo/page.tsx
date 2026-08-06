import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import { SITE_URL_BASE } from '@/lib/dentista-joao'
import Link from 'next/link'
import SeoIndexToggle from '@/components/dentista-joao-editor/SeoIndexToggle'

interface ChecklistItem {
  ok: boolean
  label: string
  detalhe?: string
  corrigirEm?: { href: string; label: string }
}

export default async function SeoPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const [{ data: site }, { count: tratamentosCount }, { count: faqCount }, { count: artigosCount }, { count: equipeCount }] = await Promise.all([
    supabase.from('sites')
      .select('business_name, tagline, telefone, whatsapp, endereco, hero_imagem_url, logo_url, instagram_handle, seo_indexavel, secao_tratamentos_visivel, secao_faq_visivel, secao_artigos_visivel, secao_equipe_visivel')
      .eq('id', info.siteId).single(),
    supabase.from('site_tratamentos').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).eq('publicado', true).is('deleted_at', null),
    supabase.from('site_faq').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).is('deleted_at', null),
    supabase.from('site_blog_posts').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).eq('publicado', true).is('deleted_at', null),
    supabase.from('site_equipe').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).is('deleted_at', null),
  ])

  if (!site) return null

  // Heurística: detecta se o campo ainda está com o texto de rascunho
  // original (não foi personalizado ainda) — mais útil que só "vazio".
  const éPlaceholder = (v: string | null, marcador: string) => !v || v.includes(marcador)

  const checklist: ChecklistItem[] = [
    {
      ok: !éPlaceholder(site.tagline, 'rascunho inicial'),
      label: 'Descrição da clínica personalizada',
      detalhe: 'É o texto que aparece no Google embaixo do link do site — hoje ainda tem o texto de rascunho padrão.',
      corrigirEm: { href: '/app/projeto-especial/editor', label: 'Editar no Bem-vindo' },
    },
    {
      ok: !éPlaceholder(site.telefone, '0000-0000'),
      label: 'Telefone real cadastrado',
      corrigirEm: { href: '/app/projeto-especial/editor', label: 'Editar' },
    },
    {
      ok: !!site.whatsapp,
      label: 'WhatsApp cadastrado',
      corrigirEm: { href: '/app/projeto-especial/editor', label: 'Editar' },
    },
    {
      ok: !éPlaceholder(site.endereco, 'a confirmar'),
      label: 'Endereço real cadastrado',
      detalhe: 'Sem endereço real, o mapa do site não funciona e o Google não consegue te mostrar em buscas locais ("dentista perto de mim").',
      corrigirEm: { href: '/app/projeto-especial/editor', label: 'Editar' },
    },
    {
      ok: !!site.hero_imagem_url,
      label: 'Foto de banner configurada',
      corrigirEm: { href: '/app/projeto-especial/editor', label: 'Editar' },
    },
    {
      ok: !!site.logo_url,
      label: 'Logo em PNG configurada',
      detalhe: 'Opcional — sem logo, o menu mostra o nome da clínica em texto.',
      corrigirEm: { href: '/app/projeto-especial/editor', label: 'Editar' },
    },
    {
      ok: (tratamentosCount ?? 0) > 0 && site.secao_tratamentos_visivel,
      label: 'Pelo menos 1 tratamento publicado e visível',
      corrigirEm: { href: '/app/projeto-especial/editor', label: 'Editar' },
    },
    {
      ok: (faqCount ?? 0) > 0 && site.secao_faq_visivel,
      label: 'Perguntas frequentes cadastradas',
      detalhe: 'Cada pergunta pode aparecer como resultado rico direto na busca do Google (sanfona/FAQ).',
      corrigirEm: { href: '/app/projeto-especial/editor', label: 'Editar' },
    },
    {
      ok: (artigosCount ?? 0) > 0 && site.secao_artigos_visivel,
      label: 'Pelo menos 1 artigo publicado',
      detalhe: 'Blog ajuda o site a aparecer em mais buscas — não é obrigatório, mas ajuda bastante.',
      corrigirEm: { href: '/app/projeto-especial/blog', label: 'Ir pro Blog' },
    },
    {
      ok: (equipeCount ?? 0) > 0 && site.secao_equipe_visivel,
      label: 'Equipe cadastrada',
      corrigirEm: { href: '/app/projeto-especial/editor', label: 'Editar' },
    },
    {
      ok: !!site.instagram_handle,
      label: 'Instagram vinculado',
      corrigirEm: { href: '/app/projeto-especial/editor', label: 'Editar' },
    },
  ]

  const feitos = checklist.filter(c => c.ok).length

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">SEO</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">SEO</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        O que fazer pra clínica aparecer bem no Google — e o interruptor que decide se o site já pode ser encontrado.
      </p>

      {/* ── Visibilidade no Google ─────────────────────────────── */}
      <SeoIndexToggle siteId={info.siteId} indexavel={site.seo_indexavel} />

      {/* ── Checklist ───────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-[var(--ink)]">Checklist</h2>
          <span className="text-sm font-bold text-[var(--brand)] bg-[var(--brand)]/10 rounded-full px-3 py-1">
            {feitos} de {checklist.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {checklist.map((item, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${
              item.ok ? 'bg-[var(--off)] border-[var(--border)]' : 'bg-amber-50 border-amber-200'
            }`}>
              <span className="text-lg flex-shrink-0 leading-none mt-0.5">{item.ok ? '✅' : '⚠️'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${item.ok ? 'text-[var(--ink)]' : 'text-amber-800'}`}>{item.label}</p>
                {item.detalhe && <p className="text-xs text-[var(--muted)] mt-0.5">{item.detalhe}</p>}
              </div>
              {!item.ok && item.corrigirEm && (
                <Link href={item.corrigirEm.href}
                  className="flex-shrink-0 text-xs font-bold text-amber-700 hover:text-amber-900 bg-white rounded-full px-3 py-1.5 border border-amber-300 whitespace-nowrap">
                  {item.corrigirEm.label} →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Arquivos técnicos ──────────────────────────────────── */}
      <div className="mt-8">
        <h2 className="font-display font-bold text-lg text-[var(--ink)] mb-1">Arquivos técnicos</h2>
        <p className="text-xs text-[var(--muted)] mb-4">
          O Google usa esses dois arquivos pra entender o que pode indexar. Não precisa mexer neles — são gerados sozinhos a partir das configurações acima.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href={`${SITE_URL_BASE}/sitemap.xml`} target="_blank" rel="noopener noreferrer"
            className="block bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-xl p-4 transition-colors">
            <p className="text-sm font-bold text-[var(--ink)] mb-1">📄 sitemap.xml</p>
            <p className="text-xs text-[var(--muted)]">Lista de páginas que o site oferece pro Google indexar.</p>
          </a>
          <a href={`${SITE_URL_BASE}/robots.txt`} target="_blank" rel="noopener noreferrer"
            className="block bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-xl p-4 transition-colors">
            <p className="text-sm font-bold text-[var(--ink)] mb-1">🤖 robots.txt</p>
            <p className="text-xs text-[var(--muted)]">Diz aos robôs de busca o que podem e não podem acessar.</p>
          </a>
        </div>
      </div>

      {/* ── Próximos passos recomendados ───────────────────────── */}
      <div className="mt-8 mb-4">
        <h2 className="font-display font-bold text-lg text-[var(--ink)] mb-1">Próximos passos recomendados</h2>
        <p className="text-xs text-[var(--muted)] mb-4">
          Essas duas ferramentas são gratuitas e do próprio Google — precisam da sua conta Google pra configurar, por isso não dá pra fazer por aqui.
        </p>
        <div className="flex flex-col gap-3">
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
            className="block bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-xl p-4 transition-colors">
            <p className="text-sm font-bold text-[var(--ink)] mb-1">🔍 Google Search Console</p>
            <p className="text-xs text-[var(--muted)]">Cadastra o site oficialmente no Google e mostra como as pessoas estão encontrando a clínica na busca.</p>
          </a>
          <a href="https://business.google.com" target="_blank" rel="noopener noreferrer"
            className="block bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-xl p-4 transition-colors">
            <p className="text-sm font-bold text-[var(--ink)] mb-1">📍 Perfil da Empresa no Google (antigo Google Meu Negócio)</p>
            <p className="text-xs text-[var(--muted)]">O que faz a clínica aparecer no mapa e nas buscas tipo &quot;dentista perto de mim&quot;. Separado do site, mas o mais importante pra clínica física.</p>
          </a>
        </div>
      </div>
    </div>
  )
}
