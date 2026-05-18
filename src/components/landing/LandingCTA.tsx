import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const LandingCTA = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div
      ref={ref}
      className="relative px-6 md:px-12 py-[120px] text-center overflow-hidden"
      style={{ background: "#0a0a1a" }}
    >
      {/* Hex grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,146,42,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,42,.05) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: 600, height: 400, background: `radial-gradient(ellipse, rgba(184,146,42,0.08) 0%, transparent 70%)` }}
      />

      {/* Corner brackets */}
      <div className="hud-corner-tl" style={{ top: 32, left: 32 }} />
      <div className="hud-corner-tr" style={{ top: 32, right: 32 }} />
      <div className="hud-corner-bl" style={{ bottom: 32, left: 32 }} />
      <div className="hud-corner-br" style={{ bottom: 32, right: 32 }} />

      {/* Scan line */}
      <div className="hud-scan-line" />

      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center gap-2 mb-10"
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN, boxShadow: `0 0 8px ${CYAN}`, animation: "dotPulse 1.6s ease-in-out infinite" }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.22em", color: `rgba(0,212,255,0.5)`, textTransform: "uppercase" }}>
          Sistema de Performance Ativado
        </span>
      </motion.div>

      {/* Watermark text */}
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading pointer-events-none select-none leading-none whitespace-nowrap"
        style={{ fontSize: "28vw", color: "rgba(184,146,42,0.025)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
      >
        ON
      </span>

      {/* Provocation */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", color: "rgba(80,80,122,1)", textTransform: "uppercase", marginBottom: 24 }}
      >
        Você ainda vai tratar seu corpo como um problema de cardápio?
      </motion.p>

      {/* Main headline */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="font-heading leading-[0.9] mb-8 relative"
        style={{ fontSize: "clamp(3rem, 9vw, 9rem)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
      >
        <span style={{ color: "#F5F0E8" }}>VOCÊ ESTÁ</span>
        <br />
        <span style={{ color: GOLD, textShadow: `0 0 50px rgba(184,146,42,0.4)` }}>NUTRI</span>
        <span style={{ color: "#F5F0E8" }}>ON?</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="max-w-[520px] mx-auto mb-10 relative"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1rem", color: "rgba(80,80,122,1)", lineHeight: 1.7 }}
      >
        Nutrição. Treino. Farmacologia. Microbiota. Mente.{" "}
        <span style={{ color: "rgba(245,240,232,0.75)" }}>Tudo integrado. Tudo adaptado para você.</span>
      </motion.p>

      {/* Risk reversal */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.45 }}
        style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.15em", color: "rgba(80,80,122,0.7)", textTransform: "uppercase", marginBottom: 40 }}
      >
        Cancele quando quiser · Sem pegadinha · Sem letras miúdas
      </motion.p>

      {/* CTA button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="relative inline-block mb-12"
      >
        <a
          href="https://pay.kiwify.com.br/G8uxU9O"
          target="_blank"
          rel="noopener noreferrer"
          className="relative block group"
          style={{
            background: GOLD,
            color: "#0a0a1a",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "1.1rem 3rem",
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            transition: "all 0.25s ease",
          }}
        >
          Entrar no modo ON →
        </a>
        {/* Glow effect */}
        <div
          className="absolute -inset-4 pointer-events-none opacity-40"
          style={{ background: `radial-gradient(ellipse, ${GOLD}44, transparent 70%)`, filter: "blur(20px)" }}
        />
      </motion.div>

      {/* Social proof */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="flex items-center justify-center gap-3"
      >
        <div className="flex -space-x-2">
          {["#B8922A", "#00D4FF", "#22c55e", "#a855f7", "#f97316"].map((color, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full"
              style={{ background: color, border: "2px solid #0a0a1a" }}
            />
          ))}
        </div>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.8)" }}>
          Novas ativações a cada hora
        </span>
      </motion.div>
    </div>
  );
};

export default LandingCTA;
