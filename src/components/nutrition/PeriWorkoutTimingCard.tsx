import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NP, mono, labelStyle, cardStyle } from "./theme";
import { computeTimingBlocks, type MacroSet } from "@/lib/nutritionPeriodization";

interface Props {
  macros: MacroSet;
  isTrainingDay: boolean;
  workoutMinutes?: number;
  workoutTimeLabel?: string;
  /** Minutos até o treino, se conhecido (usado no destaque do bloco). */
  minutesToWorkout?: number | null;
}

/** FEATURE 7 — Nutrient timing peri-treino (pré / intra / pós / restante). */
export default function PeriWorkoutTimingCard({
  macros, isTrainingDay, workoutMinutes = 60, workoutTimeLabel, minutesToWorkout,
}: Props) {
  const blocks = computeTimingBlocks({ macros, workoutMinutes, workoutTimeLabel, isTrainingDay });
  const relevantKey = minutesToWorkout == null || minutesToWorkout >= 0 ? "pre" : "post";
  const [expanded, setExpanded] = useState<string | null>(relevantKey);

  if (!isTrainingDay || blocks.length === 0) return null;

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ ...labelStyle, color: NP.gold }}>Nutrient timing peri-treino</p>
        {minutesToWorkout != null && minutesToWorkout > 0 && (
          <span style={{ fontSize: 10, color: NP.gold, fontFamily: mono, fontWeight: 700 }}>
            treino em {minutesToWorkout}min
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {blocks.map((b) => {
          const open = expanded === b.key;
          return (
            <div key={b.key} style={{ borderRadius: 10, border: `1px solid ${open ? b.color + "77" : NP.border}`, background: open ? `${b.color}12` : NP.card2, overflow: "hidden" }}>
              <button
                onClick={() => setExpanded(open ? null : b.key)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontSize: 12 }}>{b.emoji}</span>
                <span style={{ flex: 1, fontSize: 11, fontFamily: mono, fontWeight: 800, color: b.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {b.title}
                </span>
                <span style={{ fontSize: 10, color: NP.muted, fontFamily: mono }}>
                  {b.carbs}g C · {b.protein}g P
                </span>
                {open ? <ChevronUp style={{ width: 13, height: 13, color: NP.muted }} /> : <ChevronDown style={{ width: 13, height: 13, color: NP.muted }} />}
              </button>

              {open && (
                <div style={{ padding: "0 12px 12px" }}>
                  <p style={{ fontSize: 10, color: NP.muted, fontFamily: mono, margin: "0 0 8px" }}>{b.window}</p>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    {[
                      { l: "Carbo", v: `${b.carbs}g` },
                      { l: "Prot", v: `${b.protein}g` },
                      ...(b.fat != null ? [{ l: "Gord", v: `${Math.max(0, b.fat)}g` }] : []),
                    ].map((m) => (
                      <div key={m.l} style={{ flex: 1, background: NP.card, border: `1px solid ${NP.border}`, borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
                        <p style={{ fontSize: 13, color: b.color, fontFamily: mono, fontWeight: 900, margin: 0 }}>{m.v}</p>
                        <p style={{ fontSize: 8, color: NP.muted, fontFamily: mono, margin: "2px 0 0", textTransform: "uppercase" }}>{m.l}</p>
                      </div>
                    ))}
                  </div>
                  {b.extra && <p style={{ fontSize: 10, color: NP.muted, lineHeight: 1.5, margin: "0 0 6px" }}>{b.extra}</p>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {b.foods.map((f) => (
                      <span key={f} style={{ padding: "3px 8px", borderRadius: 999, background: `${b.color}15`, border: `1px solid ${b.color}33`, color: NP.text, fontSize: 9, fontFamily: mono }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
