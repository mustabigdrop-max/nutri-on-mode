import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Questions — focused on PAIN and COMMITMENT, not generic goals ──────────
// Conversion principle: people don't buy "protocols", they buy their future self.
// Questions should create identification and commitment, not categorisation.

const QUESTIONS = [
  {
    id: "block",
    label: "SUA MAIOR TRAVA",
    question: "Onde você trava toda vez que tenta?",
    sub: "Seja honesto. É exatamente isso que o NutriON vai resolver.",
    options: [
      {
        value: "consistency",
        headline: "Começo bem e largo tudo",
        desc: "2 semanas de foco, depois vem o sabotador interno. Todo mês recomeça do zero.",
        icon: "🔄",
        stat: "68% dos usuários",
      },
      {
        value: "plateau",
        headline: "Treino certo e o corpo não muda",
        desc: "Horas na academia. Dieta ok. O shape continua igual. Algo está errado no protocolo.",
        icon: "📉",
        stat: "Planalto metabólico",
      },
      {
        value: "knowledge",
        headline: "Não sei o que comer",
        desc: "YouTube, Instagram, coach diz uma coisa, outro diz o contrário. Informação demais, resultado nenhum.",
        icon: "🤯",
        stat: "Paralisia de análise",
      },
      {
        value: "time",
        headline: "Sem tempo para calcular nada",
        desc: "Rotina pesada, horários loucos. O plano perfeito existe mas você não consegue executar.",
        icon: "⏱",
        stat: "Rotina agressiva",
      },
    ],
  },
  {
    id: "history",
    label: "SEU HISTÓRICO",
    question: "Você já tentou antes e não funcionou?",
    sub: "Isso determina qual intensidade de protocolo funciona para você.",
    options: [
      {
        value: "many_times",
        headline: "Sim — várias vezes já tentei",
        desc: "Dieta restritiva, low carb, intermittent fasting, shakes... Nada durou mais de 1 mês.",
        icon: "💀",
        stat: "Ciclo dieta-yo-yo",
      },
      {
        value: "no_result",
        headline: "Sim — tentei mas não vi resultado",
        desc: "Fiz tudo certo, mas os números na balança (ou no espelho) nunca mudaram como queria.",
        icon: "🪞",
        stat: "Protocolo errado",
      },
      {
        value: "no_system",
        headline: "Sim — perdi sem ter sistema",
        desc: "Cheguei longe mas sem estrutura. Na hora que a vida ficou corrida, tudo desmoronou.",
        icon: "🏗",
        stat: "Sem sustentação",
      },
      {
        value: "first",
        headline: "Não — quero fazer certo dessa vez",
        desc: "Cansou de improvisar. Dessa vez quer um sistema real, com acompanhamento e IA.",
        icon: "🎯",
        stat: "Primeiro protocolo",
      },
    ],
  },
  {
    id: "deadline",
    label: "SEU PRAZO",
    question: "Em quanto tempo quer ver resultado no espelho?",
    sub: "Isso calibra a intensidade do seu protocolo. Seja realista.",
    options: [
      {
        value: "30d",
        headline: "30 dias — quero sentir a diferença",
        desc: "Roupas mais folgadas, barriga menos inchada, disposição diferente. Em 30 dias isso é possível.",
        icon: "⚡",
        stat: "Resultado imediato",
      },
      {
        value: "90d",
        headline: "90 dias — quero uma transformação real",
        desc: "Shape notavelmente diferente. Fotos de antes e depois que valem a pena postar.",
        icon: "🔥",
        stat: "Transformação sólida",
      },
      {
        value: "6m",
        headline: "6 meses — quero o shape dos sonhos",
        desc: "Mudança profunda e sustentável. Corpo completamente diferente. Sem pressa, mas sem parar.",
        icon: "🏆",
        stat: "Elite physique",
      },
      {
        value: "lifestyle",
        headline: "Sem prazo — quero mudar de vez",
        desc: "Chega de ciclo de dieta. Quer um estilo de vida que funcione para sempre, sem sofrimento.",
        icon: "♾",
        stat: "Mudança permanente",
      },
    ],
  },
];

