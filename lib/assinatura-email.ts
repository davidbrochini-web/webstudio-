import { sendEmail } from '@/lib/email'
import { formatCentavos } from '@/lib/assinatura'

/**
 * Lembrete leve de mensalidade — reaproveitável por qualquer tenant,
 * não só o Dentista João (decisão do David, 01/09/2026: "isso vira
 * padrão pra todos os clientes por enquanto"). Disparado pelo cron
 * genérico app/api/cron/lembrete-mensalidade-clientes/route.ts, todo
 * dia 20, pra pagamentos vencendo ~10 dias depois.
 *
 * Vem da própria Omnidesign (não do domínio/marca do cliente) — é
 * cobrança da plataforma pro cliente, não um e-mail pro paciente
 * final do cliente. Diferente dos e-mails de lib/dentista-joao-
 * email.ts, que são todos "em nome" do site do cliente.
 *
 * ADMIN_CC pro David acompanhar quem já foi avisado sobre o quê.
 */

const FROM = 'WebStudio <financeiro@omnidesign.com.br>'
const ADMIN_CC = 'david.brochini@gmail.com'

const WRAPPER = (body: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#0A0F0B;padding:20px 28px;">
          <p style="margin:0;color:#ffffff;font-size:15px;font-weight:bold;">omnidesign</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:17px;color:#0A0F0B;">Só passando pra avisar 🙂</h1>
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

export interface ItemMensalidade {
  label: string
  valorCentavos: number
}

export async function notificarLembreteMensalidadeCliente(params: {
  emailDestino: string | null
  tenantNome: string
  itens: ItemMensalidade[]
  totalCentavos: number
  vencimento: string // YYYY-MM-DD
}): Promise<void> {
  if (!params.emailDestino) return

  const dataFmt = new Date(params.vencimento + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long',
  })

  const linhas = params.itens.map(i => `
    <tr>
      <td style="padding:6px 0;font-size:14px;color:#444;">${escapeHtml(i.label)}</td>
      <td style="padding:6px 0;font-size:14px;color:#444;text-align:right;">${formatCentavos(i.valorCentavos)}</td>
    </tr>`).join('')

  await sendEmail({
    from: FROM,
    to: params.emailDestino,
    cc: ADMIN_CC,
    subject: 'Um lembrete tranquilo sobre sua mensalidade',
    html: WRAPPER(`
      <p style="margin:0 0 12px;font-size:14px;color:#444;">Olá! Tudo bem?</p>
      <p style="margin:0 0 12px;font-size:14px;color:#444;">Só passando pra avisar, sem pressa nenhuma: no dia <strong>${dataFmt}</strong> vence a mensalidade do seu projeto (${escapeHtml(params.tenantNome)}).</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;border-top:1px solid #eee;border-bottom:1px solid #eee;">
        ${linhas}
      </table>
      <p style="margin:0 0 16px;font-size:16px;color:#0A0F0B;font-weight:bold;text-align:right;">Total: ${formatCentavos(params.totalCentavos)}</p>
      <p style="margin:0 0 12px;font-size:14px;color:#444;">Não precisa fazer nada agora — é só um aviso antecipado. Quando a data chegar, o QR Code do Pix já vai estar te esperando no seu painel, em <strong>Assinatura</strong>.</p>
      <p style="margin:16px 0 0;font-size:14px;color:#444;">Qualquer dúvida, é só chamar a gente. 🙂</p>
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
