import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const nutriProtos = [
  { icon: "🔥", name: "LOW CARB", kcalLabel: "15-25% carbo", color: "#E24B4A", desc: "Resistência insulínica · Emagrecimento · SOP", p: 35, c: 20, f: 45, kcal: "GET − 300–500", sub: "Déficit moderado, perda consistente", forText: "Resistência insulínica · SOP · Diabetes tipo 2 · Emagrecimento acelerado" },
  { icon: "⚡", name: "CETOGÊNICA", kcalLabel: "< 50g carbo/dia", color: "#EF9F27", desc: "Cetose metabólica · Queima máxima", p: 25, c: 5, f: 70, kcal: "GET − 200–400", sub: "Cetose induz déficit natural", forText: "Emagrecimento intenso · Epilepsia · Resistência severa à insulina" },
  { icon: "⏱", name: "JEJUM JI", kcalLabel: "12/8 · 16/8 · 18/8 · OMAD", color: "#B8922A", desc: "Autofagia · Saúde metabólica", p: 30, c: 45, f: 25, kcal: "VET ajustado à janela", sub: "Todas as kcal dentro da janela alimentar", forText: "Saúde metabólica · Autofagia · Praticidade · Perda de gordura" },
  { icon: "💪", name: "ATLETA / BB", kcalLabel: "40-56 kcal/kg", color: "#1D9E75", desc: "Bulk · Cutting · Recomp · Peak Week", p: 30, c: 50, f: 20, kcal: "40–56 kcal/kg", sub: "Bulk +300–600 / Cutting −500 / Recomp", forText: "Hipertrofia · Definição · Peak Week · Bodybuilders · Atletas" },
  { icon: "🌿", name: "VEGANO", kcalLabel: "Plant-Based completo", color: "#4A90D9", desc: "Proteína completa · Suplementação auto", p: 28, c: 57, f: 15, kcal: "GET calculado", sub: "Mesma lógica, fontes 100% vegetais", forText: "Veganos · Vegetarianos · Saúde ambiental · Ética animal" },
];

const trainProtos = [
  { icon: "🏋️", name: "HIPERTROFIA", kcalLabel: "8-12 reps · 70-80% 1RM", color: "#E24B4A", desc: "Bulk · Volume · RP Hypertrophy" },
  { icon: "🔥", name: "CUTTING", kcalLabel: "12-20 reps · densidade alta", color: "#EF9F27", desc: "Preservação muscular · NEAT · FST-7" },
  { icon: "⚖️", name: "RECOMPOSIÇÃO", kcalLabel: "10-15 reps · RPE 7-8", color: "#B8922A", desc: "Deficit moderado · Y3T · Recomp" },
  { icon: "🏆", name: "PEAK WEEK", kcalLabel: "SRI ≥ 82 · D-7 ao palco", color: "#1D9E75", desc: "Palco · IFBB · SRI Automático" },
  { icon: "🔄", name: "DELOAD", kcalLabel: "40-50% volume · recuperação", color: "#4A90D9", desc: "Fadiga cumulativa · Recuperação neural" },
];

const Typewriter = ({ text, speed = 35 }: { text: string; speed?: number }) => {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <span>{out}<span className="animate-pulse">▊</span></span>;
};

