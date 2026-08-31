// SOCIAL ON — geração de imagens no canvas (edição de foto, carrossel, stories, brand score)
import type { CarouselPreset, CarouselSlideType, CoachPhotoMode, McePillar } from "./socialCarouselSystem";
import { MCE_ACCENTS } from "./socialCarouselSystem";

export const NUTRION_BG = "#020205";
export const NUTRION_CYAN = "#00D4FF";
export const NUTRION_GREEN = "#00FF88";

// ─── Identidade visual do Social ON ──────────────────────────────
// Uma paleta só, usada em todo carrossel/card gerado (independente de qual
// painel gerou), pra quem vê reconhecer o post como "essa é a marca dele"
// antes de ler uma palavra. Dourado = autoridade/elite (o mesmo tom que já
// aparece nos badges "ELITE" do Apex Visual e no "MÉTODO MCE") — combina
// direto com o nicho de fisiculturismo/coaching de alta performance. Ciano
// é o secundário: já é a cor de "dado/IA/precisão" usada no resto do
// sistema (APEX Intelligence, scores, gráficos). Dourado pra capa/CTA
// (autoridade), ciano pra conteúdo/prova (tecnologia) — mantém contraste
// claro entre "isso é institucional" e "isso é informação" no carrossel.
export const SOCIAL_BRAND = {
  gold: "#B8922A",
  goldDark: "#8a6c1f",
  cyan: NUTRION_CYAN,
  bg: NUTRION_BG,
  /** Gradientes prontos pros dois papéis de slide num carrossel. */
  gradientGold: ["#0d0904", "#1c1006"] as [string, string],
  gradientCyan: ["#020510", "#03141c"] as [string, string],
} as const;

/**
 * Iniciais do @handle do próprio coach (ex.: "diogo.mell0" → "DM") pra usar
 * como marca gigante de fundo nos cards — identidade real de quem gerou o
 * post, nunca de outro coach da plataforma. Sem handle, cai num "N" neutro
 * (nutriON) em vez de inventar iniciais de alguém.
 */
