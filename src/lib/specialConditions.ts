/**
 * nutriON — NutriPlan · Condições Especiais
 * Uma condição especial NÃO substitui o perfil corporal: ela modula o plano
 * (macros, alimentos priorizados/evitados, sódio, hidratação, timing e suplementação).
 */

export type SpecialConditionKey =
  | "resistencia_insulina"
  | "diabetes_t2"
  | "hipertensao"
  | "lipedema"
  | "sop"
  | "hipotireoidismo"
  | "doenca_celiaca"
  | "intolerancia_lactose";

export interface MacroWindow {
  protein: [number, number];
  carb: [number, number];
  fat: [number, number];
}

export interface SpecialCondition {
  key: SpecialConditionKey;
  label: string;
  short?: string;
  /** Faixas percentuais de macros quando a condição está ativa. */
  macros?: MacroWindow;
  /** Ativações automáticas exibidas na UI. */
  activates: string[];
  prioritizedFoods?: { group: string; items: string[] }[];
  avoidedFoods?: string[];
  controversialFoods?: string[];
  sodiumMaxMg?: number;
  hydration?: string[];
  timing?: { slot: string; rules: string[] }[];
  supplements?: { name: string; dose: string; why: string; optional?: boolean }[];
  rules: string[];
}

export const DEFAULT_MACROS: MacroWindow = {
  protein: [25, 30],
  carb: [40, 45],
  fat: [25, 30],
};

