import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Check, ChevronRight, Dumbbell, Clock, Droplets, Trophy, Calendar } from "lucide-react";
import PeakWeekManager from "@/components/nutrisync/PeakWeekManager";
import BottomNav from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import {
  useWorkoutSchedule,
  WORKOUT_TYPES,
  DAY_NAMES,
  DAY_NAMES_FULL,
  getWorkoutAdjustment,
  getMealSuggestionsByTime,
  type WorkoutType,
  type WorkoutTime,
  type WorkoutScheduleEntry,
} from "@/hooks/useWorkoutSchedule";

const WORKOUT_TIME_LABELS: Record<WorkoutTime, { label: string; emoji: string; hour: string }> = {
  morning: { label: "Manhã", emoji: "🌅", hour: "6h–10h" },
  afternoon: { label: "Tarde", emoji: "☀️", hour: "11h–16h" },
  night: { label: "Noite", emoji: "🌙", hour: "17h–22h" },
};

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120];

const NutriSyncPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { schedule, todayLog, loading, saveDay, completeWorkout, getTodayWorkout } = useWorkoutSchedule();
  const [activeTab, setActiveTab] = useState<"today" | "schedule" | "peak">("today");
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<WorkoutScheduleEntry>>({});
  const [saving, setSaving] = useState(false);

  const todayWorkout = getTodayWorkout();
  const todayDow = new Date().getDay();
  const weightKg = profile?.weight_kg || 70;

  const adjustment = useMemo(() => {
    if (!todayWorkout) return getWorkoutAdjustment("rest", weightKg);
    return getWorkoutAdjustment(todayWorkout.workout_type as WorkoutType, weightKg);
  }, [todayWorkout, weightKg]);

  const baseKcal = profile?.vet_kcal || 2000;
  const baseProtein = profile?.protein_g || 150;
  const baseCarbs = profile?.carbs_g || 250;
  const baseFat = profile?.fat_g || 65;

  const adjustedKcal = Math.round(baseKcal * adjustment.kcalMultiplier);
  const adjustedProtein = Math.round(adjustment.proteinPerKg * weightKg);
  const adjustedCarbs = Math.round(baseCarbs * adjustment.carbsMultiplier);
  const adjustedFat = Math.round(baseFat * adjustment.fatMultiplier);
  const kcalDiff = adjustedKcal - baseKcal;

  const mealSuggestions = useMemo(() => {
    if (!todayWorkout) return getMealSuggestionsByTime("morning", "rest");
    return getMealSuggestionsByTime(todayWorkout.workout_time as WorkoutTime, todayWorkout.workout_type as WorkoutType);
  }, [todayWorkout]);

  const handleStartEdit = (dayOfWeek: number) => {
    const existing = schedule.find(s => s.day_of_week === dayOfWeek);
    setEditForm({
      day_of_week: dayOfWeek,
      workout_type: existing?.workout_type || "rest",
      workout_time: existing?.workout_time || "morning",
      duration_minutes: existing?.duration_minutes || 60,
    });
    setEditingDay(dayOfWeek);
  };

  const handleSave = async () => {
    if (editingDay === null) return;
    setSaving(true);
    await saveDay(editForm as WorkoutScheduleEntry);
    setSaving(false);
    setEditingDay(null);
  };

  const wType = todayWorkout ? WORKOUT_TYPES[todayWorkout.workout_type as WorkoutType] : null;
  const wTime = todayWorkout ? WORKOUT_TIME_LABELS[todayWorkout.workout_time as WorkoutTime] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
              <h1 className="text-lg font-bold text-foreground">NutriSync</h1>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Nutrição que acompanha seu treino</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-card rounded-xl p-1 border border-border">
          {([
            { key: "today", label: "Hoje", icon: Zap },
            { key: "schedule", label: "Rotina", icon: Calendar },
            { key: "peak", label: "Peak Week", icon: Trophy },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === tab.key
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
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
            {/* Today's workout card */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">⚡ Treino de Hoje — {DAY_NAMES_FULL[todayDow]}</p>
                {todayWorkout && wType ? (
                  <>
                    <h2 className="text-xl font-bold text-foreground mb-1">
                      {wType.emoji} {wType.label}
                    </h2>
                    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                      <span>{wTime?.emoji} {wTime?.label}</span>
                      <span>·</span>
                      <span><Clock className="w-3 h-3 inline mr-1" />{todayWorkout.duration_minutes} min</span>
                    </div>
                    <p className="text-xs text-primary/80 font-mono mt-3 leading-relaxed">{adjustment.tip}</p>

                    {!todayLog?.completed && (
                      <button
                        onClick={completeWorkout}
                        className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
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
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className="mt-3 text-xs text-primary font-mono underline"
                    >
                      Configurar rotina de treino →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Adjusted Macros Banner */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Meta Nutricional Ajustada</h3>
              </div>
              {kcalDiff > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-2 mb-3 text-center">
                  <span className="text-xs font-mono text-primary">
                    +{kcalDiff} kcal ajustado para {adjustment.label.split("—")[0].trim().toLowerCase()}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Calorias", value: adjustedKcal, unit: "kcal", emoji: "🔥", diff: kcalDiff > 0 ? `+${kcalDiff}` : null },
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

            {/* Meal Suggestions by Training Window */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold text-foreground">Refeições por Janela de Treino</h3>
              </div>
              <div className="space-y-2">
                {mealSuggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      (s as any).highlight
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold text-primary w-10">{s.time}</span>
                    <div className="flex-1">
                      <p className="text-xs text-foreground font-mono">{s.meal}</p>
                    </div>
                    {(s as any).highlight && <Zap className="w-3.5 h-3.5 text-primary" />}
                  </motion.div>
                ))}
              </div>
              {todayWorkout && (
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">🍌 Pré-Treino Ideal</p>
                    <p className="text-xs font-mono text-foreground">{adjustment.preMeal}</p>
                  </div>
                  <div className="rounded-lg bg-accent/5 border border-accent/10 p-3">
                    <p className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">💪 Pós-Treino Ideal</p>
                    <p className="text-xs font-mono text-foreground">{adjustment.postMeal}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notification-style cards */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">🔔 Alertas do Dia</p>
              {todayWorkout && todayWorkout.workout_type !== "rest" ? (
                <>
                  <div className="rounded-xl border border-primary/10 bg-card p-3 flex items-start gap-3">
                    <span className="text-lg">⏰</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">90 min antes do treino</p>
                      <p className="text-[11px] text-muted-foreground font-mono">Hora do pré-treino. {adjustment.preMeal}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-accent/10 bg-card p-3 flex items-start gap-3">
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">30 min após treino</p>
                      <p className="text-[11px] text-muted-foreground font-mono">Janela anabólica aberta. {adjustment.postMeal}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 flex items-start gap-3">
                    <span className="text-lg">🌙</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">Ao fim do dia</p>
                      <p className="text-[11px] text-muted-foreground font-mono">Bata sua meta de {adjustedProtein}g proteína para recuperação otimizada.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-border bg-card p-3 flex items-start gap-3">
                  <span className="text-lg">😴</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Dia de recuperação</p>
                    <p className="text-[11px] text-muted-foreground font-mono">Foco em proteína e descanso. Seu corpo está reconstruindo.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === "schedule" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-xs text-muted-foreground font-mono mb-2">Configure o treino de cada dia. A nutrição se ajusta automaticamente.</p>
            {[0, 1, 2, 3, 4, 5, 6].map(dow => {
              const entry = schedule.find(s => s.day_of_week === dow);
              const wt = entry ? WORKOUT_TYPES[entry.workout_type as WorkoutType] : WORKOUT_TYPES.rest;
              const isToday = dow === todayDow;

              return (
                <div key={dow}>
                  <button
                    onClick={() => handleStartEdit(dow)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      isToday ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-bold w-8 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                          {DAY_NAMES[dow]}
                        </span>
                        <span className="text-lg">{wt.emoji}</span>
                        <div>
                          <p className="text-sm font-mono text-foreground">{wt.label}</p>
                          {entry && entry.workout_type !== "rest" && (
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {WORKOUT_TIME_LABELS[entry.workout_time as WorkoutTime]?.label} · {entry.duration_minutes} min
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    {isToday && (
                      <span className="inline-block mt-2 text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">HOJE</span>
                    )}
                  </button>

                  {/* Edit Panel */}
                  <AnimatePresence>
                    {editingDay === dow && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-primary/20 bg-card p-4 mt-2 space-y-4">
                          <div>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Tipo de treino</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(Object.entries(WORKOUT_TYPES) as [WorkoutType, typeof WORKOUT_TYPES[WorkoutType]][]).map(([key, val]) => (
                                <button
                                  key={key}
                                  onClick={() => setEditForm(f => ({ ...f, workout_type: key }))}
                                  className={`text-left p-2 rounded-lg border text-xs font-mono transition-all ${
                                    editForm.workout_type === key
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border text-muted-foreground hover:border-primary/20"
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
                                        editForm.workout_time === key
                                          ? "border-primary bg-primary/10 text-primary"
                                          : "border-border text-muted-foreground"
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
                                        editForm.duration_minutes === d
                                          ? "border-primary bg-primary/10 text-primary"
                                          : "border-border text-muted-foreground"
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
                            <button
                              onClick={() => setEditingDay(null)}
                              className="flex-1 py-2.5 rounded-xl border border-border text-xs font-mono text-muted-foreground"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50"
                            >
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
        {activeTab === "peak" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center">
              <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-2">Modo Competição / Peak Week</h2>
              <p className="text-xs font-mono text-muted-foreground mb-4 leading-relaxed">
                Protocolo de semana de pico com manipulação automática de carboidrato (depleção → supercompensação),
                sódio, água e calorias por fase do dia.
              </p>
              <div className="space-y-2 text-left">
                {[
                  "📉 Depleção de carboidrato (Dias 1-3)",
                  "📈 Supercompensação (Dias 4-6)",
                  "💧 Manipulação de água e sódio",
                  "✅ Checklist diário de protocolo",
                  "⏰ Countdown para o evento",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border">
                    <span className="text-xs font-mono text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-card border border-border p-4">
                <Dumbbell className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs font-mono text-muted-foreground">Em breve — Configure sua data de competição para ativar.</p>
              </div>
            </div>

            {/* Wearables future integration */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⌚</span>
                <h3 className="text-sm font-bold text-foreground">Integração com Wearables</h3>
              </div>
              <p className="text-xs font-mono text-muted-foreground mb-3">
                Estrutura preparada para receber dados de Apple Health, Google Fit, Garmin e Polar.
                Ajuste automático de calorias por gasto real do treino.
              </p>
              <div className="flex gap-2 flex-wrap">
                {["Apple Health", "Google Fit", "Garmin", "Polar"].map(w => (
                  <span key={w} className="text-[10px] font-mono text-muted-foreground bg-background border border-border rounded-full px-3 py-1">{w}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default NutriSyncPage;
