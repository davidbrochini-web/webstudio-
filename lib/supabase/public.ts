import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Client público, sem cookies() — ao contrário de lib/supabase/server.ts
 * (usado no resto da plataforma), este não força a rota a virar dynamic.
 * Uso restrito: leitura de conteúdo público, sem sessão, sem RLS
 * dependente de auth.uid() (só a policy pública "publicado=true" se
 * aplica aqui, que já funciona com a chave anon).
 *
 * Motivo de existir: o Casos Esquecidos é conteúdo publicado ~1x por
 * semana, não editado ao vivo como o dentista-joão — dá pra cachear
 * (ISR) sem perder atualidade sensível, e isso é o que faz a
 * navegação ser rápida de novo (o site original usava exatamente esse
 * padrão: ISR com revalidate de 1h).
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
