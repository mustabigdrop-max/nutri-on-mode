export type DiagPillar = "M" | "C" | "E";
export type DiagDomain = "TR" | "AL" | "VD";

export interface DiagOption {
  text: string;
  value: 1 | 2 | 3 | 4;
}

export interface DiagQuestion {
  pillar: DiagPillar;
  domain: DiagDomain;
  phase: string;
  emoji: string;
  text: string;
  options: DiagOption[];
}

export const PILLAR_META: Record<DiagPillar, { label: string; emoji: string; color: string; name: string }> = {
  M: { label: "MENTALIDADE", emoji: "🧠", color: "#00D4FF", name: "Mentalidade" },
  C: { label: "COMPORTAMENTO", emoji: "⚡", color: "#B8922A", name: "Comportamento" },
  E: { label: "EXECUÇÃO", emoji: "🎯", color: "#00d4a1", name: "Execução" },
};

export const DOMAIN_META: Record<DiagDomain, { label: string; emoji: string; color: string; name: string; question: string }> = {
  TR: { label: "TREINO", emoji: "🏋️", color: "#00D4FF", name: "Treino", question: "Como está seu treino?" },
  AL: { label: "ALIMENTAÇÃO", emoji: "🍽️", color: "#B8922A", name: "Alimentação", question: "Como está sua alimentação?" },
  VD: { label: "VIDA", emoji: "🔥", color: "#00d4a1", name: "Vida", question: "Como está sua vida?" },
};

export const GOALS = ["Emagrecer", "Ganhar massa", "Saúde e energia", "Performance", "Transformação de vida"];

