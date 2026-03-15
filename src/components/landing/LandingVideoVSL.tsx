import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Scenes ────────────────────────────────────────────────────────────────
// Three cinematic moments. Each ~5s. Auto-cycles.
// Direction: Pain → Agitation → Solution. Classic DIC copywriting in motion.

const SCENE_DURATION = 5200; // ms per scene

interface Scene {
  id: number;
  label: string;
  // background accent
  accent: string;
  glow: string;
  // stat / hook
  stat?: string;
  statSub?: string;
  // heading
  heading: string[];
  // body copy
  body: string;
  // visual elements
  particles: { x: number; y: number; size: number; delay: number; opacity: number }[];
}

const SCENES: Scene[] = [
  {
    id: 0,
    label: "A REALIDADE",
    accent: "#cc2222",
    glow: "rgba(204,34,34,.12)",
    stat: "73%",
    statSub: "das pessoas abandonam a dieta em menos de 3 semanas",
    heading: ["VOCÊ TREINA.", "VOCÊ SACRIFICA.", "O SHAPE NÃO VEM."],
    body: "Não é falta de força de vontade. É falta de sistema.",
    particles: [
      { x: 8,  y: 20, size: 1,   delay: 0,    opacity: .18 },
      { x: 92, y: 15, size: 1.5, delay: .4,   opacity: .14 },
      { x: 15, y: 75, size: 1,   delay: .8,   opacity: .10 },
      { x: 85, y: 80, size: 1.5, delay: .2,   opacity: .12 },
      { x: 50, y: 10, size: 2,   delay: .6,   opacity: .08 },
    ],
  },
  {
    id: 1,
    label: "O PROBLEMA",
    accent: "#e8a020",
    glow: "rgba(232,160,32,.1)",
    stat: "1 em 5",
    statSub: "pessoas atinge o objetivo com apps de dieta tradicionais",
    heading: ["APPS GENÉRICOS.", "PLANOS COPIADOS.", "ZERO RESULTADO."],
    body: "Seu corpo é único. Seu protocolo também precisa ser.",
    particles: [
      { x: 10, y: 30, size: 2,   delay: .1,   opacity: .15 },
      { x: 90, y: 25, size: 1.5, delay: .5,   opacity: .12 },
      { x: 20, y: 70, size: 1,   delay: .9,   opacity: .08 },
      { x: 80, y: 65, size: 2,   delay: .3,   opacity: .14 },
      { x: 55, y: 90, size: 1.5, delay: .7,   opacity: .10 },
    ],
  },
  {
    id: 2,
    label: "A SOLUÇÃO",
    accent: "#00f0b4",
    glow: "rgba(0,240,180,.08)",
    stat: "90",
    statSub: "dias para mudar seu shape com protocolo de IA adaptativo",
    heading: ["PROTOCOLO.", "PERSONALIZADO.", "RESULTADO REAL."],
    body: "NutriON gera seu plano, aprende com seus dados e escala com você.",
    particles: [
      { x: 7,  y: 25, size: 2,   delay: 0,    opacity: .20 },
      { x: 93, y: 20, size: 1.5, delay: .35,  opacity: .16 },
      { x: 12, y: 78, size: 1,   delay: .7,   opacity: .10 },
      { x: 88, y: 72, size: 2,   delay: .5,   opacity: .14 },
      { x: 50, y: 8,  size: 1.5, delay: .9,   opacity: .12 },
    ],
  },
];

// ─── Floating data points that orbit the scene ──────────────────────────────
const FLOATS = [
  { label: "-12kg",       sub: "em 90 dias",          x: "6%",  y: "22%", delay: 0.5  },
  { label: "+8% massa",   sub: "magra ganha",          x: "76%", y: "18%", delay: 0.8  },
  { label: "1.847 kcal",  sub: "protocolo de hoje",    x: "4%",  y: "62%", delay: 1.1  },
  { label: "14 dias",     sub: "streak ativo",         x: "78%", y: "72%", delay: 0.6  },
];

