/**
 * "RESULTADO + PROTOCOLO" — conecta o resultado físico real do coach com o
 * protocolo (APEX/TrainingON) que ele usou, puxando dados REAIS do treino
 * mais recente do próprio coach. Nunca inventa séries, cargas ou calorias:
 * quando o dado não existe, o campo fica vazio e o slide se adapta.
 */

import { supabase } from "@/integrations/supabase/client";
import { parseProtocolToDays, type ParsedDay } from "@/lib/parseProtocolMarkdown";

export type FocoResultado =
  | "pernas" | "costas" | "peito" | "ombros" | "bracos" | "shape" | "composicao" | "nutri";

export type FocoOption = { id: FocoResultado; emoji: string; label: string; tags: string[] };

/** `tags` usa os nomes canônicos de grupo muscular de PILL_DEDUPE (parseProtocolMarkdown.ts). */
export const FOCO_OPTIONS: FocoOption[] = [
  { id: "pernas", emoji: "🦵", label: "Pernas", tags: ["Quadríceps", "Glúteos", "Posterior", "Panturrilha"] },
  { id: "costas", emoji: "💪", label: "Costas", tags: ["Costas", "Dorsal", "Trapézio", "Lombar"] },
  { id: "peito", emoji: "🫁", label: "Peito", tags: ["Peitoral"] },
  { id: "ombros", emoji: "🏋", label: "Ombros", tags: ["Ombros"] },
  { id: "bracos", emoji: "💪", label: "Braços", tags: ["Bíceps", "Tríceps", "Antebraço"] },
  { id: "shape", emoji: "🔥", label: "Shape", tags: [] },
  { id: "composicao", emoji: "⚖️", label: "Composição Corporal", tags: [] },
  { id: "nutri", emoji: "🍽️", label: "Nutri Resultado", tags: [] },
];

export const APEX_PRINCIPIOS = [
  "Aquecimento específico por exercício (Feeder Sets)",
  "Top Set — 1 série máxima com RPE controlado",
  "Back-off Sets — volume com qualidade",
  "Tempo sob tensão definido a cada exercício",
  "RIR controlado — nunca falha total",
  "Progressão de carga semanal documentada",
];

export type DadosAquecimento = { nome: string; detail: string };
export type DadosExercicio = {
  nome: string;
  alvo?: string;
  tempo?: string;
  sets: { label?: string; detail: string }[];
  notas?: string;
};

export type DadosTreino = {
  focoId: FocoResultado;
  focoLabel: string;
  nomeTreino: string;
  duracao: string;
  grupos: string[];
  aquecimento: DadosAquecimento[];
  exercicios: DadosExercicio[];
  /** true quando achou um dia do protocolo batendo com o foco pedido. */
  matchExato: boolean;
  apex: { nome: string; principios: string[] };
  nutricao?: {
    metaDiaKcal?: number;
    treinoTipo?: string;
    proteinaG?: number;
    carboG?: number;
    /** Diferença real entre a meta de hoje e o menor dia (descanso) dos últimos 30 dias. */
    ajusteNutrySyncKcal?: number;
  };
};

/** Escolhe o dia do protocolo mais alinhado ao foco pedido (score = tags em comum). */
function melhorDia(dias: ParsedDay[], foco: FocoOption): { dia: ParsedDay; exato: boolean } {
  if (foco.tags.length) {
    let melhor: ParsedDay | null = null;
    let melhorScore = -1;
    for (const d of dias) {
      const score = (d.muscle_tags || []).filter((t) => foco.tags.includes(t)).length;
      if (score > melhorScore) {
        melhorScore = score;
        melhor = d;
      }
    }
    if (melhor && melhorScore > 0) return { dia: melhor, exato: true };
  }
  return { dia: dias[0], exato: false };
}

/**
 * Puxa o treino real mais recente do coach (próprio protocolo, não de cliente)
 * e devolve os dados prontos para o carrossel "Resultado + Protocolo".
 * Retorna null quando o coach ainda não tem protocolo estruturado no TrainingON.
 */
export async function getDadosTreino(focoId: FocoResultado): Promise<DadosTreino | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return null;

  const foco = FOCO_OPTIONS.find((f) => f.id === focoId) || FOCO_OPTIONS[0];

  const { data: proto } = await supabase
    .from("training_protocols")
    .select("protocol_text")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const parsed = proto?.protocol_text ? parseProtocolToDays(proto.protocol_text as unknown) : null;
  const dias = (parsed?.days || []).filter((d) => Array.isArray(d.exercises) && d.exercises.length > 0);
  if (!dias.length) return null;

  const { dia, exato } = melhorDia(dias, foco);

  // Nutrição do dia (best-effort — só entra se o dado realmente existir).
  const hoje = new Date().toISOString().slice(0, 10);
  const { data: nutri } = await supabase
    .from("daily_nutrition_protocol")
    .select("calorias_meta, treino_tipo")
    .eq("user_id", uid)
    .eq("data", hoje)
    .maybeSingle();

  return {
    focoId,
    focoLabel: `${foco.emoji} ${foco.label}`,
    nomeTreino: dia.session_title,
    duracao: dia.estimated_duration,
    grupos: dia.muscle_tags || [],
    aquecimento: (dia.warmup || []).slice(0, 3).map((w) => ({
      nome: w.name,
      detail: w.sets.map((s) => s.detail).filter(Boolean).join(" · ") || w.notes || "",
    })),
    exercicios: (dia.exercises || []).slice(0, 4).map((e) => ({
      nome: e.name,
      alvo: e.muscle_target,
      tempo: e.tempo,
      sets: e.sets.map((s) => ({ label: s.label, detail: s.detail })),
      notas: e.notes,
    })),
    matchExato: exato,
    apex: { nome: "APEX Training System", principios: APEX_PRINCIPIOS },
    nutricao:
      nutri && (nutri.calorias_meta || nutri.treino_tipo)
        ? { metaDiaKcal: nutri.calorias_meta ?? undefined, treinoTipo: nutri.treino_tipo ?? undefined }
        : undefined,
  };
}
