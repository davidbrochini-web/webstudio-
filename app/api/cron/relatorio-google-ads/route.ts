import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { relatorioGoogleAds } from '@/lib/google-ads-resumo'
import { enviarRelatorioGoogleAds } from '@/lib/google-ads-email'

export const dynamic = 'force-dynamic'

function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

/**
 * Relatório de Google Ads por e-mail para o cliente (genérico por conta).
 * Body: { "identificador": "dentista-joao", "desde": "2026-10-08", "saudacao": "Dr. João" }
 * Destinatário: sites.email_notificacoes do tenant da conta, CC David.
 * Os números são puxados do Google no momento da chamada (sem cache).
 * Primeiro uso: Dr. João, 16/10/2026 às 20h BRT (migration 0074).
 */
export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as { identificador?: string; desde?: string; saudacao?: string }
  if (!body.identificador || !body.desde || !/^\d{4}-\d{2}-\d{2}$/.test(body.desde)) {
    return NextResponse.json({ error: 'identificador e desde (YYYY-MM-DD) obrigatórios' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: acesso } = await admin
    .from('google_ads_acessos').select('tenant_id').eq('identificador', body.identificador).maybeSingle()
  if (!acesso) return NextResponse.json({ error: 'conta não encontrada' }, { status: 404 })

  const { data: site } = await admin
    .from('sites').select('email_notificacoes').eq('tenant_id', acesso.tenant_id).limit(1).maybeSingle()

  const rel = await relatorioGoogleAds(body.identificador, body.desde)
  if (!rel.disponivel) return NextResponse.json({ ok: false, motivo: rel.motivoIndisponivel }, { status: 502 })

  const { enviado } = await enviarRelatorioGoogleAds({
    emailDestino: site?.email_notificacoes ?? null,
    saudacao: body.saudacao,
    rel,
  })

  return NextResponse.json({ ok: true, enviado, totais: rel.totais, saldo: rel.saldoDisponivel })
}
