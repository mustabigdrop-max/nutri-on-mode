import { safeString } from "@/lib/utils";
import { portionParts } from "@/lib/portionDisplay";
import { lookupDensity, parseGrams } from "@/lib/foodKcalDatabase";
import { describePortion } from "@/lib/householdMeasures";

/** Grupo de macronutriente de um alimento — base para substituições válidas. */
export type MacroGroup =
  | "protein"
  | "carb"
  | "fat"
  | "vegetable"
  | "dairy"
  | "fruit"
  | "free"
  | "other";


export interface RawFoodItem {
  alimento?: unknown;
  quantidade?: unknown;
  quantidade_g?: unknown;
  observacao?: unknown;
  substituicoes?: Array<{ alimento?: unknown; quantidade?: unknown; quantidade_g?: unknown }> | null;
}

export interface FoodSubstitution {
  alimento: string;
  medida: string;
}

export interface NormalizedFood {
  alimento: string;
  /** Medida caseira — informação principal. */
  medida: string;
  /** Gramatura de referência (sem duplicar a medida caseira). */
  gramas: string | null;
  /** Folha verde livre: sem gramatura, exibido como "À vontade". */
  livre: boolean;
  grupo: MacroGroup;
  observacao: string;
  substituicoes: FoodSubstitution[];
}

/* ── Folhas verdes livres ──────────────────────────────────────────────── */

const FREE_GREENS =
  /(alface|r[úu]cula|agri[ãa]o|espinafre|acelga|couve(?!-flor)|chic[óo]ria|escarola|almeir[ãa]o|folhas verdes|salada verde|mix de folhas)/i;

export const isFreeGreens = (name: unknown): boolean => {
  const n = safeString(name);
  if (!n) return false;
  // "Salada com azeite" tem gordura: não é livre puro (é separada antes).
  if (/azeite|[óo]leo|castanha|abacate|queijo|frango|atum/i.test(n)) return false;
  return FREE_GREENS.test(n);
};

/* ── Classificação por macro ───────────────────────────────────────────── */

const VEGETABLE =
  /(br[óo]colis|couve[- ]flor|couve|abobrinha|vagem|cenoura|beterraba|chuchu|berinjela|piment[ãa]o|pepino|tomate|abóbora|abobora|quiabo|repolho|legume|verdura|vegetal|espinafre|palmito|aspargo)/i;
const DAIRY = /(iogurte|queijo|cottage|ricota|requeij[ãa]o|leite|kefir|coalhada)/i;
const FRUIT =
  /(banana|ma[çc][ãa]|mam[ãa]o|melancia|mel[ãa]o|manga|morango|frutas vermelhas|laranja|tangerina|abacaxi|uva|kiwi|pera|goiaba|ameixa|fruta)/i;
const PROTEIN =
  /(frango|peito|peru|patinho|alcatra|coxão|m[úu]sculo|carne|b[íi]fe|til[áa]pia|peixe|salm[ãa]o|atum|merluza|camar[ãa]o|ovo|clara|whey|albumina|prote[íi]na|caseína|tofu|sardinha)/i;
const CARB =
  /(arroz|batata|mandioca|macaxeira|inhame|cará|macarr[ãa]o|massa|p[ãa]o|tapioca|aveia|granola|cereal|cuscuz|quinoa|feij[ãa]o|lentilha|gr[ãa]o de bico|ervilha|mel|farinha|milho|polenta|panqueca|crepioca)/i;
const FAT =
  /(azeite|[óo]leo|manteiga|ghee|castanha|am[êe]ndoa|noz|amendoim|pasta de amendoim|abacate|coco|gema|linha[çc]a|chia|tahine|semente)/i;

export const macroGroupOf = (name: unknown): MacroGroup => {
  const n = safeString(name);
  if (!n) return "other";
  if (isFreeGreens(n)) return "free";
  if (FAT.test(n)) return "fat";
  if (VEGETABLE.test(n)) return "vegetable";
  if (DAIRY.test(n)) return "dairy";
  if (PROTEIN.test(n)) return "protein";
  if (FRUIT.test(n)) return "fruit";
  if (CARB.test(n)) return "carb";
  return "other";
};

/* ── Catálogo de substituições por categoria ───────────────────────────── */

type SubstitutableGroup = Exclude<MacroGroup, "free" | "other">;

/** Macro dominante que rege a equivalência de cada categoria. */
const DOMINANT: Record<SubstitutableGroup, "p" | "c" | "g" | null> = {
  protein: "p",
  dairy: "p",
  carb: "c",
  fruit: "c",
  fat: "g",
  vegetable: null, // vegetais trocam grama a grama
};

