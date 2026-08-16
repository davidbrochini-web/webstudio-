export type PerfilSimulado = 'decidido' | 'pesquisador' | 'preco' | 'desconfiado' | 'ocupado' | 'entusiasmado'

export const PERFIL_SIMULADO_LABELS: Record<PerfilSimulado, string> = {
  decidido: 'Decidido 🔥',
  pesquisador: 'Pesquisador 🔍',
  preco: 'Do Preço 💰',
  desconfiado: 'Desconfiado 🛡️',
  ocupado: 'Ocupado ⏰',
  entusiasmado: 'Entusiasmado 🎢',
}

interface RespostaCondicional {
  gatilhos: string[]
  texto: string
}

interface Roteiro {
  condicionais: RespostaCondicional[]
  sequencia: string[]
}

// Perguntas de qualificação que um atendente faz cedo em qualquer
// negociação — comuns o suficiente pra merecer resposta própria em
// TODOS os perfis, senão o "cliente" simulado ignora a pergunta e só
// dispara a próxima fala do roteiro fixo (era exatamente a reclamação:
// "ele fica só questionando, não responde nada"). Cada perfil responde
// no seu próprio tom, mas a INFORMAÇÃO em si é sempre coerente.
function perguntasQualificacao(perfil: PerfilSimulado): RespostaCondicional[] {
  const RESPOSTAS: Record<PerfilSimulado, Record<string, string>> = {
    decidido: {
      segmento: 'Tenho uma loja de roupas, mas isso não muda nada — quero começar logo',
      site: 'Não tenho site ainda, por isso quero fechar rápido com vocês',
      redes: 'Tenho Instagram sim, uso bastante, pode puxar de lá mesmo',
      tempo: 'Já tem uns 3 anos que eu trabalho nisso',
      local: 'Fico em São Paulo mesmo, na zona leste',
      decisor: 'Sou eu mesmo que decido, pode fechar comigo direto',
      pagamento: 'Pode ser como for mais rápido, só me manda o link que eu já pago',
      materiais: 'Tenho logo e fotos sim, já separo tudo agora',
      qtdProdutos: 'Uns 10 produtos pra já ir no ar, depois eu vou adicionando mais',
      referencia: 'Não tenho referência não, confio no trabalho de vocês, só bota pra rodar',
      contato: 'Pode falar direto nesse número mesmo, respondo rápido',
    },
    pesquisador: {
      segmento: 'Tenho uma clínica de estética, tô pesquisando bastante antes de decidir',
      site: 'Não tenho site ainda, por isso tô vendo as opções com calma',
      redes: 'Tenho Instagram, mas quero ver se dá pra integrar bem com o site',
      tempo: 'Tô no mercado há uns 2 anos',
      local: 'Fico na região do ABC, em São Paulo',
      decisor: 'Sou eu que decido, mas quero comparar direito antes',
      pagamento: 'Ainda não sei, depende de como fechar comparado com as outras opções',
      materiais: 'Tenho logo, as fotos eu preciso separar ainda',
      qtdProdutos: 'Uns 15 produtos, mas isso pode mudar dependendo do que eu decidir',
      referencia: 'Tenho alguns sites que eu gosto do estilo, posso mandar de referência',
      contato: 'Pode ser por aqui mesmo, só que eu demoro um pouco pra responder às vezes',
    },
    preco: {
      segmento: 'Tenho uma pequena loja, o orçamento é meio apertado',
      site: 'Não tenho site, por isso tô vendo quanto custa fazer um',
      redes: 'Tenho Instagram, uso porque é de graça',
      tempo: 'Umas 2 anos, ainda tô começando a crescer',
      local: 'Fico no interior de São Paulo',
      decisor: 'Sou eu, mas preciso que caiba no bolso',
      pagamento: 'Prefiro parcelado se puder, o à vista pesa muito',
      materiais: 'Tenho logo sim, fotos eu tiro com o celular mesmo',
      qtdProdutos: 'Uns 8 produtos só, pra começar simples',
      referencia: 'Não tenho referência não, só quero que fique bonito sem estourar o orçamento',
      contato: 'Pode ser por aqui mesmo',
    },
    desconfiado: {
      segmento: 'Tenho uma barbearia, mas antes de falar mais quero ter certeza que vocês são de confiança',
      site: 'Não tenho site, já tentei antes com outra empresa e não deu certo',
      redes: 'Tenho Instagram sim, mas não confio em passar acesso fácil assim',
      tempo: 'Uns 4 anos, já vi muita gente prometendo e não entregando',
      local: 'Fico em São Paulo, mas prefiro não dar mais detalhes ainda',
      decisor: 'Sou eu que decido, mas só depois de ter certeza',
      pagamento: 'Prefiro pagar só depois de ver que tá tudo certo, não gosto de pagar adiantado',
      materiais: 'Tenho, mas só mando depois que fechar mesmo',
      qtdProdutos: 'Uns 10, mas ainda tô decidindo se vou fechar',
      referencia: 'Tenho sim, mas quero ver primeiro como vocês trabalham',
      contato: 'Prefiro continuar por aqui mesmo, por enquanto',
    },
    ocupado: {
      segmento: 'Comércio. Pode ser rápido?',
      site: 'Não. Segue',
      redes: 'Tenho insta sim',
      tempo: 'Uns 3 anos',
      local: 'SP',
      decisor: 'Sou eu mesmo, manda resumido',
      pagamento: 'Qualquer uma, manda o link',
      materiais: 'Tenho tudo, te mando',
      qtdProdutos: 'Uns 10',
      referencia: 'Não, façam o que for melhor',
      contato: 'Esse número mesmo',
    },
    entusiasmado: {
      segmento: 'Ah, eu tenho um espaço de yoga! Adoro o que faço, super empolgada com tudo isso',
      site: 'Não tenho site ainda, sempre quis ter um bem bonito!',
      redes: 'Tenho Instagram sim, posto bastante, ia adorar ver ele conectado ao site!',
      tempo: 'Faz uns 2 aninhos, tá crescendo bem!',
      local: 'Fico em São Paulo, zona oeste, um cantinho bem gostoso!',
      decisor: 'Sou eu que decido, super animada pra começar logo!',
      pagamento: 'Ah, qualquer forma tá ótimo pra mim, super tranquila com isso!',
      materiais: 'Tenho logo e um monte de fotos legais, adoro fotografar o espaço!',
      qtdProdutos: 'Ai, uns 12 serviços que eu ofereço, quero mostrar tudo!',
      referencia: 'Tenho sim! Adoro um estilo mais colorido e alegre, combina com meu negócio!',
      contato: 'Pode ser por aqui mesmo, super acessível!',
    },
  }

  const r = RESPOSTAS[perfil]
  return [
    { gatilhos: ['que tipo de negocio', 'segmento', 'ramo', 'area voces atuam', 'o que voces fazem', 'seu negocio e de'], texto: r.segmento },
    { gatilhos: ['ja tem site', 'site atual', 'tem site hoje', 'possui site', 'voces tem site'], texto: r.site },
    { gatilhos: ['instagram', 'redes sociais', 'rede social'], texto: r.redes },
    { gatilhos: ['quanto tempo', 'ha quanto tempo', 'faz tempo que', 'tempo de mercado'], texto: r.tempo },
    { gatilhos: ['onde fica', 'qual cidade', 'localizacao', 'qual regiao'], texto: r.local },
    { gatilhos: ['voce que decide', 'quem decide', 'voce e quem aprova', 'e voce quem fecha', 'e voce quem decide'], texto: r.decisor },
    { gatilhos: ['forma de pagamento', 'como e o pagamento', 'parcela', 'a vista'], texto: r.pagamento },
    { gatilhos: ['tem logo', 'tem fotos', 'materiais que precisa', 'precisa de logo', 'manda a logo'], texto: r.materiais },
    { gatilhos: ['quantos produtos', 'quantos servicos', 'quantos itens', 'quantidade de produtos'], texto: r.qtdProdutos },
    { gatilhos: ['alguma referencia', 'estilo que gosta', 'cor que prefere', 'tem referencia'], texto: r.referencia },
    { gatilhos: ['qual seu whatsapp', 'melhor telefone', 'como falo com voce', 'melhor forma de falar'], texto: r.contato },
  ]
}

