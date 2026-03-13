import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, TrendingUp, TrendingDown, Flame, Activity, Brain,
  Heart, Zap, CheckCircle2, AlertTriangle, ChevronRight, Info,
  BarChart2, RefreshCw, Calendar, Moon
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

// Fases do protocolo de reversão metabólica
const PHASES = [
  {
    id: 1,
    name: "Diagnóstico Metabólico",
    weeks: "Semana 1",
    color: "violet",
    desc: "Medir taxa metabólica estimada atual vs esperada. Identificar grau de adaptação.",
    checks: [
      "Peso corporal estável por 2+ semanas?",
      "Temperatura corporal pela manhã (< 36.5°C = sinal de supressão)",
      "Performance no treino caindo?",
      "Fadiga crônica, humor baixo, libido reduzida?",
    ],
    action: "Calcular TDEE atual e comparar com TDEE esperado pelo peso",
  },
  {
    id: 2,
    name: "Elevação Gradual de Calorias",
    weeks: "Semanas 2–5",
    color: "blue",
    desc: "Adicionar calorias de forma progressiva e controlada. Não voltar ao 'normal' de uma vez.",
    checks: [
      "Adicionar +100 kcal/semana via carboidratos",
      "Manter proteína em 2.2–2.8g/kg",
      "Monitorar ganho de peso semanal (meta: < 0.5kg/semana)",
      "Observar melhora de energia e performance",
    ],
    action: "Se ganhar > 0.5kg/semana: parar na caloria atual por mais 1 semana",
  },
  {
    id: 3,
    name: "Ponto de Equilíbrio (Manutenção Real)",
    weeks: "Semanas 6–8",
    color: "lime",
    desc: "Encontrar a caloria onde o peso estabiliza e os marcadores metabólicos normalizam.",
    checks: [
      "Peso estável por 2 semanas consecutivas",
      "Temperatura corporal > 36.6°C",
      "Performance voltando ao baseline",
      "Humor, libido, sono melhorados",
    ],
    action: "Essa caloria é seu TDEE real atual — anotar e usar como base",
  },
  {
    id: 4,
    name: "Retomada de Déficit (Opcional)",
    weeks: "Semanas 9+",
    color: "orange",
    desc: "Somente após normalização completa dos marcadores. Déficit moderado e ciclado.",
    checks: [
      "Déficit máximo de 20% abaixo do TDEE real",
      "Incluir refeeds a cada 7–10 dias",
      "Monitorar marcadores metabólicos semanalmente",
      "Nunca voltar ao déficit severo anterior",
    ],
    action: "Protocolo de manutenção mínima: 2 semanas de manutenção a cada 6 semanas de déficit",
  },
];

const BIOMARKERS = [
  { id: "weight_stable", label: "Peso estável", desc: "2+ semanas sem mudança significativa", icon: Activity, baseline: false },
  { id: "temp", label: "Temperatura normal", desc: "Acima de 36.6°C ao acordar", icon: Flame, baseline: false },
  { id: "performance", label: "Performance no treino", desc: "Melhorando ou estável", icon: Zap, baseline: false },
  { id: "mood", label: "Humor e energia", desc: "Sentindo-se melhor que no déficit", icon: Brain, baseline: false },
  { id: "sleep", label: "Qualidade do sono", desc: "Dormindo bem e recuperando", icon: Moon, baseline: false },
  { id: "libido", label: "Libido e hormônios", desc: "Recuperação do eixo hormonal", icon: Heart, baseline: false },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400", badge: "bg-violet-500/20 text-violet-300" },
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-400",   badge: "bg-blue-500/20 text-blue-300"   },
  lime:   { bg: "bg-lime-500/10",   border: "border-lime-500/30",   text: "text-lime-400",   badge: "bg-lime-500/20 text-lime-300"   },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-300" },
};

