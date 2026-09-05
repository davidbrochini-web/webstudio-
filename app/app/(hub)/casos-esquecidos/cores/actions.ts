'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const CHAVES_PALETA = [
  'paleta_bg', 'paleta_bg_panel', 'paleta_bg_panel_2', 'paleta_line',
  'paleta_gold', 'paleta_gold_dim', 'paleta_blood', 'paleta_blood_bright',
  'paleta_paper', 'paleta_paper_dim', 'paleta_muted',
] as const

export async function updatePaletaCasos(siteId: string, valores: Record<string, string>) {
  const hex = /^#[0-9a-fA-F]{6}$/
  for (const chave of CHAVES_PALETA) {
    const v = valores[chave]
    if (v && !hex.test(v)) throw new Error(`Cor inválida em ${chave} — use o formato #RRGGBB.`)
  }

  const supabase = await createClient()
  const { data: atual } = await supabase.from('sites').select('textos_customizados').eq('id', siteId).single()
  const novo = { ...(atual?.textos_customizados ?? {}) }
  for (const chave of CHAVES_PALETA) {
    if (valores[chave]) novo[chave] = valores[chave]
  }

  const { error } = await supabase.from('sites').update({ textos_customizados: novo }).eq('id', siteId)
  if (error) throw new Error(error.message)

  revalidatePath('/app/casos-esquecidos/cores')
  revalidatePath('/projetos-especiais/casos-esquecidos', 'layout')
}
