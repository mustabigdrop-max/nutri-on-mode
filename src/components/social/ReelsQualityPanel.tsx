import { useMemo } from "react";
import { AlertTriangle, Check, ShieldCheck, X } from "lucide-react";
import { qualityScore, runQualityChecklist } from "@/lib/reelsQuality";
import type { ReelExportData } from "@/lib/reelsExport";

const C = {
  bg: "#020205", card: "#080810", border: "#B8922A22", gold: "#B8922A",
  green: "#00C896", orange: "#E8A020", red: "#ff4444",
  text: "#F5F0E8", textMid: "#A0A0A0", textMuted: "#4A4A4A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

export default function ReelsQualityPanel({ result }: { result: ReelExportData }) {
  const checks = useMemo(() => runQualityChecklist(result), [result]);
  const score = qualityScore(checks);
  const scoreColor = score >= 85 ? C.green : score >= 60 ? C.orange : C.red;

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ ...fT, fontSize: 22, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={18} color={scoreColor} /> CHECKLIST DE QUALIDADE
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...fT, fontSize: 36, color: scoreColor, lineHeight: 1 }}>{score}</div>
          <div style={{ ...fM, fontSize: 11, color: C.textMuted }}>PRONTIDÃO</div>
        </div>
      </div>

      <div style={{ height: 4, background: `${C.border}`, marginBottom: 14 }}>
        <div style={{ width: `${score}%`, height: "100%", background: scoreColor, transition: "width .4s" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {checks.map((c) => {
          const color = c.status === "ok" ? C.green : c.status === "warn" ? C.orange : C.red;
          const Icon = c.status === "ok" ? Check : c.status === "warn" ? AlertTriangle : X;
          return (
            <div key={c.id} style={{ background: C.card, border: `1px solid ${color}33`, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon size={15} color={color} />
                <span style={{ ...fT, fontSize: 16, color: C.text }}>{c.label}</span>
              </div>
              <div style={{ ...fM, fontSize: 13, color: C.textMid, marginTop: 5, lineHeight: 1.6 }}>{c.detail}</div>
              {c.suggestion && (
                <div style={{ ...fM, fontSize: 13, color, marginTop: 6, lineHeight: 1.6 }}>→ {c.suggestion}</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ ...fM, fontSize: 12, color: C.textMuted, marginTop: 12 }}>
        {score >= 85 ? "Pronto pra publicar. Transformação é sistema." : "Ajuste os pontos em laranja/vermelho antes de finalizar."}
      </div>
    </div>
  );
}
