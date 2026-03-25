import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Check, ChevronRight, Dumbbell, Clock, Droplets, Trophy, Calendar, History, Plus, Trash2, Target, Pill, AlertTriangle, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import PeakWeekManager from "@/components/nutrisync/PeakWeekManager";
import NutriSyncAnalysisTab from "@/components/nutrisync/NutriSyncAnalysisTab";
import BottomNav from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import {
  useWorkoutSchedule,
  WORKOUT_TYPES,
  DAY_NAMES,
  DAY_NAMES_FULL,
  getWorkoutAdjustment,
  combineAdjustments,
  getMealSuggestionsMultiWorkout,
  generateDayTimeline,
  isDuploTreino,
  type WorkoutType,
  type WorkoutTime,
  type WorkoutScheduleEntry,
} from "@/hooks/useWorkoutSchedule";

const WORKOUT_TIME_LABELS: Record<WorkoutTime, { label: string; emoji: string; hour: string }> = {
  morning: { label: "Manhã", emoji: "🌅", hour: "6h–10h" },
  afternoon: { label: "Tarde", emoji: "☀️", hour: "11h–16h" },
  night: { label: "Noite", emoji: "🌙", hour: "17h–22h" },
};

const DURATION_OPTIONS = [20, 30, 45, 60, 75, 90, 120];

const OBJETIVO_OPTIONS = [
  { key: "bulking", label: "Bulking", emoji: "🍗" },
  { key: "cutting", label: "Cutting", emoji: "✂️" },
  { key: "manutencao", label: "Manutenção", emoji: "⚖️" },
] as const;

const NutriSyncPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { schedule, todayLog, loading, saveDay, removeSlot, completeWorkout, getTodayWorkouts, getWorkoutsForDay, getWeeklyKcalPlan, getNextRestDay } = useWorkoutSchedule();
  const [activeTab, setActiveTab] = useState<"today" | "timeline" | "schedule" | "analysis" | "peak">("today");
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<WorkoutScheduleEntry>>({});
  const [saving, setSaving] = useState(false);
  const [objetivo, setObjetivo] = useState<"bulking" | "cutting" | "manutencao">(
    (profile?.goal === "emagrecer" ? "cutting" : profile?.goal === "ganhar_massa" ? "bulking" : "manutencao") as any
  );
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null);
  const [preWorkoutDone, setPreWorkoutDone] = useState(false);
  const [postWorkoutDone, setPostWorkoutDone] = useState(false);
  const [nextMealCountdown, setNextMealCountdown] = useState("");

  const todayWorkouts = getTodayWorkouts();
  const todayDow = new Date().getDay();
  const weightKg = profile?.weight_kg || 70;

  const adjustment = useMemo(() => combineAdjustments(todayWorkouts, weightKg), [todayWorkouts, weightKg]);

  const baseKcal = profile?.vet_kcal || profile?.get_kcal || 2000;
  const baseProtein = profile?.protein_g || 150;
  const baseCarbs = profile?.carbs_g || 250;
  const baseFat = profile?.fat_g || 65;

  const dayTimeline = useMemo(() => generateDayTimeline(todayWorkouts, weightKg, objetivo, baseKcal), [todayWorkouts, weightKg, objetivo, baseKcal]);

  const adjustedKcal = dayTimeline.macros.kcal;
  const adjustedProtein = dayTimeline.macros.protein;
  const adjustedCarbs = dayTimeline.macros.carbs;
  const adjustedFat = dayTimeline.macros.fat;
  const kcalDiff = adjustedKcal - baseKcal;

  const weeklyPlan = useMemo(() => getWeeklyKcalPlan(baseKcal, weightKg, objetivo), [schedule, baseKcal, weightKg, objetivo]);

  // Next meal countdown timer
  useEffect(() => {
    if (dayTimeline.items.length === 0) return;
    const updateCountdown = () => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const mealItems = dayTimeline.items.filter(i => i.type === "meal");
      const next = mealItems.find(i => {
        const [h, m] = i.time.split(":").map(Number);
        return h * 60 + m > nowMinutes;
      });
      if (next) {
        const [h, m] = next.time.split(":").map(Number);
        const diff = (h * 60 + m) - nowMinutes;
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        setNextMealCountdown(hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`);
      } else {
        setNextMealCountdown("");
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [dayTimeline]);

  const handleStartEdit = (dayOfWeek: number, slot: number, existing?: WorkoutScheduleEntry) => {
    setEditForm({
      day_of_week: dayOfWeek,
      workout_type: existing?.workout_type || "rest",
      workout_time: existing?.workout_time || "morning",
      duration_minutes: existing?.duration_minutes || 60,
      slot,
    });
    setEditingDay(dayOfWeek);
    setEditingSlot(slot);
  };

  const handleAddSlot = (dayOfWeek: number) => {
    const dayEntries = getWorkoutsForDay(dayOfWeek);
    const nextSlot = dayEntries.length > 0 ? Math.max(...dayEntries.map(e => e.slot || 1)) + 1 : 1;
    handleStartEdit(dayOfWeek, nextSlot);
  };

  const handleRemoveSlot = async (dayOfWeek: number, slot: number) => {
    await removeSlot(dayOfWeek, slot);
    setEditingDay(null);
    setEditingSlot(null);
  };

  const handleSave = async () => {
    if (editingDay === null || editingSlot === null) return;
    setSaving(true);
    await saveDay({ ...editForm, slot: editingSlot } as WorkoutScheduleEntry);
    setSaving(false);
    setEditingDay(null);
    setEditingSlot(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const typeEntries = Object.entries(WORKOUT_TYPES) as [WorkoutType, typeof WORKOUT_TYPES[WorkoutType]][];
  const muscEntries = typeEntries.filter(([, v]) => v.category === "musculacao");
  const cardioEntries = typeEntries.filter(([, v]) => v.category === "cardio");
  const restEntries = typeEntries.filter(([, v]) => v.category === "descanso");

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">NutriSync <span className="text-primary">V2</span></h1>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Nutrição sincronizada com seu treino</p>
          </div>
          <button onClick={() => navigate("/workout-history")} className="p-2 rounded-lg border border-border bg-card hover:border-primary/30">
            <History className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Objetivo Selector */}
        <div className="flex gap-1 mb-3">
          {OBJETIVO_OPTIONS.map(o => (
            <button
              key={o.key}
              onClick={() => setObjetivo(o.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all border ${
                objetivo === o.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {o.emoji} {o.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-card rounded-xl p-1 border border-border">
          {([
            { key: "today", label: "Hoje", icon: Zap },
            { key: "timeline", label: "Timeline", icon: Clock },
            { key: "schedule", label: "Rotina", icon: Calendar },
            { key: "analysis", label: "Análise", icon: BarChart3 },
            { key: "peak", label: "Peak Week", icon: Trophy },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === tab.key ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TODAY TAB */}
        {activeTab === "today" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Today's workout cards */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">⚡ Treino de Hoje — {DAY_NAMES_FULL[todayDow]}</p>
                {todayWorkouts.length > 0 ? (
                  <>
                    {todayWorkouts.map((w, i) => {
                      const wt = WORKOUT_TYPES[w.workout_type as WorkoutType];
                      const wTime = WORKOUT_TIME_LABELS[w.workout_time as WorkoutTime];
                      return (
                        <div key={i} className={`${i > 0 ? "mt-3 pt-3 border-t border-primary/10" : ""}`}>
                          <h2 className="text-lg font-bold text-foreground">{wt.emoji} {wt.label}</h2>
                          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                            <span>{wTime?.emoji} {wTime?.label}</span>
                            <span>·</span>
                            <span><Clock className="w-3 h-3 inline mr-1" />{w.duration_minutes} min</span>
                            {wt.category === "cardio" && (
                              <>
                                <span>·</span>
                                <span className="text-primary">~{getWorkoutAdjustment(w.workout_type as WorkoutType, weightKg, w.duration_minutes).cardioCalsBurned || 0}kcal</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {dayTimeline.isDoubleDay && (
                      <div className="mt-3 rounded-lg bg-primary/10 border border-primary/20 p-2 text-center">
                        <span className="text-[10px] font-mono text-primary font-bold">
                          🔄 DUPLO TREINO ATIVO — Cardio + Musculação
                        </span>
                      </div>
                    )}

                    {todayWorkouts.length > 1 && !dayTimeline.isDoubleDay && (
                      <div className="mt-3 rounded-lg bg-primary/10 border border-primary/20 p-2 text-center">
                        <span className="text-[10px] font-mono text-primary font-bold">
                          🔥 {todayWorkouts.length} atividades — gasto energético combinado
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-primary/80 font-mono mt-3 leading-relaxed">{adjustment.tip}</p>

                    {!todayLog?.completed && (
                      <button
                        onClick={completeWorkout}
                        className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90"
                      >
                        <Check className="w-4 h-4" /> Marcar treino como concluído
                      </button>
                    )}
                    {todayLog?.completed && (
                      <div className="mt-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                        <span className="text-sm font-mono text-primary font-bold">✅ Treino concluído!</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">😴 Dia de Descanso</h2>
                    <p className="text-xs text-muted-foreground font-mono">{adjustment.tip}</p>
                    <button onClick={() => setActiveTab("schedule")} className="mt-3 text-xs text-primary font-mono underline">
                      Configurar rotina de treino →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Adjusted Macros */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Meta Nutricional — {objetivo.charAt(0).toUpperCase() + objetivo.slice(1)}</h3>
              </div>
              {kcalDiff !== 0 && (
                <div className={`rounded-lg ${kcalDiff > 0 ? "bg-primary/5 border-primary/10" : "bg-destructive/5 border-destructive/10"} border p-2 mb-3 text-center`}>
                  <span className={`text-xs font-mono ${kcalDiff > 0 ? "text-primary" : "text-destructive"}`}>
                    {kcalDiff > 0 ? "+" : ""}{kcalDiff} kcal vs base ({dayTimeline.isDoubleDay ? "duplo treino" : "treino do dia"})
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Calorias", value: adjustedKcal, unit: "kcal", emoji: "🔥", diff: kcalDiff !== 0 ? `${kcalDiff > 0 ? "+" : ""}${kcalDiff}` : null },
                  { label: "Proteína", value: adjustedProtein, unit: "g", emoji: "🥩", diff: adjustedProtein !== baseProtein ? `${adjustedProtein > baseProtein ? "+" : ""}${adjustedProtein - baseProtein}g` : null },
                  { label: "Carboidrato", value: adjustedCarbs, unit: "g", emoji: "🍚", diff: adjustedCarbs !== baseCarbs ? `${adjustedCarbs > baseCarbs ? "+" : ""}${adjustedCarbs - baseCarbs}g` : null },
                  { label: "Gordura", value: adjustedFat, unit: "g", emoji: "🥑", diff: adjustedFat !== baseFat ? `${adjustedFat > baseFat ? "+" : ""}${adjustedFat - baseFat}g` : null },
                ].map(m => (
                  <div key={m.label} className="rounded-xl border border-border bg-background p-3 text-center">
                    <span className="text-lg">{m.emoji}</span>
                    <p className="text-xl font-bold font-mono text-foreground">{m.value}<span className="text-xs text-muted-foreground">{m.unit}</span></p>
                    <p className="text-[10px] font-mono text-muted-foreground">{m.label}</p>
                    {m.diff && <p className="text-[9px] font-mono text-primary mt-0.5">{m.diff}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/10 p-2">
                <Droplets className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono text-foreground">Hidratação: <strong>{adjustment.hydrationLiters}L</strong></span>
              </div>
            </div>

            {/* Quick Alerts */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">🔔 Alertas Proativos</p>
              {dayTimeline.isDoubleDay && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-3">
                  <span className="text-lg">🔄</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Protocolo Duplo Treino</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Carb focado no peri-treino da tarde. Manhã mais leve. Hidratação reforçada {adjustment.hydrationLiters}L.
                    </p>
                  </div>
                </div>
              )}
              {todayWorkouts.some(w => w.workout_type === "legs" || w.workout_type === "lower") && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-3">
                  <span className="text-lg">🦵</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">LEG DAY — Máximo carboidrato!</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Beterraba 2-3h antes. Intra-treino: 50-60g carb. Pós: 60-80g carb rápido.
                    </p>
                  </div>
                </div>
              )}
              {todayWorkouts.some(w => w.workout_type === "cardio_hiit") && todayWorkouts.some(w => (w.workout_type === "legs" || w.workout_type === "lower")) && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-destructive">⚠️ HIIT + Legs no mesmo dia</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Alto stress de SNC. Considere trocar HIIT por Z2 neste dia.
                    </p>
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-border bg-card p-3 flex items-start gap-3">
                <span className="text-lg">🌙</span>
                <div>
                  <p className="text-xs font-bold text-foreground">Ao fim do dia</p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Bata sua meta de {adjustedProtein}g proteína. Caseína antes de dormir se déficit.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === "timeline" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {/* Day Summary */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 mb-3">
              <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">
                {DAY_NAMES_FULL[todayDow]} — {dayTimeline.isDoubleDay ? "🔄 DUPLO TREINO" : todayWorkouts.length > 0 ? WORKOUT_TYPES[todayWorkouts[0].workout_type as WorkoutType]?.label : "😴 Descanso"}
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-foreground mt-2">
                <span>🔥 {adjustedKcal}kcal</span>
                <span>🥩 {adjustedProtein}g</span>
                <span>🍚 {adjustedCarbs}g</span>
                <span>🥑 {adjustedFat}g</span>
              </div>
            </div>

            {/* Timeline Items */}
            <div className="relative">
              <div className="absolute left-5 top-4 bottom-4 w-px bg-border" />
              {dayTimeline.items.map((item, i) => {
                const isExpanded = expandedTimeline === `${i}`;
                const typeColors = {
                  meal: "border-primary/20 bg-primary/5",
                  training: "border-accent/30 bg-accent/10",
                  supplement: "border-muted-foreground/20 bg-muted/10",
                  alert: "border-border bg-card",
                };
                const typeIcons = { meal: "🍽️", training: "🏋️", supplement: "💊", alert: "🔔" };

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative pl-12 mb-2"
                  >
                    {/* Time dot */}
                    <div className={`absolute left-3.5 top-3 w-3 h-3 rounded-full border-2 ${
                      item.highlight ? "border-primary bg-primary" : "border-muted-foreground/30 bg-background"
                    }`} />

                    <button
                      onClick={() => setExpandedTimeline(isExpanded ? null : `${i}`)}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${typeColors[item.type]} ${
                        item.highlight ? "ring-1 ring-primary/20" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-mono font-bold text-primary w-12 flex-shrink-0">{item.time}</span>
                          <span className="text-sm">{item.emoji}</span>
                          <span className="text-xs font-mono text-foreground font-medium truncate">{item.title}</span>
                        </div>
                        {item.macros && (
                          isExpanded
                            ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground mt-1 ml-14">{item.description}</p>

                      <AnimatePresence>
                        {isExpanded && item.macros && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-4 gap-2 mt-3 ml-14">
                              {[
                                { label: "Kcal", value: item.macros.kcal, color: "text-primary" },
                                { label: "Prot", value: `${item.macros.protein}g`, color: "text-foreground" },
                                { label: "Carb", value: `${item.macros.carbs}g`, color: "text-foreground" },
                                { label: "Gord", value: `${item.macros.fat}g`, color: "text-foreground" },
                              ].map(m => (
                                <div key={m.label} className="text-center rounded-lg bg-background/50 border border-border p-1.5">
                                  <p className={`text-xs font-bold font-mono ${m.color}`}>{m.value}</p>
                                  <p className="text-[8px] font-mono text-muted-foreground">{m.label}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Supplement Schedule Summary */}
            {dayTimeline.isDoubleDay && (
              <div className="rounded-2xl border border-muted-foreground/20 bg-card p-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-bold text-foreground">Suplementação Sincronizada</h3>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono text-muted-foreground">
                  <p>06:00 — ☕ Cafeína 200mg + L-Carnitina 1g + Eletrólitos</p>
                  <p>07:30 — 💊 Vit D3 + Ômega-3 + Zinco + Magnésio</p>
                  <p>14:30 — ⚡ Citrulina 6-8g + Cafeína 100mg + Creatina 5g</p>
                  <p>15:30 — 🧃 EAA 10-12g + Carb intra + Taurina 3g</p>
                  <p>17:00 — 💪 Vitamina C 500mg (reduz cortisol pós)</p>
                  <p>21:00 — 🌙 Magnésio 400mg + Ashwagandha + L-Teanina + Glicina</p>
                </div>
              </div>
            )}

            {/* Weekly Overview */}
            <div className="rounded-2xl border border-border bg-card p-4 mt-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">📊 Visão Semanal</p>
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map(dow => {
                  const dayW = getWorkoutsForDay(dow);
                  const isToday = dow === todayDow;
                  const hasDouble = isDuploTreino(dayW);
                  return (
                    <div
                      key={dow}
                      className={`text-center rounded-lg p-2 border ${
                        isToday ? "border-primary bg-primary/10" : "border-border bg-background/50"
                      }`}
                    >
                      <p className={`text-[9px] font-mono font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                        {DAY_NAMES[dow]}
                      </p>
                      {dayW.length > 0 ? (
                        <div className="mt-1 space-y-0.5">
                          {dayW.map((w, wi) => (
                            <p key={wi} className="text-[8px]">{WORKOUT_TYPES[w.workout_type as WorkoutType]?.emoji}</p>
                          ))}
                          {hasDouble && <p className="text-[7px] text-primary font-bold">2x</p>}
                        </div>
                      ) : (
                        <p className="text-[10px] mt-1">😴</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === "schedule" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-xs text-muted-foreground font-mono mb-2">Configure treinos + cardio de cada dia. Adicione múltiplas atividades para duplo treino.</p>
            {[0, 1, 2, 3, 4, 5, 6].map(dow => {
              const dayEntries = getWorkoutsForDay(dow);
              const isToday = dow === todayDow;
              const hasDouble = isDuploTreino(dayEntries);

              return (
                <div key={dow}>
                  <div className={`rounded-xl border p-4 transition-all ${isToday ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold w-8 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                          {DAY_NAMES[dow]}
                        </span>
                        {isToday && <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">HOJE</span>}
                        {hasDouble && <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">🔄 DUPLO</span>}
                      </div>
                      <button
                        onClick={() => handleAddSlot(dow)}
                        className="flex items-center gap-1 text-[10px] font-mono text-primary hover:text-primary/80"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </button>
                    </div>

                    {dayEntries.length === 0 ? (
                      <button onClick={() => handleStartEdit(dow, 1)} className="w-full flex items-center gap-3 py-2 text-left hover:opacity-80">
                        <span className="text-lg">😴</span>
                        <p className="text-sm font-mono text-muted-foreground">Dia de descanso — toque para configurar</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        {dayEntries.map((entry, i) => {
                          const wt = WORKOUT_TYPES[entry.workout_type as WorkoutType];
                          const wTime = WORKOUT_TIME_LABELS[entry.workout_time as WorkoutTime];
                          return (
                            <button
                              key={`${dow}-${entry.slot || i}`}
                              onClick={() => handleStartEdit(dow, entry.slot || i + 1, entry)}
                              className="w-full flex items-center gap-3 py-2 text-left hover:opacity-80 rounded-lg"
                            >
                              <span className="text-lg">{wt.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-mono text-foreground truncate">{wt.shortLabel}</p>
                                <p className="text-[10px] font-mono text-muted-foreground">
                                  {wTime?.emoji} {wTime?.label} · {entry.duration_minutes} min
                                  {wt.category === "cardio" && <span className="text-primary"> · ~{getWorkoutAdjustment(entry.workout_type as WorkoutType, weightKg, entry.duration_minutes).cardioCalsBurned}kcal</span>}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {dayEntries.length > 1 && (
                      <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 p-2 text-center">
                        <span className="text-[10px] font-mono text-primary">
                          {hasDouble ? "🔄 Duplo treino — nutrição sincronizada" : `🔥 ${dayEntries.length} atividades — nutrição combinada`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Edit Panel */}
                  <AnimatePresence>
                    {editingDay === dow && editingSlot !== null && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-primary/20 bg-card p-4 mt-2 space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-mono text-primary uppercase tracking-wider">
                              Atividade {editingSlot} — {DAY_NAMES_FULL[dow]}
                            </p>
                            {dayEntries.length > 0 && editingSlot > 0 && (
                              <button onClick={() => handleRemoveSlot(dow, editingSlot)} className="flex items-center gap-1 text-[10px] font-mono text-destructive hover:text-destructive/80">
                                <Trash2 className="w-3 h-3" /> Remover
                              </button>
                            )}
                          </div>

                          {/* Musculação */}
                          <div>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">💪 Musculação</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {muscEntries.map(([key, val]) => (
                                <button
                                  key={key}
                                  onClick={() => setEditForm(f => ({ ...f, workout_type: key }))}
                                  className={`text-left p-2 rounded-lg border text-xs font-mono transition-all ${
                                    editForm.workout_type === key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/20"
                                  }`}
                                >
                                  {val.emoji} {val.shortLabel}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Cardio */}
                          <div>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">🏃 Cardio</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {cardioEntries.map(([key, val]) => (
                                <button
                                  key={key}
                                  onClick={() => setEditForm(f => ({ ...f, workout_type: key }))}
                                  className={`text-left p-2 rounded-lg border text-xs font-mono transition-all ${
                                    editForm.workout_type === key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/20"
                                  }`}
                                >
                                  {val.emoji} {val.shortLabel}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Descanso */}
                          <div>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">🧘 Descanso</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {restEntries.map(([key, val]) => (
                                <button
                                  key={key}
                                  onClick={() => setEditForm(f => ({ ...f, workout_type: key }))}
                                  className={`text-left p-2 rounded-lg border text-xs font-mono transition-all ${
                                    editForm.workout_type === key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/20"
                                  }`}
                                >
                                  {val.emoji} {val.shortLabel}
                                </button>
                              ))}
                            </div>
                          </div>

                          {editForm.workout_type !== "rest" && (
                            <>
                              <div>
                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Horário</p>
                                <div className="flex gap-2">
                                  {(Object.entries(WORKOUT_TIME_LABELS) as [WorkoutTime, typeof WORKOUT_TIME_LABELS[WorkoutTime]][]).map(([key, val]) => (
                                    <button
                                      key={key}
                                      onClick={() => setEditForm(f => ({ ...f, workout_time: key }))}
                                      className={`flex-1 py-2 rounded-lg border text-xs font-mono text-center transition-all ${
                                        editForm.workout_time === key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                                      }`}
                                    >
                                      {val.emoji} {val.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Duração (min)</p>
                                <div className="flex gap-1.5 flex-wrap">
                                  {DURATION_OPTIONS.map(d => (
                                    <button
                                      key={d}
                                      onClick={() => setEditForm(f => ({ ...f, duration_minutes: d }))}
                                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                                        editForm.duration_minutes === d ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                                      }`}
                                    >
                                      {d}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          <div className="flex gap-2">
                            <button onClick={() => { setEditingDay(null); setEditingSlot(null); }} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-mono text-muted-foreground">
                              Cancelar
                            </button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">
                              {saving ? "Salvando..." : "Salvar"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* PEAK WEEK TAB */}
        {activeTab === "peak" && <PeakWeekManager />}
      </div>
      <BottomNav />
    </div>
  );
};

export default NutriSyncPage;
