import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  SCOPES, ROLE_META, isProfessionalRole,
  type DataCategory, type ProfessionalRole, type ProfessionalScope,
} from "@/lib/professionalScopes";

export interface TeamMember {
  id: string;
  patient_id: string;
  professional_id: string;
  professional_role: ProfessionalRole;
  status: "pending" | "active" | "inactive" | "rejected";
  invited_by: string | null;
  invite_message: string | null;
  patient_consent: boolean;
  accepted_at: string | null;
  created_at: string;
  name: string;
  email: string | null;
  registration_number: string | null;
  registration_type: string | null;
}

const mapRow = (row: any, prof?: any): TeamMember => ({
  id: row.id,
  patient_id: row.patient_id,
  professional_id: row.professional_id,
  professional_role: isProfessionalRole(row.professional_role) ? row.professional_role : "nutricionista",
  status: row.status,
  invited_by: row.invited_by,
  invite_message: row.invite_message ?? null,
  patient_consent: !!row.patient_consent,
  accepted_at: row.accepted_at,
  created_at: row.created_at,
  name: prof?.full_name || prof?.email || "Profissional",
  email: prof?.email ?? null,
  registration_number: prof?.registration_number ?? null,
  registration_type: prof?.registration_type ?? null,
});

async function hydrate(rows: any[]): Promise<TeamMember[]> {
  if (!rows.length) return [];
  const ids = Array.from(new Set(rows.map((r) => r.professional_id)));
  const { data: profs } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, registration_number, registration_type")
    .in("user_id", ids);
  const byId = new Map((profs || []).map((p: any) => [p.user_id, p]));
  return rows.map((r) => mapRow(r, byId.get(r.professional_id)));
}

/** Equipe de um paciente + permissões do profissional logado sobre ele */
export function usePatientTeam(patientId?: string | null) {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [myRole, setMyRole] = useState<ProfessionalRole | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!patientId) { setTeam([]); setMyRole(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("patient_team")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: true });
    const rows = (data || []) as any[];
    setTeam(await hydrate(rows));
    const mine = rows.find((r) => r.professional_id === user?.id && r.status === "active");
    setMyRole(isProfessionalRole(mine?.professional_role) ? mine.professional_role : null);
    setLoading(false);
  }, [patientId, user?.id]);

  useEffect(() => { load(); }, [load]);

  const permissions: ProfessionalScope | null = myRole ? SCOPES[myRole] : null;

  const canWrite = useCallback(
    (c: DataCategory) => !!permissions?.canWrite.includes(c),
    [permissions],
  );
  const canRead = useCallback(
    (c: DataCategory) => !!permissions && (permissions.canWrite.includes(c) || permissions.canRead.includes(c)),
    [permissions],
  );
  const canSee = useCallback(
    (c: DataCategory) => !!permissions && !permissions.cannotSee.includes(c),
    [permissions],
  );

  const activeTeam = useMemo(() => team.filter((m) => m.status === "active"), [team]);
  const pendingTeam = useMemo(() => team.filter((m) => m.status === "pending"), [team]);

  return { team, activeTeam, pendingTeam, myRole, permissions, canWrite, canRead, canSee, loading, refetch: load, ROLE_META };
}

/** Compat com o blueprint: hook só de permissões */
export function usePatientPermissions(patientId: string) {
  const { permissions, activeTeam, canWrite, canRead, canSee, loading } = usePatientTeam(patientId);
  return { permissions, teamMembers: activeTeam, canWrite, canRead, canSee, loading };
}

/** Convites recebidos pelo profissional logado (pendentes) */
export function useMyTeamInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<(TeamMember & { patient_name: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setInvites([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("patient_team")
      .select("*")
      .eq("professional_id", user.id)
      .eq("status", "pending");
    const rows = (data || []) as any[];
    const patientIds = Array.from(new Set(rows.map((r) => r.patient_id)));
    const { data: patients } = patientIds.length
      ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", patientIds)
      : { data: [] as any[] };
    const byId = new Map((patients || []).map((p: any) => [p.user_id, p]));
    const hydrated = await hydrate(rows);
    setInvites(hydrated.map((m) => ({
      ...m,
      patient_name: byId.get(m.patient_id)?.full_name || byId.get(m.patient_id)?.email || "Paciente",
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const respond = useCallback(async (id: string, accept: boolean) => {
    const { error } = await supabase
      .from("patient_team")
      .update(accept
        ? { status: "active", accepted_at: new Date().toISOString() }
        : { status: "rejected" })
      .eq("id", id);
    if (!error) await load();
    return error;
  }, [load]);

  return { invites, loading, respond, refetch: load };
}

/** Pacientes em que o profissional logado atua (via patient_team) */
export function useMyPatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<{ id: string; name: string; email: string | null; role: ProfessionalRole }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) { setPatients([]); setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase
        .from("patient_team")
        .select("patient_id, professional_role")
        .eq("professional_id", user.id)
        .eq("status", "active");
      const rows = (data || []) as any[];
      const ids = Array.from(new Set(rows.map((r) => r.patient_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ids)
        : { data: [] as any[] };
      const byId = new Map((profs || []).map((p: any) => [p.user_id, p]));
      setPatients(rows.map((r) => ({
        id: r.patient_id,
        name: byId.get(r.patient_id)?.full_name || byId.get(r.patient_id)?.email || "Paciente",
        email: byId.get(r.patient_id)?.email ?? null,
        role: isProfessionalRole(r.professional_role) ? r.professional_role : "nutricionista",
      })));
      setLoading(false);
    })();
  }, [user]);

  return { patients, loading };
}
