'use server'

import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'

export interface ContatoFormState {
  error?: string
  success?: boolean
}

export async function enviarSolicitacaoConsulta(_prev: ContatoFormState, formData: FormData): Promise<ContatoFormState> {
  const nome = (formData.get('nome') as string)?.trim()
  const sobrenome = (formData.get('sobrenome') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const telefone = (formData.get('telefone') as string)?.trim()
  const dataDesejada = (formData.get('data_desejada') as string) || null
  const periodo = (formData.get('periodo') as string) || null

  if (!nome || !sobrenome) return { error: 'Preencha nome e sobrenome.' }
  if (!email && !telefone) return { error: 'Informe e-mail ou telefone pra retornarmos.' }
  if (periodo && periodo !== 'manha' && periodo !== 'tarde') return { error: 'Período inválido.' }

  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { error } = await supabase.from('site_leads').insert({
    site_id: site.id,
    nome: `${nome} ${sobrenome}`,
    contato: email || telefone,
    mensagem: telefone && email ? `Telefone: ${telefone}` : '',
    data_desejada: dataDesejada,
    periodo,
  })

  if (error) return { error: `Erro ao enviar: ${error.message}` }
  return { success: true }
}

// Newsletter do rodapé — reaproveita site_leads (sem criar tabela nova).
// IMPORTANTE: isso só captura o interesse. Disparo automático de e-mail
// pra quem se inscreve continua fora de escopo (seção 8 do handoff) —
// a lista fica visível pro cliente em "Leads recebidos", quem envia é
// manual, como o resto dos contatos do formulário.
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
