import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notificarResumoDiario } from '@/lib/dentista-joao-email'

export const dynamic = 'force-dynamic'

const SITE_ID = 'f3cdb729-2698-485d-a49a-f3e26767b934'

function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  // Cron dispara às 9h UTC = 6h BRT (sem DST desde 2019, offset fixo
  // -03:00) — nesse horário a data de calendário já é a mesma nos dois
  // fusos, então "agora menos 3h" dá a data local certa sem precisar de
  // lib de timezone.
  const hojeBRT = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10)

  const [{ data: site }, { data: agendamentos, error }] = await Promise.all([
    supabase.from('sites').select('email_notificacoes').eq('id', SITE_ID).maybeSingle(),
    supabase
      .from('agendamentos')
      .select('paciente_nome, hora_inicio, hora_fim, tipo_consulta:agendamento_tipos_consulta(nome)')
      .eq('site_id', SITE_ID)
      .eq('status', 'confirmado')
      .eq('data', hojeBRT)
      .order('hora_inicio'),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await notificarResumoDiario({
    emailDestino: site?.email_notificacoes ?? null,
    data: hojeBRT,
    agendamentos: (agendamentos ?? []).map(a => ({
      paciente_nome: a.paciente_nome,
      hora_inicio: a.hora_inicio,
      hora_fim: a.hora_fim,
      tipo_consulta_nome: (a.tipo_consulta as unknown as { nome: string } | null)?.nome ?? null,
    })),
  })

  return NextResponse.json({ ok: true, total: agendamentos?.length ?? 0 })
}
