/**
 * nutriON — NutriPlan · Perfis de Composição Corporal
 * Fórmulas de TMB e distribuição de macros por perfil corporal.
 * Cada corpo é diferente — o cálculo tem que ser também.
 */

export type BodyProfileType =
  | "padrao"
  | "atletico"
  | "sobrepeso"
  | "obeso"
  | "obeso_severo"
  | "masters"
  | "adolescente";

export type FatDistribution = "androide" | "ginoide" | "misto";
export type MuscleDevelopment = "baixo" | "moderado" | "alto" | "muito_alto";
export type ProteinReference = "real" | "ideal";

export interface BodyProfile {
  type: BodyProfileType;
  weight_kg: number;
  height_cm: number;
  age: number;
  sex: "M" | "F";
  bf_percent?: number;
  lean_mass_kg?: number;
  waist_cm?: number;
  /** Fator de ajuste do peso (0.20–0.38) */
  abw_factor?: number;
  comorbidities: string[];
}

export interface TMBResult {
  tmb: number;
  formula: string;
  weight_used: number;
  ideal_weight?: number;
  adjusted_weight?: number;
  abw_factor?: number;
  note?: string;
  alerts: string[];
}

export interface MacroRatio {
  protein_g_per_kg: number;
  protein_reference: ProteinReference;
  protein_total: number;
  carb_percent: number;
  fat_percent: number;
  protein_percent: number;
  fiber_min: number;
  note: string;
}

export const BODY_PROFILES: {
  v: BodyProfileType;
  l: string;
  d: string;
  bf?: string;
  formula: string;
  warn?: string;
}[] = [
  {
    v: "padrao",
    l: "PADRÃO",
    d: "Composição dentro da normalidade",
    bf: "BF: 12–25% (H) · 18–32% (M)",
    formula: "Mifflin-St Jeor",
  },
  {
    v: "atletico",
    l: "ATLÉTICO / MUSCULAR",
    d: "Alta massa muscular, BF baixo",
    bf: "BF: <15% (H) · <22% (M)",
    formula: "Katch-McArdle (LBM)",
  },
  {
    v: "sobrepeso",
    l: "SOBREPESO",
    d: "IMC 25–30 · Gordura moderada",
    formula: "Mifflin + ajuste −10%",
  },
  {
    v: "obeso",
    l: "OBESIDADE",
    d: "IMC 30+ · Alta gordura corporal",
    bf: "BF: >30% (H) · >38% (M)",
    formula: "Mifflin + Peso Ajustado (ABW 0.25)",
    warn: "Proteína calculada pelo peso ideal",
  },
  {
    v: "obeso_severo",
    l: "OBESIDADE SEVERA / MÓRBIDA",
    d: "IMC 40+ · Comorbidades prováveis",
    formula: "Mifflin + ABW 0.20 + margem de segurança",
    warn: "Acompanhamento médico recomendado",
  },
  {
    v: "masters",
    l: "MASTERS 50+",
    d: "Metabolismo reduzido pela idade",
    formula: "Mifflin × fator etário",
  },
  {
    v: "adolescente",
    l: "ADOLESCENTE (14–17)",
    d: "Em fase de crescimento",
    formula: "Schofield + crescimento",
    warn: "Nunca prescrever déficit calórico",
  },
];

export const COMORBIDITIES = [
  "Resistência à insulina / Pré-diabetes",
  "Diabetes tipo 2",
  "Hipertensão",
  "Apneia do sono",
  "Dislipidemia",
  "Síndrome metabólica",
  "Hipotireoidismo",
  "SOP (mulheres)",
];

export const ABW_FACTORS = [
  { v: 0.2, l: "0.20 — conservador" },
  { v: 0.25, l: "0.25 — padrão clínico" },
  { v: 0.3, l: "0.30 — menos conservador" },
  { v: 0.38, l: "0.38 — obesos muito ativos" },
];

export const idealWeightKg = (height_cm: number) => (height_cm / 100) ** 2 * 22;

