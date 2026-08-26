import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { callSocialAI, copyText } from "./socialUi";

const T = {
  bg: "#020205", surface: "#0A0A0F", surface2: "#111118", surface3: "#1A1A24",
  cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444",
  purple: "#A855F7", orange: "#F97316", pink: "#EC4899", muted: "#555566",
  text: "#E8E8F0", white: "#FFF",
  fontTitle: "'Rajdhani',sans-serif", fontMono: "'Space Mono',monospace", fontBody: "'Inter',sans-serif",
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 10px" }}>{children}</p>
);

const Btn = ({ children, onClick, disabled, loading, color = T.cyan }: any) => (
  <button onClick={onClick} disabled={disabled || loading} style={{
    width: "100%", padding: "14px", background: disabled ? T.muted : color, border: "none", borderRadius: 0,
    cursor: disabled ? "not-allowed" : "pointer", fontFamily: T.fontTitle, fontSize: 16, fontWeight: 700,
    color: T.bg, letterSpacing: 1, opacity: loading ? 0.7 : 1,
  }}>{loading ? "⏳ Processando..." : children}</button>
);

const Chip = ({ children, active, onClick, color = T.cyan }: any) => (
  <button onClick={onClick} style={{
    background: active ? `${color}15` : "transparent", border: `1px solid ${active ? color : "#ffffff12"}`,
    borderRadius: 0, padding: "7px 12px", cursor: "pointer", fontFamily: T.fontTitle, fontSize: 12,
    fontWeight: 600, color: active ? color : T.muted, transition: "all 0.2s",
  }}>{children}</button>
);

const Insight = ({ icon, title, text, color = T.cyan }: any) => (
  <div style={{ background: T.surface2, borderLeft: `3px solid ${color}`, padding: "10px 12px", marginBottom: 6 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontFamily: T.fontTitle, fontSize: 12, fontWeight: 700, color }}>{title}</span>
    </div>
    <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.text, margin: 0, lineHeight: 1.5 }}>{text}</p>
  </div>
);

const CopyBtn = ({ text }: { text: string }) => (
  <button onClick={() => copyText(text)} style={{
    display: "flex", alignItems: "center", gap: 5, background: "transparent",
    border: "1px solid #ffffff15", color: T.muted, padding: "4px 8px", cursor: "pointer",
    fontFamily: T.fontMono, fontSize: 9,
  }}>
    <Copy size={11} /> COPIAR
  </button>
);

