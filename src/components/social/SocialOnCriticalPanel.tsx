import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const T = {
  bg: "#020205",
  surface: "#0A0A0F",
  surface2: "#111118",
  surface3: "#1A1A24",
  cyan: "#00D4FF",
  gold: "#B8922A",
  green: "#22C55E",
  red: "#EF4444",
  purple: "#A855F7",
  orange: "#F97316",
  muted: "#555566",
  text: "#E8E8F0",
  white: "#FFFFFF",
  fontTitle: "'Rajdhani', 'Segoe UI', sans-serif",
  fontMono: "'Space Mono', 'Courier New', monospace",
  fontBody: "'Inter', 'Segoe UI', sans-serif",
} as const;

interface ScoreRingProps {
  score: number;
  size?: number;
  color?: string;
  label?: string;
}

function ScoreRing({ score, size = 120, color, label }: ScoreRingProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (safeScore / 100) * circ;
  const getColor = () => {
    if (color) return color;
    if (safeScore >= 75) return T.green;
    if (safeScore >= 50) return T.gold;
    if (safeScore >= 25) return T.orange;
    return T.red;
  };
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.surface3} strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={getColor()}
          strokeWidth={6} strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="butt"
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: T.fontTitle, fontSize: size * 0.32, fontWeight: 700, color: T.white, lineHeight: 1 }}>
          {safeScore}
        </span>
        {label && (
          <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1, marginTop: 2 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  color?: string;
}

function Chip({ children, active, onClick, color = T.cyan }: ChipProps) {
  return (
    <button onClick={onClick} style={{
      background: active ? `${color}15` : "transparent",
      border: `1px solid ${active ? color : "#ffffff12"}`,
      borderRadius: 0, padding: "8px 14px", cursor: "pointer",
      fontFamily: T.fontTitle, fontSize: 13, fontWeight: 600,
      color: active ? color : T.muted, transition: "all 0.2s",
    }}>
      {children}
    </button>
  );
}

interface InsightCardProps {
  icon: string;
  title: string;
  text: string;
  type?: "tip" | "warning" | "success" | "critical";
}

function InsightCard({ icon, title, text, type = "tip" }: InsightCardProps) {
  const colors = { tip: T.cyan, warning: T.orange, success: T.green, critical: T.red };
  const c = colors[type];
  return (
    <div style={{
      background: T.surface2, borderLeft: `3px solid ${c}`,
      padding: "12px 14px", marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontFamily: T.fontTitle, fontSize: 13, fontWeight: 700, color: c }}>{title}</span>
      </div>
      <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.text, margin: 0, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 10px" }}>
      {children}
    </p>
  );
}

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

function PrimaryButton({ children, onClick, disabled, loading }: PrimaryButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: "100%", padding: "14px 24px", background: disabled ? T.muted : T.cyan,
      border: "none", borderRadius: 0, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: T.fontTitle, fontSize: 16, fontWeight: 700, color: T.bg,
      letterSpacing: 1, transition: "all 0.2s", opacity: loading ? 0.7 : 1,
    }}>
      {loading ? "⏳ Analisando..." : children}
    </button>
  );
}

const callSocialAI = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("social-on-generate", { body });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any).result;
};

const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => toast.success("Copiado")).catch(() => toast.error("Erro ao copiar"));
};

interface ImprovementItem {
  type?: "critical" | "tip";
  icon?: string;
  title?: string;
  text?: string;
}

interface ShareScoreResult {
  share_score?: number;
  dm_potential?: "alto" | "médio" | "baixo";
  emotional_trigger?: string;
  target_action?: string;
  improvements?: ImprovementItem[];
  rewrite_hook?: string;
}

