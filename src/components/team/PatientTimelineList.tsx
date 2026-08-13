import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_META, isProfessionalRole } from "@/lib/professionalScopes";

interface Row {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  actor_name: string | null;
  event_type: string;
  title: string;
  description: string | null;
  data_category: string | null;
  created_at: string;
}

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(Date.now() - 86400000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const fmt = d.toLocaleDateString("pt-BR");
  if (same(d, today)) return `HOJE · ${fmt}`;
  if (same(d, yest)) return `ONTEM · ${fmt}`;
  return fmt;
};

const PatientTimelineList = ({ patientId }: { patientId: string }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [names, setNames] = useState<Record<string, { name: string; role: string | null }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("patient_timeline")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(100);
      const list = (data || []) as any as Row[];
      setRows(list);
      const ids = Array.from(new Set(list.map((r) => r.actor_id).filter(Boolean))) as string[];
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, professional_role")
          .in("user_id", ids);
        const map: Record<string, { name: string; role: string | null }> = {};
        (profs || []).forEach((p: any) => {
          map[p.user_id] = { name: p.full_name || p.email || "Usuário", role: p.professional_role ?? null };
        });
        setNames(map);
      }
      setLoading(false);
    })();
  }, [patientId]);

  if (loading) return <p className="text-muted-foreground" style={{ fontSize: 13 }}>Carregando timeline…</p>;
  if (!rows.length) return <p className="text-muted-foreground" style={{ fontSize: 13 }}>Nenhum evento registrado ainda.</p>;

  let lastDay = "";

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const label = dayLabel(r.created_at);
        const showDay = label !== lastDay;
        lastDay = label;
        const actor = r.actor_id ? names[r.actor_id] : undefined;
        const roleKey = r.actor_role ?? actor?.role ?? null;
        const meta = isProfessionalRole(roleKey) ? ROLE_META[roleKey] : null;
        const color = meta?.color || "#8892a6";
        return (
          <div key={r.id}>
            {showDay && (
              <div
                className="mt-4 mb-2"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.18em", color: "#8892a6" }}
              >
                {label}
              </div>
            )}
            <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 16 }}>
              <div className="flex items-center gap-2" style={{ fontSize: 11, color }}>
                <Clock className="w-3 h-3" />
                {new Date(r.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                <span>{meta?.emoji} {actor?.name || r.actor_name || "Sistema"}</span>
                {meta && <span style={{ opacity: 0.7 }}>({meta.short})</span>}
              </div>
              <div className="text-foreground" style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
              {r.description && <div className="text-muted-foreground" style={{ fontSize: 12 }}>{r.description}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PatientTimelineList;