export const LIPEDEMA: SpecialCondition = {
  key: "lipedema",
  label: "LIPEDEMA",
  short:
    "Acúmulo simétrico de gordura em membros, resistente a dieta e exercício. Inflamação crônica + comprometimento linfático + dor.",
  macros: { protein: [25, 30], carb: [25, 35], fat: [35, 45] },
  activates: [
    "Protocolo anti-inflamatório",
    "Controle de sódio (< 2.000 mg/dia)",
    "Foco em ômega-3 e antioxidantes",
    "Suporte linfático nutricional",
    "Suplementação específica",
  ],
  prioritizedFoods: [
    {
      group: "Proteínas anti-inflamatórias",
      items: [
        "Salmão (ômega-3 + astaxantina)",
        "Sardinha (ômega-3 barato)",
        "Atum",
        "Frango orgânico",
        "Ovos caipiras",
        "Peixes 2–3x/semana (mínimo)",
      ],
    },
    {
      group: "Carboidratos de baixo IG",
      items: [
        "Batata-doce",
        "Aveia (beta-glucana)",
        "Quinoa",
        "Arroz integral",
        "Frutas vermelhas (antocianinas)",
        "Abóbora (betacaroteno)",
      ],
    },
    {
      group: "Gorduras anti-inflamatórias",
      items: [
        "Azeite extra virgem (oleocanthal)",
        "Abacate (mono + potássio)",
        "Castanhas e nozes",
        "Linhaça moída (ômega-3 + lignanas)",
        "Chia",
      ],
    },
    {
      group: "Vegetais e temperos",
      items: [
        "Cúrcuma + pimenta-preta (curcumina + piperina)",
        "Gengibre (gingerol)",
        "Alho (alicina)",
        "Brócolis (sulforafano)",
        "Espinafre (magnésio + folato)",
        "Beterraba (nitratos)",
        "Salsão / aipo (diurético natural)",
        "Pepino (hidratação + silício)",
      ],
    },
    {
      group: "Drenagem linfática natural",
      items: [
        "Chá verde (EGCG)",
        "Dente-de-leão",
        "Cavalinha (silício)",
        "Limão (vitamina C)",
        "Água com gengibre e limão",
      ],
    },
  ],
  avoidedFoods: [
    "Açúcar refinado e doces",
    "Farinha branca (pão branco, massas refinadas)",
    "Óleos vegetais refinados (soja, milho, canola)",
    "Frituras",
    "Embutidos (presunto, salsicha, bacon)",
    "Refrigerante e sucos industrializados",
    "Álcool",
    "Fast food e ultraprocessados",
  ],
  controversialFoods: [
    "Laticínios (caseína) — substituir por vegetal se necessário; iogurte fermentado pode ser tolerado",
    "Glúten — testar 30 dias sem e reavaliar",
    "Soja (fitoestrogênios) — reduzir, não necessariamente eliminar",
    "Carne vermelha (ácido araquidônico) — limitar a 1–2x/semana",
  ],
  sodiumMaxMg: 2000,
  hydration: [
    "Base: 35 ml × peso IDEAL (não o peso real)",
    "Chá verde: 2–3 xícaras/dia",
    "Água com limão: 1 copo em jejum",
    "Chá de gengibre: 1–2 xícaras/dia",
    "Distribuir em pequenas doses ao longo do dia (não sobrecarregar o sistema linfático)",
    "Última grande ingestão hídrica até 19h (evitar edema noturno)",
  ],
  timing: [
    {
      slot: "MANHÃ (06–08h)",
      rules: [
        "Água com limão em jejum (15 min antes do café)",
        "Café da manhã anti-inflamatório",
        "Cúrcuma + gengibre no café ou chá",
        "Ômega-3 junto da refeição (absorção)",
      ],
    },
    {
      slot: "ALMOÇO (12–13h)",
      rules: [
        "Proteína + carb de baixo IG + salada abundante",
        "Azeite extra virgem cru na salada (não aquecer)",
        "Temperos: cúrcuma, alho, gengibre",
      ],
    },
    { slot: "LANCHE (15–16h)", rules: ["Frutas vermelhas + castanhas", "Chá verde"] },
    {
      slot: "JANTAR (18–19h)",
      rules: [
        "Mais leve que o almoço",
        "Priorizar peixe + vegetais",
        "Evitar carb pesado à noite (retenção)",
        "Último sódio do dia nessa refeição",
      ],
    },
    { slot: "CEIA (21h)", rules: ["Chá de camomila ou cavalinha", "Opcional: iogurte natural (se tolerar laticínio)"] },
  ],
  supplements: [
    { name: "Ômega-3 (EPA/DHA)", dose: "2–3 g/dia", why: "Anti-inflamatório principal. Reduz TNF-α e IL-6." },
    { name: "Cúrcuma / Curcumina", dose: "500–1000 mg/dia", why: "Com piperina para absorção. Anti-inflamatório e antioxidante." },
    { name: "Selênio", dose: "200 mcg/dia (1 castanha-do-pará)", why: "Suporte tireoidiano + antioxidante." },
    { name: "Vitamina D3", dose: "2.000–4.000 UI/dia", why: "Modula imunidade; deficiência é comum no lipedema." },
    { name: "Magnésio (glicinato)", dose: "400 mg/dia", why: "Relaxa musculatura, reduz retenção, melhora sono." },
    { name: "Diosmina + Hesperidina", dose: "900 mg + 100 mg/dia", why: "Bioflavonoides: parede vascular e drenagem linfática." },
    { name: "Castanha-da-Índia (escina)", dose: "300 mg/dia", why: "Reduz permeabilidade capilar e edema." },
    { name: "Bromelina", dose: "500 mg/dia", why: "Anti-edema e anti-inflamatória.", optional: true },
    { name: "Vitamina C", dose: "1000 mg/dia", why: "Colágeno vascular + antioxidante.", optional: true },
  ],
  rules: [
    "Reduzir carboidrato processado e priorizar baixo IG — reduz inflamação sistêmica e retenção hídrica",
    "Aumentar gorduras boas (ômega-3, azeite, abacate) mantendo a proteína para preservar massa magra",
    "Sódio < 2.000 mg/dia: sem shoyu, temperos prontos e enlatados; temperar com ervas frescas, limão e especiarias",
    "Jantar cedo (18–19h) e ceia leve — o sistema linfático trabalha melhor à noite",
    "Cada refeição deve trazer pelo menos 1 alimento anti-inflamatório sinalizado com 🟢 e o motivo",
    "Exibir 'Anti-inflamatório score: X/10' em cada refeição do plano",
    "Nunca prescrever medicação: a suplementação é sugestão e deve ser validada por médico/nutrólogo",
  ],
};

