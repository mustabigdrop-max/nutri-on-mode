/**
 * "TREINO DE HOJE" — sincroniza com o TrainingON e devolve exatamente a sessão
 * que está na tela de exercícios do dia (mesmo protocolo, mesmo dia da semana).
 *
 * Nada é inventado: séries, cargas, tempo e metas só aparecem quando existem
 * no protocolo real do usuário. Campo sem dado fica vazio e o slide se adapta.
 */

import { supabase } from "@/integrations/supabase/client";
import { parseProtocolToDays, type ParsedDay } from "@/lib/parseProtocolMarkdown";

export type TreinoHojeSet = { label?: string; detail: string };
export type TreinoHojeExercicio = {
  nome: string;
  alvo?: string;
  tempo?: string;
  sets: TreinoHojeSet[];
  notas?: string;
};

export type TreinoHoje = {
  /** Nome da sessão como aparece no TrainingON. */
  nomeTreino: string;
  duracao: string;
  grupos: string[];
  /** Grupo/horário agendado para hoje em workout_schedule (quando existe). */
  agenda?: { tipo?: string; horario?: string; duracaoMin?: number };
  aquecimento: TreinoHojeExercicio[];
  exercicios: TreinoHojeExercicio[];
  /** true quando a sessão bateu com o agendamento de hoje. */
  sincronizado: boolean;
  diaSemana: string;
  dataLabel: string;
  nutricao?: {
    metaDiaKcal?: number;
    treinoTipo?: string;
    proteinaG?: number;
    carboG?: number;
  };
};

const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const mapExercicio = (e: {
  name: string;
  muscle_target?: string;
  tempo?: string;
  sets: { label?: string; detail: string }[];
  notes?: string;
}): TreinoHojeExercicio => ({
  nome: e.name,
  alvo: e.muscle_target,
  tempo: e.tempo,
  sets: (e.sets || []).map((s) => ({ label: s.label, detail: s.detail })).filter((s) => !!s.detail),
  notas: e.notes,
});

/** Escolhe o dia do protocolo que corresponde ao treino agendado para hoje. */
function escolherDia(dias: ParsedDay[], tipoAgenda?: string): { dia: ParsedDay; sincronizado: boolean } {
  const alvo = norm(tipoAgenda || "");
  if (alvo) {
    const termos = alvo.split(/[^a-z]+/).filter((t) => t.length > 3);
    let melhor: ParsedDay | null = null;
    let melhorScore = 0;
    for (const d of dias) {
      const texto = norm(`${d.session_title} ${(d.muscle_tags || []).join(" ")}`);
      const score = termos.filter((t) => texto.includes(t)).length;
      if (score > melhorScore) {
        melhorScore = score;
        melhor = d;
      }
    }
    if (melhor) return { dia: melhor, sincronizado: true };
  }
  return { dia: dias[0], sincronizado: false };
}

/**
 * Lê o treino de hoje do TrainingON do próprio usuário autenticado.
 * Retorna null quando não há protocolo estruturado.
 */
export async function getTreinoDeHoje(): Promise<TreinoHoje | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return null;

  const agora = new Date();
  const dow = agora.getDay();

  const [{ data: proto }, { data: agendaRows }] = await Promise.all([
    supabase
      .from("training_protocols")
      .select("protocol_text")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("workout_schedule")
      .select("workout_type, workout_time, duration_minutes")
      .eq("user_id", uid)
      .eq("day_of_week", dow)
      .order("slot", { ascending: true }),
  ]);

  const parsed = proto?.protocol_text ? parseProtocolToDays(proto.protocol_text as unknown) : null;
  const dias = (parsed?.days || []).filter((d) => Array.isArray(d.exercises) && d.exercises.length > 0);
  if (!dias.length) return null;

  const agendaHoje = (agendaRows || [])[0];
  const { dia, sincronizado } = escolherDia(dias, agendaHoje?.workout_type || undefined);

  const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
  const { data: nutri } = await supabase
    .from("daily_nutrition_protocol")
    .select("calorias_meta, treino_tipo, proteina_meta, carb_meta")
    .eq("user_id", uid)
    .eq("data", hoje)
    .maybeSingle();

  return {
    nomeTreino: dia.session_title,
    duracao: dia.estimated_duration,
    grupos: dia.muscle_tags || [],
    agenda: agendaHoje
      ? {
          tipo: agendaHoje.workout_type || undefined,
          horario: (agendaHoje.workout_time || "").slice(0, 5) || undefined,
          duracaoMin: agendaHoje.duration_minutes ?? undefined,
        }
      : undefined,
    aquecimento: (dia.warmup || []).slice(0, 4).map(mapExercicio),
    exercicios: (dia.exercises || []).slice(0, 6).map(mapExercicio),
    sincronizado,
    diaSemana: DIAS[dow],
    dataLabel: agora.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }),
    nutricao:
      nutri && (nutri.calorias_meta || nutri.treino_tipo)
        ? {
            metaDiaKcal: nutri.calorias_meta ?? undefined,
            treinoTipo: nutri.treino_tipo ?? undefined,
            proteinaG: nutri.proteina_meta ?? undefined,
            carboG: nutri.carb_meta ?? undefined,
          }
        : undefined,
  };
}
