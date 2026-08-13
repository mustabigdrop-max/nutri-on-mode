import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, ChevronUp, Loader2, Beaker, Zap, Timer, Droplets } from "lucide-react";
import { useWorkoutSchedule, type WorkoutTime, type WorkoutType } from "@/hooks/useWorkoutSchedule";
import { supabase } from "@/integrations/supabase/client";

interface TimingWindow {
  label: string;
  emoji: string;
  color: string;
  bg: string;
  foods: string[];
  protein: number;
  carbs: number;
  fat: number;
  offsetMinutes: number;
  science: string;
  mechanism: string;
  insulinStrategy: string;
  giStrategy: string;
  hydration?: string;
}

function getAdvancedTimingWindows(workoutTime: WorkoutTime, workoutType: WorkoutType): TimingWindow[] {
  const isLegs = workoutType === "legs";
  const isHIIT = workoutType === "cardio_hiit";
  const isCardioLight = workoutType === "cardio_light";
  const isUpper = !isLegs && !isHIIT && !isCardioLight;

  return [
    // ═══ REFEIÇÃO BASE: 2-3h antes ═══
    {
      label: "Refeição Base (-2h30)",
      emoji: "🍚",
      color: "text-sky-400",
      bg: "border-sky-500/30 bg-sky-500/10",
      foods: isLegs
        ? ["Arroz branco (250g)", "Frango grelhado (200g)", "Batata doce (150g)", "Sal rosa"]
        : isHIIT
          ? ["Macarrão integral (200g)", "Atum (150g)", "Azeite (1 col)"]
          : ["Arroz branco (200g)", "Carne magra (180g)", "Legumes refogados"],
      protein: isLegs ? 40 : 35,
      carbs: isLegs ? 80 : isHIIT ? 65 : 55,
      fat: 8,
      offsetMinutes: -150,
      science: "Carga glicogênica completa. Carboidratos complexos com IG moderado (55-70) para digestão gradual e pico glicêmico controlado ~60min antes do treino.",
      mechanism: "↑ Glicogênio muscular (400-500g capacity) · ↑ Glicogênio hepático",
      insulinStrategy: "IG médio → pico insulínico moderado e sustentado por 90-120min. Evitar gordura em excesso para não retardar esvaziamento gástrico.",
      giStrategy: "Arroz branco (IG 73) + proteína = IG efetivo ~55. Batata doce (IG 61) como backup glicogênico.",
    },
    // ═══ PRÉ-TREINO: 30-45min antes ═══
    {
      label: "Pré-treino (-30min)",
      emoji: "⚡",
      color: "text-amber-400",
      bg: "border-amber-500/30 bg-amber-500/10",
      foods: isLegs
        ? ["Banana madura (1 unid)", "Mel (1 col sopa)", "Creatina 5g", "Cafeína 3-6mg/kg"]
        : isHIIT
          ? ["Banana + mel", "Cafeína 200-400mg", "Beta-alanina 3.2g"]
          : ["Banana madura (1 unid)", "Whey isolado (15g)", "Cafeína 200mg"],
      protein: isLegs ? 0 : 15,
      carbs: isLegs ? 40 : 30,
      fat: 0,
      offsetMinutes: -30,
      science: "Carboidrato de ALTO IG (>85) para spike rápido de glicemia. Banana madura IG 62→82 com mel IG 87. Pico de insulina em 15-20min → glicose disponível no início do treino.",
      mechanism: "↑↑ Glicemia rápida · ↑ Insulina pré-exercício · ↑ Leucina priming (mTOR) · ↑ Drive simpático (cafeína)",
      insulinStrategy: "ALTO IG proposital: spike insulínico rápido para maximizar captação de glicose muscular antes do exercício. Pico ideal: 15-20min pós-ingestão.",
      giStrategy: "Banana madura (IG 82) + mel (IG 87) = IG combinado ~85. ZERO gordura e ZERO fibra para absorção máxima em <20min.",
    },
    // ═══ INTRA-TREINO ═══
    {
      label: "Intra-treino",
      emoji: "💧",
      color: "text-cyan-400",
      bg: "border-cyan-500/30 bg-cyan-500/10",
      foods: isLegs
        ? ["Palatinose 15g ou Cluster Dextrin 20g", "Eletrólitos (Na 500mg + K 200mg)", "BCAA 5g (2:1:1)", "Água 600-800ml"]
        : isHIIT
          ? ["Maltodextrina 20g + frutose 10g (ratio 2:1)", "Sódio 500mg", "Água 500-700ml a cada 15min"]
          : ["Água + eletrólitos (Na/K/Mg)", "Opcional: 10g carboidrato se >60min"],
      protein: 0,
      carbs: isLegs ? 20 : isHIIT ? 30 : 10,
      fat: 0,
      offsetMinutes: 0,
      science: "Manutenção de glicemia entre 80-110mg/dL durante esforço. Palatinose (IG 32) libera glicose lenta. Cluster Dextrin alta osmolaridade → absorção rápida sem desconforto GI. Ratio maltodextrina:frutose 2:1 maximiza absorção via SGLT1+GLUT5.",
      mechanism: "↑ Glicemia sustentada · ↓↓ Cortisol (-30%) · ↓ Depleção glicogênica · ↑ Hidratação celular",
      insulinStrategy: "IG BAIXO/MÉDIO intencional: Palatinose (IG 32) ou Cluster Dextrin mantém glicemia estável SEM spike insulínico — preserva lipólise e previne hipoglicemia reativa.",
      giStrategy: "Palatinose IG 32 → liberação lenta. Se precisar de rápido: maltodextrina IG 95 + frutose IG 19 (ratio 2:1) = transporte duplo intestinal (até 90g/h).",
      hydration: "Solução isotônica: 6-8% carboidrato + 500mg Na por litro. Beber 150-200ml a cada 15-20min.",
    },
    // ═══ PÓS-TREINO IMEDIATO (0-30min) — JANELA GLUT-4 ═══
    {
      label: "Pós-treino imediato (0-30min)",
      emoji: "🔥",
      color: "text-emerald-400",
      bg: "border-emerald-500/30 bg-emerald-500/10",
      foods: isLegs
        ? ["Dextrose 50g (IG 100) + Whey Isolado 40g", "Creatina 5g", "Leucina extra 3g", "Glutamina 5g"]
        : isHIIT
          ? ["Whey hidrolisado 30g + dextrose 40g", "Eletrólitos reposição", "Leucina 2g"]
          : ["Whey isolado 30g + maltodextrina 30g", "Banana madura", "Creatina 5g"],
      protein: isLegs ? 40 : 30,
      carbs: isLegs ? 50 : isHIIT ? 40 : 35,
      fat: 0,
      offsetMinutes: 5,
      science: "JANELA GLUT-4 MÁXIMA (0-30min): Exercício transloca GLUT-4 para membrana celular → captação de glicose INDEPENDENTE de insulina. Adicionar insulina (via carb alto IG) potencializa 2-3x. Leucina 3g ativa mTORC1 → síntese proteica muscular. Whey hidrolisado = aminograma completo em 15-20min.",
      mechanism: "↑↑↑ GLUT-4 membrana · ↑↑ Insulina + GLUT-4 sinergismo · ↑↑ mTOR (leucina) · ↑↑ Ressíntese glicogênio (taxa 1.5x normal)",
      insulinStrategy: "PICO MÁXIMO DE INSULINA DESEJADO: Dextrose (IG 100) + Whey = spike insulínico máximo. GLUT-4 já na membrana + insulina = captação de glicose até 3x maior. Taxa de ressíntese: 5-8 mmol/kg/h (vs 2-3 normal).",
      giStrategy: "Dextrose pura IG 100 — o carb com maior velocidade de absorção. ZERO fibra, ZERO gordura, ZERO frutose (frutose vai para fígado, não músculo). Maltodextrina IG 95 como alternativa.",
    },
    // ═══ PÓS-TREINO 2h — REFEIÇÃO SÓLIDA ═══
    {
      label: "Refeição Pós-treino (1h30-2h)",
      emoji: "🍽️",
      color: "text-violet-400",
      bg: "border-violet-500/30 bg-violet-500/10",
      foods: isLegs
        ? ["Arroz branco (300g)", "Carne vermelha (250g) — ferro heme + zinco", "Brócolis (100g)", "Azeite EV (1 col)"]
        : ["Arroz branco (200g)", "Frango/peixe (200g)", "Salada verde + azeite", "Tubérculo (batata/mandioca)"],
      protein: isLegs ? 50 : 40,
      carbs: isLegs ? 80 : 60,
      fat: 12,
      offsetMinutes: 105,
      science: "Segunda janela de ressíntese de glicogênio (fase 2 insulino-dependente). GLUT-4 ainda elevado por ~2h pós-exercício. Proteína completa (carne) fornece leucina, ferro heme e zinco para recuperação. Carboidrato IG alto→médio mantém insulina elevada.",
      mechanism: "↑ Glicogênio fase 2 · ↑ Leucina sustentada · ↑ Ferro heme (absorção 25% vs 5%) · ↑ Zinco (→ testosterona) · ↑ mTOR sustentado",
      insulinStrategy: "Insulina elevada sustentada com refeição completa. Arroz branco (IG 73) com proteína = IG efetivo ~58. Insulina moderada-alta por 2-3h → anabolismo prolongado.",
      giStrategy: "Arroz branco (IG 73) preferido sobre integral (IG 48) — maior velocidade de reposição de glicogênio. Carne vermelha pós-treino: creatina natural + carnosina + ferro heme.",
    },
  ];
}

