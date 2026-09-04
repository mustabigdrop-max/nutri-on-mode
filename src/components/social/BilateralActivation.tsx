import { groupBilateral } from "@/lib/exerciseLibrary";

const C = {
  bg: "#0a0e18", border: "#1e2d45", text: "#e8edf5", muted: "#6b7a94",
  cyan: "#00D4FF", gold: "#B8922A", green: "#00d4a1",
};

const TIER = {
  3: { label: "PRIMÁRIOS", color: C.cyan },
  2: { label: "SECUNDÁRIOS", color: C.gold },
  1: { label: "ESTABILIZADORES", color: C.green },
} as const;

type Props = { musculos?: Record<string, number>; compact?: boolean };

/** Painel de ativação bilateral: primários, secundários e estabilizadores com lado E/D. */
export default function BilateralActivation({ musculos, compact }: Props) {
  const rows = groupBilateral(musculos || {});
  if (!rows.length) {
    return <div style={{ fontSize: 12, color: C.muted }}>Sem mapa de ativação neste exercício.</div>;
  }

  return (
    <div style={{ display: "grid", gap: compact ? 8 : 12 }}>
      {([3, 2, 1] as const).map((tier) => {
        const group = rows.filter((r) => r.max === tier);
        if (!group.length) return null;
        const { label, color } = TIER[tier];
        return (
          <div key={tier}>
            <div style={{ fontSize: 10, letterSpacing: 1.2, fontFamily: "'Space Mono', monospace", color, marginBottom: 6 }}>
              {label} · {group.length}
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {group.map((r) => (
                <div key={r.base} style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px" }}>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: C.text }}>{r.label}</div>
                  {r.bilateral ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      {([["E", r.left], ["D", r.right]] as const).map(([side, v]) => (
                        <div key={side} style={{
                          minWidth: 44, textAlign: "center", fontSize: 10, fontFamily: "'Space Mono', monospace",
                          padding: "3px 6px", borderRadius: 6,
                          color: v > 0 ? color : C.muted,
                          background: v > 0 ? `${color}18` : "transparent",
                          border: `1px solid ${v > 0 ? `${color}55` : C.border}`,
                          opacity: v === 0 ? 0.5 : 1,
                        }}>
                          {side} {v}
                        </div>
                      ))}
                      {r.left !== r.right && (
                        <div style={{ fontSize: 10, color: "#ff4757", alignSelf: "center" }} title="Ativação assimétrica">⚠ assim.</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color, padding: "3px 8px", borderRadius: 6, background: `${color}18`, border: `1px solid ${color}55` }}>
                      CENTRAL {r.max}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
