import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  computeCycleState,
  computeDietBreakState,
  defaultPeriodizationConfig,
  mergePeriodizationConfig,
  todayISO,
  type PeriodizationConfig,
  type WeightPoint,
} from "@/lib/nutritionPeriodization";

const LS_KEY = "nutrion_periodization_config";

function readLocal(): PeriodizationConfig {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return mergePeriodizationConfig(JSON.parse(raw));
  } catch {}
  return defaultPeriodizationConfig();
}

/**
 * Carrega/salva a configuração de periodização nutricional
 * (profiles.nutrition_periodization — JSONB) com fallback em localStorage.
 */
export function useNutritionPeriodization() {
  const { user } = useAuth();
  const [config, setConfig] = useState<PeriodizationConfig>(() => readLocal());
  const [weightLogs, setWeightLogs] = useState<WeightPoint[]>([]);
  const [bodyFatPct, setBodyFatPct] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setLoading(false); return; }
      try {
        const [{ data: prof }, { data: logs }] = await Promise.all([
          (supabase.from("profiles") as any)
            .select("nutrition_periodization")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("weight_logs")
            .select("weight_kg, body_fat_pct, logged_at")
            .eq("user_id", user.id)
            .order("logged_at", { ascending: false })
            .limit(120),
        ]);
        if (cancelled) return;
        if (prof?.nutrition_periodization) {
          setConfig(mergePeriodizationConfig(prof.nutrition_periodization));
        }
        if (logs) {
          setWeightLogs(
            logs
              .filter((l: any) => typeof l.weight_kg === "number")
              .map((l: any) => ({ date: String(l.logged_at).slice(0, 10), weight: l.weight_kg }))
          );
          const withBf = logs.find((l: any) => l.body_fat_pct != null);
          if (withBf) setBodyFatPct(Number(withBf.body_fat_pct));
        }
      } catch {
        /* mantém localStorage */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const saveConfig = useCallback(
    async (next: PeriodizationConfig) => {
      setConfig(next);
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
      if (!user) return;
      try {
        await (supabase.from("profiles") as any)
          .update({ nutrition_periodization: next })
          .eq("user_id", user.id);
      } catch {}
    },
    [user]
  );

  const updateConfig = useCallback(
    (patch: Partial<PeriodizationConfig>) => saveConfig({ ...config, ...patch }),
    [config, saveConfig]
  );

  const cycleState = useMemo(() => computeCycleState(config.cycle), [config.cycle]);
  const dietBreakState = useMemo(() => computeDietBreakState(config.dietBreak), [config.dietBreak]);

  const scheduleDietBreak = useCallback(() => {
    saveConfig({
      ...config,
      dietBreak: { ...config.dietBreak, active_start: todayISO() },
    });
  }, [config, saveConfig]);

  const postponeDietBreak = useCallback(() => {
    saveConfig({
      ...config,
      dietBreak: { ...config.dietBreak, postponed_weeks: (config.dietBreak.postponed_weeks || 0) + 1 },
    });
  }, [config, saveConfig]);

  return {
    loading,
    config,
    saveConfig,
    updateConfig,
    cycleState,
    dietBreakState,
    scheduleDietBreak,
    postponeDietBreak,
    weightLogs,
    bodyFatPct,
  };
}
