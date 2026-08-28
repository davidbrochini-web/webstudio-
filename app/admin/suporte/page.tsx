import { createClient } from '@/lib/supabase/server'
import SuporteStatusSelect from '@/components/admin/SuporteStatusSelect'

const TIPO_LABEL: Record<string, string> = {
  erro: '🐞 Erro',
  novo_escopo: '💡 Ideia',
}

export default async function SuportePage() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from('suporte_tickets')
    .select('id, tipo, mensagem, imagem_url, status, usuario_email, created_at, tenants(nome)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  const abertos = tickets?.filter(t => t.status === 'aberto').length ?? 0
  const emAndamento = tickets?.filter(t => t.status === 'em_andamento').length ?? 0
  const total = tickets?.length ?? 0

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Suporte</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Chamados de erro e ideias de novo escopo abertos pelos clientes direto do painel deles.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Abertos', valor: abertos },
          { label: 'Em andamento', valor: emAndamento },
          { label: 'Total (200 últimos)', valor: total },
        ].map(k => (
          <div key={k.label} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 text-center">
            <p className="font-display font-extrabold text-3xl text-[var(--ink)]">{k.valor}</p>
            <p className="text-xs text-[var(--muted)] mt-1 font-medium">{k.label}</p>
          </div>
        ))}
      </div>

      {!tickets?.length ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">🎧</p>
          <p className="font-display font-bold text-[var(--ink)] text-lg mb-1">Nenhum chamado ainda</p>
          <p className="text-[var(--muted)] text-sm">Quando um cliente abrir um chamado no painel dele, aparece aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map(t => {
            const tenantNome = (t.tenants as unknown as { nome: string } | null)?.nome ?? '—'
            const data = new Date(t.created_at)
            return (
              <div key={t.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-bold text-[var(--muted)]">{TIPO_LABEL[t.tipo] ?? t.tipo}</span>
                    <p className="font-display font-bold text-[var(--ink)]">{tenantNome}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {t.usuario_email} · {data.toLocaleDateString('pt-BR')} {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <SuporteStatusSelect id={t.id} status={t.status} />
                </div>
                <p className="text-sm text-[var(--ink)] whitespace-pre-wrap mb-2">{t.mensagem}</p>
                {t.imagem_url && (
                  <a href={t.imagem_url} target="_blank" rel="noopener noreferrer" className="cursor-pointer inline-block text-xs font-bold text-[var(--brand)] hover:underline">
                    📎 Ver imagem anexada
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