// Calculadora simples de déficit crônico
function DeficitDiagnostic({ onResult }: { onResult: (weeks: number, deficit: number) => void }) {
  const [weeks, setWeeks] = useState(12);
  const [avgDeficit, setAvgDeficit] = useState(500);
  const [submitted, setSubmitted] = useState(false);

  const adaptationScore = Math.min(100, Math.round((weeks * avgDeficit) / 1000));
  const recoveryWeeks = Math.ceil(adaptationScore / 12);

  function submit() {
    setSubmitted(true);
    onResult(recoveryWeeks, adaptationScore);
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl border border-white/8 bg-white/3 space-y-4">
        <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">Diagnóstico Rápido</p>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-white/70">Semanas em déficit contínuo</label>
            <span className="text-sm font-bold text-white">{weeks} sem</span>
          </div>
          <input type="range" min={4} max={52} value={weeks} onChange={e => setWeeks(+e.target.value)}
            className="w-full accent-lime-400" />
          <div className="flex justify-between text-[10px] text-white/30 mt-1">
            <span>4 sem</span><span>52 sem</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-white/70">Déficit calórico médio diário</label>
            <span className="text-sm font-bold text-white">{avgDeficit} kcal</span>
          </div>
          <input type="range" min={100} max={1200} step={50} value={avgDeficit} onChange={e => setAvgDeficit(+e.target.value)}
            className="w-full accent-lime-400" />
          <div className="flex justify-between text-[10px] text-white/30 mt-1">
            <span>100 kcal</span><span>1200 kcal</span>
          </div>
        </div>

        {!submitted ? (
          <button onClick={submit}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold text-sm">
            Calcular Grau de Adaptação
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className={`p-4 rounded-xl border ${adaptationScore >= 70 ? "border-red-500/30 bg-red-500/10" : adaptationScore >= 40 ? "border-orange-500/30 bg-orange-500/10" : "border-lime-500/30 bg-lime-500/10"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/50">Score de Adaptação Metabólica</span>
                <span className={`text-2xl font-black ${adaptationScore >= 70 ? "text-red-400" : adaptationScore >= 40 ? "text-orange-400" : "text-lime-400"}`}>
                  {adaptationScore}/100
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${adaptationScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${adaptationScore >= 70 ? "bg-red-400" : adaptationScore >= 40 ? "bg-orange-400" : "bg-lime-400"}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/40" />
                <p className="text-sm text-white/70">
                  Protocolo de reversão estimado: <span className="font-bold text-white">{recoveryWeeks} semanas</span>
                </p>
              </div>
            </div>
            {adaptationScore >= 70 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">Adaptação severa detectada. Recomendado acompanhamento profissional e exames hormonais (T3, cortisol, testosterona).</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function MetabolicReversionPage() {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [biomarkers, setBiomarkers] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"protocol" | "diagnostic" | "biomarkers">("protocol");
  const [diagnosisResult, setDiagnosisResult] = useState<{ weeks: number; score: number } | null>(null);

  const markedCount = Object.values(biomarkers).filter(Boolean).length;
  const recoveryPercent = Math.round((markedCount / BIOMARKERS.length) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-base">Reversão Metabólica</h1>
          <p className="text-xs text-white/40">Protocolo de saída do déficit severo</p>
        </div>
        <div className="px-2 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30">
          <span className="text-xs text-orange-400 font-semibold">Avançado</span>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-lg mx-auto">

        {/* Banner de alerta */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 to-red-500/8 mb-5">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white/90">Zero apps têm isso</p>
              <p className="text-xs text-white/50 mt-1">
                Após déficit prolongado, o metabolismo se adapta: gasta menos, aumenta fome, suprime hormônios.
                Voltar ao normal de uma vez gera rebote. Este protocolo corrige isso de forma científica e gradual.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-5">
          {(["protocol", "diagnostic", "biomarkers"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}>
              {tab === "protocol" ? "📋 Protocolo" : tab === "diagnostic" ? "🔬 Diagnóstico" : "📊 Marcadores"}
            </button>
          ))}
        </div>

        {/* TAB: PROTOCOLO */}
        {activeTab === "protocol" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {/* Timeline visual */}
            <div className="flex items-center gap-1 px-1 mb-4 overflow-x-auto pb-2">
              {PHASES.map((phase, i) => {
                const c = colorMap[phase.color];
                return (
                  <div key={phase.id} className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${activePhase === phase.id ? `${c.bg} ${c.border} ${c.text}` : "border-white/10 bg-white/3 text-white/40 hover:text-white/60"}`}>
                      F{phase.id}
                    </button>
                    {i < PHASES.length - 1 && <ChevronRight className="w-3 h-3 text-white/20 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>

            {PHASES.map((phase, i) => {
              const c = colorMap[phase.color];
              const isOpen = activePhase === phase.id;
              return (
                <motion.div key={phase.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`rounded-2xl border transition-all ${isOpen ? `${c.border} ${c.bg}` : "border-white/8 bg-white/3"}`}>
                  <button
                    onClick={() => setActivePhase(isOpen ? null : phase.id)}
                    className="w-full p-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${c.badge}`}>
                        {phase.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-sm text-white">{phase.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.badge}`}>{phase.weeks}</span>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{phase.desc}</p>
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-3">
                          <div className="space-y-2">
                            {phase.checks.map((check, ci) => (
                              <div key={ci} className="flex gap-2 items-start">
                                <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${c.text}`} />
                                <p className="text-xs text-white/70">{check}</p>
                              </div>
                            ))}
                          </div>
                          <div className={`p-3 rounded-xl border ${c.border} ${c.bg}`}>
                            <p className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                              <Zap className={`w-3.5 h-3.5 ${c.text}`} />
                              <span className={c.text}>Ação principal</span>
                            </p>
                            <p className="text-xs text-white/70">{phase.action}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* TAB: DIAGNÓSTICO */}
        {activeTab === "diagnostic" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DeficitDiagnostic onResult={(weeks, score) => setDiagnosisResult({ weeks, score })} />

            {diagnosisResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                <p className="text-xs text-white/40 px-1 uppercase tracking-wider font-semibold">Plano de Reversão Personalizado</p>
                {PHASES.map((phase, i) => {
                  const c = colorMap[phase.color];
                  return (
                    <div key={phase.id} className={`p-3 rounded-xl border ${c.border} ${c.bg} flex items-center gap-3`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${c.badge}`}>{phase.id}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/90 truncate">{phase.name}</p>
                        <p className="text-xs text-white/40">{phase.weeks}</p>
                      </div>
                      <span className={`text-xs font-bold ${c.text}`}>≈ {Math.ceil(diagnosisResult.weeks / 4)} sem</span>
                    </div>
                  );
                })}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-lime-500/10 to-green-500/10 border border-lime-500/20">
                  <p className="text-sm font-bold text-lime-300 mb-1">Tempo total estimado de reversão</p>
                  <p className="text-3xl font-black text-white">{diagnosisResult.weeks} semanas</p>
                  <p className="text-xs text-white/40 mt-1">Baseado em {diagnosisResult.score}/100 de score de adaptação metabólica</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* TAB: MARCADORES */}
        {activeTab === "biomarkers" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            {/* Progress ring */}
            <div className="p-5 rounded-2xl border border-white/8 bg-white/3 flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#ffffff10" strokeWidth="8" />
                  <motion.circle cx="40" cy="40" r="34" fill="none"
                    stroke={recoveryPercent >= 80 ? "#84cc16" : recoveryPercent >= 50 ? "#f97316" : "#ef4444"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - recoveryPercent / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-white">{recoveryPercent}%</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-white">Recuperação Metabólica</p>
                <p className="text-xs text-white/50 mt-0.5">{markedCount}/{BIOMARKERS.length} marcadores normalizados</p>
                <p className="text-xs text-white/30 mt-1">Marque os marcadores que já estão normais</p>
              </div>
            </div>

            <div className="space-y-2">
              {BIOMARKERS.map((marker, i) => {
                const Icon = marker.icon;
                const checked = !!biomarkers[marker.id];
                return (
                  <motion.button key={marker.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setBiomarkers(prev => ({ ...prev, [marker.id]: !checked }))}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${checked ? "border-lime-500/30 bg-lime-500/8" : "border-white/8 bg-white/3 hover:bg-white/5"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${checked ? "bg-lime-500/20 text-lime-400" : "bg-white/5 text-white/30"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${checked ? "text-lime-300" : "text-white/70"}`}>{marker.label}</p>
                        <p className="text-xs text-white/40">{marker.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? "border-lime-400 bg-lime-400" : "border-white/20"}`}>
                        {checked && <CheckCircle2 className="w-3 h-3 text-black" />}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {recoveryPercent >= 80 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl border border-lime-500/30 bg-lime-500/10">
                <div className="flex gap-2 items-center mb-1">
                  <CheckCircle2 className="w-5 h-5 text-lime-400" />
                  <p className="font-bold text-lime-300">Recuperação completa detectada!</p>
                </div>
                <p className="text-xs text-white/50">Seu metabolismo está normalizado. Você pode retomar um protocolo de déficit moderado com segurança.</p>
              </motion.div>
            )}
          </motion.div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
