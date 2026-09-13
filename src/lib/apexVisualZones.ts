// APEX Visual — zonas, confiança, calibração e frequência adaptativa.
// Nenhum valor é inventado: tudo derivado da análise real ou dos dados do atleta.

export type ZoneKey =
  | "abdomen"
  | "deltoides_ombros"
  | "bracos"
  | "pernas"
  | "gluteos_lombar"
  | "vascularizacao"
  | "pele_subcutaneo";

export interface ZoneResult {
  score: number | null;
  weight: number;
  description?: string;
  bf_indicator?: string;
  notes?: string;
}

export interface WeakPoint {
  group: string;
  severity: "critical" | "attention" | "monitor" | string;
  description?: string;
  recommendation?: string;
}

export interface ApexZonesAnalysis {
  athlete?: string;
  date?: string;
  sex?: string;
  category?: string;
  photos_analyzed?: string[];
  zones: Record<ZoneKey, ZoneResult>;
  weighted_score?: number;
  bf_range?: string;
  bf_range_calibrated?: string;
  category_adjustment?: string;
  confidence?: number;
  confidence_reason?: string;
  weak_points?: WeakPoint[];
  comparison_previous?: {
    has_previous?: boolean;
    previous_date?: string | null;
    previous_bf?: string | null;
    current_bf?: string | null;
    delta?: string;
    zones_improved?: string[];
    zones_declined?: string[];
    zones_stable?: string[];
  };
  protocol?: {
    next_assessment_date?: string;
    frequency?: string;
    frequency_reason?: string;
    photo_requirements?: string[];
    conditions?: string;
    training_adjustments?: string[];
    nutrition_adjustments?: string[];
  };
  alerts?: string[];
  summary?: string;
}

export const ZONE_META: { key: ZoneKey; label: string; weight: number; requires: PhotoView[] }[] = [
  { key: "abdomen", label: "Abdômen", weight: 25, requires: ["frontal"] },
  { key: "deltoides_ombros", label: "Deltóide / Ombros", weight: 15, requires: ["frontal"] },
  { key: "bracos", label: "Braços", weight: 12, requires: ["frontal"] },
  { key: "pernas", label: "Pernas (quadríceps)", weight: 15, requires: ["frontal", "lateral"] },
  { key: "gluteos_lombar", label: "Glúteos / Lombar", weight: 18, requires: ["posterior"] },
  { key: "vascularizacao", label: "Vascularização geral", weight: 8, requires: ["frontal"] },
  { key: "pele_subcutaneo", label: "Pele / Subcutâneo", weight: 7, requires: ["frontal"] },
];

export type PhotoView = "frontal" | "lateral" | "posterior";
export const PHOTO_VIEWS: PhotoView[] = ["frontal", "lateral", "posterior"];

export const PHOTO_VIEW_LABEL: Record<PhotoView, string> = {
  frontal: "Frontal",
  lateral: "Lateral",
  posterior: "Posterior",
};

/** Score ponderado apenas com zonas realmente avaliadas (pesos renormalizados). */
export function weightedScore(zones: Partial<Record<ZoneKey, ZoneResult>>): number | null {
  let sum = 0;
  let weight = 0;
  for (const { key, weight: w } of ZONE_META) {
    const z = zones?.[key];
    const score = z?.score;
    if (typeof score !== "number" || Number.isNaN(score)) continue;
    const zw = typeof z?.weight === "number" && z.weight > 0 ? z.weight : w;
    sum += score * zw;
    weight += zw;
  }
  if (weight === 0) return null;
  return Math.round((sum / weight) * 10) / 10;
}

/** Confiança máxima permitida conforme as fotos disponíveis (regras absolutas do APEX). */
export function confidenceCap(views: PhotoView[]): number {
  const has = (v: PhotoView) => views.includes(v);
  if (has("frontal") && has("lateral") && has("posterior")) return 90;
  if (has("frontal") && has("posterior")) return 70;
  if (has("frontal") && has("lateral")) return 55;
  if (has("frontal")) return 40;
  if (views.length > 0) return 35;
  return 0;
}

export function missingViews(views: PhotoView[]): PhotoView[] {
  return PHOTO_VIEWS.filter((v) => !views.includes(v));
}

/** Alertas determinísticos sobre as fotos, antes de qualquer análise. */
export function photoChecklist(
  photos: { view: PhotoView; date?: string | null }[],
): { cap: number; missing: PhotoView[]; sameSession: boolean | null; warnings: string[] } {
  const views = photos.map((p) => p.view);
  const cap = confidenceCap(views);
  const missing = missingViews(views);
  const dates = photos.map((p) => (p.date ? p.date.slice(0, 10) : null)).filter(Boolean) as string[];
  const sameSession = dates.length >= 2 ? new Set(dates).size === 1 : null;

  const warnings: string[] = [];
  if (missing.length) {
    warnings.push(
      `Faltam fotos: ${missing.map((v) => PHOTO_VIEW_LABEL[v]).join(", ")}. Confiança limitada a ${cap}%.`,
    );
  }
  if (missing.includes("posterior")) {
    warnings.push("Sem foto posterior: glúteos e lombar não podem ser avaliados.");
  }
  if (sameSession === false) {
    warnings.push("As fotos têm datas diferentes — confirme se são da mesma sessão.");
  }
  return { cap, missing, sameSession, warnings };
}

/** Frequência adaptativa por fase — regra fixa do APEX. */
export function assessmentCadence(
  phase: string | null | undefined,
  weeksToStage: number | null | undefined,
): { frequency: string; days: number | null; reason: string } {
  const p = String(phase || "").toLowerCase();
  const weeks = typeof weeksToStage === "number" ? weeksToStage : null;

  if (p.includes("deload")) {
    return { frequency: "suspensa", days: null, reason: "Deload — avaliação suspensa nesta fase." };
  }
  if (p.includes("prep") || p.includes("cut")) {
    if (weeks !== null && weeks <= 4) {
      return { frequency: "semanal", days: 7, reason: "Últimas 4 semanas de prep — mudanças rápidas." };
    }
    return { frequency: "quinzenal", days: 14, reason: "Fase de cutting/prep — mudanças rápidas." };
  }
  if (p.includes("bulk") || p.includes("acumul") || p.includes("manuten") || p.includes("transmut")) {
    return { frequency: "mensal", days: 30, reason: "Fase de acumulação/manutenção — mudanças graduais." };
  }
  return { frequency: "mensal", days: 30, reason: "Fase sem cadência específica — padrão mensal." };
}

export function addDays(from: Date, days: number): string {
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Média numérica de uma faixa "12-15%" → 13.5. Retorna null se não houver faixa válida. */
export function bfRangeMidpoint(range?: string | null): number | null {
  if (!range) return null;
  const nums = String(range).match(/\d+(?:[.,]\d+)?/g);
  if (!nums || nums.length === 0) return null;
  const parsed = nums.map((n) => parseFloat(n.replace(",", ".")));
  const avg = parsed.reduce((a, b) => a + b, 0) / parsed.length;
  return Math.round(avg * 10) / 10;
}

export const SEVERITY_LABEL: Record<string, string> = {
  critical: "Crítico",
  attention: "Atenção",
  monitor: "Monitorar",
};
