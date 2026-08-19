import { useEffect, useState } from "react";

/** Barra de progresso de scroll (global, sutil). */
const LandingScrollProgress = () => {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[200] pointer-events-none">
      <div
        className="h-full origin-left"
        style={{
          transform: `scaleX(${pct})`,
          background: "linear-gradient(90deg, #E8A020, #00D4FF)",
          boxShadow: "0 0 12px rgba(232,160,32,.5)",
          transition: "transform .12s linear",
        }}
      />
    </div>
  );
};

export default LandingScrollProgress;
