// ─────────────────────────────────────────────────────────────
// Configuração de cada template de nicho.
// Um único engine de template consome esses dados — refinamos
// nicho por nicho mexendo aqui, sem duplicar componentes.
// ─────────────────────────────────────────────────────────────

export interface NicheService {
  icon: string
  title: string
  desc: string
  /** Preço opcional — só o template Urbano usa hoje. Sites de tenant
   *  real guardam isso no banco; vitrines de demo caem no fallback
   *  fixo do componente quando ausente. */
  preco?: string
}

export interface NichePost {
  emoji: string
  bg: string
  likes: number
  caption: string
}

export interface NicheTestimonial {
  name: string
  text: string
}

export interface NicheFaqItem {
  pergunta: string
  resposta: string
}

export interface NichePlano {
  nome: string
  preco: string
  /** ex: "/mês", "/sessão" — vazio quando é preço único (ex: avaliação grátis) */
  periodo?: string
  destaque?: boolean
  features: string[]
}

export interface NicheBlogPost {
  slug: string
  titulo: string
  resumo: string
}

export interface NicheConfig {
  slug: string
  /** Nome exibido no menu de templates da home */
  label: string
  /** Nome fictício do negócio no preview */
  businessName: string
  tagline: string
  heroTitle: string
  heroSub: string
  ctaLabel: string
  /** Arquétipo de PÁGINA INTEIRA — cada um tem estrutura, ordem de seções e componentes próprios */
  pageLayout: 'clinico' | 'editorial' | 'portfolio' | 'urbano' | 'performance' | 'zen' | 'acolhedor'
  /** Gradiente tailwind (from-X to-Y) usado como identidade do nicho */
  accent: string
  /** Cor sólida para botões/detalhes (classe tailwind de bg) */
  solidBg: string
  services: NicheService[]
  posts: NichePost[]
  testimonials: NicheTestimonial[]
  /** Handle fictício do Instagram no preview */
  igHandle: string
  /** IDs de fotos curadas no Unsplash (licença livre) — 2 a 3 por nicho, usadas em rotação */
  photoIds: string[]
  /** Número de WhatsApp do PRÓPRIO negócio (dígitos, ex: 5511999999999).
   *  Sites de tenant real preenchem isso; vitrines estáticas de demo
   *  deixam undefined e caem no número da agência (env var). */
  whatsapp?: string
  /** Números em destaque (ex: "+15 anos de experiência"). Opcional —
   *  só o template clínico usa por enquanto; sites reais guardam isso
   *  no banco (site_stats), vitrines de demo usam o fallback fixo. */
  stats?: { valor: string; rotulo: string }[]
  /** Título da seção de CTA final (ex: "Agende sua avaliação"). Cada
   *  template tem seu fallback padrão quando não preenchido. */
  ctaHeading?: string
  /** Subtexto abaixo do título do CTA (ex: "Atendimento rápido pelo
   *  WhatsApp — sem compromisso."). Opcional — nem todo template tem. */
  ctaSubtext?: string
  /** Frase de banner no meio da página (usado pelo Zen, outros podem
   *  adotar). Opcional. */
  bannerText?: string
  /** Perguntas frequentes — seção obrigatória em todos os templates. */
  faq: NicheFaqItem[]
  /** Tabela de preços/planos exibida no site — SEM sistema de
   *  assinatura/cobrança real (isso é módulo futuro, pendência
   *  registrada separadamente). Puramente informativo. */
  planos: NichePlano[]
  /** Posts de blog (SEO). Autoria pelo painel do cliente é o próximo
   *  passo — por ora o conteúdo nasce igual ao demo do nicho. */
  blogPosts: NicheBlogPost[]
  /** Preenchido só quando o config vem de um site real no banco
   *  (getSiteConfigBySlug) — usado pelo formulário de contato pra
   *  saber onde gravar o lead. Undefined nas vitrines estáticas de
   *  /modelos/[nicho] (aí o formulário mostra estado de preview). */
  siteId?: string
}

