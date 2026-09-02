import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notificarLembreteMensalidade } from '@/lib/dentista-joao-email'

export const dynamic = 'force-dynamic'

const SITE_ID = 'f3cdb729-2698-485d-a49a-f3e26767b934'

function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

// Disparo ÚNICO agendado via pg_cron pra 20/09/2026 — não é um
// resumo recorrente tipo os outros crons deste projeto. Depois de
// disparar, o job pg_cron correspondente ('lembrete-mensalidade-
// dentista-joao') deve ser removido (cron.unschedule), senão volta a
// disparar todo 20/09 nos anos seguintes.
export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: site } = await supabase
    .from('sites')
    .select('email_notificacoes')
    .eq('id', SITE_ID)
    .single()

  await notificarLembreteMensalidade({ emailDestino: site?.email_notificacoes ?? null })

  return NextResponse.json({ ok: true, enviadoPara: site?.email_notificacoes ?? null })
}
