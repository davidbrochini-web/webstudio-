const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

const siteItems = [
  'Site profissional criado para o seu negócio',
  'Feed do Instagram atualizado automaticamente',
  'Hospedagem + SSL incluso',
  'Domínio .com.br no 1º ano grátis',
  'Suporte via WhatsApp',
  'Google Analytics configurado',
  '1 ajuste de layout por mês incluso',
]

const moduleItems = [
  'CRM — clientes e oportunidades',
  'Controle de estoque',
  'Contas a pagar',
  'Contas a receber',
  'Fluxo de caixa',
  'Pedidos internos (em breve)',
]

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm text-[var(--slate)]">
      <span className="w-[18px] h-[18px] flex-shrink-0 mt-0.5 rounded-full bg-green-50 text-[var(--green)] text-[10px] font-bold flex items-center justify-center">✓</span>
      {children}
    </li>
  )
}

export default function Pricing() {
  return (
    <section id="preco" className="py-20 px-6 bg-[var(--off)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--purple)] mb-3">Preço</p>
          <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--dark)] mb-3">
            Simples e sem surpresa
          </h2>
          <p className="text-base text-[var(--muted)]">
            Pague só o que usar. Sem contrato de fidelidade, cancela quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Site + Instagram */}
          <div className="grad-border rounded-2xl bg-white p-8 shadow-2xl shadow-purple-100">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--purple)] mb-2">Site + Instagram</p>
            <div className="font-display font-extrabold text-5xl text-[var(--dark)] leading-none mb-1">
              R$&thinsp;149<span className="text-xl font-medium text-[var(--muted)]">/mês</span>
            </div>
            <p className="text-xs text-[var(--muted)] mb-6">Presença online profissional e automática.</p>
            <ul className="space-y-3 mb-7">
              {siteItems.map(i => <CheckItem key={i}>{i}</CheckItem>)}
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl grad-bg text-white font-semibold text-base hover:opacity-90 transition-all hover:-translate-y-px">
              Quero meu site →
            </a>
            <p className="text-xs text-[var(--muted)] text-center mt-3">Site no ar em até 48h após o contrato.</p>
          </div>

          {/* Módulos internos */}
          <div className="bg-white border border-[var(--border)] rounded-2xl p-8">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--muted)] mb-2">Módulos internos</p>
            <div className="font-display font-extrabold text-5xl text-[var(--dark)] leading-none mb-1">
              R$&thinsp;99<span className="text-xl font-medium text-[var(--muted)]">/módulo/mês</span>
            </div>
            <p className="text-xs text-[var(--muted)] mb-6">Contrate só o que a operação precisa.</p>
            <ul className="space-y-3 mb-7">
              {moduleItems.map(i => <CheckItem key={i}>{i}</CheckItem>)}
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[var(--dark)] text-white font-semibold text-base hover:opacity-90 transition-all hover:-translate-y-px">
              Falar sobre módulos →
            </a>
            <p className="text-xs text-[var(--muted)] text-center mt-3">Pode combinar site + módulos no mesmo plano.</p>
          </div>

        </div>
      </div>
    </section>
  )
}
