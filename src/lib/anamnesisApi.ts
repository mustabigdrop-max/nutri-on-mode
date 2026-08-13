import { supabase } from "@/integrations/supabase/client";
import {
  ANAMNESIS_SECTIONS,
  buildAlerts,
  countCompletedSections,
  generateInviteToken,
  rowToData,
  type AnamnesisData,
  type AnamnesisMode,
  type AnamnesisRow,
  type AnamnesisStatus,
} from "@/lib/anamnesis";

const EXPIRY_DAYS = 7;

export async function listCoachAnamnesis(coachId: string): Promise<AnamnesisRow[]> {
  const { data, error } = await supabase
    .from("anamnesis")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as AnamnesisRow[];
}

export async function getLatestAnamnesisForAthlete(athleteId: string): Promise<AnamnesisRow | null> {
  const { data, error } = await supabase
    .from("anamnesis")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as AnamnesisRow) || null;
}

export async function createAnamnesis(params: {
  coachId: string;
  athleteId?: string | null;
  athleteName?: string | null;
  mode: AnamnesisMode;
}): Promise<AnamnesisRow> {
  const expires = new Date(Date.now() + EXPIRY_DAYS * 86400000).toISOString();
  const { data, error } = await supabase
    .from("anamnesis")
    .insert({
      coach_id: params.coachId,
      athlete_id: params.athleteId ?? null,
      athlete_name: params.athleteName ?? null,
      mode: params.mode,
      status: "pending",
      invite_token: generateInviteToken(),
      expires_at: expires,
      total_sections: ANAMNESIS_SECTIONS.length,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as AnamnesisRow;
}

/** Salva pelo coach ou pelo próprio atleta autenticado */
export async function saveAnamnesis(
  id: string,
  data: AnamnesisData,
  status: AnamnesisStatus
): Promise<void> {
  const payload: Record<string, any> = {
    sections_completed: countCompletedSections(data),
    alerts: buildAlerts(data),
    status,
    completed_at: status === "completed" ? new Date().toISOString() : null,
  };
  for (const s of ANAMNESIS_SECTIONS) payload[s.key] = data[s.key] || {};
  const { error } = await supabase.from("anamnesis").update(payload as never).eq("id", id);
  if (error) throw error;
}

/** Leitura pública via token (cliente sem login) */
export async function getAnamnesisByToken(token: string): Promise<AnamnesisRow | null> {
  const { data, error } = await supabase.rpc("get_anamnesis_by_token", { _token: token });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as unknown as AnamnesisRow) || null;
}

/** Escrita pública via token */
export async function saveAnamnesisByToken(
  token: string,
  data: AnamnesisData,
  status: AnamnesisStatus
): Promise<void> {
  const payload: Record<string, any> = {};
  for (const s of ANAMNESIS_SECTIONS) payload[s.key] = data[s.key] || {};
  const { error } = await supabase.rpc("save_anamnesis_by_token", {
    _token: token,
    _payload: payload,
    _sections_completed: countCompletedSections(data),
    _status: status,
    _alerts: buildAlerts(data),
  });
  if (error) throw error;
}

export { rowToData };
