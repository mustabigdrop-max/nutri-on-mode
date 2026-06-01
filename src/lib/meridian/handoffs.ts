// MERIDIAN — Cross-module handoff logic.
// Pure functions that translate MERIDIAN plan+phase into per-module recommendations.

import type { MeridianPlan, MeridianCompetition, MeridianPhase } from "./types";
import { getCurrentPhase } from "./calculator";

export type HandoffModule = "nutriplan" | "trainingon" | "dr_vertex" | "mce" | "apex";

export interface ModuleHandoffPayload {
  module: HandoffModule;
  module_label: string;
  headline: string;
  bullets: string[];
  metrics: Record<string, string | number>;
}

const MODULE_LABELS: Record<HandoffModule, string> = {
  nutriplan: "NutriPlan",
  trainingon: "TrainingON",
  dr_vertex: "Dr. VERTEX",
  mce: "MCE",
  apex: "APEX",
};

// Macro multipliers by phase (relative to maintenance).
const PHASE_KCAL_FACTOR: Record<MeridianPhase, number> = {
  OFF_SEASON: 1.10,
  PRE_PREP: 1.00,
  DIET_PRINCIPAL: 0.85,
  HARD_CUT: 0.75,
  FINAL_SHARPENING: 0.72,
  PEAK_WEEK: 0.95, // variable, carb-loading
  POST_STAGE_RECOVERY: 1.05,
};

// Protein g/kg LBM (or bodyweight as fallback) by phase.
const PHASE_PROTEIN_GKG: Record<MeridianPhase, [number, number]> = {
  OFF_SEASON: [1.8, 2.2],
  PRE_PREP: [2.0, 2.4],
  DIET_PRINCIPAL: [2.2, 2.6],
  HARD_CUT: [2.4, 2.8],
  FINAL_SHARPENING: [2.4, 2.8],
  PEAK_WEEK: [2.0, 2.4],
  POST_STAGE_RECOVERY: [1.8, 2.2],
};

// Training intensity by phase.
const PHASE_TRAINING: Record<MeridianPhase, { volume: string; intensity: string; cardio: string }> = {
  OFF_SEASON:           { volume: "Alto",   intensity: "RPE 7-8",  cardio: "2-3x/sem leve" },
  PRE_PREP:             { volume: "Alto",   intensity: "RPE 7-8",  cardio: "3x/sem moderado" },
  DIET_PRINCIPAL:       { volume: "Médio",  intensity: "RPE 8",    cardio: "4-5x/sem moderado" },
  HARD_CUT:             { volume: "Médio",  intensity: "RPE 8-9",  cardio: "5-6x/sem (LISS+HIIT)" },
  FINAL_SHARPENING:     { volume: "Baixo",  intensity: "RPE 7",    cardio: "Reduzir gradual" },
  PEAK_WEEK:            { volume: "Mínimo", intensity: "RPE 6",    cardio: "Cortar/só caminhada" },
  POST_STAGE_RECOVERY:  { volume: "Baixo",  intensity: "RPE 6-7",  cardio: "Opcional 2x/sem" },
};

// Lab markers by phase.
const PHASE_VERTEX: Record<MeridianPhase, string[]> = {
  OFF_SEASON:           ["Lipidograma baseline", "TSH/T4", "Glicemia + HbA1c"],
  PRE_PREP:             ["Testosterona total/livre", "Cortisol matinal", "Vitamina D"],
  DIET_PRINCIPAL:       ["Cortisol", "T3 livre", "Eletrólitos (Na/K)"],
  HARD_CUT:             ["T3 livre (alerta dieta crônica)", "Cortisol", "Creatinina/ureia"],
  FINAL_SHARPENING:     ["Eletrólitos", "Função renal", "Cortisol"],
  PEAK_WEEK:            ["Eletrólitos (atenção sódio/potássio)"],
  POST_STAGE_RECOVERY:  ["Lipidograma", "Testosterona", "TSH", "Função hepática"],
};

// MCE focus by phase.
const PHASE_MCE: Record<MeridianPhase, string> = {
  OFF_SEASON: "Calibrar TDEE base — janela ampla, ganho controlado.",
  PRE_PREP: "Refinar TDEE com logs de peso recentes.",
  DIET_PRINCIPAL: "Recalibração semanal — manter taxa 0.5-0.75%/sem.",
  HARD_CUT: "Recalibração quinzenal — risco de adaptação metabólica.",
  FINAL_SHARPENING: "Manter sem alterações bruscas — janela curta.",
  PEAK_WEEK: "Desativar ajustes automáticos — manipulação manual.",
  POST_STAGE_RECOVERY: "Reverse diet — incrementos +50-100 kcal/sem.",
};

