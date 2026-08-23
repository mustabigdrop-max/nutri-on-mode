// SOCIAL ON — Máquina de Conteúdo Diário
// 7 pilares (rotação semanal) + 7 fórmulas de Reel + calendário de 30 dias + banco de hooks

export type DailyPillarId =
  | "mindset" | "treino" | "nutricao" | "business" | "prova_social" | "lifestyle" | "reflexao";

export type DailyPillar = {
  id: DailyPillarId;
  weekdayIndex: number; // 0 = domingo
  weekday: string;
  label: string;
  emoji: string;
  tone: string;
  focus: string;
  product: string;
  funnel: "TOFU" | "MOFU" | "BOFU";
  example: string;
  color: string;
  /** pilar equivalente no schema do calendário (social_content_calendar) */
  dbPillar: "mce_drop" | "bastidor" | "transformacao" | "entretenimento" | "cta";
};

export const DAILY_PILLARS: DailyPillar[] = [
  {
    id: "mindset", weekdayIndex: 1, weekday: "SEG", label: "Mindset", emoji: "🧠",
    tone: "inspiracional-direto", focus: "Crenças, identidade, propósito",
    product: "MCE / nutriON", funnel: "TOFU", color: "#00D4FF", dbPillar: "mce_drop",
    example: "Disciplina não é talento. É arquitetura comportamental.",
  },
  {
    id: "treino", weekdayIndex: 2, weekday: "TER", label: "Treino / Shape", emoji: "💪",
    tone: "agressivo/técnico", focus: "Execução no treino, forma, progressão",
    product: "TrainingON / APEX", funnel: "MOFU", color: "#FF4D6D", dbPillar: "bastidor",
    example: "Clip de treino com dica técnica.",
  },
  {
    id: "nutricao", weekdayIndex: 3, weekday: "QUA", label: "Nutrição Comportamental", emoji: "🍽️",
    tone: "científico + emocional", focus: "O comportamento vem antes do alimento",
    product: "NutriPlan / MCE Audio", funnel: "MOFU", color: "#00FF88", dbPillar: "mce_drop",
    example: "Sua fome nunca foi de comida.",
  },
  {
    id: "business", weekdayIndex: 4, weekday: "QUI", label: "Business", emoji: "📈",
    tone: "direto/CEO", focus: "Prospecção, vendas, disciplina empresarial",
    product: "Business Coaching", funnel: "BOFU", color: "#E8A020", dbPillar: "cta",
    example: "Se não vendeu hoje, a empresa encolheu.",
  },
  {
    id: "prova_social", weekdayIndex: 5, weekday: "SEX", label: "Prova Social", emoji: "📸",
    tone: "storytelling", focus: "Transformação de aluno, antes/depois, número",
    product: "nutriON assinatura", funnel: "BOFU", color: "#A855F7", dbPillar: "transformacao",
    example: "Ele chegou com 95kg e um plano genérico...",
  },
  {
    id: "lifestyle", weekdayIndex: 6, weekday: "SÁB", label: "Lifestyle / Bastidor", emoji: "👨‍👧",
    tone: "autêntico/pai/fé", focus: "Rotina, família, valores, VEMP",
    product: "Autoridade pessoal", funnel: "TOFU", color: "#A78BFA", dbPillar: "bastidor",
    example: "Rotina de sábado com a filha + treino.",
  },
  {
    id: "reflexao", weekdayIndex: 0, weekday: "DOM", label: "MCE Profundo", emoji: "🕯️",
    tone: "reflexivo/espiritual", focus: "Propósito, processo, paciência",
    product: "Marca pessoal", funnel: "TOFU", color: "#F5D5A0", dbPillar: "mce_drop",
    example: "Se apaixone pelo processo.",
  },
];

export const pillarForToday = (d: Date = new Date()): DailyPillar =>
  DAILY_PILLARS.find((p) => p.weekdayIndex === d.getDay()) || DAILY_PILLARS[0];

export const pillarById = (id: string) => DAILY_PILLARS.find((p) => p.id === id);

// ─────────────────────────── FÓRMULAS DE REEL ───────────────────────────

export type ReelFormula = {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  structure: string[];
  examples: string[];
  why: string;
};

