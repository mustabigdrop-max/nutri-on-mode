import { useEffect, useRef } from "react";

const LandingBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GOLD = "184,146,42";
    const CYAN = "0,212,255";

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let animId: number;
    let mouseX = -9999;
    let mouseY = -9999;
    let t0 = performance.now();

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const handleMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    const handleLeave = () => { mouseX = -9999; mouseY = -9999; };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);

    class Particle {
      x = Math.random() * W;
      y = Math.random() * H;
      vx = (Math.random() - 0.5) * 0.2;
      vy = (Math.random() - 0.5) * 0.2;
      r = Math.random() * 1.4 + 0.3;
      a = Math.random() * 0.5 + 0.2;
      isCyan = Math.random() < 0.3;

      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
      }

      update() {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 0.6;
          this.vy += Math.sin(angle) * force * 0.6;
        }
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.vx += (Math.random() - 0.5) * 0.015;
        this.vy += (Math.random() - 0.5) * 0.015;
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }

      draw(ctx: CanvasRenderingContext2D) {
        const col = this.isCyan ? CYAN : GOLD;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${this.a * 0.65})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 100 }, () => new Particle());

    const animate = () => {
      const t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, W, H);

      // Hex grid
      const hex = 40;
      const hy = hex * 0.866;
      ctx.lineWidth = 0.7;
      for (let y = 0; y < H + hy; y += hy) {
        for (let x = 0; x < W + hex; x += hex * 1.5) {
          const ox = (Math.floor(y / hy) % 2) * hex * 0.75;
          const px = x + ox, py = y;
          const cx2 = W / 2, cy2 = H / 2;
          const dist = Math.hypot(px - cx2, py - cy2);
          const wave = Math.sin(t * 0.8 - dist / 120);
          const a = 0.03 + Math.max(0, wave) * 0.055;
          ctx.strokeStyle = `rgba(${GOLD},${a.toFixed(3)})`;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const ang = (Math.PI / 3) * i - Math.PI / 6;
            const xx = px + Math.cos(ang) * hex * 0.5;
            const yy = py + Math.sin(ang) * hex * 0.5;
            if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Particles + connections
      for (const p of particles) {
        p.update();
        p.draw(ctx);
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < Math.min(i + 5, particles.length); j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            const col = particles[i].isCyan ? CYAN : GOLD;
            ctx.strokeStyle = `rgba(${col},${((1 - d / 120) * 0.1).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-0 opacity-45 pointer-events-none"
      />
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{ background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 20%, rgba(10,10,26,0.7) 100%)" }}
      />
      {/* Gold radial top-right */}
      <div
        className="fixed pointer-events-none z-[1]"
        style={{
          top: "-10%", right: "-5%", width: "600px", height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,146,42,.06) 0%, transparent 65%)",
        }}
      />
      {/* Cyan radial bottom-left */}
      <div
        className="fixed pointer-events-none z-[1]"
        style={{
          bottom: "-15%", left: "-8%", width: "500px", height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,.04) 0%, transparent 65%)",
        }}
      />
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.3]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.07'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
};

export default LandingBackground;
