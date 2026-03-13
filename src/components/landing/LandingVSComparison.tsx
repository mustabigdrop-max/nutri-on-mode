import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const ROWS = [
  {
    them: "Te pede para contar caloria manualmente",
    us: "Protocolo gerado em 7 minutos com IA + ciência",
  },
  {
    them: "Notificação às 18h: \"O que você comeu hoje?\"",
    us: "Às 7h: plano completo do dia já na tela",
  },
  {
    them: "Mesmo cardápio para qualquer pessoa",
    us: "Ajusta por exames, treino, sono e humor",
  },
  {
    them: "Não sabe por que você desistiu",
    us: "IA comportamental age antes do deslize",
  },
  {
    them: "Funcionalidades decorativas sem protocolo",
    us: "10 dietas científicas · cronobiologia · gamificação real",
  },
  {
    them: "Você some do app → o app te ignora",
    us: "Coach IA pergunta, recalibra e te reativa",
  },
];

const LandingVSComparison = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6%" });

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-[120px] overflow-hidden"
      style={{ background: "linear-gradient(180deg, #080814 0%, #03030a 100%)" }}
    >
      {/* Background decorative lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(232,160,32,.012) 1px, transparent 1px)",
        backgroundSize: "100% 60px",
      }} />

      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2.5 mb-6 border border-[#e8a020]/12 bg-[#e8a020]/[.04] px-4 py-2 rounded-full">
            <span className="font-mono text-[.58rem] text-[#e8a020]/70 tracking-[.2em] uppercase">Comparativo honesto</span>
          </div>
          <h2
            className="font-heading leading-[.9] mb-4"
            style={{ fontSize: "clamp(2.2rem, 5vw, 5rem)" }}
          >
            <span className="text-[#f0edf8]/30">OUTROS APPS</span>
            <span className="text-[#f0edf8]/25 mx-4">×</span>
            <span style={{ color: "#e8a020", textShadow: "0 0 40px rgba(232,160,32,.4)" }}>NUTRION</span>
          </h2>
          <p className="text-[#60607a] font-landing text-[.9rem] max-w-[400px] mx-auto">
            Não é questão de features. É questão de filosofia.
          </p>
        </motion.div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_56px_1fr] gap-0 mb-3">
          <div className="px-6 pb-3 border-b border-[#ffffff]/04">
            <span className="font-mono text-[.58rem] text-[#ff4444]/50 tracking-[.2em] uppercase flex items-center gap-2">
              <span className="w-2 h-px bg-current" />
              Qualquer app genérico
            </span>
          </div>
          <div />
          <div className="px-6 pb-3 border-b border-[#e8a020]/12">
            <span className="font-mono text-[.58rem] text-[#e8a020]/70 tracking-[.2em] uppercase flex items-center gap-2 justify-end">
              NUTRION
              <span className="w-2 h-px bg-current" />
            </span>
          </div>
        </div>

        {/* VS rows */}
        <div className="relative">
          {/* Central divider */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px]"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(232,160,32,.2) 10%, rgba(232,160,32,.2) 90%, transparent)" }}
          />

          {/* VS badge — center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "#03030a",
                border: "1px solid rgba(232,160,32,.25)",
                boxShadow: "0 0 30px rgba(232,160,32,.08)",
              }}
            >
              <span className="font-heading text-[.8rem] text-[#e8a020]/60 tracking-[.05em]">VS</span>
            </div>
          </div>

          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="grid grid-cols-[1fr_56px_1fr] border-b border-[#ffffff]/03 last:border-b-0"
            >
              {/* Left — outros apps */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                className="px-6 py-5 flex items-center gap-3 group"
              >
                <span
                  className="w-4 h-4 rounded-full border border-[#ff4444]/20 flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,68,68,.06)" }}
                >
                  <span className="w-1.5 h-px bg-[#ff4444]/50 block" />
                </span>
                <span className="font-landing text-[.82rem] text-[#404060] leading-[1.5]">{row.them}</span>
              </motion.div>

              {/* Spacer */}
              <div />

              {/* Right — NUTRION */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="px-6 py-5 flex items-center gap-3 justify-end text-right group"
                style={{ background: "rgba(232,160,32,.012)" }}
              >
                <span className="font-landing text-[.82rem] text-[#c0c0e0] leading-[1.5]">{row.us}</span>
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(0,240,180,.08)",
                    border: "1px solid rgba(0,240,180,.25)",
                    boxShadow: "0 0 8px rgba(0,240,180,.1)",
                  }}
                >
                  <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                    <path d="M1 3L2.8 5L6 1" stroke="#00f0b4" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA line */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mt-14"
        >
          <p className="font-heading text-[1.4rem] text-[#f0edf8]/55 mb-2">
            A diferença não está no app.
          </p>
          <p className="font-heading text-[1.4rem]" style={{ color: "#e8a020", textShadow: "0 0 30px rgba(232,160,32,.3)" }}>
            Está na filosofia por trás dele.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingVSComparison;
