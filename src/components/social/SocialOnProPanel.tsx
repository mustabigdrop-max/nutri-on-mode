import { useCallback, useEffect, useRef, useState } from "react";
import {
  Briefcase, Camera, Check, Clock, Copy, Crown, Download, Dumbbell, Eye,
  Heart, Pause, Play, RefreshCw, Sparkles, Star, Type, Video, X, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const C = {
  bg: "#020205", border: "#B8922A22", gold: "#B8922A",
  goldBg: "#B8922A08", cyan: "#00D4FF", cyanBg: "#00D4FF0A",
  green: "#00C896", red: "#ff4444", purple: "#7C3AED",
  orange: "#E8A020", pink: "#EC4899",
  text: "#F5F0E8", textMid: "#888888", textMuted: "#2A2A2A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

type VibeStyle = {
  font: string; size: number; color: string; stroke: number; y: number;
  upper: boolean; shadow: boolean; spacing: number;
  bg?: string; pad?: number; glow?: string; glowSize?: number; black?: boolean; bars?: boolean;
};
type Vibe = { id: string; name: string; icon: typeof Eye; color: string; textStyle: VibeStyle };

const VIBES: Vibe[] = [
  { id: "pov", name: "POV", icon: Eye, color: C.cyan, textStyle: { font: "Impact, sans-serif", size: 40, color: "#fff", stroke: 3, y: 0.13, upper: true, shadow: true, spacing: 2 } },
  { id: "treino", name: "Treino", icon: Dumbbell, color: C.green, textStyle: { font: "Impact, sans-serif", size: 44, color: "#fff", stroke: 3, y: 0.5, upper: true, shadow: true, spacing: 3 } },
  { id: "cultura", name: "Cultura", icon: Crown, color: C.gold, textStyle: { font: "'Rajdhani', sans-serif", size: 36, color: "#B8922A", stroke: 2, y: 0.5, upper: true, shadow: true, spacing: 4 } },
  { id: "pai", name: "Pai", icon: Heart, color: C.pink, textStyle: { font: "'Caveat', cursive", size: 36, color: "#fff", stroke: 0, y: 0.18, upper: false, shadow: true, spacing: 0 } },
  { id: "tela_preta", name: "Tela Preta", icon: Type, color: C.text, textStyle: { font: "'Rajdhani', sans-serif", size: 34, color: "#fff", stroke: 0, y: 0.45, upper: true, shadow: false, spacing: 3, black: true } },
  { id: "neon", name: "Neon", icon: Zap, color: "#ff44ff", textStyle: { font: "Impact, sans-serif", size: 42, color: "#00D4FF", stroke: 0, y: 0.5, upper: true, shadow: false, spacing: 3, glow: "#00D4FF", glowSize: 25 } },
  { id: "business", name: "CEO", icon: Briefcase, color: C.purple, textStyle: { font: "'Space Mono', monospace", size: 22, color: "#fff", stroke: 0, y: 0.82, upper: false, shadow: true, spacing: 1, bg: "rgba(0,0,0,0.6)", pad: 10 } },
  { id: "cinema", name: "Cinema", icon: Star, color: C.orange, textStyle: { font: "'Rajdhani', sans-serif", size: 30, color: "#fff", stroke: 0, y: 0.5, upper: true, shadow: true, spacing: 5, bars: true } },
];

type ProResult = {
  texto_video?: string; hook?: string; legenda?: string; hashtags?: string[];
  self_comment?: string; musica?: string; horario?: string; stories?: string[];
};

const CopyBtn = ({ text, label = "COPIAR", big }: { text: string; label?: string; big?: boolean }) => {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 2000); }}
      style={big
        ? {
            width: "100%", padding: "11px 0", cursor: "pointer",
            background: ok ? `${C.green}15` : C.goldBg,
            border: `1px solid ${ok ? `${C.green}44` : C.border}`,
            ...fT, fontSize: 13, color: ok ? C.green : C.gold,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
          }
        : { background: "none", border: "none", cursor: "pointer", ...fM, fontSize: 10, color: ok ? C.green : C.textMid, display: "flex", alignItems: "center", gap: 4 }}
    >
      {ok ? <Check size={big ? 14 : 11} /> : <Copy size={big ? 14 : 11} />} {ok ? "COPIADO" : label}
    </button>
  );
};


function compress(file: File, max = 1024): Promise<{ dataUrl: string } | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > max || h > max) {
        if (w > h) { h = Math.round((h * max) / w); w = max; } else { w = Math.round((w * max) / h); h = max; }
      }
      c.width = w; c.height = h;
      c.getContext("2d")?.drawImage(img, 0, 0, w, h);
      resolve({ dataUrl: c.toDataURL("image/jpeg", 0.75) });
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

