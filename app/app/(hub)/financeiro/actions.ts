'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface FinanceiroFormState {
  error?: string
  success?: boolean
}

// ── contas a pagar / contas a receber (mesmo formato, tabela e
//    campo de "parte" diferentes: fornecedor_id vs cliente_id) ────

type ContaEntity = 'contas_pagar' | 'contas_receber'

async function upsertConta(
  entity: ContaEntity,
  parteField: 'fornecedor_id' | 'cliente_id',
  dataField: 'data_pagamento' | 'data_recebimento',
  statusPago: 'pago' | 'recebido',
  _prev: FinanceiroFormState,
  formData: FormData
): Promise<FinanceiroFormState> {
  const id = formData.get('id') as string | null
  const tenantId = formData.get('tenant_id') as string
  const parteId = (formData.get(parteField) as string) || null
  const descricao = (formData.get('descricao') as string)?.trim()
  const categoria = (formData.get('categoria') as string)?.trim() || null
  const valorRaw = (formData.get('valor') as string)?.replace(',', '.')
  const valor = valorRaw ? parseFloat(valorRaw) : NaN
  const vencimento = formData.get('vencimento') as string
  const status = (formData.get('status') as string) || 'pendente'
  const dataBaixa = (formData.get('data_baixa') as string) || null
  const observacoes = (formData.get('observacoes') as string)?.trim() || null

  if (!tenantId || !descricao) return { error: 'Descrição é obrigatória.' }
  if (!vencimento) return { error: 'Vencimento é obrigatório.' }
  if (isNaN(valor) || valor < 0) return { error: 'Valor inválido.' }
  if (status === statusPago && !dataBaixa) {
    return { error: `Informe a data de ${statusPago === 'pago' ? 'pagamento' : 'recebimento'}.` }
  }

  const supabase = await createClient()
  const payload = {
    tenant_id: tenantId,
    [parteField]: parteId,
    descricao,
    categoria,
    valor,
    vencimento,
    [dataField]: status === statusPago ? dataBaixa : null,
    status,
    observacoes,
  }

  const { error } = id
    ? await supabase.from(entity).update(payload).eq('id', id)
    : await supabase.from(entity).insert(payload)

  if (error) return { error: `Erro ao salvar: ${error.message}` }

  revalidatePath('/app/financeiro')
  revalidatePath(`/app/financeiro/${entity === 'contas_pagar' ? 'contas-pagar' : 'contas-receber'}`)
  return { success: true }
}

async function deleteConta(entity: ContaEntity, id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from(entity).update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/financeiro')
  revalidatePath(`/app/financeiro/${entity === 'contas_pagar' ? 'contas-pagar' : 'contas-receber'}`)
}

export async function upsertContaPagar(prev: FinanceiroFormState, fd: FormData) {
  return upsertConta('contas_pagar', 'fornecedor_id', 'data_pagamento', 'pago', prev, fd)
}
export async function deleteContaPagar(id: string) {
  return deleteConta('contas_pagar', id)
}

export async function upsertContaReceber(prev: FinanceiroFormState, fd: FormData) {
  return upsertConta('contas_receber', 'cliente_id', 'data_recebimento', 'recebido', prev, fd)
}
export async function deleteContaReceber(id: string) {
  return deleteConta('contas_receber', id)
}
