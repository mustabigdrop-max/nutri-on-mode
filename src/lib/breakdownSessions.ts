import { supabase } from "@/integrations/supabase/client";

export type BreakdownAnalysis = {
  exercicio?: string;
  padrao?: string;
  musculos_primarios?: string[];
  musculos_secundarios?: string[];
  execucao?: { titulo?: string; descricao?: string; cue?: string; erro_comum?: string };
  musculos_ativos?: Record<string, number>;
  mce?: { mentalidade?: string; comportamento?: string; execucao_mce?: string };
  alerta_apex?: string;
  frase_impacto?: string;
};

export type BreakdownSession = {
  id: string;
  title: string;
  exercise: string | null;
  video_path: string | null;
  trim_start: number;
  trim_end: number;
  breakpoints: number[];
  analyses: (BreakdownAnalysis | null)[];
  created_at: string;
};

const BUCKET = "breakdown-videos";

function normalize(row: Record<string, unknown>): BreakdownSession {
  return {
    id: String(row.id),
    title: String(row.title ?? "Breakdown"),
    exercise: (row.exercise as string) ?? null,
    video_path: (row.video_path as string) ?? null,
    trim_start: Number(row.trim_start ?? 0),
    trim_end: Number(row.trim_end ?? 0),
    breakpoints: Array.isArray(row.breakpoints) ? (row.breakpoints as number[]) : [],
    analyses: Array.isArray(row.analyses) ? (row.analyses as (BreakdownAnalysis | null)[]) : [],
    created_at: String(row.created_at ?? ""),
  };
}

export async function listBreakdownSessions(limit = 20): Promise<BreakdownSession[]> {
  const { data, error } = await supabase
    .from("breakdown_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((r) => normalize(r as Record<string, unknown>));
}

export async function saveBreakdownSession(input: {
  file: File | null;
  title: string;
  exercise?: string | null;
  trimStart: number;
  trimEnd: number;
  breakpoints: number[];
  analyses: (BreakdownAnalysis | null)[];
}): Promise<BreakdownSession | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;

  let videoPath: string | null = null;
  if (input.file) {
    const ext = (input.file.name.split(".").pop() || "mp4").toLowerCase();
    const path = `${uid}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, input.file, {
      contentType: input.file.type || "video/mp4",
      upsert: false,
    });
    if (!upErr) videoPath = path;
  }

  const { data, error } = await supabase
    .from("breakdown_sessions")
    .insert({
      user_id: uid,
      title: input.title,
      exercise: input.exercise ?? null,
      video_path: videoPath,
      trim_start: input.trimStart,
      trim_end: input.trimEnd,
      breakpoints: input.breakpoints,
      analyses: input.analyses,
    })
    .select("*")
    .single();
  if (error) throw error;
  return normalize(data as Record<string, unknown>);
}

export async function getBreakdownVideoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 6);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function deleteBreakdownSession(session: BreakdownSession): Promise<void> {
  if (session.video_path) {
    await supabase.storage.from(BUCKET).remove([session.video_path]);
  }
  const { error } = await supabase.from("breakdown_sessions").delete().eq("id", session.id);
  if (error) throw error;
}
