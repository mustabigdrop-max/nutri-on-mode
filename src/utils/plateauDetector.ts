// Sistema De-Output — Detector de Platô + Protocolos
// Base: Darkside Universidade

export type PlateauType =
  | "CARGA"
  | "VOLUME"
  | "PERFORMANCE"
  | "FADIGA"
  | "NENHUM";

export type PlateauSeverity = "LEVE" | "MODERADO" | "SEVERO";

export interface PlateauSignal {
  tipo: PlateauType;
  severidade: PlateauSeverity;
  exercicio?: string;
  semanas: number;
  descricao: string;
  evidencia: string;
}

export interface DeOutputProtocol {
  tipo: "DEOUTPUT" | "DELOAD_ATIVO" | "VARIACAO" | "REVERSA";
  nome: string;
  duracao: string;
  descricao: string;
  ajustes: {
    volume_pct: number;
    carga_pct: number;
    frequencia_pct: number;
    rir_ajuste: number;
  };
  exercicios_trocar: string[];
  instrucoes: string[];
  retorno: string;
}

export interface PlateauAnalysis {
  temPlatô: boolean;
  sinais: PlateauSignal[];
  score: number;
  protocolo: DeOutputProtocol | null;
}

export interface WorkoutSet {
  carga?: number | null;
  reps_executadas?: number | null;
  reps_realizadas?: number | null;
  rir_prescrito?: number | null;
  rir_executado?: number | null;
  rir_alvo?: number | null;
  rir_real?: number | null;
  created_at: string;
}

function getReps(s: WorkoutSet): number {
  return s.reps_executadas ?? s.reps_realizadas ?? 0;
}
function getRIRPrescrito(s: WorkoutSet): number | null {
  return s.rir_prescrito ?? s.rir_alvo ?? null;
}
function getRIRExecutado(s: WorkoutSet): number | null {
  return s.rir_executado ?? s.rir_real ?? null;
}

function groupSetsByWeek(
  sets: WorkoutSet[],
  weeks: number,
): Record<string, WorkoutSet[]> {
  const result: Record<string, WorkoutSet[]> = {};
  const now = Date.now();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  for (const set of sets) {
    const age = now - new Date(set.created_at).getTime();
    const week = Math.floor(age / msPerWeek);
    if (week >= weeks) continue;
    const key = `week_${String(week).padStart(2, "0")}`;
    result[key] = [...(result[key] ?? []), set];
  }
  return result;
}

function checkStagnation(values: number[]): { semanas: number; valor: number } {
  if (!values.length) return { semanas: 0, valor: 0 };
  let count = 1;
  const last = values[values.length - 1];
  for (let i = values.length - 2; i >= 0; i--) {
    if (Math.abs(values[i] - last) < 2.5) count++;
    else break;
  }
  return { semanas: count, valor: last };
}

function checkDecline(values: number[]): boolean {
  if (values.length < 3) return false;
  const recent = values.slice(-3);
  return recent[0] > recent[1] && recent[1] > recent[2];
}

export function detectPlateau(
  setsHistory: WorkoutSet[],
  exerciseName: string,
  weeks: number = 4,
): PlateauSignal[] {
  const sinais: PlateauSignal[] = [];
  if (!setsHistory || setsHistory.length < 6) return sinais;

  const byWeek = groupSetsByWeek(setsHistory, weeks);
  const weekKeys = Object.keys(byWeek).sort().reverse(); // oldest → newest
  if (weekKeys.length < 2) return sinais;

  // 1. CARGA estagnada
  const maxLoad = weekKeys.map((w) =>
    Math.max(...byWeek[w].map((s) => s.carga ?? 0)),
  );
  const loadStag = checkStagnation(maxLoad);
  if (loadStag.semanas >= 2) {
    sinais.push({
      tipo: "CARGA",
      severidade: loadStag.semanas >= 3 ? "SEVERO" : "MODERADO",
      exercicio: exerciseName,
      semanas: loadStag.semanas,
      descricao: `Carga estagnada há ${loadStag.semanas} semanas`,
      evidencia: `${loadStag.valor}kg por ${loadStag.semanas} semanas`,
    });
  }

  // 2. PERFORMANCE (volume-carga decrescente)
  const vl = weekKeys.map((w) =>
    byWeek[w].reduce((sum, s) => sum + (s.carga ?? 0) * getReps(s), 0),
  );
  if (checkDecline(vl)) {
    sinais.push({
      tipo: "PERFORMANCE",
      severidade: "MODERADO",
      exercicio: exerciseName,
      semanas: 2,
      descricao: "Volume-carga decrescente nas últimas semanas",
      evidencia: "Produto carga×reps em queda",
    });
  }

  // 3. FADIGA (RIR executado > prescrito)
  const fadigaWeeks = weekKeys
    .map((w) => {
      const sets = byWeek[w].filter(
        (s) => getRIRPrescrito(s) != null && getRIRExecutado(s) != null,
      );
      if (!sets.length) return 0;
      const avg =
        sets.reduce(
          (sum, s) =>
            sum + ((getRIRExecutado(s) ?? 0) - (getRIRPrescrito(s) ?? 0)),
          0,
        ) / sets.length;
      return avg;
    })
    .filter((d) => d > 0.5).length;

  if (fadigaWeeks >= 2) {
    sinais.push({
      tipo: "FADIGA",
      severidade: fadigaWeeks >= 3 ? "SEVERO" : "LEVE",
      exercicio: exerciseName,
      semanas: fadigaWeeks,
      descricao: "RIR executado acima do prescrito — sinal de fadiga",
      evidencia: `${fadigaWeeks} semanas com esforço abaixo do prescrito`,
    });
  }

  return sinais;
}

