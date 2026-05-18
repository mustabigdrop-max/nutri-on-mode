import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const bullets = [
  "Acesso completo a todos os protocolos por 7 dias",
  "Cancele com 1 clique — sem burocracia, sem email",
  "Sem cobrança se cancelar dentro do prazo",
  "Seus dados ficam salvos caso volte",
];

const LandingGuarantee = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="px-6 md:px-12 py-20" style={{ background: "rgba(8,8,20,0.95)" }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden text-center"
          style={{
            background: "rgba(10,10,26,0.9)",
            border: `1px solid rgba(184,146,42,0.2)`,
            padding: "3rem 3.5rem",
          }}
        >
          {/* Corner brackets */}
          <div className="hud-corner-tl" style={{ top: 0, left: 0, width: 24, height: 24 }} />
          <div className="hud-corner-tr" style={{ top: 0, right: 0, width: 24, height: 24 }} />
          <div className="hud-corner-bl" style={{ bottom: 0, left: 0, width: 24, height: 24 }} />
          <div className="hud-corner-br" style={{ bottom: 0, right: 0, width: 24, height: 24 }} />

          {/* Top line */}
          <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

          {/* Shield icon (HUD-style) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <svg width="64" height="76" viewBox="0 0 64 76" fill="none">
                <path
                  d="M32 2L4 16V36C4 54.78 16.16 72.16 32 76C47.84 72.16 60 54.78 60 36V16L32 2Z"
                  stroke={GOLD}
                  strokeWidth="1.5"
                  fill="rgba(184,146,42,0.06)"
                />
                <path
                  d="M32 10L11 22V36C11 51 20.8 65 32 68.8C43.2 65 53 51 53 36V22L32 10Z"
                  fill="rgba(184,146,42,0.04)"
                  stroke={GOLD}
                  strokeWidth="0.5"
                  strokeOpacity="0.4"
                />
                <motion.path
                  d="M22 38L29 45L42 30"
                  stroke={CYAN}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.5 }}
                />
              </svg>
              {/* Ping effect */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ animation: "hud-ping-gold 2.5s ease-out infinite", background: `rgba(184,146,42,0.08)` }}
              />
            </div>
          </motion.div>

          {/* Status tag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-5"
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.25em", color: "rgba(0,212,255,0.55)", textTransform: "uppercase", border: `1px solid rgba(0,212,255,0.15)`, padding: "0.2rem 0.7rem" }}>
              GARANTIA DE 7 DIAS
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "clamp(1.7rem, 4vw, 2.8rem)", color: GOLD, lineHeight: 1, marginBottom: 12, textShadow: `0 0 30px rgba(184,146,42,0.3)` }}
          >
            7 DIAS PARA MUDAR DE IDEIA
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.88rem", color: "rgba(80,80,122,1)", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 2rem" }}
          >
            Teste tudo. Se não fizer sentido pra você, cancela. Simples assim.
          </motion.p>

          {/* Bullets */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="text-left max-w-[380px] mx-auto space-y-3 mb-8"
          >
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span style={{ color: CYAN, fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", marginTop: 3, flexShrink: 0 }}>→</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem", color: "rgba(80,80,122,1)", lineHeight: 1.6 }}>{b}</span>
              </li>
            ))}
          </motion.ul>

          {/* Closing */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.55 }}
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.05em", color: "#F5F0E8" }}
          >
            O risco é nosso.{" "}
            <span style={{ color: GOLD }}>O resultado é seu.</span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingGuarantee;
