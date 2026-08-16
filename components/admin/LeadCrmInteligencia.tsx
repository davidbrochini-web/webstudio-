'use client'

import { useEffect, useState, useTransition, useCallback } from 'react'
import {
  getCrmInteligencia,
  registrarConversaColada,
  marcarFalsoPositivo,
  confirmarPerfilManual,
  atualizarEstagioManual,
  confirmarChecklistItem,
  salvarRespostaChecklistItem,
  confirmarInteresse,
  type AnaliseConversa,
  type HitAnalise,
  type QualificacaoItem,
  type InteresseItem,
  type EscalonamentoInfo,
} from '@/app/admin/crm/inteligencia-actions'

const PERFIL_LABELS: Record<string, string> = {
  decidido: 'Decidido 🔥',
  pesquisador: 'Pesquisador 🔍',
  preco: 'Do Preço 💰',
  desconfiado: 'Desconfiado 🛡️',
  ocupado: 'Ocupado ⏰',
  entusiasmado: 'Entusiasmado 🎢',
}

const TEMPERATURA_LABELS: Record<string, { label: string; classe: string }> = {
  quente: { label: '🔥 Quente', classe: 'bg-red-50 text-red-700 border-red-200' },
  morno: { label: '🌡️ Morno', classe: 'bg-amber-50 text-amber-700 border-amber-200' },
  esfriando: { label: '🧊 Esfriando', classe: 'bg-blue-50 text-blue-600 border-blue-200' },
  frio: { label: '⬛ Frio', classe: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const ESTAGIO_LABELS: Record<string, string> = {
  novo: 'Novo',
  contato_iniciado: 'Contato iniciado',
  qualificando: 'Qualificando',
  qualificado: 'Qualificado',
  proposta_enviada: 'Proposta enviada',
  negociacao: 'Negociação',
  fechado_ganho: 'Fechado (ganho)',
  fechado_perdido: 'Fechado (perdido)',
}

const CHECKLIST_LABELS: Record<string, string> = {
  tem_site: 'Tem site hoje?',
  objetivo_principal: 'Objetivo principal',
  urgencia_prazo: 'Urgência/prazo',
  quem_decide: 'Quem decide',
  interesse_mapeado: 'Interesse mapeado',
  faixa_investimento: 'Faixa de investimento',
  concorrente_citado: 'Concorrente citado',
  sistema_legado: 'Sistema legado',
}

const INTERESSE_LABELS: Record<string, string> = {
  site_institucional: 'Site institucional',
  google_ads: 'Google Ads',
  chatgpt_ads: 'ChatGPT Ads',
  trafego_pago_generico: 'Tráfego pago (genérico)',
  google_meu_negocio: 'Google Meu Negócio',
  manutencao_site: 'Manutenção de site',
  modulos_gestao: 'Módulos de gestão',
  sob_medida: 'Sob medida (Projeto Especial)',
}

const CATEGORIA_LABELS: Record<string, string> = {
  atendente_erro: 'Erro do atendente',
  atendente_acerto: 'Acerto do atendente',
  perfil_lead: 'Perfil do lead',
  objecao: 'Objeção',
  interesse: 'Interesse',
  qualificacao: 'Qualificação',
  escalonamento: 'Escalonamento',
}

function corDoScore(score: number) {
  if (score < 40) return { barra: 'bg-red-500', texto: 'text-red-600' }
  if (score < 70) return { barra: 'bg-amber-500', texto: 'text-amber-600' }
  return { barra: 'bg-[var(--brand)]', texto: 'text-[var(--brand)]' }
}

interface Recomendacao {
  nivel: 'urgente' | 'atencao' | 'positivo' | 'neutro'
  titulo: string
  detalhe?: string
}

// Copiloto: junta termômetro + perfil + checklist + última detecção
// num único "o que fazer agora" — em vez do atendente ter que juntar
// as peças espalhadas pelo painel sozinho.
function calcularRecomendacao(
  conversa: AnaliseConversa | null,
  hits: HitAnalise[],
  escalonamento: EscalonamentoInfo
): Recomendacao | null {
  if (!conversa) return null

  if (escalonamento.ativo) {
    return { nivel: 'urgente', titulo: '🔔 Escalar pro gestor agora', detalhe: escalonamento.motivos.join(' · ') }
  }

  const ultimoHitReal = hits.find(h => !h.falsoPositivo)
  if (ultimoHitReal && ultimoHitReal.direcao === 'recebida' && ultimoHitReal.categoria === 'objecao') {
    return {
      nivel: 'atencao',
      titulo: '⚠️ Objeção ainda sem resposta',
      detalhe: ultimoHitReal.respostaRecomendada ?? 'Responda antes de seguir pra outro assunto.',
    }
  }

  if (conversa.scoreAtendente < 40) {
    return { nivel: 'atencao', titulo: '🌡️ Conduta no vermelho', detalhe: 'Reveja o tom das últimas mensagens (ver detecções abaixo).' }
  }

  if (conversa.checklistPct === 100 && conversa.perfilLead === 'decidido' && conversa.estagio !== 'proposta_enviada') {
    return { nivel: 'positivo', titulo: '🚀 Pronto pra propor', detalhe: 'Checklist completo + perfil decidido — avance pra proposta.' }
  }

  if (conversa.checklistPct < 100) {
    return { nivel: 'neutro', titulo: '❓ Ainda faltam perguntas de qualificação', detalhe: 'Veja o checklist abaixo pra saber qual falta.' }
  }

  return { nivel: 'positivo', titulo: '✅ Conversa indo bem', detalhe: 'Sem pendência clara no momento.' }
}

const RECOMENDACAO_CORES: Record<Recomendacao['nivel'], string> = {
  urgente: 'bg-red-50 border-red-200 text-red-700',
  atencao: 'bg-amber-50 border-amber-200 text-amber-800',
  positivo: 'bg-green-50 border-green-200 text-[var(--brand)]',
  neutro: 'bg-[var(--off)] border-[var(--border)] text-[var(--ink)]',
}

function CopilotoCard({ recomendacao }: { recomendacao: Recomendacao | null }) {
  if (!recomendacao) return null
  return (
    <div className={`rounded-xl border px-3.5 py-3 ${RECOMENDACAO_CORES[recomendacao.nivel]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-0.5">Copiloto — o que fazer agora</p>
      <p className="text-sm font-bold">{recomendacao.titulo}</p>
      {recomendacao.detalhe && <p className="text-xs mt-0.5 opacity-90">{recomendacao.detalhe}</p>}
    </div>
  )
}

export default function LeadCrmInteligencia({ leadId, refreshSignal, onDadosChange }: { leadId: string; refreshSignal?: number; onDadosChange?: (temEscalonamento: boolean) => void }) {
  const [conversa, setConversa] = useState<AnaliseConversa | null>(null)
  const [hits, setHits] = useState<HitAnalise[]>([])
  const [checklist, setChecklist] = useState<QualificacaoItem[]>([])
  const [interesses, setInteresses] = useState<InteresseItem[]>([])
  const [escalonamento, setEscalonamento] = useState<EscalonamentoInfo>({ ativo: false, motivos: [] })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const recarregar = useCallback(() => {
    setCarregando(true)
    setErro(null)
    getCrmInteligencia(leadId)
      .then(dados => {
        setConversa(dados.conversa)
        setHits(dados.hits)
        setChecklist(dados.checklist)
        setInteresses(dados.interesses)
        setEscalonamento(dados.escalonamento)
        onDadosChange?.(dados.escalonamento.ativo)
      })
      .catch(err => setErro(err instanceof Error ? err.message : 'Erro ao carregar.'))
      .finally(() => setCarregando(false))
  }, [leadId, onDadosChange])

  useEffect(() => {
    recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, refreshSignal])

  const score = conversa?.scoreAtendente ?? 50
  const cor = corDoScore(score)
  const recomendacao = calcularRecomendacao(conversa, hits, escalonamento)

  return (
    <div className="flex flex-col gap-4">
      {erro && <p className="text-xs text-red-500">{erro}</p>}
      {carregando && !conversa && <p className="text-xs text-[var(--muted)]">Carregando análise...</p>}

      <CopilotoCard recomendacao={recomendacao} />

      {/* Termômetro + perfil + temperatura + estágio */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Termômetro</p>
          <div className="h-2.5 rounded-full bg-[var(--off)] overflow-hidden">
            <div className={`h-full ${cor.barra} transition-all`} style={{ width: `${score}%` }} />
          </div>
          <p className={`text-xs font-bold mt-1 ${cor.texto}`}>{score}/100</p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Temperatura</p>
          {conversa && (
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${TEMPERATURA_LABELS[conversa.temperatura]?.classe ?? ''}`}>
              {TEMPERATURA_LABELS[conversa.temperatura]?.label ?? conversa.temperatura}
            </span>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Perfil do lead</p>
          <PerfilSelect leadId={leadId} atual={conversa?.perfilLead ?? null} confirmado={conversa?.perfilConfirmado ?? false} onSaved={recarregar} />
        </div>

        <div>
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Estágio do funil</p>
          <EstagioSelect leadId={leadId} atual={conversa?.estagio ?? 'novo'} onSaved={recarregar} />
        </div>
      </div>

      {/* Checklist */}
      <ChecklistSection leadId={leadId} checklist={checklist} checklistPct={conversa?.checklistPct ?? 0} onSaved={recarregar} />

      {/* Interesses */}
      <div>
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1.5">Interesses detectados</p>
        <div className="flex flex-wrap gap-1.5">
          {interesses.length === 0 && <p className="text-xs text-[var(--muted)]">Nenhum ainda.</p>}
          {interesses.map(i => (
            <button
              key={i.servico}
              onClick={() => confirmarInteresse(leadId, i.servico, !i.confirmado).then(recarregar)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                i.confirmado
                  ? 'bg-green-50 text-[var(--brand)] border-green-200'
                  : 'bg-[var(--off)] text-[var(--muted)] border-dashed border-[var(--border)]'
              }`}
              title={i.confirmado ? 'Confirmado — clique pra desmarcar' : 'Sugerido — clique pra confirmar'}
            >
              {i.confirmado ? '✓ ' : '? '}{INTERESSE_LABELS[i.servico] ?? i.servico}
            </button>
          ))}
        </div>
      </div>

      {/* Hits recentes / objeções */}
      <div>
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1.5">Detecções recentes</p>
        <div className="flex flex-col gap-2">
          {hits.length === 0 && <p className="text-xs text-[var(--muted)]">Sem detecções ainda — a análise roda sozinha conforme a conversa avança.</p>}
          {hits.map(hit => <HitRow key={hit.id} hit={hit} onSaved={recarregar} />)}
        </div>
      </div>

      {/* Registrar conversa colada (fallback pra quem cola histórico de fora do simulador) */}
      <RegistrarConversaForm leadId={leadId} onAnalisado={recarregar} />
    </div>
  )
}


function ChecklistSection({
  leadId,
  checklist,
  checklistPct,
  onSaved,
}: {
  leadId: string
  checklist: QualificacaoItem[]
  checklistPct: number
  onSaved: () => void
}) {
  const [aberto, setAberto] = useState(false)

  const respondidos = checklist.filter(i => i.status !== 'pendente').length
  const total = checklist.length

  return (
    <div>
      <button onClick={() => setAberto(a => !a)} className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`text-[var(--muted)] text-[9px] flex-shrink-0 transition-transform ${aberto ? 'rotate-90' : ''}`}>▶</span>
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide">Checklist de qualificação</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-bold text-[var(--ink)] bg-[var(--off)] px-1.5 py-0.5 rounded-full">
            {respondidos}/{total}
          </span>
          <span className="text-[10px] font-bold text-[var(--muted)]">{checklistPct}%</span>
        </div>
      </button>

      {aberto && (
        <div className="flex flex-col gap-1.5 mt-2">
          {checklist.map(item => (
            <ChecklistRow key={item.item} leadId={leadId} item={item} onSaved={onSaved} />
          ))}
        </div>
      )}
    </div>
  )
}

function PerfilSelect({ leadId, atual, confirmado, onSaved }: { leadId: string; atual: string | null; confirmado: boolean; onSaved: () => void }) {
  const [pending, startTransition] = useTransition()

  function handleChange(valor: string) {
    startTransition(async () => {
      await confirmarPerfilManual(leadId, valor || null)
      onSaved()
    })
  }

  return (
    <select
      value={atual ?? ''}
      disabled={pending}
      onChange={e => handleChange(e.target.value)}
      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] outline-none cursor-pointer disabled:opacity-60 w-full"
    >
      <option value="">— nenhum detectado —</option>
      {Object.entries(PERFIL_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}{!confirmado && value === atual ? ' (auto)' : ''}</option>
      ))}
    </select>
  )
}

function EstagioSelect({ leadId, atual, onSaved }: { leadId: string; atual: string; onSaved: () => void }) {
  const [pending, startTransition] = useTransition()

  function handleChange(valor: string) {
    startTransition(async () => {
      await atualizarEstagioManual(leadId, valor)
      onSaved()
    })
  }

  return (
    <select
      value={atual}
      disabled={pending}
      onChange={e => handleChange(e.target.value)}
      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] outline-none cursor-pointer disabled:opacity-60 w-full"
    >
      {Object.entries(ESTAGIO_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}

function ChecklistRow({ leadId, item, onSaved }: { leadId: string; item: QualificacaoItem; onSaved: () => void }) {
  const [mostrarSugestao, setMostrarSugestao] = useState(false)
  const [pending, startTransition] = useTransition()
  const [copiado, setCopiado] = useState(false)

  const [resposta, setResposta] = useState(item.resposta ?? '')
  const [respostaSalva, setRespostaSalva] = useState(true)
  const [salvandoResposta, setSalvandoResposta] = useState(false)

  // Sincroniza se item.resposta mudar por fora (ex: recarregou a
  // análise) — mesma lógica já aplicada em outros campos desta
  // sessão, evita mostrar texto desatualizado.
  useEffect(() => {
    setResposta(item.resposta ?? '')
    setRespostaSalva(true)
  }, [item.resposta])

  const cores: Record<string, string> = {
    pendente: 'bg-[var(--off)] text-[var(--muted)] border-[var(--border)]',
    detectado: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmado: 'bg-green-50 text-[var(--brand)] border-green-200',
    nao_se_aplica: 'bg-gray-100 text-gray-400 border-gray-200 line-through',
  }

  function handleStatus(status: 'confirmado' | 'nao_se_aplica' | 'pendente') {
    startTransition(async () => {
      await confirmarChecklistItem(leadId, item.item, status)
      onSaved()
    })
  }

  function handleSalvarResposta() {
    setSalvandoResposta(true)
    salvarRespostaChecklistItem(leadId, item.item, resposta)
      .then(() => setRespostaSalva(true))
      .finally(() => setSalvandoResposta(false))
  }

  function copiarSugestao() {
    navigator.clipboard.writeText(item.textoSugerido).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    })
  }

  return (
    <div className="border border-[var(--border)] rounded-xl px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {item.essencial && <span className="text-red-400 text-[10px] flex-shrink-0" title="Item essencial">●</span>}
          <p className="text-xs font-semibold text-[var(--ink)] truncate">{CHECKLIST_LABELS[item.item] ?? item.item}</p>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${cores[item.status]}`}>
          {item.status === 'pendente' ? 'pendente' : item.status === 'detectado' ? 'detectado' : item.status === 'confirmado' ? 'confirmado' : 'n/a'}
        </span>
      </div>

      {/* Texto livre com o que o cliente respondeu — cobre também
          resposta que veio por áudio (a atendente ouve e digita aqui,
          sem transcrição automática por IA). */}
      <input
        value={resposta}
        onChange={e => { setResposta(e.target.value); setRespostaSalva(false) }}
        onBlur={() => { if (!respostaSalva && !salvandoResposta) handleSalvarResposta() }}
        placeholder="O que o cliente respondeu (inclusive por áudio)..."
        className="w-full mt-1.5 px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--off)] text-[11px] outline-none focus:border-[var(--brand)]"
      />

      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        {!respostaSalva && (
          <button onClick={handleSalvarResposta} disabled={salvandoResposta} className="text-[10px] font-semibold text-[var(--brand)] disabled:opacity-40">
            {salvandoResposta ? 'Salvando...' : 'Salvar resposta'}
          </button>
        )}
        {item.status !== 'confirmado' && (
          <button disabled={pending} onClick={() => handleStatus('confirmado')} className="text-[10px] font-semibold text-[var(--brand)] disabled:opacity-40">
            confirmar
          </button>
        )}
        {item.status !== 'nao_se_aplica' && (
          <button disabled={pending} onClick={() => handleStatus('nao_se_aplica')} className="text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-40">
            não se aplica
          </button>
        )}
        {item.status !== 'pendente' && (
          <button disabled={pending} onClick={() => handleStatus('pendente')} className="text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-40">
            reabrir
          </button>
        )}
        {item.status === 'pendente' && item.textoSugerido && (
          <button onClick={() => setMostrarSugestao(s => !s)} className="text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--brand)]">
            💡 sugerir mensagem
          </button>
        )}
      </div>

      {mostrarSugestao && item.textoSugerido && (
        <div className="mt-1.5 bg-[var(--off)] rounded-lg px-2.5 py-2 flex items-start justify-between gap-2">
          <p className="text-[11px] text-[var(--ink)]">{item.textoSugerido}</p>
          <button onClick={copiarSugestao} className="text-[10px] font-semibold text-[var(--brand)] flex-shrink-0">
            {copiado ? '✓' : 'copiar'}
          </button>
        </div>
      )}
    </div>
  )
}

function HitRow({ hit, onSaved }: { hit: HitAnalise; onSaved: () => void }) {
  const [pending, startTransition] = useTransition()
  const [copiado, setCopiado] = useState(false)

  if (hit.falsoPositivo) return null

  function handleFalsoPositivo() {
    startTransition(async () => {
      await marcarFalsoPositivo(hit.id)
      onSaved()
    })
  }

  function copiarResposta() {
    if (!hit.respostaRecomendada) return
    navigator.clipboard.writeText(hit.respostaRecomendada).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    })
  }

  const corPeso = hit.pesoAplicado < 0 ? 'text-red-500' : hit.pesoAplicado > 0 ? 'text-[var(--brand)]' : 'text-[var(--muted)]'

  return (
    <div className="bg-[var(--off)] rounded-xl px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wide">{CATEGORIA_LABELS[hit.categoria] ?? hit.categoria}</span>
            {hit.subtipo && <span className="text-[9px] text-[var(--muted)]">· {hit.subtipo}</span>}
            <span className="text-[9px] text-[var(--muted)]">· {hit.direcao === 'enviada' ? 'atendente' : 'cliente'}</span>
            {hit.pesoAplicado !== 0 && <span className={`text-[9px] font-bold ${corPeso}`}>{hit.pesoAplicado > 0 ? '+' : ''}{hit.pesoAplicado}</span>}
          </div>
          {hit.textoTrecho && <p className="text-xs text-[var(--ink)] mt-0.5 italic">&quot;{hit.textoTrecho}&quot;</p>}
        </div>
        <button disabled={pending} onClick={handleFalsoPositivo} className="text-[9px] font-semibold text-[var(--muted)] hover:text-red-500 flex-shrink-0 disabled:opacity-40">
          falso positivo
        </button>
      </div>
      {hit.dicaAtendente && <p className="text-[10px] text-amber-600 mt-1">{hit.dicaAtendente}</p>}
      {hit.respostaRecomendada && (
        <div className="mt-1.5 flex items-start justify-between gap-2 bg-[var(--card-bg)] rounded-lg px-2.5 py-1.5">
          <p className="text-[11px] text-[var(--ink)]">{hit.respostaRecomendada}</p>
          <button onClick={copiarResposta} className="text-[10px] font-semibold text-[var(--brand)] flex-shrink-0">
            {copiado ? '✓' : 'copiar'}
          </button>
        </div>
      )}
    </div>
  )
}

function RegistrarConversaForm({ leadId, onAnalisado }: { leadId: string; onAnalisado: () => void }) {
  const [texto, setTexto] = useState('')
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<string | null>(null)

  function handleAnalisar() {
    setErro(null)
    setResultado(null)
    startTransition(async () => {
      try {
        const r = await registrarConversaColada(leadId, texto)
        if (r) setResultado(`${r.hits_novos} detecções novas · score ${r.score_atendente} · checklist ${r.checklist_pct}%`)
        setTexto('')
        onAnalisado()
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao analisar.')
      }
    })
  }

  return (
    <div className="bg-[var(--off)] rounded-xl p-3">
      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1.5">
        Registrar conversa colada
      </p>
      <p className="text-[10px] text-[var(--muted)] mb-2">
        Uma mensagem por linha, prefixada com <code className="bg-[var(--card-bg)] px-1 rounded">[A]</code> (atendente) ou <code className="bg-[var(--card-bg)] px-1 rounded">[C]</code> (cliente).
      </p>
      <textarea
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder={'[C] oi, vi o instagram de voces\n[A] Oi! Tudo bem? Me conta, hoje voces tem site...'}
        rows={4}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-xs outline-none resize-none mb-2 focus:border-[var(--brand)] font-mono"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleAnalisar}
          disabled={pending || !texto.trim()}
          className="text-xs font-semibold text-white bg-[var(--dark)] px-3 py-1.5 rounded-lg disabled:opacity-40"
        >
          {pending ? 'Analisando...' : 'Analisar conversa'}
        </button>
        {erro && <p className="text-[10px] text-red-500">{erro}</p>}
        {resultado && <p className="text-[10px] text-[var(--brand)] font-semibold">{resultado}</p>}
      </div>
    </div>
  )
}
