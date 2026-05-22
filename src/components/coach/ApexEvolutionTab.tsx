import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

interface ScoreDataPoint {
  date: string;
  dateISO: string;
  sri?: number;
  bodyScore?: number;
  fcs?: number;
  assimetria?: number;
  qualidade?: number;
}

const SCORE_LINES = [
  { key: "sri",       label: "SRI",        color: "#B8922A" },
  { key: "bodyScore", label: "Body Score", color: "#38BDF8" },
  { key: "fcs",       label: "FCS Fenner", color: "#A78BFA" },
  { key: "qualidade", label: "Qualidade",  color: "#34D399" },
] as const;

async function loadScoreHistory(athleteId: string): Promise<ScoreDataPoint[]> {
  const { data, error } = await supabase
    .from("apex_analyses" as any)
    .select("id, created_at, scores")
    .eq("athlete_id", athleteId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as any[]).map((row) => ({
    dateISO: row.created_at,
    date: new Date(row.created_at).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short",
    }),
    sri:        row.scores?.sri        ?? undefined,
    bodyScore:  row.scores?.body_score ?? undefined,
    fcs:        row.scores?.fcs        ?? undefined,
    assimetria: row.scores?.assimetria ?? undefined,
    qualidade:  row.scores?.qualidade != null
      ? Math.round(row.scores.qualidade * 100)
      : undefined,
  }));
}

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const cor = value > 0 ? "#34D399" : "#EF4444";
  const sinal = value > 0 ? "▲" : "▼";
  return (
    <span style={{ fontSize: 11, color: cor, marginLeft: 6 }}>
      {sinal} {Math.abs(value)}
    </span>
  );
}

function ScoreSummaryCards({ history }: { history: ScoreDataPoint[] }) {
  if (history.length < 2) return null;
  const first = history[0];
  const last = history[history.length - 1];

  const metrics = [
    { label: "SRI", sublabel: "Show Readiness", current: last.sri, delta: (last.sri ?? 0) - (first.sri ?? 0), color: "#B8922A" },
    { label: "Body Score", sublabel: "Lifestyle", current: last.bodyScore, delta: (last.bodyScore ?? 0) - (first.bodyScore ?? 0), color: "#38BDF8" },
    { label: "FCS", sublabel: "Clínico Fenner", current: last.fcs, delta: (last.fcs ?? 0) - (first.fcs ?? 0), color: "#A78BFA" },
    { label: "Qualidade", sublabel: "Detecção IA", current: last.qualidade, delta: (last.qualidade ?? 0) - (first.qualidade ?? 0), color: "#34D399" },
  ].filter((m) => m.current != null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 10, marginBottom: 20 }}>
      {metrics.map((m, i) => (
        <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: `0.5px solid ${m.color}30`, borderRadius: 10 }}>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>{m.sublabel}</p>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: m.color }}>{m.current}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 2 }}>/100</span>
            <DeltaBadge value={Math.round(m.delta)} />
          </div>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", margin: "4px 0 0" }}>
            {m.label} · {history.length} análises
          </p>
        </div>
      ))}
    </div>
  );
}

