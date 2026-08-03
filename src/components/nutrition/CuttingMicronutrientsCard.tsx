import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NP, mono, labelStyle, cardStyle } from "./theme";
import { CUTTING_MICRONUTRIENTS } from "@/lib/nutritionPeriodization";

interface Props {
  isCutting: boolean;
  sex?: string | null;
  /** % da RDA atingido por micronutriente (fase 2 — tracking real). */
  intakePercent?: Record<string, number>;
}

/** FEATURE 8 — Micronutrientes de atenção no cutting. */
export default function CuttingMicronutrientsCard({ isCutting, sex, intakePercent }: Props) {
  const [open, setOpen] = useState(false);
  const isFemale = (sex || "").toLowerCase().startsWith("f");
  const list = CUTTING_MICRONUTRIENTS.filter((m) => !m.femaleOnly || isFemale);

  const colorFor = (name: string, risk: "high" | "medium") => {
    const pct = intakePercent?.[name];
    if (typeof pct === "number") {
      if (pct >= 90) return NP.teal;
      if (pct >= 70) return NP.goldBright;
      return NP.red;
    }
    if (!isCutting) return NP.teal;
    return risk === "high" ? NP.red : NP.goldBright;
  };

  return (
    <div style={cardStyle}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
      >
        <div style={{ textAlign: "left" }}>
          <p style={{ ...labelStyle, color: NP.gold }}>🔬 Micronutrientes — atenção no cutting</p>
          <p style={{ fontSize: 10, color: NP.muted, fontFamily: mono, margin: "4px 0 0" }}>
            {list.length} nutrientes críticos · {intakePercent ? "log real" : "risco por fase"}
          </p>
        </div>
        {open ? <ChevronUp style={{ width: 14, height: 14, color: NP.muted }} /> : <ChevronDown style={{ width: 14, height: 14, color: NP.muted }} />}
      </button>

      {isCutting && (
        <p style={{ fontSize: 10, color: NP.goldBright, fontFamily: mono, margin: "10px 0 0" }}>
          ⚠️ Risco aumentado em déficit prolongado
        </p>
      )}

      {open && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginTop: 12 }}>
          {list.map((m) => {
            const color = colorFor(m.name, m.risk);
            const pct = intakePercent?.[m.name];
            return (
              <div key={m.name} style={{ background: NP.card2, border: `1px solid ${color}33`, borderRadius: 10, padding: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span style={{ fontSize: 11, color: NP.text, fontWeight: 800, fontFamily: mono }}>{m.name}</span>
                </div>
                <p style={{ fontSize: 9, color: NP.muted, fontFamily: mono, margin: "0 0 4px" }}>
                  RDA {m.rda}{typeof pct === "number" ? ` · ${Math.round(pct)}%` : ""}
                </p>
                <p style={{ fontSize: 9, color: NP.dim, lineHeight: 1.4, margin: "0 0 6px" }}>{m.why}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {m.sources.map((s) => (
                    <span key={s} style={{ padding: "2px 6px", borderRadius: 999, background: NP.card, border: `1px solid ${NP.border}`, color: NP.muted, fontSize: 8, fontFamily: mono }}>
                      {s}
                    </span>
                  ))}
                </div>
                {typeof pct === "number" && pct < 70 && (
                  <p style={{ fontSize: 9, color: NP.red, fontFamily: mono, margin: "6px 0 0" }}>
                    Considere suplementação
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
