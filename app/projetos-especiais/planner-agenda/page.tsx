import type { Metadata } from 'next'

// ─────────────────────────────────────────────────────────────────
// Projeto Especial — Planner & Agenda (landing v2, sem backend ainda)
// Página estática, sem leitura de banco — v2 reforça que é um SISTEMA
// (organiza + lembra por e-mail), não um checklist estático: mockup de
// painel + mockup de e-mail de lembrete, além de foto real e gráfico
// ilustrativo. Cores locais (--pa-*), mesmo padrão de escopo por
// projeto especial usado no dentista-joao/colegio-elite.
// ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Planeja — planners e agendas por assinatura',
  description:
    'Crie e organize seus planners, com lembretes automáticos por e-mail no dia e hora certos. A partir de R$ 9,90/mês.',
  robots: { index: false, follow: false },
}

const HERO_IMG = 'https://images.unsplash.com/photo-1718359471677-2ded0e10c559?w=1200&q=70&auto=format&fit=crop'

const INCLUSOS = [
  { titulo: 'Lembretes automáticos por e-mail', texto: 'Você define o quê e quando — o resto é com a gente.' },
  { titulo: 'Vários planners na mesma conta', texto: 'Trabalho, estudos, casa — cada um com sua própria agenda.' },
  { titulo: 'Personalização total', texto: 'Adicione, remova e organize seções e itens do seu jeito.' },
  { titulo: 'Acesso de qualquer lugar', texto: 'Celular ou computador, sempre sincronizado.' },
]

const CATEGORIAS_CHART = [
  { nome: 'Trabalho', valor: 9 },
  { nome: 'Estudos', valor: 6 },
  { nome: 'Casa', valor: 5 },
  { nome: 'Saúde', valor: 4 },
]

const FAQ = [
  { p: 'Posso cancelar quando quiser?', r: 'Sim, sem fidelidade e sem taxa de cancelamento. Sua assinatura vale mês a mês.' },
  { p: 'Os modelos prontos servem pra quê?', r: 'Pra quem quer começar a organizar hoje sem montar nada do zero — cronogramas de estudo, rotina de casa, controle de tarefas, entre outros.' },
  { p: 'Como funciona o lembrete?', r: 'Você escolhe o item do planner, o dia e o horário — no momento certo chega um e-mail avisando o que precisa ser feito.' },
  { p: 'Dá pra editar um modelo pronto?', r: 'Sim. Todo modelo pronto pode ser adaptado depois — adicionar, remover ou renomear qualquer item.' },
]

