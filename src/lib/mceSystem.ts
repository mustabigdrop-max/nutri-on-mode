import type { PillarKey } from "@/data/mceData";

export type ScoreRow = { created_at: string; score_m: number; score_c: number; score_e: number };
export type EventRow = { exercise_key: string; completed_at: string };

export type CheckinRow = {
  checkin_date: string;
  sleep_quality: number;
  stress_level: number;
  nutrition_adherence: number;
  hydration: number;
  movement: number;
  focus_clarity: number;
};

export type CheckinFieldKey = Exclude<keyof CheckinRow, "checkin_date">;

export const CHECKIN_FIELDS: { key: CheckinFieldKey; label: string; pillar: PillarKey; invert?: boolean }[] = [
  { key: "focus_clarity", label: "Foco / Clareza mental", pillar: "M" },
  { key: "stress_level", label: "Nível de estresse", pillar: "M", invert: true },
  { key: "nutrition_adherence", label: "Aderência nutricional", pillar: "C" },
  { key: "hydration", label: "Hidratação", pillar: "C" },
  { key: "movement", label: "Movimento / Treino", pillar: "E" },
  { key: "sleep_quality", label: "Qualidade do sono", pillar: "E" },
];

export const MCE_LEVELS = [
  { min: 0, max: 30, name: "INICIANTE", title: "Reconhecendo o padrão", color: "#EF4444" },
  { min: 31, max: 50, name: "CONSCIENTE", title: "Vendo o sistema", color: "#F59E0B" },
  { min: 51, max: 70, name: "PRATICANTE", title: "Construindo o hábito", color: "#00D4FF" },
  { min: 71, max: 85, name: "CONSISTENTE", title: "O comportamento virou identidade", color: "#00FF88" },
  { min: 86, max: 100, name: "ELITE", title: "Transformação é sistema", color: "#A78BFA" },
] as const;

export type MceLevel = (typeof MCE_LEVELS)[number];

export const LEVEL_REWARD: Record<string, string> = {
  INICIANTE: "Ritual do Despertar (Audio Academy)",
  CONSCIENTE: "Breathwork · Reset de 5 minutos",
  PRATICANTE: "Masterclass · Arquitetura de Hábito",
  CONSISTENTE: "Masterclass · Identidade e Execução",
  ELITE: "Série completa · Sistema Operacional Humano",
};

export function levelFor(score: number): { level: MceLevel; next: MceLevel | null; progress: number } {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const idx = MCE_LEVELS.findIndex((l) => s >= l.min && s <= l.max);
  const level = MCE_LEVELS[idx < 0 ? 0 : idx];
  const next = MCE_LEVELS[idx + 1] ?? null;
  const span = level.max - level.min || 1;
  const progress = next ? Math.round(((s - level.min) / span) * 100) : 100;
  return { level, next, progress: Math.max(0, Math.min(100, progress)) };
}

// ── Check-in scoring ────────────────────────────────────────────────────────
export function dailyScoresFromCheckin(row: Partial<CheckinRow>): Record<PillarKey, number> {
  const v = (n?: number) => Math.max(1, Math.min(10, Number(n) || 1));
  const stressInverted = 11 - v(row.stress_level);
  return {
    M: Math.round(((v(row.focus_clarity) + stressInverted) / 2) * 10),
    C: Math.round(((v(row.nutrition_adherence) + v(row.hydration)) / 2) * 10),
    E: Math.round(((v(row.movement) + v(row.sleep_quality)) / 2) * 10),
  };
}

export function rollingScores(
  checkins: CheckinRow[],
  fallback: Record<PillarKey, number> = { M: 50, C: 50, E: 50 },
  days = 7,
  anchor: Date = new Date(),
): Record<PillarKey, number> {
  const map = new Map<string, CheckinRow>();
  for (const c of checkins) map.set(c.checkin_date, c);

  const daily: Record<PillarKey, number[]> = { M: [], C: [], E: [] };
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const row = map.get(k);
    if (row) {
      const s = dailyScoresFromCheckin(row);
      daily.M.push(s.M);
      daily.C.push(s.C);
      daily.E.push(s.E);
    }
  }

  const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
  const out: Record<PillarKey, number> = {
    M: avg(daily.M) || fallback.M,
    C: avg(daily.C) || fallback.C,
    E: avg(daily.E) || fallback.E,
  };
  return out;
}

export function weekConsistency(checkins: CheckinRow[], anchor: Date = new Date()): boolean[] {
  const map = new Map<string, boolean>();
  for (const c of checkins) map.set(c.checkin_date, true);
  const out: boolean[] = [];
  const today = anchor.getDay();
  const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    out.push(map.has(dayKey(d)));
  }
  return out;
}

