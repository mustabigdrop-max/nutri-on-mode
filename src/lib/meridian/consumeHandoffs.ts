// MERIDIAN — Cliente frontend para consumir handoffs ativos.
// Use nos módulos (NutriPlan, TrainingON, Dr. VERTEX, MCE, APEX) antes de
// chamar a IA, para injetar contexto MERIDIAN no prompt.
import { supabase } from "@/integrations/supabase/client";
import type { HandoffModule } from "./handoffs";

export interface ConsumeHandoffsResult {
  module: HandoffModule;
  count: number;
  handoffs: Array<{
    id: string;
    plan_id: string;
    competition_id: string;
    target_module: HandoffModule;
    phase: string;
    payload: {
      module: HandoffModule;
      module_label: string;
      headline: string;
      bullets: string[];
      metrics: Record<string, string | number>;
    };
    status: string;
    created_at: string;
  }>;
  prompt_context: string;
  auto_applied: boolean;
}

/**
 * Busca handoffs pending do MERIDIAN para um módulo específico.
 * @param module - módulo de destino
 * @param opts.patientUserId - se coach, consumir handoffs do aluno vinculado
 * @param opts.autoApply - marca como "applied" após leitura (default false)
 */
export async function consumeMeridianHandoffs(
  module: HandoffModule,
  opts: { patientUserId?: string; autoApply?: boolean } = {},
): Promise<ConsumeHandoffsResult | null> {
  const { data, error } = await supabase.functions.invoke("meridian-handoff-consumer", {
    body: {
      module,
      patient_user_id: opts.patientUserId,
      auto_apply: opts.autoApply ?? false,
    },
  });
  if (error) {
    console.error("consumeMeridianHandoffs error:", error);
    return null;
  }
  return data as ConsumeHandoffsResult;
}