export const QUESTIONS: DiagQuestion[] = [
  {
    domain: "TR", pillar: "M", phase: "Treino × Mentalidade", emoji: "🏋️",
    text: "Qual é sua relação mental com o treino?",
    options: [
      { text: "Treino é castigo — faço pra compensar o que comi", value: 1 },
      { text: "Vou quando estou motivado, falto quando não estou", value: 2 },
      { text: "Encaro como compromisso, mesmo sem vontade", value: 3 },
      { text: "Treinar é parte da minha identidade — não negocio", value: 4 },
    ],
  },
  {
    domain: "TR", pillar: "C", phase: "Treino × Comportamento", emoji: "🏋️",
    text: "Como é sua consistência no treino ao longo de um mês?",
    options: [
      { text: "Começo animado, na segunda semana já falto", value: 1 },
      { text: "Treino 2-3x por semana mas deveria ser mais", value: 2 },
      { text: "Cumpro a maioria das sessões, falto raramente", value: 3 },
      { text: "Não lembro a última vez que perdi um treino planejado", value: 4 },
    ],
  },
  {
    domain: "TR", pillar: "E", phase: "Treino × Execução", emoji: "🏋️",
    text: "Você registra seus treinos e acompanha progressão de carga?",
    options: [
      { text: "Nunca — faço o que der na hora", value: 1 },
      { text: "Sigo uma ficha mas não anoto cargas", value: 2 },
      { text: "Registro a maioria e tento subir peso", value: 3 },
      { text: "Tudo registrado — periodização, carga, volume, RIR", value: 4 },
    ],
  },
  {
    domain: "AL", pillar: "M", phase: "Alimentação × Mentalidade", emoji: "🍽️",
    text: "Como você pensa sobre comida?",
    options: [
      { text: "Tudo é proibido ou liberado — vivo entre dieta e compulsão", value: 1 },
      { text: "Sei o que deveria comer mas não consigo manter", value: 2 },
      { text: "Tenho uma boa relação mas ainda escorrego sob estresse", value: 3 },
      { text: "Comida é combustível e prazer — sem culpa, sem extremos", value: 4 },
    ],
  },
  {
    domain: "AL", pillar: "C", phase: "Alimentação × Comportamento", emoji: "🍽️",
    text: "O que acontece quando chega sexta-feira à noite?",
    options: [
      { text: "A dieta morre — final de semana é recompensa", value: 1 },
      { text: "Relaxo bastante e compenso na segunda", value: 2 },
      { text: "Flexibilizo com consciência — sei o que estou fazendo", value: 3 },
      { text: "Mantenho o mesmo padrão com escolhas livres planejadas", value: 4 },
    ],
  },
  {
    domain: "AL", pillar: "E", phase: "Alimentação × Execução", emoji: "🍽️",
    text: "Suas refeições são planejadas ou improvisadas?",
    options: [
      { text: "100% improvisadas — como o que aparece na hora", value: 1 },
      { text: "Planejo o café da manhã e o resto é no feeling", value: 2 },
      { text: "A maioria é planejada, com imprevistos pontuais", value: 3 },
      { text: "Preparadas com antecedência — inclusive pra emergências", value: 4 },
    ],
  },
  {
    domain: "VD", pillar: "M", phase: "Vida × Mentalidade", emoji: "🔥",
    text: "Quando algo dá errado na sua vida (trabalho, relacionamento, finanças), como isso afeta sua saúde?",
    options: [
      { text: "Desmorona tudo — paro de treinar, como mal, durmo mal", value: 1 },
      { text: "Afeta bastante — levo semanas pra voltar ao eixo", value: 2 },
      { text: "Oscilo mas consigo separar as áreas razoavelmente", value: 3 },
      { text: "O treino e a alimentação são minha âncora — mantenho quando tudo mais balança", value: 4 },
    ],
  },
  {
    domain: "VD", pillar: "C", phase: "Vida × Comportamento", emoji: "🔥",
    text: "Como é a qualidade do seu sono?",
    options: [
      { text: "Durmo mal quase toda noite — celular, insônia, horário bagunçado", value: 1 },
      { text: "Irregular — alguns dias bem, outros péssimo", value: 2 },
      { text: "Geralmente durmo bem mas tenho dificuldade em manter rotina", value: 3 },
      { text: "Horário consistente, ritual de sono, 7-8h por noite", value: 4 },
    ],
  },
  {
    domain: "VD", pillar: "E", phase: "Vida × Execução", emoji: "🔥",
    text: "Você tem clareza sobre onde quer estar em 6 meses — corpo, carreira, vida pessoal?",
    options: [
      { text: "Não — vivo apagando incêndio, sem direção clara", value: 1 },
      { text: "Tenho uma ideia vaga mas nada concreto", value: 2 },
      { text: "Sei onde quero chegar mas não tenho plano escrito", value: 3 },
      { text: "Metas claras, escritas, com prazos e revisão regular", value: 4 },
    ],
  },
  {
    domain: "TR", pillar: "E", phase: "Avaliação Física", emoji: "🏋️",
    text: "Antes de receber seu treino, alguém avaliou sua postura, identificou assimetrias e criou um protocolo corretivo pra você?",
    options: [
      { text: "Nunca — recebi uma ficha genérica e comecei a treinar", value: 1 },
      { text: "Fizeram anamnese e algumas medidas, mas nada visual ou postural", value: 2 },
      { text: "Tive avaliação postural, mas sem correção integrada ao treino", value: 3 },
      { text: "Sim — análise visual completa com correção de assimetrias e prioridades musculares", value: 4 },
    ],
  },
  {
    domain: "AL", pillar: "E", phase: "Acompanhamento Nutricional", emoji: "🍽️",
    text: "O profissional que cuida da sua alimentação avalia seu comportamento, sua rotina e seus gatilhos emocionais — ou só entrega um plano alimentar?",
    options: [
      { text: "Nunca tive acompanhamento — sigo dietas da internet", value: 1 },
      { text: "Recebi um plano de dieta pronto, sem entender minha rotina", value: 2 },
      { text: "O profissional perguntou sobre minha rotina mas o foco foi só nos macros", value: 3 },
      { text: "Acompanhamento completo — rotina, comportamento, gatilhos, ajustes semanais e suporte contínuo", value: 4 },
    ],
  },
  {
    domain: "AL", pillar: "M", phase: "Autossabotagem", emoji: "🍽️",
    text: "Qual frase mais te representa?",
    options: [
      { text: "\"Já estraguei o dia, vou comer tudo e recomeço amanhã\"", value: 1 },
      { text: "\"Eu sei o que fazer, só não consigo fazer\"", value: 2 },
      { text: "\"Sou consistente mas sinto que poderia mais\"", value: 3 },
      { text: "\"Meu sistema funciona — eu só preciso confiar nele\"", value: 4 },
    ],
  },
  {
    domain: "VD", pillar: "C", phase: "Gestão de Energia", emoji: "🔥",
    text: "Como você gerencia sua energia ao longo do dia?",
    options: [
      { text: "Na base do café e adrenalina — colapso à noite", value: 1 },
      { text: "Tenho altos e baixos sem padrão claro", value: 2 },
      { text: "Conheço meus picos e vales, mas nem sempre respeito", value: 3 },
      { text: "Organizo meu dia respeitando meus ciclos de energia", value: 4 },
    ],
  },
  {
    domain: "TR", pillar: "E", phase: "Integração", emoji: "🏋️",
    text: "Seu treino está conectado com sua nutrição e seus objetivos de vida?",
    options: [
      { text: "Faço as coisas separadas — treino é treino, dieta é dieta", value: 1 },
      { text: "Tento conectar mas falta organização", value: 2 },
      { text: "Nutrição e treino conversam, vida pessoal ainda é separada", value: 3 },
      { text: "Tudo integrado num sistema — treino, nutrição, sono, metas, mentalidade", value: 4 },
    ],
  },
];

