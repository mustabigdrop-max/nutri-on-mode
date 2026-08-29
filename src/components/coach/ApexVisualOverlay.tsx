import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, ChevronDown, BookOpen, Link2, Eye, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { CYCLE_PHASE_INFO, type CyclePhase } from "@/lib/feminine";
import { getEducationContent } from "@/utils/apexEducation";
import { DraggableEducationCard } from "@/components/coach/ApexDraggableEducationCard";

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
  const [hoveredLm, setHoveredLm] = useState<string | null>(null);
  const [eduMode, setEduMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("apex-edu-mode");
      return saved !== null ? saved === "1" : true;
    } catch { return true; }
  });
  const [chainMode, setChainMode] = useState<boolean>(false);
  const [modoTecnico, setModoTecnico] = useState<boolean>(() => {
    try { return localStorage.getItem("apex_modo_tecnico") === "true"; } catch { return false; }
  });
  const [gridMode, setGridMode] = useState<boolean>(false);
  const [modoMarketing, setModoMarketing] = useState<boolean>(() => {
    try { return localStorage.getItem("apex_modo_marketing") === "true"; } catch { return false; }
  });
  // Posições e visibilidade dos cards educativos arrastáveis (por vista + key)
  const [cardState, setCardState] = useState<Record<string, { x: number; y: number; visible: boolean; initialized: boolean }>>({});
  const closeEduCard = useCallback((id: string) => {
    setCardState((prev) => ({ ...prev, [id]: { ...(prev[id] || { x: 0, y: 0, initialized: true }), visible: false } }));
  }, []);
  const reopenEduCard = useCallback((id: string) => {
    setCardState((prev) => ({ ...prev, [id]: { ...(prev[id] || { x: 0, y: 0, initialized: true }), visible: true } }));
  }, []);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // ── Ajuste manual do prumo (por vista) ─────────────────────────
  const [manualMode, setManualMode] = useState(false);
  const [showPlumbInstruction, setShowPlumbInstruction] = useState(false);
  const [showAnatomyGuide, setShowAnatomyGuide] = useState(false);
  const [manualPlumb, setManualPlumb] = useState<Record<"front" | "lateral" | "back", number | null>>({
    front: null, lateral: null, back: null,
  });
  // Drag livre (X e Y) dos landmarks C7 e L5 — por vista
  type SpinePos = { x: number; y: number };
  type ManualSpine = { c7?: SpinePos | null; l5?: SpinePos | null };
  const [manualSpinePositions, setManualSpinePositions] = useState<Record<"front" | "lateral" | "back", ManualSpine>>({
    front: {}, lateral: {}, back: {},
  });
  const handleSpineMove = useCallback((key: "c7" | "l5", x: number, y: number) => {
    setManualSpinePositions(prev => ({
      ...prev,
      [view]: { ...prev[view], [key]: { x, y } },
    }));
  }, [view]);
  const handleSpineRelease = useCallback(() => {
    // Snap suave: se C7 e L5 estiverem com Δx pequeno, alinhar no mesmo X
    setManualSpinePositions(prev => {
      const cur = prev[view] || {};
      const c7 = cur.c7; const l5 = cur.l5;
      if (c7 && l5) {
        const diffX = Math.abs(c7.x - l5.x);
        if (diffX > 0 && diffX < 1.6) { // ~8px em viewBox 100; foto ~500px
          const midX = (c7.x + l5.x) / 2;
          return { ...prev, [view]: { c7: { x: midX, y: c7.y }, l5: { x: midX, y: l5.y } } };
        }
      }
      return prev;
    });
  }, [view]);
  const resetSpinePositions = useCallback(() => {
    setManualSpinePositions(prev => ({ ...prev, [view]: {} }));
  }, [view]);

  // Drag livre (X e Y) dos demais landmarks (ombros, escápulas, quadris) — por vista
  type LandmarkKey =
    | "shoulder_left" | "shoulder_right"
    | "scapula_left" | "scapula_right"
    | "hip_left" | "hip_right";
  type ManualLandmarks = Partial<Record<LandmarkKey, { x: number; y: number }>>;
  const [manualLandmarksPositions, setManualLandmarksPositions] = useState<Record<"front" | "lateral" | "back", ManualLandmarks>>({
    front: {}, lateral: {}, back: {},
  });
  const handleLandmarkMove = useCallback((key: LandmarkKey, x: number, y: number) => {
    setManualLandmarksPositions(prev => ({
      ...prev,
      [view]: { ...prev[view], [key]: { x, y } },
    }));
  }, [view]);
  const resetLandmark = useCallback((key?: LandmarkKey | "C7" | "L5") => {
    if (!key) {
      setManualLandmarksPositions(prev => ({ ...prev, [view]: {} }));
      setManualSpinePositions(prev => ({ ...prev, [view]: {} }));
      return;
    }
    if (key === "C7") {
      setManualSpinePositions(prev => ({ ...prev, [view]: { ...prev[view], c7: undefined } }));
      return;
    }
    if (key === "L5") {
      setManualSpinePositions(prev => ({ ...prev, [view]: { ...prev[view], l5: undefined } }));
      return;
    }
    setManualLandmarksPositions(prev => {
      const cur = { ...(prev[view] || {}) };
      delete cur[key as LandmarkKey];
      return { ...prev, [view]: cur };
    });
  }, [view]);
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

  useEffect(() => {
    try { localStorage.setItem("apex_modo_tecnico", modoTecnico.toString()); } catch {}
  }, [modoTecnico]);

  useEffect(() => {
    try { localStorage.setItem("apex_modo_marketing", modoMarketing.toString()); } catch {}
  }, [modoMarketing]);

  // Aplica overrides manuais (drag livre) sobre os landmarks do sistema — antes de todos os recálculos
  const data = useMemo(() => {
    const base = landmarks[view];
    if (!base) return base;
    const overrides = manualLandmarksPositions[view] || {};
    const spine = manualSpinePositions[view] || {};
    const hasAny = Object.keys(overrides).length > 0 || !!spine.c7 || !!spine.l5;
    if (!hasAny) return base;
    const mergedLm: any = { ...base.landmarks };
    (Object.keys(overrides) as LandmarkKey[]).forEach(k => {
      const ov = overrides[k]!;
      mergedLm[k] = { ...(mergedLm[k] || {}), x: ov.x, y: ov.y, manual: true };
    });
    if (spine.c7) mergedLm.spine_c7 = { ...(mergedLm.spine_c7 || {}), x: spine.c7.x, y: spine.c7.y, manual: true };
    if (spine.l5) mergedLm.spine_l5 = { ...(mergedLm.spine_l5 || {}), x: spine.l5.x, y: spine.l5.y, manual: true };
    return { ...base, landmarks: mergedLm };
  }, [landmarks, view, manualLandmarksPositions, manualSpinePositions]);

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



  // Compute scapular axis (back view) augmentation + recompute symmetry angles a partir dos landmarks (pode ter overrides manuais)
  const augmentedAngles = useMemo(() => {
    if (!data) return {} as Record<string, AngleData>;
    const out: Record<string, AngleData> = { ...data.angles };
    const lm0: any = data.landmarks;

    // Recompute simétrico — qualquer landmark ajustado manualmente reflete aqui
    const tiltDeg = (a: any, b: any) => {
      if (!isValidPoint(a) || !isValidPoint(b)) return null;
      return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
    };
    if (data.view === "front" || data.view === "back") {
      const shoT = tiltDeg(lm0.shoulder_left, lm0.shoulder_right);
      if (shoT !== null) {
        const v = Math.round(shoT * 10) / 10;
        const key = data.view === "front" ? "shoulder_tilt" : "shoulder_asymmetry";
        out[key] = {
          ...(out[key] || { unit: "graus", normal: "<1°" }),
          value: v,
          finding: Math.abs(v) > 1 ? `Desnível de ombros ${Math.abs(v).toFixed(1)}° (${v > 0 ? "D abaixo" : "E abaixo"}).` : "Ombros nivelados.",
        };
      }
      const hipT = tiltDeg(lm0.hip_left, lm0.hip_right);
      if (hipT !== null) {
        const v = Math.round(hipT * 10) / 10;
        const key = data.view === "front" ? "hip_tilt" : "hip_asymmetry";
        out[key] = {
          ...(out[key] || { unit: "graus", normal: "<1°" }),
          value: v,
          finding: Math.abs(v) > 1 ? `Báscula pélvica ${Math.abs(v).toFixed(1)}° (${v > 0 ? "D abaixo" : "E abaixo"}).` : "Pelve nivelada.",
        };
      }
    }
    if (data.view === "back") {
      const sL = lm0.scapula_left;
      const sR = lm0.scapula_right;
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
      const snappedSpine = snapToPlumbLine(data.landmarks, 100);
      const c7 = snappedSpine.spine_c7;
      const l5 = snappedSpine.spine_l5;
      if (isValidPoint(c7) && isValidPoint(l5)) {
        const dx = l5.x - c7.x;
        const dy = l5.y - c7.y;
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
      <div className="flex flex-wrap items-center justify-between gap-2" style={{ display: modoMarketing ? "none" : undefined }}>
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
        <div className="flex flex-wrap gap-1.5 items-center">
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

          {/* Ajustes técnicos — recolhidos por padrão. A detecção já é automática;
              isso aqui é só pra quem quer conferir/ajustar manualmente, não é
              um passo obrigatório do fluxo. */}
          <details className="relative">
            <summary
              className="list-none inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer select-none"
              style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
            >
              ⚙ Ajustes técnicos (opcional)
            </summary>
            <div
              className="absolute z-20 mt-1.5 p-2 rounded-lg border flex flex-wrap gap-1.5"
              style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", width: 380, maxWidth: "80vw" }}
            >
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
                onClick={() => setModoTecnico((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
                style={{
                  borderColor: modoTecnico ? "rgba(255,255,255,0.3)" : "hsl(var(--border))",
                  color: modoTecnico ? "rgba(255,255,255,0.8)" : "hsl(var(--muted-foreground))",
                  background: modoTecnico ? "rgba(255,255,255,0.12)" : "transparent",
                }}
                title={modoTecnico ? "Ocultar landmarks" : "Mostrar landmarks"}
              >
                {modoTecnico ? "◎ Landmarks ON" : "◎ Landmarks OFF"}
              </button>
              <button
                onClick={activateManualMode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
                style={{
                  borderColor: manualMode ? C.gold : "hsl(var(--border))",
                  color: manualMode ? C.gold : "hsl(var(--muted-foreground))",
                  background: manualMode ? `${C.gold}1A` : "transparent",
                }}
                title="Ajustar manualmente a Linha de Prumo — só precisa se a detecção automática errar"
              >
                <Crosshair className="w-3.5 h-3.5" />
                ⊕ Ajustar Prumo
              </button>
              <button
                onClick={() => setShowAnatomyGuide((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
                style={{
                  borderColor: showAnatomyGuide ? "rgba(184,146,42,0.5)" : "hsl(var(--border))",
                  color: showAnatomyGuide ? C.gold : "hsl(var(--muted-foreground))",
                  background: showAnatomyGuide ? "rgba(184,146,42,0.2)" : "transparent",
                }}
                title="Mostrar guia anatômico — onde ficam C7 e L5"
              >
                🦴 Guia
              </button>
              <p className="w-full text-[10px] text-muted-foreground leading-snug pt-1">
                A análise já roda sozinha (IA detecta o corpo automaticamente). Só mexa aqui se quiser
                conferir os pontos ou corrigir manualmente um caso específico.
              </p>
            </div>
          </details>

          <button
            onClick={() => setModoMarketing((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
            style={{
              borderColor: modoMarketing ? "rgba(184,146,42,0.5)" : "hsl(var(--border))",
              color: modoMarketing ? C.gold : "hsl(var(--muted-foreground))",
              background: modoMarketing ? "rgba(184,146,42,0.2)" : "transparent",
            }}
            title="Modo Marketing — oculta UI, expande foto e mantém cards educativos arrastáveis"
          >
            📸 Marketing
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
      <div ref={exportRef} className={`grid ${modoMarketing ? "grid-cols-1" : "lg:grid-cols-[1fr_340px]"} gap-4 bg-card rounded-xl p-3 border relative`}>
        {/* Watermark / footer for export */}
        <div className="absolute top-2 right-3 text-[10px] font-bold tracking-widest opacity-60" style={{ color: C.gold }}>
          nutriON · APEX
        </div>

        {/* Botão sair do Modo Marketing */}
        {modoMarketing && (
          <button
            onClick={() => setModoMarketing(false)}
            className="absolute top-2 left-2 z-30 px-3 py-1.5 text-[11px] font-bold rounded-lg border"
            style={{
              borderColor: "rgba(184,146,42,0.5)",
              color: C.gold,
              background: "rgba(10,10,18,0.75)",
              backdropFilter: "blur(6px)",
            }}
            title="Sair do Modo Marketing"
          >
            ← Sair Marketing
          </button>
        )}

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
            height: modoMarketing ? "85vh" : 640,
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
                    modoTecnico={modoTecnico}
                    gridMode={gridMode}
                    chains={chains}
                    plumbXOverride={manualPlumb[view]}
                    manualSpine={manualSpinePositions[view]}
                    onSpineMove={handleSpineMove}
                    onSpineRelease={handleSpineRelease}
                    onSpineReset={resetSpinePositions}
                    manualLandmarks={manualLandmarksPositions[view]}
                    onLandmarkMove={handleLandmarkMove}
                  />
                  {/* Pulse de sugestão durante o modo manual */}
                  {manualMode && !showPlumbInstruction && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
                      <style>{`@keyframes apexPlumbPulse {0%{r:2;opacity:.9}50%{r:4;opacity:.35}100%{r:2;opacity:.9}}`}</style>
                      <circle cx={plumbSuggestion.x} cy={plumbSuggestion.y} r={3} fill="none" stroke="#B8922A" strokeWidth={0.6} vectorEffect="non-scaling-stroke" style={{ animation: "apexPlumbPulse 1.4s ease-in-out infinite", transformOrigin: "center" }} />
                      <circle cx={plumbSuggestion.x} cy={plumbSuggestion.y} r={0.7} fill="#B8922A" />
                    </svg>
                  )}
                  {/* Guia anatômico de referência — C7 e L5 sobre a foto */}
                  {showAnatomyGuide && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
                      <rect x={0} y={0} width={100} height={100} fill="rgba(0,0,0,0.28)" />
                      {[
                        { id: "C7", y: 18, cor: "#B8922A", hint: "base do pescoço" },
                        { id: "L5", y: 62, cor: "#38BDF8", hint: "acima do glúteo" },
                      ].map((ref) => (
                        <g key={ref.id}>
                          <line x1={30} y1={ref.y} x2={70} y2={ref.y} stroke={ref.cor} strokeWidth={0.5} strokeDasharray="2 1" opacity={0.75} vectorEffect="non-scaling-stroke" />
                          <circle cx={50} cy={ref.y} r={2.4} fill={`${ref.cor}33`} stroke={ref.cor} strokeWidth={0.6} vectorEffect="non-scaling-stroke">
                            <animate attributeName="r" values="2;3.4;2" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <text x={50} y={ref.y + 0.9} textAnchor="middle" fill={ref.cor} fontSize={2.2} fontWeight={700}>{ref.id}</text>
                          <text x={72} y={ref.y + 0.9} fill={ref.cor} fontSize={1.8} opacity={0.85}>← {ref.hint}</text>
                        </g>
                      ))}
                      <text x={50} y={5} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize={2} fontWeight={600}>
                        Guia anatômico — referência visual
                      </text>
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
              {/* Cards educativos arrastáveis sobre a foto */}
              {eduMode && findings
                .filter((f) => f.sev !== "ok" && getEducationContent(f.key))
                .map((f, idx) => {
                  const stateKey = `${view}:${f.key}`;
                  const st = cardState[stateKey];
                  if (st && !st.visible) return null;
                  const col = idx % 2;
                  const row = Math.floor(idx / 2);
                  const initialX = st?.initialized ? st.x : 16 + col * 220;
                  const initialY = st?.initialized ? st.y : 16 + row * 240;
                  const content = getEducationContent(f.key)!;
                  const graus = typeof f.value === "number" ? f.value : 0;
                  return (
                    <DraggableEducationCard
                      key={stateKey}
                      achado={{ key: f.key, label: f.label, graus, sev: f.sev }}
                      content={content}
                      initialX={initialX}
                      initialY={initialY}
                      onClose={() => closeEduCard(stateKey)}
                    />
                  );
                })}
              {/* Marketing — barra de reabrir cards fechados */}
              {eduMode && modoMarketing && (
                <div style={{
                  position: "absolute", bottom: 36, left: 8, right: 8,
                  display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center",
                  pointerEvents: "none", zIndex: 20,
                }}>
                  {findings
                    .filter((f) => f.sev !== "ok" && getEducationContent(f.key))
                    .filter((f) => cardState[`${view}:${f.key}`]?.visible === false)
                    .map((f) => {
                      const cor = f.sev === "sev" ? "#EF4444" : "#FBBF24";
                      return (
                        <button
                          key={f.key}
                          onClick={() => reopenEduCard(`${view}:${f.key}`)}
                          style={{
                            pointerEvents: "auto",
                            padding: "4px 10px",
                            background: `${cor}20`,
                            border: `0.5px solid ${cor}60`,
                            borderRadius: 6,
                            fontSize: 10, color: cor,
                            cursor: "pointer",
                            backdropFilter: "blur(6px)",
                          }}
                        >
                          + {f.label}
                        </button>
                      );
                    })}
                </div>
              )}
              {/* Watermark marketing */}
              {modoMarketing && (
                <div style={{
                  position: "absolute", bottom: 8, right: 10,
                  fontSize: 10, fontWeight: 700,
                  color: "rgba(184,146,42,0.85)",
                  letterSpacing: "0.12em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                  zIndex: 20,
                }}>
                  nutrion.app.br
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
        {!modoMarketing && (
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
              <summary className="text-[9px] font-mono text-muted-foreground cursor-pointer">🐛 DEV: JSON bruto × parseado</summary>
              <pre className="text-[8px] mt-1 max-h-40 overflow-auto opacity-80">{JSON.stringify({ raw_angles: data.angles, parsed_findings: findings.map(f => ({ key: f.key, value: f.value, normal: f.normal, sev: f.sev })) }, null, 2)}</pre>
            </details>
          )}

          <EducationSummary findings={findings} eduMode={eduMode} />

          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 pt-1">
            Achados clínicos ({findings.length})
          </div>
          {currentPlumb && (() => {
            const s = currentPlumb.source;
            const cfg = s === "C7+L5"
              ? { bg: "#064E3B", fg: "#6EE7B7", text: "📐 Prumo ancorado em C7/L5" }
              : s === "shoulders+hips"
              ? { bg: "#064E3B", fg: "#6EE7B7", text: "📐 Prumo automático (ombros/quadril)" }
              : s === "frame-center"
              ? { bg: "#7F1D1D", fg: "#FCA5A5", text: "✕ Não detectou o corpo — reenviar foto de costas" }
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
          {currentPlumb && Math.abs(currentPlumb.inclinacao) > 1 && (
            <p style={{ fontSize: 9, color: "rgba(251,191,36,0.75)", margin: "2px 0 4px" }}>
              ⚠ Prumo inclinado {currentPlumb.inclinacao > 0 ? "+" : ""}{currentPlumb.inclinacao}° — verifique posição do atleta na foto
            </p>
          )}
          {/* Painel educativo — Onde ficam C7 e L5 (começa fechado) */}
          <AnatomyEducationPanel
            c7Ajustado={!!manualSpinePositions[view]?.c7}
            l5Ajustado={!!manualSpinePositions[view]?.l5}
          />
          {/* Card permanente — status de todos os 8 landmarks arrastáveis */}
          {(() => {
            const c7Ajustado = !!manualSpinePositions[view]?.c7;
            const l5Ajustado = !!manualSpinePositions[view]?.l5;
            const ml = manualLandmarksPositions[view] || {};
            const grupos: Array<{ nome: string; cor: string; itens: Array<{ id: string; label: string; ajustado: boolean; reset: () => void }> }> = [
              {
                nome: "Coluna", cor: "#B8922A",
                itens: [
                  { id: "C7", label: "C7", ajustado: c7Ajustado, reset: () => resetLandmark("C7") },
                  { id: "L5", label: "L5", ajustado: l5Ajustado, reset: () => resetLandmark("L5") },
                ],
              },
              {
                nome: "Ombros", cor: "#38BDF8",
                itens: [
                  { id: "shoulder_left",  label: "Ombro E", ajustado: !!ml.shoulder_left,  reset: () => resetLandmark("shoulder_left") },
                  { id: "shoulder_right", label: "Ombro D", ajustado: !!ml.shoulder_right, reset: () => resetLandmark("shoulder_right") },
                ],
              },
              ...(view === "back" ? [{
                nome: "Escápulas", cor: "#A78BFA",
                itens: [
                  { id: "scapula_left",  label: "Escáp E", ajustado: !!ml.scapula_left,  reset: () => resetLandmark("scapula_left") },
                  { id: "scapula_right", label: "Escáp D", ajustado: !!ml.scapula_right, reset: () => resetLandmark("scapula_right") },
                ],
              }] : []),
              {
                nome: "Quadris", cor: "#34D399",
                itens: [
                  { id: "hip_left",  label: "Quadril E", ajustado: !!ml.hip_left,  reset: () => resetLandmark("hip_left") },
                  { id: "hip_right", label: "Quadril D", ajustado: !!ml.hip_right, reset: () => resetLandmark("hip_right") },
                ],
              },
            ];
            const totalAjustados = grupos.reduce((s, g) => s + g.itens.filter(i => i.ajustado).length, 0);
            return (
              <div style={{
                marginBottom: 12,
                background: "rgba(255,255,255,0.03)",
                border: "0.5px solid rgba(255,255,255,0.08)",
                borderRadius: 12, overflow: "hidden",
              }}>
                <div style={{
                  padding: "10px 12px",
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.75)", margin: "0 0 2px" }}>
                      ✥ Todos os pontos são arrastáveis
                    </p>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                      {totalAjustados === 0
? "Posições do sistema — arraste qualquer ponto para corrigir"
                        : `${totalAjustados} ponto(s) ajustado(s) manualmente`}
                    </p>
                  </div>
                  {totalAjustados > 0 && (
                    <button
                      onClick={() => resetLandmark()}
                      style={{
                        fontSize: 9, color: "rgba(255,255,255,0.55)",
                        background: "transparent",
                        border: "0.5px solid rgba(255,255,255,0.12)",
                        borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ↺ Resetar todos
                    </button>
                  )}
                </div>
                <div style={{ padding: "10px 12px" }}>
                  {grupos.map((g, gi) => (
                    <div key={g.nome} style={{ marginBottom: gi < grupos.length - 1 ? 8 : 0 }}>
                      <p style={{
                        fontSize: 9, color: `${g.cor}B3`,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        margin: "0 0 4px", fontWeight: 600,
                      }}>{g.nome}</p>
                      <div style={{ display: "flex", gap: 5 }}>
                        {g.itens.map(it => (
                          <div key={it.id} style={{
                            flex: 1, padding: "5px 6px",
                            background: it.ajustado ? `${g.cor}1A` : "rgba(255,255,255,0.03)",
                            border: `0.5px solid ${it.ajustado ? `${g.cor}59` : "rgba(255,255,255,0.07)"}`,
                            borderRadius: 7,
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                          }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: it.ajustado ? g.cor : "rgba(255,255,255,0.45)" }}>
                              {it.label}
                            </span>
                            <span style={{ fontSize: 8, color: it.ajustado ? `${g.cor}B3` : "rgba(255,255,255,0.3)" }}>
                              {it.ajustado ? "✓ ajustado" : "auto"}
                            </span>
                            {it.ajustado && (
                              <button
                                onClick={it.reset}
                                title={`Restaurar ${it.label} à posição do sistema`}
                                style={{
                                  fontSize: 8, color: "rgba(255,255,255,0.4)",
                                  background: "transparent", border: "none",
                                  cursor: "pointer", padding: 0, marginTop: 1,
                                }}
                              >↺</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                {active && eduMode && f.sev !== "ok" && getEducationContent(f.key) && (
                  <div className="px-2 pb-2">
                    <EducationCard findingKey={f.key} eduMode={eduMode} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
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
// Eixo gravitacional real do atleta — calculado a partir de C7/L5.
// Quando ambos estão posicionados, a linha PASSA pelos dois pontos
// (inclinação real). Sistema de coordenadas: viewBox 0..100.
export type PlumbSource = "C7+L5" | "C7" | "L5" | "shoulders+hips" | "frame-center";
export interface PlumbLine {
  x1: number; y1: number; x2: number; y2: number;
  axisX: number;
  source: PlumbSource;
  inclinacao: number; // graus do vertical (+ = inferior à direita)
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
    const dx = l5.x - c7.x;
    const dy = l5.y - c7.y;
    const slope = dy !== 0 ? dx / dy : 0;
    // Extende a reta que passa por C7 e L5 até topo (y=0) e fundo (y=imageHeight)
    const x1 = c7.x - slope * c7.y;
    const x2 = c7.x + slope * (imageHeight - c7.y);
    const inclinacao = Math.round(Math.atan2(dx, dy) * (180 / Math.PI) * 10) / 10;
    const axisX = (c7.x + l5.x) / 2;
    return { x1, y1: 0, x2, y2: imageHeight, axisX, source: "C7+L5", inclinacao };
  }
  if (valid(c7)) return { x1: c7.x, y1: 0, x2: c7.x, y2: imageHeight, axisX: c7.x, source: "C7", inclinacao: 0 };
  if (valid(l5)) return { x1: l5.x, y1: 0, x2: l5.x, y2: imageHeight, axisX: l5.x, source: "L5", inclinacao: 0 };

  // Sem C7/L5 (detecção falhou nesses dois pontos específicos) — antes de
  // desistir pro centro cru da imagem, tenta o eixo ombro→quadril, que o
  // MediaPipe detecta com muito mais confiança que a coluna. Fica menos
  // preciso que C7/L5 de verdade, mas ainda é um prumo real do corpo do
  // atleta, não um chute — evita empurrar o coach pro ajuste manual à toa.
  const sL = landmarks?.shoulder_left, sR = landmarks?.shoulder_right;
  const hL = landmarks?.hip_left, hR = landmarks?.hip_right;
  const shoulderMid = valid(sL) && valid(sR) ? { x: (sL.x + sR.x) / 2, y: (sL.y + sR.y) / 2 } : null;
  const hipMid = valid(hL) && valid(hR) ? { x: (hL.x + hR.x) / 2, y: (hL.y + hR.y) / 2 } : null;
  if (shoulderMid && hipMid) {
    const dx = hipMid.x - shoulderMid.x;
    const dy = hipMid.y - shoulderMid.y;
    const slope = dy !== 0 ? dx / dy : 0;
    const x1 = shoulderMid.x - slope * shoulderMid.y;
    const x2 = shoulderMid.x + slope * (imageHeight - shoulderMid.y);
    const inclinacao = Math.round(Math.atan2(dx, dy) * (180 / Math.PI) * 10) / 10;
    const axisX = (shoulderMid.x + hipMid.x) / 2;
    return { x1, y1: 0, x2, y2: imageHeight, axisX, source: "shoulders+hips", inclinacao };
  }
  const midOnly = shoulderMid || hipMid;
  if (midOnly) return { x1: midOnly.x, y1: 0, x2: midOnly.x, y2: imageHeight, axisX: midOnly.x, source: "shoulders+hips", inclinacao: 0 };

  const cx = imageWidth / 2;
  return { x1: cx, y1: 0, x2: cx, y2: imageHeight, axisX: cx, source: "frame-center", inclinacao: 0 };
}

// ─── Confiança por landmark (fallback até o sistema retornar `confidence`) ──
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
type DragLmKey =
  | "shoulder_left" | "shoulder_right"
  | "scapula_left" | "scapula_right"
  | "hip_left" | "hip_right";

const LM_DRAG_STYLE: Record<DragLmKey, { cor: string; corBorda: string; label: string }> = {
  shoulder_left:  { cor: "#38BDF8", corBorda: "#BAE6FD", label: "Ombro E" },
  shoulder_right: { cor: "#38BDF8", corBorda: "#BAE6FD", label: "Ombro D" },
  scapula_left:   { cor: "#A78BFA", corBorda: "#DDD6FE", label: "Escáp E" },
  scapula_right:  { cor: "#A78BFA", corBorda: "#DDD6FE", label: "Escáp D" },
  hip_left:       { cor: "#34D399", corBorda: "#A7F3D0", label: "Quadril E" },
  hip_right:      { cor: "#34D399", corBorda: "#A7F3D0", label: "Quadril D" },
};

function OverlayLayer({
  data, selected, onSelect, eduMode, chainMode, modoTecnico, gridMode, chains, plumbXOverride,
  manualSpine, onSpineMove, onSpineRelease, onSpineReset,
  manualLandmarks, onLandmarkMove,
}: {
  data: LandmarkView;
  selected: string | null;
  onSelect: (k: string) => void;
  eduMode: boolean;
  chainMode: boolean;
  modoTecnico: boolean;
  gridMode: boolean;
  chains: { name: string; nodes: string[]; description: string }[];
  plumbXOverride?: number | null;
  manualSpine?: { c7?: { x: number; y: number } | null; l5?: { x: number; y: number } | null };
  onSpineMove?: (key: "c7" | "l5", x: number, y: number) => void;
  onSpineRelease?: () => void;
  onSpineReset?: () => void;
  manualLandmarks?: Partial<Record<DragLmKey, { x: number; y: number }>>;
  onLandmarkMove?: (key: DragLmKey, x: number, y: number) => void;
}) {
  // Aplica overrides manuais (drag livre X/Y) sobre o snap automático
  const lm = useMemo(() => {
    const snapped = snapToPlumbLine(data.landmarks, 100) as any;
    if (manualSpine?.c7) {
      snapped.spine_c7 = { ...(snapped.spine_c7 || {}), x: manualSpine.c7.x, y: manualSpine.c7.y, manual: true, snapped: false };
    }
    if (manualSpine?.l5) {
      snapped.spine_l5 = { ...(snapped.spine_l5 || {}), x: manualSpine.l5.x, y: manualSpine.l5.y, manual: true, snapped: false };
    }
    if (manualLandmarks) {
      (Object.keys(manualLandmarks) as DragLmKey[]).forEach(k => {
        const ov = manualLandmarks[k];
        if (!ov) return;
        snapped[k] = { ...(snapped[k] || {}), x: ov.x, y: ov.y, manual: true };
      });
    }
    return snapped as typeof data.landmarks;
  }, [data.landmarks, manualSpine, manualLandmarks]);

  // ─── Drag livre de C7/L5 e demais landmarks ──────────────────
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<null | "c7" | "l5" | DragLmKey>(null);

  // ─── Onboarding e hover de descoberta C7/L5 ─────────────────
  const ONBOARDING_KEY = "apex_landmark_onboarding_done";
  const analiseCompleta = useMemo(() => {
    const valids = Object.values(data.landmarks).filter(isValidPoint).length;
    return valids >= 8;
  }, [data.landmarks]);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try { return !localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
  });
  const [hoveredSpine, setHoveredSpine] = useState<null | "c7" | "l5">(null);
  const [hoveredLm, setHoveredLm] = useState<string | null>(null);
  const dismissOnboarding = useCallback(() => {
    try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch {}
    setShowOnboarding(false);
  }, []);
  const toSVGCoords = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return {
      x: Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100)),
    };
  }, []);
  const beginSpineDrag = useCallback((key: "c7" | "l5") => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if ((e as any).preventDefault) (e as any).preventDefault();
    dismissOnboarding();
    draggingRef.current = key;
    const handleMove = (ev: MouseEvent) => {
      if (draggingRef.current !== key) return;
      const c = toSVGCoords(ev.clientX, ev.clientY);
      if (c) onSpineMove?.(key, c.x, c.y);
    };
    const handleTouchMove = (ev: TouchEvent) => {
      if (draggingRef.current !== key) return;
      const t = ev.touches[0]; if (!t) return;
      if (ev.cancelable) ev.preventDefault();
      const c = toSVGCoords(t.clientX, t.clientY);
      if (c) onSpineMove?.(key, c.x, c.y);
    };
    const handleUp = () => {
      draggingRef.current = null;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleUp);
      window.removeEventListener("touchcancel", handleUp);
      onSpineRelease?.();
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    window.addEventListener("touchcancel", handleUp);
  }, [toSVGCoords, onSpineMove, onSpineRelease, dismissOnboarding]);

  // ─── Drag livre genérico (ombros / escápulas / quadris) ──────
  const beginLandmarkDrag = useCallback((key: DragLmKey) => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if ((e as any).preventDefault) (e as any).preventDefault();
    draggingRef.current = key;
    const handleMove = (ev: MouseEvent) => {
      if (draggingRef.current !== key) return;
      const c = toSVGCoords(ev.clientX, ev.clientY);
      if (c) onLandmarkMove?.(key, c.x, c.y);
    };
    const handleTouchMove = (ev: TouchEvent) => {
      if (draggingRef.current !== key) return;
      const t = ev.touches[0]; if (!t) return;
      if (ev.cancelable) ev.preventDefault();
      const c = toSVGCoords(t.clientX, t.clientY);
      if (c) onLandmarkMove?.(key, c.x, c.y);
    };
    const handleUp = () => {
      draggingRef.current = null;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleUp);
      window.removeEventListener("touchcancel", handleUp);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    window.addEventListener("touchcancel", handleUp);
  }, [toSVGCoords, onLandmarkMove]);


  // ─── Drag da COLUNA inteira (C7+L5 juntos, preserva ângulo/distância) ─
  const beginColumnDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if ((e as any).preventDefault) (e as any).preventDefault();
    const c7 = (data.landmarks as any).spine_c7;
    const l5 = (data.landmarks as any).spine_l5;
    const curC7 = (manualSpine?.c7) ?? (isValidPoint(c7) ? { x: c7.x, y: c7.y } : null);
    const curL5 = (manualSpine?.l5) ?? (isValidPoint(l5) ? { x: l5.x, y: l5.y } : null);
    if (!curC7 || !curL5) return;
    const isTouch = "touches" in e;
    const startClient = isTouch
      ? { x: (e as React.TouchEvent).touches[0].clientX, y: (e as React.TouchEvent).touches[0].clientY }
      : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    const svg = svgRef.current;
    const rect = svg?.getBoundingClientRect();
    const handleMove = (cx: number, cy: number) => {
      if (!rect || !rect.width || !rect.height) return;
      const dxPct = ((cx - startClient.x) / rect.width) * 100;
      const dyPct = ((cy - startClient.y) / rect.height) * 100;
      onSpineMove?.("c7", Math.max(0, Math.min(100, curC7.x + dxPct)), Math.max(0, Math.min(100, curC7.y + dyPct)));
      onSpineMove?.("l5", Math.max(0, Math.min(100, curL5.x + dxPct)), Math.max(0, Math.min(100, curL5.y + dyPct)));
    };
    const onMouseMove = (ev: MouseEvent) => handleMove(ev.clientX, ev.clientY);
    const onTouchMove = (ev: TouchEvent) => {
      const t = ev.touches[0]; if (!t) return;
      if (ev.cancelable) ev.preventDefault();
      handleMove(t.clientX, t.clientY);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchcancel", onUp);
      onSpineRelease?.();
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);
  }, [data.landmarks, manualSpine, onSpineMove, onSpineRelease]);

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
        ref={svgRef}
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
        {/* Plumb line dinâmica — apenas no modo técnico */}
        {modoTecnico && (
          <line
            x1={plumb.x1} y1={plumb.y1} x2={plumb.x2} y2={plumb.y2}
            stroke={plumb.source === "frame-center" ? "#FBBF24" : C.white}
            strokeOpacity={plumb.source === "frame-center" ? 1 : 0.8}
            strokeDasharray="8 4"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 1.5 }}
          />
        )}
        {/* Linha C7-L5 — apenas no modo técnico (back view) */}
        {modoTecnico && data.view === "back" && isValidPoint(lm.spine_c7) && isValidPoint(lm.spine_l5) && (
          <line
            x1={lm.spine_c7.x} y1={lm.spine_c7.y}
            x2={lm.spine_l5.x} y2={lm.spine_l5.y}
            stroke="#B8922A"
            strokeOpacity={0.85}
            strokeDasharray="6 3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 1.5 }}
          />
        )}

        {modoTecnico && (<>
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
                  {/* Glow dourado sob a linha (destaque visual permanente) */}
                  <line
                    x1={c7.x} y1={c7.y} x2={l5.x} y2={l5.y}
                    stroke="#B8922A"
                    strokeOpacity={0.25}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    style={{ strokeWidth: 6 }}
                  />
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
                    strokeDasharray="3 1.5"
                    strokeLinecap="round"
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
                  {/* Hover highlight — anel + setas direcionais (apenas em C7/L5) */}
                  {hoveredSpine === "c7" && (
                    <g pointerEvents="none">
                      <circle cx={c7.x} cy={c7.y} r={3.6} fill="rgba(184,146,42,0.1)" stroke="rgba(184,146,42,0.45)" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 0.8 }} />
                      <text x={c7.x} y={c7.y - 3.6} textAnchor="middle" fill="rgba(184,146,42,0.85)" fontSize={1.8}>↑</text>
                      <text x={c7.x} y={c7.y + 4.4} textAnchor="middle" fill="rgba(184,146,42,0.85)" fontSize={1.8}>↓</text>
                      <text x={c7.x - 3.6} y={c7.y + 0.7} textAnchor="middle" fill="rgba(184,146,42,0.85)" fontSize={1.8}>←</text>
                      <text x={c7.x + 3.6} y={c7.y + 0.7} textAnchor="middle" fill="rgba(184,146,42,0.85)" fontSize={1.8}>→</text>
                    </g>
                  )}
                  {hoveredSpine === "l5" && (
                    <g pointerEvents="none">
                      <circle cx={l5.x} cy={l5.y} r={3.6} fill="rgba(184,146,42,0.1)" stroke="rgba(184,146,42,0.45)" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 0.8 }} />
                      <text x={l5.x} y={l5.y - 3.6} textAnchor="middle" fill="rgba(184,146,42,0.85)" fontSize={1.8}>↑</text>
                      <text x={l5.x} y={l5.y + 4.4} textAnchor="middle" fill="rgba(184,146,42,0.85)" fontSize={1.8}>↓</text>
                      <text x={l5.x - 3.6} y={l5.y + 0.7} textAnchor="middle" fill="rgba(184,146,42,0.85)" fontSize={1.8}>←</text>
                      <text x={l5.x + 3.6} y={l5.y + 0.7} textAnchor="middle" fill="rgba(184,146,42,0.85)" fontSize={1.8}>→</text>
                    </g>
                  )}
                  {/* Âncoras destacadas (círculo maior) — drag livre X/Y */}
                  <g
                    onMouseDown={beginSpineDrag("c7")}
                    onTouchStart={beginSpineDrag("c7")}
                    onMouseEnter={() => setHoveredSpine("c7")}
                    onMouseLeave={() => setHoveredSpine(null)}
                    style={{ cursor: "move", pointerEvents: "auto", touchAction: "none" }}
                  >
                    {/* hit area maior para facilitar o drag */}
                    <circle cx={c7.x} cy={c7.y} r={3.2} fill="transparent" />
                    <circle cx={c7.x} cy={c7.y} r={1.6} fill={lineColor} stroke="#000" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 1 }}>
                      <title>{(c7 as any).manual ? "C7 — ✥ posicionado manualmente (arraste para reajustar)" : (c7 as any).snapped ? `C7 — 📐 snap automático. Arraste para mover livremente.` : "C7 — arraste para mover livremente"}</title>
                    </circle>
                    {/* ícone ✥ indicando movimento livre */}
                    <text x={c7.x} y={c7.y - 2.6} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize={2} style={{ pointerEvents: "none", userSelect: "none" }}>✥</text>
                  </g>
                  <g
                    onMouseDown={beginSpineDrag("l5")}
                    onTouchStart={beginSpineDrag("l5")}
                    onMouseEnter={() => setHoveredSpine("l5")}
                    onMouseLeave={() => setHoveredSpine(null)}
                    style={{ cursor: "move", pointerEvents: "auto", touchAction: "none" }}
                  >
                    <circle cx={l5.x} cy={l5.y} r={3.2} fill="transparent" />
                    <circle cx={l5.x} cy={l5.y} r={1.6} fill={lineColor} stroke="#000" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 1 }}>
                      <title>{(l5 as any).manual ? "L5 — ✥ posicionado manualmente (arraste para reajustar)" : (l5 as any).snapped ? `L5 — 📐 snap automático. Arraste para mover livremente.` : "L5 — arraste para mover livremente"}</title>
                    </circle>
                    <text x={l5.x} y={l5.y - 2.6} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize={2} style={{ pointerEvents: "none", userSelect: "none" }}>✥</text>
                  </g>

                  {/* Onboarding pulse + tooltip (primeira análise completa) */}
                  {showOnboarding && analiseCompleta && (
                    <g pointerEvents="none">
                      <circle cx={c7.x} cy={c7.y} r={3} fill="rgba(184,146,42,0.25)" stroke="#B8922A" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 0.6 }}>
                        <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      <line x1={c7.x + 6} y1={c7.y - 6} x2={c7.x + 1.8} y2={c7.y - 1.8} stroke="#B8922A" strokeWidth={0.4} strokeDasharray="0.8 0.4" vectorEffect="non-scaling-stroke" />
                      <rect x={c7.x + 5} y={c7.y - 14} width={34} height={8} rx={1.2} fill="rgba(184,146,42,0.95)" />
                      <text x={c7.x + 22} y={c7.y - 10.3} textAnchor="middle" fill="#0A0A0F" fontSize={2.1} fontWeight={700}>✥ Arraste C7 e L5</text>
                      <text x={c7.x + 22} y={c7.y - 7.6} textAnchor="middle" fill="#0A0A0F" fontSize={1.7} opacity={0.85}>toque e ajuste a posição</text>
                    </g>
                  )}

                  {/* Handle central — arrasta C7+L5 juntos (mover coluna inteira) */}
                  <g
                    onMouseDown={beginColumnDrag}
                    onTouchStart={beginColumnDrag}
                    style={{ cursor: "move", pointerEvents: "auto", touchAction: "none" }}
                  >
                    <circle cx={mxS} cy={myS} r={3.5} fill="transparent" />
                    <circle
                      cx={mxS} cy={myS} r={1.9}
                      fill="rgba(184,146,42,0.22)"
                      stroke="#B8922A"
                      strokeDasharray="0.8 0.4"
                      vectorEffect="non-scaling-stroke"
                      style={{ strokeWidth: 0.9 }}
                    >
                      <title>Arraste para mover a coluna inteira (C7 + L5)</title>
                    </circle>
                    <text
                      x={mxS} y={myS + 0.8}
                      textAnchor="middle"
                      fill="#B8922A"
                      fontSize={2.1}
                      fontWeight={700}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >✥</text>
                  </g>

                  {/* Apenas a linha C7→L5 + handle central; sem textos, comprimento ou badges */}
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
                  {/* losango central já é a affordance de clique — sem badge textual */}
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
                {/* label do ângulo removido — sem badge fixo */}
              </g>
            );
          });
        })()}

        {/* Conectores landmark→label removidos: labels não existem mais */}

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
              style={{ strokeWidth: isCritical ? (isPrimary ? 2 : 1.5) : confStyle.strokeWidth, cursor: "default", pointerEvents: "auto" }}
              onMouseEnter={() => setHoveredLm(q.key)}
              onMouseLeave={() => setHoveredLm((h) => (h === q.key ? null : h))}
            />
          );
        })}

        {/* ─── Handles arrastáveis para ombros, escápulas e quadris ─── */}
        {(() => {
          const visibleKeys: DragLmKey[] =
            data.view === "front"
              ? ["shoulder_left", "shoulder_right", "hip_left", "hip_right"]
              : data.view === "back"
              ? ["shoulder_left", "shoulder_right", "scapula_left", "scapula_right", "hip_left", "hip_right"]
              : [];
          return visibleKeys.map((k) => {
            const p = (lm as any)[k];
            if (!isValidPoint(p)) return null;
            const style = LM_DRAG_STYLE[k];
            const ajustado = !!manualLandmarks?.[k];
            const fill = ajustado ? style.cor : `${style.cor}B3`;
            return (
              <g
                key={`drag-${k}`}
                onMouseDown={beginLandmarkDrag(k)}
                onTouchStart={beginLandmarkDrag(k)}
                onMouseEnter={() => setHoveredLm(k)}
                onMouseLeave={() => setHoveredLm((h) => (h === k ? null : h))}
                style={{ cursor: "move", pointerEvents: "auto", touchAction: "none" }}
              >
                {/* hit-area generosa */}
                <circle cx={p.x} cy={p.y} r={3.5} fill="transparent" />
                {/* anel tracejado — indica arrastável */}
                <circle
                  cx={p.x} cy={p.y} r={2.2}
                  fill="none"
                  stroke={ajustado ? style.cor : `${style.cor}80`}
                  strokeDasharray="0.8 0.6"
                  vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: 0.6 }}
                />
                {/* círculo principal — sem textos fixos */}
                <circle
                  cx={p.x} cy={p.y} r={1.4}
                  fill={fill}
                  stroke={style.corBorda}
                  vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: 0.8 }}
                />
              </g>
            );
          });
        })()}



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

        {/* Tooltip de landmark — aparece apenas no hover */}
        {hoveredLm && (lm as any)[hoveredLm] && isValidPoint((lm as any)[hoveredLm]) && (() => {
          const p = (lm as any)[hoveredLm];
          const label = (LM_DRAG_STYLE as any)[hoveredLm]?.label || p.label || hoveredLm;
          const cor = (LM_DRAG_STYLE as any)[hoveredLm]?.cor || "#FFFFFF";
          const goRight = p.x < 80;
          const tx = goRight ? p.x + 2 : p.x - 2;
          const tw = Math.max(12, label.length * 1.05 + 2);
          return (
            <g pointerEvents="none">
              <rect
                x={goRight ? tx : tx - tw}
                y={p.y - 2.6}
                width={tw}
                height={3.4}
                rx={0.8}
                fill="rgba(10,10,15,0.92)"
                stroke={`${cor}80`}
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: 0.4 }}
              />
              <text
                x={goRight ? tx + tw / 2 : tx - tw / 2}
                y={p.y - 0.4}
                textAnchor="middle"
                fill={cor}
                fontSize={1.8}
                fontWeight={700}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {label}
              </text>
            </g>
          );
        })()}


      </>)}
      </svg>

      {modoTecnico && (<> {/* Legenda de severidade dos landmarks */}
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

      {/* Labels e badges fixos removidos — tooltip aparece apenas no hover sobre cada landmark */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Education Mode balloons — apenas quando eduMode ativo (toggle) */}
        {eduMode && (() => {
          // Só mostra a tag educativa em landmarks com desvio de verdade —
          // antes, aparecia uma pra cada ombro/quadril/joelho sempre, mesmo
          // 100% normais, virando uma pilha de caixinhas sobrepostas na foto.
          const deviatedAnchors = new Set(
            Object.entries(data.angles || {})
              .filter(([, a]) => severityOf(a.value, a.normal) !== "ok")
              .map(([k]) => anchorLandmark(data.view, k))
              .filter(Boolean),
          );
          const eduItems = Object.entries(lm)
            .filter(([k, p]) => PRIMARY.has(k) && isValidPoint(p) && EDU[k] && deviatedAnchors.has(k));

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
      </div></>)}
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


// ─── AnatomyEducationPanel — guia educativo no sidebar ──────────
function AnatomyEducationPanel({
  c7Ajustado,
  l5Ajustado,
}: {
  c7Ajustado: boolean;
  l5Ajustado: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const refs = [
    {
      id: "C7",
      cor: "#B8922A",
      bg: "rgba(184,146,42,0.08)",
      border: "rgba(184,146,42,0.2)",
      onde: "Base do pescoço — saliência mais proeminente onde o pescoço encontra os ombros",
      como: 'Procure o "calombo" no centro da base do pescoço. É o ponto mais saliente nessa região.',
      erro: "Não confundir com C5 ou C6 — sempre use o processo espinhoso MAIS proeminente",
      ajustado: c7Ajustado,
    },
    {
      id: "L5",
      cor: "#38BDF8",
      bg: "rgba(56,189,248,0.08)",
      border: "rgba(56,189,248,0.2)",
      onde: 'Junção lombossacra — nível das fossetas sacras (dois "furinhos" acima do glúteo)',
      como: 'Trace uma linha imaginária entre os dois "furinhos" simétricos acima do glúteo. L5 está no centro dessa linha.',
      erro: "Não existe L6 ou L7 — a coluna lombar termina em L5",
      ajustado: l5Ajustado,
    },
  ];
  return (
    <div
      style={{
        marginBottom: 12,
        background: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(184,146,42,0.2)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: "10px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26, height: 26,
              background: "rgba(184,146,42,0.12)",
              border: "0.5px solid rgba(184,146,42,0.3)",
              borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: "#B8922A",
            }}
          >🦴</div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#B8922A", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Onde ficam C7 e L5?
            </p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: 0 }}>
              Guia rápido de posicionamento
            </p>
          </div>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>
      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
          {/* Silhueta de referência SVG (costas) */}
          <svg viewBox="0 0 120 280" style={{ width: "100%", maxHeight: 200, margin: "10px 0", display: "block" }}>
            <ellipse cx={60} cy={22} rx={16} ry={18} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            <rect x={53} y={38} width={14} height={14} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            <path d="M 25 52 Q 20 100 22 160 L 98 160 Q 100 100 95 52 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
            <rect x={8} y={52} width={16} height={80} rx={8} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <rect x={96} y={52} width={16} height={80} rx={8} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <rect x={22} y={160} width={76} height={36} rx={4} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
            <rect x={24} y={196} width={30} height={70} rx={8} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <rect x={66} y={196} width={30} height={70} rx={8} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <line x1={60} y1={52} x2={60} y2={190} stroke="rgba(255,255,255,0.12)" strokeWidth={2} strokeDasharray="3 2" />
            {/* C7 */}
            <circle cx={60} cy={51} r={6} fill="rgba(184,146,42,0.3)" stroke="#B8922A" strokeWidth={1.5} />
            <text x={60} y={54} textAnchor="middle" fill="#B8922A" fontSize={5} fontWeight={700}>C7</text>
            <line x1={66} y1={51} x2={90} y2={51} stroke="#B8922A" strokeWidth={0.8} strokeDasharray="2 1" />
            <text x={92} y={54} fill="#B8922A" fontSize={7}>← base do pescoço</text>
            {/* L5 */}
            <circle cx={60} cy={158} r={6} fill="rgba(56,189,248,0.3)" stroke="#38BDF8" strokeWidth={1.5} />
            <text x={60} y={161} textAnchor="middle" fill="#38BDF8" fontSize={5} fontWeight={700}>L5</text>
            <line x1={66} y1={158} x2={90} y2={158} stroke="#38BDF8" strokeWidth={0.8} strokeDasharray="2 1" />
            <text x={92} y={161} fill="#38BDF8" fontSize={7}>← acima do glúteo</text>
            {/* fossetas sacras */}
            <circle cx={52} cy={165} r={2.5} fill="rgba(56,189,248,0.4)" />
            <circle cx={68} cy={165} r={2.5} fill="rgba(56,189,248,0.4)" />
          </svg>
          {refs.map((ref, i) => (
            <div key={ref.id} style={{
              marginBottom: i === 0 ? 8 : 0,
              padding: "10px 12px",
              background: ref.bg,
              border: `0.5px solid ${ref.border}`,
              borderRadius: 9,
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, color: ref.cor,
                margin: "0 0 6px", display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{
                  width: 16, height: 16, background: `${ref.cor}33`,
                  borderRadius: "50%", display: "inline-flex",
                  alignItems: "center", justifyContent: "center", fontSize: 8,
                }}>{ref.id === "C7" ? "↑" : "↓"}</span>
                {ref.id}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div>
                  <p style={{ fontSize: 8, color: `${ref.cor}cc`, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 2px" }}>
                    Onde fica
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.4 }}>
                    {ref.onde}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 8, color: `${ref.cor}cc`, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 2px" }}>
                    Como identificar na foto
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.4 }}>
                    {ref.como}
                  </p>
                </div>
                <div style={{
                  padding: "4px 8px",
                  background: "rgba(239,68,68,0.08)",
                  border: "0.5px solid rgba(239,68,68,0.15)",
                  borderRadius: 5,
                }}>
                  <p style={{ fontSize: 9, color: "rgba(239,68,68,0.75)", margin: 0, lineHeight: 1.4 }}>
                    ⚠ {ref.erro}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
            {refs.map((ref) => (
              <div key={ref.id} style={{
                flex: 1, padding: "6px 8px",
                background: ref.ajustado ? "rgba(52,211,153,0.07)" : "rgba(255,255,255,0.03)",
                border: `0.5px solid ${ref.ajustado ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 7, textAlign: "center",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: ref.ajustado ? "#34D399" : ref.cor, margin: "0 0 2px" }}>
                  {ref.id}
                </p>
                <p style={{ fontSize: 9, color: ref.ajustado ? "rgba(52,211,153,0.6)" : "rgba(255,255,255,0.3)", margin: 0 }}>
                  {ref.ajustado? "✓ posicionado" : "posição do sistema"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EducationCard — conteúdo educativo por achado clínico ─────────
function EducationCard({
  findingKey,
  eduMode,
}: {
  findingKey: string;
  eduMode: boolean;
}) {
  const [secaoAberta, setSecaoAberta] = useState<"o_que_e" | "por_que" | "muda" | null>("o_que_e");
  const content = getEducationContent(findingKey);
  if (!content || !eduMode) return null;

  const secoes = [
    { id: "o_que_e" as const, icon: "◎", label: "O que está acontecendo", cor: "#38BDF8", bg: "rgba(56,189,248,0.06)" },
    { id: "por_que" as const, icon: "◈", label: "Por que isso importa",   cor: "#FBBF24", bg: "rgba(251,191,36,0.06)" },
    { id: "muda"    as const, icon: "⬡", label: "O que vai mudar",        cor: "#34D399", bg: "rgba(52,211,153,0.06)" },
  ];

  return (
    <div style={{
      marginTop: 8,
      background: "rgba(255,255,255,0.02)",
      border: "0.5px solid rgba(255,255,255,0.07)",
      borderRadius: 10,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "8px 12px",
        background: "rgba(255,255,255,0.03)",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{
          fontSize: 8, fontWeight: 600,
          color: "rgba(56,189,248,0.7)",
          background: "rgba(56,189,248,0.1)",
          border: "0.5px solid rgba(56,189,248,0.2)",
          borderRadius: 5, padding: "1px 6px",
          letterSpacing: "0.08em",
        }}>MODO EDUCAÇÃO</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", flex: 1 }}>
          {content.o_que_e.titulo}
        </span>
      </div>

      {secoes.map((secao) => {
        const isOpen = secaoAberta === secao.id;
        let conteudo: string[] = [];
        if (secao.id === "o_que_e") {
          conteudo = [content.o_que_e.texto, `💡 ${content.o_que_e.analogia}`];
        } else if (secao.id === "por_que") {
          conteudo = [
            `👁 Visual: ${content.por_que_importa.impacto_visual}`,
            `🏆 Palco: ${content.por_que_importa.impacto_palco}`,
            `🫀 Saúde: ${content.por_que_importa.impacto_saude}`,
          ];
        } else {
          conteudo = [
            `🏋 ${content.o_que_muda.no_treino}`,
            `⏱ Prazo: ${content.o_que_muda.tempo_medio}`,
            `✓ Resultado: ${content.o_que_muda.resultado}`,
          ];
        }
        return (
          <div key={secao.id}>
            <div
              onClick={() => setSecaoAberta(isOpen ? null : secao.id)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                background: isOpen ? secao.bg : "transparent",
                borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                transition: "background .15s",
              }}
            >
              <span style={{ fontSize: 11, color: secao.cor, flexShrink: 0 }}>{secao.icon}</span>
              <span style={{
                fontSize: 11, fontWeight: isOpen ? 600 : 400,
                color: isOpen ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)",
                flex: 1,
              }}>{secao.label}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div style={{
                padding: "10px 12px",
                background: secao.bg,
                borderBottom: "0.5px solid rgba(255,255,255,0.05)",
              }}>
                {conteudo.map((linha, i) => (
                  <p key={i} style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.65)",
                    margin: i < conteudo.length - 1 ? "0 0 8px" : "0",
                    lineHeight: 1.6,
                  }}>{linha}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{
        padding: "8px 12px",
        background: "rgba(167,139,250,0.04)",
        borderTop: "0.5px solid rgba(255,255,255,0.05)",
        display: "flex", gap: 8, alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 12, flexShrink: 0 }}>🧬</span>
        <p style={{
          fontSize: 10,
          color: "rgba(167,139,250,0.7)",
          margin: 0, lineHeight: 1.5,
          fontStyle: "italic",
        }}>
          <strong style={{ color: "#A78BFA" }}>Sabia que?</strong>{" "}
          {content.sabia_que}
        </p>
      </div>
    </div>
  );
}

// ─── EducationSummary — resumo educativo geral da avaliação ────────
function EducationSummary({
  findings,
  atletaNome,
  eduMode,
}: {
  findings: Array<{ sev: "ok" | "alt" | "sev" }>;
  atletaNome?: string;
  eduMode: boolean;
}) {
  if (!eduMode) return null;
  const criticos  = findings.filter((f) => f.sev === "sev").length;
  const moderados = findings.filter((f) => f.sev === "alt").length;
  const normais   = findings.filter((f) => f.sev === "ok").length;

  const nome = atletaNome ? atletaNome : "Atleta";
  const mensagem =
    criticos === 0 && moderados === 0
      ? `${atletaNome ? atletaNome + ", sua" : "Sua"} postura está bem equilibrada. Nenhum desvio significativo detectado nesta vista.`
      : `${nome}, foram encontrados ` +
        `${criticos > 0 ? `${criticos} ponto(s) que precisam de atenção` : ""}` +
        `${criticos > 0 && moderados > 0 ? " e " : ""}` +
        `${moderados > 0 ? `${moderados} ponto(s) para monitorar` : ""}` +
        `. Clique em cada achado para entender o que significa.`;

  const barras = [
    { count: criticos,  label: "Atenção",   cor: "#EF4444" },
    { count: moderados, label: "Monitorar", cor: "#FBBF24" },
    { count: normais,   label: "Normal",    cor: "#34D399" },
  ];

  return (
    <div style={{
      marginBottom: 14, padding: "12px 14px",
      background: "rgba(255,255,255,0.03)",
      border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
    }}>
      <p style={{
        fontSize: 9, fontWeight: 600,
        color: "rgba(255,255,255,0.3)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        margin: "0 0 8px",
      }}>RESUMO DA AVALIAÇÃO</p>
      <p style={{
        fontSize: 12, color: "rgba(255,255,255,0.75)",
        margin: "0 0 10px", lineHeight: 1.6,
      }}>{mensagem}</p>
      <div style={{ display: "flex", gap: 6 }}>
        {barras.map((item, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center",
            padding: "6px 4px",
            background: `${item.cor}10`,
            border: `0.5px solid ${item.cor}25`,
            borderRadius: 7,
          }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: item.cor, margin: "0 0 1px" }}>{item.count}</p>
            <p style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", margin: 0 }}>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
