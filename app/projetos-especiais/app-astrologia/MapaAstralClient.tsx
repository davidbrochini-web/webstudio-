'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SignoInfo {
  slug: string
  nome: string
  simbolo: string
  elemento: string
  qualidade: string
  planeta_regente: string
  descricao_solar: string
  descricao_lunar: string
  descricao_ascendente: string
  pontos_fortes: string[]
  desafios: string[]
  mensagens_diarias: string[]
}

interface PlanetaSigno {
  planeta: string
  simbolo: string
  signo: string
  influencia: string
}

interface ResultadoMapa {
  solar: SignoInfo
  lunar: SignoInfo
  ascendente: SignoInfo | null  // null se hora não fornecida
  planetas: PlanetaSigno[]
  mensagemHoje: string
}

interface FormData {
  nome: string
  dataNasc: string   // YYYY-MM-DD
  horaNasc: string   // HH:MM
  cidade: string
  pais: string
  horaOk: boolean
}

// ─── Dados dos signos (só para cálculo — conteúdo vem do Supabase) ───────────

const SLUGS = [
  'aries','touro','gemeos','cancer','leao','virgem',
  'libra','escorpiao','sagitario','capricornio','aquario','peixes'
] as const

const SIMBOLOS: Record<string, string> = {
  aries:'♈', touro:'♉', gemeos:'♊', cancer:'♋', leao:'♌', virgem:'♍',
  libra:'♎', escorpiao:'♏', sagitario:'♐', capricornio:'♑', aquario:'♒', peixes:'♓'
}

const PLANETAS_EXIBIDOS = [
  { key: 'Mercúrio', simbolo: '☿' },
  { key: 'Vênus',   simbolo: '♀' },
  { key: 'Marte',   simbolo: '♂' },
  { key: 'Júpiter', simbolo: '♃' },
]

// ─── Cálculo determinístico dos signos ───────────────────────────────────────

function slugSunSign(dateStr: string): string {
  const [, ms, ds] = dateStr.split('-')
  const m = +ms, d = +ds
  if ((m === 3  && d >= 21) || (m === 4  && d <= 19)) return 'aries'
  if ((m === 4  && d >= 20) || (m === 5  && d <= 20)) return 'touro'
  if ((m === 5  && d >= 21) || (m === 6  && d <= 20)) return 'gemeos'
  if ((m === 6  && d >= 21) || (m === 7  && d <= 22)) return 'cancer'
  if ((m === 7  && d >= 23) || (m === 8  && d <= 22)) return 'leao'
  if ((m === 8  && d >= 23) || (m === 9  && d <= 22)) return 'virgem'
  if ((m === 9  && d >= 23) || (m === 10 && d <= 22)) return 'libra'
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'escorpiao'
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'sagitario'
  if ((m === 12 && d >= 22) || (m === 1  && d <= 19)) return 'capricornio'
  if ((m === 1  && d >= 20) || (m === 2  && d <= 18)) return 'aquario'
  return 'peixes'
}

// Lua: período sidéreo 27.321582 dias. Ref: 2000-01-06 18:14 UTC ≈ início em Capricórnio (índice 9)
const REF_LUA_MS   = new Date('2000-01-06T18:14:00Z').getTime()
const PERIODO_LUA  = 27.321582 * 24 * 60 * 60 * 1000
const DIAS_POR_SIGNO = PERIODO_LUA / 12

function slugMoonSign(dateStr: string): string {
  const dt = new Date(dateStr + 'T12:00:00Z').getTime() - REF_LUA_MS
  const posLua = ((dt % PERIODO_LUA) + PERIODO_LUA) % PERIODO_LUA
  const offset  = Math.floor(posLua / DIAS_POR_SIGNO)
  return SLUGS[(9 + offset) % 12]
}

// Ascendente: cada signo leva ~2h para ascender. Ao meio-dia o Asc ≈ signo solar.
// A cada hora avança ~0.5 signo. Base: sol ascende com o signo solar ao nascer do sol (~6h).
function slugAscendente(dateStr: string, horaStr: string): string {
  const sunIdx = SLUGS.indexOf(slugSunSign(dateStr) as typeof SLUGS[number])
  const [hh, mm] = horaStr.split(':').map(Number)
  const horaDecimal = hh + mm / 60
  const offset = Math.round((horaDecimal - 6) / 2)
  return SLUGS[((sunIdx + offset) % 12 + 12) % 12]
}

