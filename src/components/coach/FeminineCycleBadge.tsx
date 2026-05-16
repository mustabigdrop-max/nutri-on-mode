import { CYCLE_PHASE_INFO, CyclePhase } from "@/lib/feminine";

interface Props {
  phase: CyclePhase | null;
  cycleDay?: number | null;
  compact?: boolean;
}

export default function FeminineCycleBadge({ phase, cycleDay, compact }: Props) {
  if (!phase) return null;
  const info = CYCLE_PHASE_INFO[phase];
  return (
    <span
      title={`Fase ${info.label}${cycleDay ? ` · dia ${cycleDay}` : ""} (${info.range})`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: compact ? "2px 6px" : "3px 8px",
        borderRadius: 999,
        background: info.bg,
        border: `1px solid ${info.color}66`,
        color: info.color,
        fontSize: compact ? 10 : 11,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span>{info.emoji}</span>
      <span>{info.label}{cycleDay ? ` · d${cycleDay}` : ""}</span>
    </span>
  );
}
