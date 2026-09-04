import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInstagramAccount } from "@/hooks/useInstagramAccount";
import BilateralActivation from "@/components/social/BilateralActivation";
import { saveExercise, readOverlayHandoff, type ExerciseAnalysis, type MovementPhase } from "@/lib/exerciseLibrary";

const T = {
  bg: "#020205", s: "#0a0e18", s2: "#111827",
  cyan: "#00D4FF", gold: "#B8922A", green: "#00d4a1",
  red: "#ff4757", text: "#e8edf5", muted: "#6b7a94",
  border: "#1e2d45",
  font: "'Rajdhani', sans-serif", mono: "'Space Mono', monospace",
};

// Posições relativas ao centro do corpo (% da altura corporal)
const MUSCLE_OFFSETS: Record<string, { dx: number; dy: number; label: string }> = {
  trapezio:       { dx: 0,     dy: -0.32, label: "Trapézio" },
  deltoide_e:     { dx: -0.18, dy: -0.26, label: "Deltóide E" },
  deltoide_d:     { dx: 0.18,  dy: -0.26, label: "Deltóide D" },
  peitoral_e:     { dx: -0.08, dy: -0.20, label: "Peitoral E" },
  peitoral_d:     { dx: 0.08,  dy: -0.20, label: "Peitoral D" },
  biceps_e:       { dx: -0.22, dy: -0.14, label: "Bíceps E" },
  biceps_d:       { dx: 0.22,  dy: -0.14, label: "Bíceps D" },
  triceps_e:      { dx: -0.24, dy: -0.16, label: "Tríceps E" },
  triceps_d:      { dx: 0.24,  dy: -0.16, label: "Tríceps D" },
  antebraco_e:    { dx: -0.26, dy: -0.04, label: "Antebraço E" },
  antebraco_d:    { dx: 0.26,  dy: -0.04, label: "Antebraço D" },
  dorsal_e:       { dx: -0.12, dy: -0.12, label: "Dorsal E" },
  dorsal_d:       { dx: 0.12,  dy: -0.12, label: "Dorsal D" },
  lombar:         { dx: 0,     dy: -0.04, label: "Lombar" },
  abdomen:        { dx: 0,     dy: -0.08, label: "Core" },
  obliquo_e:      { dx: -0.10, dy: -0.06, label: "Oblíquo E" },
  obliquo_d:      { dx: 0.10,  dy: -0.06, label: "Oblíquo D" },
  gluteo_e:       { dx: -0.08, dy: 0.06,  label: "Glúteo E" },
  gluteo_d:       { dx: 0.08,  dy: 0.06,  label: "Glúteo D" },
  quadriceps_e:   { dx: -0.10, dy: 0.18,  label: "Quad E" },
  quadriceps_d:   { dx: 0.10,  dy: 0.18,  label: "Quad D" },
  isquiotibial_e: { dx: -0.10, dy: 0.20,  label: "Isquio E" },
  isquiotibial_d: { dx: 0.10,  dy: 0.20,  label: "Isquio D" },
  adutor_e:       { dx: -0.05, dy: 0.16,  label: "Adutor E" },
  adutor_d:       { dx: 0.05,  dy: 0.16,  label: "Adutor D" },
  panturrilha_e:  { dx: -0.08, dy: 0.36,  label: "Panturrilha E" },
  panturrilha_d:  { dx: 0.08,  dy: 0.36,  label: "Panturrilha D" },
};

const COLORS: Record<number, string> = { 3: "#00D4FF", 2: "#B8922A", 1: "#00d4a1" };
const LABELS: Record<number, string> = { 3: "PRI", 2: "SEC", 1: "EST" };

type OverlayData = ExerciseAnalysis;

type Anchor = { cx: number; cy: number; scale: number };

