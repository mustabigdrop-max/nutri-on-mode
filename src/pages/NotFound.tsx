import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#0a0a1a", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Hex grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,146,42,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,42,.04) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: 600, height: 400, background: `radial-gradient(ellipse, rgba(184,146,42,0.07) 0%, transparent 70%)` }}
      />

      {/* Scan line */}
      <div className="hud-scan-line" />

      {/* Corner brackets */}
      <div className="hud-corner-tl" style={{ top: 24, left: 24 }} />
      <div className="hud-corner-tr" style={{ top: 24, right: 24 }} />
      <div className="hud-corner-bl" style={{ bottom: 24, left: 24 }} />
      <div className="hud-corner-br" style={{ bottom: 24, right: 24 }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-4"
      >
        {/* Status */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN, boxShadow: `0 0 6px ${CYAN}`, animation: "dotPulse 1.6s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.2em", color: "rgba(0,212,255,0.45)", textTransform: "uppercase" }}>
            ERRO DE SISTEMA
          </span>
        </div>

        {/* 404 */}
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(7rem, 20vw, 14rem)",
            lineHeight: 1,
            color: GOLD,
            textShadow: `0 0 80px rgba(184,146,42,0.3)`,
            letterSpacing: "0.04em",
          }}
        >
          404
        </div>

        {/* Error code */}
        <div
          className="mb-6"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            color: "rgba(80,80,122,0.8)",
            textTransform: "uppercase",
          }}
        >
          ROTA NÃO ENCONTRADA · {location.pathname}
        </div>

        <p
          className="mb-10 max-w-xs mx-auto"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.95rem", color: "rgba(80,80,122,1)", lineHeight: 1.6 }}
        >
          Este módulo não existe no sistema. Retorne ao ponto de acesso principal.
        </p>

        <a
          href="/"
          style={{
            display: "inline-block",
            background: GOLD,
            color: "#0a0a1a",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "1rem 2.5rem",
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            textDecoration: "none",
          }}
        >
          VOLTAR AO SISTEMA
        </a>
      </motion.div>
    </div>
  );
};

export default NotFound;
