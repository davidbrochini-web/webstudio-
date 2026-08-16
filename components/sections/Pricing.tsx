const siteOnlyItems = [
  'Site profissional criado para o seu negócio',
  'Hospedagem + SSL incluso',
  'Domínio .com.br no 1º ano grátis',
  'Suporte via WhatsApp',
  'Google Analytics configurado',
  '1 ajuste de layout por mês incluso',
]

const siteInstagramItems = [
  'Site profissional criado para o seu negócio',
  'Posts do Instagram aparecem no site automaticamente — você continua postando como sempre',
  'Hospedagem + SSL incluso',
  'Domínio .com.br no 1º ano grátis',
  'Suporte via WhatsApp',
  'Google Analytics configurado',
  '1 ajuste de layout por mês incluso',
]

const moduleItems = [
  'CRM — gestão de leads',
  'Controle de estoque',
  'Contas a pagar',
  'Contas a receber',
  'Fluxo de caixa',
  'Pedidos internos (em breve)',
]

const adsItems = [
  'Google Ads — pesquisa, display e remarketing',
  'GPT Ads — anúncios dentro do ChatGPT (chegou agora no Brasil, quase ninguém faz ainda)',
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

function BotaoContato({ destaque = false }: { destaque?: boolean }) {
  return (
    <a href="#contato"
      className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-px ${
        destaque ? 'grad-bg text-white hover:opacity-90' : 'bg-[var(--dark)] text-white hover:opacity-90'
      }`}>
      📩 Entre em contato
    </a>
  )
}

export default function Pricing() {
  return (
    <section id="preco" className="py-20 px-6 bg-[var(--off)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-bold tracking-widest uppercase text-[var(--brand)] mb-3">Valores</p>
          <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--ink)] mb-3">
            Simples e sem surpresa
          </h2>
          <p className="text-base text-[var(--muted)]">
            Pague só o que usar. Sem contrato de fidelidade, cancela quando quiser.
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center mb-10 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl px-6 py-5">
          <p className="text-sm text-[var(--slate)] leading-relaxed">
            <span className="font-display font-bold text-[var(--ink)]">Em até 48 horas</span> após o contrato
            seu site já está no ar, com domínio, hospedagem e SSL configurados. Você escolhe o modelo mais
            parecido com seu negócio e a gente ajusta o conteúdo pra você.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">

          {/* Módulos internos — primeiro, é o mais em conta */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-8">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--muted)] mb-2">Módulos internos</p>
            <div className="font-display font-extrabold text-4xl text-[var(--ink)] leading-none mb-1">
              A partir de<br />R$&thinsp;39,90
            </div>
            <p className="text-xs text-[var(--muted)] mb-6">Por módulo/mês, de acordo com a complexidade.</p>
            <ul className="space-y-3 mb-7">
              {moduleItems.map(i => <CheckItem key={i}>{i}</CheckItem>)}
            </ul>
            <BotaoContato />
            <p className="text-xs text-[var(--muted)] text-center mt-3">Pode combinar site + módulos no mesmo plano.</p>
          </div>

          {/* Site (sem Instagram) */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-8">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--muted)] mb-2">Site</p>
            <div className="font-display font-extrabold text-4xl text-[var(--ink)] leading-none mb-1">
              R$&thinsp;299<span className="text-lg font-medium text-[var(--muted)]">/mês</span>
            </div>
            <p className="text-xs text-[var(--muted)] mb-6">Site pronto a partir de um dos nossos modelos.</p>
            <ul className="space-y-3 mb-7">
              {siteOnlyItems.map(i => <CheckItem key={i}>{i}</CheckItem>)}
            </ul>
            <BotaoContato />
          </div>

          {/* Site + Instagram — destaque */}
          <div className="grad-border rounded-2xl bg-[var(--card-bg)] p-8 shadow-2xl shadow-green-100">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--brand)] mb-2">Site + Instagram</p>
            <div className="font-display font-extrabold text-4xl text-[var(--ink)] leading-none mb-1">
              R$&thinsp;499<span className="text-lg font-medium text-[var(--muted)]">/mês</span>
            </div>
            <p className="text-xs text-[var(--muted)] mb-6">Site pronto a partir de um dos nossos modelos, com Instagram sincronizado.</p>
            <ul className="space-y-3 mb-7">
              {siteInstagramItems.map(i => <CheckItem key={i}>{i}</CheckItem>)}
            </ul>
            <BotaoContato destaque />
            <p className="text-xs text-[var(--muted)] text-center mt-3">
              Precisa de algo sob medida?{' '}
              <a href="#contato" className="text-[var(--brand)] font-semibold underline underline-offset-2">
                Fale sobre Projeto Especial
              </a>.
            </p>
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
            <BotaoContato />
            <p className="text-xs text-[var(--muted)] text-center mt-3">Google Ads e GPT Ads no mesmo pacote.</p>
          </div>

        </div>
      </div>
    </section>
  )
}