export const monogramFromHandle = (handle?: string | null): string => {
  const clean = String(handle || "").replace("@", "").trim();
  if (!clean) return "N";
  const parts = clean.split(/[._\-\s]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
};

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

/** Converte data URL (base64) em Blob — evita o limite de tamanho de href em data: */
const dataUrlToBlob = (dataUrl: string): Blob => {
  const [head, body] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(head)?.[1] || "image/png";
  if (head.includes("base64")) {
    const bin = atob(body);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  return new Blob([decodeURIComponent(body)], { type: mime });
};

const triggerDownload = (href: string, filename: string) => {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/** Baixa uma imagem (data URL, blob URL ou http URL) forçando salvamento do arquivo. */
export const downloadDataUrl = (dataUrl: string, filename: string) => {
  if (!dataUrl) return false;
  try {
    if (dataUrl.startsWith("data:")) {
      const url = URL.createObjectURL(dataUrlToBlob(dataUrl));
      triggerDownload(url, filename);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } else {
      triggerDownload(dataUrl, filename);
    }
    return true;
  } catch (e) {
    console.error("Falha no download:", e);
    try { window.open(dataUrl, "_blank"); } catch { /* noop */ }
    return false;
  }
};

/** Baixa uma URL remota (Storage/CORS) como arquivo real. */
export const downloadFromUrl = async (url: string, filename: string) => {
  if (!url) return false;
  if (url.startsWith("data:") || url.startsWith("blob:")) return downloadDataUrl(url, filename);
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    triggerDownload(blobUrl, filename);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
    return true;
  } catch (e) {
    console.error("Erro no download:", e);
    window.open(url, "_blank");
    return false;
  }
};

const toBlob = async (url: string): Promise<Blob | null> => {
  try {
    if (url.startsWith("data:")) return dataUrlToBlob(url);
    const res = await fetch(url, { mode: "cors" });
    return await res.blob();
  } catch {
    return null;
  }
};

export const isMobileDevice = () =>
  typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * No celular, abre a folha de compartilhamento (Salvar em Fotos / WhatsApp / Instagram).
 * Retorna quantos arquivos foram compartilhados, ou null se não for possível.
 */
export const shareImages = async (
  items: { url: string; filename: string }[],
  text?: string,
): Promise<number | null> => {
  if (typeof navigator === "undefined" || !navigator.share || !navigator.canShare) return null;
  const files: File[] = [];
  for (const { url, filename } of items) {
    if (!url) continue;
    const blob = await toBlob(url);
    if (!blob) continue;
    files.push(new File([blob], filename, { type: blob.type || "image/png" }));
  }
  if (!files.length || !navigator.canShare({ files })) return null;
  try {
    await navigator.share({ files, ...(text ? { text } : {}) });
    return files.length;
  } catch (e: any) {
    if (e?.name === "AbortError") return 0;
    return null;
  }
};

/**
 * Salva as imagens: no celular tenta compartilhar (salvar na galeria / mandar no WhatsApp),
 * no desktop baixa em sequência com intervalo — navegadores bloqueiam
 * downloads múltiplos disparados no mesmo tick.
 * Retorna quantos arquivos foram entregues.
 */
export const downloadMany = async (
  items: { url: string; filename: string }[],
  gapMs = 450,
): Promise<number> => {
  if (isMobileDevice()) {
    const shared = await shareImages(items);
    if (shared !== null) return shared;
  }
  let ok = 0;
  for (let i = 0; i < items.length; i++) {
    const { url, filename } = items[i];
    if (!url) continue;
    const done = await downloadFromUrl(url, filename);
    if (done) ok++;
    if (i < items.length - 1) await new Promise((r) => setTimeout(r, gapMs));
  }
  return ok;
};

/** Salva 1 imagem (share no celular, download no desktop). */
export const saveImage = async (url: string, filename: string) => {
  const n = await downloadMany([{ url, filename }]);
  return n > 0;
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

/** Ajustes de legenda na imagem controlados pelo usuário. */
export type CaptionStyle = {
  /** Tamanho em px de tela (12–32). Convertido pra escala do canvas. */
  size?: number;
  position?: "top" | "center" | "bottom";
  color?: string;
  /** Fundo do texto: nenhum, sombra ou box semi-transparente. */
  bg?: "none" | "shadow" | "box";
};

export const DEFAULT_CAPTION_STYLE: Required<CaptionStyle> = {
  size: 18,
  position: "bottom",
  color: "#FFFFFF",
  bg: "shadow",
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
  /** Controles do usuário para a legenda desenhada sobre a foto. */
  captionStyle?: CaptionStyle;
  /**
   * Marca gigante e bem discreta no fundo dos cards sem foto — pensada pra
   * ser a identidade do próprio coach (ex.: suas iniciais), não um número
   * de slide genérico. Curta (1-2 caracteres) fica melhor.
   */
  ghostMark?: string;
  preset?: CarouselPreset;
  slideType?: CarouselSlideType;
  pillar?: McePillar;
  reference?: string;
  keywords?: string[];
  coachPhotoMode?: CoachPhotoMode;
  slideNumber?: number;
  slideCount?: number;
};

/** Fração máxima da área da imagem que o bloco de legenda pode ocupar. */
const MAX_CAPTION_AREA = 0.3;

const renderProprietarySlide = async (spec: SlideSpec, w: number, h: number) => {
  const { canvas, ctx } = ctxOf(w, h);
  const preset = spec.preset || "dark_authority";
  const type = spec.slideType || "content";
  const accent = MCE_ACCENTS[spec.pillar || "comportamento"];
  const pad = 86;
  const maxW = w - pad * 2;
  const bg = ctx.createLinearGradient(0, 0, w, h);
  if (preset === "bold_impact") {
    bg.addColorStop(0, "#07070c");
    bg.addColorStop(1, "#171721");
  } else if (preset === "minimal_clean") {
    bg.addColorStop(0, "#09090d");
    bg.addColorStop(1, "#0d0d14");
  } else {
    bg.addColorStop(0, "#0a0a0f");
    bg.addColorStop(1, "#12121f");
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const useFullPhoto = !!spec.backgroundImage && spec.coachPhotoMode === "cover" && (type === "hook" || type === "cta");
  if (useFullPhoto && spec.backgroundImage) {
    const image = await loadImage(spec.backgroundImage);
    const scale = Math.max(w / image.width, h / image.height);
    const dw = image.width * scale;
    const dh = image.height * scale;
    ctx.globalAlpha = 0.38;
    ctx.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
    const veil = ctx.createLinearGradient(0, 0, 0, h);
    veil.addColorStop(0, "rgba(5,5,10,0.72)");
    veil.addColorStop(1, "rgba(5,5,10,0.88)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, w, h);
  }

  if (type === "cta" && !useFullPhoto) {
    ctx.fillStyle = accent;
    ctx.globalAlpha = preset === "minimal_clean" ? 0.16 : 0.9;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(5,5,10,0.9)";
    ctx.fillRect(34, 34, w - 68, h - 68);
  }

  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, w, type === "hook" ? 12 : 7);
  if (preset === "dark_authority") ctx.fillRect(pad, 132, 58, 4);
  if (preset === "minimal_clean") ctx.fillRect(pad, h - 132, 96, 3);

  const label = type === "hook" ? "MCE / MANIFESTO" : type === "problem" ? "O PROBLEMA" : type === "takeaway" ? "TAKEAWAY" : type === "cta" ? "PRÓXIMO MOVIMENTO" : (spec.pillar || "comportamento").toUpperCase();
  ctx.font = `700 27px 'Space Grotesk', system-ui, sans-serif`;
  ctx.fillStyle = accent;
  ctx.textBaseline = "top";
  if (type !== "hook") ctx.fillText(label, pad, 156);

  let y = type === "hook" ? 330 : type === "cta" ? 328 : 310;
  const titleSize = type === "hook" ? 88 : type === "takeaway" ? 76 : 66;
  const titleColor = "#F7F7FA";
  y = drawBlock(ctx, spec.title, pad, y, maxW, titleSize, "900", titleColor, 1.04);

  if (preset === "bold_impact" && spec.keywords?.length) {
    let chipX = pad;
    const chipY = y + 42;
    ctx.font = `800 28px 'Space Grotesk', system-ui, sans-serif`;
    for (const keyword of spec.keywords.slice(0, 3)) {
      const chipW = ctx.measureText(keyword.toUpperCase()).width + 34;
      if (chipX + chipW > w - pad) break;
      ctx.fillStyle = accent;
      ctx.fillRect(chipX, chipY, chipW, 50);
      ctx.fillStyle = "#07070c";
      ctx.fillText(keyword.toUpperCase(), chipX + 17, chipY + 10);
      chipX += chipW + 12;
    }
    y = chipY + 86;
  } else {
    y += 42;
  }

  if (spec.body) {
    // Corpo agora carrega o "mini-artigo científico" do slide (achado +
    // mecanismo + aplicação, ~35-55 palavras) — bem mais texto que o hook
    // de 8 palavras. Sem auto-ajuste, um body longo em slide de reference
    // (que já reserva espaço embaixo) estourava em cima do rodapé/contador.
    // Encolhe a fonte em passos até caber no espaço livre até o rodapé.
    const bodyMaxW = preset === "minimal_clean" ? maxW * 0.78 : maxW;
    const bottomLimit = h - (spec.reference ? 230 : 170);
    let bodySize = 38;
    const linesFor = (size: number) => {
      ctx.font = `500 ${size}px 'Space Grotesk', system-ui, sans-serif`;
      return wrapLines(ctx, spec.body!, bodyMaxW).length;
    };
    while (y + linesFor(bodySize) * bodySize * 1.35 > bottomLimit && bodySize > 26) bodySize -= 2;
    y = drawBlock(ctx, spec.body, pad, y, bodyMaxW, bodySize, "500", "rgba(247,247,250,0.76)", 1.35);
  }
  if (spec.reference) {
    ctx.fillStyle = accent;
    ctx.fillRect(pad, y + 40, 32, 3);
    drawBlock(ctx, spec.reference, pad + 48, y + 25, maxW - 48, 25, "700", accent, 1.2);
  }

  if (type === "cta" && spec.backgroundImage && spec.coachPhotoMode === "cta_circle") {
    const image = await loadImage(spec.backgroundImage);
    const r = 102;
    const cx = w - pad - r;
    const cy = h - 252;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const scale = Math.max((r * 2) / image.width, (r * 2) / image.height);
    ctx.drawImage(image, cx - image.width * scale / 2, cy - image.height * scale / 2, image.width * scale, image.height * scale);
    ctx.restore();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Assinatura do rodapé: só o que o próprio coach informou (spec.footer) —
  // nunca um @ ou "nutriON" fixo, senão todo coach da plataforma sai com a
  // mesma assinatura de outra pessoa estampada na própria imagem.
  if (type !== "hook" && spec.footer) {
    ctx.font = `700 24px 'Space Grotesk', system-ui, sans-serif`;
    ctx.fillStyle = "rgba(247,247,250,0.52)";
    ctx.fillText(spec.footer, pad, h - 92);
  }
  // Convite pra continuar o carrossel — todo slide que não é o último (no
  // CTA não faz sentido, é o fim). Na capa (hook) não existe contador nem
  // assinatura ainda, então o "»" vira o próprio elemento do rodapé; nos
  // demais, pendura no contador que já está ali ("03 / 08 »").
  if (type === "hook") {
    ctx.font = `700 24px 'Space Grotesk', system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(247,247,250,0.4)";
    ctx.fillText("ARRASTE  »", w - pad, h - 92);
    ctx.textAlign = "left";
  }
  if (type !== "hook") {
    ctx.font = `700 24px 'Space Grotesk', system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(247,247,250,0.35)";
    const counter = `${String(spec.slideNumber || 1).padStart(2, "0")} / ${String(spec.slideCount || 1).padStart(2, "0")}`;
    ctx.fillText(type === "cta" ? counter : `${counter}  »`, w - pad, h - 92);
    ctx.textAlign = "left";
  }
  return canvas.toDataURL("image/png");
};

export const renderSlide = async (spec: SlideSpec, w = 1080, h = 1350) => {
  if (spec.preset || spec.slideType) return renderProprietarySlide(spec, w, h);
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

  const cs = { ...DEFAULT_CAPTION_STYLE, ...(spec.captionStyle || {}) };

  // Card sem foto de fundo — a legenda cola no rodapé (ver mais abaixo), o
  // que sobra é um bloco de cor lisa gigante e vazio por cima, sem nenhum
  // elemento — lê como "esqueceram de terminar o design". Preenche essa
  // área com camadas discretas: glow + uma marca gigante e bem apagada no
  // fundo. Essa marca é a IDENTIDADE do coach (ghostMark — normalmente as
  // iniciais dele), não um número de slide genérico — um "02" gigante não
  // é ninguém; "DM" gigante é dele.
  if (spec.gradient && !spec.backgroundImage) {
    const accentGlow = spec.accent || NUTRION_CYAN;
    const glow = ctx.createRadialGradient(w * 0.82, h * 0.18, 0, w * 0.82, h * 0.18, w * 0.65);
    glow.addColorStop(0, `${accentGlow}26`);
    glow.addColorStop(1, `${accentGlow}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    if (spec.ghostMark && spec.ghostMark.trim().length <= 3) {
      ctx.save();
      ctx.font = `900 ${Math.round(w * 0.62)}px 'Space Grotesk', system-ui, sans-serif`;
      ctx.fillStyle = `${accentGlow}14`;
      ctx.textBaseline = "top";
      ctx.fillText(spec.ghostMark.trim(), w * 0.42, -h * 0.03);
      ctx.restore();
    }
  }

  if (spec.backgroundImage) {
    const img = await loadImage(spec.backgroundImage);
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

    // Véu em gradiente (não um véu uniforme) — a foto fica vívida na área
    // sem texto e só escurece de verdade onde a legenda vai ficar. Um véu
    // parelho em cima da foto inteira apagava a foto toda e ainda deixava
    // um vazio grande acima do texto quando a legenda era curta (o texto
    // sempre cola no rodapé, então a metade de cima ficava "sobrando").
    const dark = spec.overlay || "rgba(2,2,5,0.86)";
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (cs.position === "top") {
      grad.addColorStop(0, dark);
      grad.addColorStop(0.42, dark);
      grad.addColorStop(0.62, "rgba(2,2,5,0.12)");
      grad.addColorStop(1, "rgba(2,2,5,0.04)");
    } else if (cs.position === "center") {
      grad.addColorStop(0, "rgba(2,2,5,0.3)");
      grad.addColorStop(0.5, dark);
      grad.addColorStop(1, "rgba(2,2,5,0.3)");
    } else {
      grad.addColorStop(0, "rgba(2,2,5,0.04)");
      grad.addColorStop(0.38, "rgba(2,2,5,0.12)");
      grad.addColorStop(0.58, dark);
      grad.addColorStop(1, dark);
    }
    ctx.fillStyle = grad;
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
  // 390px é a largura de referência do preview mobile.
  const k = w / 390;

  const eyeSize = Math.round(w * 0.028);
  let titleSize = Math.round(cs.size * 1.55 * k);
  let bodySize = Math.round(cs.size * k);

  const measure = (text: string, size: number, weight: string, gap: number) => {
    ctx.font = `${weight} ${size}px 'Space Grotesk', 'Rajdhani', system-ui, sans-serif`;
    return wrapLines(ctx, text, maxW).length * size * gap;
  };
  const totalHeight = () =>
    (spec.eyebrow ? measure(spec.eyebrow.toUpperCase(), eyeSize, "700", 1.4) + 24 : 0) +
    measure(spec.title, titleSize, "900", 1.1) +
    (spec.body ? 28 + measure(spec.body, bodySize, "500", 1.4) : 0);

  // A legenda nunca cobre mais de 30% da área da imagem.
  for (let i = 0; i < 6 && totalHeight() > h * MAX_CAPTION_AREA; i++) {
    const f = Math.max(0.7, (h * MAX_CAPTION_AREA) / totalHeight());
    titleSize = Math.max(Math.round(w * 0.03), Math.round(titleSize * f));
    bodySize = Math.max(Math.round(w * 0.018), Math.round(bodySize * f));
  }

  const blockH = totalHeight();
  let y =
    cs.position === "top"
      ? pad + 40
      : cs.position === "center"
        ? Math.max(pad + 40, (h - blockH) / 2)
        : Math.max(pad + 40, h - pad - (spec.footer ? 90 : 40) - blockH);

  if (cs.bg === "box") {
    ctx.fillStyle = "rgba(2,2,5,0.55)";
    ctx.fillRect(pad - 24, y - 24, maxW + 48, blockH + 48);
  }
  if (cs.bg === "shadow") {
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = Math.round(w * 0.018);
    ctx.shadowOffsetY = Math.round(w * 0.004);
  }

  if (spec.eyebrow) {
    y = drawBlock(ctx, spec.eyebrow.toUpperCase(), pad, y, maxW, eyeSize, "700", accent, 1.4) + 24;
  }
  y = drawBlock(ctx, spec.title, pad, y, maxW, titleSize, "900", cs.color, 1.1) + 28;
  if (spec.body) {
    y = drawBlock(ctx, spec.body, pad, y, maxW, bodySize, "500", cs.color, 1.4);
  }
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;


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

  // Sem marca d'água — nem @handle nem nutrion.app.br estampados na imagem.

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

/** Detecta tipo de mídia por MIME ou extensão (cobre HEIC, MOV, AVI, MKV...). */
export const detectMediaKind = (file: File): "image" | "video" | null => {
  const name = file.name || "";
  if (file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif|bmp|tiff?)$/i.test(name)) return "image";
  if (file.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|m4v|3gp)$/i.test(name)) return "video";
  return null;
};

/** Reduz a imagem para caber em `max` px e devolve um dataURL JPEG leve. */
export const compressImageFile = (file: File, max = 1024, quality = 0.75): Promise<string | null> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        let w = img.width;
        let h = img.height;
        if (w > max || h > max) {
          if (w > h) { h = Math.round((h * max) / w); w = max; }
          else { w = Math.round((w * max) / h); h = max; }
        }
        const { canvas, ctx } = ctxOf(w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });

/** Captura um frame único no tempo informado (segundos). */
export const captureFrameAt = async (src: string, time: number) => {
  const v = await loadVideo(src);
  return seekFrame(v, time);
};
