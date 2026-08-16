import { useCallback, useEffect, useState } from "react";
import { getLocalDateStr } from "@/lib/utils";
import type { ClimateBand } from "@/lib/nutrySync";

/**
 * Estado local do dia do atleta: refeições concluídas e sensação térmica informada.
 * Persistido por dia civil local — reseta sozinho à meia-noite.
 */
export function useDayContext(userId?: string | null) {
  const today = getLocalDateStr();
  const scope = userId || "anon";
  const mealsKey = `nutrion:day-meals:${scope}:${today}`;
  const climateKey = `nutrion:day-climate:${scope}:${today}`;

  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [climate, setClimateState] = useState<ClimateBand>("ameno");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(mealsKey);
      setCompleted(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
      const c = localStorage.getItem(climateKey) as ClimateBand | null;
      setClimateState(c || "ameno");
    } catch {
      setCompleted({});
      setClimateState("ameno");
    }
  }, [mealsKey, climateKey]);

  const toggleMeal = useCallback(
    (key: string) => {
      setCompleted((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        try {
          localStorage.setItem(mealsKey, JSON.stringify(next));
        } catch {
          /* storage indisponível */
        }
        return next;
      });
    },
    [mealsKey],
  );

  const setClimate = useCallback(
    (band: ClimateBand) => {
      setClimateState(band);
      try {
        localStorage.setItem(climateKey, band);
      } catch {
        /* storage indisponível */
      }
    },
    [climateKey],
  );

  return { completed, toggleMeal, climate, setClimate };
}
