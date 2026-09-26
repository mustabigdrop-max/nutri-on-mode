import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Share2, Pencil, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import "@/styles/workout-share-card.css";
import { computeMuscleActivation, autoView, type MuscleKey } from "@/lib/workoutMuscleActivation";

export interface WorkoutShareExercise {
  number: number;
  name: string;
  sub: string;
  pills: string[];
  sets?: number;
  color?: "red" | "gold" | "cyan" | "gray";
}

export interface WorkoutShareCardProps {
  dayCode: string;
  dayType: string;
  muscles: string;
  protocol: string;
  week: string;
  volume: string;
  progression: string;
  phase: string;
  date: string;
  stats: { series: number; rpe: number; rir: number; minutes: number };
  focusAlert: string;
  streak: number;
  rank: string;
  warmup: string;
  exercises: WorkoutShareExercise[];
  dataStrip: Array<{ value: string; label: string; color: "red" | "gold" | "cyan" | "green" }>;
  litMuscles: Array<{ id: string; color: string; pulse?: boolean }>;
  coachName?: string;
  summary?: { tonnageKg?: number; totalReps?: number; tutSeconds?: number; weekBadge?: string };
}

// Frase de foco (≤90 caracteres) a partir do músculo principal do dia.
const FOCUS_LINES: Partial<Record<MuscleKey, string>> = {
  pec: "Peito não cresce com pressa. Controle a descida e domine a carga.",
  delt: "Ombro largo é construído série por série. Nada de balanço.",
  tri: "Braço grande é tríceps. Trave o cotovelo e aperte até o fim.",
  bi: "Rosca roubada não conta. Cotovelo parado, bíceps trabalhando.",
  lats: "Costas largas nascem no cotovelo. Puxe com as costas, não com o braço.",
  traps: "Trapézio responde a pausa no topo. Segure e sinta.",
  quad: "Profundidade honesta. Coxa que desce inteira cresce inteira.",
  ham: "Posterior é alongamento sob carga. Quadril para trás, sem pressa.",
  glute: "Glúteo trava no topo. Sem contração, sem resultado.",
  calf: "Panturrilha exige amplitude total. Pausa embaixo, sobe explodindo.",
  abs: "Core forte é coluna protegida. Respiração e controle em cada rep.",
};
const fmtNum = (n: number, d = 0) => n.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });

