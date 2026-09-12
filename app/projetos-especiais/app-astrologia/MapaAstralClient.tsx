'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SignoRow {
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

interface InterpRow { planeta: string; signo: string; influencia: string }

interface PlanetaExibido { planeta: string; simbolo: string; signo: string; influencia: string }

interface ResultadoMapa {
  solar: SignoRow
  lunar: SignoRow
  ascendente: SignoRow | null
  planetas: PlanetaExibido[]
  mensagemHoje: string
}

// ─── Cálculo determinístico ───────────────────────────────────────────────────

const SLUGS = [
  'aries','touro','gemeos','cancer','leao','virgem',
  'libra','escorpiao','sagitario','capricornio','aquario','peixes',
] as const
type Slug = typeof SLUGS[number]

function slugSol(d: string): Slug {
  const [,ms,ds] = d.split('-'); const m = +ms, n = +ds
  if ((m===3&&n>=21)||(m===4&&n<=19)) return 'aries'
  if ((m===4&&n>=20)||(m===5&&n<=20)) return 'touro'
  if ((m===5&&n>=21)||(m===6&&n<=20)) return 'gemeos'
  if ((m===6&&n>=21)||(m===7&&n<=22)) return 'cancer'
  if ((m===7&&n>=23)||(m===8&&n<=22)) return 'leao'
  if ((m===8&&n>=23)||(m===9&&n<=22)) return 'virgem'
  if ((m===9&&n>=23)||(m===10&&n<=22)) return 'libra'
  if ((m===10&&n>=23)||(m===11&&n<=21)) return 'escorpiao'
  if ((m===11&&n>=22)||(m===12&&n<=21)) return 'sagitario'
  if ((m===12&&n>=22)||(m===1&&n<=19)) return 'capricornio'
  if ((m===1&&n>=20)||(m===2&&n<=18)) return 'aquario'
  return 'peixes'
}

const REF_LUA = new Date('2000-01-06T18:14:00Z').getTime()
const PERIODO_LUA = 27.321582 * 86400000
const DPS = PERIODO_LUA / 12  // dias por signo

function slugLua(d: string): Slug {
  const dt = new Date(d + 'T12:00:00Z').getTime() - REF_LUA
  const pos = ((dt % PERIODO_LUA) + PERIODO_LUA) % PERIODO_LUA
  return SLUGS[(9 + Math.floor(pos / DPS)) % 12]
}

function slugAsc(d: string, h: string): Slug {
  const sunIdx = SLUGS.indexOf(slugSol(d))
  const [hh,mm] = h.split(':').map(Number)
  const offset  = Math.round((hh + mm/60 - 6) / 2)
  return SLUGS[((sunIdx + offset) % 12 + 12) % 12]
}

function slugPlaneta(d: string, refSigno: number, periodoMs: number): Slug {
  const ref = new Date('2000-01-01').getTime()
  const dt  = new Date(d).getTime() - ref
  const pos = ((dt % periodoMs) + periodoMs) % periodoMs
  return SLUGS[(refSigno + Math.floor((pos / periodoMs) * 12)) % 12]
}

function slugMercurio(d: string): Slug {
  const sun = SLUGS.indexOf(slugSol(d))
  const n   = +d.split('-')[2]
  return SLUGS[((sun + (n%3===0?-1:n%3===1?0:1)) % 12 + 12) % 12]
}

function slugVenus(d: string): Slug {
  const sun = SLUGS.indexOf(slugSol(d))
  const m   = +d.split('-')[1]
  return SLUGS[((sun + (m%5) - 2) % 12 + 12) % 12]
}

function mensagemHoje(s: SignoRow): string {
  if (!s.mensagens_diarias?.length) return ''
  const now = new Date()
  const doy = Math.floor((now.getTime() - new Date(now.getFullYear(),0,0).getTime()) / 86400000)
  return s.mensagens_diarias[doy % s.mensagens_diarias.length]
}

function fmtDate(s: string): string {
  if (!s) return ''; const [y,m,d] = s.split('-'); return `${d}/${m}/${y}`
}

// ─── Loading ──────────────────────────────────────────────────────────────────

const LOAD = ['Calculando posições planetárias…','Consultando o firmamento…','Analisando trânsitos astrais…','Mapeando casas astrológicas…']