function workoutTimeToHour(wt: WorkoutTime): number {
  switch (wt) {
    case "morning": return 7;
    case "afternoon": return 15;
    case "night": return 19;
    default: return 15;
  }
}

function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return "Agora";
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ""}`;
  return `${m}min`;
}

const NutrientTimingCard = () => {
  const { getTodayWorkout } = useWorkoutSchedule();
  const todayWorkout = getTodayWorkout();
  const [now, setNow] = useState(Date.now());
  const [expanded, setExpanded] = useState(false);
  const [showInsulin, setShowInsulin] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const isTrainingDay = todayWorkout && todayWorkout.workout_type !== "rest" && todayWorkout.workout_type !== "active_rest";

  useEffect(() => {
    if (!expanded || aiInsight || !isTrainingDay) return;
    const fetchInsight = async () => {
      setLoadingInsight(true);
      try {
        const wType = todayWorkout!.workout_type as string;
        const wTime = todayWorkout!.workout_time as string;
        const { data, error } = await supabase.functions.invoke("perplexity-search", {
          body: {
            query: `Protocolo científico atualizado (2024-2025) de nutrient timing para treino de ${wType.replace(/_/g, " ")} no período da ${wTime === "morning" ? "manhã" : wTime === "afternoon" ? "tarde" : "noite"}: 
