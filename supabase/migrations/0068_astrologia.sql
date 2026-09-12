-- 0068_astrologia.sql
-- App Mapa Astral: conteúdo dos signos, interpretações planeta×signo
-- e inscrições para horóscopo diário (e-mail / whatsapp).
-- Sem IA — tudo conteúdo estático + cálculo determinístico no front.

-- ───────────────────────────────────────────────────────────────────
-- 1. Tabela de signos (conteúdo descritivo)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS astrologia_signos (
  slug             TEXT    PRIMARY KEY,  -- 'aries', 'touro', ...
  nome             TEXT    NOT NULL,     -- 'Áries', 'Touro', ...
  simbolo          TEXT    NOT NULL,
  elemento         TEXT    NOT NULL,     -- Fogo | Terra | Ar | Água
  qualidade        TEXT    NOT NULL,     -- Cardinal | Fixo | Mutável
  planeta_regente  TEXT    NOT NULL,
  descricao_solar       TEXT NOT NULL,
  descricao_lunar       TEXT NOT NULL,
  descricao_ascendente  TEXT NOT NULL,
  pontos_fortes    TEXT[]  NOT NULL DEFAULT '{}',
  desafios         TEXT[]  NOT NULL DEFAULT '{}',
  mensagens_diarias TEXT[] NOT NULL DEFAULT '{}',  -- pool ~10 msgs, rotaciona por dia
  ordem            SMALLINT NOT NULL
);

ALTER TABLE astrologia_signos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "astrologia_signos_public_read" ON astrologia_signos;
CREATE POLICY "astrologia_signos_public_read"
  ON astrologia_signos FOR SELECT USING (true);

-- ───────────────────────────────────────────────────────────────────
-- 2. Interpretações planeta × signo (Mercúrio, Vênus, Marte, Júpiter)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS astrologia_planeta_signo (
  planeta  TEXT NOT NULL,
  signo    TEXT NOT NULL,
  influencia TEXT NOT NULL,
  PRIMARY KEY (planeta, signo)
);

ALTER TABLE astrologia_planeta_signo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "astrologia_planeta_signo_public_read" ON astrologia_planeta_signo;
CREATE POLICY "astrologia_planeta_signo_public_read"
  ON astrologia_planeta_signo FOR SELECT USING (true);

-- ───────────────────────────────────────────────────────────────────
-- 3. Inscrições para horóscopo diário
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS astrologia_inscricoes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         TEXT NOT NULL,
  data_nasc    DATE NOT NULL,
  cidade       TEXT NOT NULL,
  pais         TEXT NOT NULL DEFAULT 'Brasil',
  signo_solar  TEXT NOT NULL,
  canal        TEXT NOT NULL CHECK (canal IN ('email', 'whatsapp')),
  contato      TEXT NOT NULL,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE astrologia_inscricoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "astrologia_inscricoes_insert" ON astrologia_inscricoes;
CREATE POLICY "astrologia_inscricoes_insert"
  ON astrologia_inscricoes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "astrologia_inscricoes_admin_read" ON astrologia_inscricoes;
CREATE POLICY "astrologia_inscricoes_admin_read"
  ON astrologia_inscricoes FOR SELECT USING (is_super_admin());

-- ───────────────────────────────────────────────────────────────────
-- 4. Seed — conteúdo dos 12 signos
-- ───────────────────────────────────────────────────────────────────
INSERT INTO astrologia_signos (slug,nome,simbolo,elemento,qualidade,planeta_regente,descricao_solar,descricao_lunar,descricao_ascendente,pontos_fortes,desafios,mensagens_diarias,ordem) VALUES

