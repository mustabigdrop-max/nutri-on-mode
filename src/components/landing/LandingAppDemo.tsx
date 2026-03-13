import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// Simulated macro progress bar
const MacroBar = ({
  label,
  pct,
  color,
  delay,
}: {
  label: string;
  pct: number;
  color: string;
  delay: number;
}) => (
  <div className="flex items-center gap-2.5">
    <span className="font-mono text-[.52rem] w-[52px] flex-shrink-0" style={{ color: `${color}80` }}>
      {label}
    </span>
    <div className="flex-1 h-[3px] rounded-full bg-white/[.04] overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
      />
    </div>
    <span className="font-mono text-[.52rem] w-[28px] text-right" style={{ color: `${color}60` }}>
      {pct}%
    </span>
  </div>
);

// Animated calorie ring
const CalorieRing = ({ inView }: { inView: boolean }) => {
  const size = 100;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = 0.68;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth={stroke} />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e8a020"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={inView ? { strokeDashoffset: circ * (1 - progress) } : {}}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 6px rgba(232,160,32,.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-heading text-[1.1rem] text-[#e8a020] leading-none">1.847</div>
        <div className="font-mono text-[.42rem] text-[#606080] tracking-[.06em] mt-0.5">de 2.340 kcal</div>
      </div>
    </div>
  );
};

// Rotating feature highlight cards
const HIGHLIGHTS = [
  {
    label: "IA leu seu exame",
    desc: "Vitamina D baixa detectada. Plano ajustado automaticamente.",
    icon: "🩸",
    color: "#e8a020",
  },
  {
    label: "Janela anabólica",
    desc: "30 min pós-treino. Consuma sua proteína agora.",
    icon: "⚡",
    color: "#00f0b4",
  },
  {
    label: "Streak: 14 dias",
    desc: "Você está no nível Atleta. Continue assim.",
    icon: "🔥",
    color: "#ff6644",
  },
  {
    label: "Protocolo ativado",
    desc: "Low Carb · GEB 1.847 kcal · Déficit −300",
    icon: "🎯",
    color: "#7890ff",
  },
];