function ShareScore() {
  const [caption, setCaption] = useState("");
  const [format, setFormat] = useState("reels");
  const [niche, setNiche] = useState("fitness");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShareScoreResult | null>(null);

  const analyze = async () => {
    if (!caption.trim()) return;
    setLoading(true);
    try {
      const r = await callSocialAI({
        mode: "share_score",
        format,
        niche,
        topic: caption,
        notes: caption,
      });
      setResult(r);
    } catch (e: any) {
      toast.error(e.message || "Erro na análise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionLabel>CAPTION OU SCRIPT DO REEL</SectionLabel>
      <textarea
        value={caption} onChange={(e) => setCaption(e.target.value)}
        placeholder="Cole a legenda, script do Reel ou descreva o conteúdo..."
        style={{
          width: "100%", minHeight: 100, background: T.surface2, border: `1px solid #ffffff10`,
          borderRadius: 0, color: T.text, fontFamily: T.fontBody, fontSize: 13,
          padding: 14, resize: "vertical", boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", gap: 16, margin: "16px 0" }}>
        <div style={{ flex: 1 }}>
          <SectionLabel>FORMATO</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              { id: "reels", label: "Reels" }, { id: "carousel", label: "Carrossel" },
              { id: "feed", label: "Feed" }, { id: "stories", label: "Stories" },
            ].map((f) => (
              <Chip key={f.id} active={format === f.id} onClick={() => setFormat(f.id)}>{f.label}</Chip>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <SectionLabel>NICHO</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              { id: "fitness", label: "Fitness" }, { id: "nutricao", label: "Nutrição" },
              { id: "coaching", label: "Coaching" }, { id: "saude", label: "Saúde" },
            ].map((n) => (
              <Chip key={n.id} active={niche === n.id} onClick={() => setNiche(n.id)} color={T.gold}>{n.label}</Chip>
            ))}
          </div>
        </div>
      </div>
      <PrimaryButton onClick={analyze} disabled={!caption.trim()} loading={loading}>
        ✦ ANALISAR SHAREABILITY
      </PrimaryButton>
      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 20 }}>
            <ScoreRing score={result.share_score ?? 0} label="SHARE" />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ background: T.surface2, padding: "10px 14px", flex: 1 }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>DM POTENTIAL</span>
                  <div style={{
                    fontFamily: T.fontTitle, fontSize: 18, fontWeight: 700, marginTop: 2,
                    color: result.dm_potential === "alto" ? T.green : result.dm_potential === "médio" ? T.gold : T.red,
                  }}>
                    {(result.dm_potential || "baixo").toUpperCase()}
                  </div>
                </div>
                <div style={{ background: T.surface2, padding: "10px 14px", flex: 1 }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>GATILHO</span>
                  <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, marginTop: 4 }}>
                    {result.emotional_trigger}
                  </div>
                </div>
              </div>
              <div style={{ background: T.surface2, padding: "10px 14px" }}>
                <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>POR QUE ALGUÉM MANDARIA ISSO</span>
                <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, marginTop: 4 }}>
                  {result.target_action}
                </div>
              </div>
            </div>
          </div>
          <SectionLabel>MELHORIAS</SectionLabel>
          {(result.improvements || []).map((imp, i) => (
            <InsightCard key={i} icon={imp.icon || "💡"} title={imp.title || "Dica"} text={imp.text || ""}
              type={imp.type === "critical" ? "warning" : "tip"} />
          ))}
          {result.rewrite_hook && (
            <div style={{ marginTop: 12 }}>
              <SectionLabel>REESCRITA SUGERIDA DO HOOK</SectionLabel>
              <div style={{
                background: `${T.cyan}08`, border: `1px solid ${T.cyan}20`,
                padding: 14, fontFamily: T.fontBody, fontSize: 13, color: T.cyan, lineHeight: 1.6,
              }}>
                "{result.rewrite_hook}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface HookRewrite {
  style?: string;
  text?: string;
  why?: string;
}

interface HookAnalyzerResult {
  hook_score?: number;
  retention_3s?: string;
  hook_pattern?: string;
  strengths?: { icon?: string; text?: string }[];
  weaknesses?: { icon?: string; text?: string }[];
  rewrite_options?: HookRewrite[];
}

function HookAnalyzer() {
  const [hookText, setHookText] = useState("");
  const [hookType, setHookType] = useState("text");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HookAnalyzerResult | null>(null);

  const analyze = async () => {
    if (!hookText.trim()) return;
    setLoading(true);
    try {
      const r = await callSocialAI({
        mode: "hook_analyzer",
        hookType,
        topic: hookText,
        notes: hookText,
      });
      setResult(r);
    } catch (e: any) {
      toast.error(e.message || "Erro na análise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionLabel>TIPO DE HOOK</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {[
          { id: "text", label: "Texto na tela" }, { id: "voiceover", label: "Voiceover" },
          { id: "spoken", label: "Falando pra câmera" }, { id: "visual", label: "Visual puro" },
        ].map((t) => (
          <Chip key={t.id} active={hookType === t.id} onClick={() => setHookType(t.id)} color={T.purple}>{t.label}</Chip>
        ))}
      </div>
      <SectionLabel>PRIMEIROS 3 SEGUNDOS</SectionLabel>
      <textarea
        value={hookText} onChange={(e) => setHookText(e.target.value)}
        placeholder="Escreva exatamente o que aparece/é dito nos primeiros 3 segundos do Reel..."
        style={{
          width: "100%", minHeight: 80, background: T.surface2, border: `1px solid #ffffff10`,
          borderRadius: 0, color: T.text, fontFamily: T.fontBody, fontSize: 13,
          padding: 14, resize: "vertical", boxSizing: "border-box",
        }}
      />
      <div style={{ marginTop: 16 }}>
        <PrimaryButton onClick={analyze} disabled={!hookText.trim()} loading={loading}>
          ⚡ ANALISAR HOOK
        </PrimaryButton>
      </div>
      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
            <ScoreRing score={result.hook_score ?? 0} size={110} label="HOOK" />
            <div style={{ flex: 1 }}>
              <div style={{ background: T.surface2, padding: "10px 14px", marginBottom: 8 }}>
                <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>RETENÇÃO 3s</span>
                <div style={{ fontFamily: T.fontTitle, fontSize: 18, fontWeight: 700, color: T.purple, marginTop: 2 }}>
                  {result.retention_3s}
                </div>
              </div>
              <div style={{ background: T.surface2, padding: "10px 14px" }}>
                <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>PADRÃO</span>
                <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, marginTop: 4 }}>
                  {result.hook_pattern}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <SectionLabel>FORÇAS</SectionLabel>
              {(result.strengths || []).map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{s.icon || "✓"}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.green }}>{s.text}</span>
                </div>
              ))}
            </div>
            <div>
              <SectionLabel>FRAQUEZAS</SectionLabel>
              {(result.weaknesses || []).map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{w.icon || "✗"}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.orange }}>{w.text}</span>
                </div>
              ))}
            </div>
          </div>
          <SectionLabel>REESCRITAS SUGERIDAS</SectionLabel>
          {(result.rewrite_options || []).map((rw, i) => (
            <div key={i} style={{
              background: `${T.purple}08`, border: `1px solid ${T.purple}15`,
              padding: 14, marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{
                  fontFamily: T.fontMono, fontSize: 9, color: T.purple,
                  background: `${T.purple}20`, padding: "2px 8px", letterSpacing: 1,
                }}>
                  {(rw.style || "Opção").toUpperCase()}
                </span>
              </div>
              <p style={{ fontFamily: T.fontBody, fontSize: 14, color: T.white, margin: "0 0 4px", lineHeight: 1.5 }}>
                "{rw.text}"
              </p>
              <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, margin: 0 }}>{rw.why}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SaveSlide {
  number?: number;
  heading?: string;
  content?: string;
}

interface SaveTriggersResult {
  title?: string;
  hook_slide?: string;
  slides?: SaveSlide[];
  caption?: string;
  save_cta?: string;
  hashtags?: string[];
  estimated_save_rate?: string;
  why_saveable?: string;
}

function SaveTriggers() {
  const [topic, setTopic] = useState("");
  const [triggerType, setTriggerType] = useState("checklist");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SaveTriggersResult | null>(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const r = await callSocialAI({
        mode: "save_triggers",
        triggerType,
        topic,
        notes: topic,
      });
      setResult(r);
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar");
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: "checklist", label: "Checklist", icon: "☑️", desc: "Lista de verificação salvável" },
    { id: "guia", label: "Guia de forma", icon: "🏋️", desc: "Correção de exercício passo a passo" },
    { id: "plano", label: "Plano", icon: "📋", desc: "Plano de treino/dieta semanal" },
    { id: "mitos", label: "Mitos vs Fatos", icon: "🔬", desc: "Desmistificação com ciência" },
    { id: "erros", label: "Erros comuns", icon: "⚠️", desc: "O que evitar + correção" },
  ];

  return (
    <div>
      <SectionLabel>TIPO DE SAVE TRIGGER</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
        {types.map((t) => (
          <button key={t.id} onClick={() => setTriggerType(t.id)} style={{
            background: triggerType === t.id ? `${T.gold}10` : T.surface2,
            border: `1px solid ${triggerType === t.id ? `${T.gold}50` : "#ffffff08"}`,
            borderRadius: 0, padding: "12px 10px", cursor: "pointer", textAlign: "center",
            transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontFamily: T.fontTitle, fontSize: 12, fontWeight: 700, color: triggerType === t.id ? T.white : T.muted }}>
              {t.label}
            </div>
          </button>
        ))}
      </div>
      <SectionLabel>TEMA DO CONTEÚDO</SectionLabel>
      <input
        type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
        placeholder="Ex: agachamento correto, café da manhã proteico, treino de 20 min..."
        style={{
          width: "100%", padding: 14, background: T.surface2, border: `1px solid #ffffff10`,
          borderRadius: 0, color: T.text, fontFamily: T.fontBody, fontSize: 13, boxSizing: "border-box",
        }}
      />
      <div style={{ marginTop: 16 }}>
        <PrimaryButton onClick={generate} disabled={!topic.trim()} loading={loading}>
          ⭐ GERAR SAVE TRIGGER
        </PrimaryButton>
      </div>
      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: T.fontTitle, fontSize: 18, fontWeight: 700, color: T.white, margin: 0 }}>
                {result.title}
              </h3>
              <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.gold, margin: "4px 0 0" }}>
                {result.why_saveable}
              </p>
            </div>
            <div style={{ background: `${T.gold}15`, padding: "6px 12px", textAlign: "center" }}>
              <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>SAVE RATE</span>
              <div style={{ fontFamily: T.fontTitle, fontSize: 16, fontWeight: 700, color: T.gold }}>
                {result.estimated_save_rate}
              </div>
            </div>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${T.cyan}12, ${T.gold}08)`,
            border: `1px solid ${T.cyan}20`, padding: "24px 20px", textAlign: "center", marginBottom: 12,
          }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.cyan, letterSpacing: 2 }}>CAPA</span>
            <p style={{ fontFamily: T.fontTitle, fontSize: 22, fontWeight: 700, color: T.white, margin: "8px 0 0" }}>
              {result.hook_slide}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {(result.slides || []).map((s) => (
              <div key={s.number} style={{ background: T.surface2, padding: 14, position: "relative" }}>
                <span style={{
                  position: "absolute", top: 8, right: 10,
                  fontFamily: T.fontMono, fontSize: 9, color: T.muted,
                }}>
                  {s.number}/{(result.slides || []).length}
                </span>
                <h4 style={{ fontFamily: T.fontTitle, fontSize: 14, fontWeight: 700, color: T.cyan, margin: "0 0 6px" }}>
                  {s.heading}
                </h4>
                <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.text, margin: 0, lineHeight: 1.5 }}>
                  {s.content}
                </p>
              </div>
            ))}
          </div>
          <SectionLabel>CAPTION OTIMIZADA</SectionLabel>
          <div style={{
            background: T.surface2, padding: 14, marginBottom: 12,
            fontFamily: T.fontBody, fontSize: 13, color: T.text, lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}>
            {result.caption}
          </div>
          <div style={{
            background: `${T.gold}10`, border: `1px solid ${T.gold}25`,
            padding: 12, marginBottom: 12, textAlign: "center",
          }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>CTA DE SAVE</span>
            <p style={{ fontFamily: T.fontTitle, fontSize: 15, fontWeight: 700, color: T.gold, margin: "4px 0 0" }}>
              {result.save_cta}
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(result.hashtags || []).map((h, i) => (
              <span key={i} style={{
                fontFamily: T.fontMono, fontSize: 11, color: T.cyan,
                background: `${T.cyan}10`, padding: "4px 10px",
              }}>
                {h?.startsWith("#") ? h : `#${h}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface HashtagAnalysis {
  current?: string[];
  recommended?: string[];
  remove?: string[];
}

