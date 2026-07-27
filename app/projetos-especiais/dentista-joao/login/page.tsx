import { redirect } from 'next/navigation'

/**
 * Link de conveniência (/projetos-especiais/dentista-joao/login) pro
 * cliente achar o caminho do painel — a autenticação em si é sempre
 * a mesma (/login), que já manda quem não é super-admin pro /app do
 * tenant a que pertence. Não duplica lógica de auth aqui.
 */
export default function LoginRedirectPage() {
  redirect('/login?redirect=%2Fapp')
}
