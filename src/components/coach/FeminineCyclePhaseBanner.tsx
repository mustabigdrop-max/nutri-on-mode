import { CyclePhase, getFemininePhaseBanner } from "@/lib/feminine";

interface Props {
  phase: CyclePhase | null;
  cycleDay?: number | null;
}

export default function FeminineCyclePhaseBanner({ phase, cycleDay }: Props) {
  const banner = getFemininePhaseBanner(phase);
  if (!banner) return null;
  return (
    <div
      style={{
        background: banner.bg,
        border: `1px solid ${banner.color}55`,
        borderLeft: `3px solid ${banner.color}`,
        borderRadius: 10,
        padding: "12px 14px",
        margin: "10px 0",
        fontSize: 12.5,
        color: "#e8e8e8",
      }}
    >
      <div style={{ fontWeight: 700, color: banner.color, marginBottom: 6 }}>
        {banner.title}
        {cycleDay ? <span style={{ opacity: 0.7, fontWeight: 500 }}> · dia {cycleDay}</span> : null}
      </div>
      <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.55 }}>
        {banner.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