// ─── Componente ───────────────────────────────────────────────────────────────

export default function MapaAstralClient() {
  const [step,    setStep]    = useState<'form'|'loading'|'result'>('form')
  const [loadIdx, setLoadIdx] = useState(0)
  const [form,    setForm]    = useState({ nome:'', dataNasc:'', horaNasc:'', cidade:'', pais:'Brasil', horaOk:true })
  const [result,  setResult]  = useState<ResultadoMapa|null>(null)
  const [sub,     setSub]     = useState({ canal:'email', contato:'' })
  const [subDone, setSubDone] = useState(false)
  const [subErr,  setSubErr]  = useState('')
  const [errMsg,  setErrMsg]  = useState('')

  function onField(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type==='checkbox' ? checked : value }))
  }

  async function calcular() {
    if (!form.nome.trim() || !form.dataNasc || !form.cidade.trim()) {
      setErrMsg('Preencha nome, data de nascimento e cidade.'); return
    }
    setErrMsg('')
    setStep('loading')
    let timerIdx = 0
    const timer = setInterval(() => { timerIdx=(timerIdx+1)%LOAD.length; setLoadIdx(timerIdx) }, 1800)

    const supabase   = createClient()
    const horaOk     = form.horaOk && !!form.horaNasc
    const slugSolar  = slugSol(form.dataNasc)
    const slugLunar  = slugLua(form.dataNasc)
    const slugAscend = horaOk ? slugAsc(form.dataNasc, form.horaNasc) : null

    const planMap: Record<string,Slug> = {
      'Mercúrio': slugMercurio(form.dataNasc),
      'Vênus':    slugVenus(form.dataNasc),
      'Marte':    slugPlaneta(form.dataNasc, 6, 686.97*86400000),
      'Júpiter':  slugPlaneta(form.dataNasc, 0, 4332.59*86400000),
    }

    let erroMsg = ''
    try {
      // Todos os slugs necessários em uma query só
      const todosOsSlugs = Array.from(new Set([
        slugSolar, slugLunar,
        ...(slugAscend ? [slugAscend] : []),
        ...Object.values(planMap),
      ]))

      const { data: signosData, error: signosErr } = await supabase
        .from('astrologia_signos')
        .select('*')
        .in('slug', todosOsSlugs)
      if (signosErr) throw new Error(`signos: ${signosErr.message}`)

      const bySlug = Object.fromEntries((signosData ?? []).map(s => [s.slug, s as SignoRow]))

      // Buscar TODAS as interpretações dos 4 planetas (48 linhas) e filtrar local
      const { data: interpData, error: interpErr } = await supabase
        .from('astrologia_planeta_signo')
        .select('planeta, signo, influencia')
        .in('planeta', ['Mercúrio','Vênus','Marte','Júpiter'])
      if (interpErr) throw new Error(`interp: ${interpErr.message}`)

      const interpIdx: Record<string,string> = {}
      for (const r of (interpData ?? []) as InterpRow[]) {
        interpIdx[`${r.planeta}|${r.signo}`] = r.influencia
      }

      const PLAN_META = [
        { key:'Mercúrio', sim:'☿' },
        { key:'Vênus',    sim:'♀' },
        { key:'Marte',    sim:'♂' },
        { key:'Júpiter',  sim:'♃' },
      ]

      const planetas: PlanetaExibido[] = PLAN_META.map(p => {
        const s    = bySlug[planMap[p.key]]
        const nome = s?.nome ?? planMap[p.key]
        return { planeta: p.key, simbolo: p.sim, signo: nome, influencia: interpIdx[`${p.key}|${nome}`] ?? '—' }
      })

      const solar      = bySlug[slugSolar]
      const lunar      = bySlug[slugLunar]
      const ascendente = slugAscend ? (bySlug[slugAscend] ?? null) : null

      if (!solar) throw new Error(`Signo solar não encontrado: ${slugSolar}`)

      setResult({ solar, lunar, ascendente, planetas, mensagemHoje: mensagemHoje(solar) })

      // Log sucesso (fire-and-forget)
      supabase.from('astrologia_logs').insert({
        nome:        form.nome,
        data_nasc:   form.dataNasc,
        cidade:      form.cidade,
        signo_solar: solar.nome,
        resultado:   'sucesso',
      }).then(() => {})

      setStep('result')
    } catch (e) {
      erroMsg = e instanceof Error ? e.message : String(e)
      console.error('[MapaAstral]', erroMsg)

      // Log erro (fire-and-forget)
      supabase.from('astrologia_logs').insert({
        nome:        form.nome,
        data_nasc:   form.dataNasc || null,
        cidade:      form.cidade,
        signo_solar: slugSolar,
        resultado:   'erro',
        erro_msg:    erroMsg,
        user_agent:  navigator.userAgent.slice(0,200),
      }).then(() => {})

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
      const { error } = await createClient().from('astrologia_inscricoes').insert({
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
    setSub({ canal:'email', contato:'' }); setSubErr('')
  }

  // ─── Styles ───────────────────────────────────────────────────────────────
  const card: React.CSSProperties = { background:'#fff', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px', marginBottom:10 }
  const inp: React.CSSProperties  = { width:'100%', boxSizing:'border-box', background:'#fff', border:'1px solid var(--border)', borderRadius:8, padding:'11px 14px', fontSize:15, outline:'none', color:'var(--dark)' }
  const lbl: React.CSSProperties  = { display:'block', fontSize:13, color:'var(--muted)', marginBottom:4 }
  const btn: React.CSSProperties  = { width:'100%', boxSizing:'border-box', background:'var(--brand)', border:'none', borderRadius:10, padding:'13px 0', color:'#fff', fontWeight:600, fontSize:15, cursor:'pointer' }
  const page: React.CSSProperties = { minHeight:'100dvh', background:'var(--off)', fontFamily:'var(--font-sans,system-ui)' }
  const inner: React.CSSProperties = { maxWidth:460, margin:'0 auto', padding:'20px 16px 48px' }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (step === 'loading') return (
    <div style={{...page, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <div style={{fontSize:48, color:'var(--brand)', display:'inline-block', animation:'spin 3s linear infinite'}}>✦</div>
      <p style={{fontSize:16, color:'var(--dark)', margin:'18px 0 6px'}}>{LOAD[loadIdx]}</p>
      <p style={{fontSize:13, color:'var(--muted)'}}>{form.nome} · {form.cidade} · {fmtDate(form.dataNasc)}</p>
    </div>
  )

  // ─── Resultado ────────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    const R = result

    const signoCard = (label: string, s: SignoRow | null, desc: string) => (
      <div style={{...card, marginBottom:0}}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:6}}>
          <span style={{fontSize:28, lineHeight:1}}>{s?.simbolo ?? '?'}</span>
          <div>
            <p style={{fontSize:11, color:'var(--muted)', margin:0}}>{label}</p>
            <p style={{fontSize:15, fontWeight:600, color:'var(--dark)', margin:0}}>
              {s?.nome ?? 'Não calculado'}
              {s?.elemento ? <span style={{fontWeight:400, color:'var(--muted)', fontSize:13}}> · {s.elemento}</span> : null}
            </p>
          </div>
        </div>
        <p style={{fontSize:13, color:'var(--muted)', lineHeight:1.65, margin:0}}>{desc}</p>
      </div>
    )

    return (
      <div style={page}>
        <div style={inner}>
          <div style={{textAlign:'center', marginBottom:22}}>
            <div style={{fontSize:36, color:'var(--brand)'}}>✦</div>
            <p style={{fontSize:13, color:'var(--muted)', margin:'6px 0 2px'}}>Mapa Astral de</p>
            <p style={{fontSize:21, fontWeight:700, color:'var(--dark)', margin:'0 0 4px'}}>{form.nome}</p>
            <p style={{fontSize:12, color:'var(--muted)', margin:0}}>
              {fmtDate(form.dataNasc)}{form.horaOk&&form.horaNasc?` · ${form.horaNasc}`:''} · {form.cidade}, {form.pais}
            </p>
          </div>

          {/* Trio */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:8, marginBottom:10}}>
            {[
              {lbl:'Sol ☉',  s:R.solar,      cor:'#F5A623'},
              {lbl:'Lua ☽',  s:R.lunar,      cor:'#8B5CF6'},
              {lbl:'Asc. ↑', s:R.ascendente, cor:'var(--brand2)'},
            ].map((item,i) => (
              <div key={i} style={{...card, marginBottom:0, padding:'12px 8px', textAlign:'center'}}>
                <p style={{fontSize:11, color:'var(--muted)', margin:'0 0 4px'}}>{item.lbl}</p>
                <p style={{fontSize:26, color:item.cor, margin:'0 0 4px'}}>{item.s?.simbolo ?? '?'}</p>
                <p style={{fontSize:12, fontWeight:600, color:'var(--dark)', margin:'0 0 2px'}}>{item.s?.nome ?? '—'}</p>
                <p style={{fontSize:11, color:'var(--muted)', margin:0}}>{item.s?.elemento ?? ''}</p>
              </div>
            ))}
          </div>

          {/* Mensagem do dia */}
          {R.mensagemHoje && (
            <div style={{background:'rgba(127,163,62,.07)', border:'1px solid rgba(127,163,62,.25)', borderRadius:14, padding:'14px 16px', marginBottom:10}}>
              <p style={{fontSize:11, fontWeight:600, color:'var(--brand)', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>Mensagem de hoje</p>
              <p style={{fontSize:14, color:'var(--dark)', lineHeight:1.65, margin:0}}>{R.mensagemHoje}</p>
            </div>
          )}

          {/* Detalhes dos signos */}
          <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:10}}>
            {signoCard('Sol ☉ · Signo Solar',  R.solar,      R.solar?.descricao_solar ?? '')}
            {signoCard('Lua ☽ · Signo Lunar',  R.lunar,      R.lunar?.descricao_lunar ?? '')}
            {signoCard('↑ · Ascendente', R.ascendente,
              R.ascendente ? R.ascendente.descricao_ascendente : 'A hora exata de nascimento é necessária para calcular o Ascendente.')}
          </div>

          {/* Planetas */}
          <div style={card}>
            <p style={{fontSize:13, fontWeight:600, color:'var(--dark)', margin:'0 0 10px'}}>Posição dos Planetas</p>
            {R.planetas.map((p,i) => (
              <div key={i} style={{display:'flex', gap:10, alignItems:'flex-start', borderTop:i>0?'1px solid var(--border)':'none', paddingTop:i>0?8:0, paddingBottom:i<R.planetas.length-1?8:0}}>
                <span style={{fontSize:15, color:'var(--brand)', minWidth:18, marginTop:1}}>{p.simbolo}</span>
                <div>
                  <span style={{fontSize:12, color:'var(--muted)'}}>{p.planeta} </span>
                  <span style={{fontSize:13, fontWeight:600, color:'var(--dark)'}}>{p.signo}</span>
                  <p style={{fontSize:12, color:'var(--muted)', margin:'3px 0 0', lineHeight:1.5}}>{p.influencia}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pontos fortes & Desafios */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:8, marginBottom:10}}>
            <div style={{...card, marginBottom:0}}>
              <p style={{fontSize:12, fontWeight:600, color:'#16a34a', margin:'0 0 6px'}}>Pontos fortes</p>
              {(R.solar.pontos_fortes ?? []).map((p,i) => <p key={i} style={{fontSize:12, color:'var(--muted)', margin:'0 0 4px', lineHeight:1.4}}>· {p}</p>)}
            </div>
            <div style={{...card, marginBottom:0}}>
              <p style={{fontSize:12, fontWeight:600, color:'#d97706', margin:'0 0 6px'}}>Desafios</p>
              {(R.solar.desafios ?? []).map((d,i) => <p key={i} style={{fontSize:12, color:'var(--muted)', margin:'0 0 4px', lineHeight:1.4}}>· {d}</p>)}
            </div>
          </div>

          {/* Assinatura */}
          <div style={{...card, border:'1px solid rgba(127,163,62,.3)'}}>
            <p style={{fontSize:16, fontWeight:700, color:'var(--dark)', margin:'0 0 4px'}}>Horóscopo Diário</p>
            <p style={{fontSize:13, color:'var(--muted)', margin:'0 0 14px', lineHeight:1.5}}>Receba uma previsão personalizada todos os dias com base no seu mapa astral.</p>
            {subDone ? (
              <div style={{textAlign:'center', padding:'10px 0'}}>
                <p style={{fontSize:15, fontWeight:600, color:'#16a34a', margin:'0 0 4px'}}>✓ Inscrição confirmada!</p>
                <p style={{fontSize:13, color:'var(--muted)', margin:0}}>Você receberá seu horóscopo diário em breve.</p>
              </div>
            ) : (
              <>
                <div style={{display:'flex', gap:8, marginBottom:10}}>
                  {(['email','whatsapp'] as const).map(c => (
                    <button key={c} onClick={() => setSub(s=>({...s, canal:c}))} style={{flex:1, padding:'9px 0', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500, border:`1px solid ${sub.canal===c?'var(--brand)':'var(--border)'}`, background:sub.canal===c?'rgba(127,163,62,.08)':'transparent', color:sub.canal===c?'var(--brand)':'var(--muted)'}}>
                      {c==='email'?'📧 E-mail':'📱 WhatsApp'}
                    </button>
                  ))}
                </div>
                <input style={inp} placeholder={sub.canal==='email'?'seu@email.com':'(11) 99999-9999'} value={sub.contato} onChange={e=>setSub(s=>({...s, contato:e.target.value}))} />
                {subErr && <p style={{color:'#dc2626', fontSize:12, margin:'4px 0 0'}}>{subErr}</p>}
                <button style={{...btn, marginTop:10}} onClick={assinar}>Quero receber todo dia</button>
                <p style={{fontSize:11, color:'var(--muted)', textAlign:'center', margin:'6px 0 0'}}>Sem spam · Cancele quando quiser</p>
              </>
            )}
          </div>

          <button onClick={reset} style={{width:'100%', background:'none', border:'none', color:'var(--muted)', fontSize:13, padding:'14px 0', cursor:'pointer'}}>← Gerar novo mapa</button>
        </div>
      </div>
    )
  }

  // ─── Formulário ───────────────────────────────────────────────────────────
  return (
    <div style={page}>
      <div style={inner}>
        <div style={{textAlign:'center', marginBottom:28}}>
          <div style={{fontSize:44, color:'var(--brand)', marginBottom:10}}>✦</div>
          <h1 style={{fontSize:24, fontWeight:700, color:'var(--dark)', margin:'0 0 6px'}}>Mapa Astral</h1>
          <p style={{fontSize:14, color:'var(--muted)', margin:0}}>Descubra o que os astros revelam sobre você</p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div>
            <label style={lbl}>Nome completo</label>
            <input style={inp} name="nome" placeholder="Seu nome completo" value={form.nome} onChange={onField} />
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:10}}>
            <div>
              <label style={lbl}>Data de nascimento</label>
              <input style={inp} type="date" name="dataNasc" value={form.dataNasc} onChange={onField} />
            </div>
            <div>
              <label style={{...lbl, opacity:form.horaOk?1:0.4}}>Hora de nascimento</label>
              <input style={{...inp, opacity:form.horaOk?1:0.4}} type="time" name="horaNasc" value={form.horaNasc} onChange={onField} disabled={!form.horaOk} />
            </div>
          </div>
          <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer'}}>
            <input type="checkbox" name="horaOk" checked={form.horaOk} onChange={onField} style={{width:16, height:16, accentColor:'var(--brand)', cursor:'pointer'}} />
            <span style={{fontSize:13, color:'var(--muted)'}}>Conheço a hora exata de nascimento</span>
          </label>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:10}}>
            <div>
              <label style={lbl}>Cidade de nascimento</label>
              <input style={inp} name="cidade" placeholder="Ex: São Paulo" value={form.cidade} onChange={onField} />
            </div>
            <div>
              <label style={lbl}>País</label>
              <input style={inp} name="pais" placeholder="País" value={form.pais} onChange={onField} />
            </div>
          </div>
          {errMsg && <p style={{color:'#dc2626', fontSize:13, textAlign:'center', margin:0}}>{errMsg}</p>}
          <button style={btn} onClick={calcular}>Revelar meu mapa astral ✦</button>
          <p style={{fontSize:11, color:'var(--muted)', textAlign:'center', margin:0}}>A hora de nascimento é necessária para calcular o Ascendente</p>
        </div>

        <p style={{textAlign:'center', marginTop:32, color:'var(--border)', fontSize:20, letterSpacing:'0.3em'}}>
          ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓
        </p>
      </div>
    </div>
  )
}
