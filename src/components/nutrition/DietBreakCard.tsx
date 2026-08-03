import { Brain } from "lucide-react";
import { NP, mono, labelStyle, cardStyle } from "./theme";
import type { DietBreakState } from "@/lib/nutritionPeriodization";

interface Props {
  state: DietBreakState;
  onSchedule: () => void;
  onPostpone: () => void;
}

/** FEATURE 2 — Diet breaks programados (MATADOR, Byrne et al., 2018). */
export default function DietBreakCard({ state, onSchedule, onPostpone }: Props) {
  if (!state.enabled) return null;

  if (state.active) {
    return (
      <div style={{ ...cardStyle, border: `1px solid ${NP.blueGrey}55`, background: NP.blueGreyBg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ ...labelStyle, color: NP.blueGrey }}>Diet Break Ativo</p>
          <span style={{ fontFamily: mono, fontSize: 10, color: NP.blueGrey, border: `1px solid ${NP.blueGrey}55`, borderRadius: 999, padding: "2px 8px" }}>
            Dia {state.dayInBreak}/{state.totalDays}
          </span>
        </div>
        <p style={{ fontSize: 13, color: NP.text, fontFamily: mono, fontWeight: 700, margin: "0 0 6px" }}>
          MANUTENÇÃO (Diet Break)
        </p>
        <p style={{ fontSize: 11, color: NP.muted, lineHeight: 1.5, margin: 0 }}>
          Calorias em manutenção para reduzir adaptação metabólica, restaurar leptina/T3 e preservar massa magra.
        </p>
        <div style={{ marginTop: 10, height: 4, background: NP.border, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${(state.dayInBreak / state.totalDays) * 100}%`, height: "100%", background: NP.blueGrey }} />
        </div>
      </div>
    );
  }

  if (!state.showSuggestion) return null;

  const dias = Math.max(0, state.daysUntilSuggested);

  return (
    <div style={{ ...cardStyle, border: `1px solid ${NP.gold}`, background: "linear-gradient(180deg, rgba(184,146,42,.10), #06060e)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Brain style={{ width: 18, height: 18, color: NP.gold, flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <p style={{ ...labelStyle, color: NP.gold }}>Diet Break sugerido</p>
          <p style={{ fontSize: 13, color: NP.text, fontWeight: 700, margin: "6px 0 4px" }}>
            {dias === 0 ? "Diet Break sugerido para hoje" : `Diet Break sugerido em ${dias} dia${dias > 1 ? "s" : ""}`}
          </p>
          <p style={{ fontSize: 11, color: NP.muted, lineHeight: 1.5, margin: 0 }}>
            {state.weeksInDeficit} semanas em déficit contínuo — seu corpo precisa de reset metabólico.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={onSchedule}
          style={{ flex: 1, padding: "9px 0", border: "none", borderRadius: 8, cursor: "pointer", background: NP.gold, color: "#03030a", fontFamily: mono, fontWeight: 800, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          Agendar Diet Break
        </button>
        <button
          onClick={onPostpone}
          style={{ flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer", background: "transparent", border: `1px solid ${NP.border}`, color: NP.muted, fontFamily: mono, fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          Adiar 1 semana
        </button>
      </div>
    </div>
  );
}
