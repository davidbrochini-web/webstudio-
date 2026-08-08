'use server'

import { createClient } from '@/lib/supabase/server'
import { enviarNovoContato, enviarConfirmacaoContato } from '@/lib/email-notificacoes'

/**
 * Formulário de contato do PRÓPRIO site da Omnidesign (não confundir
 * com submitSiteLead, que grava em site_leads dos tenants/clientes).
 * Grava em leads_omnidesign com origem='site' — RLS só permite insert
 * anônimo com essa origem e status='novo' (ver migration 0034).
 */
export async function submitLeadOmnidesign(data: { nome: string; contato: string; mensagem: string }) {
  const supabase = await createClient()
  const { error } = await supabase.from('leads_omnidesign').insert({
    nome: data.nome.trim(),
    contato: data.contato.trim(),
    mensagem: data.mensagem.trim(),
    origem: 'site',
    status: 'novo',
  })

  if (error) throw new Error(error.message)

  // E-mail é best-effort, mesmo padrão do submitSiteLead — o lead já
  // foi salvo acima, uma falha de envio não pode derrubar o formulário.
  const destinoInterno = process.env.NOTIFICACAO_LEADS_EMAIL || 'david.brochini@gmail.com'
  await enviarNovoContato(destinoInterno, {
    siteNome: 'Omnidesign',
    siteUrl: 'https://omnidesign.com.br',
    logoUrl: null,
    nome: data.nome.trim(),
    contato: data.contato.trim(),
    mensagem: data.mensagem.trim(),
  })

  await enviarConfirmacaoContato(data.contato.trim(), {
    siteNome: 'Omnidesign',
    nomeVisitante: data.nome.trim(),
  })
}
