import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MeridianPlanBuilder from "@/components/meridian/MeridianPlanBuilder";
import MeridianDashboard from "@/components/meridian/MeridianDashboard";
import { useMeridian } from "@/hooks/useMeridian";

export default function MeridianPage() {
  const navigate = useNavigate();
  const { plans, competitions, loading } = useMeridian();

  const activePlan = plans[0];
  const activeComp = activePlan
    ? competitions.find((c) => c.id === activePlan.competition_id)
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#03030a",
        color: "#e8e8e8",
        fontFamily: "'Space Grotesk', sans-serif",
        padding: "24px 20px 60px",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "none",
            color: "#999",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: 12,
            letterSpacing: 1,
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={14} /> VOLTAR
        </button>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 4,
              color: "#B8922A",
              marginBottom: 6,
            }}
          >
            MERIDIAN // ENGENHARIA REVERSA DE PREP
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 1,
              margin: 0,
              color: "#e8e8e8",
            }}
          >
            Operação Palco
          </h1>
          <div style={{ fontSize: 13, color: "#7a7a7a", marginTop: 6 }}>
            Cálculo determinístico de fases a partir da data da prova.
          </div>
        </div>

        {loading ? (
          <div style={{ color: "#7a7a7a", fontSize: 12, letterSpacing: 2 }}>
            CARREGANDO...
          </div>
        ) : activePlan && activeComp ? (
          <MeridianDashboard plan={activePlan as any} competition={activeComp as any} />
        ) : (
          <MeridianPlanBuilder />
        )}
      </div>
    </div>
  );
}
