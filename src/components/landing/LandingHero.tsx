import { useEffect, useRef, useState } from "react";

const TAGLINE = "TRANSFORMAÇÃO É SISTEMA.";
const LETTER_MS = 50;

/** Canvas de fundo: 18 partículas lentas + linhas de conexão. */
const HeroParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const parts = Array.from({ length: 18 }, () => {
      const a = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(a) * 0.3,
        vy: Math.sin(a) * 0.3,
        r: 0.5 + Math.random() * 1.5,
        o: 0.05 + Math.random() * 0.15,
        cyan: Math.random() < 0.3,
      };
    });

    let raf = 0;
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan ? `rgba(0,212,255,${p.o})` : `rgba(255,255,255,${p.o})`;
        ctx.fill();

        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(0,212,255,0.03)";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    frame();

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { cancelAnimationFrame(raf); frame(); }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />;
};

const LandingHero = () => {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [typed, setTyped] = useState(reduced ? TAGLINE.length : 0);
  const [sheen, setSheen] = useState(false);
  const [glow, setGlow] = useState(reduced);
  const done = typed >= TAGLINE.length;

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setTyped((n) => {
        if (n >= TAGLINE.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, LETTER_MS);
    return () => clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    if (!done || reduced) return;
    setSheen(true);
    const t = setTimeout(() => {
      setSheen(false);
      setGlow(true);
    }, 1000);
    return () => clearTimeout(t);
  }, [done, reduced]);

  // delays contados a partir do fim da digitação
  const typeMs = TAGLINE.length * LETTER_MS;

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <HeroParticles />

      {/* gradiente que respira */}
      <div
        className="absolute inset-0 pointer-events-none hero-breathe"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,212,255,0.03), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative z-[2] flex flex-col items-center">
        <h1
          className={`font-heading text-white ${sheen ? "hero-tagline-sheen" : ""} ${glow && !sheen ? "hero-tagline-glow" : ""}`}
          style={{
            fontWeight: 700,
            fontSize: "clamp(2.5rem, 8vw, 6rem)",
            letterSpacing: "0.15em",
            lineHeight: 1.05,
          }}
        >
          {TAGLINE.slice(0, typed)}
          {!done && <span className="hero-caret text-[#00D4FF]">|</span>}
        </h1>

        <p
          className="hero-fade-up mt-8 text-[1.1rem] leading-[1.7] font-landing max-w-[600px]"
          style={{ color: "#8A8A8A", animationDelay: `${typeMs + 2000}ms` }}
        >
          O sistema inteligente de performance humana que integra nutrição, treino,
          comportamento e mente numa plataforma só.
        </p>

        <a
          href="/auth"
          className="hero-fade-up hero-cta mt-10 inline-block font-mono tracking-[.08em] text-white transition-all duration-300 hover:bg-[rgba(0,212,255,0.1)] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
          style={{
            animationDelay: `${typeMs + 2500}ms`,
            border: "2px solid #00D4FF",
            background: "transparent",
            padding: "16px 48px",
            borderRadius: "8px",
          }}
        >
          Começar agora →
        </a>
      </div>
    </section>
  );
};

export default LandingHero;
