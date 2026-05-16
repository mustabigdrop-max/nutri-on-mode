/**
 * Módulo Feminino Específico — nutriON
 * Fonte única de verdade para detecção de sexo F, fases do ciclo e adaptações.
 */

export type CyclePhase =
  | "menstrual"
  | "follicular"
  | "ovulatory"
  | "luteal_early"
  | "luteal_late";

export type FeminineCategory =
  | "bikini"
  | "wellness"
  | "figure"
  | "physique"
  | "bikini_fitness";

/* ---------- Detecção de sexo ---------- */

export function isFeminine(input: any): boolean {
  if (!input) return false;
  const v =
    input.sex ??
    input.sexo ??
    input.gender ??
    (typeof input === "string" ? input : "");
  const s = String(v).trim().toLowerCase();
  return s === "f" || s === "feminino" || s === "female";
}

/* ---------- Cálculo da fase do ciclo ---------- */

export function getCycleDayCount(
  lastPeriodDate: string | Date | null,
  cycleLength = 28,
): number | null {
  if (!lastPeriodDate) return null;
  const last = new Date(lastPeriodDate);
  if (isNaN(last.getTime())) return null;
  const diffMs = Date.now() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  const day = (diffDays % Math.max(cycleLength, 21)) + 1;
  return day;
}

export function getCyclePhase(
  lastPeriodDate: string | Date | null,
  cycleLength = 28,
): CyclePhase | null {
  const day = getCycleDayCount(lastPeriodDate, cycleLength);
  if (!day) return null;
  if (day <= 5) return "menstrual";
  if (day <= 13) return "follicular";
  if (day <= 16) return "ovulatory";
  if (day <= 21) return "luteal_early";
  return "luteal_late";
}

/* ---------- Labels e visualização ---------- */

export const CYCLE_PHASE_INFO: Record<
  CyclePhase,
  { label: string; emoji: string; color: string; bg: string; range: string }
> = {
  menstrual:    { label: "Menstrual",     emoji: "🔴", color: "#ef4444", bg: "rgba(239,68,68,.12)",  range: "dia 1-5" },
  follicular:   { label: "Folicular",     emoji: "🟡", color: "#eab308", bg: "rgba(234,179,8,.12)",  range: "dia 6-13" },
  ovulatory:    { label: "Ovulatória",    emoji: "🟢", color: "#22c55e", bg: "rgba(34,197,94,.12)",  range: "dia 14-16" },
  luteal_early: { label: "Lútea precoce", emoji: "🟠", color: "#f59e0b", bg: "rgba(245,158,11,.12)", range: "dia 17-21" },
  luteal_late:  { label: "Lútea tardia",  emoji: "🟠", color: "#f97316", bg: "rgba(249,115,22,.18)", range: "dia 22-28" },
};

export function getCyclePhaseLabel(phase: CyclePhase | null) {
  return phase ? CYCLE_PHASE_INFO[phase] : null;
}

/* ---------- Categorias femininas ---------- */

export const FEMININE_CATEGORIES: Record<
  FeminineCategory,
  { label: string; padrao: string; bfRange: string; foco: string; tags: string[] }
> = {
  bikini: {
    label: "Bikini",
    padrao: "Shape atlético suave, cintura definida, glúteo desenvolvido e arredondado, proporção equilibrada.",
    bfRange: "10-13%",
    foco: "Simetria, apresentação, qualidade de pele, posing fluido.",
    tags: ["glúteo", "cintura", "proporção", "apresentação"],
  },
  wellness: {
    label: "Wellness",
    padrao: "Glúteo e posterior de coxa muito desenvolvidos, cintura fina, parte superior mais seca.",
    bfRange: "10-14%",
    foco: "Desenvolvimento de MMII, proporção inferior/superior.",
    tags: ["glúteo", "posterior", "quadríceps", "cintura"],
  },
  figure: {
    label: "Figure",
    padrao: "Mais massa que Bikini, ombros desenvolvidos, V-taper feminino, cintura estreita.",
    bfRange: "8-12%",
    foco: "Largura dorsal, ombros, cintura, simetria.",
    tags: ["dorsais", "ombros", "cintura", "simetria"],
  },
  physique: {
    label: "Women's Physique",
    padrao: "Massa muscular visível com feminilidade, estriações em condicionamento, V-taper pronunciado.",
    bfRange: "7-10%",
    foco: "Condicionamento, simetria, massa, apresentação.",
    tags: ["condicionamento", "simetria", "massa", "apresentação"],
  },
  bikini_fitness: {
    label: "Bikini Fitness (IFBB BR)",
    padrao: "Shape equilibrado, glúteo presente, condicionamento moderado, apresentação e posing.",
    bfRange: "12-16%",
    foco: "Equilíbrio, glúteo, condicionamento moderado.",
    tags: ["glúteo", "shape", "posing"],
  },
};

