import { createClient } from '@/lib/supabase/server'
import { formatCentavos, formatDataCurta } from '@/lib/assinatura'

interface ItemRow {
  id: string
  tenant_id: string
  label: string
  tipo: 'unico' | 'recorrente'
  valor_centavos: number
  valor_variavel_nota: string | null
  tenants: { nome: string } | null
}

interface PagamentoRow {
  id: string
  item_id: string
  valor_centavos: number
  status: 'pago' | 'pendente' | 'atrasado'
  vencimento: string | null
  pago_em: string | null
}

export default async function AdminFinanceiroPage() {
  const supabase = await createClient()

  const { data: itensRaw } = await supabase
    .from('assinatura_itens')
    .select('id, tenant_id, label, tipo, valor_centavos, valor_variavel_nota, tenants(nome)')
    .eq('ativo', true)
    .is('deleted_at', null)

  const itens = (itensRaw ?? []) as unknown as ItemRow[]
  const itemIds = itens.map(i => i.id)

  const { data: pagamentosRaw } = itemIds.length
    ? await supabase
        .from('assinatura_pagamentos')
        .select('id, item_id, valor_centavos, status, vencimento, pago_em')
        .in('item_id', itemIds)
        .is('deleted_at', null)
    : { data: [] }

  const pagamentos = (pagamentosRaw ?? []) as PagamentoRow[]
  const tenantPorItem = new Map(itens.map(i => [i.id, { nome: i.tenants?.nome ?? '—', tenantId: i.tenant_id }]))
  const labelPorItem = new Map(itens.map(i => [i.id, i.label]))

  const hoje = new Date().toISOString().slice(0, 10)

  // MRR: só itens recorrentes com valor fixo (exclui valor variável
  // tipo "10% sobre investido em Ads", que não tem um número certo).
  const mrrCentavos = itens
    .filter(i => i.tipo === 'recorrente' && !i.valor_variavel_nota)
    .reduce((s, i) => s + i.valor_centavos, 0)

  const totalPagoCentavos = pagamentos.filter(p => p.status === 'pago').reduce((s, p) => s + p.valor_centavos, 0)

  const totalPendenteAgoraCentavos = pagamentos
    .filter(p => (p.status === 'pendente' || p.status === 'atrasado') && (!p.vencimento || p.vencimento <= hoje))
    .reduce((s, p) => s + p.valor_centavos, 0)

  const totalPendenteFuturoCentavos = pagamentos
    .filter(p => (p.status === 'pendente' || p.status === 'atrasado') && p.vencimento && p.vencimento > hoje)
    .reduce((s, p) => s + p.valor_centavos, 0)

  const itensValorVariavel = itens.filter(i => i.valor_variavel_nota)

  // Agrupamento por cliente
  const porTenant = new Map<string, { nome: string; mrr: number; pendenteAgora: number }>()
  for (const i of itens) {
    const atual = porTenant.get(i.tenant_id) ?? { nome: i.tenants?.nome ?? '—', mrr: 0, pendenteAgora: 0 }
    if (i.tipo === 'recorrente' && !i.valor_variavel_nota) atual.mrr += i.valor_centavos
    porTenant.set(i.tenant_id, atual)
  }
  for (const p of pagamentos) {
    if ((p.status === 'pendente' || p.status === 'atrasado') && (!p.vencimento || p.vencimento <= hoje)) {
      const info = tenantPorItem.get(p.item_id)
      if (info) {
        const atual = porTenant.get(info.tenantId) ?? { nome: info.nome, mrr: 0, pendenteAgora: 0 }
        atual.pendenteAgora += p.valor_centavos
        porTenant.set(info.tenantId, atual)
      }
    }
  }

  const pagamentosRecentes = pagamentos
    .filter(p => p.status === 'pago' && p.pago_em)
    .sort((a, b) => new Date(b.pago_em!).getTime() - new Date(a.pago_em!).getTime())
    .slice(0, 10)

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Controle financeiro</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Visão consolidada da Assinatura de todos os clientes — dado real, vindo direto do painel de cada um.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs text-[var(--muted)] font-medium mb-1">MRR (recorrente fixo)</p>
          <p className="font-display font-extrabold text-2xl text-[var(--ink)]">{formatCentavos(mrrCentavos)}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs text-[var(--muted)] font-medium mb-1">Pendente agora</p>
          <p className={`font-display font-extrabold text-2xl ${totalPendenteAgoraCentavos > 0 ? 'text-red-600' : 'text-[var(--ink)]'}`}>
            {formatCentavos(totalPendenteAgoraCentavos)}
          </p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs text-[var(--muted)] font-medium mb-1">A vencer (futuro)</p>
          <p className="font-display font-extrabold text-2xl text-amber-600">{formatCentavos(totalPendenteFuturoCentavos)}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs text-[var(--muted)] font-medium mb-1">Já recebido (histórico)</p>
          <p className="font-display font-extrabold text-2xl text-emerald-600">{formatCentavos(totalPagoCentavos)}</p>
        </div>
      </div>

      {itensValorVariavel.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-bold text-sm text-[var(--muted)] uppercase tracking-wide mb-3">Valor variável (fora do MRR)</h2>
          <div className="flex flex-col gap-2">
            {itensValorVariavel.map(i => (
              <div key={i.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-amber-800">{i.label}</p>
                  <p className="text-xs text-amber-700">{tenantPorItem.get(i.id)?.nome}</p>
                </div>
                <p className="text-xs text-amber-700 text-right max-w-[50%]">{i.valor_variavel_nota}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-display font-bold text-sm text-[var(--muted)] uppercase tracking-wide mb-3">Por cliente</h2>
        {porTenant.size === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhum cliente com Assinatura ativa ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...porTenant.values()].map(t => (
              <div key={t.nome} className="flex items-center justify-between bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-3">
                <p className="text-sm font-bold text-[var(--ink)]">{t.nome}</p>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-[var(--muted)]">MRR</p>
                    <p className="text-sm font-bold text-[var(--ink)]">{formatCentavos(t.mrr)}</p>
                  </div>
                  {t.pendenteAgora > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] text-[var(--muted)]">Pendente</p>
                      <p className="text-sm font-bold text-red-600">{formatCentavos(t.pendenteAgora)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display font-bold text-sm text-[var(--muted)] uppercase tracking-wide mb-3">Pagamentos recentes</h2>
        {pagamentosRecentes.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhum pagamento registrado ainda.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {pagamentosRecentes.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm px-4 py-2.5 bg-[var(--off)] rounded-xl">
                <div>
                  <span className="font-semibold text-[var(--ink)]">{tenantPorItem.get(p.item_id)?.nome}</span>
                  <span className="text-[var(--muted)]"> — {labelPorItem.get(p.item_id)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[var(--muted)] text-xs">{formatDataCurta(p.pago_em)}</span>
                  <span className="font-bold text-emerald-600">{formatCentavos(p.valor_centavos)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
