'use server'

import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/colegio-elite'

export interface ContatoFormState {
  error?: string
  success?: boolean
}

export async function enviarSolicitacaoContato(_prev: ContatoFormState, formData: FormData): Promise<ContatoFormState> {
  const nome = (formData.get('nome') as string)?.trim()
  const sobrenome = (formData.get('sobrenome') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const telefone = (formData.get('telefone') as string)?.trim()
  const mensagem = (formData.get('mensagem') as string)?.trim() || ''

  if (!nome || !sobrenome) return { error: 'Preencha nome e sobrenome.' }
  if (!email && !telefone) return { error: 'Informe e-mail ou telefone pra retornarmos.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { error } = await supabase.from('site_leads').insert({
    site_id: site.id,
    nome: `${nome} ${sobrenome}`,
    contato: email || telefone,
    mensagem: [telefone && email ? `Telefone: ${telefone}` : '', mensagem].filter(Boolean).join(' — '),
  })

  if (error) return { error: `Erro ao enviar: ${error.message}` }
  return { success: true }
}

// Newsletter do rodapé — reaproveita site_leads (sem criar tabela nova),
// mesmo padrão do dentista-joao. Só captura o interesse; disparo
// automático de e-mail fora de escopo por enquanto.
export async function inscreverNewsletter(_prev: ContatoFormState, formData: FormData): Promise<ContatoFormState> {
  const nome = (formData.get('nome') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  if (!nome || !email) return { error: 'Preencha nome e e-mail.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { error } = await supabase.from('site_leads').insert({
    site_id: site.id,
    nome,
    contato: email,
    mensagem: 'Inscrição na newsletter',
  })

  if (error) return { error: `Erro ao inscrever: ${error.message}` }
  return { success: true }
}
