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
    .select('id, slug, label, tipo, valor_centavos, documentacao_titulo, documentacao_conteudo, guia_titulo, guia_conteudo, ativo, ordem, assinatura_pagamentos(id, valor_centavos, status, referencia, vencimento, pago_em)')
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
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
    <div className="relative aspect-square bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-3 sm:p-4 flex flex-col">
      <span className="self-start inline-block text-[9px] font-bold uppercase tracking-wider text-white bg-[#0EA5A0] px-2 py-0.5 rounded-full mb-2">
        Ativo
      </span>

      <p className="font-display font-bold text-[13px] sm:text-sm text-[var(--ink)] leading-snug line-clamp-2 mb-auto">
        {item.label}
      </p>

      {item.tipo === 'unico' ? (
        <div className="mt-2 pt-2 border-t border-[var(--border)] flex flex-col gap-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-[var(--muted)]">Pago</span>
            <span className="text-xs font-bold text-emerald-500">{formatCentavos(pago)}</span>
          </div>
          {pendente > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-[var(--muted)]">Pendência</span>
              <span className="text-xs font-bold text-amber-500">{formatCentavos(pendente)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-[var(--muted)]">Total</span>
            <span className="text-xs font-bold text-[var(--ink)]">{formatCentavos(item.valor_centavos)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-2 pt-2 border-t border-[var(--border)] flex flex-col gap-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-[var(--muted)]">Mensal</span>
            <span className="text-xs font-bold text-[var(--ink)]">{formatCentavos(item.valor_centavos)}</span>
          </div>
          {proximoVencimento && (
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-[var(--muted)]">
                {proximoVencimento.status === 'atrasado' ? 'Vencido' : '1º pag.'}
              </span>
              <span className={`text-xs font-bold ${proximoVencimento.status === 'atrasado' ? 'text-red-500' : 'text-amber-500'}`}>
                {formatDataCurta(proximoVencimento.vencimento)}
              </span>
            </div>
          )}
        </div>
      )}

      {(item.documentacao_conteudo || item.guia_conteudo) && (
        <div className="flex gap-1.5 mt-3">
          {item.documentacao_conteudo && item.documentacao_titulo && (
            <DocumentacaoModal
              titulo={item.documentacao_titulo}
              conteudo={item.documentacao_conteudo}
              icone="📄"
              label="Docs"
              variant="destaque"
            />
          )}
          {item.guia_conteudo && item.guia_titulo && (
            <DocumentacaoModal
              titulo={item.guia_titulo}
              conteudo={item.guia_conteudo}
              icone="📘"
              label="Guia"
              variant="destaque"
            />
          )}
        </div>
      )}
    </div>
  )
}
