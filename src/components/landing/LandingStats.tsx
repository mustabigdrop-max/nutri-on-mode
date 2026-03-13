import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { val: 10, label: "Protocolos de dieta", suffix: "" },
  { val: 7, label: "Módulos de saúde", suffix: "" },
  { val: 22, label: "Telas e funcionalidades", suffix: "+" },
  { val: 0, label: "24h · 7 dias · Sempre ligado", suffix: "", display: "ON", glow: true },
];

const CountUp = ({ target, inView, suffix, display }: { target: number; inView: boolean; suffix: string; display?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || display) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, display]);

  if (display) return <>{display}</>;
  return <>{count}{suffix}</>;
};

const LandingStats = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div className="bg-background border-t border-b border-border">
      {/* Intro phrase */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center font-mono text-[.75rem] text-primary/70 tracking-[.1em] uppercase py-6"
      >
        Enquanto você lê isso, alguém está ativando o protocolo.
      </motion.p>

      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-background p-8 md:p-12 text-center"
          >
            <div
              className="font-heading text-[4rem] text-primary leading-none"
              style={stat.glow ? { textShadow: "0 0 30px rgba(232,160,32,.4)" } : {}}
            >
              <CountUp target={stat.val} inView={inView} suffix={stat.suffix} display={stat.display} />
            </div>
            <div className="font-mono text-[.65rem] text-muted-foreground tracking-[.12em] uppercase mt-2">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LandingStats;
