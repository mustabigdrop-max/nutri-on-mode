import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Zap, Check, ChevronRight, Clock, Droplets, Trophy, Calendar, History,
  Activity, Target, Flame, AlertTriangle,
} from "lucide-react";
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

// ─── Constants ───────────────────────────────────────────────────────────────

const WORKOUT_TIME_LABELS: Record<WorkoutTime, { label: string; emoji: string; hour: string }> = {
  morning:   { label: "Manhã",  emoji: "🌅", hour: "6h–10h"  },
  afternoon: { label: "Tarde",  emoji: "☀️", hour: "11h–16h" },
  night:     { label: "Noite",  emoji: "🌙", hour: "17h–22h" },
};

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120];

const RPE_COLORS: Record<number, string> = {
  1: "#00f0b4", 2: "#00f0b4", 3: "#7890ff", 4: "#7890ff", 5: "#7890ff",
  6: "#e8a020", 7: "#e8a020", 8: "#ff8c00", 9: "#ff4444", 10: "#ff0000",
};

const RPE_LABELS: Record<number, string> = {
  1: "Muito fácil",   2: "Fácil",       3: "Moderado",
  4: "Moderado+",     5: "Intenso",     6: "Intenso+",
  7: "Muito intenso", 8: "Máximo -1",   9: "Máximo -0",
  10: "Falha total",
};

// Recovery state per muscle group (hours since trained)
const RECOVERY_STATUS = (hours: number | null): { label: string; color: string; bg: string } => {
  if (hours === null)     return { label: "Nunca",       color: "#50507a", bg: "rgba(80,80,122,.12)"  };
  if (hours < 24)         return { label: "Fatigado",    color: "#ff4444", bg: "rgba(255,68,68,.1)"   };
  if (hours < 48)         return { label: "Recuperando", color: "#ff8c00", bg: "rgba(255,140,0,.1)"   };
  if (hours < 72)         return { label: "Descansando", color: "#e8a020", bg: "rgba(232,160,32,.1)"  };
  return                        { label: "Pronto",       color: "#00f0b4", bg: "rgba(0,240,180,.1)"   };
};

const MAJOR_MUSCLES = [
  "Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Quadríceps", "Posterior", "Glúteos",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const VolumeBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <div
        key={i}
        className="h-1.5 flex-1 rounded-full transition-all"
        style={{
          background: i <= score
            ? score >= 5 ? "#ff4444" : score >= 4 ? "#e8a020" : "#00f0b4"
            : "rgba(255,255,255,.06)",
        }}
      />
    ))}
  </div>
);

