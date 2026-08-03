import { useNavigate } from "react-router-dom";
import { NP, mono, labelStyle, cardStyle } from "./theme";
import { analyzeAdaptation, type WeightPoint } from "@/lib/nutritionPeriodization";

interface Props {
  weightLogs: WeightPoint[];
}

/** FEATURE 5 — Indicador de adaptação metabólica. */
export default function MetabolicAdaptationCard({ weightLogs }: Props) {
  const navigate = useNavigate();
  const r = analyzeAdaptation(weightLogs);

  if (!r.hasEnoughData) {
    return (
      <div style={{ ...cardStyle }}>
        <p style={{ ...labelStyle, color: NP.gold }}>📊 Monitor de adaptação metabólica</p>
        <p style={{ fontSize: 12, color: NP.text, margin: "8px 0 4px", lineHeight: 1.5 }}>
          Registre seu peso para ativar o monitor de adaptação metabólica.
        </p>
        <p style={{ fontSize: 10, color: NP.muted, fontFamily: mono, margin: "0 0 12px" }}>
          Mínimo de 3 semanas de registro para detectar estagnação.
        </p>
        <button
          onClick={() => navigate("/weight-adaptive")}
          style={{ width: "100%", padding: "9px 0", border: "none", borderRadius: 8, cursor: "pointer", background: NP.gold, color: "#03030a", fontFamily: mono, fontWeight: 800, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          Registrar peso
        </button>
      </div>
    );
  }

  const spark = r.weeklySeries.slice(-6);
  const weights = spark.map((s) => s.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = max - min || 1;
  const pts = spark
    .map((s, i) => {
      const x = spark.length > 1 ? (i / (spark.length - 1)) * 100 : 50;
      const y = 30 - ((s.weight - min) / span) * 26 - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div style={{ ...cardStyle, border: `1px solid ${r.adaptationDetected ? NP.red + "66" : NP.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ ...labelStyle, color: NP.gold }}>📉 Taxa de perda</p>
          <p style={{ fontSize: 24, fontWeight: 900, color: r.color, fontFamily: mono, margin: "6px 0 0", lineHeight: 1 }}>
            {r.weeklyRatePct >= 0 ? "" : "+"}{Math.abs(r.weeklyRatePct).toFixed(2)}%
            <span style={{ fontSize: 11, color: NP.muted, marginLeft: 4 }}>/semana</span>
          </p>
        </div>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: r.color, boxShadow: `0 0 10px ${r.color}`, marginTop: 6 }} />
      </div>

      <p style={{ fontSize: 11, color: r.color, fontFamily: mono, margin: "8px 0 10px", lineHeight: 1.4 }}>{r.label}</p>

      <svg viewBox="0 0 100 32" preserveAspectRatio="none" style={{ width: "100%", height: 40 }}>
        <polyline points={pts} fill="none" stroke={r.color} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
        {spark.map((s, i) => {
          const x = spark.length > 1 ? (i / (spark.length - 1)) * 100 : 50;
          const y = 30 - ((s.weight - min) / span) * 26 - 2;
          return <circle key={i} cx={x} cy={y} r={1.4} fill={r.color} vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      <p style={{ fontSize: 9, color: NP.dim, fontFamily: mono, margin: "2px 0 0", textAlign: "right" }}>
        últimas {spark.length} médias semanais · {weights[weights.length - 1].toFixed(1)}kg
      </p>

      {r.adaptationDetected && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "rgba(255,68,68,.08)", border: `1px solid ${NP.red}44` }}>
          <p style={{ ...labelStyle, color: NP.red }}>⚠️ Possível adaptação metabólica</p>
          <p style={{ fontSize: 10, color: NP.muted, margin: "6px 0 8px", lineHeight: 1.5 }}>
            Não corte mais calorias ainda. Ordem de intervenção recomendada:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {r.recommendations.map((rec) => (
              <p key={rec} style={{ fontSize: 11, color: NP.text, fontFamily: mono, margin: 0, lineHeight: 1.4 }}>{rec}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
