import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  LANDMARK_CATALOG,
  LANDMARK_IDS,
  BLOCK_META,
  SEVERITY_COLOR,
  EDU_LABELS,
  type PosturalLandmark,
  type LandmarkBlock,
  type LandmarkSeverity,
} from "@/types/posturalLandmarks";

export type Postural33Bundle = Record<string, { x: number; y: number; severity?: LandmarkSeverity }>;

interface Props {
  data: Postural33Bundle;
  photoUrl?: string | null;
  athleteHeightCm?: number | null;
}

const AXIS_LINE_COLOR = "rgba(255,255,255,0.6)";
const ASYM_COLOR = "#EF9F27";

function pointOf(data: Postural33Bundle, id: string): PosturalLandmark | null {
  const raw = data[id];
  if (!raw || !Number.isFinite(raw.x) || !Number.isFinite(raw.y)) return null;
  const def = LANDMARK_CATALOG.find((l) => l.id === id);
  if (!def) return null;
  return {
    id,
    label: def.label,
    block: def.block,
    side: def.side,
    x: raw.x,
    y: raw.y,
    severity: raw.severity,
  };
}

function angleBetween(ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.round(Math.atan2(dy, dx) * (180 / Math.PI) * 10) / 10;
}

function angleAt(b: { x: number; y: number }, a: { x: number; y: number }, c: { x: number; y: number }): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const m = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (!m) return 0;
  const cos = Math.max(-1, Math.min(1, dot / m));
  return Math.round((Math.acos(cos) * 180) / Math.PI);
}

