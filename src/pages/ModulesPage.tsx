import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { allModules, type LandingModule } from "@/data/landingModules";

const ModuleCard = ({ m, index }: { m: LandingModule; index: number }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative rounded-lg p-5 sm:p-6 transition-all duration-300 will-change-transform"
      style={{
        background: "#0d0d1f",
        border: `1px solid ${hover ? m.color : "#ffffff12"}`,
        borderLeft: `2px solid ${m.color}`,
        transform: hover ? "translateY(-6px)" : "none",
        boxShadow: hover ? `0 0 24px ${m.color}22` : "none",
      }}
    >
      <span className="absolute top-3 right-4 font-mono text-[11px] tracking-[.1em]" style={{ color: "#B8922A" }}>
        {m.num}
      </span>
      <div className="text-[20px] mb-2.5" aria-hidden>{m.icon}</div>
      <h2 className="font-heading font-bold text-[14px] sm:text-[15px] uppercase tracking-[.04em] text-white mb-1 pr-10 leading-snug">
        {m.title}
      </h2>
      <div className="font-mono text-[10.5px] sm:text-[11px] mb-3" style={{ color: m.color }}>{m.subtitle}</div>
      <p className="text-[12.5px] leading-[1.65] font-landing" style={{ color: "#8A8A8A" }}>{m.text}</p>
    </motion.article>
  );
};

const ModulesPage = () => (
  <div className="relative min-h-screen bg-[#03030a] text-[#f0edf8] font-landing overflow-x-hidden">
    {/* grid sutil — mesma identidade da home */}
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(232,160,32,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,32,.03) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }}
      aria-hidden
    />
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "radial-gradient(ellipse 85% 85% at 50% 40%, transparent 30%, rgba(3,3,10,.7) 100%)" }}
      aria-hidden
    />

    <div className="relative z-[2] px-5 sm:px-8 md:px-12 py-12 md:py-16">
      <div className="max-w-[1120px] mx-auto">
        <div className="flex items-center justify-between gap-4 mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[.72rem] tracking-[.12em] text-[#8A8A8A] hover:text-[#00D4FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> VOLTAR
          </Link>
          <div className="font-heading text-[1.25rem] tracking-[.12em]">
            <span className="text-[#f0edf8] opacity-85">NUTRI</span>
            <span className="text-[#B8922A]" style={{ textShadow: "0 0 20px rgba(232,160,32,.5)" }}>O</span>
            <span className="logo-n-cyan" style={{ color: "#00D4FF" }}>N</span>
          </div>
        </div>

        <div className="font-mono text-[.62rem] text-[#B8922A] tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-[#B8922A]" />— SISTEMA COMPLETO · {allModules.length} MÓDULOS
        </div>
        <h1 className="font-heading leading-[.95] mb-4" style={{ fontSize: "clamp(1.9rem, 7vw, 4rem)" }}>
          <span className="block text-white">TODOS OS MÓDULOS</span>
          <span className="block text-[#B8922A]">DO NUTRION.</span>
        </h1>
        <p className="text-[#8A8A8A] max-w-[600px] mb-10 md:mb-14 leading-[1.7] text-[.95rem]">
          Cada módulo resolve um problema real. Todos integrados. Transformação é sistema.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {allModules.map((m, i) => (
            <ModuleCard key={m.num} m={m} index={i} />
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-4">
          <Link
            to="/auth"
            className="w-full sm:w-auto text-center font-mono text-[.8rem] tracking-[.1em] text-white px-8 py-4 rounded-lg transition-all duration-300 hover:bg-[rgba(0,212,255,0.1)] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
            style={{ border: "2px solid #00D4FF" }}
          >
            Começar agora →
          </Link>
          <span className="font-landing italic text-[13px]" style={{ color: "#00D4FF" }}>
            "Transformação é sistema."
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default ModulesPage;
