const modules = [
  {
    icon: '👥',
    title: 'CRM',
    desc: 'Cadastro de clientes, histórico de contatos, pipeline de oportunidades e follow-up organizado.',
    tag: null,
  },
  {
    icon: '📦',
    title: 'Controle de Estoque',
    desc: 'Entrada, saída e saldo de produtos em tempo real. Alertas de estoque mínimo e relatório de movimentação.',
    tag: null,
  },
  {
    icon: '📤',
    title: 'Contas a Pagar',
    desc: 'Lançamento de despesas, vencimentos, status de pagamento e visão de compromissos por período.',
    tag: null,
  },
  {
    icon: '📥',
    title: 'Contas a Receber',
    desc: 'Controle de cobranças, inadimplência, baixa de pagamentos e projeção de recebimentos.',
    tag: null,
  },
  {
    icon: '💰',
    title: 'Fluxo de Caixa',
    desc: 'Visão consolidada de entradas e saídas. Saldo projetado por dia, semana e mês.',
    tag: null,
  },
  {
    icon: '📋',
    title: 'Pedidos Internos',
    desc: 'Requisições de compra, aprovações por alçada e rastreamento de pedidos com fornecedores.',
    tag: 'Em breve',
  },
]

export default function Modules() {
  return (
    <section id="modulos" className="py-20 px-6 bg-[var(--dark)]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--pink)] mb-3">
              Sistemas internos
            </p>
            <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-white mb-3">
              Módulos para quem tem negócio<br className="hidden sm:block" /> pra tocar.
            </h2>
            <p className="text-base text-white/40 leading-relaxed max-w-xl">
              Cada módulo funciona de forma independente — você contrata só o
              que precisa e adiciona o restante conforme a operação crescer.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
              <span className="font-display font-extrabold text-2xl grad-text">R$&thinsp;99</span>
              <span className="text-sm text-white/40">/módulo/mês</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {modules.map(({ icon, title, desc, tag }) => (
            <div
              key={title}
              className="bg-[var(--dark)] hover:bg-white/[0.04] transition-colors p-7 flex flex-col gap-3 relative"
            >
              {tag && (
                <span className="absolute top-5 right-5 text-[10px] font-bold text-[var(--purple)] bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              )}
              <span className="text-3xl">{icon}</span>
              <div>
                <h3 className="font-display font-bold text-base text-white mb-1.5">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-white/25 mt-8">
          Todos os módulos rodam na web — sem instalação, acessível de qualquer dispositivo.
        </p>
      </div>
    </section>
  )
}
