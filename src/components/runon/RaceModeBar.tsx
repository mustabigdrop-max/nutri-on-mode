/** RunON — Race Mode: barra de controle (distância, semanas para a prova, pace alvo). */
import { Flag, Minus, Plus, Power } from "lucide-react";
import { RC, mono, raj, SectionCard, Chip, RBadge } from "@/components/runon/runonUi";
import {
  RACE_DISTANCES, RaceModeConfig, fmtPace, racePhase,
} from "@/lib/raceMode";

export default function RaceModeBar({
  cfg, onChange,
}: {
  cfg: RaceModeConfig;
  onChange: (c: RaceModeConfig) => void;
}) {
  const phase = racePhase(cfg.weeksOut, cfg.distance);
  const meta = RACE_DISTANCES.find((d) => d.id === cfg.distance)!;

  const step = (field: "weeksOut" | "targetPaceSec", delta: number) => {
    if (field === "weeksOut") {
      onChange({ ...cfg, weeksOut: Math.min(24, Math.max(0, cfg.weeksOut + delta)) });
    } else {
      onChange({ ...cfg, targetPaceSec: Math.min(600, Math.max(150, cfg.targetPaceSec + delta)) });
    }
  };

  return (
    <SectionCard label="RACE MODE" icon={Flag} accent={cfg.enabled ? meta.color : RC.border} color={meta.color}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5, maxWidth: 420 }}>
          Ajusta automaticamente o Stride Planner e a Fuel Matrix conforme a prova e a semana de competição.
        </p>
        <button
          onClick={() => onChange({ ...cfg, enabled: !cfg.enabled })}
          className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors"
          style={{
            background: cfg.enabled ? `${meta.color}18` : RC.bg2,
            border: `1px solid ${cfg.enabled ? meta.color : RC.border}`,
          }}
        >
          <Power style={{ width: 13, height: 13, color: cfg.enabled ? meta.color : RC.muted }} />
          <span style={mono(8, cfg.enabled ? meta.color : RC.muted, 2)}>
            {cfg.enabled ? "ATIVO" : "DESATIVADO"}
          </span>
        </button>
      </div>

      {cfg.enabled && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 mt-4" style={{ scrollbarWidth: "none" }}>
            {RACE_DISTANCES.map((d) => (
              <Chip
                key={d.id}
                active={d.id === cfg.distance}
                color={d.color}
                onClick={() =>
                  onChange({ ...cfg, distance: d.id, targetPaceSec: d.defaultPaceSec })
                }
              >
                {d.label}
              </Chip>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <Stepper
              label="SEMANAS ATÉ A PROVA"
              value={cfg.weeksOut === 0 ? "SEMANA DA PROVA" : `${cfg.weeksOut} sem`}
              color={phase.color}
              onMinus={() => step("weeksOut", -1)}
              onPlus={() => step("weeksOut", 1)}
            />
            <Stepper
              label="PACE ALVO"
              value={fmtPace(cfg.targetPaceSec)}
              color={meta.color}
              onMinus={() => step("targetPaceSec", -5)}
              onPlus={() => step("targetPaceSec", 5)}
            />
            <div style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderRadius: 8, padding: 12 }}>
              <p style={mono(6, RC.mutedDark, 3)}>FASE DETECTADA</p>
              <div className="mt-2">
                <RBadge color={phase.color}>{phase.label}</RBadge>
              </div>
              <p style={{ fontSize: 10, color: "#666", marginTop: 8, lineHeight: 1.5 }}>{phase.focus}</p>
            </div>
          </div>
        </>
      )}
    </SectionCard>
  );
}

function Stepper({
  label, value, color, onMinus, onPlus,
}: {
  label: string; value: string; color: string; onMinus: () => void; onPlus: () => void;
}) {
  return (
    <div style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderRadius: 8, padding: 12 }}>
      <p style={mono(6, RC.mutedDark, 3)}>{label}</p>
      <div className="flex items-center justify-between gap-2 mt-2">
        <IconBtn onClick={onMinus}><Minus style={{ width: 12, height: 12, color: RC.muted }} /></IconBtn>
        <span style={raj(17, 800, color)}>{value}</span>
        <IconBtn onClick={onPlus}><Plus style={{ width: 12, height: 12, color: RC.muted }} /></IconBtn>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md flex items-center justify-center shrink-0"
      style={{ width: 26, height: 26, background: RC.card, border: `1px solid ${RC.border}` }}
    >
      {children}
    </button>
  );
}
