import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight, Check } from "lucide-react";

/* ── Question Data ── */
const QUESTIONS = [
  {
    label: "SUA MAIOR TRAVA",
    question: "Onde você trava toda vez que tenta?",
    sub: "Seja honesto. É exatamente isso que o NutriON vai resolver.",
    options: [
      { key: "ciclo", icon: "🔄", headline: "Começo bem e largo tudo", desc: "2 semanas de foco, depois vem o sabotador. Todo mês recomeça do zero.", stat: "68% dos usuários" },
      { key: "planalto", icon: "📉", headline: "Treino certo e o corpo não muda", desc: "Horas na academia. Dieta ok. O shape continua igual.", stat: "Planalto metabólico" },
      { key: "paralisia", icon: "🤯", headline: "Não sei o que comer", desc: "YouTube, coach, Instagram — cada um diz uma coisa. Resultado nenhum.", stat: "Paralisia de análise" },
      { key: "tempo", icon: "⏱", headline: "Sem tempo para calcular nada", desc: "Rotina pesada. O plano perfeito existe mas não consegue executar.", stat: "Rotina agressiva" },
    ],
  },
  {
    label: "SEU HISTÓRICO",
    question: "Você já tentou antes e não funcionou?",
    sub: "Isso determina qual intensidade de protocolo funciona para você.",
    options: [
      { key: "yoyo", icon: "💀", headline: "Sim — várias vezes já tentei", desc: "Low carb, intermittent fasting, shakes... Nada durou mais de 1 mês.", stat: "Ciclo dieta-yo-yo" },
      { key: "errado", icon: "🪞", headline: "Sim — tentei mas não vi resultado", desc: "Fiz tudo certo, mas os números nunca mudaram.", stat: "Protocolo errado" },
      { key: "desmoronou", icon: "🏗", headline: "Sim — perdi sem ter sistema", desc: "Cheguei longe mas quando a vida ficou corrida, desmoronou.", stat: "Sem sustentação" },
      { key: "primeiro", icon: "🎯", headline: "Não — quero fazer certo dessa vez", desc: "Cansou de improvisar. Dessa vez quer um sistema real com IA.", stat: "Primeiro protocolo" },
    ],
  },
  {
    label: "SEU PRAZO",
    question: "Em quanto tempo quer ver resultado no espelho?",
    sub: "Isso calibra a intensidade do protocolo. Seja realista.",
    options: [
      { key: "30d", icon: "⚡", headline: "30 dias — quero sentir a diferença", desc: "Roupas mais folgadas, barriga menos inchada. Em 30 dias é possível.", stat: "Resultado imediato" },
      { key: "90d", icon: "🔥", headline: "90 dias — quero uma transformação real", desc: "Shape notavelmente diferente. Fotos de antes e depois reais.", stat: "Transformação sólida" },
      { key: "180d", icon: "🏆", headline: "6 meses — quero o shape dos sonhos", desc: "Mudança profunda e sustentável. Sem pressa, mas sem parar.", stat: "Elite physique" },
      { key: "forever", icon: "♾", headline: "Sem prazo — quero mudar de vez", desc: "Chega de ciclo de dieta. Quer estilo de vida que funcione para sempre.", stat: "Mudança permanente" },
    ],
  },
];

/* ── Computing Steps ── */
const COMPUTE_STEPS = [
  "Analisando padrão de sabotagem",
  "Calculando taxa metabólica basal",
  "Mapeando histórico de aderência",
  "Selecionando protocolo personalizado",
  "Calibrando projeção de 90 dias",
];

/* ── Protocol Logic ── */
interface Protocol {
  name: string;
  tagline: string;
  color: string;
  proj30: string;
  proj90: string;
  proj180: string;
  testimonial: { name: string; age: number; city: string; badge: string; quote: string };
}

const TESTIMONIALS: Record<string, Protocol["testimonial"]> = {
  ciclo: { name: "Rafael M.", age: 31, city: "São Paulo", badge: "−13kg em 96 dias", quote: "Eu era o rei do 'segunda eu começo'. O protocolo âncora quebrou esse ciclo — pela primeira vez passei de 30 dias sem largar." },
  planalto: { name: "Camila S.", age: 28, city: "Curitiba", badge: "−8kg + definição", quote: "Treinava 5x por semana e nada mudava. A IA recalculou meus macros e em 60 dias eu finalmente vi abs." },
  paralisia: { name: "Bruno T.", age: 34, city: "Belo Horizonte", badge: "−11kg em 84 dias", quote: "Parei de pesquisar no Google e comecei a seguir UM protocolo. A diferença foi absurda." },
  tempo: { name: "Juliana R.", age: 26, city: "Rio de Janeiro", badge: "+6% massa magra", quote: "Trabalho 12h por dia. O app me diz exatamente o que comer em 10 segundos. Sem desculpa." },
};

