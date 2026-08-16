import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Mesmo padrão de autenticação dos demais crons via pg_net
// (ver /api/cron/crm-escalonamento) — secret do Vault, header
// Authorization: Bearer.
function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

/**
 * Purge definitivo das demos soft-deletadas há mais de 7 dias (ver
 * trigger trg_demo_soft_delete_ao_perder_lead, migration 0058).
 *
 * Isso precisa ser um endpoint HTTP (não SQL puro via pg_cron) por
 * um motivo específico: apagar o tenant sozinho (cascade) deixa
 * órfão o usuário anônimo do Supabase Auth vinculado à membership —
 * mesma razão pela qual o botão manual de apagar demo
 * (app/admin/tenants/demos/actions.ts) já fazia essa limpeza dupla.
 * SQL puro não tem acesso à Auth Admin API, só o service_role via
 * client JS tem.
 */
export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: tenants, error } = await admin
    .from('tenants')
    .select('id')
    .eq('is_demo', true)
    .not('deleted_at', 'is', null)
    .lt('deleted_at', seteDiasAtras)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!tenants || tenants.length === 0) return NextResponse.json({ ok: true, purgados: 0 })

  let purgados = 0
  for (const tenant of tenants) {
    const { data: memberships } = await admin
      .from('memberships')
      .select('user_id')
      .eq('tenant_id', tenant.id)

    const { error: deleteError } = await admin.from('tenants').delete().eq('id', tenant.id)
    if (deleteError) continue // não trava o purge dos outros por causa de 1 falha

    for (const m of memberships ?? []) {
      await admin.auth.admin.deleteUser(m.user_id).catch(() => {
        // usuário já pode não existir por outro motivo — segue em frente
      })
    }
    purgados++
  }

  return NextResponse.json({ ok: true, purgados })
}
