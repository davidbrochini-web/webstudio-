/**
 * Conteúdo de SEO das páginas /modelos/[nicho] — cada nicho vira uma
 * landing page indexável mirando a busca "site para [nicho]", sem
 * perder a demo ao vivo (que continua sendo o diferencial da página).
 *
 * Regras seguidas aqui:
 * - Título/descrição/FAQ VARIAM entre nichos de propósito — 9 páginas
 *   com FAQ idêntico seria conteúdo duplicado, que o Google pune.
 * - Nenhuma promessa de prazo (decisão do David: sem falar de 48h/
 *   tempo de entrega em lugar nenhum).
 * - Instagram sempre descrito como "sincronizado todo dia, posts e
 *   reels" (nunca tempo real).
 * - Linguagem pra dono de negócio leigo, sem jargão técnico.
 */

export interface SeoNicho {
  /** <title> da página — mira a palavra-chave "site para [nicho]" */
  tituloSeo: string
  /** meta description — com proposta de valor e convite */
  descricaoSeo: string
  /** H1 visível na faixa acima da demo */
  h1: string
  /** 1-2 frases de contexto abaixo do H1, antes da demo ao vivo */
  intro: string
  /** FAQ específico do nicho (também vira JSON-LD FAQPage) */
  faq: { pergunta: string; resposta: string }[]
}

