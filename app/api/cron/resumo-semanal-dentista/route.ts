import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notificarResumoSemanal } from '@/lib/dentista-joao-email'

export const dynamic = 'force-dynamic'

/**
 * Resumo semanal da agenda (pedido do cliente, 06/10/2026). Chamado por
 * pg_cron + pg_net toda segunda às 6h BRT (job `resumo-semanal-dentista-
 * joao`, migration 0072). Mesmo padrão de auth dos outros crons.
 *
 * "Semana" = segunda a domingo da semana corrente em BRT. Calculado a
 * partir da data de hoje, não fixo em "hoje é segunda": assim um disparo
 * manual/de teste em outro dia da semana mostra a semana certa em vez de
 * uma janela torta de 7 dias.
 */

const SITE_ID = 'f3cdb729-2698-485d-a49a-f3e26767b934'

function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

function semanaBRT(agora: number): string[] {
  // Offset fixo -03:00 (sem horário de verão desde 2019).
  const hoje = new Date(agora - 3 * 3600 * 1000)
  const diaSemana = hoje.getUTCDay() // 0 = domingo
  const voltar = diaSemana === 0 ? 6 : diaSemana - 1
  const segunda = Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() - voltar)
  return Array.from({ length: 7 }, (_, i) => new Date(segunda + i * 86400000).toISOString().slice(0, 10))
}

export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const dias = semanaBRT(Date.now())

  const [{ data: site }, { data: agendamentos, error }] = await Promise.all([
    supabase.from('sites').select('email_notificacoes').eq('id', SITE_ID).maybeSingle(),
    supabase
      .from('agendamentos')
      .select('data, status, paciente_nome, hora_inicio, hora_fim, tipo_consulta:agendamento_tipos_consulta(nome)')
      .eq('site_id', SITE_ID)
      .in('status', ['confirmado', 'pendente'])
      .gte('data', dias[0])
      .lte('data', dias[6])
      .order('data')
      .order('hora_inicio'),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const lista = agendamentos ?? []
  const confirmados = lista
    .filter(a => a.status === 'confirmado')
    .map(a => ({
      data: a.data,
      paciente_nome: a.paciente_nome,
      hora_inicio: a.hora_inicio,
      hora_fim: a.hora_fim,
      tipo_consulta_nome: (a.tipo_consulta as unknown as { nome: string } | null)?.nome ?? null,
    }))
  const pendentes = lista.filter(a => a.status === 'pendente').length

  await notificarResumoSemanal({
    emailDestino: site?.email_notificacoes ?? null,
    dias,
    confirmados,
    pendentes,
  })

  return NextResponse.json({ ok: true, semana: `${dias[0]}..${dias[6]}`, confirmados: confirmados.length, pendentes })
}
