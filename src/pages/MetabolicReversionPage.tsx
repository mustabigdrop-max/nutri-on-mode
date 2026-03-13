import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, TrendingUp, ChevronDown, ChevronRight, Thermometer,
  Scale, Dumbbell, Smile, Moon, Heart, Calculator, Info
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Phase {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  color: string;
  details: string[];
}

const PHASES: Phase[] = [
  {
    id: 1,
    title: "Fase 1 — Estabilização",
    subtitle: "Semanas 1–2",
    duration: "2 semanas",
    color: "cyan",
    details: [
      "Manter calorias no nível atual de manutenção estimado",
      "Aumentar carboidratos em 10–15% redistribuindo de gordura",
      "Priorizar sono (8h+) e reduzir NEAT artificial",
      "Monitorar peso diário para estabelecer baseline real",
      "Manter volume de treino, reduzir intensidade em 10%",
    ],
  },
  {
    id: 2,
    title: "Fase 2 — Incremento Lento",
    subtitle: "Semanas 3–6",
    duration: "4 semanas",
    color: "lime",
    details: [
      "Adicionar +100–150 kcal por semana (preferencialmente carboidratos)",
      "Monitorar temperatura corporal ao acordar como biomarcador",
      "Aumento de 5–10% no volume de treino de força",
      "Registrar humor e energia diariamente",
      "Esperar estabilização de peso antes de novo incremento",
    ],
  },
  {
    id: 3,
    title: "Fase 3 — Normalização Hormonal",
    subtitle: "Semanas 7–10",
    duration: "4 semanas",
    color: "orange",
    details: [
      "Calorias devem estar 85–95% do TDEE estimado pré-dieta",
      "Introduzir refeeds semanais (+500 kcal 1x por semana)",
      "Avaliar libido, qualidade do sono e recuperação muscular",
      "Exames laboratoriais opcionais: T3, T4, leptina, cortisol",
      "Ajustar macros se ganho de gordura exceder 0.3% por semana",
    ],
  },
  {
    id: 4,
    title: "Fase 4 — Nova Manutenção",
    subtitle: "Semanas 11–14+",
    duration: "4+ semanas",
    color: "violet",
    details: [
      "Manter no novo TDEE por 4–8 semanas mínimo",
      "Todos os biomarcadores devem estar normalizados",
      "Metabolismo restaurado = novo ponto de partida para corte",
      "Score de adaptação deve estar ≥ 80/100 antes de novo déficit",
      "Documentar o novo peso estável como referência",
    ],
  },
];

const BIOMARKERS = [
  { id: "temp", label: "Temperatura ao Acordar", icon: Thermometer, target: "≥ 36.4°C", color: "cyan" },
  { id: "weight", label: "Peso Estável (±0.5kg)", icon: Scale, target: "7+ dias", color: "lime" },
  { id: "performance", label: "Performance no Treino", icon: Dumbbell, target: "Recuperada", color: "orange" },
  { id: "mood", label: "Humor e Motivação", icon: Smile, target: "Estável", color: "violet" },
  { id: "sleep", label: "Qualidade do Sono", icon: Moon, target: "7-9h sem interrupções", color: "blue" },
  { id: "libido", label: "Libido", icon: Heart, target: "Normal", color: "rose" },
];

