import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { useCoachAthletes } from "@/hooks/useCoachAthletes";
import { supabase } from "@/integrations/supabase/client";
import { dayKey, rollingScores, type CheckinRow } from "@/lib/mceSystem";
import { ArrowLeft, Loader2 } from "lucide-react";

const C = {
  bg: "#020205", s1: "#0B0B12", s2: "#10101A", s3: "#181824", s4: "#22222E",
  border: "#ffffff08", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444",
  purple: "#A855F7", orange: "#F97316", muted: "#4A4A5A", dim: "#333340",
  text: "#C8C8D8", white: "#F0F0F8",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

const RANKS = [
  { name: "Iniciante", min: 0, color: C.dim, icon: "○" },
  { name: "Soldado", min: 7, color: C.cyan, icon: "◆" },
  { name: "Guerreiro", min: 21, color: C.purple, icon: "◈" },
  { name: "Titã", min: 45, color: C.gold, icon: "✦" },
  { name: "Elite", min: 90, color: C.orange, icon: "★" },
];

function getRank(s: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) if (s >= RANKS[i].min) return RANKS[i];
  return RANKS[0];
}

type RiskKey = "ok" | "baixo" | "medio" | "alto" | "critico";

const riskColors: Record<RiskKey, string> = { ok: C.green, baixo: C.cyan, medio: C.gold, alto: C.orange, critico: C.red };
const riskLabels: Record<RiskKey, string> = { ok: "OK", baixo: "Atenção", medio: "Risco", alto: "Alto risco", critico: "Crítico" };
const blockLabels: Record<string, string> = { ign: "IGN", exe: "EXE", rec: "REC", sus: "SUS", con: "CON" };

type Client = {
  id: string;
  userId: string;
  name: string;
  goal: string;
  streak: number;
  m: number;
  c: number;
  e: number;
  today: number;
  blocks: Record<string, boolean>;
  lastCheckin: string;
  risk: RiskKey;
  photo: string;
};