export const weekLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ── Heatmap ────────────────────────────────────────────────────────────────
export type HeatDay = { date: string; label: string; count: number; intensity: 0 | 1 | 2 | 3; crisis: boolean };

export const dayKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function buildHeatmap(events: EventRow[], scores: ScoreRow[], days = 90): HeatDay[] {
  const counts = new Map<string, number>();
  const crisis = new Set<string>();
  for (const e of events) {
    const k = dayKey(new Date(e.completed_at));
    counts.set(k, (counts.get(k) ?? 0) + 1);
    if (/sos|crise|emerg/i.test(e.exercise_key)) crisis.add(k);
  }
  for (const s of scores) {
    const k = dayKey(new Date(s.created_at));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const out: HeatDay[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = dayKey(d);
    const count = counts.get(k) ?? 0;
    const intensity: HeatDay["intensity"] = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;
    out.push({
      date: k,
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      count,
      intensity,
      crisis: crisis.has(k),
    });
  }
  return out;
}

export const HEAT_COLORS: Record<number, string> = {
  0: "rgba(255,255,255,0.05)",
  1: "rgba(0,255,136,0.22)",
  2: "rgba(0,255,136,0.5)",
  3: "rgba(0,255,136,0.9)",
};

// ── Evolution series (12 semanas) ──────────────────────────────────────────
export type WeekPoint = { week: string; M: number | null; C: number | null; E: number | null; media: number | null };

export function buildEvolution(scores: ScoreRow[], weeks = 12): WeekPoint[] {
  const sorted = [...scores].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  const today = new Date();
  const out: WeekPoint[] = [];
  let carry: { M: number; C: number; E: number } | null = null;

  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(today);
    end.setDate(today.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 7);
    const inWeek = sorted.filter((s) => {
      const t = +new Date(s.created_at);
      return t > +start && t <= +end;
    });
    if (inWeek.length) {
      const avg = (get: (s: ScoreRow) => number) =>
        Math.round(inWeek.reduce((a, s) => a + Number(get(s) ?? 0), 0) / inWeek.length);
      carry = { M: avg((s) => s.score_m), C: avg((s) => s.score_c), E: avg((s) => s.score_e) };
    }
    const point = carry;
    out.push({
      week: `S${weeks - i}`,
      M: point?.M ?? null,
      C: point?.C ?? null,
      E: point?.E ?? null,
      media: point ? Math.round((point.M + point.C + point.E) / 3) : null,
    });
  }
  return out;
}

// ── Micro-desafios diários ─────────────────────────────────────────────────
export type Challenge = { pillar: PillarKey; text: string };

const CHALLENGES: Record<PillarKey, string[]> = {
  M: [
    "Escreva em 1 frase por que você começou esse processo. Não precisa ser bonito. Só honesto.",
    "Liste 1 pensamento que te sabota. Escreva a resposta que você daria pra ele.",
    "Antes de dormir, nomeie 1 decisão de hoje que foi da sua identidade nova.",
    "Reserve 5 minutos em silêncio, sem tela. Só você e o próximo passo.",
  ],
  C: [
    "Prepare a refeição de amanhã HOJE à noite. Foto do prep = desafio cumprido.",
    "Deixe roupa de treino separada antes de dormir. Reduza o atrito.",
    "Registre todas as refeições de hoje — sem editar, sem julgar.",
    "Escolha 1 gatilho da sua rotina e remova o acesso fácil por 24h.",
  ],
  E: [
    "Faça 10 minutos de qualquer atividade física ANTES das 9h. Só movimento.",
    "Beba 500ml de água na primeira hora acordado.",
    "Durma 30 minutos mais cedo que ontem. Só isso.",
    "Complete o treino de hoje sem pular a última série.",
  ],
};

export function todayChallenge(scores: Record<PillarKey, number>, date = new Date()): Challenge {
  const weakest = (["M", "C", "E"] as PillarKey[]).reduce((a, b) => (scores[a] <= scores[b] ? a : b));
  const list = CHALLENGES[weakest];
  const seed = Math.floor(+new Date(dayKey(date)) / 86400000);
  return { pillar: weakest, text: list[seed % list.length] };
}

export const challengeKey = (date = new Date()) => `daily-challenge-${dayKey(date)}`;

export function challengeStreak(events: EventRow[]): number {
  const done = new Set(
    events.filter((e) => e.exercise_key.startsWith("daily-challenge-")).map((e) => e.exercise_key.replace("daily-challenge-", "")),
  );
  let streak = 0;
  const d = new Date();
  // hoje ainda pode não estar concluído — não quebra a sequência
  if (!done.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (done.has(dayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
