import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload, Play, Pause, X, ChevronDown, Download, Plus, Trash2, Eye,
  AlignCenter, AlignLeft, AlignRight, Video, Loader2,
} from "lucide-react";
import { toast } from "sonner";

type TextStyle = {
  fontFamily: string;
  fontSize: number;
  color: string;
  stroke: string;
  strokeWidth: number;
  align: CanvasTextAlign;
  y: number;
  x?: number;
  shadow: boolean;
  uppercase: boolean;
  letterSpacing: number;
  bg?: string;
  bgPad?: number;
  glow?: string;
  glowSize?: number;
  fullBlack?: boolean;
  cineBars?: boolean;
  skew?: number;
};

type Layer = { id: number; text: string; style: TextStyle; visible: boolean; preset: string };

const PRESETS: { id: string; name: string; preview: string; style: TextStyle }[] = [
  { id: "pov_bold", name: "POV Bold", preview: "POV: texto aqui", style: { fontFamily: "Impact, sans-serif", fontSize: 42, color: "#FFFFFF", stroke: "#000000", strokeWidth: 3, align: "center", y: 0.15, shadow: true, uppercase: true, letterSpacing: 2 } },
  { id: "pov_minimal", name: "POV Clean", preview: "POV: texto limpo", style: { fontFamily: "'Inter', sans-serif", fontSize: 28, color: "#FFFFFF", stroke: "none", strokeWidth: 0, align: "center", y: 0.12, shadow: true, uppercase: false, bg: "rgba(0,0,0,0.5)", bgPad: 12, letterSpacing: 1 } },
  { id: "subtitle", name: "Legenda", preview: "Texto de legenda", style: { fontFamily: "'Inter', sans-serif", fontSize: 26, color: "#FFFFFF", stroke: "#000000", strokeWidth: 2, align: "center", y: 0.82, shadow: true, uppercase: false, bg: "rgba(0,0,0,0.6)", bgPad: 10, letterSpacing: 0 } },
  { id: "tela_preta", name: "Tela Preta", preview: "VERDADE QUE NINGUÉM FALA", style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 36, color: "#FFFFFF", stroke: "none", strokeWidth: 0, align: "center", y: 0.45, shadow: false, uppercase: true, letterSpacing: 3, fullBlack: true } },
  { id: "fisheye_glow", name: "Fisheye Glow", preview: "TEXTO COM GLOW", style: { fontFamily: "Impact, sans-serif", fontSize: 48, color: "#00D4FF", stroke: "#000000", strokeWidth: 3, align: "center", y: 0.5, shadow: true, uppercase: true, glow: "#00D4FF", glowSize: 20, letterSpacing: 4 } },
  { id: "gold_mce", name: "MCE Gold", preview: "TRANSFORMAÇÃO É SISTEMA", style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 34, color: "#B8922A", stroke: "#000000", strokeWidth: 2, align: "center", y: 0.5, shadow: true, uppercase: true, letterSpacing: 3 } },
  { id: "minimal_bottom", name: "Minimal Bottom", preview: "texto minimalista", style: { fontFamily: "'Space Mono', monospace", fontSize: 18, color: "#FFFFFF", stroke: "none", strokeWidth: 0, align: "left", y: 0.88, x: 0.05, shadow: false, uppercase: false, letterSpacing: 1 } },
  { id: "cinematic", name: "Cinematic", preview: "TEXTO CINEMA", style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 32, color: "#FFFFFF", stroke: "none", strokeWidth: 0, align: "center", y: 0.5, shadow: true, uppercase: true, letterSpacing: 6, cineBars: true } },
  { id: "handwritten", name: "Escrito à Mão", preview: "texto natural", style: { fontFamily: "'Caveat', cursive", fontSize: 38, color: "#FFFFFF", stroke: "none", strokeWidth: 0, align: "center", y: 0.2, shadow: true, uppercase: false, letterSpacing: 0 } },
  { id: "neon", name: "Neon", preview: "NEON EFFECT", style: { fontFamily: "Impact, sans-serif", fontSize: 40, color: "#ff44ff", stroke: "none", strokeWidth: 0, align: "center", y: 0.5, shadow: false, uppercase: true, glow: "#ff44ff", glowSize: 30, letterSpacing: 3 } },
  { id: "street", name: "Street / Urban", preview: "STREET MODE", style: { fontFamily: "Impact, sans-serif", fontSize: 50, color: "#FFFFFF", stroke: "#000000", strokeWidth: 4, align: "center", y: 0.5, shadow: true, uppercase: true, letterSpacing: 5, skew: -5 } },
];

