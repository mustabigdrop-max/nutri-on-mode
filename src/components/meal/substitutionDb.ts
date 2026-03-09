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

const SUBSTITUTION_DB: SubstitutionEntry[] = [
  // === PROTEÍNAS ===
  {
    original: { name: "Frango grelhado", portion: "120g", kcal: 165, protein: 30, carbs: 0, fat: 3 },
    substitutes: [
      { name: "Peixe tilápia grelhado", portion: "120g", kcal: 130, protein: 29, carbs: 0, fat: 2 },
      { name: "Patinho moído refogado", portion: "100g", kcal: 180, protein: 26, carbs: 0, fat: 8 },
      { name: "Atum em água escorrido", portion: "100g", kcal: 116, protein: 28, carbs: 0, fat: 1 },
      { name: "Ovo inteiro", portion: "3 unidades", kcal: 210, protein: 18, carbs: 1, fat: 15 },
      { name: "Clara de ovo", portion: "5 unidades", kcal: 90, protein: 18, carbs: 0, fat: 0 },
      { name: "Sardinha em água", portion: "100g", kcal: 140, protein: 25, carbs: 0, fat: 5 },
      { name: "Carne bovina magra", portion: "100g", kcal: 190, protein: 28, carbs: 0, fat: 7 },
      { name: "Tofu firme", portion: "150g", kcal: 120, protein: 16, carbs: 3, fat: 7 },
    ],
  },
  {
    original: { name: "Carne bovina magra", portion: "100g", kcal: 190, protein: 28, carbs: 0, fat: 7 },
    substitutes: [
      { name: "Frango grelhado", portion: "120g", kcal: 165, protein: 30, carbs: 0, fat: 3 },
      { name: "Patinho moído", portion: "100g", kcal: 180, protein: 26, carbs: 0, fat: 8 },
      { name: "Peixe salmão", portion: "120g", kcal: 250, protein: 28, carbs: 0, fat: 15 },
      { name: "Atum em água", portion: "100g", kcal: 116, protein: 28, carbs: 0, fat: 1 },
    ],
  },
  {
    original: { name: "Ovo inteiro", portion: "3 unidades", kcal: 210, protein: 18, carbs: 1, fat: 15 },
    substitutes: [
      { name: "Clara de ovo", portion: "5 unidades", kcal: 90, protein: 18, carbs: 0, fat: 0 },
      { name: "Frango grelhado", portion: "70g", kcal: 97, protein: 18, carbs: 0, fat: 2 },
      { name: "Atum em água", portion: "65g", kcal: 75, protein: 18, carbs: 0, fat: 1 },
      { name: "Queijo cottage", portion: "150g", kcal: 130, protein: 17, carbs: 3, fat: 4 },
      { name: "Iogurte grego integral", portion: "200g", kcal: 190, protein: 18, carbs: 12, fat: 8 },
    ],
  },
  {
    original: { name: "Whey protein", portion: "1 scoop (30g)", kcal: 120, protein: 24, carbs: 3, fat: 1.5 },
    substitutes: [
      { name: "Frango grelhado", portion: "80g", kcal: 110, protein: 20, carbs: 0, fat: 2 },
      { name: "Atum em água", portion: "85g", kcal: 99, protein: 24, carbs: 0, fat: 1 },
      { name: "Clara de ovo", portion: "4 unidades", kcal: 72, protein: 14, carbs: 0, fat: 0 },
      { name: "Iogurte grego", portion: "200g", kcal: 190, protein: 18, carbs: 12, fat: 8 },
    ],
  },
  // === CARBOIDRATOS ===
  {
    original: { name: "Arroz branco", portion: "150g cozido", kcal: 195, protein: 4, carbs: 38, fat: 0.5 },
    substitutes: [
      { name: "Arroz integral", portion: "150g cozido", kcal: 165, protein: 4, carbs: 33, fat: 1.5 },
      { name: "Batata doce cozida", portion: "150g", kcal: 135, protein: 1, carbs: 35, fat: 0.2 },
      { name: "Macarrão integral", portion: "150g cozido", kcal: 175, protein: 7, carbs: 40, fat: 1.5 },
      { name: "Mandioca cozida", portion: "150g", kcal: 195, protein: 1, carbs: 43, fat: 0.3 },
      { name: "Inhame cozido", portion: "150g", kcal: 155, protein: 2, carbs: 35, fat: 0.2 },
      { name: "Quinoa cozida", portion: "150g", kcal: 185, protein: 7, carbs: 30, fat: 3 },
      { name: "Cuscuz", portion: "150g", kcal: 180, protein: 4, carbs: 40, fat: 0.5 },
      { name: "Tapioca", portion: "2 unidades (60g)", kcal: 150, protein: 0, carbs: 30, fat: 0 },
    ],
  },
  {
    original: { name: "Batata doce", portion: "150g cozida", kcal: 135, protein: 1, carbs: 35, fat: 0.2 },
    substitutes: [
      { name: "Arroz integral", portion: "150g", kcal: 165, protein: 4, carbs: 33, fat: 1.5 },
      { name: "Inhame cozido", portion: "150g", kcal: 155, protein: 2, carbs: 35, fat: 0.2 },
      { name: "Banana prata", portion: "2 unidades (150g)", kcal: 140, protein: 2, carbs: 38, fat: 0.5 },
      { name: "Mandioca cozida", portion: "130g", kcal: 170, protein: 1, carbs: 35, fat: 0.3 },
      { name: "Aveia em flocos", portion: "60g seco", kcal: 230, protein: 8, carbs: 38, fat: 4 },
      { name: "Aipim cozido", portion: "150g", kcal: 190, protein: 1, carbs: 38, fat: 0.3 },
    ],
  },
  {
    original: { name: "Pão integral", portion: "2 fatias (60g)", kcal: 160, protein: 6, carbs: 28, fat: 2 },
    substitutes: [
      { name: "Tapioca", portion: "1 unidade (30g)", kcal: 75, protein: 0, carbs: 15, fat: 0 },
      { name: "Torrada integral", portion: "4 unidades (40g)", kcal: 150, protein: 5, carbs: 28, fat: 2 },
      { name: "Batata doce", portion: "100g", kcal: 90, protein: 1, carbs: 23, fat: 0.1 },
      { name: "Cuscuz", portion: "80g cozido", kcal: 95, protein: 2, carbs: 22, fat: 0.3 },
      { name: "Wrap integral", portion: "1 unidade (45g)", kcal: 140, protein: 5, carbs: 25, fat: 3 },
    ],
  },
  // === GORDURAS ===
  {
    original: { name: "Azeite de oliva", portion: "1 colher (10ml)", kcal: 90, protein: 0, carbs: 0, fat: 10 },
    substitutes: [
      { name: "Óleo de coco", portion: "10ml", kcal: 90, protein: 0, carbs: 0, fat: 10 },
      { name: "Abacate", portion: "50g", kcal: 80, protein: 1, carbs: 4, fat: 8 },
      { name: "Pasta de amendoim integral", portion: "15g", kcal: 95, protein: 4, carbs: 3, fat: 8 },
      { name: "Castanha do Pará", portion: "2 unidades (10g)", kcal: 65, protein: 2, carbs: 1, fat: 7 },
    ],
  },
  {
    original: { name: "Abacate", portion: "100g", kcal: 160, protein: 2, carbs: 9, fat: 15 },
    substitutes: [
      { name: "Pasta de amendoim", portion: "30g", kcal: 190, protein: 8, carbs: 6, fat: 16 },
      { name: "Castanha de caju", portion: "30g", kcal: 170, protein: 5, carbs: 9, fat: 13 },
      { name: "Amêndoas", portion: "25g", kcal: 145, protein: 5, carbs: 5, fat: 14 },
      { name: "Azeite", portion: "15ml", kcal: 135, protein: 0, carbs: 0, fat: 15 },
    ],
  },
  // === LATICÍNIOS ===
  {
    original: { name: "Iogurte grego integral", portion: "200g", kcal: 190, protein: 18, carbs: 12, fat: 8 },
    substitutes: [
      { name: "Queijo cottage", portion: "200g", kcal: 175, protein: 22, carbs: 6, fat: 4 },
      { name: "Iogurte grego desnatado", portion: "200g", kcal: 120, protein: 20, carbs: 8, fat: 1 },
      { name: "Ricota", portion: "150g", kcal: 165, protein: 16, carbs: 6, fat: 8 },
      { name: "Whey protein", portion: "25g", kcal: 100, protein: 20, carbs: 2, fat: 1 },
    ],
  },
  {
    original: { name: "Leite integral", portion: "200ml", kcal: 130, protein: 7, carbs: 10, fat: 8 },
    substitutes: [
      { name: "Leite desnatado", portion: "200ml", kcal: 70, protein: 7, carbs: 10, fat: 0.5 },
      { name: "Leite de aveia", portion: "200ml", kcal: 90, protein: 3, carbs: 14, fat: 3 },
      { name: "Leite de coco light", portion: "200ml", kcal: 60, protein: 1, carbs: 4, fat: 4 },
      { name: "Bebida de amêndoas", portion: "200ml", kcal: 30, protein: 1, carbs: 3, fat: 1.5 },
    ],
  },
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
