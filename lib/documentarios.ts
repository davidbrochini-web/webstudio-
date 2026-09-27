import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'
import { CACHE_TAG_CONTOS } from '@/lib/casos-esquecidos'

/**
 * Arquivos do Observador — segunda linha editorial do Casos Esquecidos:
 * documentários de casos reais (> 50 anos) narrados pelo Observador.
 * Tabela própria (`documentarios`, migration 0069) — não mistura com
 * `contos`. Regras editoriais: Doc IA slug `arquivos-do-observador`.
 * Visibilidade pública controlada por RLS (publicado = true AND
 * data_publicacao <= now()), igual aos contos.
 */
export interface Documentario {
  id: number
  site_id: string
  numero: number
  titulo: string
  slug: string
  caso: string
  ano_caso: number
  local_caso: string
  resumo: string
  texto_html: string
  imagem_url: string | null
  imagem_alt: string | null
  tempo_leitura: string | null
  palavras_chave: string[]
  publicado: boolean
  data_publicacao: string
  created_at: string
  updated_at: string
}

export const getAllDocumentarios = unstable_cache(
  async (siteId: string): Promise<Documentario[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('documentarios')
      .select('*')
      .eq('site_id', siteId)
      .eq('publicado', true)
      .order('numero', { ascending: true })
    if (error) throw error
    return data || []
  },
  ['casos-esquecidos-get-all-documentarios'],
  { revalidate: 300, tags: [CACHE_TAG_CONTOS] }
)

export const getDocumentarioBySlug = unstable_cache(
  async (siteId: string, slug: string): Promise<Documentario | null> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('documentarios')
      .select('*')
      .eq('site_id', siteId)
      .eq('slug', slug)
      .eq('publicado', true)
      .maybeSingle()
    if (error) return null
    return data
  },
  ['casos-esquecidos-get-documentario-by-slug'],
  { revalidate: 300, tags: [CACHE_TAG_CONTOS] }
)

export function numeroArquivo(n: number): string {
  return `Arquivo Nº ${String(n).padStart(3, '0')}`
}
