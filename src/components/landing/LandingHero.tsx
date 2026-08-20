import { useEffect, useRef, useState } from "react";

const TAGLINE = "TRANSFORMAÇÃO É SISTEMA.";
const LETTER_MS = 50;
const TYPE_MS = TAGLINE.length * LETTER_MS;

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Canvas de fundo: partículas lentas + linhas de conexão (leve no celular). */
const HeroParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    if (prefersReduced()) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const COUNT = isMobile ? 10 : 18;
    const LINK_DIST = isMobile ? 110 : 150;
    const FPS = isMobile ? 24 : 40;
    const FRAME_MS = 1000 / FPS;
    // no celular limitamos o dpr: menos pixels = menos GPU/CPU
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);

    let W = 0;
    let H = 0;
    let resizeTimer: number | undefined;

    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const parts = Array.from({ length: COUNT }, () => {
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
    let running = false;
    let last = 0;

    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame);
      if (ts - last < FRAME_MS) return;
      // avança proporcional ao tempo real para o movimento não depender do FPS
      const step = Math.min((ts - last) / 16.67, 3);
      last = ts;

      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(0,212,255,0.03)";
      ctx.beginPath();
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx * step;
        p.y += p.vy * step;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
          }
        }
      }
      ctx.stroke();

      for (const p of parts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan ? `rgba(0,212,255,${p.o})` : `rgba(255,255,255,${p.o})`;
        ctx.fill();
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // só anima enquanto o hero estiver visível na tela
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      io.disconnect();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />;
};

const LandingHero = () => {
  const reduced = prefersReduced();

  const [typed, setTyped] = useState(reduced ? TAGLINE.length : 0);
  const [sheen, setSheen] = useState(false);
  const [glow, setGlow] = useState(reduced);
  const done = typed >= TAGLINE.length;

  // typewriter em rAF: 1 render por letra, sincronizado com o compositor
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let shown = 0;
    const t0 = performance.now();
    const tick = (ts: number) => {
      const next = Math.min(TAGLINE.length, Math.floor((ts - t0) / LETTER_MS));
      if (next !== shown) {
        shown = next;
        setTyped(next);
      }
      if (shown < TAGLINE.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
  const typeMs = TYPE_MS;


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
          {/* texto completo invisível reserva o espaço: zero layout shift durante a digitação */}
          <span aria-hidden>{TAGLINE.slice(0, typed)}</span>
          {!done && <span className="hero-caret text-[#00D4FF] inline-block w-0 overflow-visible" aria-hidden>|</span>}
          <span aria-hidden className="opacity-0">{TAGLINE.slice(typed)}</span>
          <span className="sr-only">{TAGLINE}</span>
        </h1>


        <p
          className="hero-fade-up mt-8 text-[1.1rem] leading-[1.7] font-landing max-w-[600px]"
          style={{ color: "#8A8A8A", animationDelay: `${typeMs + 400}ms` }}
        >
          O sistema inteligente de performance humana que integra nutrição, treino,
          comportamento e mente numa plataforma só.
        </p>

        <a
          href="/auth"
          className="hero-fade-up hero-cta mt-10 inline-block font-mono tracking-[.08em] text-white transition-all duration-300 hover:bg-[rgba(0,212,255,0.1)] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
          style={{
            animationDelay: `${typeMs + 900}ms`,
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
