/**
 * Aderência do Desafio 90 Dias: taxa de check-in e taxa de conclusão do dia
 * por participante e por data, com ranking e filtros de período.
 */

export interface AdherenceLogLite {
  user_id: string;
  log_date: string;
  day_completed: boolean | null;
  checkin_at: string | null;
  points: number | null;
}

export interface AdherenceParticipantLite {
  id: string;
  user_id: string;
  full_name: string;
  tier: string;
  streak: number;
  mce_score: number;
}

export interface PeriodRange {
  start: string; // ISO date (inclusive)
  end: string; // ISO date (inclusive)
  label: string;
}

export const toISO = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export const todayISO = () => toISO(new Date());

export function shiftISO(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function eachDay(range: PeriodRange): string[] {
  const out: string[] = [];
  let cur = range.start;
  let guard = 0;
  while (cur <= range.end && guard++ < 400) {
    out.push(cur);
    cur = shiftISO(cur, 1);
  }
  return out;
}

export type PeriodPresetId = "7d" | "30d" | "90d" | "all" | "custom";

export const PERIOD_PRESETS: { id: PeriodPresetId; label: string; days: number | null }[] = [
  { id: "7d", label: "Última semana", days: 7 },
  { id: "30d", label: "Último mês", days: 30 },
  { id: "90d", label: "Últimos 90 dias", days: 90 },
  { id: "all", label: "Desafio inteiro", days: null },
];

/** Constrói o período a partir do preset, limitado pelas datas do desafio. */
export function buildPeriod(
  preset: PeriodPresetId,
  challenge: { start_date: string; end_date: string },
  custom?: { start: string; end: string },
): PeriodRange {
  const today = todayISO();
  const end = today < challenge.end_date ? today : challenge.end_date;
  if (preset === "custom" && custom?.start && custom?.end) {
    return { start: custom.start, end: custom.end, label: "Período personalizado" };
  }
  const p = PERIOD_PRESETS.find((x) => x.id === preset) ?? PERIOD_PRESETS[0];
  if (p.days === null) return { start: challenge.start_date, end, label: p.label };
  const start = shiftISO(end, -(p.days - 1));
  return { start: start < challenge.start_date ? challenge.start_date : start, end, label: p.label };
}

/** Período imediatamente anterior, do mesmo tamanho — usado para comparar evolução. */
export function previousPeriod(range: PeriodRange): PeriodRange {
  const size = eachDay(range).length;
  return {
    start: shiftISO(range.start, -size),
    end: shiftISO(range.start, -1),
    label: `${size} dia(s) anteriores`,
  };
}

export const inRange = (iso: string, r: PeriodRange) => iso >= r.start && iso <= r.end;

export interface ParticipantAdherence {
  participant_id: string;
  user_id: string;
  full_name: string;
  tier: string;
  streak: number;
  mce_score: number;
  expected: number;
  checkins: number;
  completions: number;
  checkinRate: number; // %
  completionRate: number; // %
  avgPoints: number;
}

export function participantAdherence(
  participants: AdherenceParticipantLite[],
  logs: AdherenceLogLite[],
  range: PeriodRange,
): ParticipantAdherence[] {
  const days = eachDay(range);
  const expected = Math.max(days.length, 1);
  const scoped = logs.filter((l) => inRange(l.log_date, range));

  return participants
    .map((p) => {
      const mine = scoped.filter((l) => l.user_id === p.user_id);
      const checkins = mine.length;
      const completions = mine.filter((l) => l.day_completed).length;
      const pts = mine.map((l) => l.points ?? 0);
      return {
        participant_id: p.id,
        user_id: p.user_id,
        full_name: p.full_name,
        tier: p.tier,
        streak: p.streak,
        mce_score: p.mce_score,
        expected,
        checkins,
        completions,
        checkinRate: Math.round((checkins / expected) * 100),
        completionRate: Math.round((completions / expected) * 100),
        avgPoints: pts.length ? Math.round(pts.reduce((s, v) => s + v, 0) / pts.length) : 0,
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate || b.checkinRate - a.checkinRate);
}

export interface DailyAdherence {
  date: string;
  checkins: number;
  completions: number;
  checkinRate: number;
  completionRate: number;
}

export function dailyAdherence(
  participants: AdherenceParticipantLite[],
  logs: AdherenceLogLite[],
  range: PeriodRange,
): DailyAdherence[] {
  const total = Math.max(participants.length, 1);
  const ids = new Set(participants.map((p) => p.user_id));
  return eachDay(range).map((date) => {
    const day = logs.filter((l) => l.log_date === date && ids.has(l.user_id));
    const completions = day.filter((l) => l.day_completed).length;
    return {
      date,
      checkins: day.length,
      completions,
      checkinRate: Math.round((day.length / total) * 100),
      completionRate: Math.round((completions / total) * 100),
    };
  });
}

export function adherenceSummary(rows: ParticipantAdherence[]) {
  const n = rows.length || 1;
  return {
    participants: rows.length,
    checkinRate: Math.round(rows.reduce((s, r) => s + r.checkinRate, 0) / n),
    completionRate: Math.round(rows.reduce((s, r) => s + r.completionRate, 0) / n),
    avgPoints: Math.round(rows.reduce((s, r) => s + r.avgPoints, 0) / n),
    zeroCheckin: rows.filter((r) => r.checkins === 0).length,
  };
}

export const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
