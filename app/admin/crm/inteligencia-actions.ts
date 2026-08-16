'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/supabase/guards'
import { revalidatePath } from 'next/cache'

// ============================================================
// Tipos
// ============================================================

export interface AnaliseConversa {
  scoreAtendente: number
  perfilLead: string | null
  perfilConfirmado: boolean
  temperatura: string
  estagio: string
  checklistPct: number
  contemAudio: boolean
  ultimaAnaliseEm: string | null
}

export interface HitAnalise {
  id: string
  categoria: string
  subtipo: string | null
  direcao: 'enviada' | 'recebida'
  textoTrecho: string | null
  pesoAplicado: number
  falsoPositivo: boolean
  respostaRecomendada: string | null
  dicaAtendente: string | null
  createdAt: string
}

export interface QualificacaoItem {
  item: string
  essencial: boolean
  status: string
  textoSugerido: string
}

export interface InteresseItem {
  servico: string
  origem: string
  confirmado: boolean
}

export interface MensagemSimulada {
  id: string
  direcao: 'enviada' | 'recebida'
  texto: string
  createdAt: string
}

export interface EscalonamentoInfo {
  ativo: boolean
  motivos: string[]
}

// Texto sugerido por item de checklist — não fica no banco (o
// dicionário já tem os textos de detecção; a sugestão de pergunta é
// fixa por item, replicando §5.2 do blueprint).
const SUGESTOES_CHECKLIST: Record<string, string> = {
  tem_site: 'Hoje vocês têm site no ar ou a presença é só nas redes?',
  objetivo_principal: 'O que te fez procurar a gente agora — atrair mais cliente, organizar a operação, os dois?',
  urgencia_prazo: 'Você tem algum prazo em mente ou é algo pra estruturar com calma?',
  quem_decide: 'Além de você, mais alguém participa da decisão?',
  interesse_mapeado: 'Me conta o que você imagina: site novo, anúncio, sistema de gestão...?',
  faixa_investimento: 'Você já tem uma faixa de investimento em mente?',
  concorrente_citado: 'Chegou a receber orçamento de outra agência?',
  sistema_legado: 'Hoje vocês usam alguma planilha ou sistema pra isso?',
}

const ITENS_ESSENCIAIS = ['tem_site', 'objetivo_principal', 'urgencia_prazo', 'quem_decide', 'interesse_mapeado']
const ITENS_COMPLEMENTARES = ['faixa_investimento', 'concorrente_citado', 'sistema_legado']

// ============================================================
// "Me ajuda a responder" — sem IA. Olha os últimos hits recebidos
// (mais recente primeiro): se a última coisa relevante foi uma
// objeção, sugere a resposta recomendada já cadastrada no dicionário
// (§8 do blueprint). Se não, sugere a próxima pergunta pendente do
// checklist. Fallback genérico se não tiver nada ainda.
// ============================================================
const TOM_POR_PERFIL: Record<string, string> = {
  decidido: 'Não enrole: proponha o próximo passo concreto agora.',
  pesquisador: 'Mostre prova social — projetos no ar, diferencial claro.',
  preco: 'Nunca brigue por preço — reforce valor e o que está incluso.',
  desconfiado: 'Transparência total, sem promessa inflada.',
  ocupado: 'Seja breve — uma pergunta por vez, direto ao ponto.',
  entusiasmado: 'Valide o entusiasmo, mas mantenha o escopo em foco.',
}

