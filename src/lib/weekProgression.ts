// Mello — Bulking 16 semanas: mapeamento de fases por semana
export type PhaseId = "MEV" | "MEV+2" | "MAV" | "MAV+2" | "MRV" | "MRV+2" | "DELOAD" | "TRANSICAO";

export interface WeekPhase {
  week: number;
  phase: PhaseId;
  label: string;
  rpe: number | null;
  rir: number | null;
  setsAdd: number; // adicionar X séries ao base (ou multiplicar quando deload)
  isDeload: boolean;
  isTransition?: boolean;
  color: string; // hex
  bg: string; // tailwind-friendly rgba bg
  note?: string;
}

const COLORS: Record<PhaseId, { color: string; bg: string }> = {
  MEV:        { color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  "MEV+2":    { color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  MAV:        { color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  "MAV+2":    { color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  MRV:        { color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  "MRV+2":    { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  DELOAD:     { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  TRANSICAO:  { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

export const WEEK_PLAN: WeekPhase[] = [
  { week: 1,  phase: "MEV",       label: "MEV | RPE 7",            rpe: 7,    rir: 3,    setsAdd: 0, isDeload: false, ...COLORS["MEV"] },
  { week: 2,  phase: "MEV+2",     label: "MEV+2 | RPE 7.5",        rpe: 7.5,  rir: 2.5,  setsAdd: 1, isDeload: false, ...COLORS["MEV+2"] },
  { week: 3,  phase: "MAV",       label: "MAV | RPE 8",            rpe: 8,    rir: 2,    setsAdd: 2, isDeload: false, ...COLORS["MAV"] },
  { week: 4,  phase: "MAV+2",     label: "MAV+2 | RPE 8.5",        rpe: 8.5,  rir: 1.5,  setsAdd: 3, isDeload: false, ...COLORS["MAV+2"] },
  { week: 5,  phase: "DELOAD",    label: "DELOAD",                  rpe: 6,    rir: null, setsAdd: 0, isDeload: true,  ...COLORS["DELOAD"] },
  { week: 6,  phase: "MEV+2",     label: "MEV+2 | RPE 7.5",        rpe: 7.5,  rir: 2.5,  setsAdd: 1, isDeload: false, ...COLORS["MEV+2"] },
  { week: 7,  phase: "MAV",       label: "MAV | RPE 8",            rpe: 8,    rir: 2,    setsAdd: 2, isDeload: false, ...COLORS["MAV"] },
  { week: 8,  phase: "MAV+2",     label: "MAV+2 | RPE 8.5",        rpe: 8.5,  rir: 1.5,  setsAdd: 3, isDeload: false, ...COLORS["MAV+2"] },
  { week: 9,  phase: "MRV",       label: "MRV | RPE 9",            rpe: 9,    rir: 1,    setsAdd: 4, isDeload: false, ...COLORS["MRV"] },
  { week: 10, phase: "DELOAD",    label: "DELOAD",                  rpe: 6,    rir: null, setsAdd: 0, isDeload: true,  ...COLORS["DELOAD"] },
  { week: 11, phase: "MAV",       label: "MAV | RPE 8",            rpe: 8,    rir: 2,    setsAdd: 2, isDeload: false, ...COLORS["MAV"] },
  { week: 12, phase: "MAV+2",     label: "MAV+2 | RPE 8.5",        rpe: 8.5,  rir: 1.5,  setsAdd: 3, isDeload: false, ...COLORS["MAV+2"] },
  { week: 13, phase: "MRV",       label: "MRV | RPE 9",            rpe: 9,    rir: 1,    setsAdd: 4, isDeload: false, ...COLORS["MRV"] },
  { week: 14, phase: "MRV+2",     label: "MRV+2 | RPE 9.5",        rpe: 9.5,  rir: 0.5,  setsAdd: 5, isDeload: false, ...COLORS["MRV+2"] },
  { week: 15, phase: "DELOAD",    label: "DELOAD COMPLETO",         rpe: 6,    rir: null, setsAdd: 0, isDeload: true,  ...COLORS["DELOAD"] },
  { week: 16, phase: "TRANSICAO", label: "TRANSIÇÃO | RPE 8",      rpe: 8,    rir: 2,    setsAdd: 2, isDeload: false, isTransition: true, ...COLORS["TRANSICAO"], note: "Última semana — avaliar adaptações e planejar próximo ciclo." },
];

// Mesociclos visuais (3 blocos)
export const MESOCYCLE_BLOCKS: { label: string; weeks: number[] }[] = [
  { label: "Mesociclo 1", weeks: [1, 2, 3, 4, 5] },
  { label: "Mesociclo 2", weeks: [6, 7, 8, 9, 10] },
  { label: "Mesociclo 3", weeks: [11, 12, 13, 14, 15, 16] },
];

export const PROTOCOL_START_DATE = new Date(2026, 4, 3); // 03/05/2026 (mês 0-indexed, meia-noite local)

// Conta a diferença em DIAS CIVIS LOCAIS (Y/M/D), independente de fuso/DST.
// Ex.: 03/05 23:59 → 04/05 00:01 = 1 dia, mesmo com offsets diferentes.
function diffLocalDays(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  // 86_400_000 é seguro porque ambas datas estão à 00:00 local;
  // arredondamos para neutralizar variação de DST (±1h).
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function getCurrentWeekFromDate(start: Date = PROTOCOL_START_DATE, now: Date = new Date()): number {
  const diffDays = diffLocalDays(start, now);
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(week, 1), 16);
}

export function nextDeloadInDays(currentWeek: number, start: Date = PROTOCOL_START_DATE, now: Date = new Date()): number | null {
  const deloadWeeks = [5, 10, 15];
  const next = deloadWeeks.find((w) => w > currentWeek);
  if (!next) return null;
  // Início da semana de deload no calendário local
  const targetStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + (next - 1) * 7);
  const diff = diffLocalDays(now, targetStart);
  return Math.max(diff, 0);
}


// Aplica progressão dinâmica em uma estrutura de exercício original
export interface ExerciseStructure {
  feeder_sets?: any[];
  top_set?: { sets?: any; reps?: any; rpe?: any; rir?: any; notes?: any; rest?: any };
  backoff_sets?: { sets?: any; reps?: any; load_reduction?: any; rpe?: any; rir?: any; notes?: any; rest?: any };
  work_sets?: { sets?: any; reps?: any; rpe?: any; rir?: any; notes?: any; rest?: any };
}

const toNum = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const m = String(v).match(/(\d+(?:[.,]\d+)?)/);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
};

export function applyWeekProgression(struct: ExerciseStructure, wp: WeekPhase): ExerciseStructure {
  if (!struct) return struct;

  // DELOAD: remove feeders e back-off, reduz trabalho
  if (wp.isDeload) {
    const workBaseSets = toNum(struct.work_sets?.sets) ?? 3;
    const workSetsDeload = Math.max(1, Math.floor(workBaseSets * 0.5));
    return {
      feeder_sets: [],
      top_set: struct.top_set
        ? { ...struct.top_set, sets: 1, rpe: 6, rir: null, notes: "50% da carga. Foco em técnica e mobilidade. Não forçar intensidade." }
        : undefined,
      backoff_sets: undefined,
      work_sets: struct.work_sets
        ? { ...struct.work_sets, sets: workSetsDeload, rpe: 6, rir: null, notes: "Reduzir 20% da carga. Sem falha. Foco em técnica." }
        : undefined,
    };
  }

  const addSets = (base: any) => {
    const n = toNum(base);
    if (n === null) return base;
    return n + wp.setsAdd;
  };

  const noteForTop = `Se RPE real < ${wp.rpe}: +2,5kg próxima semana`;
  const noteForWork = "Progrida quando atingir teto da faixa com RPE abaixo do prescrito";
  const transitionNote = wp.isTransition ? " · Última semana — avaliar adaptações." : "";

  return {
    feeder_sets: struct.feeder_sets,
    top_set: struct.top_set
      ? { ...struct.top_set, rpe: wp.rpe, rir: wp.rir, notes: noteForTop + transitionNote }
      : undefined,
    backoff_sets: struct.backoff_sets
      ? { ...struct.backoff_sets, sets: addSets(struct.backoff_sets.sets), rpe: wp.rpe, rir: wp.rir, notes: noteForWork + transitionNote }
      : undefined,
    work_sets: struct.work_sets
      ? { ...struct.work_sets, sets: addSets(struct.work_sets.sets), rpe: wp.rpe, rir: wp.rir, notes: noteForWork + transitionNote }
      : undefined,
  };
}