const simple = (
  key: SpecialConditionKey,
  label: string,
  activates: string[],
  rules: string[],
): SpecialCondition => ({ key, label, activates, rules });

export const SPECIAL_CONDITIONS: SpecialCondition[] = [
  simple(
    "resistencia_insulina",
    "Resistência à insulina",
    ["Controle glicêmico", "Carboidratos de baixo IG", "Fibra elevada"],
    ["Priorizar baixo IG e fibra ≥ 30g/dia", "Distribuir carboidrato ao redor do treino", "Evitar açúcar simples isolado"],
  ),
  simple(
    "diabetes_t2",
    "Diabetes tipo 2",
    ["Controle glicêmico rigoroso", "Consistência de carboidrato por refeição"],
    ["Carboidrato consistente por refeição", "Sem açúcar simples isolado", "Acompanhamento médico obrigatório"],
  ),
  simple(
    "hipertensao",
    "Hipertensão",
    ["Controle de sódio", "Padrão DASH", "Potássio e magnésio"],
    ["Sódio < 2.000 mg/dia", "Priorizar potássio, magnésio e cálcio", "Evitar embutidos e enlatados"],
  ),
  LIPEDEMA,
  simple(
    "sop",
    "SOP (Síndrome do Ovário Policístico)",
    ["Anti-inflamatório", "Controle de insulina", "Inositol"],
    ["Baixo IG + anti-inflamatório", "Considerar inositol (validação médica)", "Priorizar fibra e gorduras boas"],
  ),
  simple(
    "hipotireoidismo",
    "Hipotireoidismo",
    ["Selênio e zinco", "Iodo controlado", "Avaliar glúten"],
    ["Selênio e zinco adequados", "Iodo controlado", "Separar levotiroxina de cálcio/ferro por 4h (orientação médica)"],
  ),
  simple(
    "doenca_celiaca",
    "Doença celíaca",
    ["Exclusão total de glúten", "Atenção a contaminação cruzada"],
    ["Zero glúten, sem exceções", "Atenção à contaminação cruzada", "Reforçar ferro, B12 e folato"],
  ),
  simple(
    "intolerancia_lactose",
    "Intolerância à lactose",
    ["Substituições sem lactose", "Cálcio alternativo"],
    ["Usar versões zero lactose ou vegetais", "Garantir cálcio por outras fontes"],
  ),
];

export const getSpecialCondition = (key: string) =>
  SPECIAL_CONDITIONS.find((c) => c.key === key);

/** Faixa de macros resultante das condições ativas (a mais restritiva vence). */
export function macrosForConditions(keys: string[]): MacroWindow {
  return keys.reduce<MacroWindow>((acc, k) => getSpecialCondition(k)?.macros ?? acc, DEFAULT_MACROS);
}

/* ── Meta de sódio ────────────────────────────────────────────────── */

export const SODIUM_TARGET_DEFAULT_MG = 2000;
export const SODIUM_TARGET_MIN_MG = 1000;
export const SODIUM_TARGET_MAX_MG = 3000;

/** Meta de sódio padrão das condições ativas (a mais restritiva vence). */
export function sodiumTargetForConditions(keys: string[]): number | null {
  const values = keys
    .map((k) => getSpecialCondition(k)?.sodiumMaxMg)
    .filter((v): v is number => typeof v === "number");
  return values.length ? Math.min(...values) : null;
}

/** Meta efetiva: a definida pelo coach tem prioridade sobre o padrão da condição. */
export function effectiveSodiumTarget(keys: string[], coachTarget?: number | null): number | null {
  if (coachTarget && coachTarget > 0) return Math.round(coachTarget);
  return sodiumTargetForConditions(keys);
}

/** Rigor da meta — recalcula o quanto o plano precisa evitar sódio. */
export type SodiumTier = "rigoroso" | "moderado" | "flexivel";

export function sodiumTier(targetMg: number): SodiumTier {
  if (targetMg <= 1500) return "rigoroso";
  if (targetMg <= 2300) return "moderado";
  return "flexivel";
}

