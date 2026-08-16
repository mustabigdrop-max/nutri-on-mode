import { safeString } from "@/lib/utils";

/**
 * Biblioteca de medidas caseiras padrão.
 * Regra: gramaturas exibidas ao cliente são arredondadas para múltiplos
 * inteiros da medida caseira (ninguém pesa 6 g de castanha — são 1 ou 2 unidades).
 */
export interface HouseholdMeasure {
  /** Nome da medida no singular (ex.: "colher de sopa cheia"). */
  measure: string;
  /** Plural opcional (default: measure + "s" na primeira palavra). */
  plural?: string;
  /** Gramas por unidade da medida. */
  grams: number;
  /** Quantidade mínima de unidades exibível (default 1). */
  minUnits?: number;
  /** Permite meia unidade (ex.: "1 e 1/2 colher"). */
  allowHalf?: boolean;
}

const norm = (s: unknown) =>
  safeString(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Chave normalizada (por inclusão) → medidas caseiras, da mais usual para a menor. */
const MEASURES: Array<[string, HouseholdMeasure[]]> = [
  // PROTEÍNAS
  ["ovo", [{ measure: "unidade", plural: "unidades", grams: 50 }]],
  ["clara", [{ measure: "clara", plural: "claras", grams: 33 }]],
  ["whey", [{ measure: "scoop", plural: "scoops", grams: 30 }]],
  ["peito de peru", [{ measure: "palma da mão", plural: "palmas da mão", grams: 140, allowHalf: true }]],
  ["frango", [{ measure: "palma da mão", plural: "palmas da mão", grams: 140, allowHalf: true }]],
  ["patinho", [{ measure: "bife grande", plural: "bifes grandes", grams: 125, allowHalf: true }]],
  ["carne", [{ measure: "bife médio", plural: "bifes médios", grams: 120, allowHalf: true }]],
  ["tilapia", [{ measure: "filé médio", plural: "filés médios", grams: 150, allowHalf: true }]],
  ["peixe", [{ measure: "filé médio", plural: "filés médios", grams: 150, allowHalf: true }]],
  ["salmao", [{ measure: "posta média", plural: "postas médias", grams: 150, allowHalf: true }]],
  ["atum", [{ measure: "lata escorrida", plural: "latas escorridas", grams: 120, allowHalf: true }]],
  ["sardinha", [{ measure: "lata", plural: "latas", grams: 125, allowHalf: true }]],
  ["tofu", [{ measure: "fatia média", plural: "fatias médias", grams: 80 }]],

  // LÁCTEOS
  ["iogurte grego", [{ measure: "pote", plural: "potes", grams: 200, allowHalf: true }]],
  ["iogurte", [{ measure: "copo americano", plural: "copos americanos", grams: 200, allowHalf: true }]],
  ["cottage", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 30 }]],
  ["ricota", [{ measure: "fatia média", plural: "fatias médias", grams: 30 }]],
  ["queijo", [{ measure: "fatia", plural: "fatias", grams: 20 }]],
  ["leite", [{ measure: "copo", plural: "copos", grams: 200, allowHalf: true }]],

  // CARBOIDRATOS
  ["arroz", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 33 }]],
  ["feijao", [{ measure: "concha média", plural: "conchas médias", grams: 80, allowHalf: true }]],
  ["lentilha", [{ measure: "concha média", plural: "conchas médias", grams: 80, allowHalf: true }]],
  ["grao de bico", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 40 }]],
  ["batata doce", [{ measure: "unidade média", plural: "unidades médias", grams: 200, allowHalf: true }]],
  ["batata", [{ measure: "unidade média", plural: "unidades médias", grams: 150, allowHalf: true }]],
  ["mandioca", [{ measure: "pedaço médio", plural: "pedaços médios", grams: 65 }]],
  ["macaxeira", [{ measure: "pedaço médio", plural: "pedaços médios", grams: 65 }]],
  ["inhame", [{ measure: "unidade média", plural: "unidades médias", grams: 200, allowHalf: true }]],
  ["cara", [{ measure: "unidade média", plural: "unidades médias", grams: 200, allowHalf: true }]],
  ["macarrao", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 40 }]],
  ["aveia", [{ measure: "colher de sopa", plural: "colheres de sopa", grams: 15 }]],
  ["granola", [{ measure: "colher de sopa", plural: "colheres de sopa", grams: 15 }]],
  ["tapioca", [{ measure: "colher de sopa", plural: "colheres de sopa", grams: 20 }]],
  ["cuscuz", [{ measure: "fatia média", plural: "fatias médias", grams: 80 }]],
  ["quinoa", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 30 }]],
  ["pao", [{ measure: "unidade", plural: "unidades", grams: 50 }]],

  // GORDURAS
  ["azeite", [{ measure: "colher de sopa", plural: "colheres de sopa", grams: 8 }]],
  ["oleo de coco", [{ measure: "colher de sopa", plural: "colheres de sopa", grams: 10 }]],
  ["manteiga", [{ measure: "colher de chá", plural: "colheres de chá", grams: 5 }]],
  ["castanha do para", [{ measure: "unidade", plural: "unidades", grams: 4 }]],
  ["castanha de caju", [{ measure: "unidade", plural: "unidades", grams: 2 }]],
  ["castanha", [{ measure: "unidade", plural: "unidades", grams: 4 }]],
  ["amendoa", [{ measure: "unidade", plural: "unidades", grams: 1.2 }]],
  ["nozes", [{ measure: "unidade", plural: "unidades", grams: 5 }]],
  ["pasta de amendoim", [{ measure: "colher de sopa rasa", plural: "colheres de sopa rasas", grams: 15 }]],
  ["linhaca", [{ measure: "colher de sopa", plural: "colheres de sopa", grams: 10 }]],
  ["chia", [{ measure: "colher de sopa", plural: "colheres de sopa", grams: 10 }]],
  ["abacate", [{ measure: "colher de sopa", plural: "colheres de sopa", grams: 20 }]],

  // FRUTAS
  ["banana", [{ measure: "unidade média", plural: "unidades médias", grams: 80, allowHalf: true }]],
  ["maca", [{ measure: "unidade média", plural: "unidades médias", grams: 130, allowHalf: true }]],
  ["pera", [{ measure: "unidade média", plural: "unidades médias", grams: 130, allowHalf: true }]],
  ["laranja", [{ measure: "unidade média", plural: "unidades médias", grams: 130, allowHalf: true }]],
  ["mamao", [{ measure: "fatia média", plural: "fatias médias", grams: 100 }]],
  ["morango", [{ measure: "unidade", plural: "unidades", grams: 12 }]],
  ["abacaxi", [{ measure: "fatia média", plural: "fatias médias", grams: 80 }]],
  ["manga", [{ measure: "unidade média", plural: "unidades médias", grams: 200, allowHalf: true }]],
  ["uva", [{ measure: "cacho pequeno", plural: "cachos pequenos", grams: 100, allowHalf: true }]],
  ["fruta", [{ measure: "unidade média", plural: "unidades médias", grams: 100, allowHalf: true }]],

  // VEGETAIS
  ["brocolis", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 50 }]],
  ["couve flor", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 50 }]],
  ["abobrinha", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 50 }]],
  ["vagem", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 50 }]],
  ["cenoura", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 50 }]],
  ["beterraba", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 50 }]],
  ["legume", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 50 }]],
  ["espinafre", [{ measure: "colher de sopa cheia", plural: "colheres de sopa cheias", grams: 50 }]],
  ["tomate", [{ measure: "unidade média", plural: "unidades médias", grams: 90 }]],
];

