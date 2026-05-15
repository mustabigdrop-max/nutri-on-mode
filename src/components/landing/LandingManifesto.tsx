import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789▓▒░";

function useScramble(target: string, active: boolean, delay = 0) {
  const [out, setOut] = useState(() => target.replace(/[^\s]/g, "░"));
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let rafId: number;
    const totalFrames = target.replace(/ /g, "").length * 5;
    const timeoutId = setTimeout(() => {
      const tick = () => {
        const resolved = Math.floor((frame / totalFrames) * target.length);
        setOut(
          Array.from(target)
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (i < resolved) return ch;
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            })
            .join("")
        );
        frame++;
        if (frame <= totalFrames + 4) rafId = requestAnimationFrame(tick);
        else setOut(target);
      };
      rafId = requestAnimationFrame(tick);
    }, delay * 1000);
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [active, target, delay]);
  return out;
}

const DIAGNOSTIC_CARDS = [
  {
    mark: "✕",
    color: "#ff4444",
    label: "Não é falta de dedicação",
    sub: "Você já se dedicou. Várias vezes. Já começou certinho.",
    border: "rgba(255,255,255,.05)",
    bg: "rgba(5,5,16,.9)",
    hi: false,
  },
  {
    mark: "✕",
    color: "#ff4444",
    label: "Não é falta de informação",
    sub: "Você sabe o que fazer. Sempre soube.",
    border: "rgba(255,255,255,.05)",
    bg: "rgba(5,5,16,.9)",
    hi: false,
  },
  {
    mark: "→",
    color: "#00f0b4",
    label: "É falta de padrão sistêmico",
    sub: "Mindset + Comportamento + Execução — conectados, adaptando, sem parar.",
    border: "rgba(0,240,180,.22)",
    bg: "rgba(0,240,180,.028)",
    hi: true,
  },
];

const PILLARS = [
  {
    letter: "M",
    tag: "MINDSET",
    color: "#7890ff",
    glow: "rgba(120,144,255,.14)",
    statement: "O resultado começa na cabeça.",
    sub: "Antes do prato. Antes do treino. Humor, sono e padrões mentais alimentam cada protocolo. Sem Mindset calibrado, nenhum cardápio ou treino sustenta.",
    modules: ["Humor tracking", "Mapa vulnerab.", "TCC nutricional", "IA comportamental", "Win rate"],
    bars: [0.9, 0.6, 0.85, 0.7, 0.95],
  },
  {
    letter: "C",
    tag: "COMPORTAMENTO",
    color: "#e8a020",
    glow: "rgba(232,160,32,.14)",
    statement: "O padrão vem antes de tudo.",
    sub: "Treino, nutrição, sono, fome — tudo é comportamento. O NutriON mapeia seu padrão completo e o recalibra 24h sem parar. Não é dieta. É sistema de vida.",
    modules: ["Nutrição", "TrainingON", "Sono", "Fome emocional", "Padrão completo"],
    bars: [0.7, 0.95, 0.8, 1.0, 0.75],
  },
  {
    letter: "E",
    tag: "EXECUÇÃO",
    color: "#00f0b4",
    glow: "rgba(0,240,180,.12)",
    statement: "Seis módulos. Um protocolo.",
    sub: "TrainingON, NutriSync, Lab, Coach IA, Peak Week, Gamificação. Cada módulo fala com o outro. Cada dado recalcula o próximo passo. Automaticamente.",
    modules: ["TrainingON", "Lab & Exames", "Coach IA", "Peak Week", "Muscle Heatmap"],
    bars: [0.85, 0.65, 0.95, 0.7, 0.88],
  },
];

const SYSTEM_MODULES = [
  { label: "NutriSync", color: "#e8a020" },
  { label: "TrainingON", color: "#00f0b4" },
  { label: "Lab & Exames", color: "#7890ff" },
  { label: "Coach IA", color: "#e8a020" },
  { label: "Peak Week", color: "#00f0b4" },
  { label: "Muscle Heatmap", color: "#7890ff" },
  { label: "Comportamento", color: "#e8a020" },
  { label: "Gamificação", color: "#00f0b4" },
];

