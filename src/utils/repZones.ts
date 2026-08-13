// Sistema de Zonas de Repetição com ondulação automática
// Base: Darkside Universidade — "Zonas de Repetições"

import { calcWeekRIR } from "./rirSystem";
import { findExerciseProfile, type ResistanceProfile } from "./exerciseProfiles";

export type RepZone = 1 | 2 | 3 | 4 | 5;

export interface ZoneConfig {
  zona: RepZone;
  label: string;
  faixa: string;
  repsMin: number;
  repsMax: number;
  carga: string;
  adaptacao: string;
  uso: string;
  cor: string;
  bg: string;
  border: string;
  rirIdeal: number[];
}

export const ZONE_CONFIG: Record<RepZone, ZoneConfig> = {
  1: {
    zona: 1, label: "Zona 1", faixa: "1-5 reps", repsMin: 1, repsMax: 5,
    carga: "85-100% 1RM",
    adaptacao: "Força máxima + neural",
    uso: "Base de força para compostos",
    cor: "#A78BFA",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.3)",
    rirIdeal: [2, 3],
  },
  2: {
    zona: 2, label: "Zona 2", faixa: "6-8 reps", repsMin: 6, repsMax: 8,
    carga: "75-85% 1RM",
    adaptacao: "Força-hipertrofia miofibrilar",
    uso: "Compostos pesados — base do ciclo",
    cor: "#38BDF8",
    bg: "rgba(56,189,248,0.12)",
    border: "rgba(56,189,248,0.3)",
    rirIdeal: [1, 2],
  },
  3: {
    zona: 3, label: "Zona 3", faixa: "9-12 reps", repsMin: 9, repsMax: 12,
    carga: "65-75% 1RM",
    adaptacao: "Hipertrofia primária máxima",
    uso: "Zona principal Classic Physique",
    cor: "#B8922A",
    bg: "rgba(184,146,42,0.12)",
    border: "rgba(184,146,42,0.3)",
    rirIdeal: [1, 2],
  },
  4: {
    zona: 4, label: "Zona 4", faixa: "13-20 reps", repsMin: 13, repsMax: 20,
    carga: "50-65% 1RM",
    adaptacao: "Hipertrofia sarcoplasmática + pump",
    uso: "Isolados, finalizadores, BMFR",
    cor: "#FB923C",
    bg: "rgba(251,146,60,0.12)",
    border: "rgba(251,146,60,0.3)",
    rirIdeal: [0, 1],
  },
  5: {
    zona: 5, label: "Zona 5", faixa: "21-30+ reps", repsMin: 21, repsMax: 99,
    carga: "<50% 1RM",
    adaptacao: "Resistência + capilarização",
    uso: "Aquecimento, corretivos, técnicas",
    cor: "#34D399",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.3)",
    rirIdeal: [2, 3],
  },
};

export function detectZone(reps: number): RepZone {
  if (reps <= 5) return 1;
  if (reps <= 8) return 2;
  if (reps <= 12) return 3;
  if (reps <= 20) return 4;
  return 5;
}

export function detectZoneFromString(repsStr: string | number | undefined | null): RepZone {
  if (repsStr == null) return 3;
  const str = String(repsStr);
  const nums = str.match(/\d+/g)?.map(Number) ?? [10];
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return detectZone(Math.round(avg));
}

export function isRIRCompatibleWithZone(rir: number, zona: RepZone): boolean {
  return ZONE_CONFIG[zona].rirIdeal.includes(rir);
}

export function suggestRIRForZone(zona: RepZone): number {
  const ideais = ZONE_CONFIG[zona].rirIdeal;
  return ideais[Math.floor(ideais.length / 2)];
}

// ──────────────── Padrões de Ondulação ────────────────
export interface WavePattern {
  nome: string;
  descricao: string;
  semanas: {
    semana: number;
    sessoes: { dia: number; zonas: RepZone[] }[];
  }[];
}

