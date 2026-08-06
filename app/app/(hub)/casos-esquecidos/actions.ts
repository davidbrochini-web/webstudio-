'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  slugify,
  markdownToHtml,
  estimarTempoLeitura,
  getUltimoContoPorNumero,
} from '@/lib/casos-esquecidos'

export type ContoResultado = { ok: true; slug: string } | { ok: false; error: string }

const BASE = '/projetos-especiais/casos-esquecidos'

function revalidarSitePublico(slug: string, temas: string[]) {
  revalidatePath(BASE)
  revalidatePath(`${BASE}/contos`)
  revalidatePath(`${BASE}/contos/${slug}`)
  revalidatePath(`${BASE}/feed.xml`)
  for (const t of temas) revalidatePath(`${BASE}/contos/tema/${t}`)
}

export async function criarConto(siteId: string, formData: FormData): Promise<ContoResultado> {
  try {
    const titulo = (formData.get('titulo') as string || '').trim()
    const resumo = (formData.get('resumo') as string || '').trim()
    const corpo = (formData.get('corpo') as string || '').trim()
    const imagemUrl = (formData.get('imagem_url') as string) || null
    const temasRaw = (formData.get('temas') as string) || ''
    const temas = temasRaw.split(',').map(t => t.trim()).filter(Boolean)

    if (!titulo || !resumo || !corpo) {
      return { ok: false, error: 'Preencha título, resumo e corpo do conto.' }
    }

    const slug = slugify(titulo)
    const texto_html = markdownToHtml(corpo)
    const tempo_leitura = estimarTempoLeitura(texto_html)

    const dataPublicacaoRaw = formData.get('data_publicacao') as string | null
    const data_publicacao = dataPublicacaoRaw ? new Date(dataPublicacaoRaw) : new Date()
    if (isNaN(data_publicacao.getTime())) {
      return { ok: false, error: 'Data de publicação inválida.' }
    }

    const ultimoConto = await getUltimoContoPorNumero(siteId)
    const numero = (ultimoConto?.numero || 0) + 1

    // Trava de ordem: número maior não pode abrir antes do menor.
    if (ultimoConto && data_publicacao.getTime() < new Date(ultimoConto.data_publicacao).getTime()) {
      const dataUltimo = new Date(ultimoConto.data_publicacao).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
      return {
        ok: false,
        error: `Você está tentando abrir o Caso Nº ${String(numero).padStart(3, '0')} antes do Caso Nº ${String(ultimoConto.numero).padStart(3, '0')} (agendado pra ${dataUltimo}). Ajuste a data ou publique na ordem certa.`,
      }
    }

    const supabase = await createClient()
    const { error: insertError } = await supabase.from('contos').insert({
      site_id: siteId,
      numero,
      titulo,
      slug,
      resumo,
      texto_html,
      imagem_url: imagemUrl,
      tempo_leitura,
      temas,
      publicado: true,
      data_publicacao: data_publicacao.toISOString(),
    })

    if (insertError) {
      return { ok: false, error: `Erro ao inserir conto: ${insertError.message}` }
    }

    revalidarSitePublico(slug, temas)
    return { ok: true, slug }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function atualizarConto(siteId: string, contoId: number, formData: FormData): Promise<ContoResultado> {
  try {
    const titulo = (formData.get('titulo') as string || '').trim()
    const resumo = (formData.get('resumo') as string || '').trim()
    const corpo = (formData.get('corpo') as string || '').trim()
    const imagemUrl = (formData.get('imagem_url') as string) || null
    const temasRaw = (formData.get('temas') as string) || ''
    const temas = temasRaw.split(',').map(t => t.trim()).filter(Boolean)
    const publicado = formData.get('publicado') === 'on'
    const slug = (formData.get('slug') as string || '').trim()

    if (!titulo || !resumo || !corpo || !slug) {
      return { ok: false, error: 'Preencha título, resumo e corpo do conto.' }
    }

    const texto_html = markdownToHtml(corpo)
    const tempo_leitura = estimarTempoLeitura(texto_html)

    const dataPublicacaoRaw = formData.get('data_publicacao') as string | null
    const data_publicacao = dataPublicacaoRaw ? new Date(dataPublicacaoRaw) : new Date()
    if (isNaN(data_publicacao.getTime())) {
      return { ok: false, error: 'Data de publicação inválida.' }
    }

    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from('contos')
      .update({
        titulo,
        resumo,
        texto_html,
        imagem_url: imagemUrl,
        tempo_leitura,
        temas,
        publicado,
        data_publicacao: data_publicacao.toISOString(),
      })
      .eq('id', contoId)
      .eq('site_id', siteId)

    if (updateError) {
      return { ok: false, error: `Erro ao atualizar conto: ${updateError.message}` }
    }

    revalidarSitePublico(slug, temas)
    return { ok: true, slug }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}
