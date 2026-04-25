// Smart food substitution database and modal

export interface FoodSub {
  name: string;
  portion: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SubstitutionEntry {
  original: FoodSub;
  substitutes: FoodSub[];
}

// Normalized lookup key: lowercase, trimmed, remove portions
function normalizeKey(name: string): string {
  return name.toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/\s*\+\s*/g, " + ")
    .trim();
}

// Pool reutilizável de substitutos por categoria — permite ampla variação
const PROTEIN_POOL: FoodSub[] = [
  { name: "Frango grelhado (peito)", portion: "120g", kcal: 165, protein: 30, carbs: 0, fat: 3 },
  { name: "Frango desfiado", portion: "120g", kcal: 170, protein: 31, carbs: 0, fat: 4 },
  { name: "Sobrecoxa de frango sem pele", portion: "120g", kcal: 200, protein: 26, carbs: 0, fat: 10 },
  { name: "Peito de peru defumado", portion: "100g", kcal: 110, protein: 22, carbs: 1, fat: 2 },
  { name: "Peixe tilápia grelhado", portion: "120g", kcal: 130, protein: 29, carbs: 0, fat: 2 },
  { name: "Salmão grelhado", portion: "120g", kcal: 250, protein: 28, carbs: 0, fat: 15 },
  { name: "Sardinha em água", portion: "100g", kcal: 140, protein: 25, carbs: 0, fat: 5 },
  { name: "Sardinha em óleo escorrida", portion: "100g", kcal: 200, protein: 24, carbs: 0, fat: 12 },
  { name: "Atum em água escorrido", portion: "100g", kcal: 116, protein: 28, carbs: 0, fat: 1 },
  { name: "Bacalhau dessalgado", portion: "120g", kcal: 130, protein: 28, carbs: 0, fat: 1 },
  { name: "Camarão cozido", portion: "120g", kcal: 120, protein: 25, carbs: 1, fat: 2 },
  { name: "Merluza grelhada", portion: "120g", kcal: 110, protein: 24, carbs: 0, fat: 1 },
  { name: "Pescada grelhada", portion: "120g", kcal: 115, protein: 25, carbs: 0, fat: 1 },
  { name: "Patinho moído refogado", portion: "100g", kcal: 180, protein: 26, carbs: 0, fat: 8 },
  { name: "Alcatra grelhada", portion: "100g", kcal: 200, protein: 28, carbs: 0, fat: 9 },
  { name: "Coxão mole grelhado", portion: "100g", kcal: 195, protein: 27, carbs: 0, fat: 9 },
  { name: "Filé mignon grelhado", portion: "100g", kcal: 210, protein: 28, carbs: 0, fat: 10 },
  { name: "Maminha grelhada", portion: "100g", kcal: 200, protein: 27, carbs: 0, fat: 10 },
  { name: "Picanha grelhada (sem capa)", portion: "100g", kcal: 220, protein: 26, carbs: 0, fat: 13 },
  { name: "Carne suína magra (lombo)", portion: "100g", kcal: 175, protein: 27, carbs: 0, fat: 7 },
  { name: "Ovo inteiro", portion: "3 unidades", kcal: 210, protein: 18, carbs: 1, fat: 15 },
  { name: "Ovo cozido", portion: "3 unidades", kcal: 210, protein: 18, carbs: 1, fat: 15 },
  { name: "Clara de ovo", portion: "5 unidades", kcal: 90, protein: 18, carbs: 0, fat: 0 },
  { name: "Omelete (2 ovos + 2 claras)", portion: "1 porção", kcal: 220, protein: 24, carbs: 1, fat: 12 },
  { name: "Whey protein concentrado", portion: "1 scoop (30g)", kcal: 120, protein: 24, carbs: 3, fat: 1.5 },
  { name: "Whey protein isolado", portion: "1 scoop (30g)", kcal: 110, protein: 27, carbs: 1, fat: 0.5 },
  { name: "Albumina", portion: "30g", kcal: 110, protein: 24, carbs: 2, fat: 0.5 },
  { name: "Caseína", portion: "30g", kcal: 110, protein: 24, carbs: 3, fat: 0.5 },
  { name: "Iogurte grego integral", portion: "200g", kcal: 190, protein: 18, carbs: 12, fat: 8 },
  { name: "Iogurte grego desnatado", portion: "200g", kcal: 120, protein: 20, carbs: 8, fat: 1 },
  { name: "Queijo cottage", portion: "150g", kcal: 130, protein: 17, carbs: 3, fat: 4 },
  { name: "Ricota fresca", portion: "150g", kcal: 165, protein: 16, carbs: 6, fat: 8 },
  { name: "Tofu firme", portion: "150g", kcal: 120, protein: 16, carbs: 3, fat: 7 },
  { name: "Tempeh", portion: "100g", kcal: 195, protein: 19, carbs: 9, fat: 11 },
  { name: "Proteína texturizada de soja (PTS) hidratada", portion: "150g", kcal: 130, protein: 22, carbs: 8, fat: 2 },
  { name: "Lentilha cozida", portion: "150g", kcal: 175, protein: 13, carbs: 30, fat: 0.5 },
  { name: "Grão-de-bico cozido", portion: "150g", kcal: 245, protein: 13, carbs: 40, fat: 4 },
  { name: "Feijão preto cozido", portion: "150g", kcal: 195, protein: 13, carbs: 35, fat: 0.7 },
  { name: "Feijão carioca cozido", portion: "150g", kcal: 190, protein: 13, carbs: 34, fat: 0.8 },
  { name: "Feijão branco cozido", portion: "150g", kcal: 200, protein: 14, carbs: 36, fat: 0.6 },
  { name: "Feijão fradinho cozido", portion: "150g", kcal: 175, protein: 12, carbs: 32, fat: 0.7 },
  { name: "Ervilha cozida", portion: "150g", kcal: 125, protein: 8, carbs: 22, fat: 0.4 },
  { name: "Soja em grão cozida", portion: "100g", kcal: 175, protein: 17, carbs: 10, fat: 9 },
  { name: "Edamame", portion: "150g", kcal: 180, protein: 17, carbs: 14, fat: 8 },
  { name: "Seitan", portion: "100g", kcal: 145, protein: 28, carbs: 5, fat: 2 },
  { name: "Hambúrguer caseiro de patinho", portion: "120g", kcal: 220, protein: 26, carbs: 0, fat: 12 },
  { name: "Almôndega bovina caseira", portion: "120g", kcal: 215, protein: 25, carbs: 2, fat: 12 },
  { name: "Kibe assado", portion: "120g", kcal: 230, protein: 18, carbs: 12, fat: 12 },
  { name: "Carne seca dessalgada", portion: "100g", kcal: 200, protein: 30, carbs: 0, fat: 9 },
  { name: "Frango caipira", portion: "120g", kcal: 175, protein: 28, carbs: 0, fat: 6 },
  { name: "Coxa de frango sem pele", portion: "120g", kcal: 190, protein: 25, carbs: 0, fat: 9 },
  { name: "Frango ao molho de tomate", portion: "150g", kcal: 200, protein: 28, carbs: 5, fat: 7 },
  { name: "Linguiça de frango", portion: "100g", kcal: 180, protein: 18, carbs: 1, fat: 11 },
  { name: "Salsicha de peru", portion: "2 unidades (90g)", kcal: 130, protein: 14, carbs: 2, fat: 7 },
  { name: "Atum em óleo escorrido", portion: "100g", kcal: 190, protein: 26, carbs: 0, fat: 9 },
  { name: "Cavala grelhada", portion: "120g", kcal: 230, protein: 26, carbs: 0, fat: 14 },
  { name: "Polvo cozido", portion: "120g", kcal: 100, protein: 22, carbs: 2, fat: 1 },
  { name: "Lula grelhada", portion: "120g", kcal: 110, protein: 20, carbs: 3, fat: 2 },
  { name: "Mexilhão", portion: "100g", kcal: 95, protein: 18, carbs: 4, fat: 2 },
  { name: "Iogurte skyr", portion: "170g", kcal: 100, protein: 17, carbs: 6, fat: 0.5 },
  { name: "Queijo minas padrão", portion: "60g", kcal: 160, protein: 13, carbs: 1, fat: 12 },
  { name: "Mussarela de búfala", portion: "60g", kcal: 145, protein: 12, carbs: 1, fat: 11 },
];