// Rede de segurança pra qualquer pergunta que não caiu em nenhum
// gatilho específico acima: se a fala do atendente tem cara de
// pergunta (termina com "?" ou começa com palavra interrogativa) e
// nada bateu, o cliente ainda assim reage no tom dele em vez de
// ignorar e emendar a próxima fala do roteiro fixo sem relação
// nenhuma — era a reclamação central ("ele fica só questionando,
// não responde"). Isso não substitui gatilho específico (que dá
// informação de verdade); é só pra nunca ficar mudo.
const RESPOSTA_GENERICA: Record<PerfilSimulado, string> = {
  decidido: 'Boa pergunta! Mas não me prendo em detalhe agora não, quero é fechar rápido',
  pesquisador: 'Ótima pergunta, deixa eu anotar isso aqui pra comparar com as outras opções que tô vendo',
  preco: 'Não sei te responder isso de cabeça, mas o que importa mesmo é saber se cabe no orçamento',
  desconfiado: 'Hmm, boa pergunta... mas antes disso, me conta mais como vocês trabalham?',
  ocupado: 'Não sei agora, depois vejo isso com calma',
  entusiasmado: 'Ai que pergunta legal! Não sei te responder certinho, mas tô super animada com tudo isso!',
}

const PALAVRAS_INTERROGATIVAS = ['qual', 'quais', 'quanto', 'quantos', 'quantas', 'quando', 'onde', 'como', 'quem', 'por que', 'porque']