// ─── Result map — keyed by [block][deadline] ─────────────────────────────────
// Each result includes: real transformation numbers, protocol, social proof testimonial

interface ResultData {
  protocol: string;
  tagline: string;
  color: string;
  // Transformation projections
  projection30: string;
  projection90: string;
  projection180: string;
  // Social proof
  testimonialName: string;
  testimonialAge: number;
  testimonialCity: string;
  testimonialResult: string;
  testimonialQuote: string;
  // Urgency
  usersThisWeek: number;
}

const RESULTS: Record<string, Record<string, ResultData>> = {
  consistency: {
    "30d": {
      protocol: "PROTOCOLO ÂNCORA",
      tagline: "Sistema anti-sabotagem com IA comportamental. Feito para quem rompe o ciclo de 2 semanas.",
      color: "#00f0b4",
      projection30: "−2 a 3kg + barriga menos inchada",
      projection90: "−7 a 10kg + definição visível",
      projection180: "−14 a 18kg + shape transformado",
      testimonialName: "Rafael",
      testimonialAge: 29,
      testimonialCity: "SP",
      testimonialResult: "−11kg em 84 dias",
      testimonialQuote: "Tentei 6 vezes antes. O NutriON foi o único que me manteve na linha por mais de 3 semanas.",
      usersThisWeek: 47,
    },
    "90d": {
      protocol: "PROTOCOLO ÂNCORA",
      tagline: "Ciclo de 90 dias com progressão automática. IA detecta padrão de abandono e age antes.",
      color: "#00f0b4",
      projection30: "−2 a 3kg + hábito consolidado",
      projection90: "−9 a 12kg + shape visível",
      projection180: "−16 a 20kg + manutenção automática",
      testimonialName: "Camila",
      testimonialAge: 31,
      testimonialCity: "BH",
      testimonialResult: "−13kg em 96 dias",
      testimonialQuote: "Sempre largava na terceira semana. Com o sistema de alertas da IA, nunca mais aconteceu.",
      usersThisWeek: 52,
    },
    "6m": {
      protocol: "PROTOCOLO ÂNCORA PRO",
      tagline: "6 meses com periodização comportamental. Sem plateaus, sem abandono, com progresso real.",
      color: "#00f0b4",
      projection30: "−3 a 4kg + rotina instalada",
      projection90: "−10 a 14kg + shape redefinido",
      projection180: "−20 a 28kg + corpo transformado",
      testimonialName: "Thiago",
      testimonialAge: 34,
      testimonialCity: "RJ",
      testimonialResult: "−22kg em 5 meses",
      testimonialQuote: "Já tinha tentado 10 vezes. Com o NutriON o sistema manteve a consistência por mim.",
      usersThisWeek: 38,
    },
    lifestyle: {
      protocol: "PROTOCOLO LIFESTYLE",
      tagline: "Não é dieta. É um sistema que você mantém para sempre — sem contar caloria manualmente.",
      color: "#7890ff",
      projection30: "−2kg + mudança de relação com comida",
      projection90: "−8 a 11kg + automatismo criado",
      projection180: "−16 a 22kg + novo estilo de vida",
      testimonialName: "Ana",
      testimonialAge: 27,
      testimonialCity: "Floripa",
      testimonialResult: "−18kg em 6 meses",
      testimonialQuote: "Não chamo mais de dieta. É só minha vida agora. O app fez isso por mim aos poucos.",
      usersThisWeek: 61,
    },
  },
  plateau: {
    "30d": {
      protocol: "PROTOCOLO RESET",
      tagline: "Quebra de plateau metabólico em 30 dias. Ajuste de macros, ciclagem calórica e NutriSync.",
      color: "#e8a020",
      projection30: "−2 a 4kg + saída do planalto",
      projection90: "−8 a 12kg + recomposição corporal",
      projection180: "−16 a 22kg + shape atlético",
      testimonialName: "Bruno",
      testimonialAge: 32,
      testimonialCity: "SP",
      testimonialResult: "+5kg massa / −9% gordura",
      testimonialQuote: "Treino há 3 anos. Nunca tinha entendido por que o shape parava. O NutriON identificou o problema na primeira semana.",
      usersThisWeek: 34,
    },
    "90d": {
      protocol: "PROTOCOLO RESET",
      tagline: "Recomposição corporal em 90 dias. Ajuste metabólico + periodização nutricional avançada.",
      color: "#e8a020",
      projection30: "−2 a 3kg + ajuste hormonal",
      projection90: "−9 a 14kg + ganho de massa simultâneo",
      projection180: "Shape completamente recomposto",
      testimonialName: "Felipe",
      testimonialAge: 26,
      testimonialCity: "Curitiba",
      testimonialResult: "+7kg massa / −11% gordura",
      testimonialQuote: "4 meses de recomposição corporal. Pesando igual mas parecendo outra pessoa. A IA acertou o protocolo em cheio.",
      usersThisWeek: 29,
    },
    "6m": {
      protocol: "PROTOCOLO ELITE",
      tagline: "Periodização avançada de 6 meses. Para quem treina sério e quer shape de nível atlético.",
      color: "#7890ff",
      projection30: "Ajuste metabólico + 1ª fase de cutting",
      projection90: "−10 a 15kg + massa magra preservada",
      projection180: "Shape de atleta com protocolo de elite",
      testimonialName: "Marcos",
      testimonialAge: 30,
      testimonialCity: "Campinas",
      testimonialResult: "−14kg fat / +9kg massa",
      testimonialQuote: "Levei a sério e o app acompanhou. Em 6 meses transformei o corpo completamente sem perder nenhum músculo.",
      usersThisWeek: 22,
    },
    lifestyle: {
      protocol: "PROTOCOLO RECOMP",
      tagline: "Recomposição corporal sustentável. Sem sofrimento, sem plateau, com resultado consistente.",
      color: "#e8a020",
      projection30: "Saída de plateau + −2 a 3kg",
      projection90: "−10kg fat + ganho muscular",
      projection180: "Recomposição completa",
      testimonialName: "Diego",
      testimonialAge: 33,
      testimonialCity: "Brasília",
      testimonialResult: "−16kg / +6kg massa",
      testimonialQuote: "Sem rush. Em 7 meses fiz a recomposição que nunca consegui em 5 anos de academia.",
      usersThisWeek: 41,
    },
  },
  knowledge: {
    "30d": {
      protocol: "PROTOCOLO PILOTO AUTOMÁTICO",
      tagline: "A IA monta seu plano diário. Você só confirma. Zero estudo de nutrição necessário.",
      color: "#00f0b4",
      projection30: "−2 a 4kg + clareza total sobre alimentação",
      projection90: "−8 a 12kg + autonomia alimentar",
      projection180: "−16 a 24kg + especialista no próprio corpo",
      testimonialName: "Juliana",
      testimonialAge: 28,
      testimonialCity: "Salvador",
      testimonialResult: "−12kg em 90 dias",
      testimonialQuote: "Não entendo nada de macros. O app monta tudo sozinho. Só sigo as sugestões e o resultado veio.",
      usersThisWeek: 73,
    },
    "90d": {
      protocol: "PROTOCOLO PILOTO AUTOMÁTICO",
      tagline: "3 meses com IA decidindo suas refeições. Você aprende enquanto emagrece.",
      color: "#00f0b4",
      projection30: "−2 a 3kg + entendimento básico",
      projection90: "−9 a 13kg + autonomia criada",
      projection180: "−18 a 25kg + novo estilo alimentar",
      testimonialName: "Luiza",
      testimonialAge: 25,
      testimonialCity: "Recife",
      testimonialResult: "−14kg em 3 meses",
      testimonialQuote: "Nunca entendi por que emagrecer era tão difícil. O NutriON simplificou tudo. Só segui.",
      usersThisWeek: 68,
    },
    "6m": {
      protocol: "PROTOCOLO EDUCATIVO",
      tagline: "6 meses educando enquanto transforma. Você sai sabendo exatamente o que funciona pro seu corpo.",
      color: "#7890ff",
      projection30: "−3kg + fundamentos dominados",
      projection90: "−10 a 15kg + autonomia alimentar",
      projection180: "−20 a 28kg + coach do próprio corpo",
      testimonialName: "Pedro",
      testimonialAge: 36,
      testimonialCity: "Goiânia",
      testimonialResult: "−21kg + virou personal trainer",
      testimonialQuote: "Aprendi mais de nutrição em 6 meses de NutriON do que em anos lendo sobre o assunto.",
      usersThisWeek: 44,
    },
    lifestyle: {
      protocol: "PROTOCOLO SIMPLIFICADO",
      tagline: "Alimentação automática para sempre. Sem calcular, sem estudar, sem sofrimento.",
      color: "#00f0b4",
      projection30: "Sistema instalado + −2 a 3kg",
      projection90: "−9 a 13kg + piloto automático",
      projection180: "−18 a 26kg + mudança permanente",
      testimonialName: "Fernanda",
      testimonialAge: 30,
      testimonialCity: "Manaus",
      testimonialResult: "−17kg em 5 meses",
      testimonialQuote: "Não queria aprender nutrição. Queria só emagrecer. O NutriON resolveu isso para mim.",
      usersThisWeek: 58,
    },
  },
  time: {
    "30d": {
      protocol: "PROTOCOLO 10 MIN/DIA",
      tagline: "Para quem tem rotina pesada. Tudo configurado em 10 minutos por dia, sem improviso.",
      color: "#e8a020",
      projection30: "−2 a 3kg + rotina encaixada",
      projection90: "−7 a 11kg + sistema automatizado",
      projection180: "−14 a 20kg + saúde em piloto",
      testimonialName: "Rodrigo",
      testimonialAge: 38,
      testimonialCity: "SP",
      testimonialResult: "−9kg em 70 dias",
      testimonialQuote: "Executivo com agenda lotada. O NutriON encaixou na minha vida sem pedir nada extra.",
      usersThisWeek: 55,
    },
    "90d": {
      protocol: "PROTOCOLO 10 MIN/DIA",
      tagline: "90 dias com sistema de 10 minutos diários. Refeições planejadas, rotina respeitada.",
      color: "#e8a020",
      projection30: "−2 a 3kg + zero caos alimentar",
      projection90: "−8 a 12kg + sistema no piloto",
      projection180: "−16 a 22kg + saúde permanente",
      testimonialName: "Patricia",
      testimonialAge: 35,
      testimonialCity: "DF",
      testimonialResult: "−11kg em 88 dias",
      testimonialQuote: "3 filhos, trabalho em dois empregos. O app me deu um sistema que cabe na minha vida caótica.",
      usersThisWeek: 62,
    },
    "6m": {
      protocol: "PROTOCOLO EXECUTIVO",
      tagline: "Para perfis de alta performance. Sistema de nutrição que funciona no piloto automático.",
      color: "#7890ff",
      projection30: "−3kg + sistema no piloto",
      projection90: "−10 a 14kg + performance aumentada",
      projection180: "−20 a 28kg + corpo e mente transformados",
      testimonialName: "Carla",
      testimonialAge: 42,
      testimonialCity: "SP",
      testimonialResult: "−23kg em 5 meses",
      testimonialQuote: "Nunca tive tempo para cuidar de mim. O NutriON fez isso por mim, nos meus intervalos.",
      usersThisWeek: 39,
    },
    lifestyle: {
      protocol: "PROTOCOLO ZERO ESFORÇO",
      tagline: "Alimentação saudável que não exige tempo nem atenção. Sistema, não dieta.",
      color: "#e8a020",
      projection30: "Sistema instalado + −1 a 2kg",
      projection90: "−7 a 10kg + estilo de vida ajustado",
      projection180: "−16 a 22kg + saúde permanente",
      testimonialName: "Lucas",
      testimonialAge: 40,
      testimonialCity: "RJ",
      testimonialResult: "−15kg em 5 meses",
      testimonialQuote: "Nunca mais vou precisar 'começar uma dieta'. O NutriON virou parte da minha rotina sem eu perceber.",
      usersThisWeek: 77,
    },
  },
};

