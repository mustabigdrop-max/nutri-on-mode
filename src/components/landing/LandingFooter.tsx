const LandingFooter = () => (
  <footer className="bg-[#03030a] border-t border-[#14142a] px-6 md:px-12 py-10 flex flex-col md:flex-row justify-between items-center gap-4">
    <div className="font-heading text-[1.4rem] tracking-[.1em]">
      <span className="opacity-70">NUTRI</span>
      <span className="text-primary" style={{ textShadow: "0 0 12px rgba(232,160,32,.4)" }}>ON</span>
    </div>
    <div className="font-mono text-[.65rem] text-[#50507a]">
      © 2026 NutriON · Nutrição de Precisão · Feito por Nutrition Coach · Powered by IA
    </div>
  </footer>
);

export default LandingFooter;
