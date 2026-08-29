import { useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const C = {
  bg: "#020205", s0: "#06060B", s1: "#0B0B12", s2: "#10101A", s3: "#181824", s4: "#22222E",
  border: "#ffffff08", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444",
  purple: "#A855F7", orange: "#F97316", muted: "#4A4A5A", dim: "#333340",
  text: "#C8C8D8", white: "#F0F0F8",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

const callSocialAI = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("social-on-generate", { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.result ?? null;
};

const today = new Date();
const dayName = today.toLocaleDateString("pt-BR", { weekday: "long" });
const dateStr = today.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
const hour = today.getHours();
const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

type SignalAction = {
  type?: string; title?: string; detail?: string;
  urgency?: string; time?: string; content_idea?: string | null;
};
type SignalData = {
  signal_message?: string;
  yesterday_review?: { summary?: string; top_post?: string; metric_highlight?: string; lesson?: string };
  today_actions?: SignalAction[];
  recycle_opportunity?: { original?: string; new_format?: string; new_angle?: string; urgency?: string };
  trend_alert?: { trend?: string; heat?: number; lifespan?: string; content_suggestion?: string };
  best_posting_times?: string[];
  week_overview?: { posts_done?: number; posts_goal?: number; day_of_week?: number; on_track?: boolean; adjustment?: string };
  mce_daily?: string;
  closing?: string;
};

// ═══ LOADING ═══
function LoadingScreen() {
  const steps = ["Analisando performance de ontem", "Escaneando tendências do nicho", "Checando conteúdo pra reciclar",
    "Calculando melhor horário de hoje", "Montando fila de comentários", "Gerando seu SIGNAL"];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 600);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, background: `linear-gradient(135deg, ${C.cyan}20, ${C.gold}20)`,
            border: `1px solid ${C.cyan}40`, borderRadius: 14, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 26, color: C.cyan, fontFamily: F.t, fontWeight: 900,
            animation: "pulse 1.5s infinite",
          }}>S</div>
          <div style={{ fontFamily: F.t, fontSize: 28, fontWeight: 900, color: C.white, letterSpacing: 4 }}>SIGNAL</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: i <= step ? 1 : 0.25, transition: "opacity .3s" }}>
              <span style={{ fontFamily: F.m, fontSize: 10, color: i < step ? C.green : i === step ? C.cyan : C.dim }}>
                {i < step ? "✓" : "▸"}
              </span>
              <span style={{ fontFamily: F.m, fontSize: 11, color: i <= step ? C.text : C.dim }}>{s}</span>
              {i === step && <span style={{ fontFamily: F.m, fontSize: 10, color: C.cyan, animation: "pulse 1s infinite" }}>...</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ SECTION ═══
function Section({ icon, title, badge, color = C.cyan, children }: { icon: string; title: string; badge?: string; color?: string; children: ReactNode }) {
  return (
    <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: `${color}06` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{ fontFamily: F.m, fontSize: 10, letterSpacing: 3, color }}>{title}</span>
        </div>
        {badge && <span style={{ fontFamily: F.m, fontSize: 9, padding: "3px 8px", background: `${color}15`, color, borderRadius: 4 }}>{badge}</span>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

// ═══ ACTION ITEM ═══
function ActionItem({ action, i }: { action: SignalAction; i: number }) {
  const [done, setDone] = useState(false);
  const urgColors: Record<string, string> = { alta: C.orange, média: C.cyan, media: C.cyan, baixa: C.dim };
  const typeIcons: Record<string, string> = {
    postar: "📤", responder: "💬", reciclar: "♻️", engajar: "⚡", analisar: "📊", criar: "✦", stories: "◯",
    comentar: "💬", agendar: "📅", otimizar: "🎯", colaborar: "🤝",
  };
  return (
    <div style={{
      display: "flex", gap: 14, padding: "14px 16px", background: done ? `${C.green}05` : C.s2,
      border: `1px solid ${done ? C.green + "25" : C.border}`, borderRadius: 10, marginBottom: 8,
      opacity: done ? 0.55 : 1, transition: "all .2s",
    }}>
      <button type="button" onClick={() => setDone(!done)} style={{
        width: 20, height: 20, background: done ? C.green : C.s3, border: `1px solid ${done ? C.green : C.border}`,
        borderRadius: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 2, fontSize: 10, color: C.white, transition: "all .2s",
      }}>{done ? "✓" : ""}</button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13 }}>{typeIcons[action.type ?? ""] ?? "📌"}</span>
          <span style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white, textDecoration: done ? "line-through" : "none" }}>{action.title}</span>
          {action.urgency && (
            <span style={{
              fontFamily: F.m, fontSize: 8, padding: "2px 6px", letterSpacing: 1,
              background: `${urgColors[action.urgency] ?? C.dim}20`, color: urgColors[action.urgency] ?? C.dim, borderRadius: 3,
            }}>{action.urgency.toUpperCase()}</span>
          )}
        </div>
        <div style={{ fontFamily: F.b, fontSize: 12, color: C.text, lineHeight: 1.55 }}>{action.detail}</div>
        {action.time && <div style={{ fontFamily: F.m, fontSize: 10, color: C.gold, marginTop: 6 }}>⏰ {action.time}</div>}
        {action.content_idea && (
          <div style={{ marginTop: 8, padding: "8px 12px", background: `${C.purple}08`, borderLeft: `2px solid ${C.purple}40`, fontFamily: F.b, fontSize: 11, color: C.purple, fontStyle: "italic", borderRadius: 4 }}>
            {action.content_idea}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ MAIN SIGNAL ═══
export default function SocialOnSignalPanel() {
  const [data, setData] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await callSocialAI({
          mode: "daily_signal",
          today: `${dayName}, ${dateStr}, ${hour}h`,
          notes: `Hoje é ${dayName}, ${dateStr}. Hora local: ${hour}h. Dia da semana (0=dom): ${today.getDay()}.`,
        });
        setData(r);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingScreen />;
  if (!data) return (
    <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: F.m, fontSize: 12, color: C.red }}>
      Erro ao gerar SIGNAL. Recarregue.
    </div>
  );

  const heatBars = (n = 0) => Array.from({ length: 5 }).map((_, i) => (
    <div key={i} style={{ width: 14, height: 6, background: i < n ? C.orange : C.dim, borderRadius: 1 }} />
  ));

  return (
    <div style={{ minHeight: "100%", background: C.bg, color: C.text, fontFamily: F.b, paddingBottom: 40 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, background: `linear-gradient(135deg, ${C.cyan}15, ${C.gold}15)`,
              border: `1px solid ${C.cyan}30`, borderRadius: 12, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 22, color: C.cyan, fontFamily: F.t, fontWeight: 900,
            }}>S</div>
            <div>
              <div style={{ fontFamily: F.t, fontSize: 22, fontWeight: 900, color: C.white, letterSpacing: 2, lineHeight: 1 }}>SIGNAL</div>
              <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, letterSpacing: 2, marginTop: 2 }}>DAILY BRIEF</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.cyan, textTransform: "capitalize" }}>{dayName}</div>
            <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{dateStr}</div>
          </div>
        </div>

        {/* Signal Message */}
        <div style={{ background: `linear-gradient(135deg, ${C.cyan}08, ${C.gold}08)`, border: `1px solid ${C.cyan}20`, borderRadius: 16, padding: 24, marginBottom: 12 }}>
          <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>{greeting}.</div>
          <div style={{ fontFamily: F.t, fontSize: 24, fontWeight: 800, color: C.white, lineHeight: 1.25, marginBottom: 12 }}>{data.signal_message}</div>
          {data.mce_daily && (
            <div style={{ display: "flex", gap: 10, padding: "10px 14px", background: `${C.gold}08`, borderRadius: 8, alignItems: "flex-start" }}>
              <span style={{ fontFamily: F.m, fontSize: 9, color: C.gold, letterSpacing: 1, padding: "2px 6px", border: `1px solid ${C.gold}40`, borderRadius: 3, flexShrink: 0 }}>MCE</span>
              <span style={{ fontFamily: F.b, fontSize: 12, color: C.gold, lineHeight: 1.5, fontStyle: "italic" }}>{data.mce_daily}</span>
            </div>
          )}
        </div>

        {/* Yesterday Review */}
        {data.yesterday_review && (
          <Section icon="📊" title="ONTEM" color={C.purple}>
            <div style={{ fontFamily: F.b, fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 14 }}>{data.yesterday_review.summary}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: "TOP POST", value: data.yesterday_review.top_post },
                { label: "DESTAQUE", value: data.yesterday_review.metric_highlight },
                { label: "LIÇÃO", value: data.yesterday_review.lesson },
              ].map((item, i) => (
                <div key={i} style={{ background: C.s2, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 1.5, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: F.b, fontSize: 11, color: C.white, lineHeight: 1.4 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Today's Actions */}
        <Section icon="⚡" title="AÇÕES DE HOJE" color={C.cyan} badge={`${data.today_actions?.length ?? 0}`}>
          {data.today_actions?.map((a, i) => <ActionItem key={i} action={a} i={i} />)}
        </Section>

        {/* Best Times + Week Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 12 }}>
          <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
            <div style={{ fontFamily: F.m, fontSize: 10, letterSpacing: 3, color: C.gold, marginBottom: 14 }}>MELHOR HORÁRIO HOJE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.best_posting_times?.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: i === 0 ? `${C.gold}12` : C.s2, border: `1px solid ${i === 0 ? C.gold + "35" : C.border}`, borderRadius: 8 }}>
                  <span style={{ fontFamily: F.t, fontSize: 18, fontWeight: 800, color: i === 0 ? C.gold : C.white }}>{t}</span>
                  {i === 0 && <span style={{ fontFamily: F.m, fontSize: 8, color: C.gold, letterSpacing: 1 }}>IDEAL</span>}
                </div>
              ))}
            </div>
          </div>

          {data.week_overview && (
            <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontFamily: F.m, fontSize: 10, letterSpacing: 3, color: C.green }}>SEMANA</span>
                <span style={{ fontFamily: F.t, fontSize: 20, fontWeight: 900, color: C.white }}>
                  {data.week_overview.posts_done}/{data.week_overview.posts_goal}
                </span>
              </div>
              <div style={{ height: 6, background: C.s3, borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
                <div style={{
                  height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${C.green}, ${C.cyan})`,
                  width: `${Math.min(100, ((data.week_overview.posts_done ?? 0) / (data.week_overview.posts_goal ?? 7)) * 100)}%`,
                  transition: "width .8s ease",
                }} />
              </div>
              <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
                  <div key={i} style={{
                    flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 4,
                    fontFamily: F.m, fontSize: 9,
                    background: i === today.getDay() ? `${C.cyan}20` : i < (data.week_overview?.posts_done ?? 0) ? `${C.green}15` : C.s2,
                    color: i === today.getDay() ? C.cyan : i < (data.week_overview?.posts_done ?? 0) ? C.green : C.muted,
                    border: i === today.getDay() ? `1px solid ${C.cyan}50` : "1px solid transparent",
                  }}>{d}</div>
                ))}
              </div>
              {data.week_overview.adjustment && (
                <div style={{ fontFamily: F.b, fontSize: 11, color: data.week_overview.on_track ? C.green : C.orange, lineHeight: 1.5 }}>
                  {data.week_overview.on_track ? "✓" : "⚠"} {data.week_overview.adjustment}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recycle + Trend */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginBottom: 12 }}>
          {data.recycle_opportunity && (
            <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ fontFamily: F.m, fontSize: 10, letterSpacing: 3, color: C.purple, marginBottom: 14 }}>♻️ RECICLAR</div>
              <div style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 10 }}>{data.recycle_opportunity.original}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontFamily: F.m, fontSize: 10, color: C.muted }}>
                Original <span style={{ color: C.purple }}>→</span>
                <span style={{ color: C.purple, padding: "2px 8px", background: `${C.purple}12`, borderRadius: 4 }}>{data.recycle_opportunity.new_format}</span>
              </div>
              <div style={{ fontFamily: F.b, fontSize: 12, color: C.text, lineHeight: 1.55, marginBottom: 10 }}>{data.recycle_opportunity.new_angle}</div>
              <div style={{ fontFamily: F.b, fontSize: 11, color: C.orange, fontStyle: "italic" }}>{data.recycle_opportunity.urgency}</div>
            </div>
          )}

          {data.trend_alert && (
            <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ fontFamily: F.m, fontSize: 10, letterSpacing: 3, color: C.orange, marginBottom: 14 }}>🔥 TREND ALERT</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
                <span style={{ fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white }}>{data.trend_alert.trend}</span>
                <div style={{ display: "flex", gap: 3 }}>{heatBars(data.trend_alert.heat)}</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted, padding: "2px 8px", background: C.s2, borderRadius: 3 }}>
                  Vida: {data.trend_alert.lifespan}
                </span>
              </div>
              <div style={{ fontFamily: F.b, fontSize: 12, color: C.text, lineHeight: 1.55, padding: "10px 12px", background: `${C.orange}08`, borderLeft: `2px solid ${C.orange}40`, borderRadius: 4 }}>
                {data.trend_alert.content_suggestion}
              </div>
            </div>
          )}
        </div>

        {/* Closing */}
        {data.closing && (
          <div style={{ textAlign: "center", padding: "32px 20px", borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
            <div style={{ fontFamily: F.t, fontSize: 18, fontWeight: 700, color: C.gold, fontStyle: "italic", marginBottom: 12 }}>{data.closing}</div>
            <div style={{ fontFamily: F.m, fontSize: 9, color: C.dim, letterSpacing: 3 }}>SIGNAL · SOCIAL ON · NUTRION</div>
          </div>
        )}
      </div>
    </div>
  );
}