export async function sugerirResposta(leadId: string): Promise<string> {
  await requireSuperAdmin()
  const supabase = await createClient()

  const { data: conversa } = await supabase
    .from('crm_analise_conversa')
    .select('perfil_lead')
    .eq('lead_id', leadId)
    .maybeSingle()

  const tom = conversa?.perfil_lead ? TOM_POR_PERFIL[conversa.perfil_lead] : null
  const prefixo = tom ? `[${tom}]\n\n` : ''

  const { data: hits, error: hitsError } = await supabase
    .from('crm_analise_hits')
    .select('created_at, direcao, falso_positivo, dicionario:crm_dicionario(categoria, resposta_recomendada)')
    .eq('lead_id', leadId)
    .eq('direcao', 'recebida')
    .eq('falso_positivo', false)
    .order('created_at', { ascending: false })
    .limit(10)

  if (hitsError) throw new Error(hitsError.message)

  for (const h of hits ?? []) {
    const dic = Array.isArray(h.dicionario) ? h.dicionario[0] : h.dicionario
    if (dic?.categoria === 'objecao' && dic.resposta_recomendada) {
      return prefixo + dic.resposta_recomendada
    }
  }

  const { data: qualificacao, error: qualError } = await supabase
    .from('crm_qualificacao')
    .select('item, essencial, status')
    .eq('lead_id', leadId)
    .eq('essencial', true)
    .eq('status', 'pendente')
    .order('item')

  if (qualError) throw new Error(qualError.message)

  const proximoItem = qualificacao?.[0]
  if (proximoItem && SUGESTOES_CHECKLIST[proximoItem.item]) {
    return prefixo + SUGESTOES_CHECKLIST[proximoItem.item]
  }

  return prefixo + 'Posso te ajudar com mais alguma coisa ou já fica claro o próximo passo?'
}

