// APEX Visual — Card de resultado de teste clínico com overlay SVG
import { useMemo } from "react";
import { SEVERITY_BADGE_AI, type FennerAiTest } from "@/data/fennerTests";

type LandmarkPos = { x: number; y: number };
type OverlayLine = { from: string; to: string; color?: string; label?: string };
type OverlayAngle = { value: number; x: number; y: number; label?: string; color?: string };

export interface TestAiResult {
  [key: string]: any;
  findings?: string;
  landmarks?: Record<string, LandmarkPos>;
  overlay_lines?: OverlayLine[];
  overlay_angles?: OverlayAngle[];
}

interface Props {
  test: FennerAiTest;
  imageUrl: string;
  result: TestAiResult;
}

function severityFor(result: TestAiResult): string {
  const keys = Object.keys(result).filter((k) =>
    k.startsWith("classificacao") || k === "severity" || k === "classificacao"
  );
  let worst = "normal";
  const order = ["normal", "mild", "moderate", "severe", "fraqueza_relativa", "inibido"];
  const rank: Record<string, number> = { normal: 0, mild: 1, fraqueza_relativa: 2, moderate: 3, inibido: 4, severe: 5 };
  for (const k of keys) {
    const v = String(result[k]);
    if (rank[v] !== undefined && rank[v] > (rank[worst] ?? 0)) worst = v;
  }
  return worst;
}

function Badge({ severity }: { severity: string }) {
  const cfg = SEVERITY_BADGE_AI[severity] ?? SEVERITY_BADGE_AI.normal;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 8px", borderRadius: 4,
        background: cfg.bg, color: cfg.fg,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
        letterSpacing: 0.5, textTransform: "uppercase",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.fg, animation: "apex-pulse 2s infinite" }} />
      {cfg.label}
    </span>
  );
}

export function TestResultCard({ test, imageUrl, result }: Props) {
  const sev = severityFor(result);
  const findings = result?.findings ?? "Sem descrição.";

  // Build numeric measurement rows from result keys
  const measurementRows = useMemo(() => {
    const skip = new Set(["findings", "landmarks", "overlay_lines", "overlay_angles", "rawText", "raw", "parse_error", "musculos_encurtados", "falhas_detectadas", "achados", "lado"]);
    return Object.entries(result || {})
      .filter(([k, v]) => !skip.has(k) && (typeof v === "number" || typeof v === "boolean" || typeof v === "string"))
      .slice(0, 8);
  }, [result]);

  const muscles: string[] = result?.musculos_encurtados ?? [];
  const failures: any[] = result?.falhas_detectadas ?? [];
  const achados: string[] = result?.achados ?? [];

  const landmarks = result?.landmarks ?? {};
  const lines = result?.overlay_lines ?? [];
  const angles = result?.overlay_angles ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Foto + overlay */}
      <div style={{
        position: "relative", borderRadius: 12, overflow: "hidden",
        border: "1px solid rgba(0,212,255,0.25)", background: "#03040A",
      }}>
        <img src={imageUrl} alt={test.name} style={{ display: "block", width: "100%", height: "auto" }} />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          {lines.map((ln, i) => {
            const a = landmarks[ln.from], b = landmarks[ln.to];
            if (!a || !b) return null;
            return <line key={`l${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={ln.color || "#00D4FF"} strokeWidth={0.4} vectorEffect="non-scaling-stroke" />;
          })}
          {Object.entries(landmarks).map(([id, p]: any) => (
            <circle key={id} cx={p.x} cy={p.y} r={0.8} fill="#00D4FF" stroke="#03040A" strokeWidth={0.2} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {/* Ângulos como badges absolutos */}
        {angles.map((a, i) => (
          <div key={`a${i}`} style={{
            position: "absolute", left: `${a.x}%`, top: `${a.y}%`, transform: "translate(-50%,-50%)",
            padding: "2px 6px", borderRadius: 4,
            background: "rgba(3,4,10,0.85)", color: a.color || "#00D4FF",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
            border: `1px solid ${a.color || "#00D4FF"}55`, whiteSpace: "nowrap",
          }}>
            {a.label ? `${a.label}: ` : ""}{Math.round(a.value)}°
          </div>
        ))}
      </div>

      {/* Painel resultado */}
      <div style={{
        background: "rgba(10,10,26,0.8)", border: "1px solid rgba(0,212,255,0.2)",
        borderRadius: 12, padding: 16, color: "#F5F0E8",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
            {test.name}
          </div>
          <Badge severity={sev} />
        </div>

        {/* Medições */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, marginBottom: 12 }}>
          {measurementRows.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 8px", background: "rgba(255,255,255,0.02)", borderRadius: 6 }}>
              <span style={{ color: "#9AA6B8", textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
              <span style={{ color: "#F5F0E8", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                {typeof v === "number" ? Math.round(v * 100) / 100 : String(v)}
              </span>
            </div>
          ))}
        </div>

        {/* Músculos / falhas */}
        {(muscles.length > 0 || failures.length > 0 || achados.length > 0) && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "#9AA6B8", letterSpacing: 1, fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>
              ACHADOS MUSCULARES
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {muscles.map((m, i) => (
                <span key={i} style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(239,159,39,0.12)", color: "#F59E0B", fontSize: 11 }}>
                  {m}
                </span>
              ))}
              {achados.map((m, i) => (
                <span key={`a${i}`} style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(0,212,255,0.12)", color: "#00D4FF", fontSize: 11 }}>
                  {m}
                </span>
              ))}
              {failures.map((f, i) => (
                <span key={`f${i}`} title={f.disfuncao} style={{ padding: "2px 8px", borderRadius: 4, background: f.status === "inhibited" ? "rgba(239,68,68,0.15)" : "rgba(184,146,42,0.15)", color: f.status === "inhibited" ? "#FCA5A5" : "#FFCB6B", fontSize: 11 }}>
                  {f.musculo_implicado || f.falha} · {f.status === "inhibited" ? "INIBIDO" : "DOMINANTE"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achado clínico */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10 }}>
          <div style={{ fontSize: 10, color: "#9AA6B8", letterSpacing: 1, fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>
            ACHADO CLÍNICO
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "#E2E8F0" }}>{findings}</div>
        </div>
      </div>
    </div>
  );
}

export default TestResultCard;
