import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  useWorkoutSchedule,
  WORKOUT_TYPES,
  DAY_NAMES_FULL,
  combineAdjustments,
  type WorkoutType,
  type WorkoutTime,
  type WorkoutScheduleEntry,
} from "@/hooks/useWorkoutSchedule";
import { Activity, AlertTriangle, Flame, Droplets, Zap, TrendingDown, Heart, ChevronRight } from "lucide-react";

// TrainingON palette
const C = {
  bg: "#060a06",
  card: "#0c120c",
  card2: "#111a11",
  border: "rgba(74,222,128,0.18)",
  borderDim: "rgba(74,222,128,0.10)",
  green: "#4ade80",
  greenDim: "rgba(74,222,128,0.10)",
  greenBg: "rgba(74,222,128,0.06)",
  text: "#f0fdf4",
  muted: "#94a3b8",
  dim: "#64748b",
  red: "#ff4f4f",
  orange: "#ff9333",
  amber: "#e8a020",
};

const FONT = "'Space Grotesk', sans-serif";
const MAJOR_MUSCLES = ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Quadríceps", "Posterior", "Glúteos"] as const;

const RPE_COLORS: Record<number, string> = {
  1: C.green, 2: C.green, 3: "#7890ff", 4: "#7890ff", 5: "#7890ff",
  6: C.amber, 7: C.amber, 8: C.orange, 9: C.red, 10: "#ff0000",
};
const RPE_LABELS: Record<number, string> = {
  1: "Muito fácil", 2: "Fácil", 3: "Moderado", 4: "Moderado+", 5: "Intenso",
  6: "Intenso+", 7: "Muito intenso", 8: "Máximo −1", 9: "Máximo −0", 10: "Falha total",
};

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
    else if (hours < 72) { status = "Descansando"; color = C.amber; }
    else { status = "Pronto"; color = C.green; }
    return { muscle, days: lastDays, hours, status, color };
  });
}

function computeReadiness(recovery: ReturnType<typeof computeMuscleRecovery>) {
  const ready = recovery.filter(r => r.status === "Pronto" || r.days === null).length;
  const score = Math.round((ready / MAJOR_MUSCLES.length) * 10);
  const color = score >= 7 ? C.green : score >= 4 ? C.amber : C.red;
  const desc = score >= 7
    ? "Pronto para treino pesado"
    : score >= 4
    ? "Recuperação parcial — modere intensidade"
    : "Fadiga acumulada — considere deload";
  return { score, color, desc };
}

interface RpeLog { log_date: string; rpe: number; }

