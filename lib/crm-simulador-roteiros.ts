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

// Frases escritas propositalmente reaproveitando os padrões reais do
// crm_dicionario (mesma grafia informal, sem acento em vários pontos) —
// assim a resposta automática também dispara detecção de verdade no
// motor de análise, o que é o objetivo do treino.
const ROTEIROS: Record<PerfilSimulado, Roteiro> = {
  decidido: {
    condicionais: [
      { gatilhos: ['prazo', 'proposta', 'orçamento', 'orcamento'], texto: 'Isso é pra ontem, preciso rápido mesmo' },
      { gatilhos: ['contrato'], texto: 'Perfeito, pode me mandar o contrato que eu já assino' },
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
    condicionais: [],
    sequencia: [
      'Oi, to meio corrido aqui, pode ser rápido?',
      'Sem tempo agora, depois te falo com calma',
      'Vou ver e te respondo mais tarde',
      'Desculpa a demora, tava corrido pra caramba',
      'Manda resumido que eu leio quando der',
    ],
  },
  entusiasmado: {
    condicionais: [],
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
      return { texto: cond.texto, proximoIndice: indiceAtual }
    }
  }

  if (indiceAtual >= roteiro.sequencia.length) return null
  return { texto: roteiro.sequencia[indiceAtual], proximoIndice: indiceAtual + 1 }
}
