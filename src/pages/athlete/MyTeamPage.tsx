import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SCOPES, ROLE_META, CATEGORY_LABEL, isProfessionalRole, type ProfessionalRole } from "@/lib/professionalScopes";
import ProfRoleBadge from "@/components/team/ProfRoleBadge";
import PatientTimelineList from "@/components/team/PatientTimelineList";

const CYAN = "#00D4FF";
const BG = "#03030a";

interface Row {
  id: string;
  professional_id: string;
  professional_role: ProfessionalRole;
  status: string;
  patient_consent: boolean;
  name: string;
  registration_number: string | null;
  registration_type: string | null;
}

const MyTeamPage = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("patient_team")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: true });
    const list = (data || []) as any[];
    const ids = Array.from(new Set(list.map((r) => r.professional_id)));
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("user_id, full_name, email, registration_number, registration_type").in("user_id", ids)
      : { data: [] as any[] };
    const byId = new Map((profs || []).map((p: any) => [p.user_id, p]));
    setRows(list.map((r) => ({
      id: r.id,
      professional_id: r.professional_id,
      professional_role: isProfessionalRole(r.professional_role) ? r.professional_role : "nutricionista",
      status: r.status,
      patient_consent: !!r.patient_consent,
      name: byId.get(r.professional_id)?.full_name || byId.get(r.professional_id)?.email || "Profissional",
      registration_number: byId.get(r.professional_id)?.registration_number ?? null,
      registration_type: byId.get(r.professional_id)?.registration_type ?? null,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const consent = async (id: string, authorize: boolean) => {
    const { error } = await supabase
      .from("patient_team")
      .update(authorize
        ? { patient_consent: true, patient_consent_at: new Date().toISOString() }
        : { patient_consent: false, status: "rejected" })
      .eq("id", id);
    if (error) { toast.error("Não foi possível registrar sua escolha"); return; }
    toast.success(authorize ? "Compartilhamento autorizado" : "Compartilhamento recusado");
    load();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-28" style={{ background: BG }}>
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 12 }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.18em", color: `${CYAN}99` }}>
            PRIVACIDADE E COMPARTILHAMENTO
          </div>
          <h1 className="text-foreground" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 26 }}>
            MINHA EQUIPE
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>
            Você controla quais profissionais acompanham seus dados.
          </p>
        </div>

        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: CYAN }} />
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>Nenhum profissional vinculado ainda.</p>
        ) : (
          rows.map((r) => {
            const scope = SCOPES[r.professional_role];
            const meta = ROLE_META[r.professional_role];
            return (
              <div key={r.id} className="p-4 space-y-3" style={{ border: `1px solid ${meta.color}33`, background: `${meta.color}0a` }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-foreground" style={{ fontSize: 16, fontWeight: 700 }}>{r.name}</span>
                  <ProfRoleBadge role={r.professional_role} registration={r.registration_number ? `${r.registration_type || meta.registration} ${r.registration_number}` : null} />
                </div>
                <div className="space-y-0.5">
                  {scope.canWrite.map((c) => (
                    <div key={c} className="text-foreground" style={{ fontSize: 12 }}>✅ {CATEGORY_LABEL[c]} (criar e editar)</div>
                  ))}
                  {scope.canRead.map((c) => (
                    <div key={c} className="text-muted-foreground" style={{ fontSize: 12 }}>👁️ {CATEGORY_LABEL[c]} (somente visualizar)</div>
                  ))}
                  {scope.cannotSee.map((c) => (
                    <div key={c} style={{ fontSize: 12, color: "#FF6B6B" }}>❌ {CATEGORY_LABEL[c]} (não visível)</div>
                  ))}
                </div>
                {r.patient_consent ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5" style={{ color: "#00C896", fontSize: 12 }}>
                      <ShieldCheck className="w-4 h-4" /> Compartilhamento autorizado
                    </span>
                    <button onClick={() => consent(r.id, false)} className="px-3 py-1.5 text-muted-foreground" style={{ border: "1px solid #ffffff22", fontSize: 12 }}>
                      Revogar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => consent(r.id, true)}
                      className="flex items-center gap-2 px-4 py-2"
                      style={{ background: CYAN, color: "#020205", fontWeight: 700, fontSize: 13 }}
                    >
                      <Check className="w-4 h-4" /> AUTORIZAR
                    </button>
                    <button
                      onClick={() => consent(r.id, false)}
                      className="flex items-center gap-2 px-4 py-2 text-muted-foreground"
                      style={{ border: "1px solid #ffffff22", fontSize: 13 }}
                    >
                      <X className="w-4 h-4" /> RECUSAR
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        {user && (
          <div className="space-y-2 pt-2">
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.18em", color: `${CYAN}99` }}>
              HISTÓRICO DA EQUIPE
            </div>
            <PatientTimelineList patientId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeamPage;
