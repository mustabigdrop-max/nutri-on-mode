import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Cpu, Brain, Camera, TrendingUp } from "lucide-react";

const FEATURES = [
  { icon: Cpu, title: "Motor de protocolo", desc: "GEB, GET e VET calculados via Mifflin-St Jeor com ajuste dinâmico semanal." },
  { icon: Brain, title: "IA adaptativa", desc: "Aprende seus padrões e recalibra macros automaticamente a cada 7 dias." },
  { icon: Camera, title: "Foto → calorias", desc: "Tire uma foto da refeição e receba os macros em 3 segundos." },
  { icon: TrendingUp, title: "Projeção de resultado", desc: "Veja exatamente quando vai atingir a meta com base nos seus dados reais." },
];

const TABS = [
  { emoji: "📊", label: "Dashboard" },
  { emoji: "🎯", label: "Protocolo" },
  { emoji: "🧠", label: "IA Chat" },
];

const CYCLE_MS = 4500;

// ── Phone screens ────────────────────────────────────────────────────────────

function CalorieRing({ size = 100 }: { size?: number }) {
  const kcal = 1847;
  const target = 2560;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = kcal / target;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#e8a020" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 6px rgba(232,160,32,.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-[1.1rem] text-[#e8a020] leading-none">1.847</span>
        <span className="font-mono text-[.35rem] text-[#606080] tracking-[.06em] mt-0.5">de 2.560 kcal</span>
      </div>
    </div>
  );
}

function MacroRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[.5rem] text-[#8080a0] w-[52px]">{label}</span>
      <div className="flex-1 h-[3px] rounded-full bg-white/[.04] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      <span className="font-mono text-[.48rem] text-[#606080] w-[32px] text-right">{value}g</span>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <CalorieRing />
      <div className="w-full space-y-2 px-1">
        <MacroRow label="Proteína" value={156} max={200} color="#00f0b4" />
        <MacroRow label="Carbo" value={198} max={280} color="#7890ff" />
        <MacroRow label="Gordura" value={62} max={80} color="#e8a020" />
      </div>
      <motion.div
        className="w-full mt-1 px-2.5 py-2 rounded-lg border border-[#e8a020]/20 bg-[#e8a020]/[.04]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e8a020] animate-pulse" />
          <span className="font-mono text-[.48rem] text-[#e8a020]/80 tracking-wide">Janela anabólica · próx. 47min</span>
        </div>
      </motion.div>
    </div>
  );
}

