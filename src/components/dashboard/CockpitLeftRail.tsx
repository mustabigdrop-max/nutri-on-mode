import { motion } from "framer-motion";

interface Metric {
  label: string;
  value: string;
  sub?: string;
  percent: number;
  color: string;
}

interface CockpitLeftRailProps {
  fullName: string;
  sport?: string;
  phaseLabel: string;
  tdee: number;
  protein: { value: number; target: number };
  carbs: { value: number; target: number };
  fat: { value: number; target: number };
  streakDays: number;
  level: number;
  xp: number;
}

const TECH_LABEL: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 9,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "rgba(184,146,42,0.33)",
};
const NUM: React.CSSProperties = {
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: 700,
  color: "#F5F0E8",
};

export default function CockpitLeftRail(props: CockpitLeftRailProps) {
  const xpPerLevel = 500;
  const currentLevelXP = props.xp % xpPerLevel;
  const xpPercent = (currentLevelXP / xpPerLevel) * 100;

  const metrics: Metric[] = [
    { label: "TDEE", value: `${props.tdee}`, sub: "kcal/dia", percent: 100, color: "#B8922A" },
    {
      label: "Proteína",
      value: `${Math.round(props.protein.value)}`,
      sub: `/ ${props.protein.target}g`,
      percent: Math.min((props.protein.value / props.protein.target) * 100, 100),
      color: "#B8922A",
    },
    {
      label: "Carboidrato",
      value: `${Math.round(props.carbs.value)}`,
      sub: `/ ${props.carbs.target}g`,
      percent: Math.min((props.carbs.value / props.carbs.target) * 100, 100),
      color: "#00D4FF",
    },
    {
      label: "Gordura",
      value: `${Math.round(props.fat.value)}`,
      sub: `/ ${props.fat.target}g`,
      percent: Math.min((props.fat.value / props.fat.target) * 100, 100),
      color: "#ff4444",
    },
    {
      label: "Streak",
      value: `${props.streakDays}`,
      sub: "dias consecutivos",
      percent: Math.min(props.streakDays * 7, 100),
      color: "#B8922A",
    },
    {
      label: `Nível ${props.level}`,
      value: `${currentLevelXP}`,
      sub: `XP / ${xpPerLevel}`,
      percent: xpPercent,
      color: "#B8922A",
    },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="hidden md:block h-full overflow-y-auto scrollbar-none"
      style={{ background: "rgba(2,2,5,0.96)" }}
    >
      {/* Athlete profile */}
      <div className="px-3 py-4" style={{ borderBottom: "1px solid rgba(184,146,42,0.06)" }}>
        <p style={TECH_LABEL}>PERFIL DO ATLETA</p>
        <h2 style={{ ...NUM, fontSize: 16, marginTop: 4, lineHeight: 1.1 }}>
          {props.fullName}
        </h2>
        {props.sport && (
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: "#B8922A",
              marginTop: 3,
            }}
          >
            {props.sport}
          </p>
        )}
        <div
          className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5"
          style={{
            border: "1px solid rgba(0,212,255,0.18)",
            borderRadius: 2,
            background: "rgba(0,212,255,0.03)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#00D4FF" }}
          />
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "#00D4FF",
            }}
          >
            {props.phaseLabel}
          </span>
        </div>
      </div>

      {/* Metrics list */}
      <div>
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.06 }}
            className="px-3 py-2.5 cursor-default group transition-colors"
            style={{
              borderBottom: "1px solid #0A0A0F",
            }}
          >
            <div className="flex items-baseline justify-between mb-1">
              <span style={{ ...TECH_LABEL, color: "#3A3A3A" }}>{m.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span style={{ ...NUM, fontSize: 15 }}>{m.value}</span>
              {m.sub && (
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    color: "#3A3A3A",
                  }}
                >
                  {m.sub}
                </span>
              )}
            </div>
            <div className="mt-1.5 h-px w-full" style={{ background: "#0F0F14" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.percent}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 + i * 0.08 }}
                className="h-full"
                style={{ background: m.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.aside>
  );
}