('aries','Áries','♈','Fogo','Cardinal','Marte',
'Áries é o signo do nascimento do zodíaco — energético, pioneiro e cheio de coragem para abrir caminhos que outros hesitam em trilhar. Quem nasce sob este signo carrega uma chama interna que transforma ideias em ação antes que qualquer um perceba.',
'Com a Lua em Áries, as emoções chegam rápido e intenso, como um temporal de verão. Há uma necessidade profunda de agir diante do que sente — a espera causa desconforto, mas essa impulsividade também gera autenticidade rara.',
'O Ascendente em Áries entrega ao mundo uma presença direta e magnética, de quem chega e já toma espaço. Mesmo que interiormente seja mais cauteloso, o mundo o vê como alguém que não recua — e essa imagem frequentemente se torna realidade.',
ARRAY['Iniciativa e coragem','Energia e disposição','Autenticidade','Liderança natural'],
ARRAY['Impaciência com processos lentos','Tendência a agir sem planejar'],
ARRAY[
  'Hoje é dia de dar o primeiro passo — mesmo que imperfeito, ele vale mais do que o plano perfeito que nunca saiu do papel.',
  'Sua energia é seu maior presente. Direcione-a com intenção e o resultado vai surpreender até você.',
  'Uma ideia nova está pedindo passagem. Abra espaço pra ela.',
  'O melhor momento pra começar algo novo é agora — e você sabe disso como poucos.',
  'Pausar antes de agir não é fraqueza, é estratégia. Hoje, respire fundo e depois avance.',
  'Sua coragem inspira quem está ao redor, mesmo quando você não percebe.',
  'Energia alta, foco necessário. Escolha uma batalha e vença-a completamente.',
  'Hoje favoreça a ação direta. Menos conversa, mais movimento.',
  'A impulsividade que às vezes te atrapalha é a mesma que te faz único. Use com consciência.',
  'Novos começos estão no seu DNA. Confie no processo que você mesmo iniciou.'
],1),

('touro','Touro','♉','Terra','Fixo','Vênus',
'Touro é o signo da construção — paciente, determinado e profundamente conectado aos prazeres concretos da vida. Quem tem o Sol aqui sabe que as melhores coisas levam tempo, e tem fôlego para esperar e cultivar.',
'Com a Lua em Touro, as emoções precisam de raízes firmes para florescer. Há um desejo genuíno de segurança e estabilidade afetiva — vínculos duradouros alimentam a alma mais do que qualquer aventura passageira.',
'O Ascendente em Touro transmite calma e confiabilidade. O mundo enxerga alguém sólido, que não se abala com facilidade e cuja presença tem peso — no bom sentido. Inspira confiança antes mesmo de falar.',
ARRAY['Persistência e determinação','Praticidade e senso de realidade','Lealdade profunda','Apreciação das belezas da vida'],
ARRAY['Resistência a mudanças necessárias','Teimosia quando convicto'],
ARRAY[
  'Construção lenta é construção sólida. Continue firme no que você plantou.',
  'Hoje, aprecie o que já tem. A gratidão abre espaço para mais.',
  'Você tem o dom da paciência — use-o como vantagem competitiva.',
  'Uma pequena estabilidade conquistada hoje vale mais do que uma grande promessa amanhã.',
  'Abrir mão do controle em pequenas doses hoje pode trazer grandes libertações.',
  'Seu ritmo é o certo para você. Não deixe pressa alheia atrapalhar sua consistência.',
  'Hoje é bom dia para finalizar o que está em andamento. Completude traz satisfação.',
  'Conexões profundas pedem tempo e presença. Invista nisso hoje.',
  'Confie nos seus instintos práticos — eles raramente erram.',
  'A beleza está nos detalhes que você escolhe notar. Hoje, preste atenção neles.'
],2),

('gemeos','Gêmeos','♊','Ar','Mutável','Mercúrio',
'Gêmeos é o signo da mente em movimento — curioso, versátil e capaz de conectar pontos que outros nem enxergam. Quem nasce aqui tem o dom de transitar entre mundos diferentes e fazer essa ponte parecer natural.',
'Com a Lua em Gêmeos, as emoções se processam pelo pensamento — sentir e narrar o sentimento acontecem quase ao mesmo tempo. Há uma necessidade de comunicar o que vive por dentro para que faça sentido.',
'O Ascendente em Gêmeos apresenta ao mundo alguém comunicativo, de raciocínio rápido e difícil de prender numa definição só. A versatilidade é percebida imediatamente — e também a capacidade de adaptar a mensagem para cada público.',
ARRAY['Comunicação e persuasão','Adaptabilidade','Curiosidade intelectual','Capacidade de aprender rápido'],
ARRAY['Dificuldade em manter o foco por muito tempo','Tendência a dispersar energia em muitas frentes'],
ARRAY[
  'Sua mente é seu superpoder. Hoje, deixe ela voar e anote o que surgir.',
  'Uma conversa inesperada pode abrir uma porta importante. Esteja presente nela.',
  'Menos abas abertas, mais profundidade. Escolha uma coisa e mergulhe nela hoje.',
  'Sua capacidade de adaptar o discurso é rara. Use isso conscientemente hoje.',
  'A curiosidade que você tem é o começo de toda descoberta. Siga o fio.',
  'Hoje é dia de conectar pessoas — você tem o talento perfeito para isso.',
  'Duas perspectivas diferentes cabem em você ao mesmo tempo. Isso é força, não contradição.',
  'Escrever o que pensa organiza o que sente. Experimente hoje.',
  'Uma ideia que parece pequena pode ser o início de algo grande. Não descarte.',
  'Seu ritmo mental é mais rápido que o da maioria. Tenha paciência com quem processa devagar.'
],3),

