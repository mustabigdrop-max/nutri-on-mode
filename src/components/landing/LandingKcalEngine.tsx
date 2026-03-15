import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── Phone screens ──────────────────────────────────────────────────────────
// Three app "screens" that auto-cycle inside the phone mockup.
// Each shows a different aspect of the protocol engine.

const SCREENS = [
  { id: "dashboard", label: "Dashboard",   icon: "📊" },
  { id: "protocol",  label: "Protocolo",   icon: "🎯" },
  { id: "ia",        label: "IA Chat",      icon: "🧠" },
];

// Calorie ring
function KcalRing({ pct, kcal, target }: { pct: number; kcal: number; target: number }) {
  const size = 96;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="#e8a020" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 6px rgba(232,160,32,.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-heading text-[1.05rem] text-[#e8a020] leading-none">
          {kcal.toLocaleString("pt-BR")}
        </div>
        <div className="font-mono text-[.4rem] text-[#606080] mt-0.5 tracking-[.05em]">
          de {target.toLocaleString("pt-BR")} kcal
        </div>
      </div>
    </div>
  );
}

// Macro bar
function MacroBar({ label, g, pct, color, delay }: { label: string; g: number; pct: number; color: string; delay: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-mono text-[.52rem]" style={{ color: `${color}80` }}>{label}</span>
        <span className="font-mono text-[.52rem] text-[#50507a]">{g}g</span>
      </div>
      <div className="h-[3px] rounded-full bg-white/[.04] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Screen: Dashboard ───────────────────────────────────────────────────────
function ScreenDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-2.5"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-heading text-[.6rem] tracking-[.1em] text-[#e8a020]/70">NUTRION</div>
          <div className="font-mono text-[.48rem] text-[#f0edf8]/20">Sábado, 15 Mar</div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[.75rem]">🔥</span>
          <span className="font-heading text-[.8rem] text-[#e8a020]">21</span>
        </div>
      </div>

      {/* Ring + macros */}
      <div className="flex items-center gap-3 bg-white/[.018] rounded-xl p-3 border border-white/[.04]">
        <KcalRing pct={0.72} kcal={1847} target={2560} />
        <div className="flex-1 space-y-2">
          <MacroBar label="Proteína" g={178} pct={82} color="#ff4466" delay={0.5} />
          <MacroBar label="Carboidrato" g={148} pct={54} color="#e8a020" delay={0.7} />
          <MacroBar label="Gordura" g={62} pct={38} color="#00f0b4" delay={0.9} />
        </div>
      </div>

      {/* Alert */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl p-3 border"
        style={{ background: "rgba(232,160,32,.06)", borderColor: "rgba(232,160,32,.2)" }}
      >
        <div className="flex gap-2">
          <span className="text-[.85rem]">⚡</span>
          <div>
            <p className="font-heading text-[.65rem] text-[#e8a020] mb-0.5">Janela anabólica</p>
            <p className="font-landing text-[.58rem] text-[#7070a0] leading-[1.4]">
              30 min pós-treino. Consuma sua proteína agora.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick log */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="w-full py-2.5 rounded-xl font-heading text-[.7rem] tracking-[.05em]"
        style={{ background: "linear-gradient(135deg,#e8a020,#f5b84c)", color: "#000" }}
      >
        + Registrar Refeição
      </motion.button>
    </motion.div>
  );
}

// ─── Screen: Protocol ────────────────────────────────────────────────────────
const PROTOCOL_ITEMS = [
  { label: "GEB",        value: "1.847 kcal", sub: "Taxa basal",       color: "#7890ff" },
  { label: "GET",        value: "2.860 kcal", sub: "Gasto total",      color: "#e8a020" },
  { label: "Meta VET",   value: "2.560 kcal", sub: "Déficit –300",     color: "#ff4466" },
  { label: "Proteína",   value: "2.2g/kg",    sub: "178g por dia",     color: "#00f0b4" },
];

function ScreenProtocol() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-heading text-[.6rem] tracking-[.1em] text-[#e8a020]/70">NUTRION</div>
          <div className="font-mono text-[.48rem] text-[#f0edf8]/20">Protocolo ativo</div>
        </div>
        <div className="px-2 py-1 rounded-full bg-[#00f0b4]/10 border border-[#00f0b4]/20">
          <span className="font-mono text-[.44rem] text-[#00f0b4]">IA ATIVA</span>
        </div>
      </div>

      {PROTOCOL_ITEMS.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.1 }}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
          style={{
            background: `${item.color}07`,
            borderColor: `${item.color}18`,
          }}
        >
          <div>
            <p className="font-mono text-[.52rem] tracking-[.06em]" style={{ color: `${item.color}80` }}>
              {item.label}
            </p>
            <p className="font-landing text-[.58rem] text-[#50507a]">{item.sub}</p>
          </div>
          <p className="font-heading text-[.9rem]" style={{ color: item.color }}>{item.value}</p>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="mt-1 px-3 py-2 rounded-xl border border-[#7890ff]/15 bg-[#7890ff]/05"
      >
        <p className="font-mono text-[.5rem] text-[#7890ff]/60 uppercase tracking-wider mb-1">Projeção IA</p>
        <p className="font-heading text-[.75rem] text-[#f0edf8]/70">
          –<span className="text-[#ff4466]">0.58kg</span>/semana ·
          meta <span className="text-[#e8a020]">10kg</span> em 17 sem
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Screen: IA Chat ─────────────────────────────────────────────────────────
const MESSAGES = [
  { from: "user",  text: "Posso comer frango + arroz agora?" },
  { from: "ia",    text: "Sim! 150g frango + 80g arroz cozido = 420 kcal · 42g prot. Perfeito pós-treino.", color: "#00f0b4" },
  { from: "user",  text: "E o jantar?" },
  { from: "ia",    text: "Você ainda tem 693 kcal. Sugiro omelete + salada · mantém o déficit e bate a proteína.", color: "#00f0b4" },
];

function ScreenIA() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setVisible(v => Math.min(v + 1, MESSAGES.length - 1)), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-heading text-[.6rem] tracking-[.1em] text-[#e8a020]/70">NUTRION</div>
          <div className="font-mono text-[.48rem] text-[#f0edf8]/20">Coach IA · Online</div>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#00f0b4] animate-pulse" />
      </div>

      <div className="space-y-2 min-h-[130px]">
        {MESSAGES.slice(0, visible + 1).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-2.5 py-2 rounded-xl"
              style={
                msg.from === "user"
                  ? { background: "rgba(232,160,32,.12)", border: "1px solid rgba(232,160,32,.2)" }
                  : { background: "rgba(0,240,180,.06)", border: "1px solid rgba(0,240,180,.15)" }
              }
            >
              <p className="font-landing text-[.6rem] leading-[1.5]" style={{ color: msg.from === "ia" ? msg.color : "#c0c0d0" }}>
                {msg.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="flex gap-2 mt-2"
      >
        <div className="flex-1 px-3 py-2 rounded-xl border border-white/[.06] bg-white/[.02]">
          <p className="font-landing text-[.55rem] text-[#303050]">Pergunte ao seu coach...</p>
        </div>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(0,240,180,.12)", border: "1px solid rgba(0,240,180,.2)" }}
        >
          <span className="text-[.7rem]">↑</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Feature bullets ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "⚙️",
    title: "Motor de protocolo",
    desc: "GEB · GET · VET calculados com Mifflin-St Jeor. Macros por objetivo. Nada genérico.",
    color: "#e8a020",
  },
  {
    icon: "🧠",
    title: "IA adaptativa",
    desc: "Aprende com seu histórico. Ajusta calorias ao treinar mais, ao dormir menos, ao mudar o objetivo.",
    color: "#00f0b4",
  },
  {
    icon: "📸",
    title: "Foto → calorias",
    desc: "Tire uma foto da refeição. A IA lê os alimentos e lança automaticamente no seu diário.",
    color: "#7890ff",
  },
  {
    icon: "📈",
    title: "Projeção de resultado",
    desc: "Saiba exatamente em quantas semanas você atinge sua meta. Gráfico real, não estimativa motivacional.",
    color: "#ff4466",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingKcalEngine() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const [activeScreen, setActiveScreen] = useState(0);

  // Auto-cycle screens
  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setActiveScreen(s => (s + 1) % SCREENS.length), 4500);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section id="kcal" ref={ref} className="bg-[#06060f] px-6 md:px-12 py-[110px] overflow-hidden relative">

      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none opacity-[.03]"
        style={{ backgroundImage: "linear-gradient(rgba(232,160,32,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(232,160,32,.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(232,160,32,.04), transparent 68%)" }} />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-16">
          <div className="font-mono text-[.62rem] text-[#e8a020] tracking-[.22em] uppercase mb-4 flex items-center gap-2.5">
            <span className="w-4 h-px bg-[#e8a020]" />Motor de protocolo
          </div>
          <h2 className="font-heading leading-[.92] mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 5rem)" }}>
            <span className="text-[#f0edf8]">SEU PROTOCOLO.</span>
            <br />
            <span style={{ color: "#e8a020", textShadow: "0 0 30px rgba(232,160,32,.35)" }}>CALCULADO. REAL.</span>
          </h2>
          <p className="font-landing text-[#60607a] text-[.9rem] max-w-md">
            Nenhum número genérico. GEB, GET e VET do seu corpo. Macros pelo seu objetivo. IA que ajusta em tempo real.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: features */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-5"
          >
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-4"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[.95rem] flex-shrink-0 mt-0.5"
                  style={{ background: `${feat.color}10`, border: `1px solid ${feat.color}20` }}
                >
                  {feat.icon}
                </div>
                <div>
                  <p className="font-heading text-[.9rem] text-[#f0edf8]/80 mb-1 tracking-[.02em]">{feat.title}</p>
                  <p className="font-landing text-[.75rem] text-[#60607a] leading-[1.65]">{feat.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Inline CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="pt-2"
            >
              <a
                href="#plans"
                className="inline-flex items-center gap-2 font-mono text-[.65rem] tracking-[.1em] text-[#e8a020]/60 hover:text-[#e8a020] transition-colors uppercase"
              >
                Ver planos e começar →
              </a>
            </motion.div>
          </motion.div>

          {/* Right: phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Screen tabs */}
            <div className="flex gap-2">
              {SCREENS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveScreen(i)}
                  className="px-3 py-1.5 rounded-lg font-mono text-[.55rem] tracking-[.06em] transition-all"
                  style={{
                    background: activeScreen === i ? "rgba(232,160,32,.12)" : "rgba(255,255,255,.02)",
                    border: activeScreen === i ? "1px solid rgba(232,160,32,.3)" : "1px solid rgba(255,255,255,.06)",
                    color: activeScreen === i ? "#e8a020" : "#50507a",
                  }}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* Phone shell */}
            <div
              className="relative w-[260px] rounded-[30px] overflow-hidden"
              style={{
                background: "#060614",
                border: "1px solid rgba(232,160,32,.12)",
                boxShadow: "0 0 70px rgba(232,160,32,.08), 0 40px 80px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04)",
              }}
            >
              {/* Notch */}
              <div className="h-7 flex items-center justify-center">
                <div className="w-16 h-3.5 rounded-full bg-black" />
              </div>

              {/* Screen content */}
              <div className="px-4 pb-5 pt-1 min-h-[310px]">
                <AnimatePresence mode="wait">
                  {activeScreen === 0 && <ScreenDashboard key="dashboard" />}
                  {activeScreen === 1 && <ScreenProtocol key="protocol" />}
                  {activeScreen === 2 && <ScreenIA key="ia" />}
                </AnimatePresence>
              </div>

              {/* Bottom nav */}
              <div className="pb-4 px-4 pt-1 border-t border-white/[.04] flex justify-around">
                {["🏠","💧","➕","💬","👤"].map((icon, i) => (
                  <div key={i} className="flex flex-col items-center gap-1" style={{ opacity: i === 0 ? 1 : 0.25 }}>
                    <span className="text-[.8rem]">{icon}</span>
                    {i === 0 && <div className="w-1 h-1 rounded-full bg-[#e8a020]" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-cycle dots */}
            <div className="flex gap-1.5">
              {SCREENS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: activeScreen === i ? 16 : 6,
                    background: activeScreen === i ? "#e8a020" : "rgba(255,255,255,.1)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
