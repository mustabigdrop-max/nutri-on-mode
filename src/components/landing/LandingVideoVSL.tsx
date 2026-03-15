import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";

const SCENES = [
  {
    lines: ["VOCÊ TREINA.", "VOCÊ SACRIFICA.", "O SHAPE NÃO VEM."],
    stat: "73% abandonam a dieta em 3 semanas",
    accent: "#ff4466",
    accentGlow: "rgba(255,68,102,.25)",
  },
  {
    lines: ["APPS GENÉRICOS.", "PLANOS COPIADOS.", "ZERO RESULTADO."],
    stat: "Apenas 1 em 5 atinge o objetivo",
    accent: "#e8a020",
    accentGlow: "rgba(232,160,32,.25)",
  },
  {
    lines: ["PROTOCOLO.", "PERSONALIZADO.", "RESULTADO REAL."],
    stat: null,
    accent: "#00f0b4",
    accentGlow: "rgba(0,240,180,.25)",
    cta: true,
  },
];

const BADGES = [
  { label: "-12kg em 90 dias", x: "8%", y: "22%" },
  { label: "+8% massa magra", x: "78%", y: "18%" },
  { label: "1.847 kcal", x: "6%", y: "72%" },
  { label: "14 dias streak", x: "80%", y: "68%" },
];

const CYCLE_MS = 5200;

function BodySilhouette({ accent }: { accent: string }) {
  return (
    <svg
      viewBox="0 0 200 420"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] md:w-[220px] h-auto opacity-20"
      fill="none"
      stroke={accent}
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      {/* Head */}
      <ellipse cx="100" cy="38" rx="22" ry="28" />
      {/* Neck */}
      <line x1="92" y1="66" x2="92" y2="82" />
      <line x1="108" y1="66" x2="108" y2="82" />
      {/* Shoulders */}
      <path d="M92 82 Q60 86 48 110" />
      <path d="M108 82 Q140 86 152 110" />
      {/* Torso */}
      <line x1="60" y1="110" x2="56" y2="200" />
      <line x1="140" y1="110" x2="144" y2="200" />
      {/* Abs lines */}
      <line x1="85" y1="120" x2="85" y2="190" opacity="0.5" />
      <line x1="115" y1="120" x2="115" y2="190" opacity="0.5" />
      <line x1="78" y1="140" x2="122" y2="140" opacity="0.3" />
      <line x1="78" y1="160" x2="122" y2="160" opacity="0.3" />
      <line x1="80" y1="180" x2="120" y2="180" opacity="0.3" />
      {/* Arms */}
      <path d="M48 110 Q32 150 38 200" />
      <path d="M152 110 Q168 150 162 200" />
      {/* Hands */}
      <ellipse cx="38" cy="204" rx="6" ry="8" opacity="0.6" />
      <ellipse cx="162" cy="204" rx="6" ry="8" opacity="0.6" />
      {/* Hips */}
      <path d="M56 200 Q70 220 72 240" />
      <path d="M144 200 Q130 220 128 240" />
      {/* Legs */}
      <line x1="72" y1="240" x2="68" y2="340" />
      <line x1="128" y1="240" x2="132" y2="340" />
      {/* Calves */}
      <line x1="68" y1="340" x2="64" y2="400" />
      <line x1="132" y1="340" x2="136" y2="400" />
      {/* Feet */}
      <path d="M64 400 Q58 412 50 414" opacity="0.6" />
      <path d="M136 400 Q142 412 150 414" opacity="0.6" />
      {/* Muscle outlines */}
      <path d="M48 120 Q42 140 44 160" opacity="0.4" />
      <path d="M152 120 Q158 140 156 160" opacity="0.4" />
      <path d="M68 260 Q62 290 66 320" opacity="0.3" />
      <path d="M132 260 Q138 290 134 320" opacity="0.3" />
    </svg>
  );
}

export default function LandingVideoVSL() {
  const [scene, setScene] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setScene((s) => (s + 1) % SCENES.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [inView]);

  const current = SCENES[scene];

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-[#03030a]"
      style={{ height: "100svh", minHeight: 560 }}
    >
      {/* Film-grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] opacity-[.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* CRT scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-[6] opacity-[.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.08) 2px, rgba(255,255,255,.08) 4px)",
        }}
      />

      {/* Body silhouette */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`body-${scene}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-[1]"
        >
          <BodySilhouette accent={current.accent} />
        </motion.div>
      </AnimatePresence>

      {/* Floating data badges */}
      {BADGES.map((b, i) => (
        <motion.div
          key={b.label}
          className="absolute z-[3] hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm"
          style={{
            left: b.x,
            top: b.y,
            background: "rgba(255,255,255,.03)",
            borderColor: `${current.accent}30`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 0.7, scale: 1 } : {}}
          transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: current.accent }}
          />
          <span className="font-mono text-[.6rem] text-[#f0edf8]/70 tracking-wide whitespace-nowrap">
            {b.label}
          </span>
        </motion.div>
      ))}

      {/* Center content */}
      <div className="relative z-[4] flex flex-col items-center justify-center h-full px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Heading lines stagger */}
            {current.lines.map((line, i) => (
              <motion.h2
                key={i}
                className="font-heading leading-[.92]"
                style={{
                  fontSize: "clamp(2.4rem, 7vw, 6rem)",
                  color: i === current.lines.length - 1 ? current.accent : "#f0edf8",
                  textShadow: i === current.lines.length - 1 ? `0 0 40px ${current.accentGlow}` : "none",
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
              >
                {line}
              </motion.h2>
            ))}

            {/* Stat or CTA */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {current.stat && (
                <div
                  className="font-mono text-[.72rem] tracking-[.12em] uppercase px-5 py-2 rounded-full border"
                  style={{
                    color: `${current.accent}cc`,
                    borderColor: `${current.accent}30`,
                    background: `${current.accent}08`,
                  }}
                >
                  {current.stat}
                </div>
              )}
              {current.cta && (
                <a
                  href="https://pay.kiwify.com.br/G8uxU9O"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-heading text-[1.1rem] tracking-wide transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #00f0b4, #00c896)",
                    color: "#03030a",
                    boxShadow: "0 0 30px rgba(0,240,180,.3)",
                  }}
                >
                  Começar meu protocolo
                </a>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar + dots */}
        <div className="absolute bottom-20 flex flex-col items-center gap-4">
          {/* Dots */}
          <div className="flex gap-2">
            {SCENES.map((_, i) => (
              <button
                key={i}
                onClick={() => setScene(i)}
                className="relative w-8 h-1 rounded-full overflow-hidden transition-all"
                style={{
                  background: "rgba(255,255,255,.1)",
                }}
              >
                {i === scene && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: current.accent }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                    key={`prog-${scene}`}
                    layoutId={undefined}
                  />
                )}
                {i !== scene && i < scene && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: `${SCENES[i].accent}60` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-6 flex flex-col items-center gap-1"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.15em] uppercase">
            scroll
          </span>
          <ChevronDown className="w-4 h-4 text-[#50507a]" />
        </motion.div>
      </div>
    </section>
  );
}
