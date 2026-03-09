export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  time_min: number;
  protein: number;
  carbs: number;
  fat: number;
  kcal: number;
  tags: string[]; // emagrecimento, hipertrofia, saude_geral, infantil, cafe, almoco, lanche, jantar, pre_treino
  ingredients: { name: string; amount: string; common?: boolean }[];
  steps: string[];
  macro_focus: "protein" | "carbs" | "fat" | "balanced";
}

export const RECIPE_DB: Recipe[] = [
  // ── PROTEÍNA ──
  {
    id: "omelete-claras-cottage",
    name: "Omelete de Claras com Queijo Cottage",
    emoji: "🍳",
    time_min: 8,
    protein: 32, carbs: 4, fat: 8, kcal: 214,
    tags: ["emagrecimento", "hipertrofia", "saude_geral", "cafe", "jantar"],
    macro_focus: "protein",
    ingredients: [
      { name: "claras de ovo", amount: "5 unidades", common: true },
      { name: "queijo cottage", amount: "60g (2 col. sopa)", common: true },
      { name: "sal, pimenta, orégano", amount: "a gosto" },
      { name: "azeite", amount: "1 fio", common: true },
    ],
    steps: [
      "Bata as claras com sal e pimenta",
      "Aqueça frigideira antiaderente com azeite",
      "Despeje as claras e deixe firmar em fogo médio",
      "Adicione cottage no centro, dobre ao meio",
      "Finalize com orégano",
    ],
  },
  {
    id: "bowl-frango-batata-doce",
    name: "Bowl de Frango Desfiado com Batata Doce",
    emoji: "🍗",
    time_min: 15,
    protein: 38, carbs: 35, fat: 5, kcal: 340,
    tags: ["hipertrofia", "saude_geral", "almoco", "jantar"],
    macro_focus: "protein",
    ingredients: [
      { name: "frango cozido desfiado", amount: "130g", common: true },
      { name: "batata doce cozida", amount: "150g", common: true },
      { name: "limão, sal e ervas", amount: "a gosto" },
      { name: "azeite", amount: "1 fio", common: true },
      { name: "folhas verdes", amount: "a gosto" },
    ],
    steps: [
      "Tempere o frango desfiado com limão, sal e ervas",
      "Amasse levemente a batata doce com um garfo",
      "Monte o bowl: batata na base, frango por cima",
      "Finalize com fio de azeite e folhas verdes",
    ],
  },
  {
    id: "atum-grao-de-bico",
    name: "Atum com Grão-de-Bico Temperado",
    emoji: "🐟",
    time_min: 5,
    protein: 35, carbs: 28, fat: 6, kcal: 310,
    tags: ["emagrecimento", "saude_geral", "almoco", "lanche"],
    macro_focus: "protein",
    ingredients: [
      { name: "atum em água", amount: "1 lata (120g)", common: true },
      { name: "grão-de-bico cozido", amount: "100g" },
      { name: "tomate picado", amount: "1 unidade" },
      { name: "cebola roxa", amount: "¼ unidade" },
      { name: "limão, azeite, sal, pimenta", amount: "a gosto", common: true },
    ],
    steps: [
      "Escorra bem o atum",
      "Misture com grão-de-bico, tomate e cebola",
      "Tempere com limão, azeite, sal e pimenta",
      "Pronto — sem fogo necessário",
    ],
  },
  {
    id: "mexido-proteico-ricota",
    name: "Mexido Proteico de Ovos com Ricota",
    emoji: "🥚",
    time_min: 10,
    protein: 28, carbs: 3, fat: 14, kcal: 250,
    tags: ["emagrecimento", "saude_geral", "cafe", "jantar"],
    macro_focus: "protein",
    ingredients: [
      { name: "ovos inteiros", amount: "3 unidades", common: true },
      { name: "ricota", amount: "50g (2 col. sopa)", common: true },
      { name: "cebolinha", amount: "a gosto" },
      { name: "sal, pimenta", amount: "a gosto" },
      { name: "azeite", amount: "1 fio", common: true },
    ],
    steps: [
      "Bata os ovos com sal e pimenta",
      "Cozinhe em fogo baixo mexendo sempre",
      "Antes de finalizar, adicione ricota e misture",
      "Finalize com cebolinha picada",
    ],
  },
  {
    id: "vitamina-proteica",
    name: "Vitamina Proteica Sem Whey",
    emoji: "🥛",
    time_min: 3,
    protein: 25, carbs: 20, fat: 5, kcal: 225,
    tags: ["hipertrofia", "lanche", "pre_treino"],
    macro_focus: "protein",
    ingredients: [
      { name: "iogurte grego integral", amount: "200g", common: true },
      { name: "banana", amount: "1 média", common: true },
      { name: "pasta de amendoim", amount: "15g (1 col. sopa)" },
      { name: "canela", amount: "a gosto" },
    ],
    steps: [
      "Bata tudo no liquidificador por 30 segundos",
      "Beba imediatamente",
    ],
  },
  {
    id: "sardinha-pure",
    name: "Sardinha Grelhada com Purê de Mandioquinha",
    emoji: "🐟",
    time_min: 20,
    protein: 30, carbs: 32, fat: 10, kcal: 340,
    tags: ["saude_geral", "almoco", "jantar"],
    macro_focus: "protein",
    ingredients: [
      { name: "sardinha fresca ou em lata", amount: "150g" },
      { name: "mandioquinha", amount: "150g" },
      { name: "azeite, limão, sal", amount: "a gosto", common: true },
    ],
    steps: [
      "Cozinhe a mandioquinha até ficar macia, amasse com azeite",
      "Grelhe a sardinha com limão e sal",
      "Monte: purê na base, sardinha por cima",
    ],
  },
  {
    id: "frango-grelhado-quinoa",
    name: "Frango Grelhado com Quinoa e Legumes",
    emoji: "🍗",
    time_min: 25,
    protein: 42, carbs: 30, fat: 8, kcal: 360,
    tags: ["hipertrofia", "saude_geral", "almoco"],
    macro_focus: "protein",
    ingredients: [
      { name: "peito de frango", amount: "150g", common: true },
      { name: "quinoa", amount: "60g (seco)" },
      { name: "brócolis, cenoura", amount: "100g" },
      { name: "azeite, alho, sal", amount: "a gosto", common: true },
    ],
    steps: [
      "Cozinhe a quinoa conforme embalagem",
      "Grelhe o frango temperado com alho e sal",
      "Refogue legumes no azeite por 5 min",
      "Monte o prato e sirva",
    ],
  },

  // ── CARBOIDRATO ──
  {
    id: "tapioca-frango-catupiry",
    name: "Tapioca Recheada com Frango e Catupiry Light",
    emoji: "🍠",
    time_min: 10,
    protein: 22, carbs: 30, fat: 8, kcal: 280,
    tags: ["hipertrofia", "pre_treino", "lanche", "cafe"],
    macro_focus: "carbs",
    ingredients: [
      { name: "goma de tapioca", amount: "60g (2 col. sopa)", common: true },
      { name: "frango desfiado", amount: "80g", common: true },
      { name: "requeijão light", amount: "1 col. sopa" },
      { name: "sal e ervas", amount: "a gosto" },
    ],
    steps: [
      "Espalhe a goma na frigideira seca em fogo médio",
      "Deixe firmar por 2 minutos, vire",
      "Adicione frango e requeijão no centro",
      "Dobre e sirva",
    ],
  },
  {
    id: "bowl-aveia-banana",
    name: "Bowl de Aveia com Banana e Amendoim",
    emoji: "🍌",
    time_min: 5,
    protein: 12, carbs: 55, fat: 10, kcal: 360,
    tags: ["hipertrofia", "cafe", "pre_treino"],
    macro_focus: "carbs",
    ingredients: [
      { name: "aveia em flocos", amount: "60g", common: true },
      { name: "leite", amount: "200ml", common: true },
      { name: "banana", amount: "1 média fatiada", common: true },
      { name: "pasta de amendoim", amount: "1 col. sopa" },
      { name: "mel ou canela", amount: "opcional" },
    ],
    steps: [
      "Misture aveia com leite e microondas por 2 min",
      "Mexa bem, deixe engrossar",
      "Cubra com banana fatiada",
      "Finalize com pasta de amendoim e mel",
    ],
  },
  {
    id: "arroz-frigideira",
    name: "Arroz de Frigideira com Ovo e Legumes",
    emoji: "🍚",
    time_min: 12,
    protein: 18, carbs: 45, fat: 10, kcal: 345,
    tags: ["saude_geral", "almoco", "jantar"],
    macro_focus: "carbs",
    ingredients: [
      { name: "arroz cozido", amount: "150g (sobra)", common: true },
      { name: "ovos", amount: "2 unidades", common: true },
      { name: "legumes picados", amount: "a gosto" },
      { name: "shoyu light, alho, azeite", amount: "a gosto", common: true },
    ],
    steps: [
      "Refogue alho no azeite",
      "Adicione legumes e refogue 3 minutos",
      "Junte o arroz e misture bem",
      "Abra espaço na frigideira e frite os ovos mexidos",
      "Misture tudo, tempere com shoyu",
    ],
  },
  {
    id: "cuscuz-ovo-tomate",
    name: "Cuscuz Nordestino com Ovo e Tomate",
    emoji: "🌽",
    time_min: 10,
    protein: 16, carbs: 42, fat: 8, kcal: 305,
    tags: ["saude_geral", "cafe", "almoco"],
    macro_focus: "carbs",
    ingredients: [
      { name: "flocos de milho para cuscuz", amount: "80g" },
      { name: "ovos", amount: "2 unidades", common: true },
      { name: "tomate", amount: "1 unidade picada" },
      { name: "sal, orégano, azeite", amount: "a gosto", common: true },
    ],
    steps: [
      "Hidrate os flocos com água e sal, cozinhe na cuscuzeira 5 min",
      "Frite ou cozinhe os ovos ao seu gosto",
      "Monte: cuscuz na base, ovo e tomate por cima",
      "Finalize com azeite e orégano",
    ],
  },

  // ── BALANCEADAS ──
  {
    id: "salada-atum-graos",
    name: "Salada Completa de Atum com Grãos",
    emoji: "🥗",
    time_min: 8,
    protein: 30, carbs: 25, fat: 8, kcal: 295,
    tags: ["emagrecimento", "saude_geral", "almoco"],
    macro_focus: "balanced",
    ingredients: [
      { name: "atum em água", amount: "1 lata (120g)", common: true },
      { name: "lentilha ou grão-de-bico cozido", amount: "80g" },
      { name: "tomate, pepino, cebola roxa", amount: "picados" },
      { name: "folhas verdes", amount: "a gosto" },
      { name: "azeite, limão, sal, pimenta", amount: "a gosto", common: true },
    ],
    steps: [
      "Monte a base de folhas verdes",
      "Adicione os grãos cozidos",
      "Espalhe o atum por cima",
      "Cubra com tomate, pepino, cebola",
      "Tempere com azeite e limão",
    ],
  },
  {
    id: "wrap-frango-abacate",
    name: "Wrap Integral de Frango com Abacate",
    emoji: "🌯",
    time_min: 10,
    protein: 28, carbs: 32, fat: 12, kcal: 350,
    tags: ["hipertrofia", "saude_geral", "lanche", "almoco"],
    macro_focus: "balanced",
    ingredients: [
      { name: "wrap integral", amount: "1 unidade (45g)" },
      { name: "frango grelhado fatiado", amount: "100g", common: true },
      { name: "abacate", amount: "¼ unidade", common: true },
      { name: "alface, tomate, limão", amount: "a gosto" },
      { name: "sal, pimenta, orégano", amount: "a gosto" },
    ],
    steps: [
      "Amasse o abacate com limão, sal e pimenta",
      "Espalhe no wrap como base",
      "Adicione frango, alface e tomate",
      "Enrole e sirva",
    ],
  },
  {
    id: "poke-salmao",
    name: "Poke Bowl de Salmão",
    emoji: "🍣",
    time_min: 15,
    protein: 32, carbs: 40, fat: 14, kcal: 415,
    tags: ["saude_geral", "almoco"],
    macro_focus: "balanced",
    ingredients: [
      { name: "salmão fresco em cubos", amount: "120g" },
      { name: "arroz integral cozido", amount: "120g", common: true },
      { name: "pepino, manga, edamame", amount: "a gosto" },
      { name: "shoyu, gergelim, limão", amount: "a gosto" },
    ],
    steps: [
      "Tempere o salmão com shoyu e limão",
      "Monte o bowl com arroz na base",
      "Adicione salmão, pepino, manga e edamame",
      "Finalize com gergelim",
    ],
  },

  // ── INFANTIL ──
  {
    id: "panqueca-banana-aveia",
    name: "Panqueca de Banana com Aveia",
    emoji: "🥞",
    time_min: 10,
    protein: 8, carbs: 30, fat: 5, kcal: 200,
    tags: ["infantil", "cafe", "lanche"],
    macro_focus: "carbs",
    ingredients: [
      { name: "banana madura", amount: "1 unidade amassada", common: true },
      { name: "ovos", amount: "2 unidades", common: true },
      { name: "aveia em flocos", amount: "3 col. sopa", common: true },
      { name: "canela", amount: "a gosto" },
      { name: "azeite ou óleo de coco", amount: "1 fio" },
    ],
    steps: [
      "Misture banana, ovos e aveia até formar massa",
      "Adicione canela",
      "Frite pequenas porções na frigideira com fio de azeite",
      "Vire quando firmar embaixo (2 min cada lado)",
      "Sirva com mel ou frutas fatiadas",
    ],
  },
  {
    id: "macarrao-frango-cenoura",
    name: "Macarrão com Frango e Cenoura",
    emoji: "🍝",
    time_min: 15,
    protein: 20, carbs: 40, fat: 6, kcal: 300,
    tags: ["infantil", "almoco", "jantar"],
    macro_focus: "balanced",
    ingredients: [
      { name: "macarrão parafuso", amount: "80g (seco)" },
      { name: "frango cozido desfiado", amount: "80g", common: true },
      { name: "cenoura ralada", amount: "1 pequena" },
      { name: "molho de tomate natural", amount: "2 col. sopa" },
      { name: "azeite e sal", amount: "a gosto", common: true },
    ],
    steps: [
      "Cozinhe o macarrão conforme embalagem",
      "Refogue a cenoura no azeite por 3 minutos",
      "Adicione o frango e o molho, misture",
      "Junte o macarrão escorrido",
      "Misture tudo e sirva morno",
    ],
  },
  {
    id: "mingau-aveia-maca",
    name: "Mingau de Aveia com Maçã Ralada",
    emoji: "🍎",
    time_min: 8,
    protein: 6, carbs: 35, fat: 4, kcal: 200,
    tags: ["infantil", "cafe", "lanche"],
    macro_focus: "carbs",
    ingredients: [
      { name: "aveia em flocos finos", amount: "40g", common: true },
      { name: "leite", amount: "200ml", common: true },
      { name: "maçã", amount: "½ unidade ralada" },
      { name: "canela", amount: "a pitada" },
    ],
    steps: [
      "Cozinhe aveia com leite em fogo baixo por 5 min",
      "Mexa constantemente até engrossar",
      "Adicione a maçã ralada e canela",
      "Sirva morno",
    ],
  },

  // ── LEVES / EMAGRECIMENTO ──
  {
    id: "sopa-legumes-frango",
    name: "Sopa Cremosa de Legumes com Frango",
    emoji: "🥣",
    time_min: 25,
    protein: 28, carbs: 20, fat: 5, kcal: 240,
    tags: ["emagrecimento", "jantar", "saude_geral"],
    macro_focus: "protein",
    ingredients: [
      { name: "peito de frango", amount: "100g", common: true },
      { name: "abobrinha, cenoura, chuchu", amount: "150g total" },
      { name: "alho, cebola", amount: "a gosto" },
      { name: "sal, pimenta, ervas", amount: "a gosto" },
    ],
    steps: [
      "Cozinhe frango e legumes em 500ml de água",
      "Quando macios, bata parte no liquidificador para engrossar",
      "Devolva à panela, tempere e sirva",
    ],
  },
  {
    id: "salada-grega-proteica",
    name: "Salada Grega Proteica",
    emoji: "🥒",
    time_min: 8,
    protein: 22, carbs: 10, fat: 12, kcal: 235,
    tags: ["emagrecimento", "almoco", "jantar", "saude_geral"],
    macro_focus: "protein",
    ingredients: [
      { name: "queijo cottage ou feta", amount: "100g", common: true },
      { name: "pepino, tomate, cebola roxa", amount: "picados" },
      { name: "azeitonas", amount: "5 unidades" },
      { name: "azeite, limão, orégano", amount: "a gosto", common: true },
    ],
    steps: [
      "Corte pepino, tomate e cebola em cubos",
      "Adicione queijo e azeitonas",
      "Tempere com azeite, limão e orégano",
      "Misture delicadamente e sirva",
    ],
  },
];

// Helper to get all unique ingredient names from the DB
export const getAllIngredientNames = (): string[] => {
  const names = new Set<string>();
  RECIPE_DB.forEach(r => r.ingredients.forEach(i => {
    if (i.common) names.add(i.name.toLowerCase());
  }));
  return Array.from(names);
};
