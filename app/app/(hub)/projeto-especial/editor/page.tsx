import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'

const SECOES = [
  {
    id: 'home',
    label: 'Home',
    desc: 'Nome da clínica, texto de destaque, foto principal e informações de contato',
    icon: '🏠',
    href: '/app/projeto-especial/editor/home',
    cor: '#0B2B3C',
    preview: ['Hero (banner principal)', 'Números e credenciais', 'Texto institucional'],
  },
  {
    id: 'tratamentos',
    label: 'Tratamentos',
    desc: 'Áreas de atuação que aparecem na home e na página de Tratamentos',
    icon: '🦷',
    href: '/app/projeto-especial/editor/tratamentos',
    cor: '#0EA5A0',
    preview: ['Cards com imagem', 'Página de detalhe', 'SEO por tratamento'],
  },
  {
    id: 'equipe',
    label: 'Equipe',
    desc: 'Profissionais da clínica — nome, cargo, foto e bio',
    icon: '👨‍⚕️',
    href: '/app/projeto-especial/editor/equipe',
    cor: '#1e6b8a',
    preview: ['Foto e nome', 'Cargo / especialidade', 'Biografia'],
  },
  {
    id: 'cursos',
    label: 'Cursos e Eventos',
    desc: 'Palestras, cursos e eventos que a clínica organiza ou participa',
    icon: '🎓',
    href: '/app/projeto-especial/editor/cursos',
    cor: '#0B2B3C',
    preview: ['Data e local', 'Imagem e descrição', 'Link de inscrição'],
  },
  {
    id: 'faq',
    label: 'Dúvidas Frequentes',
    desc: 'Perguntas e respostas que aparecem na home e na página de FAQ',
    icon: '💬',
    href: '/app/projeto-especial/editor/faq',
    cor: '#0EA5A0',
    preview: ['Pergunta e resposta', 'Categoria (opcional)', 'Ordem de exibição'],
  },
  {
    id: 'config',
    label: 'Informações Gerais',
    desc: 'Telefone, WhatsApp, endereço, Instagram e status de publicação do site',
    icon: '⚙️',
    href: '/app/projeto-especial/editor/config',
    cor: '#64748b',
    preview: ['Dados de contato', 'Redes sociais', 'Status do site'],
  },
]

export default async function EditorHubPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const counts = await Promise.all([
    supabase.from('site_tratamentos').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).is('deleted_at', null),
    supabase.from('site_equipe').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).is('deleted_at', null),
    supabase.from('site_cursos_eventos').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).is('deleted_at', null),
    supabase.from('site_faq').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).is('deleted_at', null),
  ])
  const [tratamentos, equipe, cursos, faq] = counts.map(r => r.count ?? 0)

  const contadores: Record<string, number> = { tratamentos, equipe, cursos: cursos, faq }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/app/projeto-especial" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          ← Painel
        </Link>
        <span className="text-[var(--border)]">/</span>
        <h1 className="font-display font-bold text-xl text-[var(--ink)]">Editor do Site</h1>
      </div>

      {/* Prévia visual do site (referência) */}
      <div className="bg-[#0B2B3C] rounded-2xl p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-1">Visualizar site</p>
          <p className="text-white text-sm">Abra em outra aba para ver as alterações em tempo real</p>
        </div>
        <a
          href="/projetos-especiais/dentista-joao"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 bg-white/10 hover:bg-[#0EA5A0] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Abrir site →
        </a>
      </div>

      {/* Seções */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECOES.map((s) => {
          const count = contadores[s.id]
          return (
            <Link
              key={s.id}
              href={s.href}
              className="group bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-2xl overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Faixa colorida topo */}
              <div className="h-1.5" style={{ background: s.cor }} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${s.cor}15` }}>
                    {s.icon}
                  </div>
                  {count !== undefined && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--off)] text-[var(--muted)]">
                      {count} {count === 1 ? 'item' : 'itens'}
                    </span>
                  )}
                </div>

                <h2 className="font-display font-bold text-[var(--ink)] text-base mb-1.5">{s.label}</h2>
                <p className="text-[var(--muted)] text-sm leading-relaxed mb-4">{s.desc}</p>

                {/* Mini-lista do que se edita */}
                <ul className="flex flex-col gap-1 mb-4">
                  {s.preview.map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: s.cor }} />
                      {item}
                    </li>
                  ))}
                </ul>

                <span className="text-xs font-semibold text-[var(--muted)] group-hover:text-[var(--brand)] transition-colors">
                  Editar seção →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