('cancer','Câncer','♋','Água','Cardinal','Lua',
'Câncer é o signo da memória e do acolhimento — sensível, protetor e profundamente ligado às raízes e às pessoas que ama. Quem tem o Sol aqui carrega uma inteligência emocional que poucos signos alcançam.',
'Com a Lua em Câncer — seu domicílio — as emoções são vividas com intensidade máxima. Há uma memória afetiva poderosa e uma necessidade genuína de se sentir em casa, seja no espaço físico ou nos relacionamentos.',
'O Ascendente em Câncer projeta ao mundo uma aura de acolhimento e gentileza. As pessoas se sentem à vontade ao redor de quem tem esse ascendente, mesmo sem saber exatamente o motivo — é a energia que emana.',
ARRAY['Empatia e sensibilidade','Intuição aguçada','Lealdade e dedicação','Memória afetiva rica'],
ARRAY['Tendência a guardar mágoas por tempo demais','Oscilação emocional intensa'],
ARRAY[
  'Cuidar dos outros é sua natureza — mas hoje, cuide também de você.',
  'A intuição que você tem é um dado. Confie nela antes de buscar a lógica.',
  'Ambientes seguros produzem seu melhor. Se o ambiente não serve, crie um.',
  'Uma conversa honesta com alguém de confiança alivia mais do que qualquer análise solitária.',
  'O passado informa, mas não define. Hoje, escolha como quer se sentir.',
  'Seu cuidado genuíno transforma relacionamentos. Não subestime esse dom.',
  'Soltar o que já não serve é um ato de amor próprio. Hoje pode ser esse dia.',
  'Criatividade e emoção andam juntas em você. Use isso a favor do que está construindo.',
  'Fronteiras saudáveis protegem sua energia sem afastar as pessoas certas.',
  'Hoje, permita-se sentir sem precisar explicar ou justificar.'
],4),

('leao','Leão','♌','Fogo','Fixo','Sol',
'Leão é o signo da expressão e da generosidade — vibrante, criativo e com um calor humano que atrai as pessoas como gravidade. Quem nasce aqui foi feito para brilhar, e brilha mais quando eleva quem está ao redor.',
'Com a Lua em Leão, as emoções precisam de reconhecimento para se sentir plenas. Há uma necessidade de ser visto e valorizado que, quando satisfeita com saúde, gera uma generosidade emocional extraordinária.',
'O Ascendente em Leão apresenta ao mundo alguém de presença marcante, natural-born performer. A entrada numa sala não passa despercebida — há uma energia que comanda atenção mesmo quando não há intenção de fazê-lo.',
ARRAY['Criatividade e expressividade','Generosidade de espírito','Liderança carismática','Lealdade inabalável'],
ARRAY['Necessidade excessiva de aprovação externa','Dificuldade em dividir o protagonismo'],
ARRAY[
  'Seu brilho é mais intenso quando ilumina os outros também.',
  'Hoje, faça algo que te orgulhe — não pelo reconhecimento, mas pela satisfação interna.',
  'Criatividade pede palco. Dê espaço para o que está querendo se expressar em você.',
  'Liderar com generosidade é diferente de liderar com controle. Qual você quer praticar hoje?',
  'A lealdade que você entrega merece o mesmo de volta. Observe quem está à altura.',
  'Pequenos gestos de grandeza fazem mais diferença do que grandes declarações.',
  'Hoje é dia de se divertir — de verdade, sem culpa.',
  'Seu coração grande é seu maior ativo. Não deixe que situações difíceis o fechem.',
  'Reconhecer o talento dos outros não diminui o seu. Pelo contrário.',
  'A confiança que você tem em si mesmo é contagiante. Espalhe isso hoje.'
],5),

