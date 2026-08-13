import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bell, Check, ClipboardList, Loader2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePatientTeam, useMyTeamInvites, useMyPatients } from "@/hooks/usePatientTeam";
import { useProfessionalAlerts } from "@/hooks/useProfessionalAlerts";
import { SCOPES, ROLE_META, CATEGORY_LABEL } from "@/lib/professionalScopes";
import TeamRoster from "@/components/team/TeamRoster";
import ProfessionalNotesPanel from "@/components/team/ProfessionalNotesPanel";
import ProfessionalAlertsPanel from "@/components/team/ProfessionalAlertsPanel";
import PatientTimelineList from "@/components/team/PatientTimelineList";
import InviteProfessionalDialog from "@/components/team/InviteProfessionalDialog";
import ProfRoleBadge from "@/components/team/ProfRoleBadge";

const CYAN = "#00D4FF";
const BG = "#03030a";

const label = (s: string) => ({
  fontFamily: "'Space Mono', monospace" as const,
  fontSize: 9,
  letterSpacing: "0.18em",
  color: `${CYAN}99`,
});

/* ---------------- Lista (sem paciente selecionado) ---------------- */

const TeamIndex = () => {
  const nav = useNavigate();
  const { patients, loading } = useMyPatients();
  const { invites, respond, loading: loadingInvites } = useMyTeamInvites();
  const { unread } = useProfessionalAlerts();

  return (
    <div className="space-y-6">
      <div>
        <div style={label("")}>HUB MULTI-PROFISSIONAL</div>
        <h1 className="text-foreground" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 26 }}>
          EQUIPES
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: 13 }}>
          Um paciente, múltiplos profissionais sincronizados.
        </p>
      </div>

      {!loadingInvites && invites.length > 0 && (
        <div className="space-y-3">
          <div style={label("")}>CONVITES RECEBIDOS</div>
          {invites.map((i) => {
            const scope = SCOPES[i.professional_role];
            return (
              <div key={i.id} className="p-4 space-y-2" style={{ border: `1px solid ${CYAN}44`, background: `${CYAN}0a` }}>
                <div className="text-foreground" style={{ fontSize: 14 }}>
                  Você foi convidado para acompanhar <strong>{i.patient_name}</strong> como{" "}
                  {ROLE_META[i.professional_role].label}.
                </div>
                {i.invite_message && (
                  <p className="text-muted-foreground italic" style={{ fontSize: 12 }}>"{i.invite_message}"</p>
                )}
                <div className="space-y-0.5">
                  {scope.canWrite.map((c) => (
                    <div key={c} className="text-foreground" style={{ fontSize: 12 }}>✅ {CATEGORY_LABEL[c]} (criar e editar)</div>
                  ))}
                  {scope.canRead.map((c) => (
                    <div key={c} className="text-muted-foreground" style={{ fontSize: 12 }}>👁️ {CATEGORY_LABEL[c]} (leitura)</div>
                  ))}
                  {scope.cannotSee.map((c) => (
                    <div key={c} style={{ fontSize: 12, color: "#FF6B6B" }}>❌ {CATEGORY_LABEL[c]}</div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={async () => { const e = await respond(i.id, true); toast[e ? "error" : "success"](e ? "Erro ao aceitar" : "Convite aceito"); }}
                    className="flex items-center gap-2 px-4 py-2"
                    style={{ background: CYAN, color: "#020205", fontWeight: 700, fontSize: 13 }}
                  >
                    <Check className="w-4 h-4" /> ACEITAR
                  </button>
                  <button
                    onClick={async () => { await respond(i.id, false); toast.success("Convite recusado"); }}
                    className="flex items-center gap-2 px-4 py-2 text-muted-foreground"
                    style={{ border: "1px solid #ffffff22", fontSize: 13 }}
                  >
                    <X className="w-4 h-4" /> RECUSAR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div style={label("")}>MEUS PACIENTES EM EQUIPE</div>
          {unread > 0 && (
            <span className="flex items-center gap-1" style={{ color: "#FFD700", fontSize: 11 }}>
              <Bell className="w-3 h-3" /> {unread} alerta(s)
            </span>
          )}
        </div>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: CYAN }} />
        ) : patients.length === 0 ? (
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>
            Você ainda não participa de nenhuma equipe. Abra um paciente no painel e convide outros profissionais.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {patients.map((p) => (
              <button
                key={p.id}
                onClick={() => nav(`/coach/equipe/${p.id}`)}
                className="p-4 text-left space-y-2 hover:scale-[1.01] transition-transform"
                style={{ border: `1px solid ${CYAN}33`, background: `${CYAN}08` }}
              >
                <div className="text-foreground" style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                <ProfRoleBadge role={p.role} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div style={label("")}>ALERTAS DA EQUIPE</div>
        <ProfessionalAlertsPanel />
      </div>
    </div>
  );
};

/* ---------------- Hub do paciente ---------------- */

type Tab = "equipe" | "notas" | "timeline" | "alertas" | "permissoes";

const PatientHub = ({ patientId }: { patientId: string }) => {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("equipe");
  const [inviting, setInviting] = useState(false);
  const [patient, setPatient] = useState<{ name: string; email: string | null } | null>(null);
  const { team, myRole, permissions, loading, refetch } = usePatientTeam(patientId);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", patientId)
        .maybeSingle();
      setPatient({ name: (data as any)?.full_name || (data as any)?.email || "Paciente", email: (data as any)?.email ?? null });
    })();
  }, [patientId]);

  const tabs: { id: Tab; label: string }[] = useMemo(() => [
    { id: "equipe", label: "Equipe" },
    { id: "notas", label: "Notas 📝" },
    { id: "timeline", label: "Timeline ⏱️" },
    { id: "alertas", label: "Alertas 🔔" },
    { id: "permissoes", label: "Meu escopo" },
  ], []);

  return (
    <div className="space-y-5">
      <button onClick={() => nav("/coach/equipe")} className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 12 }}>
        <ArrowLeft className="w-4 h-4" /> Equipes
      </button>

      <div className="space-y-1">
        <div style={label("")}>PERFIL COMPARTILHADO</div>
        <h1 className="text-foreground" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 24 }}>
          {patient?.name}
        </h1>
        {myRole ? <ProfRoleBadge role={myRole} size="md" /> : (
          <p style={{ fontSize: 12, color: "#FFD700" }}>
            Você ainda não é membro ativo da equipe deste paciente — visualização limitada.
          </p>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-3 py-2 whitespace-nowrap"
            style={{
              border: `1px solid ${tab === t.id ? CYAN : "#ffffff1a"}`,
              background: tab === t.id ? `${CYAN}18` : "transparent",
              color: tab === t.id ? CYAN : "#8892a6",
              fontFamily: "Rajdhani, sans-serif",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: CYAN }} />
      ) : (
        <>
          {tab === "equipe" && <TeamRoster team={team} onInvite={() => setInviting(true)} />}
          {tab === "notas" && <ProfessionalNotesPanel patientId={patientId} myRole={myRole} readOnly={!myRole} />}
          {tab === "timeline" && <PatientTimelineList patientId={patientId} />}
          {tab === "alertas" && <ProfessionalAlertsPanel patientId={patientId} />}
          {tab === "permissoes" && (
            <div className="space-y-2">
              {!permissions && <p className="text-muted-foreground" style={{ fontSize: 13 }}>Sem escopo definido para este paciente.</p>}
              {permissions && (
                <>
                  <div style={label("")}>PODE CRIAR E EDITAR</div>
                  {permissions.canWrite.map((c) => (
                    <div key={c} className="text-foreground" style={{ fontSize: 13 }}>✅ {CATEGORY_LABEL[c]}</div>
                  ))}
                  <div className="pt-2" style={label("")}>SOMENTE LEITURA</div>
                  {permissions.canRead.map((c) => (
                    <div key={c} className="text-muted-foreground" style={{ fontSize: 13 }}>👁️ {CATEGORY_LABEL[c]}</div>
                  ))}
                  <div className="pt-2" style={label("")}>NÃO VISÍVEL</div>
                  {permissions.cannotSee.map((c) => (
                    <div key={c} style={{ fontSize: 13, color: "#FF6B6B" }}>❌ {CATEGORY_LABEL[c]}</div>
                  ))}
                </>
              )}
            </div>
          )}
        </>
      )}

      {inviting && patient && (
        <InviteProfessionalDialog
          patientId={patientId}
          patientName={patient.name}
          onClose={() => setInviting(false)}
          onInvited={refetch}
        />
      )}
    </div>
  );
};

const PatientTeamHubPage = () => {
  const { patientId } = useParams();
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: BG }}>
      <div className="max-w-5xl mx-auto">
        {patientId ? <PatientHub patientId={patientId} /> : <TeamIndex />}
      </div>
    </div>
  );
};

export default PatientTeamHubPage;