export const bmi = (weight_kg: number, height_cm: number) =>
  height_cm > 0 ? weight_kg / (height_cm / 100) ** 2 : 0;

export const leanMassKg = (weight_kg: number, bf_percent?: number) =>
  bf_percent && bf_percent > 0 ? weight_kg * (1 - bf_percent / 100) : undefined;

const mifflin = (w: number, h: number, age: number, sex: "M" | "F") =>
  sex === "M"
    ? 10 * w + 6.25 * h - 5 * age - 5
    : 10 * w + 6.25 * h - 5 * age - 161;

export function calculateTMB(profile: BodyProfile): TMBResult {
  const { type, weight_kg, height_cm, age, sex } = profile;
  const alerts: string[] = [];

  switch (type) {
    case "atletico": {
      const lbm =
        profile.lean_mass_kg ||
        weight_kg * (1 - (profile.bf_percent || 15) / 100);
      return {
        tmb: Math.round(370 + 21.6 * lbm),
        formula: "Katch-McArdle (LBM)",
        weight_used: Math.round(lbm * 10) / 10,
        note: `Massa magra: ${lbm.toFixed(1)}kg · proteína pelo peso real`,
        alerts,
      };
    }

    case "obeso":
    case "obeso_severo": {
      const ideal = idealWeightKg(height_cm);
      const abwFactor =
        profile.abw_factor || (type === "obeso_severo" ? 0.2 : 0.25);
      const adjusted = ideal + abwFactor * (weight_kg - ideal);
      let tmb = mifflin(adjusted, height_cm, age, sex);
      const minTMB = sex === "M" ? 1400 : 1200;
      if (tmb < minTMB) {
        tmb = minTMB;
        alerts.push(`Mínimo de segurança aplicado: ${minTMB} kcal`);
      }
      alerts.push("Proteína calculada pelo peso ideal, não pelo peso real");
      if (type === "obeso_severo") {
        alerts.push(
          "⚠️ IMC > 40 — acompanhamento médico recomendado. Plano calculado com margem de segurança."
        );
        alerts.push("Sem jejum intermitente · check-in semanal de peso obrigatório");
      }
      return {
        tmb: Math.round(tmb),
        formula: "Mifflin + Peso Ajustado (ABW)",
        weight_used: Math.round(adjusted * 10) / 10,
        ideal_weight: Math.round(ideal * 10) / 10,
        adjusted_weight: Math.round(adjusted * 10) / 10,
        abw_factor: abwFactor,
        note: `Peso ideal: ${ideal.toFixed(1)}kg · Peso ajustado: ${adjusted.toFixed(1)}kg · Fator: ${abwFactor}`,
        alerts,
      };
    }

    case "masters": {
      const ageFactor = age >= 70 ? 0.85 : age >= 60 ? 0.9 : 0.95;
      const tmb = mifflin(weight_kg, height_cm, age, sex) * ageFactor;
      alerts.push("Proteína elevada (1.2–1.6 g/kg) · priorizar cálcio, vit. D e B12");
      return {
        tmb: Math.round(tmb),
        formula: `Mifflin × ${ageFactor} (ajuste etário)`,
        weight_used: weight_kg,
        alerts,
      };
    }

    case "adolescente": {
      const base =
        sex === "M" ? 17.7 * weight_kg + 657 : 13.4 * weight_kg + 692;
      const growthBonus = age <= 15 ? 400 : 200;
      alerts.push("⚠️ Nunca prescrever déficit calórico. Restrição só com aval médico.");
      return {
        tmb: Math.round(base + growthBonus),
        formula: "Schofield + crescimento",
        weight_used: weight_kg,
        note: `Bônus crescimento: +${growthBonus} kcal`,
        alerts,
      };
    }

    case "sobrepeso":
    case "padrao":
    default: {
      let tmb = mifflin(weight_kg, height_cm, age, sex);
      if (type === "sobrepeso") tmb *= 0.9;
      return {
        tmb: Math.round(tmb),
        formula: type === "sobrepeso" ? "Mifflin-St Jeor × 0.90" : "Mifflin-St Jeor",
        weight_used: weight_kg,
        alerts,
      };
    }
  }
}

