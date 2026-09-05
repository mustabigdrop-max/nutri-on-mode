import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/* Breakdown Studio — luzes de ativação durante o movimento, freeze com análise
   completa nos momentos marcados e gravação pronta para Reels. */

const T = {
  bg: "#020205", s: "#0a0e18", s2: "#111827",
  cyan: "#00D4FF", gold: "#B8922A", green: "#00d4a1",
  red: "#ff4757", text: "#e8edf5", muted: "#6b7a94", border: "#1e2d45",
};

const CW = 720, CH = 1280;

const MOFF: Record<string, { dx: number; dy: number }> = {
  trapezio: { dx: 0, dy: -0.3 }, deltoide_e: { dx: -0.17, dy: -0.24 }, deltoide_d: { dx: 0.17, dy: -0.24 },
  peitoral_e: { dx: -0.08, dy: -0.18 }, peitoral_d: { dx: 0.08, dy: -0.18 },
  biceps_e: { dx: -0.21, dy: -0.12 }, biceps_d: { dx: 0.21, dy: -0.12 },
  triceps_e: { dx: -0.23, dy: -0.14 }, triceps_d: { dx: 0.23, dy: -0.14 },
  dorsal_e: { dx: -0.13, dy: -0.1 }, dorsal_d: { dx: 0.13, dy: -0.1 },
  lombar: { dx: 0, dy: -0.02 }, abdomen: { dx: 0, dy: -0.06 },
  obliquo_e: { dx: -0.1, dy: -0.04 }, obliquo_d: { dx: 0.1, dy: -0.04 },
  gluteo_e: { dx: -0.08, dy: 0.08 }, gluteo_d: { dx: 0.08, dy: 0.08 },
  quadriceps_e: { dx: -0.1, dy: 0.2 }, quadriceps_d: { dx: 0.1, dy: 0.2 },
  isquio_e: { dx: -0.1, dy: 0.22 }, isquio_d: { dx: 0.1, dy: 0.22 },
  panturrilha_e: { dx: -0.07, dy: 0.36 }, panturrilha_d: { dx: 0.07, dy: 0.36 },
};

const MNAMES: Record<string, string> = {
  trapezio: "Trapézio", deltoide_e: "Deltóide E", deltoide_d: "Deltóide D",
  peitoral_e: "Peitoral E", peitoral_d: "Peitoral D", biceps_e: "Bíceps E", biceps_d: "Bíceps D",
  triceps_e: "Tríceps E", triceps_d: "Tríceps D", dorsal_e: "Dorsal E", dorsal_d: "Dorsal D",
  lombar: "Lombar", abdomen: "Core", obliquo_e: "Oblíquo E", obliquo_d: "Oblíquo D",
  gluteo_e: "Glúteo E", gluteo_d: "Glúteo D", quadriceps_e: "Quad E", quadriceps_d: "Quad D",
  isquio_e: "Isquio E", isquio_d: "Isquio D", panturrilha_e: "Pant E", panturrilha_d: "Pant D",
};

const MCOL: Record<number, string> = { 3: T.cyan, 2: T.gold, 1: T.green };
const MLVL: Record<number, string> = { 3: "PRIMÁRIO", 2: "SECUNDÁRIO", 1: "ESTABILIZADOR" };

export type BreakdownAnalysis = {
  exercicio?: string;
  padrao?: string;
  musculos_primarios?: string[];
  musculos_secundarios?: string[];
  execucao?: { titulo?: string; descricao?: string; cue?: string; erro_comum?: string };
  musculos_ativos?: Record<string, number>;
  mce?: { mentalidade?: string; comportamento?: string; execucao_mce?: string };
  alerta_apex?: string;
  frase_impacto?: string;
};

type Anchor = { cx: number; cy: number; bodyH: number };