export const SEO_NICHOS: Record<string, SeoNicho> = {
  'clinica-odontologica': {
    tituloSeo: 'Site para dentista e clínica odontológica — modelo pronto | Omnidesign',
    descricaoSeo:
      'Site profissional para clínica odontológica a partir de R$299/mês, com hospedagem, domínio e manutenção inclusos. Veja o modelo funcionando ao vivo.',
    h1: 'Site para dentista e clínica odontológica',
    intro:
      'Um site profissional passa a confiança que o paciente precisa antes de marcar a primeira consulta. Este modelo abaixo está funcionando de verdade — navegue nele como se fosse um paciente.',
    faq: [
      {
        pergunta: 'Quanto custa um site para clínica odontológica?',
        resposta:
          'Na Omnidesign, o site profissional sai a partir de R$299 por mês, já com hospedagem, domínio no primeiro ano, certificado de segurança e manutenção inclusos. Com o Instagram sincronizado (posts e reels entrando no site todo dia), fica R$499 por mês. Sem taxa de criação separada.',
      },
      {
        pergunta: 'O site mostra os tratamentos e os casos da clínica?',
        resposta:
          'Sim — o modelo já vem com área de tratamentos em destaque e galeria de antes/depois. Se a clínica posta os casos no Instagram, eles entram no site sozinhos, sincronizados todo dia.',
      },
      {
        pergunta: 'Consigo atualizar o site sem depender de ninguém?',
        resposta:
          'Sim. Você recebe um painel próprio e intuitivo pra mudar textos, fotos e serviços na hora que quiser — sem custo por alteração e sem precisar chamar suporte.',
      },
    ],
  },
  'escola-curso': {
    tituloSeo: 'Site para escola e curso — modelo pronto com matrícula | Omnidesign',
    descricaoSeo:
      'Site profissional para escola ou curso com informações de matrícula, turmas e estrutura — mensalidade a partir de R$299 com tudo incluso. Veja funcionando.',
    h1: 'Site para escola e curso',
    intro:
      'Pais e alunos pesquisam no Google antes de visitar qualquer escola. Este modelo está no ar de verdade — explore como se fosse um pai procurando vaga.',
    faq: [
      {
        pergunta: 'O site pode divulgar matrículas abertas e eventos da escola?',
        resposta:
          'Sim — o modelo tem espaço pra período de matrícula, turmas e eventos. E se a escola divulga o dia a dia no Instagram, esses posts e reels aparecem no site também, sincronizados diariamente.',
      },
      {
        pergunta: 'Quanto custa um site para escola ou curso?',
        resposta:
          'A partir de R$299 por mês na Omnidesign — valor que já inclui hospedagem, domínio no primeiro ano, certificado de segurança e manutenção. A versão com Instagram sincronizado custa R$499 por mês.',
      },
      {
        pergunta: 'A secretaria consegue mudar informações sozinha?',
        resposta:
          'Consegue. O painel de edição é simples de usar — troca de textos, fotos, horários e avisos sem conhecimento técnico e sem custo adicional por mudança.',
      },
    ],
  },
  'estudio-fotografia': {
    tituloSeo: 'Site para fotógrafo — portfólio com Instagram integrado | Omnidesign',
    descricaoSeo:
      'Site portfólio para fotógrafo que atualiza sozinho: cada ensaio postado no Instagram entra no site todo dia. A partir de R$299/mês. Veja o modelo ao vivo.',
    h1: 'Site para fotógrafo e estúdio de fotografia',
    intro:
      'O portfólio é o que fecha o contrato — mas mantê-lo atualizado dá trabalho. Este modelo resolve isso: o que você posta no Instagram entra no site sozinho. Navegue na demo abaixo.',
    faq: [
      {
        pergunta: 'Meu portfólio atualiza sozinho de verdade?',
        resposta:
          'Sim — depois de conectar o Instagram uma única vez, os posts e reels novos entram no site automaticamente, com sincronização rodando todo dia. Você continua postando como sempre e o portfólio nunca mais fica desatualizado.',
      },
      {
        pergunta: 'Quanto custa um site portfólio para fotógrafo?',
        resposta:
          'O site sai a partir de R$299 por mês; com o Instagram sincronizado, R$499 por mês. Hospedagem, domínio no primeiro ano e manutenção já estão inclusos — sem taxa de criação à parte.',
      },
      {
        pergunta: 'Dá pra separar o portfólio por tipo de ensaio?',
        resposta:
          'Dá — o modelo já organiza por categorias (casamento, gestante, ensaio corporativo, o que fizer sentido pro seu trabalho), e você mesmo edita essas seções pelo painel.',
      },
    ],
  },
  advocacia: {
    tituloSeo: 'Site para advogado e escritório de advocacia — modelo sóbrio | Omnidesign',
    descricaoSeo:
      'Site profissional para escritório de advocacia com áreas de atuação e perfil dos advogados. A partir de R$299/mês com manutenção inclusa. Veja o modelo.',
    h1: 'Site para advogado e escritório de advocacia',
    intro:
      'Antes de ligar, o cliente pesquisa o escritório no Google — e a primeira impressão vem do site. Este modelo abaixo é navegável de verdade, com o tom sóbrio que a advocacia pede.',
    faq: [
      {
        pergunta: 'O site respeita as regras de publicidade da OAB?',
        resposta:
          'O modelo foi desenhado com o tom informativo e sóbrio que o Código de Ética permite — áreas de atuação, perfil dos advogados e conteúdo educativo, sem promessas de resultado nem captação indevida. O conteúdo final é sempre aprovado por você antes de publicar.',
      },
      {
        pergunta: 'Quanto custa um site para escritório de advocacia?',
        resposta:
          'A partir de R$299 mensais, com hospedagem, domínio no primeiro ano, certificado de segurança e manutenção inclusos. Não há cobrança separada de criação.',
      },
      {
        pergunta: 'Consigo publicar artigos do escritório no site?',
        resposta:
          'Sim — o modelo inclui área de artigos, útil tanto pra informar clientes quanto pra fortalecer a presença do escritório nas buscas do Google.',
      },
    ],
  },
  'barbearia-salao': {
    tituloSeo: 'Site para barbearia e salão de beleza — com agendamento | Omnidesign',
    descricaoSeo:
      'Site para barbearia ou salão com serviços, preços e botão de agendamento direto no WhatsApp. A partir de R$299/mês, tudo incluso. Veja o modelo ao vivo.',
    h1: 'Site para barbearia e salão de beleza',
    intro:
      'Cliente novo pesquisa antes de confiar o corte a alguém — e quem aparece bem no Google sai na frente. Este modelo está funcionando de verdade logo abaixo.',
    faq: [
      {
        pergunta: 'O cliente consegue agendar horário pelo site?',
        resposta:
          'O modelo leva o cliente direto pro seu WhatsApp com um clique, já no contexto de agendamento — do jeito que a maioria das barbearias e salões já trabalha hoje, sem precisar aprender sistema novo.',
      },
      {
        pergunta: 'Os cortes que posto no Instagram aparecem no site?',
        resposta:
          'Aparecem — posts e reels entram no site sozinhos, com sincronização todo dia. Seu portfólio de cortes fica sempre atual sem você fazer nada além do que já faz.',
      },
      {
        pergunta: 'Quanto custa um site para barbearia?',
        resposta:
          'A partir de R$299 por mês, já com hospedagem, domínio no primeiro ano e manutenção. Com o Instagram sincronizado, R$499 por mês. Sem taxa de criação.',
      },
    ],
  },
  'academia-personal': {
    tituloSeo: 'Site para academia e personal trainer — modelo pronto | Omnidesign',
    descricaoSeo:
      'Site para academia ou personal trainer com planos, estrutura e resultados de alunos. A partir de R$299/mês com manutenção inclusa. Veja o modelo funcionando.',
    h1: 'Site para academia e personal trainer',
    intro:
      'Quem procura academia compara antes de visitar — estrutura, planos, resultados. Este modelo mostra tudo isso e está navegável logo abaixo.',
    faq: [
      {
        pergunta: 'Dá pra mostrar os planos e preços da academia no site?',
        resposta:
          'Dá, e você mesmo atualiza os valores pelo painel quando quiser — sem custo por alteração e sem depender de ninguém.',
      },
      {
        pergunta: 'As transformações dos alunos que posto no Instagram entram no site?',
        resposta:
          'Entram — o site sincroniza com o Instagram todo dia, puxando posts e reels automaticamente. Resultado de aluno é o que mais convence gente nova, e fica sempre visível.',
      },
      {
        pergunta: 'Quanto custa um site para academia ou personal?',
        resposta:
          'A partir de R$299 mensais com hospedagem, domínio e manutenção inclusos; R$499 na versão com Instagram sincronizado. Sem taxa de criação separada.',
      },
    ],
  },
  'clinica-massagem': {
    tituloSeo: 'Site para clínica de massagem e massoterapia — modelo | Omnidesign',
    descricaoSeo:
      'Site para clínica de massagem com serviços, valores e agendamento pelo WhatsApp. A partir de R$299/mês com tudo incluso. Veja o modelo navegável.',
    h1: 'Site para clínica de massagem e massoterapia',
    intro:
      'Um site transmite o profissionalismo que diferencia sua clínica — e aparece pra quem busca massoterapia na sua região. Navegue no modelo abaixo.',
    faq: [
      {
        pergunta: 'O site ajuda a aparecer pra quem busca massagem na minha região?',
        resposta:
          'Sim — o site é montado com as boas práticas que o Google pede e conversa com o seu perfil no Google Meu Negócio, o cadastro que coloca sua clínica no mapa. A gente configura os dois.',
      },
      {
        pergunta: 'Quanto custa um site para clínica de massagem?',
        resposta:
          'A partir de R$299 por mês, com hospedagem, domínio no primeiro ano, certificado de segurança e manutenção dentro do valor. Com Instagram sincronizado, R$499 por mês.',
      },
      {
        pergunta: 'Posso listar os tipos de massagem com valores?',
        resposta:
          'Pode — o modelo já traz a lista de serviços com descrição e valores, e você edita tudo pelo painel sempre que a tabela mudar.',
      },
    ],
  },
  psicologa: {
    tituloSeo: 'Site para psicóloga e psicólogo — modelo acolhedor | Omnidesign',
    descricaoSeo:
      'Site profissional para psicóloga com abordagem, especialidades e contato — visual acolhedor, a partir de R$299/mês com manutenção inclusa. Veja o modelo.',
    h1: 'Site para psicóloga e psicólogo',
    intro:
      'Encontrar um psicólogo é uma decisão delicada — e um site acolhedor, que explica sua abordagem com clareza, ajuda o paciente a dar o primeiro passo. Veja o modelo abaixo.',
    faq: [
      {
        pergunta: 'O site pode explicar minha abordagem e especialidades?',
        resposta:
          'Sim — o modelo tem espaço dedicado pra abordagem terapêutica, público que você atende e temas de especialidade, escritos do seu jeito. Você aprova tudo antes de ir ao ar.',
      },
      {
        pergunta: 'Atendo online — o site deixa isso claro?',
        resposta:
          'Deixa — dá pra destacar atendimento online e presencial, com o canal de contato que preferir (WhatsApp, e-mail ou formulário no próprio site).',
      },
      {
        pergunta: 'Quanto custa um site para psicóloga?',
        resposta:
          'A partir de R$299 mensais com hospedagem, domínio no primeiro ano e manutenção inclusos — sem taxa de criação. A versão com Instagram sincronizado fica em R$499 por mês.',
      },
    ],
  },
  'terapeuta-holistica': {
    tituloSeo: 'Site para terapeuta holística — modelo zen e leve | Omnidesign',
    descricaoSeo:
      'Site para terapeuta holística com terapias, valores e agendamento. Visual leve, a partir de R$299/mês com tudo incluso. Veja o modelo funcionando ao vivo.',
    h1: 'Site para terapeuta holística',
    intro:
      'Seu espaço transmite calma — o site precisa transmitir o mesmo. Este modelo tem o visual leve que combina com terapias integrativas, e está navegável logo abaixo.',
    faq: [
      {
        pergunta: 'Dá pra apresentar cada terapia com explicação própria?',
        resposta:
          'Dá — reiki, aromaterapia, cristais, o que você trabalhar: cada terapia ganha sua descrição, valor e duração, tudo editável pelo painel sem custo por mudança.',
      },
      {
        pergunta: 'O conteúdo que posto no Instagram aparece no site?',
        resposta:
          'Aparece — posts e reels sincronizam com o site todo dia, automaticamente. Seu conteúdo de bem-estar continua trabalhando por você também fora da rede social.',
      },
      {
        pergunta: 'Quanto custa um site para terapeuta?',
        resposta:
          'A partir de R$299 por mês com hospedagem, domínio no primeiro ano e manutenção inclusos. Com o Instagram sincronizado, R$499 mensais. Sem taxa de criação separada.',
      },
    ],
  },
}
