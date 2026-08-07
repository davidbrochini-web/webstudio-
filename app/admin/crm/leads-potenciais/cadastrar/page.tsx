import Link from 'next/link'
import CadastrarLeadForm from '@/components/admin/CadastrarLeadForm'

export default function CadastrarLeadPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/admin/crm/leads-potenciais" className="hover:text-[var(--ink)] transition-colors">Leads potenciais</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Cadastrar</span>
      </div>

      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Cadastrar lead</h1>
      <p className="text-[var(--muted)] text-sm mb-8">Registre uma empresa nova pra contatar.</p>

      <CadastrarLeadForm />
    </div>
  )
}
