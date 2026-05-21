import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, ChevronDown, BookOpen, Link2, Eye, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { CYCLE_PHASE_INFO, type CyclePhase } from "@/lib/feminine";

// ─── Types ───────────────────────────────────────────────────────
export type Landmark = { x: number; y: number; label: string };
export type AngleData = { value: number; unit: string; normal: string; finding: string };
export type LandmarkView = {
  view: "front" | "lateral" | "back";
  landmarks: Record<string, Landmark>;
  angles: Record<string, AngleData>;
};
export type LandmarkBundle = Partial<Record<"front" | "lateral" | "back", LandmarkView>>;
export type PhotoBundle = Partial<Record<"front" | "lateral" | "back", string>>;

// ─── Tokens (APEX dark identity) ─────────────────────────────────
const C = {
  gold: "#B8922A",
  cyan: "#00D4FF",
  red: "#FF3344",
  green: "#1DB87A",
  yellow: "#FFB800",
  white: "#FFFFFF",
  dark: "#1A1A2E",
};

// ─── Helpers ─────────────────────────────────────────────────────
const isValidPoint = (p?: Landmark | null) =>
  !!p && Number.isFinite(p.x) && Number.isFinite(p.y) && !(p.x === 0 && p.y === 0);

function isWithinNormal(value: number, normal: string): boolean {
  if (!normal) return true;
  const s = normal.replace(/[^\d.<>\-]/g, "").trim();
  if (s.startsWith("<")) return Math.abs(value) < parseFloat(s.slice(1));
  if (s.startsWith(">")) return Math.abs(value) > parseFloat(s.slice(1));
  if (s.includes("-")) {
    const [lo, hi] = s.split("-").map(parseFloat);
    return value >= lo && value <= hi;
  }
  const single = parseFloat(s);
  if (Number.isNaN(single)) return true;
  return Math.abs(value - single) <= 2;
}

function normalLimit(normal: string): number {
  const s = (normal || "").replace(/[^\d.<>\-]/g, "").trim();
  if (s.startsWith("<") || s.startsWith(">")) return parseFloat(s.slice(1)) || 5;
  if (s.includes("-")) {
    const [, hi] = s.split("-").map(parseFloat);
    return hi || 5;
  }
  const v = parseFloat(s);
  return Number.isNaN(v) ? 5 : Math.max(v, 2);
}

function severityOf(value: number, normal: string): "ok" | "alt" | "sev" {
  if (isWithinNormal(value, normal)) return "ok";
  const limit = normalLimit(normal);
  return Math.abs(value) >= limit * 1.5 ? "sev" : "alt";
}

const FRIENDLY: Record<string, string> = {
  shoulder_tilt: "Inclinação de ombros",
  hip_tilt: "Inclinação de quadril",
  knee_valgus_left: "Valgo joelho E",
  knee_valgus_right: "Valgo joelho D",
  head_lateral_tilt: "Inclinação lateral da cabeça",
  forward_head_posture: "Cabeça anteriorizada",
  thoracic_kyphosis: "Cifose torácica",
  lumbar_lordosis: "Lordose lombar",
  pelvic_tilt: "Tilt pélvico",
  plumb_line_deviation: "Desvio da linha de prumo",
  shoulder_asymmetry: "Assimetria de ombros",
  scapular_winging_left: "Escápula alada E",
  scapular_winging_right: "Escápula alada D",
  spinal_lateral_deviation: "Desvio lateral da coluna",
  hip_asymmetry: "Assimetria de quadril",
  scapular_axis_tilt: "Eixo escapular",
};

// Anatomical hierarchy
const PRIMARY = new Set([
  "shoulder_left", "shoulder_right", "hip_left", "hip_right",
  "knee_left", "knee_right", "ankle_left", "ankle_right",
  "ear", "ear_left", "ear_right",
  "shoulder", "hip_greater_trochanter", "knee_lateral", "ankle_lateral",
]);

// Directional arrow based on angle key + value sign
function directionArrow(key: string, value: number): string {
  const v = value;
  if (key.includes("tilt") || key.includes("asymmetry") || key.includes("axis")) {
    if (Math.abs(v) < 0.5) return "";
    return v > 0 ? " ↑D" : " ↑E";
  }
  if (key.includes("valgus_left")) return v > 0 ? " →D" : "";
  if (key.includes("valgus_right")) return v > 0 ? " →E" : "";
  if (key.includes("deviation") || key.includes("lateral")) {
    if (Math.abs(v) < 0.3) return "";
    return v > 0 ? " →D" : " →E";
  }
  return "";
}

function colorBySev(sev: "ok" | "alt" | "sev"): string {
  return sev === "sev" ? C.red : sev === "alt" ? C.yellow : C.green;
}

// ─── Landmark severity (4-level: normal | mild | moderate | severe) ─
type LmSev = "normal" | "mild" | "moderate" | "severe";

function severity4(value: number, normal: string): LmSev {
  if (isWithinNormal(value, normal)) return "normal";
  const limit = normalLimit(normal);
  const ratio = Math.abs(value) / (limit || 1);
  if (ratio >= 1.5) return "severe";
  if (ratio >= 1.25) return "moderate";
  return "mild";
}

// Mapeamento landmark → angle keys que o implicam clinicamente
const LANDMARK_ANGLES: Record<string, string[]> = {
  shoulder_left: ["shoulder_tilt", "shoulder_asymmetry"],
  shoulder_right: ["shoulder_tilt", "shoulder_asymmetry"],
  hip_left: ["hip_tilt", "hip_asymmetry", "pelvic_tilt"],
  hip_right: ["hip_tilt", "hip_asymmetry", "pelvic_tilt"],
  knee_left: ["knee_valgus_left"],
  knee_right: ["knee_valgus_right"],
  ankle_left: ["knee_valgus_left"],
  ankle_right: ["knee_valgus_right"],
  ear: ["forward_head_posture", "head_lateral_tilt"],
  ear_left: ["head_lateral_tilt", "forward_head_posture"],
  ear_right: ["head_lateral_tilt", "forward_head_posture"],
  shoulder: ["thoracic_kyphosis", "forward_head_posture"],
  hip_greater_trochanter: ["pelvic_tilt", "lumbar_lordosis"],
  knee_lateral: ["plumb_line_deviation"],
  ankle_lateral: ["plumb_line_deviation"],
  spine_c7: ["spinal_lateral_deviation", "scapular_axis_tilt"],
  spine_l5: ["spinal_lateral_deviation", "lumbar_lordosis"],
  scapula_left: ["scapular_winging_left", "scapular_axis_tilt"],
  scapula_right: ["scapular_winging_right", "scapular_axis_tilt"],
};

const SEV_RANK: Record<LmSev, number> = { normal: 0, mild: 1, moderate: 2, severe: 3 };

function landmarkSeverity(id: string, ang: Record<string, { value: number; normal: string }>): LmSev {
  const keys = LANDMARK_ANGLES[id];
  if (!keys || !keys.length) return "normal";
  let worst: LmSev = "normal";
  for (const k of keys) {
    const a = ang[k];
    if (!a) continue;
    const s = severity4(a.value, a.normal);
    if (SEV_RANK[s] > SEV_RANK[worst]) worst = s;
  }
  return worst;
}

function landmarkColor(sev: LmSev): { fill: string; stroke: string; pulse: boolean } {
  switch (sev) {
    case "severe":   return { fill: "#E24B4A", stroke: "#E24B4A",   pulse: true  };
    case "moderate": return { fill: "#EF9F27", stroke: "#EF9F2780", pulse: false };
    case "mild":     return { fill: "#B8922A", stroke: "#B8922A80", pulse: false };
    default:         return { fill: "#1D9E75", stroke: "#1D9E7580", pulse: false };
  }
}

// Educational tags per landmark
const EDU: Record<string, { reveals: string; dom?: string; inh?: string }> = {
  shoulder_left: { reveals: "Inclinação e protração", dom: "Trapézio superior E", inh: "Serrátil anterior E" },
  shoulder_right: { reveals: "Inclinação e protração", dom: "Trapézio superior D", inh: "Serrátil anterior D" },
  hip_left: { reveals: "Nivelamento pélvico", dom: "QL E", inh: "Glúteo médio D" },
  hip_right: { reveals: "Nivelamento pélvico", dom: "QL D", inh: "Glúteo médio E" },
  knee_left: { reveals: "Alinhamento femoro-tibial", inh: "Glúteo médio E" },
  knee_right: { reveals: "Alinhamento femoro-tibial", inh: "Glúteo médio D" },
  ankle_left: { reveals: "Pronação/supinação" },
  ankle_right: { reveals: "Pronação/supinação" },
  ear: { reveals: "Posição cervical / FHP", dom: "Suboccipitais", inh: "Flexores cervicais profundos" },
  shoulder: { reveals: "Cifose / protração", dom: "Peitoral menor", inh: "Romboides" },
  hip_greater_trochanter: { reveals: "Tilt pélvico", dom: "Iliopsoas", inh: "Glúteo máximo" },
};

// ─── Component ───────────────────────────────────────────────────
interface Props {
  landmarks: LandmarkBundle;
  photos: PhotoBundle;
  athleteName?: string;
  category?: string;
  sex?: string | null;
  cyclePhase?: CyclePhase | null;
  cycleDay?: number | null;
  feminineCategory?: string | null;
}

