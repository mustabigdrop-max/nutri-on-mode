import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRollingMceScores } from "@/components/mce/MceDailyCheckin";
import { dayKey, type CheckinRow, type EventRow } from "@/lib/mceSystem";

const C = {
  bg: "#020205", s1: "#0B0B12", s2: "#10101A", s3: "#181824",
  border: "#ffffff08", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444",
  purple: "#A855F7", orange: "#F97316", muted: "#4A4A5A", dim: "#333340",
  text: "#C8C8D8", white: "#F0F0F8",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

// ═══ RANK SYSTEM ═══
const RANKS = [
  { id: 0, name: "Iniciante", min: 0, color: C.dim, icon: "○" },
  { id: 1, name: "Soldado", min: 7, color: C.cyan, icon: "◆" },
  { id: 2, name: "Guerreiro", min: 21, color: C.purple, icon: "◈" },
  { id: 3, name: "Titã", min: 45, color: C.gold, icon: "✦" },
  { id: 4, name: "Elite", min: 90, color: C.orange, icon: "★" },
  { id: 5, name: "Lenda", min: 180, color: "#FF0040", icon: "♛" },
];
function getRank(streak: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) if (streak >= RANKS[i].min) return RANKS[i];
  return RANKS[0];
}

// ═══ STREAK HELPERS ═══
function dayStreak(days: Set<string>): number {
  let streak = 0;
  const d = new Date();
  // hoje ainda pode não ter sido registrado — começa de ontem se hoje falta
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function StreakFire({ days, label, color = C.cyan, max = 30 }: { days: number; label: string; color?: string; max?: number }) {
  const pct = Math.min((days / max) * 100, 100);
  return (
    <div style={{ background: C.s2, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 1.5 }}>{label}</span>
        <span style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: days > 0 ? color : C.dim }}>
          {days}<span style={{ fontSize: 11, color: C.muted }}>d</span>
        </span>
      </div>
      <div style={{ height: 3, background: C.s3 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width .8s ease", boxShadow: days > 7 ? `0 0 8px ${color}40` : "none" }} />
      </div>
    </div>
  );
}

function MCEScoreRing({ m, c, e, size = 140 }: { m: number; c: number; e: number; size?: number }) {
  const total = Math.round((m + c + e) / 3);
  const r1 = (size - 8) / 2, r2 = r1 - 12, r3 = r2 - 12;
  const rings = [
    { r: r1, circ: 2 * Math.PI * r1, v: m, color: C.purple },
    { r: r2, circ: 2 * Math.PI * r2, v: c, color: C.cyan },
    { r: r3, circ: 2 * Math.PI * r3, v: e, color: C.gold },
  ];
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {rings.map((ring, i) => (
          <g key={i}>
            <circle cx={size / 2} cy={size / 2} r={ring.r} fill="none" stroke={C.s3} strokeWidth={8} />
            <circle cx={size / 2} cy={size / 2} r={ring.r} fill="none" stroke={ring.color} strokeWidth={8}
              strokeDasharray={ring.circ} strokeDashoffset={ring.circ * (1 - ring.v / 100)}
              strokeLinecap="butt" style={{ transition: "stroke-dashoffset 1.5s ease" }} />
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: F.t, fontSize: size * 0.25, fontWeight: 700, color: C.white, lineHeight: 1 }}>{total}</span>
        <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 1, marginTop: 2 }}>MCE</span>
      </div>
    </div>
  );
}

type ForgeResult = {
  mce_scores: { mindset: number; comportamento: number; execucao: number };
  streak_impact: "manteve" | "perdeu" | "fortaleceu";
  feedback: string;
  deviation_detected: boolean;
  correction_protocol: null | { what_failed: string; immediate_action: string; tomorrow_adjustment: string; mindset_reset: string };
  compound_message: string;
};

