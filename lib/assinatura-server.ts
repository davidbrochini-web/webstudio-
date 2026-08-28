import { createClient } from '@/lib/supabase/server'

export interface PendenciaAtual {
  totalCentavos: number
  pagamentos: Array<{ id: string; valorCentavos: number; itemLabel: string }>
}

/**
 * Pendência "cobrável agora": pagamentos pendentes/atrasados cujo
 * vencimento já passou (ou não tem vencimento definido — ex: o
 * saldo do Projeto Especial, que não tem data fixa). Pagamentos
 * recorrentes com vencimento futuro (ex: 1ª mensalidade daqui a
 * duas semanas) não entram aqui — só quando a data chegar.
 */
export async function getPendenciaAtual(tenantId: string): Promise<PendenciaAtual> {
  const supabase = await createClient()
  const hoje = new Date().toISOString().slice(0, 10)

  const { data: itens } = await supabase
    .from('assinatura_itens')
    .select('id, label')
    .eq('tenant_id', tenantId)
    .eq('ativo', true)
    .is('deleted_at', null)

  if (!itens || itens.length === 0) return { totalCentavos: 0, pagamentos: [] }

  const itemIds = itens.map(i => i.id)
  const labelPorId = new Map(itens.map(i => [i.id, i.label]))

  const { data: pagamentosRaw } = await supabase
    .from('assinatura_pagamentos')
    .select('id, item_id, valor_centavos, status, vencimento')
    .in('item_id', itemIds)
    .in('status', ['pendente', 'atrasado'])
    .is('deleted_at', null)

  const pagamentos = (pagamentosRaw ?? [])
    .filter(p => !p.vencimento || p.vencimento <= hoje)
    .map(p => ({
      id: p.id as string,
      valorCentavos: p.valor_centavos as number,
      itemLabel: labelPorId.get(p.item_id as string) ?? '',
    }))

  const totalCentavos = pagamentos.reduce((s, p) => s + p.valorCentavos, 0)
  return { totalCentavos, pagamentos }
}
