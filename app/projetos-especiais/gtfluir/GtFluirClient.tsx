'use client'

import { useState, useMemo } from 'react'

const WA = '5511994777420'
const waLink = (msg: string) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`

const beneficios = [
  {
    titulo: 'Fortalece sem forçar',
    texto: 'Movimentos controlados que trabalham o corpo todo, respeitando o seu ritmo.',
    icon: (
      <path d="M12 2a3 3 0 013 3v2.5l4.3 4.3a1 1 0 01-1.4 1.4L14 9.3V13l3 6h-2.2l-2.3-4.6L10.2 19H8l3-6V9.3l-3.9 3.9a1 1 0 01-1.4-1.4L10 7.5V5a3 3 0 013-3z" />
    ),
  },
  {
    titulo: 'Alivia dor nas costas',
    texto: 'Exercícios pensados pra reduzir dor crônica e prevenir novas lesões.',
    icon: (
      <path d="M12 3c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm-1.5 8h3a2.5 2.5 0 012.5 2.5v1.7l2.3 4.1a1 1 0 01-1.7 1l-2.1-3.7v3.4a1 1 0 01-2 0v-4h-1v4a1 1 0 01-2 0v-3.4l-2.1 3.7a1 1 0 01-1.7-1l2.3-4.1v-1.7A2.5 2.5 0 0110.5 11z" />
    ),
  },
  {
    titulo: 'Melhora o equilíbrio',
    texto: 'Trabalho de equilíbrio e coordenação que ajuda a prevenir quedas.',
    icon: (
      <path d="M12 2l2.5 5.5L20 8l-4.2 3.8L17 18l-5-3-5 3 1.2-6.2L4 8l5.5-.5z" />
    ),
  },
  {
    titulo: 'Devolve autonomia',
    texto: 'Confiança pra fazer sozinho as tarefas do dia a dia: subir escada, levantar, se abaixar.',
    icon: (
      <path d="M12 4a2 2 0 110 4 2 2 0 010-4zm3.2 5.2L18 12l-1.4 1.4-2-2v3.4l2.7 5.4-1.8.9-2.4-4.8h-1.2l-1 4.9H8.9l1-4.9-1.1-.2-2.3 3.5-1.7-1.1L7 13.6V9.8l-1.6 1.6L4 10l3.8-3.8c.4-.4.9-.6 1.5-.6h1.4c.6 0 1.1.2 1.5.6z" />
    ),
  },
]

const unidades = [
  {
    nome: 'Tucuruvi',
    endereco: 'Rua Paulo de Faria, 300 — a 100m do Metrô Tucuruvi',
    mapa: 'https://maps.app.goo.gl/geH3wcDjsa7QYYb8A',
  },
  {
    nome: 'Parada Inglesa',
    endereco: 'Av. General Ataliba Leonel, 3442 — em frente ao Sacolão da Fartura',
    mapa: 'https://maps.app.goo.gl/k3n5DsGM9sh3aT1U7',
  },
]

const planos = [
  { freq: '1x por semana', desc: 'Ideal pra quem está começando no Pilates agora.' },
  { freq: '2x por semana', desc: 'Resultado mais consistente, melhora perceptível na qualidade de vida.', destaque: true },
  { freq: '3x por semana', desc: 'Acompanhamento mais próximo, pra quem quer evoluir mais rápido.' },
]

const posts = [
  { tipo: 'Equipamento', desc: 'Reformer', video: true },
  { tipo: 'Aula em grupo', desc: 'Turma da manhã', video: false },
  { tipo: 'Dica rápida', desc: 'Postura no dia a dia', video: true },
  { tipo: 'Aluno', desc: 'Depoimento', video: false },
  { tipo: 'Bastidores', desc: 'Equipe GT Fluir', video: false },
  { tipo: 'Promoção', desc: 'Aula teste grátis', video: true },
]

const TILE_BG = ['#1D6FA8', '#C99A3B', '#4A7290', '#1D6FA8', '#C99A3B', '#4A7290']

const CARD = 'bg-white rounded-2xl border border-[#EDE6D3] shadow-[0_1px_2px_rgba(30,42,51,0.04),0_2px_8px_rgba(30,42,51,0.05)]'

function FlowLine({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 24" className={className} preserveAspectRatio="none">
      <path
        d="M0 12 C 100 -6, 140 30, 240 12 S 360 -4, 400 12"
        fill="none"
        stroke="#C99A3B"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-11 h-11 rounded-full bg-[#EAF1F6] flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 24 24" fill="#1D6FA8" className="w-[22px] h-[22px]">
        {children}
      </svg>
    </div>
  )
}

function PostTile({ tipo, desc, video, bg }: { tipo: string; desc: string; video: boolean; bg: string }) {
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden" style={{ backgroundColor: bg }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-[0.22]" preserveAspectRatio="none">
        <path d="M-10 60 C 20 40, 40 80, 60 55 S 100 30, 120 55" fill="none" stroke="#fff" strokeWidth="4" />
      </svg>
      {video && (
        <svg viewBox="0 0 24 24" fill="white" className="absolute top-2 right-2 w-4 h-4 opacity-90">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        <p className="text-white text-[11px] font-semibold leading-tight">{tipo}</p>
        <p className="text-white/75 text-[10px] leading-tight">{desc}</p>
      </div>
    </div>
  )
}

function UnidadeVisual({ nome }: { nome: string }) {
  return (
    <div className="h-32 bg-gradient-to-br from-[#1D6FA8] to-[#164F79] relative overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-[0.15]">
        <path d="M-10 60 C 40 30, 70 90, 120 55 S 190 20, 220 50" fill="none" stroke="#fff" strokeWidth="3" />
      </svg>
      <div className="relative text-center">
        <svg viewBox="0 0 24 24" fill="#C99A3B" className="w-6 h-6 mx-auto mb-1.5">
          <path d="M12 2c-4.4 0-8 3.6-8 8 0 5.4 8 12 8 12s8-6.6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />
        </svg>
        <p className="text-white font-semibold text-sm">{nome}</p>
      </div>
    </div>
  )
}

// ---------- Agendamento: calendário real com disponibilidade ----------

const HORARIOS_DIA = ['07:00', '08:00', '09:30', '11:00', '14:00', '16:00', '18:30']
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function seedDia(iso: string) {
  let h = 0
  for (let i = 0; i < iso.length; i++) h = (h * 31 + iso.charCodeAt(i)) >>> 0
  return h
}

/** Disponibilidade determinística por dia — mesmo dia sempre mostra o
 *  mesmo padrão (sem Math.random puro, pra não ficar mudando a cada
 *  clique). É só pra simular como o calendário real vai se comportar. */
function horariosLivres(iso: string): string[] {
  const seed = seedDia(iso)
  return HORARIOS_DIA.filter((_, i) => (seed >> i) % 3 !== 0)
}

function validarEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}
function validarCPF(v: string) {
  return v.replace(/\D/g, '').length === 11
}
function validarTelefone(v: string) {
  return v.replace(/\D/g, '').length >= 10
}

function Calendario({
  unidade,
  diaSelecionado,
  onSelecionarDia,
}: {
  unidade: string
  diaSelecionado: string | null
  onSelecionarDia: (iso: string) => void
}) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const [mesRef, setMesRef] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))

  const semanas = useMemo(() => {
    const primeiroDiaSemana = mesRef.getDay()
    const ultimoDiaMes = new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 0).getDate()
    const celulas: (Date | null)[] = Array(primeiroDiaSemana).fill(null)
    for (let d = 1; d <= ultimoDiaMes; d++) {
      celulas.push(new Date(mesRef.getFullYear(), mesRef.getMonth(), d))
    }
    while (celulas.length % 7 !== 0) celulas.push(null)
    const linhas: (Date | null)[][] = []
    for (let i = 0; i < celulas.length; i += 7) linhas.push(celulas.slice(i, i + 7))
    return linhas
  }, [mesRef])

  const mesPassado = mesRef.getFullYear() === hoje.getFullYear() && mesRef.getMonth() === hoje.getMonth()

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setMesRef(new Date(mesRef.getFullYear(), mesRef.getMonth() - 1, 1))}
          disabled={mesPassado}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4A5A66] disabled:opacity-25 hover:bg-[#F0EEE6]"
          aria-label="Mês anterior"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <p className="text-sm font-semibold text-[#1E2A33] capitalize">
          {MESES[mesRef.getMonth()]} de {mesRef.getFullYear()} · {unidade}
        </p>
        <button
          type="button"
          onClick={() => setMesRef(new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4A5A66] hover:bg-[#F0EEE6]"
          aria-label="Próximo mês"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-[#9AA5AC] py-1">{d}</div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {semanas.map((linha, li) => (
          <div key={li} className="grid grid-cols-7 gap-1">
            {linha.map((data, di) => {
              if (!data) return <div key={di} />
              const iso = data.toISOString().slice(0, 10)
              const passou = data < hoje
              const domingo = data.getDay() === 0
              const indisponivel = passou || domingo
              const livres = indisponivel ? [] : horariosLivres(iso)
              const selecionado = diaSelecionado === iso
              return (
                <button
                  key={di}
                  type="button"
                  disabled={indisponivel}
                  onClick={() => onSelecionarDia(iso)}
                  className={`aspect-square rounded-lg text-xs font-medium flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    indisponivel
                      ? 'text-[#D8CFB8] cursor-default'
                      : selecionado
                        ? 'bg-[#1D6FA8] text-white'
                        : livres.length === 0
                          ? 'text-[#B8AF98] bg-[#F5F2E9]'
                          : 'text-[#1E2A33] bg-[#F5F2E9] hover:bg-[#EAF1F6]'
                  }`}
                >
                  <span>{data.getDate()}</span>
                  {!indisponivel && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        selecionado ? 'bg-white' : livres.length === 0 ? 'bg-transparent' : 'bg-[#639922]'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-3 text-[10px] text-[#9AA5AC]">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#639922]" />com horário livre</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#F5F2E9]" />lotado</span>
      </div>
    </div>
  )
}

function AgendamentoWidget() {
  const [modo, setModo] = useState<'aluno' | 'teste'>('teste')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [unidade, setUnidade] = useState('Tucuruvi')
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null)
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [confirmado, setConfirmado] = useState(false)

  const livresDoDia = diaSelecionado ? horariosLivres(diaSelecionado) : []

  function selecionarDia(iso: string) {
    setDiaSelecionado(iso)
    setHoraSelecionada(null)
    setErro(null)
  }

  function confirmar() {
    if (modo === 'aluno' && !validarCPF(cpf)) return setErro('Digite um CPF válido (11 números).')
    if (!validarEmail(email)) return setErro('Digite um e-mail válido.')
    if (modo === 'teste' && !validarTelefone(telefone)) return setErro('Digite um WhatsApp válido, com DDD.')
    if (!diaSelecionado || !horaSelecionada) return setErro('Escolha um dia e um horário no calendário.')
    setErro(null)
    setEnviando(true)
    setTimeout(() => {
      setEnviando(false)
      setConfirmado(true)
    }, 900)
  }

  function novoAgendamento() {
    setConfirmado(false)
    setCpf('')
    setEmail('')
    setTelefone('')
    setDiaSelecionado(null)
    setHoraSelecionada(null)
  }

  if (confirmado) {
    const dataFormatada = diaSelecionado
      ? new Date(diaSelecionado + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
      : ''
    return (
      <div className={`${CARD} p-6 text-center max-w-md mx-auto`}>
        <div className="w-12 h-12 rounded-full bg-[#EAF3DE] flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="#3B6D11" className="w-6 h-6">
            <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-[#1E2A33] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          Agendamento confirmado
        </p>
        <p className="text-sm text-[#4A5A66] mb-4 capitalize-first">
          {modo === 'teste' ? 'Aula teste' : 'Aula'} marcada pra {dataFormatada} às {horaSelecionada}, unidade {unidade}.
          A confirmação foi enviada pra <span className="font-medium">{email}</span>
          {modo === 'teste' && ' e a equipe também vai confirmar no seu WhatsApp'}.
        </p>
        <button
          onClick={novoAgendamento}
          className="text-xs font-semibold text-[#1D6FA8] border border-[#1D6FA8] rounded-lg px-4 py-2"
        >
          Fazer outro agendamento
        </button>
      </div>
    )
  }

  return (
    <div className={`${CARD} p-5 max-w-md mx-auto`}>
      <div className="flex bg-[#F5F2E9] rounded-xl p-1 mb-5">
        <button
          onClick={() => { setModo('teste'); setErro(null) }}
          className={`flex-1 text-xs font-semibold py-2.5 rounded-lg transition-colors ${
            modo === 'teste' ? 'bg-white text-[#1D6FA8] shadow-sm' : 'text-[#4A5A66]'
          }`}
        >
          Quero uma aula teste
        </button>
        <button
          onClick={() => { setModo('aluno'); setErro(null) }}
          className={`flex-1 text-xs font-semibold py-2.5 rounded-lg transition-colors ${
            modo === 'aluno' ? 'bg-white text-[#1D6FA8] shadow-sm' : 'text-[#4A5A66]'
          }`}
        >
          Já sou aluno
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        {modo === 'aluno' && (
          <input
            type="text"
            inputMode="numeric"
            placeholder="CPF (só números)"
            value={cpf}
            onChange={e => setCpf(e.target.value)}
            className="w-full border border-[#E4DCC8] rounded-xl px-4 py-3 text-sm text-[#1E2A33] placeholder:text-[#9AA5AC] focus:outline-none focus:border-[#1D6FA8] focus:ring-1 focus:ring-[#1D6FA8]"
          />
        )}
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-[#E4DCC8] rounded-xl px-4 py-3 text-sm text-[#1E2A33] placeholder:text-[#9AA5AC] focus:outline-none focus:border-[#1D6FA8] focus:ring-1 focus:ring-[#1D6FA8]"
        />
        {modo === 'teste' && (
          <input
            type="tel"
            placeholder="WhatsApp com DDD"
            value={telefone}
            onChange={e => setTelefone(e.target.value)}
            className="w-full border border-[#E4DCC8] rounded-xl px-4 py-3 text-sm text-[#1E2A33] placeholder:text-[#9AA5AC] focus:outline-none focus:border-[#1D6FA8] focus:ring-1 focus:ring-[#1D6FA8]"
          />
        )}
      </div>

      <div className="flex gap-2 mb-5">
        {['Tucuruvi', 'Parada Inglesa'].map(u => (
          <button
            key={u}
            onClick={() => { setUnidade(u); setDiaSelecionado(null); setHoraSelecionada(null) }}
            className={`flex-1 text-xs font-semibold py-2.5 rounded-xl border transition-colors ${
              unidade === u ? 'border-[#1D6FA8] bg-[#EAF1F6] text-[#1D6FA8]' : 'border-[#E4DCC8] text-[#4A5A66]'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      <Calendario unidade={unidade} diaSelecionado={diaSelecionado} onSelecionarDia={selecionarDia} />

      {diaSelecionado && (
        <div className="mt-4 pt-4 border-t border-[#EDE6D3]">
          <label className="text-xs font-semibold text-[#4A5A66] mb-2 block">Horários livres</label>
          {livresDoDia.length === 0 ? (
            <p className="text-xs text-[#9AA5AC]">Esse dia está lotado — escolha outro no calendário.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {livresDoDia.map(h => (
                <button
                  key={h}
                  onClick={() => setHoraSelecionada(h)}
                  className={`text-xs font-semibold py-2 rounded-lg border transition-colors ${
                    horaSelecionada === h ? 'border-[#1D6FA8] bg-[#1D6FA8] text-white' : 'border-[#E4DCC8] text-[#4A5A66] hover:border-[#1D6FA8]'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {erro && <p className="text-xs mt-4" style={{ color: '#B3261E' }}>{erro}</p>}

      <button
        onClick={confirmar}
        disabled={enviando}
        className="w-full bg-[#25A85A] text-white font-semibold text-sm py-3.5 rounded-xl mt-5 disabled:opacity-60"
      >
        {enviando ? 'Confirmando…' : 'Confirmar agendamento'}
      </button>
    </div>
  )
}

export default function GtFluirClient() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1E2A33]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Work+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .gtf-display { font-family: 'Fraunces', serif; }
        .gtf-body { font-family: 'Work Sans', sans-serif; }
      `}</style>

      <div className="gtf-body">
        <div className="bg-[#1E2A33] text-white text-center text-xs py-2 px-4">
          Exemplo de site pra avaliação — GT Fluir Pilates. Fotos reais entram na versão final.
        </div>

        <header className="sticky top-0 z-40 bg-[#FBF9F4]/95 backdrop-blur border-b border-[#EDE6D3] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#1D6FA8] flex items-center justify-center text-white font-bold text-sm gtf-display">
              GT
            </div>
            <span className="gtf-display font-semibold text-lg text-[#1D6FA8]">fluir</span>
          </div>
          <a
            href={waLink('Oi! Vi o site e quero saber mais sobre o Pilates da GT Fluir.')}
            className="flex items-center gap-1.5 bg-[#25A85A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            Falar pelo WhatsApp
          </a>
        </header>

        <section className="relative bg-gradient-to-b from-[#EAF1F6] to-[#FBF9F4] px-5 pt-10 pb-8 text-center overflow-hidden">
          <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-[0.25]" preserveAspectRatio="none">
            <path d="M-20 150 C 80 110, 140 190, 220 140 S 360 100, 420 140" fill="none" stroke="#1D6FA8" strokeWidth="2.5" />
          </svg>
          <div className="relative">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-3">
              Pilates + fisioterapia · Zona Norte, SP
            </p>
            <h1 className="gtf-display font-semibold text-[clamp(30px,7.5vw,42px)] leading-[1.15] text-[#1E2A33] mb-4">
              Pense no seu corpo<br />como um todo.
            </h1>
            <p className="text-base leading-relaxed text-[#4A5A66] max-w-md mx-auto mb-7">
              Pilates com acompanhamento de fisioterapeutas, pensado pra fortalecer, aliviar
              dor e devolver autonomia — em qualquer fase da vida.
            </p>
            <a
              href={waLink('Oi! Vi o site e quero saber mais sobre o Pilates da GT Fluir.')}
              className="inline-block bg-[#25A85A] text-white font-semibold text-base px-8 py-4 rounded-xl mb-6 shadow-[0_4px_14px_rgba(37,168,90,0.25)]"
            >
              Falar pelo WhatsApp
            </a>

            <div className="flex items-center justify-center gap-6 sm:gap-10 pt-2">
              <div>
                <p className="gtf-display font-semibold text-2xl text-[#1D6FA8]">2</p>
                <p className="text-[11px] text-[#4A5A66] leading-tight">unidades<br />na Zona Norte</p>
              </div>
              <div className="w-px h-9 bg-[#D8CFB8]" />
              <div>
                <p className="gtf-display font-semibold text-2xl text-[#1D6FA8]">1.3k+</p>
                <p className="text-[11px] text-[#4A5A66] leading-tight">seguidores<br />no Instagram</p>
              </div>
              <div className="w-px h-9 bg-[#D8CFB8]" />
              <div>
                <p className="gtf-display font-semibold text-2xl text-[#1D6FA8]">100%</p>
                <p className="text-[11px] text-[#4A5A66] leading-tight">fisioterapeutas<br />especialistas</p>
              </div>
            </div>
          </div>
        </section>

        <FlowLine className="w-full h-5" />

        <section className="bg-white px-5 py-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-1">
            <div>
              <p className="gtf-display font-semibold text-lg text-[#1E2A33]">@gtfluir</p>
              <p className="text-xs text-[#4A5A66]">1,3 mil seguidores · atualizado toda semana</p>
            </div>
            <a
              href="https://www.instagram.com/gtfluir/"
              className="text-xs font-semibold text-white bg-gradient-to-tr from-[#C99A3B] to-[#1D6FA8] rounded-xl px-4 py-2.5 flex-shrink-0"
            >
              Seguir
            </a>
          </div>
          <p className="text-[11px] text-[#9AA5AC] max-w-2xl mx-auto mb-4">
            Simulação do feed — as fotos e vídeos reais entram direto do Instagram deles.
          </p>
          <div className="grid grid-cols-3 gap-1.5 max-w-2xl mx-auto">
            {posts.map((p, i) => (
              <PostTile key={p.tipo} tipo={p.tipo} desc={p.desc} video={p.video} bg={TILE_BG[i]} />
            ))}
          </div>
        </section>

        <section className="px-5 py-12 bg-[#FBF9F4]">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2 text-center">
            Agendamento online
          </p>
          <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-2 text-center">
            Veja o horário livre e marque na hora
          </h2>
          <p className="text-xs text-[#9AA5AC] text-center mb-6">
            Simulação funcional — não envia e-mail de verdade ainda, mas o fluxo é esse.
          </p>
          <AgendamentoWidget />
        </section>

        <section className="bg-white px-5 py-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2 text-center">
            Por que Pilates
          </p>
          <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-8 text-center">
            O que o Pilates faz por você
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {beneficios.map(b => (
              <div key={b.titulo} className={`flex gap-4 ${CARD} p-5`}>
                <IconBadge>{b.icon}</IconBadge>
                <div>
                  <h3 className="gtf-display font-semibold text-base text-[#1E2A33] mb-1">{b.titulo}</h3>
                  <p className="text-sm text-[#4A5A66] leading-relaxed">{b.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-12 bg-[#1D6FA8]">
          <div className="max-w-xl mx-auto grid sm:grid-cols-[auto,1fr] gap-6 items-center">
            <svg viewBox="0 0 24 24" fill="#C99A3B" className="w-14 h-14 mx-auto sm:mx-0 flex-shrink-0">
              <path d="M12 2a4 4 0 014 4v2.5a5.5 5.5 0 01-3 4.9V16h2a2 2 0 012 2v1a3 3 0 01-3 3H10a3 3 0 01-3-3v-1a2 2 0 012-2h2v-2.6a5.5 5.5 0 01-3-4.9V6a4 4 0 014-4z" />
            </svg>
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2">
                O diferencial GT Fluir
              </p>
              <h2 className="gtf-display font-semibold text-2xl text-white mb-3">
                Fisioterapeutas, não só instrutores
              </h2>
              <p className="text-base leading-relaxed text-white/85">
                Nossa equipe é formada por fisioterapeutas especialistas — não é só uma aula de
                exercício, é acompanhamento de verdade pro seu corpo, principalmente se você já
                tem alguma dor, lesão ou está numa fase de reabilitação.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-12">
          <div className="max-w-md mx-auto">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2">
              Sobre nós
            </p>
            <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-4">
              Quem cuida de você
            </h2>
            <p className="text-base leading-relaxed text-[#4A5A66] mb-3">
              Somos um estúdio de Pilates com profissionais fisioterapeutas e especialistas,
              focados no seu bem-estar completo.
            </p>
            <p className="text-base leading-relaxed text-[#4A5A66]">
              Nossa missão é promover qualidade de vida através do método Pilates — reabilitação
              física, fortalecimento muscular, alívio do estresse e melhora da postura, num
              ambiente acolhedor e seguro.
            </p>
          </div>
        </section>

        <section className="px-5 py-12 bg-[#FBF9F4]">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2 text-center">
            Onde estamos
          </p>
          <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-8 text-center">
            Escolha a unidade mais perto
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {unidades.map(u => (
              <div key={u.nome} className={`${CARD} overflow-hidden`}>
                <UnidadeVisual nome={u.nome} />
                <div className="p-5">
                  <h3 className="gtf-display font-semibold text-base text-[#1E2A33] mb-1">Unidade {u.nome}</h3>
                  <p className="text-sm text-[#4A5A66] mb-3">{u.endereco}</p>
                  <div className="flex gap-2">
                    <a
                      href={u.mapa}
                      className="text-xs font-semibold text-[#1D6FA8] border border-[#1D6FA8] rounded-lg px-4 py-2"
                    >
                      Ver no mapa
                    </a>
                    <a
                      href={waLink(`Oi! Tenho interesse na unidade ${u.nome}.`)}
                      className="text-xs font-semibold text-white bg-[#25A85A] rounded-lg px-4 py-2"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white px-5 py-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2 text-center">
            Planos mensais
          </p>
          <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-3 text-center">
            Sem multa, sem taxa de cancelamento
          </h2>
          <p className="text-sm text-[#4A5A66] text-center max-w-sm mx-auto mb-8">
            Escolha a frequência que faz sentido pra sua rotina — sem usar limite do cartão.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {planos.map(p => (
              <div
                key={p.freq}
                className={`flex flex-col rounded-2xl p-5 ${
                  p.destaque ? 'border-2 border-[#1D6FA8] bg-[#EAF1F6]' : `${CARD}`
                }`}
              >
                {p.destaque && (
                  <span className="self-start text-[10px] font-semibold text-[#1D6FA8] bg-white px-2.5 py-1 rounded-full mb-2">
                    Mais escolhido
                  </span>
                )}
                <p className="gtf-display font-semibold text-lg text-[#1E2A33] mb-1.5">{p.freq}</p>
                <p className="text-sm text-[#4A5A66] mb-4 flex-1">{p.desc}</p>
                <a
                  href={waLink(`Oi! Quero saber o valor do plano ${p.freq}.`)}
                  className="text-xs font-semibold text-center text-[#1D6FA8] border border-[#1D6FA8] rounded-lg px-4 py-2.5"
                >
                  Ver valor
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-12 bg-[#FBF9F4]">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2 text-center">
            Depoimentos
          </p>
          <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-6 text-center">
            O que os alunos dizem
          </h2>
          <div className={`${CARD} max-w-md mx-auto p-6 text-center`}>
            <svg viewBox="0 0 24 24" fill="#C99A3B" className="w-7 h-7 mx-auto mb-3 opacity-70">
              <path d="M7 5c-2.2 0-4 1.8-4 4 0 2 1.4 3.6 3.2 3.9-.3 1.5-1.3 2.6-2.7 3v2c2.8-.3 5.5-2.5 5.5-6.4V9c0-2.2-1.8-4-4-4zm10 0c-2.2 0-4 1.8-4 4 0 2 1.4 3.6 3.2 3.9-.3 1.5-1.3 2.6-2.7 3v2c2.8-.3 5.5-2.5 5.5-6.4V9c0-2.2-1.8-4-4-4z" />
            </svg>
            <p className="text-sm text-[#4A5A66] leading-relaxed">
              Espaço reservado pros depoimentos reais dos alunos — assim que vocês autorizarem,
              entram aqui com nome e foto.
            </p>
          </div>
        </section>

        <footer className="px-5 py-10 text-center bg-[#1E2A33]">
          <p className="gtf-display font-semibold text-lg text-white mb-1">GT Fluir Pilates</p>
          <p className="text-sm text-white/70 mb-4">Pilates e fisioterapia · Zona Norte, São Paulo</p>
          <a
            href={waLink('Oi! Vi o site e quero saber mais sobre o Pilates da GT Fluir.')}
            className="inline-block bg-[#25A85A] text-white font-semibold text-sm px-6 py-3 rounded-xl mb-4"
          >
            (11) 99477-7420 · WhatsApp
          </a>
          <p className="text-xs text-white/50 mb-1">Tucuruvi · Parada Inglesa</p>
          <a href="https://www.instagram.com/gtfluir/" className="text-xs text-white/50 underline">
            @gtfluir no Instagram
          </a>
        </footer>

        <a
          href={waLink('Oi! Vi o site e quero saber mais sobre o Pilates da GT Fluir.')}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25A85A] flex items-center justify-center shadow-lg"
          aria-label="Falar no WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
            <path d="M17.6 6.32A7.85 7.85 0 0012.05 4a7.94 7.94 0 00-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 003.85 1h.02a7.94 7.94 0 007.93-7.9 7.85 7.85 0 00-2.4-5.68zm-5.55 12.2h-.02a6.6 6.6 0 01-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.6 6.6 0 01-1.02-3.52 6.6 6.6 0 116.63 6.62zm3.62-4.95c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.19-.5.64-.62.78-.11.13-.23.15-.42.05-.2-.1-.83-.3-1.58-.97-.58-.52-.98-1.16-1.09-1.36-.11-.19-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.11.13-.19.2-.32.06-.13.03-.24-.02-.34-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.34h-.38c-.13 0-.34.05-.52.24-.18.19-.68.66-.68 1.62s.7 1.87.8 2c.1.13 1.37 2.1 3.33 2.94.46.2.83.32 1.11.41.47.15.9.13 1.24.08.38-.06 1.17-.48 1.33-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23z" />
          </svg>
        </a>
      </div>
    </div>
  )
}
