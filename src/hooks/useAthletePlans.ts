import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AthleteMealItem {
  alimento: string;
  quantidade?: string;
  quantidade_g?: string;
  observacao?: string;
  substituicoes?: { alimento: string; quantidade?: string; quantidade_g?: string; observacao?: string }[];
}

export interface AthleteMeal {
  refeicao: string;
  horario?: string;
  calorias?: number;
  kcal_calculada?: number;
  alimentos?: AthleteMealItem[];
  macros?: { proteina?: number; carboidrato?: number; gordura?: number };
  suplementos?: string[];
  nota?: string;
}

export interface AthleteMealPlan {
  id: string;
  updatedAt: string;
  objetivo: string | null;
  observacao: string | null;
  resumo: {
    nome?: string;
    objetivo?: string;
    calorias_totais?: number;
    proteina_total?: number;
    carboidrato_total?: number;
    gordura_total?: number;
    observacao_protocolo?: string | null;
  };
  refeicoes: AthleteMeal[];
  suplementacao: { suplemento: string; dose: string; timing: string; justificativa?: string }[];
}

export interface AthleteTrainingPlan {
  id: string;
  updatedAt: string;
  clientName: string | null;
  phase: string | null;
  weeks: string | null;
  daysPerWeek: string | null;
  level: string | null;
  muscles: string[] | null;
  protocolText: unknown;
  observacao: string | null;
}

export interface AthletePlansState {
  loading: boolean;
  error: string | null;
  mealPlan: AthleteMealPlan | null;
  training: AthleteTrainingPlan | null;
  coachMessage: { text: string; date: string } | null;
  refetch: () => Promise<void>;
}

export function useAthletePlans(overrideUserId?: string): AthletePlansState {
  const { user: authUser } = useAuth();
  const userId = overrideUserId || authUser?.id || null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<AthleteMealPlan | null>(null);
  const [training, setTraining] = useState<AthleteTrainingPlan | null>(null);
  const [coachMessage, setCoachMessage] = useState<{ text: string; date: string } | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {


    const [{ data: meal }, { data: prot }, { data: envio }, { data: sent }] = await Promise.all([
      supabase
        .from("coach_meal_plans")
        .select("id, plano, objetivo, observacao, updated_at, created_at, status")
        .eq("patient_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("training_protocols")
        .select("*")
        .eq("patient_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("protocolo_envios")
        .select("observacao, created_at")
        .eq("destinatario_id", userId)
        .not("observacao", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("sent_plans")
        .select("id, type, plan_data, coach_message, created_at")
        .eq("athlete_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

    const sentMeal = (sent || []).find((s) => s.type === "meal_plan") as any;
    const sentTraining = (sent || []).find((s) => s.type === "training_plan") as any;

    const sentMealNewer =
      sentMeal && (!meal || new Date(sentMeal.created_at) >= new Date(meal.updated_at || meal.created_at));

    if (sentMealNewer) {
      const plano = (sentMeal.plan_data || {}) as any;
      setMealPlan({
        id: sentMeal.id,
        updatedAt: sentMeal.created_at,
        objetivo: plano.resumo?.objetivo ?? null,
        observacao: sentMeal.coach_message || null,
        resumo: plano.resumo || {},
        refeicoes: Array.isArray(plano.refeicoes) ? plano.refeicoes : [],
        suplementacao: Array.isArray(plano.suplementacao) ? plano.suplementacao : [],
      });
    } else if (meal) {
      const plano = (meal.plano || {}) as any;
      setMealPlan({
        id: meal.id,
        updatedAt: meal.updated_at || meal.created_at,
        objetivo: meal.objetivo,
        observacao: meal.observacao,
        resumo: plano.resumo || {},
        refeicoes: Array.isArray(plano.refeicoes) ? plano.refeicoes : [],
        suplementacao: Array.isArray(plano.suplementacao) ? plano.suplementacao : [],
      });
    } else {
      setMealPlan(null);
    }


    const sentTrainingNewer =
      sentTraining && (!prot || new Date(sentTraining.created_at) >= new Date((prot as any).created_at));

    if (sentTrainingNewer) {
      const d = (sentTraining.plan_data || {}) as any;
      setTraining({
        id: sentTraining.id,
        updatedAt: sentTraining.created_at,
        clientName: d.client_name ?? null,
        phase: d.phase ?? null,
        weeks: d.weeks ?? null,
        daysPerWeek: d.days_per_week ?? null,
        level: d.level ?? null,
        muscles: d.muscles ?? null,
        protocolText: d.protocol_text,
        observacao: d.periodizacao_text ?? sentTraining.coach_message ?? null,
      });
    } else if (prot) {
      const p = prot as any;
      setTraining({
        id: p.id,
        updatedAt: p.created_at,
        clientName: p.client_name ?? null,
        phase: p.phase ?? null,
        weeks: p.weeks ?? null,
        daysPerWeek: p.days_per_week ?? null,
        level: p.level ?? null,
        muscles: p.muscles ?? null,
        protocolText: p.protocol_text,
        observacao: p.periodizacao_text ?? null,
      });
    } else {
      setTraining(null);
    }

    const latestMsg = sentMeal?.coach_message || sentTraining?.coach_message;
    if (envio?.observacao) {
      setCoachMessage({ text: envio.observacao, date: envio.created_at });
    } else if (latestMsg) {
      setCoachMessage({ text: latestMsg, date: (sentMeal || sentTraining).created_at });
    } else {
      setCoachMessage(null);
    }

      console.log("[useAthletePlans] carregado", { userId, hasMeal: !!(sentMeal || meal), hasTraining: !!(sentTraining || prot) });
    } catch (err) {
      console.error("[useAthletePlans] erro ao carregar planos:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar plano alimentar");
    } finally {
      setLoading(false);
    }
  }, [userId]);


  useEffect(() => {
    load();
  }, [load]);

  // Realtime: novo plano enviado pelo coach aparece na hora
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("athlete-sent-plans")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sent_plans", filter: `athlete_id=eq.${userId}` },
        () => {
          toast.success("Novo plano recebido do seu coach! 🎉");
          load();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, load]);


  return { loading, mealPlan, training, coachMessage, refetch: load };
}

export const mealKcal = (m: AthleteMeal): number => {
  if (typeof m.kcal_calculada === "number") return Math.round(m.kcal_calculada);
  if (typeof m.calorias === "number") return Math.round(m.calorias);
  const p = m.macros?.proteina || 0;
  const c = m.macros?.carboidrato || 0;
  const g = m.macros?.gordura || 0;
  return Math.round(p * 4 + c * 4 + g * 9);
};
