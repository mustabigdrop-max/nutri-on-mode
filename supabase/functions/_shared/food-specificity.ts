/**
 * Bloqueio de alimentos genéricos no plano alimentar.
 * Nenhum item pode ser uma categoria ("Fruta", "Legumes", "Proteína"...):
 * todo alimento precisa de nome específico + medida caseira + gramatura.
 */

export const TERMOS_GENERICOS = [
  "fruta", "frutas",
  "vegetal", "vegetais",
  "verdura", "verduras",
  "legume", "legumes",
  "castanha", "castanhas",
  "proteina", "proteinas",
  "carboidrato", "carboidratos",
  "gordura", "gorduras", "gordura boa", "gorduras boas",
  "fibra", "fibras",
  "grao", "graos",
  "oleaginosa", "oleaginosas",
  "tuberculo", "tuberculos",
  "peixe", "carne", "carne magra",
  "salada", "suco natural", "suco",
  "vitamina", "cha",
  "tempero", "tempero funcional",
];

const norm = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const QUALIFIERS = [
  "", "variada", "variadas", "variado", "variados", "diversos", "diversas",
  "a gosto", "a vontade", "da epoca", "de sua preferencia", "a escolher",
  "magra", "magro", "boa", "boas", "natural", "naturais", "cozidos", "cozidas",
  "no vapor", "crua", "cru", "mista", "verde", "da estacao",
];

/**
 * "Castanha do Pará" é específico; "Castanhas" ou "Castanhas variadas" não.
 * Só rejeitamos quando o nome INTEIRO é o termo genérico (+ qualificador vazio).
 */
export function isGenericFoodName(name: unknown): boolean {
  const raw = norm(name).replace(/^(1|um|uma|umas|uns)\s+/, "");
  if (!raw) return true;
  // "tempero funcional: curcuma + pimenta-preta" é específico (tem os itens listados)
  if (/[:\-–]/.test(String(name ?? "")) && raw.split(" ").length > 3) return false;
  for (const termo of TERMOS_GENERICOS) {
    for (const q of QUALIFIERS) {
      const candidate = q ? `${termo} ${q}` : termo;
      if (raw === candidate) return true;
    }
  }
  return false;
}

type Replacement = { alimento: string; quantidade: string; quantidade_g: string };

const REPLACEMENTS: Array<{ match: RegExp; value: Replacement }> = [
  { match: /^(frutas?)/, value: { alimento: "Banana prata ou Maçã fuji ou Mamão papaia", quantidade: "1 unidade média (~120g)", quantidade_g: "120g" } },
  { match: /^(legumes?|tuberculos?)/, value: { alimento: "Cenoura cozida + abobrinha refogada", quantidade: "3 colheres de sopa cheias (~120g)", quantidade_g: "120g" } },
  { match: /^(vegetais?|verduras?|fibras?)/, value: { alimento: "Brócolis no vapor + tomate", quantidade: "1 xícara (~100g)", quantidade_g: "100g" } },
  { match: /^salada/, value: { alimento: "Alface crespa + rúcula + pepino", quantidade: "à vontade (~150g)", quantidade_g: "150g" } },
  { match: /^(castanhas?|oleaginosas?)/, value: { alimento: "Castanha do Pará", quantidade: "2 unidades (~10g)", quantidade_g: "10g" } },
  { match: /^(proteinas?|carnes?|peixes?)/, value: { alimento: "Frango grelhado", quantidade: "1 palma da mão (~130g)", quantidade_g: "130g" } },
  { match: /^(carboidratos?|graos?)/, value: { alimento: "Arroz branco cozido", quantidade: "4 colheres de sopa (~128g)", quantidade_g: "128g" } },
  { match: /^gorduras?/, value: { alimento: "Azeite extra-virgem", quantidade: "1 colher de sopa (~13ml)", quantidade_g: "13g" } },
  { match: /^(sucos?|vitamina)/, value: { alimento: "Suco de limão com água (sem açúcar)", quantidade: "300ml", quantidade_g: "300g" } },
  { match: /^cha/, value: { alimento: "Chá de camomila sem açúcar", quantidade: "1 xícara (200ml)", quantidade_g: "200g" } },
  { match: /^tempero/, value: { alimento: "Cúrcuma + pimenta-preta", quantidade: "1 pitada (~2g)", quantidade_g: "2g" } },
];