('virgem','Virgem','♍','Terra','Mutável','Mercúrio',
'Virgem é o signo da análise e do serviço — detalhista, competente e com uma necessidade interna de contribuir de forma concreta e eficiente. Quem tem o Sol aqui raramente entrega algo pela metade.',
'Com a Lua em Virgem, as emoções são processadas de forma analítica — sentir e examinar o sentimento são partes do mesmo movimento. Há uma tendência ao autocuidado através da utilidade e do fazer.',
'O Ascendente em Virgem projeta precisão e competência. O mundo vê alguém organizado, confiável nos detalhes e que raramente promete o que não pode entregar — uma imagem que gera credibilidade duradoura.',
ARRAY['Atenção e precisão nos detalhes','Competência e confiabilidade','Capacidade analítica aguçada','Ética de trabalho sólida'],
ARRAY['Autocrítica excessiva que paralisa','Dificuldade em aceitar imperfeições'],
ARRAY[
  'Feito é melhor do que perfeito. Entregue o que está bom o suficiente.',
  'Sua atenção aos detalhes protege muita gente sem que ninguém perceba. Isso tem valor.',
  'Hoje, aplique sua análise a uma solução — não a um problema em loop.',
  'O autocuidado não é detalhe — é a base de tudo que você entrega ao mundo.',
  'Confie no seu processo. Você chega lá, sempre chega.',
  'Ajudar de forma prática é uma das suas formas de amor. Reconheça isso como dom.',
  'Hoje é bom dia pra organizar algo que estava acumulando. A leveza que vem depois vale.',
  'Nem tudo precisa de análise. Algumas coisas só precisam ser sentidas.',
  'Sua capacidade de melhoria é infinita — mas você não precisa usar tudo de uma vez.',
  'O rigor que você aplica a si mesmo pode ser oferecido com mais gentileza amanhã.'
],6),

('libra','Libra','♎','Ar','Cardinal','Vênus',
'Libra é o signo da harmonia e da justiça — diplomático, estético e com uma inteligência social que transforma conflito em diálogo. Quem nasce aqui tem o dom de enxergar todos os lados antes de tomar partido.',
'Com a Lua em Libra, as emoções se orientam pela qualidade das relações. Há uma sensibilidade ao desequilíbrio nos vínculos e uma necessidade genuína de paz e reciprocidade nos laços que cultiva.',
'O Ascendente em Libra apresenta ao mundo alguém charmoso, elegante e com uma capacidade natural de colocar os outros à vontade. A primeira impressão é de equilíbrio — mesmo que internamente o caos exista.',
ARRAY['Senso de justiça e equidade','Habilidade diplomática','Estética e bom gosto refinado','Capacidade de mediar conflitos'],
ARRAY['Indecisão crônica diante de escolhas importantes','Tendência a evitar confrontos necessários'],
ARRAY[
  'Equilíbrio não é ausência de tensão — é saber navegar por ela. Você sabe.',
  'Hoje, tome uma decisão que está pendente. Qualquer direção é melhor que a paralisia.',
  'Sua habilidade de mediar é um dom. Use-a hoje em algo que importa.',
  'Beleza e harmonia no ambiente afetam seu estado interno. Cuide do espaço ao redor.',
  'Dizer não com elegância também é uma forma de diplomacia.',
  'Relacionamentos saudáveis pedem reciprocidade. Observe onde ela existe de verdade.',
  'Sua percepção do belo é aguçada. Deixe-a guiar uma criação hoje.',
  'Equidade começa consigo mesmo. Você está sendo justo com suas próprias necessidades?',
  'Hoje, priorize a qualidade de uma conexão em vez da quantidade delas.',
  'A harmonia que você busca nos outros começa dentro de você.'
],7),

