/**
 * ============================================================================
 * Mello Protocol — Frontend Zod Schema
 * ============================================================================
 * Espelho do schema definido em supabase/functions/_shared/melloProtocol.ts
 * Mantenha as duas cópias sincronizadas. Esta versão usa o pacote `zod` do
 * npm (frontend), enquanto a Edge Function usa o import via deno.land.
 * ============================================================================
 */

import { z } from "zod";

const MusclePriorityItem = z.object({
  muscle: z.string().min(1),
  weekly_sets: z.number().int().positive(),
  priority: z.enum(["alta", "media", "baixa"]),
  rationale: z.string().min(1),
});

const WarmupExercise = z.object({
  name: z.string().min(1),
  sets: z.string().min(1),
  reps: z.string().min(1),
  notes: z.string().optional().default(""),
});

const SessionExercise = z.object({
  order: z.number().int().positive(),
  name: z.string().min(1),
  sets: z.string().min(1),
  reps: z.string().min(1),
  rir: z.string().min(1),
  rest_seconds: z.number().int().nonnegative(),
  tempo: z.string().optional().default(""),
  technique: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

const TrainingDay = z.object({
  day_number: z.number().int().positive(),
  title: z.string().min(1),
  focus: z.string().min(1),
  warmup: z.array(WarmupExercise).min(4),
  exercises: z.array(SessionExercise).min(3),
  finisher: z.string().optional().default(""),
});

const PhasePlan = z.object({
  week: z.number().int().positive(),
  phase: z.string().min(1),
  intent: z.string().min(1),
  volume_modifier: z.string().min(1),
  intensity_modifier: z.string().min(1),
  is_deload: z.boolean(),
});

const BlockOverview = z.object({
  title: z.string().min(1),
  client_name: z.string().min(1),
  category: z.string().min(1),
  phase: z.string().min(1),
  mesocycle_duration_weeks: z.number().int().positive(),
  training_frequency_days_per_week: z.number().int().positive(),
  split: z.string().min(1),
  progression_model: z.string().min(1),
  muscle_priorities: z.array(MusclePriorityItem).min(8),
  notes: z.string().min(1),
});

export const MelloProtocolSchema = z.object({
  block_overview: BlockOverview,
  phase_plan: z.array(PhasePlan).min(1),
  training_days: z.array(TrainingDay).length(3),
  improvement_alerts: z.array(z.string().min(1)).min(2),
});

export type MelloProtocol = z.infer<typeof MelloProtocolSchema>;
