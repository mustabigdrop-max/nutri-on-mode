export const NICHES = [
  "Fitness / Bodybuilding",
  "Nutrição esportiva",
  "Coaching / Mentoria",
  "Empreendedorismo fitness",
  "Paternidade ativa",
  "Lifestyle / Moda",
  "Motivação / Mindset",
];

export const PRODUCTS = [
  "nutriON (plataforma de coaching)",
  "VEMP (marca de roupa fitness)",
  "MindForce (creatina 100% pura)",
  "Consultoria individual",
  "Curso online",
  "E-book",
];

export const DIFFERENTIALS = [
  "Atleta IFBB Classic Physique",
  "16 anos Marinha do Brasil",
  "Método próprio (MCE)",
  "Plataforma tech própria (nutriON)",
  "Pai (conteúdo familiar)",
  "Representatividade (negro)",
];

export const FUNNELS = [
  { id: "tofu", emoji: "🔝", label: "TOPO", sub: "Audiência · Seguidores" },
  { id: "mofu", emoji: "🔄", label: "MEIO", sub: "Engajar · Confiança" },
  { id: "bofu", emoji: "💰", label: "FUNDO", sub: "Vender · Converter" },
] as const;

export const FORMATS = [
  { id: "reel", emoji: "🎬", label: "Reel" },
  { id: "carrossel", emoji: "📸", label: "Carrossel" },
  { id: "stories", emoji: "📱", label: "Stories" },
  { id: "post", emoji: "📝", label: "Post" },
] as const;

export const OBJECTIVES = [
  { id: "seguidores", emoji: "👥", label: "Ganhar seguidores" },
  { id: "curtidas", emoji: "💬", label: "Ganhar curtidas" },
  { id: "shares", emoji: "📤", label: "Ganhar shares" },
  { id: "salvamentos", emoji: "💾", label: "Ganhar salvamentos" },
  { id: "vendas", emoji: "💰", label: "Vender produto" },
  { id: "cliques", emoji: "🔗", label: "Cliques no link" },
] as const;

export const CONTENT_PRODUCTS = [
  { id: "nutriON", emoji: "📱", label: "nutriON" },
  { id: "VEMP", emoji: "👕", label: "VEMP" },
  { id: "MindForce", emoji: "💊", label: "MindForce" },
  { id: "Consultoria", emoji: "🏋️", label: "Consultoria" },
] as const;

export const VISUAL_PALETTE = [
  { hex: "#020205", note: "fundo dark" },
  { hex: "#00D4FF", note: "cyan — destaque" },
  { hex: "#00FF88", note: "green — ação/resultado" },
  { hex: "#FFB800", note: "gold — atenção/premium" },
  { hex: "#FFFFFF", note: "texto principal" },
];

export const VISUAL_TYPOGRAPHY = [
  "Títulos: Rajdhani Bold (ou similar)",
  "Texto: Inter / Arial",
  "Dados: Space Mono",
];

export const VISUAL_RULES = [
  "Feed dark = destaque imediato",
  "Cyan nas palavras-chave",
  "Consistência = profissionalismo",
  "Logo nutriON no canto dos carrosséis",
];

export const ACTION_PLAN: { period: string; items: string[] }[] = [
  {
    period: "HOJE",
    items: [
      "Trocar bio pela opção escolhida",
      "Organizar destaques (9 categorias)",
      "Gravar 1 Reel trend + edit",
      "Postar 8 Stories de rotina",
    ],
  },
  {
    period: "ESTA SEMANA",
    items: [
      "7 Reels (mix definido pelo funil)",
      "56 Stories (8/dia)",
      "1 Carrossel MCE educativo",
      "Primeira menção MindForce natural",
    ],
  },
  {
    period: "ESTE MÊS",
    items: [
      "Estabelecer série recorrente",
      "Collab com 2 perfis do nicho",
      "Review de métricas semanal",
    ],
  },
];

export const IDEAL_MIX = {
  educativo: 30,
  pessoal: 25,
  prova_social: 15,
  entretenimento: 20,
  venda: 10,
};

