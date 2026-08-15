'use client'

import { useState, useTransition } from 'react'
import { salvarTemplateFollowup, type TemplateFollowup } from '@/app/admin/crm/inteligencia-actions'

const MOMENTO_LABELS: Record<string, string> = {
  followup_1: 'Follow-up 1',
  followup_2: 'Follow-up 2',
  followup_3: 'Follow-up 3',
  resgate: 'Resgate',
  pos_proposta: 'Pós-proposta',
}

function TemplateRow({ item }: { item: TemplateFollowup }) {
  const [valor, setValor] = useState(item.template ?? '')
  const [salvo, setSalvo] = useState(true)
  const [pending, startTransition] = useTransition()

  function handleSalvar() {
    startTransition(async () => {
      await salvarTemplateFollowup(item.momento, valor)
      setSalvo(true)
    })
  }

  return (
    <div className="border border-[var(--border)] rounded-xl p-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-bold text-[var(--ink)]">{MOMENTO_LABELS[item.momento] ?? item.momento}</p>
        <p className="text-[10px] text-[var(--muted)]">{item.condicao}</p>
      </div>
      <textarea
        value={valor}
        onChange={e => { setValor(e.target.value); setSalvo(false) }}
        placeholder="Texto do template pra esse momento da régua..."
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-xs outline-none resize-none focus:border-[var(--brand)]"
      />
      <button
        onClick={handleSalvar}
        disabled={salvo || pending}
        className="text-[10px] font-semibold text-[var(--brand)] disabled:text-[var(--muted)] disabled:cursor-default mt-1"
      >
        {pending ? 'Salvando...' : salvo ? 'Salvo' : 'Salvar'}
      </button>
    </div>
  )
}

export default function TemplatesFollowupPanel({ templatesIniciais }: { templatesIniciais: TemplateFollowup[] }) {
  const [aberto, setAberto] = useState(false)

  const pendentes = templatesIniciais.filter(t => !t.template?.trim()).length

  return (
    <div>
      <button onClick={() => setAberto(a => !a)} className="w-full flex items-center gap-2 text-left">
        <span className={`text-[var(--muted)] text-[10px] flex-shrink-0 transition-transform ${aberto ? 'rotate-90' : ''}`}>▶</span>
        <p className="text-sm font-bold text-[var(--ink)]">
          Textos da régua {pendentes > 0 && <span className="text-xs font-normal text-amber-600">({pendentes} sem texto ainda)</span>}
        </p>
      </button>

      {aberto && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templatesIniciais.map(t => <TemplateRow key={t.momento} item={t} />)}
        </div>
      )}
    </div>
  )
}