// Marte: período 686.97 dias. Ref 2000-01-01 ≈ Libra (6)
function slugMarte(dateStr: string): string {
  const ref = new Date('2000-01-01').getTime()
  const periodoMs = 686.97 * 24 * 60 * 60 * 1000
  const dt = new Date(dateStr).getTime() - ref
  const pos = ((dt % periodoMs) + periodoMs) % periodoMs
  const idx = Math.floor((pos / periodoMs) * 12)
  return SLUGS[(6 + idx) % 12]
}

// Júpiter: período 4332.59 dias. Ref 2000-01-01 ≈ Áries (0)
function slugJupiter(dateStr: string): string {
  const ref = new Date('2000-01-01').getTime()
  const periodoMs = 4332.59 * 24 * 60 * 60 * 1000
  const dt = new Date(dateStr).getTime() - ref
  const pos = ((dt % periodoMs) + periodoMs) % periodoMs
  const idx = Math.floor((pos / periodoMs) * 12)
  return SLUGS[(0 + idx) % 12]
}

// Mercúrio: fica a ±1 signo do Sol (baseado no dia do mês)
function slugMercurio(dateStr: string): string {
  const sunIdx = SLUGS.indexOf(slugSunSign(dateStr) as typeof SLUGS[number])
  const d = +dateStr.split('-')[2]
  const offset = d % 3 === 0 ? -1 : d % 3 === 1 ? 0 : 1
  return SLUGS[((sunIdx + offset) % 12 + 12) % 12]
}

// Vênus: fica a ±2 signos do Sol (baseado no mês)
function slugVenus(dateStr: string): string {
  const sunIdx = SLUGS.indexOf(slugSunSign(dateStr) as typeof SLUGS[number])
  const m = +dateStr.split('-')[1]
  const offset = (m % 5) - 2
  return SLUGS[((sunIdx + offset) % 12 + 12) % 12]
}

// Mensagem do dia: rotaciona pelo dia do ano
function mensagemDoDia(signo: SignoInfo): string {
  if (!signo.mensagens_diarias.length) return ''
  const now  = new Date()
  const doy  = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  return signo.mensagens_diarias[doy % signo.mensagens_diarias.length]
}