const CARB_POOL: FoodSub[] = [
  { name: "Arroz branco cozido", portion: "150g", kcal: 195, protein: 4, carbs: 38, fat: 0.5 },
  { name: "Arroz integral cozido", portion: "150g", kcal: 165, protein: 4, carbs: 33, fat: 1.5 },
  { name: "Arroz parboilizado", portion: "150g", kcal: 190, protein: 4, carbs: 38, fat: 0.5 },
  { name: "Arroz basmati", portion: "150g", kcal: 185, protein: 4, carbs: 38, fat: 0.5 },
  { name: "Arroz japonês", portion: "150g", kcal: 195, protein: 4, carbs: 40, fat: 0.3 },
  { name: "Arroz negro cozido", portion: "150g", kcal: 175, protein: 5, carbs: 35, fat: 1.5 },
  { name: "Arroz 7 grãos", portion: "150g", kcal: 180, protein: 5, carbs: 35, fat: 2 },
  { name: "Batata inglesa cozida", portion: "150g", kcal: 130, protein: 3, carbs: 30, fat: 0.2 },
  { name: "Batata doce cozida", portion: "150g", kcal: 135, protein: 1, carbs: 35, fat: 0.2 },
  { name: "Batata baroa (mandioquinha)", portion: "150g", kcal: 120, protein: 2, carbs: 28, fat: 0.3 },
  { name: "Batata asterix (rosada)", portion: "150g", kcal: 130, protein: 3, carbs: 30, fat: 0.2 },
  { name: "Mandioca cozida", portion: "150g", kcal: 195, protein: 1, carbs: 43, fat: 0.3 },
  { name: "Aipim cozido", portion: "150g", kcal: 190, protein: 1, carbs: 43, fat: 0.3 },
  { name: "Inhame cozido", portion: "150g", kcal: 155, protein: 2, carbs: 35, fat: 0.2 },
  { name: "Cará cozido", portion: "150g", kcal: 160, protein: 2, carbs: 36, fat: 0.2 },
  { name: "Macarrão integral cozido", portion: "150g", kcal: 175, protein: 7, carbs: 40, fat: 1.5 },
  { name: "Macarrão tradicional cozido", portion: "150g", kcal: 200, protein: 7, carbs: 42, fat: 1.2 },
  { name: "Macarrão de arroz", portion: "150g", kcal: 165, protein: 3, carbs: 38, fat: 0.3 },
  { name: "Macarrão de grão-de-bico", portion: "150g", kcal: 195, protein: 12, carbs: 35, fat: 3 },
  { name: "Quinoa cozida", portion: "150g", kcal: 185, protein: 7, carbs: 30, fat: 3 },
  { name: "Cuscuz marroquino", portion: "150g", kcal: 180, protein: 4, carbs: 40, fat: 0.5 },
  { name: "Cuscuz nordestino (de milho)", portion: "150g", kcal: 170, protein: 4, carbs: 38, fat: 1 },
  { name: "Tapioca", portion: "2 unidades (60g)", kcal: 150, protein: 0, carbs: 30, fat: 0 },
  { name: "Pão francês", portion: "1 unidade (50g)", kcal: 140, protein: 4, carbs: 28, fat: 1 },
  { name: "Pão integral", portion: "2 fatias (60g)", kcal: 160, protein: 6, carbs: 28, fat: 2 },
  { name: "Pão sírio integral", portion: "1 unidade (60g)", kcal: 165, protein: 5, carbs: 30, fat: 2 },
  { name: "Pão de forma light", portion: "2 fatias (50g)", kcal: 110, protein: 5, carbs: 22, fat: 1 },
  { name: "Torrada integral", portion: "4 unidades (40g)", kcal: 150, protein: 5, carbs: 28, fat: 2 },
  { name: "Wrap integral", portion: "1 unidade (45g)", kcal: 140, protein: 5, carbs: 25, fat: 3 },
  { name: "Aveia em flocos", portion: "60g", kcal: 230, protein: 8, carbs: 38, fat: 4 },
  { name: "Granola sem açúcar", portion: "50g", kcal: 220, protein: 6, carbs: 32, fat: 7 },
  { name: "Banana prata", portion: "2 unidades (150g)", kcal: 140, protein: 2, carbs: 38, fat: 0.5 },
  { name: "Banana nanica", portion: "1 unidade (120g)", kcal: 105, protein: 1, carbs: 27, fat: 0.3 },
  { name: "Maçã", portion: "1 unidade (180g)", kcal: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Pera", portion: "1 unidade (180g)", kcal: 100, protein: 0.6, carbs: 27, fat: 0.2 },
  { name: "Mamão papaia", portion: "200g", kcal: 90, protein: 1, carbs: 22, fat: 0.3 },
  { name: "Manga", portion: "200g", kcal: 120, protein: 1.5, carbs: 30, fat: 0.5 },
  { name: "Uvas", portion: "150g", kcal: 105, protein: 1, carbs: 27, fat: 0.3 },
  { name: "Abacaxi", portion: "200g", kcal: 100, protein: 1, carbs: 26, fat: 0.2 },
  { name: "Melão", portion: "200g", kcal: 70, protein: 1, carbs: 17, fat: 0.2 },
  { name: "Melancia", portion: "250g", kcal: 75, protein: 1.5, carbs: 18, fat: 0.4 },
  { name: "Laranja", portion: "1 unidade grande (200g)", kcal: 95, protein: 2, carbs: 23, fat: 0.3 },
  { name: "Tangerina", portion: "2 unidades (200g)", kcal: 105, protein: 1.5, carbs: 26, fat: 0.4 },
  { name: "Kiwi", portion: "2 unidades (150g)", kcal: 90, protein: 1.5, carbs: 22, fat: 0.7 },
  { name: "Morangos", portion: "200g", kcal: 65, protein: 1.5, carbs: 15, fat: 0.6 },
  { name: "Mirtilo (blueberry)", portion: "150g", kcal: 85, protein: 1, carbs: 21, fat: 0.5 },
  { name: "Framboesa", portion: "150g", kcal: 80, protein: 2, carbs: 18, fat: 1 },
  { name: "Goiaba", portion: "200g", kcal: 135, protein: 5, carbs: 28, fat: 2 },
  { name: "Pêssego", portion: "2 unidades (200g)", kcal: 80, protein: 2, carbs: 20, fat: 0.5 },
  { name: "Uvas passas", portion: "30g", kcal: 90, protein: 1, carbs: 23, fat: 0.1 },
  { name: "Damasco seco", portion: "30g", kcal: 70, protein: 1, carbs: 18, fat: 0.1 },
  { name: "Tâmaras", portion: "30g", kcal: 85, protein: 0.5, carbs: 22, fat: 0.1 },
  { name: "Polenta cozida", portion: "200g", kcal: 170, protein: 4, carbs: 36, fat: 1 },
  { name: "Milho cozido", portion: "150g", kcal: 130, protein: 5, carbs: 28, fat: 1.5 },
  { name: "Abóbora cabotiá cozida", portion: "200g", kcal: 90, protein: 3, carbs: 20, fat: 0.4 },
  { name: "Abóbora moranga cozida", portion: "200g", kcal: 80, protein: 2, carbs: 18, fat: 0.3 },
  { name: "Beterraba cozida", portion: "150g", kcal: 65, protein: 2.5, carbs: 14, fat: 0.3 },
  { name: "Cenoura cozida", portion: "150g", kcal: 55, protein: 1.5, carbs: 12, fat: 0.3 },
  { name: "Crepioca (1 ovo + tapioca)", portion: "1 unidade", kcal: 180, protein: 7, carbs: 25, fat: 5 },
  { name: "Pão sírio tradicional", portion: "1 unidade (60g)", kcal: 165, protein: 5, carbs: 32, fat: 1 },
  { name: "Pão de batata doce", portion: "2 fatias (60g)", kcal: 150, protein: 4, carbs: 28, fat: 2 },
  { name: "Pão de queijo (assado)", portion: "2 unidades (50g)", kcal: 175, protein: 4, carbs: 22, fat: 8 },
  { name: "Biscoito de arroz", portion: "4 unidades (30g)", kcal: 115, protein: 2.5, carbs: 25, fat: 0.7 },
  { name: "Cookie integral sem açúcar", portion: "30g", kcal: 130, protein: 3, carbs: 18, fat: 5 },
  { name: "Barra de cereal integral", portion: "1 unidade (25g)", kcal: 95, protein: 2, carbs: 17, fat: 2.5 },
  { name: "Mingau de aveia com leite desnatado", portion: "200g", kcal: 175, protein: 8, carbs: 28, fat: 3 },
  { name: "Cará-roxo cozido", portion: "150g", kcal: 165, protein: 2, carbs: 38, fat: 0.2 },
];

const FAT_POOL: FoodSub[] = [
  { name: "Azeite de oliva extra virgem", portion: "1 colher (10ml)", kcal: 90, protein: 0, carbs: 0, fat: 10 },
  { name: "Óleo de coco", portion: "10ml", kcal: 90, protein: 0, carbs: 0, fat: 10 },
  { name: "Óleo MCT", portion: "10ml", kcal: 90, protein: 0, carbs: 0, fat: 10 },
  { name: "Manteiga ghee", portion: "10g", kcal: 90, protein: 0, carbs: 0, fat: 10 },
  { name: "Abacate", portion: "50g", kcal: 80, protein: 1, carbs: 4, fat: 8 },
  { name: "Guacamole natural", portion: "60g", kcal: 95, protein: 1, carbs: 5, fat: 8 },
  { name: "Pasta de amendoim integral", portion: "15g", kcal: 95, protein: 4, carbs: 3, fat: 8 },
  { name: "Pasta de castanha de caju", portion: "15g", kcal: 90, protein: 3, carbs: 4, fat: 7 },
  { name: "Pasta de amêndoas", portion: "15g", kcal: 95, protein: 3, carbs: 3, fat: 8 },
  { name: "Tahine (pasta de gergelim)", portion: "15g", kcal: 90, protein: 3, carbs: 3, fat: 8 },
  { name: "Castanha do Pará", portion: "2 unidades (10g)", kcal: 65, protein: 2, carbs: 1, fat: 7 },
  { name: "Castanha de caju", portion: "20g", kcal: 115, protein: 3, carbs: 6, fat: 9 },
  { name: "Amêndoas", portion: "20g", kcal: 115, protein: 4, carbs: 4, fat: 11 },
  { name: "Nozes", portion: "20g", kcal: 130, protein: 3, carbs: 3, fat: 13 },
  { name: "Avelã", portion: "20g", kcal: 125, protein: 3, carbs: 3, fat: 12 },
  { name: "Pistache sem casca", portion: "20g", kcal: 115, protein: 4, carbs: 6, fat: 9 },
  { name: "Macadâmia", portion: "15g", kcal: 110, protein: 1, carbs: 2, fat: 11 },
  { name: "Sementes de chia", portion: "15g", kcal: 75, protein: 2.5, carbs: 6, fat: 4.5 },
  { name: "Sementes de linhaça", portion: "15g", kcal: 80, protein: 3, carbs: 4, fat: 6 },
  { name: "Sementes de girassol", portion: "15g", kcal: 90, protein: 3, carbs: 3, fat: 8 },
  { name: "Sementes de abóbora", portion: "15g", kcal: 85, protein: 4, carbs: 2, fat: 7 },
  { name: "Coco fresco ralado", portion: "20g", kcal: 70, protein: 1, carbs: 3, fat: 7 },
  { name: "Azeitonas pretas", portion: "30g", kcal: 35, protein: 0.3, carbs: 1, fat: 3.5 },
];

const DAIRY_POOL: FoodSub[] = [
  { name: "Leite integral", portion: "200ml", kcal: 130, protein: 7, carbs: 10, fat: 8 },
  { name: "Leite semidesnatado", portion: "200ml", kcal: 100, protein: 7, carbs: 10, fat: 4 },
  { name: "Leite desnatado", portion: "200ml", kcal: 70, protein: 7, carbs: 10, fat: 0.5 },
  { name: "Leite sem lactose", portion: "200ml", kcal: 100, protein: 7, carbs: 10, fat: 4 },
  { name: "Leite de aveia", portion: "200ml", kcal: 90, protein: 3, carbs: 14, fat: 3 },
  { name: "Leite de amêndoas sem açúcar", portion: "200ml", kcal: 30, protein: 1, carbs: 3, fat: 1.5 },
  { name: "Leite de coco light", portion: "200ml", kcal: 60, protein: 1, carbs: 4, fat: 4 },
  { name: "Leite de soja", portion: "200ml", kcal: 90, protein: 7, carbs: 6, fat: 4 },
  { name: "Iogurte natural integral", portion: "170g", kcal: 105, protein: 6, carbs: 8, fat: 5 },
  { name: "Iogurte natural desnatado", portion: "170g", kcal: 70, protein: 7, carbs: 9, fat: 0.3 },
  { name: "Iogurte grego integral", portion: "200g", kcal: 190, protein: 18, carbs: 12, fat: 8 },
  { name: "Iogurte grego desnatado", portion: "200g", kcal: 120, protein: 20, carbs: 8, fat: 1 },
  { name: "Kefir natural", portion: "200ml", kcal: 110, protein: 7, carbs: 10, fat: 5 },
  { name: "Queijo minas frescal", portion: "50g", kcal: 130, protein: 9, carbs: 1, fat: 10 },
  { name: "Queijo minas light", portion: "50g", kcal: 90, protein: 11, carbs: 1, fat: 5 },
  { name: "Queijo cottage", portion: "100g", kcal: 90, protein: 11, carbs: 3, fat: 4 },
  { name: "Queijo mussarela light", portion: "30g", kcal: 80, protein: 8, carbs: 1, fat: 5 },
  { name: "Ricota", portion: "100g", kcal: 110, protein: 11, carbs: 4, fat: 5 },
  { name: "Cream cheese light", portion: "30g", kcal: 60, protein: 3, carbs: 2, fat: 4 },
];

// Helper para criar entradas com pool completo (excluindo o próprio item)
function makeEntry(original: FoodSub, pool: FoodSub[], extras: FoodSub[] = []): SubstitutionEntry {
  const subs = pool
    .filter(p => normalizeKey(p.name) !== normalizeKey(original.name))
    .concat(extras);
  return { original, substitutes: subs };
}

const SUBSTITUTION_DB: SubstitutionEntry[] = [
  // === PROTEÍNAS — todas usam o pool inteiro de proteínas ===
  makeEntry({ name: "Frango grelhado", portion: "120g", kcal: 165, protein: 30, carbs: 0, fat: 3 }, PROTEIN_POOL),
  makeEntry({ name: "Peito de frango", portion: "120g", kcal: 165, protein: 30, carbs: 0, fat: 3 }, PROTEIN_POOL),
  makeEntry({ name: "Frango", portion: "120g", kcal: 165, protein: 30, carbs: 0, fat: 3 }, PROTEIN_POOL),
  makeEntry({ name: "Carne bovina magra", portion: "100g", kcal: 190, protein: 28, carbs: 0, fat: 7 }, PROTEIN_POOL),
  makeEntry({ name: "Patinho moído", portion: "100g", kcal: 180, protein: 26, carbs: 0, fat: 8 }, PROTEIN_POOL),
  makeEntry({ name: "Alcatra", portion: "100g", kcal: 200, protein: 28, carbs: 0, fat: 9 }, PROTEIN_POOL),
  makeEntry({ name: "Filé mignon", portion: "100g", kcal: 210, protein: 28, carbs: 0, fat: 10 }, PROTEIN_POOL),
  makeEntry({ name: "Picanha", portion: "100g", kcal: 220, protein: 26, carbs: 0, fat: 13 }, PROTEIN_POOL),
  makeEntry({ name: "Tilápia", portion: "120g", kcal: 130, protein: 29, carbs: 0, fat: 2 }, PROTEIN_POOL),
  makeEntry({ name: "Salmão", portion: "120g", kcal: 250, protein: 28, carbs: 0, fat: 15 }, PROTEIN_POOL),
  makeEntry({ name: "Atum", portion: "100g", kcal: 116, protein: 28, carbs: 0, fat: 1 }, PROTEIN_POOL),
  makeEntry({ name: "Sardinha", portion: "100g", kcal: 140, protein: 25, carbs: 0, fat: 5 }, PROTEIN_POOL),
  makeEntry({ name: "Bacalhau", portion: "120g", kcal: 130, protein: 28, carbs: 0, fat: 1 }, PROTEIN_POOL),
  makeEntry({ name: "Camarão", portion: "120g", kcal: 120, protein: 25, carbs: 1, fat: 2 }, PROTEIN_POOL),
  makeEntry({ name: "Peixe", portion: "120g", kcal: 130, protein: 28, carbs: 0, fat: 2 }, PROTEIN_POOL),
  makeEntry({ name: "Ovo inteiro", portion: "3 unidades", kcal: 210, protein: 18, carbs: 1, fat: 15 }, PROTEIN_POOL),
  makeEntry({ name: "Ovos", portion: "3 unidades", kcal: 210, protein: 18, carbs: 1, fat: 15 }, PROTEIN_POOL),
  makeEntry({ name: "Clara de ovo", portion: "5 unidades", kcal: 90, protein: 18, carbs: 0, fat: 0 }, PROTEIN_POOL),
  makeEntry({ name: "Whey protein", portion: "1 scoop (30g)", kcal: 120, protein: 24, carbs: 3, fat: 1.5 }, PROTEIN_POOL),
  makeEntry({ name: "Whey", portion: "1 scoop (30g)", kcal: 120, protein: 24, carbs: 3, fat: 1.5 }, PROTEIN_POOL),
  makeEntry({ name: "Tofu", portion: "150g", kcal: 120, protein: 16, carbs: 3, fat: 7 }, PROTEIN_POOL),
  makeEntry({ name: "Lentilha", portion: "150g", kcal: 175, protein: 13, carbs: 30, fat: 0.5 }, PROTEIN_POOL),
  makeEntry({ name: "Grão-de-bico", portion: "150g", kcal: 245, protein: 13, carbs: 40, fat: 4 }, PROTEIN_POOL),
  makeEntry({ name: "Feijão", portion: "150g", kcal: 195, protein: 13, carbs: 35, fat: 0.7 }, PROTEIN_POOL),
  makeEntry({ name: "Iogurte grego", portion: "200g", kcal: 190, protein: 18, carbs: 12, fat: 8 }, PROTEIN_POOL),

  // === CARBOIDRATOS — todas usam o pool inteiro de carbos ===
  makeEntry({ name: "Arroz branco", portion: "150g", kcal: 195, protein: 4, carbs: 38, fat: 0.5 }, CARB_POOL),
  makeEntry({ name: "Arroz integral", portion: "150g", kcal: 165, protein: 4, carbs: 33, fat: 1.5 }, CARB_POOL),
  makeEntry({ name: "Arroz", portion: "150g", kcal: 195, protein: 4, carbs: 38, fat: 0.5 }, CARB_POOL),
  makeEntry({ name: "Batata doce", portion: "150g", kcal: 135, protein: 1, carbs: 35, fat: 0.2 }, CARB_POOL),
  makeEntry({ name: "Batata inglesa", portion: "150g", kcal: 130, protein: 3, carbs: 30, fat: 0.2 }, CARB_POOL),
  makeEntry({ name: "Batata", portion: "150g", kcal: 130, protein: 3, carbs: 30, fat: 0.2 }, CARB_POOL),
  makeEntry({ name: "Mandioca", portion: "150g", kcal: 195, protein: 1, carbs: 43, fat: 0.3 }, CARB_POOL),
  makeEntry({ name: "Aipim", portion: "150g", kcal: 190, protein: 1, carbs: 43, fat: 0.3 }, CARB_POOL),
  makeEntry({ name: "Inhame", portion: "150g", kcal: 155, protein: 2, carbs: 35, fat: 0.2 }, CARB_POOL),
  makeEntry({ name: "Macarrão", portion: "150g", kcal: 200, protein: 7, carbs: 42, fat: 1.2 }, CARB_POOL),
  makeEntry({ name: "Macarrão integral", portion: "150g", kcal: 175, protein: 7, carbs: 40, fat: 1.5 }, CARB_POOL),
  makeEntry({ name: "Quinoa", portion: "150g", kcal: 185, protein: 7, carbs: 30, fat: 3 }, CARB_POOL),
  makeEntry({ name: "Cuscuz", portion: "150g", kcal: 180, protein: 4, carbs: 40, fat: 0.5 }, CARB_POOL),
  makeEntry({ name: "Tapioca", portion: "2 unidades (60g)", kcal: 150, protein: 0, carbs: 30, fat: 0 }, CARB_POOL),
  makeEntry({ name: "Pão integral", portion: "2 fatias (60g)", kcal: 160, protein: 6, carbs: 28, fat: 2 }, CARB_POOL),
  makeEntry({ name: "Pão francês", portion: "1 unidade (50g)", kcal: 140, protein: 4, carbs: 28, fat: 1 }, CARB_POOL),
  makeEntry({ name: "Pão", portion: "2 fatias (60g)", kcal: 160, protein: 6, carbs: 28, fat: 2 }, CARB_POOL),
  makeEntry({ name: "Aveia", portion: "60g", kcal: 230, protein: 8, carbs: 38, fat: 4 }, CARB_POOL),
  makeEntry({ name: "Granola", portion: "50g", kcal: 220, protein: 6, carbs: 32, fat: 7 }, CARB_POOL),
  makeEntry({ name: "Banana", portion: "1 unidade (120g)", kcal: 105, protein: 1, carbs: 27, fat: 0.3 }, CARB_POOL),
  makeEntry({ name: "Maçã", portion: "1 unidade (180g)", kcal: 95, protein: 0.5, carbs: 25, fat: 0.3 }, CARB_POOL),
  makeEntry({ name: "Mamão", portion: "200g", kcal: 90, protein: 1, carbs: 22, fat: 0.3 }, CARB_POOL),
  makeEntry({ name: "Manga", portion: "200g", kcal: 120, protein: 1.5, carbs: 30, fat: 0.5 }, CARB_POOL),
  makeEntry({ name: "Fruta", portion: "1 porção", kcal: 100, protein: 1, carbs: 25, fat: 0.3 }, CARB_POOL),

  // === GORDURAS ===
  makeEntry({ name: "Azeite de oliva", portion: "1 colher (10ml)", kcal: 90, protein: 0, carbs: 0, fat: 10 }, FAT_POOL),
  makeEntry({ name: "Azeite", portion: "1 colher (10ml)", kcal: 90, protein: 0, carbs: 0, fat: 10 }, FAT_POOL),
  makeEntry({ name: "Abacate", portion: "100g", kcal: 160, protein: 2, carbs: 9, fat: 15 }, FAT_POOL),
  makeEntry({ name: "Pasta de amendoim", portion: "30g", kcal: 190, protein: 8, carbs: 6, fat: 16 }, FAT_POOL),
  makeEntry({ name: "Castanhas", portion: "20g", kcal: 115, protein: 3, carbs: 6, fat: 9 }, FAT_POOL),
  makeEntry({ name: "Castanha do Pará", portion: "2 unidades (10g)", kcal: 65, protein: 2, carbs: 1, fat: 7 }, FAT_POOL),
  makeEntry({ name: "Amêndoas", portion: "20g", kcal: 115, protein: 4, carbs: 4, fat: 11 }, FAT_POOL),
  makeEntry({ name: "Nozes", portion: "20g", kcal: 130, protein: 3, carbs: 3, fat: 13 }, FAT_POOL),
  makeEntry({ name: "Chia", portion: "15g", kcal: 75, protein: 2.5, carbs: 6, fat: 4.5 }, FAT_POOL),
  makeEntry({ name: "Linhaça", portion: "15g", kcal: 80, protein: 3, carbs: 4, fat: 6 }, FAT_POOL),

  // === LATICÍNIOS ===
  makeEntry({ name: "Leite integral", portion: "200ml", kcal: 130, protein: 7, carbs: 10, fat: 8 }, DAIRY_POOL),
  makeEntry({ name: "Leite desnatado", portion: "200ml", kcal: 70, protein: 7, carbs: 10, fat: 0.5 }, DAIRY_POOL),
  makeEntry({ name: "Leite", portion: "200ml", kcal: 130, protein: 7, carbs: 10, fat: 8 }, DAIRY_POOL),
  makeEntry({ name: "Queijo minas", portion: "50g", kcal: 130, protein: 9, carbs: 1, fat: 10 }, DAIRY_POOL),
  makeEntry({ name: "Queijo cottage", portion: "200g", kcal: 175, protein: 22, carbs: 6, fat: 4 }, DAIRY_POOL),
  makeEntry({ name: "Ricota", portion: "100g", kcal: 110, protein: 11, carbs: 4, fat: 5 }, DAIRY_POOL),
  makeEntry({ name: "Iogurte", portion: "170g", kcal: 105, protein: 6, carbs: 8, fat: 5 }, DAIRY_POOL),
];

export type SubQuality = "good" | "warning" | "bad";

export interface SubOption extends FoodSub {
  quality: SubQuality;
  kcalDiff: number;
  proteinDiff: number;
  carbsDiff: number;
  fatDiff: number;
  summary: string;
}

export function findSubstitutes(
  foodName: string,
  goal?: string | null,
  restrictions?: string[] | null
): { original: FoodSub; options: SubOption[] } | null {
  const key = normalizeKey(foodName);

  // Find match in DB - fuzzy
  const entry = SUBSTITUTION_DB.find(e => {
    const eKey = normalizeKey(e.original.name);
    return key.includes(eKey) || eKey.includes(key);
  });

  if (!entry) return null;

  const original = entry.original;
  const restrictionSet = new Set((restrictions || []).map(r => r.toLowerCase()));

  const options: SubOption[] = entry.substitutes
    .filter(sub => {
      // Filter out restricted foods
      const subLower = sub.name.toLowerCase();
      return !Array.from(restrictionSet).some(r => subLower.includes(r));
    })
    .map(sub => {
      const kcalDiff = sub.kcal - original.kcal;
      const proteinDiff = sub.protein - original.protein;
      const carbsDiff = sub.carbs - original.carbs;
      const fatDiff = sub.fat - original.fat;

      // Determine quality
      let quality: SubQuality = "good";
      const summaryParts: string[] = [];

      if (proteinDiff <= -5) {
        quality = "warning";
        summaryParts.push(`Perde ${Math.abs(proteinDiff)}g proteína`);
      } else if (proteinDiff >= 2) {
        summaryParts.push(`+${proteinDiff}g proteína`);
      } else {
        summaryParts.push("Prot. equivalente");
      }

      if (kcalDiff <= -30) {
        summaryParts.push(`Economiza ${Math.abs(kcalDiff)} kcal`);
      } else if (kcalDiff >= 100) {
        quality = quality === "good" ? "warning" : quality;
        summaryParts.push(`+${kcalDiff} kcal`);
      }

      // Goal-based quality adjustment
      const goalLower = (goal || "").toLowerCase();
      if (goalLower.includes("emag") || goalLower.includes("perda")) {
        if (kcalDiff >= 100) quality = "bad";
        if (kcalDiff <= -30) quality = "good";
      } else if (goalLower.includes("hipertrofia") || goalLower.includes("massa")) {
        if (proteinDiff <= -5) quality = "bad";
        if (proteinDiff >= 5) quality = "good";
      }

      return {
        ...sub,
        quality,
        kcalDiff,
        proteinDiff,
        carbsDiff,
        fatDiff,
        summary: summaryParts.join(" | "),
      };
    })
    // Sort: good first, then warning, then bad
    .sort((a, b) => {
      const order: Record<SubQuality, number> = { good: 0, warning: 1, bad: 2 };
      return order[a.quality] - order[b.quality];
    });

  return { original, options };
}