/* ─── Grupos musculares: shapes do lado esquerdo (espelhados) + âncora do lado direito, por vista ─── */
type View = "front" | "back";
type GroupDef = { label: string; front?: { paths: string[]; anchor: [number, number] }; back?: { paths: string[]; anchor: [number, number] } };
const DELT = ["M67 69 C57 69 49 78 48 92 C52 99 58 99 63 93 C65 85 69 77 76 73 Z"];
const TRI = ["M48 96 C41 105 39 122 43 138 C48 139 53 127 55 106 C54 101 52 98 48 96 Z"];
const FORE = ["M45 137 C39 151 39 171 43 184 C49 180 54 159 55 140 Z"];
const GROUPS: Record<GroupKey, GroupDef> = {
  pec: { label: "PEITORAL", front: { anchor: [128, 90], paths: ["M99 76 C90 72 76 72 67 80 C62 90 65 102 75 107 C85 110 95 106 99 101 Z"] } },
  delt: { label: "DELTOIDES", front: { anchor: [150, 82], paths: DELT }, back: { anchor: [150, 82], paths: DELT } },
  tri: { label: "TRÍCEPS", front: { anchor: [155, 116], paths: TRI }, back: { anchor: [155, 116], paths: TRI } },
  bi: { label: "BÍCEPS", front: { anchor: [143, 116], paths: ["M60 98 C53 100 49 113 50 128 C53 136 60 131 64 118 L65 103 Z"] } },
  fore: { label: "ANTEBRAÇO", front: { anchor: [154, 158], paths: FORE }, back: { anchor: [154, 158], paths: FORE } },
  abs: { label: "ABDÔMEN", front: { anchor: [104, 134], paths: ["M89 111 C93 109 98 109 99 111 L99 124 L89 124 Z", "M89 127 L99 127 L99 140 L89 140 Z", "M89 143 L99 143 L99 160 C94 161 90 157 89 150 Z"] } },
  obl: { label: "OBLÍQUOS", front: { anchor: [116, 132], paths: ["M76 112 C82 118 86 132 86 150 C80 150 76 140 74 128 Z"] } },
  lats: { label: "DORSAL", back: { anchor: [122, 112], paths: ["M66 90 C70 104 76 122 86 140 C92 134 96 118 99 104 C90 96 78 90 66 90 Z"] } },
  traps: { label: "TRAPÉZIO", back: { anchor: [116, 64], paths: ["M92 56 C86 60 78 64 72 66 C82 70 92 76 99 82 L99 56 Z"] } },
  lower: { label: "LOMBAR", back: { anchor: [106, 152], paths: ["M88 142 C90 152 92 160 99 164 L99 140 C95 142 91 142 88 142 Z"] } },
  quad: { label: "QUADRÍCEPS", front: { anchor: [120, 205], paths: ["M77 172 C72 195 74 224 82 240 C90 236 94 210 96 190 C92 180 85 174 77 172 Z"] } },
  add: { label: "ADUTORES", front: { anchor: [106, 200], paths: ["M92 182 C88 194 88 210 92 224 C96 214 98 198 99 186 Z"] } },
  ham: { label: "POSTERIORES", back: { anchor: [118, 220], paths: ["M77 198 C73 214 75 232 81 244 C88 238 93 220 96 200 C90 196 83 196 77 198 Z"] } },
  glute: { label: "GLÚTEOS", back: { anchor: [114, 182], paths: ["M75 170 C72 181 76 193 88 195 C96 195 99 187 99 177 C94 171 84 169 75 170 Z"] } },
  hipabd: { label: "ABDUTORES", back: { anchor: [120, 162], paths: ["M73 156 C75 164 81 168 90 167 C88 161 82 155 73 156 Z"] } },
  calf: { label: "PANTURRILHA", front: { anchor: [118, 266], paths: ["M78 252 C74 262 76 277 82 284 C86 276 88 262 86 252 Z"] }, back: { anchor: [118, 266], paths: ["M78 250 C72 260 74 276 81 286 C86 278 89 262 87 250 Z"] } },
};
const ALL_KEYS = Object.keys(GROUPS) as GroupKey[];

// Cores por ranking: 1º cyan, 2º gold, 3º purple; 4º+ mesma família, mais discreto.
const RANK_COLORS = ["#00D4FF", "#B8922A", "#8866CC"];
type Lit = { key: GroupKey; pct: number; color: string; intensity: number };

type GroupKey = MuscleKey;
const BODY_HALF =
  "M100 50 C96 50 93 52 92 56 C88 60 80 62 72 64 C58 66 47 74 44 88 C40 103 40 120 40 135 C38 151 37 168 39 185 C38 194 40 201 44 202 C50 201 51 194 50 185 C51 168 55 154 57 139 C59 124 63 111 66 101 C68 116 70 132 73 150 C74 160 72 168 73 176 C70 200 72 226 77 246 C74 262 76 280 80 292 C84 296 92 296 95 293 C94 278 94 262 93 248 C96 226 98 204 99 186 L100 186 Z";

function Editable({ children, enabled, className = "", style }: { children: ReactNode; enabled: boolean; className?: string; style?: CSSProperties }) {
  return <span className={className} style={style} contentEditable={enabled} suppressContentEditableWarning>{children}</span>;
}

function useActivation(props: WorkoutShareCardProps): Lit[] {
  return useMemo(() => {
    const raw = computeMuscleActivation(props.exercises);
    const max = raw[0]?.pct || 1;
    return raw.map((a, i) => ({
      key: a.key,
      pct: a.pct,
      color: RANK_COLORS[i % 3],
      intensity: (0.3 + 0.7 * (a.pct / max)) * (i < 3 ? 1 : 0.55),
    }));
  }, [props.exercises]);
}

