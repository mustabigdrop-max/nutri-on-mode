import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingNutritionSync {
  id?: string;
  user_id?: string;
  training_phase?: string | null;
  training_days?: any;
  volume_sets_semana?: number | null;
  musculos_prioritarios?: string[] | null;
  sistema_treino?: string | null;
  tempo_sessao_min?: number | null;
  tipo_fibra?: string | null;
  stratum_fase?: string | null;
  cardio_mesmo_dia?: boolean | null;
  intensidade_treino?: string | null;
  updated_at?: string;
}

/**
 * Hook para ler/gravar sincronização TrainingON ↔ NutriON.
 * Use `payload` para injetar automaticamente nas chamadas
 * de `generate-meal-plan` e `generate-coach-meal-plan`.
 */
export function useTrainingNutritionSync() {
  const [data, setData] = useState<TrainingNutritionSync | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchSync = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id ?? null;
    setUserId(uid);
    if (!uid) {
      setData(null);
      setLoading(false);
      return;
    }
    const { data: row } = await supabase
      .from("training_nutrition_sync")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();
    setData((row as TrainingNutritionSync) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSync();
  }, [fetchSync]);

  const upsertSync = useCallback(
    async (patch: Partial<TrainingNutritionSync>) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) throw new Error("Usuário não autenticado");

      const payload = { ...patch, user_id: uid, updated_at: new Date().toISOString() };
      const { data: row, error } = await supabase
        .from("training_nutrition_sync")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      setData(row as TrainingNutritionSync);
      return row as TrainingNutritionSync;
    },
    []
  );

  /** Payload pronto para injetar nas Edge Functions. */
  const payload = data
    ? {
        training_phase: data.training_phase ?? undefined,
        training_days: data.training_days ?? undefined,
        volume_sets_semana: data.volume_sets_semana ?? undefined,
        musculos_prioritarios: data.musculos_prioritarios ?? undefined,
        sistema_treino: data.sistema_treino ?? undefined,
        tempo_sessao_min: data.tempo_sessao_min ?? undefined,
        tipo_fibra: data.tipo_fibra ?? undefined,
        stratum_fase: data.stratum_fase ?? undefined,
        cardio_mesmo_dia: data.cardio_mesmo_dia ?? undefined,
        intensidade_treino: data.intensidade_treino ?? undefined,
      }
    : {};

  return { data, payload, loading, userId, refresh: fetchSync, upsertSync };
}
