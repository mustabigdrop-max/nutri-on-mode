// Badges e controles do sistema RIR (Reps In Reserve)
import {
  RIR_CONFIG,
  calcWeekRIR,
  getMinRIR,
  type RIRLevel,
} from "@/utils/rirSystem";

export function RIRBadge({
  exerciseName,
  rir,
  showWarning = true,
  showIntensity = true,
}: {
  exerciseName: string;
  rir: RIRLevel;
  showWarning?: boolean;
  showIntensity?: boolean;
}) {
  const cfg = RIR_CONFIG[rir];
  const minR = getMinRIR(exerciseName);
  const warn = showWarning && rir < minR;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: cfg.cor,
          background: cfg.bg,
          border: `0.5px solid ${cfg.border}`,
          borderRadius: 8,
          padding: "1px 7px",
          lineHeight: 1.4,
        }}
        title={cfg.descricao}
      >
        {cfg.label}
      </span>
      {showIntensity && (
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
          {cfg.intensidade}
        </span>
      )}
      {warn && (
        <span
          style={{
            fontSize: 9,
            color: "#EF4444",
            background: "rgba(239,68,68,0.1)",
            border: "0.5px solid rgba(239,68,68,0.25)",
            padding: "1px 6px",
            borderRadius: 6,
          }}
          title={`Exercício de alto risco — mínimo RIR ${minR}`}
        >
          ⚠ mín RIR {minR}
        </span>
      )}
    </span>
  );
}

export function MesocycleRIRPlanner({
  totalWeeks,
  currentWeek,
}: {
  totalWeeks: number;
  currentWeek: number;
}) {
  const weeklyRIR = Array.from({ length: totalWeeks }, (_, i) => ({
    semana: i + 1,
    rir: calcWeekRIR(i + 1, totalWeeks),
    atual: i + 1 === currentWeek,
  }));

  return (
    <div style={{ marginBottom: 16 }}>
      <p
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.08em",
          margin: "0 0 10px",
          textTransform: "uppercase",
        }}
      >
        Progressão de RIR — {totalWeeks} semanas
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {weeklyRIR.map((w) => {
          const cfg = RIR_CONFIG[w.rir];
          return (
            <div
              key={w.semana}
              style={{
                padding: "8px 12px",
                background: w.atual ? cfg.bg : "rgba(255,255,255,0.04)",
                border: `0.5px solid ${w.atual ? cfg.border : "rgba(255,255,255,0.08)"}`,
                borderRadius: 10,
                minWidth: 72,
                textAlign: "center",
                position: "relative",
              }}
            >
              {w.atual && (
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 8,
                    color: cfg.cor,
                    background: cfg.bg,
                    border: `0.5px solid ${cfg.border}`,
                    padding: "0 5px",
                    borderRadius: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  agora
                </div>
              )}
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: "0 0 3px" }}>
                Sem {w.semana}
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: w.atual ? cfg.cor : "rgba(255,255,255,0.5)",
                  margin: "0 0 2px",
                }}
              >
                RIR {w.rir}
              </p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", margin: 0 }}>
                {cfg.intensidade}
              </p>
            </div>
          );
        })}
      </div>
      {(() => {
        const current = weeklyRIR.find((w) => w.atual);
        if (!current) return null;
        const cfg = RIR_CONFIG[current.rir];
        return (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              background: cfg.bg,
              border: `0.5px solid ${cfg.border}`,
              borderRadius: 8,
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 600, color: cfg.cor, margin: "0 0 3px" }}>
              Semana {current.semana} — {cfg.label}
            </p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>
              {cfg.indicacao[0]}
            </p>
          </div>
        );
      })()}
    </div>
  );
}

export function SeriesRIRControl({
  exerciseName,
  serieIndex,
  currentRIR,
  onRIRChange,
}: {
  exerciseName: string;
  serieIndex: number;
  currentRIR: RIRLevel | null;
  onRIRChange: (rir: RIRLevel) => void;
}) {
  const minR = getMinRIR(exerciseName);
  const levels: RIRLevel[] = [3, 2, 1, 0];
  return (
    <div style={{ marginTop: 8 }}>
      <p
        style={{
          fontSize: 9,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.06em",
          margin: "0 0 5px",
          textTransform: "uppercase",
        }}
      >
        Série {serieIndex + 1} — RIR
      </p>
      <div style={{ display: "flex", gap: 5 }}>
        {levels.map((level) => {
          const cfg = RIR_CONFIG[level];
          const disabled = level < minR;
          const active = currentRIR === level;
          return (
            <button
              key={level}
              disabled={disabled}
              onClick={() => !disabled && onRIRChange(level)}
              title={disabled ? `Mínimo RIR ${minR} para este exercício` : cfg.indicacao[0]}
              style={{
                flex: 1,
                padding: "5px 0",
                fontSize: 11,
                fontWeight: 600,
                background: active ? cfg.bg : "transparent",
                border: `0.5px solid ${active ? cfg.border : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8,
                cursor: disabled ? "not-allowed" : "pointer",
                color: disabled
                  ? "rgba(255,255,255,0.15)"
                  : active
                    ? cfg.cor
                    : "rgba(255,255,255,0.4)",
                transition: "all .15s",
                opacity: disabled ? 0.4 : 1,
              }}
            >
              {level}
            </button>
          );
        })}
      </div>
    </div>
  );
}