export const REEL_FORMULAS: ReelFormula[] = [
  {
    id: "mito", emoji: "💥", label: "Mito Destruído", hint: "maior viralização",
    why: "Contradição no hook trava o scroll e gera comentário.",
    structure: [
      "HOOK (0-2s): \"Você acha que [crença popular]. Tá errado.\"",
      "CORPO (10-15s): destruir o mito com argumento forte",
      "PUNCH (2-3s): frase de impacto final",
      "CTA: \"Segue pra não cair nessa de novo.\"",
    ],
    examples: [
      "Você acha que precisa de motivação pra treinar. Tá errado.",
      "Você acha que dieta é sobre comida. Tá errado.",
      "Você acha que consistência é talento. Tá errado.",
      "Você acha que empreender é ter ideia boa. Tá errado.",
    ],
  },
  {
    id: "pov", emoji: "👁️", label: "POV", hint: "identificação instantânea",
    why: "O espectador se vê na cena — compartilhamento alto.",
    structure: [
      "HOOK (0-2s): \"POV: [situação que o público vive]\"",
      "CORPO: clip seu fazendo a coisa, texto na tela sincronizado com a batida",
      "PUNCH: frase MCE no final",
    ],
    examples: [
      "POV: você acorda 5h e todo mundo acha que é loucura",
      "POV: seu amigo pede dica de dieta e você monta o plano inteiro",
      "POV: você treina há 10 anos e ainda ama o processo",
      "POV: você é empreendedor e ninguém entende sua rotina",
    ],
  },
  {
    id: "antes_depois", emoji: "🤯", label: "Antes/Depois com Twist", hint: "prova social",
    why: "O twist tira o foco do peso e coloca no comportamento — vende sem vender.",
    structure: [
      "HOOK: frame \"antes\" com texto \"X meses atrás\"",
      "CORPO: transição pro \"depois\" no beat drop",
      "TWIST: texto final que NÃO fala de peso — \"A mudança real: ele parou de se sabotar.\"",
      "CTA: \"Quer o sistema? Link na bio.\"",
    ],
    examples: ["Aluno", "Você mesmo", "O negócio"],
  },
  {
    id: "lista", emoji: "📋", label: "Lista Rápida", hint: "alta retenção",
    why: "Contagem cria loop aberto — o espectador fica até o fim.",
    structure: [
      "HOOK: \"3 coisas que [resultado] que ninguém fala\"",
      "CORPO: 1... 2... 3... (3-4s cada, corte seco)",
      "PUNCH: \"A 4ª tá no meu perfil. Segue.\"",
    ],
    examples: [
      "3 coisas que fizeram meu shape mudar que não são dieta",
      "3 hábitos de CEO que todo coach deveria ter",
      "3 sinais que seu comportamento tá te sabotando",
    ],
  },
  {
    id: "resposta", emoji: "💬", label: "Resposta a Comentário/DM", hint: "gera mais DM",
    why: "Interação + autoridade + prova de que você responde.",
    structure: [
      "HOOK: print do comentário/DM na tela",
      "CORPO: você respondendo olhando pra câmera (15-20s)",
      "PUNCH: frase MCE",
      "CTA: \"Manda sua dúvida na DM.\"",
    ],
    examples: ["coach, como mudo minha mentalidade?", "quanto custa o acompanhamento?"],
  },
  {
    id: "edit", emoji: "✂️", label: "Edit Viral", hint: "sem falar nada",
    why: "Rewatch alto e alcance de quem não segue.",
    structure: [
      "HOOK: 1 frame impactante (shape, prep, rotina)",
      "CORPO: 5-8 frames rápidos (0.3-0.8s) no beat da trend",
      "PUNCH: frame final parado 2s — \"O processo é o produto.\" + @diogo.mell0",
    ],
    examples: ["Treino", "Meal prep", "Rotina do dia"],
  },
  {
    id: "tela_preta", emoji: "⬛", label: "Tela Preta", hint: "polêmico/engaja",
    why: "Curiosidade extrema no hook e engajamento nos comentários.",
    structure: [
      "HOOK: tela preta, texto branco grande — \"A verdade que nenhum coach vai te falar.\"",
      "CORPO: você falando direto na câmera frontal, luz natural, sem filtro",
      "PUNCH: \"É isso. Faz o que quiser com essa informação.\"",
      "CTA: \"Concorda? Comenta.\"",
    ],
    examples: [
      "A verdade que nenhum coach vai te falar.",
      "A diferença entre quem muda e quem não muda.",
      "Transformação é sistema. Não é motivação.",
    ],
  },
];

