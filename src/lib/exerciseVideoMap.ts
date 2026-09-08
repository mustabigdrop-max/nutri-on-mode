import { supabase } from "@/integrations/supabase/client";
import { exerciseKey } from "@/lib/exerciseGuide";

const API = "https://oss.exercisedb.dev/api/v1/exercises";

export interface ExerciseVideo {
  type: "video" | "gif";
  url: string;
  nameEn?: string | null;
}

export interface VideoMappingRow {
  id: string;
  coach_id: string;
  exercise_name_pt: string;
  exercise_key: string;
  exercise_name_en: string | null;
  exercisedb_id: string | null;
  gif_url: string | null;
  custom_video_url: string | null;
  verified: boolean;
}

export interface ExerciseSuggestion {
  id: string;
  nome: string;
  gifUrl: string;
  alvo?: string;
  equipamento?: string;
}

/** Sugestões de tradução PT → EN (apenas sugerem a busca; nunca vinculam sozinhas). */
const TRADUCOES: Record<string, string> = {
  "prancha abdominal": "front plank",
  "prancha": "plank",
  "prancha lateral": "side plank",
  "puxada alta": "lat pulldown",
  "puxada frontal": "lat pulldown",
  "remada curvada": "barbell bent over row",
  "remada curvada com barra": "barbell bent over row",
  "remada unilateral": "dumbbell one arm row",
  "remada unilateral com halteres": "dumbbell one arm row",
  "remada baixa": "seated cable row",
  "remada cavalinho": "t bar row",
  "remada com elastico": "resistance band row",
  "elevacao lateral": "dumbbell lateral raise",
  "elevacao lateral com halteres": "dumbbell lateral raise",
  "elevacao frontal": "front raise",
  "crucifixo": "dumbbell fly",
  "crucifixo invertido": "machine reverse fly",
  "crucifixo invertido na maquina": "machine reverse fly",
  "voador na maquina": "pec deck fly",
  "crossover": "cable crossover",
  "abdominal": "crunch",
  "abdominal supra": "crunch",
  "abdominal supra na maquina": "machine crunch",
  "abdominal infra": "leg raise",
  "rotacao externa de ombro": "cable external rotation",
  "alongamento dinamico de tronco": "standing trunk rotation",
  "rotacao de tronco": "standing trunk rotation",
  "supino reto": "barbell bench press",
  "supino reto com barra": "barbell bench press",
  "supino inclinado": "incline bench press",
  "agachamento": "squat",
  "agachamento livre": "barbell squat",
  "agachamento bulgaro": "bulgarian split squat",
  "afundo": "lunge",
  "leg press": "leg press",
  "leg press 45": "leg press",
  "cadeira extensora": "leg extension machine",
  "mesa flexora": "lying leg curl machine",
  "cadeira flexora": "seated leg curl",
  "stiff": "barbell romanian deadlift",
  "stiff com barra": "barbell romanian deadlift",
  "levantamento terra": "deadlift",
  "hip thrust": "hip thrust",
  "elevacao pelvica": "glute bridge",
  "panturrilha": "calf raise",
  "panturrilha no smith": "smith machine calf raise",
  "panturrilha em pe": "standing calf raise",
  "rosca direta": "barbell curl",
  "rosca direta com barra": "barbell curl",
  "rosca alternada": "dumbbell curl",
  "rosca martelo": "hammer curl",
  "rosca scott": "preacher curl",
  "triceps pulley": "tricep pushdown cable",
  "triceps testa": "skull crusher",
  "triceps frances": "overhead tricep extension",
  "mergulho em paralelas": "chest dip",
  "desenvolvimento": "shoulder press",
  "desenvolvimento com halteres": "dumbbell shoulder press",
  "desenvolvimento militar": "overhead press",
  "encolhimento": "shrug",
  "barra fixa": "pull up",
  "flexao": "push up",
  "pullover": "dumbbell pullover",
  "pullover com halteres": "dumbbell pullover",
  "face pull": "face pull",
};

