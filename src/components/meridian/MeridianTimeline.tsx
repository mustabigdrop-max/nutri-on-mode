// MERIDIAN — Timeline horizontal das 7 fases.
import { PHASE_COLORS } from "@/lib/meridian/constants";
import { PHASE_LABELS, type MeridianPhase, type MeridianPlan } from "@/lib/meridian/types";
import { formatDate, getCurrentPhase } from "@/lib/meridian/calculator";

interface Props {
  plan: MeridianPlan;
  competitionDate: string;
}

interface PhaseRow {
  phase: MeridianPhase;
  start: string;
  end: string;
}

export default function MeridianTimeline({ plan, competitionDate }: Props) {
  const peakEnd = new Date(plan.peak_week_start_date);
  peakEnd.setDate(peakEnd.getDate() + 7);
  const peakEndStr = peakEnd.toISOString().slice(0, 10);

  const rows: PhaseRow[] = [
    { phase: "OFF_SEASON", start: plan.off_season_end_date, end: plan.pre_prep_start_date },
    { phase: "PRE_PREP", start: plan.pre_prep_start_date, end: plan.diet_phase_start_date },
    { phase: "DIET_PRINCIPAL", start: plan.diet_phase_start_date, end: plan.hard_cut_start_date },
    { phase: "HARD_CUT", start: plan.hard_cut_start_date, end: plan.final_sharpening_start_date },
    { phase: "FINAL_SHARPENING", start: plan.final_sharpening_start_date, end: plan.peak_week_start_date },
    { phase: "PEAK_WEEK", start: plan.peak_week_start_date, end: competitionDate },
    { phase: "POST_STAGE_RECOVERY", start: competitionDate, end: plan.post_stage_recovery_end_date },
  ];

  const current = getCurrentPhase(plan);

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 3,
          color: "#7a7a7a",
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        SITREP // TIMELINE OPERACIONAL
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {rows.map((r) => {
          const isActive = r.phase === current;
          const color = PHASE_COLORS[r.phase];
          return (
            <div
              key={r.phase}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 200px",
                gap: 12,
                alignItems: "center",
                padding: "10px 14px",
                background: isActive ? "rgba(184,146,42,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isActive ? "#B8922A" : "rgba(255,255,255,0.05)"}`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 3,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: isActive ? "#B8922A" : "#e8e8e8",
                  textTransform: "uppercase",
                }}
              >
                {PHASE_LABELS[r.phase]}
              </div>
              <div
                style={{
                  height: 4,
                  background: `linear-gradient(to right, ${color}, ${color}33)`,
                  borderRadius: 2,
                }}
              />
              <div style={{ fontSize: 11, color: "#999", textAlign: "right", letterSpacing: 0.5 }}>
                {formatDate(r.start)} → {formatDate(r.end)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