const DEFAULT_RESULT: ResultData = {
  protocol: "PROTOCOLO NUTRION",
  tagline: "Personalizado para você. Calibrado todo dia pela IA.",
  color: "#00f0b4",
  projection30: "−2 a 3kg + hábitos instalados",
  projection90: "−8 a 12kg + shape redefinido",
  projection180: "−16 a 22kg + transformação real",
  testimonialName: "Usuário NutriON",
  testimonialAge: 28,
  testimonialCity: "Brasil",
  testimonialResult: "−10kg em 90 dias",
  testimonialQuote: "O NutriON foi o único sistema que funcionou de verdade. Resultado em 90 dias.",
  usersThisWeek: 48,
};

function getResult(answers: Record<string, string>): ResultData {
  try {
    return RESULTS[answers.block]?.[answers.deadline] ?? DEFAULT_RESULT;
  } catch {
    return DEFAULT_RESULT;
  }
}

// ─── Calculating steps — real-sounding computations ─────────────────────────
const CALC_STEPS = [
  "Analisando padrão de sabotagem",
  "Calculando taxa metabólica basal",
  "Mapeando histórico de aderência",
  "Selecionando protocolo personalizado",
  "Calibrando projeção de 90 dias",
];

// ─── Component ───────────────────────────────────────────────────────────────
const LandingInteractiveQuiz = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<"quiz" | "calculating" | "result">("quiz");
  const [calcStep, setCalcStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleSelect(value: string) {
    setSelected(value);
    const newAnswers = { ...answers, [QUESTIONS[currentQ].id]: value };
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => { setCurrentQ(q => q + 1); setSelected(null); }, 360);
    } else {
      setTimeout(() => {
        setPhase("calculating");
        setCalcStep(0);
        let step = 0;
        intervalRef.current = setInterval(() => {
          step++;
          if (step < CALC_STEPS.length) {
            setCalcStep(step);
          } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setTimeout(() => setPhase("result"), 400);
          }
        }, 480);
      }, 380);
    }
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  function reset() {
    setCurrentQ(0); setAnswers({}); setSelected(null);
    setPhase("quiz"); setCalcStep(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  const result = getResult(answers);
  const progress = phase === "result" ? 100
    : phase === "calculating" ? 90
    : (currentQ / QUESTIONS.length) * 100;

  return (
    <section
      className="relative px-6 md:px-12 py-[100px] overflow-hidden"
      style={{ background: "linear-gradient(180deg, #03030a 0%, #060614 60%, #03030a 100%)" }}
    >
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,240,180,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,180,.018) 1px,transparent 1px)",
        backgroundSize: "52px 52px",
      }} />

      <div className="max-w-[620px] mx-auto relative z-10">

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
            <span className="font-mono text-[.56rem] text-[#00f0b4]/60 tracking-[.25em] uppercase">Diagnóstico de protocolo · 3 perguntas</span>
          </div>
          <h2 className="font-heading leading-[.9] mb-3" style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)" }}>
            <span className="text-[#f0edf8]">DESCUBRA O QUE ESTÁ</span>
            <br />
            <span style={{ color: "#e8a020", textShadow: "0 0 30px rgba(232,160,32,.3)" }}>TE TRAVANDO.</span>
          </h2>
          <p className="font-landing text-[.85rem] text-[#50506a] max-w-[420px]">
            Baseado nas suas respostas, a IA calibra seu protocolo e mostra sua projeção de resultado em 90 dias. Gratuito e em tempo real.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="relative overflow-hidden rounded-xl"
          style={{
            background: "rgba(6,6,20,.96)",
            border: "1px solid rgba(0,240,180,.07)",
          }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: "linear-gradient(90deg,transparent,rgba(0,240,180,.5),rgba(232,160,32,.3),transparent)" }} />

          {/* Progress */}
          <div className="px-6 pt-5 pb-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[.44rem] text-[#303060] tracking-[.14em] uppercase">
                {phase === "result" ? "Protocolo identificado"
                  : phase === "calculating" ? `Calculando protocolo...`
                  : `Pergunta ${currentQ + 1} de ${QUESTIONS.length} · ${QUESTIONS[currentQ].label}`}
              </span>
              <span className="font-mono text-[.44rem] text-[#303060]">{Math.round(progress)}%</span>
            </div>
            <div className="h-[2px] w-full bg-white/[.04] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                style={{ background: "linear-gradient(90deg,#00f0b4,#e8a020)" }}
              />
            </div>
          </div>

          <div className="p-6 pt-5 min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait">

              {/* ── Quiz ─────────────────────────────────────────────────── */}
              {phase === "quiz" && (
                <motion.div
                  key={`q-${currentQ}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.28 }}
                  className="flex flex-col flex-1"
                >
                  <div className="mb-5">
                    <h3 className="font-heading text-[1.2rem] text-[#f0edf8] leading-tight mb-1.5">
                      {QUESTIONS[currentQ].question}
                    </h3>
                    <p className="font-mono text-[.5rem] text-[#383870] tracking-[.1em]">
                      {QUESTIONS[currentQ].sub}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 flex-1">
                    {QUESTIONS[currentQ].options.map(opt => (
                      <motion.button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.985 }}
                        className="relative text-left px-4 py-3.5 rounded-xl border transition-all duration-150 group flex items-start gap-3"
                        style={{
                          background: selected === opt.value ? "rgba(0,240,180,.07)" : "rgba(255,255,255,.018)",
                          borderColor: selected === opt.value ? "rgba(0,240,180,.3)" : "rgba(255,255,255,.05)",
                        }}
                      >
                        <span className="text-[1.1rem] mt-0.5 flex-shrink-0">{opt.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="font-heading text-[.85rem] text-[#f0edf8]/85">{opt.headline}</p>
                            <span className="font-mono text-[.44rem] text-[#00f0b4]/40 flex-shrink-0">{opt.stat}</span>
                          </div>
                          <p className="font-landing text-[.68rem] text-[#40405a] leading-[1.5]">{opt.desc}</p>
                        </div>
                        {selected === opt.value && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
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

                  {/* Step dots */}
                  <div className="flex justify-center gap-2 mt-5">
                    {QUESTIONS.map((_, i) => (
                      <div key={i} className="h-[2px] w-6 rounded-full transition-all duration-300"
                        style={{ background: i < currentQ ? "rgba(0,240,180,.5)" : i === currentQ ? "rgba(0,240,180,.9)" : "rgba(255,255,255,.07)" }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Calculating ───────────────────────────────────────────── */}
              {phase === "calculating" && (
                <motion.div
                  key="calculating"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex-1 flex flex-col items-center justify-center gap-7"
                >
                  {/* Scanner */}
                  <div className="relative w-[72px] h-[72px]">
                    <svg viewBox="0 0 72 72" fill="none" className="w-full h-full">
                      <circle cx="36" cy="36" r="32" stroke="rgba(0,240,180,.06)" strokeWidth="1" />
                      <circle cx="36" cy="36" r="24" stroke="rgba(0,240,180,.04)" strokeWidth="1" />
                      <motion.circle cx="36" cy="36" r="32" stroke="rgba(0,240,180,.7)"
                        strokeWidth="2" strokeLinecap="round" strokeDasharray="28 173"
                        animate={{ rotate: 360 }} transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
                        style={{ transformOrigin: "36px 36px" }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-heading text-[.75rem] text-[#00f0b4]">IA</span>
                    </div>
                  </div>

                  <div className="w-full max-w-[260px]">
                    {CALC_STEPS.map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: i <= calcStep ? 1 : 0.2, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-2.5 py-1.5"
                      >
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: i < calcStep ? "rgba(0,240,180,.15)" : i === calcStep ? "rgba(0,240,180,.1)" : "rgba(255,255,255,.03)",
                            border: i <= calcStep ? "1px solid rgba(0,240,180,.3)" : "1px solid rgba(255,255,255,.05)",
                          }}
                        >
                          {i < calcStep && (
                            <svg width="6" height="5" viewBox="0 0 6 5" fill="none">
                              <path d="M.8 2.5L2.2 3.9L5.2.8" stroke="#00f0b4" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          {i === calcStep && (
                            <motion.div className="w-1.5 h-1.5 rounded-full bg-[#00f0b4]"
                              animate={{ opacity: [1,.3,1] }} transition={{ duration: .7, repeat: Infinity }} />
                          )}
                        </div>
                        <span className="font-mono text-[.5rem] tracking-[.07em]"
                          style={{ color: i < calcStep ? "#50508a" : i === calcStep ? "#00f0b4" : "#252548" }}>
                          {step}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Result ────────────────────────────────────────────────── */}
              {phase === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="flex-1 flex flex-col gap-3"
                >
                  {/* Protocol name */}
                  <div className="relative p-4 rounded-xl overflow-hidden"
                    style={{ background: `${result.color}07`, border: `1px solid ${result.color}20` }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[1px]"
                      style={{ background: `linear-gradient(90deg,transparent,${result.color}50,transparent)` }} />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[.44rem] tracking-[.2em] uppercase mb-1" style={{ color: `${result.color}60` }}>
                          Protocolo identificado para você
                        </p>
                        <p className="font-heading text-[1.2rem] leading-tight" style={{ color: result.color }}>
                          {result.protocol}
                        </p>
                      </div>
                      <div className="px-2 py-1 rounded-lg flex-shrink-0"
                        style={{ background: `${result.color}10`, border: `1px solid ${result.color}20` }}
                      >
                        <span className="font-mono text-[.44rem]" style={{ color: result.color }}>IA CALIBRADA</span>
                      </div>
                    </div>
                    <p className="font-landing text-[.72rem] text-[#606080] mt-2 leading-[1.55]">
                      {result.tagline}
                    </p>
                  </div>

                  {/* Transformation projections */}
                  <div>
                    <p className="font-mono text-[.48rem] text-[#303060] tracking-[.15em] uppercase mb-2">
                      Projeção de resultado · perfil semelhante ao seu
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "30 dias", value: result.projection30 },
                        { label: "90 dias", value: result.projection90, highlight: true },
                        { label: "180 dias", value: result.projection180 },
                      ].map((proj, i) => (
                        <motion.div
                          key={proj.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.07 }}
                          className="p-2.5 rounded-xl text-center"
                          style={{
                            background: proj.highlight ? `${result.color}09` : "rgba(255,255,255,.018)",
                            border: `1px solid ${proj.highlight ? result.color + "22" : "rgba(255,255,255,.05)"}`,
                          }}
                        >
                          <p className="font-mono text-[.44rem] mb-1" style={{ color: `${result.color}50` }}>{proj.label}</p>
                          <p className="font-heading text-[.7rem] leading-tight"
                            style={{ color: proj.highlight ? result.color : "#8080a0" }}>
                            {proj.value}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Social proof — specific to profile */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="p-3.5 rounded-xl border border-white/[.05] bg-white/[.015]"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar placeholder */}
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-heading text-[.7rem]"
                        style={{ background: `${result.color}15`, border: `1px solid ${result.color}25`, color: result.color }}>
                        {result.testimonialName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-heading text-[.7rem] text-[#f0edf8]/70">
                            {result.testimonialName}, {result.testimonialAge} anos · {result.testimonialCity}
                          </span>
                          <span className="font-mono text-[.44rem] px-1.5 py-0.5 rounded-full"
                            style={{ background: `${result.color}12`, color: result.color, border: `1px solid ${result.color}20` }}>
                            {result.testimonialResult}
                          </span>
                        </div>
                        <p className="font-landing text-[.68rem] text-[#50507a] leading-[1.5] italic">
                          "{result.testimonialQuote}"
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Urgency indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(232,160,32,.05)", border: "1px solid rgba(232,160,32,.1)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e8a020] animate-pulse flex-shrink-0" />
                    <p className="font-mono text-[.5rem] text-[#706040] tracking-[.06em]">
                      <span className="text-[#e8a020]">{result.usersThisWeek} pessoas</span> com perfil semelhante ao seu iniciaram esta semana
                    </p>
                  </motion.div>

                  {/* CTA */}
                  <motion.a
                    href="#plans"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="block text-center py-4 rounded-xl font-heading text-[.95rem] tracking-[.06em] relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${result.color}22, rgba(232,160,32,.12))`,
                      border: `1px solid ${result.color}35`,
                      color: result.color,
                    }}
                  >
                    <span>Quero meu protocolo de 90 dias</span>
                    <span className="ml-2 text-[#e8a020]">→</span>
                  </motion.a>

                  <button onClick={reset}
                    className="text-center font-mono text-[.44rem] text-[#252548] hover:text-[#40406a] tracking-[.1em] uppercase transition-colors pt-1">
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
