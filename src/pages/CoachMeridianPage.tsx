// MERIDIAN — Página COACH: gerencia plano de prep de aluno vinculado.
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMeridianForPatient } from "@/hooks/useMeridianForPatient";
import MeridianPlanBuilder from "@/components/meridian/MeridianPlanBuilder";
import MeridianDashboard from "@/components/meridian/MeridianDashboard";

const ACCENT = "#B8922A";

export default function CoachMeridianPage() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const [patientName, setPatientName] = useState<string>("");
  const { competitions, plans, loading, error, reload } = useMeridianForPatient(patientId ?? null);

  useEffect(() => {
    if (!patientId) return;
    supabase
      .from("profiles")
      .select("full_name,email")
      .eq("user_id", patientId)
      .maybeSingle()
      .then(({ data }) => {
        setPatientName(data?.full_name || data?.email || "Atleta");
      });
  }, [patientId]);

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
          onClick={() => navigate("/coach/dashboard")}
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
          <ArrowLeft size={14} /> COACH DASHBOARD
        </button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: ACCENT, marginBottom: 6 }}>
            COACH · MERIDIAN PRESCRITO
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e8e8e8", letterSpacing: 1 }}>
            {patientName}
          </div>
          <div style={{ fontSize: 12, color: "#7a7a7a", marginTop: 4 }}>
            Operação tática de prep gerenciada pelo coach.
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.4)",
              padding: 12,
              borderRadius: 4,
              color: "#ef4444",
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ color: "#7a7a7a", fontSize: 13 }}>Carregando MERIDIAN do atleta...</div>
        ) : activePlan && activeComp ? (
          <MeridianDashboard
            plan={activePlan}
            competition={activeComp}
            allCompetitions={competitions}
            onReset={reload}
          />
        ) : (
          <MeridianPlanBuilder patientUserId={patientId} onCreated={reload} />
        )}
      </div>
    </div>
  );
}
