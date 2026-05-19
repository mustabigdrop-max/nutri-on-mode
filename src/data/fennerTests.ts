// APEX Visual — Bateria Clínica do Método Fenner
// Testes de flexibilidade, força MRC e análise dinâmica

export type SideValue = { D?: number | string; E?: number | string };

export interface FlexTestDef {
  id: string;
  name: string;
  muscle: string;
  unit: "°" | "cm" | "bool";
  bilateral: boolean;
  normal: string;
  thresholds?: { reduced: number; severe: number; higherIsBetter: boolean };
  instruction: string;
}

export const FLEX_TESTS: FlexTestDef[] = [
  { id: "thomas", name: "Thomas modificado", muscle: "Iliopsoas + reto femoral", unit: "°", bilateral: true,
    normal: "Coxa no plano horizontal (0°)", thresholds: { reduced: -5, severe: -10, higherIsBetter: true },
    instruction: "Atleta em supino na borda da maca, puxar um joelho ao peito. O membro livre deve permanecer no plano horizontal." },
  { id: "ober", name: "Ober test", muscle: "TFL / banda iliotibial", unit: "bool", bilateral: true,
    normal: "Negativo (adução livre)",
    instruction: "Decúbito lateral, quadril neutro, abduzir e estender o membro superior, soltar. Positivo: membro não cai por adução." },
  { id: "slr", name: "SLR — Elevação da perna reta", muscle: "Isquiotibiais", unit: "°", bilateral: true,
    normal: "≥ 80°", thresholds: { reduced: 79, severe: 59, higherIsBetter: true },
    instruction: "Supino, elevar perna com joelho estendido. Medir antes da compensação pélvica." },
  { id: "ninety", name: "90-90 isquiotibial proximal", muscle: "Isquiotibiais proximais", unit: "°", bilateral: true,
    normal: "Déficit < 20°", thresholds: { reduced: 20, severe: 30, higherIsBetter: false },
    instruction: "Supino, quadril a 90°, estender o joelho ativamente. Medir ângulo do déficit." },
  { id: "knee_wall", name: "Dorsiflexão knee-to-wall", muscle: "Gastrocnêmio + sóleo", unit: "cm", bilateral: true,
    normal: "≥ 10 cm", thresholds: { reduced: 9, severe: 4, higherIsBetter: true },
    instruction: "Em pé, pé paralelo à parede, avançar joelho sobre o 5° dedo sem elevar calcanhar." },
  { id: "apley_sup", name: "Apley scratch superior", muscle: "Rotadores externos do ombro", unit: "cm", bilateral: true,
    normal: "Diferença < 5 cm entre lados",
    instruction: "Mão por cima do ombro tentando tocar a escápula contralateral." },
  { id: "apley_inf", name: "Apley scratch inferior", muscle: "Rotadores internos do ombro", unit: "cm", bilateral: true,
    normal: "Diferença < 5 cm entre lados",
    instruction: "Mão por baixo tentando tocar a escápula contralateral pelas costas." },
  { id: "cerv_rot", name: "Rotação cervical", muscle: "ECOM + escalenos + suboccipitais", unit: "°", bilateral: true,
    normal: "≥ 70° cada lado", thresholds: { reduced: 69, severe: 49, higherIsBetter: true },
    instruction: "Sentar ereto, rotar a cabeça ao máximo sem compensar com o tronco." },
  { id: "cerv_lat", name: "Inclinação cervical lateral", muscle: "Trapézio superior + escalenos", unit: "°", bilateral: true,
    normal: "≥ 45° cada lado", thresholds: { reduced: 44, severe: 29, higherIsBetter: true },
    instruction: "Inclinar a cabeça lateralmente sem elevar o ombro ipsilateral." },
  { id: "phelps", name: "Phelps test (adutores)", muscle: "Grácil + adutores curtos", unit: "°", bilateral: true,
    normal: "Abdução > 45° com joelho fletido", thresholds: { reduced: 45, severe: 29, higherIsBetter: true },
    instruction: "Decúbito ventral, joelho a 90°, abduzir o quadril. Se abdução aumenta com joelho fletido = grácil encurtado." },
  { id: "finger_floor", name: "Finger-floor", muscle: "Cadeia posterior global", unit: "cm", bilateral: false,
    normal: "0 cm (dedos no chão)", thresholds: { reduced: 0.1, severe: 10, higherIsBetter: false },
    instruction: "Em pé, joelhos estendidos, flexão do tronco. Medir distância dos dedos ao chão." },
  { id: "schober", name: "Schober modificado", muscle: "Mobilidade lombar", unit: "cm", bilateral: false,
    normal: "Δ ≥ 5 cm", thresholds: { reduced: 4.9, severe: 2.9, higherIsBetter: true },
    instruction: "Marcar L5 e ponto 10 cm acima. Medir a diferença em flexão máxima." },
];

export interface MrcMuscleDef {
  id: string;
  name: string;
  bilateral: boolean;
}

export const MRC_MUSCLES: MrcMuscleDef[] = [
  { id: "gluteo_max", name: "Glúteo máximo", bilateral: true },
  { id: "gluteo_med", name: "Glúteo médio", bilateral: true },
  { id: "serratil", name: "Serrátil anterior", bilateral: true },
  { id: "trap_inf", name: "Trapézio inferior", bilateral: true },
  { id: "flex_cerv_prof", name: "Flexores cervicais profundos", bilateral: false },
  { id: "tibial_post", name: "Tibial posterior", bilateral: true },
  { id: "vmo", name: "VMO (vasto medial oblíquo)", bilateral: true },
  { id: "multifido", name: "Multífido (extensão segmentar)", bilateral: false },
];

