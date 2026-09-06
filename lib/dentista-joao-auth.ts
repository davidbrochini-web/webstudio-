/**
 * Fonte única do mapeamento "usuário digitado" → e-mail real de login,
 * usado pelo login próprio do Projeto Especial dentista-joao. Sem
 * imports server-only (next/headers, supabase/server) de propósito —
 * precisa ser seguro de importar tanto no client component do login
 * quanto na server action de recuperação de senha, sem puxar nada
 * pro bundle errado.
 */

export const DENTISTA_JOAO_EMAIL_LOGIN = 'drjoaovictorpimenta@gmail.com'

const USUARIO_MAP: Record<string, string> = {
  joao: DENTISTA_JOAO_EMAIL_LOGIN,
  joão: DENTISTA_JOAO_EMAIL_LOGIN,
}

/** Aceita o alias "joao"/"joão" OU qualquer e-mail válido digitado direto. */
export function resolveDentistaJoaoEmail(usuarioDigitado: string): string | null {
  const normalizado = usuarioDigitado.trim().toLowerCase()
  if (USUARIO_MAP[normalizado]) return USUARIO_MAP[normalizado]
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) return normalizado
  return null
}