('escorpiao','Escorpião','♏','Água','Fixo','Plutão',
'Escorpião é o signo da profundidade e da transformação — intenso, perceptivo e capaz de ir onde outros não têm coragem de olhar. Quem tem o Sol aqui raramente fica na superfície de nada — seja na vida, nos relacionamentos ou em si mesmo.',
'Com a Lua em Escorpião, as emoções têm profundidade de oceano. Há uma intensidade afetiva que pode assustar quem não está preparado, mas que também gera vínculos de uma lealdade e cumplicidade raramente vistas em outros signos.',
'O Ascendente em Escorpião projeta um magnetismo discreto e poderoso. O mundo sente que há mais por trás do que é mostrado — e geralmente está certo. Esse mistério atrai e ao mesmo tempo cria uma distância saudável dos superficiais.',
ARRAY['Percepção e intuição profundas','Resiliência e capacidade de se reinventar','Lealdade e intensidade nos vínculos','Coragem para enfrentar o que outros evitam'],
ARRAY['Tendência ao ciúme e ao controle','Dificuldade em perdoar e soltar'],
ARRAY[
  'Sua profundidade é um presente raro. Hoje, compartilhe um pouco dela com quem merece.',
  'Soltar o que não serve mais é uma forma de poder — não de perda.',
  'Você enxerga o que está nas entrelinhas. Use isso para construir, não para desconfiar.',
  'Transformação não precisa ser drástica para ser real. Pequenas mudanças internas mudam tudo.',
  'A intensidade que você carrega pode ser canal para criar algo extraordinário hoje.',
  'Confie na sua percepção — ela raramente mente quando você a ouve sem ego.',
  'Vulnerabilidade seletiva é sabedoria, não fraqueza. Escolha bem com quem se abre.',
  'O poder de se reinventar que você tem é seu bem mais precioso.',
  'Hoje, observe o que os outros não estão dizendo. Você tem esse talento.',
  'Profundidade não é peso — é substância. E você tem de sobra.'
],8),

('sagitario','Sagitário','♐','Fogo','Mutável','Júpiter',
'Sagitário é o signo da expansão e da busca — otimista, filosófico e com uma sede de experiência que o mundo inteiro não consegue saciar completamente. Quem nasce aqui veio pra aprender, explorar e compartilhar o que descobriu.',
'Com a Lua em Sagitário, as emoções pedem liberdade e horizonte. Há uma necessidade de sentido e de movimento — o confinamento afetivo sufoca, enquanto espaço e aventura recarregam.',
'O Ascendente em Sagitário projeta entusiasmo e uma energia contagiante de quem está sempre a caminho de algo. O mundo vê um aventureiro nato — e frequentemente vai atrás porque quer ir junto.',
ARRAY['Otimismo genuíno e contagiante','Visão ampla e filosófica','Abertura para o novo','Generosidade e boa-fé'],
ARRAY['Dificuldade em comprometer-se com detalhes','Excesso de otimismo que ignora riscos reais'],
ARRAY[
  'O horizonte que você enxerga existe — siga em direção a ele.',
  'Entusiasmo sem plano é energia desperdiçada. Hoje, una os dois.',
  'Uma conversa com alguém de perspectiva completamente diferente pode te surpreender.',
  'Liberdade e responsabilidade coexistem. Você pode ter as duas.',
  'Seu otimismo é real — não o troque por cinismo emprestado de outros.',
  'Hoje é bom dia pra aprender algo novo sobre um tema que te fascina.',
  'A aventura não precisa ser longe. Às vezes está numa rua diferente do seu caminho de volta.',
  'Generosidade de espírito é a sua marca. Mantenha-a mesmo quando cansar.',
  'Grandes visões precisam de pequenos passos. Dê um hoje.',
  'O que você está buscando começa a aparecer quando você pára de correr.'
],9),

('capricornio','Capricórnio','♑','Terra','Cardinal','Saturno',
'Capricórnio é o signo da construção de longo prazo — disciplinado, ambicioso e com uma maturidade que frequentemente aparece antes da hora. Quem nasce aqui sabe que o tempo é aliado, não inimigo.',
'Com a Lua em Capricórnio, as emoções são vividas com discrição e muitas vezes expressas através de ações concretas. Cuidar de responsabilidades é uma forma de amor — mesmo que nem sempre seja percebida como tal.',
'O Ascendente em Capricórnio projeta seriedade e competência. O mundo vê alguém confiável, de palavra e que carrega peso com dignidade — uma imagem que inspira respeito mesmo antes de qualquer conquista ser apresentada.',
ARRAY['Disciplina e perseverança','Responsabilidade e confiabilidade','Visão de longo prazo','Capacidade de transformar esforço em resultado'],
ARRAY['Exigência excessiva consigo e com outros','Dificuldade em relaxar e aproveitar o caminho'],
ARRAY[
  'Disciplina consistente constrói mais do que motivação episódica. Você sabe disso.',
  'Hoje, reconheça o quanto você já construiu. Celebrar também faz parte.',
  'Resultado de qualidade leva tempo — e você tem paciência pra isso quando precisa.',
  'Sua credibilidade é um ativo que levou anos pra construir. Proteja-a.',
  'Permitir-se descansar sem culpa é parte do plano de longo prazo.',
  'Uma pequena vitória de hoje é degrau para a grande conquista de amanhã.',
  'Pedir ajuda não é fraqueza — é eficiência. Hoje, aceite o suporte oferecido.',
  'O que você entrega com rigor reflete quem você é. Isso importa.',
  'Ambição com propósito é diferente de ambição vazia. Qual guia o seu hoje?',
  'Você tem mais reservas do que percebe. Confie na sua própria resistência.'
],10),

