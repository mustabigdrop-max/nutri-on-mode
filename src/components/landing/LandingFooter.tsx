const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const LandingFooter = () => (
  <footer
    className="relative px-6 md:px-12 py-8 overflow-hidden"
    style={{
      background: "#06060f",
      borderTop: "1px solid rgba(184,146,42,0.12)",
    }}
  >
    {/* Top line gradient */}
    <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg, transparent, rgba(184,146,42,0.4), rgba(0,212,255,0.25), transparent)` }} />

    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      {/* Logo */}
      <div className="relative flex items-center gap-2">
        <div className="absolute -top-1 -left-2 w-2.5 h-2.5" style={{ borderTop: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}`, opacity: 0.5 }} />
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.3rem", letterSpacing: "0.1em" }}>
          <span style={{ color: "rgba(245,240,232,0.65)" }}>NUTRI</span>
          <span style={{ color: GOLD, textShadow: `0 0 12px rgba(184,146,42,0.4)` }}>ON</span>
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN, boxShadow: `0 0 6px ${CYAN}`, animation: "dotPulse 1.6s ease-in-out infinite" }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.15em", color: "rgba(0,212,255,0.4)", textTransform: "uppercase" }}>
          Sistema Ativo
        </span>
      </div>

      {/* Copyright */}
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.08em", color: "rgba(80,80,122,0.6)", textAlign: "right" }}>
        © 2026 NutriON · Nutrição de Precisão · Powered by IA
      </div>
    </div>
  </footer>
);

export default LandingFooter;