export const ACADEMY_TRACKS: { id: string; title: string; lessons: string[] }[] = [
  {
    id: "trilha_1",
    title: "TRILHA 1 — PERFIL PROFISSIONAL",
    lessons: [
      "Bio otimizada",
      "Foto de perfil profissional",
      "Destaques organizados (9 categorias)",
      "Link na bio configurado",
      "Nome otimizado pra busca",
    ],
  },
  {
    id: "trilha_2",
    title: "TRILHA 2 — FUNDAMENTOS DE CONTEÚDO",
    lessons: [
      "Pilares de conteúdo definidos",
      "Mix de funil configurado",
      "Série recorrente criada",
      "Paleta visual definida",
      "Templates salvos",
    ],
  },
  {
    id: "trilha_3",
    title: "TRILHA 3 — REELS QUE VIRALIZAM",
    lessons: [
      "Estrutura do hook (0-2s)",
      "Tipos de edit (trend, transição, POV, talking head)",
      "Fisheye, wide angle, slow motion",
      "Tipografia e texto na tela",
      "Áudios trend vs voz original",
      "Duração ideal por objetivo",
      "Horários de postagem",
    ],
  },
  {
    id: "trilha_4",
    title: "TRILHA 4 — COPYWRITING E PERSUASÃO",
    lessons: [
      "Hooks que param o scroll",
      "Legendas por funil (TOFU/MOFU/BOFU)",
      "10 gatilhos de neuromarketing",
      "Storytelling com dados",
      "CTA que converte",
      "Princípios de Cialdini aplicados",
      "Psicologia das cores e tipografia",
    ],
  },
  {
    id: "trilha_5",
    title: "TRILHA 5 — ESTRATÉGIA DE VENDAS",
    lessons: [
      "Funil completo (TOFU→MOFU→BOFU)",
      "Esteira de produtos",
      "Social selling (vender sem parecer venda)",
      "DM strategy (como converter no privado)",
      "Collab strategy (parceria com outros perfis)",
      "Métricas que importam (shares > likes)",
    ],
  },
  {
    id: "trilha_6",
    title: "TRILHA 6 — EDIÇÃO PRO",
    lessons: [
      "CapCut: fisheye, lens, velocidade",
      "Transições que retêm atenção",
      "Sincronizar cortes com batida",
      "Legendas automáticas (font, cor, posição)",
      "Thumbnails que geram clique",
      "Filtros e cor grading pra feed consistente",
    ],
  },
];

export type LadderProduct = {
  id: string;
  emoji: string;
  name: string;
  price: string;
  frequency: string;
  ideas: { emoji: string; title: string; funnel: string; objective: string; topic: string; format: string }[];
  rules: string[];
};

