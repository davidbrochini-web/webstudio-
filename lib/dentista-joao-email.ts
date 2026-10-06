import { sendEmail } from '@/lib/email'

/**
 * Ponto único dos 3 disparos de e-mail do Projeto Especial Dentista
 * João (pendência histórica, ver PROJETO_ESPECIAL_DENTISTA_JOAO.md
 * seção 7): notificação de lead novo, confirmação de agendamento, e
 * código de acesso (OTP) em "Meus Agendamentos".
 *
 * Remetente usa o domínio da Omnidesign (já verificado no Resend —
 * SPF/DKIM ativos) em vez de drjoaovictorpimenta.com.br — o cliente
 * pode trocar de domínio de novo no futuro, então não faz sentido
 * gastar setup de SPF/DKIM próprio pra esse caso. Nome de exibição
 * continua "Dr. João Victor Pimenta" — quem recebe não percebe a
 * troca de domínio por trás. Se um dia fizer sentido usar o domínio
 * próprio do cliente como remetente, trocar só o FROM abaixo.
 *
 * Falha de envio nunca bloqueia a ação principal (lead/agendamento
 * continuam salvos mesmo se o e-mail falhar) — ver lib/email.ts.
 *
 * ADMIN_CC: enquanto o cliente está em fase de teste, todo e-mail que
 * vai pro admin (email_notificacoes, hoje drjoaovictorpimenta@gmail.com)
 * leva o David em cópia, pra acompanhar os testes que o João for
 * fazendo. NUNCA aplicado nos e-mails pro paciente (confirmação, OTP,
 * lembrete-pro-paciente) — só nos 4 disparos "admin": lead novo,
 * agendamento pendente, lembrete-pro-admin, resumo diário. Remover essa
 * linha quando a fase de teste terminar.
 */

const FROM = 'Dr. João Victor Pimenta <notificacoes.drjoao@omnidesign.com.br>'
const ADMIN_CC = 'david.brochini@gmail.com'

