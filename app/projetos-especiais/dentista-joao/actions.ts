'use server'

import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'

export interface ContatoFormState {
  error?: string
  success?: boolean
}

export async function enviarSolicitacaoConsulta(_prev: ContatoFormState, formData: FormData): Promise<ContatoFormState> {
  const nome = (formData.get('nome') as string)?.trim()
  const sobrenome = (formData.get('sobrenome') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const telefone = (formData.get('telefone') as string)?.trim()
  const dataDesejada = (formData.get('data_desejada') as string) || null
  const periodo = (formData.get('periodo') as string) || null

  if (!nome || !sobrenome) return { error: 'Preencha nome e sobrenome.' }
  if (!email && !telefone) return { error: 'Informe e-mail ou telefone pra retornarmos.' }
  if (periodo && periodo !== 'manha' && periodo !== 'tarde') return { error: 'Período inválido.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { error } = await supabase.from('site_leads').insert({
    site_id: site.id,
    nome: `${nome} ${sobrenome}`,
    contato: email || telefone,
    mensagem: telefone && email ? `Telefone: ${telefone}` : '',
    data_desejada: dataDesejada,
    periodo,
  })

  if (error) return { error: `Erro ao enviar: ${error.message}` }
  return { success: true }
}

// Newsletter do rodapé — reaproveita site_leads (sem criar tabela nova).
// IMPORTANTE: isso só captura o interesse. Disparo automático de e-mail
// pra quem se inscreve continua fora de escopo (seção 8 do handoff) —
// a lista fica visível pro cliente em "Leads recebidos", quem envia é
// manual, como o resto dos contatos do formulário.
export async function inscreverNewsletter(_prev: ContatoFormState, formData: FormData): Promise<ContatoFormState> {
  const nome = (formData.get('nome') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  if (!nome || !email) return { error: 'Preencha nome e e-mail.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { error } = await supabase.from('site_leads').insert({
    site_id: site.id,
    nome,
    contato: email,
    mensagem: 'Inscrição na newsletter',
  })

  if (error) return { error: `Erro ao inscrever: ${error.message}` }
  return { success: true }
}

// ── Agendamento público (E7) ─────────────────────────────────────
export interface AgendamentoFormState {
  error?: string
  success?: boolean
}

export async function criarAgendamentoPublico(_prev: AgendamentoFormState, formData: FormData): Promise<AgendamentoFormState> {
  const nome = (formData.get('nome') as string)?.trim()
  const telefone = (formData.get('telefone') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const mensagem = (formData.get('mensagem') as string)?.trim() || null
  const tipoConsultaId = (formData.get('tipo_consulta_id') as string) || null
  const data = formData.get('data') as string
  const horaInicio = formData.get('hora_inicio') as string
  const horaFim = formData.get('hora_fim') as string

  if (!nome) return { error: 'Preencha o nome.' }
  if (!telefone) return { error: 'Preencha o telefone.' }
  if (!email) return { error: 'Preencha o e-mail.' }
  if (!data || !horaInicio || !horaFim) return { error: 'Selecione um horário disponível.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  // Checar max pendentes por telefone
  const { data: config } = await supabase.from('agendamento_config')
    .select('max_pendentes_por_telefone').eq('site_id', site.id).single()
  if (config) {
    const { count } = await supabase.from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', site.id)
      .eq('paciente_telefone', telefone.replace(/\D/g, ''))
      .eq('status', 'pendente')
    if (count !== null && count >= config.max_pendentes_por_telefone) {
      return { error: `Você já tem ${count} agendamento(s) pendente(s). Aguarde a confirmação antes de agendar novamente.` }
    }
  }

  const { error } = await supabase.from('agendamentos').insert({
    site_id: site.id,
    tipo_consulta_id: tipoConsultaId || null,
    data,
    hora_inicio: horaInicio,
    hora_fim: horaFim,
    paciente_nome: nome,
    paciente_telefone: telefone.replace(/\D/g, ''),
    paciente_email: email,
    mensagem,
    status: 'pendente',
  })

  if (error) {
    if (error.code === '23505' || error.message.includes('agendamentos_slot_unico'))
      return { error: 'Este horário acabou de ser reservado por outra pessoa. Escolha outro.' }
    return { error: `Erro ao agendar: ${error.message}` }
  }
  return { success: true }
}

// ── Meus Agendamentos (E10+E11) ──────────────────────────────────
export interface OtpFormState {
  error?: string
  agendamentos?: {
    id: string
    data: string
    hora_inicio: string
    hora_fim: string
    status: string
    tipo_consulta: { nome: string } | null
    created_at: string
  }[]
}

export async function consultarAgendamentos(_prev: OtpFormState, formData: FormData): Promise<OtpFormState> {
  const email = (formData.get('email') as string)?.trim()
  const codigo = (formData.get('codigo') as string)?.trim()
  if (!email) return { error: 'Informe o e-mail.' }
  if (codigo !== '000000') return { error: 'Código inválido.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { data: agendamentos } = await supabase
    .from('agendamentos')
    .select('id, data, hora_inicio, hora_fim, status, tipo_consulta:agendamento_tipos_consulta(nome), created_at')
    .eq('site_id', site.id)
    .eq('paciente_email', email)
    .order('data', { ascending: false })
    .limit(20)

  return { agendamentos: (agendamentos ?? []) as unknown as OtpFormState['agendamentos'] }
}

export interface CancelState { error?: string; success?: boolean }

export async function cancelarAgendamentoPaciente(_prev: CancelState, formData: FormData): Promise<CancelState> {
  const id = formData.get('id') as string
  const email = formData.get('email') as string
  if (!id || !email) return { error: 'Dados incompletos.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  // Verify ownership + check antecedência
  const { data: ag } = await supabase.from('agendamentos')
    .select('id, data, hora_inicio, status, site_id')
    .eq('id', id).eq('paciente_email', email).eq('site_id', site.id).single()

  if (!ag) return { error: 'Agendamento não encontrado.' }
  if (ag.status === 'cancelado') return { error: 'Esse agendamento já foi cancelado.' }
  if (ag.status === 'realizado') return { error: 'Não é possível cancelar uma consulta já realizada.' }

  const { data: config } = await supabase.from('agendamento_config')
    .select('antecedencia_minima_horas').eq('site_id', site.id).single()
  if (config) {
    const slotDate = new Date(`${ag.data}T${ag.hora_inicio}`)
    const horasAte = (slotDate.getTime() - Date.now()) / (60 * 60 * 1000)
    if (horasAte < config.antecedencia_minima_horas) {
      return { error: `Cancelamento permitido até ${config.antecedencia_minima_horas}h antes da consulta.` }
    }
  }

  const { error } = await supabase.from('agendamentos')
    .update({ status: 'cancelado' }).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
