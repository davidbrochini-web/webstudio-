import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('papel, tenants(id, nome)')
    .eq('user_id', user.id)
    .single()

  const tenant = membership?.tenants as unknown as { id: string; nome: string } | null

  if (!tenant) {
    return (
      <div>
        <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-2">
          Sem empresa vinculada
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {user.email} — sua conta ainda não está vinculada a nenhuma empresa. Fale com a omnidesign.
        </p>
      </div>
    )
  }

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('modulo, status')
    .eq('tenant_id', tenant.id)
    .is('deleted_at', null)

  const ativo = (modulo: string) => subscriptions?.some(s => s.modulo === modulo && s.status === 'ativo') ?? false

  const modulos = [
    { slug: 'site', label: 'Meu site', desc: 'Edite o conteúdo do seu site: textos, serviços, depoimentos e fotos.', href: '/app/site' },
    { slug: 'cadastros', label: 'Cadastros', desc: 'Clientes, fornecedores, funcionários e produtos/serviços.', href: '/app/cadastros' },
    { slug: 'crm', label: 'CRM', desc: 'Em breve.', href: null },
    { slug: 'estoque', label: 'Controle de estoque', desc: 'Em breve.', href: null },
    { slug: 'contas_pagar', label: 'Contas a pagar', desc: 'Em breve.', href: null },
    { slug: 'contas_receber', label: 'Contas a receber', desc: 'Em breve.', href: null },
    { slug: 'fluxo_caixa', label: 'Fluxo de caixa', desc: 'Em breve.', href: null },
  ]

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">{tenant.nome}</h1>
      <p className="text-sm text-[var(--muted)] mb-8">{user.email} · papel: {membership?.papel}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modulos.map(m => {
          const disponivel = ativo(m.slug) && m.href
          return disponivel ? (
            <Link
              key={m.slug}
              href={m.href!}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--brand)] hover:shadow-lg transition-all"
            >
              <h2 className="font-display font-bold text-base text-[var(--ink)] mb-1">{m.label}</h2>
              <p className="text-sm text-[var(--muted)]">{m.desc}</p>
            </Link>
          ) : (
            <div
              key={m.slug}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 opacity-50 cursor-not-allowed"
            >
              <h2 className="font-display font-bold text-base text-[var(--ink)] mb-1">{m.label}</h2>
              <p className="text-sm text-[var(--muted)]">
                {ativo(m.slug) ? m.desc : 'Módulo não contratado — fale com a omnidesign.'}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