export default function PlannerAgendaLanding() {
  const maxValor = Math.max(...CATEGORIAS_CHART.map((c) => c.valor))

  return (
    <div
      style={{
        // @ts-expect-error custom properties
        '--pa-primary': '#2A6F63',
        '--pa-primary-dark': '#194A42',
        '--pa-accent': '#E2A33B',
        '--pa-bg': '#FAF8F3',
        '--pa-ink': '#1C2321',
      }}
      className="min-h-screen bg-[var(--pa-bg)] text-[var(--pa-ink)]"
    >
      {/* nav */}
      <header className="border-b border-black/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">
            Planeja<span className="text-[var(--pa-primary)]">.</span>
          </span>
          <nav className="hidden items-center gap-8 text-sm text-[var(--pa-ink)]/70 sm:flex">
            <a href="#como-funciona">Como funciona</a>
            <a href="#preco">Preço</a>
            <a href="#duvidas">Dúvidas</a>
          </nav>
          <a
            href="#preco"
            className="rounded-full bg-[var(--pa-primary)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--pa-primary-dark)]"
          >
            Assinar agora
          </a>
        </div>
      </header>

      {/* hero — texto + foto real */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-16 sm:grid-cols-2 sm:pt-24">
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Sua agenda do seu jeito.
            <br />
            Ou pronta em 2 minutos.
          </h1>
          <p className="mt-5 max-w-md text-lg text-[var(--pa-ink)]/70">
            Não é uma lista estática de tarefas. É um sistema que organiza seus planners e te
            avisa por e-mail exatamente quando algo precisa ser feito.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3">
            <a
              href="#preco"
              className="rounded-full bg-[var(--pa-primary)] px-8 py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-[var(--pa-primary-dark)]"
            >
              Começar por R$ 9,90/mês
            </a>
            <span className="text-xs text-[var(--pa-ink)]/50">Cancele quando quiser. Sem taxa de adesão.</span>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMG}
            alt="Pessoa organizando as tarefas da semana em um planner"
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>
      </section>

      {/* dois caminhos */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--pa-primary)]/15 bg-white p-7">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--pa-primary)]/10 text-[var(--pa-primary)]">
              ⌘
            </div>
            <h3 className="text-lg font-medium">Comece com um modelo pronto</h3>
            <p className="mt-2 text-sm text-[var(--pa-ink)]/65">
              Planners e agendas pré-definidos, prontos pra usar no mesmo dia — sem precisar
              montar nada do zero.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--pa-accent)]/25 bg-white p-7">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--pa-accent)]/15 text-[var(--pa-accent)]">
              ✎
            </div>
            <h3 className="text-lg font-medium">Monte do seu jeito</h3>
            <p className="mt-2 text-sm text-[var(--pa-ink)]/65">
              Crie seções, itens e lembretes exatamente como você precisa — sua rotina, do seu
              jeito.
            </p>
          </div>
        </div>
      </section>

      {/* mockup do sistema: painel + e-mail de lembrete */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="text-2xl font-semibold">Não é papel. É um sistema.</h2>
          <p className="mt-2 text-[var(--pa-ink)]/65">
            Você organiza uma vez — a plataforma cuida de te lembrar no momento certo, direto no
            seu e-mail.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-5">
          {/* mockup do painel (browser frame) */}
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm sm:col-span-3">
            <div className="flex items-center gap-1.5 border-b border-black/5 bg-black/[0.03] px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
              <span className="ml-3 rounded bg-white px-2 py-0.5 text-[11px] text-[var(--pa-ink)]/40">
                meuplaner.app/painel
              </span>
            </div>
            <div className="p-5">
              <p className="mb-3 text-sm font-medium text-[var(--pa-ink)]/80">Planner — Rotina da semana</p>
              <div className="space-y-2.5">
                {[
                  { t: 'Pagar boleto da faculdade', done: true, cat: 'Estudos' },
                  { t: 'Levar carro pra revisão', done: true, cat: 'Casa' },
                  { t: 'Enviar relatório mensal', done: false, cat: 'Trabalho' },
                  { t: 'Consulta com dentista — 15h', done: false, cat: 'Saúde' },
                ].map((item) => (
                  <div
                    key={item.t}
                    className="flex items-center justify-between rounded-lg border border-black/5 bg-[var(--pa-bg)] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={
                          'flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ' +
                          (item.done
                            ? 'border-[var(--pa-primary)] bg-[var(--pa-primary)] text-white'
                            : 'border-[var(--pa-ink)]/25 text-transparent')
                        }
                      >
                        ✓
                      </span>
                      <span className={'text-sm ' + (item.done ? 'text-[var(--pa-ink)]/40 line-through' : 'text-[var(--pa-ink)]/85')}>
                        {item.t}
                      </span>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-[var(--pa-ink)]/50">
                      {item.cat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* mockup do e-mail de lembrete */}
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm sm:col-span-2">
            <div className="border-b border-black/5 bg-black/[0.03] px-4 py-2.5 text-[11px] text-[var(--pa-ink)]/45">
              Caixa de entrada
            </div>
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--pa-primary)]/10 text-xs font-medium text-[var(--pa-primary)]">
                  P
                </span>
                <div>
                  <p className="text-[12px] font-medium text-[var(--pa-ink)]/85">Planeja</p>
                  <p className="text-[10px] text-[var(--pa-ink)]/40">agora</p>
                </div>
              </div>
              <p className="text-sm font-medium text-[var(--pa-ink)]/85">🔔 Lembrete: Consulta com dentista</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--pa-ink)]/60">
                Hoje às 15h. Esse item está no seu planner &quot;Saúde&quot; — marque como feito
                quando concluir.
              </p>
              <div className="mt-3 rounded-full bg-[var(--pa-primary)]/10 px-3 py-1.5 text-center text-[12px] font-medium text-[var(--pa-primary)]">
                Ver no painel
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* inclusos */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-semibold">O que vem incluso</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUSOS.map((item) => (
              <div key={item.titulo}>
                <p className="font-medium">{item.titulo}</p>
                <p className="mt-1.5 text-sm text-[var(--pa-ink)]/60">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* gráfico ilustrativo */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-black/10 bg-white p-7 sm:p-9">
          <p className="text-sm font-medium text-[var(--pa-ink)]/80">
            Exemplo: itens organizados por categoria numa semana
          </p>
          <div className="mt-6 flex items-end gap-6">
            {CATEGORIAS_CHART.map((c) => (
              <div key={c.nome} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-[var(--pa-ink)]/70">{c.valor}</span>
                <div
                  className="w-full rounded-t-md bg-[var(--pa-primary)]/80"
                  style={{ height: `${(c.valor / maxValor) * 120}px` }}
                />
                <span className="text-[11px] text-[var(--pa-ink)]/50">{c.nome}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* preço */}
      <section id="preco" className="mx-auto max-w-5xl px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold">Um plano só, sem letra miúda</h2>
        <div className="mx-auto mt-8 max-w-xs rounded-2xl border-2 border-[var(--pa-primary)] bg-white p-8">
          <span className="inline-block rounded-full bg-[var(--pa-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--pa-primary)]">
            Plano único
          </span>
          <p className="mt-4 text-4xl font-semibold">
            R$ 9,90<span className="text-base font-normal text-[var(--pa-ink)]/50">/mês</span>
          </p>
          <p className="mt-2 text-sm text-[var(--pa-ink)]/60">Todos os modelos + ferramenta de criação + lembretes por e-mail</p>
          <a
            href="#"
            className="mt-6 block rounded-full bg-[var(--pa-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--pa-primary-dark)]"
          >
            Assinar agora
          </a>
        </div>
      </section>

      {/* faq */}
      <section id="duvidas" className="bg-white py-16">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-center text-2xl font-semibold">Dúvidas frequentes</h2>
          <div className="mt-8 space-y-6">
            {FAQ.map((f) => (
              <div key={f.p} className="border-b border-black/5 pb-6">
                <p className="font-medium">{f.p}</p>
                <p className="mt-1.5 text-sm text-[var(--pa-ink)]/65">{f.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 py-8 text-center text-xs text-[var(--pa-ink)]/45">
        Página de teste — Projeto Especial em desenvolvimento, ainda sem cadastro/pagamento ativo.
      </footer>
    </div>
  )
}
