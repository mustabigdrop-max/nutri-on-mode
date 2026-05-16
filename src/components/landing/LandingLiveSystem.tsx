import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type OrbitNode = {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  stat: string;
  angle: number;
};

const NODES: OrbitNode[] = [
  { id: "comp", emoji: "🧠", label: "COMPORTAMENTO", desc: "TCC nutricional + IA antecipa o sabotador.", stat: "94% interceptação", angle: 0 },
  { id: "stage", emoji: "🏆", label: "STAGE PREP", desc: "Peak Week calculado por dia.", stat: "97% aderência", angle: 45 },
  { id: "perf", emoji: "⚡", label: "PERFORMANCE", desc: "Carb load + hidratação por sessão.", stat: "VO2 +12%", angle: 90 },
  { id: "long", emoji: "🧬", label: "LONGEVIDADE", desc: "Marcadores + nutrição anti-inflamatória.", stat: "BioAge -3.4y", angle: 135 },
  { id: "farma", emoji: "💊", label: "PROTOCOLO FARMA", desc: "TDEE recalculado por composto ativo.", stat: "18+ verificado", angle: 180 },
  { id: "sono", emoji: "😴", label: "SONO & RITMO", desc: "Cronobiologia ajusta macros.", stat: "+38min REM", angle: 225 },
  { id: "ia", emoji: "📊", label: "IA ADAPTATIVA", desc: "Plateau detectado. Recalibragem auto.", stat: "Δ kcal diário", angle: 270 },
  { id: "coach", emoji: "👨‍⚕️", label: "COACH", desc: "Profissional + IA Elite no painel.", stat: "Resp <2h", angle: 315 },
];

const LIVE_EVENTS = [
  "G.T. · SP — Muscle State FULL registrado. Carb load confirmado.",
  "Sistema MCE ajustou macros após sono de 5.2h detectado.",
  "J.C. · BH — Fome emocional interceptada. TCC ativada.",
  "A.F. · RJ — Check-in semana 8. Coach respondeu em 2h.",
  "R.M. · PR — Peak Week Dia 3. Depleção no alvo.",
  "IA detectou plateau metabólico. Protocolo recalibrado.",
  "Novo atleta Bikini iniciou Stage Prep · 12 semanas.",
  "Protocolo farmacológico atualizado. TDEE recalculado.",
];

const PULSE_COLORS = ["#e8a020", "#00f0b4", "#a78bfa"];
const CENTER = { x: 400, y: 250 };
const RADIUS = 180;

const polar = (angleDeg: number, r: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER.x + r * Math.cos(rad), y: CENTER.y + r * Math.sin(rad) };
};

