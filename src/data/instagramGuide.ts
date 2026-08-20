// SOCIAL ON — Guia completo de Instagram profissional (@diogo.mell0)

export const IG_PALETTE = [
  { hex: "#020205", name: "FUNDO DARK", use: "Fundo de carrossel e stories com texto" },
  { hex: "#FFFFFF", name: "TEXTO PRINCIPAL", use: "Títulos e frases de impacto" },
  { hex: "#00D4FF", name: "CYAN nutriON", use: "Palavras-chave, CTAs, destaques" },
  { hex: "#8A8A8A", name: "CINZA", use: "Subtítulos e legendas menores" },
  { hex: "#00FF88", name: "GREEN", use: "Dados positivos, resultados, conquistas" },
  { hex: "#FFB800", name: "GOLD", use: "Preços, premium, urgência" },
];

export const IG_PALETTE_RULES = [
  "Fotos: sem filtro pesado — cor natural com contraste +10 e saturação +5",
  "Carrosséis: fundo #020205 com texto branco",
  "Consistência > perfeição",
];

export const IG_HIGHLIGHTS = [
  { n: 1, emoji: "🧠", label: "MCE", color: "#00D4FF", icon: "cérebro ou engrenagem", content: "O que é MCE, como funciona, explicações curtas dos 3 pilares" },
  { n: 2, emoji: "📊", label: "RESULTADOS", color: "#00FF88", icon: "gráfico", content: "Antes/depois, depoimentos, MCE Scores de clientes" },
  { n: 3, emoji: "🏋️", label: "TREINO", color: "#FFFFFF", icon: "haltere", content: "Clips de treino, dicas de execução, PRs, técnica" },
  { n: 4, emoji: "🍽️", label: "COMIDA", color: "#FFFFFF", icon: "prato", content: "Pratos do plano, marmitas, receitas, meal prep" },
  { n: 5, emoji: "📱", label: "nutriON", color: "#00D4FF", icon: "celular ou logo", content: "Tour pelo app, funcionalidades, NutrySync, MCE Audio" },
  { n: 6, emoji: "👨‍👧", label: "PAI", color: "#FFB800", icon: "família", content: "Momentos com a filha, rotina de pai" },
  { n: 7, emoji: "💊", label: "MINDFORCE", color: "#FFFFFF", icon: "pote/cápsula", content: "Creatina, como usar, ciência, resultados" },
  { n: 8, emoji: "👕", label: "VEMP", color: "#FFB800", icon: "camiseta", content: "Peças, lookbook, drops" },
  { n: 9, emoji: "⚓", label: "SOBRE MIM", color: "#FFFFFF", icon: "âncora ou bandeira", content: "Quem é Diogo, Marinha, certificações, trajetória, missão" },
];

export const IG_HIGHLIGHT_DESIGN = [
  "Fundo do ícone: #020205",
  "Ícone: #FFFFFF ou #00D4FF",
  "Estilo minimalista: 1 símbolo por destaque",
  "Criar no Canva: círculo dark + ícone branco",
];

export const IG_GRID = [
  ["Shape forte", "Carrossel MCE", "Com a filha"],
  ["Resultado cliente", "Shape treino", "Comida / marmita"],
  ["Lifestyle / VEMP", "Carrossel educativo", "CTA nutriON"],
];

export const IG_GRID_RULES = [
  "Alternar foto pessoal ↔ carrossel ↔ foto pessoal",
  "Nunca 3 carrosséis seguidos (fica blocado)",
  "Nunca 3 selfies seguidas (fica narcisista)",
  "Sempre 1 foto com a filha nas primeiras 9",
  "Sempre 1 resultado de cliente nas primeiras 9",
  "Manter paleta consistente, sem filtros coloridos aleatórios",
];

export const IG_FEED_SCHEDULE = [
  { day: "SEGUNDA", time: "12h00", type: "Carrossel educativo MCE", why: "Segunda as pessoas buscam começar de novo" },
  { day: "TERÇA", time: "19h00", type: "Reel talking head ou edit", why: "Terça tem menor competição no feed" },
  { day: "QUARTA", time: "11h30", type: "Reel trend/edit (viralizar)", why: "Meio da semana, engajamento alto" },
  { day: "QUINTA", time: "20h00", type: "Resultado de cliente / prova social", why: "Quinta as pessoas planejam o fim de semana" },
  { day: "SEXTA", time: "12h00", type: "Reel humor / entretenimento", why: "Sexta o humor viraliza mais" },
  { day: "SÁBADO", time: "10h00", type: "Bastidor pessoal (treino, pai, lifestyle)", why: "Sábado de manhã é pico de consumo fitness" },
  { day: "DOMINGO", time: "19h00", type: "CTA suave (nutriON, consultoria, desafio)", why: "Domingo à noite as pessoas refletem e decidem" },
];

export const IG_STORIES_SCHEDULE = [
  { block: "MANHÃ", time: "06h-09h", items: ["Alarme / acordando", "Cardio ou MCE Audio tocando", "Café da manhã no plano", "Enquete: Treinou hoje?"] },
  { block: "MEIO DO DIA", time: "11h-14h", items: ["Caixinha de perguntas", "Almoço (foto do prato)", "Dica rápida MCE (texto ou vídeo 15s)"] },
  { block: "TARDE", time: "14h-17h", items: ["Indo pra academia", "1 clip de exercício (15s)", "Selfie pós-treino (pump)"] },
  { block: "NOITE", time: "19h-22h", items: ["Jantar / ceia", "Com a filha (humaniza)", "CTA: nutriON, consultoria ou antecipação de amanhã"] },
];

