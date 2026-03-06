const items = [
  "Low Carb", "Cetogênica", "Jejum 16/8", "High Carb", "Atleta Bodybuilder",
  "Vegano Plant-Based", "Mediterrânea", "Paleo", "Cutting Bulk Recomp", "Peak Week",
  "GEB · GET · VET", "Harris-Benedict", "Katch-McArdle", "VENTA", "Mindful Eating", "TCC Nutricional",
];

const LandingTicker = () => (
  <div className="border-t border-b border-[#14142a] py-3.5 overflow-hidden bg-primary/[.02]">
    <div className="flex whitespace-nowrap animate-[ticker_30s_linear_infinite]">
      {[...items, ...items].map((item, i) => (
        <span key={i} className="font-mono text-[.7rem] text-[#50507a] tracking-[.12em] uppercase px-10 flex items-center gap-4 shrink-0">
          {item}
          <span className="w-1 h-1 bg-primary rounded-full" />
        </span>
      ))}
    </div>
    <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
  </div>
);

export default LandingTicker;