export function normalizeFeminineCategory(cat?: string | null): FeminineCategory | null {
  if (!cat) return null;
  const s = cat.toLowerCase();
  if (s.includes("wellness")) return "wellness";
  if (s.includes("figure")) return "figure";
  if (s.includes("physique")) return "physique";
  if (s.includes("fitness")) return "bikini_fitness";
  if (s.includes("bikini")) return "bikini";
  return null;
}

/* ---------- Ajustes por fase ---------- */

export function getFemininePhaseAdjustments(phase: CyclePhase | null) {
  switch (phase) {
    case "menstrual":
      return {
        volumeMultiplier: 0.75,
        rpeMax: 7,
        kcalAdjust: 0,
        nutritionNote: "Aumentar ferro, magnésio e anti-inflamatórios. Reduzir sódio.",
        trainingNote: "Volume -20-30%. Foco em mobilidade. Sem abdominais intensos.",
      };
    case "follicular":
      return {
        volumeMultiplier: 1.0,
        rpeMax: 9,
        kcalAdjust: 0,
        nutritionNote: "Protocolo padrão. Sensibilidade à insulina elevada.",
        trainingNote: "Janela ideal para PRs e alta intensidade.",
      };
    case "ovulatory":
      return {
        volumeMultiplier: 1.0,
        rpeMax: 9,
        kcalAdjust: 0,
        nutritionNote: "Protocolo padrão.",
        trainingNote: "Pico de força. Atenção à laxidão ligamentar.",
      };
    case "luteal_early":
      return {
        volumeMultiplier: 0.9,
        rpeMax: 8,
        kcalAdjust: 0.05,
        nutritionNote: "Carboidratos +10-15%. Aumentar magnésio.",
        trainingNote: "Reduzir volume gradualmente. Manter exercícios conhecidos.",
      };
    case "luteal_late":
      return {
        volumeMultiplier: 0.7,
        rpeMax: 7,
        kcalAdjust: 0.1,
        nutritionNote: "Aumentar fibras e água. Reduzir sódio e cafeína. Suporte anti-inflamatório.",
        trainingNote: "Treino leve ou ativo recovery. Sem novidades técnicas.",
      };
    default:
      return {
        volumeMultiplier: 1.0,
        rpeMax: 9,
        kcalAdjust: 0,
        nutritionNote: "",
        trainingNote: "",
      };
  }
}

/** Body Score +5 em lútea tardia (compensar retenção fisiológica). */
export function getFeminineBodyScoreAdjustment(phase: CyclePhase | null): number {
  return phase === "luteal_late" ? 5 : 0;
}

/* ---------- Banner APEX por fase ---------- */

export function getFemininePhaseBanner(phase: CyclePhase | null) {
  if (!phase) return null;
  const info = CYCLE_PHASE_INFO[phase];
  if (phase === "luteal_late") {
    return {
      title: `${info.emoji} ${info.label} (estimada)`,
      bullets: [
        "⚠️ Retenção hídrica de até 1.5-2kg é fisiológica nessa fase",
        "⚠️ Shape pode parecer menos definido — não é regressão real",
        "⚠️ Sensibilidade mamária e abdominal aumentada",
        "💡 Melhor momento para foto de avaliação: dias 6-10 do ciclo",
      ],
      color: info.color,
      bg: info.bg,
    };
  }
  if (phase === "menstrual") {
    return {
      title: `${info.emoji} ${info.label}`,
      bullets: [
        "💡 Considerar volume e RPE reduzidos nesse período",
        "💡 Foto de avaliação ideal: dias 6-10 do ciclo",
      ],
      color: info.color,
      bg: info.bg,
    };
  }
  return {
    title: `${info.emoji} Fase ${info.label}`,
    bullets: [
      phase === "follicular" || phase === "ovulatory"
        ? "💡 Janela ideal para foto de avaliação e treinos intensos"
        : "💡 Acompanhar resposta — fase de transição.",
    ],
    color: info.color,
    bg: info.bg,
  };
}

