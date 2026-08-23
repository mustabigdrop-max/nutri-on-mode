import { useCallback, useEffect, useMemo, useState } from "react";
import { Flame, Radar, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { PillarKey } from "@/data/mceData";
import {
  buildEvolution, buildHeatmap, challengeKey, challengeStreak, dayKey,
  HEAT_COLORS, LEVEL_REWARD, levelFor, todayChallenge,
  type EventRow, type ScoreRow,
} from "@/lib/mceSystem";

const MONO = "'Space Mono', ui-monospace, monospace";
const DISPLAY = "'Rajdhani', system-ui, sans-serif";

const Card = ({ title, icon, caption, children }: { title: string; icon: React.ReactNode; caption?: string; children: React.ReactNode }) => (
  <section style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "rgba(255,255,255,0.55)" }}>
      {icon}
      <h3 style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2.5, margin: 0 }}>{title}</h3>
    </div>
    {caption && <p style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 12px" }}>{caption}</p>}
    {children}
  </section>
);

export default function MceSystemPanel({ scores }: { scores: Record<PillarKey, number> }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [history, setHistory] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const since = new Date();
    since.setDate(since.getDate() - 92);
    const [ev, sc] = await Promise.all([
      supabase.from("mce_exercises_done").select("exercise_key, completed_at").eq("user_id", user.id).gte("completed_at", since.toISOString()),
      supabase.from("mce_scores").select("created_at, score_m, score_c, score_e").eq("user_id", user.id).gte("created_at", since.toISOString()).order("created_at"),
    ]);
    setEvents((ev.data as EventRow[]) ?? []);
    setHistory((sc.data as ScoreRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const heat = useMemo(() => buildHeatmap(events, history), [events, history]);
  const series = useMemo(() => buildEvolution(history), [history]);
  const media = Math.round((scores.M + scores.C + scores.E) / 3);
  const { level, next, progress } = levelFor(media);
  const challenge = useMemo(() => todayChallenge(scores), [scores]);
  const todayKey = challengeKey();
  const doneToday = events.some((e) => e.exercise_key === todayKey);
  const streak = useMemo(() => challengeStreak(events), [events]);

  const completeChallenge = async () => {
    if (!user || doneToday) return;
    const now = new Date().toISOString();
    setEvents((prev) => [...prev, { exercise_key: todayKey, completed_at: now }]);
    await supabase.from("mce_exercises_done").insert({ user_id: user.id, exercise_key: todayKey });
  };

  // grid por colunas de semana (estilo GitHub)
  const columns: typeof heat[] = [];
  for (let i = 0; i < heat.length; i += 7) columns.push(heat.slice(i, i + 7));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Micro-desafio */}
      <Card title="DESAFIO DE HOJE" icon={<Sparkles size={14} />} caption={`Pilar mais fraco: ${challenge.pillar === "M" ? "Mindset" : challenge.pillar === "C" ? "Comportamento" : "Execução"}`}>
        <p style={{ fontFamily: DISPLAY, fontSize: 18, lineHeight: 1.5, color: "rgba(255,255,255,0.9)", margin: 0 }}>{challenge.text}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={completeChallenge}
            disabled={doneToday || !user}
            style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: 2, padding: "9px 16px", cursor: doneToday ? "default" : "pointer",
              background: doneToday ? "rgba(0,255,136,0.16)" : "transparent",
              border: `1px solid ${doneToday ? "rgba(0,255,136,0.5)" : "rgba(255,255,255,0.25)"}`,
              color: doneToday ? "#00FF88" : "rgba(255,255,255,0.8)",
            }}
          >
            {doneToday ? "CONCLUÍDO ✓" : "CONCLUÍ ✓"}
          </button>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, color: "#F59E0B" }}>
            <Flame size={13} /> {streak} {streak === 1 ? "dia" : "dias"} seguidos
          </span>
        </div>
      </Card>

      {/* Nível MCE */}
      <Card title="NÍVEL MCE" icon={<ShieldCheck size={14} />} caption="O progresso não é peso perdido. É comportamento.">
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{
            width: 72, height: 82, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: `${level.color}14`, border: `1px solid ${level.color}55`,
            clipPath: "polygon(50% 0%, 100% 18%, 100% 72%, 50% 100%, 0% 72%, 0% 18%)",
          }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 900, color: level.color }}>{media}</span>
            <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: 1, color: "rgba(255,255,255,0.5)" }}>MCE</span>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: level.color, letterSpacing: 1 }}>{level.name}</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 14, fontStyle: "italic", color: "rgba(255,255,255,0.6)" }}>“{level.title}”</div>
            <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", marginTop: 10, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: level.color, transition: "width .6s ease" }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
              {next ? `${progress}% até ${next.name} (${next.min}+)` : "NÍVEL MÁXIMO ATINGIDO"}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#00D4FF", marginTop: 6 }}>
              RECOMPENSA: {LEVEL_REWARD[level.name]}
            </div>
          </div>
        </div>
      </Card>

      {/* Heatmap */}
      <Card title="HEATMAP COMPORTAMENTAL · 90 DIAS" icon={<Radar size={14} />} caption="Seu comportamento em 90 dias. O shape é consequência.">
        <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 6 }}>
          {columns.map((col, ci) => (
            <div key={ci} style={{ display: "grid", gap: 3 }}>
              {col.map((d) => (
                <div
                  key={d.date}
                  title={`${d.label} · ${d.count} registro(s)${d.crisis ? " · SOS acionado" : ""}`}
                  aria-label={`${d.label}: ${d.count} registros`}
                  style={{
                    width: 11, height: 11, borderRadius: 2,
                    background: d.crisis ? "rgba(239,68,68,0.75)" : HEAT_COLORS[d.intensity],
                    border: dayKey(new Date()) === d.date ? "1px solid rgba(255,255,255,0.6)" : "1px solid transparent",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
          <span>MENOS</span>
          {[0, 1, 2, 3].map((i) => <span key={i} style={{ width: 11, height: 11, borderRadius: 2, background: HEAT_COLORS[i], display: "inline-block" }} />)}
          <span>MAIS</span>
          <span style={{ marginLeft: 10, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 11, height: 11, borderRadius: 2, background: "rgba(239,68,68,0.75)", display: "inline-block" }} /> CRISE / SOS
          </span>
        </div>
      </Card>

      {/* Evolução */}
      <Card title="MCE SCORE EVOLUTION · 12 SEMANAS" icon={<TrendingUp size={14} />} caption="MCE × tempo. O processo é o produto.">
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <RTooltip
                contentStyle={{ background: "#07070d", border: "1px solid rgba(255,255,255,0.12)", fontFamily: MONO, fontSize: 11 }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
              />
              <Line type="monotone" dataKey="M" name="Mindset" stroke="#A78BFA" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="C" name="Comportamento" stroke="#00FF88" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="E" name="Execução" stroke="#F59E0B" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="media" name="Média" stroke="rgba(255,255,255,0.35)" strokeWidth={1} strokeDasharray="4 4" dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {loading && <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>CARREGANDO HISTÓRICO...</p>}
        {!loading && history.length === 0 && (
          <p style={{ fontFamily: DISPLAY, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Sem histórico ainda — responda o Diagnóstico para começar a linha do tempo.
          </p>
        )}
      </Card>
    </div>
  );
}
