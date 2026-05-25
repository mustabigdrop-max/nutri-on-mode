import {
  createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

/* ─────────────── tokens ─────────────── */
const C_FEEDER = "#9080ff";
const C_WORKING = "#c8a020";
const C_BACKOFF = "#00d4aa";
const C_TEAL = "#00d4aa";
const C_LIGHT = "#60b0ff";
const C_HARD = "#ff4060";
const TEXT = "#f0fdf4";
const TEXT_DIM = "#94a3b8";
const TEXT_MUTED = "#64748b";

const COLOR_BY_TYPE: Record<SetType, string> = {
  feeder: C_FEEDER,
  working: C_WORKING,
  backoff: C_BACKOFF,
  top: "#f97316",
};

const BADGE_LABEL: Record<SetType, string> = {
  feeder: "FEEDER",
  working: "TRABALHO",
  backoff: "BACK-OFF",
  top: "TOP",
};

type SetType = "feeder" | "working" | "backoff" | "top";

interface SetState {
  completed: boolean;
  load_done?: number | null;
  reps_done?: number | null;
  feedback?: "leve" | "certo" | "pesado" | null;
  load_prescribed?: string | null;
  reps_prescribed?: string | null;
}

interface SetKey { exerciseId: string; type: SetType; n: number; }
const keyOf = (k: SetKey) => `${k.exerciseId}|${k.type}|${k.n}`;

interface RegEntry { key: string; exerciseId: string; type: SetType; n: number; rirHint?: number; }

/* ─────────────── context ─────────────── */
interface Ctx {
  userId?: string | null;
  states: Record<string, SetState>;
  register: (entries: RegEntry[]) => void;
  toggleSet: (k: SetKey, payload: Partial<SetState> & { rirHint?: number; load_prescribed?: string; reps_prescribed?: string }) => void;
  updateField: (k: SetKey, patch: Partial<SetState>) => void;
  saveFeedback: (k: SetKey, fb: "leve" | "certo" | "pesado") => void;
  startedAt: number;
  totals: { total: number; done: number; feeder: { t: number; d: number }; working: { t: number; d: number }; backoff: { t: number; d: number } };
  isComplete: boolean;
}
const TrackerCtx = createContext<Ctx | null>(null);

export const useTracker = () => {
  const c = useContext(TrackerCtx);
  if (!c) throw new Error("useTracker outside provider");
  return c;
};

/* ─────────────── audio beep ─────────────── */
function playBeep() {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const beep = (when: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      o.type = "sine";
      g.gain.setValueAtTime(0.001, ctx.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + 0.15);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + when);
      o.stop(ctx.currentTime + when + 0.18);
    };
    beep(0); beep(0.25);
    setTimeout(() => ctx.close(), 800);
  } catch {}
}

/* ─────────────── rest-timer hook ─────────────── */
interface RestTimer {
  active: boolean;
  total: number;
  remaining: number;
  start: (seconds: number) => void;
  skip: () => void;
  addThirty: () => void;
}

function useRestTimer(): RestTimer {
  const [total, setTotal] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [active, setActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
    setActive(false);
  }, []);

  const start = useCallback((seconds: number) => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setTotal(seconds);
    setRemaining(seconds);
    setActive(true);
    intervalRef.current = window.setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
          playBeep();
          window.setTimeout(() => setActive(false), 500);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, []);

  const skip = useCallback(() => { stop(); setRemaining(0); }, [stop]);
  const addThirty = useCallback(() => { setTotal(t => t + 30); setRemaining(r => r + 30); }, []);

  useEffect(() => () => { if (intervalRef.current) window.clearInterval(intervalRef.current); }, []);

  return { active, total, remaining, start, skip, addThirty };
}

const TimerCtx = createContext<RestTimer | null>(null);
export const useRestTimerCtx = () => {
  const c = useContext(TimerCtx);
  if (!c) throw new Error("useRestTimerCtx outside provider");
  return c;
};

/* ─────────────── provider ─────────────── */
function todayISO() { return new Date().toISOString().slice(0, 10); }