// APEX checkin priorities by phase.
const PHASE_APEX: Record<MeridianPhase, string[]> = {
  OFF_SEASON: ["Foto frontal/lateral mensal", "Composição corporal trimestral"],
  PRE_PREP: ["Check-in quinzenal", "Foto + medidas + peso semanal"],
  DIET_PRINCIPAL: ["Check-in semanal completo", "Vídeo de poses"],
  HARD_CUT: ["Check-in semanal", "BF visual + vascularização"],
  FINAL_SHARPENING: ["Check-in 2x/sem", "Definição muscular + tan test"],
  PEAK_WEEK: ["Check-in diário", "Carb-up visual", "Hidratação"],
  POST_STAGE_RECOVERY: ["Check-in semanal", "Risco binge + saúde mental"],
};

function estimateMaintenanceKcal(plan: MeridianPlan): number {
  const snap = plan.calculation_inputs?.athlete_snapshot;
  if (!snap) return 2800;
  const weight = Number(snap.current_weight_kg) || Number(plan.stage_target_weight_kg) || 80;
  // Quick Mifflin-style estimate × activity 1.55.
  const sex = snap.biological_sex === "FEMALE" ? -161 : 5;
  const bmr = 10 * weight + 6.25 * 170 - 5 * 30 + sex;
  return Math.round(bmr * 1.55);
}

export function buildHandoff(
  module: HandoffModule,
  plan: MeridianPlan,
  competition: MeridianCompetition,
): ModuleHandoffPayload {
  const phase = getCurrentPhase(plan);
  const maint = estimateMaintenanceKcal(plan);
  const snap = plan.calculation_inputs?.athlete_snapshot || {};
  const weight = Number(snap.current_weight_kg) || Number(plan.stage_target_weight_kg) || 80;
  const lbm = weight * (1 - (Number(snap.current_bf_percent) || 15) / 100);

  switch (module) {
    case "nutriplan": {
      const kcal = Math.round(maint * PHASE_KCAL_FACTOR[phase]);
      const [pMin, pMax] = PHASE_PROTEIN_GKG[phase];
      const proteinG = Math.round(lbm * ((pMin + pMax) / 2));
      const fatG = Math.round((kcal * 0.22) / 9);
      const carbsG = Math.round((kcal - proteinG * 4 - fatG * 9) / 4);
      return {
        module,
        module_label: MODULE_LABELS[module],
        headline: `Macros sugeridos — fase ${phase}`,
        bullets: [
          `Kcal: ${kcal} kcal/dia (${Math.round(PHASE_KCAL_FACTOR[phase] * 100)}% manutenção)`,
          `Proteína: ${proteinG}g (${pMin}-${pMax}g/kg LBM)`,
          `Carbo: ${carbsG}g · Gordura: ${fatG}g`,
        ],
        metrics: { kcal, protein_g: proteinG, carbs_g: carbsG, fat_g: fatG, phase },
      };
    }

    case "trainingon": {
      const t = PHASE_TRAINING[phase];
      return {
        module,
        module_label: MODULE_LABELS[module],
        headline: `Periodização — fase ${phase}`,
        bullets: [
          `Volume: ${t.volume}`,
          `Intensidade: ${t.intensity}`,
          `Cardio: ${t.cardio}`,
        ],
        metrics: { volume: t.volume, intensity: t.intensity, cardio: t.cardio, phase },
      };
    }

    case "dr_vertex": {
      const markers = PHASE_VERTEX[phase];
      return {
        module,
        module_label: MODULE_LABELS[module],
        headline: `Marcadores prioritários — fase ${phase}`,
        bullets: markers,
        metrics: { markers: markers.join(", "), phase },
      };
    }

    case "mce": {
      return {
        module,
        module_label: MODULE_LABELS[module],
        headline: `Calibração metabólica — fase ${phase}`,
        bullets: [PHASE_MCE[phase], `Peso alvo palco: ${plan.stage_target_weight_kg} kg`, `Buffer: ${plan.buffer_weeks} sem`],
        metrics: { strategy: PHASE_MCE[phase], target_weight: plan.stage_target_weight_kg, phase },
      };
    }

    case "apex": {
      const checks = PHASE_APEX[phase];
      return {
        module,
        module_label: MODULE_LABELS[module],
        headline: `Check-ins prioritários — fase ${phase}`,
        bullets: checks,
        metrics: { checks: checks.join(" · "), phase },
      };
    }
  }
}

export const ALL_HANDOFF_MODULES: HandoffModule[] = [
  "nutriplan",
  "trainingon",
  "dr_vertex",
  "mce",
  "apex",
];
