// ============================================================
// ESTIMADOR DE DURAÇÃO DO PROTOCOLO (em minutos)
// Calcula se o treino gerado caberá no tempo de sessão definido
// ============================================================
import { TRAINING_SYSTEMS } from "./trainingSystems";

interface EstimateArgs {
  systemId: string;
  muscles: string[];      // grupos musculares prioritários
  level: string;          // iniciante | intermediario | avancado | atleta
  sessionDuration: string; // "60min", etc.
  cardio?: string;        // texto/seleção de cardio (opcional)
}

export interface DurationEstimate {
  estimatedMin: number;     // duração total estimada
  availableMin: number;     // tempo disponível
  diff: number;             // available - estimated (negativo = estoura)
  fits: boolean;            // cabe?
  warmupMin: number;
  workMin: number;
  cardioMin: number;
  exercises: number;        // nº de exercícios estimados
  totalSets: number;
  avgRestSec: number;
  breakdown: { label: string; minutes: number }[];
}

// Estimativas por sistema: sets/exercício, descanso médio (s), exercícios extras por dia
const SYSTEM_PROFILE: Record<string, { setsPerEx: number; restSec: number; exExtra: number; cadenceSec: number; reps: number }> = {
  "linear-simples": { setsPerEx: 3.5, restSec: 90, exExtra: 0, cadenceSec: 4, reps: 10 },
  "dup":            { setsPerEx: 4,   restSec: 120, exExtra: 1, cadenceSec: 4, reps: 9 },
  "wup":            { setsPerEx: 3.5, restSec: 90, exExtra: 0, cadenceSec: 4, reps: 10 },
  "conjugada":      { setsPerEx: 5,   restSec: 240, exExtra: 2, cadenceSec: 4, reps: 4 },
  "block":          { setsPerEx: 4,   restSec: 120, exExtra: 1, cadenceSec: 4, reps: 8 },
  "apre":           { setsPerEx: 4,   restSec: 150, exExtra: 1, cadenceSec: 4, reps: 8 },
  "531":            { setsPerEx: 4,   restSec: 200, exExtra: 2, cadenceSec: 4, reps: 6 },
  "531-monolith":   { setsPerEx: 8,   restSec: 90, exExtra: 2, cadenceSec: 4, reps: 8 },
  "smolov":         { setsPerEx: 7,   restSec: 240, exExtra: 1, cadenceSec: 5, reps: 5 },
  "texas-method":   { setsPerEx: 5,   restSec: 240, exExtra: 1, cadenceSec: 4, reps: 5 },
  "cube":           { setsPerEx: 5,   restSec: 200, exExtra: 1, cadenceSec: 4, reps: 5 },
  "gvt":            { setsPerEx: 10,  restSec: 75, exExtra: 1, cadenceSec: 6, reps: 10 },
  "gvt-poliquin":   { setsPerEx: 10,  restSec: 90, exExtra: 1, cadenceSec: 6, reps: 6 },
  "doggcrapp":      { setsPerEx: 1.5, restSec: 90, exExtra: 0, cadenceSec: 5, reps: 12 },
  "mountain-dog":   { setsPerEx: 9,   restSec: 70, exExtra: 2, cadenceSec: 4, reps: 11 },
  "rp":             { setsPerEx: 5,   restSec: 120, exExtra: 1, cadenceSec: 4, reps: 10 },
  "edt":            { setsPerEx: 6,   restSec: 30, exExtra: 0, cadenceSec: 3, reps: 8 },
  "heavy-duty":     { setsPerEx: 1,   restSec: 60, exExtra: 0, cadenceSec: 6, reps: 8 },
  "triphasic":      { setsPerEx: 4,   restSec: 240, exExtra: 1, cadenceSec: 6, reps: 4 },
  "french-contrast":{ setsPerEx: 4,   restSec: 200, exExtra: 1, cadenceSec: 3, reps: 4 },
  "vbt":            { setsPerEx: 5,   restSec: 150, exExtra: 1, cadenceSec: 3, reps: 5 },
  "bulgarian":      { setsPerEx: 6,   restSec: 360, exExtra: 0, cadenceSec: 4, reps: 3 },
  "weider":         { setsPerEx: 3.5, restSec: 75, exExtra: 3, cadenceSec: 4, reps: 11 },
  "flushing":       { setsPerEx: 3.5, restSec: 45, exExtra: 2, cadenceSec: 4, reps: 12 },
  "staggered":      { setsPerEx: 3,   restSec: 90, exExtra: 2, cadenceSec: 4, reps: 12 },
  "super-comp":     { setsPerEx: 4,   restSec: 120, exExtra: 1, cadenceSec: 4, reps: 8 },
};

const LEVEL_EX_BASE: Record<string, number> = {
  iniciante: 4, intermediario: 5, avancado: 6, atleta: 7,
};

export function estimateProtocolDuration({
  systemId, muscles, level, sessionDuration, cardio,
}: EstimateArgs): DurationEstimate {
  const sys = TRAINING_SYSTEMS.find((s) => s.id === systemId);
  const prof = SYSTEM_PROFILE[systemId] || SYSTEM_PROFILE["linear-simples"];

  // Exercícios por sessão: base do nível + extras do sistema + influência de prioridades
  const baseEx = LEVEL_EX_BASE[level] ?? 5;
  const priorityBoost = Math.min(2, Math.max(0, muscles.length - 2));
  const exercises = Math.max(3, baseEx + prof.exExtra + priorityBoost);

  const totalSets = Math.round(exercises * prof.setsPerEx);

  // Tempo de execução por set: cadência × reps + 5s setup
  const setExecSec = prof.cadenceSec * prof.reps + 5;
  // Cada set tem (execução + descanso). Último set do exercício não precisa do descanso longo
  const workSec = totalSets * setExecSec + (totalSets - exercises) * prof.restSec + exercises * 60; // 60s transição entre exercícios
  const workMin = Math.round(workSec / 60);

  // Aquecimento: 8-12min conforme complexidade
  const warmupMin = sys ? 8 + Math.min(4, sys.complexidade) : 10;

  // Cardio (se prescrito no mesmo dia)
  let cardioMin = 0;
  if (cardio && /sim|hiit|liss|moder|intens/i.test(cardio)) {
    cardioMin = /hiit|intens/i.test(cardio) ? 20 : 30;
  }

  const estimatedMin = warmupMin + workMin + cardioMin;
  const availableMin = parseInt((sessionDuration || "60").replace(/\D/g, "")) || 60;
  const diff = availableMin - estimatedMin;

  return {
    estimatedMin,
    availableMin,
    diff,
    fits: diff >= 0,
    warmupMin,
    workMin,
    cardioMin,
    exercises,
    totalSets,
    avgRestSec: prof.restSec,
    breakdown: [
      { label: "Aquecimento", minutes: warmupMin },
      { label: `Treino principal (${exercises} ex · ${totalSets} sets)`, minutes: workMin },
      ...(cardioMin > 0 ? [{ label: "Cardio integrado", minutes: cardioMin }] : []),
    ],
  };
}
