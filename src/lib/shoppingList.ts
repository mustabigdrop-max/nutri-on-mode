import { safeString } from "@/lib/utils";
import { macroGroupOf, isFreeGreens, normalizeFoodItem, type RawFoodItem } from "@/lib/foodSpecificity";

export type ShoppingSection = "proteinas" | "carboidratos" | "hortifruti" | "gorduras" | "outros";

export interface ShoppingLine {
  name: string;
  amount: string;
}

export interface ShoppingGroup {
  section: ShoppingSection;
  emoji: string;
  label: string;
  items: ShoppingLine[];
}

export const SECTION_META: Record<ShoppingSection, { emoji: string; label: string }> = {
  proteinas: { emoji: "🥩", label: "Proteínas" },
  carboidratos: { emoji: "🍚", label: "Carboidratos" },
  hortifruti: { emoji: "🥬", label: "Hortifrúti" },
  gorduras: { emoji: "🥜", label: "Gorduras" },
  outros: { emoji: "🧂", label: "Temperos e outros" },
};

const HORTI = /(alface|r[úu]cula|agri[ãa]o|espinafre|couve|br[óo]colis|cenoura|tomate|pepino|abobrinha|vagem|beterraba|piment[ãa]o|cebola|alho|lim[ãa]o|banana|ma[çc][ãa]|mam[ãa]o|melancia|manga|morango|laranja|abacaxi|uva|abacate)/i;

const sectionOf = (name: string): ShoppingSection => {
  if (isFreeGreens(name)) return "hortifruti";
  const grupo = macroGroupOf(name);
  if (grupo === "fat") return /abacate/i.test(name) ? "hortifruti" : "gorduras";
  if (grupo === "vegetable" || grupo === "fruit") return "hortifruti";
  if (grupo === "protein" || grupo === "dairy") return "proteinas";
  if (HORTI.test(name)) return "hortifruti";
  if (grupo === "carb") return "carboidratos";
  return "outros";
};


const gramsFrom = (item: RawFoodItem): number => {
  const raw = `${safeString(item?.quantidade_g)} ${safeString(item?.quantidade)}`;
  const m = raw.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|gr|ml|l)\b/i);
  if (!m) return 0;
  const value = parseFloat(m[1].replace(",", "."));
  const unit = m[2].toLowerCase();
  if (unit === "kg" || unit === "l") return value * 1000;
  return value;
};

const unitsFrom = (item: RawFoodItem): number => {
  const raw = safeString(item?.quantidade);
  const m = raw.match(/(\d+(?:[.,]\d+)?|½)\s*(unidade|unidades|ovos?|un\b)/i);
  if (!m) return 0;
  return m[1] === "½" ? 0.5 : parseFloat(m[1].replace(",", "."));
};

/** Converte total semanal na unidade de compra mais prática. */
export const formatWeeklyAmount = (name: string, grams: number, units: number): string => {
  if (isFreeGreens(name)) return "à vontade";

  if (units > 0) {
    const total = Math.ceil(units * 7);
    if (/ovo/i.test(name)) {
      const duzias = Math.round((total / 12) * 10) / 10;
      return `${total} unidades (${duzias} dz)`;
    }
    return `${total} unidades`;
  }

  if (grams <= 0) return "conforme o plano";

  const total = grams * 7;
  const liquido = /azeite|[óo]leo|leite|iogurte l[íi]quido|suco/i.test(name);
  if (liquido && total >= 500) return `${(total / 1000).toFixed(1).replace(".", ",")} L`;
  if (total >= 1000) return `${(total / 1000).toFixed(1).replace(".", ",")} kg`;
  return `${Math.round(total)} g`;
};

/** Lista de compras semanal (7 dias) agrupada por seção do supermercado. */
export function buildShoppingList(meals: Array<{ alimentos?: RawFoodItem[] }>): ShoppingGroup[] {
  const acc = new Map<string, { name: string; grams: number; units: number }>();

  meals.forEach((meal) =>
    (meal.alimentos || []).forEach((raw) => {
      normalizeFoodItem(raw).forEach((food) => {
        const name = food.alimento.trim();
        if (!name) return;
        const key = name.toLowerCase();
        const prev = acc.get(key) || { name, grams: 0, units: 0 };
        const source: RawFoodItem = food.livre
          ? { quantidade: "à vontade" }
          : { quantidade: food.medida, quantidade_g: food.gramas ?? raw?.quantidade_g };
        prev.grams += gramsFrom(source) || gramsFrom(raw);
        prev.units += unitsFrom(source);
        acc.set(key, prev);
      });
    }),
  );

  const groups = new Map<ShoppingSection, ShoppingLine[]>();
  Array.from(acc.values()).forEach((entry) => {
    const section = sectionOf(entry.name);
    const list = groups.get(section) || [];
    list.push({ name: entry.name, amount: formatWeeklyAmount(entry.name, entry.grams, entry.units) });
    groups.set(section, list);
  });

  return (Object.keys(SECTION_META) as ShoppingSection[])
    .filter((s) => (groups.get(s) || []).length > 0)
    .map((section) => ({
      section,
      emoji: SECTION_META[section].emoji,
      label: SECTION_META[section].label,
      items: (groups.get(section) || []).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    }));
}
