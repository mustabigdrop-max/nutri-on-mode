import { NP, mono } from "./theme";
import { computeProteinPerLbm } from "@/lib/nutritionPeriodization";

interface Props {
  proteinG: number;
  weightKg?: number | null;
  bodyFatPct?: number | null;
  align?: "left" | "center";
}

/** FEATURE 3 — Proteína relativa (g/kg de massa magra) com semáforo. */
export default function ProteinLbmLine({ proteinG, weightKg, bodyFatPct, align = "center" }: Props) {
  const r = computeProteinPerLbm(proteinG, weightKg, bodyFatPct);

  if (!r.hasData) {
    return (
      <p style={{ fontSize: 9, color: NP.muted, fontFamily: mono, margin: "3px 0 0", textAlign: align, lineHeight: 1.3 }}>
        {r.message}
      </p>
    );
  }

  return (
    <div
      title={`${r.message} · LBM ${r.lbm.toFixed(1)}kg · faixa ótima 2.3–3.1 g/kg LBM`}
      style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: align === "center" ? "center" : "flex-start", marginTop: 3 }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: r.color, boxShadow: `0 0 6px ${r.color}` }} />
      <span style={{ fontSize: 10, color: r.color, fontFamily: mono, fontWeight: 700 }}>
        {r.gPerKg.toFixed(1)} g/kg LBM
      </span>
    </div>
  );
}