export const PRODUCT_LADDER: LadderProduct[] = [
  {
    id: "conteudo",
    emoji: "🆓",
    name: "Conteúdo Instagram (MCE Drops, bastidor, trends)",
    price: "Gratuito",
    frequency: "Diário",
    ideas: [
      { emoji: "🎬", title: "Reel MCE Drop educativo", funnel: "tofu", objective: "seguidores", topic: "MCE Drop: um conceito por Reel", format: "reel" },
      { emoji: "📱", title: "Story bastidor da rotina", funnel: "tofu", objective: "curtidas", topic: "Bastidor: rotina real do dia", format: "stories" },
    ],
    rules: [
      "Entregar valor sem pedir nada em troca",
      "Consistência diária vale mais que perfeição",
      "Sempre reforçar o método MCE pelo nome",
    ],
  },
  {
    id: "mindforce",
    emoji: "💊",
    name: "MindForce Creatina",
    price: "R$ 49",
    frequency: "2-3 menções/semana (natural)",
    ideas: [
      { emoji: "🎬", title: "Reel “A creatina que eu uso e por quê”", funnel: "mofu", objective: "curtidas", topic: "A creatina que eu uso e por quê", format: "reel" },
      { emoji: "📱", title: "Story mostrando na marmita", funnel: "tofu", objective: "curtidas", topic: "Creatina na marmita, product placement natural", format: "stories" },
      { emoji: "🎬", title: "Edit transição normal → pump", funnel: "tofu", objective: "shares", topic: "Transição normal → pump com MindForce", format: "reel" },
      { emoji: "📸", title: "Post educativo “5 mitos sobre creatina”", funnel: "mofu", objective: "salvamentos", topic: "5 mitos sobre creatina", format: "carrossel" },
    ],
    rules: [
      "Nunca promover de forma forçada",
      "Sempre estar USANDO o produto (product placement)",
      "Explicar ciência, não só “compre”",
      "CTA suave: “Link na bio” ou “DM CREATINA”",
    ],
  },
  {
    id: "vemp",
    emoji: "👕",
    name: "VEMP (roupa fitness)",
    price: "R$ 79-149",
    frequency: "2 menções/semana",
    ideas: [
      { emoji: "🎬", title: "Reel treino usando a peça", funnel: "tofu", objective: "seguidores", topic: "Treino pesado usando VEMP (sem falar de venda)", format: "reel" },
      { emoji: "📱", title: "Story “o que eu visto pra treinar”", funnel: "mofu", objective: "cliques", topic: "O que eu visto pra treinar", format: "stories" },
      { emoji: "📸", title: "Carrossel lookbook de treino", funnel: "bofu", objective: "vendas", topic: "Lookbook VEMP com CTA suave", format: "carrossel" },
    ],
    rules: [
      "Roupa aparece em uso, nunca em foto de catálogo",
      "Falar de caimento e performance, não de preço",
      "CTA no story com sticker de link",
    ],
  },
  {
    id: "nutrion",
    emoji: "📱",
    name: "Consultoria nutriON",
    price: "R$ 149-249/mês",
    frequency: "3-4 menções/semana",
    ideas: [
      { emoji: "📱", title: "Sequência de Stories mostrando o app", funnel: "bofu", objective: "vendas", topic: "Screen recording do dashboard e do MCE Audio", format: "stories" },
      { emoji: "🎬", title: "Reel de transformação de aluno", funnel: "mofu", objective: "shares", topic: "12 semanas: MCE Score de 45 pra 91", format: "reel" },
      { emoji: "📸", title: "Carrossel “como funciona o método”", funnel: "mofu", objective: "salvamentos", topic: "Como funciona o Método MCE dentro do nutriON", format: "carrossel" },
    ],
    rules: [
      "Mostrar a tela real do app (prova visual)",
      "Vender o sistema, não o desconto",
      "Sempre CTA duplo: DM + link na bio",
    ],
  },
  {
    id: "mentoria",
    emoji: "🏆",
    name: "Mentoria Individual",
    price: "R$ 497-997",
    frequency: "1-2 menções/semana",
    ideas: [
      { emoji: "🎬", title: "Reel “pra quem NÃO é a mentoria”", funnel: "bofu", objective: "vendas", topic: "Pra quem a mentoria não serve", format: "reel" },
      { emoji: "📱", title: "Story bastidor de call de mentoria", funnel: "bofu", objective: "vendas", topic: "Bastidor de uma call de mentoria", format: "stories" },
    ],
    rules: [
      "Escassez real (vagas limitadas de verdade)",
      "Filtrar público: falar de quem NÃO deve entrar",
      "Conversão acontece na DM, não no post",
    ],
  },
];

export const WEEKLY_CHECKLIST_ITEMS = [
  "Postou Reel viral/trend (TOFU)",
  "Postou Reel educativo MCE (MOFU)",
  "Postou bastidor/pessoal",
  "Postou transformação de cliente",
  "Postou entretenimento/humor",
  "Fez collab com outro perfil",
  "Mencionou MindForce naturalmente",
  "Mencionou VEMP naturalmente",
  "CTA pro nutriON (link na bio)",
  "Respondeu todos os DMs em < 24h",
];

export const BIO_CRITERIA = [
  { key: "nome_busca", label: "Nome otimizado pra busca", weight: 10 },
  { key: "proposta", label: "Proposta de valor em 1 linha", weight: 15 },
  { key: "credencial", label: "Credencial visível", weight: 5 },
  { key: "metodo", label: "Método nomeado (MCE)", weight: 10 },
  { key: "prova", label: "Prova social (resultados)", weight: 10 },
  { key: "cta", label: "CTA claro (ação desejada)", weight: 10 },
  { key: "link", label: "Link funcional", weight: 5 },
  { key: "emojis", label: "Emojis estratégicos", weight: 5 },
];

export const mondayOf = (d = new Date()) => {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date.toISOString().slice(0, 10);
};
