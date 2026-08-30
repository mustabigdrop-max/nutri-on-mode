import { supabase } from "@/integrations/supabase/client";
import type { AdjustmentOption } from "./protocolAdjustment";

/**
 * Aplica um ajuste aprovado no plano alimentar ativo do atleta,
 * notifica o atleta e registra na timeline do paciente.
 */
export async function applyAdjustment(params: {
  athleteId: string;
  coachId: string | null;
  option: AdjustmentOption;
  suggestionTitle: string;
  customAction?: string | null;
}) {
  const { athleteId, coachId, option, suggestionTitle, customAction } = params;
  const c = option.changes ?? {};

  // 1) Plano alimentar ativo
  const { data: plan } = await supabase
    .from("sent_plans")
    .select("id, plan_data, metadata")
    .eq("athlete_id", athleteId)
    .eq("type", "meal_plan")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (plan) {
    const pd = { ...(((plan as any).plan_data as Record<string, any>) ?? {}) };
    const md = { ...(((plan as any).metadata as Record<string, any>) ?? {}) };

    const baseKcal = Number(pd.calories ?? pd.kcal ?? 0);
    if (c.calories && baseKcal > 0) {
      const next = Math.max(1000, Math.round(baseKcal + c.calories));
      if (pd.calories !== undefined) pd.calories = next;
      else pd.kcal = next;
    }
    if (c.carbs && pd.carbs !== undefined) pd.carbs = Math.max(0, Math.round(Number(pd.carbs) + c.carbs));
    if (c.protein && pd.protein !== undefined)
      pd.protein = Math.max(0, Math.round(Number(pd.protein) + c.protein));
    if (c.fat && pd.fat !== undefined) pd.fat = Math.max(0, Math.round(Number(pd.fat) + c.fat));

    const adjustments = Array.isArray(md.adjustments) ? md.adjustments : [];
    adjustments.push({
      at: new Date().toISOString(),
      label: option.label,
      detail: customAction || option.detail,
      changes: c,
    });
    md.adjustments = adjustments;

    if (c.dietBreak) md.diet_break_days = c.dietBreak;
    if (c.refeed) {
      md.refeed_days = c.refeed;
      md.carb_multiplier = c.carbMultiplier ?? 1.5;
      pd.last_refeed = new Date().toISOString();
    }
    if (c.deload) md.deload = true;
    if (c.trainingFrequency) md.training_days = c.trainingFrequency;
    if (c.meals) md.meals = c.meals;
    if (c.addFreeMeal) md.free_meal = true;
    if (c.macroFlexibility) md.macro_flexibility = c.macroFlexibility;
    if (c.addCardio) md.cardio = c.addCardio;
    if (c.removeCardio) md.cardio_removed_sessions = c.removeCardio;
    if (c.addSupplement) {
      md.supplements = [...(Array.isArray(md.supplements) ? md.supplements : []), c.addSupplement];
    }
    if (c.lastMealCarbs) md.last_meal_carbs = true;
    if (c.mode) md.mode = c.mode;
    if (c.weeklyIncrease) md.weekly_increase_kcal = c.weeklyIncrease;

    await supabase
      .from("sent_plans")
      .update({ plan_data: pd as any, metadata: md as any, updated_at: new Date().toISOString() })
      .eq("id", (plan as any).id);
  }

  // 2 e 3) Notificação do atleta + timeline (função no servidor: o coach não
  // pode inserir direto nessas tabelas por causa das regras de acesso).
  const { error: notifyError } = await supabase.rpc("record_protocol_adjustment" as any, {
    _athlete_id: athleteId,
    _title: `Ajuste aprovado: ${option.label}`,
    _description: `${option.label} — ${customAction || option.detail}`,
    _metadata: { changes: c as any, suggestion: suggestionTitle } as any,
  } as any);
  if (notifyError) {
    throw new Error(`Ajuste aplicado, mas não consegui avisar o atleta: ${notifyError.message}`);
  }
}
