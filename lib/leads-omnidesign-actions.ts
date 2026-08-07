'use server'

import { createClient } from '@/lib/supabase/server'

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
}
