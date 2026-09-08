import { supabase } from "@/integrations/supabase/client";
import { exerciseKey } from "@/lib/exerciseGuide";

/**
 * Base da ExerciseDB. Para usar uma instância própria (self-hosted no Vercel),
 * defina VITE_EXERCISEDB_API, ex.: https://nutrion-exercises.vercel.app/api/v1
 */
export const EXERCISEDB_BASE =
  (import.meta.env.VITE_EXERCISEDB_API as string | undefined)?.replace(/\/+$/, "") ||
  "https://oss.exercisedb.dev/api/v1";

const API = `${EXERCISEDB_BASE}/exercises`;

export type ExerciseVideoStatus = "custom" | "verified" | "auto";

export interface ExerciseVideo {
  type: "video" | "gif";
  url: string;
  nameEn?: string | null;
  status?: ExerciseVideoStatus;
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
  gif_verified: boolean;
  gif_verified_at: string | null;
  gif_verified_by: string | null;
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
  "mobilidade de quadril": "hip circles standing",
  "mobilidade de quadril rotacoes circulos extensoes": "standing hip circles",
  "rotacao de quadril": "hip rotation standing",
  "circulos de quadril": "hip circles",
  "gato vaca": "cat cow stretch",
  "ponte de gluteos": "glute bridge",
  "ponte de gluteos com banda": "glute bridge band",
  "ativacao de gluteos": "glute bridge",
  "ativacao de gluteos ponte de gluteos com banda": "glute bridge resistance band",
  "prancha abdominal": "front plank",
  "prancha": "plank",
  "prancha lateral": "side plank",
  "puxada alta": "cable wide grip lat pulldown",
  "puxada alta com barra reta": "cable wide grip lat pulldown",
  "puxada frontal": "cable lat pulldown",
  "puxada supinada": "cable underhand grip lat pulldown",
  "remada curvada": "barbell bent over row",
  "remada curvada com barra": "barbell bent over row",
  "remada curvada com barra pegada pronada": "barbell bent over row",
  "remada unilateral": "dumbbell one arm row",
  "remada unilateral com halteres": "dumbbell bent over row",
  "remada unilateral com halteres serrote": "dumbbell one arm row",
  "remada baixa": "seated cable row",
  "remada cavalinho": "lever t bar row",
  "remada com elastico": "resistance band seated row",
  "elevacao lateral": "dumbbell lateral raise",
  "elevacao lateral com halteres": "dumbbell lateral raise",
  "elevacao frontal": "front raise",
  "crucifixo": "dumbbell fly",
  "crucifixo invertido": "dumbbell rear delt fly",
  "crucifixo invertido na maquina": "lever reverse fly",
  "voador na maquina": "pec deck fly",
  "crossover": "cable crossover",
  "abdominal": "crunch",
  "abdominal supra": "crunch",
  "abdominal supra na maquina": "machine crunch",
  "abdominal infra": "leg raise",
  "rotacao externa de ombro": "cable external rotation",
  "alongamento dinamico de tronco": "standing trunk rotation stretch",
  "rotacao de tronco": "standing trunk rotation",
  "supino reto": "barbell bench press",
  "supino reto com barra": "barbell bench press",
  "supino inclinado": "incline bench press",
  "supino declinado": "barbell decline bench press",
  "supino com halteres": "dumbbell bench press",
  "crucifixo inclinado": "dumbbell incline fly",
  "voador": "lever pec deck fly",
  "cross over": "cable crossover",
  "flexao de braco": "push up",
  "mergulho": "chest dip",
  "agachamento": "squat",
  "agachamento livre": "barbell full squat",
  "agachamento bulgaro": "dumbbell bulgarian split squat",
  "afundo": "lunge",
  "leg press": "leg press machine",
  "leg press 45": "sled 45 leg press",
  "cadeira extensora": "lever leg extension",
  "mesa flexora": "lever lying leg curl",
  "cadeira abdutora": "lever seated hip abduction",
  "cadeira adutora": "lever seated hip adduction",
  "cadeira flexora": "seated leg curl",
  "stiff": "barbell romanian deadlift",
  "stiff com barra": "barbell romanian deadlift",
  "stiff com halteres": "dumbbell romanian deadlift",
  "levantamento terra": "deadlift",
  "hip thrust": "barbell hip thrust",
  "hack squat": "sled hack squat",
  "passada": "dumbbell walking lunge",
  "avanco": "dumbbell lunge",
  "elevacao pelvica": "glute bridge",
  "panturrilha": "calf raise",
  "panturrilha no smith": "smith machine calf raise",
  "panturrilha sentado": "lever seated calf raise",
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
  "desenvolvimento com barra": "barbell overhead press",
  "desenvolvimento militar": "overhead press",
  "encolhimento": "shrug",
  "barra fixa": "pull up",
  "flexao": "push up",
  "pullover": "dumbbell pullover",
  "pullover com halteres": "dumbbell pullover",
  "face pull": "cable face pull",
  "rosca concentrada": "dumbbell concentration curl",
  "rosca no cabo": "cable curl",
  "triceps corda": "cable rope pushdown",
  "triceps banco": "bench dip",
  "triceps mergulho": "triceps dip",
  "abdominal na maquina": "lever crunch",
  "elevacao de pernas": "hanging leg raise",
  "russian twist": "russian twist",
  "wood chop": "cable wood chop",
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

/** user_id do coach vinculado ao aluno (coach_patients.coach_id → coach_profiles.user_id), ou null. */
export async function resolverCoachUserIdDoAluno(patientUserId: string): Promise<string | null> {
  const { data: link } = await supabase
    .from("coach_patients")
    .select("coach_id")
    .eq("patient_user_id", patientUserId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  const coachProfileId = (link as any)?.coach_id as string | undefined;
  if (!coachProfileId) return null;
  const { data: prof } = await supabase
    .from("coach_profiles")
    .select("user_id")
    .eq("id", coachProfileId)
    .maybeSingle();
  return (prof as any)?.user_id || null;
}

/** Coach responsável: o próprio usuário quando é coach, ou o coach do aluno. */
export async function resolverCoachId(): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  return (await resolverCoachUserIdDoAluno(uid)) || uid;
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
    .select("gif_url, custom_video_url, exercise_name_en, gif_verified")
    .eq("exercise_key", key)
    .eq("coach_id", cid)
    .eq("gif_verified", true)
    .limit(1)
    .maybeSingle();
  const row = data as any;
  if (!row) return null;
  if (!row.gif_verified) return null;
  if (row.custom_video_url) {
    const url = await resolveStoredVideoUrl(row.custom_video_url);
    return url ? { type: "video", url, nameEn: row.exercise_name_en } : null;
  }
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
        gif_verified: true,
        gif_verified_at: new Date().toISOString(),
        gif_verified_by: params.coachId,
      },
      { onConflict: "coach_id,exercise_key" },
    )
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as any) || null;
}

/** Guarda vídeos próprios em bucket privado e gera URL temporária só ao exibir. */
export async function uploadVideoDoCoach(coachId: string, exerciseName: string, file: File): Promise<string> {
  if (!file.type.startsWith("video/")) throw new Error("Selecione um arquivo de vídeo.");
  if (file.size > 100 * 1024 * 1024) throw new Error("O vídeo deve ter no máximo 100 MB.");
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const path = `${coachId}/${exerciseKey(exerciseName)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("exercise-videos").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return `storage://exercise-videos/${path}`;
}

export async function resolveStoredVideoUrl(value: string): Promise<string | null> {
  if (!value.startsWith("storage://exercise-videos/")) return value;
  const path = value.slice("storage://exercise-videos/".length);
  const { data, error } = await supabase.storage.from("exercise-videos").createSignedUrl(path, 3600);
  return error ? null : data.signedUrl;
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

