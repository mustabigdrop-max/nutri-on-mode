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

// ─────────── NÍVEL HARD: formatos granulares, tom, horários e checklist ───────────

export type FormatOption = { id: string; emoji: string; label: string; sub: string };

export const FORMAT_GROUPS: { group: string; emoji: string; options: FormatOption[] }[] = [
  {
    group: "FOTO",
    emoji: "📸",
    options: [
      { id: "foto_unica", emoji: "📷", label: "Foto única", sub: "legenda faz o trabalho" },
      { id: "carrossel_fotos", emoji: "📸", label: "Carrossel de fotos", sub: "2-10 slides" },
      { id: "foto_legenda_forte", emoji: "📝", label: "Foto + legenda forte", sub: "texto longo" },
    ],
  },
  {
    group: "VÍDEO",
    emoji: "🎬",
    options: [
      { id: "edit", emoji: "🎬", label: "Edit", sub: "fotos + transição" },
      { id: "talking_head", emoji: "🗣️", label: "Talking head", sub: "falando" },
      { id: "clips_treino", emoji: "✂️", label: "Clips curtos", sub: "treino" },
      { id: "screen_recording", emoji: "📱", label: "Screen recording", sub: "app" },
      { id: "pov", emoji: "👁️", label: "POV", sub: "câmera subjetiva" },
      { id: "timelapse", emoji: "⏩", label: "Timelapse", sub: "meal prep" },
    ],
  },
  {
    group: "STORIES",
    emoji: "📱",
    options: [
      { id: "stories_foto", emoji: "📱", label: "Stories foto", sub: "sequência" },
      { id: "stories_video", emoji: "🎥", label: "Stories vídeo", sub: "bastidor" },
      { id: "stories_interacao", emoji: "📊", label: "Stories interação", sub: "enquete/quiz" },
    ],
  },
];

export const ALL_FORMATS: FormatOption[] = FORMAT_GROUPS.flatMap((g) => g.options);

export const formatLabel = (id: string) =>
  ALL_FORMATS.find((f) => f.id === id)?.label ?? id.replace(/_/g, " ");

// Instrução específica enviada ao motor de geração por formato
export const FORMAT_BRIEFS: Record<string, string> = {
  foto_unica:
    "Foto parada: a LEGENDA carrega o conteúdo. Legenda longa com números específicos e prova de consistência. Inclua dicas de foto (proporção 4:5, iluminação lateral de cima, ângulo, edição com valores de contraste/claridade/saturação, app sugerido, composição pela regra dos terços) e um self-comment pronto.",
  carrossel_fotos:
    "Carrossel: entregue slide a slide. SLIDE 1 é capa em TEXTO grande (nunca foto do coach) com subtexto de curiosidade. Slides 2-4 desenvolvem os pontos com dado científico. Slide final é CTA (salva/manda) com @handle e nutrion.app.br.",
  foto_legenda_forte:
    "Foto única com legenda longa em formato de storytelling; a primeira linha precisa parar o scroll mesmo sem vídeo.",
  edit:
    "Edit de fotos com música: entregue a sequência FRAME a FRAME com marcação de tempo (ex: FRAME 1 0.0-0.5s), o que aparece, transição usada e texto na tela. Inclua dicas de CapCut (transições, auto beat sync, fisheye, slow zoom, velocity, fonte Anton/Bebas, ajustes de cor) e legenda curta.",
  talking_head:
    "Vídeo falando: setup (ângulo, fundo, andar enquanto fala, iluminação), HOOK 0-3s, desenvolvimento 3-25s, CTA 25-30s e pós-produção (legendas automáticas, cortar pausas, zoom leve a cada 5-7s, música lo-fi baixa).",
  clips_treino:
    "Clips curtos de treino: liste os clipes a filmar (exercício, ângulo, duração), ordem de montagem, texto na tela por clipe e legenda.",
  screen_recording:
    "Gravação de tela do nutriON: entregue a sequência de TELAS com marcação de tempo, o voiceover de cada tela, textos na tela e CTA final. Foque nos diferenciais (NutrySync, MCE Audio, substituições).",
  pov:
    "POV câmera subjetiva: descreva o ponto de vista, movimento de câmera, o que entra em cena, texto na tela e legenda curta.",
  timelapse:
    "Timelapse (meal prep/rotina): descreva setup de câmera fixa, etapas capturadas, velocidade, música, textos na tela e legenda.",
  stories_foto:
    "Sequência de 5 stories em foto: para cada um informe visual, texto e gatilho.",
  stories_video:
    "Sequência de 5 stories em vídeo: para cada um informe o que gravar, fala curta e gatilho.",
  stories_interacao:
    "Sequência de 5 stories de interação usando stickers diferentes (enquete, quiz com resposta certa, slider, caixinha de perguntas, contagem regressiva). Informe visual, texto e sticker de cada um.",
};