export const measuresFor = (foodName: unknown): HouseholdMeasure[] | null => {
  const n = norm(foodName);
  if (!n) return null;
  let best: { len: number; m: HouseholdMeasure[] } | null = null;
  for (const [key, m] of MEASURES) {
    if (n.includes(key) && (!best || key.length > best.len)) best = { len: key.length, m };
  }
  return best?.m ?? null;
};

const plural = (m: HouseholdMeasure, units: number) =>
  units > 1 ? m.plural || `${m.measure}s` : m.measure;

const formatUnits = (units: number) => (Number.isInteger(units) ? String(units) : units.toFixed(1).replace(".", ","));

export interface PortionDescription {
  /** Texto da medida caseira (ex.: "6 colheres de sopa cheias"). */
  measure: string;
  /** Gramatura arredondada para bater com a medida caseira. */
  grams: number;
}

/**
 * Converte uma gramatura crua na medida caseira mais próxima,
 * arredondando a gramatura para o múltiplo inteiro (ou meio) da medida.
 */
export const describePortion = (foodName: unknown, grams: number): PortionDescription | null => {
  const list = measuresFor(foodName);
  if (!list?.length || !Number.isFinite(grams) || grams <= 0) return null;

  // Escolhe a medida que gere a menor contagem >= 1 (mais legível).
  const scored = list
    .map((m) => {
      const raw = grams / m.grams;
      const step = m.allowHalf ? 0.5 : 1;
      const units = Math.max(m.minUnits ?? step, Math.round(raw / step) * step);
      return { m, units, error: Math.abs(units * m.grams - grams) / grams };
    })
    .sort((a, b) => (a.units < 1 ? 1 : 0) - (b.units < 1 ? 1 : 0) || a.error - b.error || a.units - b.units);

  const best = scored[0];
  if (!best) return null;
  return {
    measure: `${formatUnits(best.units)} ${plural(best.m, best.units)}`,
    grams: Math.round(best.units * best.m.grams),
  };
};

/** Arredonda a gramatura para casar com uma medida caseira inteira, quando houver. */
export const roundToHouseholdGrams = (foodName: unknown, grams: number): number =>
  describePortion(foodName, grams)?.grams ?? Math.round(grams);