export function TrackerProvider({ userId, children }: { userId?: string | null; children: ReactNode }) {
  const [states, setStates] = useState<Record<string, SetState>>({});
  const [registry, setRegistry] = useState<Record<string, RegEntry>>({});
  const [startedAt] = useState(() => Date.now());
  const timer = useRestTimer();

  /* restore today's logs */
  useEffect(() => {
    if (!userId) return;
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("training_set_logs")
        .select("exercise_id,set_type,set_number,load_prescribed,load_done,reps_prescribed,reps_done,completed,feedback")
        .eq("user_id", userId)
        .eq("session_date", todayISO());
      if (cancel || !data) return;
      const next: Record<string, SetState> = {};
      data.forEach((r: any) => {
        next[`${r.exercise_id}|${r.set_type}|${r.set_number}`] = {
          completed: !!r.completed,
          load_done: r.load_done,
          reps_done: r.reps_done,
          feedback: r.feedback,
          load_prescribed: r.load_prescribed,
          reps_prescribed: r.reps_prescribed,
        };
      });
      setStates(prev => ({ ...next, ...prev }));
    })();
    return () => { cancel = true; };
  }, [userId]);

  const register = useCallback((entries: RegEntry[]) => {
    setRegistry(prev => {
      const next = { ...prev };
      entries.forEach(e => { next[e.key] = e; });
      return next;
    });
  }, []);

  const persist = useCallback(async (k: SetKey, state: SetState) => {
    if (!userId) return;
    await supabase.from("training_set_logs").upsert({
      user_id: userId,
      session_date: todayISO(),
      exercise_id: k.exerciseId,
      set_type: k.type,
      set_number: k.n,
      load_prescribed: state.load_prescribed ?? null,
      load_done: state.load_done ?? null,
      reps_prescribed: state.reps_prescribed ?? null,
      reps_done: state.reps_done ?? null,
      completed: !!state.completed,
      feedback: state.feedback ?? null,
      completed_at: state.completed ? new Date().toISOString() : null,
    }, { onConflict: "user_id,session_date,exercise_id,set_type,set_number" });
  }, [userId]);

  const restSecondsFor = (type: SetType, rirHint?: number) => {
    if (type === "feeder") return 60;
    if (type === "backoff") return 90;
    if (type === "top") return 180;
    if (rirHint != null) {
      if (rirHint <= 1) return 180;
      if (rirHint === 2) return 120;
      return 90;
    }
    return 120;
  };

  const toggleSet = useCallback((k: SetKey, payload: Partial<SetState> & { rirHint?: number; load_prescribed?: string; reps_prescribed?: string }) => {
    const id = keyOf(k);
    setStates(prev => {
      const cur = prev[id] || { completed: false };
      const willComplete = !cur.completed;
      const next: SetState = {
        ...cur,
        ...payload,
        completed: willComplete,
        load_prescribed: payload.load_prescribed ?? cur.load_prescribed,
        reps_prescribed: payload.reps_prescribed ?? cur.reps_prescribed,
      };
      persist(k, next);
      if (willComplete) timer.start(restSecondsFor(k.type, payload.rirHint));
      return { ...prev, [id]: next };
    });
  }, [persist, timer]);

  const updateField = useCallback((k: SetKey, patch: Partial<SetState>) => {
    const id = keyOf(k);
    setStates(prev => {
      const cur = prev[id] || { completed: false };
      const next = { ...cur, ...patch };
      persist(k, next);
      return { ...prev, [id]: next };
    });
  }, [persist]);

  const saveFeedback = useCallback((k: SetKey, fb: "leve" | "certo" | "pesado") => {
    updateField(k, { feedback: fb });
  }, [updateField]);

  const totals = useMemo(() => {
    const all = Object.values(registry);
    const f = all.filter(x => x.type === "feeder");
    const w = all.filter(x => x.type === "working");
    const b = all.filter(x => x.type === "backoff");
    const t = all.filter(x => x.type === "top");
    const doneFor = (arr: RegEntry[]) => arr.filter(e => states[e.key]?.completed).length;
    const total = all.length;
    const done = doneFor(all);
    return {
      total,
      done,
      feeder: { t: f.length, d: doneFor(f) },
      working: { t: w.length, d: doneFor(w) },
      backoff: { t: b.length, d: doneFor(b) },
      top: { t: t.length, d: doneFor(t) },
    };
  }, [registry, states]);

  const isComplete = totals.total > 0 && totals.done === totals.total;

  const ctxValue: Ctx = { userId, states, register, toggleSet, updateField, saveFeedback, startedAt, totals, isComplete };

  return (
    <TrackerCtx.Provider value={ctxValue}>
      <TimerCtx.Provider value={timer}>{children}</TimerCtx.Provider>
    </TrackerCtx.Provider>
  );
}

