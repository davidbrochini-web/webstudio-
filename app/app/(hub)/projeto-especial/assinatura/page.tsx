import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import DocumentacaoModal from '@/components/projeto-especial/DocumentacaoModal'
import {
  type AssinaturaItem,
  formatCentavos,
  formatDataCurta,
  MODULOS_DISPONIVEIS_CLIENTE,
} from '@/lib/assinatura'

export default async function AssinaturaPage() {
  const info = await getCurrentTenant()
  if (!info) return null

  const supabase = await createClient()
  const { data: itensRaw } = await supabase
    .from('assinatura_itens')
    .select('id, slug, label, tipo, valor_centavos, documentacao_titulo, documentacao_conteudo, ativo, ordem, assinatura_pagamentos(id, valor_centavos, status, referencia, vencimento, pago_em)')
    .eq('tenant_id', info.tenantId)
    .eq('ativo', true)
    .is('deleted_at', null)
    .order('ordem')

  const itens = (itensRaw ?? []).map(i => ({
    ...i,
    pagamentos: (i as unknown as { assinatura_pagamentos: AssinaturaItem['pagamentos'] }).assinatura_pagamentos ?? [],
  })) as AssinaturaItem[]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Assinatura</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Assinatura</h1>
      <p className="text-[var(--muted)] text-sm mb-8">O que está ativo no seu projeto e o que mais está disponível.</p>

      {itens.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhum item de assinatura cadastrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-4 mb-12">
          {itens.map(item => <ItemAtivoCard key={item.id} item={item} />)}
        </div>
      )}

      <h2 className="font-display font-bold text-lg text-[var(--ink)] mb-1">Outros módulos disponíveis</h2>
      <p className="text-[var(--muted)] text-sm mb-5">
        Ainda não fazem parte do seu plano. Fale com a gente se quiser saber mais.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODULOS_DISPONIVEIS_CLIENTE.map(m => (
          <div
            key={m.label}
            className="flex items-center justify-between gap-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl px-5 py-4 opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{m.icone}</span>
              <span className="font-medium text-sm text-[var(--ink)]">{m.label}</span>
            </div>
            <span className="text-xs text-[var(--muted)] whitespace-nowrap">Setup + Mensalidade</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ItemAtivoCard({ item }: { item: AssinaturaItem }) {
  const pago = item.pagamentos.filter(p => p.status === 'pago').reduce((s, p) => s + p.valor_centavos, 0)
  const pendente = item.pagamentos
    .filter(p => p.status === 'pendente' || p.status === 'atrasado')
    .reduce((s, p) => s + p.valor_centavos, 0)
  const proximoVencimento = item.pagamentos
    .filter(p => p.status !== 'pago' && p.vencimento)
    .sort((a, b) => (a.vencimento! < b.vencimento! ? -1 : 1))[0]

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white bg-[#0EA5A0] px-2.5 py-1 rounded-full mb-2">
            Ativo
          </span>
          <p className="font-display font-bold text-lg text-[var(--ink)]">{item.label}</p>
        </div>
        {item.documentacao_conteudo && item.documentacao_titulo && (
          <DocumentacaoModal titulo={item.documentacao_titulo} conteudo={item.documentacao_conteudo} />
        )}
      </div>

      {item.tipo === 'unico' ? (
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <p className="text-[var(--muted)] text-xs">Valor total</p>
            <p className="font-bold text-[var(--ink)]">{formatCentavos(item.valor_centavos)}</p>
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs">Pago</p>
            <p className="font-bold text-emerald-600">{formatCentavos(pago)}</p>
          </div>
          {pendente > 0 && (
            <div>
              <p className="text-[var(--muted)] text-xs">Pendência</p>
              <p className="font-bold text-amber-600">{formatCentavos(pendente)}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <p className="text-[var(--muted)] text-xs">Mensalidade</p>
            <p className="font-bold text-[var(--ink)]">{formatCentavos(item.valor_centavos)}/mês</p>
          </div>
          {proximoVencimento && (
            <div>
              <p className="text-[var(--muted)] text-xs">
                {proximoVencimento.status === 'atrasado' ? 'Vencido em' : 'Primeiro pagamento'}
              </p>
              <p className={`font-bold ${proximoVencimento.status === 'atrasado' ? 'text-red-600' : 'text-amber-600'}`}>
                {formatDataCurta(proximoVencimento.vencimento)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
