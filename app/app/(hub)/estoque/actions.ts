'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface EstoqueFormState {
  error?: string
  success?: boolean
}

export async function registrarMovimentacao(_prev: EstoqueFormState, formData: FormData): Promise<EstoqueFormState> {
  const tenantId = formData.get('tenant_id') as string
  const produtoId = formData.get('produto_id') as string
  const tipo = formData.get('tipo') as string
  const quantidadeRaw = formData.get('quantidade') as string
  const quantidade = parseInt(quantidadeRaw, 10)
  const motivo = (formData.get('motivo') as string)?.trim() || null
  const data = (formData.get('data') as string) || new Date().toISOString().slice(0, 10)
  const observacoes = (formData.get('observacoes') as string)?.trim() || null

  if (!tenantId || !produtoId) return { error: 'Selecione o produto.' }
  if (tipo !== 'entrada' && tipo !== 'saida') return { error: 'Tipo inválido.' }
  if (!Number.isInteger(quantidade) || quantidade <= 0) return { error: 'Quantidade precisa ser um número inteiro maior que zero.' }

  const supabase = await createClient()

  if (tipo === 'saida') {
    // Confere saldo antes de tirar do estoque — não impede saldo negativo
    // no banco (não há CHECK pra isso, ficaria complexo com concorrência),
    // mas evita o caso comum de erro de digitação no formulário.
    const { data: movs } = await supabase
      .from('estoque_movimentacoes')
      .select('tipo, quantidade')
      .eq('produto_id', produtoId)
      .is('deleted_at', null)
    const saldoAtual = (movs ?? []).reduce((s, m) => s + (m.tipo === 'entrada' ? m.quantidade : -m.quantidade), 0)
    if (quantidade > saldoAtual) {
      return { error: `Saldo insuficiente: há apenas ${saldoAtual} em estoque.` }
    }
  }

  const { error } = await supabase.from('estoque_movimentacoes').insert({
    tenant_id: tenantId,
    produto_id: produtoId,
    tipo,
    quantidade,
    motivo,
    data,
    observacoes,
  })

  if (error) return { error: `Erro ao registrar: ${error.message}` }

  revalidatePath('/app/estoque')
  revalidatePath('/app/estoque/movimentacoes')
  return { success: true }
}

export async function excluirMovimentacao(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('estoque_movimentacoes').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/estoque')
  revalidatePath('/app/estoque/movimentacoes')
}

export async function atualizarEstoqueMinimo(produtoId: string, valor: number | null) {
  const supabase = await createClient()
  const { error } = await supabase.from('produtos_servicos').update({ estoque_minimo: valor }).eq('id', produtoId)
  if (error) throw new Error(error.message)
  revalidatePath('/app/estoque')
}