export const WAVE_PATTERNS: Record<string, WavePattern> = {
  dup_classic: {
    nome: "Ondulação Diária (DUP)",
    descricao: "Cada sessão do mesmo grupo em zona diferente",
    semanas: Array.from({ length: 4 }, (_, s) => ({
      semana: s + 1,
      sessoes: [
        { dia: 1, zonas: [2, 3] },
        { dia: 3, zonas: [3, 4] },
        { dia: 5, zonas: [4, 5] },
      ],
    })),
  },
  weekly_linear: {
    nome: "Ondulação Semanal Linear",
    descricao: "Cada semana em uma zona — força → metabólico",
    semanas: [
      { semana: 1, sessoes: [{ dia: 1, zonas: [1, 2] }] },
      { semana: 2, sessoes: [{ dia: 1, zonas: [2, 3] }] },
      { semana: 3, sessoes: [{ dia: 1, zonas: [3, 4] }] },
      { semana: 4, sessoes: [{ dia: 1, zonas: [4, 5] }] },
    ],
  },
  bodybuilding_wave: {
    nome: "Ondulação Fisiculturismo",
    descricao: "Zona 3 base com sobrecarga nas adjacentes",
    semanas: [
      { semana: 1, sessoes: [{ dia: 1, zonas: [2, 3] }] },
      { semana: 2, sessoes: [{ dia: 1, zonas: [3, 3] }] },
      { semana: 3, sessoes: [{ dia: 1, zonas: [3, 4] }] },
      { semana: 4, sessoes: [{ dia: 1, zonas: [2, 3, 4] }] },
    ],
  },
};

export const DEFAULT_PATTERN_KEY = "bodybuilding_wave";

export function getWeekZones(semanaAtual: number, pattern: WavePattern): RepZone[] {
  // ciclar nas semanas do padrão
  const total = pattern.semanas.length;
  const idx = ((semanaAtual - 1) % total + total) % total;
  const semana = pattern.semanas[idx] ?? pattern.semanas[0];
  const allZonas = semana.sessoes.flatMap((s) => s.zonas);
  return [...new Set(allZonas)] as RepZone[];
}

// ──────────────── Validação Tripla ────────────────
export interface ExerciseTripleValidation {
  perfil: ResistanceProfile;
  zona: RepZone;
  rir: number;
  valido: boolean;
  avisos: string[];
}

export function validateTriple(
  exerciseName: string,
  reps: string | number | undefined | null,
  rir: number
): ExerciseTripleValidation {
  const profile = findExerciseProfile(exerciseName);
  const zona = detectZoneFromString(reps);
  const avisos: string[] = [];

  if (!isRIRCompatibleWithZone(rir, zona)) {
    avisos.push(`RIR ${rir} incomum para ${ZONE_CONFIG[zona].label}`);
  }

  if (profile?.perfil === "ALONGADO" && zona <= 2) {
    avisos.push("Perfil ALONGADO responde melhor em Z3-Z4 (mais ROM/tempo no alongado)");
  }

  return {
    perfil: (profile?.perfil ?? "CONSTANTE") as ResistanceProfile,
    zona,
    rir,
    valido: avisos.length === 0,
    avisos,
  };
}

// ──────────────── Prompt do sistema ────────────────
export function buildZoneInstruction(
  semanaAtual: number,
  totalSemanas: number,
  patternKey: string = DEFAULT_PATTERN_KEY
): string {
  const pattern = WAVE_PATTERNS[patternKey] ?? WAVE_PATTERNS[DEFAULT_PATTERN_KEY];
  const weekZones = getWeekZones(semanaAtual, pattern);
  const rir = calcWeekRIR(semanaAtual, totalSemanas);
  const zonesDesc = weekZones
    .map((z) => `${ZONE_CONFIG[z].label} (${ZONE_CONFIG[z].faixa} · ${ZONE_CONFIG[z].carga})`)
    .join(", ");

  const linhas: string[] = [];
  if (weekZones.includes(1) || weekZones.includes(2))
    linhas.push("• Compostos pesados: Zona 1-2 (força)");
  if (weekZones.includes(3)) linhas.push("• Principais: Zona 3 (9-12 reps) — hipertrofia");
  if (weekZones.includes(4)) linhas.push("• Isolados: Zona 4 (13-20 reps) — pump");
  if (weekZones.includes(5)) linhas.push("• Corretivos/finalizadores: Zona 5 (21-30 reps)");

  return [
    `ZONAS DE REPETIÇÃO — SEMANA ${semanaAtual}:`,
    `Padrão: ${pattern.nome}`,
    `Zonas desta sessão: ${zonesDesc}`,
    "",
    "REGRAS DE DISTRIBUIÇÃO:",
    ...linhas,
    "",
    `RIR desta semana: RIR ${rir}`,
    `Indicar zona e RIR em cada exercício. Ex: "Supino reto — 4×8 [Z2, RIR ${rir}]"`,
    "",
    "COMPATIBILIDADE ZONA × RIR:",
    "Z1-Z2 → RIR 2-3 | Z3 → RIR 1-2 | Z4 → RIR 0-1 | Z5 → RIR 2-3",
  ].join("\n");
}
