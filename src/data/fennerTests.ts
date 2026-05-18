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
    return val === "positivo" || val === true ? "severe" : "normal";
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