function grabFrame(vid: HTMLVideoElement, t: number): Promise<string> {
  return new Promise((resolve) => {
    const fn = () => {
      const c = document.createElement("canvas");
      let w = vid.videoWidth, h = vid.videoHeight;
      if (w > 1024 || h > 1024) {
        if (w > h) { h = Math.round((h * 1024) / w); w = 1024; } else { w = Math.round((w * 1024) / h); h = 1024; }
      }
      c.width = w; c.height = h;
      c.getContext("2d")?.drawImage(vid, 0, 0, w, h);
      vid.removeEventListener("seeked", fn);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    vid.addEventListener("seeked", fn);
    vid.currentTime = t;
  });
}

function drawCanvas(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  media: HTMLImageElement | HTMLVideoElement | null, lines: string[], style: VibeStyle,
) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  if (media) {
    const mw = media instanceof HTMLVideoElement ? media.videoWidth : media.width;
    const mh = media instanceof HTMLVideoElement ? media.videoHeight : media.height;
    if (mw && mh) {
      const vr = mw / mh, cr = w / h;
      let dw: number, dh: number, dx: number, dy: number;
      if (vr > cr) { dh = h; dw = h * vr; dx = (w - dw) / 2; dy = 0; }
      else { dw = w; dh = w / vr; dx = 0; dy = (h - dh) / 2; }
      ctx.drawImage(media, dx, dy, dw, dh);
    }
  }

  if (style.black) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h); }
  if (style.bars) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h * 0.1); ctx.fillRect(0, h * 0.9, w, h * 0.1); }
  if (!lines.length) return;

  const scale = w / 400;
  const fs = style.size * scale;
  ctx.font = `bold ${fs}px ${style.font}`;
  ctx.textAlign = "center";
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${(style.spacing || 0) * scale}px`;

  const lineH = fs * 1.3;
  const baseY = h * style.y - (lines.length * lineH) / 2 + fs;

  lines.forEach((line, i) => {
    const ly = baseY + i * lineH;
    const tx = w / 2;

    if (style.bg) {
      const m = ctx.measureText(line);
      ctx.fillStyle = style.bg;
      ctx.fillRect(tx - m.width / 2 - (style.pad || 8), ly - fs + 2, m.width + (style.pad || 8) * 2, fs + (style.pad || 8));
    }

    ctx.save();
    if (style.glow) {
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = style.glowSize || 20;
      ctx.fillStyle = style.color;
      ctx.fillText(line, tx, ly);
      ctx.fillText(line, tx, ly);
      ctx.shadowBlur = 0;
    }
    if (style.stroke > 0) {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = style.stroke * scale;
      ctx.lineJoin = "round";
      ctx.strokeText(line, tx, ly);
    }
    if (style.shadow && !style.glow) {
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    ctx.fillStyle = style.color;
    ctx.fillText(line, tx, ly);
    ctx.restore();
  });
}

export default function SocialOnProPanel({ ctx }: { ctx?: Record<string, any> } = {}) {
  const [step, setStep] = useState<"upload" | "generating" | "result">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mediaEl, setMediaEl] = useState<HTMLImageElement | HTMLVideoElement | null>(null);
  const [data, setData] = useState<ProResult | null>(null);
  const [vibe, setVibe] = useState<Vibe>(VIBES[0]);
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadMsg, setLoadMsg] = useState("");
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [curTime, setCurTime] = useState(0);
  const [textOverride, setTextOverride] = useState("");
  const [exporting, setExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const animRef = useRef<number | null>(null);

  const cw = 720, ch = 1280;
  const videoText = textOverride || data?.texto_video || "";
  const lines = videoText ? (vibe.textStyle.upper ? videoText.toUpperCase() : videoText).split("\n") : [];

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawCanvas(ctx, cw, ch, mediaEl, lines, vibe.textStyle);
  }, [mediaEl, lines, vibe]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    if (!isVideo || !playing) return;
    const loop = () => { draw(); animRef.current = requestAnimationFrame(loop); };
    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing, isVideo, draw]);

  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  const reset = () => {
    setFile(null); setData(null); setStep("upload"); setTextOverride("");
    setError(null); setMediaEl(null); setPlaying(false); setDuration(0); setCurTime(0);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setFile(f); setError(null); setData(null); setTextOverride(""); setMediaEl(null);
    const url = URL.createObjectURL(f);
    setBlobUrl(url);
    const vid = f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(f.name);
    setIsVideo(vid);
    if (!vid) {
      const img = new window.Image();
      img.onload = () => setMediaEl(img);
      img.src = url;
    }
  };

  const onVidReady = () => {
    setMediaEl(videoRef.current);
    setDuration(videoRef.current?.duration || 0);
    setTimeout(draw, 50);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); } else { void v.play(); setPlaying(true); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const handleGenerate = async () => {
    if (!file) { setError("Sobe uma foto ou vídeo primeiro."); return; }
    setStep("generating"); setError(null);
    const msgs = ["Analisando material...", "Escrevendo o texto do vídeo...", "Montando a legenda...", "Selecionando hashtags...", "Fechando os stories..."];
    let mi = 0; setLoadMsg(msgs[0]);
    const iv = window.setInterval(() => { mi = Math.min(mi + 1, msgs.length - 1); setLoadMsg(msgs[mi]); }, 2500);

    try {
      let image: string | null = null;
      if (isVideo && blobUrl) {
        const v = document.createElement("video");
        v.src = blobUrl; v.muted = true; v.playsInline = true; v.preload = "auto";
        await new Promise((res, rej) => { v.onloadeddata = () => res(null); v.onerror = () => rej(new Error("Não consegui ler o vídeo.")); });
        image = await grabFrame(v, Math.min(1, (v.duration || 5) * 0.2));
      } else {
        const d = await compress(file);
        if (!d) throw new Error("Erro ao processar a imagem.");
        image = d.dataUrl;
      }

      const { data: res, error: fnErr } = await supabase.functions.invoke("prism-analyze", {
        body: {
          mode: "social_pro",
          image,
          from_video: isVideo,
          vibe: vibe.name,
          context,
          handle: ctx?.handle,
          niches: ctx?.niches,
          products: ctx?.products,
          differentials: ctx?.differentials,
        },
      });
      if (fnErr) throw new Error(fnErr.message);
      if ((res as { error?: string })?.error) throw new Error((res as { error?: string }).error as string);

      setData((res as { result: ProResult }).result || {});
      setTextOverride("");
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setStep("upload");
    } finally {
      window.clearInterval(iv);
    }
  };

  const exportPNG = () => {
    draw();
    setTimeout(() => {
      const a = document.createElement("a");
      a.download = `socialon-${Date.now()}.png`;
      a.href = canvasRef.current?.toDataURL("image/png") || "";
      a.click();
    }, 60);
  };

  const exportVid = async () => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!isVideo || !v || !canvas || exporting) return;
    setExporting(true);
    const stream = canvas.captureStream(30);
    const mime = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm"]
      .find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) || "video/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
      const blob = new Blob(chunks, { type: mime });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `socialon-${Date.now()}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      setExporting(false);
      setPlaying(false);
    };
    v.currentTime = 0;
    rec.start();
    await v.play();
    setPlaying(true);
    const loop = () => {
      draw();
      if (!v.paused && !v.ended) requestAnimationFrame(loop);
      else rec.stop();
    };
    requestAnimationFrame(loop);
  };

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ ...fT, fontSize: 24, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} color={C.gold} /> SOCIAL ON PRO
          </div>
          <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 2 }}>Sobe a mídia, escolhe a vibe, sai post pronto com texto queimado</div>
        </div>
        {step === "result" && (
          <span style={{ ...fM, fontSize: 10, letterSpacing: "0.12em", color: C.green, background: `${C.green}12`, border: `1px solid ${C.green}44`, padding: "4px 8px" }}>
            PRONTO PRA POSTAR
          </span>
        )}
        {step === "result" && (

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportPNG} style={{ padding: "9px 14px", background: "transparent", border: `1px solid ${C.border}`, ...fM, fontSize: 12, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Download size={13} /> SALVAR FOTO
            </button>
            {isVideo && (
              <button onClick={exportVid} disabled={exporting} style={{ padding: "9px 14px", background: C.gold, border: "none", ...fT, fontSize: 14, color: C.bg, cursor: exporting ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                {exporting ? <RefreshCw size={13} className="animate-spin" /> : <Video size={13} />} SALVAR VÍDEO
              </button>
            )}
          </div>
        )}
      </div>

      {step === "upload" && (
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              background: file ? `${C.green}06` : "transparent",
              border: `2px dashed ${file ? C.green : C.border}`,
              padding: file ? 12 : "34px 16px", textAlign: "center", cursor: "pointer", marginBottom: 12,
            }}
          >
            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: "none" }} />
            {!file ? (
              <>
                <Camera size={26} color={C.gold} />
                <div style={{ ...fT, fontSize: 18, color: C.text, marginTop: 8 }}>Sobe foto ou vídeo</div>
                <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 2 }}>JPG, PNG, MP4, MOV</div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                {isVideo ? <Video size={16} color={C.green} /> : <Camera size={16} color={C.green} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...fM, fontSize: 12, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                  <div style={{ ...fM, fontSize: 11, color: C.textMid }}>{(file.size / 1e6).toFixed(1)}MB</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); reset(); }} style={{ background: "none", border: `1px solid ${C.border}`, padding: 4, cursor: "pointer" }}>
                  <X size={12} color={C.textMid} />
                </button>
              </div>
            )}
          </div>

          {isVideo && blobUrl && (
            <video ref={videoRef} src={blobUrl} playsInline muted onLoadedData={onVidReady}
              onTimeUpdate={() => setCurTime(videoRef.current?.currentTime || 0)}
              onEnded={() => setPlaying(false)} style={{ display: "none" }} />
          )}

          <div style={{ ...fM, fontSize: 11, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 8 }}>VIBE</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {VIBES.map((v) => (
              <button key={v.id} onClick={() => setVibe(v)} style={{
                flex: "1 1 calc(25% - 6px)", minWidth: 82, padding: "10px 4px", cursor: "pointer",
                background: vibe.id === v.id ? `${v.color}12` : "transparent",
                border: `1px solid ${vibe.id === v.id ? `${v.color}66` : C.border}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <v.icon size={14} color={v.color} />
                <span style={{ ...fM, fontSize: 11, color: vibe.id === v.id ? v.color : C.textMid }}>{v.name}</span>
              </button>
            ))}
          </div>

          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            placeholder="Contexto: acabei de treinar costas, quero vender nutriON, tava com minha filha..."
            style={{ width: "100%", padding: 10, ...fM, fontSize: 13, background: "transparent", border: `1px solid ${C.border}`, color: C.text, resize: "none", boxSizing: "border-box", marginBottom: 10 }}
          />

          {error && (
            <div style={{ ...fM, fontSize: 12, color: C.red, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <X size={12} /> {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={!file} style={{
            width: "100%", padding: "14px 0", background: file ? C.gold : "transparent",
            border: file ? "none" : `1px solid ${C.border}`, ...fT, fontSize: 16,
            color: file ? C.bg : C.textMid, cursor: file ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <Sparkles size={15} /> GERAR TUDO
          </button>
        </div>
      )}

      {step === "generating" && (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <RefreshCw size={26} color={C.gold} className="animate-spin" style={{ margin: "0 auto 12px" }} />
          <div style={{ ...fT, fontSize: 18, color: C.gold }}>{loadMsg}</div>
          <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 6 }}>Texto do vídeo, legenda, hashtags e stories saindo agora.</div>
        </div>
      )}

      {step === "result" && data && (
        <div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, background: "#0a0a0a", border: `1px solid ${C.border}` }}>
            <canvas ref={canvasRef} width={cw} height={ch} style={{ width: "100%", maxWidth: 300, display: "block" }} />
          </div>

          {isVideo && blobUrl && (
            <video ref={videoRef} src={blobUrl} playsInline onLoadedData={onVidReady}
              onTimeUpdate={() => setCurTime(videoRef.current?.currentTime || 0)}
              onEnded={() => setPlaying(false)} style={{ display: "none" }} />
          )}

          {isVideo && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <button onClick={togglePlay} style={{ background: C.goldBg, border: `1px solid ${C.border}`, padding: 6, cursor: "pointer" }}>
                {playing ? <Pause size={12} color={C.text} /> : <Play size={12} color={C.text} />}
              </button>
              <span style={{ ...fM, fontSize: 11, color: C.text, width: 38 }}>{fmt(curTime)}</span>
              <div
                style={{ flex: 1, height: 3, background: `${C.text}18`, cursor: "pointer" }}
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  if (videoRef.current && duration) videoRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration;
                }}
              >
                <div style={{ width: `${duration ? (curTime / duration) * 100 : 0}%`, height: "100%", background: C.gold }} />
              </div>
              <span style={{ ...fM, fontSize: 11, color: C.text }}>{fmt(duration)}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button onClick={exportPNG} style={{
              flex: 1, padding: "13px 0", background: C.gold, border: "none",
              ...fT, fontSize: 14, color: C.bg, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Download size={15} /> SALVAR FOTO
            </button>
            {isVideo && (
              <button onClick={exportVid} disabled={exporting} style={{
                flex: 1, padding: "13px 0", background: C.cyan, border: "none",
                ...fT, fontSize: 14, color: C.bg, cursor: exporting ? "default" : "pointer",
                opacity: exporting ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                {exporting ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />} SALVAR VÍDEO
              </button>
            )}
          </div>


          <div style={{ border: `1px solid ${C.border}`, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
              <span style={{ ...fM, fontSize: 11, color: C.gold, letterSpacing: "0.1em" }}>TEXTO NO VÍDEO</span>
              <div style={{ display: "flex", gap: 4 }}>
                {VIBES.map((v) => (
                  <button key={v.id} onClick={() => setVibe(v)} style={{
                    width: 24, height: 24, background: `${v.color}15`,
                    border: `1px solid ${vibe.id === v.id ? v.color : C.border}`, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <v.icon size={11} color={v.color} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={videoText}
              onChange={(e) => setTextOverride(e.target.value)}
              rows={2}
              style={{ width: "100%", padding: 10, ...fT, fontSize: 16, background: `${C.text}06`, border: `1px solid ${C.border}`, color: C.text, resize: "none", boxSizing: "border-box" }}
            />
            {data.hook && <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 8 }}>HOOK: {data.hook}</div>}
          </div>

          <div style={{ border: `1px solid ${C.border}`, padding: 12, marginBottom: 8 }}>
            <div style={{ ...fM, fontSize: 11, color: C.gold, letterSpacing: "0.1em", marginBottom: 6 }}>LEGENDA PRONTA</div>
            <div style={{ ...fM, fontSize: 13, color: C.textMid, lineHeight: 1.8, whiteSpace: "pre-line", maxHeight: 220, overflow: "auto", marginBottom: 8 }}>{data.legenda}</div>
            <CopyBtn text={data.legenda || ""} label="COPIAR LEGENDA" big />
          </div>

          {!!data.hashtags?.length && (
            <div style={{ border: `1px solid ${C.border}`, padding: 12, marginBottom: 8 }}>
              <div style={{ ...fM, fontSize: 11, color: C.textMuted, marginBottom: 6 }}>HASHTAGS ({data.hashtags.length})</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                {data.hashtags.map((h, i) => (
                  <span key={i} style={{ ...fM, fontSize: 11, color: C.cyan, background: C.cyanBg, padding: "2px 6px" }}>{h}</span>
                ))}
              </div>
              <CopyBtn text={data.hashtags.join(" ")} label="COPIAR HASHTAGS" big />
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            {data.self_comment && (
              <div style={{ flex: "1 1 200px", border: `1px solid ${C.border}`, padding: 12 }}>
                <div style={{ ...fM, fontSize: 11, color: C.textMuted, marginBottom: 4 }}>SELF-COMMENT</div>
                <div style={{ ...fM, fontSize: 12, color: C.textMid, lineHeight: 1.6, marginBottom: 8 }}>{data.self_comment}</div>
                <CopyBtn text={data.self_comment} label="COPIAR COMENTÁRIO" big />
              </div>
            )}

            <div style={{ flex: "1 1 200px", border: `1px solid ${C.border}`, padding: 12 }}>
              {data.musica && (
                <>
                  <span style={{ ...fM, fontSize: 11, color: C.textMuted }}>MÚSICA</span>
                  <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 4 }}>{data.musica}</div>
                </>
              )}
              {data.horario && (
                <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                  <Clock size={11} /> {data.horario}
                </div>
              )}
            </div>
          </div>

          {!!data.stories?.length && (
            <div style={{ border: `1px solid ${C.border}`, padding: 12, marginBottom: 10 }}>
              <span style={{ ...fM, fontSize: 11, color: C.textMuted }}>STORIES DO DIA</span>
              {data.stories.map((st, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: i < (data.stories?.length ?? 0) - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ ...fT, fontSize: 13, color: C.purple, width: 14 }}>{i + 1}</span>
                  <span style={{ ...fM, fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{st}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={reset} style={{ flex: 1, padding: "12px 0", background: "transparent", border: `1px solid ${C.border}`, ...fT, fontSize: 14, color: C.textMid, cursor: "pointer" }}>
              NOVO
            </button>
            <button onClick={handleGenerate} style={{ flex: 1, padding: "12px 0", background: C.goldBg, border: `1px solid ${C.border}`, ...fT, fontSize: 14, color: C.gold, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <RefreshCw size={13} /> REGERAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
