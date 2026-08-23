import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload, Play, Pause, X, ChevronDown, Download, Plus, Trash2, Eye,
  AlignCenter, AlignLeft, AlignRight, Video, Loader2, Grid3x3, Save, FolderOpen, Film,
} from "lucide-react";
import { toast } from "sonner";
import {
  type TextStyle, type Layer, type MoveKind, defaultAnim, animAt,
  drawGuides, snapTargetsX, snapTargetsY, snapValue, SAFE,
  listProjects, saveProject, deleteProject, downloadProject, readProjectFile,
  downloadBlob, pickRecorderMime, supportsMp4, encodeGif, type EditorProject, type VideoFormat,
} from "@/lib/socialEditor";

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

const MOVES: { id: MoveKind; label: string }[] = [
  { id: "none", label: "SEM" },
  { id: "up", label: "↑ SOBE" },
  { id: "down", label: "↓ DESCE" },
  { id: "left", label: "← ESQ" },
  { id: "right", label: "→ DIR" },
  { id: "zoom", label: "ZOOM" },
];

const RATIOS: Record<string, { w: number; h: number }> = {
  "9:16": { w: 360, h: 640 },
  "1:1": { w: 480, h: 480 },
  "4:5": { w: 432, h: 540 },
  "16:9": { w: 640, h: 360 },
};

function baseXOf(s: TextStyle, w: number) {
  const fx = s.x ?? (s.align === "left" ? 0.05 : s.align === "right" ? 0.95 : 0.5);
  return w * fx;
}

