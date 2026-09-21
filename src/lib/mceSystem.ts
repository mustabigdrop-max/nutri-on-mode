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
  notes?: string | null;
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
  { min: 0, max: 30, name: "SPARK", title: "A faísca acendeu. O sistema começou.", color: "#555566" },
  { min: 31, max: 50, name: "FOUNDATION", title: "A base está sendo construída.", color: "#8B6914" },
  { min: 51, max: 65, name: "RISING", title: "Em ascensão. Resultados aparecendo.", color: "#A0A0B0" },
  { min: 66, max: 75, name: "FORCE", title: "Força consolidada. Acima da média.", color: "#B8922A" },
  { min: 76, max: 85, name: "PRIME", title: "No auge. Poucos chegam aqui.", color: "#00D4FF" },
  { min: 86, max: 95, name: "TITAN", title: "Excepcional. Referência.", color: "#00D4FF" },
  { min: 96, max: 100, name: "APEX ELITE", title: "O topo absoluto.", color: "#FFFFFF" },
] as const;

export type MceLevel = (typeof MCE_LEVELS)[number];

export const LEVEL_REWARD: Record<string, string> = {
  SPARK: "Ritual do Despertar (Audio Academy)",
  FOUNDATION: "Reset de 5 minutos",
  RISING: "Arquitetura de Hábito",
  FORCE: "Identidade e Execução",
  PRIME: "Série completa · Sistema Operacional Humano",
  TITAN: "Rituais avançados MCE",
  "APEX ELITE": "Documentação do processo completo",
};

export type MceDailyNotes = {
  intention?: string;
  oneThing?: string;
  didProtocol?: boolean;
  resistance?: string;
  nightReview?: string;
  tomorrowAdjustment?: string;
  resetBlock?: string;
  manualScores?: Record<PillarKey, number>;
  updatedAt?: string;
};

export const emptyMceDailyNotes = (): MceDailyNotes => ({
  intention: "",
  oneThing: "",
  didProtocol: false,
  resistance: "",
  nightReview: "",
  tomorrowAdjustment: "",
  resetBlock: "",
  manualScores: { M: 7, C: 7, E: 7 },
});

export function parseMceDailyNotes(raw?: string | null): MceDailyNotes {
  if (!raw) return emptyMceDailyNotes();
  try {
    const parsed = JSON.parse(raw) as MceDailyNotes;
    return { ...emptyMceDailyNotes(), ...parsed, manualScores: { ...emptyMceDailyNotes().manualScores, ...parsed.manualScores } };
  } catch {
    return { ...emptyMceDailyNotes(), nightReview: raw };
  }
}

export function clampNoteScore(value: number | undefined): number {
  return Math.max(0, Math.min(10, Number(value ?? 0)));
}

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
  const notes = parseMceDailyNotes(row.notes);
  const manual = notes.manualScores;
  if (manual) {
    return {
      M: clampNoteScore(manual.M) * 10,
      C: clampNoteScore(manual.C) * 10,
      E: clampNoteScore(manual.E) * 10,
    };
  }
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

export const MCE_WEEKLY_CALENDAR = [
  { day: "SEG", pillar: "M", title: "Mentalidade", format: "Carrossel reflexivo ou legenda longa", prompt: "A mentalidade que mudou minha semana" },
  { day: "TER", pillar: "E", title: "Execução técnica", format: "Reel educativo", prompt: "APEX Diagnóstico ou Movement Score" },
  { day: "QUA", pillar: "C", title: "Comportamento", format: "Reel do dia a dia", prompt: "As micro-decisões que mudaram minha semana" },
  { day: "QUI", pillar: "E", title: "Execução técnica", format: "KINESIS, Showdown ou ciência", prompt: "Dados + prática" },
  { day: "SEX", pillar: "C", title: "Review comportamental", format: "Carrossel ou stories", prompt: "Meu MCE score da semana" },
  { day: "SÁB", pillar: "L", title: "Livre", format: "Bastidores", prompt: "Família, treino, rotina real" },
  { day: "DOM", pillar: "M", title: "Preparação", format: "Story reflexivo ou carrossel", prompt: "Minha intenção essa semana" },
] as const;

export const MCE_COMPASS_QUESTIONS = [
  "Por quem você faz isso quando o motivo pessoal não basta?",
  "Que exemplo você quer deixar visível na sua casa?",
  "O que você não aceita mais repetir nos próximos 12 meses?",
  "Qual bloco mínimo você consegue cumprir mesmo no pior dia?",
  "Que frase resume a pessoa que você está construindo?",
] as const;

export const MCE_RETOMADA_PHASES = [
  { phase: 0, label: "RECONHECIMENTO", days: "agora", score: "M/C/E livre", rule: "Parei. Dado registrado.", goal: "Identificar qual pilar falhou primeiro e escolher um bloco possível." },
  { phase: 1, label: "PRIMEIRO BLOCO", days: "dias 1–3", score: "M=5 · C=5 · E=3", rule: "A retomada nunca começa com tudo.", goal: "Três dias fazendo uma coisa de menor atrito." },
  { phase: 2, label: "SEGUNDO BLOCO", days: "dias 4–7", score: "M=6 · C=6 · E=5", rule: "Só adiciona quando o primeiro bloco existe.", goal: "Sete dias com dois blocos simples." },
  { phase: 3, label: "SISTEMA COMPLETO", days: "dias 8–21", score: "M=7 · C=7 · E=7", rule: "Reabre STRATUM e NutriPlan sem radicalizar.", goal: "Protocolo 24H completo e streak reconstruído." },
  { phase: 4, label: "DOCUMENTAÇÃO", days: "dia 21+", score: "conteúdo real", rule: "O durante também é prova social.", goal: "Documentar o que fez parar, voltar e aprender." },
] as const;

export const MCE_VOICE_TRIGGERS = [
  { event: "Streak 7 dias", message: "Reconhecimento direto: o sistema voltou a rodar." },
  { event: "Score cai 3 dias", message: "Apoio sem culpa: um bloco de cada vez." },
  { event: "Deficit resolvido", message: "Celebração com dado real da reavaliação." },
  { event: "Aluno volta", message: "Acolhimento firme: voltou, isso é o que importa." },
] as const;

export function mceMirrorInsight(checkins: CheckinRow[]): string {
  if (checkins.length < 5) return "Registre pelo menos 5 dias para o Mirror mostrar um padrão confiável.";
  const byDay = new Map<number, number[]>();
  for (const row of checkins) {
    const date = new Date(`${row.checkin_date}T12:00:00`);
    const score = dailyScoresFromCheckin(row).C;
    const values = byDay.get(date.getDay()) ?? [];
    values.push(score);
    byDay.set(date.getDay(), values);
  }
  const averages = [...byDay.entries()].map(([day, values]) => ({ day, avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length) }));
  const lowest = averages.sort((a, b) => a.avg - b.avg)[0];
  if (!lowest) return "Ainda não há padrão suficiente no C para analisar.";
  const label = weekLabels[lowest.day] ?? "dia";
  return `Seu C mais baixo aparece em ${label}. Trate esse dia como ponto de atenção e reduza o atrito antes dele.`;
}

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