/** Densidades complementares (por 100 g) para categorias fora do banco principal. */
const EXTRA_DENSITY: Record<string, { p: number; c: number; g: number }> = {
  "brócolis": { p: 2.8, c: 7, g: 0.4 },
  "couve-flor": { p: 1.9, c: 5, g: 0.3 },
  "abobrinha": { p: 1.2, c: 3.1, g: 0.3 },
  vagem: { p: 1.8, c: 7, g: 0.2 },
  "espinafre refogado": { p: 2.9, c: 3.6, g: 0.4 },
  cenoura: { p: 0.9, c: 10, g: 0.2 },
  requeijão: { p: 8, c: 3, g: 22 },
};

const CATALOG: Record<SubstitutableGroup, string[]> = {
  protein: [
    "Frango grelhado",
    "Patinho grelhado",
    "Tilápia grelhada",
    "Peito de peru",
    "Ovos inteiros",
    "Atum em água",
  ],
  carb: ["Arroz branco", "Batata doce", "Mandioca cozida", "Inhame", "Macarrão integral", "Aveia"],
  fat: ["Azeite extra virgem", "Castanha do pará", "Pasta de amendoim", "Abacate", "Linhaça"],
  vegetable: ["Abobrinha", "Vagem", "Couve-flor", "Brócolis", "Espinafre refogado", "Cenoura"],
  dairy: ["Iogurte natural", "Iogurte grego", "Queijo cottage", "Ricota"],
  fruit: ["Banana", "Maçã", "Mamão", "Morango", "Abacaxi"],
};

const densityOf = (name: string) => {
  const d = lookupDensity(name);
  if (d) return { p: d.p, c: d.c, g: d.g };
  const key = Object.keys(EXTRA_DENSITY).find((k) =>
    safeString(name).toLowerCase().includes(k.toLowerCase()),
  );
  return key ? EXTRA_DENSITY[key] : null;
};

const sameFood = (a: string, b: string) => {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const x = norm(a);
  const y = norm(b);
  return x === y || x.includes(y) || y.includes(x);
};

/** Gramatura equivalente do substituto pelo macro dominante da categoria. */
const equivalentGrams = (
  grupo: SubstitutableGroup,
  origem: string,
  gramasOrigem: number,
  candidato: string,
): number | null => {
  const macro = DOMINANT[grupo];
  if (!macro) return gramasOrigem;
  const dOrigem = densityOf(origem);
  const dCand = densityOf(candidato);
  if (!dOrigem || !dCand || !dCand[macro]) return null;
  const alvo = (dOrigem[macro] / 100) * gramasOrigem;
  if (alvo <= 0) return null;
  return Math.round((alvo / dCand[macro]) * 100);
};

const measureText = (nome: string, gramas: number | null): FoodSubstitution => {
  if (!gramas) return { alimento: nome, medida: "porção equivalente", gramas: null };
  const desc = describePortion(nome, gramas);
  return desc
    ? { alimento: nome, medida: desc.measure, gramas: desc.grams }
    : { alimento: nome, medida: `${Math.round(gramas)} g`, gramas: Math.round(gramas) };
};


/**
 * Converte um item cru do plano em um ou mais itens específicos e legíveis
 * para o cliente: nunca genérico, folhas verdes livres, azeite separado
 * e substituições restritas ao mesmo grupo de macronutriente.
 */
export function normalizeFoodItem(item: RawFoodItem): NormalizedFood[] {
  const nomeOriginal = safeString(item?.alimento).trim();
  const parts = portionParts({ quantidade: item?.quantidade, quantidade_g: item?.quantidade_g });
  const observacao = safeString(item?.observacao);

  // Salada com azeite → dois itens
  if (SALAD_WITH_FAT.test(nomeOriginal)) {
    return [
      make("Salada verde (alface, rúcula, agrião)", "À vontade", null, true, item, observacao),
      make("Azeite extra virgem", "1 colher de sopa", "≈ 8 ml", false, item, ""),
    ];
  }

  const rule = GENERIC_RULES.find((g) => g.match.test(nomeOriginal));
  if (rule) {
    const medida = parts.primary && !/^\d/.test(rule.medida) ? rule.medida : rule.medida;
    return [make(rule.alimento, medida, rule.livre ? null : parts.secondary || (parts.primary !== medida ? parts.primary : null), !!rule.livre, item, observacao)];
  }

  if (isFreeGreens(nomeOriginal)) {
    return [make(nomeOriginal, "À vontade", null, true, item, observacao)];
  }

  return [make(nomeOriginal, parts.primary, parts.secondary, false, item, observacao)];
}

function make(
  alimento: string,
  medida: string,
  gramas: string | null,
  livre: boolean,
  item: RawFoodItem,
  observacao: string,
): NormalizedFood {
  const grupo = livre ? "free" : macroGroupOf(alimento);
  return {
    alimento,
    medida: livre ? "À vontade" : medida,
    gramas: livre ? null : gramas,
    livre,
    grupo,
    observacao,
    substituicoes: buildSubs(grupo, alimento, item?.substituicoes),
  };
}