export const IG_BY_OBJECTIVE = [
  { goal: "GANHAR SEGUIDORES (TOFU)", time: "11h-13h e 19h-21h", format: "Reel edit < 15s ou trend", day: "Quarta e sexta", content: "Humor, trend, edit pessoal" },
  { goal: "ENGAJAR (MOFU)", time: "07h-09h e 20h-22h", format: "Carrossel educativo ou talking head", day: "Segunda e quinta", content: "MCE Drops, ciência, salva esse post" },
  { goal: "VENDER (BOFU)", time: "10h-11h e 19h-20h", format: "Stories sequência + Reel depoimento", day: "Domingo e segunda", content: "Resultado de cliente, tour nutriON, CTA direto" },
];

export const IG_AUDIENCE = [
  {
    key: "masculino",
    title: "Atrair público masculino",
    works: [
      "Shape direto, sem enrolação",
      "Dados e números (1.247 refeições, 312 treinos)",
      "Ciência aplicada (neurociência, hormônios)",
      "Disciplina militar (16 anos de Marinha)",
      "Competição e ranking",
      "Execução > emoção",
    ],
    hooks: [
      "A maioria dos caras na academia tá perdendo tempo.",
      "Disciplina não existe. Existe sistema.",
      "Seu treino não tá funcionando. E eu sei por quê.",
      "O shape que você quer custa menos do que imagina.",
    ],
    edits: [
      "Transição de shape com música pesada",
      "Before/after com dados",
      "Clips de treino pesado + fisheye",
      "POV: rotina 4:30am",
    ],
  },
  {
    key: "feminino",
    title: "Atrair público feminino",
    works: [
      "Paternidade (com a filha)",
      "Vulnerabilidade (teve dia que eu quis desistir)",
      "Comida real e bonita, não marmita de academia",
      "Relação com o corpo (aceitação + evolução)",
      "Comportamento e mindset, mais que treino puro",
      "Transformação emocional, não só física",
    ],
    hooks: [
      "Sua fome nunca foi de comida.",
      "Minha filha me ensinou mais sobre disciplina que a Marinha.",
      "O corpo que você quer mora na pessoa que você ainda não decidiu ser.",
      "Parou de funcionar porque nunca foi sistema.",
    ],
    edits: [
      "Transição pai + filha → atleta (ternura + força)",
      "Comida bonita + preparo (timelapse meal prep)",
      "Rotina real com família",
      "Talking head vulnerável sobre dificuldades",
    ],
  },
];

export const IG_AUDIENCE_RULE =
  "60-65% do conteúdo é universal. Os 35-40% restantes alternam entre mais masculino (competição, dados, treino pesado) e mais feminino (família, comida, vulnerabilidade, comportamento).";

export const IG_SALES = [
  {
    level: "VENDA INVISÍVEL",
    freq: "sempre",
    color: "#00FF88",
    items: [
      "Postar o prato do plano nutriON sem dizer contrate minha consultoria",
      "Mostrar o app aberto nos Stories como parte natural da rotina",
      "Usar VEMP no treino sem dizer compre",
      "Resultado de cliente sem CTA explícito",
    ],
  },
  {
    level: "VENDA SUAVE",
    freq: "1x por semana",
    color: "#00D4FF",
    items: [
      "847 pessoas ouvindo MCE Audio agora",
      "Isso é o que meus alunos veem no app",
      "Vagas abrindo em setembro",
      "Stories: screenshot do nutriON + funciona",
    ],
  },
  {
    level: "VENDA DIRETA",
    freq: "1x a cada 2 semanas",
    color: "#FFB800",
    items: [
      "Consultoria nutriON: R$ 247/mês. Link na bio.",
      "Stories com depoimento + DM QUERO",
      "Reel mostrando o sistema completo",
    ],
  },
];

export const IG_SALES_NEVER = [
  "Compre agora em post no feed",
  "Preço na imagem do carrossel",
  "Link na legenda (Instagram não permite clicar)",
  "Spam de vendas nos Stories",
];

export const IG_SALES_RULE = "Regra de ouro: 80% valor, 20% venda. A cada 5 posts, 4 entregam valor e 1 menciona o nutriON.";

export const IG_STORY_FUNNEL = [
  { n: 1, title: "HOOK", body: "\"Vou mostrar algo que nenhum outro coach tem.\" Sem CTA — só curiosidade." },
  { n: 2, title: "DEMONSTRAÇÃO", body: "Screen recording do nutriON (15s) mostrando o NutrySync ajustando kcal." },
  { n: 3, title: "PROVA", body: "Antes/depois de cliente ou print do MCE Score. Dado real, não promessa." },
  { n: 4, title: "DEPOIMENTO", body: "Texto do cliente ou print de conversa (com permissão). Prova social de terceiro." },
  { n: 5, title: "ENQUETE", body: "\"Quer saber como funciona?\" [Quero] [Depois] — quem clica Quero é lead quente." },
  { n: 6, title: "CTA", body: "\"Manda DM QUERO que te explico\" ou sticker LINK: nutrion.app.br" },
];

export const IG_STORY_FUNNEL_RULE =
  "Stories de venda sempre nos últimos stories do dia (19-22h). Nunca comece o dia vendendo — os primeiros stories são sempre rotina e valor.";
