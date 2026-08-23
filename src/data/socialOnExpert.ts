// SOCIAL ON — Nível Expert: conteúdo estratégico estático

export const REPURPOSE_PIECES = [
  { key: "carrossel", icon: "📸", label: "Carrossel (5 slides)" },
  { key: "stories", icon: "📱", label: "Stories (sequência de 4)" },
  { key: "legenda", icon: "💬", label: "Legenda de post (foto única)" },
  { key: "reel_curto", icon: "🎬", label: "Reel curto (15s)" },
  { key: "thread", icon: "💬", label: "Thread (3-5 comentários próprios)" },
  { key: "live", icon: "📝", label: "Script pra Live (10 min)" },
  { key: "repost_30d", icon: "🔁", label: "Repost em 30 dias" },
] as const;

export const ORIGINAL_FORMATS = ["Reel", "Carrossel", "Story", "Post estático", "Live"];

export type DmStage = {
  n: number;
  title: string;
  subtitle: string;
  lead?: string;
  wrong?: string;
  wrongWhy?: string;
  right: string;
  why: string;
};

export const DM_SCENARIOS = [
  "Pessoa mandou DM perguntando sobre consultoria",
  "Pessoa respondeu story do desafio",
  "Lead frio que só curte os posts",
  "Ex-aluno que parou o acompanhamento",
  "Indicação de outro aluno",
];

export const DM_STAGES: DmStage[] = [
  {
    n: 1,
    title: "CONEXÃO",
    subtitle: "não vender ainda",
    lead: '"Oi, vi seu Reel sobre dieta. Quanto custa a consultoria?"',
    wrong: "R$ 249/mês. Quer assinar?",
    wrongWhy: "Mata a conversa. Sem conexão. Sem valor percebido.",
    right:
      "Fala! 💪 Que bom que chamou.\nAntes de te falar sobre valores, me conta: qual é o maior desafio que você tá enfrentando hoje com alimentação/treino?",
    why: "Cialdini — reciprocidade. Você demonstra interesse ANTES de vender. A pessoa sente que você se importa.",
  },
  {
    n: 2,
    title: "DIAGNÓSTICO",
    subtitle: "entender a dor",
    lead: '"Não consigo manter dieta. Sempre desisto na 3ª semana."',
    right:
      "Isso é mais comum do que você imagina. E te digo: o problema não é falta de vontade.\n\nNa verdade, tem um dado científico que explica exatamente isso: Baumeister, de Princeton, provou que a força de vontade ACABA durante o dia. Na 3ª semana, o cérebro cansa de decidir.\n\nPor isso eu criei o MCE — um sistema que não depende de vontade. Funciona por design.\n\nPosso te mostrar como funciona na prática?",
    why: 'Autoridade (ciência) + Validação (não é culpa dela) + Open loop ("posso te mostrar" = curiosidade).',
  },
  {
    n: 3,
    title: "DEMONSTRAÇÃO",
    subtitle: "mostrar o nutriON",
    right:
      "Olha, vou te mandar um vídeo de 40 segundos mostrando o que meus alunos veem no app.\n[screen recording do nutriON]\n\nIsso é o NutrySync — o sistema ajusta suas calorias automaticamente todo dia baseado no seu treino, sono, rotina e até clima.\n\nNenhum outro coach no Brasil oferece isso.",
    why: "Prova visual + Exclusividade + Diferenciação.",
  },
  {
    n: 4,
    title: "OFERTA",
    subtitle: "agora sim",
    right:
      "O acompanhamento funciona assim:\n\n✅ Plano alimentar personalizado\n✅ NutrySync (ajuste automático diário)\n✅ MCE Audio (conteúdo na minha voz)\n✅ Substituições inteligentes\n✅ Suporte direto comigo\n\nInvestimento: R$ 249/mês.\n\nMas olha: eu não pego qualquer pessoa. Preciso saber se você tá comprometido de verdade. Se tiver, a gente começa essa semana.",
    why: 'Valor antes do preço + Escassez ("não pego qualquer pessoa") + Qualificação reversa (ELE precisa provar que merece).',
  },
  {
    n: 5,
    title: "OBJEÇÃO",
    subtitle: "se tiver",
    right:
      "Use o Handler de Objeções ao lado: identifique a objeção real, valide o sentimento, faça o reframe e feche com um próximo passo concreto.",
    why: "Objeção não é 'não' — é pedido de mais informação.",
  },
];

