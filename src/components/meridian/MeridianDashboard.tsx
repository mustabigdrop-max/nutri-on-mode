// MERIDIAN — Dashboard com SITREP + timeline + targets + warnings.
import MeridianTimeline from "./MeridianTimeline";
import MeridianCycleTracker from "./MeridianCycleTracker";
import MeridianCheckpointForm from "./MeridianCheckpointForm";
import MeridianCheckpointHistory from "./MeridianCheckpointHistory";
import MeridianDrugTestCalendar from "./MeridianDrugTestCalendar";
import { PHASE_LABELS, type MeridianCompetition, type MeridianPlan } from "@/lib/meridian/types";
import { getCurrentPhase, daysBetween, formatDate } from "@/lib/meridian/calculator";

interface Props {
  plan: MeridianPlan;
  competition: MeridianCompetition;
  onReset?: () => void;
}

const ACCENT = "#B8922A";

export default function MeridianDashboard({ plan, competition, onReset }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const daysToStage = Math.max(daysBetween(today, competition.competition_date), 0);
  const weeksToStage = Math.floor(daysToStage / 7);
  const currentPhase = getCurrentPhase(plan);

  const viabColor =
    plan.viability_status === "GREEN" ? "#4ade80" : plan.viability_status === "YELLOW" ? "#facc15" : "#ef4444";

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        color: "#e8e8e8",
        display: "grid",
        gap: 18,
      }}
    >
      {/* SITREP HEADER */}
      <div
        style={{
          background: "rgba(184,146,42,0.06)",
          border: "1px solid rgba(184,146,42,0.4)",
          borderLeft: `4px solid ${ACCENT}`,
          padding: 20,
          borderRadius: 4,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: "#7a7a7a",
            marginBottom: 6,
          }}
        >
          SITREP // OPERAÇÃO MERIDIAN
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: ACCENT, letterSpacing: 1 }}>
            {weeksToStage} SEM
          </div>
          <div style={{ fontSize: 13, color: "#b8b8b8" }}>
            até <strong style={{ color: "#e8e8e8" }}>{competition.name}</strong> · {formatDate(competition.competition_date)}
          </div>
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Pill label="FASE ATIVA" value={PHASE_LABELS[currentPhase]} color={ACCENT} />
          <Pill label="VIABILIDADE" value={plan.viability_status} color={viabColor} />
          <Pill label="BUFFER" value={`${plan.buffer_weeks} sem`} color="#7a7a7a" />
        </div>
      </div>

      {/* TARGETS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="PESO DE PALCO" value={`${plan.stage_target_weight_kg} kg`} />
        <Card title="BF DE PALCO" value={`${plan.stage_target_bf_percent}%`} />
      </div>

      {/* TIMELINE */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: 18,
          borderRadius: 4,
        }}
      >
        <MeridianTimeline plan={plan} competitionDate={competition.competition_date} />
      </div>

      {/* CYCLE TRACKER — feminino */}
      {["WOMENS_BODYBUILDING","WOMENS_PHYSIQUE","FIGURE","FITNESS","WELLNESS","BIKINI"].includes(competition.category) && (
        <MeridianCycleTracker />
      )}

      {/* DRUG TEST CALENDAR — federações naturais */}
      {competition.is_natural_federation && (
        <MeridianDrugTestCalendar
          competitionId={competition.id}
          planId={plan.id}
          federation={competition.federation}
        />
      )}

      {/* LIFESTYLE ROUTINE — Track Lifestyle */}
      {plan.calculation_inputs?.athlete_snapshot?.athlete_track === "LIFESTYLE" && (
        <MeridianLifestyleRoutine
          planId={plan.id}
          defaultBfMin={Number(plan.stage_target_bf_percent) - 1}
          defaultBfMax={Number(plan.stage_target_bf_percent) + 2}
        />
      )}

      {/* CHECKPOINT SEMANAL — Bloco 3 */}
      <MeridianCheckpointForm plan={plan} competitionId={competition.id} />

      {/* HISTÓRICO DE CHECKPOINTS E AJUSTES */}
      <MeridianCheckpointHistory planId={plan.id} />




      {/* WARNINGS */}
      {plan.warnings && plan.warnings.length > 0 && (
        <div
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderLeft: "4px solid #ef4444",
            padding: 16,
            borderRadius: 4,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 3,
              color: "#ef4444",
              marginBottom: 8,
            }}
          >
            SITREP // ALERTAS DE VIABILIDADE
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
            {plan.warnings.map((w, i) => (
              <li key={i} style={{ color: "#fcd5d5" }}>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#999",
            padding: "10px 16px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: 2,
            cursor: "pointer",
            borderRadius: 3,
            justifySelf: "start",
          }}
        >
          ◀ NOVA OPERAÇÃO
        </button>
      )}
    </div>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${color}55`,
        borderRadius: 2,
        fontSize: 11,
        letterSpacing: 1,
      }}
    >
      <span style={{ color: "#7a7a7a", marginRight: 6 }}>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: 16,
        borderRadius: 4,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a7a7a", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: ACCENT }}>{value}</div>
    </div>
  );
}