const colorMap: Record<string, string> = {
  cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  lime: "border-lime-500/40 bg-lime-500/10 text-lime-300",
  orange: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  violet: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  blue: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

function calcAdaptation(weeks: number, avgDeficit: number): { score: number; recoveryWeeks: number; level: string; color: string } {
  const raw = Math.min(100, (weeks * avgDeficit) / 15);
  const score = Math.round(raw);
  const recoveryWeeks = Math.max(4, Math.round(weeks * 0.5 + (avgDeficit > 500 ? 4 : 2)));
  if (score >= 70) return { score, recoveryWeeks, level: "Adaptação Severa", color: "text-red-400" };
  if (score >= 40) return { score, recoveryWeeks, level: "Adaptação Moderada", color: "text-orange-400" };
  return { score, recoveryWeeks, level: "Adaptação Leve", color: "text-lime-400" };
}

export default function MetabolicReversionPage() {
  const navigate = useNavigate();
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [biomarkerValues, setBiomarkerValues] = useState<Record<string, number>>(
    Object.fromEntries(BIOMARKERS.map(b => [b.id, Math.floor(Math.random() * 60) + 20]))
  );

  // Diagnostic calculator
  const [deficitWeeks, setDeficitWeeks] = useState(12);
  const [avgDeficit, setAvgDeficit] = useState(500);
  const [showCalcResult, setShowCalcResult] = useState(false);
  const adaptation = calcAdaptation(deficitWeeks, avgDeficit);

  const overallProgress = Math.round(
    Object.values(biomarkerValues).reduce((a, b) => a + b, 0) / BIOMARKERS.length
  );

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Reversão Metabólica</h1>
          <p className="text-xs text-white/50">Protocolo de reverse diet</p>
        </div>
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <TrendingUp size={18} className="text-cyan-400" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Info size={18} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">Saída científica do déficit prolongado</p>
              <p className="text-xs text-white/50 mt-1">
                Após semanas em déficit, seu metabolismo se adapta: leptina cai, T3 reduz, cortisol sobe. 
                Este protocolo restaura gradualmente seu TDEE para um novo patamar saudável.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Phase Timeline */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white/70 px-1">Protocolo em 4 Fases</p>
          {PHASES.map((phase, i) => {
            const isExpanded = expandedPhase === phase.id;
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <button
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    isExpanded ? `${colorMap[phase.color]}` : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center self-stretch">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        isExpanded ? "border-current bg-current/30" : "border-white/20 bg-white/5"
                      }`} />
                      {i < PHASES.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-1 ${isExpanded ? "bg-current/30" : "bg-white/10"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{phase.title}</p>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                      <p className="text-xs opacity-60 mt-0.5">{phase.subtitle} · {phase.duration}</p>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-10 pr-2 pt-2 pb-1 space-y-1.5">
                        {phase.details.map((detail, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-white/30 mt-1.5 flex-shrink-0" />
                            <p className="text-xs text-white/60">{detail}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Diagnostic Calculator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg border border-orange-500/40 bg-orange-500/10 text-orange-300">
                <Calculator size={16} />
              </div>
              <p className="text-sm font-semibold text-white/80">Calculadora de Diagnóstico</p>
            </div>

            {/* Weeks in deficit */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-white/50">Semanas em déficit</label>
                <span className="text-xs font-bold text-white/80">{deficitWeeks} semanas</span>
              </div>
              <input
                type="range"
                min={2}
                max={52}
                value={deficitWeeks}
                onChange={e => { setDeficitWeeks(Number(e.target.value)); setShowCalcResult(false); }}
                className="w-full accent-orange-400 h-1.5"
              />
              <div className="flex justify-between text-[9px] text-white/20 mt-0.5">
                <span>2</span><span>26</span><span>52</span>
              </div>
            </div>

            {/* Avg deficit */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-white/50">Déficit médio diário</label>
                <span className="text-xs font-bold text-white/80">{avgDeficit} kcal</span>
              </div>
              <input
                type="range"
                min={200}
                max={1200}
                step={50}
                value={avgDeficit}
                onChange={e => { setAvgDeficit(Number(e.target.value)); setShowCalcResult(false); }}
                className="w-full accent-orange-400 h-1.5"
              />
              <div className="flex justify-between text-[9px] text-white/20 mt-0.5">
                <span>200</span><span>700</span><span>1200</span>
              </div>
            </div>

            <button
              onClick={() => setShowCalcResult(true)}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-orange-400 to-red-500 text-black flex items-center justify-center gap-2"
            >
              <Calculator size={16} />
              Calcular Adaptação
            </button>

            <AnimatePresence>
              {showCalcResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-white/10 bg-white/[0.05] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/40">Score de Adaptação</p>
                      <p className={`text-3xl font-black ${adaptation.color}`}>{adaptation.score}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">Semanas de Recuperação</p>
                      <p className="text-3xl font-black text-cyan-400">{adaptation.recoveryWeeks}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-semibold px-3 py-1.5 rounded-full text-center border ${
                    adaptation.score >= 70 ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : adaptation.score >= 40 ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                    : "bg-lime-500/10 border-lime-500/30 text-lime-400"
                  }`}>
                    {adaptation.level}
                  </div>
                  <p className="text-[11px] text-white/40 text-center">
                    {deficitWeeks} semanas × {avgDeficit} kcal/dia de déficit.
                    {adaptation.score >= 70 ? " Recuperação prioritária antes de novo corte." 
                    : adaptation.score >= 40 ? " Reverse diet recomendado de 8–12 semanas." 
                    : " Adaptação leve. 4–6 semanas de manutenção podem ser suficientes."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Biomarker Tracker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white/70">Tracker de Biomarcadores</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                overallProgress >= 70 ? "bg-lime-500/10 border-lime-500/30 text-lime-400"
                : overallProgress >= 40 ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
                {overallProgress}% geral
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BIOMARKERS.map((bio) => {
                const Icon = bio.icon;
                const value = biomarkerValues[bio.id];
                const circumference = 2 * Math.PI * 28;
                const offset = circumference - (value / 100) * circumference;
                const gradientId = `bio-${bio.id}`;

                return (
                  <div
                    key={bio.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-col items-center gap-2"
                  >
                    {/* Progress ring */}
                    <div className="relative w-16 h-16">
                      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeOpacity={0.06} strokeWidth={4} />
                        <circle
                          cx="32" cy="32" r="28"
                          fill="none"
                          stroke={
                            bio.color === "cyan" ? "#22d3ee" :
                            bio.color === "lime" ? "#84cc16" :
                            bio.color === "orange" ? "#f97316" :
                            bio.color === "violet" ? "#8b5cf6" :
                            bio.color === "blue" ? "#3b82f6" :
                            "#f43f5e"
                          }
                          strokeWidth={4}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon size={18} className={colorMap[bio.color].split(" ").pop()} />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-semibold text-white/80 leading-tight">{bio.label}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{bio.target}</p>
                      <p className={`text-sm font-black mt-1 ${
                        value >= 70 ? "text-lime-400" : value >= 40 ? "text-orange-400" : "text-red-400"
                      }`}>
                        {value}%
                      </p>
                    </div>

                    {/* Quick adjust */}
                    <div className="flex gap-1">
                      {[25, 50, 75, 100].map(v => (
                        <button
                          key={v}
                          onClick={() => setBiomarkerValues(prev => ({ ...prev, [bio.id]: v }))}
                          className={`w-6 h-6 rounded-full text-[9px] font-bold transition-all ${
                            value === v
                              ? "bg-white/20 text-white"
                              : "bg-white/5 text-white/30 hover:bg-white/10"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