function MetricCard({ label, value, unit, delay }: { label: string; value: string; unit: string; delay: number }) {
  return (
    <motion.div
      className="rounded-lg border border-white/[.06] bg-white/[.02] p-2.5 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="font-mono text-[.42rem] text-[#7070a0] uppercase tracking-[.1em] mb-1">{label}</div>
      <div className="font-heading text-[1rem] text-[#f0edf8] leading-none">{value}</div>
      <div className="font-mono text-[.38rem] text-[#50507a] mt-0.5">{unit}</div>
    </motion.div>
  );
}

function ProtocoloScreen() {
  return (
    <div className="space-y-3 pt-1">
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="GEB" value="1.689" unit="kcal/dia" delay={0.1} />
        <MetricCard label="GET" value="2.618" unit="kcal/dia" delay={0.2} />
        <MetricCard label="VET" value="2.168" unit="kcal/dia" delay={0.3} />
        <MetricCard label="Proteína" value="172" unit="g/dia" delay={0.4} />
      </div>
      <motion.div
        className="rounded-lg border border-[#00f0b4]/20 bg-[#00f0b4]/[.04] px-3 py-2.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="font-mono text-[.42rem] text-[#00f0b4]/60 uppercase tracking-[.1em] mb-1">IA Projeção</div>
        <div className="font-heading text-[.8rem] text-[#00f0b4] leading-snug">
          –0.58 kg/sem · <span className="text-[#f0edf8]">10 kg em 17 sem</span>
        </div>
      </motion.div>
    </div>
  );
}

const CHAT_MSGS = [
  { role: "user" as const, text: "O que comer no pós-treino hoje?" },
  { role: "ai" as const, text: "Com base no seu VET de 2.168 kcal e treino de força, recomendo:" },
  { role: "ai" as const, text: "🍗 Frango grelhado 180g (297 kcal · 42g prot)\n🍚 Arroz integral 120g (156 kcal · 3.6g prot)\n🥦 Brócolis 80g (28 kcal)" },
  { role: "ai" as const, text: "Total: 481 kcal · 48g proteína ✓ Janela anabólica aproveitada." },
];

function IAChatScreen() {
  const [visibleMsgs, setVisibleMsgs] = useState(0);

  useEffect(() => {
    setVisibleMsgs(0);
    const interval = setInterval(() => {
      setVisibleMsgs((v) => {
        if (v >= CHAT_MSGS.length) {
          clearInterval(interval);
          return v;
        }
        return v + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2 pt-1 max-h-[240px] overflow-hidden">
      {CHAT_MSGS.slice(0, visibleMsgs).map((msg, i) => (
        <motion.div
          key={i}
          className={`px-2.5 py-2 rounded-lg text-[.52rem] leading-relaxed whitespace-pre-line ${
            msg.role === "user"
              ? "bg-[#e8a020]/10 text-[#e8a020] ml-6 text-right"
              : "bg-white/[.03] text-[#c0c0d0] mr-4"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {msg.text}
        </motion.div>
      ))}
      {visibleMsgs < CHAT_MSGS.length && (
        <motion.div
          className="flex items-center gap-1 px-2.5"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <span className="w-1 h-1 rounded-full bg-[#7890ff]" />
          <span className="w-1 h-1 rounded-full bg-[#7890ff]" />
          <span className="w-1 h-1 rounded-full bg-[#7890ff]" />
          <span className="font-mono text-[.4rem] text-[#50507a] ml-1">analisando...</span>
        </motion.div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function LandingKcalEngine() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setActiveTab((v) => (v + 1) % TABS.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section ref={ref} className="bg-[#03030a] px-6 md:px-12 py-[100px] overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />Motor de protocolo
        </div>
        <h2 className="font-heading leading-[.92] mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}>
          SEU PROTOCOLO.<br />
          <span className="text-primary">EM TEMPO REAL.</span>
        </h2>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
        {/* ── Left: Feature bullets ──────────────────────────────────── */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="flex gap-4 items-start group"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/[.08] border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/[.15] transition-colors">
                <f.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-[1rem] text-[#f0edf8] mb-1">{f.title}</h3>
                <p className="font-landing text-[.78rem] text-[#60607a] leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Right: Phone mockup ────────────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className="px-3.5 py-1.5 rounded-full font-mono text-[.6rem] tracking-wide transition-all flex items-center gap-1.5"
                style={{
                  background: activeTab === i ? "rgba(232,160,32,.12)" : "rgba(255,255,255,.03)",
                  color: activeTab === i ? "#e8a020" : "#60607a",
                  border: `1px solid ${activeTab === i ? "rgba(232,160,32,.3)" : "rgba(255,255,255,.06)"}`,
                }}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Phone frame */}
          <div
            className="relative w-[240px] md:w-[270px] rounded-[28px] overflow-hidden border border-white/[.08]"
            style={{
              background: "linear-gradient(180deg, #0a0a18 0%, #060612 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,.6), 0 0 40px rgba(232,160,32,.06)",
            }}
          >
            {/* Notch */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-16 h-1 rounded-full bg-white/[.08]" />
            </div>

            {/* Status bar */}
            <div className="flex justify-between items-center px-4 pb-2">
              <span className="font-mono text-[.4rem] text-[#50507a]">9:41</span>
              <span className="font-mono text-[.4rem] text-[#50507a]">●●●</span>
            </div>

            {/* Content */}
            <div className="px-3 pb-4 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  {activeTab === 0 && <DashboardScreen />}
                  {activeTab === 1 && <ProtocoloScreen />}
                  {activeTab === 2 && <IAChatScreen />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Home bar */}
            <div className="flex justify-center pb-2">
              <div className="w-24 h-1 rounded-full bg-white/[.1]" />
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-1.5 mt-4">
            {TABS.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: activeTab === i ? "#e8a020" : "rgba(255,255,255,.12)",
                  boxShadow: activeTab === i ? "0 0 8px rgba(232,160,32,.4)" : "none",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
