/**
 * Hooks de migração de protocolos legados → Mello v1.
 *
 *  - useRegenerateLegacy:  mutation que dispara a Edge Function
 *  - useMigrationStats:    query que lê a view trainingon_migration_stats
 *  - useBatchRegenerate:   regenera múltiplos legados em sequência
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RegenerateLegacyArgs {
  legacy_protocol_id: string;
  athlete_override?: Partial<{
    name: string;
    category: string;
    phase: string;
    readiness: number;
    apex_priorities: string[];
    fiber_profile: string;
    biotype: string;
    restrictions: string[];
    division: string;
    total_weeks: number;
    current_week: number;
    deload_week: number;
  }>;
}

export interface RegenerateLegacyResult {
  new_protocol_id: string;
  legacy_protocol_id: string;
  title?: string;
}

export interface MigrationStats {
  user_id: string;
  legacy_pending: number;
  mello_v1_count: number;
  legacy_replaced: number;
  total_protocols: number;
  last_migrated_at: string | null;
}

export function useRegenerateLegacy() {
  const qc = useQueryClient();
  return useMutation<RegenerateLegacyResult, Error, RegenerateLegacyArgs>({
    mutationFn: async (args) => {
      const { data, error } = await supabase.functions.invoke(
        "regenerate-legacy-protocol",
        { body: args },
      );
      if (error) throw new Error(error.message);
      if (!data?.new_protocol_id) {
        throw new Error("Edge Function não retornou new_protocol_id");
      }
      return data as RegenerateLegacyResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training_protocols"] });
      qc.invalidateQueries({ queryKey: ["migration_stats"] });
    },
  });
}

export function useMigrationStats() {
  return useQuery<MigrationStats | null, Error>({
    queryKey: ["migration_stats"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("trainingon_migration_stats")
        .select("*")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as MigrationStats) ?? null;
    },
    staleTime: 30_000,
  });
}

export interface BatchProgress {
  total: number;
  current: number;
  completed: { legacy_id: string; new_id: string }[];
  failed: { legacy_id: string; error: string }[];
  isRunning: boolean;
  isDone: boolean;
}

export function useBatchRegenerate() {
  const regenerate = useRegenerateLegacy();
  const [progress, setProgress] = useState<BatchProgress>({
    total: 0,
    current: 0,
    completed: [],
    failed: [],
    isRunning: false,
    isDone: false,
  });

  const run = useCallback(
    async (legacyIds: string[]) => {
      setProgress({
        total: legacyIds.length,
        current: 0,
        completed: [],
        failed: [],
        isRunning: true,
        isDone: false,
      });

      const completed: { legacy_id: string; new_id: string }[] = [];
      const failed: { legacy_id: string; error: string }[] = [];

      for (let i = 0; i < legacyIds.length; i++) {
        const legacyId = legacyIds[i];
        setProgress((p) => ({ ...p, current: i + 1 }));
        try {
          const result = await regenerate.mutateAsync({
            legacy_protocol_id: legacyId,
          });
          completed.push({
            legacy_id: legacyId,
            new_id: result.new_protocol_id,
          });
        } catch (err) {
          failed.push({
            legacy_id: legacyId,
            error: err instanceof Error ? err.message : String(err),
          });
        }
        setProgress((p) => ({
          ...p,
          completed: [...completed],
          failed: [...failed],
        }));
      }

      setProgress((p) => ({ ...p, isRunning: false, isDone: true }));
    },
    [regenerate],
  );

  return { progress, run };
}
