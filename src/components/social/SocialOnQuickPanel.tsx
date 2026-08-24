import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera, Check, ChevronLeft, ChevronRight, Copy, Download, Hash,
  Pause, Play, RefreshCw, Sparkles, Video, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const C = {
  bg: "#020205", border: "#B8922A22", gold: "#B8922A",
  goldBg: "#B8922A08", cyan: "#00D4FF", green: "#00C896", red: "#ff4444",
  text: "#F5F0E8", textMid: "#888888", textMuted: "#2A2A2A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

type Style = {
  name: string; font: string; size: number; color: string; stroke: number; y: number;
  upper: boolean; shadow?: boolean; spacing: number; glow?: string; glowSize?: number;
  bg?: string; pad?: number; bars?: boolean;
};

const STYLES: Style[] = [
  { name: "IMPACTO", font: "Impact, sans-serif", size: 44, color: "#FFFFFF", stroke: 3, y: 0.13, upper: true, shadow: true, spacing: 2 },
  { name: "GOLD MCE", font: "'Rajdhani', sans-serif", size: 38, color: "#B8922A", stroke: 2, y: 0.5, upper: true, shadow: true, spacing: 4 },
  { name: "NEON", font: "Impact, sans-serif", size: 42, color: "#00D4FF", stroke: 0, y: 0.5, upper: true, spacing: 3, glow: "#00D4FF", glowSize: 25 },
  { name: "LEGENDA", font: "'Inter', sans-serif", size: 24, color: "#FFFFFF", stroke: 0, y: 0.83, upper: false, shadow: true, spacing: 1, bg: "rgba(0,0,0,0.65)", pad: 10 },
  { name: "CINEMA", font: "'Rajdhani', sans-serif", size: 30, color: "#FFFFFF", stroke: 0, y: 0.5, upper: true, shadow: true, spacing: 6, bars: true },
  { name: "EMOCIONAL", font: "'Caveat', cursive", size: 38, color: "#FFFFFF", stroke: 0, y: 0.18, upper: false, shadow: true, spacing: 0 },
];

type Version = {
  nome?: string; texto_video?: string; legenda?: string; hashtags?: string[];
  self_comment?: string; musica?: string; horario?: string;
};

function drawResult(
  canvas: HTMLCanvasElement | null,
  media: HTMLImageElement | HTMLVideoElement | null,
  textStr: string,
  style: Style,
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
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

  if (style.bars) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h * 0.1);
    ctx.fillRect(0, h * 0.9, w, h * 0.1);
  }
  if (!textStr) return;

  const lines = (style.upper ? textStr.toUpperCase() : textStr).split("\n");
  const scale = w / 400;
  const fs = style.size * scale;
  const lh = fs * 1.3;
  ctx.font = `bold ${fs}px ${style.font}`;
  ctx.textAlign = "center";
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${(style.spacing || 0) * scale}px`;
  const baseY = h * style.y - (lines.length * lh) / 2 + fs;

  lines.forEach((line, i) => {
    const ly = baseY + i * lh;
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

function compress(file: File, max = 1024): Promise<string | null> {
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
      resolve(c.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

function frameFromUrl(url: string): Promise<{ dataUrl: string; video: HTMLVideoElement; duration: number }> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.src = url; v.muted = true; v.playsInline = true; v.preload = "auto";
    v.onerror = () => reject(new Error("Não consegui ler o vídeo."));
    v.onloadeddata = () => {
      const onSeek = () => {
        const c = document.createElement("canvas");
        let w = v.videoWidth, h = v.videoHeight;
        if (w > 1024 || h > 1024) {
          if (w > h) { h = Math.round((h * 1024) / w); w = 1024; } else { w = Math.round((w * 1024) / h); h = 1024; }
        }
        c.width = w; c.height = h;
        c.getContext("2d")?.drawImage(v, 0, 0, w, h);
        v.removeEventListener("seeked", onSeek);
        resolve({ dataUrl: c.toDataURL("image/jpeg", 0.8), video: v, duration: v.duration || 0 });
      };
      v.addEventListener("seeked", onSeek);
      v.currentTime = Math.min(1, (v.duration || 5) * 0.15);
    };
  });
}

const CopyBig = ({ text, label }: { text: string; label: string }) => {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 2000); }}
      style={{
        width: "100%", padding: "10px 0", cursor: "pointer",
        background: ok ? `${C.green}12` : C.goldBg,
        border: `1px solid ${ok ? `${C.green}44` : C.border}`,
        ...fT, fontSize: 13, color: ok ? C.green : C.gold,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
      }}
    >
      {ok ? <Check size={14} /> : <Copy size={14} />} {ok ? "COPIADO" : label}
    </button>
  );
};

export default function SocialOnQuickPanel() {
  const [phase, setPhase] = useState<"upload" | "loading" | "done">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mediaEl, setMediaEl] = useState<HTMLImageElement | HTMLVideoElement | null>(null);
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadMsg, setLoadMsg] = useState("");
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [exporting, setExporting] = useState(false);

  const canRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const animRef = useRef<number | null>(null);

  const v = versions?.[current];

  const drawAll = useCallback(() => {
    versions?.forEach((ver, i) => {
      drawResult(canRefs.current[i], mediaEl, ver.texto_video || "", STYLES[i % STYLES.length]);
    });
  }, [versions, mediaEl]);

  useEffect(() => { drawAll(); }, [drawAll]);

  useEffect(() => {
    if (!isVideo || !playing || !versions) return;
    const loop = () => {
      drawResult(canRefs.current[current], mediaEl, versions[current]?.texto_video || "", STYLES[current % STYLES.length]);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing, isVideo, versions, current, mediaEl]);

  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  const generate = async (f: File, url: string, vid: boolean) => {
    setPhase("loading"); setError(null);
    const msgs = ["Analisando conteúdo...", "Criando 4 versões...", "Aplicando textos...", "Quase pronto..."];
    let i = 0; setLoadMsg(msgs[0]);
    const iv = window.setInterval(() => { i = Math.min(i + 1, msgs.length - 1); setLoadMsg(msgs[i]); }, 3000);
    try {
      let image: string | null = null;
      if (vid) {
        const d = await frameFromUrl(url);
        image = d.dataUrl;
        vidRef.current = d.video;
        setMediaEl(d.video);
        setDuration(d.duration);
      } else {
        image = await compress(f);
        if (!image) throw new Error("Erro ao processar a imagem.");
      }
      const { data: res, error: fnErr } = await supabase.functions.invoke("prism-analyze", {
        body: { mode: "social_versoes", image, from_video: vid },
      });
      if (fnErr) throw new Error(fnErr.message);
      if ((res as { error?: string })?.error) throw new Error((res as { error?: string }).error as string);
      const list = ((res as { result?: { versoes?: Version[] } })?.result?.versoes || []).filter(Boolean);
      if (!list.length) throw new Error("Não veio nenhuma versão. Tenta de novo.");
      setVersions(list);
      setCurrent(0);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
      setPhase("upload");
    } finally {
      window.clearInterval(iv);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setFile(f); setVersions(null); setCurrent(0); setError(null); setMediaEl(null); setPlaying(false);
    const url = URL.createObjectURL(f);
    setBlobUrl(url);
    const vid = f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(f.name);
    setIsVideo(vid);
    if (!vid) {
      const img = new window.Image();
      img.onload = () => { setMediaEl(img); void generate(f, url, false); };
      img.onerror = () => setError("Não consegui ler a imagem.");
      img.src = url;
    } else {
      void generate(f, url, true);
    }
    e.target.value = "";
  };

  const reset = () => {
    setFile(null); setVersions(null); setPhase("upload"); setMediaEl(null);
    setCurrent(0); setError(null); setPlaying(false); setDuration(0);
    vidRef.current = null;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
  };

  const savePNG = () => {
    const c = canRefs.current[current];
    if (!c || !versions) return;
    drawResult(c, mediaEl, versions[current]?.texto_video || "", STYLES[current % STYLES.length]);
    setTimeout(() => {
      const a = document.createElement("a");
      a.download = `socialon-${(versions[current]?.nome || "versao").replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`;
      a.href = c.toDataURL("image/png");
      a.click();
    }, 60);
  };

  const saveVideo = async () => {
    const vid = vidRef.current;
    const c = canRefs.current[current];
    if (!isVideo || !vid || !c || !versions || exporting) return;
    setExporting(true);
    const style = STYLES[current % STYLES.length];
    const txt = versions[current]?.texto_video || "";
    const mime = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm"]
      .find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) || "video/webm";
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: mime });
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob(chunks, { type: mime }));
      a.download = `socialon-${Date.now()}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      setExporting(false);
      setPlaying(false);
    };
    vid.currentTime = 0;
    rec.start();
    await vid.play();
    const loop = () => {
      drawResult(c, vid, txt, style);
      if (!vid.paused && !vid.ended) requestAnimationFrame(loop);
      else { rec.stop(); vid.pause(); }
    };
    requestAnimationFrame(loop);
  };

  const togglePlay = () => {
    const vid = vidRef.current;
    if (!vid) return;
    if (playing) { vid.pause(); setPlaying(false); } else { void vid.play(); setPlaying(true); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ ...fT, fontSize: 24, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} color={C.gold} /> SOCIAL ON · 1 TOQUE
          </div>
          <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 2 }}>
            Sobe a mídia e sai com 4 versões prontas pra postar
          </div>
        </div>
        {phase === "done" && (
          <button onClick={reset} style={{ padding: "8px 12px", background: "transparent", border: `1px solid ${C.border}`, ...fM, fontSize: 12, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <X size={12} /> NOVO
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: "none" }} />

      {phase === "upload" && (
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${C.border}`, padding: "44px 16px", textAlign: "center", cursor: "pointer" }}
          >
            <Camera size={28} color={C.gold} />
            <div style={{ ...fT, fontSize: 20, color: C.text, marginTop: 10 }}>Sobe e pronto</div>
            <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 4 }}>Foto ou vídeo · qualquer tamanho</div>
            <div style={{ ...fM, fontSize: 12, color: C.textMuted, marginTop: 2 }}>O sistema gera 4 versões prontas pra postar</div>
          </div>
          {error && (
            <div style={{ marginTop: 10, ...fM, fontSize: 12, color: C.red, border: `1px solid ${C.red}44`, padding: 8 }}>{error}</div>
          )}
          <div style={{ ...fM, fontSize: 11, color: C.textMuted, letterSpacing: "0.14em", textAlign: "center", marginTop: 14 }}>
            SOCIAL ON · NUTRION · @DIOGO.MELL0
          </div>
        </div>
      )}

      {phase === "loading" && (
        <div style={{ padding: "48px 16px", textAlign: "center" }}>
          <RefreshCw size={22} color={C.gold} className="animate-spin" style={{ margin: "0 auto" }} />
          <div style={{ ...fT, fontSize: 18, color: C.text, marginTop: 12 }}>{loadMsg}</div>
          <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 6 }}>
            Analisando {isVideo ? "o vídeo" : "a foto"} e criando 4 versões prontas pra postar...
          </div>
        </div>
      )}

      {phase === "done" && versions && v && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {versions.map((ver, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  flex: 1, padding: "7px 2px", cursor: "pointer",
                  background: current === i ? C.goldBg : "transparent",
                  border: `1px solid ${current === i ? `${C.gold}55` : C.border}`,
                  ...fM, fontSize: 10, color: current === i ? C.gold : C.textMid, letterSpacing: "0.04em",
                }}
              >
                {ver.nome || `V${i + 1}`}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            {versions.map((_, i) => (
              <canvas
                key={i}
                ref={(el) => { canRefs.current[i] = el; }}
                width={720}
                height={1280}
                style={{ width: "100%", maxWidth: 320, display: current === i ? "block" : "none", margin: "0 auto" }}
              />
            ))}
            {current > 0 && (
              <button onClick={() => setCurrent(current - 1)} style={{ position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", background: `${C.bg}AA`, border: `1px solid ${C.border}`, padding: 6, cursor: "pointer" }}>
                <ChevronLeft size={14} color={C.gold} />
              </button>
            )}
            {current < versions.length - 1 && (
              <button onClick={() => setCurrent(current + 1)} style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: `${C.bg}AA`, border: `1px solid ${C.border}`, padding: 6, cursor: "pointer" }}>
                <ChevronRight size={14} color={C.gold} />
              </button>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 8 }}>
              {versions.map((_, i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: 99, background: current === i ? C.gold : C.textMuted }} />
              ))}
            </div>
          </div>

          {isVideo && vidRef.current && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <button onClick={togglePlay} style={{ background: C.goldBg, border: `1px solid ${C.border}`, padding: 6, cursor: "pointer" }}>
                {playing ? <Pause size={12} color={C.gold} /> : <Play size={12} color={C.gold} />}
              </button>
              <span style={{ ...fM, fontSize: 11, color: C.textMid }}>{fmt(duration)}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={savePNG} style={{ flex: 1, padding: "12px 0", background: C.gold, border: "none", ...fT, fontSize: 14, color: C.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Download size={14} /> SALVAR FOTO
            </button>
            {isVideo && (
              <button onClick={saveVideo} disabled={exporting} style={{ flex: 1, padding: "12px 0", background: C.cyan, border: "none", ...fT, fontSize: 14, color: C.bg, cursor: exporting ? "default" : "pointer", opacity: exporting ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {exporting ? <RefreshCw size={14} className="animate-spin" /> : <Video size={14} />} SALVAR VÍDEO
              </button>
            )}
          </div>

          {v.legenda && (
            <div style={{ border: `1px solid ${C.border}`, padding: 10, display: "grid", gap: 8 }}>
              <div style={{ ...fM, fontSize: 12, color: C.text, whiteSpace: "pre-wrap" }}>{v.legenda}</div>
              <CopyBig text={v.legenda} label="COPIAR LEGENDA" />
            </div>
          )}

          {!!v.hashtags?.length && (
            <div style={{ border: `1px solid ${C.border}`, padding: 10, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {v.hashtags.map((h, i) => (
                  <span key={i} style={{ ...fM, fontSize: 11, color: C.cyan, border: `1px solid ${C.cyan}22`, padding: "2px 5px" }}>{h}</span>
                ))}
              </div>
              <CopyBig text={v.hashtags.join(" ")} label="COPIAR HASHTAGS" />
            </div>
          )}

          {v.self_comment && (
            <div style={{ border: `1px solid ${C.border}`, padding: 10, display: "grid", gap: 8 }}>
              <div style={{ ...fM, fontSize: 12, color: C.text, whiteSpace: "pre-wrap" }}>{v.self_comment}</div>
              <CopyBig text={v.self_comment} label="COPIAR SELF-COMMENT" />
            </div>
          )}

          {(v.musica || v.horario) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {v.musica && (
                <div style={{ flex: 1, minWidth: 160, border: `1px solid ${C.border}`, padding: 8 }}>
                  <div style={{ ...fM, fontSize: 10, color: C.textMuted, letterSpacing: "0.12em" }}>MÚSICA</div>
                  <div style={{ ...fM, fontSize: 12, color: C.text }}>{v.musica}</div>
                </div>
              )}
              {v.horario && (
                <div style={{ flex: 1, minWidth: 160, border: `1px solid ${C.border}`, padding: 8 }}>
                  <div style={{ ...fM, fontSize: 10, color: C.textMuted, letterSpacing: "0.12em" }}>HORÁRIO</div>
                  <div style={{ ...fM, fontSize: 12, color: C.text }}>{v.horario}</div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => { if (file && blobUrl) void generate(file, blobUrl, isVideo); }}
            style={{ width: "100%", padding: "10px 0", background: "transparent", border: `1px solid ${C.border}`, ...fT, fontSize: 13, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <RefreshCw size={13} /> NÃO GOSTEI · GERAR DE NOVO
          </button>

          <div style={{ ...fM, fontSize: 11, color: C.textMuted, letterSpacing: "0.14em", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Hash size={10} /> SOCIAL ON · NUTRION · @DIOGO.MELL0
          </div>
        </div>
      )}
    </div>
  );
}