// ═══ CHECK-IN ═══
function CheckIn({ type, streaks, rankName, onSubmit }: { type: "morning" | "night"; streaks: Record<string, number>; rankName: string; onSubmit?: (r: ForgeResult) => void }) {
  const { user } = useAuth();
  const isMorning = type === "morning";
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ForgeResult | null>(null);

  const questions = isMorning
    ? [
        { id: "sleep", q: "Como dormiu?", opts: ["Péssimo", "Ruim", "OK", "Bem", "Excelente"] },
        { id: "mindset", q: "Mindset agora?", opts: ["Travado", "Baixo", "Neutro", "Focado", "Imparável"] },
        { id: "plan", q: "Sabe o plano de hoje?", opts: ["Não sei", "Mais ou menos", "Sei parcial", "Sei tudo", "Já comecei"] },
      ]
    : [
        { id: "training", q: "Treinou?", opts: ["Não", "Parcial", "Sim, leve", "Sim, completo", "Acima do plano"] },
        { id: "nutrition", q: "Dieta?", opts: ["Saiu total", "Escapou", "80%", "No plano", "Perfeita"] },
        { id: "content", q: "Postou conteúdo?", opts: ["Nada", "Stories", "1 post", "2+ posts", "Conteúdo épico"] },
        { id: "execution", q: "Execução geral?", opts: ["Fracassou", "Fraco", "Mediano", "Bom", "Excepcional"] },
      ];

  const set = (id: string, val: number) => setAnswers((a) => ({ ...a, [id]: val }));
  const complete = Object.keys(answers).length >= questions.length;

  const submit = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mce-forge", {
        body: { type, answers, streaks, rank: rankName },
      });
      if (error || !data) throw error ?? new Error("empty");
      const r = data as ForgeResult;
      setResult(r);

      // Persiste: mapeia respostas para o check-in diário + score da IA
      const scale = (i: number) => Math.max(1, Math.min(10, i * 2 + 2));
      const today = dayKey(new Date());
      const row = {
        user_id: user.id,
        checkin_date: today,
        sleep_quality: isMorning ? scale(answers.sleep) : 7,
        stress_level: isMorning ? scale(4 - answers.plan) : 5,
        nutrition_adherence: isMorning ? 7 : scale(answers.nutrition),
        hydration: isMorning ? 7 : scale(answers.execution),
        movement: isMorning ? 6 : scale(answers.training),
        focus_clarity: isMorning ? scale(answers.mindset) : 7,
      };
      await supabase.from("mce_checkins").upsert(row, { onConflict: "user_id,checkin_date" });
      await supabase.from("mce_scores").insert({
        user_id: user.id,
        score_m: r.mce_scores?.mindset ?? 50,
        score_c: r.mce_scores?.comportamento ?? 50,
        score_e: r.mce_scores?.execucao ?? 50,
        source: "forge_checkin",
      });
      await supabase.from("mce_exercises_done").insert({ user_id: user.id, exercise_key: `forge_checkin_${type}` });
      onSubmit?.(r);
    } catch {
      setResult({
        mce_scores: { mindset: 50, comportamento: 50, execucao: 50 },
        streak_impact: "manteve",
        feedback: "Check-in registrado. O sistema está indisponível agora, mas seu registro valeu — amanhã a análise completa volta.",
        deviation_detected: false,
        correction_protocol: null,
        compound_message: "Consistência em dia ruim vale dobro.",
      });
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>{isMorning ? "🌅" : "🌙"}</span>
        <div>
          <span style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: C.white }}>{isMorning ? "Check-in matinal" : "Check-in noturno"}</span>
          <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>30 segundos · {isMorning ? "planeje o dia" : "avalie o dia"}</div>
        </div>
      </div>

      {!result ? (
        <div>
          {questions.map((q) => (
            <div key={q.id} style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: F.b, fontSize: 13, color: C.text, margin: "0 0 6px" }}>{q.q}</p>
              <div style={{ display: "flex", gap: 4 }}>
                {q.opts.map((opt, i) => {
                  const sel = answers[q.id] === i;
                  const colors = [C.red, C.orange, C.muted, C.cyan, C.green];
                  return (
                    <button key={i} onClick={() => set(q.id, i)} style={{
                      flex: 1, padding: "8px 4px", background: sel ? `${colors[i]}15` : C.s2,
                      border: `1px solid ${sel ? colors[i] : C.border}`, borderRadius: 0, cursor: "pointer",
                      fontFamily: F.b, fontSize: 10, color: sel ? colors[i] : C.dim, transition: "all .15s",
                    }}>{opt}</button>
                  );
                })}
              </div>
            </div>
          ))}
          <button onClick={submit} disabled={!complete || loading} style={{
            width: "100%", padding: "14px", background: !complete ? C.dim : `linear-gradient(90deg,${C.cyan},${C.purple})`,
            border: "none", borderRadius: 0, cursor: !complete ? "not-allowed" : "pointer",
            fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.white, letterSpacing: 1, opacity: loading ? 0.6 : 1,
          }}>{loading ? "Analisando..." : "✦ ENVIAR CHECK-IN"}</button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <MCEScoreRing m={result.mce_scores?.mindset || 0} c={result.mce_scores?.comportamento || 0} e={result.mce_scores?.execucao || 0} size={110} />
            <div style={{ flex: 1, minWidth: 220 }}>
              {([{ k: "mindset", l: "Mindset", c: C.purple }, { k: "comportamento", l: "Comportamento", c: C.cyan }, { k: "execucao", l: "Execução", c: C.gold }] as const).map(({ k, l, c }) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: F.m, fontSize: 8, color: c, width: 8, textAlign: "center" }}>●</span>
                  <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted, width: 95 }}>{l}</span>
                  <div style={{ flex: 1, height: 3, background: C.s3 }}>
                    <div style={{ height: "100%", width: `${result.mce_scores?.[k] || 0}%`, background: c, transition: "width 1s" }} />
                  </div>
                  <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: c, width: 28, textAlign: "right" }}>{result.mce_scores?.[k] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: result.streak_impact === "perdeu" ? `${C.red}08` : result.streak_impact === "fortaleceu" ? `${C.green}08` : `${C.cyan}08`,
            border: `1px solid ${result.streak_impact === "perdeu" ? `${C.red}20` : result.streak_impact === "fortaleceu" ? `${C.green}20` : `${C.cyan}20`}`,
            padding: "10px 14px", marginBottom: 12,
          }}>
            <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: result.streak_impact === "perdeu" ? C.red : result.streak_impact === "fortaleceu" ? C.green : C.cyan }}>
              {result.streak_impact === "perdeu" ? "🔥 STREAK EM RISCO" : result.streak_impact === "fortaleceu" ? "🔥 STREAK FORTALECIDO" : "🔥 STREAK MANTIDO"}
            </span>
          </div>

          <div style={{ background: C.s2, padding: "12px 14px", marginBottom: 12 }}>
            <p style={{ fontFamily: F.b, fontSize: 13, color: C.text, margin: 0, lineHeight: 1.6 }}>{result.feedback}</p>
          </div>

          {result.deviation_detected && result.correction_protocol && (
            <div style={{ background: `${C.orange}06`, border: `1px solid ${C.orange}20`, padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontFamily: F.m, fontSize: 8, color: C.bg, background: C.orange, padding: "2px 8px", letterSpacing: 1.5 }}>CORREÇÃO</span>
                <span style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.orange }}>Protocolo ativado</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 1 }}>DESVIO</span>
                <p style={{ fontFamily: F.b, fontSize: 12, color: C.red, margin: "2px 0 0" }}>{result.correction_protocol.what_failed}</p>
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 1 }}>AÇÃO IMEDIATA</span>
                <p style={{ fontFamily: F.b, fontSize: 12, color: C.cyan, margin: "2px 0 0" }}>{result.correction_protocol.immediate_action}</p>
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 1 }}>AJUSTE AMANHÃ</span>
                <p style={{ fontFamily: F.b, fontSize: 12, color: C.green, margin: "2px 0 0" }}>{result.correction_protocol.tomorrow_adjustment}</p>
              </div>
              <div style={{ background: `${C.gold}08`, padding: "8px 10px" }}>
                <span style={{ fontFamily: F.m, fontSize: 8, color: C.gold, letterSpacing: 1 }}>RESET MCE</span>
                <p style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.gold, margin: "4px 0 0", lineHeight: 1.3 }}>
                  "{result.correction_protocol.mindset_reset}"
                </p>
              </div>
            </div>
          )}

          {result.compound_message && (
            <div style={{ background: `linear-gradient(135deg,${C.s2},${C.green}04)`, border: `1px solid ${C.green}10`, padding: "10px 14px" }}>
              <span style={{ fontFamily: F.m, fontSize: 8, color: C.green, letterSpacing: 1 }}>EFEITO COMPOSTO</span>
              <p style={{ fontFamily: F.b, fontSize: 12, color: C.text, margin: "4px 0 0", lineHeight: 1.5 }}>{result.compound_message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══ MAIN ═══
export default function MceForgePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scores, checkins, refresh, checkedInToday } = useRollingMceScores();
  const [tab, setTab] = useState("dashboard");
  const [checkInDone, setCheckInDone] = useState(false);
  const [exerciseDays, setExerciseDays] = useState<Set<string>>(new Set());
  const [lastForge, setLastForge] = useState<ForgeResult | null>(null);

  const hour = new Date().getHours();
  const checkInType: "morning" | "night" = hour < 14 ? "morning" : "night";

  useEffect(() => {
    if (!user) return;
    const since = new Date();
    since.setDate(since.getDate() - 200);
    void (async () => {
      const { data } = await supabase
        .from("mce_exercises_done")
        .select("exercise_key, completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", since.toISOString());
      const days = new Set<string>();
      for (const e of (data as EventRow[]) ?? []) days.add(dayKey(new Date(e.completed_at)));
      setExerciseDays(days);
    })();
  }, [user]);

  const streaks = useMemo(() => {
    const byDay = new Map<string, CheckinRow>();
    for (const c of checkins) byDay.set(c.checkin_date, c);
    const build = (pred: (r: CheckinRow) => boolean) => {
      const days = new Set<string>();
      for (const [k, r] of byDay) if (pred(r)) days.add(k);
      return dayStreak(days);
    };
    return {
      training: build((r) => r.movement >= 7),
      nutrition: build((r) => r.nutrition_adherence >= 7),
      sleep: build((r) => r.sleep_quality >= 7),
      focus: build((r) => r.focus_clarity >= 7),
      mce: dayStreak(exerciseDays),
    };
  }, [checkins, exerciseDays]);

  const totalStreak = Math.min(...Object.values(streaks));
  const rank = getRank(totalStreak);
  const nextRank = RANKS[rank.id + 1];
  const daysToNext = nextRank ? nextRank.min - totalStreak : 0;

  const weakest = useMemo(() => {
    const entries = [
      { key: "training", label: "Treino", days: streaks.training },
      { key: "nutrition", label: "Nutrição", days: streaks.nutrition },
      { key: "sleep", label: "Sono", days: streaks.sleep },
      { key: "focus", label: "Foco", days: streaks.focus },
      { key: "mce", label: "MCE", days: streaks.mce },
    ];
    return entries.reduce((a, b) => (b.days < a.days ? b : a));
  }, [streaks]);

  // Momentum: média diária dos últimos 30 dias
  const momentum = useMemo(() => {
    const byDay = new Map<string, CheckinRow>();
    for (const c of checkins) byDay.set(c.checkin_date, c);
    return Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const r = byDay.get(dayKey(d));
      if (!r) return { day: i + 1, score: 0, done: false };
      const score = Math.round(
        ((r.focus_clarity + (11 - r.stress_level) + r.nutrition_adherence + r.hydration + r.movement + r.sleep_quality) / 6) * 10,
      );
      return { day: i + 1, score, done: true };
    });
  }, [checkins]);

  const tabs = [
    { id: "dashboard", label: "Painel", icon: "◈" },
    { id: "checkin", label: hour < 14 ? "Check-in ☀" : "Check-in 🌙", icon: "✓" },
    { id: "momentum", label: "Momentum", icon: "📈" },
    { id: "rank", label: "Rank", icon: "★" },
  ];

  const effectiveCheckInDone = checkInDone || checkedInToday;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      {/* Header */}
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/mce")} aria-label="Voltar" style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${C.purple},${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 900, color: C.white }}>MCE</span>
          </div>
          <div>
            <span style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.white, letterSpacing: 2 }}>FORGE</span>
            <span style={{ fontFamily: F.m, fontSize: 8, color: C.gold, marginLeft: 8, letterSpacing: 1 }}>PROTOCOL ENGINE</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: rank.color }}>{rank.icon}</span>
          <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: rank.color }}>{rank.name}</span>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "10px 4px", background: tab === t.id ? `${C.cyan}04` : "transparent",
            border: "none", borderBottom: tab === t.id ? `2px solid ${C.cyan}` : "2px solid transparent",
            cursor: "pointer", fontFamily: F.m, fontSize: 8, letterSpacing: 1,
            color: tab === t.id ? C.cyan : C.dim,
          }}>{t.icon} {t.label.toUpperCase()}</button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px 40px" }}>
        {/* ══ DASHBOARD ══ */}
        {tab === "dashboard" && (
          <div>
            <div style={{
              background: `linear-gradient(135deg,${rank.color}08,${C.s1})`,
              border: `1px solid ${rank.color}15`, padding: "20px 24px", marginBottom: 16,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: rank.color }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: F.t, fontSize: 28, fontWeight: 700, color: rank.color }}>{rank.icon}</span>
                    <span style={{ fontFamily: F.t, fontSize: 24, fontWeight: 700, color: C.white, letterSpacing: 1 }}>{rank.name}</span>
                  </div>
                  <p style={{ fontFamily: F.b, fontSize: 12, color: C.muted, margin: 0 }}>
                    {nextRank ? `${daysToNext} dias pra ${nextRank.name}` : "Rank máximo alcançado"}
                  </p>
                  {nextRank && (
                    <div style={{ width: 160, height: 3, background: C.s3, marginTop: 8 }}>
                      <div style={{ height: "100%", width: `${((totalStreak - rank.min) / (nextRank.min - rank.min)) * 100}%`, background: rank.color, transition: "width .8s" }} />
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: F.t, fontSize: 52, fontWeight: 700, color: C.white, lineHeight: 1 }}>{totalStreak}</div>
                  <div style={{ fontFamily: F.m, fontSize: 9, color: rank.color, letterSpacing: 1, marginTop: 4 }}>DIAS SEGUIDOS</div>
                </div>
              </div>
            </div>

            {/* Streak Matrix */}
            <div style={{ background: C.s1, border: `1px solid ${C.border}`, padding: "12px 16px", marginBottom: 12 }}>
              <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>STREAK MATRIX</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                <StreakFire days={streaks.training} label="TREINO" color={C.cyan} />
                <StreakFire days={streaks.nutrition} label="NUTRIÇÃO" color={C.green} />
                <StreakFire days={streaks.sleep} label="SONO" color={C.gold} />
                <StreakFire days={streaks.focus} label="FOCO" color={C.purple} />
                <StreakFire days={streaks.mce} label="MCE" color={C.orange} />
              </div>
              {weakest.days < 7 && (
                <div style={{ marginTop: 8, background: `${C.red}06`, borderLeft: `2px solid ${C.red}`, padding: "6px 10px" }}>
                  <span style={{ fontFamily: F.b, fontSize: 10, color: C.red }}>
                    ⚠ {weakest.label} é seu streak mais fraco ({weakest.days}d). Se quebrar, cai o rank.
                  </span>
                </div>
              )}
            </div>

            {/* MCE Score hoje */}
            <div style={{ background: C.s1, border: `1px solid ${C.border}`, padding: "16px", marginBottom: 12 }}>
              <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>MCE SCORE · MÉDIA 7 DIAS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <MCEScoreRing m={scores.M} c={scores.C} e={scores.E} size={120} />
                <div style={{ flex: 1, minWidth: 220 }}>
                  {[
                    { l: "Mindset", v: scores.M, c: C.purple, desc: lastForge ? "Atualizado no último check-in" : "Média móvel dos check-ins" },
                    { l: "Comportamento", v: scores.C, c: C.cyan, desc: "Nutrição + hábitos diários" },
                    { l: "Execução", v: scores.E, c: C.gold, desc: "Treino + sono + entrega" },
                  ].map(({ l, v, c, desc }) => (
                    <div key={l} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontFamily: F.t, fontSize: 12, fontWeight: 700, color: c }}>{l}</span>
                        <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: c }}>{v}</span>
                      </div>
                      <p style={{ fontFamily: F.b, fontSize: 10, color: C.muted, margin: 0 }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* O que você perde */}
            <div style={{ background: `${C.red}04`, border: `1px solid ${C.red}10`, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontFamily: F.m, fontSize: 8, color: C.red, letterSpacing: 2, marginBottom: 6 }}>SE VOCÊ PARAR HOJE</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.red }}>{totalStreak} dias</div>
                  <div style={{ fontFamily: F.m, fontSize: 8, color: C.dim }}>de streak perdidos</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.red }}>{rank.name}</div>
                  <div style={{ fontFamily: F.m, fontSize: 8, color: C.dim }}>volta pra Iniciante</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: C.red }}>{daysToNext}d</div>
                  <div style={{ fontFamily: F.m, fontSize: 8, color: C.dim }}>de progresso jogados fora</div>
                </div>
              </div>
            </div>

            {!effectiveCheckInDone && (
              <button onClick={() => setTab("checkin")} style={{
                width: "100%", padding: "16px", background: `linear-gradient(90deg,${C.cyan},${C.purple})`,
                border: "none", borderRadius: 0, cursor: "pointer", fontFamily: F.t, fontSize: 18, fontWeight: 700,
                color: C.white, letterSpacing: 1,
              }}>
                {checkInType === "morning" ? "☀ FAZER CHECK-IN MATINAL" : "🌙 FAZER CHECK-IN NOTURNO"}
              </button>
            )}
          </div>
        )}

        {/* ══ CHECK-IN ══ */}
        {tab === "checkin" && (
          <CheckIn type={checkInType} streaks={streaks} rankName={rank.name} onSubmit={(r) => { setLastForge(r); setCheckInDone(true); void refresh(); }} />
        )}

        {/* ══ MOMENTUM ══ */}
        {tab === "momentum" && (
          <div>
            <div style={{ background: C.s1, border: `1px solid ${C.border}`, padding: "16px", marginBottom: 12 }}>
              <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>EVOLUÇÃO 30 DIAS</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 60, gap: 2 }}>
                {momentum.map((d, i) => (
                  <div key={i} style={{
                    flex: 1, height: `${Math.max((d.score / 100) * 60, 2)}px`,
                    background: d.done ? (d.score >= 70 ? C.green : d.score >= 50 ? C.gold : C.orange) : `${C.dim}30`,
                    transition: "height .5s ease", position: "relative",
                  }}>
                    {i === momentum.length - 1 && d.done && (
                      <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontFamily: F.t, fontSize: 12, fontWeight: 700, color: C.green }}>
                        {d.score}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontFamily: F.m, fontSize: 8, color: C.dim }}>Dia 1</span>
                <span style={{ fontFamily: F.m, fontSize: 8, color: C.dim }}>Dia 30</span>
              </div>
            </div>

            <div style={{ background: C.s1, border: `1px solid ${C.border}`, padding: "16px", marginBottom: 12 }}>
              <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>EFEITO COMPOSTO</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[
                  { period: "30 dias", projection: "Hábitos consolidados", color: C.cyan },
                  { period: "90 dias", projection: "Transformação visível", color: C.gold },
                  { period: "180 dias", projection: "Referência no nicho", color: C.green },
                ].map((p, i) => (
                  <div key={i} style={{ background: `${p.color}06`, border: `1px solid ${p.color}15`, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: p.color }}>{p.period}</div>
                    <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginTop: 4 }}>{p.projection}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: `linear-gradient(135deg,${C.s1},${C.gold}04)`, border: `1px solid ${C.gold}15`, padding: 16 }}>
              <p style={{ fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.gold, margin: "0 0 6px", textAlign: "center" }}>
                "Se apaixone pelo processo."
              </p>
              <p style={{ fontFamily: F.b, fontSize: 12, color: C.muted, margin: 0, textAlign: "center", lineHeight: 1.5 }}>
                Cada dia que você executa, o gap entre quem você é e quem quer ser diminui. Isso não é motivação. É matemática.
              </p>
            </div>
          </div>
        )}

        {/* ══ RANK ══ */}
        {tab === "rank" && (
          <div>
            <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>SISTEMA DE RANKS MCE</div>
            {RANKS.map((r, i) => {
              const isActive = rank.id === r.id;
              const isPast = rank.id > r.id;
              return (
                <div key={i} style={{
                  background: isActive ? `${r.color}08` : C.s1,
                  border: `1px solid ${isActive ? r.color : C.border}`,
                  padding: "14px 16px", marginBottom: 6, opacity: isPast ? 0.5 : 1,
                  position: "relative", overflow: "hidden",
                }}>
                  {isActive && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: r.color }} />}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: F.t, fontSize: 24, color: r.color }}>{r.icon}</span>
                      <div>
                        <span style={{ fontFamily: F.t, fontSize: 16, fontWeight: 700, color: isActive ? C.white : C.dim }}>{r.name}</span>
                        <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{r.min}+ dias consecutivos</div>
                      </div>
                    </div>
                    {isActive && <span style={{ fontFamily: F.m, fontSize: 8, color: r.color, background: `${r.color}15`, padding: "2px 10px", letterSpacing: 1 }}>ATUAL</span>}
                    {isPast && <span style={{ fontFamily: F.m, fontSize: 8, color: C.green }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
        <span style={{ fontFamily: F.m, fontSize: 9, color: C.dim, letterSpacing: 2 }}>MCE FORGE · NUTRION</span>
      </div>
    </div>
  );
}