function pareceUmaPergunta(msg: string): boolean {
  const semAcento = msg.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  if (semAcento.endsWith('?')) return true
  return PALAVRAS_INTERROGATIVAS.some(p => semAcento.startsWith(p + ' '))
}

// Frases escritas propositalmente reaproveitando os padrões reais do
// crm_dicionario (mesma grafia informal, sem acento em vários pontos) —
// assim a resposta automática também dispara detecção de verdade no
// motor de análise, o que é o objetivo do treino.
const ROTEIROS: Record<PerfilSimulado, Roteiro> = {
  decidido: {
    condicionais: [
      { gatilhos: ['prazo', 'proposta', 'orçamento', 'orcamento'], texto: 'Isso é pra ontem, preciso rápido mesmo' },
      { gatilhos: ['contrato'], texto: 'Perfeito, pode me mandar o contrato que eu já assino' },
      ...perguntasQualificacao('decidido'),
    ],
    sequencia: [
      'Oi! Vi o anúncio de vocês e já quero fechar',
      'Quando começa o projeto? Bora fechar isso logo',
      'Pode começar amanhã mesmo, pra mim tá ótimo',
      'Show, vamos fechar isso então',
      'Só me fala o próximo passo que eu já sigo',
    ],
  },
  pesquisador: {
    condicionais: [
      { gatilhos: ['portfolio', 'portfólio', 'exemplo', 'projeto'], texto: 'Legal, vou dar uma olhada com calma e comparar com outras empresas' },
      ...perguntasQualificacao('pesquisador'),
    ],
    sequencia: [
      'Oi, ainda tô pesquisando algumas opções',
      'Qual o diferencial de vocês comparando com outras agências?',
      'Vocês têm portfólio pra eu ver? Tô vendo outras opções também',
      'Recebi outro orçamento, vou comparar os dois com calma',
      'Deixa eu avaliar direitinho e te retorno',
    ],
  },
  preco: {
    condicionais: [
      { gatilhos: ['inclu', 'escopo', 'entrega'], texto: 'Mas quanto fica no final? Tem como fechar mais em conta?' },
      ...perguntasQualificacao('preco'),
    ],
    sequencia: [
      'Oi, quanto custa pra fazer um site?',
      'Nossa, achei meio caro pra ser sincero',
      'Vocês não têm nenhum desconto?',
      'Tá meio salgado pro nosso orçamento agora',
      'Vou pensar, não sei se cabe no bolso esse mês',
    ],
  },
  desconfiado: {
    condicionais: [
      { gatilhos: ['garantia', 'suporte'], texto: 'Ah que bom, e se não funcionar depois, tem garantia mesmo?' },
      ...perguntasQualificacao('desconfiado'),
    ],
    sequencia: [
      'Oi, vocês têm CNPJ mesmo? Preciso confirmar antes',
      'Pergunto porque já fui enganado por uma agência antes',
      'E se não funcionar o site, como fica?',
      'Vocês existem mesmo há quanto tempo?',
      'Tem contrato formalizando tudo certinho?',
    ],
  },
  ocupado: {
    condicionais: [...perguntasQualificacao('ocupado')],
    sequencia: [
      'Oi, to meio corrido aqui, pode ser rápido?',
      'Sem tempo agora, depois te falo com calma',
      'Vou ver e te respondo mais tarde',
      'Desculpa a demora, tava corrido pra caramba',
      'Manda resumido que eu leio quando der',
    ],
  },
  entusiasmado: {
    condicionais: [...perguntasQualificacao('entusiasmado')],
    sequencia: [
      'Oi! Adorei a ideia, seria muito bacana ter um site',
      'E dá pra fazer também um sistema de agendamento?',
      'Já pensei até em ter um app depois',
      'Seria legal ter tudo isso integrado, viu',
      'Quero saber tudo que dá pra incluir nisso!',
    ],
  },
}