export type Objection = {
  key: string;
  label: string;
  wrong?: string;
  wrongWhy?: string;
  answer: string;
  triggers: string;
};

export const OBJECTIONS: Objection[] = [
  {
    key: "caro",
    label: '"Tá caro"',
    wrong: "Posso fazer um desconto",
    wrongWhy: "Desvaloriza o serviço. Mostra desespero.",
    answer:
      "Entendo. Investimento é uma decisão séria.\n\nMe deixa te fazer uma conta rápida: R$ 249/mês ÷ 30 dias = R$ 8,30/dia.\n\nVocê gasta mais que isso em café ou delivery. A diferença é que o café não muda seu corpo.\n\nAgora pensa: quanto você já gastou com dietas que não funcionaram? Suplementos aleatórios? Planos que largou em 2 semanas?\n\nO MCE não é despesa. É o investimento que faz todos os outros pararem de ser desperdiçados.",
    triggers: "Reframe de valor + Comparação + Custo da inação + Ancoragem",
  },
  {
    key: "pensar",
    label: '"Vou pensar"',
    answer:
      "Claro! Pensa com calma. Mas deixa eu te perguntar uma coisa: o que exatamente você precisa pensar? É sobre o investimento, sobre o método, ou sobre se é o momento certo?\n\nPergunto porque normalmente quando alguém diz 'vou pensar' é porque tem uma dúvida específica que eu posso resolver agora.",
    triggers: 'Especificação (força a pessoa a revelar a objeção real por trás do "vou pensar")',
  },
  {
    key: "tempo",
    label: '"Não tenho tempo"',
    wrong: "É rapidinho, só 10 minutinhos por dia",
    wrongWhy: "Minimiza a dor da pessoa sem resolver o problema real.",
    answer:
      "Justamente por isso o sistema existe. Quem tem tempo sobrando improvisa. Quem não tem, precisa de estrutura.\n\nO nutriON decide por você: o plano já vem pronto, as substituições são automáticas e o ajuste diário acontece sozinho. Seu trabalho é executar, não planejar.\n\nMe fala uma coisa: quantos minutos por dia você já perde decidindo o que comer?",
    triggers: "Reframe (falta de tempo = motivo pra contratar) + Redução de esforço",
  },
  {
    key: "ja_tentei",
    label: '"Já tentei dieta e não funciona"',
    answer:
      "Faz total sentido. Se já tentou e não funcionou, por que funcionaria agora, né?\n\nA resposta: porque o que você tentou antes era DIETA. E dieta sozinha tem taxa de falha altíssima.\n\nO MCE não é dieta. É reprogramação de comportamento + nutrição + acompanhamento diário por um sistema que nenhum outro coach no Brasil tem.\n\n[manda antes/depois de cliente]\n\nEssa pessoa também já tinha tentado tudo. O que mudou? O MÉTODO.",
    triggers: "Validação + Diferenciação + Prova social",
  },
  {
    key: "sozinho",
    label: '"Consigo fazer sozinho"',
    answer:
      "Consegue mesmo. A pergunta não é se você consegue — é em quanto tempo e com quantos erros.\n\nEu treino há 16 anos e ainda tenho quem me acompanhe. Não por falta de conhecimento: por causa do ponto cego. Ninguém enxerga o próprio padrão.\n\nSe em 90 dias sozinho você não chegou onde queria, o problema não é informação. É sistema.",
    triggers: "Concordância + Autoridade pessoal + Custo do tempo perdido",
  },
  {
    key: "barato_internet",
    label: '"Tem mais barato na internet"',
    answer:
      "Tem sim. E tem de graça também.\n\nA diferença é que planilha genérica não olha pro seu treino de hoje, pro seu sono e nem ajusta suas calorias quando o peso trava.\n\nVocê não tá comparando preço, tá comparando duas coisas diferentes. Uma é arquivo. A outra é acompanhamento.",
    triggers: "Diferenciação + Reframe de categoria",
  },
  {
    key: "amigo_nutri",
    label: '"Meu amigo é nutricionista"',
    answer:
      "Ótimo, aproveita! Nutricionista é fundamental.\n\nO que eu faço é diferente e complementar: comportamento, execução diária e ajuste automático. A maioria das pessoas não falha no cálculo — falha na hora de executar num dia ruim.\n\nSe seu amigo cuida do plano, eu cuido de você cumprir o plano.",
    triggers: "Não confrontar + Reposicionar categoria + Complementaridade",
  },
  {
    key: "mes_que_vem",
    label: '"Vou começar mês que vem"',
    answer:
      "Entendo. Mas te faço uma pergunta honesta: o que vai estar diferente no mês que vem?\n\nNa prática, quem começa segunda geralmente começa na outra segunda. E aí são 4 semanas a menos de resultado.\n\nComeçar hoje com 70% é melhor que começar nunca com 100%. A gente ajusta no caminho.",
    triggers: "Urgência real + Custo da procrastinação + Redução de barreira",
  },
  {
    key: "conjuge",
    label: '"Preciso falar com minha esposa/marido"',
    answer:
      "Faz todo sentido, decisão de casal se conversa mesmo.\n\nSó pra te ajudar nessa conversa: qual seria a principal dúvida dele(a)? Preço ou resultado?\n\nSe quiser, te mando um resumo curtinho do que está incluso pra você mostrar. Assim ninguém decide no escuro.",
    triggers: "Validação + Antecipação da objeção do terceiro + Suporte",
  },
  {
    key: "preco_aqui",
    label: '"Manda o preço por aqui mesmo"',
    answer:
      "Mando sim, sem enrolação. Só que preço sem contexto não te ajuda a decidir.\n\nMe responde 1 coisa antes: seu objetivo hoje é emagrecer, ganhar massa ou recomposição?\n\nCom isso eu te digo qual formato faz sentido e o valor exato dele.",
    triggers: "Transparência + Micro-compromisso + Qualificação",
  },
];

