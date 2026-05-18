import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const stats = [
  { val: 85, suffix: "+", label: "Compostos catalogados", sub: "nutrição · farma · fito · peptídeos", color: GOLD, id: "ST-01" },
  { val: 7,  suffix: "",  label: "Camadas Stratum™",      sub: "sistema de treino integrado",         color: CYAN, id: "ST-02" },
  { val: 9,  suffix: "",  label: "Sistemas ativos",       sub: "nutrição · treino · farma · mente · mais", color: GOLD, id: "ST-03" },
  { val: 0,  suffix: "",  label: "24h · Sempre ligado",   sub: "diagnóstico contínuo de performance",  color: CYAN, id: "ST-04", display: "ON" },
];

const CountUp = ({ target, inView, suffix, display }: { target: number; inView: boolean; suffix: string; display?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView || display) return;
    const duration = 2000;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, display]);

  if (display) return <>{display}</>;
  return <>{count}{suffix}</>;
};

const LandingStats = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: "#0a0a1a", borderTop: "1px solid rgba(184,146,42,0.1)", borderBottom: "1px solid rgba(184,146,42,0.1)" }}
    >
      {/* Scan line */}
      <div className="hud-scan-line" />

      {/* Status phrase */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-center gap-3 py-5"
        style={{ borderBottom: "1px solid rgba(184,146,42,0.06)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN, boxShadow: `0 0 8px ${CYAN}`, animation: "dotPulse 1.6s ease-in-out infinite" }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.18em", color: "rgba(184,146,42,0.6)", textTransform: "uppercase" }}>
          Enquanto você lê isso, alguém está ativando o sistema
        </span>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}`, animation: "dotPulse 1.6s ease-in-out infinite 0.4s" }} />
      </motion.div>

      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4" style={{ borderBottom: "1px solid rgba(184,146,42,0.06)" }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative p-8 md:p-12 text-center group"
            style={{ borderRight: i < 3 ? "1px solid rgba(184,146,42,0.08)" : "none" }}
          >
            {/* Top glow line on hover */}
            <span
              className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
              style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
            />

            <div
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: stat.display ? "3.5rem" : "4rem",
                color: stat.color,
                lineHeight: 1,
                textShadow: `0 0 30px ${stat.color}44`,
                letterSpacing: "0.02em",
              }}
            >
              <CountUp target={stat.val} inView={inView} suffix={stat.suffix} display={stat.display} />
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.18em", color: "rgba(245,240,232,0.75)", textTransform: "uppercase", marginTop: 8 }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(80,80,122,0.8)", marginTop: 4 }}>
              {stat.sub}
            </div>

            {/* ID tag */}
            <div className="absolute top-3 right-3 opacity-30" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", letterSpacing: "0.1em", color: stat.color }}>
              {stat.id}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LandingStats;