function computeProtocol(answers: string[]): Protocol {
  const [pain] = answers;
  const base = {
    ciclo: { name: "PROTOCOLO ÂNCORA", tagline: "Sistema anti-sabotagem com checkpoints semanais que impedem o ciclo de recomeço.", color: "text-[#00f0b4]", proj30: "−2 a 3kg + hábito consolidado", proj90: "−8 a 12kg + consistência real", proj180: "−15 a 20kg + novo baseline" },
    planalto: { name: "PROTOCOLO DESBLOQUEIO", tagline: "Periodização calórica inteligente que quebra o planalto metabólico de vez.", color: "text-[#e8a020]", proj30: "−1.5kg + quebra de planalto", proj90: "−6 a 9kg + recomposição visível", proj180: "−12 a 16kg + shape definido" },
    paralisia: { name: "PROTOCOLO DECISÃO ZERO", tagline: "IA decide por você. Zero análise, 100% execução. Cada refeição pronta.", color: "text-[#7890ff]", proj30: "−2kg + rotina instalada", proj90: "−7 a 10kg + autonomia nutricional", proj180: "−14 a 18kg + domínio total" },
    tempo: { name: "PROTOCOLO FLASH", tagline: "Plano de execução em 10 segundos. Foto→calorias. Sem cálculo, sem perda de tempo.", color: "text-[#ff4466]", proj30: "−1.5 a 2.5kg + rotina otimizada", proj90: "−6 a 8kg + ganho de tempo real", proj180: "−12 a 15kg + eficiência máxima" },
  };
  const p = base[pain as keyof typeof base] || base.ciclo;
  return { ...p, testimonial: TESTIMONIALS[pain as keyof typeof TESTIMONIALS] || TESTIMONIALS.ciclo };
}

