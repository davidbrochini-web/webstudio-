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
