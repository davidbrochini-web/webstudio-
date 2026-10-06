import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notificarLembretePaciente, notificarLembreteAdmin } from '@/lib/dentista-joao-email'

export const dynamic = 'force-dynamic'

/**
 * Chamada por Supabase pg_cron + pg_net a cada 15 minutos (ver migration
 * 0040) — NÃO é Vercel Cron (Hobby só permite 1x/dia, insuficiente pro
 * lembrete de 1h). Autenticação via secret compartilhado (Bearer), não
 * sessão de usuário — não existe usuário logado numa chamada de cron.
 *
 * Modelo "dispara assim que cruzar o limiar" em vez de "só na janela
 * exata": cada agendamento tem lembrete_24h_enviado_em/lembrete_1h_
 * enviado_em (timestamptz, null = ainda não enviado). A cada execução,
 * dispara pra quem ainda não recebeu e já está dentro da janela — logo
 * idempotente mesmo se o cron atrasar ou rodar em paralelo por engano
 * (a marcação do timestamp evita reenvio).
 */

// Único site com agenda hoje — se outro projeto especial ganhar agenda
// no futuro, generalizar isso (iterar por site com agendamento_tipos_
// consulta configurado, por exemplo).
const SITE_ID = 'f3cdb729-2698-485d-a49a-f3e26767b934'

function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const agora = Date.now()

  const { data: site } = await supabase.from('sites').select('email_notificacoes').eq('id', SITE_ID).maybeSingle()

  // Datas de calendário em BRT (offset fixo -03:00, sem horário de verão
  // desde 2019). Antes usava a data UTC como "hoje": entre 21h e 24h BRT o
  // UTC já é o dia seguinte e a consulta das 22h ficava fora da busca
  // (perdia o lembrete de 1h). Corrigido em 06/10/2026.
  const BRT_MS = 3 * 3600 * 1000
  const hojeBRT = new Date(agora - BRT_MS).toISOString().slice(0, 10)
  const depoisBRT = new Date(agora - BRT_MS + 48 * 3600 * 1000).toISOString().slice(0, 10)

  const { data: candidatos, error } = await supabase
    .from('agendamentos')
    .select('id, data, hora_inicio, hora_fim, paciente_nome, paciente_telefone, paciente_email, created_at, lembrete_24h_enviado_em, lembrete_1h_enviado_em')
    .eq('site_id', SITE_ID)
    .eq('status', 'confirmado')
    .gte('data', hojeBRT)
    .lte('data', depoisBRT)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let enviados24h = 0
  let enviados1h = 0
  let pulados24h = 0

  for (const ag of candidatos ?? []) {
    if (!ag.paciente_email) continue
    const momento = new Date(`${ag.data}T${ag.hora_inicio}-03:00`).getTime()
    const diffMin = (momento - agora) / 60000
    if (diffMin <= 0) continue // já passou, não faz sentido lembrar

    // Lembrete de 24h só faz sentido se o agendamento existia ANTES de a
    // janela abrir. Quem marca hoje pra daqui a 5h já recebeu a confirmação
    // agora; mandar "lembrete" na mesma hora é ruído. E se já estamos dentro
    // da última hora, o de 1h cobre — nunca disparar os dois juntos.
    const criadoEm = new Date(ag.created_at).getTime()
    const existiaAntesDaJanela = criadoEm <= momento - 24 * 3600 * 1000
    const quando: 'hoje' | 'amanhã' = ag.data === hojeBRT ? 'hoje' : 'amanhã'

    if (!ag.lembrete_24h_enviado_em && diffMin <= 24 * 60 && diffMin > 60) {
      if (existiaAntesDaJanela) {
        await Promise.all([
          notificarLembretePaciente({
            email: ag.paciente_email, nome: ag.paciente_nome,
            data: ag.data, horaInicio: ag.hora_inicio, horaFim: ag.hora_fim, janela: '24h', quando,
          }),
          notificarLembreteAdmin({
            emailDestino: site?.email_notificacoes ?? null,
            nomePaciente: ag.paciente_nome, telefone: ag.paciente_telefone,
            data: ag.data, horaInicio: ag.hora_inicio, horaFim: ag.hora_fim, janela: '24h', quando,
          }),
        ])
        await supabase.from('agendamentos').update({ lembrete_24h_enviado_em: new Date().toISOString() }).eq('id', ag.id)
        enviados24h++
      } else {
        pulados24h++
      }
    }

    if (!ag.lembrete_1h_enviado_em && diffMin <= 60) {
      await Promise.all([
        notificarLembretePaciente({
          email: ag.paciente_email, nome: ag.paciente_nome,
          data: ag.data, horaInicio: ag.hora_inicio, horaFim: ag.hora_fim, janela: '1h',
        }),
        notificarLembreteAdmin({
          emailDestino: site?.email_notificacoes ?? null,
          nomePaciente: ag.paciente_nome, telefone: ag.paciente_telefone,
          data: ag.data, horaInicio: ag.hora_inicio, horaFim: ag.hora_fim, janela: '1h',
        }),
      ])
      await supabase.from('agendamentos').update({ lembrete_1h_enviado_em: new Date().toISOString() }).eq('id', ag.id)
      enviados1h++
    }
  }

  return NextResponse.json({ ok: true, candidatos: candidatos?.length ?? 0, enviados24h, enviados1h, pulados24h })
}
