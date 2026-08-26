import { useState, useRef } from "react";
import { toast } from "sonner";
import { callSocialAI } from "./socialUi";

// ═══════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════
const T = {
  bg: "#020205", surface: "#0A0A0F", surface2: "#111118", surface3: "#1A1A24",
  cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444",
  purple: "#A855F7", orange: "#F97316", muted: "#555566", text: "#E8E8F0", white: "#FFFFFF",
  fontTitle: "'Rajdhani', sans-serif", fontMono: "'Space Mono', monospace", fontBody: "'Inter', sans-serif",
};

// ═══════════════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════════════
const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 2, margin: "0 0 6px" }}>
    {children}
  </p>
);

const Btn = ({
  children, onClick, disabled, loading, color = T.cyan,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean; loading?: boolean; color?: string }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      width: "100%", padding: 14, background: `${color}15`, border: `1px solid ${color}40`,
      color, fontFamily: T.fontTitle, fontSize: 15, fontWeight: 700, letterSpacing: 2,
      cursor: disabled || loading ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
    }}
  >
    {loading ? "⏳ Analisando..." : children}
  </button>
);

const Ring = ({ score, size = 100, label, color }: { score: number; size?: number; label?: string; color?: string }) => {
  const safe = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const r = (size - 10) / 2, c = 2 * Math.PI * r, o = c - (safe / 100) * c;
  const col = color || (safe >= 75 ? T.green : safe >= 50 ? T.gold : safe >= 25 ? T.orange : T.red);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.surface3} strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={5}
          strokeDasharray={c} strokeDashoffset={o}
          style={{ transition: "stroke-dashoffset 1s ease, stroke .5s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: T.fontTitle, fontSize: size * 0.3, fontWeight: 700, color: T.white, lineHeight: 1 }}>{safe}</span>
        {label && <span style={{ fontFamily: T.fontMono, fontSize: 7, color: T.muted, letterSpacing: 1, marginTop: 2 }}>{label}</span>}
      </div>
    </div>
  );
};

const Insight = ({ icon, title, text, color = T.cyan }: { icon: string; title: string; text: string; color?: string }) => (
  <div style={{
    background: T.surface2, border: `1px solid #ffffff08`, borderLeft: `3px solid ${color}`,
    padding: "10px 12px", marginBottom: 8,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontFamily: T.fontTitle, fontSize: 13, fontWeight: 700, color }}>{title}</span>
    </div>
    <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.text, margin: "4px 0 0", lineHeight: 1.5 }}>{text}</p>
  </div>
);

const inputStyle: React.CSSProperties = {
  width: "100%", padding: 12, background: T.surface2, border: "1px solid #ffffff10",
  borderRadius: 0, color: T.text, fontFamily: T.fontBody, fontSize: 12, boxSizing: "border-box",
};

// ═══════════════════════════════════════════════════
// GRID ARCHITECT
// ═══════════════════════════════════════════════════
type GridResult = {
  grid_score: number;
  first_impression: string;
  pillar_balance: { score: number; diagnosis: string; missing: string[] };
  visual_flow: { score: number; issues: string[] };
  row_analysis: { row: number; verdict: string; suggestion: string }[];
  reorder_suggestion: number[];
  improvements: { icon: string; title: string; text: string; priority: string }[];
};

