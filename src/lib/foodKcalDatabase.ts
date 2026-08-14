import { safeString } from "@/lib/utils";
// Banco de densidade calórica/macros por 100g — usado pelo validador de substituições
// Cobertura: ~80 alimentos mais comuns em planos. Valores por 100g (alimento PRONTO).

export interface FoodDensity {
  kcal: number;       // kcal por 100g
  p: number;          // proteína g por 100g
  c: number;          // carboidrato g por 100g
  g: number;          // gordura g por 100g
  grupo: "proteina" | "carbo" | "gordura" | "outro";
}

// Chaves são normalizadas (lowercase, sem acentos). Cobrem o nome principal do alimento.
const RAW: Record<string, FoodDensity> = {
  // ── PROTEÍNAS ──
  "peito de frango": { kcal: 165, p: 31, c: 0, g: 3.6, grupo: "proteina" },
  "frango grelhado": { kcal: 165, p: 31, c: 0, g: 3.6, grupo: "proteina" },
  "frango desfiado": { kcal: 165, p: 31, c: 0, g: 3.6, grupo: "proteina" },
  "coxa de frango": { kcal: 209, p: 26, c: 0, g: 11, grupo: "proteina" },
  "sobrecoxa": { kcal: 209, p: 26, c: 0, g: 11, grupo: "proteina" },
  "patinho": { kcal: 219, p: 30, c: 0, g: 10, grupo: "proteina" },
  "alcatra": { kcal: 200, p: 28, c: 0, g: 9, grupo: "proteina" },
  "coxao mole": { kcal: 210, p: 28, c: 0, g: 10, grupo: "proteina" },
  "coxao duro": { kcal: 210, p: 28, c: 0, g: 10, grupo: "proteina" },
  "musculo": { kcal: 198, p: 28, c: 0, g: 9, grupo: "proteina" },
  "file mignon": { kcal: 200, p: 28, c: 0, g: 9, grupo: "proteina" },
  "carne moida": { kcal: 219, p: 27, c: 0, g: 12, grupo: "proteina" },
  "tilapia": { kcal: 128, p: 26, c: 0, g: 2.7, grupo: "proteina" },
  "salmao": { kcal: 208, p: 22, c: 0, g: 13, grupo: "proteina" },
  "atum em agua": { kcal: 128, p: 26, c: 0, g: 1, grupo: "proteina" },
  "atum": { kcal: 128, p: 26, c: 0, g: 1, grupo: "proteina" },
  "sardinha": { kcal: 208, p: 25, c: 0, g: 12, grupo: "proteina" },
  "merluza": { kcal: 105, p: 23, c: 0, g: 1, grupo: "proteina" },
  "ovo": { kcal: 155, p: 13, c: 1, g: 11, grupo: "proteina" },
  "ovo cozido": { kcal: 155, p: 13, c: 1, g: 11, grupo: "proteina" },
  "ovo inteiro": { kcal: 155, p: 13, c: 1, g: 11, grupo: "proteina" },
  "clara de ovo": { kcal: 52, p: 11, c: 0.7, g: 0.2, grupo: "proteina" },
  "clara": { kcal: 52, p: 11, c: 0.7, g: 0.2, grupo: "proteina" },
  "whey": { kcal: 400, p: 80, c: 8, g: 5, grupo: "proteina" },
  "whey protein": { kcal: 400, p: 80, c: 8, g: 5, grupo: "proteina" },
  "whey isolado": { kcal: 380, p: 88, c: 3, g: 1, grupo: "proteina" },
  "caseina": { kcal: 370, p: 78, c: 8, g: 2, grupo: "proteina" },
  "iogurte natural": { kcal: 61, p: 3.5, c: 4.7, g: 3.3, grupo: "proteina" },
  "iogurte grego": { kcal: 97, p: 9, c: 4, g: 5, grupo: "proteina" },
  "cottage": { kcal: 98, p: 11, c: 3, g: 4, grupo: "proteina" },
  "queijo cottage": { kcal: 98, p: 11, c: 3, g: 4, grupo: "proteina" },
  "queijo branco": { kcal: 264, p: 18, c: 3, g: 20, grupo: "proteina" },
  "ricota": { kcal: 174, p: 11, c: 3, g: 13, grupo: "proteina" },
  "tofu": { kcal: 76, p: 8, c: 1.9, g: 4.8, grupo: "proteina" },
  "peito de peru": { kcal: 135, p: 17, c: 4, g: 5, grupo: "proteina" },
  "presunto magro": { kcal: 145, p: 21, c: 1, g: 6, grupo: "proteina" },
  "leite integral": { kcal: 61, p: 3.2, c: 4.8, g: 3.3, grupo: "proteina" },
  "leite desnatado": { kcal: 35, p: 3.4, c: 5, g: 0.1, grupo: "proteina" },

  // ── CARBOIDRATOS ──
  "arroz branco": { kcal: 130, p: 2.7, c: 28, g: 0.3, grupo: "carbo" },
  "arroz integral": { kcal: 124, p: 2.6, c: 26, g: 1, grupo: "carbo" },
  "arroz": { kcal: 130, p: 2.7, c: 28, g: 0.3, grupo: "carbo" },
  "feijao preto": { kcal: 107, p: 7, c: 19, g: 0.5, grupo: "carbo" },
  "feijao carioca": { kcal: 110, p: 7, c: 19, g: 0.7, grupo: "carbo" },
  "feijao": { kcal: 110, p: 7, c: 19, g: 0.7, grupo: "carbo" },
  "lentilha": { kcal: 116, p: 9, c: 20, g: 0.4, grupo: "carbo" },
  "grao de bico": { kcal: 164, p: 9, c: 27, g: 2.6, grupo: "carbo" },
  "ervilha": { kcal: 81, p: 5, c: 14, g: 0.4, grupo: "carbo" },
  "batata inglesa": { kcal: 77, p: 2, c: 17, g: 0.1, grupo: "carbo" },
  "batata": { kcal: 77, p: 2, c: 17, g: 0.1, grupo: "carbo" },
  "batata doce": { kcal: 86, p: 1.6, c: 20, g: 0.1, grupo: "carbo" },
  "batata-doce": { kcal: 86, p: 1.6, c: 20, g: 0.1, grupo: "carbo" },
  "mandioca": { kcal: 125, p: 1, c: 30, g: 0.3, grupo: "carbo" },
  "macaxeira": { kcal: 125, p: 1, c: 30, g: 0.3, grupo: "carbo" },
  "inhame": { kcal: 97, p: 1.5, c: 23, g: 0.2, grupo: "carbo" },
  "cara": { kcal: 97, p: 1.5, c: 23, g: 0.2, grupo: "carbo" },
  "aveia": { kcal: 366, p: 13, c: 67, g: 7, grupo: "carbo" },
  "aveia em flocos": { kcal: 366, p: 13, c: 67, g: 7, grupo: "carbo" },
  "aveia cozida": { kcal: 71, p: 2.5, c: 12, g: 1.5, grupo: "carbo" },
  "tapioca": { kcal: 240, p: 0.2, c: 60, g: 0.1, grupo: "carbo" },
  "tapioca hidratada": { kcal: 130, p: 0.1, c: 32, g: 0.1, grupo: "carbo" },
  "cuscuz": { kcal: 112, p: 3.8, c: 23, g: 0.2, grupo: "carbo" },
  "cuscuz marroquino": { kcal: 112, p: 3.8, c: 23, g: 0.2, grupo: "carbo" },
  "quinoa": { kcal: 120, p: 4.4, c: 21, g: 1.9, grupo: "carbo" },
  "pao frances": { kcal: 300, p: 8, c: 60, g: 3, grupo: "carbo" },
  "pao integral": { kcal: 247, p: 13, c: 41, g: 3.4, grupo: "carbo" },
  "pao de forma": { kcal: 260, p: 9, c: 49, g: 3, grupo: "carbo" },
  "macarrao": { kcal: 158, p: 5.8, c: 31, g: 0.9, grupo: "carbo" },
  "macarrao integral": { kcal: 124, p: 5, c: 26, g: 1, grupo: "carbo" },
  "banana": { kcal: 89, p: 1.1, c: 23, g: 0.3, grupo: "carbo" },
  "banana madura": { kcal: 89, p: 1.1, c: 23, g: 0.3, grupo: "carbo" },
  "maca": { kcal: 52, p: 0.3, c: 14, g: 0.2, grupo: "carbo" },
  "pera": { kcal: 57, p: 0.4, c: 15, g: 0.1, grupo: "carbo" },
  "mamao": { kcal: 43, p: 0.5, c: 11, g: 0.3, grupo: "carbo" },
  "abacaxi": { kcal: 50, p: 0.5, c: 13, g: 0.1, grupo: "carbo" },
  "manga": { kcal: 60, p: 0.8, c: 15, g: 0.4, grupo: "carbo" },
  "uva": { kcal: 67, p: 0.7, c: 17, g: 0.2, grupo: "carbo" },
  "laranja": { kcal: 47, p: 0.9, c: 12, g: 0.1, grupo: "carbo" },
  "kiwi": { kcal: 61, p: 1.1, c: 15, g: 0.5, grupo: "carbo" },
  "morango": { kcal: 32, p: 0.7, c: 8, g: 0.3, grupo: "carbo" },
  "frutas vermelhas": { kcal: 50, p: 0.7, c: 12, g: 0.3, grupo: "carbo" },
  "mel": { kcal: 304, p: 0.3, c: 82, g: 0, grupo: "carbo" },
  "granola": { kcal: 471, p: 10, c: 64, g: 20, grupo: "carbo" },
  "maltodextrina": { kcal: 400, p: 0, c: 100, g: 0, grupo: "carbo" },
  "doce de leite": { kcal: 280, p: 6, c: 54, g: 6, grupo: "carbo" },
  "fruta": { kcal: 50, p: 0.7, c: 12, g: 0.3, grupo: "carbo" },

  // ── GORDURAS ──
  "azeite": { kcal: 884, p: 0, c: 0, g: 100, grupo: "gordura" },
  "azeite de oliva": { kcal: 884, p: 0, c: 0, g: 100, grupo: "gordura" },
  "oleo de coco": { kcal: 862, p: 0, c: 0, g: 100, grupo: "gordura" },
  "manteiga": { kcal: 717, p: 0.9, c: 0.1, g: 81, grupo: "gordura" },
  "ghee": { kcal: 900, p: 0, c: 0, g: 100, grupo: "gordura" },
  "abacate": { kcal: 160, p: 2, c: 9, g: 15, grupo: "gordura" },
  "pasta de amendoim": { kcal: 588, p: 25, c: 20, g: 50, grupo: "gordura" },
  "amendoim": { kcal: 567, p: 26, c: 16, g: 49, grupo: "gordura" },
  "castanha do para": { kcal: 656, p: 14, c: 12, g: 66, grupo: "gordura" },
  "castanha de caju": { kcal: 553, p: 18, c: 30, g: 44, grupo: "gordura" },
  "amendoa": { kcal: 579, p: 21, c: 22, g: 50, grupo: "gordura" },
  "nozes": { kcal: 654, p: 15, c: 14, g: 65, grupo: "gordura" },
  "chia": { kcal: 486, p: 17, c: 42, g: 31, grupo: "gordura" },
  "linhaca": { kcal: 534, p: 18, c: 29, g: 42, grupo: "gordura" },
  "coco ralado": { kcal: 660, p: 7, c: 24, g: 64, grupo: "gordura" },
  "castanhas": { kcal: 600, p: 18, c: 18, g: 55, grupo: "gordura" },
  "legumes": { kcal: 30, p: 1.5, c: 6, g: 0.3, grupo: "outro" },
  "vegetais": { kcal: 25, p: 2, c: 5, g: 0.2, grupo: "outro" },
  "salada": { kcal: 20, p: 1, c: 4, g: 0.2, grupo: "outro" },
};

