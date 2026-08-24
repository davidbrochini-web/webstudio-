import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'GT Fluir Pilates — exemplo de site | Omnidesign' },
  robots: { index: false, follow: false },
}

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

function FlowLine({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 40" className={className} preserveAspectRatio="none">
      <path
        d="M0 20 C 60 0, 100 40, 160 20 S 260 0, 320 20 S 380 35, 400 18"
        fill="none"
        stroke="#C99A3B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-11 h-11 rounded-full bg-[#EAF1F6] flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 24 24" fill="#1D6FA8" className="w-6 h-6">
        {children}
      </svg>
    </div>
  )
}

const TILE_BG = ['#1D6FA8', '#C99A3B', '#4A7290', '#1D6FA8', '#C99A3B', '#4A7290']

function PostTile({ tipo, desc, video, bg }: { tipo: string; desc: string; video: boolean; bg: string }) {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: bg }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-[0.25]" preserveAspectRatio="none">
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
    <div className="h-36 bg-[#1D6FA8] relative overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-[0.18]">
        <path d="M-10 60 C 40 30, 70 90, 120 55 S 190 20, 220 50" fill="none" stroke="#fff" strokeWidth="3" />
        <path d="M-10 80 C 40 55, 80 100, 130 75 S 190 45, 220 70" fill="none" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="relative text-center">
        <svg viewBox="0 0 24 24" fill="#C99A3B" className="w-7 h-7 mx-auto mb-1.5">
          <path d="M12 2c-4.4 0-8 3.6-8 8 0 5.4 8 12 8 12s8-6.6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />
        </svg>
        <p className="text-white font-semibold text-sm">{nome}</p>
      </div>
    </div>
  )
}

export default function GtFluirExemplo() {
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

        <header className="sticky top-0 z-40 bg-[#FBF9F4]/95 backdrop-blur border-b border-[#E4DCC8] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#1D6FA8] flex items-center justify-center text-white font-bold text-sm gtf-display">
              GT
            </div>
            <span className="gtf-display font-semibold text-lg text-[#1D6FA8]">fluir</span>
          </div>
          <a
            href={waLink('Oi! Vi o site e quero saber mais sobre o Pilates da GT Fluir.')}
            className="flex items-center gap-1.5 bg-[#25A85A] text-white text-sm font-semibold px-4 py-2.5 rounded-full"
          >
            WhatsApp
          </a>
        </header>

        <section className="relative bg-gradient-to-b from-[#EAF1F6] to-[#FBF9F4] px-5 pt-10 pb-8 text-center overflow-hidden">
          <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-[0.35]" preserveAspectRatio="none">
            <path d="M-20 140 C 60 90, 120 190, 200 130 S 340 70, 420 120" fill="none" stroke="#1D6FA8" strokeWidth="3" />
            <path d="M-20 170 C 80 130, 140 210, 220 160 S 360 110, 420 155" fill="none" stroke="#C99A3B" strokeWidth="2" />
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
              href={waLink('Oi! Quero agendar uma aula na GT Fluir.')}
              className="inline-block bg-[#25A85A] text-white font-semibold text-base px-8 py-4 rounded-full mb-6 shadow-[0_4px_14px_rgba(37,168,90,0.3)]"
            >
              Agendar aula pelo WhatsApp
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

        <FlowLine className="w-full h-6 -mt-1" />

        {/* Instagram — sobe pro topo porque é o conteúdo que eles mantêm
            atualizado de verdade; o resto do site é mais estático */}
        <section className="bg-white px-5 py-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-1">
            <div>
              <p className="gtf-display font-semibold text-lg text-[#1E2A33]">@gtfluir</p>
              <p className="text-xs text-[#4A5A66]">1,3 mil seguidores · atualizado toda semana</p>
            </div>
            <a
              href="https://www.instagram.com/gtfluir/"
              className="text-xs font-semibold text-white bg-gradient-to-tr from-[#C99A3B] to-[#1D6FA8] rounded-full px-4 py-2.5 flex-shrink-0"
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

        <section className="bg-white px-5 py-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2 text-center">
            Por que Pilates
          </p>
          <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-8 text-center">
            O que o Pilates faz por você
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {beneficios.map(b => (
              <div key={b.titulo} className="flex gap-4 bg-[#FBF9F4] rounded-2xl p-5 border border-[#E4DCC8]">
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
              <div key={u.nome} className="border border-[#E4DCC8] rounded-2xl overflow-hidden bg-white">
                <UnidadeVisual nome={u.nome} />
                <div className="p-5">
                  <h3 className="gtf-display font-semibold text-base text-[#1E2A33] mb-1">Unidade {u.nome}</h3>
                  <p className="text-sm text-[#4A5A66] mb-3">{u.endereco}</p>
                  <div className="flex gap-2">
                    <a
                      href={u.mapa}
                      className="text-xs font-semibold text-[#1D6FA8] border border-[#1D6FA8] rounded-full px-4 py-2"
                    >
                      Ver no mapa
                    </a>
                    <a
                      href={waLink(`Oi! Tenho interesse na unidade ${u.nome}.`)}
                      className="text-xs font-semibold text-white bg-[#25A85A] rounded-full px-4 py-2"
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
                className={`flex flex-col rounded-2xl p-5 border ${
                  p.destaque ? 'border-[#1D6FA8] border-2 bg-[#EAF1F6]' : 'border-[#E4DCC8]'
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
                  className="text-xs font-semibold text-center text-[#1D6FA8] border border-[#1D6FA8] rounded-full px-4 py-2.5"
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
          <div className="max-w-md mx-auto bg-white border border-[#E4DCC8] rounded-2xl p-6 text-center">
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
            href={waLink('Oi! Quero agendar uma aula na GT Fluir.')}
            className="inline-block bg-[#25A85A] text-white font-semibold text-sm px-6 py-3 rounded-full mb-4"
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
