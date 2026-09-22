import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Download, Image, Pencil, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import "@/styles/workout-share-card.css";

export interface WorkoutShareExercise {
  number: number;
  name: string;
  sub: string;
  pills: string[];
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
}

const colors = {
  red: "var(--ws-red)", gold: "var(--ws-gold)", cyan: "var(--ws-cyan)",
  green: "var(--ws-green)", gray: "var(--ws-gray)", purple: "var(--ws-purple)",
} as const;

const pillColors: Record<string, { color: string; border: string; background?: string }> = {
  "8X": { color: "var(--ws-orange)", border: "rgba(255,136,0,.2)" },
  IIA: { color: "var(--ws-cyan)", border: "rgba(0,212,255,.15)" },
  "RIR 1": { color: "var(--ws-green)", border: "rgba(0,255,136,.15)" },
  "RIR 2": { color: "var(--ws-green)", border: "rgba(0,255,136,.15)" },
  "REST-P": { color: "var(--ws-gold)", border: "rgba(184,146,42,.15)" },
  BSET: { color: "var(--ws-pink)", border: "rgba(255,102,170,.15)" },
  TOP: { color: "var(--ws-gold)", border: "rgba(184,146,42,.2)", background: "rgba(184,146,42,.08)" },
  UNI: { color: "var(--ws-red)", border: "rgba(255,68,68,.15)" },
  ALONG: { color: "var(--ws-green)", border: "rgba(0,255,136,.1)" },
  ENC: { color: "var(--ws-green)", border: "rgba(0,255,136,.1)" },
};

function Editable({ children, enabled, className = "", style }: { children: ReactNode; enabled: boolean; className?: string; style?: CSSProperties }) {
  return <span className={className} style={style} contentEditable={enabled} suppressContentEditableWarning>{children}</span>;
}

function StatRing({ value, label, progress, color }: { value: string | number; label: string; progress: number; color: string }) {
  const circumference = 138.2;
  return (
    <div className="relative h-[52px] w-[52px] shrink-0">
      <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="26" cy="26" r="22" fill="none" stroke="#111120" strokeWidth="3" />
        <circle cx="26" cy="26" r="22" fill="none" stroke={color} strokeWidth="3" strokeLinecap="square" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - Math.max(0, Math.min(1, progress)))} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <b className="font-display text-[11px]">{value || "—"}</b>
        <span className="mt-[2px] text-[5px] uppercase text-[var(--ws-dim)]">{label}</span>
      </div>
    </div>
  );
}

function BodyMap({ litMuscles }: { litMuscles: WorkoutShareCardProps["litMuscles"] }) {
  const find = (id: string, fallback: string) => litMuscles.find((m) => m.id === id) ?? { id, color: fallback, pulse: false };
  const part = (id: string, fallback: string) => {
    const item = find(id, fallback);
    return { fill: item.color, stroke: item.color, opacity: .32, filter: `drop-shadow(0 0 4px ${item.color})`, className: item.pulse ? "workout-muscle-pulse" : "" };
  };
  return (
    <svg viewBox="0 0 100 200" className="h-[150px] w-[78px]" role="img" aria-label="Mapa dos músculos trabalhados">
      <g fill="#0A0A15" stroke="#1A1A28" strokeWidth=".6">
        <ellipse cx="50" cy="13" rx="10" ry="12"/><path d="M42 25 Q50 29 58 25 L64 39 69 74 61 108 58 154 55 192 46 192 42 154 39 108 31 74 36 39Z"/>
        <path d="M36 34 24 42 17 77 23 80 34 57Z"/><path d="M64 34 76 42 83 77 77 80 66 57Z"/>
      </g>
      <path d="M39 37 Q45 31 49 39 L48 56 Q42 54 37 48Z" {...part("pec-left", "#FF4444")} />
      <path d="M51 39 Q55 31 61 37 L63 48 Q58 54 52 56Z" {...part("pec-right", "#B8922A")} />
      <ellipse cx="34" cy="39" rx="7" ry="9" {...part("delt", "#00D4FF")} /><ellipse cx="66" cy="39" rx="7" ry="9" {...part("delt", "#00D4FF")} />
      <path d="M27 47 34 48 30 68 24 66Z" {...part("triceps", "#B8922A")} /><path d="M66 48 73 47 76 66 70 68Z" {...part("triceps", "#B8922A")} />
      <g fontFamily="Space Mono" fontSize="4" fontWeight="700"><text x="44" y="48" fill="#FF4444">PEC</text><text x="26" y="40" fill="#00D4FF">DLT</text><text x="23" y="60" fill="#B8922A">TRI</text></g>
    </svg>
  );
}