const normalize = (s: unknown): string =>
  safeString(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const NORMALIZED: Array<[string, FoodDensity]> = Object.entries(RAW).map(([k, v]) => [normalize(k), v]);

/** Tenta achar a densidade pelo nome do alimento. Faz match por inclusão para tolerar variações ("Peito de frango grelhado 150g"). */
export const lookupDensity = (foodName: unknown): FoodDensity | null => {
  const n = normalize(foodName);
  if (!n) return null;
  // 1) match exato
  const exact = NORMALIZED.find(([k]) => k === n);
  if (exact) return exact[1];
  // 2) match por chave inclusa no nome
  let best: { len: number; d: FoodDensity } | null = null;
  for (const [k, d] of NORMALIZED) {
    if (n.includes(k) && (!best || k.length > best.len)) {
      best = { len: k.length, d };
    }
  }
  return best?.d ?? null;
};

/** Extrai a gramagem de uma string como "150g", "≈ 200 g", "1 unidade (~120g)", "350" → 350. */
export const parseGrams = (raw?: string | number | null): number | null => {
  if (raw == null) return null;
  if (typeof raw === "number") return raw > 0 ? raw : null;
  const s = String(raw);
  // Usa a última gramatura explícita. Evita interpretar "8 unidades (~400g)" como 8g.
  const gramsMatches = [...s.matchAll(/(\d+[\.,]?\d*)\s*g\b/gi)];
  const m = gramsMatches.at(-1) || s.match(/(\d+[\.,]?\d*)/);
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};
