import { supabase } from "@/integrations/supabase/client";

export type MovementPhase = {
  nome?: string;
  inicio?: number;
  fim?: number;
  cue?: string;
  musculos_ativos?: string[];
};

export type ExerciseAnalysis = {
  exercicio?: string;
  padrao?: string;
  musculos_primarios?: string[];
  musculos_secundarios?: string[];
  cue_principal?: string;
  cues?: string[];
  angulos?: string[];
  alerta?: string;
  frase?: string;
  musculos?: Record<string, number>;
  fases?: MovementPhase[];
};

export type SavedExercise = {
  id: string;
  exercicio: string;
  padrao: string | null;
  source: string | null;
  notes: string | null;
  data: ExerciseAnalysis;
  times_used: number;
  created_at: string;
};

/** Chave usada para levar um exercício da biblioteca até o Overlay Studio. */
export const OVERLAY_HANDOFF_KEY = "nutrion.overlay.exercise";

export const MUSCLE_LABELS: Record<string, string> = {
  trapezio: "Trapézio",
  deltoide: "Deltóide",
  peitoral: "Peitoral",
  biceps: "Bíceps",
  triceps: "Tríceps",
  antebraco: "Antebraço",
  dorsal: "Dorsal",
  lombar: "Lombar",
  abdomen: "Core",
  obliquo: "Oblíquo",
  gluteo: "Glúteo",
  quadriceps: "Quadríceps",
  isquiotibial: "Isquiotibiais",
  adutor: "Adutores",
  panturrilha: "Panturrilha",
};

export type BilateralRow = {
  base: string;
  label: string;
  left: number;
  right: number;
  max: number;
  bilateral: boolean;
};

/** Agrupa as chaves *_e / *_d em linhas com intensidade por lado. */
export const groupBilateral = (musculos: Record<string, number> = {}): BilateralRow[] => {
  const rows = new Map<string, BilateralRow>();
  Object.entries(musculos).forEach(([key, value]) => {
    const intensity = Number(value) || 0;
    const side = key.endsWith("_e") ? "left" : key.endsWith("_d") ? "right" : null;
    const base = side ? key.slice(0, -2) : key;
    const label = MUSCLE_LABELS[base] || base.replace(/_/g, " ");
    const row = rows.get(base) || { base, label, left: 0, right: 0, max: 0, bilateral: !!side };
    if (side === "left") row.left = intensity;
    else if (side === "right") row.right = intensity;
    else { row.left = intensity; row.right = intensity; }
    if (side) row.bilateral = true;
    row.max = Math.max(row.left, row.right);
    rows.set(base, row);
  });
  return [...rows.values()].filter((r) => r.max > 0).sort((a, b) => b.max - a.max);
};

export const listExercises = async (): Promise<SavedExercise[]> => {
  const { data, error } = await supabase
    .from("exercise_library")
    .select("id, exercicio, padrao, source, notes, data, times_used, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as unknown as SavedExercise[];
};

export const saveExercise = async (analysis: ExerciseAnalysis, source = "overlay", notes?: string) => {
  const { data: auth } = await supabase.auth.getUser();
  const coachId = auth?.user?.id;
  if (!coachId) throw new Error("Sessão expirada. Entre novamente.");
  const { data, error } = await supabase
    .from("exercise_library")
    .insert({
      coach_id: coachId,
      exercicio: analysis.exercicio || "Exercício",
      padrao: analysis.padrao || null,
      source,
      notes: notes || null,
      data: analysis as unknown as never,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data?.id as string;
};

export const deleteExercise = async (id: string) => {
  const { error } = await supabase.from("exercise_library").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const markExerciseUsed = async (id: string, current: number) => {
  await supabase.from("exercise_library").update({ times_used: current + 1 }).eq("id", id);
};

export const sendToOverlay = (item: SavedExercise) => {
  try {
    localStorage.setItem(OVERLAY_HANDOFF_KEY, JSON.stringify({ id: item.id, data: item.data }));
  } catch { /* storage indisponível */ }
};

export const readOverlayHandoff = (): { id?: string; data: ExerciseAnalysis } | null => {
  try {
    const raw = localStorage.getItem(OVERLAY_HANDOFF_KEY);
    if (!raw) return null;
    localStorage.removeItem(OVERLAY_HANDOFF_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
