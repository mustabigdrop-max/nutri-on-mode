/**
 * "REFEIÇÃO + CIÊNCIA" — quando o coach posta foto de comida, este módulo puxa
 * os dados REAIS da refeição correspondente no NutriPlan (meal_plan_items),
 * o contexto do dia no NutrySync (daily_nutrition_protocol + meal_logs) e
 * cruza cada alimento com a ciência curada (MicrobiotaVault / NEXUS-BIO).
 *
 * Nada é inventado: campo sem dado real fica indefinido e o slide se adapta.
 */

import { supabase } from "@/integrations/supabase/client";
import { classifyMealVsWorkout, dowToMondayIdx } from "@/lib/trainingDayMap";
import { cienciaDaRefeicao, type CienciaAlimento } from "@/data/cienciaAlimentos";

export type SlotRefeicao = {
  key: string;
  ordem: string;
  nome: string;
  horaInicio: number;
  horaFim: number;
  horarioPadrao: string;
};

/** Faixas de horário → refeição do plano (mesmos meal_type do NutriPlan). */
export const SLOTS_REFEICAO: SlotRefeicao[] = [
  { key: "cafe_manha", ordem: "R1", nome: "Café da manhã", horaInicio: 4, horaFim: 9.5, horarioPadrao: "07:00" },
  { key: "lanche_manha", ordem: "R2", nome: "Lanche da manhã", horaInicio: 9.5, horaFim: 11.5, horarioPadrao: "10:00" },
  { key: "almoco", ordem: "R3", nome: "Almoço", horaInicio: 11.5, horaFim: 14.5, horarioPadrao: "12:30" },
  { key: "lanche_tarde", ordem: "R4", nome: "Lanche da tarde", horaInicio: 14.5, horaFim: 17, horarioPadrao: "16:00" },
  { key: "jantar", ordem: "R5", nome: "Jantar", horaInicio: 17, horaFim: 20.5, horarioPadrao: "19:30" },
  { key: "ceia", ordem: "R6", nome: "Ceia", horaInicio: 20.5, horaFim: 28, horarioPadrao: "22:00" },
];

export const slotPorHora = (d = new Date()): SlotRefeicao => {
  const h = d.getHours() + d.getMinutes() / 60;
  const hora = h < 4 ? h + 24 : h;
  return SLOTS_REFEICAO.find((s) => hora >= s.horaInicio && hora < s.horaFim) || SLOTS_REFEICAO[2];
};

export type AlimentoRefeicao = {
  nome: string;
  porcao?: string;
  kcal?: number;
  proteina?: number;
  carbo?: number;
  gordura?: number;
};

export type DadosRefeicao = {
  slotKey: string;
  /** "R3 — Almoço" */
  nome: string;
  horario: string;
  /** "PRÉ-TREINO" | "PÓS-TREINO" — só quando existe treino real agendado hoje. */
  tag?: string;
  treinoHoje?: { tipo?: string; horario?: string; duracaoMin?: number };
  calorias?: number;
  macros: { proteina?: number; carbo?: number; gordura?: number };
  alimentos: AlimentoRefeicao[];
  nutrisync?: {
    base?: number;
    ajusteTreino?: number;
    meta?: number;
    consumidoAteAgora?: number;
    restante?: number;
    treinoTipo?: string;
  };
  ciencia: { alimento: string; ciencia: CienciaAlimento }[];
};

const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : Number(v) || 0);

function weekStartOf(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return d.toISOString().split("T")[0];
}

/**
 * Puxa a refeição real do plano correspondente ao horário informado.
 * Retorna null quando o coach não tem plano alimentar cadastrado.
 */
