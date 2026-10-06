import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notificarMensalidadeEmAberto, type ItemMensalidade } from '@/lib/assinatura-email'

export const dynamic = 'force-dynamic'

function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

/**
 * Aviso de mensalidade em aberto (status 'atrasado'), POR TENANT.
 * Disparo pontual decidido pelo David — não é um cron recorrente de
 * cobrança. Exige `tenant_id` no body de propósito: sem ele a rota
 * recusa, pra nunca virar um disparo em massa por engano.
 *
 * Body: { "tenant_id": "<uuid>", "saudacao": "Dr. João" }
 * Primeiro uso: Dr. João, 07/10/2026 às 6h BRT (migration 0073).
 */
export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as { tenant_id?: string; saudacao?: string }
  if (!body.tenant_id) return NextResponse.json({ error: 'tenant_id obrigatório' }, { status: 400 })

  const supabase = createAdminClient()

  const [{ data: pagamentos, error }, { data: site }] = await Promise.all([
    supabase
      .from('assinatura_pagamentos')
      .select('valor_centavos, vencimento, assinatura_itens!inner(tenant_id, label)')
      .eq('status', 'atrasado')
      .eq('assinatura_itens.tenant_id', body.tenant_id)
      .is('deleted_at', null)
      .order('vencimento'),
    supabase.from('sites').select('email_notificacoes').eq('tenant_id', body.tenant_id).limit(1).maybeSingle(),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Pagou antes do disparo (status virou 'pago')? Não manda nada.
  if (!pagamentos || pagamentos.length === 0) return NextResponse.json({ ok: true, enviado: false, motivo: 'nada em aberto' })

  const itens: ItemMensalidade[] = pagamentos.map(p => ({
    label: (p.assinatura_itens as unknown as { label: string }).label,
    valorCentavos: p.valor_centavos,
  }))
  const total = itens.reduce((s, i) => s + i.valorCentavos, 0)

  await notificarMensalidadeEmAberto({
    emailDestino: site?.email_notificacoes ?? null,
    saudacao: body.saudacao,
    itens,
    totalCentavos: total,
    vencimento: pagamentos[0].vencimento as string,
  })

  return NextResponse.json({ ok: true, enviado: !!site?.email_notificacoes, itens: itens.length, totalCentavos: total })
}
