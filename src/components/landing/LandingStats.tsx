import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { val: "10", label: "Protocolos de dieta" },
  { val: "7", label: "Módulos de saúde" },
  { val: "22+", label: "Telas e funcionalidades" },
  { val: "ON", label: "24h · 7 dias · Sempre ligado", glow: true },
];

const LandingStats = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div className="bg-[#03030a] border-t border-b border-[#14142a]">
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#14142a]">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-[#03030a] p-8 md:p-12 text-center"
          >
            <div
              className="font-heading text-[4rem] text-primary leading-none"
              style={stat.glow ? { textShadow: "0 0 30px rgba(232,160,32,.4)" } : {}}
            >
              {stat.val}
            </div>
            <div className="font-mono text-[.65rem] text-[#50507a] tracking-[.12em] uppercase mt-2">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LandingStats;
