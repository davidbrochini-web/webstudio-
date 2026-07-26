import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import FinanceiroSubNav from '@/components/app/FinanceiroSubNav'
import ContaManager from '@/components/app/ContaManager'

export default async function ContasPagarPage() {
  const info = await getCurrentTenant()
  if (!info) return <p className="text-sm text-[var(--muted)]">Sua conta não está vinculada a nenhuma empresa.</p>

  const supabase = await createClient()
  const [{ data: contas }, { data: fornecedores }] = await Promise.all([
    supabase
      .from('contas_pagar')
      .select('id, fornecedor_id, descricao, categoria, valor, vencimento, data_pagamento, status, observacoes')
      .eq('tenant_id', info.tenantId)
      .is('deleted_at', null)
      .order('vencimento'),
    supabase
      .from('fornecedores')
      .select('id, nome')
      .eq('tenant_id', info.tenantId)
      .is('deleted_at', null)
      .order('nome'),
  ])

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">Financeiro</h1>
      <FinanceiroSubNav />
      <ContaManager tenantId={info.tenantId} contas={contas ?? []} partes={fornecedores ?? []} readOnly={!podeEditar} tipo="pagar" />
    </div>
  )
}
