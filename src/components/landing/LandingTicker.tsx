const items = [
  "Low Carb", "Cetogênica", "Jejum 16/8", "High Carb", "Atleta Bodybuilder",
  "Vegano Plant-Based", "Mediterrânea", "Paleo", "Cutting Bulk Recomp", "Peak Week",
  "GEB · GET · VET", "Harris-Benedict", "Katch-McArdle", "VENTA", "Mindful Eating", "TCC Nutricional",
];

const LandingTicker = () => (
  <div className="border-t border-b border-border py-3.5 overflow-hidden bg-primary/[.02] relative">
    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
    <div className="flex whitespace-nowrap animate-[ticker_30s_linear_infinite]">
      {[...items, ...items].map((item, i) => (
        <span key={i} className="font-mono text-[.7rem] text-muted-foreground tracking-[.12em] uppercase px-10 flex items-center gap-4 shrink-0">
          {item}
          <span className="w-1 h-1 bg-primary rounded-full" />
        </span>
      ))}
    </div>
    <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
  </div>
);

export default LandingTicker;
