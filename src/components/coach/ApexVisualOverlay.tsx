import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

// ─── Tokens (kept local — APEX dark identity) ────────────────────
const C = {
  gold: "#B8922A",
  cyan: "#00D4FF",
  red: "#FF3344",
  green: "#1DB87A",
  yellow: "#FFB800",
  white: "#FFFFFF",
};

// ─── Helpers ─────────────────────────────────────────────────────
const isValidPoint = (p?: Landmark | null) =>
  !!p && (Number.isFinite(p.x) && Number.isFinite(p.y)) && !(p.x === 0 && p.y === 0);

// Parse "<5°", "0-10°", "0°", "20-40°", "<2.5cm", "0cm" etc.
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
  // single value ("0°") — allow ±2 tolerance
  return Math.abs(value - single) <= 2;
}

function severityOf(value: number, normal: string): "ok" | "alt" | "sev" {
  if (isWithinNormal(value, normal)) return "ok";
  const s = normal.replace(/[^\d.<>\-]/g, "").trim();
  let limit = 5;
  if (s.startsWith("<")) limit = parseFloat(s.slice(1));
  else if (s.includes("-")) {
    const [lo, hi] = s.split("-").map(parseFloat);
    limit = Math.max(Math.abs(value - lo), Math.abs(value - hi));
  } else {
    const sv = parseFloat(s);
    if (!Number.isNaN(sv)) limit = sv;
  }
  return Math.abs(value) >= limit * 2 ? "sev" : "alt";
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
};

// ─── Component ───────────────────────────────────────────────────
interface Props {
  landmarks: LandmarkBundle;
  photos: PhotoBundle;
  athleteName?: string;
}

