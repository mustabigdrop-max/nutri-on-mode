import { Leaf } from "lucide-react";
import { NP, mono } from "./theme";

interface Props {
  target: number;
  consumed?: number | null;
  variant?: "tile" | "row";
}

/** FEATURE 4 — Target de fibra visível (5º macro). */
export default function FiberMacroTile({ target, consumed, variant = "tile" }: Props) {
  const has = typeof consumed === "number";
  const pct = has ? Math.min(100, (consumed! / target) * 100) : 0;
  const green = "#7bc96f";

  if (variant === "row") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Leaf style={{ width: 12, height: 12, color: green }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: NP.muted, fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.1em" }}>Fibra</span>
            <span style={{ fontSize: 10, color: green, fontFamily: mono, fontWeight: 700 }}>
              {has ? `${Math.round(consumed!)} / ${target}g` : `${target}g`}
            </span>
          </div>
          <div style={{ height: 3, background: NP.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: green }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: NP.card2, border: `1px solid ${green}33`, borderRadius: 10, padding: 12, textAlign: "center" }}>
      <p style={{ fontSize: 22, fontWeight: 900, color: green, fontFamily: mono, margin: 0, lineHeight: 1 }}>
        {has ? Math.round(consumed!) : target}
        <span style={{ fontSize: 10, color: NP.muted, marginLeft: 2 }}>{has ? `/${target}g` : "g"}</span>
      </p>
      <p style={{ fontSize: 10, color: NP.muted, fontFamily: mono, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        🌿 Fibra
      </p>
      {has && (
        <div style={{ height: 3, background: NP.border, borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: green }} />
        </div>
      )}
    </div>
  );
}
