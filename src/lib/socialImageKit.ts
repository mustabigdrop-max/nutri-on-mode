// SOCIAL ON — geração de imagens no canvas (edição de foto, carrossel, stories, brand score)

export const NUTRION_BG = "#020205";
export const NUTRION_CYAN = "#00D4FF";
export const NUTRION_GREEN = "#00FF88";

export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem"));
    img.src = src;
  });

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    fr.readAsDataURL(file);
  });

const ctxOf = (w: number, h: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx };
};

export const downloadDataUrl = (dataUrl: string, filename: string) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/** Reduz a imagem mantendo proporção (lado maior = max) */
const fitSize = (img: HTMLImageElement, max = 1440) => {
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  return { w: Math.round(img.width * scale), h: Math.round(img.height * scale) };
};

export const gradeFitness = async (src: string) => {
  const img = await loadImage(src);
  const { w, h } = fitSize(img);
  const { canvas, ctx } = ctxOf(w, h);
  ctx.filter = "contrast(1.15) saturate(1.10) brightness(1.05)";
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.92);
};

export const gradeDarkPremium = async (src: string) => {
  const img = await loadImage(src);
  const { w, h } = fitSize(img);
  const { canvas, ctx } = ctxOf(w, h);
  ctx.filter = "contrast(1.20) saturate(0.90) brightness(0.85)";
  ctx.drawImage(img, 0, 0, w, h);
  ctx.filter = "none";
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.8);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(2,2,5,0.6)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.92);
};

/** Corte central na proporção pedida */
export const cropToRatio = async (src: string, rw: number, rh: number, outW = 1080) => {
  const img = await loadImage(src);
  const target = rw / rh;
  const source = img.width / img.height;
  let sw = img.width;
  let sh = img.height;
  if (source > target) sw = img.height * target;
  else sh = img.width / target;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  const outH = Math.round((outW * rh) / rw);
  const { canvas, ctx } = ctxOf(outW, outH);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
  return canvas.toDataURL("image/jpeg", 0.92);
};

// ── Renderização de texto ──
const wrapLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const out: string[] = [];
  for (const paragraph of String(text || "").split("\n")) {
    let line = "";
    for (const word of paragraph.split(" ")) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        out.push(line);
        line = word;
      } else line = test;
    }
    out.push(line);
  }
  return out;
};

