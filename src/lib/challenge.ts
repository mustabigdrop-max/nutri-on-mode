// Desafio 30 Dias — regras de plano base, ranking, fases e acesso free (14 dias)
// "Transformação é sistema."

export type Objetivo = "emagrecer" | "ganhar_massa" | "manter";
export type Porte = "leve" | "medio" | "pesado";
export type Tier = "free" | "premium" | "vip";

export const OBJETIVOS: { id: Objetivo; label: string; emoji: string }[] = [
  { id: "emagrecer", label: "Emagrecer", emoji: "🔥" },
  { id: "ganhar_massa", label: "Massa", emoji: "💪" },
  { id: "manter", label: "Manter", emoji: "⚖️" },
];

export const PORTES: { id: Porte; label: string }[] = [
  { id: "leve", label: "Leve" },
  { id: "medio", label: "Médio" },
  { id: "pesado", label: "Pesado" },
];

export const MEAL_OPTIONS = [4, 5, 6];

const BASE_KCAL: Record<Objetivo, Record<Porte, number>> = {
  emagrecer: { leve: 1500, medio: 1800, pesado: 2100 },
  ganhar_massa: { leve: 2300, medio: 2700, pesado: 3100 },
  manter: { leve: 1900, medio: 2200, pesado: 2500 },
};

const MACRO_SPLIT: Record<Objetivo, { p: number; c: number; g: number }> = {
  emagrecer: { p: 0.3, c: 0.42, g: 0.28 },
  ganhar_massa: { p: 0.27, c: 0.5, g: 0.23 },
  manter: { p: 0.28, c: 0.45, g: 0.27 },
};

