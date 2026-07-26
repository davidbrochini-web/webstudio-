'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Formulário de contato do site institucional — obrigatório em
 * todos os templates (decisão de produto, julho/2026). Mesmo
 * espírito de submitDemoLead (app/app/editor/actions.ts), mas grava
 * em site_leads (por site real) em vez de demo_leads (só demo).
 * RLS de site_leads libera insert pra qualquer um (with check true);
 * SELECT é restrito a admin do site / super-admin.
 */
export async function submitSiteLead(
  siteId: string,
  data: { nome: string; contato: string; mensagem: string }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_leads').insert({
    site_id: siteId,
    nome: data.nome.trim(),
    contato: data.contato.trim(),
    mensagem: data.mensagem.trim(),
  })

  if (error) throw new Error(error.message)
}
