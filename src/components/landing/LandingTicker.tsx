const ITEMS_A = [
  "LOW CARB", "CETOGÊNICA", "JEJUM 16/8", "HIGH CARB", "BODYBUILDER", "VEGANO PLANT-BASED",
  "MEDITERRÂNEA", "PALEO", "CUTTING · BULK · RECOMP", "PEAK WEEK",
];

const ITEMS_B = [
  "GEB · GET · VET", "HARRIS-BENEDICT", "KATCH-MCÄRDLE", "CRONOBIOLOGIA", "MINDFUL EATING",
  "TCC NUTRICIONAL", "JANELA ANABÓLICA", "MICROBIOMA", "SONO & MACROS", "TERMÔMETRO EMOCIONAL",
];

const Ticker = ({ items, reverse = false, color }: { items: string[]; reverse?: boolean; color: string }) => (
  <div className={`flex whitespace-nowrap ${reverse ? "animate-[ticker-rev_35s_linear_infinite]" : "animate-[ticker_35s_linear_infinite]"}`}>
    {[...items, ...items, ...items].map((item, i) => (
      <span
        key={i}
        className="font-mono text-[.6rem] tracking-[.2em] uppercase px-8 flex items-center gap-5 shrink-0"
        style={{ color: color === "gold" ? "rgba(232,160,32,.35)" : "rgba(0,240,180,.3)" }}
      >
        {item}
        <span
          className="w-[3px] h-[3px] rounded-full flex-shrink-0"
          style={{ background: color === "gold" ? "rgba(232,160,32,.5)" : "rgba(0,240,180,.45)" }}
        />
      </span>
    ))}
  </div>
);

const LandingTicker = () => (
  <div className="border-t border-b border-[#e8a020]/05 overflow-hidden relative" style={{ background: "rgba(6,6,18,.6)" }}>
    {/* Fade edges */}
    <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #03030a, transparent)" }} />
    <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: "linear-gradient(-90deg, #03030a, transparent)" }} />

    {/* Row 1 — gold, forward */}
    <div className="py-3 border-b border-[#e8a020]/04 overflow-hidden">
      <Ticker items={ITEMS_A} color="gold" />
    </div>

    {/* Row 2 — cyan, reverse */}
    <div className="py-3 overflow-hidden">
      <Ticker items={ITEMS_B} reverse color="cyan" />
    </div>

    <style>{`
      @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }
      @keyframes ticker-rev { from { transform: translateX(-33.333%) } to { transform: translateX(0) } }
    `}</style>
  </div>
);

export default LandingTicker;