/* ── Component ── */
const LandingInteractiveQuiz = () => {
  const [step, setStep] = useState(0); // 0-2 questions, 3 computing, 4 result
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<Protocol | null>(null);
  const [computeStep, setComputeStep] = useState(0);

  const handleAnswer = (key: string) => {
    const next = [...answers, key];
    setAnswers(next);
    if (step < 2) {
      setStep(step + 1);
    } else {
      setStep(3);
      setComputeStep(0);
    }
  };

  // Computing animation
  useEffect(() => {
    if (step !== 3) return;
    if (computeStep < COMPUTE_STEPS.length) {
      const t = setTimeout(() => setComputeStep((s) => s + 1), computeStep === COMPUTE_STEPS.length - 1 ? 1200 : 700);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setResult(computeProtocol(answers));
        setStep(4);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [step, computeStep, answers]);

  const reset = () => { setStep(0); setAnswers([]); setResult(null); setComputeStep(0); };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f0b4]/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00f0b4]/30 bg-[#00f0b4]/10 text-[#00f0b4] text-xs font-mono tracking-widest mb-4">
            <Zap className="w-3 h-3" /> DIAGNÓSTICO MCE
          </span>
          <h2 className="font-heading text-3xl md:text-5xl text-foreground tracking-wide">DESCUBRA O QUE ESTÁ TRAVANDO VOCÊ</h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base font-landing">3 perguntas. 30 segundos. Protocolo calibrado pela IA.</p>
        </motion.div>

        {/* Card */}
        <div className="relative rounded-xl border border-[#00f0b4]/[0.07] bg-[rgba(6,6,20,.96)] backdrop-blur-md p-5 md:p-8 min-h-[380px] flex flex-col justify-center">

          {/* Progress bar */}
          {step < 3 && (
            <div className="flex gap-2 mb-7">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i < step ? "bg-[#00f0b4]" : i === step ? "bg-[#00f0b4]/50" : "bg-border"}`} />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── QUESTIONS ── */}
            {step < 3 && (
              <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.28 }}>
                <span className="text-xs font-mono text-[#00f0b4] tracking-widest">{QUESTIONS[step].label}</span>
                <h3 className="text-xl md:text-2xl font-heading text-foreground mt-1 mb-1">{QUESTIONS[step].question}</h3>
                <p className="text-xs text-muted-foreground mb-5 font-landing">{QUESTIONS[step].sub}</p>

                <div className="flex flex-col gap-2.5">
                  {QUESTIONS[step].options.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleAnswer(opt.key)}
                      className="group relative flex items-start gap-3.5 w-full px-4 py-3.5 rounded-xl border border-border/60 bg-secondary/30 hover:border-[#00f0b4]/40 hover:bg-[#00f0b4]/[0.06] transition-all text-left hover:translate-x-[3px]"
                    >
                      <span className="text-2xl mt-0.5 shrink-0">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-foreground group-hover:text-[#00f0b4] transition-colors block">{opt.headline}</span>
                        <span className="text-xs text-muted-foreground leading-relaxed block mt-0.5">{opt.desc}</span>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono text-[#00f0b4]/70 bg-[#00f0b4]/10 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">{opt.stat}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── COMPUTING ── */}
            {step === 3 && (
              <motion.div key="computing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 flex flex-col items-center gap-5">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-2 border-[#00f0b4]/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#00f0b4] animate-spin" />
                  <Zap className="absolute inset-0 m-auto w-5 h-5 text-[#00f0b4]" />
                </div>

                <div className="w-full max-w-xs flex flex-col gap-2.5">
                  {COMPUTE_STEPS.map((label, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={i <= computeStep ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2.5"
                    >
                      {i < computeStep ? (
                        <Check className="w-4 h-4 text-[#00f0b4] shrink-0" />
                      ) : i === computeStep ? (
                        <div className="w-4 h-4 rounded-full border-2 border-t-[#00f0b4] border-[#00f0b4]/30 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 shrink-0" />
                      )}
                      <span className={`text-xs font-mono ${i < computeStep ? "text-[#00f0b4]" : i === computeStep ? "text-foreground" : "text-muted-foreground/40"}`}>
                        {label}{i < computeStep && " ✓"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── RESULT ── */}
            {step === 4 && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                {/* Layer 1 — Protocol Card */}
                <div className="relative rounded-xl border border-[#00f0b4]/20 bg-gradient-to-br from-[#00f0b4]/10 to-transparent p-5 md:p-6 mb-5">
                  <span className="absolute top-3 right-3 text-[9px] font-mono tracking-widest text-[#00f0b4] bg-[#00f0b4]/10 border border-[#00f0b4]/20 px-2 py-0.5 rounded-full">IA CALIBRADA</span>
                  <span className="text-[10px] font-mono text-[#00f0b4]/70 tracking-widest">PROTOCOLO IDENTIFICADO</span>
                  <h3 className={`font-heading text-2xl md:text-3xl ${result.color} tracking-wide mt-1`}>{result.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-landing">{result.tagline}</p>
                </div>

                {/* Layer 2 — Projection Table */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {([
                    { label: "30 dias", value: result.proj30, highlight: false },
                    { label: "90 dias", value: result.proj90, highlight: true },
                    { label: "180 dias", value: result.proj180, highlight: false },
                  ] as const).map((col) => (
                    <div key={col.label} className={`rounded-lg p-3 text-center border ${col.highlight ? `border-[#00f0b4]/30 bg-[#00f0b4]/[0.08]` : "border-border/40 bg-secondary/20"}`}>
                      <span className={`text-[10px] font-mono tracking-wider ${col.highlight ? "text-[#00f0b4]" : "text-muted-foreground"}`}>{col.label}</span>
                      <p className={`text-xs font-bold mt-1.5 leading-snug ${col.highlight ? "text-foreground" : "text-muted-foreground"}`}>{col.value}</p>
                    </div>
                  ))}
                </div>

                {/* Layer 3 — Testimonial */}
                <div className="rounded-xl border border-border/40 bg-secondary/20 p-4 mb-5 flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full bg-[#00f0b4]/20 flex items-center justify-center text-[#00f0b4] font-bold text-sm shrink-0">
                    {result.testimonial.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground">{result.testimonial.name}</span>
                      <span className="text-[10px] text-muted-foreground">{result.testimonial.age} anos · {result.testimonial.city}</span>
                      <span className="text-[9px] font-mono text-[#00f0b4] bg-[#00f0b4]/10 px-1.5 py-0.5 rounded-full">{result.testimonial.badge}</span>
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-1.5 leading-relaxed">"{result.testimonial.quote}"</p>
                  </div>
                </div>

                {/* Layer 4 — Urgency + CTA */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0b4] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f0b4]" />
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">47 pessoas com perfil semelhante iniciaram esta semana</span>
                  </div>

                  <a
                    href="https://pay.kiwify.com.br/G8uxU9O"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#00f0b4] text-[#03030a] font-bold text-sm hover:bg-[#00f0b4]/90 transition-colors"
                  >
                    Quero meu protocolo de 90 dias <ChevronRight className="w-4 h-4" />
                  </a>

                  <button onClick={reset} className="block mx-auto mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                    Refazer diagnóstico
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default LandingInteractiveQuiz;
