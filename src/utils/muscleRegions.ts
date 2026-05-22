// Sistema de Hipertrofia Regional
// Base: Darkside Universidade — "Hipertrofia Regional"

export interface MuscleRegion {
  id: string;
  musculo: string;
  porcao: string;
  importancia: "CRITICA" | "ALTA" | "NORMAL";
  impacto_visual: string;
  exercicios_primarios: string[];
  exercicios_secundarios: string[];
  apex_relacionado?: string[];
}

export const MUSCLE_REGIONS: MuscleRegion[] = [
  // ── DELTÓIDE ──
  {
    id: "deltoide_lateral", musculo: "ombro", porcao: "Deltóide lateral",
    importancia: "CRITICA",
    impacto_visual: "V-taper — largura de ombros",
    exercicios_primarios: ["Elevação lateral cabo baixo", "Elevação lateral halteres", "Elevação lateral máquina"],
    exercicios_secundarios: ["Desenvolvimento halteres", "Arnold press"],
    apex_relacionado: ["shoulder_asymmetry"],
  },
  {
    id: "deltoide_posterior", musculo: "ombro", porcao: "Deltóide posterior",
    importancia: "ALTA",
    impacto_visual: "Espessura posterior — pose de costas",
    exercicios_primarios: ["Crucifixo invertido", "Face pull", "Remada alta cabo"],
    exercicios_secundarios: ["Puxada pegada supinada", "Remada unilateral halteres"],
    apex_relacionado: ["shoulder_protraction", "scapula_alada"],
  },
  {
    id: "deltoide_anterior", musculo: "ombro", porcao: "Deltóide anterior",
    importancia: "NORMAL",
    impacto_visual: "Já estimulado pelos compostos de peito",
    exercicios_primarios: ["Elevação frontal cabo", "Desenvolvimento barra"],
    exercicios_secundarios: ["Supino inclinado", "Supino reto barra"],
    apex_relacionado: [],
  },
  // ── DORSAL ──
  {
    id: "dorsal_largura", musculo: "costas", porcao: "Dorsal — largura (axila)",
    importancia: "CRITICA",
    impacto_visual: "V-taper — largura das costas",
    exercicios_primarios: ["Puxada frontal barra larga", "Pulldown cabo", "Barra fixa pegada larga"],
    exercicios_secundarios: ["Remada curvada pegada pronada"],
    apex_relacionado: [],
  },
  {
    id: "dorsal_insercao_inferior", musculo: "costas", porcao: "Dorsal — inserção inferior (asa)",
    importancia: "CRITICA",
    impacto_visual: "Asa do dorsal — estreitamento da cintura",
    exercicios_primarios: ["Pullover máquina", "Straight arm pulldown", "Pullover halteres"],
    exercicios_secundarios: ["Puxada neutra"],
    apex_relacionado: ["scapula_alada"],
  },
  {
    id: "dorsal_espessura", musculo: "costas", porcao: "Dorsal — espessura (centro)",
    importancia: "ALTA",
    impacto_visual: "Espessura — pose de costas 3D",
    exercicios_primarios: ["Remada curvada barra", "Remada cavalinho", "Remada unilateral halteres"],
    exercicios_secundarios: ["Remada máquina", "Levantamento terra"],
    apex_relacionado: [],
  },
  // ── BÍCEPS ──
  {
    id: "biceps_cabeca_longa", musculo: "biceps", porcao: "Bíceps — cabeça longa (pico)",
    importancia: "CRITICA",
    impacto_visual: "Pico do bíceps — pose de frente",
    exercicios_primarios: ["Rosca inclinada halteres", "Rosca cabo baixo", "Rosca halteres supinada"],
    exercicios_secundarios: ["Rosca direta barra"],
    apex_relacionado: [],
  },
  {
    id: "biceps_cabeca_curta", musculo: "biceps", porcao: "Bíceps — cabeça curta (largura)",
    importancia: "ALTA",
    impacto_visual: "Largura do bíceps — pose lateral",
    exercicios_primarios: ["Rosca concentrada", "Rosca scott", "Rosca spider curl"],
    exercicios_secundarios: ["Rosca martelo"],
    apex_relacionado: [],
  },
  // ── TRÍCEPS ──
  {
    id: "triceps_cabeca_longa", musculo: "triceps", porcao: "Tríceps — cabeça longa (volume)",
    importancia: "CRITICA",
    impacto_visual: "Volume do tríceps — pose lateral",
    exercicios_primarios: ["Tríceps testa barra", "Tríceps francês halteres", "Tríceps polia overhead"],
    exercicios_secundarios: ["Supino fechado"],
    apex_relacionado: [],
  },
  {
    id: "triceps_cabeca_lateral", musculo: "triceps", porcao: "Tríceps — cabeça lateral (separação)",
    importancia: "ALTA",
    impacto_visual: "Separação e estriação do tríceps",
    exercicios_primarios: ["Tríceps coice halteres", "Tríceps polia alta", "Tríceps corda"],
    exercicios_secundarios: ["Mergulho no banco"],
    apex_relacionado: [],
  },
  // ── PEITORAL ──
  {
    id: "peitoral_superior", musculo: "peito", porcao: "Peitoral superior (clavicular)",
    importancia: "CRITICA",
    impacto_visual: "Enchimento superior — pose de frente",
    exercicios_primarios: ["Supino inclinado halteres", "Cross-over baixo", "Crucifixo inclinado"],
    exercicios_secundarios: ["Supino inclinado barra"],
    apex_relacionado: [],
  },
  {
    id: "peitoral_inferior", musculo: "peito", porcao: "Peitoral inferior (esternal)",
    importancia: "ALTA",
    impacto_visual: "Definição inferior — linha de peito",
    exercicios_primarios: ["Cross-over alto", "Supino declinado", "Mergulho entre bancos"],
    exercicios_secundarios: ["Supino reto barra"],
    apex_relacionado: [],
  },
  // ── QUADRÍCEPS ──
  {
    id: "quadriceps_reto_femoral", musculo: "quadriceps", porcao: "Reto femoral (biarticular)",
    importancia: "ALTA",
    impacto_visual: "Volume central do quadríceps",
    exercicios_primarios: ["Cadeira extensora", "Agachamento búlgaro", "Leg extension com cabos"],
    exercicios_secundarios: ["Agachamento livre"],
    apex_relacionado: ["pelvic_tilt"],
  },
  {
    id: "quadriceps_vasto_medial", musculo: "quadriceps", porcao: "Vasto medial (gota)",
    importancia: "CRITICA",
    impacto_visual: "Gota do quadríceps — diferencial de palco",
    exercicios_primarios: ["Hack squat", "Leg press pés baixos e juntos", "Extensora com rotação externa"],
    exercicios_secundarios: ["Agachamento sumô"],
    apex_relacionado: [],
  },
  // ── GLÚTEO ──
  {
    id: "gluteo_maximo", musculo: "gluteo", porcao: "Glúteo máximo",
    importancia: "CRITICA",
    impacto_visual: "Volume e projeção glútea",
    exercicios_primarios: ["Hip thrust barra", "Glúteo 4 apoios cabo", "Afundo búlgaro"],
    exercicios_secundarios: ["Agachamento livre", "Levantamento terra"],
    apex_relacionado: ["hyperlordosis", "pelvic_tilt"],
  },
  {
    id: "gluteo_medio", musculo: "gluteo", porcao: "Glúteo médio",
    importancia: "ALTA",
    impacto_visual: "Largura do quadril — proporção",
    exercicios_primarios: ["Abdução cabo em pé", "Clamshell", "Agachamento sumô"],
    exercicios_secundarios: ["Leg press pés afastados"],
    apex_relacionado: ["pelvic_tilt", "hip_asymmetry"],
  },
  // ── POSTERIOR ──
  {
    id: "posterior_biceps_femoral", musculo: "posterior", porcao: "Bíceps femoral (cabeça longa)",
    importancia: "CRITICA",
    impacto_visual: "Volume posterior da coxa",
    exercicios_primarios: ["Leg curl deitado", "Stiff halteres", "Leg curl sentado"],
    exercicios_secundarios: ["Levantamento terra romeno"],
    apex_relacionado: ["hyperlordosis"],
  },
  // ── PANTURRILHA ──
  {
    id: "gastrocnemio", musculo: "panturrilha", porcao: "Gastrocnêmio (volume)",
    importancia: "CRITICA",
    impacto_visual: "Volume da panturrilha — ponto fraco comum",
    exercicios_primarios: ["Panturrilha em pé", "Panturrilha no leg press"],
    exercicios_secundarios: [],
    apex_relacionado: [],
  },
  {
    id: "soleo", musculo: "panturrilha", porcao: "Sóleo (base e largura)",
    importancia: "ALTA",
    impacto_visual: "Largura e base da panturrilha",
    exercicios_primarios: ["Panturrilha sentado"],
    exercicios_secundarios: [],
    apex_relacionado: [],
  },
];

