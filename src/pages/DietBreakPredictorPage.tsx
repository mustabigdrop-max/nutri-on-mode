import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, CheckCircle2, Brain, Moon, Flame,
  TrendingDown, Calendar, Zap, Shield, ChevronRight, RefreshCw,
  Clock, Heart, Coffee, Activity
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

const RISK_FACTORS = [
  {
    id: "sleep",
    label: "Qualidade do sono ontem",
    icon: Moon,
    color: "blue",
    options: [
      { label: "Ótimo (7-9h)", value: 0 },
      { label: "Regular (5-7h)", value: 15 },
      { label: "Ruim (<5h)", value: 30 },
    ],
  },
  {
    id: "stress",
    label: "Nível de estresse hoje",
    icon: Brain,
    color: "violet",
    options: [
      { label: "Baixo", value: 0 },
      { label: "Moderado", value: 15 },
      { label: "Alto / fora do controle", value: 30 },
    ],
  },
  {
    id: "deficit_days",
    label: "Dias consecutivos em déficit",
    icon: TrendingDown,
    color: "orange",
    options: [
      { label: "0–6 dias", value: 0 },
      { label: "7–14 dias", value: 10 },
      { label: "15–30 dias", value: 20 },
      { label: "Mais de 30 dias", value: 30 },
    ],
  },
  {
    id: "social",
    label: "Evento social hoje / amanhã?",
    icon: Calendar,
    color: "pink",
    options: [
      { label: "Não", value: 0 },
      { label: "Sim, mas controlável", value: 10 },
      { label: "Sim, churrasco / festa / bar", value: 20 },
    ],
  },
  {
    id: "training",
    label: "Treino de hoje",
    icon: Flame,
    color: "red",
    options: [
      { label: "Dia de descanso", value: 5 },
      { label: "Treino normal", value: 0 },
      { label: "Treino muito pesado / cardio longo", value: 15 },
    ],
  },
  {
    id: "mood",
    label: "Como está o humor agora?",
    icon: Heart,
    color: "rose",
    options: [
      { label: "Motivado e focado", value: 0 },
      { label: "Neutro / cansado", value: 10 },
      { label: "Ansioso, irritado ou triste", value: 25 },
    ],
  },
];

interface Intervention {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
}

const INTERVENTIONS: Record<string, Intervention[]> = {
  high: [
    { title: "Ativar Refeed Hoje", desc: "Adicione +300–500 kcal de carboidrato limpo. Reduz leptina baixa e previne episódio de hiperfagia.", icon: Zap, color: "lime" },
    { title: "Modo Flexível 24h", desc: "Sem contagem rígida até amanhã. Coma dentro do perfil alimentar sem culpa.", icon: Shield, color: "blue" },
    { title: "Âncora de Identidade", desc: "\"Eu sou um atleta em protocolo. Recarregar é parte do processo, não é fraqueza.\"", icon: Brain, color: "violet" },
  ],
  medium: [
    { title: "Aumentar Proteína no Próximo Meal", desc: "+30–40g proteína aumenta saciedade e reduz risco de comer fora do plano.", icon: Activity, color: "orange" },
    { title: "Checar Hidratação", desc: "Sede frequentemente é confundida com fome. Tome 500ml agora.", icon: Coffee, color: "cyan" },
    { title: "Planejamento Antecipado", desc: "Defina agora o que você vai comer no próximo momento de risco.", icon: Clock, color: "green" },
  ],
  low: [
    { title: "Tudo sob controle", desc: "Seus indicadores estão estáveis. Continue o protocolo normalmente.", icon: CheckCircle2, color: "lime" },
  ],
};

