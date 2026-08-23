import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  CHECKIN_FIELDS,
  dailyScoresFromCheckin,
  dayKey,
  rollingScores,
  type CheckinRow,
  type PillarKey,
} from "@/lib/mceSystem";

const MONO = "'Space Mono', ui-monospace, monospace";
const DISPLAY = "'Rajdhani', system-ui, sans-serif";

const PILLAR_COLORS: Record<PillarKey, string> = {
  M: "#A78BFA",
  C: "#00FF88",
  E: "#F59E0B",
};

export type CheckinSubmitHandler = (scores: Record<PillarKey, number>) => void;

export default function MceDailyCheckin({ onSubmit, onClose }: { onSubmit?: CheckinSubmitHandler; onClose?: () => void }) {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<keyof CheckinRow, number>>({
    checkin_date: "",
    sleep_quality: 7,
    stress_level: 5,
    nutrition_adherence: 7,
    hydration: 7,
    movement: 6,
    focus_clarity: 7,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState<CheckinRow | null>(null);

  useEffect(() => {
    if (!user) return;
    const today = dayKey(new Date());
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("mce_checkins")
        .select("checkin_date, sleep_quality, stress_level, nutrition_adherence, hydration, movement, focus_clarity")
        .eq("user_id", user.id)
        .eq("checkin_date", today)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setValues({ ...(data as unknown as CheckinRow), checkin_date: today });
        setExisting(data as unknown as CheckinRow);
        setSaved(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const preview = useMemo(() => dailyScoresFromCheckin(values), [values]);
  const todayKey = useMemo(() => dayKey(new Date()), []);

  const update = (key: keyof CheckinRow, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const submit = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      checkin_date: todayKey,
      sleep_quality: values.sleep_quality,
      stress_level: values.stress_level,
      nutrition_adherence: values.nutrition_adherence,
      hydration: values.hydration,
      movement: values.movement,
      focus_clarity: values.focus_clarity,
    };
    const { error } = await supabase.from("mce_checkins").upsert(payload, { onConflict: "user_id,checkin_date" });
    if (!error) {
      setSaved(true);
      setExisting(values as unknown as CheckinRow);
      onSubmit?.(preview);
    }
    setSaving(false);
  }, [user, values, preview, todayKey, onSubmit]);

  const groups = useMemo(() => {
    const g: Record<PillarKey, typeof CHECKIN_FIELDS> = { M: [], C: [], E: [] };
    for (const f of CHECKIN_FIELDS) g[f.pillar].push(f);
    return g;
  }, []);

  return (
    <div style={{ padding: 18, borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2.5, color: "rgba(255,255,255,0.35)" }}>CHECK-IN DIÁRIO · MCE</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 4 }}>Como foi seu dia?</div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Fechar" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
            <X size={18} />
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {(["M", "C", "E"] as PillarKey[]).map((pillar) => (
          <div key={pillar} style={{ padding: 14, borderRadius: 12, background: `${PILLAR_COLORS[pillar]}08`, border: `1px solid ${PILLAR_COLORS[pillar]}22` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: PILLAR_COLORS[pillar] }}>{pillar}</span>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.35)" }}>
                {pillar === "M" ? "MENTALIDADE" : pillar === "C" ? "COMPORTAMENTO" : "EXECUÇÃO"}
              </span>
              <span style={{ marginLeft: "auto", fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: PILLAR_COLORS[pillar] }}>{preview[pillar]}</span>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {groups[pillar].map((field) => {
                const val = values[field.key] as number;
                const displayVal = field.invert ? 11 - val : val;
                const color = displayVal >= 7 ? "#00FF88" : displayVal >= 4 ? "#F59E0B" : "#EF4444";
                return (
                  <div key={String(field.key)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{field.label}</span>
                      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color, minWidth: 24, textAlign: "right" }}>{displayVal}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={val}
                      onChange={(e) => update(field.key, Number(e.target.value))}
                      aria-label={field.label}
                      style={{ width: "100%", accentColor: PILLAR_COLORS[pillar] }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
        <button
          type="button"
          onClick={submit}
          disabled={saving || saved}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 8, cursor: saved ? "default" : "pointer",
            fontFamily: MONO, fontSize: 11, letterSpacing: 2,
            background: saved ? "rgba(0,255,136,0.16)" : "rgba(184,146,42,0.18)",
            border: `1px solid ${saved ? "rgba(0,255,136,0.5)" : "rgba(184,146,42,0.5)"}`,
            color: saved ? "#00FF88" : "#B8922A",
            transition: "all 0.25s ease",
          }}
        >
          {saving ? "SALVANDO..." : saved ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} /> CHECK-IN SALVO</span> : "SALVAR CHECK-IN"}
        </button>
      </div>

      <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: "rgba(255,255,255,0.28)", marginTop: 12, lineHeight: 1.5 }}>
        O score é calculado pela média móvel dos últimos 7 dias com check-in. Quanto mais honesto o registro, mais precisa a recomendação.
      </p>
    </div>
  );
}

export function useRollingMceScores() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [diagnosticScores, setDiagnosticScores] = useState<Record<PillarKey, number> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const [checkinRes, diagRes, scoreRes] = await Promise.all([
      supabase.from("mce_checkins").select("checkin_date, sleep_quality, stress_level, nutrition_adherence, hydration, movement, focus_clarity").eq("user_id", user.id).gte("checkin_date", since.toISOString().slice(0, 10)).order("checkin_date", { ascending: false }),
      supabase.from("mce_diagnostics").select("pillar, answers").eq("user_id", user.id),
      supabase.from("mce_scores").select("score_m, score_c, score_e").eq("user_id", user.id).eq("source", "diagnostic").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setCheckins((checkinRes.data as CheckinRow[]) ?? []);

    let fallback: Record<PillarKey, number> = { M: 50, C: 50, E: 50 };
    if (scoreRes.data) {
      fallback = { M: scoreRes.data.score_m ?? 50, C: scoreRes.data.score_c ?? 50, E: scoreRes.data.score_e ?? 50 };
    } else if (diagRes.data?.length) {
      const d = diagRes.data as { pillar: PillarKey; answers: number[] }[];
      for (const row of d) {
        if (row.answers?.length === 3) {
          fallback[row.pillar] = Math.round((row.answers.reduce((a, b) => a + b, 0) / 30) * 100);
        }
      }
    }
    setDiagnosticScores(fallback);
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const scores = useMemo(() => {
    if (!diagnosticScores) return { M: 50, C: 50, E: 50 };
    return rollingScores(checkins, diagnosticScores, 7);
  }, [checkins, diagnosticScores]);

  const todayKey = dayKey(new Date());
  const checkedInToday = useMemo(() => checkins.some((c) => c.checkin_date === todayKey), [checkins, todayKey]);

  return { scores, checkins, loading, refresh: load, checkedInToday };
}
