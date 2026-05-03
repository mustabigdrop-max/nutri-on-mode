import { useEffect, useRef } from "react";

export function TrainingHUDBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      const dur = 6 + Math.random() * 8;
      const delay = Math.random() * 8;
      const left = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 60;
      p.style.cssText = `
        position:absolute;width:2px;height:2px;background:#00FF78;
        border-radius:50%;opacity:0;pointer-events:none;
        left:${left}%;
        animation:particleFly ${dur}s ${delay}s linear infinite;
        --drift:${drift}px;
      `;
      container.appendChild(p);
    }
  }, []);

  return (
    <>
      <div className="ton-grid-bg" />
      <div className="ton-scan-line" />
      <div ref={containerRef} className="ton-particles" />
      <div className="ton-corner ton-corner-tl" />
      <div className="ton-corner ton-corner-tr" />
      <div className="ton-corner ton-corner-bl" />
      <div className="ton-corner ton-corner-br" />
    </>
  );
}