export default function ApexVisualOverlay({ landmarks, photos, athleteName, category, sex, cyclePhase, cycleDay, feminineCategory }: Props) {
  const isF = String(sex || "").toLowerCase().match(/^(f|feminino|female)$/);
  const phaseInfo = isF && cyclePhase ? CYCLE_PHASE_INFO[cyclePhase] : null;
  const availableViews = (["front", "lateral", "back"] as const).filter(
    (v) => landmarks[v] || photos[v]
  );
  const [view, setView] = useState<"front" | "lateral" | "back">(availableViews[0] || "front");
  const [selected, setSelected] = useState<string | null>(null);
  const [eduMode, setEduMode] = useState<boolean>(() => {
    try { return localStorage.getItem("apex-edu-mode") === "1"; } catch { return false; }
  });
  const [chainMode, setChainMode] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [gridMode, setGridMode] = useState<boolean>(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [pdfPayload, setPdfPayload] = useState<null | {
    overlayDataUrl: string | null;
    geradoEm: Date;
  }>(null);

  // ── Ajuste manual do prumo (por vista) ─────────────────────────
  const [manualMode, setManualMode] = useState(false);
  const [showPlumbInstruction, setShowPlumbInstruction] = useState(false);
  const [manualPlumb, setManualPlumb] = useState<Record<"front" | "lateral" | "back", number | null>>({
    front: null, lateral: null, back: null,
  });
  const instructionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Overlay rect tracking: corrige offset do object-fit: contain ──
  const photoWrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgRect, setImgRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const recompute = () => {
      const wrap = photoWrapperRef.current;
      const img = imgRef.current;
      if (!wrap || !img) return;
      const cw = wrap.clientWidth;
      const ch = wrap.clientHeight;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (!cw || !ch || !nw || !nh) return;
      const scale = Math.min(cw / nw, ch / nh);
      const width = nw * scale;
      const height = nh * scale;
      const left = (cw - width) / 2;
      const top = (ch - height) / 2;
      setImgRect({ left, top, width, height });
    };
    recompute();
    const img = imgRef.current;
    img?.addEventListener("load", recompute);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(recompute) : null;
    if (ro && photoWrapperRef.current) ro.observe(photoWrapperRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      img?.removeEventListener("load", recompute);
      ro?.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [view, photos]);

  useEffect(() => {
    try { localStorage.setItem("apex-edu-mode", eduMode ? "1" : "0"); } catch {}
  }, [eduMode]);

  const data = landmarks[view];
  const photoUrl = photos[view];

  // Qualidade da linha de prumo da vista atual (para badge nos achados)
  const currentPlumb = useMemo<PlumbLine | null>(() => {
    if (!data?.landmarks) return null;
    const snapped = snapToPlumbLine(data.landmarks, 100);
    const base = calcPlumbLine(snapped as any, 100, 100);
    const override = manualPlumb[view];
    if (typeof override === "number") {
      return { ...base, x1: override, x2: override, axisX: override };
    }
    return base;
  }, [data, manualPlumb, view]);



  // Compute scapular axis (back view) augmentation
  const augmentedAngles = useMemo(() => {
    if (!data) return {} as Record<string, AngleData>;
    const out: Record<string, AngleData> = { ...data.angles };
    if (data.view === "back") {
      const sL = data.landmarks.scapula_left;
      const sR = data.landmarks.scapula_right;
      if (isValidPoint(sL) && isValidPoint(sR)) {
        const dx = sR.x - sL.x;
        const dy = sR.y - sL.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        out.scapular_axis_tilt = {
          value: Math.round(angle * 10) / 10,
          unit: "graus",
          normal: "<2°",
          finding: Math.abs(angle) > 2
            ? `Assimetria escapular indica possível inibição do serrátil anterior ${angle > 0 ? "E" : "D"} e dominância do trapézio superior ${angle > 0 ? "D" : "E"}.`
            : "Eixo escapular dentro do normal.",
        };
      }
      // FIX 3 — Spine deviation calculado de C7→L5 (com snap anatômico)
      // C7 e L5 são âncoras do prumo: sem landmarks torácicos intermediários,
      // o desvio lateral é 0° por definição. Escoliose funcional só pode ser
      // medida com pontos torácicos intermediários (T1–T12).
      const snappedSpine = snapToPlumbLine(data.landmarks, 100);
      const c7 = snappedSpine.spine_c7;
      const l5 = snappedSpine.spine_l5;
      if (isValidPoint(c7) && isValidPoint(l5)) {
        const dx = l5.x - c7.x;
        const dy = l5.y - c7.y;
        // ângulo em relação à vertical (linha perfeita = 0°)
        const deg = Math.atan2(dx, dy) * (180 / Math.PI);
        const v = Math.round(deg * 10) / 10;
        out.spinal_lateral_deviation = {
          value: v,
          unit: "graus",
          normal: "<1°",
          finding: Math.abs(v) > 1
            ? `Coluna desviada ${Math.abs(v)}° para ${v > 0 ? "direita" : "esquerda"}. Avaliar escoliose funcional vs estrutural.`
            : "Coluna alinhada no eixo de prumo C7→L5 (âncoras anatômicas). ✓",
        };
      }
    }
    return out;
  }, [data]);

  const findings = useMemo(() => {
    if (!data) return [];
    return Object.entries(augmentedAngles)
      .map(([k, a]) => ({
        key: k,
        label: FRIENDLY[k] || k,
        value: a.value,
        unit: a.unit,
        normal: a.normal,
        finding: a.finding,
        arrow: directionArrow(k, a.value),
        sev: severityOf(a.value, a.normal),
      }))
      .sort((a, b) => {
        const order = { sev: 0, alt: 1, ok: 2 } as const;
        return order[a.sev] - order[b.sev];
      });
  }, [augmentedAngles, data]);

  const counts = useMemo(() => {
    const c = { sev: 0, alt: 0, ok: 0 };
    findings.forEach((f) => c[f.sev]++);
    return c;
  }, [findings]);

  // MELHORIA 2 — qualidade da análise da vista atual
  const quality = useMemo(() => {
    if (!data) return { total: 0, valid: 0, ratio: 0 };
    const entries = Object.values(data.landmarks);
    const total = entries.length;
    const valid = entries.filter(isValidPoint).length;
    return { total, valid, ratio: total > 0 ? valid / total : 0 };
  }, [data]);

  // MELHORIA 3 — severidade resumida por vista
  const viewSeverity = useMemo(() => {
    const out: Record<"front" | "lateral" | "back", { count: number; worst: "ok" | "alt" | "sev" }> = {
      front: { count: 0, worst: "ok" },
      lateral: { count: 0, worst: "ok" },
      back: { count: 0, worst: "ok" },
    };
    (["front", "lateral", "back"] as const).forEach((v) => {
      const d = landmarks[v];
      if (!d) return;
      const angs = Object.values(d.angles);
      let worst: "ok" | "alt" | "sev" = "ok";
      let count = 0;
      angs.forEach((a) => {
        const s = severityOf(a.value, a.normal);
        if (s !== "ok") count++;
        if (s === "sev") worst = "sev";
        else if (s === "alt" && worst !== "sev") worst = "alt";
      });
      out[v] = { count, worst };
    });
    return out;
  }, [landmarks]);

  // Detected kinetic chains (simple heuristic)
  const chains = useMemo(() => {
    const out: { name: string; nodes: string[]; description: string }[] = [];
    if (!data) return out;
    const a = augmentedAngles;
    if (data.view === "front") {
      const shoBad = (a.shoulder_tilt && !isWithinNormal(a.shoulder_tilt.value, a.shoulder_tilt.normal));
      const hipBad = (a.hip_tilt && !isWithinNormal(a.hip_tilt.value, a.hip_tilt.normal));
      if (shoBad && hipBad) {
        out.push({
          name: "Síndrome Cruzada Lateral",
          nodes: ["shoulder_left", "shoulder_right", "hip_left", "hip_right"],
          description: "QL dominante de um lado → elevação de quadril → compensação contralateral de ombro → desequilíbrio do glúteo médio.",
        });
      }
    }
    if (data.view === "back") {
      const scapBad = a.scapular_axis_tilt && !isWithinNormal(a.scapular_axis_tilt.value, a.scapular_axis_tilt.normal);
      const spineBad = a.spinal_lateral_deviation && !isWithinNormal(a.spinal_lateral_deviation.value, a.spinal_lateral_deviation.normal);
      if (scapBad || spineBad) {
        out.push({
          name: "Síndrome Cruzada Superior",
          nodes: ["shoulder_left", "scapula_left", "spine_c7", "spine_l5", "scapula_right", "shoulder_right"],
          description: "Trapézio superior dominante → protração escapular → rotação de tronco → compensação lombar.",
        });
      }
    }
    if (data.view === "lateral") {
      const fhp = a.forward_head_posture && !isWithinNormal(a.forward_head_posture.value, a.forward_head_posture.normal);
      const kyph = a.thoracic_kyphosis && !isWithinNormal(a.thoracic_kyphosis.value, a.thoracic_kyphosis.normal);
      if (fhp || kyph) {
        out.push({
          name: "Upper Crossed Syndrome",
          nodes: ["ear", "shoulder", "hip_greater_trochanter"],
          description: "Peitoral menor + suboccipitais encurtados / flexores cervicais profundos + romboides inibidos.",
        });
      }
    }
    return out;
  }, [augmentedAngles, data]);

  if (availableViews.length === 0) {
    return (
      <div className="rounded-xl p-6 border bg-card text-center">
        <div className="text-sm text-muted-foreground">
          Análise de landmarks não disponível nesta análise. Gere uma nova análise para visualizar.
        </div>
      </div>
    );
  }

  const handleExport = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 3,
        backgroundColor: "#03040A",
        useCORS: true,
        allowTaint: true,
        windowWidth: 1400,
      });
      const link = document.createElement("a");
      link.download = `apex-visual-${athleteName || "atleta"}-${view}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("export error", e);
    } finally {
      setExporting(false);
    }
  };

  // ── Exportação PDF profissional 100% vetorial (jsPDF puro) ─────
  const generateApexPDF = async () => {
    setExportingPDF(true);
    try {
      const { generateApexPDF: generate } = await import("@/utils/apexPDFGenerator");
      const qualityScore = data?.landmarks ? calcAnalysisQuality(data.landmarks as any).score : undefined;
      const achados = findings.map((f): import("@/utils/apexPDFGenerator").AchadoClinico => {
        const dom = EDU[anchorLandmark(view, f.key)]?.dom;
        const inh = EDU[anchorLandmark(view, f.key)]?.inh;
        return {
          titulo: f.label,
          graus: typeof f.value === "number" ? f.value : 0,
          dominante: dom,
          inibido: inh,
          correcao: f.finding || CORRECTION_MAP[f.key] || "Avaliar correção postural específica.",
          severityColor: f.sev === "sev" ? "#EF4444" : f.sev === "alt" ? "#FBBF24" : "#34D399",
        };
      });
      await generate({
        atleta: {
          nome: athleteName,
          categoria: category,
        },
        achados,
        qualityScore,
        plumbSource: currentPlumb?.source,
      });
      toast("PDF gerado com sucesso.");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExportingPDF(false);
    }
  };

  // ── Sugestão de onde clicar para alinhar o prumo (coords 0..100) ──
  const plumbSuggestion = useMemo<{ x: number; y: number; label: string }>(() => {
    const lm = data?.landmarks || ({} as Record<string, Landmark>);
    if (view === "front") {
      const sL = (lm as any).shoulder_left;
      const sR = (lm as any).shoulder_right;
      const x = isValidPoint(sL) && isValidPoint(sR) ? (sL.x + sR.x) / 2 : 50;
      const y = isValidPoint(sL) && isValidPoint(sR) ? (sL.y + sR.y) / 2 + 4 : 24;
      return { x, y, label: "Clique no centro do esterno, entre os dois ombros" };
    }
    if (view === "lateral") {
      const ear = (lm as any).ear ?? (lm as any).ear_left ?? (lm as any).ear_right;
      const ankle = (lm as any).ankle_lateral;
      if (isValidPoint(ear)) return { x: ear.x, y: ear.y, label: "Clique no lóbulo da orelha ou centro do tornozelo" };
      if (isValidPoint(ankle)) return { x: ankle.x, y: ankle.y, label: "Clique no lóbulo da orelha ou centro do tornozelo" };
      return { x: 50, y: 12, label: "Clique no lóbulo da orelha ou centro do tornozelo" };
    }
    const sL = (lm as any).shoulder_left;
    const sR = (lm as any).shoulder_right;
    const c7 = (lm as any).spine_c7;
    if (isValidPoint(c7)) return { x: c7.x, y: c7.y, label: "Clique no ponto central entre os dois ombros, na base do pescoço" };
    if (isValidPoint(sL) && isValidPoint(sR)) {
      return { x: (sL.x + sR.x) / 2, y: Math.min(sL.y, sR.y) - 2, label: "Clique no ponto central entre os dois ombros, na base do pescoço" };
    }
    return { x: 50, y: 15, label: "Clique no ponto central entre os dois ombros, na base do pescoço" };
  }, [view, data]);

  const activateManualMode = () => {
    if (manualMode) {
      setManualMode(false);
      setShowPlumbInstruction(false);
      if (instructionTimerRef.current) clearTimeout(instructionTimerRef.current);
      return;
    }
    setManualMode(true);
    setShowPlumbInstruction(true);
    if (instructionTimerRef.current) clearTimeout(instructionTimerRef.current);
    instructionTimerRef.current = setTimeout(() => setShowPlumbInstruction(false), 3000);
  };

  useEffect(() => () => { if (instructionTimerRef.current) clearTimeout(instructionTimerRef.current); }, []);

  const handlePlumbClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!manualMode || !imgRect) return;
    if (showPlumbInstruction) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const xInImg = ((cx - imgRect.left) / imgRect.width) * 100;
    const clamped = Math.max(0, Math.min(100, xInImg));
    setManualPlumb((prev) => ({ ...prev, [view]: clamped }));
    setManualMode(false);
    const distPct = Math.abs(clamped - plumbSuggestion.x);
    if (distPct > 20) {
      toast("Prumo ajustado. Você pode reajustar clicando em ⊕ novamente.");
    }
  };


  return (
    <div className="space-y-4">
      <style>{`
        @keyframes apex-chain-dash { to { stroke-dashoffset: -20; } }
        .apex-chain-line { animation: apex-chain-dash 1.2s linear infinite; }
        @keyframes landmarkPulse {
          0%   { r: 1.1; opacity: 1; }
          50%  { r: 1.8; opacity: 0.55; }
          100% { r: 1.1; opacity: 1; }
        }
        .apex-landmark-pulse { animation: landmarkPulse 1.5s ease-in-out infinite; transform-origin: center; }
      `}</style>

      {/* Header / toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(["front", "lateral", "back"] as const).map((v) => {
            const enabled = availableViews.includes(v);
            const labelMap = { front: "Frente", lateral: "Lateral", back: "Costas" };
            return (
              <button
                key={v}
                disabled={!enabled}
                onClick={() => { setView(v); setSelected(null); }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: view === v ? `${C.gold}22` : "transparent",
                  borderColor: view === v ? C.gold : "hsl(var(--border))",
                  color: view === v ? C.gold : "hsl(var(--muted-foreground))",
                }}
              >
                {labelMap[v]}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setEduMode((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
            style={{
              borderColor: eduMode ? C.cyan : "hsl(var(--border))",
              color: eduMode ? C.cyan : "hsl(var(--muted-foreground))",
              background: eduMode ? `${C.cyan}1A` : "transparent",
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Modo Educação
          </button>
          <button
            onClick={() => setChainMode((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
            style={{
              borderColor: chainMode ? C.red : "hsl(var(--border))",
              color: chainMode ? C.red : "hsl(var(--muted-foreground))",
              background: chainMode ? `${C.red}1A` : "transparent",
            }}
          >
            <Link2 className="w-3.5 h-3.5" />
            Cadeia Cinética
          </button>
          <button
            onClick={() => setGridMode((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
            style={{
              borderColor: gridMode ? C.gold : "hsl(var(--border))",
              color: gridMode ? C.gold : "hsl(var(--muted-foreground))",
              background: gridMode ? `${C.gold}1A` : "transparent",
            }}
            title="Exibe arcos goniométricos sobre cada linha de análise"
          >
            📐 Grade simetrográfica
          </button>
          <button
            onClick={() => setDebugMode((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
            style={{
              borderColor: debugMode ? "#FF00FF" : "hsl(var(--border))",
              color: debugMode ? "#FF00FF" : "hsl(var(--muted-foreground))",
              background: debugMode ? "#FF00FF1A" : "transparent",
            }}
            title="Mostra caixas de colisão e zona da silhueta"
          >
            🐛 Debug
          </button>
          <button
            onClick={activateManualMode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
            style={{
              borderColor: manualMode ? C.gold : "hsl(var(--border))",
              color: manualMode ? C.gold : "hsl(var(--muted-foreground))",
              background: manualMode ? `${C.gold}1A` : "transparent",
            }}
            title="Ajustar manualmente a Linha de Prumo"
          >
            <Crosshair className="w-3.5 h-3.5" />
            ⊕ Ajustar Prumo
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border hover:bg-muted disabled:opacity-50"
            style={{ borderColor: C.gold, color: C.gold }}
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exportando..." : "Exportar"}
          </button>
          <button
            onClick={generateApexPDF}
            disabled={exportingPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border hover:bg-muted disabled:opacity-50"
            style={{
              borderColor: C.gold,
              color: C.gold,
              background: exportingPDF ? `${C.gold}26` : `${C.gold}1A`,
            }}
            title="Gerar relatório PDF completo (foto anotada + achados + prescrição)"
          >
            {exportingPDF ? (
              <>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, display: "inline-block", animation: "apex-chain-dash 1s infinite" }} />
                Gerando PDF...
              </>
            ) : (
              <>↓ Exportar PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Counter strip */}
      <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap">
        <span style={{ color: C.red }}>● {counts.sev} críticos</span>
        <span style={{ color: C.yellow }}>● {counts.alt} limítrofes</span>
        <span style={{ color: C.green }}>● {counts.ok} normais</span>
        {phaseInfo && (
          <span
            className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold"
            style={{ borderColor: `${phaseInfo.color}66`, color: phaseInfo.color, background: phaseInfo.bg }}
            title={`Análise contextualizada para fase ${phaseInfo.label}${cycleDay ? ` (dia ${cycleDay})` : ""}${feminineCategory ? ` · ${feminineCategory}` : ""}`}
          >
            {phaseInfo.emoji} {phaseInfo.label}{cycleDay ? ` · d${cycleDay}` : ""}
            {feminineCategory ? ` · ${feminineCategory}` : ""}
          </span>
        )}
      </div>

      {/* Main grid */}
      <div ref={exportRef} className="grid lg:grid-cols-[1fr_340px] gap-4 bg-card rounded-xl p-3 border relative">
        {/* Watermark / footer for export */}
        <div className="absolute top-2 right-3 text-[10px] font-bold tracking-widest opacity-60" style={{ color: C.gold }}>
          nutriON · APEX
        </div>

        {/* Photo + overlay */}
        <div
          className="relative rounded-lg overflow-hidden bg-black"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            width: "100%",
            height: 640,
            minHeight: 360,
          }}
        >
          {photoUrl ? (
            <div
              ref={photoWrapperRef}
              onClick={handlePlumbClick}
              className="relative"
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: manualMode && !showPlumbInstruction ? "crosshair" : "default",
              }}
            >
              <img
                ref={imgRef}
                src={photoUrl}
                alt={`Foto ${view}`}
                crossOrigin="anonymous"
                className="apex-photo"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center center",
                }}
              />
              {data && imgRect && (
                <div
                  style={{
                    position: "absolute",
                    top: imgRect.top,
                    left: imgRect.left,
                    width: imgRect.width,
                    height: imgRect.height,
                    pointerEvents: "none",
                  }}
                >
                  <OverlayLayer
                    data={{ ...data, angles: augmentedAngles }}
                    selected={selected}
                    onSelect={setSelected}
                    eduMode={eduMode}
                    chainMode={chainMode}
                    debugMode={debugMode}
                    gridMode={gridMode}
                    chains={chains}
                    plumbXOverride={manualPlumb[view]}
                  />
                  {/* Pulse de sugestão durante o modo manual */}
                  {manualMode && !showPlumbInstruction && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
                      <style>{`@keyframes apexPlumbPulse {0%{r:2;opacity:.9}50%{r:4;opacity:.35}100%{r:2;opacity:.9}}`}</style>
                      <circle cx={plumbSuggestion.x} cy={plumbSuggestion.y} r={3} fill="none" stroke="#B8922A" strokeWidth={0.6} vectorEffect="non-scaling-stroke" style={{ animation: "apexPlumbPulse 1.4s ease-in-out infinite", transformOrigin: "center" }} />
                      <circle cx={plumbSuggestion.x} cy={plumbSuggestion.y} r={0.7} fill="#B8922A" />
                    </svg>
                  )}
                </div>
              )}
              {/* Overlay de instrução do prumo */}
              {manualMode && showPlumbInstruction && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center p-4"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="max-w-xs w-full rounded-xl p-5 text-center"
                    style={{ background: "rgba(10,10,18,0.95)", border: `1px solid ${C.gold}` }}
                  >
                    <div className="text-xs font-bold tracking-widest mb-2" style={{ color: C.gold }}>🎯 ALINHE O PRUMO</div>
                    <div className="text-sm text-white/90 mb-3">{plumbSuggestion.label}</div>
                    <svg viewBox="0 0 60 80" className="mx-auto mb-3" style={{ width: 70, height: 90 }}>
                      <ellipse cx={30} cy={12} rx={7} ry={8} fill="none" stroke="#B8922A" strokeWidth={1.2} />
                      <path d={`M18 22 Q30 18 42 22 L40 55 L34 78 L30 60 L26 78 L20 55 Z`} fill="none" stroke="#B8922A" strokeWidth={1.2} />
                      <circle cx={30} cy={22} r={2.5} fill="#B8922A">
                        <animate attributeName="r" values="2.5;4;2.5" dur="1.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;.4;1" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                    <button
                      onClick={() => {
                        setShowPlumbInstruction(false);
                        if (instructionTimerRef.current) clearTimeout(instructionTimerRef.current);
                      }}
                      className="px-4 py-1.5 rounded-md text-xs font-bold"
                      style={{ background: C.gold, color: "#0a0a12" }}
                    >
                      Entendi
                    </button>
                  </div>
                </div>
              )}
              {/* MELHORIA 2 — Quality badge */}
              {data && (
                <div
                  className="absolute top-2 left-2 text-[10px] font-mono font-bold rounded px-2 py-1 z-10"
                  style={{
                    background: "rgba(0,0,0,0.75)",
                    border: `1px solid ${quality.ratio >= 0.8 ? C.green : quality.ratio >= 0.5 ? C.yellow : C.red}`,
                    color: quality.ratio >= 0.8 ? C.green : quality.ratio >= 0.5 ? C.yellow : C.red,
                  }}
                >
                  {quality.ratio >= 0.8 ? "🟢" : quality.ratio >= 0.5 ? "🟡" : "🔴"}{" "}
                  {quality.ratio >= 0.8
                    ? `Análise completa — ${quality.valid} landmarks`
                    : quality.ratio >= 0.5
                    ? `Análise parcial — ${quality.valid}/${quality.total}`
                    : `Reprocessar — ${quality.valid}/${quality.total}`}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground p-6 text-center">
              Foto da vista <strong>{view}</strong> não disponível.
            </div>
          )}
          {/* Footer caption (visible in export) */}
          <div className="absolute bottom-1 left-2 text-[10px] text-white/60 font-mono">
            {athleteName || "Atleta"} · {category || "—"}{phaseInfo ? ` · ${phaseInfo.emoji} ${phaseInfo.label}${cycleDay ? ` d${cycleDay}` : ""}` : ""} · {new Date().toLocaleDateString("pt-BR")}
          </div>
        </div>

        {/* Findings panel */}
        <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
          {/* MELHORIA 3 — Mini-mapa de severidade */}
          <div className="flex items-center justify-around gap-2 p-2 rounded-lg border bg-background/30">
            {(["front", "lateral", "back"] as const).map((v) => {
              const s = viewSeverity[v];
              const c = s.worst === "sev" ? C.red : s.worst === "alt" ? C.yellow : C.green;
              const enabled = !!landmarks[v];
              const labelMap = { front: "Frente", lateral: "Lateral", back: "Costas" };
              return (
                <button
                  key={v}
                  disabled={!enabled}
                  onClick={() => { setView(v); setSelected(null); }}
                  className="flex flex-col items-center gap-1 disabled:opacity-30"
                  title={`${labelMap[v]}: ${s.count} achados`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all"
                    style={{
                      background: `${c}22`,
                      border: `2px solid ${c}`,
                      color: c,
                      boxShadow: view === v ? `0 0 0 2px ${C.gold}` : "none",
                    }}
                  >
                    {s.count}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{labelMap[v]}</div>
                </button>
              );
            })}
          </div>

          {/* FIX 5 — Debug raw JSON (dev only) */}
          {import.meta.env.DEV && data && (
            <details className="rounded border border-dashed border-muted-foreground/40 p-1.5">
              <summary className="text-[9px] font-mono text-muted-foreground cursor-pointer">🐛 DEV: JSON bruto IA × parseado</summary>
              <pre className="text-[8px] mt-1 max-h-40 overflow-auto opacity-80">{JSON.stringify({ raw_angles: data.angles, parsed_findings: findings.map(f => ({ key: f.key, value: f.value, normal: f.normal, sev: f.sev })) }, null, 2)}</pre>
            </details>
          )}

          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 pt-1">
            Achados clínicos ({findings.length})
          </div>
          {currentPlumb && (() => {
            const s = currentPlumb.source;
            const cfg = s === "C7+L5"
              ? { bg: "#064E3B", fg: "#6EE7B7", text: "📐 Prumo ancorado em C7/L5" }
              : s === "frame-center"
              ? { bg: "#7F1D1D", fg: "#FCA5A5", text: "✕ Prumo estimado — reenviar foto de costas" }
              : { bg: "#78350F", fg: "#FCD34D", text: `⚠ Prumo parcial (${s} apenas)` };
            return (
              <div
                className="inline-block mb-1.5"
                style={{
                  background: cfg.bg, color: cfg.fg,
                  fontSize: 10, padding: "2px 8px",
                  borderRadius: 4, fontFamily: "ui-monospace, monospace",
                }}
                title={`Eixo X = ${currentPlumb.axisX.toFixed(2)}% · fonte: ${s}`}
              >
                {cfg.text}
              </div>
            );
          })()}
          {data?.landmarks && (() => {
            const q = calcAnalysisQuality(data.landmarks as any);
            const pct = Math.round(q.score * 100);
            return (
              <div
                className="inline-flex items-center gap-1 ml-1.5 mb-1.5"
                style={{
                  fontSize: 10, color: q.color,
                  padding: "2px 8px", borderRadius: 4,
                  background: `${q.color}18`,
                  fontFamily: "ui-monospace, monospace",
                }}
                title="Confiança média estimada (heurística por landmark)"
              >
                ◉ {q.label} — {pct}%
              </div>
            );
          })()}
          {findings.length === 0 && (
            <div className="text-xs text-muted-foreground">Nenhum ângulo retornado.</div>
          )}
          {findings.map((f) => {
            const color = colorBySev(f.sev);
            const icon = f.sev === "sev" ? "🔴" : f.sev === "alt" ? "🟡" : "🟢";
            const active = selected === f.key;
            const unit = f.unit?.includes("graus") ? "°" : f.unit?.includes("cm") ? "cm" : "";
            return (
              <div
                key={f.key}
                className="rounded-lg border transition-all"
                style={{
                  background: active ? `${color}1A` : "transparent",
                  borderColor: active ? color : "hsl(var(--border))",
                }}
              >
                <button
                  onClick={() => setSelected(active ? null : f.key)}
                  className="w-full text-left p-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-bold text-foreground truncate">
                      {icon} {f.label}
                    </div>
                    <div className="text-[11px] font-mono shrink-0" style={{ color }}>
                      {f.value}{unit}{f.arrow}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Normal: {f.normal}
                  </div>
                </button>
                {active && (
                  <div className="border-t px-2 py-2 space-y-1.5 text-[11px] leading-snug" style={{ borderColor: `${color}55` }}>
                    <div>
                      <span className="font-bold text-foreground">Desvio: </span>
                      <span className="text-muted-foreground">{f.finding}</span>
                    </div>
                    {f.key === "spinal_lateral_deviation" ? (() => {
                      const dev = Math.abs(f.value);
                      const side = f.value > 0 ? "D" : "E";
                      const opp = side === "D" ? "E" : "D";
                      const severity = dev <= 1 ? "alinhada" : dev <= 3 ? "leve" : dev <= 5 ? "moderada" : "acentuada";
                      const sideFull = side === "D" ? "direita" : "esquerda";
                      const oppFull = opp === "D" ? "direita" : "esquerda";
                      if (dev <= 1) {
                        return (
                          <div className="text-muted-foreground">
                            ✓ Coluna alinhada no eixo C7→L5. Manter trabalho de estabilização do core e mobilidade torácica preventiva.
                          </div>
                        );
                      }
                      return (
                        <>
                          <div>
                            <span className="font-bold text-foreground">📐 Desvio: </span>
                            <span className="text-muted-foreground">
                              Inclinação lateral {sideFull} de {dev.toFixed(1)}° — convexidade à {oppFull} (curva tipo C {severity}).
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground">💪 Hiperativos (lado côncavo {side}): </span>
                            <span className="text-muted-foreground">
                              Quadrado lombar {side}, eretores espinhais {side}, oblíquo interno {side}, iliopsoas {side} (encurtados).
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground">⚠️ Inibidos (lado convexo {opp}): </span>
                            <span className="text-muted-foreground">
                              Quadrado lombar {opp}, oblíquo externo {opp}, glúteo médio {opp} (alongados e fracos).
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground">🔗 Cadeia: </span>
                            <span className="text-muted-foreground">
                              Báscula pélvica → desnivelamento de ombros (compensação contralateral) → sobrecarga no disco L4-L5/L5-S1 do lado {side}.
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground">🎯 Correção prescrita: </span>
                            <span className="text-muted-foreground block mt-0.5 space-y-0.5">
                              <span className="block">1. Liberação miofascial quadrado lombar {side} + iliopsoas {side} (1–2 min cada).</span>
                              <span className="block">2. Alongamento lateral side-bend para {opp}: 3×30s (alonga côncavo {side}).</span>
                              <span className="block">3. Side plank com elevação pélvica apoiado no lado {opp}: 3×30–45s (ativa QL/glúteo médio {opp}).</span>
                              <span className="block">4. Bird-dog assimétrico priorizando braço {side} + perna {opp}: 3×10.</span>
                              <span className="block">5. Pallof press anti-lateral flexão para {side}: 3×12 cada lado.</span>
                              <span className="block">6. Fortalecimento glúteo médio {opp}: abdução em decúbito lateral 3×15.</span>
                              <span className="block">7. Reavaliar eixo C7→L5 em 4–6 semanas — alvo desvio ≤ 1°.</span>
                              {dev > 5 && (
                                <span className="block font-bold" style={{ color: C.red }}>
                                  ⚠ Desvio acentuado ({dev.toFixed(1)}°) — recomendar avaliação fisioterápica / radiografia panorâmica para descartar escoliose estrutural.
                                </span>
                              )}
                            </span>
                          </div>
                        </>
                      );
                    })() : f.key === "scapular_axis_tilt" ? (() => {
                      const side = f.value > 0 ? "D" : "E";
                      const opp = side === "D" ? "E" : "D";
                      return (
                        <>
                          <div>
                            <span className="font-bold text-foreground">💪 Hiperativos: </span>
                            <span className="text-muted-foreground">
                              Trapézio superior {side}, elevador da escápula {side}, romboide {side} (encurtado).
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground">⚠️ Inibidos: </span>
                            <span className="text-muted-foreground">
                              Serrátil anterior {opp}, trapézio inferior {opp}, manguito rotador {opp} (báscula superior comprometida).
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground">🔗 Cadeia: </span>
                            <span className="text-muted-foreground">
                              Desbalanço no par de forças escapular → discinesia → impacto subacromial {opp} → compensação cervico-torácica.
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground">🎯 Correção prescrita: </span>
                            <span className="text-muted-foreground block mt-0.5 space-y-0.5">
                              <span className="block">1. Liberação miofascial trapézio superior {side} (1–2 min).</span>
                              <span className="block">2. Alongamento elevador da escápula {side}: 3×30s.</span>
                              <span className="block">3. Wall slides + serrátil punch {opp}: 3×12 (báscula superior).</span>
                              <span className="block">4. Y-T-W prone com foco em trapézio inferior {opp}: 3×10.</span>
                              <span className="block">5. Face pull com rotação externa: 4×15 (reeducação do par de forças).</span>
                              <span className="block">6. Reavaliar eixo em 4 semanas — alvo {"<"} 2°.</span>
                            </span>
                          </div>
                        </>
                      );
                    })() : (
                      <>
                        {EDU[anchorLandmark(view, f.key)] && (
                          <>
                            {EDU[anchorLandmark(view, f.key)].dom && (
                              <div>
                                <span className="font-bold text-foreground">💪 Dominante: </span>
                                <span className="text-muted-foreground">{EDU[anchorLandmark(view, f.key)].dom}</span>
                              </div>
                            )}
                            {EDU[anchorLandmark(view, f.key)].inh && (
                              <div>
                                <span className="font-bold text-foreground">⚠️ Inibido: </span>
                                <span className="text-muted-foreground">{EDU[anchorLandmark(view, f.key)].inh}</span>
                              </div>
                            )}
                          </>
                        )}
                        <div>
                          <span className="font-bold text-foreground">Cadeia: </span>
                          <span className="text-muted-foreground">
                            {chains[0]?.description || "Compensações em segmentos adjacentes — avaliar pelvi-tronco-ombro."}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-foreground">Correção: </span>
                          <span className="text-muted-foreground">
                            2-3 exercícios corretivos: ativação isolada do antagonista 3×15, alongamento do dominante 3×30s, integração funcional 3×10.
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Kinetic chain legend */}
      {chainMode && chains.length > 0 && (
        <div className="rounded-lg border p-3 bg-card space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.red }}>
            🔗 Cadeias detectadas
          </div>
          {chains.map((c, i) => (
            <div key={i} className="text-[11px]">
              <span className="font-bold" style={{ color: C.red }}>{c.name}: </span>
              <span className="text-muted-foreground">{c.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Container oculto para renderização do PDF */}
      {pdfPayload && (
        <div
          ref={pdfContainerRef}
          id="apex-pdf-container"
          style={{
            position: "fixed",
            left: -9999,
            top: 0,
            width: 794,
            background: "#0A0A0F",
            fontFamily: "Inter, sans-serif",
            color: "#fff",
            padding: 0,
            zIndex: -1,
          }}
        >
          <ApexPDFLayout
            athleteName={athleteName}
            photoUrl={photoUrl}
            overlayDataUrl={pdfPayload.overlayDataUrl}
            findings={findings}
            quality={data?.landmarks ? calcAnalysisQuality(data.landmarks as any) : null}
            plumbSource={currentPlumb?.source ?? "—"}
            viewLabel={{ front: "Frente", lateral: "Lateral", back: "Costas" }[view]}
            geradoEm={pdfPayload.geradoEm}
          />
        </div>
      )}
    </div>
  );
}

// Map angle key → primary landmark for EDU lookup
function anchorLandmark(view: string, key: string): string {
  if (key === "shoulder_tilt" || key === "shoulder_asymmetry") return "shoulder_left";
  if (key === "hip_tilt" || key === "hip_asymmetry") return "hip_left";
  if (key === "knee_valgus_left") return "knee_left";
  if (key === "knee_valgus_right") return "knee_right";
  if (key === "forward_head_posture") return "ear";
  if (key === "thoracic_kyphosis") return "shoulder";
  if (key === "pelvic_tilt" || key === "lumbar_lordosis") return "hip_greater_trochanter";
  return "";
}

// ─── Snap anatômico C7/L5 à linha de prumo ───────────────────────
// C7 e L5 são vértebras da coluna — por definição anatômica devem
// estar sobre o eixo gravitacional sagital mediano. Desvios em X
// nesses pontos são erro de detecção, não desvio postural.
// Sistema de coordenadas: viewBox 0..100 (normalizado), centro = 50.
const SNAP_LANDMARK_KEYS = ["spine_c7", "spine_l5", "c7", "l5_s1", "spine_l5_s1"] as const;
function snapToPlumbLine<T extends Record<string, any>>(
  landmarks: T,
  imageWidth: number = 100,
): T {
  const centerX = imageWidth / 2;
  const out: any = { ...landmarks };
  for (const key of SNAP_LANDMARK_KEYS) {
    const p = (landmarks as any)[key];
    if (p && typeof p.x === "number") {
      const originalX = p.x;
      out[key] = { ...p, x: centerX, snapped: true, originalX };
      if (import.meta.env?.DEV) {
        // eslint-disable-next-line no-console
        console.debug(`[APEX snap] ${key}: x=${originalX.toFixed(2)} → ${centerX} (Δ=${(originalX - centerX).toFixed(2)})`);
      }
    }
  }
  return out as T;
}

// ─── Linha de prumo dinâmica ─────────────────────────────────────
// Eixo gravitacional real do atleta — calculado a partir de C7/L5
// pós-snap. Sistema de coordenadas: viewBox 0..100 (normalizado).
export type PlumbSource = "C7+L5" | "C7" | "L5" | "frame-center";
export interface PlumbLine {
  x1: number; y1: number; x2: number; y2: number;
  axisX: number;
  source: PlumbSource;
}
export function calcPlumbLine(
  landmarks: Record<string, any>,
  imageWidth: number = 100,
  imageHeight: number = 100,
): PlumbLine {
  const c7 = landmarks?.spine_c7 ?? landmarks?.c7;
  const l5 = landmarks?.spine_l5 ?? landmarks?.l5_s1 ?? landmarks?.spine_l5_s1;
  const valid = (p: any) => p && typeof p.x === "number" && typeof p.y === "number";
  if (valid(c7) && valid(l5)) {
    const axisX = (c7.x + l5.x) / 2;
    return { x1: axisX, y1: 0, x2: axisX, y2: imageHeight, axisX, source: "C7+L5" };
  }
  if (valid(c7)) return { x1: c7.x, y1: 0, x2: c7.x, y2: imageHeight, axisX: c7.x, source: "C7" };
  if (valid(l5)) return { x1: l5.x, y1: 0, x2: l5.x, y2: imageHeight, axisX: l5.x, source: "L5" };
  const cx = imageWidth / 2;
  return { x1: cx, y1: 0, x2: cx, y2: imageHeight, axisX: cx, source: "frame-center" };
}

// ─── Confiança por landmark (fallback até a IA retornar `confidence`) ──
// Heurística baseada em definição óssea visual: ombros/quadris alto;
// joelhos/tornozelos médio; coluna/escápulas baixo. NÃO remove pontos
// do SVG — apenas modula visual e participação em cálculos clínicos.
const HIGH_CONF_IDS = new Set([
  "shoulder_left", "shoulder_right", "hip_left", "hip_right", "acromio_l", "acromio_r",
]);
const MED_CONF_IDS = new Set([
  "knee_left", "knee_right", "ankle_left", "ankle_right", "ankle_lateral",
  "knee_lateral", "ear", "hip_greater_trochanter",
]);
const LOW_CONF_IDS = new Set([
  "spine_c7", "spine_l5", "c7", "l5_s1", "spine_l5_s1",
  "scapula_left", "scapula_right",
]);
export function estimateConfidence(id: string, raw?: { confidence?: number }): number {
  if (raw && typeof raw.confidence === "number" && Number.isFinite(raw.confidence)) {
    return Math.max(0, Math.min(1, raw.confidence));
  }
  if (HIGH_CONF_IDS.has(id)) return 0.90;
  if (MED_CONF_IDS.has(id)) return 0.78;
  if (LOW_CONF_IDS.has(id)) return 0.65;
  return 0.70;
}

interface ConfStyle {
  fill: string; stroke: string; strokeWidth: number;
  radius: number; opacity: number; dash?: string;
}
function getConfidenceStyle(confidence: number): ConfStyle {
  if (confidence >= 0.85) {
    return { fill: "#B8922A", stroke: "#F5D485", strokeWidth: 1.5, radius: 1.1, opacity: 1.0 };
  }
  if (confidence >= 0.65) {
    return { fill: "#78716C", stroke: "#A8A29E", strokeWidth: 1, radius: 0.95, opacity: 0.85 };
  }
  return { fill: "transparent", stroke: "#EF4444", strokeWidth: 1, radius: 0.95, opacity: 0.7, dash: "3 2" };
}

export interface AnalysisQuality { score: number; label: string; color: string }
export function calcAnalysisQuality(landmarks: Record<string, any>): AnalysisQuality {
  const entries = Object.entries(landmarks || {}).filter(
    ([, p]) => p && typeof (p as any).x === "number" && typeof (p as any).y === "number",
  );
  if (!entries.length) return { score: 0, label: "Sem dados", color: "#FCA5A5" };
  const avg = entries.reduce((s, [id, p]) => s + estimateConfidence(id, p as any), 0) / entries.length;
  if (avg >= 0.85) return { score: avg, label: "Análise confiável", color: "#6EE7B7" };
  if (avg >= 0.70) return { score: avg, label: "Análise aceitável", color: "#FCD34D" };
  if (avg >= 0.55) return { score: avg, label: "Análise com ressalvas", color: "#FB923C" };
  return { score: avg, label: "Reenviar foto", color: "#FCA5A5" };
}

// ─── Overlay (HTML + SVG hybrid for crisp labels) ────────────────
function OverlayLayer({
  data, selected, onSelect, eduMode, chainMode, debugMode, gridMode, chains, plumbXOverride,
}: {
  data: LandmarkView;
  selected: string | null;
  onSelect: (k: string) => void;
  eduMode: boolean;
  chainMode: boolean;
  debugMode: boolean;
  gridMode: boolean;
  chains: { name: string; nodes: string[]; description: string }[];
  plumbXOverride?: number | null;
}) {
  const lm = useMemo(() => snapToPlumbLine(data.landmarks, 100), [data.landmarks]);
  const ang = data.angles;

  // Pre-compute label positions with collision avoidance
  // Smart offset:
  //  - Detecta clusters (landmarks a <8% Euclidean) → spread maior
  //  - Labels SEMPRE no exterior (lado oposto ao centro da silhueta = 50)
  //  - Primários colocados primeiro (prioridade), secundários cedem
  //  - Colisões resolvidas alternando vertical ± e empurrando horizontal extra
  //  - Box de colisão aproximada ao tamanho real renderizado (16% x 4.5%)
  //  - Clamp final em [2, 98] para nunca sair do frame
  const labelPositions = useMemo(() => {
    type Pos = { key: string; lx: number; ly: number; px: number; py: number; primary: boolean };
    const entries = Object.entries(lm).filter(([, p]) => isValidPoint(p));

    // Detecção de cluster: para cada landmark, conta vizinhos a <8% Euclidean
    const clusterSize = (px: number, py: number) =>
      entries.reduce((acc, [, q]) => {
        const d = Math.hypot(q.x - px, q.y - py);
        return acc + (d > 0 && d < 8 ? 1 : 0);
      }, 0);

    // Ordena: primários antes (ganham melhor posição), depois por quantidade de vizinhos asc
    const ordered = entries
      .map(([k, p]) => ({ k, p, primary: PRIMARY.has(k), neighbors: clusterSize(p.x, p.y) }))
      .sort((a, b) => {
        if (a.primary !== b.primary) return a.primary ? -1 : 1;
        return a.neighbors - b.neighbors;
      });

    const BOX_W = 16; // largura aproximada do label em %
    const BOX_H = 4.5; // altura aproximada do label em %
    const placed: Pos[] = [];

    const collides = (lx: number, ly: number) =>
      placed.some((q) => Math.abs(q.lx - lx) < BOX_W && Math.abs(q.ly - ly) < BOX_H);

    const insideSilhouette = (lx: number) => Math.abs(lx - 50) < 8; // zona da silhueta

    for (const { k, p, primary, neighbors } of ordered) {
      const exterior = p.x < 50 ? -1 : 1;
      // Cluster denso → offset horizontal maior (afasta da silhueta)
      const baseOffset = neighbors >= 2 ? 12 : neighbors === 1 ? 9 : 7;
      let lx = p.x + exterior * baseOffset;
      let ly = p.y;

      // Garante exterior (nunca dentro da silhueta)
      if (insideSilhouette(lx)) lx = 50 + exterior * 10;

      // Resolve colisão alternando ± vertical (0, +4, -4, +8, -8, ...) e empurrando exterior se persistir
      const steps = [0, 4, -4, 8, -8, 12, -12, 16, -16];
      let resolved = false;
      for (let pass = 0; pass < 3 && !resolved; pass++) {
        for (const dy of steps) {
          const tryY = p.y + dy;
          const tryX = lx + exterior * pass * 3; // a cada pass empurra mais para fora
          if (!collides(tryX, tryY) && !insideSilhouette(tryX)) {
            lx = tryX;
            ly = tryY;
            resolved = true;
            break;
          }
        }
      }

      // Clamp final dentro do frame
      lx = Math.max(2, Math.min(98, lx));
      ly = Math.max(2, Math.min(98, ly));

      placed.push({ key: k, lx, ly, px: p.x, py: p.y, primary });
    }

    return placed;
  }, [lm]);

  // Compute line severity per analysis line
  const lineSev = (key: string): "ok" | "alt" | "sev" => {
    const a = ang[key];
    if (!a) return "ok";
    return severityOf(a.value, a.normal);
  };

  // Severity-aware line styling per spec (thresholds in degrees)
  type LineStyle = { stroke: string; strokeWidth: number; strokeDasharray: string; opacity: number; level: "normal" | "mild" | "moderate" | "severe" };
  const getLineStyle = (angleDegrees: number, normal: number, mild: number, moderate: number): LineStyle => {
    const a = Math.abs(Number(angleDegrees) || 0);
    if (a <= normal)   return { stroke: "#1D9E75", strokeWidth: 1.5, strokeDasharray: "none", opacity: 0.7, level: "normal" };
    if (a <= mild)     return { stroke: "#B8922A", strokeWidth: 2,   strokeDasharray: "none", opacity: 0.8, level: "mild" };
    if (a <= moderate) return { stroke: "#EF9F27", strokeWidth: 2.5, strokeDasharray: "6 2",  opacity: 0.9, level: "moderate" };
    return                    { stroke: "#E24B4A", strokeWidth: 3,   strokeDasharray: "4 2",  opacity: 1,   level: "severe" };
  };
  const angleVal = (key: string): number => {
    const a = ang[key];
    return a ? Number(a.value) || 0 : 0;
  };
  const LINE_THRESHOLDS: Record<string, { n: number; mi: number; mo: number }> = {
    shoulder_tilt:        { n: 1, mi: 2, mo: 5 },
    shoulder_asymmetry:   { n: 1, mi: 2, mo: 5 },
    scapular_axis_tilt:   { n: 2, mi: 3, mo: 6 },
    hip_tilt:             { n: 1, mi: 3, mo: 5 },
    hip_asymmetry:        { n: 1, mi: 3, mo: 5 },
    knee_valgus_left:     { n: 3, mi: 5, mo: 8 },
    knee_valgus_right:    { n: 3, mi: 5, mo: 8 },
    plumb_line_deviation: { n: 1, mi: 3, mo: 5 },
  };

  // ── Centro anatômico do atleta (linha de prumo) ──────────────────
  // Eixo X = média(C7.x, L5.x). Fallback: média(ombroD.x, ombroE.x).
  const calcAnatomicalCenter = (): number => {
    const c7 = (lm as any).c7 ?? (lm as any).spine_c7;
    const l5 = (lm as any).l5_s1 ?? (lm as any).spine_l5_s1 ?? (lm as any).spine_l5;
    if (isValidPoint(c7) && isValidPoint(l5) && typeof c7.x === "number" && typeof l5.x === "number") {
      return (c7.x + l5.x) / 2;
    }
    const sR = (lm as any).acromio_r ?? lm.shoulder_right;
    const sL = (lm as any).acromio_l ?? lm.shoulder_left;
    if (isValidPoint(sR) && isValidPoint(sL)) {
      return (sR.x + sL.x) / 2;
    }
    if (isValidPoint(c7)) return c7.x;
    if (isValidPoint(l5)) return l5.x;
    return 50;
  };
  const autoCenterX = calcAnatomicalCenter();
  const anatomicalCenterX = typeof plumbXOverride === "number" ? plumbXOverride : autoCenterX;
  const anatomicalDeviation = Math.abs(anatomicalCenterX - 50);
  const showAnatomicalLabel = anatomicalDeviation > 5;

  // ── Linha de prumo dinâmica (C7/L5 pós-snap, com fallback rastreável) ──
  const plumb = useMemo(() => {
    const auto = calcPlumbLine(lm as any, 100, 100);
    // honra override manual sem perder rastreabilidade
    if (typeof plumbXOverride === "number") {
      return { ...auto, x1: plumbXOverride, x2: plumbXOverride, axisX: plumbXOverride };
    }
    return auto;
  }, [lm, plumbXOverride]);
  useEffect(() => {
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[APEX plumb]", plumb);
    }
  }, [plumb]);

  return (
    <>
      {/* SVG layer: lines + landmarks */}
      <svg
        id="apex-overlay-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: "visible" }}
      >
        {/* Linha de referência geométrica (discreta) quando há desvio */}
        {showAnatomicalLabel && (
          <line
            x1={50} y1={0} x2={50} y2={100}
            stroke="#ffffff"
            strokeOpacity={0.08}
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 1 }}
          />
        )}
        {/* Plumb line dinâmica — ancorada em C7/L5 (com fallback) */}
        <line
          x1={plumb.x1} y1={plumb.y1} x2={plumb.x2} y2={plumb.y2}
          stroke={plumb.source === "frame-center" ? "#FBBF24" : C.white}
          strokeOpacity={plumb.source === "frame-center" ? 0.5 : 0.35}
          strokeDasharray="2 1"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 1.5 }}
        />




        {/* View-specific lines */}
        {data.view === "front" && (
          <>
            <SvgSevLine id="sho-front" p1={lm.shoulder_left} p2={lm.shoulder_right}
              style={getLineStyle(angleVal("shoulder_tilt"), LINE_THRESHOLDS.shoulder_tilt.n, LINE_THRESHOLDS.shoulder_tilt.mi, LINE_THRESHOLDS.shoulder_tilt.mo)} />
            <SvgSevLine id="hip-front" p1={lm.hip_left} p2={lm.hip_right}
              style={getLineStyle(angleVal("hip_tilt"), LINE_THRESHOLDS.hip_tilt.n, LINE_THRESHOLDS.hip_tilt.mi, LINE_THRESHOLDS.hip_tilt.mo)} />
            <SvgSevLine id="knee-L" p1={lm.hip_left} p2={lm.ankle_left}
              style={getLineStyle(angleVal("knee_valgus_left"), LINE_THRESHOLDS.knee_valgus_left.n, LINE_THRESHOLDS.knee_valgus_left.mi, LINE_THRESHOLDS.knee_valgus_left.mo)} />
            <SvgSevLine id="knee-R" p1={lm.hip_right} p2={lm.ankle_right}
              style={getLineStyle(angleVal("knee_valgus_right"), LINE_THRESHOLDS.knee_valgus_right.n, LINE_THRESHOLDS.knee_valgus_right.mi, LINE_THRESHOLDS.knee_valgus_right.mo)} />
          </>
        )}
        {data.view === "lateral" && (() => {
          const ls = getLineStyle(angleVal("plumb_line_deviation"), LINE_THRESHOLDS.plumb_line_deviation.n, LINE_THRESHOLDS.plumb_line_deviation.mi, LINE_THRESHOLDS.plumb_line_deviation.mo);
          return (
            <SvgPolyline
              points={["ear", "shoulder", "hip_greater_trochanter", "knee_lateral", "ankle_lateral"].map((k) => lm[k]).filter(isValidPoint)}
              color={ls.stroke}
              style={{ strokeWidth: ls.strokeWidth, strokeDasharray: ls.strokeDasharray, opacity: ls.opacity }}
            />
          );
        })()}
        {data.view === "back" && (
          <>
            <SvgSevLine id="sho-back" p1={lm.shoulder_left} p2={lm.shoulder_right}
              style={getLineStyle(angleVal("shoulder_asymmetry"), LINE_THRESHOLDS.shoulder_asymmetry.n, LINE_THRESHOLDS.shoulder_asymmetry.mi, LINE_THRESHOLDS.shoulder_asymmetry.mo)} />
            <SvgSevLine id="hip-back" p1={lm.hip_left} p2={lm.hip_right}
              style={getLineStyle(angleVal("hip_asymmetry"), LINE_THRESHOLDS.hip_asymmetry.n, LINE_THRESHOLDS.hip_asymmetry.mi, LINE_THRESHOLDS.hip_asymmetry.mo)} />
            {isValidPoint(lm.scapula_left) && isValidPoint(lm.scapula_right) && (
              <SvgSevLine id="scap-back" p1={lm.scapula_left} p2={lm.scapula_right}
                style={getLineStyle(angleVal("scapular_axis_tilt"), LINE_THRESHOLDS.scapular_axis_tilt.n, LINE_THRESHOLDS.scapular_axis_tilt.mi, LINE_THRESHOLDS.scapular_axis_tilt.mo)} />
            )}
            {/* FIX 3 — C7→L5 sempre em amarelo, 2px, com badge de desvio CLICÁVEL */}
            {isValidPoint(lm.spine_c7) && isValidPoint(lm.spine_l5) && (() => {
              const c7 = lm.spine_c7;
              const l5 = lm.spine_l5;
              const dxS = l5.x - c7.x;
              const dyS = l5.y - c7.y;
              // ângulo em relação à vertical (perfeito = 0°)
              const devDeg = Math.atan2(dxS, dyS) * (180 / Math.PI);
              const devAbs = Math.abs(devDeg);
              const devRounded = Math.round(devDeg * 10) / 10;
              const aligned = devAbs <= 1;
              const critical = devAbs > 3;
              const badgeColor = aligned ? C.green : critical ? C.red : C.yellow;
              const lineColor = aligned ? "#FFD700" : badgeColor;
              const mxS = (c7.x + l5.x) / 2;
              const myS = (c7.y + l5.y) / 2;
              // posicionar badge à direita da linha (offset perpendicular)
              const len = Math.hypot(dxS, dyS) || 1;
              const nx = -dyS / len; // perpendicular normalizada
              const ny = dxS / len;
              const off = 6; // %
              const bx = mxS + nx * off;
              const by = myS + ny * off;
              const isSelS = selected === "spinal_lateral_deviation";
              const label = aligned
                ? "Coluna: alinhada ✓"
                : `Desvio lateral: ${devAbs.toFixed(1)}° ${devDeg > 0 ? "→D" : "→E"}`;
              // dimensões do badge proporcionais ao texto
              const bw = aligned ? 22 : 26;
              const bh = 4.4;
              return (
                <g
                  style={{ cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); onSelect("spinal_lateral_deviation"); }}
                >
                  {/* halo se selecionado */}
                  {isSelS && (
                    <line
                      x1={c7.x} y1={c7.y} x2={l5.x} y2={l5.y}
                      stroke={badgeColor} strokeOpacity={0.35}
                      vectorEffect="non-scaling-stroke"
                      style={{ strokeWidth: 7 }}
                    />
                  )}
                  {/* hit-area invisível */}
                  <line
                    x1={c7.x} y1={c7.y} x2={l5.x} y2={l5.y}
                    stroke="transparent"
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: 14 }}
                  />
                  <line
                    x1={c7.x} y1={c7.y} x2={l5.x} y2={l5.y}
                    stroke={lineColor}
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: isSelS ? 3 : 2 }}
                  />
                  {/* Linha vertical de referência tracejada (vertical perfeita a partir de C7) */}
                  {!aligned && (
                    <line
                      x1={c7.x} y1={c7.y} x2={c7.x} y2={l5.y}
                      stroke={C.white} strokeOpacity={0.35}
                      strokeDasharray="1 1"
                      vectorEffect="non-scaling-stroke"
                      style={{ strokeWidth: 0.8 }}
                    />
                  )}
                  {/* Âncoras destacadas (círculo maior) */}
                  <circle cx={c7.x} cy={c7.y} r={1.6} fill={lineColor} stroke="#000" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 1 }}>
                    {(c7 as any).snapped && (
                      <title>C7 — 📐 Ancorado na linha de prumo (referência anatômica fixa). Detecção IA originalX={typeof (c7 as any).originalX === "number" ? (c7 as any).originalX.toFixed(1) : "—"}</title>
                    )}
                  </circle>
                  <circle cx={l5.x} cy={l5.y} r={1.6} fill={lineColor} stroke="#000" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 1 }}>
                    {(l5 as any).snapped && (
                      <title>L5 — 📐 Ancorado na linha de prumo (referência anatômica fixa). Detecção IA originalX={typeof (l5 as any).originalX === "number" ? (l5 as any).originalX.toFixed(1) : "—"}</title>
                    )}
                  </circle>
                  {/* Conector do badge até a linha */}
                  <line
                    x1={mxS} y1={myS} x2={bx} y2={by}
                    stroke={badgeColor} strokeOpacity={0.6}
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: 0.8 }}
                  />
                  {/* Badge */}
                  <rect
                    x={bx - bw / 2} y={by - bh / 2}
                    width={bw} height={bh} rx={1.2}
                    fill="#000" fillOpacity={0.85}
                    stroke={badgeColor}
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: 1 }}
                  />
                  <text
                    x={bx} y={by + 0.9}
                    textAnchor="middle"
                    fill={badgeColor}
                    fontSize={2.2}
                    fontWeight={700}
                    style={{ pointerEvents: "none" }}
                  >
                    {label}
                  </text>
                  {/* mini-tag C7/L5 nas pontas (📐 indica âncora anatômica fixa) */}
                  <text x={c7.x + 2} y={c7.y + 0.6} fill={lineColor} fontSize={1.7} fontWeight={700} style={{ pointerEvents: "none", paintOrder: "stroke" }} stroke="#000" strokeWidth={0.4}>{(c7 as any).snapped ? "C7 📐" : "C7"}</text>
                  <text x={l5.x + 2} y={l5.y + 0.6} fill={lineColor} fontSize={1.7} fontWeight={700} style={{ pointerEvents: "none", paintOrder: "stroke" }} stroke="#000" strokeWidth={0.4}>{(l5 as any).snapped ? "L5 📐" : "L5"}</text>
                </g>
              );
            })()}
            {/* MELHORIA 1 — Eixo escapular 2.5px ciano (vermelho se >2°), losango central, CLICÁVEL */}
            {isValidPoint(lm.scapula_left) && isValidPoint(lm.scapula_right) && (() => {
              const dx = lm.scapula_right.x - lm.scapula_left.x;
              const dy = lm.scapula_right.y - lm.scapula_left.y;
              const ang2 = Math.atan2(dy, dx) * (180 / Math.PI);
              const critical = Math.abs(ang2) > 2;
              const stroke = critical ? C.red : C.cyan;
              const mx = (lm.scapula_left.x + lm.scapula_right.x) / 2;
              const my = (lm.scapula_left.y + lm.scapula_right.y) / 2;
              const isSel = selected === "scapular_axis_tilt";
              return (
                <g
                  style={{ cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); onSelect("scapular_axis_tilt"); }}
                >
                  {/* halo glow quando selecionado */}
                  {isSel && (
                    <line
                      x1={lm.scapula_left.x} y1={lm.scapula_left.y}
                      x2={lm.scapula_right.x} y2={lm.scapula_right.y}
                      stroke={stroke}
                      strokeOpacity={0.35}
                      vectorEffect="non-scaling-stroke"
                      style={{ strokeWidth: 7 }}
                    />
                  )}
                  {/* hit area invisível larga para facilitar o clique */}
                  <line
                    x1={lm.scapula_left.x} y1={lm.scapula_left.y}
                    x2={lm.scapula_right.x} y2={lm.scapula_right.y}
                    stroke="transparent"
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: 14 }}
                  />
                  <line
                    x1={lm.scapula_left.x} y1={lm.scapula_left.y}
                    x2={lm.scapula_right.x} y2={lm.scapula_right.y}
                    stroke={stroke}
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: isSel ? 3.5 : 2.5 }}
                  />
                  <polygon
                    points={`${mx},${my - 1.4} ${mx + 1.4},${my} ${mx},${my + 1.4} ${mx - 1.4},${my}`}
                    fill={stroke}
                    stroke="#000"
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: 1 }}
                  />
                  {/* badge "clique" sutil acima do losango */}
                  <text
                    x={mx} y={my - 2.4}
                    textAnchor="middle"
                    fill={stroke}
                    fontSize={1.8}
                    fontWeight={700}
                    style={{ pointerEvents: "none", paintOrder: "stroke" }}
                    stroke="#000"
                    strokeWidth={0.4}
                  >
                    {isSel ? "▼ aberto" : "▲ clique"}
                  </text>
                </g>
              );
            })()}
          </>
        )}

        {/* Goniometric arcs — Grade simetrográfica */}
        {gridMode && (() => {
          const mid = (a?: Landmark, b?: Landmark) =>
            isValidPoint(a) && isValidPoint(b) ? { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 } : null;
          const sevColor = (key: string): string => {
            const a = ang[key];
            if (!a) return "#1D9E75";
            const s = severityOf(a.value, a.normal);
            return s === "sev" ? "#E24B4A" : s === "alt" ? "#EF9F27" : "#1D9E75";
          };
          const arcs: Array<{ key: string; cx: number; cy: number; r: number; angle: number; color: string }> = [];
          const push = (key: string, c: { x: number; y: number } | null, r: number) => {
            const a = ang[key];
            if (!c || !a) return;
            arcs.push({ key, cx: c.x, cy: c.y, r, angle: Number(a.value) || 0, color: sevColor(key) });
          };
          if (data.view === "front") {
            push("shoulder_tilt", mid(lm.shoulder_left, lm.shoulder_right), 10);
            push("hip_tilt", mid(lm.hip_left, lm.hip_right), 9);
            if (isValidPoint(lm.knee_left)) push("knee_valgus_left", { x: lm.knee_left.x, y: lm.knee_left.y }, 6);
            if (isValidPoint(lm.knee_right)) push("knee_valgus_right", { x: lm.knee_right.x, y: lm.knee_right.y }, 6);
          }
          if (data.view === "back") {
            push("shoulder_asymmetry", mid(lm.shoulder_left, lm.shoulder_right), 10);
            push("scapular_axis_tilt", mid(lm.scapula_left, lm.scapula_right), 9);
            push("hip_asymmetry", mid(lm.hip_left, lm.hip_right), 9);
          }
          return arcs.map((a) => {
            const startRad = Math.PI; // -180° horizontal
            const endRad = startRad + (a.angle * Math.PI) / 180;
            const x1 = a.cx + a.r * Math.cos(startRad);
            const y1 = a.cy + a.r * Math.sin(startRad);
            const x2 = a.cx + a.r * Math.cos(endRad);
            const y2 = a.cy + a.r * Math.sin(endRad);
            const largeArc = Math.abs(a.angle) > 180 ? 1 : 0;
            const sweep = a.angle >= 0 ? 1 : 0;
            const arcPath = `M ${a.cx} ${a.cy} L ${x1} ${y1} A ${a.r} ${a.r} 0 ${largeArc} ${sweep} ${x2} ${y2} Z`;
            // Reference horizontal line (ideal) — extends both sides
            const refX1 = a.cx - a.r;
            const refX2 = a.cx + a.r;
            // Label position — outside arc on the side of deviation
            const midRad = (startRad + endRad) / 2;
            const labelX = a.cx + (a.r + 4) * Math.cos(midRad);
            const labelY = a.cy + (a.r + 4) * Math.sin(midRad);
            const dir = Math.abs(a.angle) < 0.3 ? "" : a.angle > 0 ? " ↑D" : " ↑E";
            const txt = `${a.angle >= 0 ? "" : "−"}${Math.abs(a.angle).toFixed(1)}°${dir}`;
            const charW = 1.05;
            const padX = 1.2;
            const boxW = txt.length * charW + padX * 2;
            const boxH = 3.4;
            return (
              <g key={`arc-${a.key}`} pointerEvents="none">
                {/* horizontal reference (ideal) */}
                <line
                  x1={refX1} y1={a.cy} x2={refX2} y2={a.cy}
                  stroke="#FFFFFF" strokeOpacity={0.3}
                  strokeDasharray="4 2"
                  vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: 1 }}
                />
                {/* filled arc */}
                <path d={arcPath} fill={a.color} fillOpacity={0.15} stroke="none" />
                {/* arc stroke */}
                <path d={arcPath} fill="none" stroke={a.color}
                  vectorEffect="non-scaling-stroke" style={{ strokeWidth: 1.5 }} />
                {/* angle label */}
                <rect
                  x={labelX - boxW / 2} y={labelY - boxH / 2}
                  width={boxW} height={boxH}
                  rx={0.8} ry={0.8}
                  fill="#000000" fillOpacity={0.56}
                />
                <text
                  x={labelX} y={labelY + 1}
                  textAnchor="middle"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fontSize={2.4}
                  fontWeight={700}
                  fill={a.color}
                >
                  {txt}
                </text>
              </g>
            );
          });
        })()}



        {/* Connector lines from landmarks to labels */}
        {labelPositions.map((q) => (
          <line
            key={`con-${q.key}`}
            x1={q.px} y1={q.py} x2={q.lx} y2={q.ly}
            stroke={C.white}
            strokeOpacity={0.4}
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 1 }}
          />
        ))}

        {/* Landmarks: confiança da detecção (base) + severidade clínica (override crítico) */}
        {labelPositions.map((q) => {
          const isPrimary = PRIMARY.has(q.key);
          const sev = landmarkSeverity(q.key, ang);
          const conf = estimateConfidence(q.key, (lm as any)[q.key]);
          const confStyle = getConfidenceStyle(conf);
          const isCritical = sev === "severe" || sev === "moderate";
          // Severidade crítica sobrepõe estilo de confiança (sinal clínico tem prioridade visual)
          const { fill, stroke, pulse } = isCritical ? landmarkColor(sev) : { fill: confStyle.fill, stroke: confStyle.stroke, pulse: false };
          const radius = (isPrimary ? 1.1 : 0.75) * (isCritical ? 1 : confStyle.radius / 1.0);
          const pct = Math.round(conf * 100);
          return (
            <circle
              key={`pt-${q.key}`}
              cx={q.px} cy={q.py}
              r={isCritical ? (isPrimary ? 1.1 : 0.75) : confStyle.radius}
              fill={fill}
              stroke={stroke}
              strokeDasharray={isCritical ? undefined : confStyle.dash}
              vectorEffect="non-scaling-stroke"
              className={pulse ? "apex-landmark-pulse" : undefined}
              opacity={isCritical ? 1 : confStyle.opacity}
              style={{ strokeWidth: isCritical ? (isPrimary ? 2 : 1.5) : confStyle.strokeWidth }}
            >
              <title>
                {(lm as any)[q.key]?.label || q.key} — Confiança: {pct}%{conf < 0.65 ? " ⚠ detecção instável" : ""}
              </title>
            </circle>
          );
        })}

        {/* Kinetic chain animated polylines */}
        {chainMode && chains.map((c, i) => {
          const pts = c.nodes.map((k) => lm[k]).filter(isValidPoint);
          if (pts.length < 2) return null;
          return (
            <polyline
              key={`chain-${i}`}
              className="apex-chain-line"
              points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={C.red}
              strokeOpacity={0.9}
              strokeDasharray="3 2"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: 2 }}
            />
          );
        })}

        {/* Plumb line label — com fonte do eixo (C7+L5 / C7 / L5 / frame-center) */}
        <text x={plumb.x1 + 0.6} y={2.5} fontSize={2} fill={C.white} opacity={0.6}>
          Linha de Prumo{plumb.source !== "C7+L5" ? ` (${plumb.source})` : ""}
        </text>
        {plumb.source === "frame-center" && (
          <text x={plumb.x1 + 0.6} y={4.8} fontSize={1.6} fill="#FBBF24" opacity={0.85}>
            ⚠ C7/L5 não detectados — usando centro do frame
          </text>
        )}

        {/* DEBUG: zona da silhueta (|x-50|<8) + caixas de colisão dos labels */}
        {debugMode && (
          <g>
            {/* Faixa da silhueta = exclusion zone exterior */}
            <rect
              x={42} y={0} width={16} height={100}
              fill="#FF00FF"
              fillOpacity={0.08}
              stroke="#FF00FF"
              strokeOpacity={0.5}
              strokeDasharray="1 1"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: 1 }}
            />
            <text x={50} y={99} fontSize={1.8} fill="#FF00FF" textAnchor="middle" opacity={0.9}>
              SILHUETA (labels proibidos)
            </text>
            {/* Caixas de colisão de cada label (16% x 4.5%) */}
            {labelPositions.map((q) => (
              <g key={`dbg-${q.key}`}>
                <rect
                  x={q.lx - 8} y={q.ly - 2.25}
                  width={16} height={4.5}
                  fill="none"
                  stroke="#00FFAA"
                  strokeOpacity={0.85}
                  strokeDasharray="0.6 0.6"
                  vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: 1 }}
                />
                {/* Anchor → label vector */}
                <circle cx={q.lx} cy={q.ly} r={0.5} fill="#00FFAA" />
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* Legenda de severidade dos landmarks */}
      <div
        className="absolute left-2 bottom-2 pointer-events-none"
        style={{
          background: "#00000080",
          padding: "6px 10px",
          borderRadius: 6,
          fontSize: 10,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          color: "#FFFFFF",
          lineHeight: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          zIndex: 5,
        }}
      >
        <div><span style={{ color: "#1D9E75" }}>●</span> Normal</div>
        <div><span style={{ color: "#B8922A" }}>●</span> Leve</div>
        <div><span style={{ color: "#EF9F27" }}>●</span> Moderado</div>
        <div><span style={{ color: "#E24B4A" }}>●</span> Crítico (pulsa)</div>
      </div>

      {/* HTML labels layer — crisp, with background */}
      <div className="absolute inset-0 pointer-events-none">
        {labelPositions.map((q) => (
          <div
            key={`lbl-${q.key}`}
            className="absolute text-[10px] font-semibold whitespace-nowrap"
            style={{
              left: `${q.lx}%`,
              top: `${q.ly}%`,
              transform: q.lx > 50 ? "translate(0, -50%)" : "translate(-100%, -50%)",
              background: "rgba(0,0,0,0.6)",
              color: PRIMARY.has(q.key) ? C.gold : C.white,
              padding: "1px 5px",
              borderRadius: 4,
              border: `1px solid ${PRIMARY.has(q.key) ? C.gold : "rgba(255,255,255,0.3)"}`,
            }}
            title={lm[q.key].label}
          >
            {lm[q.key].label}
          </div>
        ))}

        {/* Angle badges — adaptativos com colisão + estilo 0° confirmado */}
        {(() => {
          const items = Object.entries(ang)
            .map(([k, a]) => {
              const anchor = anchorForAngle(data.view, k, lm);
              if (!anchor) return null;
              return { k, a, anchor };
            })
            .filter(Boolean) as { k: string; a: AngleData; anchor: { x: number; y: number } }[];

          const placed: { x: number; y: number }[] = [];
          const BW = 14, BH = 4.5;

          return items.map(({ k, a, anchor }, idx) => {
            const isZeroConfirmed = a.value === 0 && (a.normal?.includes("0") || a.normal === "0°");
            const isUnknown = !Number.isFinite(a.value);
            const sev = severityOf(a.value, a.normal);
            const color = isZeroConfirmed ? "#9CA3AF" : isUnknown ? "#6B7280" : colorBySev(sev);
            const unit = a.unit?.includes("graus") ? "°" : a.unit?.includes("cm") ? "cm" : a.unit?.includes("mm") ? "mm" : "";
            const arrow = isZeroConfirmed || isUnknown ? "" : directionArrow(k, a.value);
            const active = selected === k;

            // FIX 2 — direção adaptativa
            let bx = anchor.x, by = anchor.y;
            let transform = "translate(-50%, -50%)";
            if (anchor.y > 70) { by = anchor.y - 7; transform = "translate(-50%, -100%)"; }
            else if (anchor.y < 30) { by = anchor.y + 7; transform = "translate(-50%, 0)"; }
            else if (anchor.x < 20) { bx = anchor.x + 9; transform = "translate(0, -50%)"; }
            else if (anchor.x > 80) { bx = anchor.x - 9; transform = "translate(-100%, -50%)"; }
            else {
              const ext = anchor.x < 50 ? -1 : 1;
              bx = anchor.x + ext * 9;
              transform = ext > 0 ? "translate(0, -50%)" : "translate(-100%, -50%)";
            }

            // FIX 1 — offset progressivo de colisão
            let attempts = 0;
            while (placed.some((p) => Math.abs(p.x - bx) < BW && Math.abs(p.y - by) < BH) && attempts < 8) {
              by += attempts % 2 === 0 ? BH + 0.5 : -(BH + 0.5);
              attempts++;
            }
            bx = Math.max(2, Math.min(98, bx));
            by = Math.max(3, Math.min(97, by));
            placed.push({ x: bx, y: by });

            const text = isUnknown ? "—" : isZeroConfirmed ? "0° ✓" : `${a.value}${unit}${arrow}`;
            const borderStyle = isUnknown ? "dashed" : "solid";
            const bg = isZeroConfirmed ? "#2A2A2A" : "rgba(0,0,0,0.78)";

            return (
              <div key={`ang-wrap-${k}`}>
                {/* Linha conectora badge → âncora */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{ overflow: "visible" }}
                >
                  <line
                    x1={anchor.x} y1={anchor.y} x2={bx} y2={by}
                    stroke={C.white} strokeOpacity={0.4}
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: 1 }}
                  />
                </svg>
                <div style={{ position: "absolute", left: `${bx}%`, top: `${by}%`, transform, pointerEvents: "auto" }}>
                  <button
                    onClick={() => onSelect(active ? "" : k)}
                    className="text-[10px] font-mono font-bold transition-all"
                    style={{
                      background: bg,
                      color,
                      border: `1.5px ${borderStyle} ${color}`,
                      borderRadius: 4,
                      padding: "2px 6px",
                      boxShadow: active ? `0 0 8px ${color}` : "none",
                    }}
                  >
                    {text}
                  </button>
                  {active && (
                    <div className="mt-1 text-[10px] rounded-md p-2 shadow-xl max-w-[220px]" style={{ background: C.dark, color: C.white, border: `1px solid ${color}` }}>
                      <div className="font-bold mb-1" style={{ color }}>{FRIENDLY[k] || k}</div>
                      <div className="opacity-70">Normal: {a.normal}</div>
                      <div className="mt-1 opacity-90">{a.finding}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })()}

        {/* Education Mode balloons — FIX 1 (colisão + bilateral collapse) + FIX 2 (adaptativo) */}
        {eduMode && (() => {
          const eduItems = Object.entries(lm)
            .filter(([k, p]) => PRIMARY.has(k) && isValidPoint(p) && EDU[k]);

          // Collapse bilateral pairs (left/right < 10% distance)
          type EduItem = { keys: string[]; anchors: Landmark[]; label: string; reveals: string; dom?: string; inh?: string };
          const used = new Set<string>();
          const items: EduItem[] = [];
          for (const [k, p] of eduItems) {
            if (used.has(k)) continue;
            const baseKey = k.replace(/_left$|_right$/, "");
            const otherKey = k.endsWith("_left") ? `${baseKey}_right` : k.endsWith("_right") ? `${baseKey}_left` : "";
            const otherEntry = otherKey ? eduItems.find(([kk]) => kk === otherKey) : undefined;
            if (otherEntry && Math.hypot(otherEntry[1].x - p.x, otherEntry[1].y - p.y) < 10) {
              used.add(k); used.add(otherKey);
              items.push({
                keys: [k, otherKey],
                anchors: [p, otherEntry[1]],
                label: lm[baseKey + "_left"]?.label?.replace(/ E$| D$/, "") || baseKey,
                reveals: EDU[k].reveals,
                dom: EDU[k].dom,
                inh: EDU[k].inh,
              });
            } else {
              used.add(k);
              items.push({ keys: [k], anchors: [p], label: lm[k].label, reveals: EDU[k].reveals, dom: EDU[k].dom, inh: EDU[k].inh });
            }
          }

          const placedEdu: { x: number; y: number }[] = [];
          const BW = 28, BH = 9;

          return items.map((it, idx) => {
            const cx = it.anchors.reduce((s, p) => s + p.x, 0) / it.anchors.length;
            const cy = it.anchors.reduce((s, p) => s + p.y, 0) / it.anchors.length;

            // FIX 2 — direção adaptativa baseada em posição
            let bx = cx, by = cy;
            let transform = "translate(-50%, -50%)";
            if (cy > 70) { by = cy - 12; transform = "translate(-50%, -100%)"; }
            else if (cy < 30) { by = cy + 12; transform = "translate(-50%, 0)"; }
            else if (cx < 20) { bx = cx + 14; transform = "translate(0, -50%)"; }
            else if (cx > 80) { bx = cx - 14; transform = "translate(-100%, -50%)"; }
            else {
              const ext = cx < 50 ? -1 : 1;
              bx = cx + ext * 14;
              transform = ext > 0 ? "translate(0, -50%)" : "translate(-100%, -50%)";
            }

            // FIX 1 — colisão progressiva (15% step)
            let attempts = 0;
            while (placedEdu.some((p) => Math.abs(p.x - bx) < BW && Math.abs(p.y - by) < BH) && attempts < 6) {
              by += attempts % 2 === 0 ? BH + 1 : -(BH + 1);
              attempts++;
            }
            bx = Math.max(2, Math.min(98, bx));
            by = Math.max(4, Math.min(96, by));
            placedEdu.push({ x: bx, y: by });

            return (
              <div key={`edu-${idx}`}>
                {/* Linhas conectoras (uma por âncora) */}
                <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                  {it.anchors.map((a, i) => (
                    <line
                      key={i}
                      x1={a.x} y1={a.y} x2={bx} y2={by}
                      stroke={C.white} strokeOpacity={0.4}
                      vectorEffect="non-scaling-stroke"
                      style={{ strokeWidth: 1 }}
                    />
                  ))}
                </svg>
                <div
                  className="absolute text-[10px] leading-tight"
                  style={{
                    left: `${bx}%`,
                    top: `${by}%`,
                    transform,
                    background: C.dark,
                    border: `1px solid ${C.cyan}`,
                    borderRadius: 6,
                    padding: "4px 6px",
                    maxWidth: 160,
                    color: C.white,
                  }}
                >
                  <div className="font-bold mb-0.5" style={{ color: C.cyan }}>
                    {it.label}{it.keys.length > 1 ? " (E/D)" : ""}
                  </div>
                  <div className="opacity-75">{it.reveals}</div>
                  {it.dom && <div className="mt-0.5">💪 <span className="opacity-90">{it.dom}</span></div>}
                  {it.inh && <div>⚠️ <span className="opacity-90">{it.inh}</span></div>}
                </div>
              </div>
            );
          });
        })()}
      </div>
    </>
  );
}

// ─── SVG helpers ─────────────────────────────────────────────────
function SvgLine({ p1, p2, color, dashed, thickness }: { p1?: Landmark; p2?: Landmark; color: string; dashed?: boolean; thickness?: number }) {
  if (!isValidPoint(p1) || !isValidPoint(p2)) return null;
  return (
    <line
      x1={p1!.x} y1={p1!.y} x2={p2!.x} y2={p2!.y}
      stroke={color}
      strokeDasharray={dashed ? "2 1" : undefined}
      vectorEffect="non-scaling-stroke"
      style={{ strokeWidth: thickness ?? 2 }}
    />
  );
}

// Severity-aware line with optional gradient (green → severity color in direction of deviation)
function SvgSevLine({
  p1, p2, style, id,
}: {
  p1?: Landmark; p2?: Landmark;
  style: { stroke: string; strokeWidth: number; strokeDasharray: string; opacity: number; level: "normal" | "mild" | "moderate" | "severe" };
  id: string;
}) {
  if (!isValidPoint(p1) || !isValidPoint(p2)) return null;
  const useGradient = style.level === "moderate" || style.level === "severe";
  const gradId = `apex-line-grad-${id}`;
  // Direction: from p1 (normal anchor) → p2 (deviated end). If p1 is "lower" deviation side, gradient flows green→sev along line.
  const x1 = p1!.x, y1 = p1!.y, x2 = p2!.x, y2 = p2!.y;
  const strokeRef = useGradient ? `url(#${gradId})` : style.stroke;
  return (
    <>
      {useGradient && (
        <defs>
          <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
            <stop offset="0%" stopColor="#1D9E75" stopOpacity={style.opacity} />
            <stop offset="100%" stopColor={style.stroke} stopOpacity={style.opacity} />
          </linearGradient>
        </defs>
      )}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={strokeRef}
        strokeOpacity={useGradient ? 1 : style.opacity}
        strokeDasharray={style.strokeDasharray === "none" ? undefined : style.strokeDasharray}
        vectorEffect="non-scaling-stroke"
        style={{ strokeWidth: style.strokeWidth }}
      />
    </>
  );
}

