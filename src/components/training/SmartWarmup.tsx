import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { buildWarmup, detectMuscleGroups, groupKey } from "@/lib/warmupByMuscle";

const TEAL = "#00d4aa";
const ACCENT = "#00e888";
const TEXT = "#f0fdf4";
const TEXT_DIM = "#94a3b8";
const TEXT_MUTED = "#64748b";

const today = () => new Date().toISOString().slice(0, 10);

export default function SmartWarmup({
  exercises,
  dayKey,
}: { exercises: Array<{ name?: string; muscle_target?: string }>; dayKey: string | number }) {
  const { user } = useAuth();
  const groups = useMemo(() => detectMuscleGroups(exercises || []), [exercises]);
  const { label, exercises: warmup, isFallback } = useMemo(() => buildWarmup(groups), [groups]);
  const storageKey = `warmup-done:${today()}:${dayKey}:${groupKey(groups)}`;

  const [done, setDone] = useState<Record<number, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(done));
  }, [done, storageKey]);

  const allDone = warmup.length > 0 && warmup.every((_, i) => done[i]);

  /* persist group + completed flag */
  useEffect(() => {
    if (!user?.id) return;
    supabase.from("training_sessions_completed").upsert({
      user_id: user.id,
      session_date: today(),
      primary_muscle_group: groupKey(groups),
      warmup_completed: allDone,
      completed: false,
    }, { onConflict: "user_id,session_date" });
  }, [user?.id, allDone, groups]);

  const toggle = (i: number) => setDone(p => ({ ...p, [i]: !p[i] }));

  const headerLabel = isFallback ? "WARM-UP GERAL" : "🔥 WARM-UP";

  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#60a5fa" }}>
            {headerLabel}
          </span>
          <span
            className="text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wider"
            style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}33` }}
          >
            {label}
          </span>
          {allDone && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${TEAL}20`, color: TEAL }}>
              COMPLETO ✓
            </span>
          )}
        </div>
      </div>

      {!isFallback && (
        <p className="text-[10px] italic mt-0.5" style={{ color: TEAL }}>
          Específico para {label}
        </p>
      )}

      <div className="mt-2 space-y-1.5">
        {warmup.map((w, i) => {
          const checked = !!done[i];
          return (
            <div
              key={i}
              className="flex items-start gap-2 py-1"
              style={{
                borderLeft: checked ? `2px solid ${ACCENT}` : "2px solid transparent",
                background: checked ? `${ACCENT}08` : "transparent",
                paddingLeft: 6,
                borderRadius: 3,
                transition: "all .25s ease",
              }}
            >
              <button
                onClick={() => toggle(i)}
                aria-label="Marcar warm-up"
                style={{
                  width: 18, height: 18, borderRadius: 4, marginTop: 1, flexShrink: 0,
                  border: `1.5px solid ${ACCENT}`,
                  background: checked ? ACCENT : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all .25s ease",
                }}
              >
                {checked && <Check className="w-3 h-3" style={{ color: "#0a0a0a", strokeWidth: 3 }} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium" style={{ color: TEXT }}>{w.name}</span>
                  <span className="text-[10px] font-mono" style={{ color: TEXT_DIM }}>{w.sets}×{w.reps}</span>
                </div>
                <p className="text-[9px] italic mt-0.5" style={{ color: TEXT_MUTED }}>
                  foco: {w.focus}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