function AnatomyFigure({ active, view }: { active: Lit[]; view: View }) {
  const map = new Map(active.map((a) => [a.key, a]));
  const mirror = "translate(200 0) scale(-1 1)";
  const renderGroup = (key: GroupKey) => {
    const def = GROUPS[key][view];
    if (!def) return null;
    const lit = map.get(key);
    const on = lit !== undefined;
    const intensity = lit?.intensity ?? 0;
    const color = lit?.color ?? "#1a1c2c";
    const shapes = (fill: string, extra?: object) => (
      <>
        {def.paths.map((d, i) => <path key={`l${i}`} d={d} fill={fill} {...extra} />)}
        {def.paths.map((d, i) => <path key={`r${i}`} d={d} fill={fill} transform={mirror} {...extra} />)}
      </>
    );
    if (!on) return <g key={key}>{shapes("url(#ws-muscle-off)", { stroke: "rgba(255,255,255,.035)", strokeWidth: 0.5 })}</g>;
    return (
      <g key={key} className="workout-muscle-pulse">
        <g filter="url(#ws-glow)" opacity={intensity * 0.9}>{shapes(color)}</g>
        <g opacity={intensity}>{shapes(`url(#ws-grad-${key})`, { stroke: color, strokeOpacity: 0.55, strokeWidth: 0.5 })}</g>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 200 300" width="200" height="300" aria-label="Mapa de ativação muscular" role="img">
      <defs>
        <linearGradient id="ws-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0c0d18" /><stop offset=".5" stopColor="#121424" /><stop offset="1" stopColor="#0c0d18" />
        </linearGradient>
        <linearGradient id="ws-muscle-off" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1c2c" /><stop offset="1" stopColor="#10111c" />
        </linearGradient>
        {active.map(({ key: k, color }) => (
          <radialGradient key={k} id={`ws-grad-${k}`} cx=".5" cy=".4" r=".7">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
            <stop offset=".35" stopColor={color} stopOpacity=".95" />
            <stop offset="1" stopColor={color} stopOpacity=".35" />
          </radialGradient>
        ))}
        <filter id="ws-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="ws-rim" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.2" /></filter>
      </defs>
      {/* sombra de chão */}
      <ellipse cx="100" cy="296" rx="34" ry="3" fill="#00D4FF" opacity=".06" />
      {/* cabeça + pescoço */}
      <path d="M100 8 C110 8 116 16 116 27 C116 38 109 46 100 46 C91 46 84 38 84 27 C84 16 90 8 100 8 Z" fill="url(#ws-body)" />
      <path d="M93 42 L107 42 L108 56 L92 56 Z" fill="url(#ws-body)" />
      {/* corpo */}
      <path d={BODY_HALF} fill="url(#ws-body)" />
      <path d={BODY_HALF} fill="url(#ws-body)" transform={mirror} />
      {/* rim light ciano (lado direito) */}
      <path d={BODY_HALF} transform={mirror} fill="none" stroke="#00D4FF" strokeOpacity=".5" strokeWidth=".8" filter="url(#ws-rim)" />
      <path d={BODY_HALF} transform={mirror} fill="none" stroke="#00D4FF" strokeOpacity=".35" strokeWidth=".4" />
      <path d={BODY_HALF} fill="none" stroke="#ffffff" strokeOpacity=".05" strokeWidth=".4" />
      <path d="M100 8 C110 8 116 16 116 27 C116 38 109 46 100 46" fill="none" stroke="#00D4FF" strokeOpacity=".4" strokeWidth=".5" />
      {/* músculos */}
      {ALL_KEYS.map(renderGroup)}
      {/* linha alba */}
      {view === "front" ? <path d="M100 104 L100 162" stroke="#000" strokeOpacity=".5" strokeWidth=".6" /> : <path d="M100 58 L100 166" stroke="#000" strokeOpacity=".5" strokeWidth=".6" />}
    </svg>
  );
}

export default function WorkoutShareCard(props: WorkoutShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const active = useActivation(props);
  const [viewOverride, setViewOverride] = useState<View | null>(null);
  const view: View = viewOverride ?? autoView(active);
  // Cards: até 4 grupos mais ativados com representação na vista atual.
  const callouts = active.slice(0, 4);
  const sum = props.summary || {};
  const primary = active[0];
  const primarySeries = primary ? props.exercises.filter((e) => computeMuscleActivation([e], () => {})[0]?.key === primary.key).reduce((t, e) => t + (e.sets || 0), 0) : 0;
  const focusLine = primary ? FOCUS_LINES[primary.key] : undefined;
  const fileDate = useMemo(() => props.date.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, ""), [props.date]);

  const renderPng = async () => {
    const el = cardRef.current;
    if (!el) return null;
    const source = await html2canvas(el, { backgroundColor: "#03030a", scale: 3, useCORS: true, logging: false });
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = Math.round(1080 * (source.height / source.width));
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.fillStyle = "#03030a"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(source, 0, 0, canvas.width, canvas.height); }
    return canvas;
  };

  const share = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await renderPng();
      if (!canvas) return;
      const name = `trainingon-${props.dayCode.toLowerCase()}-${fileDate}.png`;
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/png"));
      const file = blob ? new File([blob], name, { type: "image/png" }) : null;
      if (file && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "TrainingON" }); return; } catch { /* cancelado → baixa */ }
      }
      const link = document.createElement("a");
      link.download = name; link.href = canvas.toDataURL("image/png"); link.click();
    } finally { setExporting(false); }
  };

  const stats = [
    { v: props.stats.series, l: "SÉRIES", c: "#00D4FF" },
    { v: props.stats.rpe, l: "RPE", c: "#B8922A" },
    { v: props.stats.rir, l: "RIR", c: "#5DCAA5" },
    { v: props.stats.minutes, l: "MIN", c: "#AFA9EC" },
  ];
  const meta = [props.phase, props.week].filter((x) => x && x !== "—").join(" · ");

  // Zonas fixas: texto 80px, corpo 142px, cards 104px. Nenhum conteúdo cruza de zona.
  const FX = 137, FY = 40, FIGURE_SCALE = 0.41;
  const slots = [0, 51, 102, 153];

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={cardRef} className="ws-neural">
        <div className="ws-neural-vignette" />
        <svg className="ws-neural-grain" aria-hidden="true"><filter id="ws-noise"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" /></filter><rect width="100%" height="100%" filter="url(#ws-noise)" /></svg>

        <div className="relative z-[2] flex flex-col">
          {/* header */}
          <header className="flex items-center justify-between px-6 pt-6">
            <span className="font-display text-[15px] font-bold tracking-[.5px]">Training<span style={{ color: "#B8922A" }}>ON</span></span>
            <div className="flex items-center gap-2">
              {props.streak > 0 && <span className="ws-mono text-[8px]" style={{ color: "#B8922A" }}>{props.streak} DIAS</span>}
              {props.rank && <span className="ws-chip" style={{ color: "#00D4FF" }}>{props.rank}</span>}
            </div>
          </header>

          {/* corpo + callouts */}
          <section className="ws-anatomy-stage relative mt-2 h-[204px]">
            <div className="absolute left-6 top-2 z-[3] w-[84px]">
              <Editable enabled={editing} className="block font-display text-[52px] font-bold leading-[.82]">{props.dayCode}</Editable>
              <Editable enabled={editing} className="ws-day-type mt-3 block font-display text-[14px] font-bold uppercase leading-[1.15]" style={{ color: "#00D4FF" }}>{props.dayType}</Editable>
              {meta && <span className="ws-mono mt-3 block text-[10px] leading-[1.5]" style={{ color: "#888898" }}>{meta}</span>}
            </div>
            <div className="ws-anatomy-figure absolute" style={{ left: FX, top: FY }}><AnatomyFigure active={active} view={view} /></div>
            <svg className="pointer-events-none absolute inset-0" width="390" height="204" aria-hidden="true">
              {callouts.map((c, i) => {
                const def = GROUPS[c.key][view];
                if (!def) return null;
                const [ax, ay] = def.anchor;
                const x1 = FX + ax * FIGURE_SCALE, y1 = FY + ay * FIGURE_SCALE, x2 = 254, y2 = slots[i] + 23;
                return (
                  <g key={c.key}>
                    <path d={`M${x1} ${y1} C${x1 + 18} ${y1}, ${x2 - 16} ${y2}, ${x2} ${y2}`} fill="none" stroke={c.color} strokeOpacity=".45" strokeWidth=".75" />
                    <circle cx={x1} cy={y1} r="1.8" fill={c.color} />
                  </g>
                );
              })}
            </svg>
            {callouts.map((c, i) => (
              <div key={c.key} className="ws-glass absolute" style={{ left: 254, top: slots[i], width: 114 }}>
                <span className="flex items-baseline justify-between gap-1">
                  <span className="ws-mono block text-[10px] leading-tight" style={{ color: "#A0A0B2", letterSpacing: 0.5 }}>{GROUPS[c.key].label}</span>
                  <span className="block font-display text-[24px] font-bold leading-none" style={{ color: c.color }}>{c.pct}<span className="text-[11px] opacity-70">%</span></span>
                </span>
                <span className="ws-bar mt-1 block"><i style={{ width: `${Math.max(4, c.pct)}%`, background: c.color }} /></span>
              </div>
            ))}
          </section>

          {/* resumo do treino */}
          <section className="mx-6 mb-4">
            {sum.weekBadge && <span className="ws-chip inline-block leading-[1.6]" style={{ color: "#B8922A", fontSize: 10 }}>{sum.weekBadge}</span>}
            {(sum.tonnageKg || sum.totalReps) && (
              <div className="mt-3">
                <span className="ws-mono block text-[10px]" style={{ color: "#A0A0B2" }}>{sum.tonnageKg ? "Carga total do dia" : "Repetições totais do dia"}</span>
                <b className="mb-1 block font-display text-[36px] font-bold leading-[1.15]">
                  {sum.tonnageKg ? <>{fmtNum(sum.tonnageKg / 1000, 1)}<span className="ml-1 text-[14px]" style={{ color: "#00D4FF" }}>t</span></> : fmtNum(sum.totalReps!)}
                </b>
                {sum.tonnageKg && sum.tonnageKg >= 90 && <span className="mt-1 block text-[12px]" style={{ color: "#F0F0F5", opacity: .75 }}>equivale a {fmtNum(Math.floor(sum.tonnageKg / 90))} pessoas de 90 kg</span>}
              </div>
            )}
            {active.length > 0 && (
              <div className="mt-3">
                <div className="flex h-[6px] w-full gap-[2px]">
                  {active.map((a) => <i key={a.key} style={{ width: `${a.pct}%`, background: a.color, opacity: Math.max(.45, a.intensity) }} />)}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {active.slice(0, 5).map((a) => (
                    <span key={a.key} className="ws-mono text-[10px]" style={{ color: "#A0A0B2", letterSpacing: 1 }}>
                      <i className="mr-1 inline-block h-[6px] w-[6px]" style={{ background: a.color }} />{GROUPS[a.key].label} {a.pct}%
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(primarySeries > 0 || sum.tutSeconds) && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {primarySeries > 0 && primary && (
                  <div className="ws-glass"><span className="ws-mono block text-[10px]" style={{ color: "#A0A0B2", letterSpacing: 1 }}>Séries · {GROUPS[primary.key].label}</span><b className="font-display text-[16px]">{primarySeries}</b></div>
                )}
                {sum.tutSeconds && (
                  <div className="ws-glass"><span className="ws-mono block text-[10px]" style={{ color: "#A0A0B2", letterSpacing: 1 }}>Tempo sob tensão</span><b className="font-display text-[16px]">~{fmtNum(Math.round(sum.tutSeconds / 60))} min</b><span className="ws-mono ml-1 text-[10px]" style={{ color: "#888898", letterSpacing: 1 }}>estimativa</span></div>
                )}
              </div>
            )}
          </section>

          {/* stats */}
          <section className="mx-6 grid grid-cols-4 border-y" style={{ borderColor: "rgba(255,255,255,.06)" }}>
            {stats.map((s, i) => (
              <div key={s.l} className="py-3 text-center" style={{ borderLeft: i ? "1px solid rgba(255,255,255,.06)" : undefined }}>
                <b className="block font-display text-[24px] font-bold leading-none">{s.v || "—"}</b>
                <span className="ws-mono mt-1 block text-[6.5px]" style={{ color: s.c }}>{s.l}</span>
              </div>
            ))}
          </section>

          {focusLine && (
            <div className="mx-6 mt-4 flex items-start gap-3">
              <span className="ws-chip shrink-0 leading-[1.6]" style={{ color: "#03030a", background: "#FF4D6D", borderColor: "#FF4D6D" }}>FOCO</span>
              <span className="text-[12px] font-bold leading-[1.4]" style={{ color: "#F0F0F5" }}>{focusLine}</span>
            </div>
          )}

          {/* exercícios */}
          <section className="ws-exercise-list mx-6 mt-4">
            <span className="ws-mono block pb-2 text-[10px]" style={{ color: "#888898" }}>{props.exercises.length} EXERCÍCIOS</span>
            {props.exercises.map((e) => (
              <div key={`${e.number}-${e.name}`} className="ws-exercise-row grid grid-cols-[18px_minmax(0,1fr)_auto] items-start gap-2 py-2">
                <span className="ws-mono pt-[2px] text-[10px]" style={{ color: "#888898" }}>{String(e.number).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <Editable enabled={editing} className="block break-words font-display text-[12px] font-bold leading-[1.2]">{e.name}</Editable>
                  <Editable enabled={editing} className="ws-exercise-muscle block break-words font-mono text-[12px] uppercase leading-[1.2]" style={{ color: "#888898" }}>{e.sub}</Editable>
                </div>
                {e.pills[0] && <span className="ws-chip shrink-0" style={{ color: "#B8922A" }}>{e.pills[0]}</span>}
              </div>
            ))}
          </section>

          {/* footer */}
          <footer className="mt-6 flex items-end justify-between px-6 pb-6 pt-6">
            <div>
              <Editable enabled={editing} className="block font-display text-[10px] font-bold">{props.coachName || "Coach Diogo Mello"}</Editable>
              <span className="block text-[7px] italic" style={{ color: "#B8922A" }}>Transformação é sistema.</span>
            </div>
            <div className="text-right">
              <span className="block font-display text-[11px] font-bold">nutri<span style={{ color: "#EF9F27" }}>ON</span></span>
              <span className="ws-mono block text-[6px]" style={{ color: "#3a3a4a" }}>{props.date}</span>
            </div>
          </footer>
        </div>
      </div>

      {props.focusAlert && (
        <details className="w-[390px] border border-border p-3 text-sm text-muted-foreground" data-html2canvas-ignore="true">
          <summary className="cursor-pointer font-tech text-[11px] uppercase">Ver orientação completa</summary>
          <p className="mt-2 whitespace-pre-line">{props.focusAlert}</p>
        </details>
      )}
      <div className="flex w-[390px] gap-2" data-html2canvas-ignore="true">
        <div className="flex border border-border">
          {(["front", "back"] as View[]).map((v) => (
            <Button key={v} type="button" size="sm" variant={view === v ? "default" : "ghost"} onClick={() => setViewOverride(v)} className="h-10 rounded-none font-tech text-[10px] uppercase">{v === "front" ? "Frente" : "Costas"}</Button>
          ))}
        </div>
        <Button type="button" onClick={share} disabled={exporting} className="h-10 flex-1 rounded-none font-tech text-[10px] uppercase tracking-wider">
          {exporting ? <Loader2 className="animate-spin" /> : <Share2 />}{exporting ? "Preparando" : "Compartilhar treino"}
        </Button>
        <Button type="button" onClick={() => setEditing((v) => !v)} variant={editing ? "default" : "outline"} className="h-10 rounded-none font-tech text-[10px] uppercase"><Pencil />Editar</Button>
      </div>
    </div>
  );
}