function SvgPolyline({ points, color, style }: { points: Landmark[]; color: string; style?: { strokeWidth: number; strokeDasharray: string; opacity: number } }) {
  if (points.length < 2) return null;
  return (
    <polyline
      points={points.map((p) => `${p.x},${p.y}`).join(" ")}
      fill="none"
      stroke={color}
      strokeOpacity={style?.opacity ?? 1}
      strokeDasharray={style && style.strokeDasharray !== "none" ? style.strokeDasharray : undefined}
      vectorEffect="non-scaling-stroke"
      style={{ strokeWidth: style?.strokeWidth ?? 2 }}
    />
  );
}

// Where to anchor each angle badge
function anchorForAngle(
  view: "front" | "lateral" | "back",
  key: string,
  lm: Record<string, Landmark>
): { x: number; y: number } | null {
  const mid = (a?: Landmark, b?: Landmark) =>
    isValidPoint(a) && isValidPoint(b) ? { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 } : null;

  if (view === "front") {
    if (key === "shoulder_tilt") return mid(lm.shoulder_left, lm.shoulder_right);
    if (key === "hip_tilt") return mid(lm.hip_left, lm.hip_right);
    if (key === "knee_valgus_left") return isValidPoint(lm.knee_left) ? { x: lm.knee_left.x, y: lm.knee_left.y } : null;
    if (key === "knee_valgus_right") return isValidPoint(lm.knee_right) ? { x: lm.knee_right.x, y: lm.knee_right.y } : null;
    if (key === "head_lateral_tilt") return isValidPoint(lm.nose) ? { x: lm.nose.x, y: lm.nose.y - 3 } : null;
  }
  if (view === "lateral") {
    if (key === "forward_head_posture") return isValidPoint(lm.ear) ? { x: lm.ear.x, y: lm.ear.y } : null;
    if (key === "thoracic_kyphosis") return mid(lm.shoulder, lm.hip_greater_trochanter);
    if (key === "lumbar_lordosis") return isValidPoint(lm.hip_greater_trochanter) ? { x: lm.hip_greater_trochanter.x, y: lm.hip_greater_trochanter.y + 2 } : null;
    if (key === "pelvic_tilt") return isValidPoint(lm.hip_greater_trochanter) ? { x: lm.hip_greater_trochanter.x, y: lm.hip_greater_trochanter.y } : null;
    if (key === "plumb_line_deviation") return isValidPoint(lm.ankle_lateral) ? { x: lm.ankle_lateral.x, y: lm.ankle_lateral.y - 4 } : null;
  }
  if (view === "back") {
    if (key === "shoulder_asymmetry") return mid(lm.shoulder_left, lm.shoulder_right);
    if (key === "scapular_winging_left") return isValidPoint(lm.scapula_left) ? { x: lm.scapula_left.x, y: lm.scapula_left.y } : null;
    if (key === "scapular_winging_right") return isValidPoint(lm.scapula_right) ? { x: lm.scapula_right.x, y: lm.scapula_right.y } : null;
    if (key === "spinal_lateral_deviation") return mid(lm.spine_c7, lm.spine_l5);
    if (key === "hip_asymmetry") return mid(lm.hip_left, lm.hip_right);
    if (key === "scapular_axis_tilt") return mid(lm.scapula_left, lm.scapula_right);
  }
  return null;
}

