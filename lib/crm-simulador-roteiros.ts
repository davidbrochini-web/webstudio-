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
    },
    pesquisador: {
      segmento: 'Tenho uma clínica de estética, tô pesquisando bastante antes de decidir',
      site: 'Não tenho site ainda, por isso tô vendo as opções com calma',
      redes: 'Tenho Instagram, mas quero ver se dá pra integrar bem com o site',
      tempo: 'Tô no mercado há uns 2 anos',
      local: 'Fico na região do ABC, em São Paulo',
      decisor: 'Sou eu que decido, mas quero comparar direito antes',
    },
    preco: {
      segmento: 'Tenho uma pequena loja, o orçamento é meio apertado',
      site: 'Não tenho site, por isso tô vendo quanto custa fazer um',
      redes: 'Tenho Instagram, uso porque é de graça',
      tempo: 'Umas 2 anos, ainda tô começando a crescer',
      local: 'Fico no interior de São Paulo',
      decisor: 'Sou eu, mas preciso que caiba no bolso',
    },
    desconfiado: {
      segmento: 'Tenho uma barbearia, mas antes de falar mais quero ter certeza que vocês são de confiança',
      site: 'Não tenho site, já tentei antes com outra empresa e não deu certo',
      redes: 'Tenho Instagram sim, mas não confio em passar acesso fácil assim',
      tempo: 'Uns 4 anos, já vi muita gente prometendo e não entregando',
      local: 'Fico em São Paulo, mas prefiro não dar mais detalhes ainda',
      decisor: 'Sou eu que decido, mas só depois de ter certeza',
    },
    ocupado: {
      segmento: 'Comércio. Pode ser rápido?',
      site: 'Não. Segue',
      redes: 'Tenho insta sim',
      tempo: 'Uns 3 anos',
      local: 'SP',
      decisor: 'Sou eu mesmo, manda resumido',
    },
    entusiasmado: {
      segmento: 'Ah, eu tenho um espaço de yoga! Adoro o que faço, super empolgada com tudo isso',
      site: 'Não tenho site ainda, sempre quis ter um bem bonito!',
      redes: 'Tenho Instagram sim, posto bastante, ia adorar ver ele conectado ao site!',
      tempo: 'Faz uns 2 aninhos, tá crescendo bem!',
      local: 'Fico em São Paulo, zona oeste, um cantinho bem gostoso!',
      decisor: 'Sou eu que decido, super animada pra começar logo!',
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
  ]
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
  ultimaMsgAtendente: string
): { texto: string; proximoIndice: number } | null {
  const roteiro = ROTEIROS[perfil]
  const msgSemAcento = ultimaMsgAtendente
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  for (const cond of roteiro.condicionais) {
    const bateu = cond.gatilhos.some(g => msgSemAcento.includes(g.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))
    if (bateu) {
      // A resposta condicional é só uma reação pontual — mas precisa
      // avançar o índice igual uma fala normal, senão a conversa trava
      // pra sempre: gatilhos como "proposta"/"orçamento" (perfil
      // Decidido) são palavras comuns demais numa negociação real, e
      // ficavam re-disparando a cada mensagem sem nunca progredir.
      const proximoIndice = Math.min(indiceAtual + 1, roteiro.sequencia.length)
      return { texto: cond.texto, proximoIndice }
    }
  }

  if (indiceAtual >= roteiro.sequencia.length) return null
  return { texto: roteiro.sequencia[indiceAtual], proximoIndice: indiceAtual + 1 }
}
