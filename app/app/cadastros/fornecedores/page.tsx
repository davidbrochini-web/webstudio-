import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import CadastrosSubNav from '@/components/app/CadastrosSubNav'
import PessoaManager from '@/components/app/PessoaManager'

export default async function FornecedoresPage() {
  const info = await getCurrentTenant()
  if (!info) return <p className="text-sm text-[var(--muted)]">Sua conta não está vinculada a nenhuma empresa.</p>

  const supabase = await createClient()
  const { data: fornecedores } = await supabase
    .from('fornecedores')
    .select('id, tipo_pessoa, nome, cpf_cnpj, telefone, email, status, observacoes')
    .eq('tenant_id', info.tenantId)
    .is('deleted_at', null)
    .order('nome')

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">Cadastros</h1>
      <CadastrosSubNav />
      <PessoaManager tenantId={info.tenantId} pessoas={fornecedores ?? []} readOnly={!podeEditar} tipo="fornecedor" />
    </div>
  )
}