export async function getDadosRefeicao(agora = new Date()): Promise<DadosRefeicao | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return null;

  const slot = slotPorHora(agora);
  const weekStart = weekStartOf(agora);
  const dayIndex = dowToMondayIdx(agora.getDay());

  const { data: itens } = await supabase
    .from("meal_plan_items")
    .select("meal_type, food_name, portion, kcal, protein_g, carbs_g, fat_g")
    .eq("user_id", uid)
    .eq("week_start", weekStart)
    .eq("day_index", dayIndex)
    .eq("meal_type", slot.key);

  const alimentos: AlimentoRefeicao[] = (itens || []).map((i) => ({
    nome: String(i.food_name || ""),
    porcao: i.portion || undefined,
    kcal: num(i.kcal) || undefined,
    proteina: num(i.protein_g) || undefined,
    carbo: num(i.carbs_g) || undefined,
    gordura: num(i.fat_g) || undefined,
  }));
  if (!alimentos.length) return null;

  const soma = (k: keyof AlimentoRefeicao) =>
    alimentos.reduce((t, a) => t + (typeof a[k] === "number" ? (a[k] as number) : 0), 0);
  const kcal = Math.round(soma("kcal"));

  // Treino real de hoje → define se a refeição é pré ou pós-treino.
  const { data: treinos } = await supabase
    .from("workout_schedule")
    .select("day_of_week, workout_type, workout_time, duration_minutes")
    .eq("user_id", uid)
    .eq("day_of_week", agora.getDay());
  const treino = (treinos || [])[0];
  const rel = treino ? classifyMealVsWorkout(slot.key, (treino.workout_time as string) || null) : null;

  // Contexto do dia (NutrySync).
  const hoje = agora.toISOString().slice(0, 10);
  const trinta = new Date(agora.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const { data: dia } = await supabase
    .from("daily_nutrition_protocol")
    .select("calorias_meta, treino_tipo")
    .eq("user_id", uid)
    .eq("data", hoje)
    .maybeSingle();
  const { data: historico } = await supabase
    .from("daily_nutrition_protocol")
    .select("calorias_meta")
    .eq("user_id", uid)
    .gte("data", trinta)
    .not("calorias_meta", "is", null);
  const base = (historico || [])
    .map((h) => num(h.calorias_meta))
    .filter((v) => v > 0)
    .sort((a, b) => a - b)[0];

  const { data: logs } = await supabase
    .from("meal_logs")
    .select("total_kcal")
    .eq("user_id", uid)
    .eq("meal_date", hoje);
  const consumido = (logs || []).reduce((t, l) => t + num(l.total_kcal), 0);

  const meta = dia?.calorias_meta ? num(dia.calorias_meta) : undefined;
  const ajuste = meta && base && meta - base > 0 ? meta - base : undefined;

  return {
    slotKey: slot.key,
    nome: `${slot.ordem} — ${slot.nome}`,
    horario: (treino?.workout_time as string | null)?.slice(0, 5) && rel ? slot.horarioPadrao : slot.horarioPadrao,
    tag: rel === "pre" ? "PRÉ-TREINO" : rel === "post" ? "PÓS-TREINO" : undefined,
    treinoHoje: treino
      ? {
          tipo: (treino.workout_type as string) || undefined,
          horario: ((treino.workout_time as string) || "").slice(0, 5) || undefined,
          duracaoMin: (treino.duration_minutes as number) || undefined,
        }
      : undefined,
    calorias: kcal || undefined,
    macros: {
      proteina: Math.round(soma("proteina")) || undefined,
      carbo: Math.round(soma("carbo")) || undefined,
      gordura: Math.round(soma("gordura")) || undefined,
    },
    alimentos,
    nutrisync:
      meta || consumido
        ? {
            base: ajuste && meta ? meta - ajuste : base || undefined,
            ajusteTreino: ajuste,
            meta,
            consumidoAteAgora: consumido ? Math.round(consumido) : undefined,
            restante: meta && consumido ? Math.round(meta - consumido) : undefined,
            treinoTipo: (dia?.treino_tipo as string) || (treino?.workout_type as string) || undefined,
          }
        : undefined,
    ciencia: cienciaDaRefeicao(alimentos),
  };
}
