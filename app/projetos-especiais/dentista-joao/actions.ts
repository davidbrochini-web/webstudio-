'use server'

import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import {
  notificarLeadNovo,
  notificarAgendamentoRecebidoPaciente,
  notificarAgendamentoNovoAdmin,
  enviarCodigoAcesso,
} from '@/lib/dentista-joao-email'

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
  if (periodo && periodo !== 'manha' && periodo !== 'tarde' && periodo !== 'noite') return { error: 'Período inválido.' }

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

  // Notificação por e-mail é best-effort — nunca bloqueia o envio do
  // lead, que já está gravado no banco (visível em "Leads recebidos"
  // mesmo se o e-mail falhar).
  notificarLeadNovo({
    emailDestino: site.email_notificacoes,
    nome: `${nome} ${sobrenome}`,
    contato: email || telefone,
    origem: 'Formulário de contato',
    mensagem: telefone && email ? `Telefone: ${telefone}` : null,
  }).catch(err => console.error('[dentista-joao] falha ao notificar lead novo:', err))

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

  // Notifica o admin que alguém se inscreveu — diferente do disparo
  // automático PRO inscrito (esse continua fora de escopo, ver
  // comentário acima da função).
  notificarLeadNovo({
    emailDestino: site.email_notificacoes,
    nome,
    contato: email,
    origem: 'Inscrição na newsletter',
  }).catch(err => console.error('[dentista-joao] falha ao notificar inscrição newsletter:', err))

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
  const email = (formData.get('email') as string)?.trim().toLowerCase()
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

  const { data: config } = await supabase.from('agendamento_config')
    .select('duracao_slot_minutos, antecedencia_minima_horas, janela_maxima_dias, max_pendentes_por_telefone')
    .eq('site_id', site.id).single()
  if (!config) return { error: 'Agenda não configurada para este site.' }

  // ── Revalidação server-side do slot ───────────────────────────
  // O formulário calcula os horários disponíveis no navegador (JS do
  // cliente), o que é só UX — nada impede alguém de mandar uma
  // requisição direta com qualquer data/hora. Sem isso, dava pra
  // agendar fora do horário de atendimento, em bloqueio, ou sem
  // respeitar antecedência/janela (achado em auditoria: um POST cru
  // conseguia criar agendamento às 03:00 sem nenhum horário configurado
  // pra aquele dia). A constraint de unicidade no banco só impede
  // *conflito* de slot — não valida se o slot é legítimo.
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const inicioMin = toMin(horaInicio)
  const fimMin = toMin(horaFim)
  if (fimMin - inicioMin !== config.duracao_slot_minutos) {
    return { error: 'Horário inválido para a duração configurada.' }
  }

  const diaSemana = new Date(data + 'T00:00:00').getDay()
  const { data: horariosDia } = await supabase.from('agendamento_horarios')
    .select('hora_inicio, hora_fim')
    .eq('site_id', site.id).eq('dia_semana', diaSemana).eq('ativo', true)
  const dentroDoHorario = (horariosDia ?? []).some(h =>
    inicioMin >= toMin(h.hora_inicio) && fimMin <= toMin(h.hora_fim)
  )
  if (!dentroDoHorario) return { error: 'Esse horário não está disponível. Escolha outro.' }

  const { data: bloqueiosData } = await supabase.from('agendamento_bloqueios')
    .select('hora_inicio, hora_fim').eq('site_id', site.id).eq('data', data)
  const bloqueado = (bloqueiosData ?? []).some(b => {
    if (!b.hora_inicio || !b.hora_fim) return true // dia inteiro
    return inicioMin < toMin(b.hora_fim) && fimMin > toMin(b.hora_inicio)
  })
  if (bloqueado) return { error: 'Essa data/horário está bloqueado. Escolha outro.' }

  const agora = new Date()
  const slotDate = new Date(`${data}T${horaInicio}:00`)
  const horasAte = (slotDate.getTime() - agora.getTime()) / (60 * 60 * 1000)
  if (horasAte < config.antecedencia_minima_horas) {
    return { error: `Agendamentos precisam ser feitos com pelo menos ${config.antecedencia_minima_horas}h de antecedência.` }
  }
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + config.janela_maxima_dias)
  if (slotDate > maxDate) {
    return { error: `Só é possível agendar com até ${config.janela_maxima_dias} dias de antecedência.` }
  }

  if (tipoConsultaId) {
    const { data: tipo } = await supabase.from('agendamento_tipos_consulta')
      .select('id').eq('id', tipoConsultaId).eq('site_id', site.id).eq('ativo', true).maybeSingle()
    if (!tipo) return { error: 'Tipo de consulta inválido.' }
  }

  // ── Máx. de pendentes por telefone ────────────────────────────
  const telefoneLimpo = telefone.replace(/\D/g, '')
  const { count } = await supabase.from('agendamentos')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', site.id)
    .eq('paciente_telefone', telefoneLimpo)
    .eq('status', 'pendente')
  if (count !== null && count >= config.max_pendentes_por_telefone) {
    return { error: `Você já tem ${count} agendamento(s) pendente(s). Aguarde a confirmação antes de agendar novamente.` }
  }

  let tipoConsultaNome: string | null = null
  if (tipoConsultaId) {
    const { data: tipoInfo } = await supabase.from('agendamento_tipos_consulta')
      .select('nome').eq('id', tipoConsultaId).maybeSingle()
    tipoConsultaNome = tipoInfo?.nome ?? null
  }

  const { error } = await supabase.from('agendamentos').insert({
    site_id: site.id,
    tipo_consulta_id: tipoConsultaId || null,
    data,
    hora_inicio: horaInicio,
    hora_fim: horaFim,
    paciente_nome: nome,
    paciente_telefone: telefoneLimpo,
    paciente_email: email,
    mensagem,
    status: 'pendente',
  })

  if (error) {
    if (error.code === '23505' || error.message.includes('agendamentos_slot_unico'))
      return { error: 'Este horário acabou de ser reservado por outra pessoa. Escolha outro.' }
    return { error: `Erro ao agendar: ${error.message}` }
  }

  // E-mails best-effort — paciente sabe que a solicitação chegou,
  // admin sabe que tem algo pra confirmar na Agenda da Semana.
  notificarAgendamentoRecebidoPaciente({
    email, nome, data, horaInicio, horaFim, tipoConsulta: tipoConsultaNome,
  }).catch(err => console.error('[dentista-joao] falha ao notificar paciente (recebido):', err))

  notificarAgendamentoNovoAdmin({
    emailDestino: site.email_notificacoes,
    nomePaciente: nome, telefone: telefoneLimpo, data, horaInicio, horaFim,
  }).catch(err => console.error('[dentista-joao] falha ao notificar admin (novo agendamento):', err))

  return { success: true }
}

