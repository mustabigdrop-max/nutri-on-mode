// RIR (Reps In Reserve) — base Darkside / progressão mesociclo
// Controla proximidade à falha por série; progressão automática semanal.
export type RIRLevel = 0 | 1 | 2 | 3;

export interface RIRConfig {
  value: RIRLevel;
  label: string;
  descricao: string;
  cor: string;
  bg: string;
  border: string;
  intensidade: string;
  indicacao: string[];
  contraindicado: string[];
}

export const RIR_CONFIG: Record<RIRLevel, RIRConfig> = {
  3: {
    value: 3, label: "RIR 3", descricao: "3 reps antes da falha",
    cor: "#34D399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)",
    intensidade: "Baixa",
    indicacao: ["Semana 1 do mesociclo", "Exercícios multiarticulares pesados", "Atletas iniciantes e intermediários", "Primeiras semanas após deload"],
    contraindicado: [],
  },
  2: {
    value: 2, label: "RIR 2", descricao: "2 reps antes da falha",
    cor: "#FBBF24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)",
    intensidade: "Moderada",
    indicacao: ["Semanas 2-3 do mesociclo", "Maioria dos exercícios compostos", "Volume principal do treino"],
    contraindicado: [],
  },
  1: {
    value: 1, label: "RIR 1", descricao: "1 rep antes da falha",
    cor: "#FB923C", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.3)",
    intensidade: "Alta",
    indicacao: ["Semanas finais do mesociclo", "Exercícios isolados e máquinas", "Atletas avançados com boa percepção"],
    contraindicado: ["Levantamento terra pesado", "Agachamento livre com carga máxima"],
  },
  0: {
    value: 0, label: "RIR 0", descricao: "Falha concêntrica",
    cor: "#EF4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)",
    intensidade: "Máxima",
    indicacao: ["Exercícios isolados em máquinas", "Cabos e exercícios de baixo risco", "Técnicas especiais (drop-set, rest-pause)", "Último exercício da sessão"],
    contraindicado: ["Levantamento terra", "Agachamento livre", "Supino com barra pesado", "Qualquer exercício com risco de queda"],
  },
};

// Exercícios de alto risco — nunca RIR 0
export const HIGH_RISK_EXERCISES = [
  "levantamento terra",
  "agachamento livre",
  "supino reto barra",
  "desenvolvimento barra",
  "remada curvada barra",
  "agachamento búlgaro",
  "afundo búlgaro",
];

export function isHighRisk(exerciseName: string): boolean {
  if (!exerciseName) return false;
  const lower = exerciseName.toLowerCase();
  return HIGH_RISK_EXERCISES.some((h) => lower.includes(h));
}

// RIR mínimo permitido por exercício
export function getMinRIR(exerciseName: string): RIRLevel {
  return isHighRisk(exerciseName) ? 1 : 0;
}

// Progressão automática do RIR ao longo do mesociclo
export function calcWeekRIR(semanaAtual: number, totalSemanas: number): RIRLevel {
  if (!totalSemanas || totalSemanas <= 0) return 2;
  const progresso = semanaAtual / totalSemanas;
  if (progresso <= 0.25) return 3;
  if (progresso <= 0.5) return 2;
  if (progresso <= 0.75) return 1;
  return 0;
}

// RIR efetivo para um exercício (respeita mínimo do exercício)
export function resolveRIRForExercise(exerciseName: string, weekRIR: RIRLevel): RIRLevel {
  const min = getMinRIR(exerciseName);
  return (Math.max(weekRIR, min) as RIRLevel);
}

// Corretivos APEX nunca chegam à falha — mínimo RIR 1
export function getApexCorretivoRIR(weekRIR: RIRLevel): RIRLevel {
  return Math.max(weekRIR, 1) as RIRLevel;
}

// Instrução para o prompt do sistema
export function buildRIRInstruction(semanaAtual: number, totalSemanas: number): string {
  const rir = calcWeekRIR(semanaAtual, totalSemanas);
  const cfg = RIR_CONFIG[rir];
  const blocos: string[] = [
    `RIR DA SEMANA ATUAL — OBRIGATÓRIO:`,
    `Semana ${semanaAtual} de ${totalSemanas} → Prescrever RIR ${rir} (${cfg.descricao}) em todas as séries de trabalho.`,
  ];
  if (rir === 0) {
    blocos.push(
      `ATENÇÃO: RIR 0 (falha) APENAS em exercícios isolados e máquinas. Para exercícios compostos pesados (terra, agachamento, supino barra), usar mínimo RIR 1.`,
    );
  }
  if (rir <= 1) {
    blocos.push(
      `Semana de alta intensidade — reduzir volume total em 10-15% para compensar a proximidade à falha e controlar fadiga acumulada.`,
    );
  }
  blocos.push(`Indicar RIR de cada exercício no formato: "4×10 (RIR ${rir})" ao prescrever as séries.`);
  return blocos.join("\n");
}
