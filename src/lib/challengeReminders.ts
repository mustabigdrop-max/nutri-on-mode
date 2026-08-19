/**
 * Lembretes automáticos do Desafio 90 Dias.
 * O disparo é feito por WhatsApp (wa.me) a partir da fila calculada aqui,
 * respeitando a configuração do coach em `gym_challenges`.
 */

export interface ChallengeReminderConfig {
  reminders_enabled: boolean;
  reminder_checkin_time: string; // "19:00"
  reminder_meal_times: string[]; // ["12:30","20:30"]
  reminder_checkin_message: string | null;
  reminder_meal_message: string | null;
}

export const DEFAULT_REMINDER_CONFIG: ChallengeReminderConfig = {
  reminders_enabled: true,
  reminder_checkin_time: "19:00",
  reminder_meal_times: ["12:30", "20:30"],
  reminder_checkin_message: null,
  reminder_meal_message: null,
};

export type ReminderKind = "checkin" | "meals";

export interface ReminderTarget {
  participant_id: string;
  user_id: string;
  full_name: string;
  whatsapp: string | null;
  kind: ReminderKind;
  mealsDone: number;
  mealsTotal: number;
  streak: number;
  message: string;
}

const firstName = (n: string) => (n || "").trim().split(" ")[0] || "atleta";

const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

export const DEFAULT_CHECKIN_TEMPLATE =
  "Fala {nome}! Aqui é o Diogo Mello 👊\n\n" +
  "Seu check-in do Dia {dia}/90 do {desafio} ainda tá em aberto. " +
  "Leva 30 segundos: humor, água, treino e refeições.\n\n" +
  "👉 {link}\n\n" +
  "Transformação é sistema. @diogo.mell0 · nutrion.app.br";

export const DEFAULT_MEALS_TEMPLATE =
  "Fala {nome}! Diogo Mello aqui 👊\n\n" +
  "Você marcou {feitas}/{total} refeições hoje no {desafio}. " +
  "Fecha o dia certinho que o streak de {streak} dia(s) continua vivo.\n\n" +
  "👉 {link}\n\n" +
  "Transformação é sistema. @diogo.mell0 · nutrion.app.br";

export function buildReminderMessage(
  kind: ReminderKind,
  config: Partial<ChallengeReminderConfig>,
  vars: {
    nome: string;
    desafio: string;
    dia: number;
    link: string;
    feitas?: number;
    total?: number;
    streak?: number;
  },
) {
  const tpl =
    kind === "checkin"
      ? config.reminder_checkin_message?.trim() || DEFAULT_CHECKIN_TEMPLATE
      : config.reminder_meal_message?.trim() || DEFAULT_MEALS_TEMPLATE;
  return fill(tpl, {
    ...vars,
    nome: firstName(vars.nome),
    feitas: vars.feitas ?? 0,
    total: vars.total ?? 0,
    streak: vars.streak ?? 0,
  });
}

export interface ReminderParticipantLite {
  id: string;
  user_id: string;
  full_name: string;
  whatsapp: string | null;
  streak: number;
  meals_per_day: number;
}

export interface ReminderLogLite {
  user_id: string;
  meals_done: number[] | null;
  day_completed: boolean | null;
}

/**
 * Fila de lembretes do dia: quem não fez check-in e quem está com refeições em aberto.
 */
export function computeReminderQueue(
  participants: ReminderParticipantLite[],
  todayLogs: ReminderLogLite[],
  ctx: { challengeName: string; day: number; link: string; config: Partial<ChallengeReminderConfig> },
): ReminderTarget[] {
  const byUser = new Map(todayLogs.map((l) => [l.user_id, l]));
  const out: ReminderTarget[] = [];

  for (const p of participants) {
    const log = byUser.get(p.user_id);
    const mealsDone = log?.meals_done?.length ?? 0;
    const mealsTotal = p.meals_per_day || 5;
    const done = !!log?.day_completed;
    if (done) continue;

    const kind: ReminderKind = mealsDone > 0 ? "meals" : "checkin";
    out.push({
      participant_id: p.id,
      user_id: p.user_id,
      full_name: p.full_name,
      whatsapp: p.whatsapp,
      kind,
      mealsDone,
      mealsTotal,
      streak: p.streak,
      message: buildReminderMessage(kind, ctx.config, {
        nome: p.full_name,
        desafio: ctx.challengeName,
        dia: ctx.day,
        link: ctx.link,
        feitas: mealsDone,
        total: mealsTotal,
        streak: p.streak,
      }),
    });
  }

  return out.sort((a, b) => b.streak - a.streak);
}

/** Horário passou? Usado para saber se o lembrete do dia já está "vencido". */
export function reminderDue(time: string, now: Date = new Date()) {
  const [h, m] = (time || "19:00").split(":").map(Number);
  return now.getHours() * 60 + now.getMinutes() >= (h || 0) * 60 + (m || 0);
}

/** Pontuação do dia: refeições 40 · água 20 · treino 20 · humor 20. */
export function dayPoints(
  log: { meals_done?: number[] | null; water_ml?: number | null; training_done?: boolean | null; mood?: string | null },
  mealsPerDay: number,
) {
  const meals = Math.min((log.meals_done?.length ?? 0) / Math.max(mealsPerDay, 1), 1) * 40;
  const water = Math.min((log.water_ml ?? 0) / 3000, 1) * 20;
  const training = log.training_done ? 20 : 0;
  const mood = log.mood ? 20 : 0;
  return Math.round(meals + water + training + mood);
}