function ScoreToggleBar({ active, onToggle, available }: { active: string[]; onToggle: (k: string) => void; available: string[] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
      {SCORE_LINES.filter((s) => available.includes(s.key)).map((s) => {
        const on = active.includes(s.key);
        return (
          <button
            key={s.key}
            onClick={() => onToggle(s.key)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 10px",
              background: on ? `${s.color}18` : "rgba(255,255,255,0.03)",
              border: on ? `0.5px solid ${s.color}60` : "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 20, cursor: "pointer", fontSize: 11,
              color: on ? s.color : "rgba(255,255,255,0.35)",
              transition: "all 0.15s",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: on ? s.color : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#13131A", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 6, fontSize: 10 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: "rgba(255,255,255,0.6)" }}>{p.name}:</span>
          <span style={{ color: "#fff", fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreHistoryChart({ history, activeScores }: { history: ScoreDataPoint[]; activeScores: string[] }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {SCORE_LINES.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={80}
            stroke="rgba(110,231,183,0.2)"
            strokeDasharray="4 4"
            label={{ value: "Zona elite", position: "insideTopRight", fill: "rgba(110,231,183,0.4)", fontSize: 9 }}
          />
          {SCORE_LINES.filter((s) => activeScores.includes(s.key)).map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              dot={{ fill: s.color, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: s.color, stroke: "#0A0A0F", strokeWidth: 2 }}
              connectNulls
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AssimetriaChart({ history }: { history: ScoreDataPoint[] }) {
  const hasData = history.some((h) => h.assimetria != null);
  if (!hasData) return null;
  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginBottom: 10 }}>
        ASSIMETRIA POSTURAL (°) — quanto menor, melhor
      </p>
      <div style={{ width: "100%", height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-assim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#13131A", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: "rgba(255,255,255,0.4)" }}
              itemStyle={{ color: "#EF4444" }}
            />
            <ReferenceLine
              y={2}
              stroke="rgba(110,231,183,0.25)"
              strokeDasharray="4 4"
              label={{ value: "Meta < 2°", position: "insideTopRight", fill: "rgba(110,231,183,0.4)", fontSize: 9 }}
            />
            <Area
              type="monotone"
              dataKey="assimetria"
              name="Assimetria"
              stroke="#EF4444"
              strokeWidth={1.5}
              fill="url(#grad-assim)"
              dot={{ fill: "#EF4444", r: 3, strokeWidth: 0 }}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function projectWeeksToElite(history: ScoreDataPoint[]): {
  score: string;
  weeks: number | null;
  trend: "subindo" | "caindo" | "estável";
} | null {
  const valid = history.filter((h) => h.sri != null).map((h, i) => ({ x: i, y: h.sri!, iso: h.dateISO }));
  if (valid.length < 2) return null;

  const n = valid.length;
  const sx = valid.reduce((s, p) => s + p.x, 0);
  const sy = valid.reduce((s, p) => s + p.y, 0);
  const sxy = valid.reduce((s, p) => s + p.x * p.y, 0);
  const sx2 = valid.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sx2 - sx * sx;
  if (denom === 0) return { score: "SRI", weeks: null, trend: "estável" };
  const slope = (n * sxy - sx * sy) / denom;

  const current = valid[valid.length - 1].y;
  const target = 80;
  const trend: "subindo" | "caindo" | "estável" =
    slope > 0.3 ? "subindo" : slope < -0.3 ? "caindo" : "estável";

  if (slope <= 0 || current >= target) return { score: "SRI", weeks: null, trend };

  const stepsNeeded = (target - current) / slope;
  const avgDays =
    (new Date(valid[valid.length - 1].iso).getTime() - new Date(valid[0].iso).getTime()) /
    (1000 * 60 * 60 * 24 * (valid.length - 1));
  const dayStep = avgDays > 0 ? avgDays : 7;
  const weeks = Math.max(1, Math.ceil((stepsNeeded * dayStep) / 7));
  return { score: "SRI", weeks, trend };
}

export default function ApexEvolutionTab({ athleteId }: { athleteId: string | null }) {
  const [history, setHistory] = useState<ScoreDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string[]>(["sri", "bodyScore", "fcs", "qualidade"]);

  useEffect(() => {
    if (!athleteId) {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadScoreHistory(athleteId).then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, [athleteId]);

  const available = useMemo(() => {
    const keys = new Set<string>();
    history.forEach((h) => {
      SCORE_LINES.forEach((s) => {
        if ((h as any)[s.key] != null) keys.add(s.key);
      });
    });
    return Array.from(keys);
  }, [history]);

  // Ensure active only contains available scores; default to all available
  useEffect(() => {
    if (available.length === 0) return;
    setActive((prev) => {
      const filtered = prev.filter((k) => available.includes(k));
      return filtered.length ? filtered : available;
    });
  }, [available]);

  const projection = useMemo(() => projectWeeksToElite(history), [history]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
        Carregando histórico…
      </div>
    );
  }

  if (history.length < 2) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
          Evolução disponível após 2 análises
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
          Os scores serão plotados automaticamente a cada nova análise
        </p>
      </div>
    );
  }

  const toggle = (k: string) =>
    setActive((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  return (
    <div style={{ background: "#0A0A0F", borderRadius: 12, padding: 16 }}>
      <ScoreSummaryCards history={history} />
      <ScoreToggleBar active={active} onToggle={toggle} available={available} />
      <ScoreHistoryChart history={history} activeScores={active} />
      <AssimetriaChart history={history} />

      {projection && (
        <div
          style={{
            marginTop: 20,
            padding: "12px 16px",
            background:
              projection.trend === "subindo"
                ? "rgba(52,211,153,0.07)"
                : projection.trend === "caindo"
                ? "rgba(239,68,68,0.07)"
                : "rgba(255,255,255,0.04)",
            border: `0.5px solid ${
              projection.trend === "subindo"
                ? "rgba(52,211,153,0.25)"
                : projection.trend === "caindo"
                ? "rgba(239,68,68,0.25)"
                : "rgba(255,255,255,0.1)"
            }`,
            borderRadius: 10,
          }}
        >
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginBottom: 6 }}>
            PROJEÇÃO DE META
          </p>
          {projection.trend === "subindo" && projection.weeks ? (
            <p style={{ fontSize: 13, color: "#34D399" }}>
              No ritmo atual, o atleta atinge zona elite (80+ SRI) em aproximadamente{" "}
              <strong style={{ color: "#fff" }}>{projection.weeks} semanas</strong>
            </p>
          ) : projection.trend === "caindo" ? (
            <p style={{ fontSize: 13, color: "#EF4444" }}>
              Tendência de queda detectada — revisar protocolo de correção postural
            </p>
          ) : (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              Score estável — manter protocolo atual
            </p>
          )}
        </div>
      )}
    </div>
  );
}