/** Estimativa de sódio por porção usual (mg) para sinalização visual. */
const SODIUM_MAP: { match: RegExp; mg: number; why: string }[] = [
  { match: /shoyu|molho de soja/i, mg: 900, why: "Shoyu ~900 mg/colher" },
  { match: /caldo (de )?(carne|galinha)|tempero pronto|sazon/i, mg: 850, why: "Tempero pronto" },
  { match: /presunto|salsicha|bacon|linguiça|linguica|mortadela|salame|embutido/i, mg: 700, why: "Embutido" },
  { match: /queijo (parmes[ãa]o|prato|coalho)|requeij[ãa]o/i, mg: 450, why: "Queijo curado" },
  { match: /enlatado|conserva|azeitona|atum em [óo]leo|milho em conserva/i, mg: 400, why: "Conserva" },
  { match: /p[ãa]o (franc[êe]s|de forma)|biscoito|torrada|salgadinho/i, mg: 350, why: "Panificado / snack" },
  { match: /peito de peru|blanquet/i, mg: 320, why: "Processado" },
  { match: /whey|isolado proteico/i, mg: 120, why: "Suplemento" },
  { match: /ricota|queijo minas|iogurte/i, mg: 90, why: "Lácteo" },
];

export interface SodiumBadge {
  mg: number;
  why: string;
  level: "alto" | "moderado";
}

/**
 * Sinaliza alimentos ricos em sódio de acordo com a meta ativa.
 * Quanto menor a meta, mais itens sobem para o nível "alto".
 */
export function sodiumBadge(foodName: string, targetMg: number): SodiumBadge | null {
  if (!foodName || !targetMg) return null;
  const hit = SODIUM_MAP.find((s) => s.match.test(foodName));
  if (!hit) return null;
  // Um item vale "alto" quando sozinho consome >= 25% da meta do dia.
  const level: SodiumBadge["level"] = hit.mg >= targetMg * 0.25 ? "alto" : "moderado";
  return { mg: hit.mg, why: hit.why, level };
}

/** Alimentos que o plano deve evitar por causa da meta de sódio escolhida. */
export function sodiumAvoidList(targetMg: number): string[] {
  const tier = sodiumTier(targetMg);
  const base = [
    "Shoyu e molhos prontos",
    "Temperos industrializados e caldos em cubo",
    "Embutidos (presunto, salsicha, bacon, linguiça)",
    "Enlatados e conservas",
  ];
  if (tier === "flexivel") return base;
  const strict = [...base, "Queijos curados (parmesão, prato, coalho)", "Pães e biscoitos industrializados"];
  if (tier === "moderado") return strict;
  return [...strict, "Peito de peru e frios light", "Azeitonas e picles", "Refeições congeladas prontas"];
}

/** Distribuição sugerida do sódio ao longo do dia (mg por refeição). */
export function sodiumSplit(targetMg: number) {
  return [
    { slot: "Café da manhã", mg: Math.round(targetMg * 0.15) },
    { slot: "Almoço", mg: Math.round(targetMg * 0.35) },
    { slot: "Lanche", mg: Math.round(targetMg * 0.1) },
    { slot: "Jantar", mg: Math.round(targetMg * 0.3) },
    { slot: "Ceia", mg: Math.round(targetMg * 0.1) },
  ];
}

