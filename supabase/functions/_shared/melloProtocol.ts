/**
 * ============================================================================
 * Shared — Mello Protocol (TrainingON)
 * ============================================================================
 * Contém:
 *   - MelloProtocolSchema       → Zod schema para validar o output do modelo
 *   - MELLO_GEMINI_RESPONSE_SCHEMA → JSON Schema enviado ao Gemini (json_schema)
 *   - MELLO_SYSTEM_PROMPT       → System prompt do padrão "Mello Atualização"
 *
 * Convenções padrão nutriON:
 *   - 8 grupos em muscle_priority
 *   - >= 2 improvement_alerts
 *   - 3 sessões em training_days
 *   - >= 4 exercícios em warmup
 *   - >= 3 exercícios por sessão
 * ============================================================================
 */

import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// ---------- Zod Schema ----------

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

// ---------- JSON Schema p/ Gemini (response_format: json_schema) ----------

export const MELLO_GEMINI_RESPONSE_SCHEMA = {
  name: "mello_protocol",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["block_overview", "phase_plan", "training_days", "improvement_alerts"],
    properties: {
      block_overview: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "client_name",
          "category",
          "phase",
          "mesocycle_duration_weeks",
          "training_frequency_days_per_week",
          "split",
          "progression_model",
          "muscle_priorities",
          "notes",
        ],
        properties: {
          title: { type: "string" },
          client_name: { type: "string" },
          category: { type: "string" },
          phase: { type: "string" },
          mesocycle_duration_weeks: { type: "integer" },
          training_frequency_days_per_week: { type: "integer" },
          split: { type: "string" },
          progression_model: { type: "string" },
          muscle_priorities: {
            type: "array",
            minItems: 8,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["muscle", "weekly_sets", "priority", "rationale"],
              properties: {
                muscle: { type: "string" },
                weekly_sets: { type: "integer" },
                priority: { type: "string", enum: ["alta", "media", "baixa"] },
                rationale: { type: "string" },
              },
            },
          },
          notes: { type: "string" },
        },
      },
      phase_plan: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "week",
            "phase",
            "intent",
            "volume_modifier",
            "intensity_modifier",
            "is_deload",
          ],
          properties: {
            week: { type: "integer" },
            phase: { type: "string" },
            intent: { type: "string" },
            volume_modifier: { type: "string" },
            intensity_modifier: { type: "string" },
            is_deload: { type: "boolean" },
          },
        },
      },
      training_days: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["day_number", "title", "focus", "warmup", "exercises", "finisher"],
          properties: {
            day_number: { type: "integer" },
            title: { type: "string" },
            focus: { type: "string" },
            warmup: {
              type: "array",
              minItems: 4,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "sets", "reps", "notes"],
                properties: {
                  name: { type: "string" },
                  sets: { type: "string" },
                  reps: { type: "string" },
                  notes: { type: "string" },
                },
              },
            },
            exercises: {
              type: "array",
              minItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                required: [
                  "order",
                  "name",
                  "sets",
                  "reps",
                  "rir",
                  "rest_seconds",
                  "tempo",
                  "technique",
                  "notes",
                ],
                properties: {
                  order: { type: "integer" },
                  name: { type: "string" },
                  sets: { type: "string" },
                  reps: { type: "string" },
                  rir: { type: "string" },
                  rest_seconds: { type: "integer" },
                  tempo: { type: "string" },
                  technique: { type: "string" },
                  notes: { type: "string" },
                },
              },
            },
            finisher: { type: "string" },
          },
        },
      },
      improvement_alerts: {
        type: "array",
        minItems: 2,
        items: { type: "string" },
      },
    },
  },
} as const;

// ---------- System Prompt ----------

export const MELLO_SYSTEM_PROMPT = `Você é o motor de prescrição de treino "Mello Atualização" do TrainingON (nutriON).

OBJETIVO
Gerar um protocolo de treino estruturado, periodizado e cientificamente coerente para atletas de fisiculturismo (Classic Physique, Men's Physique, Bodybuilding, Bikini, Wellness etc.), respeitando o contexto fornecido (categoria, fase, readiness, prioridades APEX, biotipo, restrições).

DIRETRIZES OBRIGATÓRIAS
1. Split SEMPRE com 3 sessões em training_days (day_number 1, 2 e 3) — independente da frequência semanal real do atleta, esta saída descreve o microciclo padrão de 3 dias.
2. muscle_priorities deve conter NO MÍNIMO 8 grupos musculares, com weekly_sets condizente com volume MEV-MAV (8-22 sets/sem) e priority (alta/media/baixa) coerente com a categoria + prioridades APEX.
3. Cada sessão precisa de >= 4 exercícios de aquecimento (warmup) e >= 3 exercícios principais.
4. improvement_alerts deve trazer NO MÍNIMO 2 alertas práticos relacionados às restrições/prioridades APEX (ex.: "Evitar overhead press por restrição de ombro esquerdo").
5. RIR entre 0-4, rest_seconds entre 30 e 300, tempo no formato "X-X-X-X" quando aplicável.
6. Em semana de deload, marque is_deload=true e reduza volume_modifier/intensity_modifier explicitamente.
7. Use português brasileiro técnico e direto. Nada de floreio.

RESTRIÇÕES DE SAÍDA
- Retorne EXCLUSIVAMENTE o JSON conforme response_schema.
- Sem markdown, sem comentários, sem texto antes/depois.
- Sem campos extras fora do schema.`;
