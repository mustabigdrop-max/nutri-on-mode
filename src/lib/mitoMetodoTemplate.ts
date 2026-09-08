/**
 * Template proprietário "MITO OU MÉTODO" — carrossel fixo de 8 slides 4:5
 * (1080 x 1350). Estrutura: capa com a crença, 4 evidências, veredito,
 * alternativa prática e CTA fixo. Sem emoji.
 */

import { beginSlideContent, drawSlideFooter, slideContentBottom } from "@/lib/slideBase";

export const MM_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#8A8A8A",
  soft: "#CCCCCC",
  gold: "#EF9F27",
  green: "#5DCAA5",
  red: "#E24B4A",
  ctaSub: "#412402",
  ctaHandle: "#633806",
} as const;

export type Veredito = "MITO" | "MÉTODO" | "DEPENDE";

export type MitoMetodoContent = {
  crenca: string;
  veredito: Veredito;
  evidencias: { titulo: string; corpo: string }[];
  explicacao: string;
  alternativa: string[];
  handle?: string;
};

const S = 3;
const px = (v: number) => v * S;
const font = (weight: number, size: number, italic = false) =>
  `${italic ? "italic " : ""}${weight} ${px(size)}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

const vereditoColor = (v: Veredito) => (v === "MITO" ? MM_TPL.red : v === "MÉTODO" ? MM_TPL.green : MM_TPL.gold);

const canvasOf = (w: number, h: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  beginSlideContent(ctx, w, h);
  return { canvas, ctx };
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
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** Texto com quebra automática. Retorna o Y final. */
const wrap = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  o: { size: number; weight: number; color: string; lineHeight: number; maxWidth: number; italic?: boolean },
) => {
  ctx.font = font(o.weight, o.size, o.italic);
  ctx.fillStyle = o.color;
  const lh = px(o.size) * o.lineHeight;
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let cursor = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > o.maxWidth && line) {
      ctx.fillText(line, x, cursor);
      cursor += lh;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursor);
    cursor += lh;
  }
  return cursor;
};

const badge = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, filled = true) => {
  ctx.font = font(700, 9);
  const w = ctx.measureText(text.toUpperCase()).width + px(24);
  const h = px(24);
  roundRect(ctx, x, y, w, h, px(12));
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.lineWidth = px(1);
    ctx.strokeStyle = `${color}66`;
    ctx.stroke();
  }
  ctx.fillStyle = filled ? MM_TPL.bg : color;
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), x + px(12), y + h / 2 + px(0.5));
  ctx.textBaseline = "alphabetic";
  return y + h;
};

/** Rodapé fixo — delegado ao SlideBase compartilhado (faixa de 100px na base). */
const footer = (ctx: CanvasRenderingContext2D, w: number, h: number, handle: string, dark = false) =>
  drawSlideFooter(ctx, w, h, handle, {
    ink: dark ? "#0A0A0A" : MM_TPL.ink,
    accent: dark ? "#0A0A0A" : MM_TPL.gold,
    handleColor: dark ? MM_TPL.ctaHandle : "#666666",
    background: dark ? MM_TPL.gold : MM_TPL.bg,
    scale: S,
  });

/** Renderiza os 8 slides do template MITO OU MÉTODO em 1080x1350. */
export const renderMitoMetodo = (content: MitoMetodoContent, w = 1080, h = 1350): string[] => {
  const handle = content.handle?.startsWith("@")
    ? content.handle
    : `@${(content.handle || "diogo.mell0").replace("@", "")}`;
  const x = px(28);
  const maxW = w - x * 2;
  const cor = vereditoColor(content.veredito);
  const out: string[] = [];

  // 1 — CAPA
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = MM_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(30), h - px(40), px(130), cor);
    let y = px(64);
    y = badge(ctx, "Mito ou Método", x, y, MM_TPL.gold);
    y += px(60);
    y = wrap(ctx, `"${content.crenca}"`, x, y, {
      size: 26, weight: 900, color: MM_TPL.ink, lineHeight: 1.12, maxWidth: maxW,
    });
    y += px(24);
    ctx.font = font(700, 11);
    ctx.fillStyle = MM_TPL.muted;
    ctx.fillText("VEREDITO NO ÚLTIMO SLIDE", x, y);
    ctx.font = font(500, 11);
    ctx.fillStyle = MM_TPL.gold;
    ctx.fillText("ARRASTA PRA VER A EVIDÊNCIA ▸", x, slideContentBottom(h) - px(8));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 2 a 5 — EVIDÊNCIAS
  const evid = [...content.evidencias].slice(0, 4);
  while (evid.length < 4) evid.push({ titulo: "O que a prática mostra", corpo: content.explicacao });
  evid.forEach((e, i) => {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = MM_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, i % 2 ? px(20) : w - px(20), px(40) + i * px(60), px(130), cor);
    let y = px(64);
    y = badge(ctx, `Evidência ${i + 1} de 4`, x, y, cor, false);
    y += px(52);
    y = wrap(ctx, e.titulo, x, y, { size: 21, weight: 900, color: MM_TPL.ink, lineHeight: 1.2, maxWidth: maxW });
    y += px(18);
    ctx.fillStyle = `${cor}88`;
    const barTop = y - px(14);
    const end = wrap(ctx, e.corpo, x + px(14), y, {
      size: 12, weight: 300, color: MM_TPL.soft, lineHeight: 1.7, maxWidth: maxW - px(14),
    });
    ctx.fillRect(x, barTop, px(2), end - barTop - px(8));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  });

  // 6 — VEREDITO
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = MM_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w / 2, h / 2, px(180), cor);
    let y = px(64);
    y = badge(ctx, "Veredito", x, y, cor);
    y += px(90);
    ctx.font = font(900, 64);
    ctx.fillStyle = cor;
    ctx.fillText(content.veredito, x, y);
    y += px(30);
    ctx.fillStyle = cor;
    ctx.fillRect(x, y, px(60), px(3));
    y += px(50);
    wrap(ctx, content.explicacao, x, y, {
      size: 13, weight: 300, color: MM_TPL.soft, lineHeight: 1.7, maxWidth: maxW,
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 7 — ALTERNATIVA PRÁTICA
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = MM_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, px(20), h - px(60), px(140), MM_TPL.green);
    let y = px(64);
    y = badge(ctx, "O que fazer no lugar", x, y, MM_TPL.green);
    y += px(56);
    y = wrap(ctx, "Troque a crença por protocolo.", x, y, {
      size: 22, weight: 900, color: MM_TPL.ink, lineHeight: 1.2, maxWidth: maxW,
    });
    y += px(26);
    for (const item of content.alternativa.slice(0, 4)) {
      ctx.font = font(700, 12);
      ctx.fillStyle = MM_TPL.green;
      ctx.fillText("▸", x, y);
      y = wrap(ctx, item, x + px(18), y, {
        size: 12, weight: 300, color: MM_TPL.soft, lineHeight: 1.7, maxWidth: maxW - px(18),
      });
      y += px(10);
    }
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 8 — CTA (fixo)
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = MM_TPL.gold;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(30), h - px(40), px(125), "#0A0A0A");
    let y = px(64);
    y = badge(ctx, "Próximo passo", x, y, MM_TPL.bg);
    y += px(60);
    y = wrap(ctx, "Diagnóstico MCE Gratuito", x, y, {
      size: 24, weight: 900, color: MM_TPL.bg, lineHeight: 1.15, maxWidth: maxW,
    });
    y += px(10);
    y = wrap(ctx, "Descubra qual pilar está travando seu resultado.", x, y, {
      size: 13, weight: 400, color: MM_TPL.ctaSub, lineHeight: 1.5, maxWidth: maxW,
    });
    y += px(24);
    const boxH = px(58);
    roundRect(ctx, x, y, maxW, boxH, px(8));
    ctx.fillStyle = MM_TPL.bg;
    ctx.fill();
    ctx.font = font(700, 14);
    ctx.fillStyle = MM_TPL.gold;
    ctx.fillText("Link na bio", x + px(16), y + px(26));
    ctx.font = font(400, 10);
    ctx.fillStyle = MM_TPL.muted;
    ctx.fillText("14 perguntas · 4 minutos · resultado na hora", x + px(16), y + px(44));
    footer(ctx, w, h, handle, true);
    out.push(canvas.toDataURL("image/png"));
  }

  return out;
};