export const BATCHING_BLOCKS = [
  {
    title: "BLOCO 1 — TALKING HEAD",
    time: "30 min",
    meta: ["Local: em casa, fundo limpo ou dark", "Roupa: VEMP (product placement)"],
    items: [
      '"16 anos de Marinha me ensinaram..." (TOFU)',
      '"Por que você come quando não tem fome" (MOFU)',
      '"3 erros na dieta de cutting" (MOFU)',
      '"O que meus alunos veem no nutriON" (BOFU)',
      '"A verdade sobre creatina" (TOFU + MindForce)',
    ],
    tip: "Grava todos SEM trocar de roupa nem setup. Muda só o ângulo levemente entre cada um.",
    output: "5 Reels talking head",
  },
  {
    title: "BLOCO 2 — TREINO",
    time: "60 min",
    meta: ["Filmar durante o treino real"],
    items: ["8-10 clips de 10-15s por exercício", "1 selfie pump pós-treino", "1 vídeo caminhando/falando ao sair"],
    output: "3 Reels edit + 5 Stories",
  },
  {
    title: "BLOCO 3 — COMIDA",
    time: "20 min",
    meta: [],
    items: ["Foto do meal prep (timelapse 30s)", "4 fotos de pratos diferentes (ângulo 45°)", "1 vídeo preparando com narração"],
    output: "1 Reel + 4 Stories + 1 carrossel",
  },
  {
    title: "BLOCO 4 — PESSOAL",
    time: "15 min",
    meta: [],
    items: ["3 fotos/vídeos com a filha", "1 vídeo lifestyle (casa, rotina, café)"],
    output: "1 Reel pessoal + 3 Stories",
  },
];

export const BATCHING_TOTAL = "~2 horas de gravação = 10 Reels + 1 Carrossel + 13 Stories = CONTEÚDO PRA 2 SEMANAS";

export const COMMENT_TEMPLATES = [
  {
    comment: "Ótimo conteúdo!",
    wrong: "Obrigado! 🙏",
    wrongWhy: "mata a conversa",
    right:
      "Valeu! Me conta: qual o maior desafio que você tá enfrentando na dieta? Talvez eu consiga te ajudar aqui mesmo.",
    rightWhy: "abre conversa",
  },
  {
    comment: "Quanto custa a consultoria?",
    wrong: "R$ 249! Link na bio",
    wrongWhy: "frio, transacional",
    right: "Manda DM que te explico tudo com calma! Quero entender seu caso antes. 💪",
    rightWhy: "leva pro DM",
  },
  {
    comment: "Você toma bomba?",
    wrong: "Ignorar ou ficar bravo",
    wrongWhy: "perde a chance de reframe",
    right: "Shape é 16 anos de consistência. Se tivesse atalho, todo mundo teria. O atalho é não ter atalho. 💪⚓",
    rightWhy: "reframe com autoridade",
  },
  {
    comment: "Isso funciona pra quem tem 40+?",
    wrong: "Funciona sim!",
    wrongWhy: "resposta rasa, sem prova",
    right:
      "Funciona ainda melhor. Depois dos 40 o que muda é a margem de erro — e é justamente aí que sistema vence improviso. Tenho alunos nessa faixa com os melhores resultados. Quer ver um caso?",
    rightWhy: "prova + open loop",
  },
];