export const REGIONS_BY_MUSCLE: Record<string, MuscleRegion[]> = MUSCLE_REGIONS.reduce(
  (acc, r) => {
    acc[r.musculo] = [...(acc[r.musculo] ?? []), r];
    return acc;
  },
  {} as Record<string, MuscleRegion[]>,
);

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function findExerciseRegion(exerciseName: string): MuscleRegion | null {
  if (!exerciseName) return null;
  const lower = norm(exerciseName);
  return (
    MUSCLE_REGIONS.find((r) =>
      r.exercicios_primarios.some((e) => {
        const en = norm(e);
        return lower.includes(en) || en.includes(lower);
      }),
    ) ??
    MUSCLE_REGIONS.find((r) =>
      r.exercicios_secundarios.some((e) => lower.includes(norm(e))),
    ) ??
    null
  );
}

export function calcRegionCoverage(
  exercises: { nome: string }[],
  musculo: string,
): {
  cobertas: MuscleRegion[];
  faltando: MuscleRegion[];
  criticas_ok: boolean;
  score: number;
} {
  const regioes = REGIONS_BY_MUSCLE[musculo] ?? [];
  const cobertas: MuscleRegion[] = [];
  const faltando: MuscleRegion[] = [];

  for (const regiao of regioes) {
    const coberta = exercises.some((ex) => {
      const lower = norm(ex.nome ?? "");
      return (
        regiao.exercicios_primarios.some((e) => lower.includes(norm(e))) ||
        regiao.exercicios_secundarios.some((e) => lower.includes(norm(e)))
      );
    });
    if (coberta) cobertas.push(regiao);
    else faltando.push(regiao);
  }

  const criticas = regioes.filter((r) => r.importancia === "CRITICA");
  const criticas_ok = criticas.every((c) => cobertas.includes(c));
  const score = regioes.length > 0
    ? Math.round((cobertas.length / regioes.length) * 100)
    : 100;

  return { cobertas, faltando, criticas_ok, score };
}

