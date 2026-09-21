// ARSENAL VIRAL — APEX SCORE GERAL A PARTIR DAS ZONAS REAIS
// O score geral é a média das zonas preenchidas na última avaliação salva
// (apex_muscle_scores). Zonas em branco não entram na média e nada é estimado.

export interface MuscleScoreRow {
  assessment_date?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface ZonaDef {
  campos: string[];
  grupo: string;
  /** Par lateral usado para assimetria. */
  lateral?: [string, string];
}

export const ZONAS: ZonaDef[] = [
  { campos: ["chest_upper"], grupo: "Peitoral superior" },
  { campos: ["chest_lower"], grupo: "Peitoral inferior" },
  { campos: ["shoulder_ant"], grupo: "Deltóide anterior" },
  { campos: ["shoulder_lat"], grupo: "Deltóide lateral" },
  { campos: ["shoulder_post"], grupo: "Deltóide posterior" },
  { campos: ["biceps_l", "biceps_r"], grupo: "Bíceps", lateral: ["biceps_l", "biceps_r"] },
  { campos: ["triceps_l", "triceps_r"], grupo: "Tríceps", lateral: ["triceps_l", "triceps_r"] },
  { campos: ["forearms_l", "forearms_r"], grupo: "Antebraços", lateral: ["forearms_l", "forearms_r"] },
  { campos: ["traps_upper"], grupo: "Trapézio superior" },
  { campos: ["traps_mid"], grupo: "Trapézio médio" },
  { campos: ["traps_lower"], grupo: "Trapézio inferior" },
  { campos: ["lats"], grupo: "Dorsal" },
  { campos: ["rhomboids"], grupo: "Romboides" },
  { campos: ["abs_rectus"], grupo: "Abdômen" },
  { campos: ["abs_obliques"], grupo: "Oblíquos" },
  { campos: ["erectors"], grupo: "Eretores" },
  { campos: ["glute_max"], grupo: "Glúteo máximo" },
  { campos: ["glute_med"], grupo: "Glúteo médio" },
  { campos: ["quads_l", "quads_r"], grupo: "Quadríceps", lateral: ["quads_l", "quads_r"] },
  { campos: ["hams_l", "hams_r"], grupo: "Posterior de coxa", lateral: ["hams_l", "hams_r"] },
  { campos: ["calves_l", "calves_r"], grupo: "Panturrilhas", lateral: ["calves_l", "calves_r"] },
  { campos: ["adductors"], grupo: "Adutores" },
];

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export interface ZonaScore {
  grupo: string;
  score: number;
}

/** Scores por grupo (média dos lados quando houver). Zonas vazias são omitidas. */
export function zonasDaAvaliacao(row: MuscleScoreRow | null): ZonaScore[] {
  if (!row) return [];
  const out: ZonaScore[] = [];
  ZONAS.forEach((z) => {
    const valores = z.campos.map((c) => num(row[c])).filter((v): v is number => v !== null);
    if (!valores.length) return;
    out.push({ grupo: z.grupo, score: valores.reduce((a, b) => a + b, 0) / valores.length });
  });
  return out;
}

/** APEX Score geral = média das zonas preenchidas. Null quando não há nenhuma. */
export function apexScoreGeral(row: MuscleScoreRow | null): number | null {
  const zonas = zonasDaAvaliacao(row);
  if (!zonas.length) return null;
  return zonas.reduce((a, z) => a + z.score, 0) / zonas.length;
}

export interface AssimetriaZona {
  grupo: string;
  pct: number;
}

/** Assimetrias reais por par lateral, em % do lado mais forte. */
export function assimetrias(row: MuscleScoreRow | null): AssimetriaZona[] {
  if (!row) return [];
  const out: AssimetriaZona[] = [];
  ZONAS.forEach((z) => {
    if (!z.lateral) return;
    const a = num(row[z.lateral[0]]);
    const b = num(row[z.lateral[1]]);
    if (a === null || b === null) return;
    const maior = Math.max(a, b);
    if (maior <= 0) return;
    out.push({ grupo: z.grupo, pct: (Math.abs(a - b) / maior) * 100 });
  });
  return out.sort((x, y) => y.pct - x.pct);
}

export interface DeltaZona {
  grupo: string;
  atual: number;
  anterior: number | null;
  delta: number;
}

/** Deltas por grupo entre a avaliação atual e a anterior. */
export function deltasPorGrupo(atual: MuscleScoreRow | null, anterior: MuscleScoreRow | null): DeltaZona[] {
  const mapaAnterior = new Map(zonasDaAvaliacao(anterior).map((z) => [z.grupo, z.score]));
  return zonasDaAvaliacao(atual).map((z) => {
    const ant = mapaAnterior.has(z.grupo) ? (mapaAnterior.get(z.grupo) as number) : null;
    return {
      grupo: z.grupo,
      atual: z.score,
      anterior: ant,
      delta: ant === null ? 0 : Math.round(z.score - ant),
    };
  });
}