const replacementFor = (name: unknown): Replacement => {
  const raw = norm(name).replace(/^(1|um|uma|umas|uns)\s+/, "");
  const found = REPLACEMENTS.find((r) => r.match.test(raw));
  return found ? found.value : REPLACEMENTS[5].value;
};

/**
 * Percorre o plano inteiro (qualquer formato) e substitui nomes genéricos
 * por alimentos específicos com medida caseira e gramatura.
 * Também limpa substituições genéricas ("outra fruta").
 */
export function enforceFoodSpecificity(plan: unknown): { corrigidos: string[] } {
  const corrigidos: string[] = [];

  const fixItem = (item: Record<string, unknown>) => {
    const key = typeof item.alimento === "string" ? "alimento" : typeof item.food_name === "string" ? "food_name" : null;
    if (!key) return;
    const original = String(item[key]);
    if (!isGenericFoodName(original)) return;
    const sub = replacementFor(original);
    item[key] = sub.alimento;
    if (key === "alimento") {
      item.quantidade = sub.quantidade;
      item.quantidade_g = sub.quantidade_g;
    } else {
      item.portion = sub.quantidade;
      item.medida_caseira = sub.quantidade;
    }
    corrigidos.push(`${original} → ${sub.alimento}`);
  };

  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (typeof obj.alimento === "string" || typeof obj.food_name === "string") fixItem(obj);
    if (Array.isArray(obj.substituicoes)) {
      obj.substituicoes = obj.substituicoes.filter(
        (s) => !isGenericFoodName((s as Record<string, unknown>)?.alimento),
      );
    }
    Object.values(obj).forEach(walk);
  };

  walk(plan);
  return { corrigidos: [...new Set(corrigidos)] };
}

/** Regra a ser injetada no system prompt de qualquer gerador de plano. */
export const FOOD_SPECIFICITY_PROMPT = `⛔ REGRA CRÍTICA — NUNCA usar nomes genéricos de categorias alimentares. Todo item deve ser um alimento específico com nome completo.

ERRADO: Fruta — 40g
CERTO: Banana prata — 1 unidade média (~90g)
ERRADO: Vegetais — 1 porção média (100g)
CERTO: Brócolis cozido no vapor — 1 xícara (~100g)
ERRADO: Castanhas — 10g
CERTO: Castanha do Pará — 1 unidade (~5g)
ERRADO: Legumes — à vontade
CERTO: Cenoura ralada + tomate — 1 prato de sobremesa (~120g)
ERRADO: Salada — à vontade
CERTO: Alface crespa + rúcula + pepino — à vontade (~150g)
ERRADO: Suco natural
CERTO: Suco de limão com água — 300ml (sem açúcar)

Proibido usar sozinho: fruta(s), vegetal/vegetais, verdura(s), legume(s), castanha(s), proteína(s), carboidrato(s), gordura(s), fibra(s), grão(s), oleaginosa(s), tubérculo(s), peixe, carne, salada, suco natural, vitamina, chá, tempero funcional sem listar os itens.

Se o plano pedir variedade dentro de uma categoria, liste 2–3 opções específicas separadas por "ou":
"Maçã fuji ou Pera williams ou Kiwi — 1 unidade média"

Sempre inclua: 1) nome específico do alimento; 2) forma de preparo quando relevante (grelhado, cozido, cru, no vapor); 3) quantidade em gramas; 4) medida caseira equivalente entre parênteses.

As SUBSTITUIÇÕES seguem a mesma regra: nunca "outra fruta"; sempre "Maçã fuji (~120g)", "Pera williams (~130g)", "Kiwi (~80g)".

`;
