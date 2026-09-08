/**
 * Busca GIF animado do exercício na ExerciseDB V1 (gratuita, sem chave).
 * Retorna null quando não há match confiável.
 */

const API = "https://oss.exercisedb.dev/api/v1/exercises";

/** Tradução PT → EN para os exercícios mais comuns do TrainingON. */
const TRADUCOES: Record<string, string> = {
  "puxada alta": "lat pulldown",
  "puxada frontal": "lat pulldown",
  "remada curvada": "bent over row",
  "remada unilateral": "one arm dumbbell row",
  "remada cavalinho": "t bar row",
  "remada baixa": "seated cable row",
  "remada com elastico": "band row",
  "elevacao lateral": "dumbbell lateral raise",
  "elevacao frontal": "front raise",
  "crucifixo": "dumbbell fly",
  "crucifixo invertido": "reverse fly",
  "crossover": "cable crossover",
  "abdominal": "crunch",
  "abdominal supra": "crunch",
  "abdominal infra": "leg raise",
  "prancha": "plank",
  "rotacao externa de ombro": "external rotation",
  "rotacao externa": "external rotation",
  "supino reto": "bench press",
  "supino inclinado": "incline bench press",
  "supino declinado": "decline bench press",
  "agachamento": "squat",
  "agachamento livre": "barbell squat",
  "agachamento bulgaro": "bulgarian split squat",
  "afundo": "lunge",
  "avanco": "lunge",
  "leg press": "leg press",
  "cadeira extensora": "leg extension",
  "mesa flexora": "leg curl",
  "cadeira flexora": "seated leg curl",
  "stiff": "romanian deadlift",
  "levantamento terra": "deadlift",
  "terra romeno": "romanian deadlift",
  "hip thrust": "hip thrust",
  "elevacao pelvica": "glute bridge",
  "ponte de gluteo": "glute bridge",
  "abducao de quadril": "hip abduction",
  "aducao de quadril": "hip adduction",
  "cadeira abdutora": "hip abduction",
  "cadeira adutora": "hip adduction",
  "panturrilha": "calf raise",
  "panturrilha em pe": "standing calf raise",
  "panturrilha sentado": "seated calf raise",
  "rosca direta": "barbell curl",
  "rosca alternada": "dumbbell curl",
  "rosca martelo": "hammer curl",
  "rosca scott": "preacher curl",
  "rosca concentrada": "concentration curl",
  "rosca inclinada": "incline dumbbell curl",
  "rosca no cabo": "cable curl",
  "triceps pulley": "tricep pushdown",
  "triceps testa": "skull crusher",
  "triceps frances": "overhead tricep extension",
  "triceps no banco": "bench dip",
  "triceps coice": "tricep kickback",
  "mergulho": "dip",
  "desenvolvimento": "shoulder press",
  "desenvolvimento militar": "overhead press",
  "desenvolvimento arnold": "arnold press",
  "encolhimento": "shrug",
  "barra fixa": "pull up",
  "flexao": "push up",
  "flexao de braco": "push up",
  "prancha lateral": "side plank",
  "good morning": "good morning",
  "passada": "lunge",
  "agachamento sumo": "sumo squat",
  "face pull": "face pull",
  "pullover": "pullover",
  "serrote": "one arm dumbbell row",
  "alongamento de tronco": "trunk rotation",
  "rotacao de tronco": "torso rotation",
};

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove termos de prescrição ("com halteres", "na máquina", "3x12"...) para buscar o movimento-base. */
function limparNome(s: string): string {
  return s
    .replace(/\b(com|na|no|em|de|do|da|para)\b.*$/i, (m) => (m.length > 12 ? " " : m)) // corta sufixos longos
    .replace(/\b(halter(es)?|barra|maquina|cabo|polia|elastico|smith|livre|unilateral|alternado|sentado|em pe|inclinado|declinado)\b/gi, " ")
    .replace(/\d+x\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface ExercisedbItem {
  name: string;
  gifUrl: string;
  targetMuscles?: string[];
  equipments?: string[];
}

async function buscar(termo: string): Promise<ExercisedbItem | null> {
  try {
    const res = await fetch(`${API}?name=${encodeURIComponent(termo)}&limit=5`);
    if (!res.ok) return null;
    const json = await res.json();
    const lista: ExercisedbItem[] = Array.isArray(json?.data) ? json.data : [];
    if (!lista.length) return null;
    // Prefere match que contenha o termo completo; senão o primeiro
    const t = termo.toLowerCase();
    return lista.find((x) => x.name?.toLowerCase().includes(t)) || lista[0];
  } catch {
    return null;
  }
}

export interface ExerciseGifResult {
  gifUrl: string;
  nomeEN: string;
}

/** Busca o GIF com múltiplas estratégias: tradução exata → nome limpo → palavras-chave. */
export async function buscarGifExercicio(nomePT: string): Promise<ExerciseGifResult | null> {
  const base = normalizar(nomePT);
  if (!base) return null;

  // 1) tradução direta
  if (TRADUCOES[base]) {
    const r = await buscar(TRADUCOES[base]);
    if (r?.gifUrl) return { gifUrl: r.gifUrl, nomeEN: r.name };
  }

  // 2) tradução do nome limpo (sem sufixos de equipamento/variação)
  const limpo = limparNome(base);
  if (limpo && limpo !== base && TRADUCOES[limpo]) {
    const r = await buscar(TRADUCOES[limpo]);
    if (r?.gifUrl) return { gifUrl: r.gifUrl, nomeEN: r.name };
  }

  // 3) busca parcial: encontra a maior chave do dicionário contida no nome
  let melhorChave = "";
  for (const chave of Object.keys(TRADUCOES)) {
    if (base.includes(chave) && chave.length > melhorChave.length) melhorChave = chave;
  }
  if (melhorChave) {
    const r = await buscar(TRADUCOES[melhorChave]);
    if (r?.gifUrl) return { gifUrl: r.gifUrl, nomeEN: r.name };
  }

  // 4) última tentativa: busca direta (caso o nome já venha em inglês, ex.: "Hip Thrust")
  const direto = await buscar(base);
  if (direto?.gifUrl) return { gifUrl: direto.gifUrl, nomeEN: direto.name };

  return null;
}
