import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronRight, Zap, RotateCcw } from "lucide-react";

// ─── Mifflin-St Jeor ────────────────────────────────────────────────────────
function calcGEB(sexo: "M" | "F", peso: number, altura: number, idade: number) {
  return sexo === "M"
    ? 10 * peso + 6.25 * altura - 5 * idade + 5
    : 10 * peso + 6.25 * altura - 5 * idade - 161;
}

const ACTIVITY: { key: string; label: string; sub: string; factor: number }[] = [
  { key: "sedentario", label: "Sedentário",      sub: "Escritório / sem exercício",   factor: 1.2   },
  { key: "leve",       label: "Leve",            sub: "1–3x/semana",                  factor: 1.375 },
  { key: "moderado",   label: "Moderado",        sub: "3–5x/semana",                  factor: 1.55  },
  { key: "ativo",      label: "Ativo",           sub: "6–7x/semana",                  factor: 1.725 },
  { key: "atleta",     label: "Atleta",          sub: "2x/dia ou trabalho físico",     factor: 1.9   },
];

const OBJECTIVES: { key: string; label: string; emoji: string; kcalDelta: number; protFactor: number }[] = [
  { key: "perder",  label: "Perder gordura",  emoji: "🔥", kcalDelta: -450, protFactor: 2.0 },
  { key: "manter",  label: "Manter",          emoji: "⚖️", kcalDelta:    0, protFactor: 1.8 },
  { key: "ganhar",  label: "Ganhar massa",    emoji: "💪", kcalDelta: +300, protFactor: 2.2 },
];

function calcMacros(vet: number, peso: number, protFactor: number) {
  const protG   = Math.round(peso * protFactor);
  const protKcal = protG * 4;
  const fatKcal  = Math.round(vet * 0.26);
  const fatG     = Math.round(fatKcal / 9);
  const carbKcal = Math.max(0, vet - protKcal - fatKcal);
  const carbG    = Math.round(carbKcal / 4);
  return { protG, fatG, carbG, protKcal, fatKcal, carbKcal };
}

// ─── Mini CalorieRing para o resultado ──────────────────────────────────────
function ResultRing({ kcal, target, size = 110 }: { kcal: number; target: number; size?: number }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(kcal / target, 1);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="#e8a020" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(232,160,32,.6))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="font-heading text-[1.15rem] text-[#e8a020] leading-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          {kcal.toLocaleString("pt-BR")}
        </motion.div>
        <div className="font-mono text-[.38rem] text-[#606080] tracking-[.06em] mt-0.5">kcal / dia</div>
      </div>
    </div>
  );
}

