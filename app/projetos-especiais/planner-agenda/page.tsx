import type { Metadata } from 'next'

// ─────────────────────────────────────────────────────────────────
// Projeto Especial — Planner & Agenda (landing v1, sem backend ainda)
// Página 100% estática, sem leitura de banco — serve só pra validar
// a proposta de venda/copy antes de construir cadastro, pagamento e
// o sistema de criação de planners de verdade.
// Cores locais (--pa-*) seguem o mesmo padrão de escopo por projeto
// especial usado no dentista-joao/colegio-elite (--dj-*/--ce-*).
// ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Planeja — planners e agendas por assinatura',
  description:
    'Comece com um modelo pronto ou monte sua agenda do seu jeito, com lembretes automáticos por e-mail. A partir de R$ 9,90/mês.',
  robots: { index: false, follow: false },
}

const INCLUSOS = [
  { titulo: 'Lembretes automáticos por e-mail', texto: 'Você define o quê e quando — o resto é com a gente.' },
  { titulo: 'Vários planners na mesma conta', texto: 'Trabalho, estudos, casa — cada um com sua própria agenda.' },
  { titulo: 'Personalização total', texto: 'Adicione, remova e organize seções e itens do seu jeito.' },
  { titulo: 'Acesso de qualquer lugar', texto: 'Celular ou computador, sempre sincronizado.' },
]

const FAQ = [
  {
    p: 'Posso cancelar quando quiser?',
    r: 'Sim, sem fidelidade e sem taxa de cancelamento. Sua assinatura vale mês a mês.',
  },
  {
    p: 'Os modelos prontos servem pra quê?',
    r: 'Pra quem quer começar a organizar hoje sem montar nada do zero — cronogramas de estudo, rotina de casa, controle de tarefas, entre outros.',
  },
  {
    p: 'Dá pra editar um modelo pronto?',
    r: 'Sim. Todo modelo pronto pode ser adaptado depois — adicionar, remover ou renomear qualquer item.',
  },
]

export default function PlannerAgendaLanding() {
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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
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

      {/* hero */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Sua agenda do seu jeito.
          <br />
          Ou pronta em 2 minutos.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--pa-ink)]/70">
          Planners e cronogramas prontos pra usar, ou monte o seu do zero — com lembretes por
          e-mail no horário que você definir.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="#preco"
            className="rounded-full bg-[var(--pa-primary)] px-8 py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-[var(--pa-primary-dark)]"
          >
            Começar por R$ 9,90/mês
          </a>
          <span className="text-xs text-[var(--pa-ink)]/50">Cancele quando quiser. Sem taxa de adesão.</span>
        </div>
      </section>

      {/* dois caminhos */}
      <section id="como-funciona" className="mx-auto max-w-5xl px-6 pb-20">
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

      {/* inclusos */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
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

      {/* preço */}
      <section id="preco" className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold">Um plano só, sem letra miúda</h2>
        <div className="mx-auto mt-8 max-w-xs rounded-2xl border-2 border-[var(--pa-primary)] bg-white p-8">
          <span className="inline-block rounded-full bg-[var(--pa-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--pa-primary)]">
            Plano único
          </span>
          <p className="mt-4 text-4xl font-semibold">
            R$ 9,90<span className="text-base font-normal text-[var(--pa-ink)]/50">/mês</span>
          </p>
          <p className="mt-2 text-sm text-[var(--pa-ink)]/60">Todos os modelos + ferramenta de criação</p>
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