// ── Meus Agendamentos (E10+E11) ──────────────────────────────────

// Passo 1: pede o código de 6 dígitos por e-mail. Não revela se o
// e-mail tem ou não agendamentos (evita enumeração) — sempre responde
// sucesso; se o e-mail não tiver nada, o passo 2 só retorna lista vazia.
export interface SolicitarCodigoState {
  error?: string
  success?: boolean
}

export async function solicitarCodigoAcesso(_prev: SolicitarCodigoState, formData: FormData): Promise<SolicitarCodigoState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email) return { error: 'Informe o e-mail.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  const codigo = String(Math.floor(100000 + Math.random() * 900000))
  const expiraEm = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error } = await supabase.from('otp_codigos').insert({
    site_id: site.id,
    email,
    codigo,
    expira_em: expiraEm,
  })
  if (error) return { error: 'Não foi possível gerar o código. Tente novamente em instantes.' }

  const result = await enviarCodigoAcesso({ email, codigo }).then(() => ({ ok: true })).catch(err => {
    console.error('[dentista-joao] falha ao enviar código de acesso:', err)
    return { ok: false }
  })
  if (!result.ok) return { error: 'Não foi possível enviar o código por e-mail. Tente novamente.' }

  return { success: true }
}

// Passo 2: valida o código (RPC SECURITY DEFINER — nunca lê a tabela
// otp_codigos diretamente) e retorna os agendamentos daquele e-mail.
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
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const codigo = (formData.get('codigo') as string)?.trim()
  if (!email) return { error: 'Informe o e-mail.' }
  if (!codigo) return { error: 'Informe o código recebido por e-mail.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { data: valido, error: rpcError } = await supabase.rpc('verificar_otp_codigo', {
    p_site_id: site.id,
    p_email: email,
    p_codigo: codigo,
  })
  if (rpcError) return { error: 'Erro ao validar o código. Tente novamente.' }
  if (!valido) return { error: 'Código inválido ou expirado. Solicite um novo.' }

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
  const email = (formData.get('email') as string)?.trim().toLowerCase()
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