// ============================================================
// Leitura consolidada — tudo que o painel precisa numa chamada só
// ============================================================
export async function getCrmInteligencia(leadId: string) {
  await requireSuperAdmin()
  const supabase = await createClient()

  const [conversaRes, hitsRes, qualificacaoRes, interessesRes, mensagensRes] = await Promise.all([
    supabase.from('crm_analise_conversa').select('*').eq('lead_id', leadId).maybeSingle(),
    supabase
      .from('crm_analise_hits')
      .select('id, direcao, texto_trecho, peso_aplicado, falso_positivo, created_at, dicionario:crm_dicionario(categoria, subtipo, resposta_recomendada, dica_atendente)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase.from('crm_qualificacao').select('item, essencial, status').eq('lead_id', leadId),
    supabase.from('crm_interesses_lead').select('servico, origem, confirmado').eq('lead_id', leadId),
    supabase.from('crm_simulador_mensagens').select('id, direcao, texto, created_at').eq('lead_id', leadId).order('created_at', { ascending: true }),
  ])

  if (conversaRes.error) throw new Error(conversaRes.error.message)
  if (hitsRes.error) throw new Error(hitsRes.error.message)
  if (qualificacaoRes.error) throw new Error(qualificacaoRes.error.message)
  if (interessesRes.error) throw new Error(interessesRes.error.message)
  if (mensagensRes.error) throw new Error(mensagensRes.error.message)

  const conversa: AnaliseConversa | null = conversaRes.data
    ? {
        scoreAtendente: conversaRes.data.score_atendente,
        perfilLead: conversaRes.data.perfil_lead,
        perfilConfirmado: conversaRes.data.perfil_confirmado,
        temperatura: conversaRes.data.temperatura,
        estagio: conversaRes.data.estagio,
        checklistPct: Number(conversaRes.data.checklist_pct),
        contemAudio: conversaRes.data.contem_audio,
        ultimaAnaliseEm: conversaRes.data.ultima_analise_em,
      }
    : null

  const hits: HitAnalise[] = (hitsRes.data ?? []).map(h => {
    const dic = Array.isArray(h.dicionario) ? h.dicionario[0] : h.dicionario
    return {
      id: h.id,
      categoria: dic?.categoria ?? 'desconhecida',
      subtipo: dic?.subtipo ?? null,
      direcao: h.direcao,
      textoTrecho: h.texto_trecho,
      pesoAplicado: h.peso_aplicado,
      falsoPositivo: h.falso_positivo,
      respostaRecomendada: dic?.resposta_recomendada ?? null,
      dicaAtendente: dic?.dica_atendente ?? null,
      createdAt: h.created_at,
    }
  })

  // Checklist: sempre mostra os 8 itens fixos, mesmo antes do primeiro
  // "Registrar conversa" ter rodado (senão o painel fica vazio até lá).
  const statusPorItem = new Map((qualificacaoRes.data ?? []).map(q => [q.item, q.status]))
  const checklist: QualificacaoItem[] = [...ITENS_ESSENCIAIS, ...ITENS_COMPLEMENTARES].map(item => ({
    item,
    essencial: ITENS_ESSENCIAIS.includes(item),
    status: statusPorItem.get(item) ?? 'pendente',
    textoSugerido: SUGESTOES_CHECKLIST[item] ?? '',
  }))

  const interesses: InteresseItem[] = (interessesRes.data ?? []).map(i => ({
    servico: i.servico,
    origem: i.origem,
    confirmado: i.confirmado,
  }))

  const mensagens: MensagemSimulada[] = (mensagensRes.data ?? []).map(m => ({
    id: m.id,
    direcao: m.direcao,
    texto: m.texto,
    createdAt: m.created_at,
  }))

  // Escalonamento (§9 do blueprint): E1/E2/E3/E6 vêm de hits de
  // categoria='escalonamento' não marcados falso_positivo; E7 vem do
  // score do atendente. E4/E5 (tempo/estado) calculados aqui, sem
  // pg_cron ainda — recalculado toda vez que o card é aberto.
  const motivos: string[] = []
  const rotuloEscalonamento: Record<string, string> = {
    juridico: 'pergunta jurídica/contratual',
    mudanca_escopo: 'mudança de escopo em cliente ativo',
    pedido_desconto: 'pedido de desconto',
    reclamacao: 'reclamação',
  }
  for (const h of hits) {
    if (h.categoria === 'escalonamento' && !h.falsoPositivo) {
      const rotulo = rotuloEscalonamento[h.subtipo ?? ''] ?? h.subtipo ?? 'padrão detectado'
      if (!motivos.includes(rotulo)) motivos.push(rotulo)
    }
  }
  if (conversa && conversa.scoreAtendente < 40) {
    motivos.push('termômetro do atendente no vermelho')
  }
  if (conversa && conversa.checklistPct === 100 && conversa.perfilLead === 'decidido' && conversa.estagio !== 'proposta_enviada') {
    motivos.push('checklist completo + perfil decidido — pronto pra proposta')
  }

  const escalonamento: EscalonamentoInfo = { ativo: motivos.length > 0, motivos }

  return { conversa, hits, checklist, interesses, mensagens, escalonamento }
}

// ============================================================
// Registrar conversa colada (bloco de texto [A]/[C])
// ============================================================
export async function getMensagensSimuladas(leadId: string): Promise<MensagemSimulada[]> {
  await requireSuperAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_simulador_mensagens')
    .select('id, direcao, texto, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(m => ({ id: m.id, direcao: m.direcao, texto: m.texto, createdAt: m.created_at }))
}

export interface DetalheFeedback {
  categoria: string
  texto: string
}

export interface ResultadoAnalise {
  score_atendente: number
  perfil_lead: string | null
  checklist_pct: number
  hits_novos: number
  detalhes: DetalheFeedback[]
}

export async function registrarConversaColada(leadId: string, texto: string): Promise<ResultadoAnalise | null> {
  await requireSuperAdmin()
  if (!texto.trim()) throw new Error('Cole a conversa antes de analisar.')

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('analisar_texto_colado', {
    p_lead_id: leadId,
    p_texto: texto,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
  return data?.[0] ?? null
}

// ============================================================
// Simulador de WhatsApp — 1 mensagem por vez, mesmo caminho que o
// webhook real vai usar na Fase 3.
// ============================================================
export async function enviarMensagemSimulada(leadId: string, direcao: 'enviada' | 'recebida', texto: string): Promise<ResultadoAnalise | null> {
  await requireSuperAdmin()
  if (!texto.trim()) throw new Error('Digite uma mensagem.')

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('registrar_mensagem_simulada', {
    p_lead_id: leadId,
    p_direcao: direcao,
    p_texto: texto,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
  return data?.[0] ?? null
}

// ============================================================
// Resetar simulação — apaga o transcript E a análise derivada dele
// (hits, interesses, checklist volta pendente, conversa volta ao
// estado inicial), pra treinar do zero quando quiser.
// ============================================================
export async function resetarSimulacao(leadId: string) {
  await requireSuperAdmin()
  const supabase = await createClient()
  const { error } = await supabase.rpc('resetar_simulacao_lead', { p_lead_id: leadId })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

// ============================================================
// Falso positivo
// ============================================================
export async function marcarFalsoPositivo(hitId: string) {
  await requireSuperAdmin()
  const supabase = await createClient()
  const { error } = await supabase.rpc('marcar_hit_falso_positivo', { p_hit_id: hitId })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

// ============================================================
// Overrides manuais — perfil, estágio, checklist, interesse
// ============================================================
export async function confirmarPerfilManual(leadId: string, perfil: string | null) {
  await requireSuperAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('crm_analise_conversa')
    .update({ perfil_lead: perfil, perfil_confirmado: perfil !== null })
    .eq('lead_id', leadId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

const ESTAGIOS_VALIDOS = [
  'novo', 'contato_iniciado', 'qualificando', 'qualificado',
  'proposta_enviada', 'negociacao', 'fechado_ganho', 'fechado_perdido',
]

export async function atualizarEstagioManual(leadId: string, estagio: string) {
  await requireSuperAdmin()
  if (!ESTAGIOS_VALIDOS.includes(estagio)) throw new Error('Estágio inválido.')
  const supabase = await createClient()
  const { error } = await supabase
    .from('crm_analise_conversa')
    .update({ estagio })
    .eq('lead_id', leadId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

export async function confirmarChecklistItem(leadId: string, item: string, status: 'confirmado' | 'nao_se_aplica' | 'pendente') {
  await requireSuperAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('crm_qualificacao')
    .upsert(
      {
        lead_id: leadId,
        item,
        status,
        confirmado_em: status === 'confirmado' ? new Date().toISOString() : null,
        confirmado_por: status === 'confirmado' ? user?.id : null,
      },
      { onConflict: 'lead_id,item' }
    )
  if (error) throw new Error(error.message)

  await supabase.rpc('recalcular_analise_lead', { p_lead_id: leadId })
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

// ============================================================
// Fila de follow-up (Fase 2, §7 do blueprint) — envio continua manual;
// isso só calcula quem precisa de contato hoje e evita repetir no
// mesmo dia (view crm_fila_followup já cuida da regra de negócio).
// ============================================================
export interface FilaFollowupItem {
  leadId: string
  nome: string
  telefone: string | null
  textoEnvio: string | null
  estagio: string
  temperatura: string
  perfilLead: string | null
  ultimaMsgRecebidaEm: string | null
  momento: string
  template: string | null
}

export async function getFilaFollowup(): Promise<FilaFollowupItem[]> {
  await requireSuperAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('crm_fila_followup')
    .select('*')
    .order('ultima_msg_recebida_em', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map(f => ({
    leadId: f.lead_id,
    nome: f.nome,
    telefone: f.telefone,
    textoEnvio: f.texto_envio,
    estagio: f.estagio,
    temperatura: f.temperatura,
    perfilLead: f.perfil_lead,
    ultimaMsgRecebidaEm: f.ultima_msg_recebida_em,
    momento: f.momento,
    template: f.template,
  }))
}

export async function marcarFollowupEnviado(leadId: string) {
  await requireSuperAdmin()
  const supabase = await createClient()
  const { error } = await supabase.rpc('marcar_followup_enviado', { p_lead_id: leadId })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/followups')
}

// ============================================================
// Templates da régua — editáveis direto na tela da fila (texto fica
// vazio até alguém escrever; ver pendência no blueprint §7.3).
// ============================================================
export interface TemplateFollowup {
  momento: string
  condicao: string
  template: string | null
}

export async function getTemplatesFollowup(): Promise<TemplateFollowup[]> {
  await requireSuperAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_regua_followup')
    .select('momento, condicao, template')
    .order('momento')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function salvarTemplateFollowup(momento: string, template: string) {
  await requireSuperAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('crm_regua_followup')
    .update({ template })
    .eq('momento', momento)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/followups')
}

export async function confirmarInteresse(leadId: string, servico: string, confirmado: boolean) {
  await requireSuperAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('crm_interesses_lead')
    .upsert(
      {
        lead_id: leadId,
        servico,
        confirmado,
        origem: 'manual',
        confirmado_em: confirmado ? new Date().toISOString() : null,
        confirmado_por: confirmado ? user?.id : null,
      },
      { onConflict: 'lead_id,servico' }
    )
  if (error) throw new Error(error.message)
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}
