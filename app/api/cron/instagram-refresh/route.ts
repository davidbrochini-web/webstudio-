import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizarPostsBehold, type InstagramPost } from '@/lib/instagram'

export const dynamic = 'force-dynamic'

// Mesmo padrão de autenticação dos demais crons via pg_net
// (ver /api/cron/demo-purge) — secret do Vault, header Bearer.
function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

/**
 * Atualiza o cache de posts do Instagram de todos os feeds ativos.
 * Roda 5x/dia (9h, 12h, 15h, 18h, 21h BRT) via pg_cron — ver
 * migration 0065. O site lê SEMPRE da tabela, nunca do Behold
 * direto: consumo de views no Behold fica fixo e previsível
 * (~150/mês por feed), independente do tráfego do site.
 *
 * Falha em um feed não derruba os outros; o erro fica registrado em
 * last_fetch_error e o cache antigo permanece servindo (feed nunca
 * "some" por erro transitório — só congela no último estado bom).
 */
export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: feeds, error } = await admin
    .from('instagram_feeds')
    .select('id, chave, behold_feed_url')
    .eq('ativo', true)
    .not('behold_feed_url', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!feeds || feeds.length === 0) return NextResponse.json({ ok: true, atualizados: 0 })

  let atualizados = 0
  const falhas: string[] = []

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.behold_feed_url!, {
        cache: 'no-store',
        signal: AbortSignal.timeout(15_000),
      })
      if (!res.ok) throw new Error(`Behold respondeu ${res.status}`)

      const json: unknown = await res.json()
      const posts: InstagramPost[] = normalizarPostsBehold(json)

      await admin
        .from('instagram_feeds')
        .update({
          posts,
          fetched_at: new Date().toISOString(),
          last_fetch_ok: true,
          last_fetch_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', feed.id)

      atualizados++
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      falhas.push(`${feed.chave}: ${msg}`)
      // registra a falha mas NÃO mexe em posts/fetched_at — cache
      // antigo continua servindo o site
      await admin
        .from('instagram_feeds')
        .update({ last_fetch_ok: false, last_fetch_error: msg, updated_at: new Date().toISOString() })
        .eq('id', feed.id)
    }
  }

  return NextResponse.json({ ok: true, atualizados, falhas })
}