/** Contexto textual injetado no prompt da IA do NutriPlan. */
export function buildSpecialConditionsContext(
  keys: string[],
  opts?: { sodiumTargetMg?: number | null },
): string[] {
  const active = keys.map(getSpecialCondition).filter(Boolean) as SpecialCondition[];
  if (!active.length) return [];

  const parts: string[] = [`CONDIÇÕES ESPECIAIS ATIVAS: ${active.map((c) => c.label).join(", ")}`];
  const m = macrosForConditions(keys);
  parts.push(
    `DISTRIBUIÇÃO DE MACROS AJUSTADA: proteína ${m.protein[0]}–${m.protein[1]}% · carboidrato ${m.carb[0]}–${m.carb[1]}% · gordura ${m.fat[0]}–${m.fat[1]}%`,
  );

  const sodium = effectiveSodiumTarget(keys, opts?.sodiumTargetMg);
  if (sodium) {
    parts.push(
      [
        `META DE SÓDIO DEFINIDA PELO COACH: < ${sodium} mg/dia (rigor ${sodiumTier(sodium)})`,
        `DISTRIBUIÇÃO MÁXIMA DE SÓDIO POR REFEIÇÃO: ${sodiumSplit(sodium)
          .map((s) => `${s.slot} ≤ ${s.mg} mg`)
          .join(" · ")}`,
        `EVITAR POR CAUSA DA META DE SÓDIO: ${sodiumAvoidList(sodium).join("; ")}`,
        "Informar o sódio estimado (mg) de cada refeição e o total do dia; nunca ultrapassar a meta.",
      ].join("\n"),
    );
  }

  for (const c of active) {
    const block: string[] = [`--- ${c.label} ---`];
    if (c.prioritizedFoods?.length) {
      block.push(
        `ALIMENTOS PRIORIZADOS:\n${c.prioritizedFoods
          .map((g) => `  ${g.group}: ${g.items.join("; ")}`)
          .join("\n")}`,
      );
    }
    if (c.avoidedFoods?.length) block.push(`ALIMENTOS EVITADOS: ${c.avoidedFoods.join("; ")}`);
    if (c.controversialFoods?.length) block.push(`CONTROVERSOS (avaliar): ${c.controversialFoods.join("; ")}`);
    if (c.sodiumMaxMg) block.push(`SÓDIO MÁXIMO: ${sodium ?? c.sodiumMaxMg} mg/dia`);
    if (c.hydration?.length) block.push(`HIDRATAÇÃO: ${c.hydration.join("; ")}`);
    if (c.timing?.length)
      block.push(`TIMING:\n${c.timing.map((t) => `  ${t.slot}: ${t.rules.join("; ")}`).join("\n")}`);
    if (c.supplements?.length)
      block.push(
        `SUPLEMENTAÇÃO SUGERIDA (validar com médico/nutrólogo): ${c.supplements
          .map((s) => `${s.name} ${s.dose}${s.optional ? " (opcional)" : ""} — ${s.why}`)
          .join(" | ")}`,
      );
    block.push(`REGRAS OBRIGATÓRIAS:\n- ${c.rules.join("\n- ")}`);
    parts.push(block.join("\n"));
  }
  return parts;
}

/* ── Checklist do protocolo (plano do cliente) ────────────────────── */

export interface ProtocolChecklistItem {
  key: string;
  emoji: string;
  label: string;
  detail: string;
  cadence: "daily" | "weekly";
  /** Só para itens semanais: quantas vezes na semana. */
  timesPerWeek?: number;
}

/** Checklist do protocolo de lipedema, com a meta de sódio já aplicada. */
export function lipedemaChecklist(sodiumTargetMg = SODIUM_TARGET_DEFAULT_MG): ProtocolChecklistItem[] {
  const split = sodiumSplit(sodiumTargetMg);
  return [
    {
      key: "omega3",
      emoji: "🐟",
      label: "Ômega-3 (2–3 g)",
      detail: "Tomar junto de uma refeição com gordura — absorção máxima.",
      cadence: "daily",
    },
    {
      key: "curcuma",
      emoji: "🌿",
      label: "Cúrcuma + pimenta-preta",
      detail: "500–1000 mg de curcumina; a piperina multiplica a absorção.",
      cadence: "daily",
    },
    {
      key: "sodio",
      emoji: "🧂",
      label: `Sódio abaixo de ${sodiumTargetMg} mg`,
      detail: `${split[1].slot} ≤ ${split[1].mg} mg · ${split[3].slot} ≤ ${split[3].mg} mg. Sem shoyu, tempero pronto ou embutido.`,
      cadence: "daily",
    },
    {
      key: "hidratacao",
      emoji: "💧",
      label: "Hidratação distribuída",
      detail: "Pequenas doses ao longo do dia; última grande ingestão até 19h.",
      cadence: "daily",
    },
    {
      key: "cha_verde",
      emoji: "🍵",
      label: "Chá verde / gengibre",
      detail: "2–3 xícaras ao dia + água com limão em jejum.",
      cadence: "daily",
    },
    {
      key: "jantar_cedo",
      emoji: "🌙",
      label: "Jantar até 19h",
      detail: "Refeição leve, peixe + vegetais, sem carboidrato pesado.",
      cadence: "daily",
    },
    {
      key: "peixe_semana",
      emoji: "🐠",
      label: "Peixe 3x na semana",
      detail: "Salmão, sardinha ou atum — fonte principal de EPA/DHA.",
      cadence: "weekly",
      timesPerWeek: 3,
    },
    {
      key: "sem_ultraprocessado",
      emoji: "🚫",
      label: "Semana sem ultraprocessado",
      detail: "Zero fritura, refrigerante, embutido e álcool.",
      cadence: "weekly",
      timesPerWeek: 1,
    },
  ];
}


