import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Minus, Download, Columns2, GitCompare, Loader2, Camera } from "lucide-react";
import jsPDF from "jspdf";

// ── Tokens (alinhado ao APEX dark) ──
const T = {
  bg: "#03040A",
  surface: "#0A0D16",
  surfaceHi: "#0E1220",
  border: "#1E2A42",
  text: "#EDF2FF",
  textDim: "#7A8AAA",
  textMuted: "#3F4A66",
  electric: "#00D4FF",
  gold: "#FFB800",
  green: "#00FF88",
  red: "#FF3366",
  gray: "#7A8AAA",
};

type Angle = "front" | "back" | "side";
const ANGLE_LABEL: Record<Angle, string> = { front: "Frente", back: "Costas", side: "Lateral" };

interface Analysis {
  id: string;
  created_at: string;
  category_label: string | null;
  scores: Record<string, number> | null;
  photos: Partial<Record<Angle, string>> | null;
  analysis_text: string | null;
  bf_estimated: number | null;
  weeks_estimated: number | null;
}

interface SignedAnalysis extends Analysis {
  signed: Partial<Record<Angle, string>>;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  athleteId: string;
  athleteName: string;
  athleteCategory?: string | null;
}

// helpers
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const weeksBetween = (a: string, b: string) =>
  Math.round(Math.abs(new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24 * 7));

