import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

// Animated count-up hook
function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return val;
}

const PROOF = [
  {
    target: 3847,
    suffix: "+",
    label: "Protocolos ativados",
    sub: "e crescendo todo dia",
    color: "#e8a020",
    highlight: true,
  },
  {
    target: 94,
    suffix: "%",
    label: "Taxa de aderência",
    sub: "média dos usuários ON",
    color: "#00f0b4",
    highlight: false,
  },
  {
    target: 10,
    suffix: "",
    label: "Protocolos científicos",
    sub: "de Low Carb a Peak Week",
    color: "#7890ff",
    highlight: false,
  },
  {
    target: 0,
    suffix: "",
    label: "Apps iguais no Brasil",
    sub: "e no mundo",
    color: "#e8a020",
    highlight: true,
    special: "NENHUM",
  },
];

const StatCard = ({
  stat,
  inView,
  index,
}: {
  stat: (typeof PROOF)[0];
  inView: boolean;
  index: number;
}) => {
  const counted = useCountUp(stat.target, inView, 1600 + index * 150);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className="relative bg-[#03030a] p-8 md:p-12 text-center group overflow-hidden border-r border-[#e8a020]/04 last:border-r-0"
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-1/4 right-1/4 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
      />

      {/* Glow background on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${stat.color}08, transparent)`,
        }}
      />

      <div className="relative z-10">
        {/* Main number */}
        <div
          className="font-heading leading-none mb-2"
          style={{
            fontSize: "clamp(3rem, 6vw, 5.5rem)",
            color: stat.color,
            textShadow: `0 0 40px ${stat.color}30`,
          }}
        >
          {stat.special ? stat.special : `${counted.toLocaleString("pt-BR")}${stat.suffix}`}
        </div>

        {/* Label */}
        <div className="font-mono text-[.62rem] text-[#f0edf8]/45 tracking-[.15em] uppercase mb-1.5">
          {stat.label}
        </div>

        {/* Sub */}
        <div className="font-mono text-[.52rem] text-[#30306a] tracking-[.06em]">
          {stat.sub}
        </div>
      </div>
    </motion.div>
  );
};

const LandingStats = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="relative overflow-hidden" style={{ background: "#060610" }}>
      {/* Top separator */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(232,160,32,.12), transparent)" }} />

      {/* Statement above stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        ref={ref}
        className="text-center py-12 px-6"
      >
        <p className="font-heading text-[1.1rem] text-[#f0edf8]/25 mb-1">
          Enquanto você lê isso,
        </p>
        <p
          className="font-heading"
          style={{
            fontSize: "clamp(1.4rem, 3.5vw, 2.8rem)",
            color: "#e8a020",
            textShadow: "0 0 30px rgba(232,160,32,.3)",
          }}
        >
          alguém está ativando o protocolo.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e8a020]/04">
        {PROOF.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} inView={inView} index={i} />
        ))}
      </div>

      {/* Bottom note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="text-center py-8 px-6"
      >
        <p className="font-mono text-[.58rem] text-[#30306a] tracking-[.1em]">
          Números reais. Sem exagero. Sem marketing barato.
        </p>
      </motion.div>

      {/* Bottom separator */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(232,160,32,.08), transparent)" }} />
    </section>
  );
};

export default LandingStats;
