import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, ChevronRight, Plus, Trash2, Check, Zap } from "lucide-react";
import PeakWeekManager from "@/components/nutrisync/PeakWeekManager";
import BottomNav from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import {
  useWorkoutSchedule,
  WORKOUT_TYPES,
  DAY_NAMES,
  DAY_NAMES_FULL,
  getWorkoutAdjustment,
  combineAdjustments,
  getMealSuggestionsByTime,
  type WorkoutType,
  type WorkoutTime,
  type WorkoutScheduleEntry,
} from "@/hooks/useWorkoutSchedule";

// ──────────────────────────────────────────
// NutriON brand palette
// ──────────────────────────────────────────
const C = {
  bg: "#03030a",
  card: "#06060e",
  card2: "#0a0a14",
  border: "#1a1a28",
  gold: "#e8a020",
  goldDim: "rgba(232,160,32,.2)",
  goldBg: "rgba(232,160,32,.08)",
  teal: "#00f0b4",
  tealDim: "rgba(0,240,180,.22)",
  tealBg: "rgba(0,240,180,.08)",
  purple: "#7890ff",
  purpleBg: "rgba(120,144,255,.10)",
  text: "#f0edf8",
  muted: "#5a5a78",
  dim: "#40406a",
  red: "#ff4444",
  orange: "#ff8c00",
};

const RPE_COLORS: Record<number, string> = {
  1: "#00f0b4", 2: "#00f0b4", 3: "#7890ff", 4: "#7890ff", 5: "#7890ff",
  6: "#e8a020", 7: "#e8a020", 8: "#ff8c00", 9: "#ff4444", 10: "#ff0000",
};
const RPE_LABELS: Record<number, string> = {
  1: "Muito fácil", 2: "Fácil", 3: "Moderado", 4: "Moderado+", 5: "Intenso",
  6: "Intenso+", 7: "Muito intenso", 8: "Máximo −1", 9: "Máximo −0", 10: "Falha total",
};

const MAJOR_MUSCLES = ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Quadríceps", "Posterior", "Glúteos"] as const;

const WORKOUT_TIME_LABELS: Record<WorkoutTime, { label: string; emoji: string }> = {
  morning:   { label: "Manhã", emoji: "🌅" },
  afternoon: { label: "Tarde", emoji: "☀️" },
  night:     { label: "Noite", emoji: "🌙" },
};
const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120];

// ──────────────────────────────────────────
// Recovery / Readiness
// ──────────────────────────────────────────
function computeMuscleRecovery(schedule: WorkoutScheduleEntry[]) {
  const today = new Date();
  const todayDow = today.getDay();
  return MAJOR_MUSCLES.map((muscle) => {
    let lastDays: number | null = null;
    for (let back = 0; back <= 14; back++) {
      const dow = ((todayDow - back) % 7 + 7) % 7;
      const entries = schedule.filter(s => s.day_of_week === dow);
      const trained = entries.some(e => {
        const meta = WORKOUT_TYPES[e.workout_type as WorkoutType];
        return meta?.muscleGroups?.includes(muscle);
      });
      if (trained) { lastDays = back; break; }
    }
    const hours = lastDays === null ? 999 : lastDays * 24;
    let status: "Fatigado" | "Recuperando" | "Descansando" | "Pronto";
    let color: string;
    if (hours < 24) { status = "Fatigado"; color = C.red; }
    else if (hours < 48) { status = "Recuperando"; color = C.orange; }
    else if (hours < 72) { status = "Descansando"; color = C.gold; }
    else { status = "Pronto"; color = C.teal; }
    return { muscle, days: lastDays, hours, status, color };
  });
}

function computeReadiness(recovery: ReturnType<typeof computeMuscleRecovery>) {
  const ready = recovery.filter(r => r.status === "Pronto" || r.days === null).length;
  const score = Math.round((ready / MAJOR_MUSCLES.length) * 10);
  const color = score >= 7 ? C.teal : score >= 4 ? C.gold : C.red;
  const desc = score >= 7 ? "Pronto para treino pesado"
            : score >= 4 ? "Recuperação parcial — modere intensidade"
            : "Fadiga acumulada — considere deload";
  return { score, color, desc };
}

