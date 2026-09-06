'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { resolveDentistaJoaoEmail } from '@/lib/dentista-joao-auth'
import { SITE_URL_BASE } from '@/lib/dentista-joao'

/**
 * "Esqueci minha senha" do login do dentista-joao. Não usa o e-mail
 * nativo do Supabase Auth (SMTP não está configurado no projeto —
 * ficaria no limite de 2 e-mails/hora e sairia de um remetente
 * genérico não-verificado). Em vez disso, segue o padrão já
 * estabelecido pros outros e-mails deste projeto (ver
 * lib/dentista-joao-email.ts): gera o link de recuperação via Auth
 * Admin API (service_role, createAdminClient()) e manda pelo Resend,
 * com o remetente/visual de sempre.
 *
 * Sempre devolve sucesso genérico pro cliente, exista ou não o
 * usuário — evita vazar (por enumeração) se um e-mail está cadastrado.
 * Erros reais só vão pro log do servidor.
 */
export async function solicitarRecuperacaoSenha(
  usuarioOuEmail: string
): Promise<{ ok: true }> {
  const email = resolveDentistaJoaoEmail(usuarioOuEmail)
  if (!email) return { ok: true }

  try {
    const admin = createAdminClient()
    const redirectTo = `${SITE_URL_BASE}/redefinir-senha`

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    })

    if (error || !data?.properties?.action_link) {
      console.error('[dentista-joao] erro ao gerar link de recuperação:', error)
      return { ok: true }
    }

    await sendEmail({
      from: 'Dr. João Victor Pimenta <notificacoes.drjoao@omnidesign.com.br>',
      to: email,
      subject: 'Redefinição de senha — Painel do site',
      html: WRAPPER_RECUPERACAO(data.properties.action_link),
    })
  } catch (err) {
    console.error('[dentista-joao] exceção ao processar recuperação de senha:', err)
  }

  return { ok: true }
}

const WRAPPER_RECUPERACAO = (link: string) => `
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
          <h1 style="margin:0 0 16px;font-size:17px;color:#2a2a2a;">Redefinir sua senha</h1>
          <p style="margin:0 0 20px;font-size:14px;color:#444;">Recebemos um pedido pra redefinir a senha do painel do seu site. Clique no botão abaixo pra criar uma senha nova:</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
            <tr><td style="background:#0EA5A0;border-radius:10px;">
              <a href="${link}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">Criar nova senha</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:12px;color:#999;">Se você não pediu essa troca de senha, pode ignorar este e-mail — sua senha atual continua funcionando normalmente. Este link expira em 1 hora.</p>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#f9f9f9;">
          <p style="margin:0;font-size:11px;color:#999;">Este é um e-mail automático, não é necessário responder.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
