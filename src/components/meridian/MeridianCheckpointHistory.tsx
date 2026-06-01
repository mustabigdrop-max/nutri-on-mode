// MERIDIAN — Histórico de checkpoints + ajustes + análise IA (Bloco 3 + 9.2).
import { useMeridianCheckpoints } from "@/hooks/useMeridianCheckpoints";
import { formatDate } from "@/lib/meridian/calculator";
import MeridianCheckpointNarrative from "./MeridianCheckpointNarrative";

const ACCENT = "#B8922A";

interface Props {
  planId: string;
}

export default function MeridianCheckpointHistory({ planId }: Props) {
  const { checkpoints, adjustments, loading } = useMeridianCheckpoints(planId);

  if (loading) {
    return (
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#7a7a7a", fontSize: 12 }}>
        Carregando histórico...
      </div>
    );
  }

  if (checkpoints.length === 0) {
    return (
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: "#7a7a7a",
          fontSize: 12,
          padding: 16,
          border: "1px dashed rgba(255,255,255,0.1)",
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        SEM CHECKPOINTS REGISTRADOS — submeta o primeiro SITREP para ativar recalibração.
      </div>
    );
  }

  const adjByCp = adjustments.reduce<Record<string, typeof adjustments[0]>>((acc, a) => {
    if (a.checkpoint_id) acc[a.checkpoint_id] = a;
    return acc;
  }, {});

  return (
    <div style={{ display: "grid", gap: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a7a7a" }}>
        HISTÓRICO // CHECKPOINTS & AJUSTES
      </div>
      {checkpoints.map((cp) => {
        const adj = adjByCp[cp.id];
        return (
          <div
            key={cp.id}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderLeft: `3px solid ${ACCENT}`,
              padding: 14,
              borderRadius: 3,
              color: "#e8e8e8",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>
                {formatDate(cp.checkpoint_date)}
              </div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#7a7a7a" }}>
                {cp.current_phase ?? "—"}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                gap: 8,
                marginTop: 8,
                fontSize: 11,
              }}
            >
              <Stat label="PESO" value={cp.weight_kg ? `${cp.weight_kg} kg` : "—"} />
              <Stat label="BF" value={cp.bf_percent ? `${cp.bf_percent}%` : "—"} />
              <Stat label="ENERGIA" value={cp.energy_level ? `${cp.energy_level}/10` : "—"} />
              <Stat label="SONO" value={cp.sleep_quality ? `${cp.sleep_quality}/10` : "—"} />
              <Stat label="TREINO" value={cp.training_performance ? `${cp.training_performance}/10` : "—"} />
              <Stat label="ADERÊNCIA" value={cp.adherence_pct ? `${cp.adherence_pct}%` : "—"} />
            </div>
            {adj && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 3,
                  fontSize: 11,
                  borderLeft: `2px solid ${adj.kcal_delta === 0 ? "#7a7a7a" : adj.kcal_delta < 0 ? "#ef4444" : "#4ade80"}`,
                }}
              >
                <div style={{ color: ACCENT, letterSpacing: 2, fontSize: 9, marginBottom: 4 }}>
                  AJUSTE // {adj.adjustment_type}
                </div>
                <div style={{ color: "#b8b8b8" }}>
                  Δ {adj.kcal_delta >= 0 ? "+" : ""}{adj.kcal_delta} kcal · cardio {adj.cardio_delta_min >= 0 ? "+" : ""}{adj.cardio_delta_min} min
                </div>
                {adj.reason && <div style={{ marginTop: 4, color: "#999" }}>{adj.reason}</div>}
              </div>
            )}
            {cp.notes && (
              <div style={{ marginTop: 8, fontSize: 11, color: "#999", fontStyle: "italic" }}>
                "{cp.notes}"
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: 1, color: "#7a7a7a" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}
