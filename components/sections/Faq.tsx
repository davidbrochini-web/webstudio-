const faqs = [
  {
    q: 'Preciso saber programar ou mexer em código?',
    a: 'Não. Depois que o site é publicado, você edita clicando direto em cima do que quer mudar — texto, foto, serviço — igual editar um documento. Sem painel complicado, sem termo técnico.',
  },
  {
    q: 'Quanto tempo demora até o site ficar pronto?',
    a: 'Em até 48 horas seu site já está pronto e no ar. A gente já deixa tudo configurado pra você: o link que os clientes vão acessar, o espaço onde o site fica guardado e funcionando, e o selo de segurança que aparece no navegador. Você só escolhe o modelo mais parecido com seu negócio e a gente ajusta o conteúdo pra você.',
  },
  {
    q: 'Consigo mudar o conteúdo sozinho depois?',
    a: 'Sim, a qualquer momento. Você terá acesso a um painel próprio e intuitivo para editar textos, fotos, serviços e depoimentos na hora, sem precisar chamar ninguém.',
  },
  {
    q: 'O site conecta mesmo com o Instagram?',
    a: 'Sim. Depois de autorizar o acesso uma única vez, tudo o que você postar no feed do Instagram aparece automaticamente no site.',
  },
  {
    q: 'E os sistemas internos, como funcionam?',
    a: 'São módulos avulsos que você ativa conforme precisa: cadastro de clientes e fornecedores, controle de funcionários, produtos e serviços, e mais módulos chegando (CRM, estoque, financeiro). Você só paga pelo que usa.',
  },
  {
    q: 'Tem contrato de fidelidade ou multa?',
    a: 'Não trabalhamos com fidelidade. Você usa enquanto fizer sentido pro seu negócio.',
  },
  {
    q: 'Meu site aparece no Google?',
    a: 'Sim, todo site que criamos já sai pronto do jeito que o Google gosta, pra facilitar aparecer nas buscas. Aparecer bem também depende do conteúdo e do tempo, mas a base técnica já vem pronta desde o primeiro dia.',
  },
  {
    q: 'Vocês também cuidam de anúncios, tipo Google Ads?',
    a: 'Sim. Configuramos e gerenciamos campanhas de Google Ads e também de ChatGPT Ads — o formato novo de anúncio dentro de conversas com IA, que quase nenhuma empresa no Brasil está usando ainda. Sem taxa fixa nem plano fechado: o investimento é orçado conforme o objetivo do seu negócio.',
  },
  {
    q: 'O que é o Google Meu Negócio e vocês configuram isso?',
    a: 'É o cadastro gratuito que faz sua empresa aparecer no mapa e na busca do Google quando alguém procura um negócio como o seu perto dali — endereço, horário, fotos, avaliações. A gente configura tudo isso pra você; é o primeiro passo pra ser encontrado por quem já está procurando.',
  },
]

export default function Faq() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <section id="faq" className="bg-[var(--off)] py-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--brand)] mb-3">
          Perguntas frequentes
        </p>
        <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--ink)] mb-4">
          Sem letra miúda, sem complicação.
        </h2>
        <p className="text-base text-[var(--muted)] leading-relaxed mb-12 max-w-xl">
          As dúvidas mais comuns de quem nunca teve site ou sistema antes.
        </p>

        <div className="flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group py-5">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                <span className="font-display font-bold text-base text-[var(--ink)]">{q}</span>
                <span className="text-xl text-[var(--muted)] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
              </summary>
              <p className="text-sm text-[var(--muted)] leading-relaxed mt-3 max-w-2xl">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
