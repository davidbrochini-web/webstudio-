import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente admin — usa a service_role key, que IGNORA todo RLS.
 * NUNCA importar isso em código que roda no browser.
 * Uso: criar usuário de cliente (Auth Admin API), operações que o
 * super-admin precisa fazer e que exigem privilégio total no banco.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