// ─── MacroBar ────────────────────────────────────────────────────────────────
function MacroBar({ label, g, kcal, total, color, delay }: {
  label: string; g: number; kcal: number; total: number; color: string; delay: number;
}) {
  const pct = Math.round((kcal / total) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-mono text-[.6rem]" style={{ color: `${color}90` }}>{label}</span>
        <span className="font-mono text-[.6rem] text-[#f0edf8]/50">{g}g · {pct}%</span>
      </div>
      <div className="h-[3px] rounded-full bg-white/[.04] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Slider input ────────────────────────────────────────────────────────────
function SliderField({ label, value, min, max, step = 1, unit, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-mono text-[.62rem] text-[#7070a0] uppercase tracking-[.1em]">{label}</span>
        <span className="font-heading text-[1.1rem] text-[#e8a020] leading-none">
          {value}<span className="font-mono text-[.58rem] text-[#50507a] ml-0.5">{unit}</span>
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #e8a020 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,.06) 0)`,
          outline: "none",
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="font-mono text-[.48rem] text-[#30305a]">{min}{unit}</span>
        <span className="font-mono text-[.48rem] text-[#30305a]">{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function LandingKcalEngine() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  const [step, setStep] = useState(0);          // 0=sexo 1=dados 2=atividade 3=objetivo
  const [sexo, setSexo] = useState<"M" | "F" | null>(null);
  const [peso, setPeso]       = useState(75);
  const [altura, setAltura]   = useState(170);
  const [idade, setIdade]     = useState(28);
  const [atividade, setAtividade] = useState<string | null>(null);
  const [objetivo, setObjetivo]   = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const canAdvance = [
    sexo !== null,
    true,                   // sliders always valid
    atividade !== null,
    objetivo !== null,
  ][step];

  function calculate() {
    if (!sexo || !atividade || !objetivo) return;
    setShowResult(true);
  }

  function reset() {
    setStep(0); setSexo(null); setAtividade(null); setObjetivo(null); setShowResult(false);
    setPeso(75); setAltura(170); setIdade(28);
  }

  // Computed
  const actObj   = ACTIVITY.find(a => a.key === atividade);
  const objObj   = OBJECTIVES.find(o => o.key === objetivo);
  const geb      = sexo ? Math.round(calcGEB(sexo, peso, altura, idade)) : 0;
  const get      = actObj ? Math.round(geb * actObj.factor) : 0;
  const vet      = objObj ? Math.round(get + objObj.kcalDelta) : 0;
  const macros   = objObj ? calcMacros(vet, peso, objObj.protFactor) : null;
  const weeklyKg = objObj ? Math.abs(objObj.kcalDelta * 7 / 7700).toFixed(2) : "0";
  const weeks    = objObj && objObj.kcalDelta !== 0 ? Math.round(10 / Math.abs(objObj.kcalDelta * 7 / 7700)) : 0;

  const STEP_LABELS = ["Sexo", "Dados físicos", "Atividade", "Objetivo"];

  return (
    <section id="kcal" ref={ref} className="bg-[#03030a] px-6 md:px-12 py-[110px] overflow-hidden">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />Calculadora de protocolo
        </div>
        <h2 className="font-heading leading-[.92] mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 5rem)" }}>
          SEU PROTOCOLO.<br />
          <span className="text-primary">AO VIVO.</span>
        </h2>
        <p className="font-landing text-[#60607a] text-[.9rem] max-w-md">
          Nenhum app calcula isso antes de você se cadastrar. Aqui você vê seus números reais — GEB, GET e VET — agora.
        </p>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start max-w-5xl">

        {/* ── Left: Form ─────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.15 }}>

          {!showResult ? (
            <div>
              {/* Step indicator */}
              <div className="flex items-center gap-0 mb-8">
                {STEP_LABELS.map((label, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`flex flex-col items-center gap-1 transition-all ${i <= step ? "opacity-100" : "opacity-30"}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[.55rem] transition-all ${
                        i < step ? "bg-primary text-black" : i === step ? "border-2 border-primary text-primary" : "border border-[#303050] text-[#303050]"
                      }`}>
                        {i < step ? "✓" : i + 1}
                      </div>
                      <span className="font-mono text-[.45rem] text-[#50507a] tracking-[.05em] whitespace-nowrap">{label}</span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div className={`w-8 md:w-12 h-px mx-1 mb-4 transition-all ${i < step ? "bg-primary/50" : "bg-[#14142a]"}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[200px]"
                >
                  {/* Step 0: Sexo */}
                  {step === 0 && (
                    <div>
                      <p className="font-heading text-[1.2rem] text-[#f0edf8] mb-6">Qual é o seu sexo biológico?</p>
                      <div className="grid grid-cols-2 gap-4">
                        {(["M", "F"] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => setSexo(s)}
                            className="py-6 rounded-xl border transition-all font-heading text-[2rem]"
                            style={{
                              background: sexo === s ? "rgba(232,160,32,.1)" : "rgba(255,255,255,.02)",
                              borderColor: sexo === s ? "rgba(232,160,32,.5)" : "rgba(255,255,255,.06)",
                              boxShadow: sexo === s ? "0 0 20px rgba(232,160,32,.1)" : "none",
                            }}
                          >
                            {s === "M" ? "♂" : "♀"}
                            <p className="font-mono text-[.6rem] text-[#7070a0] mt-2">{s === "M" ? "Masculino" : "Feminino"}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 1: Dados físicos */}
                  {step === 1 && (
                    <div className="space-y-7">
                      <p className="font-heading text-[1.2rem] text-[#f0edf8] mb-2">Seus dados físicos</p>
                      <SliderField label="Peso" value={peso} min={40} max={180} unit="kg" onChange={setPeso} />
                      <SliderField label="Altura" value={altura} min={140} max={220} unit="cm" onChange={setAltura} />
                      <SliderField label="Idade" value={idade} min={16} max={75} unit="anos" onChange={setIdade} />
                    </div>
                  )}

                  {/* Step 2: Atividade */}
                  {step === 2 && (
                    <div>
                      <p className="font-heading text-[1.2rem] text-[#f0edf8] mb-6">Nível de atividade física</p>
                      <div className="space-y-2.5">
                        {ACTIVITY.map(a => (
                          <button
                            key={a.key}
                            onClick={() => setAtividade(a.key)}
                            className="w-full px-4 py-3.5 rounded-xl border text-left flex items-center justify-between transition-all"
                            style={{
                              background: atividade === a.key ? "rgba(232,160,32,.08)" : "rgba(255,255,255,.02)",
                              borderColor: atividade === a.key ? "rgba(232,160,32,.4)" : "rgba(255,255,255,.06)",
                            }}
                          >
                            <div>
                              <p className="font-heading text-[.95rem] text-[#f0edf8]/90">{a.label}</p>
                              <p className="font-landing text-[.72rem] text-[#60607a]">{a.sub}</p>
                            </div>
                            <span className="font-mono text-[.62rem] text-[#e8a020]/60">×{a.factor}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Objetivo */}
                  {step === 3 && (
                    <div>
                      <p className="font-heading text-[1.2rem] text-[#f0edf8] mb-6">Qual é o seu objetivo?</p>
                      <div className="space-y-3">
                        {OBJECTIVES.map(o => (
                          <button
                            key={o.key}
                            onClick={() => setObjetivo(o.key)}
                            className="w-full px-5 py-4 rounded-xl border text-left flex items-center gap-4 transition-all"
                            style={{
                              background: objetivo === o.key ? "rgba(232,160,32,.08)" : "rgba(255,255,255,.02)",
                              borderColor: objetivo === o.key ? "rgba(232,160,32,.4)" : "rgba(255,255,255,.06)",
                            }}
                          >
                            <span className="text-2xl">{o.emoji}</span>
                            <div>
                              <p className="font-heading text-[1rem] text-[#f0edf8]/90">{o.label}</p>
                              <p className="font-mono text-[.6rem] text-[#60607a]">
                                {o.kcalDelta > 0 ? `+${o.kcalDelta}` : o.kcalDelta === 0 ? "±0" : o.kcalDelta} kcal / dia
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="px-5 py-3 rounded-xl border border-[#14142a] text-[#50507a] font-mono text-[.68rem] tracking-[.08em] hover:border-[#2a2a4a] hover:text-[#8080a0] transition-all"
                  >
                    ← Voltar
                  </button>
                )}
                <button
                  onClick={() => step < 3 ? setStep(s => s + 1) : calculate()}
                  disabled={!canAdvance}
                  className="flex-1 py-3 rounded-xl font-mono text-[.72rem] tracking-[.08em] font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: canAdvance ? "linear-gradient(135deg, #e8a020, #f5b84c)" : "rgba(232,160,32,.08)",
                    color: canAdvance ? "#000" : "#e8a020",
                    border: canAdvance ? "none" : "1px solid rgba(232,160,32,.2)",
                  }}
                >
                  {step < 3 ? (
                    <><span>Próximo</span><ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <><Zap className="w-4 h-4" /><span>Calcular meu protocolo</span></>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Result — personalized copy */
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div>
                <p className="font-mono text-[.6rem] text-[#e8a020] tracking-[.15em] uppercase mb-1">Protocolo calculado · Mifflin-St Jeor + VENTA</p>
                <p className="font-heading text-[1.6rem] text-[#f0edf8] leading-tight">
                  Sua meta: <span className="text-[#e8a020]">{vet.toLocaleString("pt-BR")} kcal</span>/dia
                </p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "GEB", value: geb.toLocaleString("pt-BR"), sub: "metabolismo basal" },
                  { label: "GET", value: get.toLocaleString("pt-BR"), sub: "gasto total" },
                  { label: "VET", value: vet.toLocaleString("pt-BR"), sub: "sua meta" },
                ].map(item => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl text-center"
                    style={{ background: "rgba(232,160,32,.05)", border: "1px solid rgba(232,160,32,.1)" }}
                  >
                    <p className="font-mono text-[.52rem] text-[#e8a020]/60 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="font-heading text-[.95rem] text-[#e8a020]">{item.value}</p>
                    <p className="font-landing text-[.55rem] text-[#50507a]">{item.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Projection */}
              {objObj && objObj.kcalDelta !== 0 && (
                <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
                  <p className="font-mono text-[.6rem] text-[#50507a] uppercase tracking-wider mb-2">Projeção</p>
                  <p className="font-landing text-[.85rem] text-[#c0c0d8]">
                    Neste protocolo você {objObj.key === "perder" ? "perde" : "ganha"}{" "}
                    <strong className="text-[#e8a020]">{weeklyKg}kg/semana</strong>.
                    {weeks > 0 && <> Meta de 10kg em <strong className="text-[#f0edf8]">≈{weeks} semanas</strong>.</>}
                  </p>
                </div>
              )}

              {/* CTA */}
              <a href="#plans" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-mono text-[.72rem] tracking-[.08em] font-medium transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #e8a020, #f5b84c)", color: "#000", boxShadow: "0 0 30px rgba(232,160,32,.2)" }}>
                <Zap className="w-4 h-4" />
                Ver meu plano completo → começar
              </a>

              <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-2.5 text-[#50507a] font-mono text-[.62rem] hover:text-[#8080a0] transition-colors">
                <RotateCcw className="w-3 h-3" /> Recalcular
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* ── Right: Live phone mockup ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-8 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(232,160,32,.08), transparent 70%)" }} />

            {/* Phone shell */}
            <div className="relative w-[260px] rounded-[30px] overflow-hidden"
              style={{
                background: "#060614",
                border: "1px solid rgba(232,160,32,.12)",
                boxShadow: "0 0 60px rgba(232,160,32,.07), 0 40px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04)",
              }}
            >
              {/* Notch */}
              <div className="h-7 flex items-center justify-center">
                <div className="w-16 h-3.5 rounded-full bg-black" />
              </div>

              <div className="px-4 pb-5 pt-1 space-y-3">
                {/* App header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-heading text-[.6rem] tracking-[.1em] text-[#e8a020]/70">NUTRI<span className="text-[#e8a020]">ON</span></div>
                    <div className="font-mono text-[.48rem] text-[#f0edf8]/25">Protocolo pessoal</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[.7rem]">🔥</span>
                    <span className="font-heading text-[.75rem] text-[#e8a020]">1</span>
                  </div>
                </div>

                {/* Ring + macros */}
                <div className="flex items-center gap-3 bg-white/[.018] rounded-xl p-3 border border-white/[.04]">
                  {showResult && macros ? (
                    <ResultRing kcal={Math.round(vet * 0.35)} target={vet} />
                  ) : (
                    /* Blurred placeholder */
                    <div className="relative w-[110px] h-[110px] flex items-center justify-center">
                      <div className="w-full h-full rounded-full border-[7px] border-[#e8a020]/10" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="font-heading text-[1rem] text-[#e8a020]/30">—</div>
                        <div className="font-mono text-[.38rem] text-[#303050] mt-0.5">kcal / dia</div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    {showResult && macros ? (
                      <>
                        <MacroBar label="Proteína" g={macros.protG} kcal={macros.protKcal} total={vet} color="#ff4466" delay={0.6} />
                        <MacroBar label="Carbo"    g={macros.carbG} kcal={macros.carbKcal} total={vet} color="#e8a020" delay={0.8} />
                        <MacroBar label="Gordura"  g={macros.fatG}  kcal={macros.fatKcal}  total={vet} color="#00f0b4" delay={1.0} />
                      </>
                    ) : (
                      /* Blurred placeholder bars */
                      ["Proteína", "Carbo", "Gordura"].map((l, i) => (
                        <div key={l} className="flex items-center gap-2">
                          <span className="font-mono text-[.5rem] w-[44px] text-[#303050]">{l}</span>
                          <div className="flex-1 h-[3px] rounded-full bg-white/[.04]">
                            <div className="h-full rounded-full w-0 bg-[#303050]" />
                          </div>
                          <span className="font-mono text-[.5rem] text-[#303050]">--%</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* AI alert card */}
                <AnimatePresence mode="wait">
                  {showResult ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-3 border"
                      style={{ background: "rgba(232,160,32,.07)", borderColor: "rgba(232,160,32,.25)" }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-[.85rem]">🎯</span>
                        <div>
                          <p className="font-heading text-[.65rem] text-[#e8a020] mb-0.5">Protocolo ativado</p>
                          <p className="font-landing text-[.58rem] text-[#7070a0] leading-[1.4]">
                            {ACTIVITY.find(a => a.key === atividade)?.label} · {vet.toLocaleString("pt-BR")} kcal/dia
                            {objObj?.kcalDelta !== 0 && ` · ${objObj!.kcalDelta > 0 ? "+" : ""}${objObj!.kcalDelta} kcal`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      className="rounded-xl p-3 border border-white/[.04] bg-white/[.018]"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-[.85rem] opacity-20">🧠</span>
                        <div>
                          <p className="font-heading text-[.65rem] text-[#f0edf8]/15 mb-0.5">Alerta IA</p>
                          <div className="space-y-1">
                            {[40, 70, 55].map((w, i) => (
                              <div key={i} className="h-[5px] rounded bg-white/[.04]" style={{ width: `${w}%` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Unlock hint */}
                {!showResult && (
                  <div className="flex items-center justify-center gap-1.5 py-2">
                    <div className="w-1 h-1 rounded-full bg-[#e8a020] animate-pulse" />
                    <p className="font-mono text-[.52rem] text-[#50507a] tracking-[.08em]">
                      preencha os dados para desbloquear
                    </p>
                  </div>
                )}

                {/* Bottom nav dots */}
                <div className="pt-2 border-t border-white/[.04] flex justify-around">
                  {["🏠","💧","➕","💬","👤"].map((icon, i) => (
                    <div key={i} className="flex flex-col items-center gap-1" style={{ opacity: i === 0 ? 1 : 0.2 }}>
                      <span className="text-[.8rem]">{icon}</span>
                      {i === 0 && <div className="w-1 h-1 rounded-full bg-[#e8a020]" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