/* ---------- Prompt feminino (APEX Visual) ---------- */

export function buildFeminineAnalysisPrompt(opts: {
  category?: FeminineCategory | null;
  cyclePhase?: CyclePhase | null;
}): string {
  const cat = opts.category ? FEMININE_CATEGORIES[opts.category] : null;
  const phase = opts.cyclePhase ? CYCLE_PHASE_INFO[opts.cyclePhase] : null;
  return `

━━━ ANÁLISE FEMININA ESPECÍFICA (OBRIGATÓRIO) ━━━

CATEGORIA FEMININA ATIVA: ${cat ? `${cat.label} — padrão: ${cat.padrao} | BF ideal de palco: ${cat.bfRange} | Foco: ${cat.foco}` : "não declarada — inferir pelo shape"}.

FASE DO CICLO MENSTRUAL: ${phase ? `${phase.label} (${phase.range}). ${opts.cyclePhase === "luteal_late" ? "Retenção fisiológica esperada — NÃO confundir com regressão de shape." : ""}` : "não informada"}.

## PROPORÇÕES FEMININAS
- Razão cintura/quadril (ideal < 0.75)
- Razão ombro/quadril (1.0-1.1 Bikini/Wellness; 1.1-1.2 Figure/Physique)
- Glúteo: projeção, arredondamento, inserção inferior vs superior
- MMII: posterior vs quadríceps — equilíbrio ou dominância
- Cintura: definição natural vs bloqueio por oblíquos hipertrofiados

## CELULITE E RETENÇÃO LOCALIZADA
- Áreas: glúteo, posterior de coxa, flancos
- Classificar: retenção hormonal vs lipodistrofia vs celulite fibrótica
- Correlacionar com protocolo farmacológico/hormonal
- Recomendar: drenagem, exercícios localizados, ajuste nutricional, suplementação

## POSTURAL FEMININO (mais prevalente)
- Hiperlordose + anteversão pélvica (glúteo inibido)
- Valgo bilateral de joelho
- Hiperpronação de pé
- Anteriorização cervical
- Escoliose funcional
Correlacionar com agachamento, hip thrust, stiff, leg press.

## SHAPE POR CATEGORIA
Para cada grupo muscular, comparar com o padrão da categoria:
- Score 0-10 de aderência
- O que está ACIMA do padrão (pode reduzir volume)
- O que está ABAIXO (priorizar)
- Exercícios específicos para atingir o shape

## LINGUAGEM
- Tom técnico E empoderador.
- NUNCA usar "excesso de gordura" — usar "reserva a reduzir".
- Faixas de BF SEMPRE femininas.
`;
}

/* ---------- Prompt feminino (TrainingON) ---------- */

