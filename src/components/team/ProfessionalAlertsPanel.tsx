import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfessionalAlerts } from "@/hooks/useProfessionalAlerts";

const CYAN = "#00D4FF";

const ago = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `há ${Math.max(mins, 1)} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.floor(h / 24)} dia(s)`;
};

const ProfessionalAlertsPanel = ({ patientId }: { patientId?: string }) => {
  const { alerts, loading, setStatus } = useProfessionalAlerts(patientId);
  const nav = useNavigate();

  if (loading) return <p className="text-muted-foreground" style={{ fontSize: 13 }}>Carregando alertas…</p>;
  if (!alerts.length) return <p className="text-muted-foreground" style={{ fontSize: 13 }}>Nenhum alerta da equipe.</p>;

  return (
    <div className="space-y-3">
      {alerts.map((a) => {
        const resolved = a.status === "resolved";
        const color = resolved ? "#00C896" : "#FFD700";
        return (
          <div key={a.id} className="p-3 space-y-2" style={{ border: `1px solid ${color}44`, background: `${color}0d` }}>
            <div className="flex items-center gap-2" style={{ fontSize: 11, color }}>
              {resolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {resolved ? "RESOLVIDO" : a.status === "unread" ? "NOVO" : "LIDO"} · {ago(a.created_at)}
              {!patientId && <span className="text-muted-foreground">· {a.patient_name}</span>}
            </div>
            <p className="text-foreground" style={{ fontSize: 13, lineHeight: 1.5 }}>
              {a.actor_name ? `${a.actor_name}: ` : ""}{a.message}
            </p>
            <div className="flex flex-wrap gap-2">
              {a.action_url && (
                <button
                  onClick={() => nav(a.action_url!)}
                  className="px-3 py-1.5"
                  style={{ border: `1px solid ${CYAN}44`, color: CYAN, fontSize: 12 }}
                >
                  Ver detalhes
                </button>
              )}
              {!resolved && (
                <button
                  onClick={() => setStatus(a.id, "resolved")}
                  className="px-3 py-1.5"
                  style={{ border: "1px solid #00C89644", color: "#00C896", fontSize: 12 }}
                >
                  Marcar como resolvido
                </button>
              )}
              {a.status === "unread" && (
                <button
                  onClick={() => setStatus(a.id, "read")}
                  className="px-3 py-1.5 text-muted-foreground"
                  style={{ border: "1px solid #ffffff22", fontSize: 12 }}
                >
                  Marcar como lido
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfessionalAlertsPanel;
