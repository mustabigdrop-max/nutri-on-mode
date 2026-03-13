import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  {
    id: "goal",
    question: "Qual é o seu objetivo principal?",
    sub: "Seja honesto. O protocolo é personalizado para sua resposta.",
    options: [
      { value: "cut", label: "Emagrecer", icon: "↓", desc: "Perder gordura de forma sustentável" },
      { value: "define", label: "Definir", icon: "◈", desc: "Manter massa e cortar gordura" },
      { value: "bulk", label: "Hipertrofiar", icon: "↑", desc: "Ganhar massa muscular de qualidade" },
      { value: "health", label: "Saúde", icon: "◎", desc: "Melhorar energia e disposição" },
    ],
  },
  {
    id: "training",
    question: "Com que frequência você treina?",
    sub: "Isso define seu TDEE e janela de recuperação.",
    options: [
      { value: "none", label: "Não treino", icon: "○", desc: "Foco em alimentação primeiro" },
      { value: "low", label: "1–2x por semana", icon: "◑", desc: "Rotina leve ou iniciante" },
      { value: "mid", label: "3–4x por semana", icon: "◕", desc: "Intermediário consistente" },
      { value: "high", label: "5x ou mais", icon: "●", desc: "Alta demanda metabólica" },
    ],
  },
  {
    id: "block",
    question: "O que mais te sabota?",
    sub: "Vamos atacar exatamente isso.",
    options: [
      { value: "time", label: "Falta de tempo", icon: "⏱", desc: "Rotina corrida, sem planejamento" },
      { value: "social", label: "Comer fora / social", icon: "⊕", desc: "Restaurantes, festas, família" },
      { value: "consistency", label: "Falta de consistência", icon: "↻", desc: "Começa bem, depois abandona" },
      { value: "knowledge", label: "Não sei o que comer", icon: "?", desc: "Muita informação contraditória" },
    ],
  },
];

const PROTOCOLS: Record<string, Record<string, Record<string, { name: string; tagline: string; kcal: string; approach: string; color: string }>>> = {
  cut: {
    none: { consistency: { name: "CORTE ESTRUTURADO", tagline: "Sem treino, sem fome. Déficit inteligente.", kcal: "−400 kcal/dia", approach: "Protocolo de restrição progressiva com janelas alimentares", color: "#00f0b4" }, time: { name: "PROTOCOLO 4×1", tagline: "4 dias certinho vale mais que 7 improvisados.", kcal: "−350 kcal/dia", approach: "Refeições modulares preparadas em 10 min", color: "#00f0b4" }, social: { name: "CORTE FLEXÍVEL", tagline: "Come fora e ainda emagrece.", kcal: "−300 kcal/dia", approach: "Substituições inteligentes para qualquer cardápio", color: "#00f0b4" }, knowledge: { name: "CORTE GUIADO", tagline: "O app pensa. Você come.", kcal: "−400 kcal/dia", approach: "IA MCE monta o plano diário automaticamente", color: "#00f0b4" } },
    low: { consistency: { name: "CUTTING ATIVO", tagline: "2x de treino já são suficientes com protocolo certo.", kcal: "−450 kcal/dia", approach: "Ondulação calórica nos dias de treino vs descanso", color: "#00f0b4" }, time: { name: "CUTTING RÁPIDO", tagline: "2 treinos + alimentação afinada = resultado real.", kcal: "−400 kcal/dia", approach: "Batch cooking dominical + pré-treino calórico", color: "#00f0b4" }, social: { name: "CORTE SOCIAL", tagline: "Você não precisa evitar restaurantes.", kcal: "−350 kcal/dia", approach: "Compensação calórica via treino + janela pós-social", color: "#00f0b4" }, knowledge: { name: "CUTTING BÁSICO", tagline: "Simples. Eficiente. Sem precisar estudar nutrição.", kcal: "−450 kcal/dia", approach: "Templates prontos por tipo de refeição", color: "#00f0b4" } },
    mid: { consistency: { name: "CUTTING INTERMEDIÁRIO", tagline: "3-4x de treino + sistema = 90% de aderência.", kcal: "−500 kcal/dia", approach: "Periodização nutricional + TCC comportamental", color: "#e8a020" }, time: { name: "CUTTING COMPACTO", tagline: "Alta frequência de treino, nutrição no piloto automático.", kcal: "−480 kcal/dia", approach: "Refeições replicáveis + ajuste automático via app", color: "#e8a020" }, social: { name: "CUTTING ADAPTÁVEL", tagline: "Vida social intacta. Déficit mantido.", kcal: "−420 kcal/dia", approach: "Banco de créditos calóricos para eventos sociais", color: "#e8a020" }, knowledge: { name: "CUTTING MCE", tagline: "Motor MCE ajusta suas macros todo dia.", kcal: "−500 kcal/dia", approach: "IA analisa consumo e ajusta automaticamente", color: "#e8a020" } },
    high: { consistency: { name: "CUTTING ATLÉTICO", tagline: "5+ treinos exigem protocolo de alta precisão.", kcal: "−300 kcal/dia", approach: "Ciclagem calórica periódica + recarga estratégica", color: "#7890ff" }, time: { name: "CUTTING PROFISSIONAL", tagline: "Alta frequência = alto giro calórico. Aproveite.", kcal: "−350 kcal/dia", approach: "Pré/pós-treino otimizados para recuperação rápida", color: "#7890ff" }, social: { name: "CUTTING PEAK", tagline: "Competição ou estética avançada.", kcal: "−400 kcal/dia", approach: "Manipulação de carboidratos + water balance", color: "#7890ff" }, knowledge: { name: "CUTTING ELITE", tagline: "NutriSync sincroniza treino e nutrição em tempo real.", kcal: "−300 kcal/dia", approach: "Integração total entre agenda de treinos e plano alimentar", color: "#7890ff" } },
  },
};