const RPEBadge = ({ rpe }: { rpe: number }) => (
  <div
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[.58rem] tracking-widest"
    style={{ background: `${RPE_COLORS[rpe]}15`, color: RPE_COLORS[rpe], border: `1px solid ${RPE_COLORS[rpe]}30` }}
  >
    <span>RPE</span>
    <span className="font-bold text-[.7rem]">{rpe}</span>
    <span style={{ color: `${RPE_COLORS[rpe]}80` }}>· {RPE_LABELS[rpe]}</span>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const NutriSyncPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { schedule, todayLog, loading, saveDay, completeWorkout, getTodayWorkout } = useWorkoutSchedule();

  const [activeTab, setActiveTab]       = useState<"today" | "schedule" | "peak">("today");
  const [editingDay, setEditingDay]     = useState<number | null>(null);
  const [editForm, setEditForm]         = useState<Partial<WorkoutScheduleEntry>>({});
  const [saving, setSaving]             = useState(false);
  const [showRpe, setShowRpe]           = useState(false);
  const [selectedRpe, setSelectedRpe]   = useState(8);
  const [confirmingRpe, setConfirmingRpe] = useState(false);

  const todayWorkout = getTodayWorkout();
  const todayDow     = new Date().getDay();
  const weightKg     = profile?.weight_kg || 70;

  const adjustment = useMemo(() => {
    if (!todayWorkout) return getWorkoutAdjustment("rest", weightKg);
    return getWorkoutAdjustment(todayWorkout.workout_type as WorkoutType, weightKg);
  }, [todayWorkout, weightKg]);

  const baseKcal    = profile?.vet_kcal   || 2000;
  const baseProtein = profile?.protein_g  || 150;
  const baseCarbs   = profile?.carbs_g    || 250;
  const baseFat     = profile?.fat_g      || 65;

  const adjustedKcal    = Math.round(baseKcal * adjustment.kcalMultiplier);
  const adjustedProtein = Math.round(adjustment.proteinPerKg * weightKg);
  const adjustedCarbs   = Math.round(baseCarbs * adjustment.carbsMultiplier);
  const adjustedFat     = Math.round(baseFat * adjustment.fatMultiplier);
  const kcalDiff        = adjustedKcal - baseKcal;

  const mealSuggestions = useMemo(() => {
    if (!todayWorkout) return getMealSuggestionsByTime("morning", "rest");
    return getMealSuggestionsByTime(
      todayWorkout.workout_time as WorkoutTime,
      todayWorkout.workout_type as WorkoutType,
    );
  }, [todayWorkout]);

  // Muscle group recovery tracker
  const muscleRecovery = useMemo(() => {
    const now = new Date();
    return MAJOR_MUSCLES.map(muscle => {
      let hoursSince: number | null = null;
      for (let d = 1; d <= 14; d++) {
        const past = new Date(now);
        past.setDate(now.getDate() - d);
        const pastDow = past.getDay();
        const entry = schedule.find(s => s.day_of_week === pastDow);
        if (entry && entry.workout_type !== "rest" && entry.workout_type !== "active_rest") {
          const wt = WORKOUT_TYPES[entry.workout_type as WorkoutType];
          if (wt?.muscleGroups?.includes(muscle)) {
            hoursSince = d * 24;
            break;
          }
        }
      }
      return { muscle, hoursSince, ...RECOVERY_STATUS(hoursSince) };
    });
  }, [schedule]);

  const readinessScore = useMemo(() => {
    const ready = muscleRecovery.filter(m => m.hoursSince === null || m.hoursSince >= 72).length;
    return Math.round((ready / MAJOR_MUSCLES.length) * 10);
  }, [muscleRecovery]);

  // RPE from today's log
  const todayRpe = useMemo(() => {
    if (!todayLog?.notes) return null;
    try { return JSON.parse(todayLog.notes)?.rpe ?? null; } catch { return null; }
  }, [todayLog]);

  const handleCompleteClick = () => setShowRpe(true);

  const handleConfirmRpe = async () => {
    setConfirmingRpe(true);
    await completeWorkout(selectedRpe);
    setConfirmingRpe(false);
    setShowRpe(false);
  };

  const handleStartEdit = (dow: number) => {
    const existing = schedule.find(s => s.day_of_week === dow);
    setEditForm({
      day_of_week: dow,
      workout_type: existing?.workout_type || "rest",
      workout_time: existing?.workout_time || "morning",
      duration_minutes: existing?.duration_minutes || 60,
    });
    setEditingDay(dow);
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
    <div className="min-h-screen pb-24" style={{ background: "#03030a" }}>
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-lg text-[#50507a] hover:text-[#f0edf8] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: "#e8a020" }} />
              <span className="font-heading text-[1.05rem] text-[#f0edf8] tracking-[.05em]">TRAINING</span>
              <span
                className="font-heading text-[1.05rem] tracking-[.05em]"
                style={{ color: "transparent", WebkitTextStroke: "1px #e8a020" }}
              >
                ON
              </span>
            </div>
            <p className="font-mono text-[.52rem] text-[#30306a] tracking-[.22em] uppercase">
              Nutrição adaptativa · nível elite
            </p>
          </div>
          <button
            onClick={() => navigate("/workout-history")}
            className="p-2 rounded-lg border border-[#1c1c32] hover:border-[#e8a020]/30 transition-colors"
          >
            <History className="w-4 h-4 text-[#50507a]" />
          </button>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div
          className="flex gap-1 mb-5 p-1 rounded-xl border"
          style={{ background: "#060610", borderColor: "#1c1c32" }}
        >
          {([
            { key: "today",    label: "Hoje",       icon: Zap     },
            { key: "schedule", label: "Rotina",     icon: Calendar },
            { key: "peak",     label: "Peak Week",  icon: Trophy  },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-mono text-[.6rem] tracking-widest uppercase transition-all"
              style={
                activeTab === tab.key
                  ? { background: "rgba(232,160,32,.1)", color: "#e8a020", border: "1px solid rgba(232,160,32,.2)" }
                  : { color: "#40406a" }
              }
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            TODAY TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "today" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            {/* Training Readiness Score */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: "#060610", border: "1px solid #1c1c32" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-[.52rem] text-[#30306a] tracking-[.22em] uppercase mb-1">
                    Prontidão do sistema
                  </p>
                  <div className="flex items-end gap-2">
                    <span
                      className="font-heading text-[3rem] leading-none"
                      style={{ color: readinessScore >= 7 ? "#00f0b4" : readinessScore >= 4 ? "#e8a020" : "#ff4444" }}
                    >
                      {readinessScore}
                    </span>
                    <span className="font-mono text-[.8rem] text-[#30306a] mb-1.5">/10</span>
                  </div>
                  <p className="font-mono text-[.56rem] text-[#50507a]">
                    {readinessScore >= 8 ? "Corpo pronto — protocolo máximo." :
                     readinessScore >= 5 ? "Recuperação parcial — volume moderado." :
                                          "Acúmulo de fadiga — considere deload."}
                  </p>
                </div>
                <Activity
                  className="w-8 h-8 mt-1"
                  style={{ color: readinessScore >= 7 ? "#00f0b4" : readinessScore >= 4 ? "#e8a020" : "#ff4444" }}
                />
              </div>

              {/* Muscle Recovery Heatmap */}
              <div className="grid grid-cols-4 gap-1.5">
                {muscleRecovery.map(m => (
                  <div
                    key={m.muscle}
                    className="rounded-lg p-2 text-center"
                    style={{ background: m.bg, border: `1px solid ${m.color}25` }}
                  >
                    <p className="font-mono text-[.5rem] text-[#50507a] mb-0.5 truncate">{m.muscle}</p>
                    <p className="font-mono text-[.54rem] font-bold" style={{ color: m.color }}>
                      {m.hoursSince ? `${Math.round(m.hoursSince / 24)}d` : "—"}
                    </p>
                    <p className="font-mono text-[.44rem]" style={{ color: `${m.color}80` }}>{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Workout Card */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ border: `1px solid ${todayWorkout ? "rgba(232,160,32,.25)" : "#1c1c32"}`, background: "#060610" }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: todayWorkout ? "linear-gradient(90deg, transparent, rgba(232,160,32,.6), transparent)" : "none" }}
              />
              <p className="font-mono text-[.52rem] text-[#e8a020]/60 tracking-[.22em] uppercase mb-3">
                ⚡ {DAY_NAMES_FULL[todayDow]} · Protocolo de treino
              </p>

              {todayWorkout && wType ? (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-heading text-[1.3rem] text-[#f0edf8] leading-none mb-1">
                        {wType.emoji} {wType.shortLabel}
                      </h2>
                      <p className="font-mono text-[.56rem] text-[#50507a]">{wType.label}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[.5rem] text-[#30306a] mb-1 uppercase tracking-wider">Estresse</div>
                      <VolumeBar score={wType.volumeScore} />
                      <p className="font-mono text-[.48rem] text-[#30306a] mt-0.5">
                        {wType.volumeScore}/5 · vol score
                      </p>
                    </div>
                  </div>

                  {/* Muscle groups */}
                  {wType.muscleGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {wType.muscleGroups.map(mg => (
                        <span
                          key={mg}
                          className="font-mono text-[.48rem] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(232,160,32,.08)", color: "#e8a020", border: "1px solid rgba(232,160,32,.15)" }}
                        >
                          {mg}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[.58rem] font-mono text-[#50507a] mb-3">
                    <span>{wTime?.emoji} {wTime?.label} · {wTime?.hour}</span>
                    <span>·</span>
                    <span><Clock className="w-3 h-3 inline mr-1" />{todayWorkout.duration_minutes} min</span>
                    <span>·</span>
                    <span>Rec: {adjustment.recoveryHours}h</span>
                  </div>

                  <div
                    className="rounded-lg p-3 mb-4"
                    style={{ background: "rgba(232,160,32,.04)", border: "1px solid rgba(232,160,32,.1)" }}
                  >
                    <p className="font-mono text-[.6rem] text-[#a08040] leading-relaxed">💡 {adjustment.tip}</p>
                  </div>

                  {/* RPE flow */}
                  {!todayLog?.completed && !showRpe && (
                    <button
                      onClick={handleCompleteClick}
                      className="w-full py-3.5 rounded-xl font-heading text-[.85rem] tracking-[.08em] transition-all hover:scale-[1.01] active:scale-[.98]"
                      style={{
                        background: "#e8a020",
                        color: "#030310",
                        boxShadow: "0 0 20px rgba(232,160,32,.25)",
                        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                      }}
                    >
                      <Check className="w-4 h-4 inline mr-2" />
                      MARCAR COMO CONCLUÍDO
                    </button>
                  )}

                  {/* RPE Selector */}
                  <AnimatePresence>
                    {showRpe && !todayLog?.completed && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-xl p-4"
                        style={{ background: "#0a0a18", border: "1px solid #1c1c32" }}
                      >
                        <p className="font-mono text-[.52rem] text-[#50507a] tracking-[.2em] uppercase mb-1">
                          RPE — Rate of Perceived Exertion
                        </p>
                        <p className="font-mono text-[.6rem] text-[#f0edf8]/50 mb-3">
                          Como você saiu do treino de hoje?
                        </p>
                        <div className="flex gap-1.5 mb-3 flex-wrap">
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <button
                              key={n}
                              onClick={() => setSelectedRpe(n)}
                              className="flex-1 min-w-[40px] py-2.5 rounded-lg font-heading text-[.9rem] transition-all"
                              style={
                                selectedRpe === n
                                  ? { background: RPE_COLORS[n], color: "#030310" }
                                  : { background: "rgba(255,255,255,.04)", color: RPE_COLORS[n], border: `1px solid ${RPE_COLORS[n]}30` }
                              }
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        <p className="font-mono text-[.6rem] text-center mb-3" style={{ color: RPE_COLORS[selectedRpe] }}>
                          RPE {selectedRpe} · {RPE_LABELS[selectedRpe]}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowRpe(false)}
                            className="flex-1 py-2.5 rounded-xl font-mono text-[.6rem] text-[#50507a] border border-[#1c1c32]"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleConfirmRpe}
                            disabled={confirmingRpe}
                            className="flex-1 py-2.5 rounded-xl font-heading text-[.75rem] tracking-[.06em] disabled:opacity-50 transition-all"
                            style={{ background: "#e8a020", color: "#030310" }}
                          >
                            {confirmingRpe ? "Salvando..." : "CONFIRMAR ✓"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {todayLog?.completed && (
                    <div
                      className="py-3 rounded-xl text-center"
                      style={{ background: "rgba(0,240,180,.06)", border: "1px solid rgba(0,240,180,.2)" }}
                    >
                      <span className="font-mono text-[.65rem] text-[#00f0b4] font-bold tracking-wider">
                        ✅ TREINO CONCLUÍDO
                      </span>
                      {todayRpe && (
                        <div className="mt-2 flex justify-center">
                          <RPEBadge rpe={todayRpe} />
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <h2 className="font-heading text-[1.3rem] text-[#f0edf8] mb-1">😴 Dia de Descanso</h2>
                  <p className="font-mono text-[.6rem] text-[#50507a] leading-relaxed">{adjustment.tip}</p>
                  <button
                    onClick={() => setActiveTab("schedule")}
                    className="mt-3 font-mono text-[.6rem] text-[#e8a020]/60 hover:text-[#e8a020] transition-colors"
                  >
                    Configurar rotina →
                  </button>
                </div>
              )}
            </div>

            {/* Macro Protocol */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#060610", border: "1px solid #1c1c32" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4" style={{ color: "#e8a020" }} />
                <span className="font-mono text-[.58rem] text-[#f0edf8]/60 tracking-[.15em] uppercase">
                  Protocolo Nutricional Ajustado
                </span>
                {kcalDiff > 0 && (
                  <span
                    className="ml-auto font-mono text-[.52rem] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(232,160,32,.1)", color: "#e8a020" }}
                  >
                    +{kcalDiff} kcal
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "Calorias", value: adjustedKcal, unit: "kcal", color: "#e8a020", diff: kcalDiff },
                  { label: "Proteína", value: adjustedProtein, unit: "g", color: "#00f0b4", diff: adjustedProtein - baseProtein },
                  { label: "Carboidrato", value: adjustedCarbs, unit: "g", color: "#7890ff", diff: adjustedCarbs - baseCarbs },
                  { label: "Gordura", value: adjustedFat, unit: "g", color: "#ff8c00", diff: adjustedFat - baseFat },
                ].map(m => (
                  <div
                    key={m.label}
                    className="rounded-xl p-3 text-center"
                    style={{ background: `${m.color}08`, border: `1px solid ${m.color}15` }}
                  >
                    <p className="font-heading text-[1.3rem] leading-none mb-0.5" style={{ color: m.color }}>
                      {m.value}
                    </p>
                    <p className="font-mono text-[.44rem] text-[#50507a] uppercase tracking-wider">{m.unit}</p>
                    <p className="font-mono text-[.48rem] text-[#30306a] mt-0.5">{m.label}</p>
                    {m.diff !== 0 && (
                      <p className="font-mono text-[.44rem] mt-0.5" style={{ color: `${m.color}70` }}>
                        {m.diff > 0 ? "+" : ""}{m.diff}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div
                className="flex items-center gap-2 rounded-lg p-2.5 mb-3"
                style={{ background: "rgba(0,240,180,.05)", border: "1px solid rgba(0,240,180,.1)" }}
              >
                <Droplets className="w-4 h-4 flex-shrink-0" style={{ color: "#00f0b4" }} />
                <span className="font-mono text-[.6rem] text-[#f0edf8]/60">
                  Hidratação: <strong className="text-[#00f0b4]">{adjustment.hydrationLiters}L</strong>
                  <span className="text-[#30306a]"> · {Math.round(adjustment.hydrationLiters * 1000 / 250)} copos</span>
                </span>
              </div>

              {adjustment.electrolytes && (
                <div
                  className="flex items-start gap-2 rounded-lg p-2.5"
                  style={{ background: "rgba(120,144,255,.05)", border: "1px solid rgba(120,144,255,.12)" }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#7890ff" }} />
                  <p className="font-mono text-[.56rem] leading-relaxed" style={{ color: "#7890ff" }}>
                    <span className="font-bold uppercase tracking-wider">Eletrólitos · </span>
                    {adjustment.electrolytes}
                  </p>
                </div>
              )}
            </div>

            {/* Nutrition Timeline */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#060610", border: "1px solid #1c1c32" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" style={{ color: "#7890ff" }} />
                <span className="font-mono text-[.58rem] text-[#f0edf8]/60 tracking-[.15em] uppercase">
                  Timeline Nutricional
                </span>
              </div>

              {/* Pre/Intra/Post specific cards for training days */}
              {todayWorkout && todayWorkout.workout_type !== "rest" && (
                <div className="space-y-2 mb-4">
                  <div
                    className="rounded-lg p-3"
                    style={{ background: "rgba(232,160,32,.05)", border: "1px solid rgba(232,160,32,.12)" }}
                  >
                    <p className="font-mono text-[.48rem] text-[#e8a020]/60 uppercase tracking-wider mb-1">🍌 PRÉ-TREINO</p>
                    <p className="font-mono text-[.62rem] text-[#a08040] leading-relaxed">{adjustment.preMeal}</p>
                  </div>
                  {adjustment.intraMeal && (
                    <div
                      className="rounded-lg p-3"
                      style={{ background: "rgba(120,144,255,.05)", border: "1px solid rgba(120,144,255,.12)" }}
                    >
                      <p className="font-mono text-[.48rem] text-[#7890ff]/60 uppercase tracking-wider mb-1">⚡ INTRA-TREINO</p>
                      <p className="font-mono text-[.62rem] leading-relaxed" style={{ color: "#7890ff" }}>{adjustment.intraMeal}</p>
                    </div>
                  )}
                  <div
                    className="rounded-lg p-3"
                    style={{ background: "rgba(0,240,180,.05)", border: "1px solid rgba(0,240,180,.12)" }}
                  >
                    <p className="font-mono text-[.48rem] text-[#00f0b4]/60 uppercase tracking-wider mb-1">💪 PÓS-TREINO</p>
                    <p className="font-mono text-[.62rem] text-[#00a070] leading-relaxed">{adjustment.postMeal}</p>
                  </div>
                </div>
              )}

              {/* Hourly meal plan */}
              <div className="space-y-1.5">
                {mealSuggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={
                      (s as any).highlight
                        ? { background: "rgba(232,160,32,.06)", border: "1px solid rgba(232,160,32,.15)" }
                        : { background: "rgba(255,255,255,.02)", border: "1px solid #1c1c32" }
                    }
                  >
                    <span className="font-mono text-[.56rem] font-bold w-10 flex-shrink-0" style={{ color: (s as any).highlight ? "#e8a020" : "#40406a" }}>
                      {s.time}
                    </span>
                    <p className="font-mono text-[.6rem] text-[#a0a0c0] flex-1 leading-relaxed">{s.meal}</p>
                    {(s as any).highlight && <Zap className="w-3 h-3 flex-shrink-0" style={{ color: "#e8a020" }} />}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Day alerts */}
            <div className="space-y-2">
              <p className="font-mono text-[.5rem] text-[#30306a] tracking-[.2em] uppercase">Alertas do dia</p>
              {todayWorkout && todayWorkout.workout_type !== "rest" ? (
                <>
                  <div
                    className="rounded-xl p-3 flex items-start gap-3"
                    style={{ background: "#060610", border: "1px solid rgba(232,160,32,.1)" }}
                  >
                    <span className="text-base">⏰</span>
                    <div>
                      <p className="font-mono text-[.62rem] font-bold text-[#f0edf8]/80">90 min antes do treino</p>
                      <p className="font-mono text-[.56rem] text-[#50507a] leading-relaxed">{adjustment.preMeal}</p>
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-3 flex items-start gap-3"
                    style={{ background: "#060610", border: "1px solid rgba(0,240,180,.1)" }}
                  >
                    <span className="text-base">✅</span>
                    <div>
                      <p className="font-mono text-[.62rem] font-bold text-[#f0edf8]/80">Janela anabólica — 30–60min pós</p>
                      <p className="font-mono text-[.56rem] text-[#50507a] leading-relaxed">{adjustment.postMeal}</p>
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-3 flex items-start gap-3"
                    style={{ background: "#060610", border: "1px solid #1c1c32" }}
                  >
                    <Flame className="w-4 h-4 text-[#e8a020] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-mono text-[.62rem] font-bold text-[#f0edf8]/80">Meta do dia</p>
                      <p className="font-mono text-[.56rem] text-[#50507a]">
                        {adjustedProtein}g proteína · {adjustedKcal} kcal · {adjustment.hydrationLiters}L água
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="rounded-xl p-3 flex items-start gap-3"
                  style={{ background: "#060610", border: "1px solid #1c1c32" }}
                >
                  <span className="text-base">😴</span>
                  <div>
                    <p className="font-mono text-[.62rem] font-bold text-[#f0edf8]/80">Dia de supercompensação</p>
                    <p className="font-mono text-[.56rem] text-[#50507a] leading-relaxed">
                      O músculo cresce no descanso. Proteína distribuída + sono ≥8h.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SCHEDULE TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "schedule" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="font-mono text-[.56rem] text-[#30306a] tracking-[.08em] leading-relaxed mb-2">
              Configure cada dia. A nutrição e os eletrólitos se ajustam automaticamente por tipo de treino.
            </p>

            {[0, 1, 2, 3, 4, 5, 6].map(dow => {
              const entry = schedule.find(s => s.day_of_week === dow);
              const wt    = entry ? WORKOUT_TYPES[entry.workout_type as WorkoutType] : WORKOUT_TYPES.rest;
              const isToday = dow === todayDow;

              return (
                <div key={dow}>
                  <button
                    onClick={() => handleStartEdit(dow)}
                    className="w-full rounded-xl p-4 text-left transition-all"
                    style={
                      isToday
                        ? { border: "1px solid rgba(232,160,32,.3)", background: "rgba(232,160,32,.04)" }
                        : { border: "1px solid #1c1c32", background: "#060610" }
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="font-mono text-[.62rem] font-bold w-8"
                          style={{ color: isToday ? "#e8a020" : "#40406a" }}
                        >
                          {DAY_NAMES[dow]}
                        </span>
                        <span className="text-lg">{wt.emoji}</span>
                        <div>
                          <p className="font-mono text-[.68rem] text-[#f0edf8]/80">{wt.shortLabel}</p>
                          {entry && entry.workout_type !== "rest" && (
                            <>
                              <p className="font-mono text-[.5rem] text-[#40406a]">
                                {WORKOUT_TIME_LABELS[entry.workout_time as WorkoutTime]?.label} · {entry.duration_minutes} min
                              </p>
                              {wt.muscleGroups.length > 0 && (
                                <p className="font-mono text-[.44rem] text-[#30306a] mt-0.5">
                                  {wt.muscleGroups.join(" · ")}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {entry && entry.workout_type !== "rest" && (
                          <div className="w-16">
                            <VolumeBar score={wt.volumeScore} />
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-[#30306a]" />
                      </div>
                    </div>
                    {isToday && (
                      <span
                        className="inline-block mt-2 font-mono text-[.48rem] px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(232,160,32,.1)", color: "#e8a020" }}
                      >
                        HOJE
                      </span>
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
                        <div
                          className="rounded-xl p-4 mt-2 space-y-4"
                          style={{ border: "1px solid rgba(232,160,32,.2)", background: "#06060e" }}
                        >
                          <div>
                            <p className="font-mono text-[.5rem] text-[#30306a] uppercase tracking-[.2em] mb-2">Tipo de treino</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(Object.entries(WORKOUT_TYPES) as [WorkoutType, (typeof WORKOUT_TYPES)[WorkoutType]][]).map(([key, val]) => (
                                <button
                                  key={key}
                                  onClick={() => setEditForm(f => ({ ...f, workout_type: key }))}
                                  className="text-left p-2.5 rounded-lg font-mono text-[.58rem] transition-all"
                                  style={
                                    editForm.workout_type === key
                                      ? { border: "1px solid #e8a020", background: "rgba(232,160,32,.08)", color: "#e8a020" }
                                      : { border: "1px solid #1c1c32", color: "#40406a" }
                                  }
                                >
                                  {val.emoji} {val.shortLabel}
                                </button>
                              ))}
                            </div>
                          </div>

                          {editForm.workout_type !== "rest" && (
                            <>
                              <div>
                                <p className="font-mono text-[.5rem] text-[#30306a] uppercase tracking-[.2em] mb-2">Horário</p>
                                <div className="flex gap-2">
                                  {(Object.entries(WORKOUT_TIME_LABELS) as [WorkoutTime, typeof WORKOUT_TIME_LABELS[WorkoutTime]][]).map(([key, val]) => (
                                    <button
                                      key={key}
                                      onClick={() => setEditForm(f => ({ ...f, workout_time: key }))}
                                      className="flex-1 py-2 rounded-lg font-mono text-[.58rem] text-center transition-all"
                                      style={
                                        editForm.workout_time === key
                                          ? { border: "1px solid #e8a020", background: "rgba(232,160,32,.08)", color: "#e8a020" }
                                          : { border: "1px solid #1c1c32", color: "#40406a" }
                                      }
                                    >
                                      {val.emoji} {val.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className="font-mono text-[.5rem] text-[#30306a] uppercase tracking-[.2em] mb-2">Duração (min)</p>
                                <div className="flex gap-1.5 flex-wrap">
                                  {DURATION_OPTIONS.map(d => (
                                    <button
                                      key={d}
                                      onClick={() => setEditForm(f => ({ ...f, duration_minutes: d }))}
                                      className="px-3 py-1.5 rounded-lg font-mono text-[.58rem] transition-all"
                                      style={
                                        editForm.duration_minutes === d
                                          ? { border: "1px solid #e8a020", background: "rgba(232,160,32,.08)", color: "#e8a020" }
                                          : { border: "1px solid #1c1c32", color: "#40406a" }
                                      }
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
                              className="flex-1 py-2.5 rounded-xl font-mono text-[.6rem] text-[#40406a] transition-colors"
                              style={{ border: "1px solid #1c1c32" }}
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="flex-1 py-2.5 rounded-xl font-heading text-[.75rem] tracking-[.06em] disabled:opacity-50 transition-all"
                              style={{ background: "#e8a020", color: "#030310" }}
                            >
                              {saving ? "Salvando..." : "SALVAR"}
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

        {/* ══════════════════════════════════════════════════════════════
            PEAK WEEK TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "peak" && <PeakWeekManager />}
      </div>
      <BottomNav />
    </div>
  );
};

export default NutriSyncPage;