('aquario','Aquário','♒','Ar','Fixo','Urano',
'Aquário é o signo da inovação e da coletividade — visionário, original e com uma antena apontada para o futuro que frequentemente não cabe no presente. Quem tem o Sol aqui veio para questionar e redesenhar estruturas que já não servem.',
'Com a Lua em Aquário, as emoções são vividas com certa distância intelectual — não por frieza, mas por uma necessidade de entender o que sente antes de mergulhar. O afeto é genuíno, mas se expressa de formas originais.',
'O Ascendente em Aquário projeta originalidade e independência. O mundo vê alguém que não segue fórmulas prontas e que carrega uma energia de futuro — isso atrai os curiosos e confunde os que preferem o previsível.',
ARRAY['Originalidade e visão inovadora','Pensamento independente','Capacidade de enxergar padrões e sistemas','Comprometimento com ideais coletivos'],
ARRAY['Distância emocional que pode afastar vínculos','Teimosia intelectual quando convicto'],
ARRAY[
  'Sua visão de futuro está à frente do seu tempo. Isso é presente, não problema.',
  'Hoje, questione uma regra que você segue por hábito, não por convicção.',
  'Inovação não precisa de aprovação pra ser válida. Siga o que faz sentido pra você.',
  'Conexões com pessoas diferentes alimentam sua mente mais do que círculos homogêneos.',
  'O coletivo precisa de vozes que pensam diferente. A sua é necessária.',
  'Hoje é bom dia pra dar forma a uma ideia que ficou só na cabeça.',
  'Humanidade e originalidade coexistem em você. Celebre essa combinação rara.',
  'Nem toda ideia revolucionária precisa ser grande. Pequenas disrupções também mudam o mundo.',
  'Liberdade intelectual é sua necessidade básica. Cuide de protegê-la.',
  'O que parece estranho hoje pode ser norma amanhã. Você já sabe disso.'
],11),

('peixes','Peixes','♓','Água','Mutável','Netuno',
'Peixes é o signo da dissolução e da compaixão — intuitivo, criativo e com uma porosidade para o mundo ao redor que pode ser superpoder ou vulnerabilidade, dependendo de como é manejada. Quem nasce aqui sonha acordado e frequentemente tem acesso a dimensões que os outros mal tocam.',
'Com a Lua em Peixes, as emoções chegam em ondas e se mesclam facilmente com as do ambiente. Há uma empatia tão profunda que a fronteira entre o próprio sentimento e o sentimento alheio às vezes some — daí a importância de cuidar da própria energia.',
'O Ascendente em Peixes projeta suavidade e uma aura de mistério gentil. O mundo vê alguém difícil de definir completamente — há sempre mais camadas por baixo, e isso cria uma fascinação duradoura em quem se aproxima.',
ARRAY['Empatia e compaixão profundas','Criatividade e imaginação fértil','Intuição e sensibilidade espiritual','Capacidade de se adaptar e fluir'],
ARRAY['Tendência a escapar da realidade quando difícil','Dificuldade em estabelecer limites com outros'],
ARRAY[
  'Sua imaginação é uma ferramenta de criação — use-a hoje de forma concreta.',
  'Empatia sem fronteira drena. Hoje, sinta o outro sem perder a si mesmo.',
  'A intuição que você tem é real. Ouça-a antes de ouvir a opinião de todo mundo.',
  'Sonhar é seu dom — mas hoje, traga um sonho um passo mais perto da realidade.',
  'Descanso não é fuga — é recarga necessária. Permita-se.',
  'Criatividade e espiritualidade andam juntas em você. Explore essa conexão hoje.',
  'O que você sente sobre uma situação é uma informação valiosa. Não ignore.',
  'Dizer não com gentileza também é uma forma de cuidado — com você e com o outro.',
  'Sua sensibilidade capta o que os outros perdem. Use isso para criar conexões reais.',
  'Às vezes a resposta que você procura está no silêncio. Encontre-o hoje.'
],12)

