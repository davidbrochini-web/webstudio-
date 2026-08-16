'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/supabase/guards'
import { revalidatePath } from 'next/cache'

export interface PadraoDicionario {
  id: string
  categoria: string
  subtipo: string | null
  padrao: string
  tipoMatch: string
  peso: number
  direcaoAlvo: string
  respostaRecomendada: string | null
  dicaAtendente: string | null
  ativo: boolean
  disparos: number
  falsosPositivos: number
}

const CATEGORIAS_VALIDAS = [
  'atendente_erro', 'atendente_acerto', 'perfil_lead', 'objecao',
  'interesse', 'qualificacao', 'escalonamento',
]
const DIRECOES_VALIDAS = ['enviada', 'recebida', 'ambas']

export async function listarDicionario(): Promise<PadraoDicionario[]> {
  await requireSuperAdmin()
  const supabase = await createClient()

  const [dicRes, hitsRes] = await Promise.all([
    supabase
      .from('crm_dicionario')
      .select('id, categoria, subtipo, padrao, tipo_match, peso, direcao_alvo, resposta_recomendada, dica_atendente, ativo')
      .order('categoria')
      .order('subtipo')
      .order('padrao'),
    supabase.from('crm_analise_hits').select('dicionario_id, falso_positivo'),
  ])

  if (dicRes.error) throw new Error(dicRes.error.message)
  if (hitsRes.error) throw new Error(hitsRes.error.message)

  const disparosPorPadrao = new Map<string, { total: number; fp: number }>()
  for (const h of hitsRes.data ?? []) {
    const atual = disparosPorPadrao.get(h.dicionario_id) ?? { total: 0, fp: 0 }
    atual.total++
    if (h.falso_positivo) atual.fp++
    disparosPorPadrao.set(h.dicionario_id, atual)
  }

  return (dicRes.data ?? []).map(d => ({
    id: d.id,
    categoria: d.categoria,
    subtipo: d.subtipo,
    padrao: d.padrao,
    tipoMatch: d.tipo_match,
    peso: d.peso,
    direcaoAlvo: d.direcao_alvo,
    respostaRecomendada: d.resposta_recomendada,
    dicaAtendente: d.dica_atendente,
    ativo: d.ativo,
    disparos: disparosPorPadrao.get(d.id)?.total ?? 0,
    falsosPositivos: disparosPorPadrao.get(d.id)?.fp ?? 0,
  }))
}

export async function adicionarPadrao(dados: {
  categoria: string
  subtipo: string
  padrao: string
  peso: number
  direcaoAlvo: string
  dicaAtendente?: string
  respostaRecomendada?: string
}) {
  await requireSuperAdmin()

  if (!CATEGORIAS_VALIDAS.includes(dados.categoria)) throw new Error('Categoria inválida.')
  if (!DIRECOES_VALIDAS.includes(dados.direcaoAlvo)) throw new Error('Direção inválida.')
  if (!dados.padrao.trim() || dados.padrao.trim().length < 3) throw new Error('Padrão precisa ter pelo menos 3 caracteres.')
  if (!dados.subtipo.trim()) throw new Error('Subtipo é obrigatório.')
  if (dados.peso < -30 || dados.peso > 30) throw new Error('Peso deve estar entre -30 e +30.')

  const supabase = await createClient()

  const { data: existente } = await supabase
    .from('crm_dicionario')
    .select('id')
    .eq('categoria', dados.categoria)
    .eq('padrao', dados.padrao.trim().toLowerCase())
    .maybeSingle()

  if (existente) throw new Error('Já existe um padrão idêntico nessa categoria.')

  const { error } = await supabase.from('crm_dicionario').insert({
    categoria: dados.categoria,
    subtipo: dados.subtipo.trim(),
    padrao: dados.padrao.trim().toLowerCase(),
    tipo_match: 'ilike',
    peso: dados.peso,
    direcao_alvo: dados.direcaoAlvo,
    dica_atendente: dados.dicaAtendente?.trim() || null,
    resposta_recomendada: dados.respostaRecomendada?.trim() || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/dicionario')
}

export async function atualizarPadrao(id: string, dados: {
  peso?: number
  dicaAtendente?: string | null
  respostaRecomendada?: string | null
}) {
  await requireSuperAdmin()
  if (dados.peso !== undefined && (dados.peso < -30 || dados.peso > 30)) throw new Error('Peso deve estar entre -30 e +30.')

  const supabase = await createClient()
  const updates: Record<string, unknown> = {}
  if (dados.peso !== undefined) updates.peso = dados.peso
  if (dados.dicaAtendente !== undefined) updates.dica_atendente = dados.dicaAtendente?.trim() || null
  if (dados.respostaRecomendada !== undefined) updates.resposta_recomendada = dados.respostaRecomendada?.trim() || null

  const { error } = await supabase.from('crm_dicionario').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/dicionario')
}

export async function alternarAtivoPadrao(id: string, ativo: boolean) {
  await requireSuperAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('crm_dicionario').update({ ativo }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/dicionario')
}

export interface MatchTeste {
  categoria: string
  subtipo: string | null
  padrao: string
  peso: number
  dicaAtendente: string | null
  respostaRecomendada: string | null
}

export async function testarFrase(texto: string, direcao: 'enviada' | 'recebida'): Promise<MatchTeste[]> {
  await requireSuperAdmin()
  if (!texto.trim()) throw new Error('Digite uma frase pra testar.')

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('testar_frase_dicionario', {
    p_texto: texto,
    p_direcao: direcao,
  })

  if (error) throw new Error(error.message)

  return (data ?? []).map((m: { categoria: string; subtipo: string | null; padrao: string; peso: number; dica_atendente: string | null; resposta_recomendada: string | null }) => ({
    categoria: m.categoria,
    subtipo: m.subtipo,
    padrao: m.padrao,
    peso: m.peso,
    dicaAtendente: m.dica_atendente,
    respostaRecomendada: m.resposta_recomendada,
  }))
}