const WRAPPER = (title: string, body: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#2a2a2a;padding:20px 28px;">
          <p style="margin:0;color:#ffffff;font-size:15px;font-weight:bold;">Dr. João Victor Pimenta</p>
          <p style="margin:2px 0 0;color:#a8a8a8;font-size:11px;">Cirurgia e Traumatologia Bucomaxilofacial</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:17px;color:#2a2a2a;">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:16px 28px;background:#f9f9f9;">
          <p style="margin:0;font-size:11px;color:#999;">Este é um e-mail automático, não é necessário responder.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

function formatDataHora(data: string, horaInicio: string, horaFim: string): string {
  const dataFmt = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  return `${dataFmt} · ${horaInicio.slice(0, 5)}–${horaFim.slice(0, 5)}`
}

// ── 1. Notificação de lead novo (contato / newsletter) — pro admin ──
export async function notificarLeadNovo(params: {
  emailDestino: string | null
  nome: string
  contato: string
  origem: string
  mensagem?: string | null
}): Promise<void> {
  if (!params.emailDestino) return // e-mail de notificação não configurado ainda

  await sendEmail({
    from: FROM,
    to: params.emailDestino,
    cc: ADMIN_CC,
    subject: `Novo contato pelo site — ${params.nome}`,
    html: WRAPPER('Novo contato recebido pelo site', `
      <p style="margin:0 0 8px;font-size:14px;color:#444;"><strong>Nome:</strong> ${escapeHtml(params.nome)}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#444;"><strong>Contato:</strong> ${escapeHtml(params.contato)}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#444;"><strong>Origem:</strong> ${escapeHtml(params.origem)}</p>
      ${params.mensagem ? `<p style="margin:12px 0 0;font-size:14px;color:#444;"><strong>Mensagem:</strong><br>${escapeHtml(params.mensagem)}</p>` : ''}
      <p style="margin:16px 0 0;font-size:12px;color:#999;">Veja todos os leads no painel, em "Leads recebidos".</p>
    `),
  })
}

// ── 2a. Agendamento recebido (pendente) — pro paciente ───────────────
export async function notificarAgendamentoRecebidoPaciente(params: {
  email: string
  nome: string
  data: string
  horaInicio: string
  horaFim: string
  tipoConsulta: string | null
}): Promise<void> {
  await sendEmail({
    from: FROM,
    to: params.email,
    subject: 'Recebemos sua solicitação de consulta',
    html: WRAPPER('Solicitação recebida', `
      <p style="margin:0 0 12px;font-size:14px;color:#444;">Olá, ${escapeHtml(params.nome)}. Recebemos sua solicitação de agendamento:</p>
      <p style="margin:0 0 4px;font-size:15px;color:#2a2a2a;font-weight:bold;">${formatDataHora(params.data, params.horaInicio, params.horaFim)}</p>
      ${params.tipoConsulta ? `<p style="margin:0 0 12px;font-size:13px;color:#666;">${escapeHtml(params.tipoConsulta)}</p>` : ''}
      <p style="margin:16px 0 0;font-size:14px;color:#444;">O horário está <strong>pendente de confirmação</strong> — você recebe um novo e-mail assim que for confirmado pela clínica.</p>
    `),
  })
}

// ── 2b. Agendamento novo — pro admin (aviso de pendente pra confirmar) ─
export async function notificarAgendamentoNovoAdmin(params: {
  emailDestino: string | null
  nomePaciente: string
  telefone: string
  data: string
  horaInicio: string
  horaFim: string
}): Promise<void> {
  if (!params.emailDestino) return

  await sendEmail({
    from: FROM,
    to: params.emailDestino,
    cc: ADMIN_CC,
    subject: `Novo agendamento pendente — ${params.nomePaciente}`,
    html: WRAPPER('Novo agendamento aguardando confirmação', `
      <p style="margin:0 0 8px;font-size:14px;color:#444;"><strong>Paciente:</strong> ${escapeHtml(params.nomePaciente)}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#444;"><strong>Telefone:</strong> ${escapeHtml(params.telefone)}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#444;"><strong>Data/hora:</strong> ${formatDataHora(params.data, params.horaInicio, params.horaFim)}</p>
      <p style="margin:16px 0 0;font-size:12px;color:#999;">Confirme ou recuse no painel, na Agenda da Semana.</p>
    `),
  })
}

// ── 2c. Agendamento confirmado — pro paciente ────────────────────────
export async function notificarAgendamentoConfirmadoPaciente(params: {
  email: string
  nome: string
  data: string
  horaInicio: string
  horaFim: string
}): Promise<void> {
  await sendEmail({
    from: FROM,
    to: params.email,
    subject: 'Sua consulta foi confirmada',
    html: WRAPPER('Consulta confirmada ✅', `
      <p style="margin:0 0 12px;font-size:14px;color:#444;">Olá, ${escapeHtml(params.nome)}. Sua consulta foi confirmada:</p>
      <p style="margin:0;font-size:15px;color:#2a2a2a;font-weight:bold;">${formatDataHora(params.data, params.horaInicio, params.horaFim)}</p>
      <p style="margin:16px 0 0;font-size:14px;color:#444;">Se precisar cancelar ou reagendar, use a página "Meus Agendamentos" no site.</p>
    `),
  })
}

// ── 3. Código de acesso (OTP) — pro paciente ─────────────────────────
export async function enviarCodigoAcesso(params: { email: string; codigo: string }): Promise<void> {
  await sendEmail({
    from: FROM,
    to: params.email,
    subject: `Seu código de acesso: ${params.codigo}`,
    html: WRAPPER('Código de acesso', `
      <p style="margin:0 0 16px;font-size:14px;color:#444;">Use o código abaixo para consultar seus agendamentos:</p>
      <p style="margin:0 0 16px;font-size:28px;letter-spacing:6px;color:#2a2a2a;font-weight:bold;text-align:center;">${params.codigo}</p>
      <p style="margin:0;font-size:12px;color:#999;">Válido por 10 minutos. Se você não solicitou este código, ignore este e-mail.</p>
    `),
  })
}

// ── 4. Lembrete de agendamento (24h e 1h) — paciente + admin ─────────
// Disparado por cron (Supabase pg_cron + pg_net, ver
// supabase/migrations/0040_lembretes_e_resumo_diario.sql e
// app/api/cron/lembretes-agendamento/route.ts). Idempotente por
// natureza (a rota só chama isso uma vez por agendamento, marcando
// lembrete_24h_enviado_em/lembrete_1h_enviado_em) — aqui é só o envio.
export async function notificarLembretePaciente(params: {
  email: string
  nome: string
  data: string
  horaInicio: string
  horaFim: string
  janela: '24h' | '1h'
  /** Só usado na janela de 24h: a consulta pode cair "hoje" (ex.: 20h, avisada às 8h) ou "amanhã". */
  quando?: 'hoje' | 'amanhã'
}): Promise<void> {
  const hora = params.horaInicio.slice(0, 5)
  const label = params.janela === '24h' ? `${params.quando ?? 'amanhã'}, às ${hora}` : 'daqui a 1 hora'
  await sendEmail({
    from: FROM,
    to: params.email,
    subject: params.janela === '24h'
      ? `Lembrete: sua consulta é ${params.quando ?? 'amanhã'} às ${hora}`
      : 'Lembrete: sua consulta é daqui a 1 hora',
    html: WRAPPER(`Sua consulta é ${label} ⏰`, `
      <p style="margin:0 0 12px;font-size:14px;color:#444;">Olá, ${escapeHtml(params.nome)}. Só lembrando:</p>
      <p style="margin:0;font-size:15px;color:#2a2a2a;font-weight:bold;">${formatDataHora(params.data, params.horaInicio, params.horaFim)}</p>
      <p style="margin:16px 0 0;font-size:14px;color:#444;">Se precisar cancelar ou reagendar, use a página "Meus Agendamentos" no site.</p>
    `),
  })
}

export async function notificarLembreteAdmin(params: {
  emailDestino: string | null
  nomePaciente: string
  telefone: string
  data: string
  horaInicio: string
  horaFim: string
  janela: '24h' | '1h'
  quando?: 'hoje' | 'amanhã'
}): Promise<void> {
  if (!params.emailDestino) return
  const label = params.janela === '24h'
    ? `${params.quando ?? 'amanhã'} às ${params.horaInicio.slice(0, 5)}`
    : 'em 1 hora'
  await sendEmail({
    from: FROM,
    to: params.emailDestino,
    cc: ADMIN_CC,
    subject: `Lembrete: consulta ${label} — ${params.nomePaciente}`,
    html: WRAPPER(`Consulta ${label} ⏰`, `
      <p style="margin:0 0 8px;font-size:14px;color:#444;"><strong>Paciente:</strong> ${escapeHtml(params.nomePaciente)}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#444;"><strong>Telefone:</strong> ${escapeHtml(params.telefone)}</p>
      <p style="margin:0;font-size:14px;color:#444;"><strong>Data/hora:</strong> ${formatDataHora(params.data, params.horaInicio, params.horaFim)}</p>
    `),
  })
}

// ── 5. Resumo diário — pro admin, todo dia às 6h (BRT) ────────────────
export interface AgendamentoResumo {
  paciente_nome: string
  hora_inicio: string
  hora_fim: string
  tipo_consulta_nome: string | null
}

export async function notificarResumoDiario(params: {
  emailDestino: string | null
  data: string
  agendamentos: AgendamentoResumo[]
}): Promise<void> {
  if (!params.emailDestino) return

  const dataFmt = new Date(params.data + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  })

  const linhas = params.agendamentos.length
    ? params.agendamentos.map(a => `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#2a2a2a;font-weight:bold;white-space:nowrap;">${a.hora_inicio.slice(0, 5)}–${a.hora_fim.slice(0, 5)}</td>
          <td style="padding:8px 0 8px 12px;font-size:14px;color:#444;">${escapeHtml(a.paciente_nome)}${a.tipo_consulta_nome ? ` <span style="color:#999;">· ${escapeHtml(a.tipo_consulta_nome)}</span>` : ''}</td>
        </tr>`).join('')
    : `<p style="margin:0;font-size:14px;color:#999;">Nenhuma consulta confirmada pra hoje.</p>`

  await sendEmail({
    from: FROM,
    to: params.emailDestino,
    cc: ADMIN_CC,
    subject: `Agenda de hoje (${params.agendamentos.length}) — ${dataFmt}`,
    html: WRAPPER(`Bom dia! Sua agenda de hoje`, `
      <p style="margin:0 0 16px;font-size:13px;color:#666;text-transform:capitalize;">${dataFmt}</p>
      ${params.agendamentos.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${linhas}</table>` : linhas}
    `),
  })
}

// ── 6. Resumo semanal — pro admin, toda segunda às 6h (BRT) ───────────
// Pedido do cliente (06/10/2026). Semana = segunda a domingo da semana
// corrente (a rota calcula as datas). Dia sem consulta aparece como
// "livre" de propósito: a pergunta que o e-mail responde é "como está
// minha semana", e o buraco na agenda também é informação.
export interface AgendamentoSemana extends AgendamentoResumo {
  data: string
}

export async function notificarResumoSemanal(params: {
  emailDestino: string | null
  dias: string[] // 7 datas YYYY-MM-DD, segunda → domingo
  confirmados: AgendamentoSemana[]
  pendentes: number
}): Promise<void> {
  if (!params.emailDestino) return

  const fmtCurto = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const periodo = `${fmtCurto(params.dias[0])} a ${fmtCurto(params.dias[6])}`
  const total = params.confirmados.length

  const blocos = params.dias.map(dia => {
    const doDia = params.confirmados.filter(a => a.data === dia)
    const titulo = new Date(dia + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit',
    })
    const corpo = doDia.length
      ? doDia.map(a => `
          <tr>
            <td style="padding:4px 0;font-size:14px;color:#2a2a2a;font-weight:bold;white-space:nowrap;vertical-align:top;">${a.hora_inicio.slice(0, 5)}–${a.hora_fim.slice(0, 5)}</td>
            <td style="padding:4px 0 4px 12px;font-size:14px;color:#444;">${escapeHtml(a.paciente_nome)}${a.tipo_consulta_nome ? ` <span style="color:#999;">· ${escapeHtml(a.tipo_consulta_nome)}</span>` : ''}</td>
          </tr>`).join('')
      : `<tr><td style="padding:4px 0;font-size:13px;color:#aaa;">Livre</td></tr>`
    return `
      <p style="margin:18px 0 6px;font-size:13px;color:#2a2a2a;font-weight:bold;text-transform:capitalize;border-bottom:1px solid #eee;padding-bottom:4px;">${titulo}${doDia.length ? ` <span style="color:#999;font-weight:normal;">(${doDia.length})</span>` : ''}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${corpo}</table>`
  }).join('')

  const avisoPendentes = params.pendentes > 0
    ? `<p style="margin:20px 0 0;padding:12px;background:#fff8e6;border-radius:8px;font-size:13px;color:#8a6100;">⏳ ${params.pendentes} ${params.pendentes === 1 ? 'pedido aguardando' : 'pedidos aguardando'} sua confirmação nesta semana.</p>`
    : ''

  await sendEmail({
    from: FROM,
    to: params.emailDestino,
    cc: ADMIN_CC,
    subject: `Agenda da semana (${total} ${total === 1 ? 'consulta' : 'consultas'}) — ${periodo}`,
    html: WRAPPER('Bom dia! Sua agenda da semana', `
      <p style="margin:0;font-size:13px;color:#666;">${periodo} · ${total} ${total === 1 ? 'consulta confirmada' : 'consultas confirmadas'}</p>
      ${blocos}
      ${avisoPendentes}
    `),
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

