/**
 * Motor de seleção de técnicas avançadas — TrainingON (Fase 3)
 *
 * Regras (determinísticas, sem valores inventados de estudo):
 * - Só a partir da semana 3 do mesociclo
 * - Nunca em semana de descarga (deload)
 * - Máximo 2 técnicas por sessão
 * - Compostos pesados recebem apenas CLUSTER SET; isoladores/máquinas recebem
 *   REST-PAUSE, DROP-SET, MYOREPS ou BISET
 */

export type TechniqueKey = "REST_PAUSE" | "DROP_SET" | "CLUSTER_SET" | "MYOREPS" | "BISET";

export interface TechniqueInfo {
  key: TechniqueKey;
  label: string;
  color: string;
  bg: string;
  resumo: string;
  passos: string[];
  parar: string;
}

export const TECHNIQUES: Record<TechniqueKey, TechniqueInfo> = {
  REST_PAUSE: {
    key: "REST_PAUSE",
    label: "REST-PAUSE",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.14)",
    resumo: "Uma série levada perto da falha, seguida de pausas curtas para arrancar repetições extras.",
    passos: [
      "Faça a série normal até a última repetição forte (RIR 0-1).",
      "Descanse 15 a 20 segundos ainda na posição do exercício.",
      "Faça mais repetições até travar; repita a pausa até 2 vezes.",
    ],
    parar: "Pare quando a repetição perder a técnica ou quando você fizer menos de 3 repetições após a pausa.",
  },
  DROP_SET: {
    key: "DROP_SET",
    label: "DROP-SET",
    color: "#f97316",
    bg: "rgba(249,115,22,0.14)",
    resumo: "Reduzir a carga imediatamente após a falha técnica para continuar a série.",
    passos: [
      "Complete a série de trabalho até RIR 0-1.",
      "Reduza a carga entre 20% e 30% sem descanso.",
      "Continue até travar novamente; faça no máximo 2 reduções.",
    ],
    parar: "Encerre na segunda redução ou antes, se a amplitude diminuir.",
  },
  CLUSTER_SET: {
    key: "CLUSTER_SET",
    label: "CLUSTER SET",
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.14)",
    resumo: "Quebrar a série em blocos curtos com pausas de poucos segundos para manter a carga alta.",
    passos: [
      "Divida a série em blocos de 2 a 3 repetições.",
      "Descanse 15 a 25 segundos entre os blocos.",
      "Some os blocos até completar o total de repetições prescrito.",
    ],
    parar: "Pare quando a velocidade da subida cair claramente entre blocos.",
  },
  MYOREPS: {
    key: "MYOREPS",
    label: "MYOREPS",
    color: "#5DCAA5",
    bg: "rgba(93,202,165,0.14)",
    resumo: "Uma série de ativação seguida de mini-séries curtas com descanso muito breve.",
    passos: [
      "Faça a série de ativação até RIR 1-2.",
      "Descanse 5 respirações profundas (cerca de 15 segundos).",
      "Faça mini-séries de 3 a 5 repetições, repetindo o descanso curto.",
    ],
    parar: "Encerre quando não conseguir mais 3 repetições limpas na mini-série.",
  },
  BISET: {
    key: "BISET",
    label: "BISET",
    color: "#EF9F27",
    bg: "rgba(239,159,39,0.14)",
    resumo: "Dois exercícios do mesmo grupo muscular executados em sequência, sem descanso entre eles.",
    passos: [
      "Execute o exercício prescrito na série normal.",
      "Sem descanso, siga direto para o segundo exercício do mesmo grupo.",
      "Só então descanse o tempo previsto antes da próxima rodada.",
    ],
    parar: "Pare a rodada se a execução do segundo exercício perder controle.",
  },
};

const COMPOSTO_RE = /supino|agachamento|terra|remada|desenvolvimento|barra fixa|puxada|leg press|paralel|afundo|b[úu]lgaro|stiff/i;

export const isCompoundExercise = (name: string) => COMPOSTO_RE.test(String(name || ""));

const hashName = (name: string) => {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
};

export interface TechniqueSelectionInput {
  exercises: Array<{ name?: string; nome?: string }>;
  week?: number | null;
  isDeload?: boolean;
  level?: "iniciante" | "intermediario" | "avancado" | string | null;
  goal?: string | null;
  phase?: string | null;
}

/** Retorna um mapa nome do exercício → técnica programada (máximo 2 por sessão). */
export function selectSessionTechniques(input: TechniqueSelectionInput): Record<string, TechniqueKey> {
  const week = Number(input.week || 0);
  const level = String(input.level || "intermediario").toLowerCase();
  if (week < 3) return {};
  if (input.isDeload) return {};
  if (level.startsWith("inici")) return {};

  const goal = String(input.goal || "hipertrofia").toLowerCase();
  const phase = String(input.phase || "acumulação").toLowerCase();

  const names = (input.exercises || [])
    .map((e) => String(e?.name ?? e?.nome ?? "").trim())
    .filter(Boolean);
  if (!names.length) return {};

  const isolators = names.filter((n) => !isCompoundExercise(n));
  const compounds = names.filter((n) => isCompoundExercise(n));

  // Força usa cluster somente em compostos durante transmutação/realização.
  if (/for[cç]a|strength/.test(goal)) {
    if (!/transmuta|realiza|intensifica|peak/.test(phase)) return {};
    return compounds.slice(0, 2).reduce<Record<string, TechniqueKey>>((out, name) => {
      out[name] = "CLUSTER_SET";
      return out;
    }, {});
  }

  // Hipertrofia: técnicas metabólicas somente em isoladores/máquinas.
  if (!/hipertrof|bulk|massa|cut|defini/.test(goal) || !/acumula|volume/.test(phase)) return {};
  const candidates = isolators.slice(-2);

  const isolatorPool: TechniqueKey[] = ["REST_PAUSE", "DROP_SET", "MYOREPS", "BISET"];
  const out: Record<string, TechniqueKey> = {};

  candidates.forEach((name, i) => {
    // REST-PAUSE é a primeira escolha; as demais rotacionam sem repetir a sessão anterior.
    const idx = i === 0 ? 0 : (hashName(name) + week + i) % isolatorPool.length;
    out[name] = isolatorPool[idx];
  });

  return out;
}

export const getTechniqueInfo = (key?: TechniqueKey | null): TechniqueInfo | null =>
  key ? TECHNIQUES[key] ?? null : null;
