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

/* ------------------------------------------------------------------ */
/* Cadência de marcos do Desafio 30 Dias                              */
/* ------------------------------------------------------------------ */

export interface ChallengeMilestone {
  day: number;
  id: string;
  label: string;
  goal: string;
  template: string;
}

const SIGN = "Transformação é sistema. @diogo.mell0 · nutrion.app.br";

/** Marcos oficiais: mensagem certa no dia certo, na voz do Coach. */
export const CHALLENGE_MILESTONES: ChallengeMilestone[] = [
  {
    day: 1,
    id: "boas_vindas",
    label: "D1 · Boas-vindas",
    goal: "Ativar o participante e explicar o acesso completo de 14 dias.",
    template:
      "Fala {nome}! Aqui é o Diogo Mello 👊\n\n" +
      "Você está dentro do {desafio}. Os próximos 14 dias são de acesso completo: plano em gramas, hidratação, MCE Academy e ranking.\n\n" +
      "Sua única tarefa hoje: fazer o primeiro check-in.\n👉 {link}\n\n" + SIGN,
  },
  {
    day: 3,
    id: "primeiro_ajuste",
    label: "D3 · Primeiro ajuste",
    goal: "Corrigir rota antes do hábito quebrar.",
    template:
      "Fala {nome}! Diogo aqui 👊\n\n" +
      "Dia 3 é onde a maioria afrouxa. Me responde uma coisa: o que travou mais até agora — comida, treino ou horário?\n\n" +
      "Eu ajusto seu plano com base nisso.\n👉 {link}\n\n" + SIGN,
  },
  {
    day: 7,
    id: "relatorio_semana1",
    label: "D7 · Fecha semana 1",
    goal: "Mostrar dados: check-ins, streak e primeira leitura de MCE.",
    template:
      "Fala {nome}! 👊\n\n" +
      "Semana 1 fechada no {desafio}. Streak atual: {streak} dia(s).\n\n" +
      "Sobe a foto de progresso e olha sua evolução — número não discute, ele mostra.\n👉 {link}\n\n" + SIGN,
  },
  {
    day: 10,
    id: "consistencia",
    label: "D10 · Fase Consistência",
    goal: "Reforçar que a fase muda e o volume aperta.",
    template:
      "Fala {nome}! 👊\n\n" +
      "Você entrou na fase Consistência do {desafio} (dias 11–20). Aqui não se busca motivação: se cumpre o sistema.\n\n" +
      "Meta da fase: nenhum dia sem check-in.\n👉 {link}\n\n" + SIGN,
  },
  {
    day: 13,
    id: "aviso_trial",
    label: "D13 · Aviso de acesso",
    goal: "Avisar que o acesso completo termina amanhã (conversão).",
    template:
      "Fala {nome}! Diogo aqui 👊\n\n" +
      "Amanhã fecha seu acesso completo do {desafio}. Sem PREMIUM você continua no desafio, mas cai pro check-in básico (máx 40 pts/dia) e o plano em gramas trava.\n\n" +
      "Ver os planos: {link_planos}\n\n" + SIGN,
  },
  {
    day: 14,
    id: "fim_trial",
    label: "D14 · Decisão",
    goal: "Converter para PREMIUM/VIP mantendo o histórico.",
    template:
      "Fala {nome}! 👊\n\n" +
      "Hoje é o dia da decisão no {desafio}. Seu histórico, streak de {streak} dia(s) e ranking estão salvos.\n\n" +
      "Ativa o PREMIUM e você volta a pontuar 100/dia até o dia 30: {link_planos}\n\n" + SIGN,
  },
  {
    day: 21,
    id: "sprint_final",
    label: "D21 · Sprint final",
    goal: "Empurrar os últimos 10 dias com foco em resultado visível.",
    template:
      "Fala {nome}! 👊\n\n" +
      "Sprint final do {desafio}: 10 dias pra fechar com o shape mudado e a foto de depois valendo a pena.\n\n" +
      "Nada de novidade agora — só execução.\n👉 {link}\n\n" + SIGN,
  },
  {
    day: 28,
    id: "foto_final",
    label: "D28 · Foto e medidas",
    goal: "Garantir before/after e dados finais para o relatório.",
    template:
      "Fala {nome}! 👊\n\n" +
      "Faltam 2 dias. Registra hoje: foto de progresso, peso atual e medidas. É isso que vira seu relatório de transformação.\n\n" +
      "👉 {link}\n\n" + SIGN,
  },
  {
    day: 30,
    id: "encerramento",
    label: "D30 · Encerramento",
    goal: "Celebrar, entregar o relatório e oferecer a continuidade.",
    template:
      "Fala {nome}! Diogo Mello 👊\n\n" +
      "Dia 30. Você fechou o {desafio} com streak de {streak} dia(s). Seu relatório de transformação está pronto.\n\n" +
      "Quem quer manter o resultado continua no sistema: {link_planos}\n\n" + SIGN,
  },
];

export function milestoneForDay(day: number): ChallengeMilestone | null {
  return CHALLENGE_MILESTONES.find((m) => m.day === day) ?? null;
}

export function nextMilestone(day: number): ChallengeMilestone | null {
  return CHALLENGE_MILESTONES.find((m) => m.day > day) ?? null;
}

export function buildMilestoneMessage(
  milestone: ChallengeMilestone,
  vars: { nome: string; desafio: string; streak: number; link: string; linkPlanos: string },
) {
  return fill(milestone.template, {
    nome: firstName(vars.nome),
    desafio: vars.desafio,
    streak: vars.streak,
    dia: milestone.day,
    link: vars.link,
    link_planos: vars.linkPlanos,
  });
}

/** Fila de marcos: todo participante ativo recebe a mensagem do dia. */
export function computeMilestoneQueue(
  participants: ReminderParticipantLite[],
  ctx: { challengeName: string; day: number; link: string; linkPlanos: string },
): ReminderTarget[] {
  const milestone = milestoneForDay(ctx.day);
  if (!milestone) return [];
  return participants.map((p) => ({
    participant_id: p.id,
    user_id: p.user_id,
    full_name: p.full_name,
    whatsapp: p.whatsapp,
    kind: "checkin" as ReminderKind,
    mealsDone: 0,
    mealsTotal: p.meals_per_day || 5,
    streak: p.streak,
    message: buildMilestoneMessage(milestone, {
      nome: p.full_name,
      desafio: ctx.challengeName,
      streak: p.streak,
      link: ctx.link,
      linkPlanos: ctx.linkPlanos,
    }),
  }));
}
