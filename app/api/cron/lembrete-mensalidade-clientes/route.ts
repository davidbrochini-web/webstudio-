import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notificarLembreteMensalidadeCliente, type ItemMensalidade } from '@/lib/assinatura-email'

export const dynamic = 'force-dynamic'

function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

/**
 * Roda todo dia 20 (pg_cron job 'lembrete-mensalidade-clientes',
 * '0 12 20 * *'). Padrão pra todos os clientes (decisão do David,
 * 01/09/2026) — não é mais específico do Dentista João.
 *
 * Pega pagamentos pendentes/atrasados com vencimento em ~10 dias (a
 * janela de 9-11 dias cobre a variação de tamanho dos meses), agrupa
 * por tenant, e manda um e-mail por tenant com a lista + total. Só
 * manda quando existe algo vencendo nessa janela — sem pagamento
 * batendo na janela, sem e-mail (evita lembrete todo mês pra quem
 * não tem nada vencendo, e evita repetir aviso pra quem já pagou
 * adiantado).
 */
export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const hoje = new Date()
  const de = new Date(hoje); de.setDate(de.getDate() + 9)
  const ate = new Date(hoje); ate.setDate(ate.getDate() + 11)
  const deStr = de.toISOString().slice(0, 10)
  const ateStr = ate.toISOString().slice(0, 10)

  const { data: pagamentos, error } = await supabase
    .from('assinatura_pagamentos')
    .select('id, item_id, valor_centavos, vencimento, assinatura_itens(tenant_id, label, tenants(nome))')
    .in('status', ['pendente', 'atrasado'])
    .gte('vencimento', deStr)
    .lte('vencimento', ateStr)
    .is('deleted_at', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!pagamentos || pagamentos.length === 0) return NextResponse.json({ ok: true, tenantsAvisados: 0 })

  type Linha = {
    tenantId: string
    tenantNome: string
    vencimento: string
    itens: ItemMensalidade[]
    total: number
  }
  const porTenant = new Map<string, Linha>()

  for (const p of pagamentos) {
    const item = p.assinatura_itens as unknown as { tenant_id: string; label: string; tenants: { nome: string } | null }
    if (!item) continue
    const atual = porTenant.get(item.tenant_id) ?? {
      tenantId: item.tenant_id,
      tenantNome: item.tenants?.nome ?? '—',
      vencimento: p.vencimento as string,
      itens: [],
      total: 0,
    }
    atual.itens.push({ label: item.label, valorCentavos: p.valor_centavos })
    atual.total += p.valor_centavos
    porTenant.set(item.tenant_id, atual)
  }

  const tenantIds = [...porTenant.keys()]
  const { data: sites } = await supabase
    .from('sites')
    .select('tenant_id, email_notificacoes')
    .in('tenant_id', tenantIds)

  const emailPorTenant = new Map((sites ?? []).map(s => [s.tenant_id, s.email_notificacoes]))

  let enviados = 0
  for (const linha of porTenant.values()) {
    const email = emailPorTenant.get(linha.tenantId) ?? null
    await notificarLembreteMensalidadeCliente({
      emailDestino: email,
      tenantNome: linha.tenantNome,
      itens: linha.itens,
      totalCentavos: linha.total,
      vencimento: linha.vencimento,
    })
    if (email) enviados++
  }

  return NextResponse.json({ ok: true, tenantsComVencimento: porTenant.size, tenantsAvisados: enviados })
}
