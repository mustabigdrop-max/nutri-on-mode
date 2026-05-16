import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, ChevronDown, BookOpen, Link2, Eye } from "lucide-react";

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
}

export default function ApexVisualOverlay({ landmarks, photos, athleteName, category }: Props) {
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
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("apex-edu-mode", eduMode ? "1" : "0"); } catch {}
  }, [eduMode]);

  const data = landmarks[view];
  const photoUrl = photos[view];

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

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes apex-chain-dash { to { stroke-dashoffset: -20; } }
        .apex-chain-line { animation: apex-chain-dash 1.2s linear infinite; }
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
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border hover:bg-muted disabled:opacity-50"
            style={{ borderColor: C.gold, color: C.gold }}
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exportando..." : "Exportar"}
          </button>
        </div>
      </div>

      {/* Counter strip */}
      <div className="flex items-center gap-3 text-[11px] font-mono">
        <span style={{ color: C.red }}>● {counts.sev} críticos</span>
        <span style={{ color: C.yellow }}>● {counts.alt} limítrofes</span>
        <span style={{ color: C.green }}>● {counts.ok} normais</span>
      </div>

      {/* Main grid */}
      <div ref={exportRef} className="grid lg:grid-cols-[1fr_340px] gap-4 bg-card rounded-xl p-3 border relative">
        {/* Watermark / footer for export */}
        <div className="absolute top-2 right-3 text-[10px] font-bold tracking-widest opacity-60" style={{ color: C.gold }}>
          nutriON · APEX
        </div>

        {/* Photo + overlay */}
        <div className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center" style={{ minHeight: 360 }}>
          {photoUrl ? (
            <div className="relative inline-block max-w-full">
              <img
                src={photoUrl}
                alt={`Foto ${view}`}
                crossOrigin="anonymous"
                className="block max-w-full max-h-[640px] w-auto h-auto"
                style={{ objectFit: "contain" }}
              />
              {data && (
                <OverlayLayer
                  data={{ ...data, angles: augmentedAngles }}
                  selected={selected}
                  onSelect={setSelected}
                  eduMode={eduMode}
                  chainMode={chainMode}
                  debugMode={debugMode}
                  chains={chains}
                />
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground p-6 text-center">
              Foto da vista <strong>{view}</strong> não disponível.
            </div>
          )}
          {/* Footer caption (visible in export) */}
          <div className="absolute bottom-1 left-2 text-[10px] text-white/60 font-mono">
            {athleteName || "Atleta"} · {category || "—"} · {new Date().toLocaleDateString("pt-BR")}
          </div>
        </div>

        {/* Findings panel */}
        <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Achados clínicos ({findings.length})
          </div>
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

// ─── Overlay (HTML + SVG hybrid for crisp labels) ────────────────
function OverlayLayer({
  data, selected, onSelect, eduMode, chainMode, chains,
}: {
  data: LandmarkView;
  selected: string | null;
  onSelect: (k: string) => void;
  eduMode: boolean;
  chainMode: boolean;
  chains: { name: string; nodes: string[]; description: string }[];
}) {
  const lm = data.landmarks;
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

  return (
    <>
      {/* SVG layer: lines + landmarks */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: "visible" }}
      >
        {/* Plumb line — refined */}
        <line
          x1={50} y1={0} x2={50} y2={100}
          stroke={C.white}
          strokeOpacity={0.35}
          strokeDasharray="2 1"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 1.5 }}
        />

        {/* View-specific lines */}
        {data.view === "front" && (
          <>
            <SvgLine p1={lm.shoulder_left} p2={lm.shoulder_right} color={colorBySev(lineSev("shoulder_tilt"))} />
            <SvgLine p1={lm.hip_left} p2={lm.hip_right} color={colorBySev(lineSev("hip_tilt"))} />
            <SvgLine p1={lm.hip_left} p2={lm.ankle_left} color={colorBySev(lineSev("knee_valgus_left"))} />
            <SvgLine p1={lm.hip_right} p2={lm.ankle_right} color={colorBySev(lineSev("knee_valgus_right"))} />
          </>
        )}
        {data.view === "lateral" && (
          <SvgPolyline
            points={["ear", "shoulder", "hip_greater_trochanter", "knee_lateral", "ankle_lateral"].map((k) => lm[k]).filter(isValidPoint)}
            color={colorBySev(lineSev("plumb_line_deviation"))}
          />
        )}
        {data.view === "back" && (
          <>
            <SvgLine p1={lm.shoulder_left} p2={lm.shoulder_right} color={colorBySev(lineSev("shoulder_asymmetry"))} />
            <SvgLine p1={lm.hip_left} p2={lm.hip_right} color={colorBySev(lineSev("hip_asymmetry"))} />
            <SvgLine p1={lm.spine_c7} p2={lm.spine_l5} color={colorBySev(lineSev("spinal_lateral_deviation"))} dashed />
            {/* Scapular axis */}
            {isValidPoint(lm.scapula_left) && isValidPoint(lm.scapula_right) && (
              <>
                <SvgLine
                  p1={lm.scapula_left}
                  p2={lm.scapula_right}
                  color={colorBySev(lineSev("scapular_axis_tilt"))}
                />
                <circle
                  cx={(lm.scapula_left.x + lm.scapula_right.x) / 2}
                  cy={(lm.scapula_left.y + lm.scapula_right.y) / 2}
                  r={0.6}
                  fill={C.cyan}
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </>
        )}

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

        {/* Landmarks: primary vs secondary */}
        {labelPositions.map((q) => {
          const isPrimary = PRIMARY.has(q.key);
          return (
            <circle
              key={`pt-${q.key}`}
              cx={q.px} cy={q.py}
              r={isPrimary ? 1.1 : 0.75}
              fill={isPrimary ? `${C.gold}99` : `${C.white}66`}
              stroke={isPrimary ? C.gold : C.white}
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: isPrimary ? 2 : 1.5 }}
            />
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

        {/* Plumb line label */}
        <text x={50.5} y={2.5} fontSize={2} fill={C.white} opacity={0.6}>Linha de Prumo</text>
      </svg>

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

        {/* Angle badges — positioned outside silhouette */}
        {Object.entries(ang).map(([k, a]) => {
          const anchor = anchorForAngle(data.view, k, lm);
          if (!anchor) return null;
          const sev = severityOf(a.value, a.normal);
          const color = colorBySev(sev);
          const unit = a.unit?.includes("graus") ? "°" : a.unit?.includes("cm") ? "cm" : "";
          const arrow = directionArrow(k, a.value);
          const active = selected === k;
          // Push exterior
          const exterior = anchor.x < 50 ? -1 : 1;
          const bx = Math.max(2, Math.min(98, anchor.x + exterior * 8));
          const by = Math.max(2, Math.min(98, anchor.y));
          return (
            <div key={`ang-${k}`} style={{ position: "absolute", left: `${bx}%`, top: `${by}%`, transform: exterior > 0 ? "translate(0,-50%)" : "translate(-100%,-50%)", pointerEvents: "auto" }}>
              <button
                onClick={() => onSelect(active ? "" : k)}
                className="text-[10px] font-mono font-bold transition-all"
                style={{
                  background: "rgba(0,0,0,0.78)",
                  color,
                  border: `1.5px solid ${color}`,
                  borderRadius: 4,
                  padding: "2px 6px",
                  boxShadow: active ? `0 0 8px ${color}` : "none",
                }}
              >
                {a.value}{unit}{arrow}
              </button>
              {active && (
                <div className="mt-1 text-[10px] rounded-md p-2 shadow-xl max-w-[220px]" style={{ background: C.dark, color: C.white, border: `1px solid ${color}` }}>
                  <div className="font-bold mb-1" style={{ color }}>{FRIENDLY[k] || k}</div>
                  <div className="opacity-70">Normal: {a.normal}</div>
                  <div className="mt-1 opacity-90">{a.finding}</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Education Mode balloons */}
        {eduMode && Object.entries(lm).filter(([k, p]) => PRIMARY.has(k) && isValidPoint(p) && EDU[k]).map(([k, p]) => {
          const exterior = p.x < 50 ? -1 : 1;
          const bx = Math.max(2, Math.min(98, p.x + exterior * 10));
          const by = Math.max(2, Math.min(95, p.y + 4));
          const edu = EDU[k];
          return (
            <div
              key={`edu-${k}`}
              className="absolute text-[10px] leading-tight"
              style={{
                left: `${bx}%`,
                top: `${by}%`,
                transform: exterior > 0 ? "translate(0,0)" : "translate(-100%,0)",
                background: C.dark,
                border: `1px solid ${C.cyan}`,
                borderRadius: 6,
                padding: "4px 6px",
                maxWidth: 140,
                color: C.white,
              }}
            >
              <div className="font-bold mb-0.5" style={{ color: C.cyan }}>{lm[k].label}</div>
              <div className="opacity-75">{edu.reveals}</div>
              {edu.dom && <div className="mt-0.5">💪 <span className="opacity-90">{edu.dom}</span></div>}
              {edu.inh && <div>⚠️ <span className="opacity-90">{edu.inh}</span></div>}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── SVG helpers ─────────────────────────────────────────────────
function SvgLine({ p1, p2, color, dashed }: { p1?: Landmark; p2?: Landmark; color: string; dashed?: boolean }) {
  if (!isValidPoint(p1) || !isValidPoint(p2)) return null;
  return (
    <line
      x1={p1!.x} y1={p1!.y} x2={p2!.x} y2={p2!.y}
      stroke={color}
      strokeDasharray={dashed ? "2 1" : undefined}
      vectorEffect="non-scaling-stroke"
      style={{ strokeWidth: 2 }}
    />
  );
}

function SvgPolyline({ points, color }: { points: Landmark[]; color: string }) {
  if (points.length < 2) return null;
  return (
    <polyline
      points={points.map((p) => `${p.x},${p.y}`).join(" ")}
      fill="none"
      stroke={color}
      vectorEffect="non-scaling-stroke"
      style={{ strokeWidth: 2 }}
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