const avgScore = (s: Record<string, number> | null) => {
  if (!s) return null;
  const vals = Object.values(s).filter((v) => typeof v === "number");
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

// extrai bloco posturas para o resumo
const parseSection = (text: string | null, key: string, nextKey?: string): string => {
  if (!text) return "";
  const pattern = nextKey
    ? new RegExp(`##\\s*${key}([\\s\\S]*?)##\\s*${nextKey}`, "i")
    : new RegExp(`##\\s*${key}([\\s\\S]*)`, "i");
  return text.match(pattern)?.[1]?.trim() || "";
};

export default function ApexEvolucaoFotografica({
  open, onOpenChange, athleteId, athleteName, athleteCategory,
}: Props) {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<SignedAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [oldId, setOldId] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const [angle, setAngle] = useState<Angle>("front");
  const [mode, setMode] = useState<"split" | "overlay">("split");
  const [exporting, setExporting] = useState(false);

  // Load analyses + sign URLs
  useEffect(() => {
    if (!open || !athleteId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("apex_analyses" as any)
        .select("id,created_at,category_label,scores,photos,analysis_text,bf_estimated,weeks_estimated")
        .eq("athlete_id", athleteId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        toast({ title: "Erro ao carregar análises", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const list = ((data as any[]) || []) as Analysis[];
      const signed: SignedAnalysis[] = await Promise.all(
        list.map(async (a) => {
          const sg: Partial<Record<Angle, string>> = {};
          if (a.photos) {
            for (const k of ["front", "back", "side"] as Angle[]) {
              const p = (a.photos as any)?.[k];
              if (p) {
                const { data: s } = await supabase.storage
                  .from("apex-visual-photos")
                  .createSignedUrl(p, 60 * 60);
                if (s?.signedUrl) sg[k] = s.signedUrl;
              }
            }
          }
          return { ...a, signed: sg };
        })
      );
      if (cancelled) return;
      setAnalyses(signed);
      // Default: oldest vs newest
      if (signed.length >= 2) {
        setOldId(signed[0].id);
        setNewId(signed[signed.length - 1].id);
      } else if (signed.length === 1) {
        setOldId(signed[0].id);
        setNewId(signed[0].id);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, athleteId]);

  const oldA = useMemo(() => analyses.find((a) => a.id === oldId) || null, [analyses, oldId]);
  const newA = useMemo(() => analyses.find((a) => a.id === newId) || null, [analyses, newId]);

  // Comparativo de scores
  const scoreRows = useMemo(() => {
    if (!oldA || !newA) return [];
    const labels = new Set<string>([
      ...Object.keys(oldA.scores || {}),
      ...Object.keys(newA.scores || {}),
    ]);
    return Array.from(labels).map((label) => {
      const before = oldA.scores?.[label] ?? null;
      const after = newA.scores?.[label] ?? null;
      const delta =
        before != null && after != null ? Number((after - before).toFixed(1)) : null;
      return { label, before, after, delta };
    });
  }, [oldA, newA]);

  const overallBefore = oldA ? avgScore(oldA.scores) : null;
  const overallAfter = newA ? avgScore(newA.scores) : null;
  const overallDelta =
    overallBefore != null && overallAfter != null
      ? Number((overallAfter - overallBefore).toFixed(1))
      : null;

  const biggestImprov = useMemo(
    () => scoreRows.filter(r => r.delta != null).sort((a, b) => (b.delta! - a.delta!))[0],
    [scoreRows]
  );
  const biggestRegress = useMemo(
    () => scoreRows.filter(r => r.delta != null).sort((a, b) => (a.delta! - b.delta!))[0],
    [scoreRows]
  );

  const semanasBetween = oldA && newA ? weeksBetween(oldA.created_at, newA.created_at) : null;

  // Resumo postural automático
  const posturalSummary = useMemo(() => {
    if (!oldA || !newA) return null;
    const oldP = parseSection(oldA.analysis_text, "POSTURA_DESVIOS", "CORRECOES_POSTURAIS");
    const newP = parseSection(newA.analysis_text, "POSTURA_DESVIOS", "CORRECOES_POSTURAIS");
    const extractSyndromes = (t: string) =>
      Array.from(new Set(
        (t.match(/(síndrome\s+[a-zA-ZÀ-ÿ\s]+)/gi) || [])
          .map(s => s.trim().replace(/\s+/g, " ").toLowerCase())
      ));
    const oldS = extractSyndromes(oldP);
    const newS = extractSyndromes(newP);
    const corrigidas = oldS.filter(s => !newS.includes(s));
    const novas = newS.filter(s => !oldS.includes(s));
    const mantidas = oldS.filter(s => newS.includes(s));
    return { corrigidas, novas, mantidas };
  }, [oldA, newA]);

  const exportPdf = useCallback(async () => {
    if (!oldA || !newA) return;
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = pdf.internal.pageSize.getWidth();
      let y = 14;
      pdf.setFillColor(3, 4, 10);
      pdf.rect(0, 0, W, 28, "F");
      pdf.setTextColor(255, 184, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("nutriON · APEX Evolução", 12, 18);
      pdf.setFontSize(9);
      pdf.setTextColor(122, 138, 170);
      pdf.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, W - 12, 18, { align: "right" });
      y = 36;

      pdf.setTextColor(20, 20, 20);
      pdf.setFontSize(13);
      pdf.text(`Atleta: ${athleteName}`, 12, y); y += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Categoria: ${athleteCategory || newA.category_label || "—"}`, 12, y); y += 5;
      pdf.text(`Comparativo: ${fmtDate(oldA.created_at)}  →  ${fmtDate(newA.created_at)}  (${semanasBetween ?? 0} semanas)`, 12, y); y += 8;

      // Photos side by side per angle
      const angles: Angle[] = ["front", "back", "side"];
      for (const ang of angles) {
        const a1 = oldA.signed[ang];
        const a2 = newA.signed[ang];
        if (!a1 && !a2) continue;
        if (y > 200) { pdf.addPage(); y = 14; }
        pdf.setTextColor(20, 20, 20);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(ANGLE_LABEL[ang], 12, y); y += 4;
        const imgW = (W - 36) / 2;
        const imgH = imgW * 1.3;
        const tryImg = async (url: string | undefined, x: number) => {
          if (!url) return;
          try {
            const blob = await (await fetch(url)).blob();
            const dataUrl: string = await new Promise((res) => {
              const r = new FileReader();
              r.onload = () => res(r.result as string);
              r.readAsDataURL(blob);
            });
            pdf.addImage(dataUrl, "JPEG", x, y, imgW, imgH);
          } catch {}
        };
        await tryImg(a1, 12);
        await tryImg(a2, 12 + imgW + 12);
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`Antes · ${fmtDate(oldA.created_at)}`, 12, y + imgH + 4);
        pdf.text(`Depois · ${fmtDate(newA.created_at)}`, 12 + imgW + 12, y + imgH + 4);
        y += imgH + 10;
      }

      // Scores table
      if (y > 240) { pdf.addPage(); y = 14; }
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(20, 20, 20);
      pdf.text("Scores APEX — Comparativo", 12, y); y += 6;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      scoreRows.forEach((r) => {
        if (y > 280) { pdf.addPage(); y = 14; }
        const arrow = r.delta == null ? "—" : r.delta > 0 ? `↑ +${r.delta}` : r.delta < 0 ? `↓ ${r.delta}` : "→ 0";
        pdf.setTextColor(20, 20, 20);
        pdf.text(r.label, 12, y);
        pdf.text(`${r.before ?? "—"}`, 90, y);
        pdf.text(`${r.after ?? "—"}`, 115, y);
        pdf.setTextColor(r.delta && r.delta > 0 ? 0 : r.delta && r.delta < 0 ? 200 : 120,
                         r.delta && r.delta > 0 ? 180 : 50, 80);
        pdf.text(arrow, 145, y);
        y += 5;
      });
      y += 4;
      pdf.setTextColor(20, 20, 20);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        `Score Geral APEX: ${overallBefore?.toFixed(2) ?? "—"} → ${overallAfter?.toFixed(2) ?? "—"} (${overallDelta != null ? (overallDelta > 0 ? "+" : "") + overallDelta : "—"})`,
        12, y
      );
      y += 8;

      // Postural summary
      if (posturalSummary) {
        if (y > 250) { pdf.addPage(); y = 14; }
        pdf.setFont("helvetica", "bold");
        pdf.text("Resumo da Evolução Postural", 12, y); y += 6;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        const lines = [
          `Corrigidas: ${posturalSummary.corrigidas.join("; ") || "—"}`,
          `Mantidas: ${posturalSummary.mantidas.join("; ") || "—"}`,
          `Novas: ${posturalSummary.novas.join("; ") || "—"}`,
        ];
        lines.forEach((l) => {
          const split = pdf.splitTextToSize(l, W - 24);
          pdf.text(split, 12, y);
          y += split.length * 5 + 1;
        });
        y += 4;
        const phrase = `Em ${semanasBetween ?? 0} semanas, ${athleteName} ${overallDelta != null && overallDelta >= 0 ? "evoluiu" : "regrediu"} ${Math.abs(overallDelta ?? 0).toFixed(2)} pontos no score APEX geral.`;
        pdf.setFont("helvetica", "italic");
        const ps = pdf.splitTextToSize(phrase, W - 24);
        pdf.text(ps, 12, y);
      }

      pdf.save(`apex-evolucao-${athleteName.replace(/\s+/g, "_")}-${Date.now()}.pdf`);
    } catch (e: any) {
      toast({ title: "Erro ao exportar PDF", description: e?.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }, [oldA, newA, athleteName, athleteCategory, scoreRows, overallBefore, overallAfter, overallDelta, posturalSummary, semanasBetween]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl w-[95vw] max-h-[92vh] overflow-y-auto p-0"
        style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}
      >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle style={{ color: T.gold, fontFamily: "Syne, sans-serif", letterSpacing: ".05em" }}>
            APEX · EVOLUÇÃO FOTOGRÁFICA
          </DialogTitle>
          <div style={{ color: T.textDim, fontSize: 13 }}>
            {athleteName}{athleteCategory ? ` · ${athleteCategory}` : ""}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-20" style={{ color: T.textDim }}>
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {!loading && analyses.length < 2 && (
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textDim }}
            >
              <Camera className="w-10 h-10 mx-auto mb-3" style={{ color: T.gold }} />
              Realize pelo menos 2 análises para visualizar a evolução.
            </div>
          )}

          {!loading && analyses.length >= 2 && oldA && newA && (
            <>
              {/* Timeline */}
              <div className="overflow-x-auto">
                <div className="flex gap-2 pb-2 min-w-max">
                  {analyses.map((a, i) => {
                    const isOld = a.id === oldId;
                    const isNew = a.id === newId;
                    return (
                      <button
                        key={a.id}
                        onClick={() => {
                          // Click cycles: set as new; if already new, set as old
                          if (a.id === newId) setOldId(a.id);
                          else setNewId(a.id);
                        }}
                        style={{
                          padding: "8px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                          background: isOld || isNew ? `${T.electric}15` : T.surface,
                          border: `1px solid ${isOld ? T.gold : isNew ? T.electric : T.border}`,
                          color: isOld ? T.gold : isNew ? T.electric : T.textDim,
                          cursor: "pointer", whiteSpace: "nowrap",
                        }}
                      >
                        #{i + 1} · {fmtDate(a.created_at)}
                        {isOld && " · ANTES"}
                        {isNew && " · DEPOIS"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex gap-1 rounded-lg p-1" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                  {(["front", "back", "side"] as Angle[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAngle(a)}
                      style={{
                        padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: angle === a ? T.electric : "transparent",
                        color: angle === a ? T.bg : T.textDim,
                        cursor: "pointer", textTransform: "uppercase",
                      }}
                    >{ANGLE_LABEL[a]}</button>
                  ))}
                </div>

                <div className="flex gap-1 rounded-lg p-1" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                  {([
                    { k: "split", l: "Split", Ic: Columns2 },
                    { k: "overlay", l: "Overlay", Ic: GitCompare },
                  ] as const).map(({ k, l, Ic }) => (
                    <button
                      key={k}
                      onClick={() => setMode(k)}
                      style={{
                        padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: mode === k ? T.gold : "transparent",
                        color: mode === k ? T.bg : T.textDim,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      }}
                    ><Ic size={12} /> {l}</button>
                  ))}
                </div>

                <select
                  value={oldId ?? ""} onChange={(e) => setOldId(e.target.value)}
                  style={selStyle}
                >
                  {analyses.map((a) => <option key={a.id} value={a.id}>Antes · {fmtDate(a.created_at)}</option>)}
                </select>
                <select
                  value={newId ?? ""} onChange={(e) => setNewId(e.target.value)}
                  style={selStyle}
                >
                  {analyses.map((a) => <option key={a.id} value={a.id}>Depois · {fmtDate(a.created_at)}</option>)}
                </select>

                <button
                  onClick={exportPdf}
                  disabled={exporting}
                  style={{
                    marginLeft: "auto", padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                    background: T.gold, color: T.bg, border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6, opacity: exporting ? 0.5 : 1,
                  }}
                >
                  {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download size={12} />}
                  Exportar Comparativo
                </button>
              </div>

              {/* Photo comparison */}
              {mode === "split" ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <PhotoCard
                    title={`ANTES · ${fmtDate(oldA.created_at)}`}
                    src={oldA.signed[angle]}
                    accent={T.gold}
                    scores={oldA.scores}
                  />
                  <PhotoCard
                    title={`DEPOIS · ${fmtDate(newA.created_at)}`}
                    src={newA.signed[angle]}
                    accent={T.electric}
                    scores={newA.scores}
                  />
                </div>
              ) : (
                <OverlaySlider
                  beforeUrl={oldA.signed[angle]}
                  afterUrl={newA.signed[angle]}
                  beforeLabel={fmtDate(oldA.created_at)}
                  afterLabel={fmtDate(newA.created_at)}
                />
              )}

              {/* Score comparison table */}
              <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ background: T.surfaceHi, borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: ".08em", color: T.textDim }}>
                    EVOLUÇÃO DE SCORES APEX
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>
                    Geral: {overallBefore?.toFixed(2) ?? "—"} → {overallAfter?.toFixed(2) ?? "—"}
                    {overallDelta != null && (
                      <span style={{ marginLeft: 8, color: overallDelta > 0 ? T.green : overallDelta < 0 ? T.red : T.gray }}>
                        ({overallDelta > 0 ? "+" : ""}{overallDelta})
                      </span>
                    )}
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ color: T.textMuted, fontSize: 11 }}>
                      <th className="text-left px-4 py-2">Grupo Muscular</th>
                      <th className="text-right px-4 py-2">Antes</th>
                      <th className="text-right px-4 py-2">Atual</th>
                      <th className="text-right px-4 py-2">Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreRows.map((r) => {
                      const isMaxImprov = biggestImprov && biggestImprov.label === r.label && (r.delta ?? 0) > 0;
                      const isMaxRegress = biggestRegress && biggestRegress.label === r.label && (r.delta ?? 0) < 0;
                      return (
                        <tr key={r.label} style={{ borderTop: `1px solid ${T.border}` }}>
                          <td className="px-4 py-2" style={{ color: T.text }}>
                            {r.label}
                            {isMaxImprov && <span style={{ marginLeft: 8, fontSize: 10, color: T.green }}>★ MAIOR MELHORA</span>}
                            {isMaxRegress && <span style={{ marginLeft: 8, fontSize: 10, color: T.red }}>★ MAIOR REGRESSÃO</span>}
                          </td>
                          <td className="px-4 py-2 text-right" style={{ color: T.textDim }}>{r.before ?? "—"}</td>
                          <td className="px-4 py-2 text-right" style={{ color: T.text, fontWeight: 700 }}>{r.after ?? "—"}</td>
                          <td className="px-4 py-2 text-right" style={{
                            color: r.delta == null ? T.gray : r.delta > 0 ? T.green : r.delta < 0 ? T.red : T.gray,
                            fontWeight: 700,
                          }}>
                            {r.delta == null ? "—" : r.delta > 0 ? <span><TrendingUp className="inline w-3 h-3" /> +{r.delta}</span> : r.delta < 0 ? <span><TrendingDown className="inline w-3 h-3" /> {r.delta}</span> : <span><Minus className="inline w-3 h-3" /> 0</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Postural summary */}
              {posturalSummary && (
                <div className="rounded-xl p-5 space-y-2" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                  <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: ".08em", color: T.textDim }}>
                    RESUMO DE EVOLUÇÃO POSTURAL
                  </div>
                  <SummaryLine label="Corrigidas / reduzidas" items={posturalSummary.corrigidas} color={T.green} />
                  <SummaryLine label="Mantidas" items={posturalSummary.mantidas} color={T.gray} />
                  <SummaryLine label="Novas / regredidas" items={posturalSummary.novas} color={T.red} />
                  <div style={{ color: T.textDim, fontSize: 12, marginTop: 4 }}>
                    Tempo entre avaliações: <strong style={{ color: T.text }}>{semanasBetween} semanas</strong>
                  </div>
                  <div style={{
                    marginTop: 8, padding: 12, borderRadius: 8,
                    background: T.surfaceHi, color: T.text, fontStyle: "italic",
                    borderLeft: `3px solid ${overallDelta != null && overallDelta >= 0 ? T.green : T.red}`,
                  }}>
                    Em {semanasBetween} semanas, {athleteName}{" "}
                    {overallDelta != null && overallDelta >= 0 ? "evoluiu" : "regrediu"}{" "}
                    <strong>{Math.abs(overallDelta ?? 0).toFixed(2)} pontos</strong> no score APEX geral.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const selStyle: React.CSSProperties = {
  padding: "7px 10px", borderRadius: 8, background: T.surface,
  border: `1px solid ${T.border}`, color: T.text, fontSize: 12,
};

function PhotoCard({ title, src, accent, scores }: {
  title: string; src?: string; accent: string; scores: Record<string, number> | null;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${accent}55` }}>
      <div className="px-3 py-2 flex items-center justify-between" style={{ background: T.surfaceHi }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: accent }}>{title}</span>
        {scores && (
          <span style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>
            {avgScore(scores)?.toFixed(2) ?? "—"}
          </span>
        )}
      </div>
      <div className="aspect-[3/4] flex items-center justify-center" style={{ background: T.bg }}>
        {src ? (
          <img src={src} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div style={{ color: T.textMuted, fontSize: 12 }}>Sem foto neste ângulo</div>
        )}
      </div>
      {scores && (
        <div className="px-3 py-2 grid grid-cols-2 gap-1 text-[11px]" style={{ borderTop: `1px solid ${T.border}` }}>
          {Object.entries(scores).slice(0, 8).map(([k, v]) => (
            <div key={k} className="flex justify-between" style={{ color: T.textDim }}>
              <span className="truncate pr-2">{k}</span>
              <span style={{ color: T.text, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OverlaySlider({ beforeUrl, afterUrl, beforeLabel, afterLabel }: {
  beforeUrl?: string; afterUrl?: string; beforeLabel: string; afterLabel: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!ref.current || !dragging.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - r.left, r.width));
    setPos((x / r.width) * 100);
  };

  if (!beforeUrl || !afterUrl) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textMuted }}>
        Overlay indisponível: faltam fotos neste ângulo em uma das análises.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative w-full max-w-2xl mx-auto aspect-[3/4] rounded-xl overflow-hidden cursor-col-resize select-none"
      style={{ background: T.bg, border: `1px solid ${T.border}` }}
      onMouseDown={() => { dragging.current = true; }}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchStart={() => { dragging.current = true; }}
      onTouchEnd={() => { dragging.current = false; }}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      <img src={afterUrl} alt="Depois" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={beforeUrl}
          alt="Antes"
          className="absolute inset-0 h-full object-cover"
          style={{ width: `${ref.current?.offsetWidth || 600}px`, maxWidth: "none" }}
        />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5" style={{ left: `${pos}%`, background: T.electric, boxShadow: `0 0 10px ${T.electric}` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: T.electric, color: T.bg }}>
          ⇆
        </div>
      </div>
      <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold" style={{ background: `${T.gold}cc`, color: T.bg }}>ANTES · {beforeLabel}</div>
      <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold" style={{ background: `${T.electric}cc`, color: T.bg }}>DEPOIS · {afterLabel}</div>
    </div>
  );
}

function SummaryLine({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div style={{ fontSize: 13 }}>
      <span style={{ color, fontWeight: 700 }}>{label}: </span>
      <span style={{ color: T.text }}>{items.length ? items.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" · ") : "—"}</span>
    </div>
  );
}
