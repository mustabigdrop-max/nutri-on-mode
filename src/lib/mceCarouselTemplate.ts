/**
 * Template proprietário "MCE Educacional" — carrossel fixo de 7 slides 4:5
 * (1080 x 1350). Estrutura: capa, dor, pilar M, pilar C, pilar E, integração
 * e CTA. O conteúdo é dinâmico (vem do gerador do Social ON), o visual é fixo.
 *
 * Nos textos, trechos entre **asteriscos duplos** saem destacados na cor de
 * acento do slide.
 */

import { beginSlideContent, drawSlideFooter, slideContentBottom } from "@/lib/slideBase";

export const MCE_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#888888",
  soft: "#CCCCCC",
  gold: "#EF9F27",
  green: "#5DCAA5",
  purple: "#AFA9EC",
  footerMuted: "#666666",
  ctaSub: "#412402",
  ctaHandle: "#633806",
} as const;

export const PILLAR_COLORS = { M: MCE_TPL.gold, C: MCE_TPL.green, E: MCE_TPL.purple } as const;

export type MceCarouselContent = {
  /** Tema base do carrossel. */
  tema: string;
  capa: { tag: string; titulo: string; subtitulo: string };
  dor: { tag: string; titulo: string; impacto: string; corpo: string };
  pilares: {
    M: { frase: string; corpo: string; lista?: string[] };
    C: { frase: string; corpo: string; lista?: string[] };
    E: { frase: string; corpo: string; lista?: string[] };
  };
  integracao: { tag: string; titulo: string; verbos: { M: string; C: string; E: string }; conexao: string };
  handle?: string;
};

export const MCE_CTA_SLIDE = {
  tag: "PRÓXIMO PASSO",
  titulo: "Diagnóstico MCE Gratuito",
  subtitulo: "Descubra qual pilar está travando seu resultado.",
  caixa: "Link na bio",
  caixaSub: "14 perguntas · 4 minutos · resultado imediato",
} as const;

const PILLAR_NAMES = { M: "MENTALIDADE", C: "COMPORTAMENTO", E: "EXECUÇÃO" } as const;
const PILLAR_BG = { M: "#1a1206", C: "#0a1210", E: "#0e0a14" } as const;

const S = 3; // 360px de referência → 1080px reais
const px = (v: number) => v * S;

