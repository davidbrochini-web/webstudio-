import type { Metadata } from 'next'
import { IconTemplate, IconPencil, IconCheck, IconBell, IconShieldCheck } from '@/components/planner-agenda/icons'

// ─────────────────────────────────────────────────────────────────
// Projeto Especial — Planner & Agenda (landing v3, sem backend ainda)
// Página estática, sem leitura de banco. Sistema de design próprio
// (ver layout.tsx pra tipografia: Fraunces/Manrope/JetBrains Mono),
// com metáfora visual de "caderno/planner físico" ao longo da página
// (papel pautado, aba de data, encadernação em espiral no mockup) —
// ligado ao objeto real que o produto substitui, não decoração solta.
// ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Planeja — planners e agendas por assinatura',
  description:
    'Crie e organize seus planners, com lembretes automáticos por e-mail no dia e hora certos. A partir de R$ 9,90/mês.',
  robots: { index: false, follow: false },
}

const HERO_IMG = 'https://images.unsplash.com/photo-1718359471677-2ded0e10c559?w=1600&q=75&auto=format&fit=crop'

const DIFERENCIAIS = [
  { tab: 'A', titulo: 'Lembretes por e-mail', texto: 'Você escolhe o item, o dia e o horário. O e-mail chega sozinho, na hora certa — sem precisar lembrar de lembrar.' },
  { tab: 'B', titulo: 'Vários planners', texto: 'Trabalho, estudos, casa, saúde — cada área da sua vida com sua própria agenda, sem misturar tudo numa lista só.' },
  { tab: 'C', titulo: 'Personalização real', texto: 'Nada de modelo engessado. Adicione, renomeie e reorganize seções e itens do jeito que fizer sentido pra você.' },
  { tab: 'D', titulo: 'Onde você estiver', texto: 'Celular, tablet ou computador — o mesmo planner, sempre sincronizado e sempre à mão.' },
]

const CATEGORIAS_CHART = [
  { nome: 'Trabalho', valor: 9 },
  { nome: 'Estudos', valor: 6 },
  { nome: 'Casa', valor: 5 },
  { nome: 'Saúde', valor: 4 },
]