ON CONFLICT (slug) DO UPDATE SET
  nome                 = EXCLUDED.nome,
  descricao_solar      = EXCLUDED.descricao_solar,
  descricao_lunar      = EXCLUDED.descricao_lunar,
  descricao_ascendente = EXCLUDED.descricao_ascendente,
  pontos_fortes        = EXCLUDED.pontos_fortes,
  desafios             = EXCLUDED.desafios,
  mensagens_diarias    = EXCLUDED.mensagens_diarias;

-- ───────────────────────────────────────────────────────────────────
-- 5. Seed — interpretações planeta × signo
-- ───────────────────────────────────────────────────────────────────
INSERT INTO astrologia_planeta_signo (planeta, signo, influencia) VALUES
-- Mercúrio
('Mercúrio','Áries','Raciocínio direto e comunicação sem rodeios — vai ao ponto antes que outros terminem a pergunta.'),
('Mercúrio','Touro','Pensa com calma e fala com peso — as palavras chegam depois de bem processadas, e por isso convencem.'),
('Mercúrio','Gêmeos','Mente ágil, curiosa e capaz de acompanhar várias conversas ao mesmo tempo com facilidade natural.'),
('Mercúrio','Câncer','Comunicação marcada pela intuição e pela memória afetiva — sente o subtexto antes de ouvir a frase.'),
('Mercúrio','Leão','Expressão criativa e envolvente, com um talento nato para contar histórias que prendem a atenção.'),
('Mercúrio','Virgem','Análise precisa e comunicação organizada — cada detalhe tem seu lugar e nada passa despercebido.'),
('Mercúrio','Libra','Diplomacia e equilíbrio na fala — ouve os dois lados antes de emitir qualquer opinião.'),
('Mercúrio','Escorpião','Percepção afiada do que não é dito — a mente vai fundo e raramente aceita respostas superficiais.'),
('Mercúrio','Sagitário','Pensamento expansivo e filosófico, com facilidade para conectar ideias de campos diferentes.'),
('Mercúrio','Capricórnio','Comunicação prática e objetiva — foca no que é útil e evita o que não agrega resultado.'),
('Mercúrio','Aquário','Raciocínio original e não-linear, capaz de soluções que ninguém antes havia considerado.'),
('Mercúrio','Peixes','Intuição e imaginação moldam o pensamento — a lógica emocional frequentemente supera a racional.'),
-- Vênus
('Vênus','Áries','Amor direto e apaixonado — vai atrás do que deseja sem esperar permissão ou sinal.'),
('Vênus','Touro','Afeto demonstrado através da presença física e dos prazeres compartilhados — lento, mas profundo.'),
('Vênus','Gêmeos','Atração pela troca intelectual — a conversa estimulante é tão sedutora quanto qualquer outra coisa.'),
('Vênus','Câncer','Amor profundamente ligado ao acolhimento e à construção de um lar emocional seguro.'),
('Vênus','Leão','Romance grandioso e generoso — gosta de celebrar quem ama e ser celebrado com a mesma intensidade.'),
('Vênus','Virgem','Afeto expresso em atos de cuidado e utilidade — o amor aqui é preciso e cheio de atenção.'),
('Vênus','Libra','Harmonia e beleza como linguagem do amor — busca parceiros que sejam também companheiros de alma.'),
('Vênus','Escorpião','Paixão intensa e vínculos de total entrega — ou há profundidade, ou não há interesse real.'),
('Vênus','Sagitário','Amor pela liberdade e pela aventura compartilhada — parceiro precisa ser também companheiro de jornada.'),
('Vênus','Capricórnio','Afeto demonstrado através de comprometimento e confiabilidade — o amor aqui constrói algo duradouro.'),
('Vênus','Aquário','Atração pela originalidade e pela amizade como base do amor — vínculos com liberdade e respeito mútuo.'),
('Vênus','Peixes','Romance idealizado e com profunda empatia — ama com a alma inteira e frequentemente antes da razão.'),
-- Marte
('Marte','Áries','Energia em alta e ação sem hesitação — quando quer algo, vai buscar com força total.'),
('Marte','Touro','Determinação constante e resistência impressionante — lento para começar, mas quase impossível de parar.'),
('Marte','Gêmeos','Energia canalizada pelo intelecto — bate-papo, debate e movimento mental são o combustível.'),
('Marte','Câncer','Luta pelo que protege — a motivação vem dos vínculos e do que sente que precisa defender.'),
('Marte','Leão','Coragem expressiva e competitiva — age com estilo e quer que o esforço seja reconhecido.'),
('Marte','Virgem','Energia metódica e eficiente — prefere fazer bem feito a fazer rápido e refazer depois.'),
('Marte','Libra','Motivação voltada para a justiça e o equilíbrio — luta por causas que considera corretas.'),
('Marte','Escorpião','Determinação silenciosa e estratégica — a intensidade da ação vai até o fim, sem recuo.'),
('Marte','Sagitário','Energia expansiva e entusiasta — empreende com confiança e inspira os outros no processo.'),
('Marte','Capricórnio','Ambição disciplinada e de longo prazo — trabalha duro, de forma consistente, até chegar lá.'),
('Marte','Aquário','Energia canalizada para inovar e questionar — age diferente do esperado e com propósito coletivo.'),
('Marte','Peixes','Motivação intuitiva e criativa — age quando sente que é a hora certa, raramente antes.'),
-- Júpiter
('Júpiter','Áries','Expansão pela ousadia — crescimento acontece quando toma a iniciativa e lidera pelo exemplo.'),
('Júpiter','Touro','Prosperidade pelos valores concretos — paciência e consistência atraem recursos de forma duradoura.'),
('Júpiter','Gêmeos','Crescimento pela troca e pelo aprendizado — quanto mais aprende e compartilha, mais expande.'),
('Júpiter','Câncer','Fortuna ligada ao cuidado e à familia — o que cuida e nutre retorna multiplicado.'),
('Júpiter','Leão','Expansão pela expressão e pela generosidade — brilhar de forma genuína abre portas.'),
('Júpiter','Virgem','Crescimento pelo serviço e pela melhoria contínua — a excelência no detalhe atrai grandes oportunidades.'),
('Júpiter','Libra','Prosperidade pelas parcerias e pela diplomacia — as melhores oportunidades chegam em co-criação.'),
('Júpiter','Escorpião','Crescimento pela transformação — as maiores expansões vêm depois das maiores crises.'),
('Júpiter','Sagitário','Abundância natural por onde passa — a fé no futuro e no aprendizado atraem o melhor.'),
('Júpiter','Capricórnio','Expansão pelo mérito e pelo trabalho sólido — o que constrói com rigor tem fundação para crescer.'),
('Júpiter','Aquário','Crescimento pela inovação e pelo coletivo — liderar mudanças traz as maiores realizações.'),
('Júpiter','Peixes','Fortuna pela intuição e pela compaixão — confiar no fluxo e agir com fé traz resultados inesperados.')