export function getApexRegionalPriorities(achados: string[]): MuscleRegion[] {
  if (!achados?.length) return [];
  return MUSCLE_REGIONS.filter((r) =>
    r.apex_relacionado?.some((a) => achados.includes(a)),
  );
}

export function buildRegionalInstruction(
  muscleGroups: string[],
  weakPoints: string = "",
): string {
  const regionalRules = muscleGroups
    .map((m) => {
      const regions = REGIONS_BY_MUSCLE[m] ?? [];
      const criticas = regions
        .filter((r) => r.importancia === "CRITICA")
        .map((r) => `${r.porcao}: ${r.exercicios_primarios[0]}`)
        .join(", ");
      return criticas ? `• ${m}: cobrir ${criticas}` : null;
    })
    .filter(Boolean)
    .join("\n");

  return `
HIPERTROFIA REGIONAL — REGRAS OBRIGATÓRIAS:
O músculo NÃO hipertrofia uniformemente.
Para cada grupo muscular, cobrir as porções críticas:

${regionalRules}

PONTOS FRACOS IDENTIFICADOS: ${weakPoints || "nenhum"}
Para pontos fracos: incluir 2+ exercícios para a porção crítica faltante, perfil ALONGADO prioritário.

CLASSIC PHYSIQUE — PRIORIDADES VISUAIS:
★ Deltóide lateral → V-taper
★ Dorsal inserção inferior → cintura aparente
★ Vasto medial → gota do quadríceps
★ Bíceps cabeça longa → pico
★ Tríceps cabeça longa → volume lateral
  `.trim();
}