const defaultMacros = (profile: BodyProfile, goal: string): MacroRatio => {
  const ptn = goal === "bulking" ? 2.0 : goal === "cutting" ? 2.2 : 1.8;
  return {
    protein_g_per_kg: ptn,
    protein_reference: "real",
    protein_total: Math.round(profile.weight_kg * ptn),
    carb_percent: goal === "cutting" ? 0.35 : 0.45,
    fat_percent: 0.25,
    protein_percent: goal === "cutting" ? 0.4 : 0.3,
    fiber_min: 25,
    note: "Distribuição padrão pelo objetivo",
  };
};

export function getMacroDistribution(
  profile: BodyProfile,
  goal: string
): MacroRatio {
  const ideal = idealWeightKg(profile.height_cm);

  if ((profile.type === "obeso" || profile.type === "obeso_severo") && goal === "cutting") {
    const gkg = profile.type === "obeso_severo" ? 1.5 : 1.8;
    return {
      protein_g_per_kg: gkg,
      protein_reference: "ideal",
      protein_total: Math.round(ideal * gkg),
      carb_percent: 0.3,
      fat_percent: 0.3,
      protein_percent: 0.4,
      fiber_min: 30,
      note: "Proteína calculada pelo peso ideal, não pelo peso real",
    };
  }

  if (profile.type === "obeso" && goal === "recomp") {
    return {
      protein_g_per_kg: 2.0,
      protein_reference: "ideal",
      protein_total: Math.round(ideal * 2.0),
      carb_percent: 0.35,
      fat_percent: 0.25,
      protein_percent: 0.4,
      fiber_min: 35,
      note: "Proteína alta pra preservar massa magra durante perda de gordura",
    };
  }

  if (profile.type === "atletico" && goal === "bulking") {
    return {
      protein_g_per_kg: 2.2,
      protein_reference: "real",
      protein_total: Math.round(profile.weight_kg * 2.2),
      carb_percent: 0.5,
      fat_percent: 0.2,
      protein_percent: 0.3,
      fiber_min: 25,
      note: "Carb alto pra suportar volume de treino e crescimento",
    };
  }

  if (profile.type === "masters") {
    return {
      protein_g_per_kg: 1.6,
      protein_reference: "real",
      protein_total: Math.round(profile.weight_kg * 1.6),
      carb_percent: 0.4,
      fat_percent: 0.3,
      protein_percent: 0.3,
      fiber_min: 25,
      note: "Proteína elevada pra sarcopenia + gordura adequada pra hormônios",
    };
  }

  if (profile.type === "adolescente") {
    return {
      protein_g_per_kg: 1.6,
      protein_reference: "real",
      protein_total: Math.round(profile.weight_kg * 1.6),
      carb_percent: 0.5,
      fat_percent: 0.25,
      protein_percent: 0.25,
      fiber_min: 20,
      note: "⚠️ Nunca prescrever déficit calórico. Fase de crescimento.",
    };
  }

  return defaultMacros(profile, goal);
}

