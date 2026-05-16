import { useEffect, useRef } from "react";

/**
 * Subtle holographic backdrop for the dashboard:
 * - hexagonal grid (opacity ~0.015 gold)
 * - 40 slow particles (gold / cyan, opacity ≤ 0.08)
 * Non-intrusive, fixed, pointer-events disabled.
 */
export default function JarvisBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      cyan: Math.random() > 0.55,
      a: 0.03 + Math.random() * 0.05,
    }));

    const hexSize = 28;
    const hexH = Math.sqrt(3) * hexSize;

    const drawHex = (cx: number, cy: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i;
        const x = cx + hexSize * Math.cos(ang);
        const y = cy + hexSize * Math.sin(ang);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Hex grid
      ctx.strokeStyle = "rgba(184, 146, 42, 0.04)";
      ctx.lineWidth = 1;
      for (let y = 0, row = 0; y < h + hexH; y += hexH * 0.75, row++) {
        const offset = row % 2 === 0 ? 0 : hexSize * 1.5;
        for (let x = 0; x < w + hexSize * 3; x += hexSize * 3) {
          drawHex(x + offset, y);
        }
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const color = p.cyan ? `rgba(0, 212, 255, ${p.a})` : `rgba(184, 146, 42, ${p.a})`;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0.55 }}
    />
  );
}