// ─── PDF Layout (renderizado em container oculto) ─────────────────
const CORRECTION_MAP: Record<string, string> = {
  shoulder_tilt: "Liberação miofascial do trapézio superior dominante + ativação do serrátil anterior (3×15) + alongamento contralateral 3×30s.",
  shoulder_asymmetry: "Mobilidade torácica + ativação serrátil anterior do lado inibido (3×15) + cues posturais ao longo do dia.",
  hip_tilt: "Liberação do quadrado lombar dominante + ativação do glúteo médio contralateral (3×15 cada lado) + bird-dog 3×10.",
  hip_asymmetry: "Side plank no lado fraco 3×30s + abdução em decúbito lateral 3×15 + ponte unilateral 3×12.",
  knee_valgus_left: "Ativação do glúteo médio E (clamshell 3×15) + fortalecimento de tibial posterior + cue de alinhamento joelho-pé.",
  knee_valgus_right: "Ativação do glúteo médio D (clamshell 3×15) + fortalecimento de tibial posterior + cue de alinhamento joelho-pé.",
  head_lateral_tilt: "Alongamento de ECOM e escalenos do lado inclinado 3×30s + ativação dos flexores cervicais profundos (chin-tuck 3×10).",
  forward_head_posture: "Chin-tuck 3×15 + alongamento de peitoral menor 3×30s + fortalecimento de retração escapular (face pull/Y-T-W).",
  thoracic_kyphosis: "Mobilidade torácica em extensão (foam roller) 1–2min + alongamento de peitoral menor + Y-T-W de cabeça para baixo 3×10.",
  lumbar_lordosis: "Alongamento de iliopsoas e eretores 3×30s + ativação de abdominal profundo (dead bug 3×10) + ponte glútea 3×15.",
  pelvic_tilt: "Mobilidade pélvica (gato/camelo) + ativação do glúteo máximo + alongamento de flexores de quadril.",
  plumb_line_deviation: "Reeducação postural global — trabalho de alinhamento sagital em frente ao espelho 5min/dia + core estabilizador.",
  scapular_winging_left: "Ativação serrátil anterior E (push-up plus, scap punches) 3×15 + alongamento de peitoral menor 3×30s.",
  scapular_winging_right: "Ativação serrátil anterior D (push-up plus, scap punches) 3×15 + alongamento de peitoral menor 3×30s.",
  spinal_lateral_deviation: "Alongamento lateral side-bend para o lado convexo 3×30s + side plank com elevação pélvica no lado fraco 3×30s + bird-dog assimétrico.",
  scapular_axis_tilt: "Ativação do serrátil anterior inibido + alongamento de trapézio superior dominante + mobilidade torácica.",
};