function getRiskLevel(score: number) {
  if (score >= 65) return { level: "high", label: "Alto Risco", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" };
  if (score >= 35) return { level: "medium", label: "Risco Moderado", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" };
  return { level: "low", label: "Baixo Risco", color: "text-lime-400", bg: "bg-lime-500/10", border: "border-lime-500/30" };
}

function ScoreGauge({ score }: { score: number }) {
  const angle = (score / 100) * 180 - 90;
  const risk = getRiskLevel(score);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-48 h-28 overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#84cc16" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="white" strokeOpacity={0.06} strokeWidth={16} strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth={16} strokeLinecap="round" strokeDasharray="251" strokeDashoffset={251 - (score / 100) * 251} />
          <motion.line
            x1="100" y1="100" x2="100" y2="30"
            stroke="white" strokeWidth={3} strokeLinecap="round"
            style={{ transformOrigin: "100px 100px" }}
            animate={{ rotate: angle }}
            transition={{ type: "spring", stiffness: 60 }}
          />
        </svg>
      </div>
      <p className={`text-4xl font-black ${risk.color}`}>{score}</p>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${risk.bg} ${risk.color} ${risk.border} border`}>
        {risk.label}
      </span>
    </div>
  );
}

export default function DietBreakPredictorPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const allAnswered = Object.keys(answers).length === RISK_FACTORS.length;
  const risk = getRiskLevel(totalScore);

  function handleAnswer(factorId: string, value: number) {
    setAnswers(prev => ({ ...prev, [factorId]: value }));
  }

  function reset() {
    setAnswers({});
    setShowResult(false);
  }

  const colorMap: Record<string, string> = {
    blue: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    violet: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    orange: "border-orange-500/40 bg-orange-500/10 text-orange-300",
    pink: "border-pink-500/40 bg-pink-500/10 text-pink-300",
    red: "border-red-500/40 bg-red-500/10 text-red-300",
    rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    lime: "border-lime-500/40 bg-lime-500/10 text-lime-300",
    cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    green: "border-green-500/40 bg-green-500/10 text-green-300",
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Preditor de Quebra de Dieta</h1>
          <p className="text-xs text-white/50">Score de risco em tempo real</p>
        </div>
        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30">
          <AlertTriangle size={18} className="text-orange-400" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Intro card */}
        {!showResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30">
                  <Brain size={20} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">Nenhum app previne a quebra antes de acontecer.</p>
                  <p className="text-xs text-white/50 mt-1">Responda 6 perguntas e descubra seu risco agora. Intervenções automáticas são ativadas se risco &gt; 65.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Questions */}
        {!showResult && RISK_FACTORS.map((factor, i) => {
          const Icon = factor.icon;
          const answered = answers[factor.id] !== undefined;
          return (
            <motion.div key={factor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className={`rounded-2xl border p-4 transition-all ${answered ? "border-lime-500/30 bg-lime-500/[0.03]" : "border-white/10 bg-white/[0.03]"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg border ${colorMap[factor.color]}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-white/80">{factor.label}</span>
                  {answered && <CheckCircle2 size={14} className="text-lime-400 ml-auto" />}
                </div>
                <div className="space-y-2">
                  {factor.options.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => handleAnswer(factor.id, opt.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all border ${
                        answers[factor.id] === opt.value
                          ? "bg-lime-500/15 border-lime-500/40 text-lime-300 font-medium"
                          : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/80"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* CTA calcular */}
        {!showResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <button
              disabled={!allAnswered}
              onClick={() => setShowResult(true)}
              className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-lime-400 to-green-500 text-black disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-lime-500/20"
            >
              <ChevronRight size={20} />
              Calcular Score de Risco
            </button>
            <p className="text-center text-xs text-white/30 mt-2">
              {Object.keys(answers).length}/{RISK_FACTORS.length} perguntas respondidas
            </p>
          </motion.div>
        )}

        {/* Resultado */}
        <AnimatePresence>
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Gauge */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col items-center">
                <ScoreGauge score={totalScore} />
                <p className="text-xs text-white/40 mt-4 text-center">
                  Score calculado com base em sono, estresse, dias de déficit, eventos sociais, treino e humor
                </p>
              </div>

              {/* Intervenções */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-white/70 px-1">
                  Intervenções Recomendadas
                </h2>
                <div className="space-y-2">
                  {INTERVENTIONS[risk.level].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex gap-3 items-start">
                          <div className={`p-2 rounded-xl border ${colorMap[item.color]}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white/90">{item.title}</p>
                            <p className="text-xs text-white/50 mt-1">{item.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Histórico placeholder */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white/70 mb-3">Histórico de Scores</p>
                <div className="flex items-end justify-between gap-1 h-20">
                  {[22, 45, 38, 71, 55, 30, totalScore].map((s, i) => {
                    const h = (s / 100) * 64;
                    const col = s >= 65 ? "bg-red-400" : s >= 35 ? "bg-orange-400" : "bg-lime-400";
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div className={`w-full max-w-[24px] rounded-t-md ${col}`} style={{ height: `${h}px` }} />
                        <span className="text-[10px] text-white/30">{["S", "T", "Q", "Q", "S", "S", "H"][i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nova análise */}
              <button onClick={reset} className="w-full py-3 rounded-2xl border border-white/10 text-white/60 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                <RefreshCw size={16} />
                Refazer Análise
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