export default function ApexVisualOverlay({ landmarks, photos, athleteName }: Props) {
  const availableViews = (["front", "lateral", "back"] as const).filter(
    (v) => landmarks[v] || photos[v]
  );
  const [view, setView] = useState<"front" | "lateral" | "back">(
    availableViews[0] || "front"
  );
  const [selected, setSelected] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const data = landmarks[view];
  const photoUrl = photos[view];

  const findings = useMemo(() => {
    if (!data?.angles) return [];
    return Object.entries(data.angles)
      .map(([k, a]) => ({
        key: k,
        label: FRIENDLY[k] || k,
        value: a.value,
        unit: a.unit,
        normal: a.normal,
        finding: a.finding,
        sev: severityOf(a.value, a.normal),
      }))
      .sort((a, b) => {
        const order = { sev: 0, alt: 1, ok: 2 } as const;
        return order[a.sev] - order[b.sev];
      });
  }, [data]);

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
        scale: 2,
        backgroundColor: "#03040A",
        useCORS: true,
        allowTaint: true,
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

  return (
    <div className="space-y-4">
      {/* Header / view switcher */}
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
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border hover:bg-muted disabled:opacity-50"
          style={{ borderColor: C.gold, color: C.gold }}
        >
          <Download className="w-3.5 h-3.5" />
          {exporting ? "Exportando..." : "Exportar Análise Visual"}
        </button>
      </div>

      {/* Main grid */}
      <div ref={exportRef} className="grid lg:grid-cols-[1fr_320px] gap-4 bg-card rounded-xl p-3 border">
        {/* Photo + overlay */}
        <div className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center" style={{ minHeight: 360 }}>
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt={`Foto ${view}`}
                crossOrigin="anonymous"
                className="block max-w-full max-h-[640px] w-auto h-auto"
                style={{ objectFit: "contain" }}
              />
              {data && (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ overflow: "visible" }}
                >
                  <Overlay
                    data={data}
                    selected={selected}
                    onSelect={(k) => setSelected(k)}
                  />
                </svg>
              )}
            </>
          ) : (
            <div className="text-xs text-muted-foreground p-6 text-center">
              Foto da vista <strong>{view}</strong> não disponível.
            </div>
          )}
        </div>

        {/* Findings panel */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Achados clínicos
          </div>
          {findings.length === 0 && (
            <div className="text-xs text-muted-foreground">Nenhum ângulo retornado.</div>
          )}
          {findings.map((f) => {
            const color = f.sev === "sev" ? C.red : f.sev === "alt" ? C.yellow : C.green;
            const icon = f.sev === "sev" ? "🔴" : f.sev === "alt" ? "⚠️" : "✅";
            const active = selected === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setSelected(active ? null : f.key)}
                className="w-full text-left rounded-lg p-2 border transition-all"
                style={{
                  background: active ? `${color}1A` : "transparent",
                  borderColor: active ? color : "hsl(var(--border))",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold text-foreground truncate">
                    {icon} {f.label}
                  </div>
                  <div className="text-[11px] font-mono shrink-0" style={{ color }}>
                    {f.value}{f.unit?.includes("graus") ? "°" : f.unit?.includes("cm") ? "cm" : ""}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Normal: {f.normal}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-snug">
                  {f.finding}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Educational expandable */}
      {findings.filter((f) => f.sev !== "ok").length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            📚 Entenda os achados
          </div>
          {findings
            .filter((f) => f.sev !== "ok")
            .map((f) => (
              <details
                key={f.key}
                className="rounded-lg border bg-card p-2 group"
              >
                <summary className="cursor-pointer text-xs font-semibold text-foreground flex items-center justify-between gap-2">
                  <span>{f.label} — {f.value}{f.unit?.includes("graus") ? "°" : ""}</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                  {f.finding}
                </div>
              </details>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── SVG overlay per view ────────────────────────────────────────
function Overlay({
  data, selected, onSelect,
}: {
  data: LandmarkView;
  selected: string | null;
  onSelect: (k: string) => void;
}) {
  const lm = data.landmarks;
  const ang = data.angles;

  // Helper: render a line between two named landmarks
  const Line = (a: string, b: string, color: string, dashed = false, key = `${a}-${b}`) => {
    const p1 = lm[a]; const p2 = lm[b];
    if (!isValidPoint(p1) || !isValidPoint(p2)) return null;
    return (
      <line
        key={key}
        x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke={color}
        strokeWidth={0.35}
        strokeDasharray={dashed ? "1.2 0.8" : undefined}
        vectorEffect="non-scaling-stroke"
        style={{ strokeWidth: 1.5 }}
      />
    );
  };

  // Plumb line (vertical center)
  const Plumb = (
    <line
      x1={50} y1={0} x2={50} y2={100}
      stroke={C.white}
      strokeOpacity={0.4}
      strokeDasharray="1.5 1"
      vectorEffect="non-scaling-stroke"
      style={{ strokeWidth: 1 }}
    />
  );

  // Build view-specific decorations
  let viewLines: React.ReactNode = null;
  if (data.view === "front") {
    const valgoL = (ang.knee_valgus_left?.value || 0) > 5;
    const valgoR = (ang.knee_valgus_right?.value || 0) > 5;
    viewLines = (
      <>
        {Plumb}
        {Line("shoulder_left", "shoulder_right", C.cyan, false, "sho")}
        {Line("hip_left", "hip_right", C.cyan, false, "hip")}
        {Line("hip_left", "ankle_left", valgoL ? C.red : C.green, false, "legL")}
        {Line("hip_right", "ankle_right", valgoR ? C.red : C.green, false, "legR")}
      </>
    );
  } else if (data.view === "lateral") {
    const chain = ["ear", "shoulder", "hip_greater_trochanter", "knee_lateral", "ankle_lateral"];
    const points = chain.map((k) => lm[k]).filter(isValidPoint);
    viewLines = (
      <>
        {Plumb}
        {points.length > 1 && (
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={C.green}
            strokeOpacity={0.85}
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 1.5 }}
          />
        )}
      </>
    );
  } else {
    viewLines = (
      <>
        {Plumb}
        {Line("shoulder_left", "shoulder_right", C.cyan, false, "sho")}
        {Line("hip_left", "hip_right", C.cyan, false, "hip")}
        {Line("spine_c7", "spine_l5", C.yellow, false, "spine")}
      </>
    );
  }

  return (
    <g>
      {viewLines}

      {/* Landmarks */}
      {Object.entries(lm).map(([key, p]) => {
        if (!isValidPoint(p)) return null;
        return (
          <g key={key} style={{ pointerEvents: "auto", cursor: "pointer" }}>
            <circle
              cx={p.x} cy={p.y} r={0.9}
              fill={C.gold}
              stroke="#000"
              strokeOpacity={0.6}
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: 0.5 }}
            />
            <text
              x={p.x + 1.5} y={p.y + 0.5}
              fontSize={2.2}
              fill={C.white}
              fontWeight={600}
              style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 0.4, strokeOpacity: 0.7 }}
            >
              {p.label}
            </text>
          </g>
        );
      })}

      {/* Angle markers — small badges anchored to relevant landmark */}
      {Object.entries(ang).map(([k, a]) => {
        const anchor = anchorForAngle(data.view, k, lm);
        if (!anchor) return null;
        const ok = isWithinNormal(a.value, a.normal);
        const color = ok ? C.green : C.red;
        const active = selected === k;
        const unit = a.unit?.includes("graus") ? "°" : a.unit?.includes("cm") ? "cm" : "";
        return (
          <g
            key={k}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            onClick={() => onSelect(k)}
            opacity={active ? 1 : 0.92}
          >
            <Popover open={active} onOpenChange={(o) => !o && onSelect(k)}>
              <PopoverTrigger asChild>
                <g>
                  <rect
                    x={anchor.x - 4} y={anchor.y - 2}
                    width={8} height={3}
                    rx={1}
                    fill="#000"
                    fillOpacity={0.75}
                    stroke={color}
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: active ? 1.5 : 0.8 }}
                  />
                  <text
                    x={anchor.x} y={anchor.y + 0.2}
                    fontSize={2}
                    fill={color}
                    textAnchor="middle"
                    fontWeight={800}
                  >
                    {a.value}{unit}
                  </text>
                </g>
              </PopoverTrigger>
              {active && (
                <PopoverContent side="top" className="text-xs max-w-xs">
                  <div className="font-bold mb-1" style={{ color }}>{FRIENDLY[k] || k}</div>
                  <div className="text-muted-foreground">Normal: {a.normal}</div>
                  <div className="mt-1">{a.finding}</div>
                </PopoverContent>
              )}
            </Popover>
          </g>
        );
      })}
    </g>
  );
}

