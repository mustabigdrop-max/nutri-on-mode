import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3, Brain, Check, ChevronLeft, ChevronRight, Copy, Download, Edit3, Hash,
  Layers, Lightbulb, Pause, Play, RefreshCw, Share2, Smartphone, Target, TrendingUp,
  Upload, Video, X, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const C = {
  bg: "#020205", border: "#B8922A22", gold: "#B8922A", goldBg: "#B8922A08",
  cyan: "#00D4FF", green: "#00C896", red: "#ff4444", purple: "#7C3AED",
  orange: "#E8A020", text: "#F5F0E8", textMid: "#888888", textMuted: "#2A2A2A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

type Style = {
  name: string; font: string; size: number; color: string; stroke: number; y: number;
  upper: boolean; shadow?: boolean; spacing: number; glow?: string; glowSize?: number;
  bg?: string; pad?: number; bars?: boolean;
  fisheyeText?: boolean; skew?: number; black?: boolean; align?: CanvasTextAlign; x?: number;
};

const STYLES: Style[] = [
  { name: "IMPACTO", font: "Impact, sans-serif", size: 44, color: "#FFFFFF", stroke: 3, y: 0.13, upper: true, shadow: true, spacing: 2 },
  { name: "GOLD", font: "'Rajdhani', sans-serif", size: 38, color: "#B8922A", stroke: 2, y: 0.5, upper: true, shadow: true, spacing: 4 },
  { name: "NEON", font: "Impact, sans-serif", size: 42, color: "#00D4FF", stroke: 0, y: 0.5, upper: true, spacing: 3, glow: "#00D4FF", glowSize: 25 },
  { name: "LEGENDA", font: "'Inter', sans-serif", size: 24, color: "#FFFFFF", stroke: 0, y: 0.83, upper: false, shadow: true, spacing: 1, bg: "rgba(0,0,0,0.65)", pad: 10 },
  { name: "CINEMA", font: "'Rajdhani', sans-serif", size: 30, color: "#FFFFFF", stroke: 0, y: 0.5, upper: true, shadow: true, spacing: 6, bars: true },
  { name: "EMOCIONAL", font: "'Caveat', cursive", size: 38, color: "#FFFFFF", stroke: 0, y: 0.18, upper: false, shadow: true, spacing: 0 },
  { name: "FISHEYE", font: "Impact, sans-serif", size: 52, color: "#FFFFFF", stroke: 4, y: 0.45, upper: true, shadow: true, spacing: 1, fisheyeText: true },
  { name: "STREET", font: "Impact, sans-serif", size: 48, color: "#FFFFFF", stroke: 4, y: 0.5, upper: true, shadow: true, spacing: 4, skew: -5 },
  { name: "TELA PRETA", font: "'Rajdhani', sans-serif", size: 34, color: "#FFFFFF", stroke: 0, y: 0.45, upper: true, spacing: 3, black: true },
  { name: "MINIMAL", font: "'Space Mono', monospace", size: 16, color: "#FFFFFF", stroke: 0, y: 0.9, upper: false, shadow: true, spacing: 1, align: "left", x: 0.06 },
];

const QUICK_TEXTS = [
  "O PROCESSO É\nO PRODUTO",
  "DISCIPLINA\nNÃO É TALENTO",
  "TRANSFORMAÇÃO\nÉ SISTEMA",
  "RESULTADO\nÉ CONSEQUÊNCIA",
  "MCE",
  "POV:",
  "O SHAPE É\nCONSEQUÊNCIA",
];

type Version = {
  formato?: string; texto_video?: string; estilo?: number; legenda?: string;
  hashtags?: string[]; self_comment?: string; musica?: string; horario?: string; funil?: string;
};

type StrategistResult = {
  analise?: string; estrategia?: string; versoes?: Version[];
  proximos_conteudos?: string[]; dica_estrategica?: string;
};

const FUNIL: Record<string, string> = { TOFU: C.cyan, MOFU: C.orange, BOFU: C.green };

function drawResult(
  canvas: HTMLCanvasElement | null,
  media: HTMLImageElement | HTMLVideoElement | null,
  textStr: string,
  style: Style,
  szMod = 0,
  yMod = 0,
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  if (media && !style.black) {
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
  const fs = Math.max(8, style.size + szMod) * scale;
  const lh = fs * 1.3;
  const yPos = Math.max(0.05, Math.min(0.95, style.y + yMod));

  // FISHEYE: curva o texto letra por letra (mídia nunca distorce)
  if (style.fisheyeText) {
    ctx.textAlign = "left";
    lines.forEach((line, li) => {
      const lineY = h * yPos + (li - (lines.length - 1) / 2) * fs * 1.3;
      const chars = [...line];
      ctx.font = `bold ${fs}px ${style.font}`;
      let cx = (w - ctx.measureText(line).width) / 2;
      chars.forEach((ch, ci) => {
        const progress = chars.length > 1 ? ci / (chars.length - 1) : 0.5;
        const dist = Math.abs(progress - 0.5) * 2;
        const curve = 1 - dist * dist;
        const charScale = 0.7 + curve * 0.5;
        const charSz = fs * charScale;
        const charY = lineY + curve * fs * 0.25;
        ctx.font = `bold ${charSz}px ${style.font}`;
        const charW = ctx.measureText(ch).width;
        ctx.save();
        if (style.stroke > 0) {
          ctx.strokeStyle = "#000";
          ctx.lineWidth = style.stroke * scale * charScale;
          ctx.lineJoin = "round";
          ctx.strokeText(ch, cx, charY);
        }
        if (style.shadow) {
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 5 * scale;
          ctx.shadowOffsetX = 1.5 * scale;
          ctx.shadowOffsetY = 1.5 * scale;
        }
        ctx.fillStyle = style.color;
        ctx.fillText(ch, cx, charY);
        ctx.restore();
        cx += charW;
      });
    });
    return;
  }

  ctx.save();
  if (style.skew) {
    ctx.translate(w / 2, h * yPos);
    ctx.transform(1, 0, Math.tan((style.skew * Math.PI) / 180), 1, 0, 0);
    ctx.translate(-w / 2, -h * yPos);
  }
  ctx.font = `bold ${fs}px ${style.font}`;
  ctx.textAlign = style.align || "center";
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${(style.spacing || 0) * scale}px`;
  const baseY = h * yPos - (lines.length * lh) / 2 + fs;
  const tx = style.align === "left" ? w * (style.x ?? 0.06) : w / 2;

  lines.forEach((line, i) => {
    const ly = baseY + i * lh;
    if (style.bg) {
      const m = ctx.measureText(line);
      const p = (style.pad || 8) * scale;
      const bx = style.align === "left" ? tx - p : tx - m.width / 2 - p;
      ctx.fillStyle = style.bg;
      ctx.fillRect(bx, ly - fs + 2, m.width + p * 2, fs + p);
    }
    ctx.save();
    if (style.glow) {
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = (style.glowSize || 20) * scale;
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
      ctx.shadowBlur = 6 * scale;
      ctx.shadowOffsetX = 2 * scale;
      ctx.shadowOffsetY = 2 * scale;
    }
    ctx.fillStyle = style.color;
    ctx.fillText(line, tx, ly);
    ctx.restore();
  });
  ctx.restore();
}

/** Renderiza em HD (1080x1920) e salva nas fotos (Web Share) ou baixa. */
async function savePhone(
  media: HTMLImageElement | HTMLVideoElement | null,
  textStr: string,
  style: Style,
  szMod: number,
  yMod: number,
  shareOnly = false,
) {
  const hd = document.createElement("canvas");
  hd.width = 1080; hd.height = 1920;
  drawResult(hd, media, textStr, style, szMod, yMod);
  const blob = await new Promise<Blob | null>((r) => hd.toBlob((b) => r(b), "image/png"));
  if (!blob) return false;
  const filename = `socialon-${Date.now()}.png`;
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "SOCIAL ON" });
      return true;
    } catch { if (shareOnly) return false; }
  }
  if (shareOnly) return false;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return true;
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

export default function SocialOnStrategistPanel({ ctx }: { ctx?: Record<string, any> } = {}) {
  const [phase, setPhase] = useState<"upload" | "edit">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mediaEl, setMediaEl] = useState<HTMLImageElement | HTMLVideoElement | null>(null);
  const [data, setData] = useState<StrategistResult | null>(null);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [showStrategy, setShowStrategy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edição sempre disponível
  const [text, setText] = useState("");
  const [styleIdx, setStyleIdx] = useState(0);
  const [szMod, setSzMod] = useState(0);
  const [yMod, setYMod] = useState(0);
  const [showTools, setShowTools] = useState(false);

  const canRef = useRef<HTMLCanvasElement | null>(null);
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const animRef = useRef<number | null>(null);

  const versions = data?.versoes || [];
  const v = versions[current];
  const style = STYLES[styleIdx] || STYLES[0];

  const redraw = useCallback(() => {
    drawResult(canRef.current, mediaEl, text, style, szMod, yMod);
  }, [mediaEl, text, style, szMod, yMod]);

  useEffect(() => { redraw(); }, [redraw]);

  // Preview em loop enquanto o vídeo roda
  useEffect(() => {
    if (!isVideo || !playing) return;
    const loop = () => {
      drawResult(canRef.current, vidRef.current, text, style, szMod, yMod);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing, isVideo, text, style, szMod, yMod]);

  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  // Ao trocar de versão gerada, aplica texto + estilo sugeridos
  useEffect(() => {
    const ver = versions[current];
    if (!ver) return;
    setText(ver.texto_video || "");
    setStyleIdx(typeof ver.estilo === "number" && ver.estilo >= 0 && ver.estilo < STYLES.length ? ver.estilo : current % STYLES.length);
    setSzMod(0); setYMod(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, current]);

  const generate = async () => {
    if (!file || !blobUrl || loading) return;
    setLoading(true); setError(null);
    const msgs = ["Estrategista analisando...", "Lendo o conteúdo...", "Montando estratégia...", "Criando 4 versões..."];
    let i = 0; setLoadMsg(msgs[0]);
    const iv = window.setInterval(() => { i = Math.min(i + 1, msgs.length - 1); setLoadMsg(msgs[i]); }, 2500);
    try {
      let image: string | null = null;
      if (isVideo) {
        const d = await frameFromUrl(blobUrl);
        image = d.dataUrl;
      } else {
        image = await compress(file);
        if (!image) throw new Error("Erro ao processar a imagem.");
      }
      const { data: res, error: fnErr } = await supabase.functions.invoke("prism-analyze", {
        body: {
          mode: "social_estrategista",
          image,
          from_video: isVideo,
          handle: ctx?.handle,
          niches: ctx?.niches,
          products: ctx?.products,
          differentials: ctx?.differentials,
        },
      });
      if (fnErr) throw new Error(fnErr.message);
      if ((res as { error?: string })?.error) throw new Error((res as { error?: string }).error as string);
      const result = (res as { result?: StrategistResult })?.result;
      if (!result?.versoes?.length) throw new Error("Não veio nenhuma versão. Tenta de novo.");
      setData(result);
      setCurrent(0);
      setShowStrategy(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      window.clearInterval(iv);
      setLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setFile(f); setData(null); setCurrent(0); setError(null); setMediaEl(null); setPlaying(false);
    setText(""); setStyleIdx(0); setSzMod(0); setYMod(0);
    const url = URL.createObjectURL(f);
    setBlobUrl(url);
    const vid = f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|m4v|3gp)$/i.test(f.name);
    setIsVideo(vid);
    if (!vid) {
      const img = new window.Image();
      img.onload = () => { setMediaEl(img); setPhase("edit"); };
      img.onerror = () => setError("Não consegui ler a imagem.");
      img.src = url;
    } else {
      frameFromUrl(url)
        .then((d) => {
          vidRef.current = d.video;
          setDuration(d.duration);
          setMediaEl(d.video);
          setPhase("edit");
        })
        .catch(() => setError("Não consegui ler o vídeo."));
    }
    e.target.value = "";
  };

  const reset = () => {
    setFile(null); setData(null); setPhase("upload"); setMediaEl(null);
    setCurrent(0); setError(null); setPlaying(false); setDuration(0);
    setText(""); setStyleIdx(0); setSzMod(0); setYMod(0); setShowTools(false); setShowStrategy(false);
    vidRef.current = null;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
  };

  const save = async (shareOnly = false) => {
    if (saving) return;
    setSaving(true);
    await savePhone(mediaEl, text, style, szMod, yMod, shareOnly);
    setSaving(false);
  };

  const saveVideo = async () => {
    const vid = vidRef.current;
    const c = canRef.current;
    if (!isVideo || !vid || !c || exporting) return;
    setExporting(true);
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
      drawResult(c, vid, text, style, szMod, yMod);
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
            <Brain size={18} color={C.purple} /> SOCIAL ON · ESTRATEGISTA
          </div>
          <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 2 }}>
            Sobe a mídia, edita na hora ou deixa o estrategista montar 4 versões
          </div>
        </div>
        {phase !== "upload" && (
          <button onClick={reset} style={{ padding: "8px 12px", background: "transparent", border: `1px solid ${C.border}`, ...fM, fontSize: 12, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <X size={12} /> NOVO
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: "none" }} />

      {phase === "upload" && (
        <div>
          <div style={{ border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, background: C.goldBg, padding: "16px 14px", marginBottom: 10 }}>
            <div style={{ ...fM, fontSize: 11, color: C.gold, letterSpacing: "0.18em" }}>CONTENT INTELLIGENCE</div>
            <div style={{ ...fT, fontSize: 28, color: C.text, marginTop: 4 }}>Seu conteúdo. Pronto.</div>
            <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 6, lineHeight: 1.6 }}>
              Sobe e o estrategista faz o resto. Ou edita você mesmo.
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{ width: "100%", border: `2px dashed ${C.gold}33`, background: "transparent", padding: "40px 16px", cursor: "pointer", marginBottom: 14 }}
          >
            <Upload size={22} color={C.gold} />
            <div style={{ ...fT, fontSize: 20, color: C.text, marginTop: 8 }}>Sobe foto ou vídeo</div>
            <div style={{ ...fM, fontSize: 11, color: C.textMid, marginTop: 4 }}>
              Sem limite · Salva nas fotos do celular
            </div>
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 14 }}>
            {[
              { icon: Layers, label: "ESTILOS", value: String(STYLES.length), color: C.gold },
              { icon: Brain, label: "PRISM", value: "ON", color: C.purple },
              { icon: Zap, label: "FORMATOS", value: "4", color: C.cyan },
              { icon: Smartphone, label: "SALVAR", value: "1 TAP", color: C.green },
            ].map((s) => (
              <div key={s.label} style={{ border: `1px solid ${C.border}`, padding: "10px 4px", textAlign: "center" }}>
                <s.icon size={14} color={s.color} />
                <div style={{ ...fT, fontSize: 16, color: C.text, marginTop: 4 }}>{s.value}</div>
                <div style={{ ...fM, fontSize: 10, color: C.textMid, letterSpacing: "0.12em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ ...fM, fontSize: 11, color: C.textMuted, letterSpacing: "0.18em", margin: "0 0 6px" }}>ESTILOS DISPONÍVEIS</div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
            {STYLES.map((s) => (
              <div key={s.name} style={{ minWidth: 74, border: `1px solid ${C.border}`, padding: "10px 6px", textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontFamily: s.font, fontSize: 20, color: s.color, textShadow: s.glow ? `0 0 10px ${s.glow}` : undefined }}>Aa</div>
                <div style={{ ...fM, fontSize: 9, color: C.textMid, marginTop: 4 }}>{s.name}</div>
              </div>
            ))}
          </div>

          <div style={{ ...fM, fontSize: 11, color: C.textMuted, letterSpacing: "0.18em", margin: "14px 0 6px" }}>PRA QUEM</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {["Personal Trainer", "Nutricionista", "Corredor", "CrossFit", "Bodybuilder", "Influencer Fitness", "Coach", "Atleta", "Fisioterapeuta", "Dono de Academia"].map((t) => (
              <span key={t} style={{ ...fM, fontSize: 11, color: C.textMid, border: `1px solid ${C.border}`, padding: "3px 8px" }}>{t}</span>
            ))}
          </div>

          {error && (
            <div style={{ marginTop: 10, ...fM, fontSize: 12, color: C.red, border: `1px solid ${C.red}44`, padding: 8 }}>{error}</div>
          )}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <div style={{ ...fT, fontSize: 16, color: C.gold }}>Transformação é sistema.</div>
            <div style={{ ...fM, fontSize: 11, color: C.textMuted, letterSpacing: "0.14em", marginTop: 2 }}>
              SOCIAL ON · NUTRION
            </div>
          </div>
        </div>
      )}

      {phase === "edit" && mediaEl && (
        <div style={{ display: "grid", gap: 8 }}>
          <canvas
            ref={canRef}
            width={720}
            height={1280}
            style={{ width: "100%", maxWidth: 320, margin: "0 auto", display: "block" }}
          />

          {isVideo && vidRef.current && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <button onClick={togglePlay} style={{ background: C.goldBg, border: `1px solid ${C.border}`, padding: 6, cursor: "pointer" }}>
                {playing ? <Pause size={12} color={C.gold} /> : <Play size={12} color={C.gold} />}
              </button>
              <span style={{ ...fM, fontSize: 11, color: C.textMid }}>{fmt(duration)}</span>
            </div>
          )}

          {!!versions.length && (
            <div style={{ display: "flex", gap: 4 }}>
              {versions.map((ver, i) => {
                const col = FUNIL[ver.funil || ""] || C.gold;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    style={{
                      flex: 1, padding: "6px 2px", cursor: "pointer",
                      background: current === i ? `${col}12` : "transparent",
                      border: `1px solid ${current === i ? `${col}66` : C.border}`,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                    }}
                  >
                    <span style={{ ...fM, fontSize: 10, color: current === i ? col : C.textMid }}>{ver.formato || `V${i + 1}`}</span>
                    <span style={{ ...fM, fontSize: 9, color: C.textMuted }}>{ver.funil || ""}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {STYLES.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setStyleIdx(i)}
                style={{
                  flex: "1 1 calc(20% - 4px)", minWidth: 62, padding: "7px 2px", cursor: "pointer",
                  background: styleIdx === i ? C.goldBg : "transparent",
                  border: `1px solid ${styleIdx === i ? `${C.gold}66` : C.border}`,
                  ...fM, fontSize: 10, color: styleIdx === i ? C.gold : C.textMid,
                }}
              >
                {s.name}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Digite ou gere com o estrategista..."
            style={{ width: "100%", padding: "8px 10px", ...fT, fontSize: 15, background: `${C.text}08`, border: `1px solid ${C.border}`, color: C.text, resize: "none", boxSizing: "border-box" }}
          />

          <button
            onClick={() => setShowTools(!showTools)}
            style={{ width: "100%", padding: "6px 0", background: "transparent", border: `1px solid ${C.border}`, ...fM, fontSize: 11, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Edit3 size={11} /> {showTools ? "FECHAR FERRAMENTAS" : "ABRIR FERRAMENTAS"}
          </button>

          {showTools && (
            <div style={{ border: `1px solid ${C.border}`, padding: 10, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ ...fM, fontSize: 10, color: C.textMid, letterSpacing: "0.12em" }}>TAMANHO</span>
                    <span style={{ ...fM, fontSize: 11, color: C.gold }}>{style.size + szMod}</span>
                  </div>
                  <input type="range" min={-20} max={30} value={szMod} onChange={(e) => setSzMod(+e.target.value)} style={{ width: "100%", accentColor: C.gold }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ ...fM, fontSize: 10, color: C.textMid, letterSpacing: "0.12em" }}>POSIÇÃO</span>
                    <span style={{ ...fM, fontSize: 11, color: C.cyan }}>{Math.round((style.y + yMod) * 100)}%</span>
                  </div>
                  <input type="range" min={-40} max={40} value={Math.round(yMod * 100)} onChange={(e) => setYMod(+e.target.value / 100)} style={{ width: "100%", accentColor: C.cyan }} />
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {QUICK_TEXTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setText(t)}
                    style={{ padding: "4px 7px", ...fM, fontSize: 10, color: C.textMid, background: "transparent", border: `1px solid ${C.border}`, cursor: "pointer" }}
                  >
                    {t.replace("\n", " ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => void save(false)}
              disabled={saving}
              style={{ flex: 1, padding: "14px 0", background: C.gold, border: "none", ...fT, fontSize: 15, color: C.bg, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />} SALVAR
            </button>
            <button
              onClick={() => void generate()}
              disabled={loading}
              style={{ flex: 1, padding: "14px 0", background: C.purple, border: "none", ...fT, fontSize: 15, color: "#fff", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Brain size={15} />} {loading ? "GERANDO" : data ? "GERAR DE NOVO" : "GERAR"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => void save(true)}
              style={{ flex: 1, padding: "10px 0", background: "transparent", border: `1px solid ${C.border}`, ...fT, fontSize: 13, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Share2 size={13} /> COMPARTILHAR
            </button>
            {isVideo && (
              <button
                onClick={() => void saveVideo()}
                disabled={exporting}
                style={{ flex: 1, padding: "10px 0", background: "transparent", border: `1px solid ${C.cyan}44`, ...fT, fontSize: 13, color: C.cyan, cursor: exporting ? "default" : "pointer", opacity: exporting ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                {exporting ? <RefreshCw size={13} className="animate-spin" /> : <Video size={13} />} SALVAR VÍDEO
              </button>
            )}
          </div>

          {loading && (
            <div style={{ ...fM, fontSize: 12, color: C.purple, textAlign: "center" }}>{loadMsg}</div>
          )}
          {error && (
            <div style={{ ...fM, fontSize: 12, color: C.red, border: `1px solid ${C.red}44`, padding: 8 }}>{error}</div>
          )}

          {data && (
            <>
              <div style={{ border: `1px solid ${C.purple}33` }}>
                <button
                  onClick={() => setShowStrategy(!showStrategy)}
                  style={{ width: "100%", padding: "10px 12px", background: `${C.purple}0C`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Brain size={14} color={C.purple} />
                  <span style={{ ...fT, fontSize: 14, color: C.text, flex: 1, textAlign: "left" }}>VISÃO DO ESTRATEGISTA</span>
                  {showStrategy ? <ChevronLeft size={14} color={C.purple} style={{ transform: "rotate(90deg)" }} /> : <ChevronRight size={14} color={C.purple} style={{ transform: "rotate(90deg)" }} />}
                </button>
                {showStrategy && (
                  <div style={{ padding: 12, display: "grid", gap: 12 }}>
                    {data.analise && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <BarChart3 size={13} color={C.cyan} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ ...fM, fontSize: 12, color: C.text }}>{data.analise}</div>
                      </div>
                    )}
                    {data.estrategia && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <Target size={13} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ ...fM, fontSize: 12, color: C.text }}>{data.estrategia}</div>
                      </div>
                    )}
                    {!!data.proximos_conteudos?.length && (
                      <div style={{ border: `1px solid ${C.border}`, padding: 10, display: "grid", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <TrendingUp size={12} color={C.green} />
                          <span style={{ ...fM, fontSize: 10, color: C.green, letterSpacing: "0.14em" }}>GRAVAR DEPOIS</span>
                        </div>
                        {data.proximos_conteudos.map((idea, i) => (
                          <div key={i} style={{ display: "flex", gap: 6, ...fM, fontSize: 12, color: C.textMid }}>
                            <span style={{ color: C.green }}>{i + 1}</span>
                            <span style={{ color: C.text }}>{idea}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {data.dica_estrategica && (
                      <div style={{ border: `1px solid ${C.orange}33`, padding: 10, display: "grid", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Lightbulb size={12} color={C.orange} />
                          <span style={{ ...fM, fontSize: 10, color: C.orange, letterSpacing: "0.14em" }}>DICA</span>
                        </div>
                        <div style={{ ...fM, fontSize: 12, color: C.text }}>{data.dica_estrategica}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {v?.legenda && (
                <div style={{ border: `1px solid ${C.border}`, padding: 10, display: "grid", gap: 8 }}>
                  <div style={{ ...fM, fontSize: 12, color: C.text, whiteSpace: "pre-wrap" }}>{v.legenda}</div>
                  <CopyBig text={v.legenda} label="COPIAR LEGENDA" />
                </div>
              )}

              {!!v?.hashtags?.length && (
                <div style={{ border: `1px solid ${C.border}`, padding: 10, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {v.hashtags.map((h, i) => (
                      <span key={i} style={{ ...fM, fontSize: 11, color: C.cyan, border: `1px solid ${C.cyan}22`, padding: "2px 5px" }}>{h}</span>
                    ))}
                  </div>
                  <CopyBig text={v.hashtags.join(" ")} label="COPIAR HASHTAGS" />
                </div>
              )}

              {v?.self_comment && (
                <div style={{ border: `1px solid ${C.border}`, padding: 10, display: "grid", gap: 8 }}>
                  <div style={{ ...fM, fontSize: 12, color: C.text, whiteSpace: "pre-wrap" }}>{v.self_comment}</div>
                  <CopyBig text={v.self_comment} label="COPIAR SELF-COMMENT" />
                </div>
              )}

              {(v?.musica || v?.horario) && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {v?.musica && (
                    <div style={{ flex: 1, minWidth: 160, border: `1px solid ${C.border}`, padding: 8 }}>
                      <div style={{ ...fM, fontSize: 10, color: C.textMuted, letterSpacing: "0.12em" }}>MÚSICA</div>
                      <div style={{ ...fM, fontSize: 12, color: C.text }}>{v.musica}</div>
                    </div>
                  )}
                  {v?.horario && (
                    <div style={{ flex: 1, minWidth: 160, border: `1px solid ${C.border}`, padding: 8 }}>
                      <div style={{ ...fM, fontSize: 10, color: C.textMuted, letterSpacing: "0.12em" }}>HORÁRIO</div>
                      <div style={{ ...fM, fontSize: 12, color: C.text }}>{v.horario}</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div style={{ ...fM, fontSize: 11, color: C.textMuted, letterSpacing: "0.14em", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Hash size={10} /> SOCIAL ON · NUTRION
          </div>
        </div>
      )}
    </div>
  );
}
