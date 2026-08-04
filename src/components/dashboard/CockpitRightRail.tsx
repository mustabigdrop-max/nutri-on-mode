import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CockpitRightRailProps {
  apexScore: number;       // 0–100 (use aiScore from dashboard)
  posturalScore?: number;
  mobilityScore?: number;
  symmetryScore?: number;
  fmsScore?: number;
  adherencePct: number;
  proteinDaysHit: number;
  weightDelta?: number;     // kg
  chronologicalAge: number;
  biologicalAge: number;
}

const TECH: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 9,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};
const NUM: React.CSSProperties = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: "#F5F0E8" };

function CountUp({ to, duration = 1.8, delay = 0.8, style }: { to: number; duration?: number; delay?: number; style?: React.CSSProperties }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const begin = performance.now() + delay * 1000;
    const tick = (now: number) => {
      if (now < begin) { raf = requestAnimationFrame(tick); return; }
      if (start === null) start = now;
      const p = Math.min((now - start) / (duration * 1000), 1);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, delay]);
  return <span style={style}>{v}</span>;
}

const MODULES = [
  { name: "PCA", color: "#B8922A", path: "/assessment-pca" },
  { name: "NutriPlan", color: "#00D4FF", path: "/meal-plan" },
  { name: "TrainingON", color: "#B8922A", path: "/nutrisync" },
  { name: "VERTEX", color: "#00D4FF", path: "/lab" },
  { name: "KAA™", color: "#B8922A", path: "/chat" },
  { name: "Microbiota", color: "#00D4FF", path: "/microbiome" },
];

export default function CockpitRightRail(props: CockpitRightRailProps) {
  const ageDiff = props.biologicalAge - props.chronologicalAge;
  const ageDiffLabel = ageDiff === 0 ? "neutro" : ageDiff > 0 ? `+${ageDiff} ano${ageDiff > 1 ? "s" : ""}` : `${ageDiff} ano${ageDiff < -1 ? "s" : ""}`;

  const bars = [
    { label: "Postura", v: props.posturalScore ?? 72, color: "#B8922A" },
    { label: "Mobilidade", v: props.mobilityScore ?? 68, color: "#00D4FF" },
    { label: "Simetria", v: props.symmetryScore ?? 81, color: "#B8922A" },
    { label: "FMS", v: props.fmsScore ?? 75, color: "#00D4FF" },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="hidden md:flex flex-col h-full overflow-y-auto scrollbar-none px-3 py-4"
      style={{ background: "rgba(2,2,5,0.96)", borderLeft: "1px solid rgba(184,146,42,0.06)" }}
    >
      {/* APEX SCORE */}
      <div>
        <p style={{ ...TECH, color: "rgba(0,212,255,0.33)" }}>APEX SCORE</p>
        <CountUp
          to={props.apexScore}
          style={{ ...NUM, color: "#00D4FF", fontSize: 48, lineHeight: 1, display: "block", marginTop: 2 }}
        />
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(0,212,255,0.44)", marginTop: 2 }}>
          Performance Elite
        </p>
        <div className="mt-3 space-y-1.5">
          {bars.map((b, i) => (
            <div key={b.label}>
              <div className="flex justify-between" style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "#3A3A3A" }}>
                <span>{b.label}</span>
                <span>{b.v}</span>
              </div>
              <div className="h-px mt-0.5" style={{ background: "#0F0F14" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${b.v}%` }}
                  transition={{ duration: 1.5, delay: 0.9 + i * 0.1, ease: "easeOut" }}
                  className="h-full"
                  style={{ background: b.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="my-3 h-px" style={{ background: "rgba(184,146,42,0.06)" }} />

      {/* DIAGNÓSTICO SEMANAL */}
      <div>
        <p style={{ ...TECH, color: "rgba(184,146,42,0.33)" }}>DIAG. SEMANAL</p>
        <div className="mt-2 space-y-2.5">
          <div>
            <div className="flex items-baseline justify-between">
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#3A3A3A" }}>Adesão</span>
              <span style={{ ...NUM, color: "#B8922A", fontSize: 13 }}>{props.adherencePct}%</span>
            </div>
            <div className="h-px mt-0.5" style={{ background: "#0F0F14" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${props.adherencePct}%` }}
                transition={{ duration: 1.4, delay: 1.0 }}
                className="h-full"
                style={{ background: "#B8922A" }}
              />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#3A3A3A" }}>Proteína</span>
            <span style={{ ...NUM, fontSize: 13 }}>{props.proteinDaysHit}/7d</span>
          </div>
          {typeof props.weightDelta === "number" && (
            <div className="flex items-baseline justify-between">
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#3A3A3A" }}>Peso 7d</span>
              <span style={{ ...NUM, fontSize: 13, color: props.weightDelta < 0 ? "#00D4FF" : props.weightDelta > 0 ? "#B8922A" : "#F5F0E8" }}>
                {props.weightDelta > 0 ? "+" : ""}{props.weightDelta.toFixed(1)}kg
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="my-3 h-px" style={{ background: "rgba(184,146,42,0.06)" }} />

      {/* IDADE BIOLÓGICA */}
      <div>
        <p style={{ ...TECH, color: "#3A3A3A" }}>IDADE BIOLÓGICA</p>
        <div className="flex items-baseline gap-3 mt-2">
          <div>
            <p style={{ ...NUM, fontSize: 18, color: "#3A3A3A" }}>{props.chronologicalAge}</p>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "#3A3A3A" }}>cronológica</span>
          </div>
          <div>
            <p style={{ ...NUM, fontSize: 18, color: "#00D4FF" }}>{props.biologicalAge}</p>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "#3A3A3A" }}>biológica</span>
          </div>
        </div>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#00D4FF", marginTop: 4 }}>
          {ageDiffLabel}
        </p>
      </div>

      <div className="my-3 h-px" style={{ background: "rgba(184,146,42,0.06)" }} />

      {/* MÓDULOS ATIVOS */}
      <div className="flex-1">
        <p style={{ ...TECH, color: "rgba(184,146,42,0.33)" }}>MÓDULOS ATIVOS</p>
        <div className="mt-2 space-y-1.5">
          {MODULES.map((m) => (
            <button
              key={m.name}
              onClick={() => toast.success(`▸ ${m.name} — ativado`, { duration: 2000 })}
              className="w-full flex items-center gap-2 px-1 py-1 transition-colors hover:bg-[rgba(184,146,42,0.04)]"
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: m.color, boxShadow: `0 0 4px ${m.color}` }}
              />
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: 13, color: "#F5F0E8" }}>
                {m.name}
              </span>
              {"isNew" in m && (m as { isNew?: boolean }).isNew && (
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.12em",
                    color: "#00D4FF", border: "1px solid rgba(0,212,255,0.4)",
                    background: "rgba(0,212,255,0.12)", padding: "0 4px",
                  }}
                >
                  NEW
                </span>
              )}
            </button>
          ))}

        </div>
      </div>

      {/* Bottom status */}
      <div className="mt-3 flex items-center gap-1.5 pt-2" style={{ borderTop: "1px solid rgba(184,146,42,0.06)" }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00D4FF" }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.18em", color: "rgba(0,212,255,0.33)" }}>
          MCE ATIVO · PROTOCOLO ON
        </span>
      </div>
    </motion.aside>
  );
}