ON CONFLICT (planeta, signo) DO UPDATE SET influencia = EXCLUDED.influencia;

-- 0068 patch (aplicado separadamente via Management API):
-- GRANT necessários para acesso anon + tabela de log
GRANT SELECT ON astrologia_signos        TO anon, authenticated;
GRANT SELECT ON astrologia_planeta_signo TO anon, authenticated;
GRANT INSERT ON astrologia_inscricoes    TO anon, authenticated;
GRANT SELECT ON astrologia_inscricoes    TO authenticated;

CREATE TABLE IF NOT EXISTS astrologia_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT        NOT NULL,
  data_nasc   DATE,
  cidade      TEXT,
  signo_solar TEXT,
  resultado   TEXT        NOT NULL CHECK (resultado IN ('sucesso','erro')),
  erro_msg    TEXT,
  user_agent  TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE astrologia_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "astrologia_logs_insert" ON astrologia_logs;
CREATE POLICY "astrologia_logs_insert" ON astrologia_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "astrologia_logs_admin_read" ON astrologia_logs;
CREATE POLICY "astrologia_logs_admin_read" ON astrologia_logs FOR SELECT USING (is_super_admin());
GRANT INSERT ON astrologia_logs TO anon, authenticated;
GRANT SELECT ON astrologia_logs TO authenticated;