const font = (weight: number, size: number) =>
  `${weight} ${px(size)}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

type Token = { text: string; hi: boolean };

const tokenize = (text: string): Token[] =>
  text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**")
        ? { text: part.slice(2, -2), hi: true }
        : { text: part, hi: false },
    );

type RichOpts = {
  size: number;
  weight: number;
  color: string;
  accent: string;
  lineHeight: number;
  maxWidth: number;
  hiWeight?: number;
  hiItalic?: boolean;
  align?: "left" | "center";
};

/** Desenha texto com quebra automática e trechos destacados. Retorna o Y final. */
const drawRich = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: RichOpts) => {
  const lh = px(o.size) * o.lineHeight;
  const words: Token[] = [];
  for (const token of tokenize(text)) {
    for (const word of token.text.split(/\s+/)) if (word) words.push({ text: word, hi: token.hi });
  }
  const styleFor = (hi: boolean) =>
    `${hi && o.hiItalic ? "italic " : ""}${hi ? o.hiWeight || o.weight : o.weight} ${px(o.size)}px Inter, system-ui, sans-serif`;

  const lines: Token[][] = [[]];
  let width = 0;
  for (const word of words) {
    ctx.font = styleFor(word.hi);
    const w = ctx.measureText(`${word.text} `).width;
    if (width + w > o.maxWidth && lines[lines.length - 1].length) {
      lines.push([word]);
      width = w;
    } else {
      lines[lines.length - 1].push(word);
      width += w;
    }
  }

  let cursorY = y;
  for (const line of lines) {
    let lineW = 0;
    for (const word of line) {
      ctx.font = styleFor(word.hi);
      lineW += ctx.measureText(`${word.text} `).width;
    }
    let cursorX = o.align === "center" ? x - lineW / 2 : x;
    for (const word of line) {
      ctx.font = styleFor(word.hi);
      ctx.fillStyle = word.hi ? o.accent : o.color;
      ctx.fillText(word.text, cursorX, cursorY);
      cursorX += ctx.measureText(`${word.text} `).width;
    }
    cursorY += lh;
  }
  return cursorY;
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const orb = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) => {
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** Pill de tag no topo. Retorna o Y da base. */
const pill = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: { bg?: string; color: string; border?: string },
) => {
  const label = text.toUpperCase();
  ctx.font = font(700, 8);
  const spacing = px(0.2 * 8);
  const chars = [...label];
  const textW = chars.reduce((sum, c) => sum + ctx.measureText(c).width + spacing, 0);
  const h = px(22);
  const w = textW + px(24);
  roundRect(ctx, x, y, w, h, px(11));
  if (opts.bg) {
    ctx.fillStyle = opts.bg;
    ctx.fill();
  }
  if (opts.border) {
    ctx.lineWidth = px(1);
    ctx.strokeStyle = opts.border;
    ctx.stroke();
  }
  ctx.fillStyle = opts.color;
  ctx.textBaseline = "middle";
  let cx = x + px(12);
  for (const c of chars) {
    ctx.fillText(c, cx, y + h / 2 + px(0.5));
    cx += ctx.measureText(c).width + spacing;
  }
  ctx.textBaseline = "alphabetic";
  return y + h;
};

/** Rodapé fixo — delegado ao SlideBase compartilhado (faixa de 100px na base). */
const footer = (ctx: CanvasRenderingContext2D, w: number, h: number, handle: string, dark = false) =>
  drawSlideFooter(ctx, w, h, handle, {
    ink: dark ? MCE_TPL.bg : MCE_TPL.ink,
    accent: dark ? MCE_TPL.bg : MCE_TPL.gold,
    handleColor: dark ? MCE_TPL.ctaHandle : MCE_TPL.footerMuted,
    background: dark ? MCE_TPL.gold : MCE_TPL.bg,
    scale: S,
  });

const canvasOf = (w: number, h: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  beginSlideContent(ctx, w, h);
  return { canvas, ctx };
};

const pillarSlide = (
  key: "M" | "C" | "E",
  data: { frase: string; corpo: string; lista?: string[] },
  handle: string,
  w: number,
  h: number,
) => {
  const { canvas, ctx } = canvasOf(w, h);
  const color = PILLAR_COLORS[key];
  const grad = ctx.createLinearGradient(0, 0, w * 0.6, h);
  grad.addColorStop(0, MCE_TPL.bg);
  grad.addColorStop(0.6, MCE_TPL.bg);
  grad.addColorStop(1, PILLAR_BG[key]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  orb(ctx, w - px(40), px(30), px(150), color);

  const x = px(28);
  let y = px(80);
  ctx.font = font(900, 52);
  ctx.fillStyle = color;
  ctx.fillText(key, x, y);
  const letterW = ctx.measureText(key).width;

  ctx.font = font(700, 11);
  const nameX = x + letterW + px(14);
  const nameY = y - px(16);
  ctx.fillStyle = color;
  ctx.fillText(PILLAR_NAMES[key], nameX, nameY);
  ctx.fillRect(nameX, nameY + px(10), px(30), px(1.5));

  y += px(56);
  y = drawRich(ctx, data.frase, x, y, {
    size: 20, weight: 300, color: MCE_TPL.ink, accent: color,
    lineHeight: 1.35, maxWidth: w - x * 2, hiWeight: 700, hiItalic: true,
  });

  y += px(24);
  const barTop = y - px(14);
  const bodyEnd = drawRich(ctx, data.corpo, x + px(12), y, {
    size: 11, weight: 300, color: MCE_TPL.muted, accent: color,
    lineHeight: 1.7, maxWidth: w - x * 2 - px(12), hiWeight: 700,
  });
  ctx.fillStyle = `${color}66`;
  ctx.fillRect(x, barTop, px(2), bodyEnd - barTop - px(6));
  y = bodyEnd;

  if (data.lista?.length) {
    y += px(14);
    for (const item of data.lista.slice(0, 4)) {
      ctx.font = font(700, 11);
      ctx.fillStyle = color;
      ctx.fillText("▸", x, y);
      y = drawRich(ctx, item, x + px(16), y, {
        size: 11, weight: 300, color: MCE_TPL.soft, accent: color,
        lineHeight: 1.8, maxWidth: w - x * 2 - px(16), hiWeight: 700,
      });
    }
  }

  footer(ctx, w, h, handle);
  return canvas.toDataURL("image/png");
};

/**
 * Renderiza os 7 slides do template MCE Educacional em 1080x1350.
 * `fotoImg`, quando informado, vira o fundo do slide 1 (capa) — usado pelo
 * "Postar com minha foto" pra colocar a foto real do coach na capa.
 */
export const renderMceCarousel = (
  content: MceCarouselContent,
  fotoImg?: HTMLImageElement | null,
  w = 1080,
  h = 1350,
): string[] => {
  const handle = content.handle?.startsWith("@") ? content.handle : `@${(content.handle || "diogo.mell0").replace("@", "")}`;
  const x = px(28);
  const out: string[] = [];

  // 1 — CAPA
  {
    const { canvas, ctx } = canvasOf(w, h);
    if (fotoImg) {
      const scale = Math.max(w / fotoImg.width, h / fotoImg.height);
      const dw = fotoImg.width * scale;
      const dh = fotoImg.height * scale;
      ctx.drawImage(fotoImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
      const grad = ctx.createLinearGradient(0, h * 0.35, 0, h);
      grad.addColorStop(0, "rgba(10,10,10,0)");
      grad.addColorStop(0.45, "rgba(10,10,10,0.55)");
      grad.addColorStop(1, "rgba(10,10,10,0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = MCE_TPL.bg;
      ctx.fillRect(0, 0, w, h);
      orb(ctx, w - px(30), h - px(40), px(125), MCE_TPL.gold);
    }
    let y = px(64);
    y = pill(ctx, content.capa.tag, x, y, { bg: MCE_TPL.gold, color: MCE_TPL.bg });
    y += px(52);
    y = drawRich(ctx, content.capa.titulo, x, y, {
      size: 26, weight: 900, color: MCE_TPL.ink, accent: MCE_TPL.gold,
      lineHeight: 1.05, maxWidth: w - x * 2, hiWeight: 900,
    });
    y += px(18);
    drawRich(ctx, content.capa.subtitulo, x, y, {
      size: 12, weight: 300, color: MCE_TPL.muted, accent: MCE_TPL.gold,
      lineHeight: 1.6, maxWidth: w - x * 2,
    });
    ctx.font = font(500, 11);
    ctx.fillStyle = MCE_TPL.gold;
    ctx.fillText("ARRASTA PRA ENTENDER ▸", x, slideContentBottom(h) - px(8));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 2 — A DOR
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = MCE_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, px(20), h - px(60), px(125), MCE_TPL.gold);
    let y = px(64);
    y = pill(ctx, content.dor.tag, x, y, { color: MCE_TPL.gold, border: `${MCE_TPL.gold}40` });
    y += px(50);
    y = drawRich(ctx, content.dor.titulo, x, y, {
      size: 20, weight: 300, color: MCE_TPL.ink, accent: MCE_TPL.gold, lineHeight: 1.3, maxWidth: w - x * 2,
    });
    y += px(12);
    y = drawRich(ctx, content.dor.impacto, x, y, {
      size: 24, weight: 900, color: MCE_TPL.gold, accent: MCE_TPL.gold, lineHeight: 1.2, maxWidth: w - x * 2,
    });
    y += px(16);
    ctx.fillStyle = MCE_TPL.gold;
    ctx.fillRect(x, y, px(40), px(1.5));
    y += px(34);
    drawRich(ctx, content.dor.corpo, x, y, {
      size: 12, weight: 300, color: MCE_TPL.muted, accent: MCE_TPL.gold,
      lineHeight: 1.7, maxWidth: w - x * 2, hiWeight: 700,
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 3, 4, 5 — PILARES
  out.push(pillarSlide("M", content.pilares.M, handle, w, h));
  out.push(pillarSlide("C", content.pilares.C, handle, w, h));
  out.push(pillarSlide("E", content.pilares.E, handle, w, h));

  // 6 — INTEGRAÇÃO
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = MCE_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(20), h / 2, px(140), MCE_TPL.gold);
    let y = px(64);
    y = pill(ctx, content.integracao.tag, x, y, {
      bg: `${MCE_TPL.gold}20`, color: MCE_TPL.gold, border: `${MCE_TPL.gold}40`,
    });
    y += px(50);
    y = drawRich(ctx, content.integracao.titulo, x, y, {
      size: 18, weight: 900, color: MCE_TPL.ink, accent: MCE_TPL.gold, lineHeight: 1.25, maxWidth: w - x * 2,
    });

    y += px(30);
    const gap = px(10);
    const cardW = (w - x * 2 - gap * 2) / 3;
    const cardH = px(112);
    (["M", "C", "E"] as const).forEach((key, i) => {
      const color = PILLAR_COLORS[key];
      const cx = x + i * (cardW + gap);
      roundRect(ctx, cx, y, cardW, cardH, px(10));
      ctx.fillStyle = `${color}26`;
      ctx.fill();
      ctx.lineWidth = px(1);
      ctx.strokeStyle = `${color}4D`;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = color;
      ctx.font = font(900, 28);
      ctx.fillText(key, cx + cardW / 2, y + px(42));
      ctx.font = font(700, 8);
      ctx.fillText(PILLAR_NAMES[key], cx + cardW / 2, y + px(62));
      ctx.font = font(300, 9);
      ctx.fillStyle = MCE_TPL.soft;
      ctx.fillText(content.integracao.verbos[key], cx + cardW / 2, y + px(84));
      ctx.textAlign = "left";
    });

    y += cardH + px(46);
    drawRich(ctx, content.integracao.conexao, w / 2, y, {
      size: 11, weight: 300, color: MCE_TPL.muted, accent: MCE_TPL.gold,
      lineHeight: 1.8, maxWidth: w - x * 2, hiWeight: 700, align: "center",
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 7 — CTA (fixo)
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = MCE_TPL.gold;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(30), h - px(40), px(125), "#0A0A0A");
    let y = px(64);
    y = pill(ctx, MCE_CTA_SLIDE.tag, x, y, { bg: MCE_TPL.bg, color: MCE_TPL.gold });
    y += px(56);
    ctx.font = font(900, 24);
    ctx.fillStyle = MCE_TPL.bg;
    y = drawRich(ctx, MCE_CTA_SLIDE.titulo, x, y, {
      size: 24, weight: 900, color: MCE_TPL.bg, accent: MCE_TPL.bg, lineHeight: 1.15, maxWidth: w - x * 2,
    });
    y += px(14);
    y = drawRich(ctx, MCE_CTA_SLIDE.subtitulo, x, y, {
      size: 13, weight: 400, color: MCE_TPL.ctaSub, accent: MCE_TPL.ctaSub, lineHeight: 1.5, maxWidth: w - x * 2,
    });

    y += px(28);
    const boxH = px(58);
    roundRect(ctx, x, y, w - x * 2, boxH, px(8));
    ctx.fillStyle = MCE_TPL.bg;
    ctx.fill();
    ctx.font = font(700, 14);
    ctx.fillStyle = MCE_TPL.gold;
    ctx.fillText(MCE_CTA_SLIDE.caixa, x + px(16), y + px(26));
    ctx.font = font(400, 10);
    ctx.fillStyle = MCE_TPL.muted;
    ctx.fillText(MCE_CTA_SLIDE.caixaSub, x + px(16), y + px(44));

    footer(ctx, w, h, handle, true);
    out.push(canvas.toDataURL("image/png"));
  }

  return out;
};
