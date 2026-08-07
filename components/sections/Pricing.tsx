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

const adsItems = [
  'Google Ads — pesquisa, display e remarketing',
  'GPT Ads — anúncios dentro do ChatGPT (novo no Brasil)',
  'Configuração e estruturação da conta',
  'Otimização contínua de campanhas',
  'Relatório mensal de performance',
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
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--brand)] mb-3">Preço</p>
          <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--ink)] mb-3">
            Simples e sem surpresa
          </h2>
          <p className="text-base text-[var(--muted)]">
            Pague só o que usar. Sem contrato de fidelidade, cancela quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">

          {/* Site + Instagram */}
          <div className="grad-border rounded-2xl bg-[var(--card-bg)] p-8 shadow-2xl shadow-green-100">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--brand)] mb-2">Site + Instagram</p>
            <div className="font-display font-extrabold text-4xl text-[var(--ink)] leading-none mb-1">
              Sob consulta
            </div>
            <p className="text-xs text-[var(--muted)] mb-6">Analisamos seu negócio e te passamos o valor certo.</p>
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
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-8">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--muted)] mb-2">Módulos internos</p>
            <div className="font-display font-extrabold text-4xl text-[var(--ink)] leading-none mb-1">
              R$&thinsp;39,90<span className="text-lg font-medium text-[var(--muted)]"> a R$&thinsp;99,90</span>
            </div>
            <p className="text-xs text-[var(--muted)] mb-6">Por módulo/mês, de acordo com a complexidade.</p>
            <ul className="space-y-3 mb-7">
              {moduleItems.map(i => <CheckItem key={i}>{i}</CheckItem>)}
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[var(--dark)] text-white font-semibold text-base hover:opacity-90 transition-all hover:-translate-y-px">
              Falar sobre módulos →
            </a>
            <p className="text-xs text-[var(--muted)] text-center mt-3">Pode combinar site + módulos no mesmo plano.</p>
          </div>

          {/* Gestão de Anúncios */}
          <div className="relative bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-8 overflow-hidden">
            <span className="absolute top-5 right-5 text-[10px] font-bold px-2.5 py-1 rounded-full text-white bg-[var(--brand)]">
              GPT Ads é novo
            </span>
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--muted)] mb-2">Gestão de Anúncios</p>
            <div className="font-display font-extrabold text-4xl text-[var(--ink)] leading-none mb-1">
              Sob orçamento
            </div>
            <p className="text-xs text-[var(--muted)] mb-6">% do investimento em mídia, definido conforme o negócio.</p>
            <ul className="space-y-3 mb-7">
              {adsItems.map(i => <CheckItem key={i}>{i}</CheckItem>)}
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[var(--dark)] text-white font-semibold text-base hover:opacity-90 transition-all hover:-translate-y-px">
              Falar sobre anúncios →
            </a>
            <p className="text-xs text-[var(--muted)] text-center mt-3">Google Ads e GPT Ads no mesmo pacote.</p>
          </div>

        </div>
      </div>
    </section>
  )
}
