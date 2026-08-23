/**
 * Lembretes automáticos do Desafio 30 Dias.
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
  "Seu check-in do Dia {dia}/30 do {desafio} ainda tá em aberto. " +
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
  opts?: { basic?: boolean },
) {
  // Modo básico (acesso free expirado): só check-in de humor e treino pontuam — máx 40.
  if (opts?.basic) {
    return (log.mood ? 20 : 0) + (log.training_done ? 20 : 0);
  }
  const meals = Math.min((log.meals_done?.length ?? 0) / Math.max(mealsPerDay, 1), 1) * 40;
  const water = Math.min((log.water_ml ?? 0) / 3000, 1) * 20;
  const training = log.training_done ? 20 : 0;
  const mood = log.mood ? 20 : 0;
  return Math.round(meals + water + training + mood);
}

/* ------------------------------------------------------------------ *
 * Lembretes escalonados (follow-up automático após o horário limite)
 * ------------------------------------------------------------------ */

export interface ChallengeEscalationConfig {
  reminder_deadline_time: string; // "21:00" — limite para o check-in do dia
  reminder_escalation_hours: number[]; // horas após o limite para cada etapa
  reminder_escalation_messages: string[]; // template por etapa (vazio = padrão)
}

export const DEFAULT_ESCALATION_HOURS = [0, 2, 14];

export const DEFAULT_ESCALATION_TEMPLATES = [
  "Fala {nome}! Aqui é o Diogo Mello 👊\n\n" +
    "Passou do horário e seu check-in do Dia {dia}/30 do {desafio} ainda tá em aberto. " +
    "São 30 segundos pra manter o streak de {streak} dia(s) vivo.\n\n👉 {link}\n\n" +
    "Transformação é sistema. @diogo.mell0 · nutrion.app.br",
  "{nome}, segundo toque 👊\n\n" +
    "Você tá a um clique de fechar o Dia {dia}/30 do {desafio} ({feitas}/{total} refeições marcadas). " +
    "Fecha agora que amanhã você começa no positivo.\n\n👉 {link}\n\n" +
    "Transformação é sistema. @diogo.mell0 · nutrion.app.br",
  "{nome}, o dia fechou sem seu check-in no {desafio}.\n\n" +
    "Sem drama: não é o dia perdido que quebra o processo, é a sequência de dias perdidos. " +
    "Hoje começa zerado — marca a primeira refeição agora.\n\n👉 {link}\n\n" +
    "Transformação é sistema. @diogo.mell0 · nutrion.app.br",
];

export const DEFAULT_ESCALATION_CONFIG: ChallengeEscalationConfig = {
  reminder_deadline_time: "21:00",
  reminder_escalation_hours: DEFAULT_ESCALATION_HOURS,
  reminder_escalation_messages: [],
};

const minutesOf = (t: string) => {
  const [h, m] = (t || "21:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Etapa de escalada devida agora (1-based). 0 = ainda dentro do prazo.
 * Etapas com horas negativas/0 disparam no próprio limite.
 */
export function dueEscalationLevel(
  cfg: Partial<ChallengeEscalationConfig>,
  now: Date = new Date(),
) {
  const steps = (cfg.reminder_escalation_hours?.length
    ? cfg.reminder_escalation_hours
    : DEFAULT_ESCALATION_HOURS
  )
    .slice()
    .sort((a, b) => a - b);
  const deadline = minutesOf(cfg.reminder_deadline_time ?? "21:00");
  const nowMin = now.getHours() * 60 + now.getMinutes();
  // etapas depois da meia-noite contam como "dia seguinte"
  let level = 0;
  steps.forEach((h, i) => {
    const at = deadline + h * 60;
    const sameDay = at < 24 * 60 ? nowMin >= at : nowMin >= at - 24 * 60 && nowMin < deadline;
    if (sameDay) level = i + 1;
  });
  return level;
}

export interface EscalatedTarget extends ReminderTarget {
  level: number;
  lastSentLevel: number;
}

/**
 * Fila escalonada: quem não concluiu o dia recebe a próxima etapa ainda não enviada.
 * `sentLevels` mapeia participant_id → maior nível já registrado hoje.
 */
export function computeEscalationQueue(
  participants: ReminderParticipantLite[],
  todayLogs: ReminderLogLite[],
  sentLevels: Record<string, number>,
  ctx: {
    challengeName: string;
    day: number;
    link: string;
    config: Partial<ChallengeEscalationConfig>;
    now?: Date;
  },
): EscalatedTarget[] {
  const level = dueEscalationLevel(ctx.config, ctx.now ?? new Date());
  if (!level) return [];
  const byUser = new Map(todayLogs.map((l) => [l.user_id, l]));
  const templates = ctx.config.reminder_escalation_messages ?? [];
  const out: EscalatedTarget[] = [];

  for (const p of participants) {
    const log = byUser.get(p.user_id);
    if (log?.day_completed) continue;
    const lastSentLevel = sentLevels[p.id] ?? 0;
    if (lastSentLevel >= level) continue;

    const mealsDone = log?.meals_done?.length ?? 0;
    const mealsTotal = p.meals_per_day || 5;
    const tpl =
      templates[level - 1]?.trim() ||
      DEFAULT_ESCALATION_TEMPLATES[Math.min(level, DEFAULT_ESCALATION_TEMPLATES.length) - 1];

    out.push({
      participant_id: p.id,
      user_id: p.user_id,
      full_name: p.full_name,
      whatsapp: p.whatsapp,
      kind: "checkin",
      mealsDone,
      mealsTotal,
      streak: p.streak,
      level,
      lastSentLevel,
      message: fill(tpl, {
        nome: firstName(p.full_name),
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
