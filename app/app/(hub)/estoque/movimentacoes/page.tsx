import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import EstoqueSubNav from '@/components/app/EstoqueSubNav'
import MovimentacaoManager, { type Movimentacao } from '@/components/app/MovimentacaoManager'

export default async function MovimentacoesPage() {
  const info = await getCurrentTenant()
  if (!info) return <p className="text-sm text-[var(--muted)]">Sua conta não está vinculada a nenhuma empresa.</p>

  const supabase = await createClient()
  const [{ data: produtos }, { data: movs }] = await Promise.all([
    supabase
      .from('produtos_servicos')
      .select('id, nome, unidade')
      .eq('tenant_id', info.tenantId)
      .eq('tipo', 'produto')
      .is('deleted_at', null)
      .order('nome'),
    supabase
      .from('estoque_movimentacoes')
      .select('id, produto_id, tipo, quantidade, motivo, data, observacoes, produtos_servicos(nome)')
      .eq('tenant_id', info.tenantId)
      .is('deleted_at', null)
      .order('data', { ascending: false })
      .limit(200),
  ])

  const movimentacoes: Movimentacao[] = (movs ?? []).map(m => ({
    id: m.id,
    produto_id: m.produto_id,
    produtoNome: (m.produtos_servicos as unknown as { nome: string } | null)?.nome ?? '—',
    tipo: m.tipo,
    quantidade: m.quantidade,
    motivo: m.motivo,
    data: m.data,
    observacoes: m.observacoes,
  }))

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">Controle de Estoque</h1>
      <EstoqueSubNav />
      <MovimentacaoManager tenantId={info.tenantId} produtos={produtos ?? []} movimentacoes={movimentacoes} readOnly={!podeEditar} />
    </div>
  )
}
