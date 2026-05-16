import { useEffect, useRef, useState } from "react";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";
const TEXT = "#F5F0E8";

const STREAM_LABELS = ["TDEE","PCA","ROM","FMS","MCE","IGF-1","GH","RPE","mTOR","GLUT4","KAA","GUT","ATP","VO2","SLU","CJC"];

const HUDS = [
  { pos: "top-[6%] left-[3%]",     align: "left",  title: "TDEE CALCULADO",   value: 3240, suffix: " kcal", bar: GOLD, delay: 4700 },
  { pos: "top-[6%] right-[3%]",    align: "right", title: "KAA™ SCORE",       value: 82,   suffix: "/100",  bar: CYAN, delay: 4800 },
  { pos: "top-[44%] left-[3%]",    align: "left",  title: "PCA ACTIVE",       text: "PERFIL AM",          bar: GOLD, delay: 4900 },
  { pos: "top-[44%] right-[3%]",   align: "right", title: "MICROBIOTA",       text: "GUT-BRAIN ON",       bar: CYAN, delay: 5000 },
  { pos: "bottom-[10%] left-[3%]", align: "left",  title: "DR. VERTEX",       text: "85+ COMPOSTOS",      bar: CYAN, delay: 5100 },
  { pos: "bottom-[10%] right-[3%]",align: "right", title: "STRATUM",          text: "7 CAMADAS",          bar: GOLD, delay: 5200 },
];

const NODES = [
  { id: "n1", x: 18, y: 18, label: "PCA",        sub: "Comportamento",   color: GOLD },
  { id: "n2", x: 50, y: 10, label: "NutriPlan",  sub: "Nutrição",        color: CYAN },
  { id: "n3", x: 82, y: 18, label: "TrainingON", sub: "Treino",          color: GOLD },
  { id: "n4", x: 82, y: 82, label: "VERTEX",     sub: "Farmacologia",    color: CYAN },
  { id: "n5", x: 50, y: 90, label: "KAA™",       sub: "Kinetic Arch.",   color: GOLD },
  { id: "n6", x: 18, y: 82, label: "Microbiota", sub: "Gut-Brain",       color: CYAN },
];

const TICKER = ["PCA","NutriPlan","TrainingON","VERTEX","KAA™","Microbiota"];

const useCount = (target: number, start: boolean, duration = 1600) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return v;
};

