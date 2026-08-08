import { Resend } from 'resend'
import NovoContatoEmail, { type NovoContatoEmailProps } from '@/lib/email-templates/NovoContatoEmail'
import NovoAgendamentoEmail, { type NovoAgendamentoEmailProps } from '@/lib/email-templates/NovoAgendamentoEmail'
import ConfirmacaoAgendamentoEmail, { type ConfirmacaoAgendamentoEmailProps } from '@/lib/email-templates/ConfirmacaoAgendamentoEmail'
import ConfirmacaoContatoEmail, { type ConfirmacaoContatoEmailProps } from '@/lib/email-templates/ConfirmacaoContatoEmail'

const FROM = 'Omnidesign <leads@omnidesign.com.br>'

/**
 * Todas as funções de envio aqui NUNCA lançam erro pro caller — e-mail
 * de notificação é "best effort": se o Resend falhar, o lead/agendamento
 * já foi salvo no banco de qualquer forma, e um erro de e-mail não pode
 * derrubar a submissão do formulário do cliente. Erros só vão pro log
 * do servidor (console.error), não pro usuário final.
 */
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('RESEND_API_KEY não configurada — e-mail não enviado.')
    return null
  }
  return new Resend(key)
}

export async function enviarNovoContato(to: string, props: NovoContatoEmailProps) {
  const resend = getResend()
  if (!resend) return
  try {
    await resend.emails.send({
      from: FROM,
      to: [to],
      subject: `Novo contato — ${props.siteNome}`,
      react: NovoContatoEmail(props),
    })
  } catch (err) {
    console.error('Erro ao enviar e-mail de novo contato:', err)
  }
}

export async function enviarNovoAgendamento(to: string, props: NovoAgendamentoEmailProps) {
  const resend = getResend()
  if (!resend) return
  try {
    await resend.emails.send({
      from: FROM,
      to: [to],
      subject: `Novo agendamento — ${props.siteNome}`,
      react: NovoAgendamentoEmail(props),
    })
  } catch (err) {
    console.error('Erro ao enviar e-mail de novo agendamento:', err)
  }
}

export async function enviarConfirmacaoAgendamento(to: string, props: ConfirmacaoAgendamentoEmailProps) {
  const resend = getResend()
  if (!resend) return
  try {
    await resend.emails.send({
      from: FROM,
      to: [to],
      subject: `Consulta confirmada — ${props.siteNome}`,
      react: ConfirmacaoAgendamentoEmail(props),
    })
  } catch (err) {
    console.error('Erro ao enviar e-mail de confirmação:', err)
  }
}

/**
 * Confirmação genérica de "recebemos sua mensagem" pro visitante que
 * preencheu um formulário de contato simples (diferente de
 * enviarConfirmacaoAgendamento, que é específico de horário marcado).
 * Só dispara se `to` parecer um e-mail de verdade — o campo de
 * contato de alguns formulários aceita WhatsApp OU e-mail.
 */
function pareceEmail(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())
}

export async function enviarConfirmacaoContato(to: string, props: ConfirmacaoContatoEmailProps) {
  if (!pareceEmail(to)) return
  const resend = getResend()
  if (!resend) return
  try {
    await resend.emails.send({
      from: 'Omnidesign <contato@omnidesign.com.br>',
      to: [to.trim()],
      subject: `Recebemos sua mensagem — ${props.siteNome}`,
      react: ConfirmacaoContatoEmail(props),
    })
  } catch (err) {
    console.error('Erro ao enviar confirmação de contato:', err)
  }
}
