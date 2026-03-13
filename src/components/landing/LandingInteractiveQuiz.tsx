import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight, Target, Dumbbell, ShieldAlert } from "lucide-react";

const QUESTIONS = [
  {
    icon: Target,
    label: "OBJETIVO",
    question: "Qual é seu objetivo principal?",
    options: [
      { key: "emagrecer", label: "Emagrecer", emoji: "🔥" },
      { key: "definir", label: "Definição muscular", emoji: "💎" },
      { key: "hipertrofiar", label: "Hipertrofia", emoji: "💪" },
      { key: "saude", label: "Saúde geral", emoji: "🧬" },
    ],
  },
  {
    icon: Dumbbell,
    label: "TREINO",
    question: "Quantas vezes treina por semana?",
    options: [
      { key: "0-1", label: "0–1×", emoji: "🚶" },
      { key: "2-3", label: "2–3×", emoji: "🏃" },
      { key: "4-5", label: "4–5×", emoji: "⚡" },
      { key: "6+", label: "6+×", emoji: "🔥" },
    ],
  },
  {
    icon: ShieldAlert,
    label: "OBSTÁCULO",
    question: "Seu maior obstáculo hoje?",
    options: [
      { key: "consistencia", label: "Falta de consistência", emoji: "📉" },
      { key: "fome", label: "Fome / compulsão", emoji: "😤" },
      { key: "tempo", label: "Falta de tempo", emoji: "⏰" },
      { key: "conhecimento", label: "Não sei o que comer", emoji: "❓" },
    ],
  },
];

interface Protocol {
  name: string;
  kcal: string;
  approach: string;
  color: string;
  gradient: string;
}

function computeProtocol(answers: string[]): Protocol {
  const [goal, freq] = answers;
  const isHigh = freq === "4-5" || freq === "6+";

  if (goal === "emagrecer")
    return {
      name: "Déficit Inteligente",
      kcal: "1.600–1.900 kcal",
      approach: "Déficit moderado com proteína alta e ciclagem de carboidratos nos dias de treino.",
      color: "text-primary",
      gradient: "from-primary/20 to-primary/5",
    };
  if (goal === "definir")
    return {
      name: isHigh ? "Cut Atlético" : "Recomposição Corporal",
      kcal: isHigh ? "1.800–2.200 kcal" : "2.000–2.300 kcal",
      approach: "Periodização calórica com refeed semanal. Macros ajustados por fase de treino.",
      color: "text-accent",
      gradient: "from-accent/20 to-accent/5",
    };
  if (goal === "hipertrofiar")
    return {
      name: "Bulk Controlado",
      kcal: isHigh ? "2.800–3.400 kcal" : "2.400–2.800 kcal",
      approach: "Superávit progressivo com janela anabólica otimizada. Proteína ≥ 2g/kg.",
      color: "text-primary",
      gradient: "from-primary/20 to-primary/5",
    };
  return {
    name: "Protocolo Flexível",
    kcal: "2.000–2.400 kcal",
    approach: "Equilíbrio nutricional com foco em micronutrientes e longevidade metabólica.",
    color: "text-accent",
    gradient: "from-accent/20 to-accent/5",
  };
}

const LandingInteractiveQuiz = () => {
  const [step, setStep] = useState(0); // 0-2 = questions, 3 = computing, 4 = result
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<Protocol | null>(null);

  const handleAnswer = (key: string) => {
    const next = [...answers, key];
    setAnswers(next);

    if (step < 2) {
      setStep(step + 1);
    } else {
      // Show computing animation
      setStep(3);
      setTimeout(() => {
        setResult(computeProtocol(next));
        setStep(4);
      }, 2200);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono tracking-widest mb-4">
            <Zap className="w-3 h-3" /> MOTOR MCE
          </span>
          <h2 className="font-heading text-3xl md:text-5xl text-foreground tracking-wide">
            DESCUBRA SEU PROTOCOLO
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            3 perguntas. 10 segundos. Protocolo calculado pela IA.
          </p>
        </motion.div>

        {/* Quiz card */}
        <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-md p-6 md:p-10 min-h-[320px] flex flex-col justify-center">
          {/* Progress */}
          {step < 3 && (
            <div className="flex gap-2 mb-8">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    i < step
                      ? "bg-primary"
                      : i === step
                        ? "bg-primary/50"
                        : "bg-border"
                  }`}
                />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* QUESTIONS */}
            {step < 3 && (
              <motion.div
                key={`q-${step}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const Icon = QUESTIONS[step].icon;
                    return <Icon className="w-4 h-4 text-primary" />;
                  })()}
                  <span className="text-xs font-mono text-primary tracking-widest">
                    {QUESTIONS[step].label}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                  {QUESTIONS[step].question}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {QUESTIONS[step].options.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleAnswer(opt.key)}
                      className="group relative flex items-center gap-3 px-4 py-4 rounded-xl border border-border bg-secondary/50 hover:border-primary/50 hover:bg-primary/10 transition-all text-left"
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {opt.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* COMPUTING */}
            {step === 3 && (
              <motion.div
                key="computing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 gap-5"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
                  <Zap className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm text-primary tracking-widest">
                    MOTOR MCE CALCULANDO...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cruzando dados com 10 protocolos científicos
                  </p>
                </div>
              </motion.div>
            )}

            {/* RESULT */}
            {step === 4 && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono tracking-widest border border-primary/30 bg-primary/10 text-primary mb-4">
                  PROTOCOLO IDENTIFICADO
                </span>

                <div className={`rounded-xl border border-border bg-gradient-to-br ${result.gradient} p-6 md:p-8 mb-6`}>
                  <h3 className={`font-heading text-3xl md:text-4xl ${result.color} tracking-wide mb-2`}>
                    {result.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="font-mono text-lg text-foreground font-bold">{result.kcal}</span>
                    <span className="text-xs text-muted-foreground">/dia estimado</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                    {result.approach}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="#planos"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
                  >
                    ATIVAR PROTOCOLO <ChevronRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={reset}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    Refazer quiz
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
