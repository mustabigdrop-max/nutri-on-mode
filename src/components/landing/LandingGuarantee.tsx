import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const LandingGuarantee = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6%" });

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-[100px] overflow-hidden"
      style={{ background: "linear-gradient(180deg, #03030a 0%, #050510 50%, #03030a 100%)" }}
    >
      {/* Radial behind shield */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,240,180,.04) 0%, transparent 65%)",
      }} />

      <div className="max-w-[860px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center">

          {/* Shield icon — CSS drawn */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex justify-center md:justify-start"
          >
            <div className="relative w-[120px] h-[140px]">
              {/* Shield shape via SVG */}
              <svg viewBox="0 0 120 140" fill="none" className="absolute inset-0 w-full h-full">
                <path
                  d="M60 6 L108 24 L108 72 C108 100 84 124 60 134 C36 124 12 100 12 72 L12 24 Z"
                  fill="rgba(0,240,180,.06)"
                  stroke="rgba(0,240,180,.25)"
                  strokeWidth="1.5"
                />
                {/* Inner shield */}
                <path
                  d="M60 18 L96 32 L96 72 C96 94 78 114 60 122 C42 114 24 94 24 72 L24 32 Z"
                  fill="none"
                  stroke="rgba(0,240,180,.08)"
                  strokeWidth="1"
                />
                {/* Checkmark */}
                <path
                  d="M38 70 L52 84 L82 54"
                  stroke="rgba(0,240,180,.7)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Glow behind */}
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                background: "radial-gradient(circle at 50% 50%, rgba(0,240,180,.12), transparent 65%)",
                filter: "blur(12px)",
              }} />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="font-mono text-[.58rem] text-[#00f0b4]/60 tracking-[.28em] uppercase mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-current" />
              Garantia NUTRION
            </div>

            <h2
              className="font-heading leading-[.9] mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)" }}
            >
              <span style={{ color: "#00f0b4", textShadow: "0 0 30px rgba(0,240,180,.3)" }}>7 DIAS</span>
              <br />
              <span className="text-[#f0edf8]">PARA MUDAR</span>
              <br />
              <span className="text-[#f0edf8]">DE IDEIA.</span>
            </h2>

            <p className="font-landing text-[.95rem] text-[#8888b0] leading-[1.8] mb-6 max-w-[480px]">
              Ative o NUTRION. Use o protocolo por 7 dias.{" "}
              <strong className="text-[#f0edf8]/75">
                Se não mudar sua relação com alimentação
              </strong>
              , cancele pela própria plataforma. Sem formulário. Sem ligação.
              Sem multa. Sem pergunta.
            </p>

            {/* Guarantee items */}
            <div className="flex flex-col gap-2.5">
              {[
                "Cancele em 1 clique pela plataforma",
                "Sem taxa de cancelamento",
                "Sem período de carência oculto",
                "Reembolso processado em até 5 dias úteis",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(0,240,180,.1)", border: "1px solid rgba(0,240,180,.25)" }}>
                    <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                      <path d="M1 3.5L3 5.5L7 1.5" stroke="#00f0b4" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="font-landing text-[.82rem] text-[#7070a0]">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider quote */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center border-t border-[#00f0b4]/06 pt-10"
        >
          <p
            className="font-heading"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.8rem)", color: "#f0edf8" }}
          >
            O risco é nosso.{" "}
            <span style={{ color: "#00f0b4", textShadow: "0 0 20px rgba(0,240,180,.3)" }}>
              O resultado é seu.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingGuarantee;
