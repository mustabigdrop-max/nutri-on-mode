import { useEffect, useRef } from "react";

const LandingBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let animId: number;
    let mouseX = -9999;
    let mouseY = -9999;

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const handleLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);

    class Particle {
      x = Math.random() * W;
      y = Math.random() * H;
      vx = (Math.random() - 0.5) * 0.25;
      vy = (Math.random() - 0.5) * 0.25;
      r = Math.random() * 1.5 + 0.4;
      a = Math.random() * 0.6 + 0.2;
      baseX = this.x;
      baseY = this.y;

      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
      }

      update() {
        // Mouse repulsion
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 160;
        if (dist < repelRadius && dist > 0) {
          const force = (repelRadius - dist) / repelRadius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 0.8;
          this.vy += Math.sin(angle) * force * 0.8;
        }

        // Damping
        this.vx *= 0.96;
        this.vy *= 0.96;

        // Drift
        this.vx += (Math.random() - 0.5) * 0.02;
        this.vy += (Math.random() - 0.5) * 0.02;

        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,160,32,${this.a * 0.7})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 90 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(232,160,32,${(1 - d / 140) * 0.12})`;
            ctx.lineWidth = 0.6;
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
        }}
      />
      <div
        className="fixed pointer-events-none z-[1]"
        style={{
          bottom: "-20%", left: "-10%", width: "600px", height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,240,180,.04) 0%, transparent 65%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, rgba(3,3,10,.65) 100%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-35"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
};

export default LandingBackground;
