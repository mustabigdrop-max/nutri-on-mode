import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// ─── Text scramble hook ───────────────────────────────────────────────────────
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

// ─── MCE Pillar data — FULL SYSTEM, not just nutrition ───────────────────────
const MCE_PILLARS = [
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

const DIAGNOSIS = [
  {
    mark: "✕",
    label: "Não é falta de dedicação",
    sub: "Você já se dedicou. Várias vezes. Já começou certinho. Já comprou plano, app, planilha.",
    color: "#ff4444",
    hi: false,
  },
  {
    mark: "✕",
    label: "Não é falta de informação",
    sub: "Você sabe o que fazer. Proteína, treino, sono. O problema nunca foi saber.",
    color: "#ff4444",
    hi: false,
  },
  {
    mark: "→",
    label: "É falta de padrão sistêmico",
    sub: "Mindset + Comportamento + Execução — conectados, adaptando, sem parar.",
    color: "#00f0b4",
    hi: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const LandingManifesto = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6%" });

  const l1 = useScramble("VOCÊ JÁ TENTOU", inView, 0.1);
  const l2 = useScramble("FORÇA DE VONTADE.", inView, 0.55);
  const l3 = useScramble("AGORA TENTE SISTEMA.", inView, 1.15);

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-[120px] overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(3,3,10,0) 0%, rgba(5,5,16,.97) 16%, rgba(5,5,16,.97) 84%, rgba(3,3,10,0) 100%)",
      }}
    >
      {/* Fine grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,160,32,.013) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,32,.013) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      {/* Central nebula */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(120,144,255,.05) 0%, rgba(232,160,32,.03) 42%, transparent 68%)",
          filter: "blur(80px)",
        }}
      />

      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-10"
        >
          <span className="w-8 h-px bg-[#e8a020]/40" />
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#e8a020]"
            style={{ boxShadow: "0 0 8px rgba(232,160,32,.8)" }}
          />
          <span className="font-mono text-[.6rem] text-[#e8a020]/60 tracking-[.28em] uppercase">
            Método MCE — O Sistema
          </span>
        </motion.div>

        {/* ── GLITCH HEADLINE ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
          className="mb-6 select-none"
        >
          <h2
            className="font-heading leading-[.88]"
            style={{ fontSize: "clamp(2.2rem, 7.5vw, 6.8rem)" }}
          >
            <div
              className="font-mono tracking-[.04em]"
              style={{ color: "rgba(240,237,248,.6)" }}
            >
              {l1}
            </div>
            <div
              style={{
                color: "#e8a020",
                textShadow: "0 0 60px rgba(232,160,32,.5)",
              }}
            >
              {l2}
            </div>
            <div style={{ color: "#f0edf8" }}>{l3}</div>
          </h2>
        </motion.div>

        {/* Sub headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 1.65 }}
          className="font-landing text-[1rem] leading-[1.8] max-w-[600px] mb-4"
          style={{ color: "#8888b0" }}
        >
          Não é fraqueza. Não é falta de conhecimento. É falta de um sistema que{" "}
          <span style={{ color: "rgba(240,237,248,.78)", fontWeight: 600 }}>
            conecta Mindset, Comportamento e Execução
          </span>{" "}
          — treino, nutrição, lab, comportamento, coach e IA — em um único protocolo que nunca para.
        </motion.p>

        {/* Gradient separator */}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 1.65 }}
          className="h-px mb-14"
          style={{
            background:
              "linear-gradient(90deg, rgba(232,160,32,.55), rgba(120,144,255,.35), transparent)",
            maxWidth: "580px",
          }}
        />

        {/* ── DIAGNOSIS PANELS ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-16">
          {DIAGNOSIS.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 1.75 + i * 0.11 }}
              className="relative border p-6 overflow-hidden"
              style={{
                borderColor: d.hi ? "rgba(0,240,180,.22)" : "rgba(255,255,255,.05)",
                background: d.hi ? "rgba(0,240,180,.028)" : "rgba(5,5,16,.9)",
              }}
            >
              {d.hi && (
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(0,240,180,.75), transparent)",
                  }}
                />
              )}
              <div
                className="font-heading text-[1.5rem] mb-2"
                style={{ color: d.color, textShadow: `0 0 12px ${d.color}55` }}
              >
                {d.mark}
              </div>
              <div
                className="font-landing text-[.88rem] font-semibold leading-[1.4] mb-2"
                style={{ color: "rgba(240,237,248,.82)" }}
              >
                {d.label}
              </div>
              <div
                className="font-mono text-[.56rem] tracking-[.04em] leading-[1.7]"
                style={{ color: "#505070" }}
              >
                {d.sub}
              </div>
              <span
                className="absolute bottom-3 right-3 w-4 h-4 border-b border-r"
                style={{ borderColor: `${d.color}18` }}
              />
            </motion.div>
          ))}
        </div>

        {/* ── MCE PILLARS ─────────────────────────────────────────────────── */}
        <div className="relative mb-8">
          {/* Desktop top connector — animated gradient line */}
          <motion.div
            className="absolute -top-px left-0 right-0 h-px hidden md:block pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(120,144,255,.25) 18%, rgba(232,160,32,.35) 50%, rgba(0,240,180,.25) 82%, transparent)",
            }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.6, delay: 2.0 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#ffffff]/[.028]">
            {MCE_PILLARS.map((p, pi) => (
              <motion.div
                key={p.letter}
                initial={{ opacity: 0, y: 36 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 2.1 + pi * 0.17 }}
                className="relative bg-[#040410] p-7 md:p-9 group overflow-hidden"
              >
                {/* Top accent line */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1.0, delay: 2.2 + pi * 0.17 }}
                />

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 75% 45% at 50% 0%, ${p.glow}, transparent)`,
                  }}
                />

                {/* Giant watermark letter */}
                <div
                  className="absolute -top-3 -right-1 font-heading text-[8rem] leading-none select-none pointer-events-none"
                  style={{
                    color: `${p.color}04`,
                    WebkitTextStroke: `1px ${p.color}07`,
                  }}
                >
                  {p.letter}
                </div>

                <div className="relative z-10">
                  {/* Badge + tag */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${p.color}0e`,
                        border: `1px solid ${p.color}28`,
                        boxShadow: `0 0 14px ${p.color}18`,
                      }}
                    >
                      <span
                        className="font-heading text-[1.2rem] leading-none"
                        style={{ color: p.color, textShadow: `0 0 10px ${p.color}` }}
                      >
                        {p.letter}
                      </span>
                    </div>
                    <span
                      className="font-mono text-[.5rem] tracking-[.22em]"
                      style={{ color: `${p.color}75` }}
                    >
                      {p.tag}
                    </span>
                  </div>

                  {/* Statement */}
                  <h3
                    className="font-heading text-[1.45rem] md:text-[1.65rem] leading-[1.05] mb-3"
                    style={{
                      color: "#f0edf8",
                      textShadow: `0 0 30px ${p.color}28`,
                    }}
                  >
                    {p.statement}
                  </h3>

                  {/* Sub */}
                  <p
                    className="text-[.78rem] leading-[1.82] font-landing mb-6"
                    style={{ color: "#5a5a7a" }}
                  >
                    {p.sub}
                  </p>

                  {/* Module chips */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {p.modules.map((mod) => (
                      <span
                        key={mod}
                        className="font-mono text-[.49rem] tracking-[.08em] px-2 py-1 border rounded-[1px]"
                        style={{
                          borderColor: `${p.color}20`,
                          color: `${p.color}72`,
                          background: `${p.color}05`,
                        }}
                      >
                        {mod}
                      </span>
                    ))}
                  </div>

                  {/* Equaliser bars */}
                  <div className="flex items-end gap-[2px] h-5">
                    {p.bars.map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-[1px]"
                        style={{ background: p.color }}
                        animate={{
                          height: [
                            `${h * 100}%`,
                            `${p.bars[(i + 2) % p.bars.length] * 100}%`,
                            `${h * 100}%`,
                          ],
                          opacity: [0.48, 0.88, 0.48],
                        }}
                        transition={{
                          duration: 1.9 + i * 0.28,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: pi * 0.35 + i * 0.16,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── SYSTEM MODULES STRIP ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 2.65 }}
          className="flex flex-wrap gap-2 items-center mb-16"
        >
          <span
            className="font-mono text-[.5rem] tracking-[.22em] uppercase mr-2"
            style={{ color: "#2a2a46" }}
          >
            Incluso no sistema
          </span>
          {[
            ["NutriSync", "#e8a020"],
            ["TrainingON", "#00f0b4"],
            ["Lab & Exames", "#7890ff"],
            ["Coach IA", "#e8a020"],
            ["Peak Week", "#00f0b4"],
            ["Muscle Heatmap", "#7890ff"],
            ["Comportamento", "#e8a020"],
            ["Gamificação", "#00f0b4"],
          ].map(([label, color]) => (
            <span
              key={label}
              className="font-mono text-[.5rem] tracking-[.07em] px-2.5 py-1.5 border rounded-[1px] transition-colors duration-300 hover:opacity-100"
              style={{
                borderColor: `${color}1e`,
                color: `${color}68`,
                background: `${color}04`,
              }}
            >
              {label}
            </span>
          ))}
        </motion.div>

        {/* ── CLOSING STATEMENT ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 2.9 }}
          className="border-t border-[#ffffff]/04 pt-12"
        >
          <p
            className="font-heading leading-[.92] mb-1"
            style={{
              fontSize: "clamp(1.55rem, 4.5vw, 4.2rem)",
              color: "rgba(240,237,248,.5)",
            }}
          >
            Não é app de dieta.
          </p>
          <p
            className="font-heading leading-[.92] mb-1"
            style={{
              fontSize: "clamp(1.55rem, 4.5vw, 4.2rem)",
              color: "rgba(240,237,248,.75)",
            }}
          >
            Não é app de treino.
          </p>
          <p
            className="font-heading leading-[.92]"
            style={{
              fontSize: "clamp(1.55rem, 4.5vw, 4.2rem)",
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
