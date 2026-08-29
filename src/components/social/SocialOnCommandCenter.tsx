import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const C = {
  bg: "#020205", s1: "#0B0B12", s2: "#10101A", s3: "#181824",
  border: "#ffffff08", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E",
  red: "#EF4444", purple: "#A855F7", orange: "#F97316", pink: "#EC4899",
  muted: "#4A4A5A", dim: "#333340", text: "#C8C8D8", white: "#F0F0F8",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

const callSocialAI = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("social-on-generate", { body });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any).result;
};

// ═══════════════════════════════════════════════════
// DAILY AI COACH
// ═══════════════════════════════════════════════════
interface BriefAction { type?: string; title?: string; detail?: string; urgency?: string; time?: string }
interface Brief {
  greeting?: string;
  actions?: BriefAction[];
  insight?: string;
  alerts?: { icon?: string; text?: string; color_hint?: string }[];
}

function DailyCoach({ brief, loading }: { brief: Brief | null; loading: boolean }) {
  if (loading) {
    return (
      <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.cyan, letterSpacing: 2, marginBottom: 12 }}>
          GERANDO SEU BRIEFING...
        </div>
        <style>{`@keyframes ccPulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
        {["Analisando seus últimos posts", "Checando tendências do nicho", "Identificando conteúdo pra reciclar", "Calculando melhor horário"].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: C.cyan, animation: `ccPulse 1.4s ease ${i * 0.25}s infinite` }} />
            <span style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>{s}</span>
          </div>
        ))}
      </div>
    );
  }

  if (!brief) return null;

  return (
    <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <div>
            <div style={{ fontFamily: F.m, fontSize: 8, color: C.cyan, letterSpacing: 2 }}>COACH IA</div>
            <div style={{ fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.white }}>{brief.greeting}</div>
          </div>
        </div>
        <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>
          {new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(brief.actions || []).map((action, i) => {
          const urgencyColors: Record<string, string> = { alta: C.orange, "média": C.cyan, baixa: C.muted };
          const typeIcons: Record<string, string> = { postar: "📤", responder: "💬", reciclar: "♻️", engajar: "⚡", analisar: "📊", criar: "✦" };
          return (
            <div key={i} style={{ display: "flex", gap: 10, background: C.s2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px" }}>
              <span style={{ fontSize: 16 }}>{typeIcons[action.type || ""] || "📌"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.white }}>{action.title}</span>
                  <span style={{ fontFamily: F.m, fontSize: 7, letterSpacing: 1, color: urgencyColors[action.urgency || ""] || C.muted, border: `1px solid ${urgencyColors[action.urgency || ""] || C.muted}40`, padding: "1px 5px", borderRadius: 4 }}>
                    {(action.urgency || "").toUpperCase()}
                  </span>
                </div>
                <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, lineHeight: 1.4 }}>{action.detail}</div>
                {action.time && (
                  <div style={{ fontFamily: F.m, fontSize: 9, color: C.gold, marginTop: 3 }}>⏰ {action.time}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      {brief.insight && (
        <div style={{ marginTop: 12, background: `${C.cyan}08`, borderLeft: `2px solid ${C.cyan}`, padding: "8px 12px", display: "flex", gap: 8 }}>
          <span>💡</span>
          <span style={{ fontFamily: F.b, fontSize: 11, color: C.text, lineHeight: 1.5 }}>{brief.insight}</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// CONTENT SCORE WIDGET
// ═══════════════════════════════════════════════════
interface ContentScoreResult {
  total_score?: number;
  breakdown?: { share?: number; hook?: number; seo?: number; save?: number };
  verdict?: "PUBLICAR" | "OTIMIZAR" | "REFAZER";
  top_fix?: string;
  optimized_hook?: string;
}

function ContentScore() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState("reels");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<ContentScoreResult | null>(null);
  const [err, setErr] = useState("");

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setErr("");
    try {
      const r = await callSocialAI({ mode: "content_score", format, content: text });
      setScore(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao analisar");
    }
    setLoading(false);
  };

  const verdictColors: Record<string, string> = { PUBLICAR: C.green, OTIMIZAR: C.gold, REFAZER: C.red };
  const scoreColor = (s?: number) => (s ?? 0) >= 75 ? C.green : (s ?? 0) >= 50 ? C.gold : (s ?? 0) >= 25 ? C.orange : C.red;

  return (
    <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>✦</span>
        <span style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white }}>Content Score</span>
        <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>— teste antes de postar</span>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[{ id: "reels", l: "Reels" }, { id: "carousel", l: "Carrossel" }, { id: "feed", l: "Feed" }, { id: "stories", l: "Stories" }].map((f) => (
          <button key={f.id} type="button" onClick={() => setFormat(f.id)} style={{
            flex: 1, padding: "6px", background: format === f.id ? `${C.cyan}10` : C.s3,
            border: `1px solid ${format === f.id ? `${C.cyan}40` : C.border}`, borderRadius: 6,
            cursor: "pointer", fontFamily: F.m, fontSize: 8, color: format === f.id ? C.cyan : C.dim,
          }}>{f.l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole a caption ou script pra testar..."
          style={{
            flex: 1, minHeight: 52, padding: 10, background: C.s2, border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.text, fontFamily: F.b, fontSize: 12, resize: "none",
          }}
        />
        <button type="button" onClick={analyze} disabled={!text.trim() || loading} style={{
          width: 64, background: !text.trim() ? C.dim : C.cyan, border: "none", borderRadius: 8,
          cursor: !text.trim() ? "not-allowed" : "pointer", fontFamily: F.t, fontSize: 14, fontWeight: 700,
          color: C.bg, opacity: loading ? 0.6 : 1,
        }}>{loading ? "..." : "TESTAR"}</button>
      </div>
      {err && <div style={{ fontFamily: F.m, fontSize: 9, color: C.red, marginTop: 6 }}>{err}</div>}

      {score && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Score circle */}
            <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
              <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={32} cy={32} r={26} fill="none" stroke={C.s3} strokeWidth={4} />
                <circle cx={32} cy={32} r={26} fill="none" stroke={scoreColor(score.total_score)} strokeWidth={4}
                  strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * (1 - (score.total_score ?? 0) / 100)}
                  style={{ transition: "stroke-dashoffset 1s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: F.t, fontSize: 20, fontWeight: 700, color: scoreColor(score.total_score) }}>{score.total_score ?? 0}</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: F.t, fontSize: 16, fontWeight: 700, letterSpacing: 1,
                color: verdictColors[score.verdict || ""] || C.muted, marginBottom: 4,
              }}>{score.verdict}</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3 }}>
                {([{ k: "share", l: "Share" }, { k: "hook", l: "Hook" }, { k: "seo", l: "SEO" }, { k: "save", l: "Save" }] as const).map(({ k, l }) => {
                  const v = score.breakdown?.[k] ?? 0;
                  return (
                    <div key={k}>
                      <div style={{ fontFamily: F.m, fontSize: 7, color: C.dim, marginBottom: 2 }}>{l}</div>
                      <div style={{ height: 3, background: C.s3 }}>
                        <div style={{ height: "100%", width: `${v}%`, background: scoreColor(v), transition: "width .8s" }} />
                      </div>
                      <div style={{ fontFamily: F.m, fontSize: 8, color: scoreColor(v), marginTop: 1 }}>{v}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {score.top_fix && (
            <div style={{ marginTop: 8, background: `${C.orange}06`, borderLeft: `2px solid ${C.orange}`, padding: "6px 10px" }}>
              <span style={{ fontFamily: F.b, fontSize: 10, color: C.orange }}>{score.top_fix}</span>
            </div>
          )}
          {score.optimized_hook && (
            <div style={{ marginTop: 4, background: `${C.green}06`, borderLeft: `2px solid ${C.green}`, padding: "6px 10px" }}>
              <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted }}>HOOK OTIMIZADO →</span>
              <span style={{ fontFamily: F.b, fontSize: 11, color: C.green, marginLeft: 4 }}>"{score.optimized_hook}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// QUICK ACTIONS
// ═══════════════════════════════════════════════════
function QuickActions({ onOpenTool }: { onOpenTool?: (id: string) => void }) {
  const actions = [
    { icon: "🎬", label: "Novo vídeo", desc: "Studio Pro", color: C.cyan, tool: "studio" },
    { icon: "📊", label: "Trend Radar", desc: "O que tá em alta", color: C.orange, tool: "viral_lab" },
    { icon: "♻️", label: "Reciclar", desc: "1 conteúdo → 10 formatos", color: C.green, tool: "repurposer" },
    { icon: "💬", label: "Comentários", desc: "Scripts de DM", color: C.purple, tool: "dm" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
      {actions.map((a, i) => (
        <button key={i} type="button" onClick={() => a.tool && onOpenTool?.(a.tool)} style={{
          background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: "14px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s",
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{a.icon}</div>
          <div style={{ fontFamily: F.t, fontSize: 12, fontWeight: 700, color: C.white }}>{a.label}</div>
          <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, marginTop: 2 }}>{a.desc}</div>
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// WEEKLY MINI CHART
// ═══════════════════════════════════════════════════
function WeekChart({ posted }: { posted: boolean[] }) {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const count = posted.filter(Boolean).length;
  return (
    <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2 }}>ESTA SEMANA</span>
        <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.cyan }}>{count}/7 <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>posts</span></span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              height: 32, background: posted[i] ? `${C.green}20` : i <= todayIdx ? `${C.red}10` : C.s3,
              border: `1px solid ${posted[i] ? `${C.green}30` : i <= todayIdx && !posted[i] ? `${C.red}20` : C.border}`,
              borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4,
            }}>
              {posted[i] ? <span style={{ color: C.green, fontSize: 12 }}>✓</span>
                : i <= todayIdx ? <span style={{ color: C.red, fontSize: 10, opacity: 0.5 }}>✗</span>
                : <span style={{ color: C.dim, fontSize: 10 }}>·</span>}
            </div>
            <span style={{ fontFamily: F.m, fontSize: 8, color: i === todayIdx ? C.cyan : C.dim }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ZONE CARD (navigation)
// ═══════════════════════════════════════════════════
function ZoneCard({ icon, name, desc, color, count, onClick }: {
  icon: string; name: string; desc: string; color: string; count?: string; onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button type="button" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick}
      style={{
        background: h ? `${color}06` : C.s1, border: `1px solid ${h ? `${color}30` : C.border}`,
        borderRadius: 10, padding: "16px", cursor: "pointer", textAlign: "left",
        transition: "all 0.2s", position: "relative", overflow: "hidden", width: "100%",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white }}>{name}</span>
            {count && <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted }}>{count}</span>}
          </span>
          <span style={{ display: "block", fontFamily: F.m, fontSize: 9, color: C.muted, marginTop: 2 }}>{desc}</span>
        </span>
        <span style={{ color: h ? color : C.dim, fontFamily: F.t, fontSize: 18, transition: "color 0.2s" }}>→</span>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMMAND CENTER
// ═══════════════════════════════════════════════════
interface Props {
  handle?: string;
  stats?: { label: string; value: string; color: string }[];
  weekPosted?: boolean[];
  onOpenTool?: (id: string) => void;
}

export default function SocialOnCommandCenter({ handle, stats, weekPosted, onOpenTool }: Props) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefLoading, setBriefLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await callSocialAI({
          mode: "daily_brief",
          handle: handle || "diogo.mell0",
          today: new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        });
        setBrief(r);
      } catch {
        setBrief(null);
      }
      setBriefLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alertColors: Record<string, string> = { green: C.green, cyan: C.cyan, orange: C.orange };
  const zones = [
    { icon: "🎬", name: "Studio", desc: "Criar, editar, legendar, otimizar", color: C.cyan, count: "All-in-one", tool: "studio" },
    { icon: "♟️", name: "Strategy", desc: "DNA, pilares, auditoria, métricas", color: C.gold, count: "8 tools", tool: "intelligence" },
    { icon: "📅", name: "Planner", desc: "Calendário, grid, trends, reciclagem", color: C.green, count: "6 tools", tool: "calendario" },
    { icon: "📈", name: "Growth", desc: "DMs, CTAs, collabs, conversão", color: C.orange, count: "10 tools", tool: "monetizacao" },
    { icon: "🎓", name: "Learn", desc: "Academia, playbook, ciência", color: C.purple, count: "4 tools", tool: "academia" },
  ];

  const metrics = stats || [
    { label: "POSTS/MÊS", value: "—", color: C.cyan },
    { label: "SEGUIDORES", value: "—", color: C.green },
    { label: "BRAND SCORE", value: "—", color: C.gold },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "12px 14px", position: "relative", overflow: "hidden",
          }}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: m.color }} />
            <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 1.5 }}>{m.label}</div>
            <div style={{ fontFamily: F.t, fontSize: 26, fontWeight: 700, color: m.color, lineHeight: 1.1, marginTop: 2 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14, alignItems: "start" }}>
        <DailyCoach brief={brief} loading={briefLoading} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ContentScore />
          <QuickActions onOpenTool={onOpenTool} />
          <WeekChart posted={weekPosted || [false, false, false, false, false, false, false]} />
        </div>
      </div>

      {/* Activity Feed */}
      {brief?.alerts && brief.alerts.length > 0 && (
        <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>ALERTAS DO COACH IA</div>
          {brief.alerts.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 14 }}>{a.icon}</span>
              <span style={{ flex: 1, fontFamily: F.b, fontSize: 11, color: C.text, lineHeight: 1.5 }}>{a.text}</span>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: alertColors[a.color_hint || ""] || C.cyan, marginTop: 5, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}

      {/* Zone Navigation */}
      <div>
        <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>ZONAS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8 }}>
          {zones.map((z, i) => (
            <ZoneCard key={i} {...z} onClick={() => onOpenTool?.(z.tool)} />
          ))}
        </div>
      </div>
    </div>
  );
}
