import { Droplets } from "lucide-react";
import { NP, mono, labelStyle, cardStyle } from "./theme";
import { computeHydration } from "@/lib/nutritionPeriodization";

interface Props {
  weightKg: number;
  workoutMinutes?: number;
  workoutLabel?: string | null;
  muscleGroups?: string[];
  isTrainingDay: boolean;
  variant?: "card" | "row";
}

/** FEATURE 6 — Hidratação dinâmica (ACSM 35ml/kg + treino). */
export default function DynamicHydrationCard({
  weightKg, workoutMinutes, workoutLabel, muscleGroups, isTrainingDay, variant = "card",
}: Props) {
  const h = computeHydration({ weightKg, workoutMinutes, workoutLabel, muscleGroups, isTrainingDay });

  if (variant === "row") {
    return (
      <div style={{ padding: "10px 12px", borderRadius: 8, background: NP.card2, border: `1px solid ${NP.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: NP.text, fontFamily: mono }}>💧 Hidratação</span>
          <span style={{ fontSize: 12, color: NP.purple, fontFamily: mono, fontWeight: 700 }}>
            {h.liters.toFixed(1)}L · {h.glasses} copos
          </span>
        </div>
        <p style={{ fontSize: 9, color: NP.muted, fontFamily: mono, margin: "4px 0 0" }}>{h.note}</p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ ...labelStyle, color: NP.purple }}>Hidratação dinâmica</p>
        <Droplets style={{ width: 14, height: 14, color: NP.purple }} />
      </div>
      <p style={{ fontSize: 26, fontWeight: 900, color: NP.purple, fontFamily: mono, margin: 0, lineHeight: 1 }}>
        {h.liters.toFixed(1)}L
        <span style={{ fontSize: 12, color: NP.muted, marginLeft: 6 }}>{h.glasses} copos</span>
      </p>
      <p style={{ fontSize: 10, color: NP.muted, fontFamily: mono, margin: "6px 0 0" }}>{h.note}</p>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {[
          { l: "Base", v: `${h.baseLiters.toFixed(1)}L` },
          { l: "Treino", v: `+${h.bonusWorkoutLiters.toFixed(2)}L` },
          { l: "Intensidade", v: `+${h.bonusIntensityLiters.toFixed(1)}L` },
        ].map((x) => (
          <div key={x.l} style={{ flex: 1, background: NP.card2, border: `1px solid ${NP.border}`, borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
            <p style={{ fontSize: 11, color: NP.text, fontFamily: mono, fontWeight: 700, margin: 0 }}>{x.v}</p>
            <p style={{ fontSize: 8, color: NP.muted, fontFamily: mono, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{x.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