const LandingManifesto = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6%" });

  const l1 = useScramble("VOCÊ JÁ TENTOU", inView, 0.1);
  const l2 = useScramble("FORÇA DE VONTADE.", inView, 0.55);
  const l3 = useScramble("AGORA TENTE SISTEMA.", inView, 1.15);

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-[100px] overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(5,5,16,.97) 12%, rgba(5,5,16,.97) 88%, transparent 100%)",
      }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,160,32,.013) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,32,.013) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />
      {/* Nebula */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(120,144,255,.05) 0%, rgba(232,160,32,.04) 50%, transparent 75%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-[1100px] mx-auto">
        {/* PART 1 — Label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-mono text-[.6rem] tracking-[.28em] uppercase mb-6 flex items-center gap-3"
          style={{ color: "rgba(232,160,32,.6)" }}
        >
          <span className="w-6 h-px" style={{ background: "rgba(232,160,32,.45)" }} />
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e8a020" }} />
          Método MCE — O Sistema
        </motion.div>

        {/* PART 2 — Headline scramble */}
        <h2 className="font-heading leading-[.88] mb-8" style={{ fontSize: "clamp(2.2rem, 7.5vw, 6.8rem)" }}>
          <div className="font-mono tracking-[.04em]" style={{ color: "rgba(240,237,248,.6)" }}>
            {l1}
          </div>
          <div style={{ color: "#e8a020", textShadow: "0 0 60px rgba(232,160,32,.5)" }}>{l2}</div>
          <div style={{ color: "#f0edf8" }}>{l3}</div>
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 1.4 }}
          className="font-landing text-[1rem] leading-[1.8] max-w-[600px] mb-8"
          style={{ color: "#8888b0" }}
        >
          Não é fraqueza. Não é falta de conhecimento.{" "}
          <span style={{ color: "rgba(240,237,248,.78)" }} className="font-semibold">
            É falta de um sistema que conecta Mindset, Comportamento e Execução — treino, nutrição, lab, comportamento, coach e IA — em um único protocolo que nunca para.
          </span>
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 1.65 }}
          style={{
            originX: 0,
            background:
              "linear-gradient(90deg, rgba(232,160,32,.55), rgba(120,144,255,.35), transparent)",
          }}
          className="h-px max-w-[580px] mb-16"
        />

        {/* PART 3 — Diagnostic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-16">
          {DIAGNOSTIC_CARDS.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.75 + i * 0.11 }}
              className="relative p-6 rounded-sm border overflow-hidden"
              style={{ borderColor: c.border, background: c.bg }}
            >
              {c.hi && (
                <span
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(0,240,180,.75), transparent)",
                  }}
                />
              )}
              <div
                className="font-heading text-[1.5rem] mb-3"
                style={{ color: c.color, textShadow: `0 0 18px ${c.color}66` }}
              >
                {c.mark}
              </div>
              <div
                className="font-landing text-[.88rem] font-semibold mb-2"
                style={{ color: "rgba(240,237,248,.85)" }}
              >
                {c.label}
              </div>
              <div
                className="font-mono text-[.56rem] tracking-[.04em] leading-[1.7]"
                style={{ color: "#505070" }}
              >
                {c.sub}
              </div>
              <span
                className="absolute bottom-3 right-3 w-4 h-4 border-b border-r"
                style={{ borderColor: c.color, opacity: 0.18 }}
              />
            </motion.div>
          ))}
        </div>

        {/* PART 4 — MCE Pillars */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.6, delay: 2.0 }}
          style={{
            originX: 0,
            background:
              "linear-gradient(90deg, rgba(120,144,255,.25), rgba(232,160,32,.35), rgba(0,240,180,.25))",
          }}
          className="hidden md:block h-px mb-px"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-16" style={{ background: "rgba(255,255,255,.028)" }}>
          {PILLARS.map((p, pi) => (
            <motion.div
              key={p.letter}
              initial={{ opacity: 0, y: 36 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 2.1 + pi * 0.17 }}
              className="relative bg-[#040410] p-7 md:p-9 group overflow-hidden"
            >
              {/* Top accent */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  originX: 0.5,
                  background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`,
                }}
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.0, delay: 2.1 + pi * 0.17 }}
              />
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 75% 45% at 50% 0%, ${p.glow}, transparent)`,
                }}
              />
              {/* Watermark */}
              <div
                className="absolute -top-3 -right-1 font-heading text-[8rem] leading-none pointer-events-none select-none"
                style={{
                  color: `${p.color}04`,
                  WebkitTextStroke: `1px ${p.color}07`,
                }}
              >
                {p.letter}
              </div>

              <div className="relative z-10">
                {/* Badge row */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border"
                    style={{
                      borderColor: `${p.color}28`,
                      background: `${p.color}0e`,
                      boxShadow: `0 0 18px ${p.color}18`,
                    }}
                  >
                    <span className="font-heading text-[1.2rem]" style={{ color: p.color }}>
                      {p.letter}
                    </span>
                  </div>
                  <span
                    className="font-mono text-[.5rem] tracking-[.22em] uppercase"
                    style={{ color: p.color }}
                  >
                    {p.tag}
                  </span>
                </div>

                <div
                  className="font-heading text-[1.45rem] md:text-[1.65rem] leading-[1.05] mb-4"
                  style={{ color: "#f0edf8", textShadow: `0 0 24px ${p.color}28` }}
                >
                  {p.statement}
                </div>

                <p
                  className="text-[.78rem] leading-[1.82] font-landing mb-5"
                  style={{ color: "#5a5a7a" }}
                >
                  {p.sub}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {p.modules.map((m) => (
                    <span
                      key={m}
                      className="font-mono text-[.49rem] px-2 py-1 border rounded-[1px] tracking-[.06em]"
                      style={{
                        color: `${p.color}b8`,
                        borderColor: `${p.color}28`,
                        background: `${p.color}08`,
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>

                <div className="flex items-end gap-[2px] h-5">
                  {p.bars.map((b, bi) => (
                    <motion.div
                      key={bi}
                      className="flex-1 rounded-[1px]"
                      style={{ background: p.color }}
                      animate={{
                        height: [`${b * 35}%`, `${b * 100}%`, `${b * 35}%`],
                        opacity: [0.48, 0.88, 0.48],
                      }}
                      transition={{
                        duration: 1.9 + bi * 0.28,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* PART 5 — System modules strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 2.65 }}
          className="flex flex-wrap gap-2 items-center mb-16"
        >
          <span
            className="font-mono text-[.5rem] tracking-[.22em] uppercase mr-2"
            style={{ color: "#2a2a46" }}
          >
            Incluso no sistema
          </span>
          {SYSTEM_MODULES.map((m) => (
            <span
              key={m.label}
              className="font-mono text-[.5rem] px-2.5 py-1.5 border rounded-[1px] tracking-[.06em]"
              style={{
                borderColor: `${m.color}1e`,
                color: `${m.color}b8`,
                background: `${m.color}08`,
              }}
            >
              {m.label}
            </span>
          ))}
        </motion.div>

        {/* PART 6 — Closing */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 2.9 }}
          className="border-t pt-12"
          style={{ borderColor: "rgba(255,255,255,.04)" }}
        >
          <p
            className="font-heading leading-[.92] mb-1"
            style={{ fontSize: "clamp(1.55rem,4.5vw,4.2rem)", color: "rgba(240,237,248,.5)" }}
          >
            Não é app de dieta.
          </p>
          <p
            className="font-heading leading-[.92] mb-1"
            style={{ fontSize: "clamp(1.55rem,4.5vw,4.2rem)", color: "rgba(240,237,248,.75)" }}
          >
            Não é app de treino.
          </p>
          <p
            className="font-heading leading-[.92]"
            style={{
              fontSize: "clamp(1.55rem,4.5vw,4.2rem)",
              color: "#e8a020",
              textShadow: "0 0 60px rgba(232,160,32,.45)",
            }}
          >
            É o sistema que te leva pro próximo nível.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingManifesto;