const COLORS = ["#FFFFFF", "#000000", "#B8922A", "#00D4FF", "#00C896", "#ff4444", "#7C3AED", "#E8A020", "#EC4899", "#ff44ff"];

const QUICK_TEXTS = [
  "POV: eu acordei 5h e ninguém entende",
  "DISCIPLINA É SISTEMA",
  "O shape é consequência",
  "Transformação é sistema.",
  "O comportamento vem\nantes do alimento.",
  "MCE — MINDSET\nCOMPORTAMENTO\nEXECUÇÃO",
  "16 ANOS DE PROCESSO",
];

const RATIOS: Record<string, { w: number; h: number }> = {
  "9:16": { w: 360, h: 640 },
  "1:1": { w: 480, h: 480 },
  "4:5": { w: 432, h: 540 },
  "16:9": { w: 640, h: 360 },
};

function renderText(ctx: CanvasRenderingContext2D, w: number, h: number, layers: Layer[]) {
  layers.forEach((layer) => {
    if (!layer.text || !layer.visible) return;
    const s = layer.style;
    const fontSize = s.fontSize * (w / 400);
    ctx.save();

    if (s.fullBlack) { ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, w, h); }
    if (s.cineBars) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h * 0.12);
      ctx.fillRect(0, h * 0.88, w, h * 0.12);
    }
    if (s.skew) {
      ctx.translate(w / 2, h * (s.y ?? 0.5));
      ctx.transform(1, 0, Math.tan((s.skew * Math.PI) / 180), 1, 0, 0);
      ctx.translate(-w / 2, -h * (s.y ?? 0.5));
    }

    const txt = s.uppercase ? layer.text.toUpperCase() : layer.text;
    const txtLines = txt.split("\n");

    ctx.font = `${s.fontSize >= 30 ? "bold " : ""}${fontSize}px ${s.fontFamily}`;
    ctx.textAlign = s.align || "center";
    (ctx as any).letterSpacing = `${s.letterSpacing || 0}px`;

    const lineH = fontSize * 1.3;
    const totalH = txtLines.length * lineH;
    const baseY = h * (s.y ?? 0.5) - totalH / 2 + fontSize;
    const baseX = s.align === "left" ? w * (s.x ?? 0.05) : s.align === "right" ? w * 0.95 : w / 2;

    txtLines.forEach((line, i) => {
      const ly = baseY + i * lineH;

      if (s.bg) {
        const metrics = ctx.measureText(line);
        const pad = s.bgPad || 8;
        const bx = s.align === "center" ? w / 2 - metrics.width / 2 - pad : s.align === "right" ? baseX - metrics.width - pad : baseX - pad;
        ctx.fillStyle = s.bg;
        ctx.fillRect(bx, ly - fontSize + 2, metrics.width + pad * 2, fontSize + pad);
      }

      if (s.glow) {
        ctx.shadowColor = s.glow;
        ctx.shadowBlur = s.glowSize || 15;
        ctx.fillStyle = s.color;
        ctx.fillText(line, baseX, ly);
        ctx.fillText(line, baseX, ly);
        ctx.shadowBlur = 0;
      }

      if (s.stroke && s.stroke !== "none" && s.strokeWidth > 0) {
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = s.strokeWidth * (w / 400);
        ctx.lineJoin = "round";
        ctx.strokeText(line, baseX, ly);
      }

      if (s.shadow && !s.glow) {
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      ctx.fillStyle = s.color;
      ctx.fillText(line, baseX, ly);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });

    ctx.restore();
  });
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const VideoTextEditorPanel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"video" | "image" | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [ready, setReady] = useState(false);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 1, text: "", style: { ...PRESETS[0].style }, visible: true, preset: PRESETS[0].id },
  ]);
  const [activeLayer, setActiveLayer] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [ratio, setRatio] = useState("9:16");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const animRef = useRef<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const size = RATIOS[ratio];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = size;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const media = fileType === "video" ? videoRef.current : imgRef.current;
    if (media && ready) {
      const mw = fileType === "video" ? (media as HTMLVideoElement).videoWidth : (media as HTMLImageElement).width;
      const mh = fileType === "video" ? (media as HTMLVideoElement).videoHeight : (media as HTMLImageElement).height;
      if (mw && mh) {
        const mr = mw / mh;
        const cr = w / h;
        let dw: number, dh: number, dx: number, dy: number;
        if (mr > cr) { dh = h; dw = h * mr; dx = (w - dw) / 2; dy = 0; }
        else { dw = w; dh = w / mr; dx = 0; dy = (h - dh) / 2; }
        ctx.drawImage(media as CanvasImageSource, dx, dy, dw, dh);
      }
    }

    renderText(ctx, w, h, layers);
  }, [size, fileType, layers, ready]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    animRef.current = raf;
    return () => cancelAnimationFrame(raf);
  }, [playing, draw]);

  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const url = URL.createObjectURL(f);
    setFile(f);
    setBlobUrl(url);
    setReady(false);
    const isVid = f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(f.name);
    setFileType(isVid ? "video" : "image");
    if (!isVid) {
      const img = new window.Image();
      img.onload = () => { imgRef.current = img; setReady(true); };
      img.src = url;
    }
  };

  const reset = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setFile(null); setBlobUrl(null); setFileType(null); setReady(false); setPlaying(false);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); }
  };

  const updateLayer = (idx: number, updates: Partial<Layer>) =>
    setLayers((prev) => prev.map((l, i) => (i === idx ? { ...l, ...updates } : l)));
  const updateStyle = (idx: number, styleUpdates: Partial<TextStyle>) =>
    setLayers((prev) => prev.map((l, i) => (i === idx ? { ...l, style: { ...l.style, ...styleUpdates } } : l)));
  const addLayer = () => {
    setLayers((prev) => [...prev, { id: Date.now(), text: "", style: { ...PRESETS[2].style }, visible: true, preset: PRESETS[2].id }]);
    setActiveLayer(layers.length);
  };
  const removeLayer = (idx: number) => {
    if (layers.length <= 1) return;
    setLayers((prev) => prev.filter((_, i) => i !== idx));
    setActiveLayer(Math.max(0, idx - 1));
  };

  const exportFrame = () => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `social-on-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("PNG exportado");
  };

  const exportVideo = async () => {
    const canvas = canvasRef.current;
    const v = videoRef.current;
    if (fileType !== "video" || !canvas || !v) return;
    try {
      setExporting(true);
      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `social-on-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setExporting(false);
        setPlaying(false);
        toast.success("Vídeo exportado (WebM)");
      };
      v.currentTime = 0;
      recorder.start();
      await v.play();
      setPlaying(true);
      const loop = () => {
        draw();
        if (!v.paused && !v.ended) requestAnimationFrame(loop);
        else if (recorder.state === "recording") recorder.stop();
      };
      requestAnimationFrame(loop);
    } catch (err: any) {
      setExporting(false);
      toast.error(err?.message || "Falha ao exportar vídeo");
    }
  };

  const cur = layers[activeLayer];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-sm font-semibold">Editor de texto — foto e vídeo</p>
          <p className="text-xs text-muted-foreground">Camadas, presets de estilo e exportação PNG / WebM.</p>
        </div>
        {file && (
          <div className="flex gap-2">
            <button onClick={exportFrame} className="px-3 py-1.5 rounded-md text-xs border flex items-center gap-1" style={{ borderColor: "#B8922A55", color: "#B8922A" }}>
              <Download className="w-3 h-3" /> PNG
            </button>
            {fileType === "video" && (
              <button onClick={exportVideo} disabled={exporting} className="px-3 py-1.5 rounded-md text-xs border flex items-center gap-1 disabled:opacity-50" style={{ borderColor: "#00D4FF55", color: "#00D4FF" }}>
                {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />} VÍDEO
              </button>
            )}
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />

      {!file ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed py-12 flex flex-col items-center gap-2"
          style={{ borderColor: "#B8922A33" }}
        >
          <Upload className="w-6 h-6" style={{ color: "#B8922A" }} />
          <span className="text-sm">Sobe foto ou vídeo</span>
          <span className="text-[11px] text-muted-foreground">Qualquer formato · sem limite de tamanho</span>
        </button>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex gap-1">
              {Object.keys(RATIOS).map((r) => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className="flex-1 py-1 text-[10px] font-mono rounded border"
                  style={{
                    borderColor: ratio === r ? "#B8922A66" : "#ffffff1a",
                    color: ratio === r ? "#B8922A" : "#888",
                    background: ratio === r ? "#B8922A11" : "transparent",
                  }}
                >
                  {r}
                </button>
              ))}
              <button onClick={reset} className="px-2 py-1 rounded border" style={{ borderColor: "#ffffff1a" }}>
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>

            <div className="flex justify-center rounded-xl border p-2" style={{ borderColor: "#ffffff14", background: "#000" }}>
              <canvas ref={canvasRef} style={{ maxWidth: "100%", maxHeight: 460 }} />
            </div>

            {fileType === "video" && blobUrl && (
              <>
                <video
                  ref={videoRef}
                  src={blobUrl}
                  onLoadedData={() => { setReady(true); setDuration(videoRef.current?.duration || 0); }}
                  onTimeUpdate={() => { setCurrentTime(videoRef.current?.currentTime || 0); if (!playing) draw(); }}
                  onEnded={() => setPlaying(false)}
                  preload="auto"
                  playsInline
                  muted
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button onClick={togglePlay} className="p-2 rounded border" style={{ borderColor: "#B8922A55" }}>
                    {playing ? <Pause className="w-3 h-3" style={{ color: "#B8922A" }} /> : <Play className="w-3 h-3" style={{ color: "#B8922A" }} />}
                  </button>
                  <span className="text-[10px] font-mono text-muted-foreground">{fmt(currentTime)}</span>
                  <div
                    className="flex-1 h-1.5 rounded bg-white/10 cursor-pointer"
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      if (videoRef.current && duration) videoRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration;
                    }}
                  >
                    <div className="h-full rounded" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%`, background: "#B8922A" }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{fmt(duration)}</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-mono text-muted-foreground mr-1">CAMADAS</span>
              {layers.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setActiveLayer(i)}
                  className="px-2 py-1 text-[10px] font-mono rounded border"
                  style={{
                    borderColor: activeLayer === i ? "#B8922A66" : "#ffffff1a",
                    color: activeLayer === i ? "#B8922A" : "#888",
                    opacity: l.visible ? 1 : 0.4,
                  }}
                >
                  T{i + 1}
                </button>
              ))}
              <button onClick={addLayer} className="px-2 py-1 rounded border" style={{ borderColor: "#ffffff1a" }}>
                <Plus className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>

            {cur && (
              <div className="space-y-3">
                <textarea
                  value={cur.text}
                  onChange={(e) => updateLayer(activeLayer, { text: e.target.value })}
                  placeholder="Digite o texto aqui..."
                  rows={2}
                  className="w-full rounded-md bg-white/5 border p-2 text-sm resize-none"
                  style={{ borderColor: "#ffffff1a" }}
                />

                <div>
                  <button
                    onClick={() => setShowPresets((v) => !v)}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-md border text-[11px] font-mono"
                    style={{ borderColor: "#B8922A33", color: "#B8922A", background: "#B8922A0d" }}
                  >
                    <span>ESTILO: {PRESETS.find((p) => p.id === cur.preset)?.name || "Custom"}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showPresets ? "rotate-180" : ""}`} />
                  </button>
                  {showPresets && (
                    <div className="border border-t-0 rounded-b-md max-h-52 overflow-auto" style={{ borderColor: "#ffffff1a" }}>
                      {PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setLayers((prev) => prev.map((l, i) => (i === activeLayer ? { ...l, style: { ...p.style }, preset: p.id } : l)));
                            setShowPresets(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5"
                          style={{ background: cur.preset === p.id ? "#B8922A11" : "transparent" }}
                        >
                          <span className="text-xs">{p.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[45%]">{p.preview}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-1 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateStyle(activeLayer, { color: c })}
                      className="w-6 h-6 rounded"
                      style={{ background: c, border: cur.style.color === c ? "2px solid #B8922A" : "1px solid #ffffff22" }}
                      aria-label={`Cor ${c}`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 block">
                    <span className="text-[10px] font-mono text-muted-foreground">TAMANHO</span>
                    <input type="range" min={12} max={72} value={cur.style.fontSize} onChange={(e) => updateStyle(activeLayer, { fontSize: +e.target.value })} className="w-full" style={{ accentColor: "#B8922A" }} />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[10px] font-mono text-muted-foreground">POSIÇÃO Y</span>
                    <input type="range" min={5} max={95} value={Math.round((cur.style.y ?? 0.5) * 100)} onChange={(e) => updateStyle(activeLayer, { y: +e.target.value / 100 })} className="w-full" style={{ accentColor: "#00D4FF" }} />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[10px] font-mono text-muted-foreground">CONTORNO</span>
                    <input type="range" min={0} max={6} value={cur.style.strokeWidth} onChange={(e) => updateStyle(activeLayer, { strokeWidth: +e.target.value, stroke: +e.target.value > 0 ? "#000000" : "none" })} className="w-full" style={{ accentColor: "#E8A020" }} />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[10px] font-mono text-muted-foreground">ESPAÇAMENTO</span>
                    <input type="range" min={0} max={10} value={cur.style.letterSpacing || 0} onChange={(e) => updateStyle(activeLayer, { letterSpacing: +e.target.value })} className="w-full" style={{ accentColor: "#7C3AED" }} />
                  </label>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => updateStyle(activeLayer, { align: a })}
                      className="p-1.5 rounded border"
                      style={{ borderColor: cur.style.align === a ? "#B8922A66" : "#ffffff1a" }}
                      aria-label={`Alinhar ${a}`}
                    >
                      {a === "left" ? <AlignLeft className="w-3 h-3 text-muted-foreground" /> : a === "center" ? <AlignCenter className="w-3 h-3 text-muted-foreground" /> : <AlignRight className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  ))}
                  <button onClick={() => updateStyle(activeLayer, { uppercase: !cur.style.uppercase })} className="px-2 py-1 rounded border text-[10px] font-mono" style={{ borderColor: cur.style.uppercase ? "#B8922A66" : "#ffffff1a", color: cur.style.uppercase ? "#B8922A" : "#888" }}>AA</button>
                  <button onClick={() => updateStyle(activeLayer, { shadow: !cur.style.shadow })} className="px-2 py-1 rounded border text-[10px] font-mono" style={{ borderColor: cur.style.shadow ? "#B8922A66" : "#ffffff1a", color: cur.style.shadow ? "#B8922A" : "#888" }}>SOMBRA</button>
                  <button onClick={() => updateLayer(activeLayer, { visible: !cur.visible })} className="p-1.5 rounded border" style={{ borderColor: "#ffffff1a" }} aria-label="Alternar visibilidade">
                    <Eye className="w-3 h-3" style={{ color: cur.visible ? "#00C896" : "#ff4444" }} />
                  </button>
                  {layers.length > 1 && (
                    <button onClick={() => removeLayer(activeLayer)} className="p-1.5 rounded border" style={{ borderColor: "#ff444433" }} aria-label="Remover camada">
                      <Trash2 className="w-3 h-3" style={{ color: "#ff4444" }} />
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-mono text-muted-foreground mb-1">EXEMPLOS RÁPIDOS</p>
                  <div className="flex flex-wrap gap-1">
                    {QUICK_TEXTS.map((txt, i) => (
                      <button
                        key={i}
                        onClick={() => updateLayer(activeLayer, { text: txt })}
                        className="px-2 py-1 rounded border text-[10px] text-muted-foreground hover:text-foreground"
                        style={{ borderColor: "#ffffff1a" }}
                      >
                        {txt.replace("\n", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTextEditorPanel;
