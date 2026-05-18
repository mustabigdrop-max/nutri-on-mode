const items = [
  { label: "NUTRIÇÃO DE PRECISÃO", code: "NP-01" },
  { label: "STRATUM™",             code: "ST-02" },
  { label: "VERTEX™",              code: "VX-03" },
  { label: "PEPTÍDEOS",            code: "PT-04" },
  { label: "MICROBIOMA",           code: "MB-05" },
  { label: "FITOTERÁPICOS",        code: "FT-06" },
  { label: "GLP-1",                code: "GP-07" },
  { label: "CRONOBIOLOGIA",        code: "CB-08" },
  { label: "PEAK WEEK",            code: "PW-09" },
  { label: "KAA™",                 code: "KA-10" },
  { label: "FARMACOLOGIA",         code: "FM-11" },
  { label: "MMA · CROSSFIT",       code: "SP-12" },
  { label: "PERIODIZAÇÃO",         code: "PD-13" },
  { label: "LONGEVIDADE",          code: "LV-14" },
  { label: "BIOMARCADORES",        code: "BM-15" },
  { label: "TCC NUTRICIONAL",      code: "TC-16" },
  { label: "PERFORMANCE PRO",      code: "PR-17" },
  { label: "RUNNING · NATAÇÃO",    code: "EN-18" },
  { label: "HORMÔNIOS",            code: "HR-19" },
  { label: "ANTI-AGING",           code: "AA-20" },
  { label: "NUTRISYNC™",           code: "NS-21" },
  { label: "PCA",                  code: "PC-22" },
  { label: "CETOGÊNICA",           code: "KT-23" },
  { label: "MCE",                  code: "MC-24" },
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
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: "rgba(0,212,255,0.45)" }}>SISTEMAS ATIVOS</span>
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