export interface DiagAnswer {
  pillar: DiagPillar;
  domain?: DiagDomain;
  question_index: number;
  score: number;
}

export interface DiagScores {
  M: number;
  C: number;
  E: number;
  TR: number;
  AL: number;
  VD: number;
  total: number;
  level: string;
  levelColor: string;
}

export function levelFor(total: number) {
  if (total >= 80) return { level: "Elite", color: "#00D4FF" };
  if (total >= 60) return { level: "Avançado", color: "#00d4a1" };
  if (total >= 40) return { level: "Intermediário", color: "#B8922A" };
  return { level: "Iniciante", color: "#ff4757" };
}

export function scoreOf(answers: DiagAnswer[], filter: (a: DiagAnswer) => boolean) {
  const list = answers.filter(filter);
  if (!list.length) return 0;
  return Math.round((list.reduce((acc, a) => acc + a.score, 0) / (list.length * 4)) * 100);
}

export function computeScores(answers: DiagAnswer[]): DiagScores {
  const M = scoreOf(answers, (a) => a.pillar === "M");
  const C = scoreOf(answers, (a) => a.pillar === "C");
  const E = scoreOf(answers, (a) => a.pillar === "E");
  const TR = scoreOf(answers, (a) => a.domain === "TR");
  const AL = scoreOf(answers, (a) => a.domain === "AL");
  const VD = scoreOf(answers, (a) => a.domain === "VD");
  const total = Math.round((M + C + E) / 3);
  const { level, color } = levelFor(total);
  return { M, C, E, TR, AL, VD, total, level, levelColor: color };
}

type Band = "low" | "mid" | "high";

