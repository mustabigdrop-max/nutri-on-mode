import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Camera, Copy, Sparkles, Loader2 } from "lucide-react";

interface ApexAnalysisRow {
  id: string;
  athlete_id: string;
  coach_id: string;
  created_at: string;
  scores: Record<string, any> | null;
  analysis_text: string | null;
  photo_front_url?: string | null;
  photo_back_url?: string | null;
  photo_side_url?: string | null;
}

interface DeltaItem {
  label: string;
  before: number;
  after: number;
  delta: number;
}

interface Props {
  athleteId: string | null | undefined;
  coachId: string | null | undefined;
  athleteName?: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────
function flattenNumericScores(scores: Record<string, any> | null | undefined): Record<string, number> {
  if (!scores || typeof scores !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(scores)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (v && typeof v === "object") {
      for (const [k2, v2] of Object.entries(v as Record<string, any>)) {
        if (typeof v2 === "number" && Number.isFinite(v2)) out[`${k}.${k2}`] = v2;
      }
    }
  }
  return out;
}

function calcDelta(scoreA: Record<string, number>, scoreB: Record<string, number>): DeltaItem[] {
  const keys = Array.from(new Set([...Object.keys(scoreA), ...Object.keys(scoreB)]));
  return keys
    .map((key) => {
      const before = scoreA[key] ?? 0;
      const after = scoreB[key] ?? 0;
      return { label: key, before, after, delta: Number((after - before).toFixed(1)) };
    })
    .filter((d) => d.before !== 0 || d.after !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

// Heurística: score (sri, body) maior = melhor; ângulo (qualquer outro) menor = melhor
function isScoreHigherBetter(label: string): boolean {
  return /sri|score|body|geral|readiness|sep|textura|dureza|proporc/i.test(label);
}

// ─── Slider antes/depois ────────────────────────────────────────
function ApexBeforeAfterSlider({
  photoUrlA, photoUrlB,
}: { photoUrlA: string | null; photoUrlB: string | null }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  };

  const Placeholder = (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)",
      flexDirection: "column", gap: 6,
    }}>
      <Camera size={28} />
      <span style={{ fontSize: 10 }}>foto indisponível</span>
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative", width: "100%", aspectRatio: "3/4", maxHeight: 480,
        borderRadius: 12, overflow: "hidden", cursor: "ew-resize",
        border: "0.5px solid rgba(255,255,255,0.1)", userSelect: "none",
        background: "#0A0A0F",
      }}
      onMouseDown={(e) => { isDragging.current = true; handleMove(e.clientX); }}
      onMouseMove={(e) => { if (isDragging.current) handleMove(e.clientX); }}
      onMouseUp={() => { isDragging.current = false; }}
      onMouseLeave={() => { isDragging.current = false; }}
      onTouchStart={(e) => { isDragging.current = true; handleMove(e.touches[0].clientX); }}
      onTouchMove={(e) => { if (isDragging.current) handleMove(e.touches[0].clientX); }}
      onTouchEnd={() => { isDragging.current = false; }}
    >
      {photoUrlB ? (
        <img src={photoUrlB} alt="depois" crossOrigin="anonymous"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0 }}>{Placeholder}</div>
      )}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        {photoUrlA ? (
          <img src={photoUrlA} alt="antes" crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : Placeholder}
      </div>
      <div style={{
        position: "absolute", top: 0, bottom: 0, left: `${sliderPos}%`,
        width: 2, background: "rgba(255,255,255,0.9)", transform: "translateX(-50%)",
        pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 32, height: 32, borderRadius: "50%", background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#0A0A0F", fontWeight: 700,
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}>⇆</div>
      </div>
      <div style={{
        position: "absolute", bottom: 10, left: 10,
        background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 6,
        fontSize: 10, color: "rgba(255,255,255,0.8)", pointerEvents: "none",
      }}>ANTES</div>
      <div style={{
        position: "absolute", bottom: 10, right: 10,
        background: "rgba(56,189,248,0.25)", border: "0.5px solid rgba(56,189,248,0.4)",
        padding: "3px 8px", borderRadius: 6, fontSize: 10, color: "#38BDF8",
        pointerEvents: "none",
      }}>DEPOIS</div>
    </div>
  );
}

