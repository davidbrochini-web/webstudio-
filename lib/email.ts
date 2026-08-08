import { Resend } from 'resend'

/**
 * Wrapper fino sobre o Resend. Usado hoje só pelo Projeto Especial
 * Dentista João (ver lib/dentista-joao-email.ts) — desenhado genérico
 * porque a mesma necessidade (notificar lead novo, confirmar
 * agendamento, OTP por e-mail) vai se repetir em projetos futuros.
 *
 * Falha de e-mail NUNCA deve quebrar o fluxo principal (criar lead,
 * criar agendamento) — por isso toda chamada engole erro e só loga.
 * Se RESEND_API_KEY não estiver configurada (dev local, preview sem
 * env, ou domínio ainda não verificado), a função vira no-op e avisa
 * no log em vez de derrubar a server action.
 */

let client: Resend | null = null
function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

export interface SendEmailInput {
  to: string
  subject: string
  html: string
  from: string
  replyTo?: string
}

export interface SendEmailResult {
  ok: boolean
  skipped?: boolean
  error?: string
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resend = getClient()
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY ausente — não enviado: "${input.subject}" para ${input.to}`)
    return { ok: false, skipped: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    })
    if (error) {
      console.error(`[email] erro ao enviar "${input.subject}" para ${input.to}:`, error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (err) {
    console.error(`[email] exceção ao enviar "${input.subject}" para ${input.to}:`, err)
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