// ═══════════════════════════════════════════════════
// 1. CONVERSION BRIDGE
// ═══════════════════════════════════════════════════
function ConversionBridge() {
  const [posts, setPosts] = useState("");
  const [ticket, setTicket] = useState("200");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    if (!posts.trim()) return;
    setLoading(true);
    try {
      const r = await callSocialAI({ mode: "conversion_bridge", posts, ticket });
      setResult(r);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao mapear conversão");
    } finally {
      setLoading(false);
    }
  };

  const stageColors = [T.cyan, T.purple, T.gold, T.green];
  const stageLabels = ["Conteúdo", "DMs", "Leads", "Clientes"];
  const stageIcons = ["📱", "💬", "🎯", "💰"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 28, background: T.green }} />
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, margin: 0, lineHeight: 1.5 }}>
          Liste seus posts recentes com performance. O sistema mapeia qual conteúdo gera DMs que viram clientes reais — e quanto dinheiro cada tipo de post traz.
        </p>
      </div>

      <Label>POSTS RECENTES (formato + descrição + métricas)</Label>
      <textarea value={posts} onChange={e => setPosts(e.target.value)}
        placeholder={"Reel: 5 erros no agachamento — 120k views, 3k likes, 200 saves, 45 comentários\nCarrossel: Como montar prato proteico — 15k views, 800 saves, 120 comentários\nReel: Transformação cliente Maria 12 semanas — 80k views, 5k likes, 150 DMs\nStories: Enquete sobre treino manhã vs noite — 2k respostas\nFeed: Depoimento do João sobre o método — 3k likes, 40 DMs"}
        style={{ width: "100%", minHeight: 140, background: T.surface2, border: "1px solid #ffffff10",
          borderRadius: 0, color: T.text, fontFamily: T.fontBody, fontSize: 13, padding: 14, resize: "vertical", boxSizing: "border-box" }} />

      <div style={{ marginTop: 12, marginBottom: 16 }}>
        <Label>TICKET MÉDIO (R$/MÊS)</Label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["150", "200", "300", "500", "800"].map(v => (
            <Chip key={v} active={ticket === v} onClick={() => setTicket(v)} color={T.gold}>R${v}</Chip>
          ))}
        </div>
      </div>

      <Btn onClick={analyze} disabled={!posts.trim()} loading={loading} color={T.green}>
        💰 MAPEAR CONVERSÃO
      </Btn>

      {result && (
        <div style={{ marginTop: 24 }}>
          {/* Funnel visualization */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 20 }}>
            {stageLabels.map((stage, i) => {
              const vals = result.funnel_analysis;
              const numbers = [vals?.total_posts, vals?.estimated_dms_generated, vals?.estimated_leads, vals?.estimated_clients];
              const widths = [100, 80, 60, 48];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    width: widths[i], height: widths[i], background: `${stageColors[i]}12`,
                    border: `2px solid ${stageColors[i]}40`, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", position: "relative",
                  }}>
                    <span style={{ fontSize: 16 }}>{stageIcons[i]}</span>
                    <span style={{ fontFamily: T.fontTitle, fontSize: widths[i] > 60 ? 20 : 16, fontWeight: 700, color: stageColors[i] }}>
                      {numbers[i] || "—"}
                    </span>
                    <span style={{ fontFamily: T.fontMono, fontSize: 7, color: T.muted, letterSpacing: 1, position: "absolute", bottom: -16 }}>
                      {stage.toUpperCase()}
                    </span>
                  </div>
                  {i < 3 && (
                    <div style={{ display: "flex", alignItems: "center", margin: "0 4px" }}>
                      <div style={{ width: 16, height: 1, background: `#ffffff15` }} />
                      <span style={{ color: "#ffffff30", fontSize: 10 }}>›</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Conversion rates */}
          <div style={{ display: "flex", gap: 6, margin: "28px 0 16px" }}>
            <div style={{ flex: 1, background: T.surface2, padding: "10px 12px", textAlign: "center" }}>
              <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted }}>CONTEÚDO → DM</span>
              <div style={{ fontFamily: T.fontTitle, fontSize: 18, fontWeight: 700, color: T.purple }}>{result.funnel_analysis?.conversion_rate_content_to_dm}</div>
            </div>
            <div style={{ flex: 1, background: T.surface2, padding: "10px 12px", textAlign: "center" }}>
              <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted }}>DM → CLIENTE</span>
              <div style={{ fontFamily: T.fontTitle, fontSize: 18, fontWeight: 700, color: T.gold }}>{result.funnel_analysis?.conversion_rate_dm_to_client}</div>
            </div>
            <div style={{ flex: 1, background: `${T.green}08`, padding: "10px 12px", textAlign: "center", border: `1px solid ${T.green}20` }}>
              <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted }}>RECEITA EST.</span>
              <div style={{ fontFamily: T.fontTitle, fontSize: 18, fontWeight: 700, color: T.green }}>{result.funnel_analysis?.estimated_monthly_revenue}</div>
            </div>
          </div>

          {/* Revenue multiplier */}
          {result.revenue_multiplier && (
            <div style={{ background: `${T.gold}06`, border: `1px solid ${T.gold}20`, padding: 14, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>ATUAL</span>
                  <div style={{ fontFamily: T.fontTitle, fontSize: 20, fontWeight: 700, color: T.muted }}>{result.revenue_multiplier.current_estimate}</div>
                </div>
                <div style={{ fontFamily: T.fontTitle, fontSize: 28, fontWeight: 700, color: T.gold }}>→</div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>OTIMIZADO</span>
                  <div style={{ fontFamily: T.fontTitle, fontSize: 20, fontWeight: 700, color: T.gold }}>{result.revenue_multiplier.optimized_estimate}</div>
                </div>
                <div style={{ background: `${T.gold}20`, padding: "8px 12px", textAlign: "center" }}>
                  <div style={{ fontFamily: T.fontTitle, fontSize: 22, fontWeight: 700, color: T.gold }}>{result.revenue_multiplier.multiplier}</div>
                </div>
              </div>
              <Label>MUDANÇAS-CHAVE</Label>
              {result.revenue_multiplier.key_changes?.map((c: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 3 }}>
                  <span style={{ color: T.gold, fontSize: 11, flexShrink: 0 }}>→</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.text }}>{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* Content ROI ranking */}
          <Label>ROI POR TIPO DE CONTEÚDO</Label>
          {result.content_roi_ranking?.map((c: any, i: number) => {
            const lvlColors: Record<string, string> = { alto: T.green, médio: T.gold, baixo: T.red };
            return (
              <div key={i} style={{ background: T.surface2, padding: "12px 14px", marginBottom: 6, borderLeft: `3px solid ${c.roi_score >= 70 ? T.green : c.roi_score >= 40 ? T.gold : T.red}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: T.fontTitle, fontSize: 14, fontWeight: 700, color: T.white }}>{c.content_type}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.cyan, background: `${T.cyan}10`, padding: "2px 6px" }}>{c.format}</span>
                    <span style={{ fontFamily: T.fontTitle, fontSize: 16, fontWeight: 700, color: c.roi_score >= 70 ? T.green : c.roi_score >= 40 ? T.gold : T.red }}>{c.roi_score}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: lvlColors[c.dm_generation] }}>DMs: {c.dm_generation}</span>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: lvlColors[c.client_conversion] }}>Conversão: {c.client_conversion}</span>
                </div>
                <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, margin: 0 }}>{c.why}</p>
              </div>
            );
          })}

          {/* Funnel gaps */}
          {result.funnel_gaps?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Label>GAPS NO FUNIL</Label>
              {result.funnel_gaps.map((g: any, i: number) => (
                <div key={i} style={{ background: T.surface2, padding: "10px 12px", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13 }}>{g.icon}</span>
                    <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.orange, background: `${T.orange}12`, padding: "2px 6px", letterSpacing: 1 }}>{g.stage?.toUpperCase()}</span>
                    <span style={{ fontFamily: T.fontTitle, fontSize: 12, fontWeight: 700, color: T.orange }}>{g.problem}</span>
                  </div>
                  <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.green, margin: 0 }}>✓ {g.fix}</p>
                </div>
              ))}
            </div>
          )}

          {/* Content prescription */}
          {result.content_prescription?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Label>PRESCRIÇÃO DE CONTEÚDO PRA RECEITA</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 6 }}>
                {result.content_prescription.map((rx: any, i: number) => (
                  <div key={i} style={{ background: `${T.green}06`, border: `1px solid ${T.green}15`, padding: "10px 12px" }}>
                    <span style={{ fontFamily: T.fontTitle, fontSize: 18, fontWeight: 700, color: T.green }}>{rx.frequency}</span>
                    <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.cyan, marginTop: 2 }}>{rx.format}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.text, marginTop: 4 }}>{rx.type}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.muted, marginTop: 2 }}>{rx.goal}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 2. CTA INTELLIGENCE
// ═══════════════════════════════════════════════════
function CTAIntelligence() {
  const [format, setFormat] = useState("reels");
  const [stage, setStage] = useState("topo");
  const [offer, setOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await callSocialAI({
        mode: "cta_intelligence",
        format,
        funnelStage: stage,
        offer: offer || "programa fitness",
      });
      setResult(r);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao gerar CTAs");
    } finally {
      setLoading(false);
    }
  };

  const styleColors: Record<string, string> = { direto: T.cyan, curioso: T.purple, urgente: T.orange, "social proof": T.gold, desafio: T.green };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 28, background: T.orange }} />
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, margin: 0, lineHeight: 1.5 }}>
          Gere CTAs com palavra-gatilho que convertem. Inclui sistema completo: trigger → DM automática → lead magnet → follow-up.
        </p>
      </div>

      <Label>FORMATO DO POST</Label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {[{ id: "reels", l: "Reels" }, { id: "carousel", l: "Carrossel" }, { id: "feed", l: "Feed" }, { id: "stories", l: "Stories" }, { id: "live", l: "Live" }].map(f => (
          <Chip key={f.id} active={format === f.id} onClick={() => setFormat(f.id)} color={T.orange}>{f.l}</Chip>
        ))}
      </div>

      <Label>ESTÁGIO DO FUNIL</Label>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[
          { id: "topo", l: "Topo", desc: "Descoberta", c: T.cyan },
          { id: "meio", l: "Meio", desc: "Consideração", c: T.purple },
          { id: "fundo", l: "Fundo", desc: "Decisão", c: T.gold },
        ].map(s => (
          <button key={s.id} onClick={() => setStage(s.id)} style={{
            flex: 1, background: stage === s.id ? `${s.c}10` : T.surface2,
            border: `1px solid ${stage === s.id ? s.c : "#ffffff08"}`, borderRadius: 0,
            padding: "10px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s",
          }}>
            <div style={{ fontFamily: T.fontTitle, fontSize: 14, fontWeight: 700, color: stage === s.id ? s.c : T.muted }}>{s.l}</div>
            <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted }}>{s.desc}</div>
          </button>
        ))}
      </div>

      <Label>OFERTA / LEAD MAGNET</Label>
      <input value={offer} onChange={e => setOffer(e.target.value)}
        placeholder="Ex: consultoria gratuita, plano de treino PDF, aula ao vivo, método MCE..."
        style={{ width: "100%", padding: 12, background: T.surface2, border: "1px solid #ffffff10",
          borderRadius: 0, color: T.text, fontFamily: T.fontBody, fontSize: 12, boxSizing: "border-box", marginBottom: 16 }} />

      <Btn onClick={generate} loading={loading} color={T.orange}>
        🎯 GERAR CTAs
      </Btn>

      {result && (
        <div style={{ marginTop: 24 }}>
          {/* Strategy */}
          <div style={{ background: `${T.orange}06`, border: `1px solid ${T.orange}15`, padding: 14, marginBottom: 16 }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.orange, letterSpacing: 1 }}>ESTRATÉGIA</span>
            <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, margin: "6px 0 0", lineHeight: 1.5 }}>{result.cta_strategy}</p>
          </div>

          {/* Trigger Word System */}
          {result.trigger_word_system && (
            <div style={{ background: T.surface, border: `2px solid ${T.cyan}30`, padding: 16, marginBottom: 16 }}>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>PALAVRA-GATILHO</span>
                <div style={{ fontFamily: T.fontTitle, fontSize: 32, fontWeight: 700, color: T.cyan, textShadow: `0 0 30px ${T.cyan}30`, marginTop: 4 }}>
                  {result.trigger_word_system.trigger}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                {result.trigger_word_system.flow?.map((step: string, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, background: `${T.cyan}15`, display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: T.fontMono, fontSize: 10, color: T.cyan, flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.text }}>{step}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: `${T.cyan}06`, padding: 12, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.cyan, letterSpacing: 1 }}>DM AUTOMÁTICA</span>
                  <CopyBtn text={result.trigger_word_system.dm_template || ""} />
                </div>
                <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.white, margin: "6px 0 0", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {result.trigger_word_system.dm_template}
                </p>
              </div>
            </div>
          )}

          {/* CTA Variations */}
          <Label>VARIAÇÕES DE CTA</Label>
          {result.cta_variations?.map((cta: any, i: number) => {
            const c = styleColors[cta.style] || T.cyan;
            return (
              <div key={i} style={{ background: T.surface2, marginBottom: 8, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: T.fontMono, fontSize: 9, color: c, background: `${c}15`, padding: "2px 8px", letterSpacing: 1 }}>
                      {cta.style?.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.green }}>
                      Taxa: {cta.expected_trigger_rate}
                    </span>
                  </div>
                  <div style={{ background: `${c}08`, padding: "10px 12px", marginBottom: 8, position: "relative" }}>
                    <p style={{ fontFamily: T.fontTitle, fontSize: 16, fontWeight: 700, color: c, margin: 0, lineHeight: 1.4 }}>
                      "{cta.cta_text}"
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted }}>ONDE COLOCAR</span>
                      <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.text, margin: "2px 0 0" }}>{cta.placement}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.muted }}>MELHOR PRA</span>
                      <p style={{ fontFamily: T.fontBody, fontSize: 11, color: T.text, margin: "2px 0 0" }}>{cta.best_for}</p>
                    </div>
                    <CopyBtn text={cta.cta_text || ""} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Caption closers */}
          {result.caption_closers?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Label>FECHAMENTOS DE CAPTION</Label>
              {result.caption_closers.map((c: string, i: number) => (
                <div key={i} style={{ background: `${T.gold}06`, padding: "10px 14px", marginBottom: 4, borderLeft: `2px solid ${T.gold}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.gold, margin: 0 }}>"{c}"</p>
                  <CopyBtn text={c} />
                </div>
              ))}
            </div>
          )}

          {/* Mistakes */}
          {result.mistakes?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Label>ERROS QUE MATAM CONVERSÃO</Label>
              {result.mistakes.map((m: any, i: number) => (
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
// 3. COLLAB FINDER
// ═══════════════════════════════════════════════════
function CollabFinder() {
  const [profile, setProfile] = useState("");
  const [audience, setAudience] = useState("5k-20k");
  const [goal, setGoal] = useState("crescer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const find = async () => {
    setLoading(true);
    try {
      const r = await callSocialAI({
        mode: "collab_finder",
        topic: profile || "coach fitness",
        audienceSize: audience,
        collabGoal: goal,
      });
      setResult(r);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao buscar parceiros");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 28, background: T.pink }} />
        <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, margin: 0, lineHeight: 1.5 }}>
          Encontre contas complementares pra collabs estratégicas. Mesmo nicho + audiência diferente = crescimento mútuo.
        </p>
      </div>

      <Label>SEU PERFIL / NICHO</Label>
      <input value={profile} onChange={e => setProfile(e.target.value)}
        placeholder="Ex: coach fitness com foco em emagrecimento feminino, nutricionista esportivo..."
        style={{ width: "100%", padding: 12, background: T.surface2, border: "1px solid #ffffff10",
          borderRadius: 0, color: T.text, fontFamily: T.fontBody, fontSize: 12, boxSizing: "border-box", marginBottom: 12 }} />

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Label>TAMANHO DA AUDIÊNCIA</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {["1k-5k", "5k-20k", "20k-50k", "50k-100k", "100k+"].map(a => (
              <Chip key={a} active={audience === a} onClick={() => setAudience(a)} color={T.pink}>{a}</Chip>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Label>OBJETIVO DA COLLAB</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {[{ id: "crescer", l: "Crescer" }, { id: "autoridade", l: "Autoridade" }, { id: "vender", l: "Vender" }].map(g => (
              <Chip key={g.id} active={goal === g.id} onClick={() => setGoal(g.id)} color={T.pink}>{g.l}</Chip>
            ))}
          </div>
        </div>
      </div>

      <Btn onClick={find} loading={loading} color={T.pink}>
        🤝 ENCONTRAR PARCEIROS
      </Btn>

      {result && (
        <div style={{ marginTop: 24 }}>
          {/* Strategy */}
          <div style={{ background: `${T.pink}06`, border: `1px solid ${T.pink}15`, padding: 14, marginBottom: 16 }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.pink, letterSpacing: 1 }}>ESTRATÉGIA</span>
            <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, margin: "6px 0 0", lineHeight: 1.5 }}>{result.collab_strategy}</p>
          </div>

          {/* Partners */}
          <Label>PARCEIROS IDEAIS</Label>
          {result.ideal_partners?.map((p: any, i: number) => {
            const potColors: Record<string, string> = { alto: T.green, médio: T.gold, baixo: T.muted };
            return (
              <div key={i} style={{ background: T.surface2, marginBottom: 10, overflow: "hidden" }}>
                <div style={{ padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontFamily: T.fontTitle, fontSize: 15, fontWeight: 700, color: T.white }}>{p.type}</span>
                    <span style={{ fontFamily: T.fontMono, fontSize: 9, color: potColors[p.growth_potential], background: `${potColors[p.growth_potential]}12`, padding: "2px 6px" }}>
                      Potencial: {p.growth_potential}
                    </span>
                  </div>
                  <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.muted, margin: "0 0 8px" }}>{p.why_complementary}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {p.collab_formats?.map((f: any, j: number) => (
                      <div key={j} style={{ background: `${T.pink}08`, padding: "6px 10px", flex: "1 1 auto", minWidth: 140 }}>
                        <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.pink, letterSpacing: 1 }}>{f.format}</span>
                        <p style={{ fontFamily: T.fontBody, fontSize: 10, color: T.text, margin: "2px 0 0" }}>{f.description}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    {p.content_ideas?.map((idea: string, j: number) => (
                      <div key={j} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 3 }}>
                        <span style={{ color: T.cyan, fontSize: 10, flexShrink: 0 }}>💡</span>
                        <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.text }}>{idea}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {p.search_terms?.map((term: string, j: number) => (
                      <span key={j} style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, background: T.surface3, padding: "2px 6px" }}>
                        🔍 {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Outreach templates */}
          {result.outreach_templates?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Label>MENSAGENS DE ABORDAGEM</Label>
              {result.outreach_templates.map((msg: any, i: number) => (
                <div key={i} style={{ background: `${T.purple}06`, border: `1px solid ${T.purple}15`, padding: 14, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.purple, background: `${T.purple}15`, padding: "2px 8px", letterSpacing: 1 }}>
                      {msg.style?.toUpperCase()}
                    </span>
                    <CopyBtn text={msg.message || ""} />
                  </div>
                  <p style={{ fontFamily: T.fontBody, fontSize: 10, color: T.muted, margin: "0 0 6px" }}>{msg.best_for}</p>
                  <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.white, margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Rules */}
          {result.collab_rules?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Label>REGRAS DE OURO</Label>
              {result.collab_rules.map((r: any, i: number) => (
                <Insight key={i} icon={r.icon} title={r.title} text={r.text} color={T.pink} />
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
  { id: "bridge", label: "Conversion Bridge", icon: "💰", color: T.green, C: ConversionBridge },
  { id: "cta", label: "CTA Intelligence", icon: "🎯", color: T.orange, C: CTAIntelligence },
  { id: "collab", label: "Collab Finder", icon: "🤝", color: T.pink, C: CollabFinder },
];

export default function SocialOnMonetizationPanel() {
  const [active, setActive] = useState("bridge");
  const Mod = modules.find(m => m.id === active)?.C;

  return (
    <div style={{ minHeight: "100%", background: T.bg, color: T.text, margin: "-16px", padding: 16 }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #ffffff06" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: T.cyan, fontSize: 18 }}>✦</span>
          <h1 style={{ fontFamily: T.fontTitle, fontSize: 22, fontWeight: 700, color: T.white, letterSpacing: 1, margin: 0 }}>SOCIAL ON</h1>
          <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.bg, background: T.green, padding: "2px 8px", letterSpacing: 1 }}>MONETIZAÇÃO</span>
        </div>
        <p style={{ fontFamily: T.fontMono, fontSize: 11, color: T.muted, margin: "4px 0 0 28px" }}>Ponte pra monetização · Conteúdo → Clientes → Receita</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderBottom: "1px solid #ffffff06" }}>
        {modules.map(m => (
          <button key={m.id} onClick={() => setActive(m.id)} style={{
            background: active === m.id ? `${m.color}08` : "transparent",
            border: "none", borderBottom: active === m.id ? `2px solid ${m.color}` : "2px solid transparent",
            padding: "14px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 16, display: "block", marginBottom: 4 }}>{m.icon}</span>
            <span style={{ fontFamily: T.fontMono, fontSize: 8, letterSpacing: 1, color: active === m.id ? m.color : T.muted }}>{m.label.toUpperCase()}</span>
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 24px 40px" }}>
        {Mod && <Mod />}
      </div>

      <div style={{ padding: "16px 24px", borderTop: "1px solid #ffffff06", textAlign: "center" }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.muted, letterSpacing: 2 }}>SOCIAL ON MONETIZAÇÃO · NUTRION</span>
      </div>
    </div>
  );
}