export default function ApexPostural33Overlay({ data, photoUrl, athleteHeightCm }: Props) {
  const [eduMode, setEduMode] = useState<boolean>(() => {
    try { return localStorage.getItem("apex-33-edu") === "1"; } catch { return false; }
  });
  const [gridMode, setGridMode] = useState<boolean>(() => {
    try { return localStorage.getItem("apex-33-grid") === "1"; } catch { return false; }
  });
  const [hover, setHover] = useState<string | null>(null);

  const present = useMemo(() => {
    const out: PosturalLandmark[] = [];
    for (const id of LANDMARK_IDS) {
      const p = pointOf(data, id);
      if (p) out.push(p);
    }
    return out;
  }, [data]);

  const blockCounts = useMemo(() => {
    const c: Record<LandmarkBlock, number> = {
      cranial: 0, scapular: 0, spinal: 0, pelvic: 0, lower_limb: 0, foot: 0,
    };
    for (const p of present) c[p.block]++;
    return c;
  }, [present]);

  const toggleEdu = () => {
    const next = !eduMode;
    setEduMode(next);
    try { localStorage.setItem("apex-33-edu", next ? "1" : "0"); } catch {}
  };
  const toggleGrid = () => {
    const next = !gridMode;
    setGridMode(next);
    try { localStorage.setItem("apex-33-grid", next ? "1" : "0"); } catch {}
  };

  if (present.length === 0) {
    return (
      <div className="border border-white/10 bg-black/40 p-4 text-center text-xs text-white/60">
        Landmarks profissionais (33 pontos) não disponíveis nesta análise.
      </div>
    );
  }

  // Linhas-eixo
  const tR = pointOf(data, "trago_r");
  const tL = pointOf(data, "trago_l");
  const aR = pointOf(data, "acromio_r");
  const aL = pointOf(data, "acromio_l");
  const eR = pointOf(data, "eias_r");
  const eL = pointOf(data, "eias_l");
  const kR = pointOf(data, "joelho_r");
  const kL = pointOf(data, "joelho_l");

  const spineChain = ["occipital", "c7", "t4", "t6", "t12", "l3", "l5_s1"]
    .map((id) => pointOf(data, id))
    .filter(Boolean) as PosturalLandmark[];

  // Ângulos
  const shoulderAngle = aR && aL ? Math.abs(angleBetween(aR.x, aR.y, aL.x, aL.y)) : null;
  const pelvicAngle = eR && eL ? Math.abs(angleBetween(eR.x, eR.y, eL.x, eL.y)) : null;
  const kneeAngle = kR && kL ? Math.abs(angleBetween(kR.x, kR.y, kL.x, kL.y)) : null;

  const trochR = pointOf(data, "trocantermaior_r");
  const trochL = pointOf(data, "trocantermaior_l");
  const malR = pointOf(data, "maleolo_r");
  const malL = pointOf(data, "maleolo_l");
  const qAngleR = trochR && kR && malR ? angleAt(kR, trochR, malR) : null;
  const qAngleL = trochL && kL && malL ? angleAt(kL, trochL, malL) : null;

  // Detecção de assimetrias (diferença bilateral em y > 3%)
  const isAsym = (p1?: PosturalLandmark | null, p2?: PosturalLandmark | null) =>
    !!p1 && !!p2 && Math.abs(p1.y - p2.y) > 3;

  const colorFor = (p: PosturalLandmark) =>
    p.severity ? SEVERITY_COLOR[p.severity] : SEVERITY_COLOR.unknown;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
          Landmarks Profissionais — 33 pontos ({present.length}/33)
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleGrid}
            className={`flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors ${
              gridMode ? "border-amber-500/60 bg-amber-500/10 text-amber-300" : "border-white/15 bg-black/50 text-white/80 hover:bg-white/10"
            }`}
          >
            {gridMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            Grade simetrográfica
          </button>
          <button
            onClick={toggleEdu}
            className="flex items-center gap-1.5 border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/80 transition-colors hover:bg-white/10"
          >
            {eduMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            Modo educacional
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden border border-white/10 bg-black">
        {photoUrl ? (
          <img src={photoUrl} alt="Análise postural" className="block h-auto w-full opacity-90" />
        ) : (
          <div className="aspect-[3/4] w-full bg-gradient-to-b from-white/5 to-transparent" />
        )}

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {/* EIXO DE SIMETRIA — tragos (horizontal cranial) */}
          {tR && tL && (
            <line x1={tR.x} y1={tR.y} x2={tL.x} y2={tL.y}
              stroke={AXIS_LINE_COLOR} strokeWidth={0.3} vectorEffect="non-scaling-stroke" />
          )}
          {/* OMBROS */}
          {aR && aL && (
            <line x1={aR.x} y1={aR.y} x2={aL.x} y2={aL.y}
              stroke={isAsym(aR, aL) ? ASYM_COLOR : AXIS_LINE_COLOR}
              strokeDasharray={isAsym(aR, aL) ? "0.8 0.4" : undefined}
              strokeWidth={0.3} vectorEffect="non-scaling-stroke" />
          )}
          {/* PÉLVIS */}
          {eR && eL && (
            <line x1={eR.x} y1={eR.y} x2={eL.x} y2={eL.y}
              stroke={isAsym(eR, eL) ? ASYM_COLOR : AXIS_LINE_COLOR}
              strokeDasharray={isAsym(eR, eL) ? "0.8 0.4" : undefined}
              strokeWidth={0.3} vectorEffect="non-scaling-stroke" />
          )}
          {/* JOELHOS */}
          {kR && kL && (
            <line x1={kR.x} y1={kR.y} x2={kL.x} y2={kL.y}
              stroke={isAsym(kR, kL) ? ASYM_COLOR : AXIS_LINE_COLOR}
              strokeDasharray={isAsym(kR, kL) ? "0.8 0.4" : undefined}
              strokeWidth={0.3} vectorEffect="non-scaling-stroke" />
          )}
          {/* EIXO VERTEBRAL */}
          {spineChain.length >= 2 && (
            <polyline
              points={spineChain.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={AXIS_LINE_COLOR}
              strokeWidth={0.3}
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* PONTOS */}
          {present.map((p) => (
            <g
              key={p.id}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: eduMode ? "help" : "pointer" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={1.2}
                fill={colorFor(p)}
                stroke="#000"
                strokeWidth={0.2}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>

        {/* Ângulos sobrepostos (HTML para fontes legíveis) */}
        <div className="pointer-events-none absolute inset-0">
          {shoulderAngle != null && aR && aL && (
            <AngleTag
              x={(aR.x + aL.x) / 2}
              y={(aR.y + aL.y) / 2}
              label={`Ombros ${shoulderAngle}°`}
            />
          )}
          {pelvicAngle != null && eR && eL && (
            <AngleTag
              x={(eR.x + eL.x) / 2}
              y={(eR.y + eL.y) / 2}
              label={`Pelve ${pelvicAngle}°`}
            />
          )}
          {kneeAngle != null && kR && kL && (
            <AngleTag
              x={(kR.x + kL.x) / 2}
              y={(kR.y + kL.y) / 2}
              label={`Joelhos ${kneeAngle}°`}
            />
          )}
          {qAngleR != null && kR && (
            <AngleTag x={kR.x + 4} y={kR.y} label={`Q-D ${qAngleR}°`} />
          )}
          {qAngleL != null && kL && (
            <AngleTag x={kL.x - 4} y={kL.y} label={`Q-E ${qAngleL}°`} />
          )}

          {/* Tooltip educacional */}
          {eduMode && hover && (() => {
            const p = present.find((x) => x.id === hover);
            if (!p) return null;
            return (
              <div
                className="absolute -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div className="bg-[#1a1a2e] px-2 py-1 text-[11px] text-white" style={{ borderRadius: 6 }}>
                  {EDU_LABELS[p.id] || p.label}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Legenda */}
        <div className="absolute bottom-2 left-2 border border-white/10 bg-black/70 px-2.5 py-1.5 backdrop-blur-sm">
          <div className="font-mono text-[9px] uppercase tracking-wider text-white/50">Blocos</div>
          <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
            {(Object.keys(BLOCK_META) as LandmarkBlock[]).map((b) => (
              <div key={b} className="flex items-center gap-1.5 text-[10px] text-white/85">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: BLOCK_META[b].color }} />
                <span>{BLOCK_META[b].label}</span>
                <span className="text-white/50">{blockCounts[b]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AngleTag({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className="font-mono text-[10px] text-white"
        style={{ background: "rgba(0,0,0,0.5)", padding: "1px 4px" }}
      >
        {label}
      </span>
    </div>
  );
}

// Parser do bloco json_landmarks_pro emitido pela IA
export function parsePostural33(text: string): Postural33Bundle | null {
  const re = /```json_landmarks_pro\s*([\s\S]*?)```/i;
  const m = re.exec(text);
  if (!m) return null;
  try {
    const parsed = JSON.parse(m[1].trim());
    const src = parsed.landmarks || parsed;
    const out: Postural33Bundle = {};
    for (const id of LANDMARK_IDS) {
      const v = src[id];
      if (v && Number.isFinite(v.x) && Number.isFinite(v.y)) {
        out[id] = { x: Number(v.x), y: Number(v.y), severity: v.severity };
      }
    }
    return Object.keys(out).length ? out : null;
  } catch (e) {
    console.warn("parsePostural33 failed", e);
    return null;
  }
}
