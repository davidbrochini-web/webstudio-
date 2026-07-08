// ─────────────────────────────────────────────────────────────
// Configuração de cada template de nicho.
// Um único engine de template consome esses dados — refinamos
// nicho por nicho mexendo aqui, sem duplicar componentes.
// ─────────────────────────────────────────────────────────────

export interface NicheService {
  icon: string
  title: string
  desc: string
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
  },
]

export function getNiche(slug: string): NicheConfig | undefined {
  return niches.find(n => n.slug === slug)
}
