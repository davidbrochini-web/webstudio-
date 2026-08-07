export interface EscopoItem {
  titulo: string
  descricao: string
}

export interface TemplateProposta {
  tagline: string
  diagnosticoIntro: string
  escopo: EscopoItem[]
  categorias: string[] // badges na home mockup
}

const TEMPLATES: Record<string, TemplateProposta> = {
  'Gráfica / Personalizados': {
    tagline: 'Levando o trabalho de vocês para além do Instagram',
    diagnosticoIntro: 'quem procura gráfica rápida ou personalizados na região nem sempre encontra o perfil de vocês.',
    categorias: ['Impressão Rápida', 'Personalizados', 'Adesivos', 'Eventos'],
    escopo: [
      { titulo: 'Página inicial direta ao ponto', descricao: 'Os trabalhos mais fortes em destaque e um caminho rápido pro WhatsApp — sem o visitante precisar rolar muito pra decidir chamar.' },
      { titulo: 'Vitrine de serviços por categoria', descricao: 'Impressão rápida, personalizados, adesivos e materiais para eventos — cada um com sua própria seção.' },
      { titulo: 'Galeria de trabalhos', descricao: 'Espaço dedicado pra mostrar o que já foi entregue, com as fotos publicadas no Instagram entrando automaticamente.' },
      { titulo: 'Localização sempre visível', descricao: 'Endereço, mapa e horário de funcionamento numa seção fixa, fácil de achar em qualquer página.' },
      { titulo: 'Botão de WhatsApp fixo', descricao: 'Presente em todas as páginas — o caminho mais curto entre "gostei" e "pedido fechado".' },
      { titulo: 'Formulário simples de orçamento', descricao: 'Cliente descreve o que precisa (o quê, quantidade, prazo) e o pedido já chega pronto pra vocês responderem.' },
    ],
  },
  'Dentista': {
    tagline: 'Presença profissional além do consultório',
    diagnosticoIntro: 'quem procura dentista na região decide muito pela primeira impressão online — e o Instagram sozinho não passa a confiança de um site próprio.',
    categorias: ['Tratamentos', 'Equipe', 'Convênios', 'Agendamento'],
    escopo: [
      { titulo: 'Página inicial que passa confiança', descricao: 'Apresentação clara da clínica, especialidades e um caminho rápido pra marcar consulta.' },
      { titulo: 'Tratamentos explicados', descricao: 'Cada procedimento com sua própria página — o paciente entende o que esperar antes de ligar.' },
      { titulo: 'Equipe e credenciais', descricao: 'Fotos e formação dos dentistas — construir confiança antes da primeira visita.' },
      { titulo: 'Localização e horário sempre visíveis', descricao: 'Endereço, mapa e horário de atendimento numa seção fixa.' },
      { titulo: 'Botão de WhatsApp fixo', descricao: 'Presente em todas as páginas, pra agendar sem fricção.' },
      { titulo: 'Formulário de agendamento', descricao: 'Paciente descreve o que precisa e o pedido já chega pronto pra confirmação.' },
    ],
  },
  'Escola / Idiomas / Reforço': {
    tagline: 'Um site que ajuda a fechar matrícula',
    diagnosticoIntro: 'famílias pesquisando curso na região esperam encontrar informação clara sobre turmas, horários e valores antes de ligar.',
    categorias: ['Cursos', 'Turmas', 'Professores', 'Matrícula'],
    escopo: [
      { titulo: 'Página inicial acolhedora', descricao: 'Apresentação da escola, diferenciais e um caminho rápido pra saber mais sobre matrícula.' },
      { titulo: 'Cursos e turmas organizados', descricao: 'Cada curso com sua própria seção — nível, horário, faixa etária.' },
      { titulo: 'Professores e metodologia', descricao: 'Espaço pra apresentar quem ensina e como — constrói confiança com os pais.' },
      { titulo: 'Localização e horário sempre visíveis', descricao: 'Endereço, mapa e horário de funcionamento numa seção fixa.' },
      { titulo: 'Botão de WhatsApp fixo', descricao: 'Presente em todas as páginas, pra tirar dúvida rápido.' },
      { titulo: 'Formulário de interesse em matrícula', descricao: 'Interessado descreve o curso e a idade, e o contato já chega pronto pra vocês responderem.' },
    ],
  },
  'Curso Livre': {
    tagline: 'Do feed do Instagram pra um espaço só seu',
    diagnosticoIntro: 'quem descobre o trabalho de vocês no Instagram muitas vezes não encontra um jeito fácil de ver turmas e valores antes de decidir.',
    categorias: ['Aulas', 'Turmas', 'Galeria', 'Inscrição'],
    escopo: [
      { titulo: 'Página inicial com a cara do trabalho de vocês', descricao: 'Os melhores momentos em destaque e um caminho rápido pra se inscrever.' },
      { titulo: 'Aulas e turmas organizadas', descricao: 'Cada modalidade com sua própria seção — nível, horário, valor.' },
      { titulo: 'Galeria de trabalhos/alunos', descricao: 'Espaço dedicado pra mostrar o resultado, com fotos do Instagram entrando automaticamente.' },
      { titulo: 'Localização e horário sempre visíveis', descricao: 'Endereço, mapa e horário das turmas numa seção fixa.' },
      { titulo: 'Botão de WhatsApp fixo', descricao: 'Presente em todas as páginas, pra tirar dúvida sobre turma e valor.' },
      { titulo: 'Formulário de inscrição', descricao: 'Interessado descreve o que quer aprender, e o contato já chega pronto pra vocês responderem.' },
    ],
  },
}

const GENERICO: TemplateProposta = {
  tagline: 'Uma presença online que trabalha por vocês',
  diagnosticoIntro: 'quem procura o serviço de vocês na região nem sempre encontra um site próprio pra decidir com confiança.',
  categorias: ['Serviços', 'Sobre', 'Localização', 'Contato'],
  escopo: [
    { titulo: 'Página inicial direta ao ponto', descricao: 'Apresentação clara do negócio e um caminho rápido pro WhatsApp.' },
    { titulo: 'Vitrine de serviços', descricao: 'Cada serviço com sua própria seção, fácil de entender.' },
    { titulo: 'Galeria de trabalhos', descricao: 'Espaço pra mostrar o que já foi entregue, com fotos do Instagram entrando automaticamente.' },
    { titulo: 'Localização sempre visível', descricao: 'Endereço, mapa e horário de funcionamento numa seção fixa.' },
    { titulo: 'Botão de WhatsApp fixo', descricao: 'Presente em todas as páginas — o caminho mais curto até o pedido.' },
    { titulo: 'Formulário simples de contato', descricao: 'Cliente descreve o que precisa e o pedido já chega pronto pra vocês responderem.' },
  ],
}

export function getTemplateProposta(segmento: string | null): TemplateProposta {
  if (!segmento) return GENERICO
  return TEMPLATES[segmento] ?? GENERICO
}