// ─── Delta card ─────────────────────────────────────────────────
function DeltaCard({ item }: { item: DeltaItem }) {
  const higherBetter = isScoreHigherBetter(item.label);
  const neutral = item.delta === 0;
  const improved = higherBetter ? item.delta > 0 : item.delta < 0;
  const color = neutral ? "rgba(255,255,255,0.3)" : improved ? "#34D399" : "#EF4444";
  const sign = item.delta > 0 ? "+" : "";
  const unit = higherBetter ? "" : "°";

  return (
    <div style={{
      padding: "10px 14px", background: "rgba(255,255,255,0.04)",
      borderRadius: 8, borderLeft: `2px solid ${color}`,
    }}>
      <p style={{
        fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "0 0 4px",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>{item.label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{item.before}{unit}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>→</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{item.after}{unit}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>
          ({sign}{item.delta}{unit})
        </span>
        {!neutral && (
          <span style={{ fontSize: 11, color }}>
            {improved ? "↑ melhorou" : "↓ piorou"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────
export default function ApexTimelineTab({ athleteId, coachId, athleteName }: Props) {
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<ApexAnalysisRow[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string | null>>({});
  const [selectedA, setSelectedA] = useState(0);
  const [selectedB, setSelectedB] = useState(0);
  const [evolutionSummary, setEvolutionSummary] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!athleteId) { setAnalyses([]); setLoading(false); return; }
      setLoading(true);
      const { data, error } = await supabase
        .from("apex_analyses" as any)
        .select("id, athlete_id, coach_id, created_at, scores, analysis_text, photo_front_url, photo_back_url, photo_side_url")
        .eq("athlete_id", athleteId)
        .order("created_at", { ascending: true });
      if (!alive) return;
      if (error) {
        toast({ title: "Erro ao carregar timeline", description: error.message, variant: "destructive" });
        setAnalyses([]);
      } else {
        const rows = (data as any as ApexAnalysisRow[]) || [];
        setAnalyses(rows);
        setSelectedA(0);
        setSelectedB(Math.max(0, rows.length - 1));
        // Sign URLs in parallel
        const entries = await Promise.all(rows.map(async (r) => {
          const p = r.photo_back_url || r.photo_front_url || r.photo_side_url;
          if (!p) return [r.id, null] as const;
          const { data: s } = await supabase.storage.from("apex-visual-photos").createSignedUrl(p, 3600);
          return [r.id, s?.signedUrl ?? null] as const;
        }));
        if (!alive) return;
        setSignedUrls(Object.fromEntries(entries));
      }
      setLoading(false);
    };
    load();
    return () => { alive = false; };
  }, [athleteId]);

  // Reset summary if selection changes
  useEffect(() => { setEvolutionSummary(""); }, [selectedA, selectedB]);

  const analysisA = analyses[selectedA];
  const analysisB = analyses[selectedB];

  const deltas = useMemo(() => {
    if (!analysisA || !analysisB) return [];
    return calcDelta(flattenNumericScores(analysisA.scores), flattenNumericScores(analysisB.scores));
  }, [analysisA, analysisB]);

  // ─── Empty / loading states ─────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <Loader2 className="animate-spin" size={20} style={{ color: "rgba(255,255,255,0.4)", margin: "0 auto" }} />
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 12 }}>Carregando timeline…</p>
      </div>
    );
  }

  if (analyses.length < 2) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
          Timeline disponível após 2 análises
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
          Realize uma nova análise APEX para comparar a evolução
        </p>
      </div>
    );
  }

  const generateSummary = async () => {
    if (!analysisA || !analysisB) return;
    setGenLoading(true);
    try {
      const diasEntre = Math.max(0, Math.round(
        (new Date(analysisB.created_at).getTime() - new Date(analysisA.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ));
      const prompt = `Você é um especialista em biomecânica e coaching de alta performance.
Compare as duas análises posturais APEX abaixo e gere um resumo clínico evolutivo em português.

ANÁLISE ANTERIOR (${fmtDate(analysisA.created_at)}):
${(analysisA.analysis_text || "").slice(0, 800)}

ANÁLISE ATUAL (${fmtDate(analysisB.created_at)}):
${(analysisB.analysis_text || "").slice(0, 800)}

DELTAS CALCULADOS (${diasEntre} dias entre análises):
${deltas.map((d) => `${d.label}: ${d.before} → ${d.after} (${d.delta > 0 ? "+" : ""}${d.delta})`).join("\n")}

Atleta: ${athleteName ?? "—"}

Retorne em 3 blocos curtos:
1. EVOLUÇÃO GERAL (2-3 frases sobre o progresso geral)
2. PRINCIPAIS MELHORIAS (bullets curtos)
3. PONTOS QUE PRECISAM ATENÇÃO (bullets curtos + recomendação)

Seja direto e clínico. Máximo 180 palavras no total.`;

      const { data, error } = await supabase.functions.invoke("apex-evolution-summary", { body: { prompt } });
      if (error) throw error;
      const summary = (data as any)?.summary ?? "";
      setEvolutionSummary(summary);
    } catch (e: any) {
      toast({ title: "Erro ao gerar análise", description: e?.message || "Tente novamente", variant: "destructive" });
    } finally {
      setGenLoading(false);
    }
  };

  const photoUrlA = analysisA ? signedUrls[analysisA.id] ?? null : null;
  const photoUrlB = analysisB ? signedUrls[analysisB.id] ?? null : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Date selectors ────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        {/* ANTES */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginBottom: 6 }}>
            ANTES
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
            {analyses.map((a, i) => (
              <button
                key={a.id}
                onClick={() => i !== selectedB && setSelectedA(i)}
                disabled={i === selectedB}
                style={{
                  padding: "8px 12px",
                  background: selectedA === i ? "rgba(184,146,42,0.2)" : "rgba(255,255,255,0.04)",
                  border: selectedA === i ? "1px solid rgba(184,146,42,0.5)" : "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: selectedA === i ? "#B8922A" : "rgba(255,255,255,0.6)",
                  fontSize: 12,
                  cursor: i === selectedB ? "not-allowed" : "pointer",
                  textAlign: "left",
                  opacity: i === selectedB ? 0.35 : 1,
                  transition: "all 0.15s",
                }}
              >
                {fmtDate(a.created_at)}
                {i === analyses.length - 1 && (
                  <span style={{ fontSize: 9, marginLeft: 6, color: "rgba(110,231,183,0.8)" }}>atual</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", paddingTop: 24, color: "rgba(255,255,255,0.2)", fontSize: 18 }}>→</div>

        {/* DEPOIS */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginBottom: 6 }}>
            DEPOIS
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
            {analyses.map((a, i) => (
              <button
                key={a.id}
                onClick={() => i !== selectedA && setSelectedB(i)}
                disabled={i === selectedA}
                style={{
                  padding: "8px 12px",
                  background: selectedB === i ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)",
                  border: selectedB === i ? "1px solid rgba(56,189,248,0.4)" : "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: selectedB === i ? "#38BDF8" : "rgba(255,255,255,0.6)",
                  fontSize: 12,
                  cursor: i === selectedA ? "not-allowed" : "pointer",
                  textAlign: "left",
                  opacity: i === selectedA ? 0.35 : 1,
                  transition: "all 0.15s",
                }}
              >
                {fmtDate(a.created_at)}
                {i === analyses.length - 1 && (
                  <span style={{ fontSize: 9, marginLeft: 6, color: "rgba(110,231,183,0.8)" }}>atual</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Slider antes/depois ───────────────────────────────── */}
      <ApexBeforeAfterSlider photoUrlA={photoUrlA} photoUrlB={photoUrlB} />

      {/* ── Deltas grid ───────────────────────────────────────── */}
      {deltas.length > 0 && (
        <div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginBottom: 10 }}>
            DELTAS — {deltas.length} métricas comparadas
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {deltas.map((d) => <DeltaCard key={d.label} item={d} />)}
          </div>
        </div>
      )}

      {/* ── Mini history timeline ─────────────────────────────── */}
      <div style={{ marginTop: 8 }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginBottom: 10 }}>
          HISTÓRICO COMPLETO — {analyses.length} análises
        </p>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {analyses.map((a, i) => {
            const isA = i === selectedA;
            const isB = i === selectedB;
            const border = isA ? "2px solid #B8922A" : isB ? "2px solid #38BDF8" : "0.5px solid rgba(255,255,255,0.1)";
            const url = signedUrls[a.id];
            const sri = a.scores && typeof (a.scores as any).sri === "number" ? (a.scores as any).sri : null;
            return (
              <div
                key={a.id}
                onClick={() => {
                  // Toggle: prefer assign to selectedB if it's after selectedA, otherwise to selectedA
                  if (i > selectedA) setSelectedB(i);
                  else setSelectedA(i);
                }}
                style={{ flexShrink: 0, width: 72, cursor: "pointer", transition: "transform 0.15s" }}
              >
                <div style={{
                  width: 72, height: 96, borderRadius: 8, border, overflow: "hidden",
                  background: "rgba(255,255,255,0.06)", marginBottom: 5,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {url ? (
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Camera size={18} style={{ color: "rgba(255,255,255,0.25)" }} />
                  )}
                </div>
                <p style={{
                  fontSize: 9, textAlign: "center", lineHeight: 1.3,
                  color: isA ? "#B8922A" : isB ? "#38BDF8" : "rgba(255,255,255,0.35)",
                }}>
                  {new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </p>
                {sri != null && (
                  <p style={{ fontSize: 9, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                    {sri} SRI
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Generate AI evolution ─────────────────────────────── */}
      <div>
        {!evolutionSummary && (
          <button
            onClick={generateSummary}
            disabled={genLoading || !analysisA || !analysisB || selectedA === selectedB}
            style={{
              padding: "10px 16px",
              background: "rgba(184,146,42,0.12)",
              border: "0.5px solid rgba(184,146,42,0.4)",
              borderRadius: 10,
              color: "#B8922A",
              fontSize: 12,
              fontWeight: 600,
              cursor: genLoading ? "wait" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              opacity: genLoading ? 0.6 : 1,
            }}
          >
            {genLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {genLoading ? "Gerando análise…" : "Gerar análise evolutiva"}
          </button>
        )}

        {evolutionSummary && (
          <div style={{
            padding: "14px 16px",
            background: "rgba(184,146,42,0.07)",
            border: "0.5px solid rgba(184,146,42,0.25)",
            borderRadius: 10, marginTop: 4,
          }}>
            <p style={{ fontSize: 10, color: "#B8922A", letterSpacing: "0.08em", marginBottom: 8 }}>
              ANÁLISE EVOLUTIVA
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {evolutionSummary}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(evolutionSummary);
                  toast({ title: "Copiado", description: "Análise copiada para WhatsApp" });
                }}
                style={{
                  fontSize: 11, color: "rgba(184,146,42,0.85)",
                  background: "transparent", border: "none", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <Copy size={12} /> Copiar para WhatsApp
              </button>
              <button
                onClick={generateSummary}
                disabled={genLoading}
                style={{
                  fontSize: 11, color: "rgba(255,255,255,0.4)",
                  background: "transparent", border: "none", cursor: "pointer",
                }}
              >
                Regenerar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
