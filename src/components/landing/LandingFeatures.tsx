import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { allModules } from "@/data/landingModules";

const highlighted = ["01", "04", "07", "10", "20", "21"];

const Counter = ({ to, inView }: { to: number; inView: boolean }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <>{n}</>;
};

const Typewriter = ({ text, start }: { text: string; start: boolean }) => {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!start) return;
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [text, start]);
  return <span>{out}<span className="animate-pulse">▊</span></span>;
};

const ModuleCard = ({
  num, title, short, color, index,
}: { num: string; title: string; short: string; color: string; index: number }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative rounded-lg p-6 transition-all duration-300"
      style={{
        background: "#0d0d1f",
        border: `1px solid ${hover ? color : "#ffffff12"}`,
        transform: hover ? "translateY(-8px)" : "none",
        boxShadow: hover ? `0 0 20px ${color}26` : "none",
      }}
    >
      <span className="absolute top-3 right-4 font-mono text-[11px] tracking-[.1em]" style={{ color: "#B8922A" }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="text-[22px] mb-3">{allModules.find((m) => m.num === num)?.icon}</div>
      <div className="font-heading font-bold text-[16px] uppercase tracking-[.04em] text-white mb-2 pr-8">{title}</div>
      <p className="text-[13px] leading-[1.6] font-landing" style={{ color: "#8A8A8A" }}>{short}</p>
    </motion.div>
  );
};

const LandingFeatures = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-10%" });

  const cards = highlighted
    .map((n) => allModules.find((m) => m.num === n))
    .filter(Boolean) as typeof allModules;

  return (
    <section id="features" className="bg-[#080814] px-6 md:px-12 py-[120px] relative overflow-hidden">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="relative">
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />— O QUE O NUTRION ENTREGA
        </div>
        <h2 className="font-heading leading-[.92] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
          <span className="block text-white">TUDO QUE A PRESCRIÇÃO</span>
          <span className="block text-[#B8922A]">PROFISSIONAL EXIGE.</span>
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-[#888] text-[1rem] leading-[1.7] font-landing max-w-[600px] mb-12"
        >
          Cada módulo resolve um problema real.<br />Todos integrados. Todos em um sistema.
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
          className="absolute left-0 right-0 bottom-0 h-px origin-left"
          style={{ background: "linear-gradient(90deg, transparent, #00D4FF, transparent)" }}
        />
      </motion.div>

      {/* 6 módulos em destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
        {cards.map((m, i) => (
          <ModuleCard key={m.num} num={m.num} title={m.title} short={m.short} color={m.color} index={i} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/modulos"
          className="font-mono text-[.8rem] tracking-[.12em] text-[#00D4FF] hover:text-white transition-colors border-b border-[#00D4FF]/40 pb-1"
        >
          Ver todos os {allModules.length} módulos →
        </Link>
      </div>

      {/* Status bar HUD */}
      <div ref={statsRef} className="mt-16 bg-[#0a0a1a] rounded-lg" style={{ border: "1px solid transparent", borderTop: "1px solid #ffffff10" }}>
        <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { v: allModules.length, l1: "MÓDULOS", l2: "ATIVOS" },
            { v: 132, l1: "COMPOSTOS", l2: "CATALOGADOS" },
            { v: 28, l1: "TESTES", l2: "CLÍNICOS" },
            { v: 7, l1: "CAMADAS", l2: "STRATUM" },
          ].map((s) => (
            <div key={s.l1} className="text-center">
              <div className="font-heading text-[2.4rem] text-[#B8922A] leading-none font-bold">
                <Counter to={s.v} inView={statsInView} />
              </div>
              <div className="font-mono text-[10px] tracking-[.15em] text-[#888] mt-2">{s.l1}</div>
              <div className="font-mono text-[10px] tracking-[.15em] text-[#666]">{s.l2}</div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-[#ffffff10] font-mono text-[11px] tracking-[.08em] text-[#00D4FF]">
          <Typewriter text="TODOS OS MÓDULOS INTEGRADOS · DIAGNÓSTICO ATIVO · PROTOCOLO CARREGADO · SISTEMA ON" start={statsInView} />
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
