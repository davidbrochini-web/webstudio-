import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import LeadsPotenciaisList from '@/components/admin/LeadsPotenciaisList'
import type { LeadPotencialRowData } from '@/components/admin/LeadPotencialRow'

export default async function GerenciarLeadsPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('leads_omnidesign')
    .select(`
      id, nome, telefone, email, segmento, bairro, endereco,
      site_atual_url, instagram_url,
      nota_google, avaliacoes_google, notas, texto_envio,
      analise_pdf_url, proposta_pdf_url, proposta_gerada_em, logo_url, imagens_portfolio, home_mockup_url,
      status, created_at,
      created_by, responsavel_id,
      criador:profiles!leads_omnidesign_created_by_fkey ( nome )
    `)
    .eq('origem', 'manual')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  // Time comercial pra atribuir responsável — hoje é qualquer
  // super-admin (não existe role restrita ainda, ver memória do
  // projeto sobre o modelo de acesso).
  const { data: membrosData } = await supabase
    .from('profiles')
    .select('id, nome')
    .eq('is_super_admin', true)
    .order('nome')

  // E-mail vive em auth.users, não em profiles — mesma limitação de
  // sempre, resolvida com o client admin (service_role), mesmo
  // padrão já usado em app/admin/equipe/actions.ts. Necessário pra
  // proposta e assinatura no WhatsApp usarem o contato certo do
  // responsável atribuído.
  const admin = createAdminClient()
  const membros = await Promise.all(
    (membrosData ?? []).map(async m => {
      const { data: userData } = await admin.auth.admin.getUserById(m.id)
      return { id: m.id, nome: m.nome, email: userData.user?.email ?? null }
    })
  )

  // Demos ativas ligadas a esses leads (ver migration 0058) — um
  // select à parte porque tenants não tem FK direta exposta aqui,
  // mais simples que embutir no nested select de cima.
  const { data: demosAtivas } = leads?.length
    ? await supabase
        .from('tenants')
        .select('lead_id, nome, demo_token')
        .eq('is_demo', true)
        .is('deleted_at', null)
        .in('lead_id', leads.map(l => l.id))
    : { data: [] }

  const demoPorLead = new Map(
    (demosAtivas ?? []).map(t => [
      t.lead_id as string,
      { link: `https://webstudio-red-eight.vercel.app/demo/entrar?token=${t.demo_token}`, nicho: t.nome.replace('Demo — ', '') },
    ])
  )

  const total = leads?.length ?? 0
  const emAberto = leads?.filter(l => l.status === 'novo' || l.status === 'contatado' || l.status === 'em_negociacao').length ?? 0
  const convertidos = leads?.filter(l => l.status === 'convertido').length ?? 0

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/admin/crm/leads-potenciais" className="hover:text-[var(--ink)] transition-colors">Leads potenciais</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Gerenciar</span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">Gerenciar leads</h1>
        <Link
          href="/admin/crm/leads-potenciais/cadastrar"
          className="flex-shrink-0 text-sm font-semibold text-white bg-[var(--dark)] px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          + Cadastrar lead
        </Link>
      </div>
      <p className="text-[var(--muted)] text-sm mb-8">Acompanhe o status e o histórico de cada empresa.</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', valor: total },
          { label: 'Em aberto', valor: emAberto },
          { label: 'Convertidos', valor: convertidos },
        ].map(k => (
          <div key={k.label} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 text-center">
            <p className="font-display font-extrabold text-3xl text-[var(--ink)]">{k.valor}</p>
            <p className="text-xs text-[var(--muted)] mt-1 font-medium">{k.label}</p>
          </div>
        ))}
      </div>

      {!leads?.length ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">🗒️</p>
          <p className="font-display font-bold text-[var(--ink)] text-lg mb-1">Nenhum lead cadastrado</p>
          <p className="text-[var(--muted)] text-sm mb-4">Cadastre a primeira empresa que você quer contatar.</p>
          <Link
            href="/admin/crm/leads-potenciais/cadastrar"
            className="inline-block text-sm font-semibold text-white bg-[var(--dark)] px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            + Cadastrar lead
          </Link>
        </div>
      ) : (
        <LeadsPotenciaisList
          membros={membros}
          leads={leads.map((l): LeadPotencialRowData => {
            const criador = Array.isArray(l.criador) ? l.criador[0] : l.criador
            return {
              id: l.id,
              nome: l.nome,
              telefone: l.telefone,
              email: l.email,
              segmento: l.segmento,
              bairro: l.bairro,
              endereco: l.endereco,
              siteAtualUrl: l.site_atual_url,
              instagramUrl: l.instagram_url,
              notaGoogle: l.nota_google,
              avaliacoesGoogle: l.avaliacoes_google,
              notas: l.notas,
              texto_envio: l.texto_envio,
              analise_pdf_url: l.analise_pdf_url,
              proposta_pdf_url: l.proposta_pdf_url,
              propostaGeradaEm: l.proposta_gerada_em,
              logoUrl: l.logo_url,
              homeMockupUrl: l.home_mockup_url,
              imagensPortfolio: l.imagens_portfolio ?? [],
              status: l.status,
              created_at: l.created_at,
              criadorNome: criador?.nome ?? null,
              responsavelId: l.responsavel_id,
              demoLink: demoPorLead.get(l.id)?.link ?? null,
              demoNicho: demoPorLead.get(l.id)?.nicho ?? null,
            }
          })}
        />
      )}
    </div>
  )
}