export function calcPlateauScore(sinais: PlateauSignal[]): number {
  if (!sinais.length) return 0;
  const weights: Record<PlateauType, Record<PlateauSeverity, number>> = {
    CARGA: { LEVE: 15, MODERADO: 30, SEVERO: 50 },
    PERFORMANCE: { LEVE: 20, MODERADO: 35, SEVERO: 55 },
    FADIGA: { LEVE: 25, MODERADO: 40, SEVERO: 60 },
    VOLUME: { LEVE: 10, MODERADO: 20, SEVERO: 35 },
    NENHUM: { LEVE: 0, MODERADO: 0, SEVERO: 0 },
  };
  const total = sinais.reduce(
    (sum, s) => sum + (weights[s.tipo]?.[s.severidade] ?? 0),
    0,
  );
  return Math.min(100, total);
}

export function selectDeOutputProtocol(
  sinais: PlateauSignal[],
  rir_atual: number,
  semana_meso: number,
  total_meso: number,
): DeOutputProtocol {
  const temFadiga = sinais.some((s) => s.tipo === "FADIGA");
  const temCarga = sinais.some((s) => s.tipo === "CARGA");
  const score = calcPlateauScore(sinais);
  const fimMeso = total_meso > 0 && semana_meso / total_meso >= 0.75;

  if (score >= 70 || (temFadiga && fimMeso)) {
    return {
      tipo: "DEOUTPUT",
      nome: "De-Output Clássico",
      duracao: "1 semana",
      descricao: "Redução drástica de volume para forçar supercompensação",
      ajustes: { volume_pct: -50, carga_pct: -20, frequencia_pct: 0, rir_ajuste: 2 },
      exercicios_trocar: [],
      instrucoes: [
        "Reduzir volume total em 50% — manter apenas séries de trabalho",
        "Reduzir carga em 20% mas manter a execução técnica perfeita",
        "RIR aumentado para 3 em todos os exercícios",
        "Focar na qualidade do movimento — não na intensidade",
        "Dormir mínimo 8h por noite durante a semana",
      ],
      retorno: "Reiniciar mesociclo com +1 série por exercício principal",
    };
  }

  if (temCarga && !temFadiga) {
    const exerciciosPlatô = sinais
      .filter((s) => s.tipo === "CARGA" && s.exercicio)
      .map((s) => s.exercicio!);
    return {
      tipo: "VARIACAO",
      nome: "Variação de Estímulo",
      duracao: "2-3 semanas",
      descricao: "Trocar exercícios principais para romper adaptação neural",
      ajustes: { volume_pct: 0, carga_pct: 0, frequencia_pct: 0, rir_ajuste: 0 },
      exercicios_trocar: exerciciosPlatô,
      instrucoes: [
        "Substituir exercícios estagnados por variantes diferentes",
        "Manter volume e intensidade — só mudar os exercícios",
        "Priorizar exercícios com perfil de resistência diferente do atual",
        "Reavalie após 2 semanas — progressão deve retornar",
      ],
      retorno: "Após 2-3 semanas retornar ao exercício original com nova carga",
    };
  }

  return {
    tipo: "DELOAD_ATIVO",
    nome: "Deload Ativo",
    duracao: "1 semana",
    descricao: "Manter frequência e movimento, reduzir carga e volume",
    ajustes: { volume_pct: -30, carga_pct: -30, frequencia_pct: 0, rir_ajuste: 1 },
    exercicios_trocar: [],
    instrucoes: [
      "Reduzir carga em 30% — manter a técnica intacta",
      "Reduzir volume em 30% — eliminar as últimas séries",
      "Manter a frequência de treino semanal",
      "Focar na qualidade do movimento e consciência muscular",
      "Usar a semana para trabalhar mobilidade e técnica",
    ],
    retorno: "Retornar ao volume anterior na semana seguinte",
  };
}

export function analyzePlateau(
  sets: WorkoutSet[],
  exerciseName: string,
  rir_atual: number = 2,
  semana_meso: number = 1,
  total_meso: number = 4,
): PlateauAnalysis {
  const sinais = detectPlateau(sets, exerciseName);
  const score = calcPlateauScore(sinais);
  return {
    temPlatô: score >= 30,
    sinais,
    score,
    protocolo:
      score >= 30
        ? selectDeOutputProtocol(sinais, rir_atual, semana_meso, total_meso)
        : null,
  };
}

export function buildPlateauInstruction(
  analyses: Record<string, PlateauAnalysis>,
): string {
  const emPlatô = Object.entries(analyses).filter(([, a]) => a.temPlatô);
  if (!emPlatô.length) return "";

  const items = emPlatô
    .map(([nome, a]) => {
      const proto = a.protocolo;
      if (!proto) return "";
      return `• ${nome}: score ${a.score} → ${proto.tipo} (volume ${proto.ajustes.volume_pct}%, carga ${proto.ajustes.carga_pct}%)`;
    })
    .filter(Boolean)
    .join("\n");

  return `
ALERTA DE PLATÔ — AJUSTAR PRESCRIÇÃO:
${items}

Para exercícios em platô:
- Reduzir conforme os percentuais acima
- Variar perfil de resistência e zona de reps
- Priorizar exercícios substitutos diferentes
- Manter RIR mais alto (mais conservador)
  `.trim();
}