export const SELF_COMMENT_TIP =
  'Logo após publicar, comente no seu próprio post: "Qual desses pontos mais te pegou? Comenta 1, 2 ou 3". Isso sobe o post no algoritmo + gera engajamento.';

export const SEASONAL_CALENDAR = [
  { month: 1, name: "JANEIRO", theme: "Ano novo, corpo novo", notes: ["Maior mês de vendas. BOFU pesado.", 'Reel: "O que fazer DIFERENTE esse ano"', 'CTA: "Vagas abertas — DM QUERO"'] },
  { month: 3, name: "MARÇO", theme: "Pré-verão / Carnaval body", notes: ['"Ainda dá tempo pro carnaval?"', "Transformações rápidas como prova social"] },
  { month: 5, name: "MAIO", theme: "Dia das Mães", notes: ['Se tem clientes mulheres: "Mãe que treina"', "Conteúdo emocional performa bem"] },
  { month: 6, name: "JUNHO", theme: "Inverno / Bulking season", notes: ['"O shape do verão se constrói no inverno"', "Conteúdo sobre bulking, não desistir no frio"] },
  { month: 8, name: "AGOSTO", theme: "Dia dos Pais", notes: ["SEU momento. Pai + atleta. Edit com a filha.", "Potencial viral altíssimo. Preparar 3 Reels."] },
  { month: 9, name: "SETEMBRO", theme: "Retomada pós-inverno", notes: ['"Começar agora = estar pronto pro verão"', "Desafio 30 Dias fecha em dezembro (timing perfeito)"] },
  { month: 11, name: "NOVEMBRO", theme: "Black Friday", notes: ["Promoção nutriON + MindForce + VEMP", '"Black Friday MCE: combo completo"'] },
  { month: 12, name: "DEZEMBRO", theme: "Verão + festas", notes: ['"Como sobreviver ao natal sem destruir o shape"', "Conteúdo leve, humor, bastidor de festa fitness"] },
];

export const UGC_STRATEGIES = [
  {
    title: "1. STORY GENERATOR (já existe no nutriON!)",
    items: [
      "Cada Story que o cliente gera com MCE Score, @diogo.mell0 e nutrion.app.br é UGC automático",
      'Incentivar: "+5 pontos MCE por story postado"',
    ],
  },
  {
    title: "2. DESAFIO DE FOTO DO PRATO",
    items: ['"Posta seu prato nutriON com #MCEPlate e me marca — o melhor da semana ganha 1 mês free"'],
  },
  {
    title: "3. DEPOIMENTO EM VÍDEO",
    items: ['Pedir a clientes com bons resultados: "Grava 30 segundos contando sua experiência"', "Postar como Reel (com permissão)"],
  },
  {
    title: "4. COLLAB POST",
    items: ["Instagram permite post compartilhado", "Postar transformação como COLLAB com o cliente", "O post aparece nos 2 perfis = 2x alcance"],
  },
  {
    title: "5. HASHTAG PRÓPRIA",
    items: ["#TeamMCE ou #nutriONResults", "Clientes postam usando a hashtag", "Você reposta nos Stories = reconhecimento"],
  },
];

export const UGC_REQUEST_TEMPLATE =
  "Fala [nome]! Seu resultado tá incrível.\nPosso postar sua evolução no meu Instagram?\nSe quiser, grava um vídeo curto (30s) contando como foi sua experiência. Seria demais! 💪";

export const SITUATIONS = [
  { key: "caminhando", icon: "🚶", label: "Caminhando" },
  { key: "academia", icon: "🏋️", label: "Na academia" },
  { key: "cozinhando", icon: "🍳", label: "Cozinhando" },
  { key: "filha", icon: "👨‍👧", label: "Com a filha" },
  { key: "correndo", icon: "🏃", label: "Correndo" },
  { key: "barra", icon: "💪", label: "Fazendo barra" },
  { key: "casa", icon: "🏠", label: "Em casa" },
  { key: "carro", icon: "🚗", label: "No carro" },
  { key: "cafe", icon: "☕", label: "Tomando café" },
  { key: "dormir", icon: "🌙", label: "Antes de dormir" },
];