/** Ajustes de refeição específicos por perfil — injetados no contexto do plano. */
export const MEAL_RULES: Record<BodyProfileType, string[]> = {
  padrao: [],
  atletico: [
    "Proteína pelo peso REAL (mais massa = mais demanda)",
    "Carb cycling mais agressivo (treino vs descanso)",
    "Pré/pós-treino com janela anabólica otimizada",
    "Refeições maiores e mais densas · IG menos relevante",
  ],
  sobrepeso: [
    "Densidade calórica moderada · priorizar proteína e fibra",
    "Carboidratos preferencialmente integrais",
  ],
  obeso: [
    "Priorizar alimentos de alta saciedade (fibra, proteína, volume)",
    "Vegetais de volume à vontade (abobrinha, pepino, folhosas)",
    "Reduzir densidade calórica · distribuir em mais refeições",
    "Carboidratos integrais e de baixo IG",
    "Temperos termogênicos (gengibre, canela, pimenta)",
    "Hidratação: 40ml/kg de peso IDEAL",
    "Fruta inteira em vez de suco (fibra)",
  ],
  obeso_severo: [
    "Tudo do perfil OBESO +",
    "Meta calórica NUNCA abaixo de 1.400 kcal (H) / 1.200 kcal (M)",
    "Proteína mínima 1.5 g/kg de peso ideal",
    "Velocidade de perda: 0.5–1% do peso por semana",
    "Sem jejum intermitente (risco de compulsão)",
    "Check-in semanal de peso obrigatório",
  ],
  masters: [
    "Proteína distribuída em 4–5 pulsos diários",
    "Cálcio, vitamina D e B12 priorizados",
  ],
  adolescente: [
    "Sem déficit calórico · foco em crescimento",
    "Cálcio e ferro priorizados",
  ],
};

/** Regras adicionais disparadas por comorbidade. */
export function comorbidityRules(comorbidities: string[]): string[] {
  const rules: string[] = [];
  const has = (s: string) => comorbidities.some((c) => c.toLowerCase().includes(s));
  if (has("insulina") || has("diabetes") || has("metabólica"))
    rules.push("Carboidratos de baixo IG · evitar açúcares livres · fibra ≥ 30g");
  if (has("hipertens")) rules.push("Sódio controlado (< 2g/dia) · atenção nas substituições");
  if (has("dislipidemia")) rules.push("Gordura saturada reduzida · priorizar mono/poli-insaturadas e ômega-3");
  if (has("apneia")) rules.push("Refeição noturna leve · evitar álcool");
  if (has("hipotireoid")) rules.push("Selênio, zinco e iodo adequados · atenção a excesso de crucíferas cruas");
  if (has("sop")) rules.push("Baixo IG + inositol alimentar · controle de insulina prioritário");
  return rules;
}

/** Contexto textual para a geração do plano. */
export function buildBodyProfileContext(
  profile: BodyProfile,
  tmb: TMBResult,
  macros: MacroRatio
): string[] {
  const parts: string[] = [];
  const meta = BODY_PROFILES.find((p) => p.v === profile.type);
  parts.push(`PERFIL CORPORAL: ${meta?.l || profile.type}`);
  parts.push(
    `TMB CALCULADA: ${tmb.tmb} kcal · fórmula ${tmb.formula} · peso usado ${tmb.weight_used}kg`
  );
  if (tmb.ideal_weight)
    parts.push(
      `PESO IDEAL: ${tmb.ideal_weight}kg · PESO AJUSTADO: ${tmb.adjusted_weight}kg (fator ${tmb.abw_factor})`
    );
  if (profile.bf_percent) parts.push(`BF ESTIMADO: ${profile.bf_percent}%`);
  if (profile.waist_cm) parts.push(`CIRCUNFERÊNCIA ABDOMINAL: ${profile.waist_cm} cm`);
  parts.push(
    `PROTEÍNA: ${macros.protein_total}g (${macros.protein_g_per_kg} g/kg de peso ${macros.protein_reference === "ideal" ? "IDEAL" : "REAL"}) · fibra mínima ${macros.fiber_min}g`
  );
  const rules = [...MEAL_RULES[profile.type], ...comorbidityRules(profile.comorbidities)];
  if (profile.comorbidities.length)
    parts.push(`COMORBIDADES: ${profile.comorbidities.join(", ")}`);
  if (rules.length) parts.push(`REGRAS DO PERFIL:\n- ${rules.join("\n- ")}`);
  if (tmb.alerts.length) parts.push(`ALERTAS: ${tmb.alerts.join(" | ")}`);
  return parts;
}

export const VISUAL_DISCLAIMER =
  "A análise visual é uma estimativa baseada em foto e dados biométricos. Para precisão clínica, recomenda-se avaliação por bioimpedância, DEXA ou pesagem hidrostática. O coach tem a decisão final sobre o perfil utilizado no plano.";
