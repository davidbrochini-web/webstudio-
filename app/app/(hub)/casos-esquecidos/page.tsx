import Link from 'next/link'
import { getCurrentTenant } from '@/lib/current-tenant'
import { getAllContosAdmin } from '@/lib/casos-esquecidos'

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default async function CasosEsquecidosAdmin() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const contos = await getAllContosAdmin(info.siteId)
  const agora = new Date().getTime()
  const publicados = contos.filter(c => new Date(c.data_publicacao).getTime() <= agora).length
  const agendados = contos.length - publicados

  return (
    <div className="max-w-4xl">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Casos Esquecidos</h1>
          <p className="text-[var(--muted)] text-sm">
            <span className="font-semibold text-[var(--ink)]">{publicados}</span> publicados
            {agendados > 0 && <> · <span className="text-amber-600 font-semibold">{agendados}</span> agendados</>}
          </p>
        </div>
        <Link
          href="/app/casos-esquecidos/novo"
          className="inline-flex items-center gap-2 bg-[var(--ink)] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          + Novo caso
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {contos.map(c => {
          const agendado = new Date(c.data_publicacao).getTime() > agora
          return (
            <Link
              key={c.slug}
              href={`/app/casos-esquecidos/${c.slug}`}
              className="flex items-center justify-between flex-wrap gap-2 px-4 py-3.5 border border-[var(--border)] rounded-xl bg-white hover:border-[var(--ink)]/30 transition-colors"
            >
              <span className="text-sm text-[var(--ink)]">
                <span className="font-mono text-xs text-red-700 mr-3">Nº {String(c.numero).padStart(3, '0')}</span>
                {c.titulo}
              </span>
              <span className="flex items-center gap-3">
                <span
                  className={`font-mono text-[11px] px-2 py-1 rounded-full border ${
                    agendado ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-emerald-400 text-emerald-700 bg-emerald-50'
                  }`}
                >
                  {agendado ? `Agendado — ${formatarData(c.data_publicacao)}` : `Publicado em ${formatarData(c.data_publicacao)}`}
                </span>
                {!c.publicado && (
                  <span className="font-mono text-[11px] px-2 py-1 rounded-full border border-[var(--border)] text-[var(--muted)]">
                    Oculto
                  </span>
                )}
                <span className="text-[var(--muted)] text-sm">editar →</span>
              </span>
            </Link>
          )
        })}
        {contos.length === 0 && (
          <p className="text-[var(--muted)] text-sm py-8 text-center">Nenhum caso publicado ainda.</p>
        )}
      </div>
    </div>
  )
}
