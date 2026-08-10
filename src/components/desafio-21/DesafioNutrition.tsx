import { Utensils, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { DayType, Goal, computeNutrition } from "@/lib/desafio21";

const mono = (s: number, c: string, sp = 1.5): React.CSSProperties => ({
  fontFamily: "'Space Mono', monospace", fontSize: s, color: c, letterSpacing: `${sp}px`,
});
const raj = (s: number, w = 700, c = "#F5F0E8"): React.CSSProperties => ({
  fontFamily: "'Rajdhani', sans-serif", fontSize: s, fontWeight: w, color: c, lineHeight: 1.15,
});

export default function DesafioNutrition({ goal, type }: { goal: Goal; type: DayType }) {
  const { kcal, protein, carb, fat, rule } = computeNutrition(goal, type);
  const delta = Math.round((rule.carbMultiplier - 1) * 100);

  return (
    <div style={{ background: "#060a0f", border: "1px solid #12222c", borderRadius: 12, padding: 14 }}>
      <div className="flex items-center gap-2 mb-3">
        <Utensils style={{ width: 14, height: 14, color: "#00FF88" }} />
        <span style={mono(10, "#00FF88", 2)}>NUTRIÇÃO DO DIA</span>
        {delta !== 0 && (
          <span className="flex items-center gap-1 ml-auto" style={mono(9, delta > 0 ? "#00D4FF" : "#FFB800", 1)}>
            {delta > 0 ? <ArrowUpRight style={{ width: 11, height: 11 }} /> : <ArrowDownRight style={{ width: 11, height: 11 }} />}
            CARB {delta > 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>

      <p style={raj(28, 700, "#F5F0E8")}>{kcal.toLocaleString("pt-BR")} <span style={raj(15, 400, "#5a6a79")}>kcal</span></p>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {[["PROTEÍNA", `${protein}g`, "#00D4FF"], ["CARB", `${carb}g`, "#00FF88"], ["GORDURA", `${fat}g`, "#FFB800"]].map(([l, v, c]) => (
          <div key={l} style={{ background: "#04080c", border: `1px solid ${c}22`, borderRadius: 8, padding: 10 }}>
            <p style={mono(8, "#5a6a79", 1.5)}>{l}</p>
            <p style={{ ...mono(13, c as string, 0), marginTop: 3 }}>{v}</p>
          </div>
        ))}
      </div>

      {(rule.preTreino || rule.posTreino) && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {rule.preTreino && (
            <div style={{ background: "#04080c", border: "1px solid #12222c", borderRadius: 8, padding: 10 }}>
              <p style={mono(8, "#5a6a79", 1.5)}>PRÉ-TREINO</p>
              <p style={{ ...mono(11, "#c9d6df", 0), marginTop: 3 }}>{rule.preTreino.carb}g carb + {rule.preTreino.protein}g prot</p>
            </div>
          )}
          {rule.posTreino && (
            <div style={{ background: "#04080c", border: "1px solid #12222c", borderRadius: 8, padding: 10 }}>
              <p style={mono(8, "#5a6a79", 1.5)}>PÓS-TREINO</p>
              <p style={{ ...mono(11, "#c9d6df", 0), marginTop: 3 }}>{rule.posTreino.carb}g carb + {rule.posTreino.protein}g prot</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-2 mt-3">
        <Info style={{ width: 12, height: 12, color: "#5a6a79", marginTop: 2 }} />
        <p style={mono(10, "#7a8a99", 0.5)}>{rule.tip}</p>
      </div>
    </div>
  );
}