const LandingAppDemo = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const [activeHighlight, setActiveHighlight] = useState(0);
  const [mealLogged, setMealLogged] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setActiveHighlight((i) => (i + 1) % HIGHLIGHTS.length), 3000);
    return () => clearInterval(t);
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setMealLogged(true), 2200);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-[120px] overflow-hidden"
      style={{ background: "#03030a" }}
    >
      {/* Background radial */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(232,160,32,.04) 0%, transparent 65%)",
      }} />

      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2.5 mb-5 border border-[#e8a020]/12 bg-[#e8a020]/[.04] px-4 py-2 rounded-full">
            <span className="font-mono text-[.58rem] text-[#e8a020]/70 tracking-[.2em] uppercase">App ao vivo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8a020] animate-pulse" style={{ boxShadow: "0 0 6px rgba(232,160,180,1)" }} />
          </div>
          <h2
            className="font-heading leading-[.9] mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            <span className="text-[#f0edf8]">VEJA O SISTEMA</span>
            <br />
            <span style={{ color: "#e8a020", textShadow: "0 0 35px rgba(232,160,32,.4)" }}>FUNCIONANDO.</span>
          </h2>
          <p className="text-[#60607a] font-landing text-[.9rem] max-w-[380px] mx-auto">
            Um dashboard inteligente que pensa com você — não por você.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left — phone mockup with app UI */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <div
              className="relative w-[280px] rounded-[32px] overflow-hidden"
              style={{
                background: "#060614",
                border: "1px solid rgba(232,160,32,.12)",
                boxShadow: "0 0 60px rgba(232,160,32,.08), 0 40px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04)",
              }}
            >
              {/* Phone notch */}
              <div className="h-8 flex items-center justify-center relative">
                <div className="w-20 h-4 rounded-full bg-black" />
                <div className="absolute right-4 top-3 flex items-center gap-1">
                  <div className="w-3 h-1.5 rounded-sm border border-white/20" />
                </div>
              </div>

              {/* App content */}
              <div className="px-4 pb-6 pt-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-heading text-[.6rem] tracking-[.1em] text-[#e8a020]/70">NUTRI</div>
                    <div className="font-heading text-[.55rem] tracking-[.08em] text-[#f0edf8]/30">Sexta, 13 Mar</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#e8a020]/10 border border-[#e8a020]/20 flex items-center justify-center">
                      <span className="text-[.5rem]">🔥</span>
                    </div>
                    <div className="font-heading text-[.75rem] text-[#e8a020]">14</div>
                  </div>
                </div>

                {/* Calorie ring + macros */}
                <div className="flex items-center gap-4 mb-5 bg-white/[.018] rounded-xl p-3 border border-white/[.04]">
                  <CalorieRing inView={inView} />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <MacroBar label="Proteína" pct={82} color="#ff4466" delay={0.7} />
                    <MacroBar label="Carbo" pct={54} color="#e8a020" delay={0.9} />
                    <MacroBar label="Gordura" pct={38} color="#00f0b4" delay={1.1} />
                  </div>
                </div>

                {/* AI alert card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeHighlight}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="mb-3 rounded-xl p-3 border"
                    style={{
                      background: `${HIGHLIGHTS[activeHighlight].color}08`,
                      borderColor: `${HIGHLIGHTS[activeHighlight].color}25`,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[.9rem] flex-shrink-0 mt-0.5">{HIGHLIGHTS[activeHighlight].icon}</span>
                      <div>
                        <div
                          className="font-heading text-[.7rem] tracking-[.04em] mb-0.5"
                          style={{ color: HIGHLIGHTS[activeHighlight].color }}
                        >
                          {HIGHLIGHTS[activeHighlight].label}
                        </div>
                        <div className="font-landing text-[.62rem] text-[#7070a0] leading-[1.4]">
                          {HIGHLIGHTS[activeHighlight].desc}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Quick log button */}
                <motion.button
                  className="w-full py-2.5 rounded-xl font-heading text-[.75rem] tracking-[.06em] transition-all"
                  style={{
                    background: mealLogged
                      ? "rgba(0,240,180,.12)"
                      : "linear-gradient(135deg, #e8a020, #f5b84c)",
                    color: mealLogged ? "#00f0b4" : "#000",
                    border: mealLogged ? "1px solid rgba(0,240,180,.3)" : "none",
                  }}
                  animate={mealLogged ? { scale: [1, 1.03, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {mealLogged ? "✓ Refeição Registrada" : "Registrar Refeição"}
                </motion.button>

                {/* Bottom nav */}
                <div className="mt-4 pt-3 border-t border-white/[.05] flex justify-around">
                  {["🏠", "💧", "➕", "💬", "👤"].map((icon, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1"
                      style={{ opacity: i === 0 ? 1 : 0.3 }}
                    >
                      <span className="text-[.85rem]">{icon}</span>
                      {i === 0 && (
                        <div className="w-1 h-1 rounded-full bg-[#e8a020]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — feature list + callouts */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="flex flex-col gap-5"
          >
            {[
              {
                title: "Dashboard inteligente",
                desc: "Anel calórico, barras de macro, score metabólico, streak e alertas — tudo na primeira tela. Sem navegar, sem perder tempo.",
                color: "#e8a020",
                icon: "📊",
              },
              {
                title: "IA que prevê antes do erro",
                desc: "O sistema detecta padrões de comportamento alimentar e age antes do deslize. Não espera você errar para agir.",
                color: "#00f0b4",
                icon: "🧠",
              },
              {
                title: "1 toque para registrar",
                desc: "Banco TACO + IBGE completo. Busca por voz. Foto → calorias. O registro é tão rápido que você não tem desculpa para não fazer.",
                color: "#7890ff",
                icon: "⚡",
              },
              {
                title: "Gamificação que cria hábito real",
                desc: "XP, streak, níveis e missões que te fazem querer abrir o app — não porque você tem que fazer, mas porque você quer.",
                color: "#e8a020",
                icon: "🎮",
              },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.09 }}
                className="flex gap-4 group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[1rem] flex-shrink-0 mt-0.5 transition-colors"
                  style={{
                    background: `${feat.color}10`,
                    border: `1px solid ${feat.color}20`,
                  }}
                >
                  {feat.icon}
                </div>
                <div>
                  <div className="font-heading text-[.95rem] text-[#f0edf8]/80 mb-1 tracking-[.03em]">{feat.title}</div>
                  <p className="font-landing text-[.78rem] text-[#60607a] leading-[1.65]">{feat.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* CTA inline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-3 flex items-center gap-3"
            >
              <div className="h-px flex-1 bg-[#e8a020]/10" />
              <a
                href="#plans"
                className="font-mono text-[.62rem] text-[#e8a020]/60 tracking-[.12em] hover:text-[#e8a020] transition-colors flex items-center gap-2"
              >
                VER PLANOS E PREÇOS
                <span className="text-[.8rem]">→</span>
              </a>
              <div className="h-px flex-1 bg-[#e8a020]/10" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingAppDemo;