export default function TrainingReadinessSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { schedule, todayLog, getTodayWorkouts } = useWorkoutSchedule();
  const [rpeHistory, setRpeHistory] = useState<RpeLog[]>([]);

  const weightKg = profile?.weight_kg || 70;
  const todayWorkouts = getTodayWorkouts();
  const todayDow = new Date().getDay();
  const adjustment = useMemo(() => combineAdjustments(todayWorkouts, weightKg), [todayWorkouts, weightKg]);
  const baseKcal = profile?.vet_kcal || profile?.get_kcal || 2000;
  const baseCarbs = profile?.carbs_g || 250;
  const baseFat = profile?.fat_g || 65;

  const adjustedKcal = Math.round(baseKcal * adjustment.kcalMultiplier);
  const adjustedProtein = Math.round(weightKg * adjustment.proteinPerKg);
  const adjustedCarbs = Math.round(baseCarbs * adjustment.carbsMultiplier);
  const adjustedFat = Math.round(baseFat * adjustment.fatMultiplier);
  const kcalDiff = adjustedKcal - baseKcal;

  const recovery = useMemo(() => computeMuscleRecovery(schedule), [schedule]);
  const readiness = useMemo(() => computeReadiness(recovery), [recovery]);

  const primaryWorkout = todayWorkouts[0];
  const primaryMeta = primaryWorkout ? WORKOUT_TYPES[primaryWorkout.workout_type as WorkoutType] : null;
  const isTrainingDay = !!primaryWorkout && primaryWorkout.workout_type !== "rest" && primaryWorkout.workout_type !== "active_rest";

  const loggedRpe = useMemo(() => {
    try { return todayLog?.notes ? JSON.parse(todayLog.notes)?.rpe ?? null : null; } catch { return null; }
  }, [todayLog]);

  // Last 14 days RPE history → deload detection
  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 14);
      const { data } = await supabase
        .from("workout_daily_logs")
        .select("log_date, notes, completed")
        .eq("user_id", user.id)
        .gte("log_date", since.toISOString().split("T")[0])
        .order("log_date", { ascending: false });
      const parsed: RpeLog[] = (data || [])
        .map((r: any) => {
          try {
            const rpe = r.notes ? JSON.parse(r.notes)?.rpe : null;
            return rpe ? { log_date: r.log_date, rpe: Number(rpe) } : null;
          } catch { return null; }
        })
        .filter(Boolean) as RpeLog[];
      setRpeHistory(parsed);
    })();
  }, [user, todayLog]);

  const deload = useMemo(() => {
    const total = rpeHistory.length;
    if (total === 0) return { triggered: false, avg: 0, highCount: 0, total: 0 };
    const avg = rpeHistory.reduce((s, r) => s + r.rpe, 0) / total;
    const highCount = rpeHistory.filter(r => r.rpe >= 8).length;
    const fatiguedCount = recovery.filter(r => r.status === "Fatigado" || r.status === "Recuperando").length;
    const triggered = (avg >= 8 && total >= 4) || (highCount >= 5) || (fatiguedCount >= 5);
    return { triggered, avg: Number(avg.toFixed(1)), highCount, total };
  }, [rpeHistory, recovery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: FONT }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
        <div>
          <p style={{ fontSize: 9, color: C.green, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "monospace", margin: 0 }}>
            Live Status
          </p>
          <h2 style={{ fontSize: 22, color: C.text, fontWeight: 800, margin: "4px 0 0" }}>
            Readiness & Recovery
          </h2>
        </div>
        <button
          onClick={() => navigate("/nutrisync")}
          style={{
            padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.greenBg, color: C.green, fontSize: 10, fontFamily: "monospace",
            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 4,
          }}
        >
          NutriSync <ChevronRight style={{ width: 12, height: 12 }} />
        </button>
      </div>

      {/* DELOAD ALERT */}
      {deload.triggered && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, ${C.red}18, ${C.orange}10)`,
            border: `1px solid ${C.red}55`, borderRadius: 14, padding: 14,
            display: "flex", alignItems: "flex-start", gap: 12,
          }}
        >
          <AlertTriangle style={{ width: 22, height: 22, color: C.red, flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: C.red, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0, fontWeight: 800 }}>
              Deload recomendado
            </p>
            <p style={{ fontSize: 12, color: C.text, margin: "4px 0 6px", lineHeight: 1.5 }}>
              Acúmulo de fadiga detectado nos últimos 14 dias. Reduza volume em 40–50% e mantenha intensidade na próxima semana.
            </p>
            <div style={{ display: "flex", gap: 12, fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
              <span>RPE médio: <b style={{ color: C.red }}>{deload.avg}</b></span>
              <span>Sessões RPE≥8: <b style={{ color: C.red }}>{deload.highCount}/{deload.total}</b></span>
            </div>
          </div>
        </motion.div>
      )}

      {/* READINESS SCORE */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 9, color: C.green, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
              Training Readiness
            </p>
            <p style={{ fontSize: 11, color: C.muted, margin: "6px 0 0" }}>{readiness.desc}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{
              fontSize: 44, fontWeight: 900, color: readiness.color, lineHeight: 1,
              fontFamily: "monospace", textShadow: `0 0 18px ${readiness.color}55`,
            }}>
              {readiness.score}
            </span>
            <span style={{ fontSize: 14, color: C.muted, fontFamily: "monospace", marginLeft: 2 }}>/10</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {recovery.map(r => (
            <div key={r.muscle} style={{
              padding: "8px 6px", borderRadius: 8, background: C.card2,
              border: `1px solid ${r.color}33`, textAlign: "center",
            }}>
              <p style={{ fontSize: 9, color: C.text, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{r.muscle}</p>
              <p style={{ fontSize: 14, color: r.color, fontWeight: 900, fontFamily: "monospace", margin: "4px 0 2px", lineHeight: 1 }}>
                {r.days === null ? "—" : `${r.days}d`}
              </p>
              <p style={{ fontSize: 8, color: r.color, fontFamily: "monospace", margin: 0, textTransform: "uppercase" }}>
                {r.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* TODAY WORKOUT + RPE */}
      <div style={{ background: C.card, border: `1px solid ${isTrainingDay ? C.border : C.borderDim}`, borderRadius: 16, padding: 18, position: "relative", overflow: "hidden" }}>
        {isTrainingDay && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.green}, transparent)` }} />
        )}
        <p style={{ fontSize: 9, color: C.green, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 8px" }}>
          Sessão de hoje · {DAY_NAMES_FULL[todayDow]}
        </p>

        {primaryMeta && isTrainingDay ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>{primaryMeta.emoji}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>{primaryMeta.label}</h3>
                <p style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", margin: "2px 0 0" }}>
                  {primaryWorkout.duration_minutes}min · recup. {adjustment.recoveryHours}h · vol {primaryMeta.volumeScore}/5
                </p>
              </div>
              {loggedRpe !== null && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999,
                  background: `${RPE_COLORS[loggedRpe]}22`, border: `1px solid ${RPE_COLORS[loggedRpe]}66`,
                  color: RPE_COLORS[loggedRpe], fontSize: 11, fontFamily: "monospace", fontWeight: 700,
                }}>
                  RPE {loggedRpe}
                </span>
              )}
            </div>

            {primaryMeta.muscleGroups.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {primaryMeta.muscleGroups.map(m => (
                  <span key={m} style={{
                    padding: "3px 8px", borderRadius: 999, background: C.greenBg, color: C.green,
                    fontSize: 10, fontFamily: "monospace", border: `1px solid ${C.borderDim}`,
                  }}>
                    {m}
                  </span>
                ))}
              </div>
            )}

            <div style={{ padding: 10, borderRadius: 8, background: C.greenBg, border: `1px solid ${C.borderDim}` }}>
              <p style={{ fontSize: 11, color: C.text, fontFamily: "monospace", lineHeight: 1.5, margin: 0 }}>
                {adjustment.tip}
              </p>
            </div>
          </>
        ) : (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>😴 Dia de descanso</h3>
            <p style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", margin: 0 }}>{adjustment.tip}</p>
          </div>
        )}
      </div>

      {/* MACROS ADJUSTED */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 9, color: C.green, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
            Macros sincronizados
          </p>
          {kcalDiff !== 0 && (
            <span style={{
              padding: "3px 8px", borderRadius: 999,
              background: kcalDiff > 0 ? C.greenBg : `${C.red}1a`,
              color: kcalDiff > 0 ? C.green : C.red,
              fontSize: 10, fontFamily: "monospace", fontWeight: 700,
            }}>
              {kcalDiff > 0 ? "+" : ""}{kcalDiff} kcal vs base
            </span>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { label: "kcal", value: adjustedKcal, base: baseKcal, color: C.green, icon: Flame },
            { label: "Ptn", value: `${adjustedProtein}g`, base: `${Math.round(weightKg * 1.6)}g`, color: "#7890ff", icon: Heart },
            { label: "Cho", value: `${adjustedCarbs}g`, base: `${baseCarbs}g`, color: C.amber, icon: Zap },
            { label: "Fat", value: `${adjustedFat}g`, base: `${baseFat}g`, color: C.orange, icon: Activity },
          ].map((m, i) => (
            <div key={i} style={{
              padding: "10px 8px", borderRadius: 10, background: C.card2,
              border: `1px solid ${C.borderDim}`, textAlign: "center",
            }}>
              <m.icon style={{ width: 12, height: 12, color: m.color, margin: "0 auto 4px" }} />
              <p style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", margin: 0, textTransform: "uppercase" }}>{m.label}</p>
              <p style={{ fontSize: 16, color: m.color, fontWeight: 900, fontFamily: "monospace", margin: "2px 0 0", lineHeight: 1 }}>
                {m.value}
              </p>
              <p style={{ fontSize: 8, color: C.dim, fontFamily: "monospace", margin: "2px 0 0" }}>
                base {m.base}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* INTRA + ELECTROLYTES */}
      {(adjustment.intraMeal || adjustment.electrolytes) && isTrainingDay && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
          <p style={{ fontSize: 9, color: C.green, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }}>
            Nutrição Intra-Treino
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {adjustment.intraMeal && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 10, borderRadius: 8, background: C.card2, border: `1px solid ${C.borderDim}` }}>
                <Zap style={{ width: 14, height: 14, color: C.amber, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 9, color: C.amber, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontWeight: 700 }}>Intra</p>
                  <p style={{ fontSize: 11, color: C.text, margin: "2px 0 0", lineHeight: 1.5 }}>{adjustment.intraMeal}</p>
                </div>
              </div>
            )}
            {adjustment.electrolytes && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 10, borderRadius: 8, background: C.card2, border: `1px solid ${C.borderDim}` }}>
                <Droplets style={{ width: 14, height: 14, color: "#3ec5ff", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 9, color: "#3ec5ff", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontWeight: 700 }}>Eletrólitos</p>
                  <p style={{ fontSize: 11, color: C.text, margin: "2px 0 0", lineHeight: 1.5 }}>{adjustment.electrolytes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RPE LAST 14 DAYS */}
      {rpeHistory.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 9, color: C.green, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
              RPE · últimos 14 dias
            </p>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
              média {deload.avg} · {deload.total} sessões
            </span>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 56 }}>
            {rpeHistory.slice(0, 14).reverse().map((r, i) => {
              const h = (r.rpe / 10) * 100;
              const c = RPE_COLORS[r.rpe] || C.green;
              return (
                <div key={i} title={`${r.log_date} · RPE ${r.rpe} (${RPE_LABELS[r.rpe]})`} style={{
                  flex: 1, height: `${h}%`, minHeight: 4, borderRadius: 3,
                  background: c, boxShadow: `0 0 8px ${c}55`,
                }} />
              );
            })}
          </div>
          {deload.triggered && (
            <p style={{ fontSize: 10, color: C.red, fontFamily: "monospace", margin: "10px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
              <TrendingDown style={{ width: 12, height: 12 }} /> Padrão de fadiga detectado
            </p>
          )}
        </div>
      )}
    </div>
  );
}