export type MrcScore = 0 | 1 | 2 | 3 | 4 | 4.5 | 5;

export const MRC_OPTIONS: { value: MrcScore; label: string }[] = [
  { value: 0, label: "0 — Sem contração" },
  { value: 1, label: "1 — Contração visível sem movimento" },
  { value: 2, label: "2 — Movimento sem gravidade" },
  { value: 3, label: "3 — Movimento contra gravidade" },
  { value: 4, label: "4 — Resistência moderada" },
  { value: 4.5, label: "4+ — Resistência moderada-forte" },
  { value: 5, label: "5 — Normal" },
];

export interface DynamicTestDef {
  id: string;
  name: string;
  failures: { id: string; label: string }[];
}

export const DYNAMIC_TESTS: DynamicTestDef[] = [
  { id: "ohs", name: "Overhead Squat Test (OHS)", failures: [
    { id: "valgo_bi", label: "Valgo de joelho bilateral" },
    { id: "valgo_d", label: "Valgo unilateral D" },
    { id: "valgo_e", label: "Valgo unilateral E" },
    { id: "calcanhar", label: "Elevação de calcanhar" },
    { id: "tronco_ant", label: "Anteriorização do tronco" },
    { id: "cabeca_ant", label: "Anteriorização da cabeça" },
    { id: "rot_int_ombro", label: "Rotação interna de ombro" },
    { id: "hiperext_lombar", label: "Hiperextensão lombar" },
  ]},
  { id: "sls", name: "Single Leg Squat (SLS)", failures: [
    { id: "valgo_ipsi", label: "Valgo do joelho ipsilateral" },
    { id: "trendelenburg", label: "Queda da pelve contralateral (Trendelenburg)" },
    { id: "rot_tronco", label: "Rotação do tronco" },
    { id: "incl_lat", label: "Inclinação lateral excessiva" },
  ]},
  { id: "pushup", name: "Push-up test", failures: [
    { id: "alada", label: "Escápula alada" },
    { id: "cabeca_ant", label: "Anteriorização da cabeça" },
    { id: "hiperext_lombar", label: "Hiperextensão lombar" },
    { id: "colapso_ombro", label: "Colapso de ombros" },
  ]},
  { id: "ohp", name: "Overhead press dinâmico", failures: [
    { id: "hiperext_final", label: "Hiperextensão lombar na fase final" },
    { id: "cabeca_ant", label: "Anteriorização da cabeça" },
    { id: "trap_sup", label: "Elevação do trapézio superior" },
    { id: "rot_int", label: "Rotação interna de ombros" },
  ]},
  { id: "rdl", name: "Deadlift / RDL dinâmico", failures: [
    { id: "flex_lombar", label: "Flexão lombar (perda de neutro)" },
    { id: "valgo_descida", label: "Joelhos em valgo na descida" },
    { id: "tronco_ant", label: "Anteriorização do tronco excessiva" },
    { id: "hiperext_cerv", label: "Hiperextensão cervical" },
  ]},
  { id: "lunge", name: "Walking lunge", failures: [
    { id: "valgo_ant", label: "Valgo do joelho anterior" },
    { id: "incl_lat", label: "Inclinação lateral do tronco" },
    { id: "tronco_ant", label: "Anteriorização do tronco" },
    { id: "instab_tornozelo", label: "Instabilidade do tornozelo" },
  ]},
  { id: "stepdown", name: "Step down excêntrico unilateral", failures: [
    { id: "valgo_carga", label: "Valgo do joelho em carga" },
    { id: "queda_pelve", label: "Queda pélvica contralateral" },
    { id: "comp_tronco", label: "Compensação do tronco ipsilateral" },
  ]},
];

// ───── Estado consolidado ─────
export interface ClinicalTestsState {
  athleteHeightCm?: number | null;
  flex: Record<string, SideValue & { single?: number | string }>;
  mrc: Record<string, { D?: MrcScore; E?: MrcScore; single?: MrcScore }>;
  dynamic: Record<string, { failed: Record<string, boolean>; note?: string }>;
}

export const EMPTY_CLINICAL: ClinicalTestsState = {
  athleteHeightCm: null,
  flex: {},
  mrc: {},
  dynamic: {},
};

// ───── Classificação ─────
export type FlexSeverity = "normal" | "reduced" | "severe" | "na";

export function classifyFlex(def: FlexTestDef, val: number | string | undefined): FlexSeverity {
  if (def.unit === "bool") {
    if (val === undefined || val === "" || val === null) return "na";
    return val === "positivo" ? "severe" : "normal";
  }
  const n = typeof val === "number" ? val : parseFloat(String(val ?? ""));
  if (!Number.isFinite(n)) return "na";
  const t = def.thresholds;
  if (!t) return "normal";
  if (t.higherIsBetter) {
    if (n <= t.severe) return "severe";
    if (n <= t.reduced) return "reduced";
    return "normal";
  } else {
    if (n >= t.severe) return "severe";
    if (n >= t.reduced) return "reduced";
    return "normal";
  }
}

export function mrcSeverity(score?: MrcScore | null): "ok" | "weak" | "inhibited" | "na" {
  if (score === undefined || score === null) return "na";
  if (score <= 3) return "inhibited";
  if (score === 4) return "weak";
  return "ok";
}