interface PDFLayoutProps {
  athleteName?: string;
  photoUrl?: string;
  overlayDataUrl: string | null;
  findings: Array<{ key: string; label: string; value: number; unit: string; normal: string; finding: string; sev: "ok" | "alt" | "sev" }>;
  quality: AnalysisQuality | null;
  plumbSource: string;
  viewLabel: string;
  geradoEm: Date;
}

function ApexPDFLayout({ athleteName, photoUrl, overlayDataUrl, findings, quality, plumbSource, viewLabel, geradoEm }: PDFLayoutProps) {
  const sevColor = (s: "ok" | "alt" | "sev") => s === "sev" ? "#FF3344" : s === "alt" ? "#FFB800" : "#1DB87A";
  const relevant = findings.filter((f) => f.sev !== "ok");
  const corrective = relevant.length ? relevant : findings.slice(0, 3);

  return (
    <div style={{ width: 794, background: "#0A0A0F", color: "#fff" }}>
      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #0A0A0F 0%, #111118 100%)",
        borderBottom: "1px solid rgba(184,146,42,0.3)",
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#B8922A", margin: 0, letterSpacing: "0.15em" }}>nutriON</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0", letterSpacing: "0.1em" }}>
            APEX VISUAL INTELLIGENCE
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: 0 }}>{athleteName || "Atleta"}</p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>
            {geradoEm.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} · Vista: {viewLabel}
          </p>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: "24px 32px" }}>
        {/* SEÇÃO 1 — Foto + overlay */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", margin: "0 0 10px" }}>
            ANÁLISE POSTURAL VISUAL
          </p>
          <div style={{ position: "relative", display: "inline-block", borderRadius: 8, overflow: "hidden", border: "0.5px solid rgba(255,255,255,0.1)", background: "#000" }}>
            {photoUrl && (
              <img
                src={photoUrl}
                style={{ display: "block", maxHeight: 380, maxWidth: 730, objectFit: "contain" }}
                crossOrigin="anonymous"
                alt="Foto postural"
              />
            )}
            {overlayDataUrl && (
              <img
                src={overlayDataUrl}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" }}
                alt=""
              />
            )}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {quality && (
              <span style={{
                fontSize: 9, padding: "3px 9px", borderRadius: 10,
                background: `${quality.color}22`, color: quality.color,
                border: `0.5px solid ${quality.color}55`,
              }}>
                ◉ {quality.label} — {Math.round(quality.score * 100)}%
              </span>
            )}
            <span style={{
              fontSize: 9, padding: "3px 9px", borderRadius: 10,
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)",
            }}>
              📐 Prumo: {plumbSource}
            </span>
          </div>
        </div>

        {/* SEÇÃO 2 — Achados clínicos */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", margin: "0 0 10px" }}>
            ACHADOS CLÍNICOS ({findings.length})
          </p>
          {findings.length === 0 && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Nenhum achado relevante nesta vista.</p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {findings.map((f, i) => {
              const color = sevColor(f.sev);
              const unit = f.unit?.includes("graus") ? "°" : f.unit?.includes("cm") ? "cm" : "";
              return (
                <div key={i} style={{
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 6,
                  borderLeft: `2px solid ${color}`,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", margin: "0 0 3px" }}>
                    {f.label}
                    <span style={{ fontSize: 9, marginLeft: 6, color }}>
                      {f.value}{unit}
                    </span>
                  </p>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", margin: "0 0 4px", lineHeight: 1.4 }}>
                    {f.finding || `Normal: ${f.normal}`}
                  </p>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.4 }}>
                    → {CORRECTION_MAP[f.key] || "Avaliar correção específica com base no contexto clínico."}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SEÇÃO 3 — Prescrição corretiva */}
        {corrective.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", margin: "0 0 10px" }}>
              PRESCRIÇÃO CORRETIVA
            </p>
            <div style={{
              padding: "12px 16px",
              background: "rgba(184,146,42,0.06)",
              borderRadius: 6,
              border: "0.5px solid rgba(184,146,42,0.2)",
            }}>
              {corrective.map((f, i) => (
                <div key={i} style={{
                  marginBottom: i < corrective.length - 1 ? 8 : 0,
                  paddingBottom: i < corrective.length - 1 ? 8 : 0,
                  borderBottom: i < corrective.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#B8922A", margin: "0 0 2px" }}>
                    {f.label}
                  </p>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5 }}>
                    {CORRECTION_MAP[f.key] || "Avaliar correção específica com base no contexto clínico."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: "0.5px solid rgba(255,255,255,0.08)",
        padding: "12px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <p style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", margin: 0 }}>
          nutrion.app.br — APEX Visual Intelligence
        </p>
        <p style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", margin: 0, fontStyle: "italic" }}>
          "Sua fome nunca foi de comida."
        </p>
      </div>
    </div>
  );
}