function drawGlow(ctx: CanvasRenderingContext2D, muscles: Record<string, number>, a: Anchor, time: number) {
  const pulse = Math.sin(time * 3) * 0.5 + 0.5;
  const keys = Object.keys(muscles).filter((k) => muscles[k] > 0 && MOFF[k]);
  if (!keys.length) return;
  const activeIdx = Math.floor(time * 0.9) % keys.length;

  keys.forEach((key, idx) => {
    const off = MOFF[key];
    const lvl = muscles[key];
    const color = MCOL[lvl] || T.green;
    const mx = a.cx + off.dx * a.bodyH;
    const my = a.cy + off.dy * a.bodyH;
    if (mx < 0 || mx > CW || my < 0 || my > CH) return;

    const isFocus = idx === activeIdx;
    const baseR = lvl === 3 ? 36 : lvl === 2 ? 28 : 22;
    const r = isFocus ? baseR + pulse * 14 : baseR;

    const g = ctx.createRadialGradient(mx, my, 0, mx, my, r * 2.5);
    g.addColorStop(0, color + (isFocus ? "55" : "28"));
    g.addColorStop(0.5, color + "10");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(mx, my, r * 2.5, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = color + (isFocus ? "cc" : "55");
    ctx.lineWidth = isFocus ? 3.5 : 2;
    ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.stroke();

    if (isFocus) {
      ctx.strokeStyle = color + "35";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(mx, my, r * 0.6, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = isFocus ? 20 : 8;
    ctx.beginPath(); ctx.arc(mx, my, isFocus ? 9 : 6, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    if (lvl === 3) {
      ctx.strokeStyle = color + "15";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(a.cx, a.cy); ctx.stroke();
      ctx.setLineDash([]);
    }

    if (isFocus || lvl === 3) {
      const name = MNAMES[key] || key;
      ctx.font = "bold 20px sans-serif";
      const tw = Math.max(ctx.measureText(name).width + 28, 120);
      const onLeft = mx > CW * 0.55;
      const lx = onLeft ? mx - r - tw - 12 : mx + r + 12;
      const ly = my - 24;

      ctx.fillStyle = "rgba(2,2,5,0.92)";
      ctx.fillRect(lx, ly, tw, 50);
      ctx.fillStyle = color;
      ctx.fillRect(onLeft ? lx + tw - 4 : lx, ly, 4, 50);

      ctx.strokeStyle = color + "50";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(onLeft ? mx - r : mx + r, my);
      ctx.lineTo(onLeft ? lx + tw : lx, ly + 25);
      ctx.stroke();

      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = T.text;
      ctx.fillText(name, lx + 10, ly + 22);
      ctx.font = "bold 14px monospace";
      ctx.fillStyle = color;
      ctx.fillText(MLVL[lvl] || "", lx + 10, ly + 40);
    }
  });
}

function drawPlaybackHUD(ctx: CanvasRenderingContext2D, data: BreakdownAnalysis, time: number, handle: string) {
  ctx.fillStyle = "rgba(2,2,5,0.85)";
  ctx.fillRect(16, 16, 420, 84);
  ctx.fillStyle = T.cyan;
  ctx.fillRect(16, 16, 4, 84);
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = T.cyan;
  ctx.fillText("SOCIAL ON · ANÁLISE AO VIVO", 28, 40);
  ctx.font = "bold 32px sans-serif";
  ctx.fillStyle = T.text;
  ctx.fillText((data.exercicio || "").toUpperCase().slice(0, 22), 28, 74);
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = T.cyan;
  ctx.fillText(data.padrao || "", 28, 94);

  ctx.fillStyle = "rgba(2,2,5,0.7)";
  ctx.fillRect(16, 110, 360, 32);
  let lx = 24;
  ([{ c: T.cyan, l: "PRIMÁRIO" }, { c: T.gold, l: "SECUNDÁRIO" }, { c: T.green, l: "ESTABILIZADOR" }]).forEach((item) => {
    ctx.fillStyle = item.c;
    ctx.shadowColor = item.c; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(lx + 6, 126, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = "bold 12px monospace";
    ctx.fillText(item.l, lx + 16, 130);
    lx += ctx.measureText(item.l).width + 30;
  });

  ctx.fillStyle = "rgba(2,2,5,0.7)";
  ctx.fillRect(16, CH - 52, 300, 36);
  ctx.fillStyle = T.gold;
  ctx.fillRect(16, CH - 52, 3, 36);
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = T.gold;
  ctx.fillText(`${handle} · nutriON`, 28, CH - 28);

  const scanY = ((time * 0.1) % 1) * CH;
  const gr = ctx.createLinearGradient(0, scanY, CW, scanY);
  gr.addColorStop(0, "rgba(0,212,255,0)");
  gr.addColorStop(0.5, "rgba(0,212,255,0.25)");
  gr.addColorStop(1, "rgba(0,212,255,0)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, scanY - 1, CW, 3);

  ctx.strokeStyle = "rgba(0,212,255,0.5)";
  ctx.lineWidth = 3;
  const bL = 50, bO = 10;
  ([[bO, bO, 1, 1], [CW - bO, bO, -1, 1], [bO, CH - bO, 1, -1], [CW - bO, CH - bO, -1, -1]] as const).forEach(([x, y, dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(x, y + dy * bL); ctx.lineTo(x, y); ctx.lineTo(x + dx * bL, y); ctx.stroke();
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" ");
  let line = "", ly = y;
  for (const w of words) {
    const test = (line + " " + w).trim();
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, ly); line = w; ly += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, ly);
}

function drawFreeze(ctx: CanvasRenderingContext2D, data: BreakdownAnalysis, time: number, handle: string) {
  ctx.fillStyle = "rgba(2,2,5,0.6)";
  ctx.fillRect(0, 0, CW, CH);
  if (Math.sin(time * 4) > 0.8) {
    ctx.fillStyle = "rgba(0,212,255,0.04)";
    ctx.fillRect(0, 0, CW, CH);
  }

  ctx.fillStyle = "rgba(2,2,5,0.92)";
  ctx.fillRect(0, 0, CW, 160);
  ctx.fillStyle = T.cyan;
  ctx.fillRect(0, 156, CW, 4);
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = T.cyan;
  ctx.fillText("SOCIAL ON · BREAKDOWN", 24, 36);
  ctx.font = "bold 36px sans-serif";
  ctx.fillStyle = T.text;
  ctx.fillText((data.exercicio || "").toUpperCase().slice(0, 22), 24, 80);
  ctx.font = "bold 22px sans-serif";
  ctx.fillStyle = T.cyan;
  ctx.fillText((data.execucao?.titulo || "").slice(0, 44), 24, 110);

  ctx.fillStyle = "rgba(0,212,255,0.08)";
  ctx.fillRect(24, 124, CW - 48, 28);
  ctx.strokeStyle = "rgba(0,212,255,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 124, CW - 48, 28);
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = T.cyan;
  ctx.fillText("🎯 " + (data.execucao?.cue || "").slice(0, 58), 34, 144);

  ctx.fillStyle = "rgba(2,2,5,0.88)";
  ctx.fillRect(24, 172, CW - 48, 76);
  ctx.fillStyle = T.gold;
  ctx.fillRect(24, 172, 4, 76);
  ctx.font = "18px sans-serif";
  ctx.fillStyle = T.text;
  wrap(ctx, data.execucao?.descricao || "", 38, 198, CW - 100, 22);

  ctx.fillStyle = "rgba(2,2,5,0.85)";
  ctx.fillRect(24, 256, CW - 48, 40);
  ctx.fillStyle = T.red;
  ctx.fillRect(24, 256, 4, 40);
  ctx.font = "bold 13px monospace";
  ctx.fillText("ERRO COMUM", 38, 274);
  ctx.font = "15px sans-serif";
  ctx.fillStyle = T.text;
  ctx.fillText((data.execucao?.erro_comum || "").slice(0, 52), 38, 292);

  const actives = Object.entries(data.musculos_ativos || {})
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);
  let my = 322;
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = T.muted;
  ctx.fillText("ATIVAÇÃO MUSCULAR", 24, my);
  my += 20;

  actives.forEach(([key, lvl]) => {
    if (my > CH - 270) return;
    const color = MCOL[lvl] || T.green;
    ctx.fillStyle = "rgba(2,2,5,0.85)";
    ctx.fillRect(24, my, CW - 48, 34);
    ctx.fillStyle = color;
    ctx.fillRect(24, my, 4, 34);
    ctx.beginPath(); ctx.arc(42, my + 17, 6, 0, Math.PI * 2); ctx.fill();
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = T.text;
    ctx.fillText(MNAMES[key] || key, 56, my + 22);
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = color;
    const lvlText = MLVL[lvl] || "";
    ctx.fillText(lvlText, CW - 24 - ctx.measureText(lvlText).width, my + 22);
    ctx.fillStyle = color + "30";
    ctx.fillRect(56, my + 28, CW - 130, 3);
    ctx.fillStyle = color;
    ctx.fillRect(56, my + 28, (CW - 130) * (lvl / 3), 3);
    my += 38;
  });

  my = Math.max(my + 10, CH - 250);
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = T.gold;
  ctx.fillText("MÉTODO MCE", 24, my);
  my += 16;
  ([
    { label: "MENTALIDADE", text: data.mce?.mentalidade, color: T.cyan },
    { label: "COMPORTAMENTO", text: data.mce?.comportamento, color: T.gold },
    { label: "EXECUÇÃO", text: data.mce?.execucao_mce, color: T.green },
  ]).forEach((item) => {
    ctx.fillStyle = item.color + "0a";
    ctx.fillRect(24, my, CW - 48, 44);
    ctx.fillStyle = item.color;
    ctx.fillRect(24, my, 4, 44);
    ctx.font = "bold 12px monospace";
    ctx.fillText(item.label, 38, my + 15);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = T.text;
    ctx.fillText((item.text || "").slice(0, 55), 38, my + 34);
    my += 48;
  });

  ctx.fillStyle = "rgba(2,2,5,0.92)";
  ctx.fillRect(0, CH - 92, CW, 92);
  ctx.fillStyle = T.red;
  ctx.fillRect(0, CH - 92, CW, 3);
  ctx.font = "bold 12px monospace";
  ctx.fillText("⚠ SEM AVALIAÇÃO PRÉVIA", 24, CH - 70);
  ctx.font = "15px sans-serif";
  ctx.fillStyle = T.text;
  ctx.fillText((data.alerta_apex || "").slice(0, 58), 24, CH - 50);
  ctx.fillStyle = T.gold;
  ctx.fillRect(24, CH - 38, 3, 24);
  ctx.font = "italic bold 15px sans-serif";
  ctx.fillText('"' + (data.frase_impacto || "").slice(0, 52) + '"', 34, CH - 22);
  ctx.font = "11px monospace";
  ctx.fillStyle = T.muted;
  ctx.fillText(`${handle} · nutriON · Método MCE`, 34, CH - 6);
}

type Stage = "upload" | "setpoints" | "loading" | "position" | "player";

export default function SocialOnBreakdownStudio({ handle = "@diogo.mell0" }: { handle?: string }) {
  const [stage, setStage] = useState<Stage>("upload");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [analyses, setAnalyses] = useState<(BreakdownAnalysis | null)[]>([]);
  const [anchor, setAnchor] = useState({ cx: 0.5, cy: 0.42, scale: 0.7 });
  const [currentBreak, setCurrentBreak] = useState(-1);
  const [frozen, setFrozen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState<string | null>(null);
  const [loadProg, setLoadProg] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startT = useRef(0);
  const freezeT = useRef(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 150 * 1024 * 1024) { toast({ title: "Vídeo muito grande", description: "Use até 150 MB.", variant: "destructive" }); return; }
    setVideoSrc(URL.createObjectURL(f));
    setBreakpoints([]); setAnalyses([]); setRecorded(null);
    setStage("setpoints");
  };

  const addBP = () => {
    const t = videoRef.current?.currentTime || 0;
    setBreakpoints((p) => (p.some((b) => Math.abs(b - t) < 0.2) ? p : [...p, t].sort((a, b) => a - b)));
  };

  const analyzeAll = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    setStage("loading"); setLoadProg(0);
    const results: (BreakdownAnalysis | null)[] = [];
    const cv = document.createElement("canvas");
    for (let i = 0; i < breakpoints.length; i++) {
      setLoadProg((i / breakpoints.length) * 100);
      v.currentTime = breakpoints[i];
      await new Promise<void>((r) => { v.onseeked = () => r(); });
      await new Promise((r) => setTimeout(r, 250));
      cv.width = v.videoWidth; cv.height = v.videoHeight;
      cv.getContext("2d")?.drawImage(v, 0, 0);
      const dataUrl = cv.toDataURL("image/jpeg", 0.8);
      try {
        const { data, error } = await supabase.functions.invoke("social-on-generate", {
          body: { mode: "video_breakdown", images: [dataUrl], handle },
        });
        if (error) throw error;
        results.push((data?.result as BreakdownAnalysis) ?? null);
      } catch {
        results.push(null);
      }
      setLoadProg(((i + 1) / breakpoints.length) * 100);
    }
    setAnalyses(results);
    if (results.every((r) => !r)) {
      toast({ title: "Não consegui analisar", description: "Tente novamente em alguns segundos.", variant: "destructive" });
      setStage("setpoints");
      return;
    }
    setStage("position");
  }, [breakpoints, handle]);

  const allMuscles = analyses.reduce<Record<string, number>>((acc, a) => {
    Object.entries(a?.musculos_ativos || {}).forEach(([k, v]) => { if (v > (acc[k] || 0)) acc[k] = v; });
    return acc;
  }, {});

  const firstData = analyses.find(Boolean) || null;

  // Render loop
  useEffect(() => {
    if (stage !== "player") return;
    const canvas = canvasRef.current;
    const video = playerVideoRef.current;
    if (!canvas || !video) return;
    canvas.width = CW; canvas.height = CH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    startT.current = performance.now();

    const render = () => {
      const t = (performance.now() - startT.current) / 1000;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CW, CH);
      const vw = video.videoWidth || 720, vh = video.videoHeight || 1280;
      const sc = Math.max(CW / vw, CH / vh);
      const dw = vw * sc, dh = vh * sc;
      ctx.drawImage(video, (CW - dw) / 2, (CH - dh) / 2, dw, dh);

      const a: Anchor = { cx: anchor.cx * CW, cy: anchor.cy * CH, bodyH: CH * anchor.scale };
      const cur = currentBreak >= 0 ? analyses[currentBreak] : null;
      if (frozen && cur) {
        drawGlow(ctx, cur.musculos_ativos || {}, a, t);
        drawFreeze(ctx, cur, (performance.now() - freezeT.current) / 1000, handle);
      } else {
        drawGlow(ctx, allMuscles, a, t);
        if (firstData) drawPlaybackHUD(ctx, firstData, t, handle);
      }
      animRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [stage, anchor, frozen, currentBreak, analyses, allMuscles, firstData, handle]);

  // Breakpoint watcher
  useEffect(() => {
    if (stage !== "player") return;
    const v = playerVideoRef.current;
    if (!v) return;
    let timer: number | undefined;
    const iv = window.setInterval(() => {
      if (frozen) return;
      const t = v.currentTime;
      for (let i = 0; i < breakpoints.length; i++) {
        if (Math.abs(t - breakpoints[i]) < 0.15 && currentBreak !== i && analyses[i]) {
          v.pause(); setFrozen(true); setCurrentBreak(i);
          freezeT.current = performance.now();
          timer = window.setTimeout(() => {
            setFrozen(false);
            v.currentTime = breakpoints[i] + 0.3;
            v.play().catch(() => undefined);
          }, 9000);
          return;
        }
      }
    }, 50);
    return () => { window.clearInterval(iv); if (timer) window.clearTimeout(timer); };
  }, [stage, breakpoints, frozen, currentBreak, analyses]);

  const startPlay = () => {
    const v = playerVideoRef.current;
    if (!v) return;
    v.currentTime = 0;
    setFrozen(false); setCurrentBreak(-1);
    startT.current = performance.now();
    v.play().catch(() => undefined);
  };

  const startRecord = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m));
    if (!mime) { toast({ title: "Gravação indisponível", description: "Use o Chrome no computador.", variant: "destructive" }); return; }
    const rec = new MediaRecorder(canvas.captureStream(30), { mimeType: mime });
    chunksRef.current = [];
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      setRecorded(URL.createObjectURL(new Blob(chunksRef.current, { type: "video/webm" })));
      setRecording(false);
    };
    rec.start(); recRef.current = rec;
    setRecording(true); setRecorded(null);
    startPlay();
  };

  const stopRecord = () => { recRef.current?.stop(); playerVideoRef.current?.pause(); };

  const handlePosition = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setAnchor((a) => ({ ...a, cx: (e.clientX - r.left) / r.width, cy: (e.clientY - r.top) / r.height }));
  };

  const reset = () => {
    setStage("upload"); setVideoSrc(null); setBreakpoints([]); setAnalyses([]);
    setRecorded(null); setFrozen(false); setCurrentBreak(-1);
  };

  const box: React.CSSProperties = { background: T.s, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 };
  const btn: React.CSSProperties = { padding: "14px 16px", background: T.cyan, color: "#000", border: "none", borderRadius: 8, fontWeight: 800, letterSpacing: 1, cursor: "pointer", width: "100%" };

  return (
    <div style={{ background: T.bg, color: T.text, borderRadius: 14, padding: 16, display: "grid", gap: 14 }}>
      <style>{`@keyframes bdSpin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>BREAKDOWN STUDIO</div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>GLOW · FREEZE · GRAVAÇÃO</div>
        </div>
        {stage !== "upload" && (
          <button onClick={reset} style={{ ...btn, width: "auto", background: T.s2, color: T.muted, border: `1px solid ${T.border}` }}>NOVO</button>
        )}
      </div>

      {stage === "upload" && (
        <div style={{ ...box, textAlign: "center", display: "grid", gap: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Músculos brilham enquanto você treina</div>
          <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>
            As luzes pulsam no corpo durante o movimento. Nos momentos-chave o vídeo congela e mostra a análise completa. Depois é só gravar.
          </p>
          <label style={{ ...btn, display: "block", padding: "16px" }}>
            🎬 ADICIONAR VÍDEO
            <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleFile} style={{ display: "none" }} />
          </label>
        </div>
      )}

      {(stage === "setpoints" || stage === "loading") && videoSrc && (
        <div style={{ ...box, display: "grid", gap: 10 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: T.cyan }}>PASSO 1 — MARCAR MOMENTOS</div>
          <video ref={videoRef} src={videoSrc} controls playsInline style={{ width: "100%", borderRadius: 10, background: "#000", maxHeight: 380 }} />
          {stage === "setpoints" && (
            <>
              <button onClick={addBP} style={{ ...btn, background: T.s2, color: T.cyan, border: `1px solid ${T.cyan}55` }}>
                + MARCAR MOMENTO ({breakpoints.length})
              </button>
              {breakpoints.map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.s2, borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                  <span>Momento {i + 1} — {t.toFixed(1)}s</span>
                  <button onClick={() => setBreakpoints((p) => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: T.red, cursor: "pointer" }}>✕</button>
                </div>
              ))}
              {breakpoints.length > 0 && (
                <button onClick={analyzeAll} style={btn}>ANALISAR {breakpoints.length} MOMENTO{breakpoints.length > 1 ? "S" : ""}</button>
              )}
            </>
          )}
          {stage === "loading" && (
            <div style={{ display: "grid", gap: 8, justifyItems: "center", padding: 8 }}>
              <div style={{ width: 34, height: 34, border: `3px solid ${T.border}`, borderTopColor: T.cyan, borderRadius: "50%", animation: "bdSpin 1s linear infinite" }} />
              <div style={{ fontFamily: "monospace", fontSize: 12, color: T.muted }}>Analisando frames... {Math.round(loadProg)}%</div>
              <div style={{ width: "100%", height: 4, background: T.s2, borderRadius: 4 }}>
                <div style={{ width: `${loadProg}%`, height: "100%", background: T.cyan, borderRadius: 4, transition: "width .3s" }} />
              </div>
            </div>
          )}
        </div>
      )}

      {stage === "position" && videoSrc && (
        <div style={{ ...box, display: "grid", gap: 10 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: T.cyan }}>PASSO 2 — POSICIONAR CORPO</div>
          <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>👆 Toque no centro do tronco. As luzes de ativação partem desse ponto.</p>
          <div onClick={handlePosition} style={{ position: "relative", cursor: "crosshair", borderRadius: 10, overflow: "hidden", background: "#000" }}>
            <video src={videoSrc} muted playsInline style={{ width: "100%", display: "block" }} />
            <div style={{ position: "absolute", left: `${anchor.cx * 100}%`, top: `${anchor.cy * 100}%`, width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: "50%", border: `2px solid ${T.cyan}`, boxShadow: `0 0 14px ${T.cyan}` }} />
          </div>
          <label style={{ fontSize: 12, color: T.muted }}>Escala do corpo</label>
          <input type="range" min={0.3} max={1.2} step={0.02} value={anchor.scale}
            onChange={(e) => setAnchor((a) => ({ ...a, scale: parseFloat(e.target.value) }))}
            style={{ width: "100%", accentColor: T.cyan }} />
          <button onClick={() => setStage("player")} style={btn}>INICIAR PLAYER</button>
        </div>
      )}

      {stage === "player" && videoSrc && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#000" }}>
            <video ref={playerVideoRef} src={videoSrc} playsInline muted style={{ display: "none" }} />
            <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
            <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
              {breakpoints.map((_, i) => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: currentBreak >= i ? T.cyan : T.border, boxShadow: currentBreak === i ? `0 0 8px ${T.cyan}` : "none" }} />
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {!recording ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                <button onClick={startPlay} style={{ ...btn, background: T.s2, color: T.cyan, border: `1px solid ${T.cyan}55` }}>▶ PLAY</button>
                <button onClick={startRecord} style={{ ...btn, background: T.red, color: "#fff" }}>● GRAVAR</button>
                <button onClick={() => setStage("position")} style={{ ...btn, width: "auto", background: T.s, color: T.muted, border: `1px solid ${T.border}` }}>⚙</button>
              </div>
            ) : (
              <button onClick={stopRecord} style={{ ...btn, background: T.red, color: "#fff" }}>⏹ PARAR GRAVAÇÃO</button>
            )}

            {recorded && (
              <a href={recorded} download="breakdown-nutrion.webm" style={{ ...btn, background: T.gold, textAlign: "center", textDecoration: "none", display: "block" }}>
                ⬇ BAIXAR VÍDEO
              </a>
            )}

            <div style={{ ...box, fontSize: 12, color: T.muted, display: "grid", gap: 6 }}>
              <span>💡 As luzes pulsam nos músculos ativos enquanto o vídeo roda.</span>
              <span>🧊 Nos momentos marcados congela por 9 segundos com a análise completa e volta sozinho.</span>
              <span>🎥 Gravar captura tudo num vídeo pronto pra Reels.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
