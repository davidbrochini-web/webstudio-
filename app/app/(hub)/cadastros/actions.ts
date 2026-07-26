'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CadastroFormState {
  error?: string
  success?: boolean
}

// ── clientes / fornecedores (mesmo formato) ──────────────────────

type PessoaEntity = 'clientes' | 'fornecedores'

async function upsertPessoa(entity: PessoaEntity, _prev: CadastroFormState, formData: FormData): Promise<CadastroFormState> {
  const id = formData.get('id') as string | null
  const tenantId = formData.get('tenant_id') as string
  const tipoPessoa = formData.get('tipo_pessoa') as string
  const nome = (formData.get('nome') as string)?.trim()
  const cpfCnpj = (formData.get('cpf_cnpj') as string)?.trim() || null
  const telefone = (formData.get('telefone') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null
  const status = (formData.get('status') as string) || 'ativo'
  const observacoes = (formData.get('observacoes') as string)?.trim() || null

  if (!tenantId || !nome) return { error: 'Nome é obrigatório.' }

  const supabase = await createClient()
  const payload = { tenant_id: tenantId, tipo_pessoa: tipoPessoa, nome, cpf_cnpj: cpfCnpj, telefone, email, status, observacoes }

  const { error } = id
    ? await supabase.from(entity).update(payload).eq('id', id)
    : await supabase.from(entity).insert(payload)

  if (error) return { error: `Erro ao salvar: ${error.message}` }

  revalidatePath(`/app/cadastros/${entity}`)
  return { success: true }
}

async function deletePessoa(entity: PessoaEntity, id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from(entity).update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/app/cadastros/${entity}`)
}

export async function upsertCliente(prev: CadastroFormState, fd: FormData) {
  return upsertPessoa('clientes', prev, fd)
}
export async function deleteCliente(id: string) {
  return deletePessoa('clientes', id)
}
export async function upsertFornecedor(prev: CadastroFormState, fd: FormData) {
  return upsertPessoa('fornecedores', prev, fd)
}
export async function deleteFornecedor(id: string) {
  return deletePessoa('fornecedores', id)
}

// ── funcionários ──────────────────────────────────────────────────

export async function upsertFuncionario(_prev: CadastroFormState, formData: FormData): Promise<CadastroFormState> {
  const id = formData.get('id') as string | null
  const tenantId = formData.get('tenant_id') as string
  const nome = (formData.get('nome') as string)?.trim()
  const cpf = (formData.get('cpf') as string)?.trim() || null
  const cargo = (formData.get('cargo') as string)?.trim() || null
  const admissao = (formData.get('admissao') as string) || null
  const telefone = (formData.get('telefone') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null
  const status = (formData.get('status') as string) || 'ativo'
  const observacoes = (formData.get('observacoes') as string)?.trim() || null

  if (!tenantId || !nome) return { error: 'Nome é obrigatório.' }

  const supabase = await createClient()
  const payload = { tenant_id: tenantId, nome, cpf, cargo, admissao, telefone, email, status, observacoes }

  const { error } = id
    ? await supabase.from('funcionarios').update(payload).eq('id', id)
    : await supabase.from('funcionarios').insert(payload)

  if (error) return { error: `Erro ao salvar: ${error.message}` }

  revalidatePath('/app/cadastros/funcionarios')
  return { success: true }
}

export async function deleteFuncionario(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('funcionarios').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/cadastros/funcionarios')
}

// ── produtos / serviços ────────────────────────────────────────────

export async function upsertProdutoServico(_prev: CadastroFormState, formData: FormData): Promise<CadastroFormState> {
  const id = formData.get('id') as string | null
  const tenantId = formData.get('tenant_id') as string
  const tipo = (formData.get('tipo') as string) || 'produto'
  const nome = (formData.get('nome') as string)?.trim()
  const sku = (formData.get('sku') as string)?.trim() || null
  const precoStr = (formData.get('preco') as string)?.replace(',', '.').trim()
  const preco = precoStr ? Number(precoStr) : null
  const unidade = (formData.get('unidade') as string)?.trim() || 'un'
  const status = (formData.get('status') as string) || 'ativo'
  const observacoes = (formData.get('observacoes') as string)?.trim() || null

  if (!tenantId || !nome) return { error: 'Nome é obrigatório.' }
  if (precoStr && Number.isNaN(preco)) return { error: 'Preço inválido.' }

  const supabase = await createClient()
  const payload = { tenant_id: tenantId, tipo, nome, sku, preco, unidade, status, observacoes }

  const { error } = id
    ? await supabase.from('produtos_servicos').update(payload).eq('id', id)
    : await supabase.from('produtos_servicos').insert(payload)

  if (error) return { error: `Erro ao salvar: ${error.message}` }

  revalidatePath('/app/cadastros/produtos-servicos')
  return { success: true }
}

export async function deleteProdutoServico(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('produtos_servicos').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/cadastros/produtos-servicos')
}
