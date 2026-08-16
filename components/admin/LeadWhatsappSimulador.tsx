'use client'

import { useState, useTransition, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { enviarMensagemSimulada, getMensagensSimuladas, sugerirResposta, resetarSimulacao, registrarAuditoriaSimulacao, type MensagemSimulada, type DetalheFeedback } from '@/app/admin/crm/inteligencia-actions'
import { proximaRespostaAuto, PERFIL_SIMULADO_LABELS, type PerfilSimulado } from '@/lib/crm-simulador-roteiros'

export interface LeadWhatsappSimuladorHandle {
  enviarTextoExterno: (texto: string) => Promise<void>
}

const LeadWhatsappSimulador = forwardRef<LeadWhatsappSimuladorHandle, {
  leadId: string
  nome: string
  telefone: string | null
  onEnviado: () => void
}>(function LeadWhatsappSimulador({
  leadId,
  nome,
  telefone,
  onEnviado,
}, ref) {
  const [mensagens, setMensagens] = useState<MensagemSimulada[]>([])
  const [carregando, setCarregando] = useState(true)
  const [direcao, setDirecao] = useState<'enviada' | 'recebida'>('enviada')
  const [texto, setTexto] = useState('')
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)

  const [autoAtivo, setAutoAtivo] = useState(true)
  const [perfilAuto, setPerfilAuto] = useState<PerfilSimulado>('decidido')
  const [indiceRoteiro, setIndiceRoteiro] = useState(0)
  const [roteiroEncerrado, setRoteiroEncerrado] = useState(false)
  const [respondendo, setRespondendo] = useState(false)
  const [sugerindo, setSugerindo] = useState(false)
  const [dica, setDica] = useState<string | null>(null)
  const [confirmandoReset, setConfirmandoReset] = useState(false)
  const [resetando, setResetando] = useState(false)
  const [feedbackImediato, setFeedbackImediato] = useState<DetalheFeedback[]>([])
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [auditoriaAberta, setAuditoriaAberta] = useState(false)
  const [problemaAuditoria, setProblemaAuditoria] = useState('')
  const [solucaoAuditoria, setSolucaoAuditoria] = useState('')
  const [salvandoAuditoria, setSalvandoAuditoria] = useState(false)
  const [erroAuditoria, setErroAuditoria] = useState<string | null>(null)

  function mostrarFeedback(detalhes: DetalheFeedback[]) {
    if (detalhes.length === 0) return
    setFeedbackImediato(detalhes)
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = setTimeout(() => setFeedbackImediato([]), 8000)
  }

  const carregar = useCallback(() => {
    getMensagensSimuladas(leadId)
      .then(setMensagens)
      .catch(err => setErro(err instanceof Error ? err.message : 'Erro ao carregar mensagens.'))
      .finally(() => setCarregando(false))
  }, [leadId])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: 'nearest' })
  }, [mensagens.length])

  function handleTrocarPerfilAuto(novoPerfil: PerfilSimulado) {
    setPerfilAuto(novoPerfil)
    setIndiceRoteiro(0)
    setRoteiroEncerrado(false)
  }

  async function dispararRespostaAuto(ultimaMsgAtendente: string) {
    const proxima = proximaRespostaAuto(perfilAuto, indiceRoteiro, ultimaMsgAtendente)
    if (!proxima) {
      setRoteiroEncerrado(true)
      return
    }
    setRespondendo(true)
    await new Promise(r => setTimeout(r, 900 + Math.random() * 700)) // pausa natural, "digitando..."
    try {
      const resultado = await enviarMensagemSimulada(leadId, 'recebida', proxima.texto)
      setIndiceRoteiro(proxima.proximoIndice)
      carregar()
      onEnviado()
      if (resultado) mostrarFeedback(resultado.detalhes)
    } catch {
      // se falhar, só para o auto silenciosamente — o atendente pode continuar manual
    } finally {
      setRespondendo(false)
    }
  }

  function handleEnviar() {
    if (!texto.trim()) return
    setErro(null)
    const textoEnviado = texto
    const direcaoEnviada = direcao
    startTransition(async () => {
      try {
        const resultado = await enviarMensagemSimulada(leadId, direcaoEnviada, textoEnviado)
        setTexto('')
        carregar()
        onEnviado()
        if (resultado) mostrarFeedback(resultado.detalhes)
        if (autoAtivo && direcaoEnviada === 'enviada' && !roteiroEncerrado) {
          dispararRespostaAuto(textoEnviado)
        }
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao enviar.')
      }
    })
  }

  // Exposto pra fora (aba Proposta) mandar o "Texto a enviar" direto pra
  // essa mesma conversa — mesmo caminho de um envio manual normal: entra
  // como mensagem do atendente, roda a análise, e dispara o cliente
  // automático se estiver ativo. Nunca abre nada fora do simulador.
  useImperativeHandle(ref, () => ({
    async enviarTextoExterno(textoExterno: string) {
      if (!textoExterno.trim()) return
      setErro(null)
      const resultado = await enviarMensagemSimulada(leadId, 'enviada', textoExterno)
      carregar()
      onEnviado()
      if (resultado) mostrarFeedback(resultado.detalhes)
      if (autoAtivo && !roteiroEncerrado) {
        await dispararRespostaAuto(textoExterno)
      }
    },
  }), [leadId, autoAtivo, roteiroEncerrado, carregar, onEnviado])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEnviar()
    }
  }

  function handleSugerir() {
    setSugerindo(true)
    setErro(null)
    sugerirResposta(leadId)
      .then(sugestao => setDica(sugestao))
      .catch(err => setErro(err instanceof Error ? err.message : 'Erro ao sugerir resposta.'))
      .finally(() => setSugerindo(false))
  }

  function handleUsarDica() {
    if (!dica) return
    setTexto(dica)
    setDirecao('enviada')
    setDica(null)
  }

  function handleResetar() {
    if (!confirmandoReset) {
      setConfirmandoReset(true)
      return
    }
    setResetando(true)
    setErro(null)
    resetarSimulacao(leadId)
      .then(() => {
        setIndiceRoteiro(0)
        setRoteiroEncerrado(false)
        carregar()
        onEnviado()
      })
      .catch(err => setErro(err instanceof Error ? err.message : 'Erro ao resetar.'))
      .finally(() => {
        setResetando(false)
        setConfirmandoReset(false)
      })
  }

  async function handleSalvarAuditoria() {
    setErroAuditoria(null)
    if (!problemaAuditoria.trim()) {
      setErroAuditoria('Descreve o problema antes de salvar.')
      return
    }
    setSalvandoAuditoria(true)
    try {
      const res = await registrarAuditoriaSimulacao(leadId, perfilAuto, problemaAuditoria, solucaoAuditoria || null)
      if (res.error) {
        setErroAuditoria(res.error)
        return
      }
      setProblemaAuditoria('')
      setSolucaoAuditoria('')
      setAuditoriaAberta(false)
    } finally {
      setSalvandoAuditoria(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#e5ddd5]">
      {/* Cabeçalho estilo WhatsApp Web */}
      <div className="flex items-center gap-3 bg-[#f0f2f5] border-b border-[var(--border)] px-4 py-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-[var(--dark)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--ink)] truncate">{nome}</p>
          <p className="text-[11px] text-[var(--muted)]">{telefone ?? 'sem telefone'} · simulado (sem ZAP-API ainda)</p>
        </div>

        {/* Cliente automático */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--muted)] cursor-pointer">
            <input
              type="checkbox"
              checked={autoAtivo}
              onChange={e => { setAutoAtivo(e.target.checked); setRoteiroEncerrado(false) }}
              className="accent-[var(--brand)]"
            />
            🤖 Cliente automático
          </label>
          {autoAtivo && (
            <select
              value={perfilAuto}
              onChange={e => handleTrocarPerfilAuto(e.target.value as PerfilSimulado)}
              className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] outline-none cursor-pointer"
            >
              {Object.entries(PERFIL_SIMULADO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
          <button
            onClick={handleResetar}
            onBlur={() => setConfirmandoReset(false)}
            disabled={resetando || mensagens.length === 0}
            className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors disabled:opacity-30 ${
              confirmandoReset
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-[var(--card-bg)] text-[var(--muted)] border-[var(--border)] hover:border-red-300 hover:text-red-500'
            }`}
            title="Apaga as mensagens simuladas e reseta o termômetro/perfil/checklist desse lead"
          >
            {resetando ? '...' : confirmandoReset ? 'Confirmar reset?' : '🔄 Resetar'}
          </button>
          <button
            onClick={() => setAuditoriaAberta(true)}
            disabled={mensagens.length === 0}
            className="text-[11px] font-bold px-2 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-30"
            title="Reporta um problema encontrado nessa simulação (roteiro travou, respondeu errado etc.) pra virar pendência de melhoria"
          >
            🔍 Auditoria
          </button>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-1.5">
        {carregando && <p className="text-center text-xs text-gray-500 py-6">Carregando conversa...</p>}
        {!carregando && mensagens.length === 0 && (
          <p className="text-center text-xs text-gray-500 py-10">
            {autoAtivo
              ? `Modo automático ligado (perfil ${PERFIL_SIMULADO_LABELS[perfilAuto]}). Mande a primeira mensagem como atendente e o cliente simulado responde sozinho.`
              : 'Nenhuma mensagem ainda. Digite abaixo simulando o cliente ou o atendente pra ver a análise rodando ao vivo.'}
          </p>
        )}
        {mensagens.map(m => (
          <div key={m.id} className={`flex ${m.direcao === 'enviada' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                // Bolhas do WhatsApp simulado imitam a tela de um celular de
                // verdade — fundo sempre claro de propósito, então o texto
                // também fica sempre escuro fixo aqui (nunca var(--ink), que
                // vira claro no tema escuro do admin e ficaria ilegível em
                // cima desse fundo claro que não muda com o tema).
                m.direcao === 'enviada' ? 'bg-[#dcf8c6] text-[#0b1a12]' : 'bg-white text-[#111b21]'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{m.texto}</p>
              <p className="text-[10px] text-gray-400 text-right mt-0.5">
                {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {respondendo && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-3 py-2 text-xs text-gray-400 shadow-sm italic">cliente digitando...</div>
          </div>
        )}
        <div ref={fimRef} />
      </div>

      {roteiroEncerrado && (
        <p className="text-[10px] text-amber-700 bg-amber-50 border-t border-amber-200 px-4 py-1.5 text-center">
          Roteiro automático desse perfil chegou ao fim — continue a conversa manualmente ou troque o perfil.
        </p>
      )}

      {/* Feedback imediato — aparece sozinho assim que a mensagem gera uma detecção relevante */}
      {feedbackImediato.length > 0 && (
        <div className="mx-3 mb-2 flex flex-col gap-1.5">
          {feedbackImediato.map((f, i) => {
            const ehErro = f.categoria === 'atendente_erro'
            const cor = ehErro
              ? 'bg-red-50 border-red-200 text-red-700'
              : f.categoria === 'atendente_acerto'
                ? 'bg-green-50 border-green-200 text-[var(--brand)]'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            return (
              <div key={i} className={`rounded-xl border px-3 py-2 flex items-start justify-between gap-2 ${cor}`}>
                <p className="text-xs">{f.texto}</p>
                <button onClick={() => setFeedbackImediato(fs => fs.filter((_, idx) => idx !== i))} className="text-xs opacity-60 hover:opacity-100 flex-shrink-0">✕</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Card de dica — "me ajuda a responder" é orientação, não mensagem pronta */}
      {dica && (
        <div className="mx-3 mb-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
          <span className="text-base flex-shrink-0">💡</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide mb-0.5">Dica pra sua resposta</p>
            <p className="text-xs text-[var(--ink)]">{dica}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <button onClick={handleUsarDica} className="text-[10px] font-bold text-[var(--brand)]">
                Usar no campo
              </button>
              <button onClick={() => setDica(null)} className="text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--ink)]">
                dispensar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de envio */}
      <div className="bg-[#f0f2f5] border-t border-[var(--border)] p-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide">Enviar como:</span>
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setDirecao('recebida')}
              className={`text-[11px] font-bold px-2.5 py-1 transition-colors ${
                direcao === 'recebida' ? 'bg-[var(--dark)] text-white' : 'bg-white text-[#4b5563]'
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => setDirecao('enviada')}
              className={`text-[11px] font-bold px-2.5 py-1 transition-colors ${
                direcao === 'enviada' ? 'bg-[var(--dark)] text-white' : 'bg-white text-[#4b5563]'
              }`}
            >
              Atendente
            </button>
          </div>
          <button
            onClick={handleSugerir}
            disabled={sugerindo || mensagens.length === 0}
            className="ml-auto flex items-center gap-1 text-[11px] font-bold text-[var(--brand)] bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg disabled:opacity-40 hover:bg-green-100 transition-colors"
            title="Sugere uma resposta com base na última objeção detectada ou na próxima pergunta pendente do checklist"
          >
            💡 {sugerindo ? 'Pensando...' : 'Me ajuda a responder'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={pending || respondendo}
            autoFocus
            placeholder={direcao === 'recebida' ? 'Digite como se fosse o cliente...' : 'Digite como se fosse o atendente...'}
            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-full border border-[var(--border)] bg-white text-[#111b21] placeholder:text-[#8696a0] text-sm outline-none focus:border-[var(--brand)] disabled:opacity-60"
          />
          <button
            onClick={handleEnviar}
            disabled={pending || respondendo || !texto.trim()}
            className="w-10 h-10 rounded-full bg-[var(--brand)] text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0"
            title="Enviar"
          >
            ➤
          </button>
        </div>
        {erro && <p className="text-[10px] text-red-500 mt-1.5">{erro}</p>}
      </div>

      {auditoriaAberta && (
        <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-3 sm:p-6" onClick={() => setAuditoriaAberta(false)}>
          <div
            className="bg-[var(--card-bg)] rounded-2xl w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--border)]">
              <p className="font-display font-bold text-[var(--ink)] text-base">🔍 Auditoria de simulação</p>
              <button
                onClick={() => setAuditoriaAberta(false)}
                className="w-8 h-8 rounded-full hover:bg-[var(--off)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center text-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <p className="text-xs text-[var(--muted)] -mt-1">
                A conversa inteira (perfil {PERFIL_SIMULADO_LABELS[perfilAuto]}) fica salva junto — não
                precisa descrever o que aconteceu, só o problema e, se já tiver, a solução.
              </p>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[var(--muted)]">Qual foi o problema? *</span>
                <textarea
                  value={problemaAuditoria}
                  onChange={e => setProblemaAuditoria(e.target.value)}
                  rows={3}
                  placeholder="ex: o cliente ficou repetindo a mesma frase e não avançou o roteiro"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none resize-none focus:border-[var(--brand)]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[var(--muted)]">Possível solução (opcional)</span>
                <textarea
                  value={solucaoAuditoria}
                  onChange={e => setSolucaoAuditoria(e.target.value)}
                  rows={3}
                  placeholder="ex: talvez precise de mais um gatilho pra essa frase"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none resize-none focus:border-[var(--brand)]"
                />
              </label>
              {erroAuditoria && <p className="text-xs text-red-500">{erroAuditoria}</p>}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleSalvarAuditoria}
                  disabled={salvandoAuditoria}
                  className="flex-1 bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {salvandoAuditoria ? 'Salvando...' : 'Salvar pendência'}
                </button>
                <button
                  onClick={() => setAuditoriaAberta(false)}
                  className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--ink)] font-semibold hover:border-[var(--muted)] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default LeadWhatsappSimulador