function renderText(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  layers: Layer[],
  time: number,
  total: number,
  animate: boolean,
) {
  layers.forEach((layer) => {
    if (!layer.text || !layer.visible) return;
    const st = animate ? animAt(layer.anim, time, total) : { alpha: 1, dx: 0, dy: 0, scale: 1 };
    if (!st) return;
    const s = layer.style;
    const fontSize = s.fontSize * (w / 400) * st.scale;
    ctx.save();
    ctx.globalAlpha = st.alpha;

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
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${s.letterSpacing || 0}px`;

    const lineH = fontSize * 1.3;
    const totalH = txtLines.length * lineH;
    const baseY = h * (s.y ?? 0.5) + h * st.dy - totalH / 2 + fontSize;
    const baseX = baseXOf(s, w) + w * st.dx;

    txtLines.forEach((line, i) => {
      const ly = baseY + i * lineH;

      if (s.bg) {
        const metrics = ctx.measureText(line);
        const pad = s.bgPad || 8;
        const bx = s.align === "center" ? baseX - metrics.width / 2 - pad : s.align === "right" ? baseX - metrics.width - pad : baseX - pad;
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
    { id: 1, text: "", style: { ...PRESETS[0].style }, visible: true, preset: PRESETS[0].id, anim: defaultAnim() },
  ]);
  const [activeLayer, setActiveLayer] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const [ratio, setRatio] = useState("9:16");
  const [showGuides, setShowGuides] = useState(true);
  const [snapOn, setSnapOn] = useState(true);
  const [guideHit, setGuideHit] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [projects, setProjects] = useState<EditorProject[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [projectName, setProjectName] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const projFileRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const draggingRef = useRef(false);

  const size = RATIOS[ratio];

  useEffect(() => { setProjects(listProjects()); }, []);

  const drawAt = useCallback((time: number, opts?: { guides?: boolean; canvas?: HTMLCanvasElement | null }) => {
    const canvas = opts?.canvas ?? canvasRef.current;
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

    renderText(ctx, w, h, layers, time, duration || 0, fileType === "video");
    if (opts?.guides) drawGuides(ctx, w, h, guideHit);
  }, [size, fileType, layers, ready, duration, guideHit]);

  const draw = useCallback(() => {
    const t = fileType === "video" ? (videoRef.current?.currentTime ?? 0) : 0;
    drawAt(t, { guides: showGuides });
  }, [drawAt, fileType, showGuides]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
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
  const updateAnim = (idx: number, animUpdates: Partial<Layer["anim"]>) =>
    setLayers((prev) => prev.map((l, i) => (i === idx ? { ...l, anim: { ...l.anim, ...animUpdates } } : l)));
  const addLayer = () => {
    setLayers((prev) => [...prev, { id: Date.now(), text: "", style: { ...PRESETS[2].style }, visible: true, preset: PRESETS[2].id, anim: defaultAnim() }]);
    setActiveLayer(layers.length);
  };
  const removeLayer = (idx: number) => {
    if (layers.length <= 1) return;
    setLayers((prev) => prev.filter((_, i) => i !== idx));
    setActiveLayer(Math.max(0, idx - 1));
  };

  /* --------- Arraste no canvas com snapping --------- */
  const posFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height };
  };
  const applyDrag = (fx: number, fy: number) => {
    let nx = Math.max(0.02, Math.min(0.98, fx));
    let ny = Math.max(0.02, Math.min(0.98, fy));
    let hitX: number | null = null;
    let hitY: number | null = null;
    if (snapOn) {
      const sx = snapValue(nx, snapTargetsX());
      const sy = snapValue(ny, snapTargetsY());
      nx = sx.value; hitX = sx.snapped;
      ny = sy.value; hitY = sy.snapped;
    }
    setGuideHit({ x: hitX, y: hitY });
    updateStyle(activeLayer, { x: nx, y: ny });
  };
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { fx, fy } = posFromEvent(e);
    applyDrag(fx, fy);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const { fx, fy } = posFromEvent(e);
    applyDrag(fx, fy);
  };
  const onPointerUp = () => { draggingRef.current = false; setGuideHit({ x: null, y: null }); };

  /* --------- Projeto --------- */
  const doSaveProject = () => {
    const name = (projectName || file?.name || "projeto").replace(/\.[^.]+$/, "").slice(0, 40);
    saveProject({ name, ratio, layers });
    setProjects(listProjects());
    setProjectName(name);
    toast.success(`Projeto "${name}" salvo`);
  };
  const loadProject = (p: EditorProject) => {
    setLayers(p.layers.map((l) => ({ ...l, anim: { ...defaultAnim(), ...(l.anim || {}) } })));
    setRatio(RATIOS[p.ratio] ? p.ratio : "9:16");
    setActiveLayer(0);
    setProjectName(p.name);
    setShowProjects(false);
    toast.success(`Projeto "${p.name}" carregado`);
  };
  const importProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { loadProject(await readProjectFile(f)); }
    catch { toast.error("Arquivo de projeto inválido"); }
    finally { e.target.value = ""; }
  };

  /* --------- Exportações --------- */
  const exportFrame = () => {
    drawAt(fileType === "video" ? currentTime : 0, { guides: false });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `social-on-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("PNG exportado");
    draw();
  };

  const exportVideo = async (format: VideoFormat) => {
    const canvas = canvasRef.current;
    const v = videoRef.current;
    if (fileType !== "video" || !canvas || !v) return;
    const mime = pickRecorderMime(format) || pickRecorderMime("webm");
    if (!mime) { toast.error("Navegador sem suporte a gravação de vídeo."); return; }
    const isMp4 = mime.startsWith("video/mp4");
    if (format === "mp4" && !isMp4) toast.message("MP4 indisponível neste navegador — exportando WebM.");
    try {
      setExporting(true);
      setExportMsg(isMp4 ? "Gravando MP4..." : "Gravando WebM...");
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const ext = isMp4 ? "mp4" : "webm";
        downloadBlob(new Blob(chunks, { type: mime }), `social-on-${Date.now()}.${ext}`);
        setExporting(false);
        setExportMsg("");
        setPlaying(false);
        toast.success(`Vídeo exportado (${ext.toUpperCase()})`);
        draw();
      };
      v.currentTime = 0;
      recorder.start();
      await v.play();
      setPlaying(true);
      const loop = () => {
        drawAt(v.currentTime, { guides: false });
        if (!v.paused && !v.ended) requestAnimationFrame(loop);
        else if (recorder.state === "recording") recorder.stop();
      };
      requestAnimationFrame(loop);
    } catch (err) {
      setExporting(false);
      setExportMsg("");
      toast.error((err as Error)?.message || "Falha ao exportar vídeo");
    }
  };

  const exportGif = async () => {
    const v = videoRef.current;
    if (fileType !== "video" || !v || !duration) return;
    if (duration > 15) { toast.error("GIF só para vídeos curtos (até 15s). Recorte antes."); return; }
    const fps = 10;
    const scale = Math.min(1, 320 / size.w);
    const gw = Math.round(size.w * scale);
    const gh = Math.round(size.h * scale);
    const off = document.createElement("canvas");
    off.width = size.w;
    off.height = size.h;
    const small = document.createElement("canvas");
    small.width = gw;
    small.height = gh;
    const sctx = small.getContext("2d");
    if (!sctx) return;

    const wasPlaying = playing;
    if (wasPlaying) { v.pause(); setPlaying(false); }
    setExporting(true);

    try {
      const total = Math.floor(duration * fps);
      const frames: { data: Uint8ClampedArray; width: number; height: number }[] = [];
      for (let i = 0; i < total; i++) {
        const t = i / fps;
        setExportMsg(`GIF ${Math.round(((i + 1) / total) * 100)}%`);
        await new Promise<void>((resolve) => {
          const onSeeked = () => { v.removeEventListener("seeked", onSeeked); resolve(); };
          v.addEventListener("seeked", onSeeked);
          v.currentTime = Math.min(t, duration - 0.01);
        });
        drawAt(t, { guides: false, canvas: off });
        sctx.clearRect(0, 0, gw, gh);
        sctx.drawImage(off, 0, 0, gw, gh);
        frames.push({ data: sctx.getImageData(0, 0, gw, gh).data, width: gw, height: gh });
      }
      setExportMsg("Montando GIF...");
      const blob = await encodeGif(frames, fps);
      downloadBlob(blob, `social-on-${Date.now()}.gif`);
      toast.success("GIF exportado");
    } catch (err) {
      toast.error((err as Error)?.message || "Falha ao gerar GIF");
    } finally {
      setExporting(false);
      setExportMsg("");
      draw();
    }
  };

  const cur = layers[activeLayer];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-sm font-semibold">Editor de texto — foto e vídeo</p>
          <p className="text-xs text-muted-foreground">Camadas animadas, guias 9:16, projetos salvos e exportação PNG / MP4 / WebM / GIF.</p>
        </div>
        {file && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportFrame} disabled={exporting} className="px-3 py-1.5 rounded-md text-xs border flex items-center gap-1 disabled:opacity-50" style={{ borderColor: "#B8922A55", color: "#B8922A" }}>
              <Download className="w-3 h-3" /> PNG
            </button>
            {fileType === "video" && (
              <>
                <button onClick={() => exportVideo("mp4")} disabled={exporting} className="px-3 py-1.5 rounded-md text-xs border flex items-center gap-1 disabled:opacity-50" style={{ borderColor: "#00C89655", color: "#00C896" }}>
                  {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />} MP4{!supportsMp4() ? "*" : ""}
                </button>
                <button onClick={() => exportVideo("webm")} disabled={exporting} className="px-3 py-1.5 rounded-md text-xs border flex items-center gap-1 disabled:opacity-50" style={{ borderColor: "#00D4FF55", color: "#00D4FF" }}>
                  <Video className="w-3 h-3" /> WEBM
                </button>
                <button onClick={exportGif} disabled={exporting} className="px-3 py-1.5 rounded-md text-xs border flex items-center gap-1 disabled:opacity-50" style={{ borderColor: "#7C3AED55", color: "#7C3AED" }}>
                  <Film className="w-3 h-3" /> GIF
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {exportMsg && <p className="text-[11px] font-mono" style={{ color: "#B8922A" }}>{exportMsg}</p>}

      <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
      <input ref={projFileRef} type="file" accept="application/json,.json" onChange={importProject} className="hidden" />

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
              <button onClick={reset} className="px-2 py-1 rounded border" style={{ borderColor: "#ffffff1a" }} aria-label="Remover arquivo">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>

            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setShowGuides((v) => !v)} className="px-2 py-1 rounded border text-[10px] font-mono flex items-center gap-1" style={{ borderColor: showGuides ? "#B8922A66" : "#ffffff1a", color: showGuides ? "#B8922A" : "#888" }}>
                <Grid3x3 className="w-3 h-3" /> GUIAS
              </button>
              <button onClick={() => setSnapOn((v) => !v)} className="px-2 py-1 rounded border text-[10px] font-mono" style={{ borderColor: snapOn ? "#00D4FF66" : "#ffffff1a", color: snapOn ? "#00D4FF" : "#888" }}>
                SNAP
              </button>
              <button onClick={doSaveProject} className="px-2 py-1 rounded border text-[10px] font-mono flex items-center gap-1" style={{ borderColor: "#00C89655", color: "#00C896" }}>
                <Save className="w-3 h-3" /> SALVAR
              </button>
              <button onClick={() => setShowProjects((v) => !v)} className="px-2 py-1 rounded border text-[10px] font-mono flex items-center gap-1" style={{ borderColor: "#ffffff1a", color: "#888" }}>
                <FolderOpen className="w-3 h-3" /> PROJETOS ({projects.length})
              </button>
            </div>

            {showProjects && (
              <div className="rounded-md border p-2 space-y-2" style={{ borderColor: "#ffffff1a" }}>
                <div className="flex gap-1">
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Nome do projeto"
                    className="flex-1 rounded bg-white/5 border px-2 py-1 text-[11px]"
                    style={{ borderColor: "#ffffff1a" }}
                  />
                  <button onClick={() => projFileRef.current?.click()} className="px-2 py-1 rounded border text-[10px] font-mono" style={{ borderColor: "#ffffff1a", color: "#888" }}>
                    IMPORTAR
                  </button>
                </div>
                {projects.length === 0 && <p className="text-[11px] text-muted-foreground">Nenhum projeto salvo ainda.</p>}
                {projects.map((p) => (
                  <div key={p.name} className="flex items-center gap-1">
                    <button onClick={() => loadProject(p)} className="flex-1 text-left text-[11px] px-2 py-1 rounded hover:bg-white/5">
                      {p.name} <span className="text-muted-foreground font-mono">· {p.ratio} · {p.layers.length} camadas</span>
                    </button>
                    <button onClick={() => downloadProject(p)} className="p-1 rounded border" style={{ borderColor: "#ffffff1a" }} aria-label="Baixar projeto">
                      <Download className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button onClick={() => { deleteProject(p.name); setProjects(listProjects()); }} className="p-1 rounded border" style={{ borderColor: "#ff444433" }} aria-label="Excluir projeto">
                      <Trash2 className="w-3 h-3" style={{ color: "#ff4444" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center rounded-xl border p-2" style={{ borderColor: "#ffffff14", background: "#000" }}>
              <canvas
                ref={canvasRef}
                style={{ maxWidth: "100%", maxHeight: 460, touchAction: "none", cursor: "move" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Arraste no preview para posicionar o texto · margens seguras {Math.round(SAFE.top * 100)}% topo / {Math.round(SAFE.bottom * 100)}% base
            </p>

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
                  <button onClick={togglePlay} className="p-2 rounded border" style={{ borderColor: "#B8922A55" }} aria-label="Reproduzir">
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
              <button onClick={addLayer} className="px-2 py-1 rounded border" style={{ borderColor: "#ffffff1a" }} aria-label="Adicionar camada">
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

                {fileType === "video" && (
                  <div className="rounded-md border p-2 space-y-2" style={{ borderColor: "#00D4FF22", background: "#00D4FF08" }}>
                    <p className="text-[10px] font-mono" style={{ color: "#00D4FF" }}>ANIMAÇÃO DA CAMADA T{activeLayer + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1 block">
                        <span className="text-[10px] font-mono text-muted-foreground">APARECE EM {cur.anim.start.toFixed(1)}s</span>
                        <input type="range" min={0} max={Math.max(1, Math.round(duration * 10)) / 10} step={0.1} value={cur.anim.start} onChange={(e) => updateAnim(activeLayer, { start: +e.target.value })} className="w-full" style={{ accentColor: "#00D4FF" }} />
                      </label>
                      <label className="space-y-1 block">
                        <span className="text-[10px] font-mono text-muted-foreground">DURA {cur.anim.duration ? `${cur.anim.duration.toFixed(1)}s` : "até o fim"}</span>
                        <input type="range" min={0} max={Math.max(1, Math.round(duration * 10)) / 10} step={0.1} value={cur.anim.duration} onChange={(e) => updateAnim(activeLayer, { duration: +e.target.value })} className="w-full" style={{ accentColor: "#00D4FF" }} />
                      </label>
                      <label className="space-y-1 block">
                        <span className="text-[10px] font-mono text-muted-foreground">FADE IN {cur.anim.fadeIn.toFixed(1)}s</span>
                        <input type="range" min={0} max={2} step={0.1} value={cur.anim.fadeIn} onChange={(e) => updateAnim(activeLayer, { fadeIn: +e.target.value })} className="w-full" style={{ accentColor: "#00C896" }} />
                      </label>
                      <label className="space-y-1 block">
                        <span className="text-[10px] font-mono text-muted-foreground">FADE OUT {cur.anim.fadeOut.toFixed(1)}s</span>
                        <input type="range" min={0} max={2} step={0.1} value={cur.anim.fadeOut} onChange={(e) => updateAnim(activeLayer, { fadeOut: +e.target.value })} className="w-full" style={{ accentColor: "#E8A020" }} />
                      </label>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {MOVES.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => updateAnim(activeLayer, { move: m.id })}
                          className="px-2 py-1 rounded border text-[10px] font-mono"
                          style={{ borderColor: cur.anim.move === m.id ? "#00D4FF66" : "#ffffff1a", color: cur.anim.move === m.id ? "#00D4FF" : "#888" }}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    {cur.anim.move !== "none" && (
                      <label className="space-y-1 block">
                        <span className="text-[10px] font-mono text-muted-foreground">INTENSIDADE DO MOVIMENTO</span>
                        <input type="range" min={1} max={30} value={Math.round(cur.anim.moveAmount * 100)} onChange={(e) => updateAnim(activeLayer, { moveAmount: +e.target.value / 100 })} className="w-full" style={{ accentColor: "#7C3AED" }} />
                      </label>
                    )}
                  </div>
                )}

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
