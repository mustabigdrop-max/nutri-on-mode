import { safeString } from "@/lib/utils";
import { portionParts } from "@/lib/portionDisplay";

/** Grupo de macronutriente de um alimento — base para substituições válidas. */
export type MacroGroup = "protein" | "carb" | "fat" | "free" | "other";

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

const PROTEIN =
  /(frango|peito|peru|patinho|alcatra|coxão|m[úu]sculo|carne|b[íi]fe|til[áa]pia|peixe|salm[ãa]o|atum|merluza|camar[ãa]o|ovo|clara|whey|albumina|prote[íi]na|iogurte|queijo|cottage|ricota|leite|caseína)/i;
const CARB =
  /(arroz|batata|mandioca|inhame|macarr[ãa]o|massa|p[ãa]o|tapioca|aveia|granola|cereal|cuscuz|quinoa|feij[ãa]o|lentilha|gr[ãa]o de bico|banana|ma[çc][ãa]|mam[ãa]o|melancia|manga|morango|laranja|abacaxi|uva|fruta|mel|farinha|milho|beterraba|cenoura|polenta|panqueca|crepioca)/i;
const FAT =
  /(azeite|[óo]leo|manteiga|ghee|castanha|am[êe]ndoa|noz|amendoim|pasta de amendoim|abacate|coco|gema|linha[çc]a|chia|tahine|semente)/i;

export const macroGroupOf = (name: unknown): MacroGroup => {
  const n = safeString(name);
  if (!n) return "other";
  if (isFreeGreens(n)) return "free";
  if (FAT.test(n)) return "fat";
  if (PROTEIN.test(n)) return "protein";
  if (CARB.test(n)) return "carb";
  return "other";
};

/* ── Catálogo de substituições por grupo (medidas caseiras) ────────────── */

const CATALOG: Record<Exclude<MacroGroup, "free" | "other">, FoodSubstitution[]> = {
  protein: [
    { alimento: "Frango grelhado", medida: "1 palma da mão (~150 g)" },
    { alimento: "Tilápia", medida: "1 filé médio (~150 g)" },
    { alimento: "Patinho moído", medida: "1 palma da mão (~150 g)" },
    { alimento: "Ovos inteiros", medida: "5 ovos médios (~250 g)" },
    { alimento: "Atum em água", medida: "1 lata escorrida (~120 g)" },
  ],
  carb: [
    { alimento: "Arroz branco", medida: "6 colheres de sopa cheias (~200 g)" },
    { alimento: "Batata doce", medida: "1 unidade média (~200 g)" },
    { alimento: "Mandioca cozida", medida: "4 pedaços médios (~200 g)" },
    { alimento: "Macarrão integral", medida: "6 colheres de sopa (~180 g)" },
    { alimento: "Tapioca (goma)", medida: "3 colheres de sopa (~50 g)" },
  ],
  fat: [
    { alimento: "Azeite extra virgem", medida: "1 colher de sopa (~8 ml)" },
    { alimento: "Castanha do pará", medida: "3 unidades (~12 g)" },
    { alimento: "Pasta de amendoim", medida: "1 colher de sopa rasa (~15 g)" },
    { alimento: "Abacate", medida: "2 colheres de sopa (~40 g)" },
  ],
};

const sameFood = (a: string, b: string) => {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const x = norm(a);
  const y = norm(b);
  return x === y || x.includes(y) || y.includes(x);
};

/* ── Alimentos genéricos → versão específica ───────────────────────────── */

interface GenericRule {
  match: RegExp;
  alimento: string;
  medida: string;
  livre?: boolean;
}

const GENERIC_RULES: GenericRule[] = [
  { match: /^(uma\s+|1\s+)?frutas?$/i, alimento: "Banana média", medida: "1 unidade média" },
  { match: /^fruta (da [ée]poca|a escolher|variada)$/i, alimento: "Banana média", medida: "1 unidade média" },
  { match: /^legumes?( variados| diversos| cozidos| no vapor)?$/i, alimento: "Brócolis + cenoura", medida: "3 colheres de sopa cheias" },
  { match: /^(vegetais|verduras)( variados| variadas| diversos)?$/i, alimento: "Alface, tomate e pepino", medida: "À vontade", livre: true },
  { match: /^salada( verde| crua| mista)?$/i, alimento: "Salada verde (alface, rúcula, agrião)", medida: "À vontade", livre: true },
  { match: /^(castanhas|oleaginosas|mix de castanhas)$/i, alimento: "Castanha do pará", medida: "3 unidades" },
  { match: /^(carne|prote[íi]na)( magra| animal)?$/i, alimento: "Frango grelhado", medida: "1 palma da mão" },
  { match: /^(carboidrato|tub[ée]rculo)s?$/i, alimento: "Arroz branco", medida: "6 colheres de sopa cheias" },
  { match: /^(gordura|gorduras boas)$/i, alimento: "Azeite extra virgem", medida: "1 colher de sopa" },
];

/** "Salada com azeite" → salada livre + azeite com medida própria. */
const SALAD_WITH_FAT = /^salada[^,]*\b(com|\+|e)\s+(azeite|[óo]leo)/i;

/* ── Normalização de um item do plano ──────────────────────────────────── */

const buildSubs = (
  grupo: MacroGroup,
  nome: string,
  originais: RawFoodItem["substituicoes"],
): FoodSubstitution[] => {
  if (grupo === "free" || grupo === "other") return [];

  const doMesmoGrupo = (originais || [])
    .map((s) => ({
      alimento: safeString(s?.alimento).trim(),
      medida: portionParts({ quantidade: s?.quantidade, quantidade_g: s?.quantidade_g }).primary,
    }))
    .filter((s) => s.alimento && macroGroupOf(s.alimento) === grupo && !sameFood(s.alimento, nome));

  const catalogo = CATALOG[grupo].filter((s) => !sameFood(s.alimento, nome));
  const merged: FoodSubstitution[] = [...doMesmoGrupo];
  for (const c of catalogo) {
    if (merged.length >= 4) break;
    if (!merged.some((m) => sameFood(m.alimento, c.alimento))) merged.push(c);
  }
  return merged.slice(0, 4).map((s) => ({ alimento: s.alimento, medida: s.medida || "porção equivalente" }));
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