function plain(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Termo de busca sugerido em inglês (ou o próprio nome quando não há tradução). */
export function termoSugerido(nomePT: string): string {
  const base = plain(nomePT);
  if (TRADUCOES[base]) return TRADUCOES[base];
  let melhor = "";
  for (const chave of Object.keys(TRADUCOES)) {
    if (base.includes(chave) && chave.length > melhor.length) melhor = chave;
  }
  return melhor ? TRADUCOES[melhor] : base;
}

/** Busca na ExerciseDB: retorna SUGESTÕES para o coach aprovar. Nunca vincula sozinha. */
export async function buscarSugestoes(termo: string): Promise<ExerciseSuggestion[]> {
  const q = plain(termo);
  if (!q) return [];
  try {
    const res = await fetch(`${API}?name=${encodeURIComponent(q)}&limit=12`);
    if (!res.ok) return [];
    const json = await res.json();
    const lista: any[] = Array.isArray(json?.data) ? json.data : [];
    return lista
      .filter((x) => x?.gifUrl && x?.name)
      .map((x) => ({
        id: String(x.exerciseId || x.name),
        nome: String(x.name),
        gifUrl: String(x.gifUrl),
        alvo: Array.isArray(x.targetMuscles) ? x.targetMuscles.join(", ") : undefined,
        equipamento: Array.isArray(x.equipments) ? x.equipments.join(", ") : undefined,
      }));
  } catch {
    return [];
  }
}

/** Coach responsável: o próprio usuário quando é coach, ou o coach do aluno. */
export async function resolverCoachId(): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data: link } = await supabase
    .from("coach_patients")
    .select("coach_user_id")
    .eq("patient_user_id", uid)
    .limit(1)
    .maybeSingle();
  return (link as any)?.coach_user_id || uid;
}

/** Vídeo aprovado pelo coach. Sem aprovação → null (nunca exibir vídeo automático). */
export async function getVideoVerificado(
  exerciseName: string,
  coachId?: string | null,
): Promise<ExerciseVideo | null> {
  const key = exerciseKey(exerciseName);
  if (!key) return null;
  const cid = coachId ?? (await resolverCoachId());
  if (!cid) return null;
  const { data } = await supabase
    .from("exercise_video_mappings")
    .select("gif_url, custom_video_url, exercise_name_en")
    .eq("exercise_key", key)
    .eq("coach_id", cid)
    .eq("verified", true)
    .limit(1)
    .maybeSingle();
  const row = data as any;
  if (!row) return null;
  if (row.custom_video_url) return { type: "video", url: row.custom_video_url, nameEn: row.exercise_name_en };
  if (row.gif_url) return { type: "gif", url: row.gif_url, nameEn: row.exercise_name_en };
  return null;
}

/** Mapeamentos do coach para uma lista de exercícios (revisão em lote). */
export async function listarMapeamentos(
  coachId: string,
  keys: string[],
): Promise<Record<string, VideoMappingRow>> {
  if (!keys.length) return {};
  const { data } = await supabase
    .from("exercise_video_mappings")
    .select("*")
    .eq("coach_id", coachId)
    .in("exercise_key", keys);
  const out: Record<string, VideoMappingRow> = {};
  for (const r of (data as any[]) || []) out[r.exercise_key] = r as VideoMappingRow;
  return out;
}

/** Salva/atualiza o vínculo aprovado pelo coach. Vale para todos os treinos futuros. */
export async function salvarMapeamento(params: {
  coachId: string;
  exerciseNamePt: string;
  exerciseNameEn?: string | null;
  exercisedbId?: string | null;
  gifUrl?: string | null;
  customVideoUrl?: string | null;
}): Promise<VideoMappingRow | null> {
  const key = exerciseKey(params.exerciseNamePt);
  if (!key) return null;
  const { data, error } = await supabase
    .from("exercise_video_mappings")
    .upsert(
      {
        coach_id: params.coachId,
        exercise_key: key,
        exercise_name_pt: params.exerciseNamePt,
        exercise_name_en: params.exerciseNameEn ?? null,
        exercisedb_id: params.exercisedbId ?? null,
        gif_url: params.gifUrl ?? null,
        custom_video_url: params.customVideoUrl ?? null,
        verified: true,
      },
      { onConflict: "coach_id,exercise_key" },
    )
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as any) || null;
}

/** Remove o vínculo (volta a exibir apenas o guia em texto). */
export async function removerMapeamento(coachId: string, exerciseName: string) {
  const key = exerciseKey(exerciseName);
  const { error } = await supabase
    .from("exercise_video_mappings")
    .delete()
    .eq("coach_id", coachId)
    .eq("exercise_key", key);
  if (error) throw error;
}