/* ── Badges anti-inflamatórios no plano do cliente ───────────────── */

const ANTI_INFLAMMATORY_MAP: { match: RegExp; why: string }[] = [
  { match: /salm[ãa]o/i, why: "Ômega-3 + astaxantina" },
  { match: /sardinha|atum|peixe|tilápia|tilapia/i, why: "Ômega-3" },
  { match: /batata[- ]doce/i, why: "Baixo IG" },
  { match: /aveia/i, why: "Beta-glucana" },
  { match: /quinoa/i, why: "Aminoácidos completos" },
  { match: /arroz integral/i, why: "Fibra" },
  { match: /frutas vermelhas|morango|mirtilo|amora|framboesa|açaí|acai/i, why: "Antocianinas" },
  { match: /ab[óo]bora|cenoura/i, why: "Betacaroteno" },
  { match: /azeite/i, why: "Oleocanthal" },
  { match: /abacate/i, why: "Gordura mono + potássio" },
  { match: /castanha|noz|am[êe]ndoa/i, why: "Ômega-3 vegetal" },
  { match: /linha[çc]a|chia/i, why: "Ômega-3 + fibra" },
  { match: /c[úu]rcuma|a[çc]afr[ãa]o[- ]da[- ]terra/i, why: "Curcumina + piperina" },
  { match: /gengibre/i, why: "Gingerol" },
  { match: /alho/i, why: "Alicina" },
  { match: /br[óo]colis|couve|couve-flor/i, why: "Sulforafano" },
  { match: /espinafre|r[úu]cula/i, why: "Magnésio + folato" },
  { match: /beterraba/i, why: "Nitratos" },
  { match: /sals[ãa]o|aipo/i, why: "Diurético natural" },
  { match: /pepino/i, why: "Hidratação + silício" },
  { match: /ch[áa] verde/i, why: "EGCG" },
  { match: /lim[ãa]o/i, why: "Vitamina C" },
  { match: /ovo/i, why: "Proteína completa" },
];

const PRO_INFLAMMATORY = /(a[çc][úu]car|farinha branca|frito|fritura|presunto|salsicha|bacon|refrigerante|embutido|salgadinho|shoyu)/i;

/** Retorna o motivo anti-inflamatório de um alimento, ou null. */
export function antiInflammatoryBadge(foodName: string): string | null {
  if (!foodName) return null;
  return ANTI_INFLAMMATORY_MAP.find((e) => e.match.test(foodName))?.why ?? null;
}

/** Score 0–10 de aderência anti-inflamatória de uma refeição. */
export function antiInflammatoryScore(foods: string[]): number {
  const list = foods.filter(Boolean);
  if (!list.length) return 0;
  const good = list.filter((f) => antiInflammatoryBadge(f)).length;
  const bad = list.filter((f) => PRO_INFLAMMATORY.test(f)).length;
  const raw = (good / list.length) * 10 - bad * 2;
  return Math.max(0, Math.min(10, Math.round(raw)));
}