export function buildFeminineTrainingPrompt(opts: {
  category?: FeminineCategory | null;
  cyclePhase?: CyclePhase | null;
}): string {
  const cat = opts.category ? FEMININE_CATEGORIES[opts.category] : null;
  const phase = opts.cyclePhase ? CYCLE_PHASE_INFO[opts.cyclePhase] : null;
  const adj = getFemininePhaseAdjustments(opts.cyclePhase ?? null);

  const priorityMap: Record<FeminineCategory, string> = {
    bikini: "60% MMII (glúteo foco) + 40% superior (evitar excesso em ombros/costas)",
    bikini_fitness: "60% MMII (glúteo foco) + 40% superior (apresentação e definição)",
    wellness: "70% MMII (glúteo + posterior foco) + 30% superior (ombros definidos, não largos)",
    figure: "50% MMII + 50% superior (dorsais e ombros desenvolvidos, cintura preservada)",
    physique: "50% MMII + 50% superior (massa visível com feminilidade)",
  };

  return `

━━━ PROTOCOLO DE TREINO FEMININO (OBRIGATÓRIO) ━━━

FASE ATUAL DO CICLO: ${phase ? `${phase.label} (${phase.range})` : "não informada"}.
AJUSTE DE VOLUME: x${adj.volumeMultiplier.toFixed(2)} | RPE máximo: ${adj.rpeMax} | Nota: ${adj.trainingNote}

REGRAS POR FASE:
- MENSTRUAL (1-5): Volume -20-30%; sem alta intensidade nos primeiros 2 dias; foco mobilidade/alongamento; sem abdominais intensos; RPE máx 6-7.
- FOLICULAR (6-13): Janela ideal para treino pesado; estrogênio alto = melhor recuperação; novos PRs; RPE 8-9.
- OVULATÓRIA (14-16): Pico de força; ATENÇÃO à laxidão ligamentar (risco de entorse); evitar exercícios de alto risco torcional se histórico de lesão; RPE 8-9.
- LÚTEA (17-28): Queda progressiva de energia; reduzir volume gradualmente; sem novidades técnicas; maior recuperação entre séries; RPE máx 7-8; dias 25-28: leve/recovery.

CATEGORIA: ${cat ? `${cat.label} → prioridade ${priorityMap[opts.category as FeminineCategory]}` : "Shape lifestyle: equilíbrio + glúteo prioritário + core funcional"}.

EXERCÍCIOS COM ATENÇÃO ESPECIAL:
- Agachamento: verificar valgo de joelho — correção obrigatória
- Hip Thrust: exercício PRINCIPAL para 100% das categorias femininas
- Stiff: técnica de hip hinge obrigatória — posterior + glúteo
- Leg Press: pés altos para ênfase em glúteo/posterior
- NUNCA priorizar quadríceps sem equilibrar com posterior
- Abdominais: EVITAR exercícios que aumentem circunferência de cintura (crunches pesados, oblíquos com carga)
`;
}

/* ---------- Prompt feminino (NutriPlan) ---------- */

export function buildFeminineNutritionPrompt(opts: {
  cyclePhase?: CyclePhase | null;
}): string {
  const phase = opts.cyclePhase ? CYCLE_PHASE_INFO[opts.cyclePhase] : null;
  const adj = getFemininePhaseAdjustments(opts.cyclePhase ?? null);
  return `

━━━ AJUSTES NUTRICIONAIS FEMININOS (OBRIGATÓRIO) ━━━

FASE ATUAL: ${phase ? `${phase.label} (${phase.range})` : "não informada"}.
NOTA DE FASE: ${adj.nutritionNote || "—"}
AJUSTE CALÓRICO POR FASE: ${adj.kcalAdjust > 0 ? `+${Math.round(adj.kcalAdjust * 100)}% kcal (carboidratos complexos)` : "padrão"}.

TDEE FEMININO:
- Fator de atividade feminino (TMB ~5-10% menor que masculino)
- Déficit MÁXIMO: 500kcal/dia (risco de amenorreia e RED-S)
- MÍNIMO calórico: 1400kcal para mulheres ativas, qualquer objetivo

MICRONUTRIENTES PRIORITÁRIOS:
- Ferro: 18mg/dia (vs 8mg homens); reforçar na fase menstrual
- Cálcio: 1000mg/dia
- Folato: fundamental em idade fértil
- Magnésio: 320mg/dia (reduz TPM, cólicas, retenção)
- Ômega-3: anti-inflamatório, reduz dismenorreia
- Vitamina D + K2: saúde óssea/hormonal

AJUSTES POR FASE:
- Menstrual: +Fe, +Mg, anti-inflamatórios (cúrcuma, gengibre); reduzir sódio
- Folicular/Ovulatória: padrão; aproveitar sensibilidade à insulina elevada
- Lútea: carbs complexos +10-15% (reduz compulsão); +Mg; reduzir cafeína
- Lútea tardia: +fibras +água; -sódio; suporte anti-inflamatório

PROTEÍNA FEMININA:
- Mínimo 1.8g/kg em déficit (proteção de massa magra)
- Máximo recomendado: 2.5g/kg

LINGUAGEM: tom empoderador. Nunca "excesso de gordura" → "reserva a reduzir".
`;
}