const LandingLiveSystem = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [activePulse, setActivePulse] = useState<{ node: string; color: string; key: number } | null>(null);
  const [eventIdx, setEventIdx] = useState(0);

  const nodePositions = useMemo(
    () => NODES.map((n) => ({ ...n, ...polar(n.angle, RADIUS) })),
    [],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        d: 8 + Math.random() * 14,
        delay: Math.random() * 4,
        size: 1 + Math.random() * 2.5,
        op: 0.3 + Math.random() * 0.3,
      })),
    [],
  );

  useEffect(() => {
    let key = 0;
    const tick = () => {
      const node = NODES[Math.floor(Math.random() * NODES.length)];
      const color = PULSE_COLORS[key % PULSE_COLORS.length];
      key += 1;
      setActivePulse({ node: node.id, color, key });
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setEventIdx((i) => (i + 1) % LIVE_EVENTS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <section className="relative py-28 px-6 overflow-hidden bg-[#03030a]">
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#e8a020]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.op,
              boxShadow: "0 0 6px rgba(232,160,32,.6)",
            }}
            animate={{
              y: [0, -30, 0, 20, 0],
              x: [0, 15, -10, 5, 0],
              opacity: [p.op, p.op * 0.4, p.op],
            }}
            transition={{ duration: p.d, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(232,160,32,0.06),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 font-mono text-[.6rem] tracking-[.28em] text-[#00f0b4]/80 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0b4] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f0b4]" />
            </span>
            ECOSSISTEMA MCE · ATIVO
          </div>
          <h2
            className="font-heading leading-[.92] mb-6 text-[#f0edf8]"
            style={{ fontSize: "clamp(3rem,7vw,7rem)" }}
          >
            UMA MÁQUINA{" "}
            <span style={{ color: "#e8a020", textShadow: "0 0 50px rgba(232,160,32,.45)" }}>
              VIVA.
            </span>
          </h2>
          <p className="font-landing text-[#f0edf8]/55 text-[.95rem] max-w-2xl mx-auto">
            Não são funcionalidades. São sistemas que se comunicam.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-4xl mx-auto"
        >
          <svg viewBox="0 0 800 500" className="w-full h-auto">
            {nodePositions.map((n, i) => {
              const isActive = activePulse?.node === n.id;
              return (
                <g key={`line-${n.id}`}>
                  <motion.line
                    x1={CENTER.x}
                    y1={CENTER.y}
                    x2={n.x}
                    y2={n.y}
                    stroke={isActive ? activePulse!.color : "#e8a020"}
                    strokeWidth={isActive ? 1.4 : 0.6}
                    strokeOpacity={isActive ? 0.85 : hovered === n.id ? 0.6 : 0.18}
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.4 + i * 0.06, ease: "easeOut" }}
                  />
                  {isActive && (
                    <motion.circle
                      key={activePulse!.key}
                      r={4}
                      fill={activePulse!.color}
                      initial={{ cx: CENTER.x, cy: CENTER.y, opacity: 1 }}
                      animate={{ cx: n.x, cy: n.y, opacity: [1, 1, 0] }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      style={{ filter: `drop-shadow(0 0 6px ${activePulse!.color})` }}
                    />
                  )}
                </g>
              );
            })}

            <motion.g
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
            >
              <polygon
                points={Array.from({ length: 6 })
                  .map((_, i) => {
                    const a = (i * 60 - 90) * (Math.PI / 180);
                    return `${CENTER.x + 60 * Math.cos(a)},${CENTER.y + 60 * Math.sin(a)}`;
                  })
                  .join(" ")}
                fill="rgba(232,160,32,0.08)"
                stroke="#e8a020"
                strokeWidth={1.2}
                style={{ filter: "drop-shadow(0 0 20px rgba(232,160,32,.5))" }}
              />
              <text x={CENTER.x} y={CENTER.y - 4} textAnchor="middle" fill="#e8a020" fontSize="14" fontWeight="700">
                MCE
              </text>
              <text
                x={CENTER.x}
                y={CENTER.y + 12}
                textAnchor="middle"
                fill="#e8a020"
                fontSize="8"
                letterSpacing="2"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                CORE
              </text>
            </motion.g>

            {nodePositions.map((n, i) => {
              const isHover = hovered === n.id;
              const isActive = activePulse?.node === n.id;
              return (
                <motion.g
                  key={n.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                  style={{ cursor: "pointer", transformOrigin: `${n.x}px ${n.y}px` }}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    r={26}
                    fill="#0a0a14"
                    stroke={isActive ? activePulse!.color : "#e8a020"}
                    strokeOpacity={isActive ? 1 : isHover ? 0.9 : 0.4}
                    strokeWidth={1.2}
                    animate={{ scale: isHover ? 1.12 : isActive ? 1.06 : 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      filter: isActive
                        ? `drop-shadow(0 0 12px ${activePulse!.color})`
                        : isHover
                          ? "drop-shadow(0 0 8px rgba(232,160,32,.6))"
                          : "none",
                      transformOrigin: `${n.x}px ${n.y}px`,
                    }}
                  />
                  <text x={n.x} y={n.y + 7} textAnchor="middle" fontSize="20" style={{ pointerEvents: "none" }}>
                    {n.emoji}
                  </text>
                  <text
                    x={n.x}
                    y={n.y + 46}
                    textAnchor="middle"
                    fill={isHover || isActive ? "#e8a020" : "#f0edf8"}
                    fillOpacity={isHover || isActive ? 1 : 0.5}
                    fontSize="7.5"
                    letterSpacing="1.5"
                    style={{ fontFamily: "JetBrains Mono, monospace", pointerEvents: "none" }}
                  >
                    {n.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>

          <AnimatePresence>
            {hovered &&
              (() => {
                const n = nodePositions.find((x) => x.id === hovered)!;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="absolute pointer-events-none px-3 py-2 rounded-lg bg-[#060612] border border-[#e8a020]/30 shadow-[0_8px_30px_rgba(232,160,32,.15)] min-w-[220px]"
                    style={{
                      left: `${(n.x / 800) * 100}%`,
                      top: `${(n.y / 500) * 100}%`,
                      transform: "translate(-50%, -130%)",
                    }}
                  >
                    <div className="font-mono text-[.55rem] tracking-[.2em] text-[#e8a020] mb-1">
                      {n.label}
                    </div>
                    <div className="font-landing text-[.7rem] text-[#f0edf8]/80 mb-1.5 leading-snug">
                      {n.desc}
                    </div>
                    <div className="font-mono text-[.55rem] text-[#00f0b4]">▸ {n.stat}</div>
                  </motion.div>
                );
              })()}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-8%" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.4 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12 max-w-5xl mx-auto"
        >
          {NODES.map((n) => (
            <motion.div
              key={n.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="flex items-start gap-2 p-3 rounded-lg bg-[#060612]/60 border border-[#e8a020]/10"
            >
              <span className="text-[1rem] leading-none mt-0.5">{n.emoji}</span>
              <div className="min-w-0">
                <div className="font-mono text-[.55rem] tracking-[.18em] text-[#e8a020] truncate">
                  {n.label}
                </div>
                <div className="font-landing text-[.68rem] text-[#f0edf8]/50 leading-snug mt-1">
                  {n.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 max-w-5xl mx-auto"
        >
          <div className="bg-[#060612] border border-[#e8a020]/10 rounded-xl p-4 flex items-center gap-4 overflow-hidden">
            <div className="flex items-center gap-2 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3b3b] opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff3b3b]" />
              </span>
              <span className="font-mono text-[.6rem] tracking-[.25em] text-[#ff3b3b]">▶ LIVE</span>
              <span className="font-mono text-[.55rem] text-[#f0edf8]/30">{ts}</span>
            </div>
            <div className="h-4 w-px bg-[#e8a020]/15 shrink-0" />
            <div className="relative flex-1 h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={eventIdx}
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center font-mono text-[.6rem] truncate"
                  style={{ color: eventIdx % 2 === 0 ? "#e8a020" : "#00f0b4" }}
                >
                  {LIVE_EVENTS[eventIdx]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingLiveSystem;