1) Melhor timing para pico de insulina pós-treino e otimização GLUT-4
2) Quais carboidratos de alto IG usar em cada janela (dextrose, maltodextrina, Cluster Dextrin, Palatinose)
3) Estratégia intra-treino: ratio maltodextrina:frutose, osmolaridade, taxa de absorção
4) Quanto tempo dura a janela GLUT-4 pós-exercício e como maximizá-la
5) Leucina e mTORC1: dosagem e timing exato
Cite estudos de ISSN, JISSN, PubMed 2023-2025. Seja específico com gramas, horários e índices glicêmicos.`,
            category: "protocol",
          },
        });
        if (!error && data?.answer) {
          setAiInsight(data.answer.length > 600
            ? data.answer.substring(0, 600).replace(/\s+\S*$/, "") + "…"
            : data.answer);
        }
      } catch {
        // silent
      } finally {
        setLoadingInsight(false);
      }
    };
    fetchInsight();
  }, [expanded, aiInsight, isTrainingDay, todayWorkout]);

  if (!isTrainingDay) return null;

  const wt = todayWorkout!.workout_time as WorkoutTime;
  const wType = todayWorkout!.workout_type as WorkoutType;
  const workoutHour = workoutTimeToHour(wt);
  const windows = getAdvancedTimingWindows(wt, wType);

  const today = new Date();
  const workoutStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), workoutHour, 0, 0);

  const windowTimes = windows.map((w) => {
    const t = new Date(workoutStart.getTime() + w.offsetMinutes * 60000);
    return { ...w, time: t, diff: t.getTime() - now };
  });

  const nextWindow = windowTimes.find((w) => w.diff > 0);
  const activeWindow = windowTimes.find((w) => w.diff >= -30 * 60000 && w.diff <= 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
            Nutrient Timing Avançado
          </h3>
        </div>
        {nextWindow && (
          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
            ⏳ {nextWindow.label.split("(")[0].trim()} em {formatCountdown(nextWindow.diff)}
          </span>
        )}
      </div>

      {/* Protocol tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 rounded px-1.5 py-0.5">↑↑ GLUT-4</span>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">↑ mTOR</span>
        <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 rounded px-1.5 py-0.5">Índice Glicêmico</span>
        <span className="text-[9px] font-mono text-violet-400 bg-violet-500/10 rounded px-1.5 py-0.5">Pico Insulínico</span>
      </div>

      {/* Toggle insulin view */}
      <button
        onClick={() => setShowInsulin(!showInsulin)}
        className="mb-3 text-[10px] font-mono text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
      >
        <Zap className="w-3 h-3" />
        {showInsulin ? "Ocultar estratégia de insulina/IG" : "Ver estratégia de insulina/IG por janela"}
      </button>

      {/* Windows */}
      <div className="space-y-2">
        {windowTimes.map((w, i) => {
          const isPast = w.diff < -30 * 60000;
          const isActive = w.diff >= -30 * 60000 && w.diff <= 0;
          const timeStr = `${w.time.getHours().toString().padStart(2, "0")}:${w.time.getMinutes().toString().padStart(2, "0")}`;

          return (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i }}
              className={`rounded-lg border p-3 ${w.bg} ${isPast ? "opacity-40" : ""} ${isActive ? "ring-1 ring-primary shadow-lg shadow-primary/10" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{w.emoji}</span>
                  <span className={`text-xs font-mono font-bold ${w.color}`}>{w.label}</span>
                  {isActive && (
                    <span className="text-[9px] font-mono bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full animate-pulse">
                      AGORA
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-mono text-muted-foreground">{timeStr}</span>
                </div>
              </div>

              {/* Foods list */}
              <div className="mb-1.5 space-y-0.5">
                {w.foods.map((food, fi) => (
                  <p key={fi} className="text-[11px] text-foreground font-mono flex items-start gap-1">
                    <span className="text-muted-foreground">•</span> {food}
                  </p>
                ))}
              </div>

              {/* Macros */}
              <div className="flex gap-3 mb-1.5">
                {w.protein > 0 && <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 rounded px-1 py-0.5">P: {w.protein}g</span>}
                <span className="text-[9px] font-mono text-orange-400 bg-orange-500/10 rounded px-1 py-0.5">C: {w.carbs}g</span>
                {w.fat > 0 && <span className="text-[9px] font-mono text-yellow-400 bg-yellow-500/10 rounded px-1 py-0.5">G: {w.fat}g</span>}
              </div>

              {/* Mechanism tag */}
              <div className="text-[9px] font-mono text-primary/70 bg-primary/5 rounded px-1.5 py-0.5 inline-block mb-1">
                {w.mechanism}
              </div>

              {/* Hydration note */}
              {w.hydration && (
                <div className="flex items-start gap-1 mt-1">
                  <Droplets className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[9px] font-mono text-cyan-300/80">{w.hydration}</p>
                </div>
              )}

              {/* Insulin / GI strategy (toggled) */}
              <AnimatePresence>
                {showInsulin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1.5 border-t border-border/50 pt-2">
                      <div className="flex items-start gap-1">
                        <Zap className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[9px] font-mono text-amber-300/90 leading-relaxed">{w.insulinStrategy}</p>
                      </div>
                      <div className="flex items-start gap-1">
                        <Timer className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[9px] font-mono text-violet-300/90 leading-relaxed">{w.giStrategy}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Science note on expanded */}
              <AnimatePresence>
                {expanded && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-[10px] font-mono text-muted-foreground mt-1.5 leading-relaxed overflow-hidden"
                  >
                    📚 {w.science}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Insulin curve summary */}
      <AnimatePresence>
        {showInsulin && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-[10px] font-mono font-bold text-amber-400 mb-1.5">📊 Curva Insulínica Ideal no Treino</p>
              <div className="space-y-1 text-[9px] font-mono text-foreground/80">
                <p>▁▂▃ <span className="text-sky-400">-2h30</span>: Insulina moderada (refeição base IG ~55)</p>
                <p>▃▅▇ <span className="text-amber-400">-30min</span>: Spike rápido (banana+mel IG ~85)</p>
                <p>▃▂▂ <span className="text-cyan-400">Intra</span>: Insulina baixa (Palatinose IG 32 — preserva lipólise)</p>
                <p>▁▅▇█ <span className="text-emerald-400">Pós 0-30min</span>: SPIKE MÁXIMO (dextrose IG 100 + whey → GLUT-4 sinergismo)</p>
                <p>▇▅▃▂ <span className="text-violet-400">Pós 2h</span>: Insulina sustentada (refeição sólida IG ~58)</p>
              </div>
              <p className="text-[9px] font-mono text-muted-foreground mt-2">
                💡 GLUT-4 ativo por ~2h pós-exercício. Dextrose pura (IG 100) no pós-imediato = taxa de ressíntese de glicogênio 5-8 mmol/kg/h (vs 2-3 normal).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insight from Perplexity */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Beaker className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-mono font-bold text-primary uppercase">
                  Pesquisa Científica — ISSN / PubMed 2024-2025
                </span>
              </div>
              {loadingInsight ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="w-3 h-3 text-primary animate-spin" />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Buscando evidências científicas atualizadas...
                  </span>
                </div>
              ) : aiInsight ? (
                <p className="text-[10px] font-mono text-foreground/80 leading-relaxed whitespace-pre-line">
                  {aiInsight}
                </p>
              ) : (
                <p className="text-[10px] font-mono text-muted-foreground">
                  Sem dados disponíveis no momento.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 w-full flex items-center justify-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <><ChevronUp className="w-3 h-3" /> Recolher ciência</>
        ) : (
          <><ChevronDown className="w-3 h-3" /> Ver ciência + pesquisa</>
        )}
      </button>
    </motion.div>
  );
};

export default NutrientTimingCard;
