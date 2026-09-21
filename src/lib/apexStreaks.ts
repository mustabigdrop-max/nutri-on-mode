// ARSENAL VIRAL — STREAKS DO nutriON
// Streak = dias consecutivos com sessão de treino registrada e concluída.
// Dias de descanso prescritos não quebram o streak (também não contam como treino).
// Deload e feeder contam como treino. Homework do PRAXIS não conta.

export interface WorkoutLog {
  log_date: string;
  workout_type: string | null;
  completed: boolean | null;
}

export interface StreakMilestone {
  dias: number;
  badge: string;
  titulo: string;
  mensagem: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { dias: 7, badge: "🔥×7", titulo: "IGNIÇÃO", mensagem: "7 dias seguidos! A consistência começou a falar." },
  { dias: 14, badge: "🔥×14", titulo: "EM CHAMAS", mensagem: "14 dias! Seu corpo já está se adaptando ao ritmo." },
  { dias: 21, badge: "🔥×21", titulo: "HÁBITO", mensagem: "21 dias — a ciência diz que o hábito se formou. Você provou." },
  { dias: 30, badge: "🔥×30", titulo: "MAQUINÁRIO", mensagem: "30 dias. Você é uma máquina. Isso não é sorte, é sistema." },
  { dias: 60, badge: "🔥×60", titulo: "IMPARÁVEL", mensagem: "60 dias seguidos. Pouquíssimos alunos chegam aqui." },
  { dias: 90, badge: "🔥×90", titulo: "LENDA", mensagem: "90 dias. Você é referência. Seu antes/depois conta uma história." },
  { dias: 180, badge: "🔥×180", titulo: "TITÂNIO", mensagem: "6 meses sem falhar. Nível de disciplina militar." },
  { dias: 365, badge: "🔥×365", titulo: "APEX IMMORTAL", mensagem: "365 dias. 1 ano. Sem interrupção. Você é o sistema." },
];

const REST_RE = /rest|descanso|off|folga/i;
const HOMEWORK_RE = /homework/i;

function isTreino(log: WorkoutLog): boolean {
  if (!log.completed) return false;
  const tipo = log.workout_type || "";
  if (REST_RE.test(tipo) || HOMEWORK_RE.test(tipo)) return false;
  return true;
}

function isDescanso(log: WorkoutLog): boolean {
  return REST_RE.test(log.workout_type || "");
}

function diaISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface StreakResult {
  atual: number;
  recorde: number;
  totalTreinos: number;
  ultimoTreino: string | null;
  /** Milestone já alcançado mais alto. */
  milestone: StreakMilestone | null;
  proximoMilestone: StreakMilestone | null;
}

/**
 * Calcula o streak a partir dos logs reais. Dias sem nenhum registro quebram o streak;
 * dias marcados como descanso são neutros.
 */
export function computeStreak(logs: WorkoutLog[], hoje = new Date()): StreakResult {
  const treinoDias = new Set<string>();
  const restDias = new Set<string>();
  logs.forEach((l) => {
    if (!l.log_date) return;
    const dia = l.log_date.slice(0, 10);
    if (isTreino(l)) treinoDias.add(dia);
    else if (isDescanso(l)) restDias.add(dia);
  });

  const totalTreinos = treinoDias.size;
  const ordenados = [...treinoDias].sort();
  const ultimoTreino = ordenados.length ? ordenados[ordenados.length - 1] : null;

  // Streak atual: varre para trás desde hoje.
  let atual = 0;
  const cursor = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  // Tolerância: se hoje ainda não treinou nem descansou, começa de ontem.
  const hojeISO = diaISO(cursor);
  if (!treinoDias.has(hojeISO) && !restDias.has(hojeISO)) cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 400; i++) {
    const dia = diaISO(cursor);
    if (treinoDias.has(dia)) atual += 1;
    else if (!restDias.has(dia)) break;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Recorde: maior sequência considerando descansos como neutros.
  let recorde = 0;
  if (ordenados.length) {
    const inicio = new Date(`${ordenados[0]}T12:00:00`);
    const fim = new Date(`${ordenados[ordenados.length - 1]}T12:00:00`);
    let seq = 0;
    for (const d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const dia = diaISO(d);
      if (treinoDias.has(dia)) {
        seq += 1;
        recorde = Math.max(recorde, seq);
      } else if (!restDias.has(dia)) {
        seq = 0;
      }
    }
  }
  recorde = Math.max(recorde, atual);

  const alcancados = STREAK_MILESTONES.filter((m) => atual >= m.dias);
  const milestone = alcancados.length ? alcancados[alcancados.length - 1] : null;
  const proximoMilestone = STREAK_MILESTONES.find((m) => m.dias > atual) ?? null;

  return { atual, recorde, totalTreinos, ultimoTreino, milestone, proximoMilestone };
}

/** Semana perfeita: todas as sessões prescritas da semana concluídas. */
export function semanaPerfeita(logs: WorkoutLog[], sessoesPrescritas: number, hoje = new Date()): boolean {
  if (!sessoesPrescritas || sessoesPrescritas < 1) return false;
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 6);
  const treinos = logs.filter((l) => {
    if (!isTreino(l)) return false;
    const d = new Date(`${l.log_date.slice(0, 10)}T12:00:00`);
    return d >= new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()) && d <= hoje;
  });
  const dias = new Set(treinos.map((l) => l.log_date.slice(0, 10)));
  return dias.size >= sessoesPrescritas;
}

/** Volta por cima: houve quebra anterior e o streak atual já voltou a 14+. */
export function voltaPorCima(logs: WorkoutLog[], streakAtual: number, recorde: number): boolean {
  return streakAtual >= 14 && recorde > streakAtual && logs.length > 0;
}