interface SeoImprovement {
  priority?: "alta" | "média";
  icon?: string;
  title?: string;
  text?: string;
}

interface InstagramSeoResult {
  seo_score?: number;
  keywords_found?: string[];
  keywords_missing?: string[];
  keyword_density?: "adequada" | "baixa" | "excessiva";
  searchability?: "alta" | "média" | "baixa";
  hashtag_analysis?: HashtagAnalysis;
  improvements?: SeoImprovement[];
  rewritten_caption?: string;
  alt_text_suggestion?: string;
}

function InstagramSEO() {
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InstagramSeoResult | null>(null);

  const analyze = async () => {
    if (!caption.trim()) return;
    setLoading(true);
    try {
      const r = await callSocialAI({
        mode: "instagram_seo",
        topic: caption,
        notes: caption,
      });
      setResult(r);
    } catch (e: any) {
      toast.error(e.message || "Erro na análise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionLabel>CAPTION PARA OTIMIZAR</SectionLabel>
      <textarea
        value={caption} onChange={(e) => setCaption(e.target.value)}
        placeholder="Cole sua legenda aqui — a IA vai analisar keywords, searchability e otimizar para o buscador do Instagram..."
        style={{
          width: "100%", minHeight: 120, background: T.surface2, border: `1px solid #ffffff10`,
          borderRadius: 0, color: T.text, fontFamily: T.fontBody, fontSize: 13,
          padding: 14, resize: "vertical", boxSizing: "border-box",
        }}
      />
      <div style={{ marginTop: 16 }}>
        <PrimaryButton onClick={analyze} disabled={!caption.trim()} loading={loading}>
          🔍 ANALISAR SEO
        </PrimaryButton>
      </div>
      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
            <ScoreRing score={result.seo_score ?? 0} size={110} label="SEO" color={T.green} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: T.surface2, padding: "10px 14px" }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>SEARCHABILITY</span>
                  <div style={{
                    fontFamily: T.fontTitle, fontSize: 16, fontWeight: 700, marginTop: 2,
                    color: result.searchability === "alta" ? T.green : result.searchability === "média" ? T.gold : T.red,
                  }}>
                    {(result.searchability || "baixa").toUpperCase()}
                  </div>
                </div>
                <div style={{ background: T.surface2, padding: "10px 14px" }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>KEYWORD DENSITY</span>
                  <div style={{
                    fontFamily: T.fontTitle, fontSize: 16, fontWeight: 700, marginTop: 2,
                    color: result.keyword_density === "adequada" ? T.green : T.orange,
                  }}>
                    {(result.keyword_density || "baixa").toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <SectionLabel>KEYWORDS DETECTADAS ✓</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(result.keywords_found || []).map((k, i) => (
                  <span key={i} style={{
                    fontFamily: T.fontMono, fontSize: 11, color: T.green,
                    background: `${T.green}12`, padding: "3px 8px",
                  }}>{k}</span>
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>KEYWORDS FALTANDO ✗</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(result.keywords_missing || []).map((k, i) => (
                  <span key={i} style={{
                    fontFamily: T.fontMono, fontSize: 11, color: T.red,
                    background: `${T.red}12`, padding: "3px 8px",
                  }}>{k}</span>
                ))}
              </div>
            </div>
          </div>
          <SectionLabel>HASHTAGS RECOMENDADAS</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {(result.hashtag_analysis?.recommended || []).map((h, i) => (
              <span key={i} style={{
                fontFamily: T.fontMono, fontSize: 11, color: T.cyan,
                background: `${T.cyan}10`, padding: "4px 10px",
              }}>
                {h?.startsWith("#") ? h : `#${h}`}
              </span>
            ))}
          </div>
          <SectionLabel>MELHORIAS</SectionLabel>
          {(result.improvements || []).map((imp, i) => (
            <InsightCard key={i} icon={imp.icon || "💡"} title={imp.title || "Dica"} text={imp.text || ""}
              type={imp.priority === "alta" ? "warning" : "tip"} />
          ))}
          <SectionLabel>CAPTION OTIMIZADA PARA SEO</SectionLabel>
          <div style={{
            background: `${T.green}06`, border: `1px solid ${T.green}20`,
            padding: 14, marginBottom: 12,
            fontFamily: T.fontBody, fontSize: 13, color: T.text, lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}>
            {result.rewritten_caption}
          </div>
          {result.alt_text_suggestion && (
            <div>
              <SectionLabel>TEXTO ALTERNATIVO SUGERIDO</SectionLabel>
              <div style={{
                background: T.surface2, padding: 12,
                fontFamily: T.fontBody, fontSize: 12, color: T.muted, lineHeight: 1.5,
              }}>
                <span style={{ color: T.gold, fontFamily: T.fontMono, fontSize: 10, letterSpacing: 1 }}>ALT TEXT → </span>
                {result.alt_text_suggestion}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const modules = [
  { id: "share", label: "Share Score", icon: "📤", color: T.cyan, component: ShareScore },
  { id: "hook", label: "Hook Analyzer", icon: "⚡", color: T.purple, component: HookAnalyzer },
  { id: "save", label: "Save Triggers", icon: "⭐", color: T.gold, component: SaveTriggers },
  { id: "seo", label: "Instagram SEO", icon: "🔍", color: T.green, component: InstagramSEO },
];

export default function SocialOnCriticalPanel() {
  const [active, setActive] = useState("share");
  const ActiveModule = modules.find((m) => m.id === active)?.component;

  return (
    <div style={{ minHeight: "100%", background: T.bg, color: T.text, margin: "-16px", padding: 16 }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid #ffffff06` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: T.cyan, fontSize: 18 }}>✦</span>
          <h1 style={{ fontFamily: T.fontTitle, fontSize: 22, fontWeight: 700, color: T.white, letterSpacing: 1, margin: 0 }}>
            SOCIAL ON
          </h1>
          <span style={{
            fontFamily: T.fontMono, fontSize: 9, color: T.bg,
            background: T.cyan, padding: "2px 8px", letterSpacing: 1,
          }}>
            INTELLIGENCE
          </span>
        </div>
        <p style={{ fontFamily: T.fontMono, fontSize: 11, color: T.muted, margin: "4px 0 0 28px" }}>
          Algoritmo 2026 · Os 4 sinais críticos
        </p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
        borderBottom: `1px solid #ffffff06`,
      }}>
        {modules.map((m) => (
          <button key={m.id} onClick={() => setActive(m.id)} style={{
            background: active === m.id ? `${m.color}08` : "transparent",
            border: "none", borderBottom: active === m.id ? `2px solid ${m.color}` : "2px solid transparent",
            padding: "14px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 16, display: "block", marginBottom: 4 }}>{m.icon}</span>
            <span style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: 1,
              color: active === m.id ? m.color : T.muted,
            }}>
              {m.label.toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 24px 40px" }}>
        {ActiveModule && <ActiveModule />}
      </div>

      <div style={{ padding: "16px 24px", borderTop: `1px solid #ffffff06`, textAlign: "center" }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, letterSpacing: 2 }}>
          SOCIAL ON INTELLIGENCE · NUTRION
        </span>
      </div>
    </div>
  );
}