export const TONES = [
  { id: "agressivo", emoji: "🔥", label: "Agressivo", sub: "Direto, sem frescura" },
  { id: "cientifico", emoji: "🧠", label: "Científico", sub: "Dados e pesquisa" },
  { id: "emocional", emoji: "❤️", label: "Emocional", sub: "Storytelling, vulnerável" },
  { id: "humor", emoji: "😂", label: "Humor", sub: "Leve, trend" },
  { id: "militar", emoji: "⚓", label: "Militar", sub: "Comando, Marinha" },
  { id: "pai", emoji: "👨‍👧", label: "Pai", sub: "Família, ternura" },
] as const;

export const TONE_BRIEFS: Record<string, string> = {
  agressivo: "Tom agressivo e direto: frases curtas, confronto amistoso, zero rodeio.",
  cientifico: "Tom científico: cite mecanismos e autores reais, sem virar aula chata.",
  emocional: "Tom emocional: storytelling em primeira pessoa, vulnerabilidade real.",
  humor: "Tom com humor: leve, autoirônico, referências de trend, sem perder autoridade.",
  militar: "Tom militar: linguagem de missão e disciplina, referência aos 16 anos de Marinha.",
  pai: "Tom de pai: ternura, referência à filha, conexão entre treino e família.",
};

export const BEST_TIMES: Record<string, { windows: string[]; time: string; why: string }> = {
  seguidores: { windows: ["11h-13h", "19h-21h"], time: "12:00", why: "Almoço e pós-trabalho = maior alcance." },
  curtidas: { windows: ["07h-09h", "20h-22h"], time: "20:30", why: "Noite: mais tempo pra ler legenda." },
  shares: { windows: ["07h-09h", "20h-22h"], time: "08:00", why: "Manhã reflexiva favorece compartilhamento." },
  salvamentos: { windows: ["07h-09h", "20h-22h"], time: "21:00", why: "Conteúdo de referência é salvo à noite." },
  vendas: { windows: ["10h-11h", "14h-15h"], time: "10:30", why: "Decisão racional em horário produtivo." },
  cliques: { windows: ["10h-11h", "14h-15h"], time: "14:30", why: "Pós-almoço: janela de clique no link." },
};

export const STORIES_TIMES = ["08h-09h", "12h-13h", "21h-22h"];

export const PRE_POST_CHECKLIST = [
  "Primeira linha para o scroll? (hook forte)",
  "Texto na tela legível? (40% da tela, fonte grande)",
  "Foto/vídeo 4:5 ou 9:16? (ocupa mais feed)",
  "Hashtags misturadas? (grandes + médias + nichadas)",
  "CTA no final da legenda? (salva/manda/segue)",
  "Self-comment preparado? (postar logo após publicar)",
  "Horário ideal? (baseado no objetivo)",
  "Produto da VEMP visível? (se aplicável)",
  "MindForce aparece natural? (se aplicável)",
  "@ e nutrion.app.br presentes? (branding)",
];
