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

  // Janela ampla de busca (48h) — o filtro fino de "cruzou o limiar" é
  // feito em JS abaixo, porque comparar data+hora local (BRT, sem DST)
  // contra "agora" (UTC) é mais direto construindo o Date explícito com
  // offset -03:00 do que tentando fazer isso em SQL.
  const hojeStr = new Date(agora).toISOString().slice(0, 10)
  const depoisStr = new Date(agora + 48 * 3600 * 1000).toISOString().slice(0, 10)

  const { data: candidatos, error } = await supabase
    .from('agendamentos')
    .select('id, data, hora_inicio, hora_fim, paciente_nome, paciente_telefone, paciente_email, lembrete_24h_enviado_em, lembrete_1h_enviado_em')
    .eq('site_id', SITE_ID)
    .eq('status', 'confirmado')
    .gte('data', hojeStr)
    .lte('data', depoisStr)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let enviados24h = 0
  let enviados1h = 0

  for (const ag of candidatos ?? []) {
    if (!ag.paciente_email) continue
    const momento = new Date(`${ag.data}T${ag.hora_inicio}-03:00`).getTime()
    const diffMin = (momento - agora) / 60000
    if (diffMin <= 0) continue // já passou, não faz sentido lembrar

    if (!ag.lembrete_24h_enviado_em && diffMin <= 24 * 60) {
      await Promise.all([
        notificarLembretePaciente({
          email: ag.paciente_email, nome: ag.paciente_nome,
          data: ag.data, horaInicio: ag.hora_inicio, horaFim: ag.hora_fim, janela: '24h',
        }),
        notificarLembreteAdmin({
          emailDestino: site?.email_notificacoes ?? null,
          nomePaciente: ag.paciente_nome, telefone: ag.paciente_telefone,
          data: ag.data, horaInicio: ag.hora_inicio, horaFim: ag.hora_fim, janela: '24h',
        }),
      ])
      await supabase.from('agendamentos').update({ lembrete_24h_enviado_em: new Date().toISOString() }).eq('id', ag.id)
      enviados24h++
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

  return NextResponse.json({ ok: true, candidatos: candidatos?.length ?? 0, enviados24h, enviados1h })
}