export const formulaById = (id: string) => REEL_FORMULAS.find((f) => f.id === id);

/** Fórmula sugerida por pilar (default do dia) */
export const DEFAULT_FORMULA_BY_PILLAR: Record<DailyPillarId, string> = {
  mindset: "mito",
  treino: "edit",
  nutricao: "pov",
  business: "lista",
  prova_social: "antes_depois",
  lifestyle: "pov",
  reflexao: "tela_preta",
};

// ─────────────────────────── CALENDÁRIO 30 DIAS ───────────────────────────

export type CalendarDay = {
  day: number;
  weekday: string;
  pillar: DailyPillarId;
  formula: string;
  hook: string;
  notes?: string;
  product: string;
  funnel: "TOFU" | "MOFU" | "BOFU";
};

export const CALENDAR_30: CalendarDay[] = [
  { day: 1, weekday: "SEG", pillar: "mindset", formula: "mito", hook: "Você acha que disciplina é dom. Tá errado.", notes: "Disciplina é arquitetura comportamental. Você constrói o sistema que te faz agir mesmo sem vontade. Isso é o MCE. CTA: segue pra entender o método.", product: "MCE", funnel: "TOFU" },
  { day: 2, weekday: "TER", pillar: "treino", formula: "edit", hook: "Frame de costas dupla (pose)", notes: "6 frames de treino no beat. Texto final: \"16 anos de processo.\"", product: "Shape/autoridade", funnel: "TOFU" },
  { day: 3, weekday: "QUA", pillar: "nutricao", formula: "pov", hook: "POV: você descobre que sua fome nunca foi de comida", notes: "Clip de prep + tela do NutriPlan. Punch: o comportamento vem antes do alimento.", product: "NutriPlan", funnel: "MOFU" },
  { day: 4, weekday: "QUI", pillar: "business", formula: "lista", hook: "3 hábitos que mudaram meu negócio", notes: "1. Prospectar todo dia. 2. Review financeira toda sexta. 3. Conteúdo diário sem desculpa.", product: "Business Coaching", funnel: "TOFU" },
  { day: 5, weekday: "SEX", pillar: "prova_social", formula: "antes_depois", hook: "3 meses atrás ele não acreditava em si.", notes: "Twist: a mudança real foi instalar um sistema. CTA: manda DM 'MCE'.", product: "nutriON assinatura", funnel: "BOFU" },
  { day: 6, weekday: "SÁB", pillar: "lifestyle", formula: "pov", hook: "POV: sábado de pai que é coach, militar e empreendedor", notes: "Rotina: treino + filha + prep + trabalho.", product: "Autoridade pessoal", funnel: "TOFU" },
  { day: 7, weekday: "DOM", pillar: "reflexao", formula: "tela_preta", hook: "O que ninguém fala sobre transformação.", notes: "Todo mundo quer o resultado, ninguém quer o processo. Se apaixone pelo processo.", product: "Marca pessoal", funnel: "TOFU" },

  { day: 8, weekday: "SEG", pillar: "mindset", formula: "resposta", hook: "Print: \"coach, como mudo minha mentalidade?\"", notes: "Mentalidade não é pensamento positivo.", product: "MCE Audio Academy", funnel: "MOFU" },
  { day: 9, weekday: "TER", pillar: "treino", formula: "lista", hook: "3 erros no treino que travam seu shape", notes: "1. Sem periodização (STRATUM). 2. Sem feeder sets. 3. Sem tracking de volume.", product: "TrainingON", funnel: "MOFU" },
  { day: 10, weekday: "QUA", pillar: "nutricao", formula: "mito", hook: "Você acha que cortar carbo emagrece. Tá errado.", product: "NutriPlan", funnel: "MOFU" },
  { day: 11, weekday: "QUI", pillar: "business", formula: "pov", hook: "POV: você é empreendedor e ninguém entende por que trabalha no domingo", product: "Business Coaching", funnel: "TOFU" },
  { day: 12, weekday: "SEX", pillar: "prova_social", formula: "resposta", hook: "Aluno: \"Eu tentei de tudo...\"", notes: "Depoimento com o aluno falando.", product: "nutriON", funnel: "BOFU" },
  { day: 13, weekday: "SÁB", pillar: "lifestyle", formula: "edit", hook: "Rotina completa em 20s", notes: "Treino + prep + filha + trabalho + oração.", product: "Autoridade", funnel: "TOFU" },
  { day: 14, weekday: "DOM", pillar: "reflexao", formula: "tela_preta", hook: "A diferença entre quem muda e quem não muda.", product: "MCE", funnel: "TOFU" },

  { day: 15, weekday: "SEG", pillar: "mindset", formula: "mito", hook: "Motivação não funciona. Ciência prova.", notes: "CTA: link na bio — MCE Audio gratuito por 14 dias.", product: "nutriON trial", funnel: "BOFU" },
  { day: 16, weekday: "TER", pillar: "treino", formula: "edit", hook: "7 camadas. Do macrociclo até a fibra muscular.", notes: "Screen recording do TrainingON com STRATUM.", product: "TrainingON", funnel: "MOFU" },
  { day: 17, weekday: "QUA", pillar: "nutricao", formula: "pov", hook: "POV: seu nutricionista te dá PDF e some por 30 dias", notes: "Tela do PRAXIS respondendo em tempo real. Punch: seu protocolo responde. 24h.", product: "PRAXIS/nutriON", funnel: "MOFU" },
  { day: 18, weekday: "QUI", pillar: "business", formula: "mito", hook: "Você acha que precisa de mais clientes. Tá errado. Precisa de mais sistema.", product: "Business Coaching", funnel: "MOFU" },
  { day: 19, weekday: "SEX", pillar: "prova_social", formula: "lista", hook: "203 áudios. 44.6 horas. 12 autores. 1 sistema. 0 achismo.", notes: "Scroll pela MCE Audio Academy. CTA: 14 dias grátis.", product: "nutriON", funnel: "BOFU" },
  { day: 20, weekday: "SÁB", pillar: "lifestyle", formula: "edit", hook: "Rotina real de sábado", product: "Autoridade", funnel: "TOFU" },
  { day: 21, weekday: "DOM", pillar: "reflexao", formula: "tela_preta", hook: "Transformação é sistema. Não é motivação.", product: "MCE", funnel: "TOFU" },

  { day: 22, weekday: "SEG", pillar: "mindset", formula: "tela_preta", hook: "Desafio 30 Dias nutriON. Entra ou fica olhando.", notes: "Explicar o desafio rápido. CTA: link na bio, entrada gratuita.", product: "Desafio", funnel: "BOFU" },
  { day: 23, weekday: "TER", pillar: "treino", formula: "edit", hook: "Seu personal não faz isso.", notes: "Screen recording: demo do APEX analisando pose.", product: "APEX/nutriON", funnel: "MOFU" },
  { day: 24, weekday: "QUA", pillar: "nutricao", formula: "resposta", hook: "Print: \"quanto custa o acompanhamento?\"", notes: "Explicar valor vs preço.", product: "nutriON Premium", funnel: "BOFU" },
  { day: 25, weekday: "QUI", pillar: "business", formula: "lista", hook: "O que fiz essa semana no meu negócio", notes: "Transparência total com números.", product: "Business Coaching", funnel: "MOFU" },
  { day: 26, weekday: "SEX", pillar: "prova_social", formula: "edit", hook: "Resultados dessa semana.", notes: "5-8 prints/fotos de alunos em 15s.", product: "nutriON", funnel: "BOFU" },
  { day: 27, weekday: "SÁB", pillar: "lifestyle", formula: "pov", hook: "Fé + propósito: o sábado que sustenta a semana", product: "VEMP", funnel: "TOFU" },
  { day: 28, weekday: "DOM", pillar: "reflexao", formula: "tela_preta", hook: "1 mês. 28 Reels. Se você assistiu até aqui, já sabe: o processo é o produto.", product: "Marca pessoal", funnel: "TOFU" },
  { day: 29, weekday: "SEG", pillar: "prova_social", formula: "lista", hook: "Ranking parcial do Desafio 30 Dias.", product: "Desafio/nutriON", funnel: "BOFU" },
  { day: 30, weekday: "TER", pillar: "reflexao", formula: "edit", hook: "30 dias. 30 Reels. O que aconteceu.", notes: "Compilação do mês.", product: "Todos", funnel: "BOFU" },
];