const DEEP_INSIGHTS: Record<DiagDomain, Record<DiagPillar, Record<Band, string>>> = {
  TR: {
    M: {
      low: "Você enxerga o treino como obrigação, não como construção. Enquanto treinar for moeda de troca — algo que você faz pra 'compensar' — a relação vai ser de sofrimento, não de progresso.",
      mid: "Você vai quando consegue, mas não quando importa. A mentalidade de treino precisa deixar de depender de motivação e virar não-negociável — como escovar os dentes.",
      high: "Treinar é identidade pra você. O refinamento é sutil: aprender a periodizar a intensidade mental, não só a física.",
    },
    C: {
      low: "Sua inconsistência no treino não é preguiça — é falta de sistema. Sem horário fixo, sem roupa separada, sem eliminação de atrito, a ida à academia depende de vontade. Vontade é o recurso mais instável que existe.",
      mid: "Você treina, mas com furos. Cada furo é uma micro-decisão que não deveria existir. O comportamento certo é eliminar a decisão — treino no mesmo horário, mesmos dias, sem exceção negociável.",
      high: "Consistência sólida. O próximo nível é automatizar o entorno — pré-treino pronto, roupa separada, playlist certa — pra que até o dia ruim funcione.",
    },
    E: {
      low: "Você está treinando no escuro — sem registro de carga, sem avaliação do seu corpo e sem saber se o estímulo está certo. Pior: provavelmente ninguém analisou sua postura, identificou suas assimetrias ou verificou se você tem desvios que estão sendo agravados a cada sessão. Um treino inteligente começa com análise visual — postura, simetria, proporções — e constrói a prescrição a partir do que o SEU corpo precisa, não de uma ficha genérica.",
      mid: "Você tem uma ficha e registra parcialmente, mas falta profundidade. A maioria dos profissionais entrega treino sem avaliar postura, assimetrias ou perfil de resistência muscular. Sem isso, a progressão é genérica e os desequilíbrios se acumulam.",
      high: "Execução técnica afiada com registro e progressão. O refinamento é integrar análise postural e de simetria pra garantir que o treino não só constrói mas também corrige.",
    },
  },
  AL: {
    M: {
      low: "Você vive entre restrição e compulsão — o ciclo mais comum e mais destrutivo do fitness. Enquanto existir comida 'proibida', vai existir compulsão. A saída não é mais restrição, é mudar a relação.",
      mid: "Você sabe o que deveria comer mas sob estresse, cansaço ou tédio, a comida vira escape emocional. O gap não é nutricional — é comportamental. Sua fome nunca foi de comida.",
      high: "Relação saudável com alimentação. Sem culpa, sem extremos. O ajuste fino é precisão nos momentos de flexibilidade — saber desviar sem perder o rumo.",
    },
    C: {
      low: "O final de semana destrói 5 dias de esforço. Um churrasco de sábado + pizza de domingo pode anular o déficit calórico da semana inteira. Não é sobre não comer — é sobre não compensar emocionalmente.",
      mid: "Você flexibiliza mas sem estratégia. O segredo é planejar o desvio — escolher conscientemente o que vale a pena e o que não vale, antes de estar na frente da comida.",
      high: "Flexibilidade com consciência. Você sabe quanto custa cada escolha e decide com dados, não com emoção.",
    },
    E: {
      low: "Sua alimentação não tem sistema — nem preparo, nem acompanhamento real. As dietas que você seguiu foram listas de alimentos que ignoraram quem você é: sua rotina, seus horários, seus gatilhos emocionais. Nutrição de verdade começa com um profissional que mapeia seu comportamento ANTES de montar o cardápio — porque o comportamento vem antes do alimento.",
      mid: "Você planeja parcialmente, mas seu acompanhamento provavelmente foca em macros e ignora o comportamento. Quando o profissional entende sua rotina, seus gatilhos e seus padrões de autossabotagem, o plano se adapta à sua vida — não o contrário.",
      high: "Planejamento sólido com algum nível de acompanhamento. O próximo nível é integração total: nutrição que conversa com treino, sono e momento de vida — ajustada semanalmente.",
    },
  },
  VD: {
    M: {
      low: "Quando a vida aperta, você desmorona junto. Treino, alimentação, sono — tudo cai. Isso significa que seu sistema de saúde é frágil, não resiliente. O MCE existe pra que a saúde seja sua âncora, não sua primeira vítima.",
      mid: "Você consegue separar as áreas, mas grandes estresses ainda contaminam tudo. O próximo passo é construir o treino e a alimentação como rituais de estabilidade emocional.",
      high: "Saúde como âncora. Quando a vida fica difícil, você não abandona o sistema — você se apoia nele. Isso é mentalidade de elite.",
    },
    C: {
      low: "Sono ruim é o sabotador silencioso. Ele destrói performance no treino, aumenta a fome, reduz a capacidade de decisão e faz você acordar já perdendo. Nenhum suplemento compensa uma noite mal dormida.",
      mid: "Sono irregular é quase tão ruim quanto sono insuficiente. O corpo precisa de previsibilidade — horário consistente é mais importante que quantidade total.",
      high: "Sono como pilar de performance. O refinamento é otimizar a qualidade — temperatura, luz, ritual de desaceleração — não só a quantidade.",
    },
    E: {
      low: "Sem metas claras, cada dia é reativo. Você apaga incêndios em vez de construir algo. Isso se reflete no corpo: sem direção clara, qualquer dieta serve e nenhuma dura.",
      mid: "Você sabe onde quer chegar mas falta o mapa. Meta sem prazo e sem plano é desejo. Transformação real exige clareza escrita, revisada semanalmente.",
      high: "Clareza de vida gera clareza no corpo. Quando você sabe exatamente onde quer estar em 6 meses, cada treino e cada refeição tem propósito.",
    },
  },
};