/**
 * Escolhe a próxima fala do "cliente" simulado, sem IA: primeiro checa
 * se a última mensagem do atendente bate com algum gatilho condicional
 * do perfil; se não bater, segue a sequência fixa na ordem. Quando a
 * sequência acaba, retorna null (o modo automático para sozinho ali).
 */
export function proximaRespostaAuto(
  perfil: PerfilSimulado,
  indiceAtual: number,
  ultimaMsgAtendente: string,
  condicionaisUsados: ReadonlySet<number> = new Set()
): { texto: string; proximoIndice: number; condicionalUsado?: number } | null {
  const roteiro = ROTEIROS[perfil]
  const msgSemAcento = ultimaMsgAtendente
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  for (let i = 0; i < roteiro.condicionais.length; i++) {
    // Cada condicional só dispara UMA VEZ por conversa — sem isso, um
    // gatilho como "instagram" (objeção de confiança no perfil
    // Desconfiado) fica re-disparando pra sempre: a atendente
    // naturalmente precisa repetir a palavra pra tratar a objeção, e
    // o cliente simulado voltava a dar a MESMA frase enlatada de novo,
    // ignorando qualquer coisa nova que ela tivesse dito. Confirmado
    // isso numa simulação real (a mesma resposta 3x seguidas mesmo
    // com respostas diferentes da atendente).
    if (condicionaisUsados.has(i)) continue
    const cond = roteiro.condicionais[i]
    const bateu = cond.gatilhos.some(g => msgSemAcento.includes(g.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))
    if (bateu) {
      // A resposta condicional é só uma reação pontual — mas precisa
      // avançar o índice igual uma fala normal, senão a conversa trava
      // pra sempre: gatilhos como "proposta"/"orçamento" (perfil
      // Decidido) são palavras comuns demais numa negociação real, e
      // ficavam re-disparando a cada mensagem sem nunca progredir.
      const proximoIndice = Math.min(indiceAtual + 1, roteiro.sequencia.length)
      return { texto: cond.texto, proximoIndice, condicionalUsado: i }
    }
  }

  // Nenhum gatilho específico bateu (ou já foi usado antes) — se a
  // fala do atendente tem cara de pergunta, ainda assim reage no tom
  // do perfil em vez de ignorar (ver RESPOSTA_GENERICA acima).
  if (pareceUmaPergunta(ultimaMsgAtendente)) {
    const proximoIndice = Math.min(indiceAtual + 1, roteiro.sequencia.length)
    return { texto: RESPOSTA_GENERICA[perfil], proximoIndice }
  }

  if (indiceAtual >= roteiro.sequencia.length) return null
  return { texto: roteiro.sequencia[indiceAtual], proximoIndice: indiceAtual + 1 }
}
