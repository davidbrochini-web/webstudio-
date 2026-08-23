import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GT Fluir Pilates — exemplo de site | Omnidesign',
  robots: { index: false, follow: false },
}

const WA = '5511994777420'
const waLink = (msg: string) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`

const beneficios = [
  {
    titulo: 'Fortalece sem forçar',
    texto: 'Movimentos controlados que trabalham o corpo todo, respeitando o seu ritmo e as suas limitações.',
  },
  {
    titulo: 'Alivia dor nas costas',
    texto: 'Exercícios pensados pra aliviar dor crônica e prevenir novas lesões, com acompanhamento de perto.',
  },
  {
    titulo: 'Melhora o equilíbrio',
    texto: 'Trabalho de equilíbrio e coordenação que ajuda a prevenir quedas — essencial em qualquer idade.',
  },
  {
    titulo: 'Devolve autonomia',
    texto: 'Recupere a confiança pra fazer sozinho as tarefas do dia a dia: subir escada, levantar, se abaixar.',
  },
]

const unidades = [
  {
    nome: 'Unidade Tucuruvi',
    endereco: 'Rua Paulo de Faria, 300 — a 100m do Metrô Tucuruvi',
    mapa: 'https://maps.app.goo.gl/geH3wcDjsa7QYYb8A',
  },
  {
    nome: 'Unidade Parada Inglesa',
    endereco: 'Av. General Ataliba Leonel, 3442 — em frente ao Sacolão da Fartura',
    mapa: 'https://maps.app.goo.gl/k3n5DsGM9sh3aT1U7',
  },
]

const planos = [
  { freq: '1x por semana', desc: 'Ideal pra quem está começando no Pilates agora.' },
  { freq: '2x por semana', desc: 'Resultado mais consistente, com melhora perceptível na qualidade de vida.' },
  { freq: '3x por semana', desc: 'Acompanhamento mais próximo, pra quem quer evoluir mais rápido.' },
]

function PlaceholderFoto({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center text-center bg-[#EAF1F6] border border-dashed border-[#9DBAD1] rounded-2xl ${className}`}
    >
      <span className="text-xs font-medium text-[#4A7290] px-4">{label}</span>
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
        {/* Barra de aviso — só existe nessa página de exemplo, some no site real */}
        <div className="bg-[#1E2A33] text-white text-center text-xs py-2 px-4">
          Exemplo de site pra avaliação — GT Fluir Pilates. Fotos reais entram na versão final.
        </div>

        {/* Header */}
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

        {/* Hero */}
        <section className="px-5 pt-10 pb-12 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-3">
            Pilates + fisioterapia · Zona Norte, SP
          </p>
          <h1 className="gtf-display font-semibold text-[clamp(28px,7vw,40px)] leading-[1.15] text-[#1E2A33] mb-4">
            Pense no seu corpo<br />como um todo.
          </h1>
          <p className="text-base leading-relaxed text-[#4A5A66] max-w-md mx-auto mb-7">
            Pilates com acompanhamento de fisioterapeutas, pensado pra fortalecer, aliviar
            dor e devolver autonomia — em qualquer fase da vida.
          </p>
          <a
            href={waLink('Oi! Quero agendar uma aula na GT Fluir.')}
            className="inline-block bg-[#25A85A] text-white font-semibold text-base px-8 py-4 rounded-full mb-3"
          >
            Agendar aula pelo WhatsApp
          </a>
          <p className="text-xs text-[#7A8791]">Resposta rápida · 2 unidades na Zona Norte</p>

          <PlaceholderFoto label="Foto real do estúdio (Cadillac, Reformer)" className="mt-8 h-56" />
        </section>

        {/* Por que Pilates */}
        <section className="bg-white px-5 py-12 border-y border-[#E4DCC8]">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2 text-center">
            Por que Pilates
          </p>
          <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-8 text-center">
            O que o Pilates faz por você
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {beneficios.map(b => (
              <div key={b.titulo} className="bg-[#FBF9F4] rounded-2xl p-5 border border-[#E4DCC8]">
                <h3 className="gtf-display font-semibold text-base text-[#1D6FA8] mb-1.5">{b.titulo}</h3>
                <p className="text-sm text-[#4A5A66] leading-relaxed">{b.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Diferencial: fisioterapia */}
        <section className="px-5 py-12">
          <div className="max-w-md mx-auto text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2">
              O diferencial GT Fluir
            </p>
            <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-4">
              Fisioterapeutas, não só instrutores
            </h2>
            <p className="text-base leading-relaxed text-[#4A5A66]">
              Nossa equipe é formada por fisioterapeutas especialistas — não é só uma aula de
              exercício, é acompanhamento de verdade pro seu corpo, principalmente se você já
              tem alguma dor, lesão ou está numa fase de reabilitação.
            </p>
          </div>
        </section>

        {/* Sobre */}
        <section className="bg-white px-5 py-12 border-y border-[#E4DCC8]">
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

        {/* Unidades */}
        <section className="px-5 py-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2 text-center">
            Onde estamos
          </p>
          <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-8 text-center">
            Escolha a unidade mais perto
          </h2>
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {unidades.map(u => (
              <div key={u.nome} className="border border-[#E4DCC8] rounded-2xl overflow-hidden bg-white">
                <PlaceholderFoto label="Foto da fachada/unidade" className="h-32 rounded-none border-0 border-b border-[#E4DCC8]" />
                <div className="p-5">
                  <h3 className="gtf-display font-semibold text-base text-[#1E2A33] mb-1">{u.nome}</h3>
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
                      Falar no WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Planos */}
        <section className="bg-white px-5 py-12 border-y border-[#E4DCC8]">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2 text-center">
            Planos mensais
          </p>
          <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-3 text-center">
            Sem multa, sem taxa de cancelamento
          </h2>
          <p className="text-sm text-[#4A5A66] text-center max-w-sm mx-auto mb-8">
            Escolha a frequência que faz sentido pra sua rotina — sem usar limite do cartão.
          </p>
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            {planos.map(p => (
              <div key={p.freq} className="flex items-center justify-between gap-4 border border-[#E4DCC8] rounded-2xl p-5">
                <div>
                  <p className="gtf-display font-semibold text-base text-[#1E2A33]">{p.freq}</p>
                  <p className="text-sm text-[#4A5A66]">{p.desc}</p>
                </div>
                <a
                  href={waLink(`Oi! Quero saber o valor do plano ${p.freq}.`)}
                  className="flex-shrink-0 text-xs font-semibold text-[#1D6FA8] border border-[#1D6FA8] rounded-full px-4 py-2.5"
                >
                  Ver valor
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Depoimentos — placeholder honesto, sem inventar */}
        <section className="px-5 py-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C99A3B] mb-2 text-center">
            Depoimentos
          </p>
          <h2 className="gtf-display font-semibold text-2xl text-[#1E2A33] mb-6 text-center">
            O que os alunos dizem
          </h2>
          <PlaceholderFoto
            label="Espaço reservado pros depoimentos reais dos alunos (com autorização)"
            className="max-w-md mx-auto h-28"
          />
        </section>

        {/* Instagram CTA */}
        <section className="bg-[#1D6FA8] px-5 py-12 text-center">
          <p className="gtf-display font-semibold text-xl text-white mb-2">
            Acompanhe o dia a dia no Instagram
          </p>
          <p className="text-sm text-white/80 mb-5">@gtfluir</p>
          <a
            href="https://www.instagram.com/gtfluir/"
            className="inline-block bg-white text-[#1D6FA8] font-semibold text-sm px-6 py-3 rounded-full"
          >
            Seguir no Instagram
          </a>
        </section>

        {/* Footer */}
        <footer className="px-5 py-10 text-center">
          <p className="gtf-display font-semibold text-lg text-[#1D6FA8] mb-1">GT Fluir Pilates</p>
          <p className="text-sm text-[#4A5A66] mb-4">Pilates e fisioterapia · Zona Norte, São Paulo</p>
          <a
            href={waLink('Oi! Quero agendar uma aula na GT Fluir.')}
            className="inline-block bg-[#25A85A] text-white font-semibold text-sm px-6 py-3 rounded-full mb-6"
          >
            (11) 99477-7420 · WhatsApp
          </a>
          <p className="text-xs text-[#9AA5AC]">Tucuruvi · Parada Inglesa</p>
        </footer>

        {/* WhatsApp flutuante — número da GT Fluir, não da Omnidesign */}
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