export interface Targets {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export function computeTargets(objetivo: Objetivo, porte: Porte): Targets {
  const kcal = BASE_KCAL[objetivo][porte];
  const s = MACRO_SPLIT[objetivo];
  return {
    kcal,
    protein_g: Math.round((kcal * s.p) / 4),
    carbs_g: Math.round((kcal * s.c) / 4),
    fat_g: Math.round((kcal * s.g) / 9),
  };
}

export interface ChallengeMeal {
  index: number;
  code: string;
  name: string;
  emoji: string;
  time: string;
  share: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  items: string[];
  substitutions: string[];
}

interface MealTemplate {
  code: string;
  name: string;
  emoji: string;
  time: string;
  share: number;
  items: string[];
  substitutions: string[];
}

const TEMPLATES: Record<number, MealTemplate[]> = {
  4: [
    {
      code: "R1", name: "Café da manhã", emoji: "☀️", time: "08:00", share: 0.25,
      items: ["3 ovos mexidos", "2 fatias de pão integral", "1 fatia de queijo branco", "Café preto"],
      substitutions: ["Ovos → 1 scoop de whey + 1 iogurte natural", "Pão integral → 3 col. sopa de aveia", "Queijo → 1 col. sobremesa de pasta de amendoim"],
    },
    {
      code: "R2", name: "Almoço", emoji: "🍛", time: "12:30", share: 0.32,
      items: ["1 filé de frango grelhado (palma da mão)", "4 col. sopa de arroz", "1 concha de feijão", "Salada à vontade + 1 fio de azeite"],
      substitutions: ["Frango → patinho moído ou tilápia", "Arroz → batata-doce ou macarrão integral", "Feijão → lentilha ou grão-de-bico"],
    },
    {
      code: "R3", name: "Pré-treino", emoji: "⚡", time: "17:00", share: 0.18,
      items: ["1 fruta média", "1 pote de iogurte natural", "1 col. sopa de mel"],
      substitutions: ["Fruta → 2 fatias de pão + geleia", "Iogurte → 1 scoop de whey em água"],
    },
    {
      code: "R4", name: "Jantar", emoji: "🌙", time: "20:30", share: 0.25,
      items: ["1 posta de peixe ou 2 ovos + frango desfiado", "3 col. sopa de arroz ou 1 batata média", "Legumes cozidos"],
      substitutions: ["Peixe → carne magra", "Arroz → purê de abóbora", "Legumes → salada crua"],
    },
  ],
  5: [
    {
      code: "R1", name: "Café da manhã", emoji: "☀️", time: "08:00", share: 0.21,
      items: ["3 ovos mexidos", "2 fatias de pão integral", "1 fatia de queijo branco", "Café preto"],
      substitutions: ["Ovos → 1 scoop de whey + 1 iogurte", "Pão → 3 col. sopa de aveia", "Queijo → 1 col. de pasta de amendoim"],
    },
    {
      code: "R2", name: "Lanche da manhã", emoji: "🍎", time: "10:30", share: 0.09,
      items: ["1 fruta média", "1 punhado de castanhas (10 unidades)"],
      substitutions: ["Fruta → 1 iogurte natural", "Castanhas → 1 col. sobremesa de pasta de amendoim"],
    },
    {
      code: "R3", name: "Almoço", emoji: "🍛", time: "12:30", share: 0.29,
      items: ["1 filé de frango grelhado", "4 col. sopa de arroz", "1 concha de feijão", "Salada + azeite"],
      substitutions: ["Frango → patinho ou tilápia", "Arroz → batata-doce", "Feijão → lentilha"],
    },
    {
      code: "R4", name: "Pré-treino", emoji: "⚡", time: "17:00", share: 0.16,
      items: ["1 banana", "1 scoop de whey ou 1 iogurte proteico", "1 col. sopa de mel"],
      substitutions: ["Banana → 2 fatias de pão + geleia", "Whey → 3 claras + 1 ovo"],
    },
    {
      code: "R5", name: "Jantar", emoji: "🌙", time: "20:30", share: 0.25,
      items: ["1 posta de peixe ou carne magra", "3 col. sopa de arroz ou 1 batata", "Legumes cozidos"],
      substitutions: ["Peixe → omelete de 3 ovos", "Arroz → purê de abóbora", "Legumes → salada crua"],
    },
  ],
  6: [
    {
      code: "R1", name: "Café da manhã", emoji: "☀️", time: "07:30", share: 0.19,
      items: ["3 ovos mexidos", "2 fatias de pão integral", "Café preto"],
      substitutions: ["Ovos → whey + iogurte", "Pão → aveia"],
    },
    {
      code: "R2", name: "Lanche da manhã", emoji: "🍎", time: "10:00", share: 0.09,
      items: ["1 fruta", "1 punhado de castanhas"],
      substitutions: ["Fruta → iogurte natural"],
    },
    {
      code: "R3", name: "Almoço", emoji: "🍛", time: "12:30", share: 0.25,
      items: ["1 filé de frango", "4 col. sopa de arroz", "1 concha de feijão", "Salada + azeite"],
      substitutions: ["Frango → tilápia", "Arroz → batata-doce"],
    },
    {
      code: "R4", name: "Lanche da tarde", emoji: "🥤", time: "15:30", share: 0.11,
      items: ["1 iogurte proteico", "1 fatia de pão integral"],
      substitutions: ["Iogurte → whey em água", "Pão → 1 fruta"],
    },
    {
      code: "R5", name: "Pré-treino", emoji: "⚡", time: "17:30", share: 0.14,
      items: ["1 banana", "1 col. sopa de mel", "Café preto"],
      substitutions: ["Banana → pão + geleia"],
    },
    {
      code: "R6", name: "Jantar", emoji: "🌙", time: "20:30", share: 0.22,
      items: ["1 posta de peixe ou carne magra", "1 batata média", "Legumes"],
      substitutions: ["Peixe → omelete de 3 ovos", "Batata → purê de abóbora"],
    },
  ],
};

export function buildMealPlan(targets: Targets, mealsPerDay: number): ChallengeMeal[] {
  const tpl = TEMPLATES[mealsPerDay] || TEMPLATES[5];
  return tpl.map((m, i) => ({
    index: i,
    code: m.code,
    name: m.name,
    emoji: m.emoji,
    time: m.time,
    share: m.share,
    kcal: Math.round(targets.kcal * m.share),
    protein_g: Math.round(targets.protein_g * m.share),
    carbs_g: Math.round(targets.carbs_g * m.share),
    fat_g: Math.round(targets.fat_g * m.share),
    items: m.items,
    substitutions: m.substitutions,
  }));
}

export const OBJETIVO_LABEL: Record<string, string> = {
  emagrecer: "EMAGRECER",
  ganhar_massa: "GANHAR MASSA",
  manter: "MANTER",
};

export const TIER_BADGE: Record<string, { label: string; emoji: string }> = {
  free: { label: "FREE", emoji: "🆓" },
  premium: { label: "PREMIUM", emoji: "💎" },
  vip: { label: "VIP", emoji: "🏆" },
};

/** Duração oficial do desafio. */
export const CHALLENGE_DAYS = 30;
/** Dias de acesso completo (free) a partir da entrada no desafio. */
export const TRIAL_DAYS = 14;
/** Pontos máximos por dia por nível de acesso. */
export const MAX_POINTS_FULL = 100;
export const MAX_POINTS_BASIC = 40;

export function challengeDay(startDate?: string | null): number {
  if (!startDate) return 1;
  const start = new Date(`${startDate}T00:00:00`);
  const diff = Math.floor((Date.now() - start.getTime()) / 86400000) + 1;
  return Math.min(Math.max(diff, 1), CHALLENGE_DAYS);
}

export function challengePhase(day: number): { name: string; range: string } {
  if (day <= 10) return { name: "Ativação", range: "Dias 1–10" };
  if (day <= 20) return { name: "Consistência", range: "Dias 11–20" };
  return { name: "Sprint Final", range: "Dias 21–30" };
}

export interface AccessStatus {
  /** Acesso completo (trial ativo ou tier pago). */
  full: boolean;
  /** Caiu para o modo básico (só check-in). */
  basic: boolean;
  /** Tier pago (premium/vip) — nunca expira. */
  paid: boolean;
  daysLeft: number;
  maxPoints: number;
}

/**
 * Acesso do participante: os 14 primeiros dias após a entrada liberam tudo.
 * Depois disso, quem não ativou PREMIUM/VIP cai para o modo básico (máx 40 pts/dia).
 */
export function accessStatus(joinedAt?: string | null, tier?: string | null): AccessStatus {
  const paid = tier === "premium" || tier === "vip";
  if (paid) return { full: true, basic: false, paid, daysLeft: Infinity, maxPoints: MAX_POINTS_FULL };
  const start = joinedAt ? new Date(joinedAt).getTime() : Date.now();
  const used = Math.floor((Date.now() - start) / 86400000);
  const daysLeft = Math.max(TRIAL_DAYS - used, 0);
  const full = daysLeft > 0;
  return { full, basic: !full, paid, daysLeft, maxPoints: full ? MAX_POINTS_FULL : MAX_POINTS_BASIC };
}

export function levelBadge(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "OURO", color: "#E8A020" };
  if (score >= 75) return { label: "PRATA", color: "#c7d2da" };
  if (score >= 55) return { label: "BRONZE", color: "#c08457" };
  return { label: "INICIANTE", color: "#6b7280" };
}

export function medal(position: number): string {
  return position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : `${position}.`;
}

export function localDateISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