function Divider({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2 font-display text-[6px] font-bold uppercase tracking-[1.5px] text-[var(--ws-gray)]"><span>{children}</span><span className="h-px flex-1 bg-gradient-to-r from-[var(--ws-gray)] to-transparent" /></div>;
}

export default function WorkoutShareCard(props: WorkoutShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [story, setStory] = useState(false);
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileDate = useMemo(() => props.date.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, ""), [props.date]);

  const exportPng = async () => {
    const element = cardRef.current;
    if (!element) return;
    setExporting(true);
    try {
      const source = await html2canvas(element, { backgroundColor: "#010108", scale: 3, useCORS: true, logging: false });
      let canvas = source;
      if (story) {
        canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920;
        const ctx = canvas.getContext("2d");
        if (ctx) { ctx.fillStyle = "#010108"; ctx.fillRect(0, 0, 1080, 1920); ctx.drawImage(source, 0, 0, 1080, 1920); }
      }
      const link = document.createElement("a");
      link.download = `trainingon-${props.dayCode.toLowerCase()}-${fileDate}.png`;
      link.href = canvas.toDataURL("image/png"); link.click();
    } finally { setExporting(false); }
  };

  const protocols = [[props.protocol, "PROTOCOLO"], [props.week, "SEMANA"], [props.volume, "VOLUME"], [props.progression, "PROGRESSÃO"], [props.phase, "FASE"]];
  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={cardRef} className={`workout-share-stage ${story ? "is-story" : ""}`}>
        <div className="workout-share-corners"><i className="workout-share-corner tl"/><i className="workout-share-corner tr"/><i className="workout-share-corner bl"/><i className="workout-share-corner br"/></div>
        <div className="workout-share-scan" />
        <div className="workout-share-content">
          <div className="flex items-center justify-between px-[14px] py-[10px]">
            <span className="text-[6px] tracking-[2px] text-[var(--ws-cyan)] opacity-60">STRATUM v7</span>
            <span className="font-display text-[14px] font-bold">Training<span className="text-[var(--ws-gold)]">ON</span></span>
            <div className="flex items-center gap-2">{props.streak > 0 && <span className="text-[7px] text-[var(--ws-gold)]">🔥 {props.streak}</span>}{props.rank && <span className="border border-[rgba(0,212,255,.2)] px-[5px] py-px font-display text-[6px] font-bold text-[var(--ws-cyan)]">{props.rank}</span>}</div>
          </div>

          <div className="flex gap-[10px] px-[14px]">
            <div className="min-w-0 flex-1">
              <Editable enabled={editing} className="block font-display text-[45px] font-bold leading-[.86] tracking-[-2px]">{props.dayCode}</Editable>
              <Editable enabled={editing} className="mt-0 block font-display text-[16px] font-bold tracking-[2px] text-[var(--ws-cyan)]">{props.dayType}</Editable>
              <Editable enabled={editing} className="block text-[8px] text-[var(--ws-dim)]">{props.muscles}</Editable>
              <div className="mt-2 flex gap-[6px]">
                <StatRing value={props.stats.series} label="SÉRIES" progress={props.stats.series / 28} color="var(--ws-cyan)" />
                <StatRing value={props.stats.rpe} label="RPE" progress={props.stats.rpe / 10} color="var(--ws-gold)" />
                <StatRing value={props.stats.rir} label="RIR" progress={props.stats.rir / 6} color="var(--ws-green)" />
                <StatRing value={props.stats.minutes} label="MIN" progress={props.stats.minutes / 90} color="var(--ws-purple)" />
              </div>
            </div>
            <div className="flex w-[90px] items-center justify-center"><BodyMap litMuscles={props.litMuscles} /></div>
          </div>

          <div className="mt-1 grid grid-cols-5 gap-px px-[14px]">
            {protocols.map(([value, label], index) => <div key={label} className={`bg-[var(--ws-surface)] px-1 py-[5px] text-center border-b-2 ${index === 1 ? "workout-share-protocol-active border-[var(--ws-cyan)]" : "border-[var(--ws-gray)]"}`}><Editable enabled={editing} className={`block font-display text-[10px] font-bold ${index === 1 ? "text-[var(--ws-cyan)]" : "text-[var(--ws-white)]"}`}>{value || "—"}</Editable><span className="block text-[5px] tracking-[.5px] text-[var(--ws-dim)]">{label}</span></div>)}
          </div>

          {props.focusAlert && <div className="mx-[14px] my-2 flex items-center gap-[6px] border-l-2 border-[var(--ws-red)] bg-[rgba(255,68,68,.04)] px-[10px] py-[6px]"><span className="text-[11px]">⚡</span><Editable enabled={editing} className="flex-1 text-[7px] leading-[1.35] text-[var(--ws-red)]">{props.focusAlert}</Editable><span className="bg-[var(--ws-red)] px-[5px] py-px font-display text-[6px] font-bold text-[var(--ws-bg)]">APEX</span></div>}

          <div className="px-[14px] py-2">
            {props.warmup && <><Divider>WARM-UP — ATIVAÇÃO</Divider><div className="flex items-center justify-between py-[6px]"><Editable enabled={editing} className="max-w-[315px] truncate text-[7.5px] text-[var(--ws-dim)]">{props.warmup}</Editable><span className="text-[6px] text-[var(--ws-gray)]">ATIVO</span></div></>}
            <Divider>TREINO PRINCIPAL — {props.exercises.length} EXERCÍCIOS</Divider>
            <div className="mt-1">
              {props.exercises.map((exercise) => <div key={`${exercise.number}-${exercise.name}`} className="flex items-center gap-[6px] border-b border-[rgba(255,255,255,.02)] py-[5px]"><span className="w-4 shrink-0 font-display text-[12px] font-bold" style={{ color: colors[exercise.color ?? "gray"] }}>{exercise.number}</span><div className="min-w-0 flex-1"><Editable enabled={editing} className="block truncate whitespace-nowrap font-display text-[10px] font-bold text-[var(--ws-white)]">{exercise.name}</Editable><Editable enabled={editing} className="block truncate text-[6px] text-[var(--ws-dim)]">{exercise.sub}</Editable></div><div className="flex shrink-0 gap-[2px]">{exercise.pills.map((pill) => { const tone = pillColors[pill] ?? { color: "var(--ws-dim)", border: "rgba(136,136,152,.15)" }; return <span key={pill} className="border px-1 py-px font-display text-[5px] font-bold" style={{ color: tone.color, borderColor: tone.border, background: tone.background }}>{pill}</span>; })}</div></div>)}
            </div>
          </div>

          {props.dataStrip.length > 0 && <div className="mx-[14px] my-2 grid grid-cols-4 gap-px">{props.dataStrip.slice(0,4).map((item) => <div key={`${item.value}-${item.label}`} className="bg-[var(--ws-surface)] px-1 py-[5px] text-center"><Editable enabled={editing} className="block font-display text-[9px] font-bold" style={{ color: colors[item.color] }}>{item.value}</Editable><Editable enabled={editing} className="block text-[5px] tracking-[.5px] text-[var(--ws-gray)]">{item.label}</Editable></div>)}</div>}

          <div className="flex items-end justify-between px-[14px] py-2"><div><Editable enabled={editing} className="block text-[6px] text-[var(--ws-gray)]">{props.coachName || "Coach Diogo Mello"}</Editable><span className="block text-[5px] italic text-[var(--ws-gold)] opacity-40">Transformação é sistema.</span></div><div className="text-right"><span className="block font-display text-[9px] font-bold tracking-[1px] text-[var(--ws-cyan)] opacity-50">nutriON</span><span className="block text-[5px] text-[var(--ws-white)] opacity-10">nutrion.app.br · {props.date}</span></div></div>
          <div className="workout-share-bottom-accent" />
        </div>
      </div>

      <div className="flex w-[390px] gap-2" data-html2canvas-ignore="true">
        <Button type="button" onClick={exportPng} disabled={exporting} className="h-9 flex-1 rounded-none font-tech text-[10px] uppercase tracking-wider"><Download />{exporting ? "Exportando" : "Exportar"}</Button>
        <Button type="button" onClick={() => setStory((value) => !value)} variant={story ? "default" : "outline"} className="h-9 rounded-none font-tech text-[10px] uppercase"><Image />Story</Button>
        <Button type="button" onClick={() => setEditing((value) => !value)} variant={editing ? "default" : "outline"} className="h-9 rounded-none font-tech text-[10px] uppercase"><Pencil />Editar</Button>
      </div>
      {exporting && <span className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Preparando imagem</span>}
    </div>
  );
}
