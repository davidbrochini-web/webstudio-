'use server'

import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/localdesk'

export interface ContatoFormState {
  error?: string
  success?: boolean
}

export async function enviarSolicitacaoContato(_prev: ContatoFormState, formData: FormData): Promise<ContatoFormState> {
  const nome = (formData.get('nome') as string)?.trim()
  const contato = (formData.get('contato') as string)?.trim()
  const mensagem = (formData.get('mensagem') as string)?.trim() || ''

  if (!nome) return { error: 'Preencha seu nome.' }
  if (!contato) return { error: 'Informe telefone/WhatsApp ou e-mail pra retornarmos.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { error } = await supabase.from('site_leads').insert({
    site_id: site.id,
    nome,
    contato,
    mensagem,
  })

  if (error) return { error: `Erro ao enviar: ${error.message}` }
  return { success: true }
}
