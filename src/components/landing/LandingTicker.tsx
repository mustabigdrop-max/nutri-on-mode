const items = [
  { label: "LOW CARB",      code: "LC-01" },
  { label: "CETOGÊNICA",    code: "KT-02" },
  { label: "JEJUM 16/8",    code: "IF-03" },
  { label: "HIGH CARB",     code: "HC-04" },
  { label: "BODYBUILDER",   code: "BB-05" },
  { label: "PLANT-BASED",   code: "VG-06" },
  { label: "MEDITERRÂNEA",  code: "MD-07" },
  { label: "PALEO",         code: "PL-08" },
  { label: "PEAK WEEK",     code: "PW-09" },
  { label: "MICROBIOMA",    code: "MB-10" },
  { label: "CRONOBIOLOGIA", code: "CB-11" },
  { label: "SUPLEMENTAÇÃO", code: "SS-12" },
  { label: "GLP-1",         code: "GP-13" },
  { label: "STRATUM",       code: "ST-14" },
  { label: "VERTEX™",       code: "VX-15" },
  { label: "KAA™",          code: "KA-16" },
];

const LandingTicker = () => (
  <div
    className="relative overflow-hidden"
    style={{
      borderTop: "1px solid rgba(184,146,42,0.12)",
      borderBottom: "1px solid rgba(184,146,42,0.12)",
      background: "rgba(10,10,26,0.6)",
      height: 36,
    }}
  >
    {/* Left fade */}
    <div className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none z-10"
      style={{ background: "linear-gradient(to right, #0a0a1a, transparent)" }} />
    {/* Right fade */}
    <div className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none z-10"
      style={{ background: "linear-gradient(to left, #0a0a1a, transparent)" }} />

    {/* Status dot left */}
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00D4FF", boxShadow: "0 0 6px #00D4FF", animation: "dotPulse 1.6s ease-in-out infinite" }} />
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: "rgba(0,212,255,0.45)" }}>MÓDULOS</span>
    </div>

    <div
      className="flex items-center h-full whitespace-nowrap"
      style={{ animation: "ticker-scroll 40s linear infinite" }}
    >
      {[...items, ...items].map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-3 shrink-0"
          style={{ padding: "0 20px" }}
        >
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.1em", color: "rgba(184,146,42,0.4)" }}>
            [{item.code}]
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.2em", color: i % 3 === 0 ? "#B8922A" : i % 3 === 1 ? "rgba(245,240,232,0.55)" : "#00D4FF" }}>
            {item.label}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: i % 2 === 0 ? "rgba(184,146,42,0.4)" : "rgba(0,212,255,0.4)" }} />
        </span>
      ))}
    </div>

    <style>{`
      @keyframes ticker-scroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
    `}</style>
  </div>
);

export default LandingTicker;