export const niches: NicheConfig[] = [
  {
    slug: 'clinica-odontologica',
    label: 'Clínica odontológica',
    businessName: 'Sorrir Odonto',
    tagline: 'Clínica odontológica',
    heroTitle: 'Seu sorriso merece cuidado de verdade.',
    heroSub: 'Tratamentos modernos, equipe especializada e atendimento humanizado. Agende sua avaliação sem compromisso.',
    ctaLabel: 'Agendar avaliação',
    pageLayout: 'clinico',
    accent: 'from-[#4facfe] to-[#00f2fe]',
    solidBg: 'bg-[#0ea5e9]',
    igHandle: '@sorrirodonto',
    photoIds: ['1704455306251-b4634215d98f', '1728342057953-94bfad8f0e7e'],
    services: [
      { icon: '🦷', title: 'Limpeza e prevenção', desc: 'Profilaxia completa e orientação para manter a saúde bucal em dia.' },
      { icon: '✨', title: 'Clareamento', desc: 'Clareamento profissional com resultado visível já nas primeiras sessões.' },
      { icon: '🔧', title: 'Ortodontia', desc: 'Aparelhos fixos e alinhadores invisíveis com acompanhamento mensal.' },
      { icon: '💎', title: 'Implantes', desc: 'Reposição de dentes com tecnologia e planejamento digital.' },
    ],
    posts: [
      { emoji: '😁', bg: 'from-[#4facfe] to-[#00f2fe]', likes: 89, caption: 'Antes e depois do clareamento' },
      { emoji: '🦷', bg: 'from-[#a1c4fd] to-[#c2e9fb]', likes: 64, caption: 'Dica: troque a escova a cada 3 meses' },
      { emoji: '👩‍⚕️', bg: 'from-[#84fab0] to-[#8fd3f4]', likes: 112, caption: 'Conheça nossa equipe' },
      { emoji: '✨', bg: 'from-[#4facfe] to-[#00f2fe]', likes: 95, caption: 'Sorriso novo, confiança nova' },
      { emoji: '📅', bg: 'from-[#a1c4fd] to-[#c2e9fb]', likes: 47, caption: 'Agenda aberta para novembro' },
      { emoji: '🪥', bg: 'from-[#84fab0] to-[#8fd3f4]', likes: 58, caption: 'Como escovar do jeito certo' },
      { emoji: '🦷', bg: 'from-[#4facfe] to-[#00f2fe]', likes: 73, caption: 'Facetas de porcelana' },
      { emoji: '👶', bg: 'from-[#a1c4fd] to-[#c2e9fb]', likes: 81, caption: 'Odontopediatria com carinho' },
    ],
    testimonials: [
      { name: 'Mariana S.', text: 'Atendimento impecável do início ao fim. Perdi o medo de dentista aqui.' },
      { name: 'Carlos E.', text: 'Fiz implante e o resultado superou a expectativa. Equipe muito atenciosa.' },
    ],
    faq: [
      { pergunta: 'Vocês atendem convênio?', resposta: 'Atendemos particular e alguns convênios selecionados — confirme o seu direto pelo WhatsApp antes da consulta.' },
      { pergunta: 'Quanto tempo dura uma consulta de avaliação?', resposta: 'Em média 40 minutos, incluindo exame clínico e explicação do plano de tratamento.' },
      { pergunta: 'Clareamento dói?', resposta: 'É um procedimento indolor pra maioria dos pacientes; sensibilidade leve e temporária pode ocorrer e é controlada na hora.' },
    ],
    planos: [
      { nome: 'Avaliação', preco: 'Grátis', destaque: false, features: ['Exame clínico completo', 'Plano de tratamento personalizado', 'Orçamento sem compromisso'] },
      { nome: 'Manutenção', preco: 'R$ 180', periodo: '/semestre', destaque: true, features: ['Limpeza e profilaxia', 'Avaliação de rotina', 'Orientação de higiene'] },
      { nome: 'Tratamento completo', preco: 'Sob consulta', destaque: false, features: ['Ortodontia ou implantes', 'Parcelamento facilitado', 'Acompanhamento mensal'] },
    ],
    blogPosts: [
      { slug: 'clareamento-dental-mitos-verdades', titulo: 'Clareamento dental: mitos e verdades', resumo: 'Separamos o que é fato e o que é exagero sobre clareamento — da dor à durabilidade do resultado.' },
      { slug: 'quando-procurar-um-ortodontista', titulo: 'Quando procurar um ortodontista', resumo: 'Sinais de que pode ser hora de avaliar um aparelho ou alinhador, em qualquer idade.' },
      { slug: 'cuidados-pos-implante', titulo: 'Cuidados essenciais pós-implante', resumo: 'O que fazer (e evitar) nos primeiros dias após colocar um implante dentário.' },
    ],
  },
  {
    slug: 'escola-curso',
    label: 'Escola / Curso',
    businessName: 'Instituto Aprender',
    tagline: 'Educação que transforma',
    heroTitle: 'Matrículas abertas para 2026.',
    heroSub: 'Ensino de qualidade, turmas reduzidas e acompanhamento individual. Venha conhecer nossa estrutura.',
    ctaLabel: 'Garantir matrícula',
    pageLayout: 'acolhedor',
    accent: 'from-[#3b82f6] to-[#1d4ed8]',
    solidBg: 'bg-[#2563eb]',
    igHandle: '@institutoaprender',
    photoIds: ['1519406596751-0a3ccc4937fe', '1757193714692-44cdf07a5377'],
    services: [
      { icon: '📚', title: 'Ensino fundamental', desc: 'Base sólida com metodologia ativa e projetos interdisciplinares.' },
      { icon: '🎓', title: 'Ensino médio', desc: 'Preparação para o ENEM e vestibulares com simulados mensais.' },
      { icon: '💻', title: 'Cursos técnicos', desc: 'Formação profissional com estágio garantido nas parcerias.' },
      { icon: '🌎', title: 'Idiomas', desc: 'Inglês e espanhol com professores nativos e certificação.' },
    ],
    posts: [
      { emoji: '🎓', bg: 'from-[#5ee7df] to-[#b490ca]', likes: 210, caption: 'Formatura da turma 2025!' },
      { emoji: '🔬', bg: 'from-[#d299c2] to-[#fef9d7]', likes: 134, caption: 'Feira de ciências' },
      { emoji: '⚽', bg: 'from-[#89f7fe] to-[#66a6ff]', likes: 98, caption: 'Campeonato interclasses' },
      { emoji: '📖', bg: 'from-[#5ee7df] to-[#b490ca]', likes: 76, caption: 'Clube de leitura' },
      { emoji: '🎭', bg: 'from-[#d299c2] to-[#fef9d7]', likes: 156, caption: 'Festival de teatro' },
      { emoji: '🏆', bg: 'from-[#89f7fe] to-[#66a6ff]', likes: 189, caption: '1º lugar na olimpíada de matemática' },
      { emoji: '🎨', bg: 'from-[#5ee7df] to-[#b490ca]', likes: 92, caption: 'Feira de artes' },
      { emoji: '🚌', bg: 'from-[#d299c2] to-[#fef9d7]', likes: 68, caption: 'Passeio pedagógico' },
    ],
    testimonials: [
      { name: 'Patrícia L.', text: 'Meus dois filhos estudam aqui. A evolução deles é visível a cada semestre.' },
      { name: 'Roberto M.', text: 'Escola que realmente acompanha o aluno. Comunicação com os pais é excelente.' },
    ],
    faq: [
      { pergunta: 'Como funciona o processo de matrícula?', resposta: 'Preencha o formulário no site ou fale pelo WhatsApp — nossa secretaria retorna com a documentação necessária e agenda uma visita.' },
      { pergunta: 'As turmas têm quantos alunos?', resposta: 'Trabalhamos com turmas reduzidas para garantir acompanhamento individual de cada estudante.' },
      { pergunta: 'Vocês oferecem bolsas de estudo?', resposta: 'Sim, temos um programa de bolsas por mérito e critério socioeconômico — consulte a secretaria.' },
    ],
    planos: [
      { nome: 'Ensino Fundamental', preco: 'R$ 890', periodo: '/mês', destaque: false, features: ['Material didático incluso', 'Atividades extracurriculares', 'Comunicação direta com os pais'] },
      { nome: 'Ensino Médio', preco: 'R$ 1.190', periodo: '/mês', destaque: true, features: ['Preparação para o ENEM', 'Simulados mensais', 'Orientação vocacional'] },
      { nome: 'Curso Técnico', preco: 'R$ 650', periodo: '/mês', destaque: false, features: ['Estágio garantido em parceiras', 'Certificação reconhecida', 'Aulas práticas'] },
    ],
    blogPosts: [
      { slug: 'como-escolher-a-escola-ideal', titulo: 'Como escolher a escola ideal pro seu filho', resumo: 'Pontos essenciais para avaliar antes de fechar a matrícula em uma nova instituição.' },
      { slug: 'rotina-de-estudos-em-casa', titulo: 'Como montar uma rotina de estudos em casa', resumo: 'Dicas práticas para ajudar seu filho a organizar o tempo entre escola e atividades.' },
      { slug: 'preparacao-para-o-enem', titulo: 'Preparação para o ENEM: por onde começar', resumo: 'Um guia direto para estudantes do ensino médio que estão iniciando a preparação.' },
    ],
  },
  {
    slug: 'estudio-fotografia',
    label: 'Estúdio de fotografia',
    businessName: 'Lente Viva',
    tagline: 'Estúdio de fotografia',
    heroTitle: 'Momentos que merecem ficar para sempre.',
    heroSub: 'Ensaios, eventos e retratos com direção profissional. Seu portfólio se atualiza aqui a cada trabalho novo.',
    ctaLabel: 'Pedir orçamento',
    pageLayout: 'portfolio',
    accent: 'from-[#f6d365] to-[#fda085]',
    solidBg: 'bg-[#f59e0b]',
    igHandle: '@lenteviva',
    photoIds: ['1502920917128-1aa500764cbd', '1516961642265-531546e84af2', '1520549233664-03f65c1d1327'],
    services: [
      { icon: '👰', title: 'Casamentos', desc: 'Cobertura completa do making of à festa, com segundo fotógrafo.' },
      { icon: '👶', title: 'Ensaios de família', desc: 'Gestante, newborn e acompanhamento — em estúdio ou externo.' },
      { icon: '🏢', title: 'Corporativo', desc: 'Retratos profissionais e cobertura de eventos empresariais.' },
      { icon: '🎨', title: 'Ensaios criativos', desc: 'Projetos autorais com direção de arte e cenografia.' },
    ],
    posts: [
      { emoji: '📸', bg: 'from-[#f6d365] to-[#fda085]', likes: 245, caption: 'Ensaio golden hour' },
      { emoji: '👰', bg: 'from-[#fbc2eb] to-[#a6c1ee]', likes: 312, caption: 'Casamento Ana & Pedro' },
      { emoji: '👶', bg: 'from-[#fddb92] to-[#d1fdff]', likes: 198, caption: 'Newborn do Theo' },
      { emoji: '🌅', bg: 'from-[#f6d365] to-[#fda085]', likes: 167, caption: 'Ensaio na praia' },
      { emoji: '💍', bg: 'from-[#fbc2eb] to-[#a6c1ee]', likes: 223, caption: 'Pré-wedding no campo' },
      { emoji: '🎂', bg: 'from-[#fddb92] to-[#d1fdff]', likes: 145, caption: 'Smash the cake da Alice' },
      { emoji: '📷', bg: 'from-[#f6d365] to-[#fda085]', likes: 178, caption: 'Bastidores do estúdio' },
      { emoji: '🌸', bg: 'from-[#fbc2eb] to-[#a6c1ee]', likes: 134, caption: 'Ensaio de 15 anos' },
    ],
    testimonials: [
      { name: 'Ana & Pedro', text: 'As fotos do nosso casamento ficaram um sonho. Cada momento capturado com sensibilidade.' },
      { name: 'Juliana T.', text: 'Ensaio newborn perfeito. Paciência e carinho com o bebê do início ao fim.' },
    ],
    faq: [
      { pergunta: 'Quanto tempo leva para receber as fotos editadas?', resposta: 'O prazo padrão é de 15 dias úteis; ensaios com entrega expressa podem ser combinados à parte.' },
      { pergunta: 'Posso escolher quantas fotos editadas quero?', resposta: 'Sim, cada pacote inclui uma quantidade de fotos em alta edição — fotos extras podem ser adicionadas.' },
      { pergunta: 'Vocês atendem fora do estúdio?', resposta: 'Sim, fazemos ensaios externos e cobertura de eventos em qualquer localização combinada.' },
    ],
    planos: [
      { nome: 'Ensaio Essencial', preco: 'R$ 450', periodo: '/sessão', destaque: false, features: ['1h de sessão', '15 fotos editadas', 'Galeria online'] },
      { nome: 'Ensaio Completo', preco: 'R$ 890', periodo: '/sessão', destaque: true, features: ['2h de sessão', '40 fotos editadas', 'Making of incluso'] },
      { nome: 'Cobertura de Evento', preco: 'Sob consulta', destaque: false, features: ['Cobertura completa do evento', 'Segundo fotógrafo opcional', 'Entrega expressa disponível'] },
    ],
    blogPosts: [
      { slug: 'como-escolher-fotografo-casamento', titulo: 'Como escolher o fotógrafo do seu casamento', resumo: 'O que perguntar antes de fechar contrato, do estilo de edição ao prazo de entrega.' },
      { slug: 'dicas-ensaio-gestante', titulo: '5 dicas para um ensaio de gestante incrível', resumo: 'Roupas, horário e clima para tirar o melhor proveito do seu ensaio.' },
      { slug: 'bastidores-making-of', titulo: 'Bastidores: como fazemos um making of', resumo: 'Um olhar por trás das câmeras no dia de um dos nossos ensaios recentes.' },
    ],
  },
  {
    slug: 'advocacia',
    label: 'Escritório / Advocacia',
    businessName: 'Ferraz & Associados',
    tagline: 'Advocacia especializada',
    heroTitle: 'Seus direitos defendidos com seriedade.',
    heroSub: 'Atendimento personalizado e transparente. Envie sua dúvida e receba uma análise inicial do seu caso.',
    ctaLabel: 'Consultar meu caso',
    pageLayout: 'editorial',
    accent: 'from-[#b8860b] to-[#7c5c10]',
    solidBg: 'bg-[#1e293b]',
    igHandle: '@ferrazassociados',
    photoIds: ['1521587760476-6c12a4b040da', '1603058817990-2b9a9abbce86', '1505664063603-28e48ca204eb'],
    services: [
      { icon: '⚖️', title: 'Direito trabalhista', desc: 'Rescisões, verbas não pagas, assédio e acordos trabalhistas.' },
      { icon: '🏠', title: 'Direito imobiliário', desc: 'Contratos, usucapião, regularização e disputas de imóveis.' },
      { icon: '👨‍👩‍👧', title: 'Direito de família', desc: 'Divórcio, pensão, guarda e inventários com discrição.' },
      { icon: '📄', title: 'Direito do consumidor', desc: 'Cobranças indevidas, negativação e problemas com empresas.' },
    ],
    posts: [
      { emoji: '⚖️', bg: 'from-[#667eea] to-[#764ba2]', likes: 87, caption: 'Você sabe seus direitos na rescisão?' },
      { emoji: '📋', bg: 'from-[#30cfd0] to-[#330867]', likes: 64, caption: 'Checklist antes de assinar contrato' },
      { emoji: '🏠', bg: 'from-[#a8c0ff] to-[#3f2b96]', likes: 92, caption: 'Comprou imóvel na planta? Atenção' },
      { emoji: '💼', bg: 'from-[#667eea] to-[#764ba2]', likes: 58, caption: 'Direitos do consumidor em 2025' },
      { emoji: '📱', bg: 'from-[#30cfd0] to-[#330867]', likes: 71, caption: 'Golpe do PIX: como se proteger' },
      { emoji: '✍️', bg: 'from-[#a8c0ff] to-[#3f2b96]', likes: 49, caption: 'Quando vale a pena fazer acordo' },
      { emoji: '📖', bg: 'from-[#667eea] to-[#764ba2]', likes: 55, caption: 'Entenda a nova lei do inquilinato' },
      { emoji: '🤝', bg: 'from-[#30cfd0] to-[#330867]', likes: 63, caption: 'Mediação: uma alternativa ao processo' },
    ],
    testimonials: [
      { name: 'Marcos V.', text: 'Resolveram minha causa trabalhista com agilidade. Comunicação clara em cada etapa.' },
      { name: 'Helena R.', text: 'Profissionais sérios. Me explicaram tudo sem juridiquês e ganhamos a causa.' },
    ],
    faq: [
      { pergunta: 'A primeira consulta é gratuita?', resposta: 'Oferecemos uma análise inicial do seu caso sem custo, para entender a situação antes de propor os próximos passos.' },
      { pergunta: 'Quanto tempo demora um processo trabalhista?', resposta: 'Varia por complexidade e tribunal, mas explicamos o prazo estimado já na primeira reunião.' },
      { pergunta: 'Vocês atendem outras cidades além da sede?', resposta: 'Sim, atuamos em todo o Brasil, inclusive em Tribunais Superiores, com atendimento remoto quando necessário.' },
    ],
    planos: [
      { nome: 'Consulta Inicial', preco: 'Grátis', destaque: false, features: ['Análise preliminar do caso', 'Orientação sobre os próximos passos', 'Sem compromisso'] },
      { nome: 'Acompanhamento Processual', preco: 'Sob consulta', destaque: true, features: ['Atuação em todas as instâncias', 'Relatórios periódicos do andamento', 'Atendimento direto com o advogado'] },
      { nome: 'Consultoria Empresarial', preco: 'Sob consulta', periodo: '/mês', destaque: false, features: ['Suporte jurídico contínuo', 'Revisão de contratos', 'Prevenção de litígios'] },
    ],
    blogPosts: [
      { slug: 'direitos-na-rescisao-trabalhista', titulo: 'Seus direitos na rescisão trabalhista', resumo: 'O que verificar no acerto de contas antes de assinar qualquer documento.' },
      { slug: 'o-que-verificar-antes-de-comprar-imovel', titulo: 'O que verificar antes de comprar um imóvel', resumo: 'Documentação e cuidados essenciais para evitar dor de cabeça na compra.' },
      { slug: 'divorcio-consensual-passo-a-passo', titulo: 'Divórcio consensual: passo a passo', resumo: 'Como funciona o processo quando as duas partes estão de acordo.' },
    ],
  },
  {
    slug: 'barbearia-salao',
    label: 'Barbearia / Salão',
    businessName: 'Navalha Club',
    tagline: 'Barbearia clássica',
    heroTitle: 'Mais que um corte. Uma experiência.',
    heroSub: 'Cortes clássicos e modernos, barba alinhada e aquele papo bom. Agende seu horário pelo WhatsApp.',
    ctaLabel: 'Agendar horário',
    pageLayout: 'urbano',
    accent: 'from-[#dc2626] to-[#7f1d1d]',
    solidBg: 'bg-[#b91c1c]',
    igHandle: '@navalhaclub',
    photoIds: ['1503951914875-452162b0f3f1', '1585747860715-2ba37e788b70', '1621645582931-d1d3e6564943'],
    services: [
      { icon: '💈', title: 'Corte', desc: 'Degradê, social, navalhado — do clássico ao contemporâneo.' },
      { icon: '🧔', title: 'Barba', desc: 'Alinhamento com navalha, toalha quente e produtos premium.' },
      { icon: '✂️', title: 'Combo corte + barba', desc: 'O pacote completo com preço especial.' },
      { icon: '👑', title: 'Dia do noivo', desc: 'Preparação completa para o grande dia, com direito a espumante.' },
    ],
    posts: [
      { emoji: '💈', bg: 'from-[#f093fb] to-[#f5576c]', likes: 156, caption: 'Degradê na régua' },
      { emoji: '🧔', bg: 'from-[#ff9a9e] to-[#fecfef]', likes: 134, caption: 'Barba desenhada' },
      { emoji: '✂️', bg: 'from-[#ffecd2] to-[#fcb69f]', likes: 98, caption: 'Transformação do dia' },
      { emoji: '🔥', bg: 'from-[#f093fb] to-[#f5576c]', likes: 187, caption: 'Corte + barba + sobrancelha' },
      { emoji: '🎩', bg: 'from-[#ff9a9e] to-[#fecfef]', likes: 112, caption: 'Estilo não tem idade' },
      { emoji: '🍺', bg: 'from-[#ffecd2] to-[#fcb69f]', likes: 143, caption: 'Sexta no club' },
      { emoji: '💇', bg: 'from-[#f093fb] to-[#f5576c]', likes: 121, caption: 'Corte navalhado' },
      { emoji: '🪒', bg: 'from-[#ff9a9e] to-[#fecfef]', likes: 96, caption: 'Barba na navalha, do jeito certo' },
    ],
    testimonials: [
      { name: 'Diego F.', text: 'Melhor barbearia da região. Corte impecável e ambiente top demais.' },
      { name: 'Lucas A.', text: 'Virei cliente fixo. Atendimento pontual e o degradê sempre perfeito.' },
    ],
    faq: [
      { pergunta: 'Preciso agendar horário ou pode chegar direto?', resposta: 'Recomendamos agendar pelo WhatsApp para garantir seu horário, mas também atendemos por ordem de chegada quando há vaga.' },
      { pergunta: 'Quanto tempo dura o combo corte + barba?', resposta: 'Em média 50 minutos, com todo o cuidado no acabamento.' },
      { pergunta: 'Vocês têm produtos à venda?', resposta: 'Sim, trabalhamos com uma linha própria de produtos para manutenção em casa.' },
    ],
    planos: [
      { nome: 'Corte', preco: 'R$ 45', destaque: false, features: ['Corte clássico ou moderno', 'Acabamento na navalha', 'Toalha quente'] },
      { nome: 'Combo Completo', preco: 'R$ 75', destaque: true, features: ['Corte + barba', 'Sobrancelha inclusa', 'Bebida de cortesia'] },
      { nome: 'Clube Navalha', preco: 'R$ 149', periodo: '/mês', destaque: false, features: ['4 cortes no mês', 'Prioridade no agendamento (exemplo)', 'Desconto em produtos'] },
    ],
    blogPosts: [
      { slug: 'como-manter-a-barba-em-dia', titulo: 'Como manter a barba em dia entre as visitas', resumo: 'Cuidados simples pra barba ficar alinhada até o próximo agendamento.' },
      { slug: 'tendencias-de-corte-masculino', titulo: 'Tendências de corte masculino para 2026', resumo: 'Os estilos que mais têm saído da cadeira aqui no estúdio.' },
      { slug: 'produtos-essenciais-pos-corte', titulo: '3 produtos essenciais para o pós-corte', resumo: 'O que usar em casa pra prolongar o resultado do corte novo.' },
    ],
  },
  {
    slug: 'academia-personal',
    label: 'Academia / Personal',
    businessName: 'Forja Fit',
    tagline: 'Academia & Personal Training',
    heroTitle: 'Seu melhor shape começa aqui.',
    heroSub: 'Treinos personalizados, acompanhamento de verdade e uma comunidade que motiva. Primeira aula grátis.',
    ctaLabel: 'Aula experimental grátis',
    pageLayout: 'performance',
    accent: 'from-[#43e97b] to-[#38f9d7]',
    solidBg: 'bg-[#10b981]',
    igHandle: '@forjafit',
    photoIds: ['1689877020200-403d8542d95d', '1571902943202-507ec2618e8f', '1637430308606-86576d8fef3c'],
    services: [
      { icon: '🏋️', title: 'Musculação', desc: 'Equipamentos novos e ficha de treino atualizada mensalmente.' },
      { icon: '🥊', title: 'Aulas coletivas', desc: 'Funcional, muay thai, spinning e ritmos — inclusos no plano.' },
      { icon: '🎯', title: 'Personal trainer', desc: 'Acompanhamento individual com avaliação física periódica.' },
      { icon: '🥗', title: 'Nutrição', desc: 'Parceria com nutricionista esportiva para fechar o resultado.' },
    ],
    posts: [
      { emoji: '🏋️', bg: 'from-[#43e97b] to-[#38f9d7]', likes: 133, caption: 'Treino de pernas hoje' },
      { emoji: '💪', bg: 'from-[#0ba360] to-[#3cba92]', likes: 178, caption: 'Evolução do aluno Rafael: -12kg' },
      { emoji: '🥊', bg: 'from-[#92fe9d] to-[#00c9ff]', likes: 145, caption: 'Aula de muay thai lotada' },
      { emoji: '🔥', bg: 'from-[#43e97b] to-[#38f9d7]', likes: 156, caption: 'Desafio 30 dias começou!' },
      { emoji: '🏃', bg: 'from-[#0ba360] to-[#3cba92]', likes: 98, caption: 'Grupo de corrida aos sábados' },
      { emoji: '🏆', bg: 'from-[#92fe9d] to-[#00c9ff]', likes: 201, caption: 'Nossos atletas no pódio' },
      { emoji: '💦', bg: 'from-[#43e97b] to-[#38f9d7]', likes: 87, caption: 'Bora suar a camisa' },
      { emoji: '🧘', bg: 'from-[#0ba360] to-[#3cba92]', likes: 76, caption: 'Alongamento pós-treino' },
    ],
    testimonials: [
      { name: 'Rafael N.', text: 'Perdi 12kg em 5 meses com o acompanhamento do personal. Mudou minha vida.' },
      { name: 'Camila B.', text: 'Ambiente acolhedor, nada daquela pressão de academia. Aulas coletivas são demais.' },
    ],
    faq: [
      { pergunta: 'Como funciona o acesso à academia?', resposta: 'A área de musculação tem acesso livre no horário de funcionamento. Aulas coletivas têm vagas limitadas — chegue com alguns minutos de antecedência.' },
      { pergunta: 'Tem taxa de matrícula?', resposta: 'Não cobramos taxa de matrícula nos planos mensais e trimestrais.' },
      { pergunta: 'Posso congelar meu plano?', resposta: 'Sim, é possível congelar por até 30 dias por motivo de viagem ou saúde — fale com a recepção.' },
    ],
    planos: [
      { nome: 'Mensal', preco: 'R$ 129', periodo: '/mês', destaque: false, features: ['Acesso à musculação', 'Aulas coletivas inclusas', 'Avaliação física inicial'] },
      { nome: 'Trimestral', preco: 'R$ 349', periodo: '/trimestre', destaque: true, features: ['Tudo do plano mensal', '1 sessão de personal por mês', 'Acompanhamento nutricional'] },
      { nome: 'Personal Exclusivo', preco: 'R$ 89', periodo: '/sessão', destaque: false, features: ['Treino 100% individual', 'Ficha personalizada', 'Agendamento direto com o personal (exemplo)'] },
    ],
    blogPosts: [
      { slug: 'como-manter-a-motivacao-na-academia', titulo: 'Como manter a motivação nos primeiros meses', resumo: 'Estratégias práticas para não desistir do treino nas primeiras semanas.' },
      { slug: 'musculacao-ou-funcional', titulo: 'Musculação ou funcional: qual escolher?', resumo: 'As diferenças entre as modalidades e como decidir o que combina com seu objetivo.' },
      { slug: 'alimentacao-antes-e-depois-do-treino', titulo: 'O que comer antes e depois do treino', resumo: 'Orientações gerais de nutrição esportiva para otimizar seus resultados.' },
    ],
  },
  {
    slug: 'clinica-massagem',
    label: 'Clínica de massagem',
    businessName: 'Essência Spa',
    tagline: 'Massoterapia & Bem-estar',
    heroTitle: 'Pausa para cuidar de você.',
    heroSub: 'Massagens terapêuticas e relaxantes com profissionais certificados. Agende sua sessão e desligue do estresse.',
    ctaLabel: 'Agendar sessão',
    pageLayout: 'zen',
    accent: 'from-[#a8edea] to-[#fed6e3]',
    solidBg: 'bg-[#14b8a6]',
    igHandle: '@essenciaspa',
    photoIds: ['1770573319185-049b29ab0ca9', '1595871151608-bc7abd1caca3', '1772616748507-9fb951a14d75'],
    services: [
      { icon: '💆', title: 'Massagem relaxante', desc: 'Alívio do estresse e tensões do dia a dia com óleos essenciais.' },
      { icon: '🧘', title: 'Massagem terapêutica', desc: 'Tratamento de dores musculares, lombalgia e má postura.' },
      { icon: '🔥', title: 'Pedras quentes', desc: 'Relaxamento profundo com termoterapia e aromaterapia.' },
      { icon: '🤰', title: 'Massagem para gestantes', desc: 'Técnica segura e especializada para cada fase da gestação.' },
    ],
    posts: [
      { emoji: '💆', bg: 'from-[#a8edea] to-[#fed6e3]', likes: 94, caption: 'Sessão de pedras quentes' },
      { emoji: '🌿', bg: 'from-[#d4fc79] to-[#96e6a1]', likes: 76, caption: 'Aromaterapia: qual óleo escolher?' },
      { emoji: '🧘', bg: 'from-[#e0c3fc] to-[#8ec5fc]', likes: 88, caption: 'Alongamentos para fazer em casa' },
      { emoji: '✨', bg: 'from-[#a8edea] to-[#fed6e3]', likes: 102, caption: 'Ambiente preparado para você' },
      { emoji: '🤰', bg: 'from-[#d4fc79] to-[#96e6a1]', likes: 67, caption: 'Massagem gestante: benefícios' },
      { emoji: '🕯️', bg: 'from-[#e0c3fc] to-[#8ec5fc]', likes: 81, caption: 'Autocuidado não é luxo' },
      { emoji: '🌺', bg: 'from-[#a8edea] to-[#fed6e3]', likes: 59, caption: 'Sala de relaxamento' },
      { emoji: '💧', bg: 'from-[#d4fc79] to-[#96e6a1]', likes: 71, caption: 'Drenagem linfática' },
    ],
    testimonials: [
      { name: 'Fernanda C.', text: 'Saí de lá renovada. Ambiente impecável e profissional super atenciosa.' },
      { name: 'André P.', text: 'Trato minha lombalgia aqui há 6 meses. A dor praticamente sumiu.' },
    ],
    faq: [
      { pergunta: 'Preciso de indicação médica para fazer massagem terapêutica?', resposta: 'Não é obrigatório, mas se você tem alguma condição de saúde específica, recomendamos avisar antes da sessão.' },
      { pergunta: 'Quanto tempo dura cada sessão?', resposta: 'As sessões variam entre 50 e 90 minutos, dependendo da técnica escolhida.' },
      { pergunta: 'Vocês atendem gestantes?', resposta: 'Sim, temos uma técnica específica e segura para cada fase da gestação.' },
    ],
    planos: [
      { nome: 'Sessão Avulsa', preco: 'R$ 160', periodo: '/sessão', destaque: false, features: ['50 minutos de sessão', 'Óleos essenciais inclusos', 'Ambiente climatizado'] },
      { nome: 'Pacote 4 Sessões', preco: 'R$ 580', periodo: '(economize 9%)', destaque: true, features: ['4 sessões avulsas', 'Validade de 60 dias', '10% de desconto em produtos'] },
      { nome: 'Dia de Spa', preco: 'R$ 380', periodo: '/sessão', destaque: false, features: ['Massagem + esfoliação', 'Aromaterapia completa', '2h de experiência'] },
    ],
    blogPosts: [
      { slug: 'beneficios-da-massagem-terapeutica', titulo: 'Os benefícios da massagem terapêutica', resumo: 'Como a técnica ajuda no alívio de dores crônicas e tensões do dia a dia.' },
      { slug: 'aromaterapia-qual-oleo-escolher', titulo: 'Aromaterapia: qual óleo escolher para cada momento', resumo: 'Um guia simples sobre os aromas mais usados em nossas sessões.' },
      { slug: 'autocuidado-nao-e-luxo', titulo: 'Autocuidado não é luxo, é necessidade', resumo: 'Por que reservar um tempo pra si mesmo faz diferença na sua saúde mental.' },
    ],
  },
  {
    slug: 'psicologa',
    label: 'Psicóloga',
    businessName: 'Espaço Escuta',
    tagline: 'Psicologia clínica',
    heroTitle: 'Um espaço seguro para você se ouvir.',
    heroSub: 'Atendimento individualizado, com escuta acolhedora e sigilo absoluto. Presencial ou online, no seu ritmo.',
    ctaLabel: 'Agendar conversa inicial',
    pageLayout: 'acolhedor',
    accent: 'from-[#a78bfa] to-[#818cf8]',
    solidBg: 'bg-[#7c6ff0]',
    igHandle: '@espacoescuta',
    photoIds: ['1533090161767-e6ffed986c88', '1573497491208-6b1acb260507', '1502672260266-1c1ef2d93688', '1541533260371-b8fc9b596d84'],
    services: [
      { icon: '🧠', title: 'Terapia individual', desc: 'Acompanhamento contínuo pra ansiedade, autoestima e autoconhecimento.' },
      { icon: '💞', title: 'Terapia de casal', desc: 'Espaço neutro pra melhorar comunicação e resolver conflitos.' },
      { icon: '💻', title: 'Atendimento online', desc: 'Mesma qualidade da consulta presencial, de onde você estiver.' },
      { icon: '🧭', title: 'Orientação vocacional', desc: 'Apoio pra decisões de carreira e transições profissionais.' },
    ],
    posts: [
      { emoji: '🧠', bg: 'from-[#a78bfa] to-[#818cf8]', likes: 112, caption: 'Ansiedade tem tratamento' },
      { emoji: '📖', bg: 'from-[#fbc2eb] to-[#a6c1ee]', likes: 84, caption: 'Indicação de leitura da semana' },
      { emoji: '🌱', bg: 'from-[#d4fc79] to-[#96e6a1]', likes: 96, caption: 'Pequenos passos contam' },
      { emoji: '💬', bg: 'from-[#a78bfa] to-[#818cf8]', likes: 73, caption: 'Terapia não é só pra crise' },
      { emoji: '🧘', bg: 'from-[#fbc2eb] to-[#a6c1ee]', likes: 68, caption: 'Técnica de respiração pra ansiedade' },
      { emoji: '💞', bg: 'from-[#d4fc79] to-[#96e6a1]', likes: 91, caption: 'Comunicação não-violenta no dia a dia' },
      { emoji: '✨', bg: 'from-[#a78bfa] to-[#818cf8]', likes: 79, caption: 'Autoestima se constrói aos poucos' },
      { emoji: '🗓️', bg: 'from-[#fbc2eb] to-[#a6c1ee]', likes: 54, caption: 'Agenda aberta pra dezembro' },
    ],
    testimonials: [
      { name: 'Juliana R.', text: 'Encontrei um espaço onde realmente me sinto ouvida, sem julgamento.' },
      { name: 'Marcelo T.', text: 'A terapia de casal salvou nosso relacionamento. Muito grata pela condução.' },
    ],
    faq: [
      { pergunta: 'Como funciona a primeira sessão?', resposta: 'É um momento de acolhimento, onde você conta o que te trouxe até aqui e alinhamos juntos como será o acompanhamento.' },
      { pergunta: 'O atendimento online tem a mesma qualidade do presencial?', resposta: 'Sim, a abordagem é a mesma — a única diferença é o formato da conversa.' },
      { pergunta: 'Existe sigilo garantido?', resposta: 'Sim, sigilo profissional absoluto é a base de qualquer atendimento psicológico.' },
    ],
    planos: [
      { nome: 'Sessão Avulsa', preco: 'R$ 180', periodo: '/sessão', destaque: false, features: ['50 minutos de atendimento', 'Presencial ou online', 'Agendamento flexível'] },
      { nome: 'Acompanhamento Mensal', preco: 'R$ 650', periodo: '/mês', destaque: true, features: ['4 sessões semanais', 'Prioridade de horário', 'Material de apoio entre sessões'] },
      { nome: 'Terapia de Casal', preco: 'R$ 240', periodo: '/sessão', destaque: false, features: ['80 minutos de sessão', 'Espaço neutro para os dois', 'Foco em comunicação'] },
    ],
    blogPosts: [
      { slug: 'como-saber-se-preciso-de-terapia', titulo: 'Como saber se é hora de procurar terapia', resumo: 'Sinais que indicam que conversar com um profissional pode ajudar.' },
      { slug: 'ansiedade-primeiros-passos', titulo: 'Ansiedade: primeiros passos para lidar com ela', resumo: 'Orientações gerais sobre como reconhecer e começar a cuidar da ansiedade.' },
      { slug: 'terapia-online-funciona', titulo: 'Terapia online realmente funciona?', resumo: 'O que muda (e o que não muda) no atendimento psicológico à distância.' },
    ],
  },
  {
    slug: 'terapeuta-holistica',
    label: 'Terapeuta Holística',
    businessName: 'Ãtma Terapias',
    tagline: 'Terapias integrativas',
    heroTitle: 'Cuidado que integra corpo, mente e energia.',
    heroSub: 'Reiki, terapia floral e constelação familiar num espaço pensado pro seu equilíbrio.',
    ctaLabel: 'Agendar sessão',
    pageLayout: 'portfolio',
    accent: 'from-[#84fab0] to-[#8fd3f4]',
    solidBg: 'bg-[#34d399]',
    igHandle: '@atmaterapias',
    photoIds: ['1506126613408-eca07ce68773', '1528715471579-d1bcf0ba5e83', '1444312645910-ffa973656eba', '1522075782449-e45a34f1ddfb'],
    services: [
      { icon: '✋', title: 'Reiki', desc: 'Equilíbrio energético e alívio de tensões através da imposição de mãos.' },
      { icon: '🌸', title: 'Terapia floral', desc: 'Essências que atuam nos padrões emocionais, sem contraindicação.' },
      { icon: '🌳', title: 'Constelação familiar', desc: 'Compreensão de padrões que se repetem entre gerações.' },
      { icon: '🧘', title: 'Meditação guiada', desc: 'Sessões individuais ou em grupo pra ansiedade e insônia.' },
    ],
    posts: [
      { emoji: '✋', bg: 'from-[#84fab0] to-[#8fd3f4]', likes: 87, caption: 'Sessão de reiki de hoje' },
      { emoji: '🌸', bg: 'from-[#fbc2eb] to-[#a6c1ee]', likes: 65, caption: 'Qual essência floral combina com você?' },
      { emoji: '🕯️', bg: 'from-[#d4fc79] to-[#96e6a1]', likes: 72, caption: 'Ritual de lua nova' },
      { emoji: '🌳', bg: 'from-[#84fab0] to-[#8fd3f4]', likes: 58, caption: 'O que é constelação familiar' },
      { emoji: '💎', bg: 'from-[#fbc2eb] to-[#a6c1ee]', likes: 94, caption: 'Cristais pro ambiente de trabalho' },
      { emoji: '🧘', bg: 'from-[#d4fc79] to-[#96e6a1]', likes: 61, caption: 'Meditação guiada de 10 minutos' },
      { emoji: '🌙', bg: 'from-[#84fab0] to-[#8fd3f4]', likes: 69, caption: 'Diário de gratidão: por onde começar' },
      { emoji: '✨', bg: 'from-[#fbc2eb] to-[#a6c1ee]', likes: 77, caption: 'Bastidores do espaço terapêutico' },
    ],
    testimonials: [
      { name: 'Beatriz N.', text: 'As sessões de reiki mudaram minha relação com a ansiedade. Recomendo muito.' },
      { name: 'Ricardo A.', text: 'A constelação familiar me trouxe clareza sobre coisas que eu carregava há anos.' },
    ],
    faq: [
      { pergunta: 'Preciso acreditar em algo específico para fazer as sessões?', resposta: 'Não — recebemos qualquer pessoa aberta a se conhecer melhor, sem exigir nenhuma crença específica.' },
      { pergunta: 'Quantas sessões de reiki são recomendadas?', resposta: 'Varia por pessoa; muitos sentem benefício já na primeira, mas recomendamos um ciclo de 3 a 4 sessões para resultados mais profundos.' },
      { pergunta: 'O que levar para a constelação familiar?', resposta: 'Só a disposição de olhar pra sua história com cuidado — o resto conduzimos no espaço.' },
    ],
    planos: [
      { nome: 'Sessão Avulsa', preco: 'R$ 170', periodo: '/sessão', destaque: false, features: ['Reiki ou terapia floral', '60 minutos de sessão', 'Ambiente preparado'] },
      { nome: 'Ciclo de Reencontro', preco: 'R$ 590', periodo: '/pacote de 4', destaque: true, features: ['4 sessões de reiki', 'Acompanhamento entre sessões', 'Prioridade no agendamento'] },
      { nome: 'Constelação em Grupo', preco: 'R$ 220', periodo: '/encontro', destaque: false, features: ['Encontro mensal em grupo', 'Espaço de escuta coletiva', 'Sem necessidade de experiência prévia'] },
    ],
    blogPosts: [
      { slug: 'o-que-e-reiki-e-como-funciona', titulo: 'O que é reiki e como funciona uma sessão', resumo: 'Entenda o que esperar do início ao fim do seu primeiro atendimento.' },
      { slug: 'terapia-floral-para-ansiedade', titulo: 'Terapia floral: um caminho suave para a ansiedade', resumo: 'Como as essências florais atuam nos padrões emocionais do dia a dia.' },
      { slug: 'o-que-e-constelacao-familiar', titulo: 'O que é constelação familiar', resumo: 'Uma introdução a essa abordagem que revela padrões repetidos entre gerações.' },
    ],
  },
]

export function getNiche(slug: string): NicheConfig | undefined {
  return niches.find(n => n.slug === slug)
}