// Utilitário de data
function fmtDate(s: string): string {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

// ─── Mensagens de loading rotativas ──────────────────────────────────────────

const LOAD_MSGS = [
  'Calculando posições planetárias…',
  'Consultando o firmamento…',
  'Analisando trânsitos astrais…',
  'Mapeando casas astrológicas…',
]

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MapaAstralClient() {
  const [step,    setStep]    = useState<'form' | 'loading' | 'result'>('form')
  const [loadIdx, setLoadIdx] = useState(0)
  const [form,    setForm]    = useState<FormData>({
    nome: '', dataNasc: '', horaNasc: '', cidade: '', pais: 'Brasil', horaOk: true,
  })
  const [result,  setResult]  = useState<ResultadoMapa | null>(null)
  const [sub,     setSub]     = useState({ canal: 'email', contato: '' })
  const [subDone, setSubDone] = useState(false)
  const [subErr,  setSubErr]  = useState('')
  const [errMsg,  setErrMsg]  = useState('')

  function onField(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function calcular() {
    if (!form.nome.trim() || !form.dataNasc || !form.cidade.trim()) {
      setErrMsg('Preencha nome, data de nascimento e cidade.')
      return
    }
    setErrMsg('')
    setStep('loading')

    // Animar o loading
    let idx = 0
    const timer = setInterval(() => { idx = (idx + 1) % LOAD_MSGS.length; setLoadIdx(idx) }, 1800)

    try {
      const supabase   = createClient()
      const horaOk     = form.horaOk && !!form.horaNasc

      // Calcular slugs
      const slugSolar   = slugSunSign(form.dataNasc)
      const slugLunar   = slugMoonSign(form.dataNasc)
      const slugAsc     = horaOk ? slugAscendente(form.dataNasc, form.horaNasc) : null

      const slugsNecessarios = Array.from(new Set(
        [slugSolar, slugLunar, ...(slugAsc ? [slugAsc] : [])].filter(Boolean)
      ))

      // Slugs dos planetas
      const slugPlanetaMap: Record<string, string> = {
        'Mercúrio': slugMercurio(form.dataNasc),
        'Vênus':    slugVenus(form.dataNasc),
        'Marte':    slugMarte(form.dataNasc),
        'Júpiter':  slugJupiter(form.dataNasc),
      }
      const slugsPlanetas = Object.values(slugPlanetaMap)
      const todosOsSlugs  = Array.from(new Set([...slugsNecessarios, ...slugsPlanetas]))

      // Buscar todos os signos necessários de uma só vez
      const { data: signosData, error: signosErr } = await supabase
        .from('astrologia_signos')
        .select('*')
        .in('slug', todosOsSlugs)

      if (signosErr) throw signosErr

      const signoPorSlug = Object.fromEntries((signosData ?? []).map(s => [s.slug, s]))

      // Buscar interpretações planeta×signo
      const pairs = PLANETAS_EXIBIDOS.map(p => `(${p.key},${slugPlanetaMap[p.key]})`).join(',')
      const { data: interpData, error: interpErr } = await supabase
        .from('astrologia_planeta_signo')
        .select('planeta, signo, influencia')
        .in('planeta', PLANETAS_EXIBIDOS.map(p => p.key))
        .in('signo', slugsPlanetas.map(s => signoPorSlug[s]?.nome).filter(Boolean))

      if (interpErr) throw interpErr

      const interpMap = Object.fromEntries(
        (interpData ?? []).map(r => [`${r.planeta}|${r.signo}`, r.influencia])
      )

      const solar      = signoPorSlug[slugSolar]
      const lunar      = signoPorSlug[slugLunar]
      const ascendente = slugAsc ? (signoPorSlug[slugAsc] ?? null) : null

      const planetas: PlanetaSigno[] = PLANETAS_EXIBIDOS.map(p => {
        const slugP = slugPlanetaMap[p.key]
        const nome  = signoPorSlug[slugP]?.nome ?? slugP
        return {
          planeta:   p.key,
          simbolo:   p.simbolo,
          signo:     nome,
          influencia: interpMap[`${p.key}|${nome}`] ?? '—',
        }
      })

      setResult({
        solar,
        lunar,
        ascendente,
        planetas,
        mensagemHoje: mensagemDoDia(solar),
      })
      setStep('result')
    } catch (e) {
      console.error(e)
      setErrMsg('Erro ao consultar os astros. Tente novamente.')
      setStep('form')
    } finally {
      clearInterval(timer)
    }
  }

  async function assinar() {
    setSubErr('')
    if (!sub.contato.trim()) { setSubErr('Informe seu contato.'); return }
    try {
      const supabase = createClient()
      const { error } = await supabase.from('astrologia_inscricoes').insert({
        nome:        form.nome,
        data_nasc:   form.dataNasc,
        cidade:      form.cidade,
        pais:        form.pais,
        signo_solar: result?.solar?.nome ?? '',
        canal:       sub.canal,
        contato:     sub.contato.trim(),
      })
      if (error) throw error
      setSubDone(true)
    } catch (e) {
      console.error(e)
      setSubErr('Erro ao salvar inscrição. Tente novamente.')
    }
  }

  function reset() {
    setStep('form'); setResult(null); setSubDone(false)
    setSub({ canal: 'email', contato: '' }); setSubErr('')
  }

  // ─── Estilos base ─────────────────────────────────────────────────────────
  const S = {
    page:  { minHeight: '100dvh', background: 'var(--off)', fontFamily: 'var(--font-sans, system-ui)' } as React.CSSProperties,
    inner: { maxWidth: 460, margin: '0 auto', padding: '20px 16px 48px' } as React.CSSProperties,
    card:  {
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '14px 16px',
      marginBottom: 10,
    } as React.CSSProperties,
    inp: {
      width: '100%', boxSizing: 'border-box' as const,
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '11px 14px',
      fontSize: 15,
      outline: 'none',
      color: 'var(--dark)',
    },
    lbl:  { display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 4 } as React.CSSProperties,
    btn:  {
      width: '100%', boxSizing: 'border-box' as const,
      background: 'var(--brand)',
      border: 'none', borderRadius: 10,
      padding: '13px 0',
      color: '#fff', fontWeight: 600, fontSize: 15,
      cursor: 'pointer',
    },
    proCard: {
      background: 'rgba(127,163,62,0.07)',
      border: '1px solid rgba(127,163,62,0.25)',
      borderRadius: 14, padding: '14px 16px', marginBottom: 10,
    } as React.CSSProperties,
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: 48, color: 'var(--brand)', display: 'inline-block', animation: 'spin 3s linear infinite' }}>✦</div>
        <p style={{ fontSize: 16, color: 'var(--dark)', margin: '18px 0 6px' }}>{LOAD_MSGS[loadIdx]}</p>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>{form.nome} · {form.cidade} · {fmtDate(form.dataNasc)}</p>
      </div>
    )
  }

  // ─── Resultado ────────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    const R = result

    const signCard = (label: string, s: SignoInfo | null, desc: string) => (
      <div style={{ ...S.card, marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28, lineHeight: 1 }}>{s?.simbolo ?? '?'}</span>
          <div>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{label}</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark)', margin: 0 }}>
              {s?.nome ?? 'Não calculado'}
              {s?.elemento ? <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 13 }}> · {s.elemento}</span> : null}
            </p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
      </div>
    )

    return (
      <div style={S.page}>
        <div style={S.inner}>

          {/* Cabeçalho */}
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div style={{ fontSize: 36, color: 'var(--brand)' }}>✦</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 2px' }}>Mapa Astral de</p>
            <p style={{ fontSize: 21, fontWeight: 700, color: 'var(--dark)', margin: '0 0 4px' }}>{form.nome}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
              {fmtDate(form.dataNasc)}
              {form.horaOk && form.horaNasc ? ` · ${form.horaNasc}` : ''}
              {' · '}{form.cidade}, {form.pais}
            </p>
          </div>

          {/* Trio de signos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8, marginBottom: 10 }}>
            {[
              { lbl: 'Sol ☉',  s: R.solar,      cor: '#F5A623' },
              { lbl: 'Lua ☽',  s: R.lunar,      cor: '#8B5CF6' },
              { lbl: 'Asc. ↑', s: R.ascendente, cor: 'var(--brand2)' },
            ].map((item, i) => (
              <div key={i} style={{ ...S.card, marginBottom: 0, padding: '12px 8px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'var(--muted)', margin: '0 0 4px' }}>{item.lbl}</p>
                <p style={{ fontSize: 26, color: item.cor, margin: '0 0 4px' }}>{item.s?.simbolo ?? '?'}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark)', margin: '0 0 2px' }}>{item.s?.nome ?? '—'}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{item.s?.elemento ?? ''}</p>
              </div>
            ))}
          </div>

          {/* Mensagem do dia */}
          {R.mensagemHoje ? (
            <div style={S.proCard}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mensagem de hoje
              </p>
              <p style={{ fontSize: 14, color: 'var(--dark)', lineHeight: 1.65, margin: 0 }}>{R.mensagemHoje}</p>
            </div>
          ) : null}

          {/* Signos — detalhes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {signCard('Sol ☉ · Signo Solar',    R.solar,      R.solar?.descricao_solar ?? '')}
            {signCard('Lua ☽ · Signo Lunar',    R.lunar,      R.lunar?.descricao_lunar ?? '')}
            {signCard(
              '↑ · Ascendente',
              R.ascendente,
              R.ascendente
                ? R.ascendente.descricao_ascendente
                : 'A hora exata de nascimento é necessária para calcular o Ascendente.'
            )}
          </div>

          {/* Planetas */}
          <div style={S.card}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)', margin: '0 0 10px' }}>Posição dos Planetas</p>
            {R.planetas.map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  paddingTop: i > 0 ? 8 : 0,
                  paddingBottom: i < R.planetas.length - 1 ? 8 : 0,
                }}
              >
                <span style={{ fontSize: 15, color: 'var(--brand)', minWidth: 18, marginTop: 1 }}>{p.simbolo}</span>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.planeta} </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>{p.signo}</span>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0', lineHeight: 1.5 }}>{p.influencia}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pontos fortes & Desafios */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8, marginBottom: 10 }}>
            <div style={{ ...S.card, marginBottom: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', margin: '0 0 6px' }}>Pontos fortes</p>
              {(R.solar?.pontos_fortes ?? []).map((p, i) => (
                <p key={i} style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 4px', lineHeight: 1.4 }}>· {p}</p>
              ))}
            </div>
            <div style={{ ...S.card, marginBottom: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#d97706', margin: '0 0 6px' }}>Desafios</p>
              {(R.solar?.desafios ?? []).map((d, i) => (
                <p key={i} style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 4px', lineHeight: 1.4 }}>· {d}</p>
              ))}
            </div>
          </div>

          {/* Assinatura */}
          <div style={{ ...S.card, border: '1px solid rgba(127,163,62,0.3)' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark)', margin: '0 0 4px' }}>Horóscopo Diário</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
              Receba uma previsão personalizada todos os dias com base no seu mapa astral.
            </p>

            {subDone ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#16a34a', margin: '0 0 4px' }}>✓ Inscrição confirmada!</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Você receberá seu horóscopo diário em breve.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {(['email', 'whatsapp'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setSub(s => ({ ...s, canal: c }))}
                      style={{
                        flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                        fontSize: 13, fontWeight: 500,
                        border: `1px solid ${sub.canal === c ? 'var(--brand)' : 'var(--border)'}`,
                        background: sub.canal === c ? 'rgba(127,163,62,0.08)' : 'transparent',
                        color: sub.canal === c ? 'var(--brand)' : 'var(--muted)',
                      }}
                    >
                      {c === 'email' ? '📧 E-mail' : '📱 WhatsApp'}
                    </button>
                  ))}
                </div>

                <input
                  style={S.inp}
                  placeholder={sub.canal === 'email' ? 'seu@email.com' : '(11) 99999-9999'}
                  value={sub.contato}
                  onChange={e => setSub(s => ({ ...s, contato: e.target.value }))}
                />

                {subErr && <p style={{ color: '#dc2626', fontSize: 12, margin: '4px 0 0' }}>{subErr}</p>}

                <button style={{ ...S.btn, marginTop: 10 }} onClick={assinar}>
                  Quero receber todo dia
                </button>
                <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', margin: '6px 0 0' }}>
                  Sem spam · Cancele quando quiser
                </p>
              </>
            )}
          </div>

          <button
            onClick={reset}
            style={{
              width: '100%', background: 'none', border: 'none',
              color: 'var(--muted)', fontSize: 13, padding: '14px 0', cursor: 'pointer',
            }}
          >
            ← Gerar novo mapa
          </button>
        </div>
      </div>
    )
  }

  // ─── Formulário ───────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, color: 'var(--brand)', marginBottom: 10 }}>✦</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--dark)', margin: '0 0 6px' }}>Mapa Astral</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>Descubra o que os astros revelam sobre você</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <label style={S.lbl}>Nome completo</label>
            <input style={S.inp} name="nome" placeholder="Seu nome completo" value={form.nome} onChange={onField} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
            <div>
              <label style={S.lbl}>Data de nascimento</label>
              <input style={S.inp} type="date" name="dataNasc" value={form.dataNasc} onChange={onField} />
            </div>
            <div>
              <label style={{ ...S.lbl, opacity: form.horaOk ? 1 : 0.4 }}>Hora de nascimento</label>
              <input
                style={{ ...S.inp, opacity: form.horaOk ? 1 : 0.4 }}
                type="time" name="horaNasc"
                value={form.horaNasc}
                onChange={onField}
                disabled={!form.horaOk}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox" name="horaOk" checked={form.horaOk} onChange={onField}
              style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Conheço a hora exata de nascimento</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
            <div>
              <label style={S.lbl}>Cidade de nascimento</label>
              <input style={S.inp} name="cidade" placeholder="Ex: São Paulo" value={form.cidade} onChange={onField} />
            </div>
            <div>
              <label style={S.lbl}>País</label>
              <input style={S.inp} name="pais" placeholder="País" value={form.pais} onChange={onField} />
            </div>
          </div>

          {errMsg && <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', margin: 0 }}>{errMsg}</p>}

          <button style={S.btn} onClick={calcular}>
            Revelar meu mapa astral ✦
          </button>

          <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
            A hora de nascimento é necessária para calcular o Ascendente
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--border)', fontSize: 20, letterSpacing: '0.3em' }}>
          ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓
        </p>
      </div>
    </div>
  )
}
