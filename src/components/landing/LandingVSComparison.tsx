import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const rows = [
  { other: "Te dá um cardápio genérico", nutrion: "Te dá um método baseado em comportamento" },
  { other: "Conta calorias sem contexto", nutrion: "Calcula GEB, GET e VET com precisão clínica" },
  { other: "Ignora por que você desistiu", nutrion: "Analisa padrões de sabotagem com IA" },
  { other: "Funciona por 2 semanas", nutrion: "Adapta o plano a cada ciclo de 7 dias" },
  { other: "Motivação genérica", nutrion: "Protocolo MCE: Mindset → Comportamento → Execução" },
  { other: "Você é um usuário", nutrion: "Você é um paciente com acompanhamento real" },
];

const LandingVSComparison = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="py-24 px-6 md:px-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <span className="font-mono text-[.7rem] text-primary tracking-[.25em] uppercase">Comparativo honesto</span>
        <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] text-foreground mt-3 leading-[.95]">
          Outros apps <span className="text-primary">×</span> NUTRION
        </h2>
      </motion.div>

      <div className="max-w-5xl mx-auto relative">
        {/* Divider line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent" style={{ boxShadow: "0 0 20px rgba(232,160,32,.25)" }} />

        {/* Header */}
        <div className="grid grid-cols-2 gap-0 mb-6">
          <div className="text-center">
            <span className="font-mono text-[.7rem] text-[#50507a] tracking-[.12em] uppercase">Outros apps</span>
          </div>
          <div className="text-center">
            <span className="font-mono text-[.7rem] text-primary tracking-[.12em] uppercase">NUTRION</span>
          </div>
        </div>

        {rows.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 * i }}
            className="grid grid-cols-2 gap-0 border-t border-[#14142a]"
          >
            <div className="py-5 px-4 md:px-8 flex items-start gap-3">
              <span className="text-red-500 text-lg mt-0.5 shrink-0">✕</span>
              <span className="text-[.9rem] text-[#6a6a8a] leading-[1.5]">{row.other}</span>
            </div>
            <div className="py-5 px-4 md:px-8 flex items-start gap-3">
              <span className="text-cyan-400 text-lg mt-0.5 shrink-0">✓</span>
              <span className="text-[.9rem] text-foreground/90 leading-[1.5]">{row.nutrion}</span>
            </div>
          </motion.div>
        ))}

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-12 font-heading text-[clamp(1rem,2.5vw,1.6rem)] text-foreground/60"
        >
          A diferença não está no app.{" "}
          <span className="text-primary">Está na filosofia.</span>
        </motion.p>
      </div>
    </section>
  );
};

export default LandingVSComparison;