// ─────────────────────────── BANCO DE HOOKS ───────────────────────────

export type DailyHook = { text: string; category: string; pillar: DailyPillarId };

export const HOOK_BANK_30: DailyHook[] = [
  ...[
    "Disciplina não é dom. É sistema.",
    "Você não precisa de motivação. Precisa de estrutura.",
    "A identidade vem antes do resultado.",
    "Pare de se preparar pra começar. Comece.",
    "O medo de mudar é biológico. A decisão de mudar é sua.",
  ].map((text) => ({ text, category: "Mindset", pillar: "mindset" as DailyPillarId })),
  ...[
    "16 anos de treino. O que aprendi em 1 frase.",
    "Seu treino não funciona porque não tem sistema.",
    "Feeder set: por que você deveria começar leve.",
    "Ninguém fala isso sobre periodização.",
    "Shape é consequência. O processo é o produto.",
  ].map((text) => ({ text, category: "Treino / Shape", pillar: "treino" as DailyPillarId })),
  ...[
    "Sua fome nunca foi de comida.",
    "O comportamento vem antes do alimento.",
    "Dieta falha porque trata o sintoma, não a causa.",
    "Você não precisa de mais informação. Precisa de sistema.",
    "PDF de dieta não funciona. E seu nutricionista sabe.",
  ].map((text) => ({ text, category: "Nutrição", pillar: "nutricao" as DailyPillarId })),
  ...[
    "Se não vendeu hoje, a empresa encolheu hoje.",
    "Prospecção não é opção. É higiene.",
    "Cobrar barato não é humildade. É descrença.",
    "Planejar demais é procrastinar com elegância.",
    "3 números. Todo dia. Sem desculpa.",
  ].map((text) => ({ text, category: "Business", pillar: "business" as DailyPillarId })),
  ...[
    "A verdade que nenhum coach quer falar.",
    "Pare de seguir gente que te faz sentir bem e não te faz agir.",
    "Motivação é o crack do empreendedor.",
    "90% dos coaches não usam o que vendem.",
    "O mercado fitness te mente todo dia.",
  ].map((text) => ({ text, category: "Polêmicos", pillar: "reflexao" as DailyPillarId })),
  ...[
    "16 anos de marinha me ensinaram uma coisa.",
    "Sou pai. Sou coach. Sou empreendedor. Durmo 6h.",
    "Eu era o cara que planejava demais e executava pouco.",
    "A fé e a disciplina são a mesma coisa.",
    "Se apaixone pelo processo.",
  ].map((text) => ({ text, category: "Pessoais", pillar: "lifestyle" as DailyPillarId })),
];

// ─────────────────────────── STORIES ───────────────────────────

export const STORIES_STRATEGY = [
  { id: "bastidor", emoji: "🎥", label: "Bastidor", desc: "Treino, prep, trabalho, com a filha. Celular na mão, sem texto elaborado.", example: "O dia começa aqui." },
  { id: "micro", emoji: "⚡", label: "Micro-conteúdo", desc: "Frase MCE em card visual, dica rápida de 15s ou print de resultado.", example: "Frase MCE do dia" },
  { id: "cta", emoji: "🔗", label: "CTA", desc: "Enquete, quiz, link ou DM trigger.", example: "Manda 'MCE' que eu te explico" },
];

export const DAILY_RULE = [
  "1 REEL obrigatório — 15-40s, hook nos 2 primeiros segundos",
  "1 Carrossel ou foto (dias alternados) — educacional ou prova social",
  "3 Stories obrigatórios — bastidor + micro-conteúdo + CTA",
  "Total: 20-30 min de produção por dia",
];

export const FUNNEL_RULE = "TOFU 60% · MOFU 25% · BOFU 15% — nunca mais de 2 posts de venda por semana.";
