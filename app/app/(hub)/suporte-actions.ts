'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentTenant } from '@/lib/current-tenant'
import { sendEmail } from '@/lib/email'

const EMAIL_DAVID = 'david.brochini@gmail.com'

export interface SuporteFormState {
  ok: boolean
  error?: string
}

const TIPO_LABEL: Record<string, string> = {
  erro: '🐞 Erro no site/painel',
  novo_escopo: '💡 Ideia / algo novo',
}

export async function enviarChamadoSuporte(_prev: SuporteFormState, formData: FormData): Promise<SuporteFormState> {
  const info = await getCurrentTenant()
  if (!info) return { ok: false, error: 'Não foi possível identificar seu projeto. Recarregue a página e tente de novo.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Sessão expirada. Faça login de novo.' }

  const tipo = formData.get('tipo')
  const mensagem = formData.get('mensagem')
  const imagem = formData.get('imagem')

  if (tipo !== 'erro' && tipo !== 'novo_escopo') {
    return { ok: false, error: 'Selecione o tipo do chamado.' }
  }
  if (typeof mensagem !== 'string' || mensagem.trim().length < 5) {
    return { ok: false, error: 'Escreva um pouco mais sobre o que está acontecendo.' }
  }

  const admin = createAdminClient()
  let imagemUrl: string | null = null

  if (imagem instanceof File && imagem.size > 0) {
    if (!['image/png', 'image/jpeg'].includes(imagem.type)) {
      return { ok: false, error: 'Só é possível anexar imagens em JPG ou PNG.' }
    }
    if (imagem.size > 8 * 1024 * 1024) {
      return { ok: false, error: 'A imagem precisa ter no máximo 8MB.' }
    }
    const extensao = imagem.type === 'image/png' ? 'png' : 'jpg'
    const caminho = `${info.tenantId}/${crypto.randomUUID()}.${extensao}`
    const { error: uploadError } = await admin.storage
      .from('suporte-anexos')
      .upload(caminho, imagem, { contentType: imagem.type })
    if (uploadError) {
      return { ok: false, error: 'Não deu pra subir a imagem. Tenta de novo ou manda sem anexo.' }
    }
    const { data: pub } = admin.storage.from('suporte-anexos').getPublicUrl(caminho)
    imagemUrl = pub.publicUrl
  }

  const { data: ticket, error: insertError } = await admin
    .from('suporte_tickets')
    .insert({
      tenant_id: info.tenantId,
      usuario_id: user.id,
      usuario_email: user.email,
      tipo,
      mensagem: mensagem.trim(),
      imagem_url: imagemUrl,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (insertError || !ticket) {
    return { ok: false, error: 'Não deu pra registrar o chamado. Tenta de novo.' }
  }

  await sendEmail({
    from: 'Suporte WebStudio <suporte@omnidesign.com.br>',
    to: EMAIL_DAVID,
    replyTo: user.email ?? undefined,
    subject: `[${TIPO_LABEL[tipo]}] ${info.tenantNome}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #0EA5A0; font-weight: bold;">${TIPO_LABEL[tipo]}</p>
        <h2 style="margin: 4px 0 16px;">${info.tenantNome}</h2>
        <p style="color: #666; font-size: 13px; margin-bottom: 4px;">De: ${user.email}</p>
        <p style="white-space: pre-wrap; line-height: 1.5; background: #f7f7f7; padding: 16px; border-radius: 8px;">${mensagem.trim()}</p>
        ${imagemUrl ? `<p><a href="${imagemUrl}" target="_blank">Ver imagem anexada</a></p>` : ''}
        <p style="margin-top: 24px; font-size: 12px; color: #999;">Chamado #${ticket.id}</p>
      </div>
    `,
  })

  return { ok: true }
}