// Score de Fenner (0-100)
export function computeFennerScore(state: ClinicalTestsState) {
  // Flex (40 pts)
  let flexSum = 0;
  let flexCount = 0;
  for (const def of FLEX_TESTS) {
    const v = state.flex[def.id];
    if (!v) continue;
    const vals: (number | string | undefined)[] = def.bilateral
      ? [v.D, v.E]
      : [v.single];
    for (const x of vals) {
      const sev = classifyFlex(def, x);
      if (sev === "na") continue;
      flexCount++;
      flexSum += sev === "normal" ? 100 : sev === "reduced" ? 60 : 20;
    }
  }
  const flexPct = flexCount ? flexSum / flexCount : 0;

  // Força (40 pts)
  let mrcSum = 0;
  let mrcCount = 0;
  for (const m of MRC_MUSCLES) {
    const v = state.mrc[m.id];
    if (!v) continue;
    const scores: (MrcScore | undefined)[] = m.bilateral ? [v.D, v.E] : [v.single];
    for (const s of scores) {
      if (s === undefined || s === null) continue;
      mrcCount++;
      mrcSum += (Number(s) / 5) * 100;
    }
  }
  const mrcPct = mrcCount ? mrcSum / mrcCount : 0;

  // Dinâmica (20 pts) — % testes sem falhas
  let dynPass = 0;
  let dynTotal = 0;
  for (const d of DYNAMIC_TESTS) {
    const v = state.dynamic[d.id];
    if (!v) continue;
    dynTotal++;
    const anyFail = Object.values(v.failed || {}).some(Boolean);
    if (!anyFail) dynPass++;
  }
  const dynPct = dynTotal ? (dynPass / dynTotal) * 100 : 0;

  const total = Math.round(flexPct * 0.4 + mrcPct * 0.4 + dynPct * 0.2);
  const tier =
    total <= 40 ? "CRÍTICO" :
    total <= 65 ? "ATENÇÃO" :
    total <= 80 ? "ADEQUADO" : "ÓTIMO";
  const color =
    total <= 40 ? "#EF4444" :
    total <= 65 ? "#F59E0B" :
    total <= 80 ? "#84CC16" : "#10B981";

  return {
    total,
    tier,
    color,
    components: {
      flexibility: Math.round(flexPct),
      strength: Math.round(mrcPct),
      dynamic: Math.round(dynPct),
    },
    counts: { flexCount, mrcCount, dynTotal },
  };
}

// Top déficits (até 3)
export function topDeficits(state: ClinicalTestsState): string[] {
  const out: { label: string; severity: number }[] = [];
  for (const def of FLEX_TESTS) {
    const v = state.flex[def.id];
    if (!v) continue;
    const vals = def.bilateral ? [{ s: "D", x: v.D }, { s: "E", x: v.E }] : [{ s: "", x: v.single }];
    for (const { s, x } of vals) {
      const sev = classifyFlex(def, x);
      if (sev === "severe") out.push({ label: `${def.name}${s ? " " + s : ""}`, severity: 3 });
      else if (sev === "reduced") out.push({ label: `${def.name}${s ? " " + s : ""}`, severity: 2 });
    }
  }
  for (const m of MRC_MUSCLES) {
    const v = state.mrc[m.id];
    if (!v) continue;
    const scores: { s: string; x?: MrcScore }[] = m.bilateral ? [{ s: "D", x: v.D }, { s: "E", x: v.E }] : [{ s: "", x: v.single }];
    for (const { s, x } of scores) {
      const sev = mrcSeverity(x);
      if (sev === "inhibited") out.push({ label: `${m.name}${s ? " " + s : ""} (MRC ${x})`, severity: 3 });
      else if (sev === "weak") out.push({ label: `${m.name}${s ? " " + s : ""} (MRC 4)`, severity: 2 });
    }
  }
  out.sort((a, b) => b.severity - a.severity);
  return out.slice(0, 3).map((x) => x.label);
}