// ─── Progress bar ─────────────────────────────────────────────────────────
function SceneProgress({ scene, duration }: { scene: number; duration: number }) {
  return (
    <div className="flex gap-1.5">
      {SCENES.map((s, i) => (
        <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden bg-white/[.08]">
          {i < scene && (
            <div className="w-full h-full bg-white/30" />
          )}
          {i === scene && (
            <motion.div
              className="h-full rounded-full"
              style={{ background: SCENES[scene].accent }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Animated body silhouette SVG ──────────────────────────────────────────
// Simplified athletic figure outline — drawn with stroke animation
function BodySilhouette({ accent, visible }: { accent: string; visible: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <svg
        viewBox="0 0 120 260"
        width="220"
        height="auto"
        fill="none"
        style={{ opacity: 0.055, transform: "translateY(4%)" }}
      >
        {/* Head */}
        <circle cx="60" cy="22" r="14" stroke={accent} strokeWidth="1.5" />
        {/* Neck */}
        <line x1="60" y1="36" x2="60" y2="48" stroke={accent} strokeWidth="1.5" />
        {/* Shoulders */}
        <path d="M28 54 Q60 44 92 54" stroke={accent} strokeWidth="2" fill="none" />
        {/* Torso */}
        <path d="M35 54 L30 120 L45 120 L60 110 L75 120 L90 120 L85 54" stroke={accent} strokeWidth="1.5" fill="none" />
        {/* Arms */}
        <path d="M35 54 L14 92 L18 96 L40 72" stroke={accent} strokeWidth="1.5" fill="none" />
        <path d="M85 54 L106 92 L102 96 L80 72" stroke={accent} strokeWidth="1.5" fill="none" />
        {/* Forearms */}
        <path d="M14 92 L10 130 L18 132" stroke={accent} strokeWidth="1.2" fill="none" />
        <path d="M106 92 L110 130 L102 132" stroke={accent} strokeWidth="1.2" fill="none" />
        {/* Abs lines */}
        <line x1="47" y1="72" x2="73" y2="72" stroke={accent} strokeWidth=".8" strokeDasharray="3 3" />
        <line x1="45" y1="85" x2="75" y2="85" stroke={accent} strokeWidth=".8" strokeDasharray="3 3" />
        <line x1="44" y1="98" x2="76" y2="98" stroke={accent} strokeWidth=".8" strokeDasharray="3 3" />
        <line x1="60" y1="54" x2="60" y2="120" stroke={accent} strokeWidth=".7" strokeDasharray="4 4" opacity=".5" />
        {/* Hips */}
        <path d="M30 120 Q60 115 90 120" stroke={accent} strokeWidth="1.5" fill="none" />
        {/* Legs */}
        <path d="M44 120 L38 180 L34 240" stroke={accent} strokeWidth="1.5" fill="none" />
        <path d="M76 120 L82 180 L86 240" stroke={accent} strokeWidth="1.5" fill="none" />
        {/* Inner legs */}
        <path d="M44 120 L56 180" stroke={accent} strokeWidth="1" fill="none" />
        <path d="M76 120 L64 180" stroke={accent} strokeWidth="1" fill="none" />
        {/* Feet */}
        <path d="M34 240 Q30 248 42 248" stroke={accent} strokeWidth="1.2" fill="none" />
        <path d="M86 240 Q90 248 78 248" stroke={accent} strokeWidth="1.2" fill="none" />
        {/* Muscle indicators */}
        <ellipse cx="24" cy="80" rx="6" ry="12" stroke={accent} strokeWidth=".7" opacity=".4" transform="rotate(-10,24,80)" />
        <ellipse cx="96" cy="80" rx="6" ry="12" stroke={accent} strokeWidth=".7" opacity=".4" transform="rotate(10,96,80)" />
        <ellipse cx="40" cy="148" rx="7" ry="15" stroke={accent} strokeWidth=".7" opacity=".4" transform="rotate(-5,40,148)" />
        <ellipse cx="80" cy="148" rx="7" ry="15" stroke={accent} strokeWidth=".7" opacity=".4" transform="rotate(5,80,148)" />
      </svg>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LandingVideoVSL() {
  const [scene, setScene]   = useState(0);
  const [tick,  setTick]    = useState(0); // triggers AnimatePresence re-key
  const [ready, setReady]   = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = SCENES[scene];

  // Auto-advance scenes
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    intervalRef.current = setInterval(() => {
      setScene(s => (s + 1) % SCENES.length);
      setTick(t => t + 1);
    }, SCENE_DURATION);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [ready]);

  function jumpTo(i: number) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setScene(i);
    setTick(t => t + 1);
    intervalRef.current = setInterval(() => {
      setScene(s => (s + 1) % SCENES.length);
      setTick(t2 => t2 + 1);
    }, SCENE_DURATION);
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "100svh",
        background: "#03030a",
      }}
    >
      {/* ── Film-grain texture overlay ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
          opacity: 0.6,
        }}
      />

      {/* ── Animated background glow that shifts per scene ─────────────── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`glow-${scene}`}
          className="absolute inset-0 pointer-events-none z-[0]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          style={{
            background: `radial-gradient(ellipse 70% 55% at 50% 35%, ${current.glow}, transparent 68%)`,
          }}
        />
      </AnimatePresence>

      {/* ── Scanline effect ─────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.04) 2px, rgba(0,0,0,.04) 4px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* ── Body silhouette ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`body-${scene}`}
          className="absolute inset-0 z-[1] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0 }}
        >
          <BodySilhouette accent={current.accent} visible />
        </motion.div>
      </AnimatePresence>

      {/* ── Floating data badges ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={`floats-${scene}`} className="absolute inset-0 z-[3] pointer-events-none">
          {FLOATS.map((f, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: f.x, top: f.y }}
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: f.delay }}
            >
              <div
                className="px-2.5 py-1.5 rounded-lg backdrop-blur-sm"
                style={{
                  background: `rgba(6,6,20,.75)`,
                  border: `1px solid ${current.accent}22`,
                  boxShadow: `0 0 12px ${current.accent}10`,
                }}
              >
                <div className="font-heading text-[.8rem] leading-none" style={{ color: current.accent }}>
                  {f.label}
                </div>
                <div className="font-mono text-[.44rem] text-[#50507a] mt-0.5 leading-none">{f.sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Static particles ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {current.particles.map((p, i) => (
          <motion.div
            key={`p-${scene}-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size * 3, height: p.size * 3,
              background: current.accent,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: p.opacity, scale: 1 }}
            transition={{ delay: p.delay, duration: 0.6 }}
          />
        ))}
      </div>

      {/* ── Horizontal rule top accent ───────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[1px] z-[5]"
        style={{ background: `linear-gradient(90deg, transparent, ${current.accent}30, transparent)` }} />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="relative z-[10] flex flex-col items-center justify-center min-h-[100svh] px-6 md:px-12 text-center">

        {/* Scene label badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`badge-${scene}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: `${current.accent}10`,
              border: `1px solid ${current.accent}25`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: current.accent, boxShadow: `0 0 6px ${current.accent}` }}
            />
            <span className="font-mono text-[.55rem] tracking-[.22em]" style={{ color: `${current.accent}90` }}>
              {current.label}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Big stat */}
        {current.stat && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`stat-${scene}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-5"
            >
              <div
                className="font-heading leading-none"
                style={{
                  fontSize: "clamp(4.5rem, 16vw, 11rem)",
                  color: current.accent,
                  textShadow: `0 0 60px ${current.accent}40, 0 0 120px ${current.accent}15`,
                  letterSpacing: "-0.02em",
                }}
              >
                {current.stat}
              </div>
              <div className="font-mono text-[.7rem] text-[#50507a] mt-2 max-w-[280px] mx-auto leading-[1.5] tracking-[.04em]">
                {current.statSub}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Main heading — each word reveals individually */}
        <div className="mb-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={`heading-${scene}`} className="space-y-[-0.05em]">
              {current.heading.map((line, li) => (
                <motion.div
                  key={li}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.55, delay: li * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p
                    className="font-heading leading-[.88]"
                    style={{
                      fontSize: "clamp(1.8rem, 5.5vw, 4.2rem)",
                      color: li === current.heading.length - 1 ? current.accent : "rgba(240,237,248,.85)",
                      textShadow: li === current.heading.length - 1
                        ? `0 0 40px ${current.accent}30`
                        : "none",
                    }}
                  >
                    {line}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Body copy */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`body-${scene}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="font-landing text-[#7070a0] text-[.92rem] max-w-[340px] mb-12 leading-[1.7]"
          >
            {current.body}
          </motion.p>
        </AnimatePresence>

        {/* CTA — only on last scene */}
        <AnimatePresence>
          {scene === SCENES.length - 1 && (
            <motion.a
              key="cta"
              href="#plans"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-mono text-[.75rem] tracking-[.1em] uppercase font-semibold mb-12 transition-all hover:scale-[1.04] hover:shadow-[0_0_50px_rgba(0,240,180,.2)]"
              style={{
                background: "linear-gradient(135deg, #00c896, #00f0b4)",
                color: "#000",
                boxShadow: "0 0 30px rgba(0,240,180,.2)",
              }}
            >
              <span>▶</span>
              Começar meu protocolo agora
            </motion.a>
          )}
        </AnimatePresence>

        {/* Scene navigation dots + progress */}
        <div className="flex flex-col items-center gap-4">
          {/* Dots */}
          <div className="flex gap-2.5">
            {SCENES.map((s, i) => (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                className="transition-all hover:scale-110"
                style={{
                  width: scene === i ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: scene === i ? current.accent : "rgba(255,255,255,.12)",
                  boxShadow: scene === i ? `0 0 8px ${current.accent}60` : "none",
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-[180px]">
            {ready && <SceneProgress scene={scene} duration={SCENE_DURATION} key={tick} />}
          </div>
        </div>
      </div>

      {/* ── Bottom scroll hint ────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[10] flex flex-col items-center gap-2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="font-mono text-[.5rem] tracking-[.2em] text-[#30305a] uppercase">Descer</div>
        <div className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${current.accent}30, transparent)` }} />
      </motion.div>
    </section>
  );
}