function GridArchitect() {
  const [posts, setPosts] = useState<(string | null)[]>(Array(9).fill(null));
  const [descriptions, setDescriptions] = useState<string[]>(Array(9).fill(""));
  const [pillars, setPillars] = useState<string[]>(Array(9).fill(""));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GridResult | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const pillarOptions = ["Educativo", "Transformação", "Mitos", "Bastidores", "Oferta", "Social proof", "Motivação"];
  const pillarColors: Record<string, string> = {
    "Educativo": T.cyan, "Transformação": T.green, "Mitos": T.purple, "Bastidores": T.gold,
    "Oferta": T.orange, "Social proof": "#EC4899", "Motivação": "#F59E0B",
  };

  const handleFile = (idx: number, file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const next = [...posts];
      next[idx] = String(e.target?.result || "");
      setPosts(next);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) return;
    const np = [...posts], nd = [...descriptions], npi = [...pillars];
    [np[dragIdx], np[idx]] = [np[idx], np[dragIdx]];
    [nd[dragIdx], nd[idx]] = [nd[idx], nd[dragIdx]];
    [npi[dragIdx], npi[idx]] = [npi[idx], npi[dragIdx]];
    setPosts(np); setDescriptions(nd); setPillars(npi); setDragIdx(null);
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const gridData = posts.map((p, i) => ({
        slot: i + 1,
        has_image: !!p,
        description: descriptions[i] || "(sem descrição)",
        pillar: pillars[i] || "(sem pilar)",
      }));
      const notes = `Você é especialista em grid do Instagram 2026. O grid agora é 3:4 vertical (1080x1350px). Visitantes decidem seguir em 0.4 segundos olhando os 9 posts.\nAnalise o grid planejado e dê feedback estratégico.\n\nGRID:\n${JSON.stringify(gridData)}`;
      const r = await callSocialAI({ mode: "grid_architect", notes, topic: "Análise de grid 3x3 do Instagram" });
      setResult(r as GridResult);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na análise");
    } finally {
      setLoading(false);
    }
  };

  const applyReorder = () => {
    if (!result?.reorder_suggestion?.length) return;
    const order = result.reorder_suggestion.map((i) => i - 1);
    setPosts(order.map((i) => posts[i]));
    setDescriptions(order.map((i) => descriptions[i]));
    setPillars(order.map((i) => pillars[i]));
    setResult(null);
    toast.success("Reordenação aplicada");
  };

  const filledCount = posts.filter(Boolean).length + descriptions.filter((d) => d.trim()).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 28, background: T.cyan }} />
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, margin: 0, lineHeight: 1.5 }}>
          Monte seus próximos 9 posts. Arraste pra reordenar. Descreva cada um e atribua um pilar. O sistema analisa a coesão do grid.
        </p>
      </div>

      {/* Phone Frame with Grid */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{
          width: 300, background: T.surface, border: "1px solid #ffffff10",
          borderRadius: 24, padding: 12,
        }}>
          {/* Mini profile header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: `${T.gold}20`,
              border: `1px solid ${T.gold}50`, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.fontTitle, fontSize: 12, fontWeight: 700, color: T.gold,
            }}>
              DM
            </div>
            <div>
              <div style={{ fontFamily: T.fontTitle, fontSize: 12, fontWeight: 700, color: T.white }}>@diogo.mell0</div>
              <div style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted }}>Preview do grid</div>
            </div>
          </div>

          {/* 3x3 Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            {posts.map((post, i) => (
              <div
                key={i}
                draggable={!!post}
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                onClick={() => !post && fileRefs.current[i]?.click()}
                style={{
                  aspectRatio: "3/4", background: post ? `url(${post}) center/cover` : T.surface2,
                  border: dragIdx === i ? `2px solid ${T.cyan}` : "1px solid #ffffff06",
                  cursor: post ? "grab" : "pointer", position: "relative", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <input
                  ref={(el) => { fileRefs.current[i] = el; }}
                  type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => handleFile(i, e.target.files?.[0])}
                />
                {!post && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: T.fontMono, fontSize: 16, color: T.muted }}>+</div>
                    <div style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted }}>{i + 1}</div>
                  </div>
                )}
                {pillars[i] && (
                  <div style={{
                    position: "absolute", top: 2, left: 2, width: 8, height: 8,
                    background: pillarColors[pillars[i]] || T.muted, borderRadius: 1,
                  }} />
                )}
                {(post || descriptions[i]) && (
                  <div style={{
                    position: "absolute", bottom: 2, right: 2, background: "rgba(0,0,0,0.6)",
                    padding: "1px 4px", fontFamily: T.fontMono, fontSize: 8, color: T.white,
                  }}>
                    {i + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pillar legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {[...new Set(pillars.filter(Boolean))].map((p) => (
              <span key={p} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: T.fontMono, fontSize: 8, color: T.muted }}>
                <span style={{ width: 6, height: 6, background: pillarColors[p] || T.muted, borderRadius: 1 }} />
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Post Details */}
      <Label>DETALHES DE CADA POST</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {posts.map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: T.fontMono, fontSize: 10, color: T.cyan, width: 18, height: 18,
              background: `${T.cyan}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {i + 1}
            </span>
            {posts[i] && (
              <div style={{ width: 24, height: 32, background: `url(${posts[i]}) center/cover`, flexShrink: 0 }} />
            )}
            <input
              value={descriptions[i]}
              onChange={(e) => { const n = [...descriptions]; n[i] = e.target.value; setDescriptions(n); }}
              placeholder={`Descreva o post ${i + 1}...`}
              style={{
                flex: 1, padding: "6px 8px", background: "transparent", border: "1px solid #ffffff08",
                borderRadius: 0, color: T.text, fontFamily: T.fontBody, fontSize: 11,
              }}
            />
            <select
              value={pillars[i]}
              onChange={(e) => { const n = [...pillars]; n[i] = e.target.value; setPillars(n); }}
              style={{
                padding: 6, background: T.surface3, border: "1px solid #ffffff08",
                borderRadius: 0, color: pillars[i] ? pillarColors[pillars[i]] || T.text : T.muted,
                fontFamily: T.fontMono, fontSize: 10, minWidth: 90,
              }}
            >
              <option value="">Pilar</option>
              {pillarOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        ))}
      </div>

      <Btn onClick={analyze} loading={loading} disabled={filledCount < 3}>
        🏗️ ANALISAR GRID
      </Btn>

      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
            <Ring score={result.grid_score} size={100} label="GRID" />
            <div style={{ flex: 1 }}>
              <div style={{ background: T.surface2, padding: "10px 12px", marginBottom: 8 }}>
                <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted, letterSpacing: 1 }}>
                  PRIMEIRA IMPRESSÃO (0.4s)
                </span>
                <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.white, margin: "4px 0 0", lineHeight: 1.5 }}>
                  {result.first_impression}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: T.surface2, padding: "8px 10px" }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted, letterSpacing: 1 }}>PILARES</span>
                  <p style={{ fontFamily: T.fontTitle, fontSize: 20, fontWeight: 700, margin: 0, color: (result.pillar_balance?.score || 0) >= 60 ? T.green : T.orange }}>
                    {result.pillar_balance?.score}
                  </p>
                </div>
                <div style={{ flex: 1, background: T.surface2, padding: "8px 10px" }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted, letterSpacing: 1 }}>VISUAL</span>
                  <p style={{ fontFamily: T.fontTitle, fontSize: 20, fontWeight: 700, margin: 0, color: (result.visual_flow?.score || 0) >= 60 ? T.green : T.orange }}>
                    {result.visual_flow?.score}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Row analysis */}
          <Label>ANÁLISE POR FILEIRA</Label>
          {result.row_analysis?.map((row, i) => (
            <div key={i} style={{ background: T.surface2, padding: "10px 12px", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.cyan, background: `${T.cyan}12`, padding: "2px 6px" }}>
                  FILEIRA {row.row}
                </span>
              </div>
              <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.text, margin: 0 }}>{row.verdict}</p>
              <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.gold, margin: "4px 0 0" }}>→ {row.suggestion}</p>
            </div>
          ))}

          <div style={{ marginTop: 12 }}>
            <Label>MELHORIAS</Label>
            {result.improvements?.map((imp, i) => (
              <Insight key={i} icon={imp.icon} title={imp.title} text={imp.text} color={imp.priority === "alta" ? T.red : T.orange} />
            ))}
          </div>

          {result.reorder_suggestion?.length === 9 && (
            <div style={{ marginTop: 8 }}>
              <Btn onClick={applyReorder} color={T.purple}>
                ↕ APLICAR REORDENAÇÃO SUGERIDA
              </Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// BIO OPTIMIZER
// ═══════════════════════════════════════════════════
type BioResult = {
  current_score: number;
  diagnosis: Record<string, string>;
  issues: { icon: string; text: string }[];
  versions: { style: string; bio: string; char_count: number; strengths: string[]; best_for: string }[];
  name_line_suggestion: string;
};

function BioOptimizer() {
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("coach fitness");
  const [goal, setGoal] = useState("gerar leads");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BioResult | null>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const notes = `Você é especialista em bios do Instagram 2026 para profissionais fitness. A bio tem 150 caracteres pra comunicar 3 coisas: quem você ajuda, o que entrega, e o próximo passo.\nGere EXATAMENTE 3 versões com estilos diferentes: uma direta/profissional, uma com personalidade/diferencial, uma focada em conversão.\n\nBio atual: ${bio || "(sem bio)"}\nNicho: ${niche}\nObjetivo: ${goal}`;
      const r = await callSocialAI({ mode: "bio_optimizer", notes, topic: "Otimização de bio do Instagram", niche: [niche] });
      setResult(r as BioResult);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na análise");
    } finally {
      setLoading(false);
    }
  };

  const copyBio = (b: string) => {
    navigator.clipboard.writeText(b);
    toast.success("Bio copiada");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 28, background: T.gold }} />
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, margin: 0, lineHeight: 1.5 }}>
          Sua bio é seu pitch de 150 caracteres. O sistema analisa e gera 3 versões otimizadas.
        </p>
      </div>

      <Label>BIO ATUAL</Label>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <textarea
          value={bio} onChange={(e) => setBio(e.target.value)} maxLength={150}
          placeholder="Cole sua bio atual (ou deixe vazio pra criar do zero)..."
          style={{
            ...inputStyle, minHeight: 70, padding: "14px 14px 28px", resize: "none",
          }}
        />
        <span style={{
          position: "absolute", bottom: 8, right: 12, fontFamily: T.fontMono, fontSize: 10,
          color: bio.length > 140 ? T.red : bio.length > 120 ? T.orange : T.muted,
        }}>
          {bio.length}/150
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <Label>NICHO</Label>
          <input
            value={niche} onChange={(e) => setNiche(e.target.value)}
            placeholder="Ex: coach fitness, nutricionista..."
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Label>OBJETIVO</Label>
          <select
            value={goal} onChange={(e) => setGoal(e.target.value)}
            style={{ ...inputStyle, fontFamily: T.fontMono, fontSize: 11 }}
          >
            <option value="gerar leads">Gerar leads</option>
            <option value="autoridade">Construir autoridade</option>
            <option value="vender programa">Vender programa</option>
            <option value="crescer seguidores">Crescer seguidores</option>
          </select>
        </div>
      </div>

      <Btn onClick={analyze} loading={loading} disabled={!bio.trim() && !niche.trim()} color={T.gold}>
        ✏️ OTIMIZAR BIO
      </Btn>

      {result && (
        <div style={{ marginTop: 24 }}>
          {result.current_score > 0 && (
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
              <Ring score={result.current_score} size={90} label="ATUAL" color={T.gold} />
              <div style={{ flex: 1 }}>
                <Label>DIAGNÓSTICO</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {Object.entries(result.diagnosis || {}).map(([key, val]) => {
                    const labels: Record<string, string> = {
                      who_you_help: "Quem ajuda", what_you_deliver: "O que entrega",
                      next_step_cta: "CTA", credibility_signal: "Credibilidade",
                    };
                    const colors: Record<string, string> = { detectado: T.green, ausente: T.red, vago: T.orange };
                    return (
                      <div key={key} style={{ background: T.surface2, padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted }}>{labels[key] || key}</span>
                        <span style={{ fontFamily: T.fontMono, fontSize: 9, color: colors[val] || T.muted }}>{val?.toUpperCase()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {result.issues?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {result.issues.map((iss, i) => (
                <Insight key={i} icon={iss.icon} title="Problema" text={iss.text} color={T.orange} />
              ))}
            </div>
          )}

          <Label>3 VERSÕES OTIMIZADAS</Label>
          {result.versions?.map((v, i) => (
            <div key={i} style={{
              background: i === 0 ? `${T.gold}06` : T.surface2,
              border: `1px solid ${i === 0 ? `${T.gold}25` : "#ffffff08"}`,
              padding: 16, marginBottom: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{
                  fontFamily: T.fontMono, fontSize: 9, letterSpacing: 1,
                  color: [T.gold, T.cyan, T.green][i % 3], background: `${[T.gold, T.cyan, T.green][i % 3]}15`,
                  padding: "2px 8px",
                }}>
                  {v.style?.toUpperCase()}
                </span>
                <span style={{ fontFamily: T.fontMono, fontSize: 10, color: v.char_count > 150 ? T.red : T.muted }}>
                  {v.char_count}/150
                </span>
              </div>

              <p style={{
                fontFamily: T.fontBody, fontSize: 15, color: T.white, margin: "0 0 8px",
                lineHeight: 1.5, whiteSpace: "pre-wrap",
              }}>
                {v.bio}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                {v.strengths?.map((s, j) => (
                  <span key={j} style={{ fontFamily: T.fontMono, fontSize: 9, color: T.green, background: `${T.green}10`, padding: "2px 6px" }}>
                    ✓ {s}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, margin: 0 }}>
                  Melhor pra: {v.best_for}
                </p>
                <button
                  type="button" onClick={() => copyBio(v.bio)}
                  style={{
                    background: `${T.cyan}12`, border: `1px solid ${T.cyan}30`, color: T.cyan,
                    fontFamily: T.fontMono, fontSize: 9, padding: "4px 10px", cursor: "pointer", flexShrink: 0,
                  }}
                >
                  COPIAR
                </button>
              </div>
            </div>
          ))}

          {result.name_line_suggestion && (
            <div style={{ marginTop: 8 }}>
              <Label>CAMPO "NOME" SUGERIDO (com keyword)</Label>
              <div style={{ background: T.surface2, padding: 12, fontFamily: T.fontBody, fontSize: 14, color: T.cyan }}>
                {result.name_line_suggestion}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PINNED STRATEGY
// ═══════════════════════════════════════════════════
type PinnedResult = {
  strategy_score: number;
  overall_verdict: string;
  pins: {
    slot: number; role: string; current_fit: string; recommendation: string;
    format_suggestion: string; hook_suggestion: string; rotation: string;
  }[];
  content_ideas: { slot: number; idea: string }[];
  mistakes_to_avoid: { icon: string; text: string }[];
};

function PinnedStrategy() {
  const [pins, setPins] = useState([
    { desc: "", type: "identidade" },
    { desc: "", type: "resultado" },
    { desc: "", type: "oferta" },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PinnedResult | null>(null);

  const pinRoles = [
    { id: "identidade", label: "Quem você é", icon: "👤", desc: "Storytelling, intro, bastidores", color: T.cyan },
    { id: "resultado", label: "Prova de resultado", icon: "🏆", desc: "Transformação, depoimento, caso", color: T.green },
    { id: "oferta", label: "Oferta atual", icon: "🎯", desc: "Lead magnet, programa, CTA", color: T.gold },
  ];

  const analyze = async () => {
    setLoading(true);
    try {
      const pinsText = pins.map((p, i) => `Pin ${i + 1} (${p.type}): ${p.desc || "sem conteúdo definido"}`).join("\n");
      const notes = `Você é especialista em estratégia de posts fixados do Instagram 2026. Os 3 posts fixados funcionam como hero section de um site — são a primeira coisa que um novo visitante vê.\nEstrutura ideal:\n- Pin 1: Quem você é (storytelling, intro, bastidores)\n- Pin 2: Prova de resultado (transformação, depoimento, caso de sucesso)\n- Pin 3: Oferta atual (lead magnet, programa, CTA — esse rotaciona com campanhas)\n\nFIXADOS DO COACH:\n${pinsText}`;
      const r = await callSocialAI({ mode: "pinned_strategy", notes, topic: "Estratégia dos 3 posts fixados" });
      setResult(r as PinnedResult);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na análise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 28, background: T.purple }} />
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, margin: 0, lineHeight: 1.5 }}>
          Seus 3 fixados são seu hero section. Pin 1 = quem você é, Pin 2 = prova, Pin 3 = oferta. O sistema avalia e sugere.
        </p>
      </div>

      {pinRoles.map((role, i) => (
        <div key={role.id} style={{
          background: T.surface2, border: "1px solid #ffffff08",
          padding: 14, marginBottom: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, background: `${role.color}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.fontTitle, fontSize: 13, fontWeight: 700, color: role.color,
            }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontFamily: T.fontTitle, fontSize: 14, fontWeight: 700, color: role.color }}>
                {role.icon} {role.label}
              </div>
              <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted }}>{role.desc}</div>
            </div>
          </div>

          <textarea
            value={pins[i].desc}
            onChange={(e) => { const n = [...pins]; n[i] = { ...n[i], desc: e.target.value }; setPins(n); }}
            placeholder={`Descreva o conteúdo do Pin ${i + 1} (ou deixe vazio pra receber sugestões)...`}
            style={{
              width: "100%", minHeight: 50, background: T.surface3, border: "1px solid #ffffff08",
              borderRadius: 0, color: T.text, fontFamily: T.fontBody, fontSize: 12,
              padding: 10, resize: "none", boxSizing: "border-box",
            }}
          />
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <Btn onClick={analyze} loading={loading} color={T.purple}>
          📌 ANALISAR FIXADOS
        </Btn>
      </div>

      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
            <Ring score={result.strategy_score} size={90} label="PINS" color={T.purple} />
            <div style={{ flex: 1, background: T.surface2, padding: "10px 12px" }}>
              <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>VEREDITO</span>
              <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.white, margin: "4px 0 0", lineHeight: 1.5 }}>
                {result.overall_verdict}
              </p>
            </div>
          </div>

          {result.pins?.map((pin, i) => {
            const role = pinRoles[i] || pinRoles[0];
            const fitColors: Record<string, string> = { forte: T.green, adequado: T.gold, fraco: T.orange, ausente: T.red };
            return (
              <div key={i} style={{
                background: `${role.color}05`, border: `1px solid ${role.color}15`,
                padding: 14, marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: T.fontTitle, fontSize: 14, fontWeight: 700, color: role.color }}>
                    Pin {pin.slot} — {role.label}
                  </span>
                  <span style={{
                    fontFamily: T.fontMono, fontSize: 9, letterSpacing: 1,
                    color: fitColors[pin.current_fit] || T.muted,
                    background: `${fitColors[pin.current_fit] || T.muted}15`, padding: "2px 8px",
                  }}>
                    {pin.current_fit?.toUpperCase()}
                  </span>
                </div>

                <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.text, margin: "0 0 8px", lineHeight: 1.5 }}>
                  {pin.recommendation}
                </p>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.cyan, background: `${T.cyan}10`, padding: "2px 6px" }}>
                    {pin.format_suggestion}
                  </span>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.gold, background: `${T.gold}10`, padding: "2px 6px" }}>
                    Rotação: {pin.rotation}
                  </span>
                </div>

                {pin.hook_suggestion && (
                  <div style={{ marginTop: 8, background: `${role.color}08`, padding: "8px 10px" }}>
                    <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted, letterSpacing: 1 }}>HOOK SUGERIDO</span>
                    <p style={{ fontFamily: T.fontBody, fontSize: 13, color: role.color, margin: "2px 0 0" }}>
                      "{pin.hook_suggestion}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {result.content_ideas?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Label>IDEIAS CONCRETAS</Label>
              {result.content_ideas.map((idea, i) => (
                <Insight key={i} icon="💡" title={`Pin ${idea.slot}`} text={idea.idea} color={pinRoles[idea.slot - 1]?.color || T.cyan} />
              ))}
            </div>
          )}

          {result.mistakes_to_avoid?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Label>ERROS COMUNS A EVITAR</Label>
              {result.mistakes_to_avoid.map((m, i) => (
                <Insight key={i} icon={m.icon} title="Evite" text={m.text} color={T.red} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
const modules = [
  { id: "grid", label: "Grid Architect", icon: "🏗️", color: T.cyan, C: GridArchitect },
  { id: "bio", label: "Bio Optimizer", icon: "✏️", color: T.gold, C: BioOptimizer },
  { id: "pins", label: "Pinned Strategy", icon: "📌", color: T.purple, C: PinnedStrategy },
];

export default function SocialOnVitrinePanel() {
  const [active, setActive] = useState("grid");
  const Mod = modules.find((m) => m.id === active)?.C;

  return (
    <div style={{ background: T.bg, color: T.text, margin: "-16px", padding: 16, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ padding: "4px 8px 16px", borderBottom: "1px solid #ffffff06" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: T.cyan, fontSize: 18 }}>✦</span>
          <h1 style={{ fontFamily: T.fontTitle, fontSize: 22, fontWeight: 700, color: T.white, letterSpacing: 1, margin: 0 }}>
            SOCIAL ON
          </h1>
          <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.bg, background: T.gold, padding: "2px 8px", letterSpacing: 1 }}>
            VITRINE
          </span>
        </div>
        <p style={{ fontFamily: T.fontMono, fontSize: 11, color: T.muted, margin: "4px 0 0 28px" }}>
          Perfil como vitrine · Converta visitantes em seguidores
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "1px solid #ffffff06" }}>
        {modules.map((m) => (
          <button
            key={m.id} type="button" onClick={() => setActive(m.id)}
            style={{
              background: active === m.id ? `${m.color}08` : "transparent",
              border: "none", borderBottom: active === m.id ? `2px solid ${m.color}` : "2px solid transparent",
              padding: "14px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 16, display: "block", marginBottom: 4 }}>{m.icon}</span>
            <span style={{ fontFamily: T.fontMono, fontSize: 9, letterSpacing: 1, color: active === m.id ? m.color : T.muted }}>
              {m.label.toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 8px 40px" }}>
        {Mod && <Mod />}
      </div>

      <div style={{ padding: "16px 8px", borderTop: "1px solid #ffffff06", textAlign: "center" }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, letterSpacing: 2 }}>
          SOCIAL ON VITRINE · NUTRION
        </span>
      </div>
    </div>
  );
}