// Fallback protocol for any combo
const DEFAULT_PROTOCOL = { name: "PROTOCOLO NUTRION", tagline: "Personalizado para você, ajustado todo dia.", kcal: "Calculado via MCE", approach: "IA comportamental + periodização + cronobiologia", color: "#00f0b4" };

function getProtocol(answers: Record<string, string>) {
  try {
    return PROTOCOLS[answers.goal]?.[answers.training]?.[answers.block] ?? DEFAULT_PROTOCOL;
  } catch { return DEFAULT_PROTOCOL; }
}

const LandingInteractiveQuiz = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<"quiz" | "calculating" | "result">("quiz");
  const [dots, setDots] = useState(0);

  const handleSelect = (value: string) => {
    setSelected(value);
    const newAnswers = { ...answers, [QUESTIONS[currentQ].id]: value };
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQ((q) => q + 1);
        setSelected(null);
      }, 380);
    } else {
      // Last question — start calculating
      setTimeout(() => {
        setPhase("calculating");
        let d = 0;
        const dotTimer = setInterval(() => { d = (d + 1) % 4; setDots(d); }, 380);
        setTimeout(() => {
          clearInterval(dotTimer);
          setPhase("result");
        }, 2600);
      }, 400);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers({});
    setSelected(null);
    setPhase("quiz");
    setDots(0);
  };

  const protocol = getProtocol(answers);
  const progress = phase === "result" ? 100 : phase === "calculating" ? 100 : ((currentQ) / QUESTIONS.length) * 100;

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-[100px] overflow-hidden"
      style={{ background: "linear-gradient(180deg, #03030a 0%, #060614 60%, #03030a 100%)" }}
    >
      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,240,180,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,180,.02) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="max-w-[640px] mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-px bg-[#00f0b4]/40" />
            <span className="font-mono text-[.58rem] text-[#00f0b4]/60 tracking-[.28em] uppercase">Diagnóstico de protocolo</span>
          </div>
          <h2
            className="font-heading leading-[.9] mb-3"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
          >
            <span className="text-[#f0edf8]">QUAL PROTOCOLO</span>
            <br />
            <span style={{ color: "#e8a020", textShadow: "0 0 30px rgba(232,160,32,.3)" }}>É O SEU?</span>
          </h2>
          <p className="font-landing text-[.85rem] text-[#60607a]">
            3 perguntas. Resposta em tempo real. Protocolo calibrado para você.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative overflow-hidden"
          style={{
            background: "rgba(6,6,20,.95)",
            border: "1px solid rgba(0,240,180,.08)",
            borderRadius: "2px",
          }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,240,180,.4), rgba(232,160,32,.3), transparent)" }}
          />

          {/* Progress bar */}
          <div className="px-6 pt-5 pb-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[.46rem] text-[#30306a] tracking-[.15em] uppercase">
                {phase === "result" ? "Protocolo identificado" : phase === "calculating" ? "Calculando..." : `Pergunta ${currentQ + 1} de ${QUESTIONS.length}`}
              </span>
              <span className="font-mono text-[.46rem] text-[#30306a]">{Math.round(progress)}%</span>
            </div>
            <div className="h-[2px] w-full bg-white/[.04] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ background: "linear-gradient(90deg, #00f0b4, #e8a020)" }}
              />
            </div>
          </div>

          <div className="p-6 pt-5 min-h-[340px] flex flex-col">
            <AnimatePresence mode="wait">

              {/* Quiz phase */}
              {phase === "quiz" && (
                <motion.div
                  key={`q-${currentQ}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col flex-1"
                >
                  <div className="mb-5">
                    <h3 className="font-heading text-[1.15rem] text-[#f0edf8] leading-tight mb-1.5">
                      {QUESTIONS[currentQ].question}
                    </h3>
                    <p className="font-mono text-[.52rem] text-[#40406a] tracking-[.1em]">
                      {QUESTIONS[currentQ].sub}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 flex-1">
                    {QUESTIONS[currentQ].options.map((opt) => (
                      <motion.button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative text-left p-3.5 transition-all duration-200 group"
                        style={{
                          background: selected === opt.value
                            ? "rgba(0,240,180,.08)"
                            : "rgba(255,255,255,.02)",
                          border: selected === opt.value
                            ? "1px solid rgba(0,240,180,.3)"
                            : "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        <div className="font-heading text-[1rem] mb-1 text-[#00f0b4]/60 group-hover:text-[#00f0b4]/80 transition-colors">
                          {opt.icon}
                        </div>
                        <div className="font-heading text-[.85rem] text-[#f0edf8] mb-0.5">{opt.label}</div>
                        <div className="font-landing text-[.65rem] text-[#40405a] leading-[1.4]">{opt.desc}</div>
                        {selected === opt.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(0,240,180,.15)", border: "1px solid rgba(0,240,180,.4)" }}
                          >
                            <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                              <path d="M1 3L2.8 4.8L6 1.2" stroke="#00f0b4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Steps indicator */}
                  <div className="flex justify-center gap-2 mt-5">
                    {QUESTIONS.map((_, i) => (
                      <div key={i} className="w-6 h-[2px] rounded-full transition-all duration-300"
                        style={{ background: i < currentQ ? "rgba(0,240,180,.5)" : i === currentQ ? "rgba(0,240,180,.9)" : "rgba(255,255,255,.08)" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Calculating phase */}
              {phase === "calculating" && (
                <motion.div
                  key="calculating"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 flex flex-col items-center justify-center gap-6"
                >
                  {/* Animated scanner */}
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                      <circle cx="40" cy="40" r="36" stroke="rgba(0,240,180,.08)" strokeWidth="1" />
                      <circle cx="40" cy="40" r="28" stroke="rgba(0,240,180,.06)" strokeWidth="1" />
                      {/* Rotating arc */}
                      <motion.circle
                        cx="40" cy="40" r="36"
                        stroke="rgba(0,240,180,.6)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="30 196"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
                        style={{ transformOrigin: "40px 40px" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-heading text-[1.4rem] text-[#00f0b4]">MCE</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="font-mono text-[.6rem] text-[#00f0b4]/70 tracking-[.2em] uppercase mb-2">
                      Motor MCE processando
                      {".".repeat(dots + 1)}
                    </div>
                    <div className="space-y-1.5">
                      {["Analisando objetivo", "Calculando TDEE", "Mapeando obstáculos", "Selecionando protocolo"].map((txt, i) => (
                        <motion.div
                          key={txt}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.5, duration: 0.3 }}
                          className="flex items-center gap-2 justify-center"
                        >
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full"
                            animate={{ background: ["rgba(0,240,180,.3)", "rgba(0,240,180,.9)", "rgba(0,240,180,.3)"] }}
                            transition={{ duration: 1, delay: i * 0.5, repeat: Infinity }}
                          />
                          <span className="font-mono text-[.5rem] text-[#30305a] tracking-[.08em]">{txt}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Result phase */}
              {phase === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Protocol card */}
                  <div
                    className="relative p-5 mb-5 overflow-hidden"
                    style={{
                      background: `${protocol.color}08`,
                      border: `1px solid ${protocol.color}25`,
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[1px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${protocol.color}60, transparent)` }}
                    />
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-mono text-[.46rem] tracking-[.2em] uppercase mb-1.5" style={{ color: `${protocol.color}70` }}>
                          Protocolo identificado
                        </div>
                        <div className="font-heading text-[1.3rem] leading-tight" style={{ color: protocol.color }}>
                          {protocol.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-heading text-[.9rem]" style={{ color: `${protocol.color}80` }}>{protocol.kcal}</div>
                        <div className="font-mono text-[.42rem] text-[#30306a] mt-0.5">meta calórica</div>
                      </div>
                    </div>
                    <p className="font-landing text-[.78rem] italic mb-3" style={{ color: `${protocol.color}90` }}>
                      "{protocol.tagline}"
                    </p>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: protocol.color }} />
                      <p className="font-landing text-[.72rem] text-[#7070a0] leading-[1.6]">{protocol.approach}</p>
                    </div>
                  </div>

                  {/* Included features */}
                  <div className="flex flex-col gap-2 mb-5">
                    {[
                      "IA MCE calibrada para seu objetivo",
                      "Termômetro emocional + alertas comportamentais",
                      "NutriSync sincronizado com seus treinos",
                      "Relatório semanal de aderência e evolução",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(0,240,180,.08)", border: "1px solid rgba(0,240,180,.2)" }}>
                          <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                            <path d="M1 3L2.8 4.8L6 1.2" stroke="#00f0b4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="font-landing text-[.72rem] text-[#6060a0]">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.a
                    href="#planos"
                    className="block text-center py-4 font-heading tracking-[.1em] text-[1rem] relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(0,240,180,.12), rgba(232,160,32,.08))",
                      border: "1px solid rgba(0,240,180,.25)",
                      color: "#00f0b4",
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ATIVAR {protocol.name} AGORA
                    <span className="ml-2 text-[#e8a020]">→</span>
                  </motion.a>

                  <button
                    onClick={reset}
                    className="mt-3 text-center font-mono text-[.48rem] text-[#28285a] hover:text-[#40407a] tracking-[.12em] uppercase transition-colors"
                  >
                    Refazer diagnóstico
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingInteractiveQuiz;
