/**
 * Carrossel "REFEIÇÃO + CIÊNCIA" — 9 slides 1080x1350 na identidade nutriON.
 * Capa com a foto real do prato; os demais slides usam os dados REAIS do
 * NutriPlan/NutrySync e a ciência curada por alimento. Rodapé fixo via
 * `slideBase` — o conteúdo nunca invade a assinatura.
 */

import {
  SLIDE_W,
  SLIDE_H,
  SLIDE_PAD_X,
  beginSlideContent,
  createSlideCanvas,
  drawSlideFooter,
  slideContentBottom,
} from "@/lib/slideBase";

export const REF_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#888888",
  soft: "#CCCCCC",
  gold: "#EF9F27",
  green: "#5DCAA5",
  purple: "#AFA9EC",
} as const;

export type RefeicaoSlide =
  | { tipo: "CAPA"; tag: string; titulo: string; subtitulo?: string }
  | { tipo: "FICHA"; tag: string; titulo: string; linhas: { label: string; valor: string }[]; nota?: string }
  | { tipo: "LISTA"; tag: string; titulo: string; itens: { titulo: string; sub?: string }[]; nota?: string }
  | {
      tipo: "CIENCIA";
      tag: string;
      alimento: string;
      nutriente: string;
      mecanismo: string;
      dado?: string;
      bonus?: string;
      fonte?: string;
    }
  | { tipo: "TEXTO"; tag: string; titulo: string; corpo?: string; bullets?: string[] }
  | { tipo: "CTA"; tag: string; titulo: string; subtitulo: string; caixa: string; caixaSub: string };

