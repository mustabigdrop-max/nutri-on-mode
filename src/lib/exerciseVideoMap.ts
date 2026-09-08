import { supabase } from "@/integrations/supabase/client";
import { exerciseKey } from "@/lib/exerciseGuide";

const API = "https://oss.exercisedb.dev/api/v1/exercises";

export interface ExerciseVideo {
  type: "video" | "gif";
  url: string;
  nameEn?: string | null;
  /** true quando a demonstração veio da busca automática (sem aprovação do coach). */
  auto?: boolean;
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

/* ------------------------------------------------------------------ */
/* Busca automática com verificação de confiança                       */
/* ------------------------------------------------------------------ */

/** Termos extras de aquecimento, mobilidade, ativação e peso corporal. */
const TRADUCOES_EXTRA: Record<string, string> = {
  "mobilidade de quadril": "hip circles",
  "mobilidade de ombro": "shoulder circles",
  "mobilidade de tornozelo": "ankle circles",
  "circunducao de ombros": "shoulder circles",
  "rotacao de ombros": "shoulder circles",
  "gato camelo": "cat cow stretch",
  "cachorro olhando para baixo": "downward dog",
  "ponte de gluteo": "glute bridge",
  "ativacao de gluteo": "glute bridge",
  "ativacao de gluteo com elastico": "band glute bridge",
  "caminhada lateral com elastico": "band lateral walk",
  "abducao de quadril com elastico": "band hip abduction",
  "concha": "clam",
  "bird dog": "bird dog",
  "dead bug": "dead bug",
  "polichinelo": "jumping jack",
  "corrida estacionaria": "run",
  "elevacao de joelhos": "high knee against wall",
  "agachamento livre sem peso": "bodyweight squat",
  "agachamento com peso corporal": "bodyweight squat",
  "afundo alternado": "lunge",
  "avanco": "lunge",
  "alongamento de isquiotibiais": "standing hamstring stretch",
  "alongamento de quadriceps": "standing quadriceps stretch",
  "alongamento de peitoral": "chest stretch",
  "alongamento de panturrilha": "calf stretch",
  "rotacao externa com elastico": "band external rotation",
  "remada com elastico sentado": "resistance band seated row",
  "puxada com elastico": "band lat pulldown",
  "abducao de ombro com elastico": "band shoulder lateral raise",
  "escalador": "mountain climber",
  "burpee": "burpee",
  "esteira": "walking on treadmill",
  "bicicleta ergometrica": "stationary bike",
  "eliptico": "elliptical machine",
  "remo ergometro": "rowing machine",
};

function tokens(s: string): string[] {
  return plain(s).split(" ").filter((t) => t.length > 2);
}

const EQUIP_PT: Record<string, string[]> = {
  halter: ["dumbbell"],
  halteres: ["dumbbell"],
  barra: ["barbell", "ez barbell", "olympic barbell"],
  maquina: ["leverage machine", "sled machine", "smith machine"],
  polia: ["cable"],
  cabo: ["cable"],
  elastico: ["band", "resistance band"],
  smith: ["smith machine"],
  kettlebell: ["kettlebell"],
  livre: ["body weight", "barbell"],
};

/** Palavras da biblioteca que não mudam o movimento (não devem penalizar). */
const RUIDO = new Set(["male", "female", "version", "alternate", "alternating"]);

/** Pontua o quanto um resultado da biblioteca corresponde ao exercício pedido. */
function pontuar(alvoEn: string, nomePT: string, item: ExerciseSuggestion): number {
  const alvo = tokens(alvoEn);
  const nome = plain(item.nome);
  const nomeTokens = tokens(item.nome).filter((t) => !RUIDO.has(t) && !/^v\d?$/.test(t));
  if (!alvo.length) return 0;

  const cobertos = alvo.filter((t) => nome.includes(t)).length;
  let score = (cobertos / alvo.length) * 100;
  if (plain(alvoEn) === nome) score += 40;
  // penaliza levemente resultados mais longos
  score -= Math.max(0, nomeTokens.length - alvo.length) * 4;

  // equipamento citado em português precisa bater
  const base = plain(nomePT);
  const equip = plain(item.equipamento || "");
  for (const [pt, ens] of Object.entries(EQUIP_PT)) {
    if (base.includes(pt)) {
      score += ens.some((e) => equip.includes(e)) ? 12 : -12;
    }
  }
  // unilateral / lateral precisa bater
  for (const marca of ["lateral", "unilateral", "inclinad", "declinad"]) {
    const pedido = base.includes(marca);
    const tem = nome.includes(marca.slice(0, 6));
    if (pedido && !tem) score -= 12;
  }
  return score;
}

/** Consultas progressivas: termo completo, depois recortes menores. */
function consultas(alvo: string): string[] {
  const t = plain(alvo).split(" ").filter(Boolean);
  const out = [t.join(" ")];
  if (t.length > 2) out.push(t.slice(-2).join(" "));
  if (t.length > 1) out.push(t[t.length - 1]);
  return Array.from(new Set(out.filter(Boolean)));
}

const cacheAuto = new Map<string, ExerciseVideo | null>();

/**
 * Demonstração automática do movimento (aquecimento, mobilidade e exercícios).
 * Escolhe o melhor resultado da biblioteca; só devolve null quando nada corresponde.
 */
export async function buscarVideoAutomatico(nomePT: string): Promise<ExerciseVideo | null> {
  const base = plain(nomePT);
  if (!base) return null;
  if (cacheAuto.has(base)) return cacheAuto.get(base) || null;

  let alvo = TRADUCOES_EXTRA[base] || "";
  if (!alvo) {
    for (const chave of Object.keys(TRADUCOES_EXTRA)) {
      if (base.includes(chave) && chave.length > alvo.length) alvo = TRADUCOES_EXTRA[chave];
    }
  }
  if (!alvo) alvo = termoSugerido(nomePT);
  if (!alvo) return null;

  let melhor: ExerciseSuggestion | null = null;
  let melhorScore = -Infinity;
  for (const q of consultas(alvo)) {
    const candidatos = await buscarSugestoes(q);
    for (const c of candidatos) {
      const s = pontuar(alvo, nomePT, c);
      if (s > melhorScore) {
        melhorScore = s;
        melhor = c;
      }
    }
    if (melhorScore >= 70) break;
  }

  const achado = melhor && melhorScore >= 40 ? { type: "gif" as const, url: melhor.gifUrl, nameEn: melhor.nome, auto: true } : null;
  cacheAuto.set(base, achado);
  return achado;
}