function ClientCard({ client, selected, onClick }: { client: Client; selected: boolean; onClick: () => void }) {
  const rank = getRank(client.streak);
  const mce = Math.round((client.m + client.c + client.e) / 3);
  const rc = riskColors[client.risk];
  return (
    <button onClick={onClick} style={{
      width: "100%", background: selected ? `${C.cyan}06` : C.s1,
      border: `1px solid ${selected ? `${C.cyan}25` : client.risk === "critico" ? `${C.red}20` : C.border}`,
      borderRadius: 0, padding: "10px 14px", cursor: "pointer", textAlign: "left",
      transition: "all .15s", position: "relative",
    }}>
      {client.risk !== "ok" && <div style={{ position: "absolute", right: 0, top: 0, width: 3, height: "100%", background: rc }} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, background: `${rank.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: F.t, fontSize: 13, fontWeight: 700, color: rank.color, flexShrink: 0, borderRadius: "50%",
        }}>{client.photo}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.white }}>{client.name}</span>
            <span style={{ fontFamily: F.t, fontSize: 10, color: rank.color }}>{rank.icon}</span>
            {client.risk !== "ok" && (
              <span style={{ fontFamily: F.m, fontSize: 6, color: rc, background: `${rc}15`, padding: "1px 5px", letterSpacing: 1, marginLeft: "auto" }}>
                {riskLabels[client.risk]?.toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted }}>{client.goal}</span>
            <span style={{ fontFamily: F.m, fontSize: 8, color: C.dim }}>·</span>
            <span style={{ fontFamily: F.m, fontSize: 8, color: client.streak > 0 ? rank.color : C.red }}>🔥{client.streak}d</span>
          </div>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: client.today >= 70 ? C.green : client.today >= 40 ? C.gold : C.red }}>
            {client.today}%
          </div>
          <div style={{ fontFamily: F.m, fontSize: 7, color: C.dim }}>HOJE</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
        {Object.entries(client.blocks).map(([k, v]) => (
          <div key={k} style={{ flex: 1, height: 4, background: v ? C.green : `${C.red}20`, transition: "background .3s" }} />
        ))}
      </div>
    </button>
  );
}

function ClientDetail({ client, onMessage, onIntervention }: { client: Client; onMessage: () => void; onIntervention: () => void }) {
  const rank = getRank(client.streak);
  const mce = Math.round((client.m + client.c + client.e) / 3);
  const rc = riskColors[client.risk];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 48, height: 48, background: `${rank.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: F.t, fontSize: 18, fontWeight: 700, color: rank.color, borderRadius: "50%",
        }}>{client.photo}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: C.white }}>{client.name}</span>
            <span style={{ fontFamily: F.t, fontSize: 14, color: rank.color }}>{rank.icon} {rank.name}</span>
          </div>
          <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{client.goal} · streak {client.streak}d · check-in {client.lastCheckin}</span>
        </div>
        {client.risk !== "ok" && (
          <span style={{ fontFamily: F.m, fontSize: 8, color: rc, background: `${rc}15`, padding: "3px 10px", letterSpacing: 1 }}>
            {riskLabels[client.risk]?.toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 12 }}>
        {[
          { l: "Mindset", v: client.m, c: C.purple },
          { l: "Comport.", v: client.c, c: C.cyan },
          { l: "Execução", v: client.e, c: C.gold },
          { l: "MCE", v: mce, c: mce >= 70 ? C.green : mce >= 40 ? C.gold : C.red },
        ].map((s) => (
          <div key={s.l} style={{ background: C.s2, padding: "8px", textAlign: "center" }}>
            <div style={{ fontFamily: F.t, fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontFamily: F.m, fontSize: 7, color: C.muted, letterSpacing: 1 }}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>BLOCOS HOJE</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {Object.entries(client.blocks).map(([k, v]) => (
          <div key={k} style={{
            flex: 1, padding: "8px 4px", background: v ? `${C.green}10` : C.s2,
            border: `1px solid ${v ? `${C.green}25` : C.border}`, textAlign: "center",
          }}>
            <div style={{ fontFamily: F.m, fontSize: 8, color: v ? C.green : C.dim, letterSpacing: 1 }}>{blockLabels[k]}</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>{v ? "✓" : "—"}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>AÇÕES RÁPIDAS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { icon: "💬", label: "Enviar mensagem", color: C.cyan, action: onMessage },
          { icon: "🧠", label: "Gerar intervenção IA", color: C.purple, action: onIntervention },
          { icon: "📊", label: "Ver relatório semanal", color: C.gold, action: () => {} },
          { icon: "⚠️", label: "Marcar atenção", color: C.orange, action: () => {} },
        ].map((a, i) => (
          <button key={i} onClick={a.action} style={{
            background: C.s2, border: `1px solid ${C.border}`, borderRadius: 0, padding: "10px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{a.icon}</span>
            <span style={{ fontFamily: F.b, fontSize: 11, color: a.color }}>{a.label}</span>
          </button>
        ))}
      </div>

      {client.risk !== "ok" && (
        <div style={{ background: `${rc}04`, border: `1px solid ${rc}15`, padding: "10px 14px", marginTop: 12 }}>
          <div style={{ fontFamily: F.m, fontSize: 8, color: rc, letterSpacing: 1.5, marginBottom: 4 }}>ANÁLISE DE RISCO</div>
          <p style={{ fontFamily: F.b, fontSize: 11, color: C.text, margin: 0, lineHeight: 1.5 }}>
            {client.risk === "critico"
              ? `${client.name} não fez check-in hoje e streak zerou. Padrão de abandono detectado. Intervenção urgente: mensagem direta + exercício Mapa de Autoeficácia (Bandura). Reativar crença antes de cobrar execução.`
              : client.risk === "alto"
              ? `${client.name} completou apenas ${client.today}% hoje e scores M/C/E estão abaixo de 5. Risco de quebra de streak nos próximos 2 dias. Ação: Diário de Locus (Rotter) + check-in pessoal.`
              : client.risk === "medio"
              ? `${client.name} tem streak curto (${client.streak}d) e Comportamento em ${client.c}/10. Fase crítica de formação de hábito. Reforçar autoeficácia com vitórias pequenas (Bandura).`
              : `${client.name} precisa de atenção leve. Monitorar nos próximos dias.`}
          </p>
        </div>
      )}
    </div>
  );
}

export default function MceCoachDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useCoachProfile();
  const { athletes, loading: athletesLoading } = useCoachAthletes(profile?.id, user?.id);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "risk" | "top">("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athletes.length) {
      setClients([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const ids = athletes.map((a) => a.userId);
      const today = dayKey(new Date());
      const weekAgo = dayKey(new Date(Date.now() - 7 * 86400000));

      const [{ data: scores }, { data: checkins }, { data: exercises }] = await Promise.all([
        supabase.from("mce_scores").select("user_id, score_m, score_c, score_e, created_at").in("user_id", ids).order("created_at", { ascending: false }),
        supabase.from("mce_checkins").select("user_id, checkin_date, sleep_quality, stress_level, nutrition_adherence, hydration, movement, focus_clarity").in("user_id", ids).gte("checkin_date", weekAgo),
        supabase.from("mce_exercises_done").select("user_id, exercise_key, completed_at").in("user_id", ids).gte("completed_at", `${today}T00:00:00Z`),
      ]);

      if (cancelled) return;

      const scoreMap = new Map<string, { m: number; c: number; e: number }>();
      for (const s of scores || []) {
        if (!scoreMap.has(s.user_id)) scoreMap.set(s.user_id, { m: s.score_m, c: s.score_c, e: s.score_e });
      }

      const checkinMap = new Map<string, CheckinRow[]>();
      for (const c of checkins || []) {
        if (!checkinMap.has(c.user_id)) checkinMap.set(c.user_id, []);
        checkinMap.get(c.user_id)!.push(c);
      }

      const exerciseMap = new Map<string, Set<string>>();
      for (const e of exercises || []) {
        if (!exerciseMap.has(e.user_id)) exerciseMap.set(e.user_id, new Set());
        exerciseMap.get(e.user_id)!.add(e.exercise_key);
      }

      const built: Client[] = athletes.map((a) => {
        const scores = scoreMap.get(a.userId);
        const checkinList = checkinMap.get(a.userId) || [];
        const rolling = rollingScores(checkinList, scores ? { M: scores.m, C: scores.c, E: scores.e } : { M: 50, C: 50, E: 50 });
        const todayCheckin = checkinList.find((c) => c.checkin_date === today);
        const done = exerciseMap.get(a.userId) || new Set();
        const blocks = {
          ign: done.has("os_ignition") || done.has("morning_checkin"),
          exe: done.has("os_execution") || done.has("training") || done.has("nutrition"),
          rec: done.has("os_recalibration") || done.has("midday_reset"),
          sus: done.has("os_sustentation") || done.has("hydration") || done.has("content"),
          con: done.has("os_consolidation") || done.has("night_checkin"),
        };
        const totalBlocks = Object.keys(blocks).length;
        const completedBlocks = Object.values(blocks).filter(Boolean).length;
        const todayPct = Math.round((completedBlocks / totalBlocks) * 100);

        let risk: RiskKey = "ok";
        if (a.diasDesdeCheckin > 1 || a.streak === 0) risk = "critico";
        else if (rolling.M < 50 || rolling.C < 50 || rolling.E < 50 || todayPct < 40) risk = "alto";
        else if (a.streak < 7 || todayPct < 70) risk = "medio";
        else if (todayPct < 90) risk = "baixo";

        return {
          id: a.id,
          userId: a.userId,
          name: a.name || "Aluno",
          goal: a.objetivo || a.fase || "—",
          streak: a.streak || 0,
          m: Math.round(rolling.M / 10),
          c: Math.round(rolling.C / 10),
          e: Math.round(rolling.E / 10),
          today: todayPct,
          blocks,
          lastCheckin: a.lastCheckin ? new Date(a.lastCheckin).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—",
          risk,
          photo: (a.name || "A").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
        };
      });

      setClients(built);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athletes]);

  const filtered = useMemo(() => {
    if (filter === "all") return clients;
    if (filter === "risk") return clients.filter((c) => c.risk !== "ok");
    return [...clients].sort((a, b) => b.streak - a.streak);
  }, [clients, filter]);

  const atRisk = clients.filter((c) => c.risk !== "ok").length;
  const avgMCE = clients.length ? Math.round(clients.reduce((a, c) => a + Math.round((c.m + c.c + c.e) / 3), 0) / clients.length) : 0;
  const avgStreak = clients.length ? Math.round(clients.reduce((a, c) => a + c.streak, 0) / clients.length) : 0;
  const avgToday = clients.length ? Math.round(clients.reduce((a, c) => a + c.today, 0) / clients.length) : 0;
  const sel = selected ? clients.find((c) => c.id === selected) : null;

  if (profileLoading || athletesLoading || loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" style={{ color: C.cyan }} size={32} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => navigate("/mce")} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", marginRight: 4 }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ width: 28, height: 28, background: `linear-gradient(135deg,${C.cyan},${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: F.t, fontSize: 12, fontWeight: 900, color: C.bg }}>N</span>
          </div>
          <span style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: C.white, letterSpacing: 1 }}>MCE COACH DASHBOARD</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{clients.length} clientes</span>
          {atRisk > 0 && <span style={{ fontFamily: F.m, fontSize: 8, color: C.red, background: `${C.red}15`, padding: "2px 8px" }}>⚠ {atRisk} em risco</span>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, padding: "12px 20px" }}>
        {[
          { l: "CLIENTES", v: clients.length, c: C.cyan },
          { l: "MCE MÉDIO", v: avgMCE, c: avgMCE >= 60 ? C.green : C.gold },
          { l: "STREAK MÉDIO", v: `${avgStreak}d`, c: C.purple },
          { l: "HOJE MÉDIO", v: `${avgToday}%`, c: avgToday >= 60 ? C.green : C.gold },
        ].map((s) => (
          <div key={s.l} style={{ background: C.s1, border: `1px solid ${C.border}`, padding: "10px", textAlign: "center" }}>
            <div style={{ fontFamily: F.t, fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontFamily: F.m, fontSize: 7, color: C.muted, letterSpacing: 1 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, padding: "0 20px 10px" }}>
        {[{ id: "all", l: "Todos" }, { id: "risk", l: `Em risco (${atRisk})` }, { id: "top", l: "Top streaks" }].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id as any)} style={{
            padding: "6px 12px", background: filter === f.id ? `${C.cyan}10` : C.s3,
            border: `1px solid ${filter === f.id ? C.cyan : C.border}`, borderRadius: 0, cursor: "pointer",
            fontFamily: F.m, fontSize: 8, color: filter === f.id ? C.cyan : C.dim, letterSpacing: 1,
          }}>{f.l}</button>
        ))}
      </div>

      <div style={{ display: "flex", padding: "0 20px 40px", gap: 12 }}>
        <div style={{ width: sel ? 320 : "100%", flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, transition: "width .3s" }}>
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} selected={selected === client.id}
              onClick={() => setSelected(selected === client.id ? null : client.id)} />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", fontFamily: F.m, fontSize: 11, color: C.dim }}>
              Nenhum cliente encontrado.
            </div>
          )}
        </div>

        {sel && (
          <div style={{ flex: 1, background: C.s1, border: `1px solid ${C.border}`, padding: 16, position: "sticky", top: 12, alignSelf: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2 }}>DETALHES</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <ClientDetail client={sel} onMessage={() => navigate(`/coach/patient/${sel.userId}`)} onIntervention={() => navigate(`/mce/forge?user=${sel.userId}`)} />
          </div>
        )}
      </div>

      {atRisk > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.s1, borderTop: `1px solid ${C.red}15`, padding: "8px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
            <span style={{ fontFamily: F.m, fontSize: 7, color: C.red, letterSpacing: 1.5, flexShrink: 0 }}>ALERTAS</span>
            {clients.filter((c) => c.risk !== "ok").map((c) => (
              <button key={c.id} onClick={() => setSelected(c.id)} style={{
                background: `${riskColors[c.risk]}08`, border: `1px solid ${riskColors[c.risk]}20`, borderRadius: 0,
                padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
              }}>
                <span style={{ fontFamily: F.t, fontSize: 11, fontWeight: 700, color: riskColors[c.risk] }}>{c.name}</span>
                <span style={{ fontFamily: F.m, fontSize: 7, color: C.dim }}>{riskLabels[c.risk]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
