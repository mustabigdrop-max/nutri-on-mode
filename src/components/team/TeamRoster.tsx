import { UserPlus } from "lucide-react";
import { ROLE_META } from "@/lib/professionalScopes";
import type { TeamMember } from "@/hooks/usePatientTeam";

const CYAN = "#00D4FF";

const ago = (iso: string | null) => {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "hoje";
  return `há ${days} dia(s)`;
};

interface Props {
  team: TeamMember[];
  onInvite?: () => void;
}

const TeamRoster = ({ team, onInvite }: Props) => (
  <div className="space-y-3">
    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.18em", color: `${CYAN}99` }}>
      EQUIPE PROFISSIONAL
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {team.map((m) => {
        const meta = ROLE_META[m.professional_role];
        const Icon = meta.icon;
        const pending = m.status !== "active";
        return (
          <div
            key={m.id}
            className="p-3 space-y-1"
            style={{ border: `1px solid ${meta.color}33`, background: `${meta.color}0a`, opacity: pending ? 0.75 : 1 }}
          >
            <div className="flex items-center gap-2" style={{ color: meta.color, fontSize: 11, letterSpacing: "0.08em" }}>
              <Icon className="w-3.5 h-3.5" />
              {meta.label.toUpperCase()}
            </div>
            <div className="text-foreground truncate" style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</div>
            <div className="text-muted-foreground" style={{ fontSize: 11 }}>
              {m.registration_type || meta.registration} {m.registration_number || "—"}
            </div>
            <div style={{ fontSize: 11, color: pending ? "#FFD700" : "#00C896" }}>
              {m.status === "active" ? "● Ativo" : m.status === "pending" ? "○ Convite pendente" : m.status === "rejected" ? "○ Recusado" : "○ Inativo"}
              {m.status === "active" && !m.patient_consent && " · aguardando autorização do paciente"}
            </div>
            <div className="text-muted-foreground" style={{ fontSize: 11 }}>Entrou: {ago(m.accepted_at || m.created_at)}</div>
          </div>
        );
      })}
      {onInvite && (
        <button
          onClick={onInvite}
          className="flex items-center justify-center gap-2 p-4"
          style={{ border: `1px dashed ${CYAN}55`, color: CYAN, fontSize: 13, fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}
        >
          <UserPlus className="w-4 h-4" /> CONVIDAR PROFISSIONAL
        </button>
      )}
    </div>
  </div>
);

export default TeamRoster;
