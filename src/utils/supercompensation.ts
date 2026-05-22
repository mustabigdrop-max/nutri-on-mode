// Supercompensation window engine per muscle group
// Base: Zatsiorsky & Kraemer; Bompa — Periodization
import { supabase } from "@/integrations/supabase/client";

export type SupercompPhase =
  | "ESTIMULO"
  | "FADIGA"
  | "RECUPERACAO"
  | "SUPERCOMPENSACAO"
  | "DETRAINING";

export interface SupercompWindow {
  musculo: string;
  fase: SupercompPhase;
  diasDesde: number;
  janela_inicio: number;
  janela_fim: number;
  pronto: boolean;
  descricao: string;
}

const SUPERCOMP_TIMELINE: Record<
  string,
  { fadiga: [number, number]; recuperacao: [number, number]; supercomp: [number, number] }
> = {
  pernas:      { fadiga: [1, 3], recuperacao: [3, 6], supercomp: [6, 10] },
  quadriceps:  { fadiga: [1, 3], recuperacao: [3, 6], supercomp: [6, 10] },
  costas:      { fadiga: [1, 3], recuperacao: [3, 5], supercomp: [5, 9] },
  peito:       { fadiga: [1, 2], recuperacao: [2, 4], supercomp: [4, 8] },
  ombro:       { fadiga: [1, 2], recuperacao: [2, 4], supercomp: [4, 7] },
  biceps:      { fadiga: [1, 2], recuperacao: [2, 3], supercomp: [3, 6] },
  triceps:     { fadiga: [1, 2], recuperacao: [2, 3], supercomp: [3, 6] },
  gluteo:      { fadiga: [1, 3], recuperacao: [3, 5], supercomp: [5, 9] },
  posterior:   { fadiga: [1, 3], recuperacao: [3, 5], supercomp: [5, 8] },
  panturrilha: { fadiga: [1, 2], recuperacao: [2, 3], supercomp: [3, 5] },
  core:        { fadiga: [1, 1], recuperacao: [1, 2], supercomp: [2, 4] },
};

export function calcSupercompPhase(musculo: string, diasDesde: number): SupercompWindow {
  const key = musculo.toLowerCase();
  const timeline = SUPERCOMP_TIMELINE[key] ?? SUPERCOMP_TIMELINE["peito"];
  let fase: SupercompPhase;
  let descricao: string;

  if (diasDesde === 0) {
    fase = "ESTIMULO";
    descricao = "Treino atual — estímulo sendo gerado";
  } else if (diasDesde <= timeline.fadiga[1]) {
    fase = "FADIGA";
    descricao = `Recuperação ativa — aguardar ${Math.max(timeline.recuperacao[0] - diasDesde, 1)} dia(s)`;
  } else if (diasDesde <= timeline.recuperacao[1]) {
    fase = "RECUPERACAO";
    descricao = `Quase pronto — janela abre em ${Math.max(timeline.supercomp[0] - diasDesde, 1)} dia(s)`;
  } else if (diasDesde <= timeline.supercomp[1]) {
    fase = "SUPERCOMPENSACAO";
    descricao = "✓ Janela ideal — treinar agora para máximo ganho";
  } else {
    fase = "DETRAINING";
    descricao = "Janela fechada — treinar agora para manter";
  }

  return {
    musculo,
    fase,
    diasDesde,
    janela_inicio: timeline.supercomp[0],
    janela_fim: timeline.supercomp[1],
    pronto: fase === "SUPERCOMPENSACAO",
    descricao,
  };
}

// Fetch last session days for each muscle group from workout_logs
export async function fetchSupercompWindows(
  athleteId: string,
  muscleGroups: string[]
): Promise<SupercompWindow[]> {
  if (!athleteId || muscleGroups.length === 0) return [];
  const now = Date.now();
  const windows: SupercompWindow[] = [];

  for (const m of muscleGroups) {
    try {
      const { data } = await supabase
        .from("workout_logs")
        .select("logged_at, exercise_name")
        .eq("athlete_id", athleteId)
        .ilike("exercise_name", `%${m}%`)
        .order("logged_at", { ascending: false })
        .limit(1);
      const last = data?.[0]?.logged_at;
      const dias = last ? Math.floor((now - new Date(last).getTime()) / 86400000) : 99;
      windows.push(calcSupercompPhase(m, dias));
    } catch {
      windows.push(calcSupercompPhase(m, 99));
    }
  }
  return windows;
}
