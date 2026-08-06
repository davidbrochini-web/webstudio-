// Temas editoriais — cada um mira uma long-tail keyword real de busca.
// Ao publicar um conto novo, atribuir 1-2 temas via coluna `temas` no banco.

export type Tema = {
  slug: string
  nome: string        // H1 da página do tema
  nomeCurto: string   // rótulo curto pra chips de navegação
  titleSeo: string    // <title>
  descricao: string   // meta description
  texto: string        // corpo editorial da página (150-250 palavras, SEO)
}

export const TEMAS: Record<string, Tema> = {
  'lendas-urbanas': {
    slug: 'lendas-urbanas',
    nome: 'Contos de Terror de Lendas Urbanas',
    nomeCurto: 'Lendas Urbanas',
    titleSeo: 'Contos de Terror de Lendas Urbanas — Ler Grátis',
    descricao: 'Contos de terror inspirados em lendas urbanas brasileiras e histórias que circulam à meia-noite. Leia grátis — novos casos toda semana.',
    texto: 'Lendas urbanas são o tipo de história que todo mundo já ouviu de alguém que jura ter acontecido com um amigo de um amigo. Rua que muda de lugar durante a noite, prédio com um andar que ninguém lembra de ter visto, entrega marcada num endereço que não devia existir. É esse território que os contos de terror de lendas urbanas exploram: o medo do familiar que de repente para de se comportar como devia. Aqui no Casos Esquecidos, esses contos fazem parte do mesmo universo do livro Alguns Casos Devem Ficar Esquecidos — histórias curtas, gratuitas, publicadas toda semana, onde a cidade brasileira vira cenário de coisas que preferiríamos continuar não sabendo. Não são contos de susto barato; são histórias que ficam, que fazem você olhar duas vezes pro corredor vazio do prédio à noite.',
  },
  'terror-psicologico': {
    slug: 'terror-psicologico',
    nome: 'Contos de Terror Psicológico',
    nomeCurto: 'Psicológico',
    titleSeo: 'Contos de Terror Psicológico — Ler Grátis',
    descricao: 'Histórias de terror psicológico onde a mente é o território do medo. Contos gratuitos de D. Broch, publicados toda semana.',
    texto: 'O terror psicológico não precisa de monstro com presas pra assustar — às vezes o medo mais eficiente é a dúvida sobre a própria percepção. Um reflexo que demora um segundo a mais pra se mover. Uma certeza que não devia estar ali. Os contos de terror psicológico publicados aqui no Casos Esquecidos trabalham exatamente nessa fronteira: entre o que a personagem vê e o que talvez não devesse ter visto. São histórias gratuitas, parte do universo de Alguns Casos Devem Ficar Esquecidos, escritas por D. Broch, e publicadas toda semana. Se você prefere terror que fica te perseguindo depois de fechar a aba — que muda o jeito como você olha pro próprio espelho de madrugada — esse é o tema certo pra explorar no arquivo de casos.',
  },
  'sobrenatural': {
    slug: 'sobrenatural',
    nome: 'Contos Sobrenaturais',
    nomeCurto: 'Sobrenatural',
    titleSeo: 'Contos Sobrenaturais e Paranormais — Ler Grátis',
    descricao: 'Contos sobrenaturais com entidades, rituais e portas que não deveriam existir. Histórias de terror gratuitas, toda semana.',
    texto: 'Contos sobrenaturais lidam com a possibilidade mais desconfortável de todas: que existam regras além das que aprendemos na escola, e que algumas pessoas — ou coisas — já sabem disso há muito mais tempo que nós. Portais que não deveriam abrir. Rituais antigos com preço definido. Entidades que cumprem promessas feitas há milênios. No Casos Esquecidos, os contos sobrenaturais fazem parte do mesmo universo investigado no livro Alguns Casos Devem Ficar Esquecidos, escrito por D. Broch — um universo de lendas urbanas e criaturas que se alimentam de medo, memória e silêncio. Os contos são gratuitos e publicados semanalmente, cada um uma investigação independente sobre o que existe do outro lado da fronteira entre o nosso mundo e o que não deveria estar aqui.',
  },
  'criaturas': {
    slug: 'criaturas',
    nome: 'Contos de Terror com Criaturas',
    nomeCurto: 'Criaturas',
    titleSeo: 'Contos de Terror com Criaturas e Monstros — Ler Grátis',
    descricao: 'Histórias de terror com criaturas que não pertencem a este mundo. Contos gratuitos de horror, publicados semanalmente por D. Broch.',
    texto: 'Toda boa história de criatura tem uma regra: quanto menos você vê, mais apavorante fica. Os contos de terror com criaturas publicados aqui seguem essa lógica — sombras que se ajustam de posição no teto, dedos longos demais surgindo no reflexo, algo que aprende onde você mora antes de aparecer de verdade. São histórias gratuitas do universo de Alguns Casos Devem Ficar Esquecidos, de D. Broch, publicadas toda semana no Casos Esquecidos. Cada conto é independente, mas todos habitam o mesmo mundo: um lugar onde existem coisas com fome, paciência e uma paciência quase profissional pra esperar o momento certo.',
  },
  'terror-tecnologico': {
    slug: 'terror-tecnologico',
    nome: 'Contos de Terror da Internet',
    nomeCurto: 'Tecnológico',
    titleSeo: 'Contos de Terror da Internet e Tecnologia — Ler Grátis',
    descricao: 'Histórias de terror sobre grupos misteriosos, vídeos que não deveriam existir e o que vive do outro lado da tela. Leia grátis.',
    texto: 'O terror mudou de endereço nos últimos anos — hoje ele mora em grupos de mensagem sem nome, em vídeos que chegam de contatos que não deveriam existir, em chamadas que mostram mais do que deveriam. Os contos de terror da internet exploram esse medo bem contemporâneo: a tecnologia que prometia conectar virando o canal por onde alguma coisa entra. No Casos Esquecidos, esses contos são gratuitos, publicados toda semana, e fazem parte do universo de Alguns Casos Devem Ficar Esquecidos, de D. Broch. São histórias pensadas pra quem já ficou com aquele desconforto de ler uma mensagem de madrugada e sentir que era melhor não ter aberto.',
  },
  'maldicoes': {
    slug: 'maldicoes',
    nome: 'Contos de Maldições e Objetos Amaldiçoados',
    nomeCurto: 'Maldições',
    titleSeo: 'Contos de Terror sobre Maldições — Ler Grátis',
    descricao: 'Contos de terror sobre maldições antigas, amuletos e dívidas que sempre vencem. Histórias gratuitas de D. Broch.',
    texto: 'Toda maldição é, no fundo, uma dívida — e dívida sempre vence, mais cedo ou mais tarde. Os contos de terror sobre maldições e objetos amaldiçoados exploram exatamente essa lógica: um amuleto tocado sem permissão, um pacto antigo esperando ser cobrado, um preço que alguém esqueceu de mencionar antes de aceitar. Publicados gratuitamente toda semana no Casos Esquecidos, esses contos fazem parte do universo de Alguns Casos Devem Ficar Esquecidos, de D. Broch — histórias de terror psicológico e investigação paranormal onde nem todo mundo que sai de uma sala amaldiçoada sai sozinho.',
  },
  'assombracao': {
    slug: 'assombracao',
    nome: 'Histórias de Assombração',
    nomeCurto: 'Assombração',
    titleSeo: 'Histórias de Assombração e Lugares Mal-Assombrados — Ler Grátis',
    descricao: 'Histórias de assombração em apartamentos, prédios e lugares que guardam mais do que memórias. Contos de terror gratuitos.',
    texto: 'Lugar assombrado não precisa ser castelo antigo — pode ser um apartamento com aluguel barato demais, um prédio que muda de andar dependendo de quem conta a história, um espelho que veio junto do imóvel e nunca devia ter vindo. As histórias de assombração publicadas aqui trabalham o medo do espaço doméstico virando território hostil. São contos gratuitos, parte do universo de Alguns Casos Devem Ficar Esquecidos, de D. Broch, publicados toda semana no Casos Esquecidos — cada um uma investigação sobre o que os lugares guardam quando ninguém está olhando.',
  },
}

export const getTema = (slug: string): Tema | null => TEMAS[slug] || null
export const getAllTemas = (): Tema[] => Object.values(TEMAS)