function bandOf(score: number): Band {
  return score >= 70 ? "high" : score >= 40 ? "mid" : "low";
}

export function deepInsight(domain: DiagDomain, pillar: DiagPillar, score: number) {
  return DEEP_INSIGHTS[domain][pillar][bandOf(score)];
}

const PILLAR_INSIGHTS: Record<DiagPillar, Record<Band, string>> = {
  M: {
    low: "Sua mentalidade ainda opera no modo tudo-ou-nada: um deslize vira veredito e o processo trava. O primeiro trabalho aqui não é dieta — é reconstruir a leitura que você faz de si mesmo diante do erro.",
    mid: "Você já entende que o resultado depende de você, mas ainda oscila: em dias bons acredita, em dias ruins terceiriza. Consolidar autoeficácia é o próximo passo.",
    high: "Sua mentalidade está madura: você trata erro como dado e assume responsabilidade pelo processo. Esse é o alicerce que permite periodizar de verdade.",
  },
  C: {
    low: "Seu comportamento está sendo decidido pelo ambiente, não por você. Cada refeição vira uma negociação com a força de vontade — e força de vontade esgota. O caminho é arquitetura.",
    mid: "Você já tem algum sistema, mas ele ainda depende demais de disposição. Fechar as brechas de ambiente e gatilhos vale mais do que qualquer ajuste de macro.",
    high: "Seu comportamento é sistematizado: ambiente organizado, refeições planejadas e consciência dos gatilhos. Com essa base, o refinamento rende de verdade.",
  },
  E: {
    low: "A execução é o seu gargalo: existe intenção, mas não existe sistema. Sem plano escrito, constância e números acompanhados, não há como corrigir rota.",
    mid: "Você executa, mas de forma irregular e sem feedback consistente. Falta o ciclo de revisão semanal que transforma esforço em progressão.",
    high: "Sua execução é forte: rotina inegociável e dados sendo usados para ajustar. Aqui o ganho vem de periodização fina e otimização.",
  },
};

export function insightFor(pillar: DiagPillar, score: number) {
  return PILLAR_INSIGHTS[pillar][bandOf(score)];
}

export function weakestPillar(s: { M: number; C: number; E: number }): DiagPillar {
  const arr: [DiagPillar, number][] = [["M", s.M], ["C", s.C], ["E", s.E]];
  arr.sort((a, b) => a[1] - b[1]);
  return arr[0][0];
}

export interface CrossScore {
  domain: DiagDomain;
  pillar: DiagPillar;
  score: number;
}

export function crossScores(answers: DiagAnswer[]): CrossScore[] {
  const out: CrossScore[] = [];
  (["TR", "AL", "VD"] as DiagDomain[]).forEach((d) => {
    (["M", "C", "E"] as DiagPillar[]).forEach((p) => {
      if (!answers.some((a) => a.domain === d && a.pillar === p)) return;
      out.push({ domain: d, pillar: p, score: scoreOf(answers, (a) => a.domain === d && a.pillar === p) });
    });
  });
  return out;
}

export const COACH_WHATSAPP = "5521965802847";

export const DIAGNOSTICO_PATH = "/diagnostico";

export const BIO_UTM = {
  utm_source: "instagram",
  utm_medium: "bio",
  utm_campaign: "mce_diagnostico",
} as const;

export function bioLink(origin = "https://nutrion.app.br") {
  const qs = new URLSearchParams(BIO_UTM).toString();
  return `${origin.replace(/\/$/, "")}${DIAGNOSTICO_PATH}?${qs}`;
}