const LandingProtocols = () => {
  const [tab, setTab] = useState<"nutri" | "train">("nutri");
  const [activeNutri, setActiveNutri] = useState(0);
  const [activeTrain, setActiveTrain] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const isNutri = tab === "nutri";
  const protos = isNutri ? nutriProtos : trainProtos;
  const active = isNutri ? activeNutri : activeTrain;
  const setActive = isNutri ? setActiveNutri : setActiveTrain;
  const d = nutriProtos[activeNutri];

  return (
    <section id="protocols" className="bg-[#080814] px-6 md:px-12 py-[120px]">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />— MÓDULOS DE PRESCRIÇÃO
        </div>
        <h2 className="font-heading leading-[.92] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
          <span className="block text-white">NUTRIÇÃO E TREINO.</span>
          <motion.span
            className="block text-[#B8922A]"
            animate={inView ? { x: [0, -2, 2, 0, 0], opacity: [1, 0.85, 1, 0.95, 1] } : {}}
            transition={{ duration: 0.6, delay: 0.3, times: [0, 0.2, 0.4, 0.6, 1] }}
          >
            UM SISTEMA. ZERO SEPARAÇÃO.
          </motion.span>
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-[#888] text-[1rem] leading-[1.7] font-landing max-w-[600px] mb-10"
        >
          Cada módulo conversa com o outro.<br />O treino ajusta a nutrição.<br />A nutrição ajusta o treino.
        </motion.p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-0">
        {[
          { id: "nutri" as const, icon: "🍽", label: "NUTRIPLAN" },
          { id: "train" as const, icon: "⚡", label: "TRAININGON" },
        ].map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="transition-all duration-200 flex items-center gap-2"
              style={{
                background: isActive ? "#13132a" : "#0d0d1f",
                border: "0.5px solid #ffffff15",
                borderBottom: isActive ? "2px solid #B8922A" : "0.5px solid #ffffff15",
                color: isActive ? "#fff" : "#888",
                borderRadius: "8px 8px 0 0",
                padding: "10px 28px",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.08em",
              }}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-px bg-[#14142a] rounded-b-xl rounded-tr-xl overflow-x-auto md:overflow-hidden snap-x snap-mandatory mb-12"
        >
          {protos.map((proto, i) => (
            <button
              key={proto.name}
              onClick={() => setActive(i)}
              className={`text-left p-5 md:p-7 transition-colors relative overflow-hidden snap-start ${
                active === i ? "bg-primary/[.04]" : "bg-[#03030a] hover:bg-[#0a0a18]"
              }`}
            >
              <span
                className={`absolute bottom-0 left-0 right-0 h-[2px] transition-transform origin-left ${active === i ? "scale-x-100" : "scale-x-0"}`}
                style={{ background: proto.color }}
              />
              <div className="text-[1.6rem] mb-3.5">{proto.icon}</div>
              <div className="font-heading text-[1.1rem] tracking-[.06em] mb-1.5 text-[#f0edf8]">{proto.name}</div>
              <div className="font-mono text-[.65rem] tracking-[.08em] mb-2.5" style={{ color: proto.color }}>{proto.kcalLabel}</div>
              <div className="text-[.78rem] text-[#50507a] leading-[1.5] font-landing">{proto.desc}</div>
            </button>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Bottom panel */}
      <AnimatePresence mode="wait">
        {isNutri ? (
          <motion.div
            key="nutri-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#0d0d1f] border border-[#14142a] rounded-xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div>
              <div className="font-mono text-[.62rem] text-[#50507a] tracking-[.15em] uppercase mb-3">Distribuição de Macros</div>
              <div className="flex flex-col gap-2 mt-1">
                {[
                  { label: "Proteína", val: d.p, color: "#ff2d55" },
                  { label: "Carboidrato", val: d.c, color: "#E8A020" },
                  { label: "Gordura", val: d.f, color: "#00f0d0" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-2.5 text-[.72rem]">
                    <span className="min-w-[60px] text-[#50507a]">{m.label}</span>
                    <div className="flex-1 h-1 bg-[#14142a] rounded overflow-hidden">
                      <motion.div className="h-full rounded" style={{ background: m.color }} initial={{ width: 0 }} animate={{ width: `${m.val}%` }} transition={{ duration: 0.6 }} />
                    </div>
                    <span className="min-w-[32px] text-right font-mono text-[.62rem] text-[#50507a]">{m.val}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-[.62rem] text-[#50507a] tracking-[.15em] uppercase mb-3">Faixa de Kcal</div>
              <div className="font-heading text-[1.6rem] text-primary leading-none">{d.kcal}</div>
              <div className="text-[.78rem] text-[#6060a0] mt-1 font-landing">{d.sub}</div>
            </div>
            <div>
              <div className="font-mono text-[.62rem] text-[#50507a] tracking-[.15em] uppercase mb-3">Indicado para</div>
              <div className="text-[.82rem] text-[#7070a0] leading-[1.7] font-landing">{d.forText}</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="train-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#0d0d1f] border border-[#14142a] rounded-xl p-6 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="font-mono text-[.62rem] text-[#50507a] tracking-[.15em] uppercase mb-3">CAMADAS ATIVAS</div>
                <div className="font-heading text-[2.4rem] text-white leading-none font-bold">7 / 7</div>
                <div className="text-[.78rem] text-[#6060a0] mt-1 font-landing">STRATUM completo</div>
                <div className="inline-block mt-3 px-2.5 py-1 text-[.62rem] font-mono tracking-[.1em] rounded" style={{ background: "#B8922A20", color: "#B8922A", border: "1px solid #B8922A40" }}>
                  PERIODIZAÇÃO ON
                </div>
              </div>
              <div>
                <div className="font-mono text-[.62rem] text-[#50507a] tracking-[.15em] uppercase mb-3">PRÓXIMA SESSÃO</div>
                <div className="font-mono text-[.78rem] text-white leading-[1.9]">
                  <div>Volume       →  18 séries</div>
                  <div>Intensidade  →  72% 1RM</div>
                  <div>Técnica      →  RP Hypertrophy</div>
                </div>
              </div>
              <div>
                <div className="font-mono text-[.62rem] text-[#50507a] tracking-[.15em] uppercase mb-3">INTEGRAÇÕES ATIVAS</div>
                <div className="flex flex-col gap-2">
                  {["APEX · POSTURAL ON", "NUTRIPLAN · SYNC ON", "LOADTRACKER · ATIVO"].map((b) => (
                    <div key={b} className="px-2.5 py-1.5 text-[.62rem] font-mono tracking-[.08em] rounded" style={{ background: "#00D4FF10", color: "#00D4FF", border: "1px solid #00D4FF30" }}>
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 pt-5 border-t border-[#14142a] font-mono text-[.7rem] text-[#B8922A] tracking-[.08em]">
              <Typewriter text="STRATUM CARREGADO · 7 CAMADAS ATIVAS · APEX SYNC ON · LOADTRACKER INICIADO" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LandingProtocols;