const drawBlock = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  weight = "700",
  color = "#ffffff",
  lineGap = 1.25,
) => {
  ctx.font = `${weight} ${size}px 'Space Grotesk', 'Rajdhani', system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  const lines = wrapLines(ctx, text, maxWidth);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * size * lineGap));
  return y + lines.length * size * lineGap;
};

export type SlideSpec = {
  backgroundImage?: string | null;
  overlay?: string;
  eyebrow?: string;
  title: string;
  body?: string;
  footer?: string;
  accent?: string;
  /** Gradiente de fundo [topo, base] — usado no estilo Gradient Bold */
  gradient?: [string, string];
  /** Aumenta o tamanho do título (Gradient Bold) */
  bigTitle?: boolean;
};

export const renderSlide = async (spec: SlideSpec, w = 1080, h = 1350) => {
  const { canvas, ctx } = ctxOf(w, h);
  ctx.fillStyle = NUTRION_BG;
  ctx.fillRect(0, 0, w, h);

  if (spec.gradient) {
    const bg = ctx.createLinearGradient(0, 0, w * 0.4, h);
    bg.addColorStop(0, spec.gradient[0]);
    bg.addColorStop(1, spec.gradient[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }


  if (spec.backgroundImage) {
    const img = await loadImage(spec.backgroundImage);
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.fillStyle = spec.overlay || "rgba(2,2,5,0.65)";
    ctx.fillRect(0, 0, w, h);
  }

  const accent = spec.accent || NUTRION_CYAN;
  const pad = Math.round(w * 0.08);
  const maxW = w - pad * 2;

  // barra de marca (somente quando a marca d'água está ativa)
  if (spec.footer) {
    ctx.fillStyle = accent;
    ctx.fillRect(pad, pad, 72, 6);
  }

  let y = pad + 40;
  if (spec.eyebrow) {
    y = drawBlock(ctx, spec.eyebrow.toUpperCase(), pad, y, maxW, Math.round(w * 0.028), "700", accent, 1.4) + 24;
  }
  y = drawBlock(ctx, spec.title, pad, y, maxW, Math.round(w * (spec.bigTitle ? 0.105 : 0.075)), "900", "#ffffff", 1.1) + 28;
  if (spec.body) {
    y = drawBlock(ctx, spec.body, pad, y, maxW, Math.round(w * 0.038), "500", "rgba(255,255,255,0.82)", 1.4);
  }

  if (spec.footer) {
    ctx.font = `700 ${Math.round(w * 0.028)}px 'Space Grotesk', system-ui, sans-serif`;
    ctx.fillStyle = accent;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(spec.footer, pad, h - pad);
  }
  return canvas.toDataURL("image/png");
};

export const renderStoryFrame = (spec: SlideSpec) => renderSlide(spec, 1080, 1920);

export type BrandScoreStory = {
  score: number;
  pillars: { label: string; value: number }[];
  followers?: string;
  streak?: string;
  handle: string;
};

export const renderBrandScoreStory = async (data: BrandScoreStory) => {
  const w = 1080;
  const h = 1920;
  const { canvas, ctx } = ctxOf(w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#05060f");
  g.addColorStop(1, NUTRION_BG);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const pad = 96;
  drawBlock(ctx, "N U T R I O N", pad, 180, w - pad * 2, 44, "900", "#ffffff");
  drawBlock(ctx, "SOCIAL ON · BRAND SCORE", pad, 240, w - pad * 2, 28, "700", NUTRION_CYAN);

  ctx.font = `900 190px 'Space Grotesk', system-ui, sans-serif`;
  ctx.fillStyle = NUTRION_GREEN;
  ctx.textBaseline = "top";
  ctx.fillText(`${data.score}`, pad, 340);
  ctx.font = `700 48px 'Space Grotesk', system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText("/100", pad + ctx.measureText(`${data.score}`).width + 190, 470);

  // barra
  const barY = 580;
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(pad, barY, w - pad * 2, 22);
  ctx.fillStyle = NUTRION_GREEN;
  ctx.fillRect(pad, barY, ((w - pad * 2) * Math.max(0, Math.min(100, data.score))) / 100, 22);

  let y = barY + 90;
  for (const p of data.pillars) {
    ctx.font = `600 34px 'Space Grotesk', system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(p.label, pad, y);
    ctx.fillStyle = p.value >= 75 ? NUTRION_GREEN : p.value >= 60 ? NUTRION_CYAN : "#FF6B6B";
    ctx.fillText(String(p.value), w - pad - 80, y);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(pad, y + 46, w - pad * 2, 8);
    ctx.fillStyle = p.value >= 75 ? NUTRION_GREEN : p.value >= 60 ? NUTRION_CYAN : "#FF6B6B";
    ctx.fillRect(pad, y + 46, ((w - pad * 2) * Math.max(0, Math.min(100, p.value))) / 100, 8);
    y += 96;
  }

  y += 20;
  if (data.followers) y = drawBlock(ctx, data.followers, pad, y, w - pad * 2, 38, "700", "#ffffff") + 12;
  if (data.streak) y = drawBlock(ctx, data.streak, pad, y, w - pad * 2, 38, "700", NUTRION_CYAN) + 12;

  ctx.font = `700 34px 'Space Grotesk', system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(`${data.handle} · nutrion.app.br`, pad, h - 160);

  return canvas.toDataURL("image/png");
};

// ── Vídeo ──

export const videoObjectUrl = (file: File) => URL.createObjectURL(file);

const loadVideo = (src: string): Promise<HTMLVideoElement> =>
  new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    v.onloadeddata = () => resolve(v);
    v.onerror = () => reject(new Error("Não foi possível ler o vídeo"));
    v.src = src;
  });

export const getVideoDuration = async (src: string) => {
  const v = await loadVideo(src);
  return Number.isFinite(v.duration) ? v.duration : 0;
};

const seekFrame = (v: HTMLVideoElement, time: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const onSeeked = () => {
      try {
        const { canvas, ctx } = ctxOf(v.videoWidth, v.videoHeight);
        ctx.filter = "contrast(1.10) saturate(1.05)";
        ctx.drawImage(v, 0, 0, v.videoWidth, v.videoHeight);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Falha ao capturar frame"));
      } finally {
        v.removeEventListener("seeked", onSeeked);
      }
    };
    v.addEventListener("seeked", onSeeked);
    v.currentTime = Math.max(0.1, Math.min(time, (v.duration || 1) - 0.1));
  });

/** Captura N frames distribuídos e devolve o mais "forte" (maior contraste/nitidez) primeiro. */
export const extractVideoFrames = async (src: string, count = 5) => {
  const v = await loadVideo(src);
  const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 1;
  const frames: { time: number; dataUrl: string; score: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = (dur * (i + 0.5)) / count;
    const dataUrl = await seekFrame(v, t);
    frames.push({ time: t, dataUrl, score: await frameScore(dataUrl) });
  }
  return frames.sort((a, b) => b.score - a.score);
};

/** Score simples: desvio padrão de luminância (proxy de contraste/detalhe). */
const frameScore = async (dataUrl: string) => {
  const img = await loadImage(dataUrl);
  const w = 96;
  const h = Math.max(1, Math.round((img.height / img.width) * w));
  const { ctx } = ctxOf(w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  let sum = 0;
  const lums: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    lums.push(l);
    sum += l;
  }
  const mean = sum / lums.length;
  const variance = lums.reduce((a, l) => a + (l - mean) ** 2, 0) / lums.length;
  return Math.sqrt(variance);
};