const GARANTIAS = [
  { titulo: 'Sem fidelidade', texto: 'Cancele quando quiser, direto no painel. Sem ligação, sem carta, sem pergunta.' },
  { titulo: 'Sem taxa escondida', texto: 'R$ 9,90/mês é o valor final. Nada de adesão, ativação ou taxa de saída.' },
  { titulo: 'Seus dados, sempre seus', texto: 'Exporte ou apague seu conteúdo quando quiser — a conta é sua, não nossa.' },
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
        '--pa-paper': '#F6F1E4',
        '--pa-ink': '#1E2A22',
        '--pa-pine': '#1C4B3B',
        '--pa-pine-light': '#2E6A54',
        '--pa-moss': '#7C9473',
        '--pa-highlighter': '#F0A63B',
        '--pa-line': '#DED2B8',
        fontFamily: 'var(--font-manrope), sans-serif',
      }}
      className="min-h-screen bg-[var(--pa-paper)] text-[var(--pa-ink)]"
    >
      {/* nav */}
      <header className="sticky top-0 z-20 border-b border-[var(--pa-line)] bg-[var(--pa-paper)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span style={{ fontFamily: 'var(--font-fraunces), serif' }} className="text-xl font-semibold tracking-tight">
            Planeja<span className="text-[var(--pa-highlighter)]">.</span>
          </span>
          <nav className="hidden items-center gap-8 text-sm text-[var(--pa-ink)]/70 sm:flex">
            <a href="#como-funciona" className="hover:text-[var(--pa-ink)]">Como funciona</a>
            <a href="#diferenciais" className="hover:text-[var(--pa-ink)]">Diferenciais</a>
            <a href="#sobre" className="hover:text-[var(--pa-ink)]">Sobre</a>
            <a href="#preco" className="hover:text-[var(--pa-ink)]">Preço</a>
            <a href="#contato" className="hover:text-[var(--pa-ink)]">Contato</a>
          </nav>
          <a
            href="#preco"
            className="rounded-full bg-[var(--pa-pine)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--pa-pine-light)]"
          >
            Assinar agora
          </a>
        </div>
      </header>

      {/* hero — banner cheio, papel pautado + foto + aba de data */}
      <section className="relative overflow-hidden border-b border-[var(--pa-line)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'repeating-linear-gradient(var(--pa-line) 0 1px, transparent 1px 34px)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:grid-cols-2 sm:py-28">
          <div>
            <span
              style={{ fontFamily: 'var(--font-pa-mono), monospace' }}
              className="inline-block rounded-sm border border-[var(--pa-pine)]/30 bg-white px-2.5 py-1 text-[11px] uppercase tracking-wider text-[var(--pa-pine)]"
            >
              Ter · 12 ago · 09:00
            </span>
            <h1
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
              className="mt-5 text-5xl font-semibold italic leading-[1.05] tracking-tight sm:text-6xl"
            >
              Sua agenda,
              <br />
              <span className="not-italic">do seu jeito.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--pa-ink)]/70">
              Não é uma lista estática de tarefas. É um sistema que organiza seus planners e te
              avisa por e-mail exatamente quando algo precisa ser feito.
            </p>
            <div className="mt-9 flex flex-col items-start gap-3">
              <a
                href="#preco"
                className="rounded-full bg-[var(--pa-highlighter)] px-8 py-3.5 text-base font-semibold text-[var(--pa-ink)] shadow-sm transition hover:brightness-95"
              >
                Começar por R$ 9,90/mês
              </a>
              <span className="text-xs text-[var(--pa-ink)]/50">Cancele quando quiser. Sem taxa de adesão.</span>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border-4 border-white shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMG}
                alt="Pessoa organizando as tarefas da semana em um planner"
                className="h-80 w-full object-cover sm:h-[26rem]"
              />
            </div>
            {/* aba de data, tipo post-it colado no canto do banner */}
            <div className="absolute -bottom-5 -left-5 rotate-[-4deg] rounded-lg bg-[var(--pa-highlighter)] px-4 py-3 shadow-lg">
              <p style={{ fontFamily: 'var(--font-pa-mono), monospace' }} className="text-[11px] font-medium text-[var(--pa-ink)]/70">
                lembrete
              </p>
              <p className="text-sm font-semibold text-[var(--pa-ink)]">Consulta às 15h</p>
            </div>
          </div>
        </div>
      </section>

      {/* dois caminhos */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-16">
        <p style={{ fontFamily: 'var(--font-pa-mono), monospace' }} className="text-xs uppercase tracking-wider text-[var(--pa-moss)]">
          Como começar
        </p>
        <h2 style={{ fontFamily: 'var(--font-fraunces), serif' }} className="mt-2 text-3xl font-semibold">
          Dois jeitos de organizar
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--pa-line)] bg-white p-8">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--pa-pine)]/10 text-[var(--pa-pine)]">
              <IconTemplate className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-medium">Comece com um modelo pronto</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--pa-ink)]/65">
              Planners e agendas pré-definidos, prontos pra usar no mesmo dia — sem precisar
              montar nada do zero.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--pa-line)] bg-white p-8">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--pa-highlighter)]/15 text-[#B87715]">
              <IconPencil className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-medium">Monte do seu jeito</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--pa-ink)]/65">
              Crie seções, itens e lembretes exatamente como você precisa — sua rotina, do seu
              jeito.
            </p>
          </div>
        </div>
      </section>

      {/* mockup do sistema: painel (com encadernação) + e-mail de lembrete */}
      <section className="border-y border-[var(--pa-line)] bg-white/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <h2 style={{ fontFamily: 'var(--font-fraunces), serif' }} className="text-3xl font-semibold">
              Não é papel. É um sistema.
            </h2>
            <p className="mt-2 text-[var(--pa-ink)]/65">
              Você organiza uma vez — a plataforma cuida de te lembrar no momento certo, direto no
              seu e-mail.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-5">
            {/* mockup do painel — com "espiral" na lateral, feito de verdade com o objeto planner */}
            <div className="flex overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm sm:col-span-3">
              <div className="flex w-7 flex-col items-center justify-evenly bg-[var(--pa-pine)]/5 py-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-[var(--pa-pine)]/25" />
                ))}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 border-b border-black/5 bg-black/[0.02] px-3 py-2">
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
                        className="flex items-center justify-between rounded-lg border border-black/5 bg-[var(--pa-paper)] px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={
                              'flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ' +
                              (item.done
                                ? 'border-[var(--pa-pine)] bg-[var(--pa-pine)] text-white'
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
            </div>

            {/* mockup do e-mail de lembrete */}
            <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm sm:col-span-2">
              <div className="border-b border-black/5 bg-black/[0.02] px-4 py-2.5 text-[11px] text-[var(--pa-ink)]/45">
                Caixa de entrada
              </div>
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--pa-pine)]/10 text-xs font-medium text-[var(--pa-pine)]">
                    P
                  </span>
                  <div>
                    <p className="text-[12px] font-medium text-[var(--pa-ink)]/85">Planeja</p>
                    <p className="text-[10px] text-[var(--pa-ink)]/40">agora</p>
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--pa-ink)]/85">
                  <IconBell className="h-3.5 w-3.5" /> Lembrete: Consulta com dentista
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--pa-ink)]/60">
                  Hoje às 15h. Esse item está no seu planner &quot;Saúde&quot; — marque como feito
                  quando concluir.
                </p>
                <div className="mt-3 rounded-full bg-[var(--pa-pine)]/10 px-3 py-1.5 text-center text-[12px] font-medium text-[var(--pa-pine)]">
                  Ver no painel
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* diferenciais — abas de caderno, não números */}
      <section id="diferenciais" className="mx-auto max-w-6xl px-6 py-16">
        <p style={{ fontFamily: 'var(--font-pa-mono), monospace' }} className="text-xs uppercase tracking-wider text-[var(--pa-moss)]">
          Diferenciais
        </p>
        <h2 style={{ fontFamily: 'var(--font-fraunces), serif' }} className="mt-2 text-3xl font-semibold">
          Feito pra ser usado de verdade
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DIFERENCIAIS.map((d) => (
            <div key={d.tab} className="relative rounded-xl border border-[var(--pa-line)] bg-white p-6 pt-8">
              <span
                style={{ fontFamily: 'var(--font-pa-mono), monospace' }}
                className="absolute -top-3 left-6 rounded-sm bg-[var(--pa-pine)] px-2 py-0.5 text-[11px] font-medium text-white"
              >
                {d.tab}
              </span>
              <p className="font-medium">{d.titulo}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--pa-ink)]/60">{d.texto}</p>
            </div>
          ))}
        </div>

        {/* gráfico ilustrativo */}
        <div className="mt-10 rounded-2xl border border-[var(--pa-line)] bg-white p-7 sm:p-9">
          <p className="text-sm font-medium text-[var(--pa-ink)]/80">
            Exemplo: itens organizados por categoria numa semana
          </p>
          <div className="mt-6 flex items-end gap-6">
            {CATEGORIAS_CHART.map((c) => (
              <div key={c.nome} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-[var(--pa-ink)]/70">{c.valor}</span>
                <div
                  className="w-full rounded-t-md bg-[var(--pa-pine)]"
                  style={{ height: `${(c.valor / maxValor) * 120}px` }}
                />
                <span className="text-[11px] text-[var(--pa-ink)]/50">{c.nome}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* sobre */}
      <section id="sobre" className="border-y border-[var(--pa-line)] bg-[var(--pa-pine)] py-16 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p style={{ fontFamily: 'var(--font-pa-mono), monospace' }} className="text-xs uppercase tracking-wider text-white/60">
            Sobre o Planeja
          </p>
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif' }} className="mt-2 text-3xl font-semibold italic">
            Organização não devia dar mais trabalho do que a bagunça
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/75">
            Criamos o Planeja porque a maioria das ferramentas de organização vira mais uma
            tarefa: baixar, configurar, lembrar de abrir. Aqui é o contrário — você organiza uma
            vez, e é a plataforma que te procura, no seu e-mail, no dia e hora certos.
          </p>
        </div>
      </section>

      {/* planos */}
      <section id="preco" className="mx-auto max-w-5xl px-6 py-20 text-center">
        <p style={{ fontFamily: 'var(--font-pa-mono), monospace' }} className="text-xs uppercase tracking-wider text-[var(--pa-moss)]">
          Plano
        </p>
        <h2 style={{ fontFamily: 'var(--font-fraunces), serif' }} className="mt-2 text-3xl font-semibold">
          Um plano só, sem letra miúda
        </h2>
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border-2 border-[var(--pa-pine)] bg-white p-8 text-left">
          <span className="inline-block rounded-full bg-[var(--pa-pine)]/10 px-3 py-1 text-xs font-medium text-[var(--pa-pine)]">
            Plano único
          </span>
          <p className="mt-4 text-4xl font-semibold">
            R$ 9,90<span className="text-base font-normal text-[var(--pa-ink)]/50">/mês</span>
          </p>
          <ul className="mt-5 space-y-2 text-sm text-[var(--pa-ink)]/70">
            <li className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 shrink-0 text-[var(--pa-pine)]" /> Modelos prontos + ferramenta de criação
            </li>
            <li className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 shrink-0 text-[var(--pa-pine)]" /> Lembretes automáticos por e-mail
            </li>
            <li className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 shrink-0 text-[var(--pa-pine)]" /> Planners ilimitados na mesma conta
            </li>
          </ul>
          <a
            href="#contato"
            className="mt-6 block rounded-full bg-[var(--pa-highlighter)] px-6 py-3 text-center text-sm font-semibold text-[var(--pa-ink)] transition hover:brightness-95"
          >
            Assinar agora
          </a>
        </div>
      </section>

      {/* garantia / não se arrependa */}
      <section className="border-y border-[var(--pa-line)] bg-white/60 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif' }} className="text-center text-3xl font-semibold">
            Sem risco pra você experimentar
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {GARANTIAS.map((g) => (
              <div key={g.titulo} className="text-center">
                <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--pa-pine)]/10 text-[var(--pa-pine)]">
                  <IconShieldCheck className="h-5 w-5" />
                </div>
                <p className="font-medium">{g.titulo}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--pa-ink)]/60">{g.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <h2 style={{ fontFamily: 'var(--font-fraunces), serif' }} className="text-center text-3xl font-semibold">
          Dúvidas frequentes
        </h2>
        <div className="mt-8 space-y-6">
          {FAQ.map((f) => (
            <div key={f.p} className="border-b border-[var(--pa-line)] pb-6">
              <p className="font-medium">{f.p}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--pa-ink)]/65">{f.r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* contato */}
      <section id="contato" className="bg-[var(--pa-pine)] py-16 text-white">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 style={{ fontFamily: 'var(--font-fraunces), serif' }} className="text-3xl font-semibold italic">
            Pronto pra organizar?
          </h2>
          <p className="mt-3 text-white/75">Comece hoje por R$ 9,90/mês — cancele quando quiser.</p>
          <a
            href="#preco"
            className="mt-6 inline-block rounded-full bg-[var(--pa-highlighter)] px-8 py-3.5 text-base font-semibold text-[var(--pa-ink)] transition hover:brightness-95"
          >
            Assinar agora
          </a>
          <p className="mt-8 text-sm text-white/50">
            Dúvidas? <span className="underline underline-offset-2">contato@planeja.com.br</span> (exemplo — e-mail real a definir)
          </p>
        </div>
      </section>

      <footer className="border-t border-[var(--pa-line)] py-8 text-center text-xs text-[var(--pa-ink)]/45">
        Página de teste — Projeto Especial em desenvolvimento, ainda sem cadastro/pagamento ativo.
      </footer>
    </div>
  )
}