// ──────────────────────────────────────────
// Visuals — clip path & volume bar
// ──────────────────────────────────────────
const clipBtn = "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))";

const VolumeBar = ({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) => {
  const h = size === "md" ? 6 : 4;
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const active = i <= score;
        const color = score >= 5 ? C.red : score >= 4 ? C.gold : C.teal;
        return <div key={i} style={{ width: size === "md" ? 14 : 10, height: h, borderRadius: 1, background: active ? color : C.border, boxShadow: active ? `0 0 6px ${color}66` : "none" }} />;
      })}
    </div>
  );
};

const RPEBadge = ({ rpe }: { rpe: number }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999,
    background: `${RPE_COLORS[rpe]}22`, border: `1px solid ${RPE_COLORS[rpe]}66`, color: RPE_COLORS[rpe],
    fontSize: 10, fontFamily: "monospace", fontWeight: 700,
  }}>
    RPE {rpe}
  </span>
);

// ──────────────────────────────────────────
// Page
// ──────────────────────────────────────────
const NutriSyncPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { schedule, todayLog, loading, saveDay, removeSlot, completeWorkout, getTodayWorkouts, getWorkoutsForDay } = useWorkoutSchedule();

  const [activeTab, setActiveTab] = useState<"today" | "schedule" | "peak">("today");
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<WorkoutScheduleEntry>>({});
  const [saving, setSaving] = useState(false);
  const [showRpe, setShowRpe] = useState(false);
  const [selectedRpe, setSelectedRpe] = useState<number | null>(null);

  const todayWorkouts = getTodayWorkouts();
  const todayDow = new Date().getDay();
  const weightKg = profile?.weight_kg || 70;

  const adjustment = useMemo(() => combineAdjustments(todayWorkouts, weightKg), [todayWorkouts, weightKg]);
  const baseKcal = profile?.vet_kcal || profile?.get_kcal || 2000;
  const baseProtein = profile?.protein_g || 150;
  const baseCarbs = profile?.carbs_g || 250;
  const baseFat = profile?.fat_g || 65;

  const adjustedKcal = Math.round(baseKcal * adjustment.kcalMultiplier);
  const adjustedProtein = Math.round(weightKg * adjustment.proteinPerKg);
  const adjustedCarbs = Math.round(baseCarbs * adjustment.carbsMultiplier);
  const adjustedFat = Math.round(baseFat * adjustment.fatMultiplier);
  const kcalDiff = adjustedKcal - baseKcal;

  const recovery = useMemo(() => computeMuscleRecovery(schedule), [schedule]);
  const readiness = useMemo(() => computeReadiness(recovery), [recovery]);

  const isTrainingDay = todayWorkouts.some(w => w.workout_type !== "rest" && w.workout_type !== "active_rest");
  const primaryWorkout = todayWorkouts[0];
  const primaryMeta = primaryWorkout ? WORKOUT_TYPES[primaryWorkout.workout_type as WorkoutType] : null;
  const loggedRpe = useMemo(() => {
    try { return todayLog?.notes ? JSON.parse(todayLog.notes)?.rpe ?? null : null; } catch { return null; }
  }, [todayLog]);

  const mealSuggestions = useMemo(() => {
    if (!primaryWorkout) return getMealSuggestionsByTime("morning", "rest");
    return getMealSuggestionsByTime(primaryWorkout.workout_time as WorkoutTime, primaryWorkout.workout_type as WorkoutType);
  }, [primaryWorkout]);

  // Schedule edit
  const handleStartEdit = (dow: number, slot: number, existing?: WorkoutScheduleEntry) => {
    setEditForm({
      day_of_week: dow,
      workout_type: existing?.workout_type || "rest",
      workout_time: existing?.workout_time || "morning",
      duration_minutes: existing?.duration_minutes || 60,
      slot,
    });
    setEditingDay(dow);
    setEditingSlot(slot);
  };
  const handleAddSlot = (dow: number) => {
    const dayEntries = getWorkoutsForDay(dow);
    const nextSlot = dayEntries.length > 0 ? Math.max(...dayEntries.map(e => e.slot || 1)) + 1 : 1;
    handleStartEdit(dow, nextSlot);
  };
  const handleSave = async () => {
    if (editingDay === null || editingSlot === null) return;
    setSaving(true);
    await saveDay({ ...editForm, slot: editingSlot } as WorkoutScheduleEntry);
    setSaving(false);
    setEditingDay(null); setEditingSlot(null);
  };
  const handleRemove = async () => {
    if (editingDay === null || editingSlot === null) return;
    await removeSlot(editingDay, editingSlot);
    setEditingDay(null); setEditingSlot(null);
  };

  const handleConfirmRpe = async () => {
    if (selectedRpe === null) return;
    await completeWorkout(selectedRpe);
    setShowRpe(false); setSelectedRpe(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${C.gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const typeEntries = Object.entries(WORKOUT_TYPES) as [WorkoutType, typeof WORKOUT_TYPES[WorkoutType]][];
  const muscEntries = typeEntries.filter(([, v]) => v.category === "musculacao");
  const cardioEntries = typeEntries.filter(([, v]) => v.category === "cardio");
  const restEntries = typeEntries.filter(([, v]) => v.category === "descanso");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, paddingBottom: 96, fontFamily: "ui-sans-serif, system-ui" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 16px 0" }}>
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate("/dashboard")} style={{ padding: 8, border: "none", background: "transparent", color: C.muted, cursor: "pointer" }}>
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "0.02em", lineHeight: 1, margin: 0 }}>
              <span style={{ color: C.text }}>TRAINING</span>
              <span style={{ marginLeft: 4, color: "transparent", WebkitTextStroke: `1.2px ${C.gold}` as any, fontWeight: 900 }}>ON</span>
            </h1>
            <p style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase", margin: "4px 0 0" }}>
              Nutrição adaptativa · nível elite
            </p>
          </div>
          <button onClick={() => navigate("/workout-history")} style={{ padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.muted, cursor: "pointer" }}>
            <History style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {([
            { k: "today", l: "Hoje" },
            { k: "schedule", l: "Rotina" },
            { k: "peak", l: "Peak Week" },
          ] as const).map(t => {
            const active = activeTab === t.k;
            return (
              <button key={t.k} onClick={() => setActiveTab(t.k)}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
                  background: active ? C.goldBg : "transparent",
                  border: `1px solid ${active ? C.gold : C.border}`,
                  color: active ? C.gold : C.dim,
                  fontSize: 12, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.05em", textTransform: "uppercase",
                }}>
                {t.l}
              </button>
            );
          })}
        </div>

        {/* ─────────────── TODAY ─────────────── */}
        {activeTab === "today" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* CARD 1 — READINESS */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 9, color: C.gold, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
                    Training Readiness
                  </p>
                  <p style={{ fontSize: 11, color: C.muted, margin: "6px 0 0" }}>{readiness.desc}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 44, fontWeight: 900, color: readiness.color, lineHeight: 1, fontFamily: "monospace", textShadow: `0 0 18px ${readiness.color}55` }}>
                    {readiness.score}
                  </span>
                  <span style={{ fontSize: 14, color: C.muted, fontFamily: "monospace", marginLeft: 2 }}>/10</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {recovery.map(r => (
                  <div key={r.muscle} style={{
                    padding: "8px 6px", borderRadius: 8, background: C.card2, border: `1px solid ${r.color}33`,
                    textAlign: "center",
                  }}>
                    <p style={{ fontSize: 9, color: C.text, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{r.muscle}</p>
                    <p style={{ fontSize: 14, color: r.color, fontWeight: 900, fontFamily: "monospace", margin: "4px 0 2px", lineHeight: 1 }}>
                      {r.days === null ? "—" : `${r.days}d`}
                    </p>
                    <p style={{ fontSize: 8, color: r.color, fontFamily: "monospace", margin: 0, textTransform: "uppercase" }}>{r.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 2 — TODAY'S WORKOUT */}
            <div style={{ background: C.card, border: `1px solid ${isTrainingDay ? C.goldDim : C.border}`, borderRadius: 16, padding: 18, position: "relative", overflow: "hidden" }}>
              {isTrainingDay && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold}, transparent)` }} />
              )}
              <p style={{ fontSize: 9, color: C.gold, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 8px" }}>
                Treino de hoje · {DAY_NAMES_FULL[todayDow]}
              </p>

              {primaryMeta ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{primaryMeta.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: 0 }}>{primaryMeta.label}</h2>
                      <p style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", margin: "2px 0 0" }}>
                        {WORKOUT_TIME_LABELS[primaryWorkout.workout_time as WorkoutTime]?.emoji} {WORKOUT_TIME_LABELS[primaryWorkout.workout_time as WorkoutTime]?.label} · {primaryWorkout.duration_minutes}min · recup. {adjustment.recoveryHours}h
                      </p>
                    </div>
                  </div>

                  {primaryMeta.muscleGroups.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                      {primaryMeta.muscleGroups.map(m => (
                        <span key={m} style={{ padding: "3px 8px", borderRadius: 999, background: C.goldBg, color: C.gold, fontSize: 10, fontFamily: "monospace", border: `1px solid ${C.goldDim}` }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: "0.1em" }}>VOL</span>
                    <VolumeBar score={primaryMeta.volumeScore} size="md" />
                    <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{primaryMeta.volumeScore}/5</span>
                  </div>

                  <div style={{ padding: 10, borderRadius: 8, background: C.goldBg, border: `1px solid ${C.goldDim}`, marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: C.text, fontFamily: "monospace", lineHeight: 1.5, margin: 0 }}>{adjustment.tip}</p>
                  </div>

                  {!todayLog?.completed && !showRpe && (
                    <button onClick={() => setShowRpe(true)} style={{
                      width: "100%", padding: "14px 16px", border: "none", cursor: "pointer",
                      background: C.gold, color: C.bg, fontWeight: 900, fontSize: 12,
                      letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace",
                      clipPath: clipBtn,
                    }}>
                      Marcar como concluído
                    </button>
                  )}

                  {showRpe && (
                    <div style={{ padding: 14, background: C.card2, borderRadius: 10, border: `1px solid ${C.border}` }}>
                      <p style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>
                        RPE da sessão (1–10)
                      </p>
                      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => {
                          const sel = selectedRpe === n;
                          const color = RPE_COLORS[n];
                          return (
                            <button key={n} onClick={() => setSelectedRpe(n)} style={{
                              flex: 1, padding: "10px 0", borderRadius: 6, cursor: "pointer",
                              background: sel ? color : C.bg,
                              border: `1px solid ${sel ? color : C.border}`,
                              color: sel ? C.bg : color,
                              fontWeight: 800, fontSize: 13, fontFamily: "monospace",
                              boxShadow: sel ? `0 0 12px ${color}77` : "none",
                            }}>
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      {selectedRpe !== null && (
                        <p style={{ fontSize: 11, color: RPE_COLORS[selectedRpe], fontFamily: "monospace", textAlign: "center", margin: "0 0 12px", fontWeight: 700 }}>
                          RPE {selectedRpe} · {RPE_LABELS[selectedRpe]}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setShowRpe(false); setSelectedRpe(null); }}
                          style={{ flex: 1, padding: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontFamily: "monospace", fontSize: 11, cursor: "pointer", borderRadius: 6 }}>
                          Cancelar
                        </button>
                        <button onClick={handleConfirmRpe} disabled={selectedRpe === null}
                          style={{ flex: 1, padding: 10, border: "none", background: selectedRpe !== null ? C.gold : C.border, color: C.bg, fontFamily: "monospace", fontWeight: 800, fontSize: 11, cursor: selectedRpe !== null ? "pointer" : "not-allowed", borderRadius: 6, opacity: selectedRpe === null ? 0.5 : 1 }}>
                          CONFIRMAR
                        </button>
                      </div>
                    </div>
                  )}

                  {todayLog?.completed && (
                    <div style={{ padding: 12, borderRadius: 10, background: C.tealBg, border: `1px solid ${C.tealDim}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: C.teal, fontFamily: "monospace", fontWeight: 700 }}>
                        ✓ Treino concluído
                      </span>
                      {loggedRpe !== null && <RPEBadge rpe={loggedRpe} />}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>😴 Dia de descanso</h2>
                  <p style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", margin: 0 }}>{adjustment.tip}</p>
                </div>
              )}
            </div>

            {/* CARD 3 — MACROS */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontSize: 9, color: C.gold, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
                  Macro Protocol Ajustado
                </p>
                {kcalDiff !== 0 && (
                  <span style={{ fontSize: 10, color: kcalDiff > 0 ? C.gold : C.teal, fontFamily: "monospace", fontWeight: 700 }}>
                    {kcalDiff > 0 ? "+" : ""}{kcalDiff} kcal vs base
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {[
                  { l: "Calorias", v: adjustedKcal, u: "kcal", c: C.gold, d: kcalDiff },
                  { l: "Proteína", v: adjustedProtein, u: "g", c: C.teal, d: adjustedProtein - baseProtein },
                  { l: "Carboidrato", v: adjustedCarbs, u: "g", c: C.purple, d: adjustedCarbs - baseCarbs },
                  { l: "Gordura", v: adjustedFat, u: "g", c: "#facc15", d: adjustedFat - baseFat },
                ].map(m => (
                  <div key={m.l} style={{ background: C.card2, border: `1px solid ${m.c}33`, borderRadius: 10, padding: 12, textAlign: "center" }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: m.c, fontFamily: "monospace", margin: 0, lineHeight: 1 }}>
                      {m.v}<span style={{ fontSize: 10, color: C.muted, marginLeft: 2 }}>{m.u}</span>
                    </p>
                    <p style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.l}</p>
                    {m.d !== 0 && (
                      <p style={{ fontSize: 9, color: m.d > 0 ? m.c : C.muted, fontFamily: "monospace", margin: "2px 0 0" }}>
                        {m.d > 0 ? "+" : ""}{m.d}{m.u}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: C.card2, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: C.text, fontFamily: "monospace" }}>💧 Hidratação</span>
                <span style={{ fontSize: 12, color: C.purple, fontFamily: "monospace", fontWeight: 700 }}>
                  {adjustment.hydrationLiters}L · {Math.round(adjustment.hydrationLiters / 0.25)} copos
                </span>
              </div>

              {adjustment.electrolytes && (
                <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: C.purpleBg, border: `1px solid ${C.purple}33` }}>
                  <p style={{ fontSize: 9, color: C.purple, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 4px" }}>
                    🧂 Eletrólitos
                  </p>
                  <p style={{ fontSize: 11, color: C.text, fontFamily: "monospace", lineHeight: 1.5, margin: 0 }}>{adjustment.electrolytes}</p>
                </div>
              )}
            </div>

            {/* CARD 4 — TIMELINE */}
            {isTrainingDay && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
                <p style={{ fontSize: 9, color: C.gold, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }}>
                  Nutrition Timeline
                </p>

                <div style={{ padding: 12, borderRadius: 10, background: C.goldBg, border: `1px solid ${C.goldDim}`, marginBottom: 8 }}>
                  <p style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", fontWeight: 700, margin: "0 0 4px" }}>⚡ PRÉ-TREINO</p>
                  <p style={{ fontSize: 11, color: C.text, lineHeight: 1.5, margin: 0 }}>{adjustment.preMeal}</p>
                </div>

                {adjustment.intraMeal && (
                  <div style={{ padding: 12, borderRadius: 10, background: C.purpleBg, border: `1px solid ${C.purple}33`, marginBottom: 8 }}>
                    <p style={{ fontSize: 10, color: C.purple, fontFamily: "monospace", fontWeight: 700, margin: "0 0 4px" }}>🧃 INTRA-TREINO</p>
                    <p style={{ fontSize: 11, color: C.text, lineHeight: 1.5, margin: 0 }}>{adjustment.intraMeal}</p>
                  </div>
                )}

                <div style={{ padding: 12, borderRadius: 10, background: C.tealBg, border: `1px solid ${C.tealDim}`, marginBottom: 12 }}>
                  <p style={{ fontSize: 10, color: C.teal, fontFamily: "monospace", fontWeight: 700, margin: "0 0 4px" }}>🚀 PÓS-TREINO</p>
                  <p style={{ fontSize: 11, color: C.text, lineHeight: 1.5, margin: 0 }}>{adjustment.postMeal}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {mealSuggestions.map((m, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 10, padding: "8px 10px", borderRadius: 6,
                      background: m.highlight ? C.goldBg : "transparent",
                      border: `1px solid ${m.highlight ? C.goldDim : C.border}`,
                    }}>
                      {m.highlight && <Zap style={{ width: 12, height: 12, color: C.gold, flexShrink: 0, marginTop: 2 }} />}
                      <span style={{ fontSize: 10, color: C.gold, fontFamily: "monospace", fontWeight: 700, minWidth: 38 }}>{m.time}</span>
                      <span style={{ fontSize: 11, color: C.text, fontFamily: "monospace", lineHeight: 1.4 }}>{m.meal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CARD 5 — ALERTS */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
              <p style={{ fontSize: 9, color: C.gold, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }}>
                Alertas do dia
              </p>
              {isTrainingDay ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ padding: 10, borderRadius: 8, background: C.goldBg, border: `1px solid ${C.goldDim}` }}>
                    <p style={{ fontSize: 11, color: C.text, fontFamily: "monospace", margin: 0 }}>
                      ⏰ <strong style={{ color: C.gold }}>90min antes do treino:</strong> última refeição sólida com carb+ptn.
                    </p>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: C.tealBg, border: `1px solid ${C.tealDim}` }}>
                    <p style={{ fontSize: 11, color: C.text, fontFamily: "monospace", margin: 0 }}>
                      💪 <strong style={{ color: C.teal }}>Janela anabólica:</strong> 30–60min pós-treino para whey + carb rápido.
                    </p>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: C.card2, border: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 11, color: C.text, fontFamily: "monospace", margin: 0 }}>
                      🎯 <strong style={{ color: C.purple }}>Meta do dia:</strong> {adjustedProtein}g proteína · {adjustment.hydrationLiters}L água.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 10, borderRadius: 8, background: C.tealBg, border: `1px solid ${C.tealDim}` }}>
                  <p style={{ fontSize: 11, color: C.text, fontFamily: "monospace", lineHeight: 1.5, margin: 0 }}>
                    🌙 <strong style={{ color: C.teal }}>Recuperação:</strong> magnésio 300mg + 8h sono. Músculo cresce no descanso.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─────────────── SCHEDULE ─────────────── */}
        {activeTab === "schedule" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[0,1,2,3,4,5,6].map(dow => {
              const entries = getWorkoutsForDay(dow);
              const isToday = dow === todayDow;
              return (
                <div key={dow}>
                  <div style={{ background: C.card, border: `1px solid ${isToday ? C.goldDim : C.border}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: entries.length ? 10 : 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 800, color: isToday ? C.gold : C.muted, minWidth: 32 }}>{DAY_NAMES[dow]}</span>
                        {isToday && <span style={{ fontSize: 8, color: C.gold, fontFamily: "monospace", padding: "2px 6px", borderRadius: 4, background: C.goldBg }}>HOJE</span>}
                      </div>
                      <button onClick={() => handleAddSlot(dow)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", border: `1px solid ${C.border}`, background: "transparent", color: C.gold, fontSize: 10, fontFamily: "monospace", cursor: "pointer", borderRadius: 6 }}>
                        <Plus style={{ width: 12, height: 12 }} /> Adicionar
                      </button>
                    </div>

                    {entries.length === 0 ? (
                      <button onClick={() => handleStartEdit(dow, 1)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 0", border: "none", background: "transparent", color: C.muted, cursor: "pointer", textAlign: "left" }}>
                        <span style={{ fontSize: 18 }}>😴</span>
                        <span style={{ fontSize: 12, fontFamily: "monospace", flex: 1 }}>Descanso — toque para configurar</span>
                        <ChevronRight style={{ width: 14, height: 14 }} />
                      </button>
                    ) : entries.map((e, i) => {
                      const meta = WORKOUT_TYPES[e.workout_type as WorkoutType];
                      return (
                        <button key={i} onClick={() => handleStartEdit(dow, e.slot || i + 1, e)}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 0", border: "none", background: "transparent", color: C.text, cursor: "pointer", textAlign: "left" }}>
                          <span style={{ fontSize: 22 }}>{meta?.emoji}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, margin: 0, color: C.text }}>{meta?.shortLabel}</p>
                            <p style={{ fontSize: 10, fontFamily: "monospace", color: C.muted, margin: "2px 0 0" }}>
                              {WORKOUT_TIME_LABELS[e.workout_time as WorkoutTime]?.emoji} {WORKOUT_TIME_LABELS[e.workout_time as WorkoutTime]?.label} · {e.duration_minutes}min
                              {meta?.muscleGroups.length ? ` · ${meta.muscleGroups.join(", ")}` : ""}
                            </p>
                          </div>
                          <VolumeBar score={meta?.volumeScore || 0} />
                          <ChevronRight style={{ width: 14, height: 14, color: C.muted, marginLeft: 4 }} />
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {editingDay === dow && editingSlot !== null && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                        <div style={{ background: C.card, border: `1px solid ${C.goldDim}`, borderRadius: 12, padding: 14, marginTop: 6, display: "flex", flexDirection: "column", gap: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <p style={{ fontSize: 9, color: C.gold, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                              Editar atividade {editingSlot}
                            </p>
                            {entries.length > 0 && (
                              <button onClick={handleRemove} style={{ display: "flex", alignItems: "center", gap: 4, color: C.red, fontSize: 10, fontFamily: "monospace", border: "none", background: "transparent", cursor: "pointer" }}>
                                <Trash2 style={{ width: 12, height: 12 }} /> Remover
                              </button>
                            )}
                          </div>

                          {[
                            { title: "💪 Musculação", items: muscEntries },
                            { title: "🏃 Cardio / Combate", items: cardioEntries },
                            { title: "🧘 Descanso", items: restEntries },
                          ].map(group => (
                            <div key={group.title}>
                              <p style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>{group.title}</p>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                {group.items.map(([key, val]) => {
                                  const sel = editForm.workout_type === key;
                                  return (
                                    <button key={key} onClick={() => setEditForm(f => ({ ...f, workout_type: key }))} style={{
                                      padding: "8px 10px", border: `1px solid ${sel ? C.gold : C.border}`,
                                      background: sel ? C.goldBg : C.card2, color: sel ? C.gold : C.text,
                                      fontSize: 11, fontFamily: "monospace", textAlign: "left", cursor: "pointer", borderRadius: 6,
                                    }}>
                                      {val.emoji} {val.shortLabel}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                          {editForm.workout_type !== "rest" && (
                            <>
                              <div>
                                <p style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>Horário</p>
                                <div style={{ display: "flex", gap: 6 }}>
                                  {(Object.entries(WORKOUT_TIME_LABELS) as [WorkoutTime, typeof WORKOUT_TIME_LABELS[WorkoutTime]][]).map(([k, v]) => {
                                    const sel = editForm.workout_time === k;
                                    return (
                                      <button key={k} onClick={() => setEditForm(f => ({ ...f, workout_time: k }))} style={{
                                        flex: 1, padding: 8, border: `1px solid ${sel ? C.gold : C.border}`,
                                        background: sel ? C.goldBg : C.card2, color: sel ? C.gold : C.text,
                                        fontSize: 11, fontFamily: "monospace", cursor: "pointer", borderRadius: 6,
                                      }}>
                                        {v.emoji} {v.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div>
                                <p style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>Duração (min)</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                  {DURATION_OPTIONS.map(d => {
                                    const sel = editForm.duration_minutes === d;
                                    return (
                                      <button key={d} onClick={() => setEditForm(f => ({ ...f, duration_minutes: d }))} style={{
                                        padding: "6px 12px", border: `1px solid ${sel ? C.gold : C.border}`,
                                        background: sel ? C.goldBg : C.card2, color: sel ? C.gold : C.text,
                                        fontSize: 11, fontFamily: "monospace", cursor: "pointer", borderRadius: 6,
                                      }}>{d}</button>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}

                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => { setEditingDay(null); setEditingSlot(null); }} style={{ flex: 1, padding: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontFamily: "monospace", fontSize: 11, cursor: "pointer", borderRadius: 6 }}>
                              Cancelar
                            </button>
                            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 10, border: "none", background: C.gold, color: C.bg, fontFamily: "monospace", fontWeight: 800, fontSize: 11, cursor: "pointer", borderRadius: 6, opacity: saving ? 0.6 : 1 }}>
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

        {/* ─────────────── PEAK WEEK ─────────────── */}
        {activeTab === "peak" && <PeakWeekManager />}
      </div>
      <BottomNav />
    </div>
  );
};

export default NutriSyncPage;
