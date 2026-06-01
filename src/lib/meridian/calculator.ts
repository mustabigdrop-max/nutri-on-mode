// MERIDIAN — Helpers de cálculo no client (espelho da edge function, usado para preview).
import type { MeridianPhase, MeridianPlan } from "./types";

export function getCurrentPhase(plan: MeridianPlan, now: Date = new Date()): MeridianPhase {
  const today = now.toISOString().slice(0, 10);
  if (today < plan.pre_prep_start_date) return "OFF_SEASON";
  if (today < plan.diet_phase_start_date) return "PRE_PREP";
  if (today < plan.hard_cut_start_date) return "DIET_PRINCIPAL";
  if (today < plan.final_sharpening_start_date) return "HARD_CUT";
  if (today < plan.peak_week_start_date) return "FINAL_SHARPENING";
  // Peak week é a semana antes da prova
  const peakEnd = new Date(plan.peak_week_start_date);
  peakEnd.setDate(peakEnd.getDate() + 7);
  if (today < peakEnd.toISOString().slice(0, 10)) return "PEAK_WEEK";
  return "POST_STAGE_RECOVERY";
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.round((db.getTime() - da.getTime()) / (24 * 60 * 60 * 1000));
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