const S = 3;
const px = (v: number) => v * S;
const font = (weight: number | string, size: number) =>
  `${weight} ${px(size)}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const wrap = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
): number => {
  const words = (text || "").split(/\s+/).filter(Boolean);
  let line = "";
  let cursor = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cursor);
      cursor += lh;
      line = w;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, cursor);
  return cursor;
};

const drawCoverPhoto = (ctx: CanvasRenderingContext2D, photo: HTMLImageElement) => {
  const scale = Math.max(SLIDE_W / photo.width, SLIDE_H / photo.height);
  const dw = photo.width * scale;
  const dh = photo.height * scale;
  ctx.drawImage(photo, (SLIDE_W - dw) / 2, (SLIDE_H - dh) / 2, dw, dh);
  const g = ctx.createLinearGradient(0, SLIDE_H * 0.25, 0, SLIDE_H);
  g.addColorStop(0, "rgba(10,10,10,0.15)");
  g.addColorStop(0.5, "rgba(10,10,10,0.65)");
  g.addColorStop(1, "rgba(10,10,10,0.96)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SLIDE_W, SLIDE_H);
};

const drawTag = (ctx: CanvasRenderingContext2D, texto: string, cor: string, y = px(58)) => {
  ctx.font = font(700, 11);
  ctx.fillStyle = cor;
  ctx.fillText((texto || "").toUpperCase(), SLIDE_PAD_X, y);
};

const renderSlide = (slide: RefeicaoSlide, handle: string, photo?: HTMLImageElement | null): string => {
  const isCta = slide.tipo === "CTA";
  const { canvas, ctx } = createSlideCanvas(SLIDE_W, SLIDE_H, isCta ? REF_TPL.gold : REF_TPL.bg);
  ctx.textAlign = "left";

  if (slide.tipo === "CAPA" && photo) drawCoverPhoto(ctx, photo);

  if (!isCta && slide.tipo !== "CAPA") {
    const g = ctx.createRadialGradient(SLIDE_W * 0.9, px(60), 0, SLIDE_W * 0.9, px(60), SLIDE_W);
    g.addColorStop(0, "rgba(93,202,165,0.10)");
    g.addColorStop(1, "rgba(93,202,165,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SLIDE_W, SLIDE_H);
  }

  beginSlideContent(ctx, SLIDE_W, SLIDE_H);
  const maxW = SLIDE_W - SLIDE_PAD_X * 2;

  if (slide.tipo === "CAPA") {
    drawTag(ctx, slide.tag, REF_TPL.gold, px(70));
    ctx.font = font(800, 40);
    ctx.fillStyle = REF_TPL.ink;
    let y = wrap(ctx, slide.titulo, SLIDE_PAD_X, px(300), maxW, px(48));
    if (slide.subtitulo) {
      ctx.font = font(500, 18);
      ctx.fillStyle = REF_TPL.gold;
      y = wrap(ctx, slide.subtitulo, SLIDE_PAD_X, y + px(52), maxW, px(26));
    }
  }

  if (slide.tipo === "FICHA") {
    drawTag(ctx, slide.tag, REF_TPL.gold);
    ctx.font = font(800, 32);
    ctx.fillStyle = REF_TPL.ink;
    let y = wrap(ctx, slide.titulo, SLIDE_PAD_X, px(140), maxW, px(40)) + px(60);
    for (const l of slide.linhas.slice(0, 7)) {
      roundRect(ctx, SLIDE_PAD_X, y - px(26), maxW, px(46), px(10));
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fill();
      ctx.font = font(500, 15);
      ctx.fillStyle = REF_TPL.muted;
      ctx.fillText(l.label.toUpperCase(), SLIDE_PAD_X + px(16), y + px(4));
      ctx.font = font(800, 18);
      ctx.fillStyle = REF_TPL.gold;
      ctx.textAlign = "right";
      ctx.fillText(l.valor, SLIDE_W - SLIDE_PAD_X - px(16), y + px(4));
      ctx.textAlign = "left";
      y += px(58);
    }
    if (slide.nota) {
      ctx.font = font(400, 14);
      ctx.fillStyle = REF_TPL.soft;
      wrap(ctx, slide.nota, SLIDE_PAD_X, y + px(24), maxW, px(22));
    }
  }

  if (slide.tipo === "LISTA") {
    drawTag(ctx, slide.tag, REF_TPL.green);
    ctx.font = font(800, 30);
    ctx.fillStyle = REF_TPL.ink;
    let y = wrap(ctx, slide.titulo, SLIDE_PAD_X, px(140), maxW, px(38)) + px(56);
    for (const it of slide.itens.slice(0, 7)) {
      ctx.fillStyle = REF_TPL.green;
      ctx.fillRect(SLIDE_PAD_X, y - px(10), px(4), px(4));
      ctx.font = font(700, 19);
      ctx.fillStyle = REF_TPL.ink;
      y = wrap(ctx, it.titulo, SLIDE_PAD_X + px(18), y, maxW - px(18), px(26));
      if (it.sub) {
        ctx.font = font(400, 14);
        ctx.fillStyle = REF_TPL.muted;
        y = wrap(ctx, it.sub, SLIDE_PAD_X + px(18), y + px(22), maxW - px(18), px(20));
      }
      y += px(40);
    }
    if (slide.nota) {
      ctx.font = font(400, 14);
      ctx.fillStyle = REF_TPL.soft;
      wrap(ctx, slide.nota, SLIDE_PAD_X, y + px(10), maxW, px(22));
    }
  }

  if (slide.tipo === "CIENCIA") {
    drawTag(ctx, slide.tag, REF_TPL.green);
    ctx.font = font(800, 34);
    ctx.fillStyle = REF_TPL.ink;
    let y = wrap(ctx, slide.alimento, SLIDE_PAD_X, px(150), maxW, px(42)) + px(48);
    ctx.font = font(700, 18);
    ctx.fillStyle = REF_TPL.green;
    y = wrap(ctx, slide.nutriente, SLIDE_PAD_X, y, maxW, px(26)) + px(44);
    ctx.font = font(500, 19);
    ctx.fillStyle = REF_TPL.soft;
    y = wrap(ctx, slide.mecanismo, SLIDE_PAD_X, y, maxW, px(28)) + px(52);
    if (slide.dado) {
      roundRect(ctx, SLIDE_PAD_X, y - px(34), maxW, px(96), px(12));
      ctx.fillStyle = "rgba(239,159,39,0.10)";
      ctx.fill();
      ctx.font = font(700, 18);
      ctx.fillStyle = REF_TPL.gold;
      y = wrap(ctx, slide.dado, SLIDE_PAD_X + px(18), y, maxW - px(36), px(26)) + px(70);
    }
    if (slide.bonus) {
      ctx.font = font(500, 16);
      ctx.fillStyle = REF_TPL.purple;
      y = wrap(ctx, slide.bonus, SLIDE_PAD_X, y, maxW, px(24)) + px(40);
    }
    if (slide.fonte) {
      ctx.font = font(400, 12);
      ctx.fillStyle = REF_TPL.muted;
      wrap(ctx, slide.fonte, SLIDE_PAD_X, y, maxW, px(18));
    }
  }

  if (slide.tipo === "TEXTO") {
    drawTag(ctx, slide.tag, REF_TPL.purple);
    ctx.font = font(800, 32);
    ctx.fillStyle = REF_TPL.ink;
    let y = wrap(ctx, slide.titulo, SLIDE_PAD_X, px(150), maxW, px(40)) + px(56);
    if (slide.corpo) {
      ctx.font = font(500, 18);
      ctx.fillStyle = REF_TPL.soft;
      y = wrap(ctx, slide.corpo, SLIDE_PAD_X, y, maxW, px(28)) + px(52);
    }
    for (const b of (slide.bullets || []).slice(0, 6)) {
      ctx.fillStyle = REF_TPL.gold;
      ctx.fillRect(SLIDE_PAD_X, y - px(9), px(4), px(4));
      ctx.font = font(500, 17);
      ctx.fillStyle = REF_TPL.ink;
      y = wrap(ctx, b, SLIDE_PAD_X + px(18), y, maxW - px(18), px(24)) + px(38);
    }
  }

  if (slide.tipo === "CTA") {
    ctx.font = font(700, 11);
    ctx.fillStyle = "#633806";
    ctx.fillText(slide.tag.toUpperCase(), SLIDE_PAD_X, px(58));
    ctx.font = font(800, 38);
    ctx.fillStyle = "#0A0A0A";
    let y = wrap(ctx, slide.titulo, SLIDE_PAD_X, px(220), maxW, px(46)) + px(50);
    ctx.font = font(500, 19);
    ctx.fillStyle = "#412402";
    y = wrap(ctx, slide.subtitulo, SLIDE_PAD_X, y, maxW, px(28)) + px(70);
    roundRect(ctx, SLIDE_PAD_X, y - px(38), maxW, px(110), px(14));
    ctx.fillStyle = "rgba(10,10,10,0.12)";
    ctx.fill();
    ctx.font = font(800, 24);
    ctx.fillStyle = "#0A0A0A";
    ctx.fillText(slide.caixa, SLIDE_PAD_X + px(20), y + px(2));
    ctx.font = font(500, 14);
    ctx.fillStyle = "#412402";
    ctx.fillText(slide.caixaSub, SLIDE_PAD_X + px(20), y + px(34));
  }

  drawSlideFooter(ctx, SLIDE_W, SLIDE_H, handle || "diogo.mell0", {
    ink: isCta ? "#0A0A0A" : REF_TPL.ink,
    accent: isCta ? "#412402" : REF_TPL.gold,
    handleColor: isCta ? "#633806" : "#666666",
    background: isCta ? REF_TPL.gold : REF_TPL.bg,
    scale: S,
  });
  void slideContentBottom(SLIDE_H);
  return canvas.toDataURL("image/png");
};

export const renderRefeicaoCarousel = (
  slides: RefeicaoSlide[],
  handle = "diogo.mell0",
  photo?: HTMLImageElement | null,
): string[] => slides.map((s) => renderSlide(s, handle, photo)).filter(Boolean);
