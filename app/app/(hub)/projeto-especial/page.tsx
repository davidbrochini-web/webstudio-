import { redirect } from 'next/navigation'

// Rota index /app/projeto-especial → redireciona pra primeira tela real
export default function ProjetoEspecialIndex() {
  redirect('/app/projeto-especial/config')
}