const LandingHero = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState(0);
  // phases: 0 init, 1 l1, 2 l2, 3 l3, 4 l4, 5 flash/jarvis, 6 huds, 7 nodes, 8 tagline, 9 status

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1150),
      setTimeout(() => setPhase(3), 1900),
      setTimeout(() => setPhase(4), 2800),
      setTimeout(() => setPhase(5), 4100),
      setTimeout(() => setPhase(6), 4700),
      setTimeout(() => setPhase(7), 5300),
      setTimeout(() => setPhase(8), 6200),
      setTimeout(() => setPhase(9), 6700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Canvas: hex grid + particles + data streams + scan line
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x:number; y:number; vx:number; vy:number; c:string; r:number };
    const particles: P[] = [];
    const PCOUNT = 160;
    for (let i = 0; i < PCOUNT; i++) {
      particles.push({
        x: Math.random() * 1600, y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        c: Math.random() < 0.75 ? GOLD : CYAN,
        r: Math.random() * 1.2 + 0.4,
      });
    }

    type S = { x:number; y:number; speed:number; label:string; trail:string[] };
    const streams: S[] = [];
    for (let i = 0; i < 28; i++) {
      streams.push({
        x: Math.random() * 1600,
        y: Math.random() * 900,
        speed: 0.6 + Math.random() * 1.4,
        label: STREAM_LABELS[i % STREAM_LABELS.length],
        trail: [],
      });
    }

    const hex = 30;
    let t0 = performance.now();
    let raf = 0;

    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      // Hex grid pulse
      const cx = w / 2, cy = h / 2;
      ctx.lineWidth = 1;
      const hx = hex, hy = hex * 0.866;
      for (let y = 0; y < h + hy; y += hy) {
        for (let x = 0; x < w + hx; x += hx * 1.5) {
          const ox = (Math.floor(y / hy) % 2) * hx * 0.75;
          const px = x + ox, py = y;
          const dist = Math.hypot(px - cx, py - cy);
          const wave = Math.sin(t * 1.5 - dist / 80);
          const a = 0.04 + Math.max(0, wave) * 0.08;
          ctx.strokeStyle = `rgba(184,146,42,${a.toFixed(3)})`;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const ang = (Math.PI / 3) * i;
            const xx = px + Math.cos(ang) * hx * 0.5;
            const yy = py + Math.sin(ang) * hx * 0.5;
            if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Particles + connections
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
      }
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < Math.min(i + 6, particles.length); j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 90) {
            ctx.strokeStyle = `rgba(184,146,42,${(0.12 * (1 - d / 90)).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = a.c;
        ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Data streams
      ctx.font = "9px 'Space Mono', monospace";
      for (const s of streams) {
        s.y += s.speed;
        if (s.y > h + 20) { s.y = -20; s.x = Math.random() * w; s.trail = []; }
        s.trail.unshift(`${s.label} ${(Math.random() * 100).toFixed(0)}`);
        if (s.trail.length > 8) s.trail.pop();
        for (let i = 0; i < s.trail.length; i++) {
          const alpha = (1 - i / s.trail.length) * 0.35;
          ctx.fillStyle = `rgba(184,146,42,${alpha.toFixed(3)})`;
          ctx.fillText(s.trail[i], s.x, s.y - i * 12);
        }
      }

      // Scan line
      const sy = ((t * 60) % (h + 100)) - 50;
      const grad = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
      grad.addColorStop(0, "rgba(0,212,255,0)");
      grad.addColorStop(0.5, "rgba(0,212,255,0.12)");
      grad.addColorStop(1, "rgba(0,212,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, sy - 40, w, 80);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const tdee = useCount(3240, phase >= 6);
  const kaa = useCount(82, phase >= 6);

  return (
    <section
      className="relative w-full h-screen min-h-[720px] overflow-hidden bg-black"
      style={{ fontFamily: "'Space Mono', monospace", color: TEXT }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)" }}
      />

      {/* Gold flash */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity"
        style={{
          background: GOLD,
          opacity: phase === 5 ? 0.85 : 0,
          transition: "opacity 90ms linear",
          mixBlendMode: "screen",
        }}
      />

      {/* L corners */}
      {[
        "top-5 left-5 border-t-2 border-l-2",
        "top-5 right-5 border-t-2 border-r-2",
        "bottom-5 left-5 border-b-2 border-l-2",
        "bottom-5 right-5 border-b-2 border-r-2",
      ].map((c, i) => (
        <div
          key={i}
          className={`absolute ${c} pointer-events-none`}
          style={{ width: 28, height: 28, borderColor: GOLD, animation: "lhPulse 2.4s ease-in-out infinite" }}
        />
      ))}

      {/* Live badge */}
      <div
        className="absolute top-5 right-1/2 translate-x-1/2 sm:right-20 sm:translate-x-0 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full border"
        style={{ borderColor: "#00D4FF18", background: "rgba(0,0,0,0.4)" }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#ff3344", boxShadow: "0 0 8px #ff3344", animation: "lhBlink 1.2s ease-in-out infinite" }}
        />
        <span style={{ color: "#00D4FF33", fontSize: 9, letterSpacing: "0.3em" }}>SISTEMA AO VIVO</span>
      </div>

      {/* PHASE 1-4: Opening lines */}
      {phase < 5 && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-4 text-center">
          {[
            { txt: "Você treinou.",        show: phase >= 1, gold: false },
            { txt: "Você se alimentou.",   show: phase >= 2, gold: false },
            { txt: "Você descansou.",      show: phase >= 3, gold: false },
            { txt: "E mesmo assim parou.", show: phase >= 4, gold: true  },
          ].map((l, i) => (
            <div
              key={i}
              style={{
                opacity: l.show ? 1 : 0,
                filter: l.show ? "blur(0)" : "blur(12px)",
                transform: l.show ? "translateY(0)" : "translateY(6px)",
                transition: "opacity .6s ease, filter .6s ease, transform .6s ease",
                color: l.gold ? GOLD : TEXT,
                fontSize: l.gold ? 16 : 14,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
              }}
            >
              {l.txt}
              {l.gold && l.show && (
                <span style={{ display: "inline-block", width: 8, height: 16, marginLeft: 6, background: GOLD, verticalAlign: "middle", animation: "lhBlink 0.9s steps(2) infinite" }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* PHASE 5+: Jarvis system */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        style={{
          opacity: phase >= 5 ? 1 : 0,
          transition: "opacity .8s ease",
        }}
      >
        {/* Orbital rings */}
        <div className="relative" style={{ width: "min(86vmin, 720px)", height: "min(86vmin, 720px)" }}>
          {[
            { size: 100, speed: 38, dir: 1,  c: GOLD, d: "4 6" },
            { size: 82,  speed: 28, dir: -1, c: CYAN, d: "2 5" },
            { size: 64,  speed: 22, dir: 1,  c: GOLD, d: "6 4" },
            { size: 48,  speed: 18, dir: -1, c: CYAN, d: "1 4" },
            { size: 32,  speed: 14, dir: 1,  c: GOLD, d: "3 3" },
          ].map((r, i) => (
            <svg
              key={i}
              className="absolute inset-0 m-auto"
              style={{
                width: `${r.size}%`, height: `${r.size}%`, top: 0, bottom: 0, left: 0, right: 0,
                animation: `lhSpin ${r.speed}s linear infinite ${r.dir < 0 ? "reverse" : ""}`,
              }}
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="48" fill="none" stroke={r.c} strokeOpacity="0.45" strokeWidth="0.4" strokeDasharray={r.d} />
            </svg>
          ))}

          {/* 3D sphere ellipses */}
          {[
            { rx: 48, ry: 14, rot: 0 },
            { rx: 48, ry: 14, rot: 60 },
            { rx: 48, ry: 14, rot: 120 },
          ].map((e, i) => (
            <svg key={i} className="absolute inset-0" viewBox="0 0 100 100">
              <ellipse cx="50" cy="50" rx={e.rx} ry={e.ry} fill="none" stroke={GOLD} strokeOpacity="0.25" strokeWidth="0.3" transform={`rotate(${e.rot} 50 50)`} />
            </svg>
          ))}

          {/* Radar sweep */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: "50%",
              background: `conic-gradient(from 0deg, rgba(0,212,255,0) 0deg, rgba(0,212,255,0) 320deg, rgba(0,212,255,0.35) 358deg, rgba(0,212,255,0) 360deg)`,
              animation: "lhSpin 4s linear infinite",
              maskImage: "radial-gradient(circle, black 48%, transparent 50%)",
              WebkitMaskImage: "radial-gradient(circle, black 48%, transparent 50%)",
            }}
          />

          {/* 24 radial lines */}
          <svg className="absolute inset-0" viewBox="0 0 100 100">
            {Array.from({ length: 24 }).map((_, i) => {
              const ang = (Math.PI * 2 * i) / 24;
              const x = 50 + Math.cos(ang) * 48;
              const y = 50 + Math.sin(ang) * 48;
              const x0 = 50 + Math.cos(ang) * 16;
              const y0 = 50 + Math.sin(ang) * 16;
              return (
                <line
                  key={i}
                  x1={x0} y1={y0} x2={x} y2={y}
                  stroke={i % 2 === 0 ? GOLD : CYAN}
                  strokeOpacity="0.28"
                  strokeWidth="0.2"
                  style={{ animation: `lhRadialPulse 3s ease-in-out infinite ${(i * 0.08).toFixed(2)}s` }}
                />
              );
            })}
          </svg>

          {/* Connections center → nodes */}
          <svg className="absolute inset-0" viewBox="0 0 100 100">
            {NODES.map((n, i) => (
              <g key={n.id}>
                <line
                  x1="50" y1="50" x2={n.x} y2={n.y}
                  stroke={CYAN} strokeOpacity="0.35"
                  strokeWidth="0.25" strokeDasharray="1.2 1.2"
                  style={{ opacity: phase >= 7 ? 1 : 0, transition: `opacity .6s ease ${i * 0.08}s` }}
                />
                <circle r="0.9" fill={CYAN} style={{ opacity: phase >= 7 ? 1 : 0 }}>
                  <animateMotion dur={`${2.4 + i * 0.2}s`} repeatCount="indefinite" path={`M 50 50 L ${n.x} ${n.y}`} />
                </circle>
              </g>
            ))}
          </svg>

          {/* Orbital nodes */}
          {NODES.map((n, i) => (
            <div
              key={n.id}
              className="absolute"
              style={{
                left: `${n.x}%`, top: `${n.y}%`,
                transform: "translate(-50%, -50%)",
                opacity: phase >= 7 ? 1 : 0,
                transition: `opacity .6s ease ${i * 0.1}s, transform .6s ease ${i * 0.1}s`,
              }}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 54, height: 54,
                    border: `1px solid ${n.color}66`,
                    background: "rgba(0,0,0,0.7)",
                    boxShadow: `0 0 18px ${n.color}55`,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `1px dashed ${n.color}55`, animation: "lhSpin 12s linear infinite" }}
                  />
                  <span style={{ color: n.color, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em" }}>
                    {n.label.replace("™", "")}
                  </span>
                </div>
                <span className="mt-2" style={{ fontSize: 8, letterSpacing: "0.25em", color: `${n.color}cc`, textTransform: "uppercase" }}>
                  {n.sub}
                </span>
              </div>
            </div>
          ))}

          {/* Center logo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <div className="relative text-center">
              {/* Nuclear point */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: -28 }}
              >
                <div className="relative" style={{ width: 12, height: 12 }}>
                  <div className="absolute inset-0 rounded-full" style={{ background: "#fff", boxShadow: "0 0 6px #fff, 0 0 18px #fff, 0 0 40px #ffffffcc" }} />
                </div>
              </div>

              <h1
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(48px, 11vw, 112px)",
                  lineHeight: 1,
                  letterSpacing: "0.02em",
                  color: TEXT,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  margin: "0 auto",
                  transform: phase >= 5 ? "scale(1)" : "scale(1.25)",
                  filter: phase >= 5 ? "blur(0)" : "blur(18px)",
                  opacity: phase >= 5 ? 1 : 0,
                  transition: "transform 1.1s cubic-bezier(.2,.7,.2,1), filter 1.1s ease, opacity 1.1s ease",
                  textShadow: `0 0 24px ${GOLD}55`,
                }}
              >
                NUTRI<span style={{ color: GOLD }}>ON</span>
              </h1>
              <div
                className="text-center mt-2"
                style={{
                  fontSize: 8, letterSpacing: "0.45em",
                  color: `${TEXT}99`, textTransform: "uppercase",
                  opacity: phase >= 5 ? 1 : 0, transition: "opacity .8s ease .3s",
                }}
              >
                Sistema Integrado de Performance Humana
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HUDs */}
      {HUDS.map((h, i) => {
        const visible = phase >= 6;
        return (
          <div
            key={i}
            className={`absolute ${h.pos} z-20 pointer-events-none`}
            style={{
              minWidth: 150,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : `translateY(${h.align === "left" ? "-6px" : "6px"})`,
              transition: `opacity .6s ease ${i * 0.08}s, transform .6s ease ${i * 0.08}s`,
              textAlign: h.align as "left" | "right",
            }}
          >
            <div style={{ fontSize: 7, letterSpacing: "0.35em", color: `${h.bar}cc` }}>{h.title}</div>
            <div style={{ fontSize: 13, color: TEXT, marginTop: 4, fontWeight: 700 }}>
              {"value" in h && h.value !== undefined
                ? `${(i === 0 ? tdee : i === 1 ? kaa : h.value).toLocaleString("pt-BR")}${h.suffix ?? ""}`
                : h.text}
            </div>
            <div className="mt-2 h-px w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                style={{
                  height: 1, background: h.bar,
                  width: visible ? "100%" : "0%",
                  transition: `width 1.4s ease ${0.2 + i * 0.08}s`,
                  boxShadow: `0 0 6px ${h.bar}`,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Tagline */}
      <div
        className="absolute left-0 right-0 z-20 text-center px-4"
        style={{
          bottom: 68,
          fontSize: 10,
          letterSpacing: "0.35em",
          color: "#B8922A55",
          textTransform: "uppercase",
          opacity: phase >= 8 ? 1 : 0,
          transition: "opacity .8s ease",
        }}
      >
        O mercado tem apps. Você encontrou o sistema.
      </div>

      {/* Status bar */}
      <div
        className="absolute left-0 right-0 z-20 flex items-center justify-center gap-2"
        style={{
          bottom: 38,
          opacity: phase >= 9 ? 1 : 0,
          transition: "opacity .8s ease",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: CYAN, boxShadow: `0 0 10px ${CYAN}`, animation: "lhBlink 1.1s ease-in-out infinite" }}
        />
        <span style={{ fontSize: 9, letterSpacing: "0.32em", color: `${CYAN}aa` }}>
          DIAGNÓSTICO INICIADO — AGUARDANDO SEU PERFIL
        </span>
      </div>

      {/* Ticker */}
      <div
        className="absolute left-0 right-0 bottom-0 z-20 overflow-hidden border-t"
        style={{
          borderColor: "#B8922A22",
          background: "rgba(0,0,0,0.55)",
          height: 28,
          opacity: phase >= 9 ? 1 : 0,
          transition: "opacity .8s ease",
        }}
      >
        <div className="flex whitespace-nowrap" style={{ animation: "lhTicker 28s linear infinite" }}>
          {Array.from({ length: 8 }).flatMap((_, k) =>
            TICKER.map((t, i) => (
              <span
                key={`${k}-${i}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 12, padding: "0 22px",
                  fontSize: 10, letterSpacing: "0.32em",
                  color: i % 2 === 0 ? GOLD : CYAN,
                  lineHeight: "28px",
                }}
              >
                <span style={{ width: 4, height: 4, borderRadius: 999, background: "currentColor" }} />
                {t.toUpperCase()}
              </span>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes lhPulse { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
        @keyframes lhBlink { 0%,100% { opacity: 1 } 50% { opacity: 0.2 } }
        @keyframes lhSpin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        @keyframes lhRadialPulse { 0%,100% { stroke-opacity: 0.1 } 50% { stroke-opacity: 0.55 } }
        @keyframes lhTicker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>
    </section>
  );
};

export default LandingHero;
