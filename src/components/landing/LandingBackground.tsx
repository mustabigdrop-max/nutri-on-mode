import { useEffect, useRef } from "react";

const LandingBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const COUNT = isMobile ? 28 : 90;
    const LINK_DIST = isMobile ? 100 : 140;
    const FRAME_MS = 1000 / (isMobile ? 24 : 45);
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);

    let W = 0;
    let H = 0;
    let resizeTimer: number | undefined;
    let mouseX = -9999;
    let mouseY = -9999;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const handleLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    window.addEventListener("resize", handleResize, { passive: true });
    // repulsão pelo mouse só faz sentido em ponteiro fino (desktop)
    if (!isCoarse) {
      window.addEventListener("mousemove", handleMouse, { passive: true });
      window.addEventListener("mouseleave", handleLeave);
    }

    class Particle {
      x = Math.random() * W;
      y = Math.random() * H;
      vx = (Math.random() - 0.5) * 0.25;
      vy = (Math.random() - 0.5) * 0.25;
      r = Math.random() * 1.5 + 0.4;
      a = Math.random() * 0.6 + 0.2;

      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
      }

      update(step: number) {
        if (!isCoarse) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 160;
          if (dist < repelRadius && dist > 0) {
            const force = (repelRadius - dist) / repelRadius;
            this.vx += (dx / dist) * force * 0.8;
            this.vy += (dy / dist) * force * 0.8;
          }
        }

        this.vx *= 0.96;
        this.vy *= 0.96;
        this.vx += (Math.random() - 0.5) * 0.02;
        this.vy += (Math.random() - 0.5) * 0.02;

        this.x += this.vx * step;
        this.y += this.vy * step;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
    }

    const particles = Array.from({ length: COUNT }, () => new Particle());

    let animId = 0;
    let running = false;
    let last = 0;

    const animate = (ts: number) => {
      animId = requestAnimationFrame(animate);
      if (ts - last < FRAME_MS) return;
      const step = Math.min((ts - last) / 16.67, 3);
      last = ts;

      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(step);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,160,32,${p.a * 0.7})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const d = Math.sqrt(d2);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(232,160,32,${(1 - d / LINK_DIST) * 0.12})`;
            ctx.stroke();
          }
        }
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      animId = requestAnimationFrame(animate);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(animId);
    };
    start();

    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);


  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-0 opacity-50 pointer-events-none"
      />
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(232,160,32,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,160,32,.03) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />
      <div
        className="fixed pointer-events-none z-[1]"
        style={{
          top: "-15%", right: "-8%", width: "700px", height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,160,32,.07) 0%, transparent 65%)",
          animation: "landingBreathe 12s ease-in-out infinite",
        }}
      />
      <div
        className="fixed pointer-events-none z-[1]"
        style={{
          bottom: "-20%", left: "-10%", width: "600px", height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,240,180,.04) 0%, transparent 65%)",
          animation: "landingBreathe 15s ease-in-out 2s infinite",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, rgba(3,3,10,.65) 100%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.45]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
};

export default LandingBackground;
