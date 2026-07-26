import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import FinanceiroSubNav from '@/components/app/FinanceiroSubNav'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function FluxoCaixaPage() {
  const info = await getCurrentTenant()
  if (!info) return <p className="text-sm text-[var(--muted)]">Sua conta não está vinculada a nenhuma empresa.</p>

  const supabase = await createClient()
  const [{ data: pagar }, { data: receber }] = await Promise.all([
    supabase
      .from('contas_pagar')
      .select('id, descricao, valor, vencimento, status')
      .eq('tenant_id', info.tenantId)
      .is('deleted_at', null),
    supabase
      .from('contas_receber')
      .select('id, descricao, valor, vencimento, status')
      .eq('tenant_id', info.tenantId)
      .is('deleted_at', null),
  ])

  const today = new Date().toISOString().slice(0, 10)

  const pagarPendente = (pagar ?? []).filter(c => c.status === 'pendente')
  const receberPendente = (receber ?? []).filter(c => c.status === 'pendente')

  const totalPagar = pagarPendente.reduce((s, c) => s + Number(c.valor), 0)
  const totalReceber = receberPendente.reduce((s, c) => s + Number(c.valor), 0)
  const saldoProjetado = totalReceber - totalPagar

  const vencidasPagar = pagarPendente.filter(c => c.vencimento < today)
  const vencidasReceber = receberPendente.filter(c => c.vencimento < today)

  // Extrato futuro: pendentes ordenados por vencimento, com saldo
  // acumulado a partir de zero — é uma PROJEÇÃO (não considera saldo
  // bancário real, que este módulo não rastreia).
  type Lancamento = { id: string; descricao: string; valor: number; vencimento: string; tipo: 'pagar' | 'receber' }
  const extrato: Lancamento[] = [
    ...pagarPendente.map(c => ({ id: c.id, descricao: c.descricao, valor: -Number(c.valor), vencimento: c.vencimento, tipo: 'pagar' as const })),
    ...receberPendente.map(c => ({ id: c.id, descricao: c.descricao, valor: Number(c.valor), vencimento: c.vencimento, tipo: 'receber' as const })),
  ].sort((a, b) => a.vencimento.localeCompare(b.vencimento))

  const extratoComSaldo = extrato.reduce<Array<Lancamento & { saldo: number }>>((acc, l) => {
    const saldoAnterior = acc.length ? acc[acc.length - 1].saldo : 0
    acc.push({ ...l, saldo: saldoAnterior + l.valor })
    return acc
  }, [])

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">Financeiro</h1>
      <FinanceiroSubNav />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs text-[var(--muted)] mb-1">A pagar (pendente)</p>
          <p className="font-display font-bold text-xl text-[var(--ink)]">{formatBRL(totalPagar)}</p>
          {vencidasPagar.length > 0 && <p className="text-xs text-red-600 mt-1">{vencidasPagar.length} vencida{vencidasPagar.length > 1 ? 's' : ''}</p>}
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs text-[var(--muted)] mb-1">A receber (pendente)</p>
          <p className="font-display font-bold text-xl text-[var(--ink)]">{formatBRL(totalReceber)}</p>
          {vencidasReceber.length > 0 && <p className="text-xs text-red-600 mt-1">{vencidasReceber.length} vencida{vencidasReceber.length > 1 ? 's' : ''}</p>}
        </div>
        <div className={`rounded-2xl p-5 border ${saldoProjetado >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <p className="text-xs text-[var(--muted)] mb-1">Saldo projetado</p>
          <p className={`font-display font-bold text-xl ${saldoProjetado >= 0 ? 'text-[var(--green)]' : 'text-red-600'}`}>
            {formatBRL(saldoProjetado)}
          </p>
        </div>
      </div>

      <h2 className="font-display font-bold text-base text-[var(--ink)] mb-3">Extrato futuro (projeção)</h2>
      <p className="text-xs text-[var(--muted)] mb-4">
        Considera só o que está pendente de pagar/receber, na ordem de vencimento — não inclui saldo bancário real.
      </p>

      {extratoComSaldo.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhum lançamento pendente.</p>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Vencimento</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Descrição</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] text-right">Valor</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] text-right">Saldo acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {extratoComSaldo.map(l => (
                <tr key={`${l.tipo}-${l.id}`}>
                  <td className="px-4 py-2.5 text-[var(--muted)]">{new Date(l.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-2.5 text-[var(--ink)]">{l.descricao}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${l.valor < 0 ? 'text-red-600' : 'text-[var(--green)]'}`}>
                    {l.valor < 0 ? '-' : '+'}{formatBRL(Math.abs(l.valor))}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${l.saldo >= 0 ? 'text-[var(--ink)]' : 'text-red-600'}`}>
                    {formatBRL(l.saldo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