// Where to anchor each angle badge (best-effort, skips if landmarks missing)
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
    if (key === "knee_valgus_left") return isValidPoint(lm.knee_left) ? { x: lm.knee_left.x - 6, y: lm.knee_left.y } : null;
    if (key === "knee_valgus_right") return isValidPoint(lm.knee_right) ? { x: lm.knee_right.x + 6, y: lm.knee_right.y } : null;
    if (key === "head_lateral_tilt") return isValidPoint(lm.nose) ? { x: lm.nose.x, y: lm.nose.y - 3 } : null;
  }
  if (view === "lateral") {
    if (key === "forward_head_posture") return isValidPoint(lm.ear) ? { x: lm.ear.x + 5, y: lm.ear.y } : null;
    if (key === "thoracic_kyphosis") return mid(lm.shoulder, lm.hip_greater_trochanter);
    if (key === "lumbar_lordosis") return isValidPoint(lm.hip_greater_trochanter) ? { x: lm.hip_greater_trochanter.x - 5, y: lm.hip_greater_trochanter.y + 2 } : null;
    if (key === "pelvic_tilt") return isValidPoint(lm.hip_greater_trochanter) ? { x: lm.hip_greater_trochanter.x + 5, y: lm.hip_greater_trochanter.y } : null;
    if (key === "plumb_line_deviation") return isValidPoint(lm.ankle_lateral) ? { x: lm.ankle_lateral.x, y: lm.ankle_lateral.y - 4 } : null;
  }
  if (view === "back") {
    if (key === "shoulder_asymmetry") return mid(lm.shoulder_left, lm.shoulder_right);
    if (key === "scapular_winging_left") return isValidPoint(lm.scapula_left) ? { x: lm.scapula_left.x - 6, y: lm.scapula_left.y } : null;
    if (key === "scapular_winging_right") return isValidPoint(lm.scapula_right) ? { x: lm.scapula_right.x + 6, y: lm.scapula_right.y } : null;
    if (key === "spinal_lateral_deviation") return mid(lm.spine_c7, lm.spine_l5);
    if (key === "hip_asymmetry") return mid(lm.hip_left, lm.hip_right);
  }
  return null;
}
