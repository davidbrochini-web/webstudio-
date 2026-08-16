import Link from 'next/link'
import { listarDicionario } from '@/app/admin/crm/dicionario-actions'
import DicionarioCuradoria from '@/components/admin/DicionarioCuradoria'

export default async function DicionarioPage() {
  const padroes = await listarDicionario()

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/admin/crm/leads-potenciais" className="hover:text-[var(--ink)] transition-colors">Leads potenciais</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Cérebro do CRM</span>
      </div>

      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Cérebro do CRM</h1>
      <p className="text-[var(--muted)] text-sm mb-8 max-w-2xl">
        Todos os padrões que o motor de análise reconhece nas conversas. Adicione variações novas quando um
        jeito de falar passar batido, desative o que gera falso positivo, e use o testador pra validar antes de salvar.
      </p>

      <DicionarioCuradoria padroesIniciais={padroes} />
    </div>
  )
}