// Bloco de texto para enviar à IA
export function buildClinicalPromptBlock(state: ClinicalTestsState): string {
  const lines: string[] = [];
  lines.push("━━━ RESULTADOS DOS TESTES CLÍNICOS OBJETIVOS (MÉTODO FENNER) ━━━");
  if (state.athleteHeightCm) lines.push(`Altura referência: ${state.athleteHeightCm} cm`);

  // Flex
  const flexLines: string[] = [];
  for (const def of FLEX_TESTS) {
    const v = state.flex[def.id];
    if (!v) continue;
    if (def.bilateral) {
      const fmt = (s: "D" | "E") => {
        const x = v[s];
        if (x === undefined || x === "") return null;
        const sev = classifyFlex(def, x);
        return `${s}: ${x}${def.unit !== "bool" ? def.unit : ""} [${sev}]`;
      };
      const parts = [fmt("D"), fmt("E")].filter(Boolean);
      if (parts.length) flexLines.push(`- ${def.name} (${def.muscle}): ${parts.join(" · ")}`);
    } else {
      const x = v.single;
      if (x === undefined || x === "") continue;
      const sev = classifyFlex(def, x);
      flexLines.push(`- ${def.name} (${def.muscle}): ${x}${def.unit}${def.unit !== "bool" ? "" : ""} [${sev}]`);
    }
  }
  if (flexLines.length) { lines.push("", "FLEXIBILIDADE:"); lines.push(...flexLines); }

  // MRC
  const mrcLines: string[] = [];
  for (const m of MRC_MUSCLES) {
    const v = state.mrc[m.id];
    if (!v) continue;
    if (m.bilateral) {
      const fmt = (s: "D" | "E") => {
        const x = v[s];
        if (x === undefined || x === null) return null;
        return `${s}: MRC ${x} [${mrcSeverity(x)}]`;
      };
      const parts = [fmt("D"), fmt("E")].filter(Boolean);
      if (parts.length) mrcLines.push(`- ${m.name}: ${parts.join(" · ")}`);
    } else if (v.single !== undefined && v.single !== null) {
      mrcLines.push(`- ${m.name}: MRC ${v.single} [${mrcSeverity(v.single)}]`);
    }
  }
  if (mrcLines.length) { lines.push("", "FORÇA (MRC 0-5):"); lines.push(...mrcLines); }

  // Dinâmica
  const dynLines: string[] = [];
  for (const d of DYNAMIC_TESTS) {
    const v = state.dynamic[d.id];
    if (!v) continue;
    const failed = d.failures.filter((f) => v.failed?.[f.id]).map((f) => f.label);
    const status = failed.length === 0 ? "OK" : `FALHAS: ${failed.join("; ")}`;
    const note = v.note ? ` | obs: ${v.note}` : "";
    dynLines.push(`- ${d.name}: ${status}${note}`);
  }
  if (dynLines.length) { lines.push("", "DINÂMICA:"); lines.push(...dynLines); }

  if (flexLines.length === 0 && mrcLines.length === 0 && dynLines.length === 0) return "";

  lines.push("");
  lines.push(
    "Use esses dados como evidência objetiva: priorize achados clínicos sobre análise visual quando houver divergência. " +
    "Músculo com MRC ≤ 3 = inibido severo independentemente do visual. " +
    "Teste de flexibilidade reduzido confirma músculo encurtado e eleva prioridade de intervenção.",
  );

  const fs = computeFennerScore(state);
  lines.push(`Fenner Clinical Score (FCS): ${fs.total}/100 — ${fs.tier} (flex ${fs.components.flexibility} · força ${fs.components.strength} · dinâmica ${fs.components.dynamic}).`);
  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════════════════
// FENNER AI TESTS — Configuração para análise por foto + Gemini Vision
// ═══════════════════════════════════════════════════════════════════

export type AiTestGroup = "flexibility" | "strength" | "dynamic" | "static";
export type AiTestSide = "right" | "left" | "bilateral";

export interface FennerAiTest {
  id: string;
  name: string;
  group: AiTestGroup;
  side?: AiTestSide;
  instruction: string;
  photoAngle: string;
  targetMuscles: string[];
  normalValues: { metric: string; normal: string; mild: string; severe: string; unit: string }[];
  aiPrompt: string;
}

const COMMON_OVERLAY_HINT = `
Coordenadas x/y em PORCENTAGEM (0-100) da largura/altura da imagem.
Sempre preencha "landmarks", "overlay_lines" e "overlay_angles".
Se não conseguir identificar um landmark, estime anatomicamente.
Nunca retorne null nesses campos.`;

export const FENNER_AI_TESTS: FennerAiTest[] = [
  // ── FLEXIBILIDADE ──────────────────────────────────────────────
  {
    id: "thomas_right", name: "Thomas Modificado — D", group: "flexibility", side: "right",
    instruction: "Atleta sentado na borda da maca. Deitar puxando o joelho ESQUERDO ao peito. Perna DIREITA pendente livre. Foto perfil direito.",
    photoAngle: "perfil direito",
    targetMuscles: ["iliopsoas", "reto_femoral", "tfl"],
    normalValues: [
      { metric: "Ângulo da coxa", normal: "0° (horizontal)", mild: "até -10°", severe: "abaixo de -10°", unit: "°" },
      { metric: "Flexão do joelho", normal: "< 10°", mild: "10-20°", severe: "> 20°", unit: "°" },
    ],
    aiPrompt: `Analise o teste de Thomas modificado direito.
IDENTIFIQUE: EIAS D, côndilo lateral joelho D, maléolo lateral D, trocânter maior D.
CALCULE:
1. Ângulo da coxa direita vs horizontal (0°=normal, negativo=elevada/iliopsoas curto).
2. Ângulo de flexão do joelho D (>20° = reto femoral encurtado).
3. Abdução do quadril presente (= TFL encurtado).
RETORNE JSON:
{ "angulo_coxa": number, "flexao_joelho": number, "abducao_presente": boolean,
  "classificacao_iliopsoas": "normal"|"mild"|"moderate"|"severe",
  "classificacao_reto_femoral": "normal"|"mild"|"moderate"|"severe",
  "classificacao_tfl": "normal"|"mild"|"moderate"|"severe",
  "musculos_encurtados": string[], "findings": string,
  "landmarks": {"eias_d":{"x":number,"y":number}, "joelho_d":{"x":number,"y":number}, "maleolo_d":{"x":number,"y":number}, "trocantermaior_d":{"x":number,"y":number}},
  "overlay_lines": [{"from":"eias_d","to":"joelho_d","color":"#EF9F27","label":"coxa"},{"from":"joelho_d","to":"maleolo_d","color":"#4A90D9","label":"perna"}],
  "overlay_angles": [{"value":number,"x":number,"y":number,"label":"Thomas D","color":"#EF9F27"}] }
${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "thomas_left", name: "Thomas Modificado — E", group: "flexibility", side: "left",
    instruction: "Espelhado: joelho DIREITO ao peito, perna ESQUERDA pendente. Foto perfil esquerdo.",
    photoAngle: "perfil esquerdo",
    targetMuscles: ["iliopsoas", "reto_femoral", "tfl"],
    normalValues: [
      { metric: "Ângulo da coxa", normal: "0°", mild: "até -10°", severe: "< -10°", unit: "°" },
      { metric: "Flexão joelho", normal: "<10°", mild: "10-20°", severe: ">20°", unit: "°" },
    ],
    aiPrompt: `Teste de Thomas modificado ESQUERDO — mesma análise do lado direito, mas para o lado esquerdo. Retorne JSON análogo trocando _d por _e.${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "slr_right", name: "SLR — D", group: "flexibility", side: "right",
    instruction: "Decúbito dorsal. Elevar perna DIREITA com joelho estendido. Foto perfil no limite.",
    photoAngle: "perfil",
    targetMuscles: ["isquiotibiais"],
    normalValues: [{ metric: "Ângulo SLR", normal: "≥80°", mild: "60-79°", severe: "<60°", unit: "°" }],
    aiPrompt: `Analise o SLR direito. Calcule ângulo entre o solo e a linha trocânter→maléolo. Verifique compensação pélvica e flexão de joelho.
RETORNE JSON: { "angulo_slr": number, "compensacao_pelvica": boolean, "flexao_joelho_compensacao": boolean,
  "angulo_real_corrigido": number, "classificacao": "normal"|"mild"|"moderate"|"severe",
  "findings": string, "landmarks": {"trocantermaior_d":{"x":number,"y":number},"joelho_d":{"x":number,"y":number},"maleolo_d":{"x":number,"y":number}},
  "overlay_lines": [{"from":"trocantermaior_d","to":"maleolo_d","color":"#4A90D9","label":"perna"}],
  "overlay_angles": [{"value":number,"x":number,"y":number,"label":"SLR D","color":"#4A90D9"}] }
${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "slr_left", name: "SLR — E", group: "flexibility", side: "left",
    instruction: "Espelhado para a perna esquerda.", photoAngle: "perfil",
    targetMuscles: ["isquiotibiais"],
    normalValues: [{ metric: "Ângulo SLR", normal: "≥80°", mild: "60-79°", severe: "<60°", unit: "°" }],
    aiPrompt: `SLR esquerdo — análoga ao direito.${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "ober_right", name: "Ober — D", group: "flexibility", side: "right",
    instruction: "Decúbito lateral esquerdo. Joelho D a 90°. Abduzir e estender, depois SOLTAR. Foto posterior.",
    photoAngle: "posterior",
    targetMuscles: ["tfl", "it_band"],
    normalValues: [{ metric: "Ober", normal: "Negativo (cai em adução)", mild: "Horizontal", severe: "Permanece abduzida", unit: "—" }],
    aiPrompt: `Analise Ober direito. Avalie posição da coxa após soltar vs plano horizontal.
RETORNE JSON: { "resultado":"positivo"|"negativo"|"limitrofe", "angulo_coxa_horizontal":number,
  "tfl_encurtado":boolean, "severity":"normal"|"mild"|"moderate"|"severe", "findings":string,
  "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "ober_left", name: "Ober — E", group: "flexibility", side: "left",
    instruction: "Espelhado, decúbito lateral direito.", photoAngle: "posterior",
    targetMuscles: ["tfl", "it_band"],
    normalValues: [{ metric: "Ober", normal: "Negativo", mild: "Horizontal", severe: "Abduzida", unit: "—" }],
    aiPrompt: `Ober esquerdo — análoga.${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "dorsiflexion_right", name: "Dorsiflexão — D", group: "flexibility", side: "right",
    instruction: "Em pé de frente para parede. Pé D ~10cm. Avançar joelho sem elevar calcanhar.",
    photoAngle: "perfil direito",
    targetMuscles: ["gastrocnemio", "soleo"],
    normalValues: [{ metric: "Distância joelho-parede", normal: "≥10cm", mild: "5-9cm", severe: "<5cm", unit: "cm" }],
    aiPrompt: `Dorsiflexão knee-to-wall D. Use o comprimento do pé visível (~26-28cm) como escala.
Calcule distância horizontal joelho→parede em cm. Verifique calcanhar elevado e colapso do arco.
RETORNE JSON: { "distancia_joelho_parede_cm":number, "calcanhar_elevado":boolean, "arco_plantar_colapso":boolean,
  "teste_valido":boolean, "classificacao":"normal"|"mild"|"moderate"|"severe", "findings":string,
  "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "dorsiflexion_left", name: "Dorsiflexão — E", group: "flexibility", side: "left",
    instruction: "Espelhado.", photoAngle: "perfil esquerdo",
    targetMuscles: ["gastrocnemio", "soleo"],
    normalValues: [{ metric: "Distância joelho-parede", normal: "≥10cm", mild: "5-9cm", severe: "<5cm", unit: "cm" }],
    aiPrompt: `Dorsiflexão esquerda — análoga.${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "apley_sup", name: "Apley Superior", group: "flexibility", side: "bilateral",
    instruction: "Mão por cima do ombro tentando tocar a escápula contralateral. Foto posterior.",
    photoAngle: "posterior",
    targetMuscles: ["rotadores_externos_ombro"],
    normalValues: [{ metric: "Diferença lados", normal: "<5cm", mild: "5-10cm", severe: ">10cm", unit: "cm" }],
    aiPrompt: `Apley superior. Meça a distância vertical entre as pontas dos dedos das duas mãos nas costas. Use largura do ombro como escala (~40cm adulto).
RETORNE JSON: { "distancia_cm":number, "lado_limitado":"D"|"E"|"nenhum", "classificacao":"normal"|"mild"|"moderate"|"severe",
  "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "cervical_rom", name: "Cervical ROM", group: "flexibility", side: "bilateral",
    instruction: "Sentado ereto. Rotacionar a cabeça ao máximo para cada lado. Foto aérea ou frontal.",
    photoAngle: "superior/frontal",
    targetMuscles: ["ecom", "escalenos", "suboccipitais"],
    normalValues: [
      { metric: "Rotação", normal: "≥70°", mild: "50-69°", severe: "<50°", unit: "°" },
      { metric: "Inclinação", normal: "≥45°", mild: "30-44°", severe: "<30°", unit: "°" },
    ],
    aiPrompt: `Cervical ROM. Calcule ângulo entre linha dos ombros e linha nariz-occipital.
RETORNE JSON: { "angulo_rotacao_direita":number, "angulo_rotacao_esquerda":number,
  "compensacao_trapezio":boolean, "compensacao_cervical":boolean,
  "classificacao_direita":"normal"|"mild"|"moderate"|"severe",
  "classificacao_esquerda":"normal"|"mild"|"moderate"|"severe",
  "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "finger_floor", name: "Finger-Floor", group: "flexibility", side: "bilateral",
    instruction: "Em pé, joelhos estendidos. Flexão máxima do tronco. Foto perfil.",
    photoAngle: "perfil",
    targetMuscles: ["cadeia_posterior", "isquiotibiais", "eretores"],
    normalValues: [{ metric: "Distância dedos-chão", normal: "0cm", mild: "1-10cm", severe: ">10cm", unit: "cm" }],
    aiPrompt: `Finger-floor. Escala: comprimento da mão ~18-20cm. Identifique padrão de curvatura.
RETORNE JSON: { "distancia_dedos_chao_cm":number, "joelhos_estendidos":boolean,
  "padrao_coluna":"harmonico"|"retificacao_lombar"|"cifose_compensatoria",
  "classificacao":"normal"|"mild"|"moderate"|"severe",
  "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "phelps", name: "Phelps (adutores)", group: "flexibility", side: "bilateral",
    instruction: "Decúbito ventral, joelho a 90°, abduzir o quadril. Foto posterior.",
    photoAngle: "posterior",
    targetMuscles: ["gracil", "adutores"],
    normalValues: [{ metric: "Abdução", normal: ">45°", mild: "30-44°", severe: "<30°", unit: "°" }],
    aiPrompt: `Phelps. Meça abdução do quadril com joelho fletido.
RETORNE JSON: { "abducao_graus":number, "gracil_encurtado":boolean, "lado":"D"|"E",
  "classificacao":"normal"|"mild"|"moderate"|"severe",
  "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },

  // ── FORÇA ───────────────────────────────────────────────────────
  {
    id: "gluteo_max_bridge_right", name: "Ponte Glútea — D", group: "strength", side: "right",
    instruction: "Decúbito dorsal, ponte unilateral apoiada na perna D, perna E elevada. Foto perfil no ponto alto.",
    photoAngle: "perfil",
    targetMuscles: ["gluteo_maximo"],
    normalValues: [{ metric: "Extensão de quadril", normal: "Linha tronco-coxa ≈0°", mild: "Queda <5°", severe: "Queda severa / lombar arqueada", unit: "—" }],
    aiPrompt: `Ponte glútea unilateral D. Avalie extensão completa do quadril, obliquidade pélvica e hiperextensão lombar.
RETORNE JSON: { "angulo_extensao_quadril":number, "obliquidade_pelvica_graus":number,
  "hiperextensao_lombar":boolean, "score_mrc":number,
  "classificacao":"normal"|"fraqueza_relativa"|"inibido",
  "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "trendelenburg_right", name: "Trendelenburg — D", group: "strength", side: "right",
    instruction: "Em pé apenas no pé D, perna E levemente elevada. Manter 5s. Foto frontal.",
    photoAngle: "frontal",
    targetMuscles: ["gluteo_medio"],
    normalValues: [{ metric: "Obliquidade pélvica", normal: "<2°", mild: "2-5°", severe: ">5°", unit: "°" }],
    aiPrompt: `Trendelenburg ativo D (suporte direito). Meça obliquidade pélvica EIAS D vs EIAS E.
RETORNE JSON: { "trendelenburg_positivo":boolean, "angulo_obliquidade":number,
  "compensacao_duchenne":boolean, "score_mrc_gluteo_medio":number,
  "classificacao":"normal"|"fraqueza_relativa"|"inibido",
  "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "serratil_wall_push", name: "Serrátil (Wall Push-up Plus)", group: "strength", side: "bilateral",
    instruction: "De frente para a parede, push-up + protração escapular máxima. Foto posterior.",
    photoAngle: "posterior",
    targetMuscles: ["serratil_anterior", "trapezio_inferior"],
    normalValues: [{ metric: "Alamento", normal: "Sem afastamento", mild: "Leve borda inferior", severe: "Alamento medial claro", unit: "—" }],
    aiPrompt: `Wall push-up plus. Avalie escápula alada bilateralmente.
RETORNE JSON: { "escapula_alada_d":boolean, "escapula_alada_e":boolean,
  "grau_alamento_d":"nenhum"|"leve"|"moderado"|"severo",
  "grau_alamento_e":"nenhum"|"leve"|"moderado"|"severo",
  "score_mrc_serratil_d":number, "score_mrc_serratil_e":number,
  "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "vmo_terminal", name: "VMO Terminal", group: "strength", side: "bilateral",
    instruction: "Sentado, extensão terminal do joelho com peso leve. Foto perfil.",
    photoAngle: "perfil",
    targetMuscles: ["vasto_medial_obliquo"],
    normalValues: [{ metric: "Extensão terminal", normal: "Completa", mild: "Lag <5°", severe: "Lag >5°", unit: "°" }],
    aiPrompt: `VMO terminal. Meça extension lag (déficit dos últimos graus de extensão).
RETORNE JSON: { "lag_graus":number, "classificacao":"normal"|"fraqueza_relativa"|"inibido",
  "score_mrc":number, "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },

  // ── DINÂMICOS ───────────────────────────────────────────────────
  {
    id: "overhead_squat", name: "Overhead Squat", group: "dynamic", side: "bilateral",
    instruction: "Pés largura do ombro, braços estendidos acima. Agachamento profundo. Foto frontal no ponto mais fundo.",
    photoAngle: "frontal (ou perfil em sessão complementar)",
    targetMuscles: ["gluteo_medio", "tfl", "gastrocnemio", "flexores_quadril"],
    normalValues: [
      { metric: "Valgo do joelho", normal: "Joelho sobre 2° dedo", mild: "<10°", severe: ">15°", unit: "°" },
      { metric: "Anteriorização tronco", normal: "<30°", mild: "30-45°", severe: ">45°", unit: "°" },
    ],
    aiPrompt: `Overhead Squat (vista frontal). Avalie valgo bilateral, elevação de calcanhar, rotação externa de pés, anteriorização do tronco (se visível), queda dos braços, hiperextensão lombar.
RETORNE JSON: { "valgo_joelho_d_graus":number, "valgo_joelho_e_graus":number,
  "calcanhar_elevado":boolean, "rotacao_externa_pes":boolean,
  "angulo_tronco":number, "queda_bracos":boolean, "hiperextensao_lombar":boolean,
  "falhas_detectadas":[{"falha":string,"musculo_implicado":string,"status":"dominant"|"inhibited","disfuncao":string,"severity":string}],
  "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "single_leg_squat_right", name: "SL Squat — D", group: "dynamic", side: "right",
    instruction: "Em pé no pé D. Agachamento unilateral ~60°. Foto frontal.",
    photoAngle: "frontal",
    targetMuscles: ["gluteo_medio", "gluteo_max", "core"],
    normalValues: [{ metric: "Valgo", normal: "<5°", mild: "5-10°", severe: ">10°", unit: "°" }],
    aiPrompt: `Single Leg Squat D. Avalie valgo, Trendelenburg, compensação de Duchenne, rotação do tronco.
RETORNE JSON: { "valgo_joelho_graus":number, "obliquidade_pelvica_graus":number,
  "trendelenburg_positivo":boolean, "compensacao_duchenne":boolean, "rotacao_tronco":boolean,
  "falhas_detectadas":[...], "score_gluteo_medio_d":number,
  "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "single_leg_squat_left", name: "SL Squat — E", group: "dynamic", side: "left",
    instruction: "Em pé no pé E, espelhado.", photoAngle: "frontal",
    targetMuscles: ["gluteo_medio", "gluteo_max", "core"],
    normalValues: [{ metric: "Valgo", normal: "<5°", mild: "5-10°", severe: ">10°", unit: "°" }],
    aiPrompt: `Single Leg Squat E — análoga.${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "push_up", name: "Push-up", group: "dynamic", side: "bilateral",
    instruction: "Prancha alta → flexão → topo. Foto perfil no ponto mais baixo.",
    photoAngle: "perfil",
    targetMuscles: ["peitorais", "deltoide", "core", "serratil"],
    normalValues: [{ metric: "Alinhamento corporal", normal: "Reta cabeça-calcanhar", mild: "Quadril leve queda", severe: "Lombar arqueada / quadril alto", unit: "—" }],
    aiPrompt: `Push-up. Avalie alinhamento, alamento escapular, posição cervical.
RETORNE JSON: { "queda_quadril":boolean, "hiperextensao_lombar":boolean,
  "escapula_alada":boolean, "posicao_cervical":"neutra"|"hiperextensao"|"flexao",
  "falhas_detectadas":[...], "findings":string,
  "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "rdl_unilateral_right", name: "RDL Unilateral — D", group: "dynamic", side: "right",
    instruction: "Em pé no pé D. RDL unilateral até paralelo. Foto perfil.",
    photoAngle: "perfil",
    targetMuscles: ["isquiotibiais", "gluteo_max", "core"],
    normalValues: [{ metric: "Pelve quadrada", normal: "Sem rotação", mild: "Leve rotação", severe: "Rotação evidente", unit: "—" }],
    aiPrompt: `RDL unilateral D. Avalie hip hinge, rotação pélvica, posição lombar.
RETORNE JSON: { "rotacao_pelvica":boolean, "lombar_neutra":boolean, "hip_hinge_correto":boolean,
  "falhas_detectadas":[...], "findings":string,
  "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "lunge", name: "Lunge", group: "dynamic", side: "bilateral",
    instruction: "Afundo frontal até 90°/90°. Foto frontal.",
    photoAngle: "frontal",
    targetMuscles: ["quadriceps", "gluteo", "adutores"],
    normalValues: [{ metric: "Valgo joelho frente", normal: "Sobre 2° dedo", mild: "Leve medial", severe: "Colapso medial", unit: "°" }],
    aiPrompt: `Lunge. Avalie valgo do joelho da frente, queda pélvica, alinhamento tronco.
RETORNE JSON: { "valgo_joelho_frente":number, "queda_pelvica":boolean, "tronco_alinhado":boolean,
  "falhas_detectadas":[...], "findings":string,
  "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "step_down_eccentric", name: "Step Down Excêntrico", group: "dynamic", side: "bilateral",
    instruction: "Em pé no degrau, descer lentamente até o calcanhar tocar o chão. Foto frontal.",
    photoAngle: "frontal",
    targetMuscles: ["vmo", "gluteo_medio", "core"],
    normalValues: [{ metric: "Valgo", normal: "<5°", mild: "5-10°", severe: ">10°", unit: "°" }],
    aiPrompt: `Step Down excêntrico. Avalie controle excêntrico, valgo, queda pélvica.
RETORNE JSON: { "valgo_joelho":number, "queda_pelvica":boolean, "controle_excentrico":"bom"|"regular"|"ruim",
  "falhas_detectadas":[...], "findings":string,
  "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },

  // ── POSTURA ESTÁTICA ────────────────────────────────────────────
  {
    id: "static_anterior", name: "Postura — Vista Anterior", group: "static", side: "bilateral",
    instruction: "Em pé, postura natural, pés largura do quadril. Foto frontal.",
    photoAngle: "frontal",
    targetMuscles: ["alinhamento_global"],
    normalValues: [{ metric: "Simetria global", normal: "Simétrica", mild: "Assimetria leve", severe: "Assimetria evidente", unit: "—" }],
    aiPrompt: `Postura vista anterior. Avalie altura dos ombros, EIAS, joelhos, tornozelos, inclinação cefálica.
RETORNE JSON: { "ombros_alinhados":boolean, "diferenca_ombros_graus":number,
  "obliquidade_pelvica":number, "joelhos_alinhados":boolean,
  "inclinacao_cefalica":number, "achados":[string],
  "findings":string, "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "static_lateral_right", name: "Postura — Lateral D", group: "static", side: "right",
    instruction: "Em pé, perfil direito. Linha de prumo: maléolo→trocanter→ombro→trago.",
    photoAngle: "perfil direito",
    targetMuscles: ["alinhamento_sagital"],
    normalValues: [{ metric: "Linha de prumo", normal: "Alinhada", mild: "Desvio leve", severe: "Desvio severo", unit: "—" }],
    aiPrompt: `Postura perfil D. Avalie alinhamento maléolo-trocanter-ombro-trago, cabeça anteriorizada, cifose, lordose, pelve.
RETORNE JSON: { "cabeca_anteriorizada_cm":number, "ombros_anteriorizados":boolean,
  "cifose_torac_aumentada":boolean, "lordose_lombar":"normal"|"hiperlordose"|"retificacao",
  "anteversao_pelvica":boolean, "achados":[string], "findings":string,
  "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "static_lateral_left", name: "Postura — Lateral E", group: "static", side: "left",
    instruction: "Perfil esquerdo.", photoAngle: "perfil esquerdo",
    targetMuscles: ["alinhamento_sagital"],
    normalValues: [{ metric: "Linha de prumo", normal: "Alinhada", mild: "Desvio leve", severe: "Desvio severo", unit: "—" }],
    aiPrompt: `Postura perfil E — análoga.${COMMON_OVERLAY_HINT}`,
  },
  {
    id: "static_posterior", name: "Postura — Posterior", group: "static", side: "bilateral",
    instruction: "Em pé de costas, postura natural. Foto posterior.",
    photoAngle: "posterior",
    targetMuscles: ["alinhamento_global"],
    normalValues: [{ metric: "Coluna alinhada", normal: "Reta", mild: "Curva leve", severe: "Escoliose evidente", unit: "—" }],
    aiPrompt: `Postura posterior. Avalie altura de ombros, escápulas, EIPS, simetria de tríceps sural, valgo/varo calcâneo, sinais de escoliose.
RETORNE JSON: { "escoliose_suspeita":boolean, "lado_curva":"D"|"E"|"nenhum",
  "diferenca_altura_ombros":number, "escapulas_simetricas":boolean,
  "valgo_calcaneo":boolean, "achados":[string], "findings":string,
  "landmarks":{...}, "overlay_lines":[...], "overlay_angles":[...] }${COMMON_OVERLAY_HINT}`,
  },
];

export const FENNER_AI_GROUPS: { id: AiTestGroup; label: string; color: string; icon: string }[] = [
  { id: "flexibility", label: "FLEXIBILIDADE", color: "#4A90D9", icon: "🦵" },
  { id: "strength",    label: "FORÇA",         color: "#00C896", icon: "💪" },
  { id: "dynamic",     label: "DINÂMICO",      color: "#B8922A", icon: "⚡" },
  { id: "static",      label: "POSTURA ESTÁTICA", color: "#C56CE0", icon: "📐" },
];

export const SEVERITY_BADGE_AI: Record<string, { bg: string; fg: string; label: string }> = {
  normal:   { bg: "#1D9E7518", fg: "#10B981", label: "NORMAL" },
  mild:     { bg: "#EF9F2718", fg: "#F59E0B", label: "LEVE" },
  moderate: { bg: "#E24B4A18", fg: "#EF4444", label: "MODERADO" },
  severe:   { bg: "#A32D2D30", fg: "#FCA5A5", label: "SEVERO" },
  fraqueza_relativa: { bg: "#EF9F2718", fg: "#F59E0B", label: "FRAQUEZA" },
  inibido:  { bg: "#A32D2D30", fg: "#FCA5A5", label: "INIBIDO" },
};