/* ─────────────── progress bar ─────────────── */
export function WorkoutProgressBar() {
  const { totals } = useTracker();
  const pct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;
  if (!totals.total) return null;
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40, pointerEvents: "none" }}>
      <div style={{ padding: "4px 12px 2px", background: "rgba(4,8,16,0.6)", backdropFilter: "blur(6px)" }}>
        <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "'Courier New', monospace" }}>
          TREINO {pct}% · {totals.done} DE {totals.total} SÉRIES
        </div>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.04)" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, #9080ff, #c8a020, #00d4aa)",
          transition: "width .4s ease",
          boxShadow: "0 0 8px rgba(200,160,32,0.4)",
        }} />
      </div>
    </div>
  );
}

/* ─────────────── rest timer overlay ─────────────── */
export function RestTimerOverlay() {
  const t = useRestTimerCtx();
  if (!t.active) return null;
  const pct = t.total ? t.remaining / t.total : 0;
  const circ = 2 * Math.PI * 40;
  const dash = circ * pct;
  const last10 = t.remaining <= 10;
  const stroke = last10 ? C_TEAL : C_WORKING;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(4,8,16,0.55)", backdropFilter: "blur(4px)",
        }}
      >
        <motion.div
          initial={{ scale: 0.9 }} animate={{ scale: 1 }}
          style={{
            padding: "24px 32px", borderRadius: 8,
            background: "rgba(4,8,16,0.92)",
            border: "0.5px solid rgba(200,160,32,0.3)",
            boxShadow: `0 0 32px ${stroke}40`,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <div style={{ position: "relative", width: 100, height: 100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="50" cy="50" r="40" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dasharray .9s linear, stroke .3s" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: stroke, lineHeight: 1 }}>{t.remaining}</span>
              <span style={{ fontSize: 8, color: C_TEAL, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 4 }}>
                DESCANSO
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={t.skip} style={btnHud()}>PULAR</button>
            <button onClick={t.addThirty} style={btnHud()}>+30s</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
function btnHud(): React.CSSProperties {
  return {
    background: "transparent",
    border: `1px solid ${C_WORKING}`,
    color: C_WORKING,
    padding: "6px 14px",
    borderRadius: 4,
    fontSize: 10,
    letterSpacing: ".1em",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
  };
}

/* ─────────────── complete card ─────────────── */
export function WorkoutCompleteCard() {
  const { totals, startedAt, isComplete, userId, states } = useTracker();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [aiMsg, setAiMsg] = useState<string>("");

  useEffect(() => {
    if (!isComplete || saved || !userId) return;
    setSaved(true);
    const durMin = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const feedbacks = Object.values(states).map(s => s.feedback).filter(Boolean) as string[];
    const certoPct = feedbacks.length ? Math.round((feedbacks.filter(f => f === "certo").length / feedbacks.length) * 100) : 0;
    const msg = totals.done >= 12
      ? `Volume sólido. ${totals.working.d} séries de trabalho concluídas — consistência define progresso.`
      : `Treino concluído. ${certoPct}% das cargas no ponto. Mantenha o ritmo no próximo bloco.`;
    setAiMsg(msg);

    supabase.from("training_sessions_completed").upsert({
      user_id: userId,
      session_date: todayISO(),
      duration_minutes: durMin,
      total_sets: totals.total,
      feeder_count: totals.feeder.t,
      working_count: totals.working.t,
      backoff_count: totals.backoff.t,
      feedback_summary: { feedbacks },
      ai_message: msg,
      completed: true,
    }, { onConflict: "user_id,session_date" });
  }, [isComplete, saved, userId, totals, startedAt, states]);

  if (!isComplete) return null;
  const durMin = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      style={{
        margin: "12px 12px 0",
        background: "linear-gradient(135deg, rgba(200,160,32,0.12), rgba(0,212,170,0.08))",
        border: "0.5px solid rgba(200,160,32,0.4)",
        borderRadius: 8,
        padding: 20,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: C_WORKING, letterSpacing: ".06em" }}>TREINO CONCLUÍDO</div>
      <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: TEXT_DIM }}>
        <span>⏱ {durMin} min</span>
        <span style={{ color: C_FEEDER }}>F: {totals.feeder.t}</span>
        <span style={{ color: C_WORKING }}>W: {totals.working.t}</span>
        <span style={{ color: C_BACKOFF }}>B: {totals.backoff.t}</span>
      </div>
      {aiMsg && <p style={{ marginTop: 10, fontSize: 12, color: TEXT, lineHeight: 1.5 }}>{aiMsg}</p>}
      <button
        onClick={() => navigate("/command")}
        style={{
          marginTop: 14,
          background: "rgba(200,160,32,0.18)",
          border: `1px solid ${C_WORKING}`,
          color: C_WORKING,
          padding: "8px 14px",
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".08em",
          cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}
      >
        VER NO COMMAND <ChevronRight className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

/* ─────────────── set row ─────────────── */
interface SetRowProps {
  exerciseId: string;
  type: SetType;
  n: number;
  prefix: string;
  loadPrescribed: string;
  repsPrescribed: string;
  rirHint?: number;
}
function SetRowCheck({ exerciseId, type, n, prefix, loadPrescribed, repsPrescribed, rirHint }: SetRowProps) {
  const { states, toggleSet, updateField, saveFeedback } = useTracker();
  const id = `${exerciseId}|${type}|${n}`;
  const st = states[id];
  const color = COLOR_BY_TYPE[type];
  const completed = !!st?.completed;

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 8px",
        borderRadius: 4,
        borderLeft: completed ? `2px solid ${color}` : "2px solid transparent",
        background: completed ? `${color}10` : "rgba(255,255,255,0.015)",
        transition: "all .25s ease",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={() => toggleSet({ exerciseId, type, n }, { rirHint, load_prescribed: loadPrescribed, reps_prescribed: repsPrescribed })}
        aria-label="Marcar série"
        style={{
          width: 20, height: 20, borderRadius: 4, cursor: "pointer", flexShrink: 0,
          border: `1.5px solid ${color}`,
          background: completed ? color : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .25s ease",
        }}
      >
        {completed && <Check className="w-3 h-3" style={{ color: "#fff", strokeWidth: 3 }} />}
      </button>

      <span style={{ fontSize: 10, color: TEXT_MUTED, minWidth: 22, fontFamily: "monospace" }}>
        {prefix}{n}
      </span>

      <span style={{
        fontSize: 7, padding: "1px 5px", borderRadius: 99,
        background: `${color}18`, color, fontWeight: 700, letterSpacing: ".08em",
      }}>
        {BADGE_LABEL[type]}
      </span>

      <span style={{ fontSize: 11, color: TEXT_DIM, fontFamily: "monospace" }}>
        {loadPrescribed} × {repsPrescribed}
      </span>

      <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
        <input
          type="number" step="0.5" placeholder="kg"
          value={st?.load_done ?? ""}
          onChange={e => updateField({ exerciseId, type, n }, { load_done: e.target.value === "" ? null : parseFloat(e.target.value) })}
          style={inputHud(48, color)}
        />
        <input
          type="number" placeholder="reps"
          value={st?.reps_done ?? ""}
          onChange={e => updateField({ exerciseId, type, n }, { reps_done: e.target.value === "" ? null : parseInt(e.target.value) })}
          style={inputHud(40, color)}
        />
      </div>

      {completed && type === "working" && (
        <FeedbackBar
          current={st?.feedback ?? null}
          onPick={fb => saveFeedback({ exerciseId, type, n }, fb)}
        />
      )}
    </div>
  );
}
function inputHud(w: number, color: string): React.CSSProperties {
  return {
    width: w, height: 24,
    background: "rgba(8,16,26,0.95)",
    border: "0.5px solid rgba(255,255,255,0.08)",
    borderRadius: 3,
    fontSize: 10,
    color: C_WORKING,
    textAlign: "center",
    outline: "none",
    fontFamily: "monospace",
  };
}

function FeedbackBar({ current, onPick }: { current: "leve" | "certo" | "pesado" | null; onPick: (f: "leve" | "certo" | "pesado") => void }) {
  const opts: { id: "leve" | "certo" | "pesado"; label: string; emoji: string; color: string }[] = [
    { id: "leve", label: "LEVE", emoji: "😤", color: C_LIGHT },
    { id: "certo", label: "CERTO", emoji: "✓", color: C_TEAL },
    { id: "pesado", label: "PESADO", emoji: "🔥", color: C_HARD },
  ];
  return (
    <div style={{ width: "100%", display: "flex", gap: 4, marginTop: 4, paddingLeft: 26 }}>
      {opts.map(o => {
        if (current && current !== o.id) return null;
        const selected = current === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onPick(o.id)}
            style={{
              height: 22, padding: "0 8px",
              fontSize: 9, fontWeight: 700, letterSpacing: ".08em",
              border: `1px solid ${o.color}`,
              background: selected ? o.color : "transparent",
              color: selected ? "#0a0a0a" : o.color,
              borderRadius: 3, cursor: selected ? "default" : "pointer",
              transition: "all .25s ease",
            }}
          >
            {o.emoji} {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────── exercise block ─────────────── */
function parseSetsCount(v: any): number {
  if (v == null) return 0;
  const m = String(v).match(/\d+/);
  return m ? Math.max(0, parseInt(m[0])) : 0;
}
function parseRIR(v: any): number | undefined {
  if (v == null) return undefined;
  const m = String(v).match(/\d+/);
  return m ? parseInt(m[0]) : undefined;
}

export function SetTrackerBlock({
  exerciseId, struct,
}: { exerciseId: string; struct: any }) {
  const { register, states } = useTracker();

  const feeders = Array.isArray(struct?.feeder_sets) ? struct.feeder_sets : [];
  const workCount = parseSetsCount(struct?.work_sets?.sets);
  const backoffCount = parseSetsCount(struct?.backoff_sets?.sets);
  const rirHint = parseRIR(struct?.work_sets?.rir);

  /* register all sets */
  useEffect(() => {
    const entries: RegEntry[] = [];
    feeders.forEach((_: any, i: number) => entries.push({
      key: `${exerciseId}|feeder|${i + 1}`, exerciseId, type: "feeder", n: i + 1,
    }));
    for (let i = 1; i <= workCount; i++) entries.push({
      key: `${exerciseId}|working|${i}`, exerciseId, type: "working", n: i, rirHint,
    });
    for (let i = 1; i <= backoffCount; i++) entries.push({
      key: `${exerciseId}|backoff|${i}`, exerciseId, type: "backoff", n: i,
    });
    if (entries.length) register(entries);
  }, [exerciseId, feeders.length, workCount, backoffCount, rirHint, register]);

  /* per-exercise counters */
  const counter = (type: SetType, total: number) => {
    let done = 0;
    for (let i = 1; i <= total; i++) if (states[`${exerciseId}|${type}|${i}`]?.completed) done++;
    return done;
  };
  const fDone = counter("feeder", feeders.length);
  const wDone = counter("working", workCount);
  const bDone = counter("backoff", backoffCount);
  const totalEx = feeders.length + workCount + backoffCount;
  const doneEx = fDone + wDone + bDone;
  const allDone = totalEx > 0 && doneEx === totalEx;

  if (totalEx === 0) return null;

  return (
    <div style={{ marginTop: 8 }}>
      {/* counters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center", flexWrap: "wrap" }}>
        {feeders.length > 0 && (
          <span style={{ fontSize: 9, letterSpacing: ".06em", color: C_FEEDER, fontFamily: "monospace" }}>
            F: {fDone}/{feeders.length}
          </span>
        )}
        {workCount > 0 && (
          <span style={{ fontSize: 9, letterSpacing: ".06em", color: C_WORKING, fontFamily: "monospace" }}>
            W: {wDone}/{workCount}
          </span>
        )}
        {backoffCount > 0 && (
          <span style={{ fontSize: 9, letterSpacing: ".06em", color: C_BACKOFF, fontFamily: "monospace" }}>
            B: {bDone}/{backoffCount}
          </span>
        )}
        {allDone && (
          <span style={{
            fontSize: 8, padding: "1px 6px", borderRadius: 99,
            background: `${C_TEAL}20`, color: C_TEAL, fontWeight: 700, letterSpacing: ".08em",
          }}>COMPLETO ✓</span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {feeders.map((f: any, i: number) => (
          <SetRowCheck
            key={`f${i}`} exerciseId={exerciseId} type="feeder" n={i + 1} prefix="F"
            loadPrescribed={String(f.load_percent ?? "carga")}
            repsPrescribed={String(f.reps ?? "—")}
          />
        ))}
        {Array.from({ length: workCount }).map((_, i) => (
          <SetRowCheck
            key={`w${i}`} exerciseId={exerciseId} type="working" n={i + 1} prefix="S"
            loadPrescribed={String(struct?.work_sets?.load ?? struct?.work_sets?.zone ?? "carga")}
            repsPrescribed={String(struct?.work_sets?.reps ?? "—")}
            rirHint={rirHint}
          />
        ))}
        {Array.from({ length: backoffCount }).map((_, i) => (
          <SetRowCheck
            key={`b${i}`} exerciseId={exerciseId} type="backoff" n={i + 1} prefix="B"
            loadPrescribed={String(struct?.backoff_sets?.load_reduction ?? "redução")}
            repsPrescribed={String(struct?.backoff_sets?.reps ?? "—")}
          />
        ))}
      </div>
    </div>
  );
}