function drawOverlay(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  data: OverlayData, anchor: { cx: number; cy: number; scale: number },
  time: number, phase: number, active: MovementPhase | null,
) {
  const { cx, cy, scale } = anchor;
  const bodyH = h * scale;
  const pulse = Math.sin(time * 3) * 0.5 + 0.5;

  // Scan grid
  ctx.strokeStyle = "rgba(0,212,255,0.03)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 30; i++) {
    ctx.beginPath(); ctx.moveTo(0, (i / 30) * h); ctx.lineTo(w, (i / 30) * h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo((i / 30) * w, 0); ctx.lineTo((i / 30) * w, h); ctx.stroke();
  }

  // Scan line
  const scanY = ((time * 0.15) % 1) * h;
  const grad = ctx.createLinearGradient(0, scanY, w, scanY);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.3, "rgba(0,212,255,0.15)");
  grad.addColorStop(0.5, "rgba(0,212,255,0.3)");
  grad.addColorStop(0.7, "rgba(0,212,255,0.15)");
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, scanY - 1, w, 3);

  // Corner brackets
  const bLen = 20, bOff = 8;
  ctx.strokeStyle = "rgba(0,212,255,0.6)";
  ctx.lineWidth = 2;
  ([[bOff, bOff, 1, 1], [w - bOff, bOff, -1, 1], [bOff, h - bOff, 1, -1], [w - bOff, h - bOff, -1, -1]] as const)
    .forEach(([x, y, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(x, y + dy * bLen); ctx.lineTo(x, y); ctx.lineTo(x + dx * bLen, y); ctx.stroke();
    });

  if (phase < 1) return;

  // Top-left: exercício
  ctx.fillStyle = "rgba(2,2,5,0.85)";
  ctx.fillRect(8, 8, 200, 50);
  ctx.fillStyle = "#00D4FF";
  ctx.fillRect(8, 8, 2, 50);
  ctx.font = "bold 8px 'Courier New'";
  ctx.fillText("SOCIAL ON · ANÁLISE", 16, 22);
  ctx.font = "bold 16px 'Rajdhani', sans-serif";
  ctx.fillStyle = "#e8edf5";
  ctx.fillText((data.exercicio || "").slice(0, 22), 16, 42);
  ctx.font = "bold 9px 'Courier New'";
  ctx.fillStyle = "#00D4FF";
  ctx.fillText(data.padrao || "", 16, 54);

  if (phase < 2) return;

  // Top-right: cue
  const cueText = data.cue_principal || "";
  ctx.font = "bold 11px sans-serif";
  const cueW = Math.min(220, Math.max(120, ctx.measureText(cueText).width + 24));
  ctx.fillStyle = "rgba(2,2,5,0.85)";
  ctx.fillRect(w - cueW - 8, 8, cueW, 48);
  ctx.fillStyle = "#B8922A";
  ctx.fillRect(w - 10, 8, 2, 48);
  ctx.font = "bold 8px 'Courier New'";
  ctx.fillText("CUE TÉCNICO", w - cueW - 2, 22);
  ctx.font = "bold 11px sans-serif";
  ctx.fillStyle = "#e8edf5";
  const cueWords = cueText.split(" ");
  let line = "", cueY = 36;
  for (const word of cueWords) {
    const test = line + " " + word;
    if (ctx.measureText(test.trim()).width > cueW - 16 && line) {
      ctx.fillText(line.trim(), w - cueW - 2, cueY);
      line = word; cueY += 13;
    } else { line = test; }
  }
  if (line) ctx.fillText(line.trim(), w - cueW - 2, cueY);

  if (phase < 3) return;

  // Marcadores de ativação muscular
  const muscles = data.musculos || {};
  const activeKeys = Object.keys(muscles).filter((k) => (muscles[k] ?? 0) > 0 && MUSCLE_OFFSETS[k]);

  activeKeys.forEach((key, idx) => {
    const off = MUSCLE_OFFSETS[key];
    const intensity = muscles[key];
    const color = COLORS[intensity] || T.cyan;
    const mx = cx + off.dx * bodyH;
    const my = cy + off.dy * bodyH;
    if (mx < 0 || mx > w || my < 0 || my > h) return;

    const inPhase = active?.musculos_ativos?.includes(key);
    const isPulse = active
      ? !!inPhase
      : Math.floor(time * 1.2) % activeKeys.length === idx;
    if (active && !inPhase && intensity < 3) {
      ctx.globalAlpha = 0.35;
    }
    const r = isPulse ? 14 + pulse * 4 : 10;

    const glow = ctx.createRadialGradient(mx, my, 0, mx, my, r * 2);
    glow.addColorStop(0, color + (isPulse ? "40" : "20"));
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(mx, my, r * 2, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = color + (isPulse ? "cc" : "60");
    ctx.lineWidth = isPulse ? 2 : 1;
    ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(mx, my, isPulse ? 4 : 3, 0, Math.PI * 2); ctx.fill();

    if (isPulse || intensity === 3) {
      ctx.font = "bold 9px sans-serif";
      const tw = Math.max(ctx.measureText(off.label).width, 40) + 12;
      const lx = mx - tw / 2;
      const ly = my + r + 4;
      ctx.fillStyle = "rgba(2,2,5,0.88)";
      ctx.fillRect(lx, ly, tw, 24);
      ctx.strokeStyle = color + "60";
      ctx.lineWidth = 1;
      ctx.strokeRect(lx, ly, tw, 24);
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(off.label, mx, ly + 10);
      ctx.font = "bold 7px 'Courier New'";
      ctx.fillStyle = "#6b7a94";
      ctx.fillText(LABELS[intensity] || "", mx, ly + 20);
      ctx.textAlign = "start";
    }

    if (intensity === 3) {
      ctx.strokeStyle = color + "18";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  });

  // Fase atual do movimento
  if (active?.nome) {
    const txt = `${active.nome.toUpperCase()}${active.cue ? " · " + active.cue : ""}`;
    ctx.font = "bold 10px 'Courier New'";
    const pw = Math.min(w - 24, ctx.measureText(txt).width + 24);
    ctx.fillStyle = "rgba(2,2,5,0.85)";
    ctx.fillRect((w - pw) / 2, 66, pw, 22);
    ctx.strokeStyle = "rgba(0,212,255,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect((w - pw) / 2, 66, pw, 22);
    ctx.fillStyle = "#00D4FF";
    ctx.textAlign = "center";
    ctx.fillText(txt, w / 2, 81);
    ctx.textAlign = "start";
  }

  if (phase < 4) return;

  // Ângulos
  (data.angulos || []).slice(0, 3).forEach((ang, i) => {
    const ax = 10;
    const ay = h - 92 - i * 24;
    ctx.fillStyle = "rgba(2,2,5,0.8)";
    ctx.fillRect(ax, ay - 10, 110, 18);
    ctx.fillStyle = "#00d4a1";
    ctx.beginPath(); ctx.arc(ax + 6, ay - 1, 3, 0, Math.PI * 2); ctx.fill();
    ctx.font = "bold 9px 'Courier New'";
    ctx.fillText(ang.slice(0, 18), ax + 14, ay + 2);
  });

  // Alerta (bottom)
  ctx.fillStyle = "rgba(2,2,5,0.9)";
  ctx.fillRect(8, h - 44, w - 16, 36);
  ctx.fillStyle = "#ff4757";
  ctx.fillRect(8, h - 8, w - 16, 2);
  ctx.font = "bold 7px 'Courier New'";
  ctx.fillText("⚠ SEM AVALIAÇÃO PRÉVIA", 14, h - 30);
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#e8edf5";
  ctx.fillText((data.alerta || "").slice(0, 70), 14, h - 16);

  // Frase de impacto
  ctx.fillStyle = "rgba(2,2,5,0.8)";
  ctx.fillRect(8, h - 76, w - 16, 28);
  ctx.fillStyle = "#B8922A";
  ctx.fillRect(8, h - 76, 2, 28);
  ctx.font = "italic bold 10px sans-serif";
  ctx.fillText(`"${(data.frase || "").slice(0, 60)}"`, 16, h - 60);
  ctx.font = "7px 'Courier New'";
  ctx.fillStyle = "#6b7a94";
  ctx.fillText("@diogo.mell0 · nutriON", 16, h - 50);

  // Watermark
  ctx.globalAlpha = 0.03;
  ctx.font = "bold 48px sans-serif";
  ctx.fillStyle = "#00D4FF";
  ctx.textAlign = "center";
  ctx.fillText("nutriON", w / 2, h / 2);
  ctx.textAlign = "start";
  ctx.globalAlpha = 1;
}

export default function SocialOnOverlayStudio() {
  const { account } = useInstagramAccount();
  const handle = account?.username || "@diogo.mell0";

  const [stage, setStage] = useState<"upload" | "loading" | "position" | "overlay">("upload");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [data, setData] = useState<OverlayData | null>(null);
  const [anchor, setAnchor] = useState<Anchor>({ cx: 0.5, cy: 0.45, scale: 0.7 });
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState(0);
  const [loadMsg, setLoadMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savingLib, setSavingLib] = useState(false);
  const [igOpen, setIgOpen] = useState(false);
  const [igLoading, setIgLoading] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const captureVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const igVideos = (account?.recent_media || []).filter(
    (m) => (m.media_type || "").toUpperCase().includes("VIDEO") && !!m.media_url,
  );

  // Exercício vindo da biblioteca: pula direto para o posicionamento após o vídeo entrar
  useEffect(() => {
    const handoff = readOverlayHandoff();
    if (handoff?.data) { setData(handoff.data as OverlayData); setSaved(true); }
  }, []);

  const useIgVideo = async (mediaUrl: string) => {
    setIgLoading(mediaUrl); setError(null);
    try {
      const proxied = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/media-proxy?url=${encodeURIComponent(mediaUrl)}`;
      const resp = await fetch(proxied);
      if (!resp.ok) throw new Error("Não consegui baixar o vídeo desse post.");
      const blob = await resp.blob();
      setVideoSrc(URL.createObjectURL(blob));
      setRecorded(null);
      setIgOpen(false);
    } catch (err: any) {
      setError(err?.message || "Não consegui usar o vídeo desse post. Baixe o arquivo e suba manualmente.");
    } finally {
      setIgLoading(null);
    }
  };

  const saveToLibrary = async () => {
    if (!data) return;
    setSavingLib(true);
    try {
      await saveExercise(data, "overlay");
      setSaved(true);
    } catch (err: any) {
      setError(err?.message || "Não consegui salvar na biblioteca.");
    } finally {
      setSavingLib(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setVideoSrc(URL.createObjectURL(f)); setError(null); setRecorded(null); }
  };

  const grabFrames = async (v: HTMLVideoElement, count: number): Promise<string[]> => {
    const dur = v.duration && isFinite(v.duration) ? v.duration : 0;
    const cv = document.createElement("canvas");
    cv.width = v.videoWidth;
    cv.height = v.videoHeight;
    const ctx = cv.getContext("2d")!;
    if (!dur) {
      ctx.drawImage(v, 0, 0);
      return [cv.toDataURL("image/jpeg", 0.75)];
    }
    const wasPaused = v.paused;
    v.pause();
    const original = v.currentTime;
    const frames: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = (dur * (i + 0.5)) / count;
      await new Promise<void>((resolve) => {
        const onSeek = () => { v.removeEventListener("seeked", onSeek); resolve(); };
        v.addEventListener("seeked", onSeek);
        v.currentTime = Math.min(t, Math.max(0, dur - 0.05));
        setTimeout(() => { v.removeEventListener("seeked", onSeek); resolve(); }, 1500);
      });
      ctx.drawImage(v, 0, 0);
      frames.push(cv.toDataURL("image/jpeg", 0.72));
    }
    v.currentTime = original;
    if (!wasPaused) v.play().catch(() => {});
    return frames;
  };

  const analyze = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) { setError("Aguarde o vídeo carregar por completo."); return; }
    setStage("loading"); setError(null); setLoadMsg("Lendo o movimento completo...");

    const msgs = ["Mapeando ativação muscular bilateral...", "Separando fases do movimento...", "Preparando overlay..."];
    const timers = msgs.map((m, i) => setTimeout(() => setLoadMsg(m), (i + 1) * 2600));

    try {
      const frames = await grabFrames(v, 5);
      const { data: res, error: fnError } = await supabase.functions.invoke("social-on-generate", {
        body: { mode: "video_overlay", images: frames, handle },
      });
      if (fnError) throw new Error(fnError.message);
      if (res?.error) throw new Error(res.error);
      setData(res?.result as OverlayData);
      setSaved(false);
      setStage("position");
    } catch (err: any) {
      setError(err?.message || "Falha na análise. Tente outro vídeo.");
      setStage("upload");
    } finally {
      timers.forEach(clearTimeout);
    }
  }, [handle]);

  // Render loop
  useEffect(() => {
    if (stage !== "overlay" || !data) return;
    const canvas = canvasRef.current;
    const video = captureVideoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d")!;
    startTimeRef.current = performance.now();

    const render = () => {
      const w = (canvas.width = video.videoWidth || 720);
      const h = (canvas.height = video.videoHeight || 1280);
      ctx.drawImage(video, 0, 0, w, h);
      const t = (performance.now() - startTimeRef.current) / 1000;
      const dur = video.duration || 0;
      const frac = dur > 0 ? (video.currentTime % dur) / dur : 0;
      const active = (data.fases || []).find(
        (f) => frac >= (f.inicio ?? 0) && frac <= (f.fim ?? 1),
      ) || (data.fases || [])[0] || null;
      drawOverlay(ctx, w, h, data, { cx: anchor.cx * w, cy: anchor.cy * h, scale: anchor.scale }, t, phase, active);
      animRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [stage, data, anchor, phase]);

  // Fases progressivas
  useEffect(() => {
    if (stage !== "overlay" || !playing) return;
    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [stage, playing]);

  const togglePlay = () => {
    const v = captureVideoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const startRecording = () => {
    const canvas = canvasRef.current;
    const video = captureVideoRef.current;
    if (!canvas || !video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
    setPlaying(true);
    setPhase(0);

    const stream = canvas.captureStream(30);
    try {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch { /* sem áudio */ }

    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecorded(URL.createObjectURL(blob));
      setRecording(false);
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    captureVideoRef.current?.pause();
    setPlaying(false);
  };

  const handleCanvasTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== "position") return;
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchor((a) => ({
      ...a,
      cx: (e.clientX - rect.left) / rect.width,
      cy: (e.clientY - rect.top) / rect.height,
    }));
  };

  const reset = () => {
    setStage("upload"); setData(null); setVideoSrc(null);
    setPlaying(false); setRecorded(null); setPhase(0); setError(null);
  };

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: `${T.cyan}18`, border: `1px solid ${T.cyan}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎞️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>OVERLAY STUDIO</div>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: T.mono, letterSpacing: 1 }}>SOCIAL ON · nutriON</div>
          </div>
        </div>
        {(stage === "overlay" || stage === "position") && (
          <button onClick={reset} style={{ padding: "8px 14px", background: T.s, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: T.font }}>NOVO</button>
        )}
      </div>

      {error && (
        <div style={{ background: `${T.red}14`, border: `1px solid ${T.red}55`, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: T.red, marginBottom: 12 }}>{error}</div>
      )}

      {/* UPLOAD */}
      {stage === "upload" && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>Ativações musculares sobre seu vídeo</div>
            <div style={{ fontSize: 12, color: T.muted }}>Suba o vídeo → marque o centro do corpo → grave o vídeo final com um toque.</div>
          </div>
          <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleFile} style={{ display: "none" }} />
          {!videoSrc ? (
            <button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "40px 16px", background: T.s, border: `1px dashed ${T.border}`, borderRadius: 12, cursor: "pointer", color: T.text, fontFamily: T.font }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Toque para adicionar vídeo</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>MP4, MOV ou WebM</div>
            </button>
          ) : (
            <div>
              <video ref={videoRef} src={videoSrc} controls playsInline style={{ width: "100%", borderRadius: 10, background: "#000", maxHeight: 420 }} />
              <div style={{ fontSize: 11, color: T.gold, margin: "10px 0", textAlign: "center" }}>💡 Pause no frame de maior amplitude do movimento</div>
              <button onClick={analyze} style={{ width: "100%", padding: 16, background: T.cyan, color: "#000", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: T.font, letterSpacing: 1 }}>
                ANALISAR EXERCÍCIO
              </button>
            </div>
          )}
        </div>
      )}

      {/* LOADING */}
      {stage === "loading" && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ width: 44, height: 44, border: `3px solid ${T.border}`, borderTopColor: T.cyan, borderRadius: "50%", margin: "0 auto 16px", animation: "ovSpin 0.9s linear infinite" }} />
          <div style={{ fontSize: 13, color: T.muted, fontFamily: T.mono }}>{loadMsg}</div>
          <style>{`@keyframes ovSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* POSITION ANCHOR */}
      {stage === "position" && data && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>👆 Toque no centro do corpo (tronco/quadril)</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Os marcadores de ativação serão posicionados a partir deste ponto</div>
          </div>
          <div onClick={handleCanvasTap} style={{ position: "relative", cursor: "crosshair", borderRadius: 10, overflow: "hidden" }}>
            <video src={videoSrc!} muted playsInline style={{ width: "100%", display: "block", background: "#000" }} />
            {/* Anchor marker */}
            <div style={{ position: "absolute", left: `${anchor.cx * 100}%`, top: `${anchor.cy * 100}%`, transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
              <div style={{ width: 28, height: 28, border: `2px solid ${T.cyan}`, borderRadius: "50%", animation: "ovPulse 1.4s ease-in-out infinite" }} />
              <div style={{ position: "absolute", left: "50%", top: -14, width: 1, height: 56, background: `${T.cyan}80`, transform: "translateX(-50%)" }} />
              <div style={{ position: "absolute", top: "50%", left: -14, height: 1, width: 56, background: `${T.cyan}80`, transform: "translateY(-50%)" }} />
            </div>
            <style>{`@keyframes ovPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.6; } }`}</style>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontFamily: T.mono, color: T.muted, marginBottom: 6 }}>Escala do corpo</div>
            <input type="range" min={0.4} max={1.1} step={0.02} value={anchor.scale}
              onChange={(e) => setAnchor((a) => ({ ...a, scale: parseFloat(e.target.value) }))}
              style={{ width: "100%", accentColor: T.cyan }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted }}>
              <span>Longe</span><span>Perto</span>
            </div>
          </div>
          <button onClick={() => { setStage("overlay"); setPhase(0); }} style={{ width: "100%", padding: 16, marginTop: 14, background: T.cyan, color: "#000", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: T.font, letterSpacing: 1 }}>
            APLICAR OVERLAY
          </button>
        </div>
      )}

      {/* OVERLAY PLAYER */}
      {stage === "overlay" && data && (
        <div>
          <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: "#000" }}>
            <video ref={captureVideoRef} src={videoSrc!} playsInline loop style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
            <canvas ref={canvasRef} onClick={togglePlay} style={{ width: "100%", display: "block", cursor: "pointer" }} />
            {!playing && (
              <div onClick={togglePlay} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,212,255,0.2)", border: `2px solid ${T.cyan}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: T.cyan }}>▶</div>
              </div>
            )}
          </div>

          {/* Legenda */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", margin: "12px 0" }}>
            {[{ c: T.cyan, l: "Primário" }, { c: T.gold, l: "Secundário" }, { c: T.green, l: "Estabilizador" }].map((l) => (
              <div key={l.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.c }} />
                <span style={{ fontSize: 11, color: T.muted }}>{l.l}</span>
              </div>
            ))}
          </div>

          {/* Ações */}
          <div style={{ display: "flex", gap: 8 }}>
            {!recording ? (
              <button onClick={startRecording} style={{ flex: 1, padding: 14, background: T.red, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.font, letterSpacing: 1 }}>
                ● GRAVAR VÍDEO
              </button>
            ) : (
              <button onClick={stopRecording} style={{ flex: 1, padding: 14, background: T.s2, color: T.red, border: `1px solid ${T.red}`, borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.font, animation: "ovRec 1s ease-in-out infinite" }}>
                ■ PARAR GRAVAÇÃO
              </button>
            )}
            <button onClick={() => setStage("position")} style={{ padding: "14px 16px", background: T.s, border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, cursor: "pointer", fontSize: 13, fontFamily: T.font }}>⚙️</button>
          </div>
          <style>{`@keyframes ovRec { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>

          {recorded && (
            <a href={recorded} download={`overlay-${(data.exercicio || "exercicio").toLowerCase().replace(/\s+/g, "-")}.webm`}
              style={{ display: "block", textAlign: "center", marginTop: 10, padding: 14, background: `${T.green}18`, border: `1px solid ${T.green}55`, borderRadius: 8, color: T.green, fontSize: 13, fontWeight: 800, textDecoration: "none", letterSpacing: 1 }}>
              ⬇ BAIXAR VÍDEO COM OVERLAY
            </a>
          )}

          {/* Info card */}
          <div style={{ marginTop: 14, background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{data.exercicio}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {(data.musculos_primarios || []).map((m) => (
                <span key={m} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, color: T.cyan, background: `${T.cyan}18`, border: `1px solid ${T.cyan}55` }}>{m}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.gold }}>🎯 {data.cue_principal}</div>
            {(data.cues || []).map((c, i) => (
              <div key={i} style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>· {c}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
