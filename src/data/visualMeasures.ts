export interface VisualMeasure {
  id: string;
  name: string;
  emoji: string;
  description: string;
  grams: number;
  category: "proteinas" | "carboidratos" | "gorduras" | "vegetais" | "frutas" | "lacticinios" | "bebidas";
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const VISUAL_MEASURES: VisualMeasure[] = [
  // ── PROTEÍNAS ──
  { id: "vm-palma-frango", name: "Frango grelhado", emoji: "🍗", description: "1 palma da mão espalmada", grams: 120, category: "proteinas", kcal: 191, protein: 38, carbs: 0, fat: 4 },
  { id: "vm-file-medio", name: "Filé médio (carne/peixe)", emoji: "🥩", description: "1 filé médio", grams: 120, category: "proteinas", kcal: 204, protein: 31, carbs: 0, fat: 8 },
  { id: "vm-ovo", name: "Ovo inteiro", emoji: "🥚", description: "1 ovo", grams: 50, category: "proteinas", kcal: 72, protein: 6, carbs: 0.5, fat: 5 },
  { id: "vm-atum-lata", name: "Atum em lata", emoji: "🐟", description: "1 lata escorrida", grams: 120, category: "proteinas", kcal: 139, protein: 31, carbs: 0, fat: 1 },
  { id: "vm-feijao-concha", name: "Feijão", emoji: "🫘", description: "1 concha pequena", grams: 80, category: "proteinas", kcal: 62, protein: 4, carbs: 11, fat: 0.4 },
  { id: "vm-frango-desfiado", name: "Frango desfiado", emoji: "🍗", description: "1 pegador cheio", grams: 100, category: "proteinas", kcal: 159, protein: 32, carbs: 0, fat: 3 },

  // ── CARBOIDRATOS ──
  { id: "vm-arroz-escumadeira", name: "Arroz branco", emoji: "🍚", description: "1 escumadeira", grams: 150, category: "carboidratos", kcal: 195, protein: 4, carbs: 42, fat: 0.5 },
  { id: "vm-batata-doce", name: "Batata doce", emoji: "🍠", description: "1 unidade média", grams: 150, category: "carboidratos", kcal: 116, protein: 1, carbs: 27, fat: 0.2 },
  { id: "vm-pao-fatia", name: "Pão de forma", emoji: "🍞", description: "1 fatia", grams: 25, category: "carboidratos", kcal: 62, protein: 2, carbs: 12, fat: 1 },
  { id: "vm-pao-frances", name: "Pão francês", emoji: "🥖", description: "1 unidade", grams: 50, category: "carboidratos", kcal: 140, protein: 4, carbs: 28, fat: 1 },
  { id: "vm-banana", name: "Banana", emoji: "🍌", description: "1 unidade média", grams: 100, category: "carboidratos", kcal: 89, protein: 1, carbs: 23, fat: 0.3 },
  { id: "vm-aveia-colher", name: "Aveia em flocos", emoji: "🥣", description: "1 colher de sopa cheia", grams: 15, category: "carboidratos", kcal: 58, protein: 2, carbs: 10, fat: 1 },
  { id: "vm-tapioca", name: "Tapioca (goma)", emoji: "🫓", description: "2 colheres de sopa", grams: 60, category: "carboidratos", kcal: 216, protein: 0, carbs: 52, fat: 0 },
  { id: "vm-cuscuz", name: "Cuscuz nordestino", emoji: "🌽", description: "1 fatia média", grams: 135, category: "carboidratos", kcal: 175, protein: 3, carbs: 36, fat: 2 },
  { id: "vm-macarrao", name: "Macarrão cozido", emoji: "🍝", description: "1 pegador", grams: 110, category: "carboidratos", kcal: 136, protein: 5, carbs: 28, fat: 1 },

  // ── GORDURAS ──
  { id: "vm-azeite-fio", name: "Azeite de oliva", emoji: "🫒", description: "1 fio de azeite", grams: 10, category: "gorduras", kcal: 90, protein: 0, carbs: 0, fat: 10 },
  { id: "vm-pasta-amendoim", name: "Pasta de amendoim", emoji: "🥜", description: "1 colher de sopa", grams: 15, category: "gorduras", kcal: 94, protein: 4, carbs: 3, fat: 8 },
  { id: "vm-abacate-quarto", name: "Abacate", emoji: "🥑", description: "¼ de unidade", grams: 50, category: "gorduras", kcal: 80, protein: 1, carbs: 4, fat: 7.5 },
  { id: "vm-castanha", name: "Castanha do Pará", emoji: "🌰", description: "3 unidades", grams: 12, category: "gorduras", kcal: 79, protein: 2, carbs: 1, fat: 8 },
  { id: "vm-manteiga", name: "Manteiga", emoji: "🧈", description: "1 ponta de faca", grams: 10, category: "gorduras", kcal: 72, protein: 0, carbs: 0, fat: 8 },

  // ── VEGETAIS ──
  { id: "vm-salada-prato", name: "Salada de folhas", emoji: "🥗", description: "1 prato raso", grams: 100, category: "vegetais", kcal: 15, protein: 1, carbs: 3, fat: 0.2 },
  { id: "vm-legumes-pegador", name: "Legumes cozidos", emoji: "🥕", description: "1 pegador", grams: 80, category: "vegetais", kcal: 30, protein: 1, carbs: 6, fat: 0.3 },
  { id: "vm-brocolis", name: "Brócolis", emoji: "🥦", description: "1 buquê médio", grams: 80, category: "vegetais", kcal: 28, protein: 3, carbs: 3, fat: 0.3 },
  { id: "vm-tomate", name: "Tomate", emoji: "🍅", description: "1 unidade média", grams: 120, category: "vegetais", kcal: 22, protein: 1, carbs: 5, fat: 0.2 },

  // ── FRUTAS ──
  { id: "vm-maca", name: "Maçã", emoji: "🍎", description: "1 unidade média", grams: 130, category: "frutas", kcal: 68, protein: 0.4, carbs: 18, fat: 0.2 },
  { id: "vm-laranja", name: "Laranja", emoji: "🍊", description: "1 unidade média", grams: 140, category: "frutas", kcal: 62, protein: 1, carbs: 15, fat: 0.2 },
  { id: "vm-morango", name: "Morango", emoji: "🍓", description: "1 punhado (8 un)", grams: 100, category: "frutas", kcal: 33, protein: 0.7, carbs: 8, fat: 0.3 },
  { id: "vm-acai-tigela", name: "Açaí (tigela)", emoji: "🟣", description: "1 tigela média (300ml)", grams: 300, category: "frutas", kcal: 330, protein: 3, carbs: 48, fat: 15 },

  // ── LATICÍNIOS ──
  { id: "vm-iogurte-grego", name: "Iogurte grego", emoji: "🥛", description: "1 pote (170g)", grams: 170, category: "lacticinios", kcal: 100, protein: 17, carbs: 6, fat: 1 },
  { id: "vm-queijo-fatia", name: "Queijo mussarela", emoji: "🧀", description: "1 fatia fina", grams: 20, category: "lacticinios", kcal: 60, protein: 5, carbs: 0.5, fat: 5 },
  { id: "vm-leite-copo", name: "Leite", emoji: "🥛", description: "1 copo (200ml)", grams: 200, category: "lacticinios", kcal: 120, protein: 6, carbs: 10, fat: 6 },
  { id: "vm-requeijao", name: "Requeijão", emoji: "🫕", description: "1 colher de sopa", grams: 30, category: "lacticinios", kcal: 60, protein: 2, carbs: 1, fat: 5 },
  { id: "vm-pao-queijo", name: "Pão de queijo", emoji: "🧀", description: "1 unidade média", grams: 40, category: "lacticinios", kcal: 110, protein: 3, carbs: 14, fat: 5 },

  // ── BEBIDAS ──
  { id: "vm-cafe-leite", name: "Café com leite", emoji: "☕", description: "1 xícara", grams: 200, category: "bebidas", kcal: 70, protein: 3, carbs: 8, fat: 3 },
  { id: "vm-suco-laranja", name: "Suco de laranja", emoji: "🍊", description: "1 copo (250ml)", grams: 250, category: "bebidas", kcal: 112, protein: 1, carbs: 26, fat: 0.5 },
  { id: "vm-agua-coco", name: "Água de coco", emoji: "🥥", description: "1 caixinha (200ml)", grams: 200, category: "bebidas", kcal: 38, protein: 0, carbs: 9, fat: 0 },
];

export const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  proteinas: { label: "Proteínas", emoji: "💪" },
  carboidratos: { label: "Carboidratos", emoji: "⚡" },
  gorduras: { label: "Gorduras", emoji: "🫒" },
  vegetais: { label: "Vegetais", emoji: "🥬" },
  frutas: { label: "Frutas", emoji: "🍎" },
  lacticinios: { label: "Laticínios", emoji: "🥛" },
  bebidas: { label: "Bebidas", emoji: "☕" },
};
