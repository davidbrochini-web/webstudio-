'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  adicionarPadrao,
  atualizarPadrao,
  alternarAtivoPadrao,
  testarFrase,
  type PadraoDicionario,
  type MatchTeste,
} from '@/app/admin/crm/dicionario-actions'

const CATEGORIA_LABELS: Record<string, string> = {
  atendente_erro: '🔴 Erro do atendente',
  atendente_acerto: '🟢 Acerto do atendente',
  perfil_lead: '👤 Perfil do lead',
  objecao: '⚠️ Objeção',
  interesse: '🎯 Interesse',
  qualificacao: '📋 Qualificação',
  escalonamento: '🔔 Escalonamento',
}

const DIRECAO_LABELS: Record<string, string> = {
  enviada: 'atendente',
  recebida: 'cliente',
  ambas: 'ambos',
}

// ============================================================
// Testador de frases
// ============================================================
function TestadorFrases() {
  const [texto, setTexto] = useState('')
  const [direcao, setDirecao] = useState<'enviada' | 'recebida'>('recebida')
  const [matches, setMatches] = useState<MatchTeste[] | null>(null)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleTestar() {
    if (!texto.trim()) return
    setErro(null)
    startTransition(async () => {
      try {
        const resultado = await testarFrase(texto, direcao)
        setMatches(resultado)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao testar.')
      }
    })
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-5 mb-8">
      <p className="font-display font-bold text-[var(--ink)] mb-1">🧪 Testador de frases</p>
      <p className="text-xs text-[var(--muted)] mb-3">
        Cole uma frase real e veja o que o motor detectaria — nada é gravado, é só simulação.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden flex-shrink-0 self-start">
          <button
            onClick={() => setDirecao('recebida')}
            className={`text-[11px] font-bold px-2.5 py-2 transition-colors ${direcao === 'recebida' ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)]'}`}
          >
            Cliente
          </button>
          <button
            onClick={() => setDirecao('enviada')}
            className={`text-[11px] font-bold px-2.5 py-2 transition-colors ${direcao === 'enviada' ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)]'}`}
          >
            Atendente
          </button>
        </div>
        <input
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleTestar() }}
          placeholder="ex: nossa, achei meio salgado o valor..."
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
        />
        <button
          onClick={handleTestar}
          disabled={pending || !texto.trim()}
          className="text-sm font-semibold text-white bg-[var(--dark)] px-4 py-2 rounded-lg disabled:opacity-40 flex-shrink-0"
        >
          {pending ? 'Testando...' : 'Testar'}
        </button>
      </div>
      {erro && <p className="text-xs text-red-500 mt-2">{erro}</p>}
      {matches !== null && (
        <div className="mt-3">
          {matches.length === 0 ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Nenhum padrão detectou essa frase — se ela devia disparar algo, adicione um padrão novo abaixo.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {matches.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-[var(--off)] rounded-lg px-3 py-2 flex-wrap">
                  <span className="font-bold">{CATEGORIA_LABELS[m.categoria] ?? m.categoria}</span>
                  {m.subtipo && <span className="text-[var(--muted)]">· {m.subtipo}</span>}
                  <span className="text-[var(--muted)]">· padrão: &quot;{m.padrao}&quot;</span>
                  {m.peso !== 0 && (
                    <span className={`font-bold ${m.peso < 0 ? 'text-red-500' : 'text-[var(--brand)]'}`}>
                      {m.peso > 0 ? '+' : ''}{m.peso}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Formulário de padrão novo
// ============================================================
function NovoPadraoForm({ onAdded }: { onAdded: () => void }) {
  const [aberto, setAberto] = useState(false)
  const [categoria, setCategoria] = useState('objecao')
  const [subtipo, setSubtipo] = useState('')
  const [padrao, setPadrao] = useState('')
  const [peso, setPeso] = useState(0)
  const [direcao, setDirecao] = useState('recebida')
  const [dica, setDica] = useState('')
  const [resposta, setResposta] = useState('')
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  function handleSalvar() {
    setErro(null)
    setSucesso(false)
    startTransition(async () => {
      try {
        await adicionarPadrao({
          categoria,
          subtipo,
          padrao,
          peso,
          direcaoAlvo: direcao,
          dicaAtendente: dica || undefined,
          respostaRecomendada: resposta || undefined,
        })
        setPadrao('')
        setDica('')
        setResposta('')
        setSucesso(true)
        setTimeout(() => setSucesso(false), 2500)
        onAdded()
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao salvar.')
      }
    })
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-5 mb-8">
      <button onClick={() => setAberto(a => !a)} className="w-full flex items-center gap-2 text-left">
        <span className={`text-[var(--muted)] text-[10px] transition-transform ${aberto ? 'rotate-90' : ''}`}>▶</span>
        <p className="font-display font-bold text-[var(--ink)]">➕ Adicionar padrão novo</p>
      </button>

      {aberto && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Categoria</p>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-[var(--border)] bg-white outline-none">
              {Object.entries(CATEGORIA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Subtipo (ex: preco, tem_site)</p>
            <input value={subtipo} onChange={e => setSubtipo(e.target.value)} placeholder="preco" className="w-full text-xs px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] outline-none focus:border-[var(--brand)]" />
          </div>
          <div className="sm:col-span-2">
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Padrão (trecho que dispara — minúsculas, sem precisar acento)</p>
            <input value={padrao} onChange={e => setPadrao(e.target.value)} placeholder="ta salgado" className="w-full text-xs px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] outline-none focus:border-[var(--brand)]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Quem fala</p>
            <select value={direcao} onChange={e => setDirecao(e.target.value)} className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-[var(--border)] bg-white outline-none">
              <option value="recebida">Cliente</option>
              <option value="enviada">Atendente</option>
              <option value="ambas">Ambos</option>
            </select>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Peso no termômetro (-30 a +30, 0 = só marca)</p>
            <input type="number" min={-30} max={30} value={peso} onChange={e => setPeso(Number(e.target.value))} className="w-full text-xs px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] outline-none focus:border-[var(--brand)]" />
          </div>
          <div className="sm:col-span-2">
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Dica pro atendente (opcional — aparece na hora do disparo)</p>
            <input value={dica} onChange={e => setDica(e.target.value)} placeholder="⚠️ Nunca prometa prazo antes do levantamento" className="w-full text-xs px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] outline-none focus:border-[var(--brand)]" />
          </div>
          <div className="sm:col-span-2">
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Resposta recomendada (opcional — vira sugestão copiável)</p>
            <textarea value={resposta} onChange={e => setResposta(e.target.value)} rows={2} placeholder="Entendo! O valor reflete..." className="w-full text-xs px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] outline-none resize-none focus:border-[var(--brand)]" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button onClick={handleSalvar} disabled={pending} className="text-sm font-semibold text-white bg-[var(--brand)] px-4 py-2 rounded-lg disabled:opacity-40">
              {pending ? 'Salvando...' : 'Salvar padrão'}
            </button>
            {erro && <p className="text-xs text-red-500">{erro}</p>}
            {sucesso && <p className="text-xs text-[var(--brand)] font-semibold">✓ Padrão adicionado</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Linha de padrão na lista
// ============================================================
function PadraoRow({ padrao, onChanged }: { padrao: PadraoDicionario; onChanged: () => void }) {
  const [pending, startTransition] = useTransition()
  const [editando, setEditando] = useState(false)
  const [peso, setPeso] = useState(padrao.peso)
  const [dica, setDica] = useState(padrao.dicaAtendente ?? '')
  const [resposta, setResposta] = useState(padrao.respostaRecomendada ?? '')

  function handleToggleAtivo() {
    startTransition(async () => {
      await alternarAtivoPadrao(padrao.id, !padrao.ativo)
      onChanged()
    })
  }

  function handleSalvarEdicao() {
    startTransition(async () => {
      await atualizarPadrao(padrao.id, { peso, dicaAtendente: dica || null, respostaRecomendada: resposta || null })
      setEditando(false)
      onChanged()
    })
  }

  const alertaFp = padrao.disparos >= 3 && padrao.falsosPositivos / padrao.disparos > 0.4

  return (
    <div className={`border rounded-xl px-3 py-2 ${padrao.ativo ? 'border-[var(--border)] bg-white' : 'border-dashed border-[var(--border)] bg-[var(--off)] opacity-60'}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <p className="text-xs font-bold text-[var(--ink)]">&quot;{padrao.padrao}&quot;</p>
          <span className="text-[10px] text-[var(--muted)]">{padrao.subtipo} · {DIRECAO_LABELS[padrao.direcaoAlvo]}</span>
          {padrao.peso !== 0 && (
            <span className={`text-[10px] font-bold ${padrao.peso < 0 ? 'text-red-500' : 'text-[var(--brand)]'}`}>
              {padrao.peso > 0 ? '+' : ''}{padrao.peso}
            </span>
          )}
          {padrao.disparos > 0 && (
            <span className="text-[9px] font-semibold text-[var(--muted)] bg-[var(--off)] px-1.5 py-0.5 rounded-full">
              {padrao.disparos}× {padrao.falsosPositivos > 0 && `(${padrao.falsosPositivos} FP)`}
            </span>
          )}
          {alertaFp && (
            <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full" title="Mais de 40% dos disparos foram marcados como falso positivo — revise ou desative">
              ⚠️ muitos falsos positivos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button onClick={() => setEditando(e => !e)} className="text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--brand)]">
            {editando ? 'fechar' : 'editar'}
          </button>
          <button onClick={handleToggleAtivo} disabled={pending} className={`text-[10px] font-semibold disabled:opacity-40 ${padrao.ativo ? 'text-[var(--muted)] hover:text-red-500' : 'text-[var(--brand)]'}`}>
            {padrao.ativo ? 'desativar' : 'reativar'}
          </button>
        </div>
      </div>

      {editando && (
        <div className="mt-2 pt-2 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <p className="text-[9px] font-bold text-[var(--muted)] uppercase mb-0.5">Peso</p>
            <input type="number" min={-30} max={30} value={peso} onChange={e => setPeso(Number(e.target.value))} className="w-full text-xs px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--off)] outline-none" />
          </div>
          <div className="sm:col-span-2">
            <p className="text-[9px] font-bold text-[var(--muted)] uppercase mb-0.5">Dica pro atendente</p>
            <input value={dica} onChange={e => setDica(e.target.value)} className="w-full text-xs px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--off)] outline-none" />
          </div>
          <div className="sm:col-span-3">
            <p className="text-[9px] font-bold text-[var(--muted)] uppercase mb-0.5">Resposta recomendada</p>
            <textarea value={resposta} onChange={e => setResposta(e.target.value)} rows={2} className="w-full text-xs px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--off)] outline-none resize-none" />
          </div>
          <div className="sm:col-span-3">
            <button onClick={handleSalvarEdicao} disabled={pending} className="text-[11px] font-semibold text-white bg-[var(--dark)] px-3 py-1.5 rounded-lg disabled:opacity-40">
              {pending ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Componente principal
// ============================================================
export default function DicionarioCuradoria({ padroesIniciais }: { padroesIniciais: PadraoDicionario[] }) {
  const [padroes, setPadroes] = useState(padroesIniciais)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [busca, setBusca] = useState('')

  async function recarregar() {
    const { listarDicionario } = await import('@/app/admin/crm/dicionario-actions')
    setPadroes(await listarDicionario())
  }

  const filtrados = useMemo(() => {
    return padroes.filter(p => {
      if (filtroCategoria !== 'todas' && p.categoria !== filtroCategoria) return false
      if (busca.trim()) {
        const b = busca.trim().toLowerCase()
        return p.padrao.includes(b) || (p.subtipo ?? '').includes(b)
      }
      return true
    })
  }, [padroes, filtroCategoria, busca])

  const porCategoria = useMemo(() => {
    const grupos = new Map<string, PadraoDicionario[]>()
    for (const p of filtrados) {
      const lista = grupos.get(p.categoria) ?? []
      lista.push(p)
      grupos.set(p.categoria, lista)
    }
    return grupos
  }, [filtrados])

  return (
    <div>
      <TestadorFrases />
      <NovoPadraoForm onAdded={recarregar} />

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <select
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
          className="text-xs font-semibold px-3 py-2 rounded-lg border border-[var(--border)] bg-white outline-none cursor-pointer"
        >
          <option value="todas">Todas as categorias ({padroes.length})</option>
          {Object.entries(CATEGORIA_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l} ({padroes.filter(p => p.categoria === v).length})</option>
          ))}
        </select>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar padrão ou subtipo..."
          className="flex-1 text-xs px-3 py-2 rounded-lg border border-[var(--border)] bg-white outline-none focus:border-[var(--brand)]"
        />
      </div>

      {[...porCategoria.entries()].map(([categoria, lista]) => (
        <div key={categoria} className="mb-6">
          <p className="text-xs font-bold text-[var(--ink)] mb-2">{CATEGORIA_LABELS[categoria] ?? categoria} <span className="font-normal text-[var(--muted)]">({lista.length})</span></p>
          <div className="flex flex-col gap-1.5">
            {lista.map(p => <PadraoRow key={p.id} padrao={p} onChanged={recarregar} />)}
          </div>
        </div>
      ))}

      {filtrados.length === 0 && (
        <p className="text-sm text-[var(--muted)] text-center py-10">Nenhum padrão encontrado com esse filtro.</p>
      )}
    </div>
  )
}
