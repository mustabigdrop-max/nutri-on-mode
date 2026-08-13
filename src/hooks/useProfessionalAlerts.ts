import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProfessionalAlert {
  id: string;
  patient_id: string;
  triggered_by: string | null;
  trigger_type: string;
  message: string;
  action_url: string | null;
  status: "unread" | "read" | "resolved";
  created_at: string;
  patient_name?: string;
  actor_name?: string;
}

export function useProfessionalAlerts(patientId?: string | null) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ProfessionalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setAlerts([]); setLoading(false); return; }
    setLoading(true);
    let q = supabase
      .from("professional_alerts")
      .select("*")
      .eq("target_professional", user.id)
      .order("created_at", { ascending: false })
      .limit(60);
    if (patientId) q = q.eq("patient_id", patientId);
    const { data } = await q;
    const rows = (data || []) as any[];
    const ids = Array.from(new Set([...rows.map((r) => r.patient_id), ...rows.map((r) => r.triggered_by)].filter(Boolean)));
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ids)
      : { data: [] as any[] };
    const byId = new Map((profs || []).map((p: any) => [p.user_id, p]));
    setAlerts(rows.map((r) => ({
      ...r,
      patient_name: byId.get(r.patient_id)?.full_name || "Paciente",
      actor_name: r.triggered_by ? (byId.get(r.triggered_by)?.full_name || "Profissional") : undefined,
    })));
    setLoading(false);
  }, [user, patientId]);

  useEffect(() => { load(); }, [load]);

  const setStatus = useCallback(async (id: string, status: "read" | "resolved") => {
    await supabase.from("professional_alerts").update({ status }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const unread = alerts.filter((a) => a.status === "unread").length;

  return { alerts, unread, loading, setStatus, refetch: load };
}
