/**
 * Template genérico "Criar conteúdo por módulo" — carrossel 1080x1350 na
 * identidade nutriON. Recebe slides normalizados (tag, título, corpo, dados,
 * destaque) e desenha sem nunca invadir a faixa do rodapé (slideBase).
 */

import {
  SLIDE_H,
  SLIDE_PAD_X,
  SLIDE_W,
  beginSlideContent,
  drawSlideFooter,
  slideContentBottom,
} from "@/lib/slideBase";

export const MOD_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#888888",
  soft: "#CCCCCC",
  gold: "#EF9F27",
  green: "#5DCAA5",
  purple: "#AFA9EC",
} as const;

export type ModuleSlide = {
  tipo?: "capa" | "conteudo" | "dados" | "comparativo" | "dica" | "cta" | string;
  tag?: string;
  titulo?: string;
  corpo?: string;
  dados?: { label: string; valor: string }[];
  destaque?: string;
};

const font = (weight: number, size: number, italic = false) =>
  `${italic ? "italic " : ""}${weight} ${size}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  for (const paragraph of String(text || "").split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    lines.push(line);
  }
  return lines.filter((l, i, arr) => l !== "" || i < arr.length - 1);
};

const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  o: { size: number; weight: number; color: string; lineHeight: number; maxWidth: number },
) => {
  ctx.font = font(o.weight, o.size);
  ctx.fillStyle = o.color;
  const lines = wrap(ctx, text, o.maxWidth);
  let cursor = y;
  for (const line of lines) {
    if (cursor > slideContentBottom()) break;
    ctx.fillText(line, x, cursor);
    cursor += o.lineHeight;
  }
  return cursor;
};

const accentFor = (tipo?: string) =>
  tipo === "dados" ? MOD_TPL.green : tipo === "comparativo" ? MOD_TPL.purple : MOD_TPL.gold;

const renderSlide = (slide: ModuleSlide, index: number, total: number, handle: string, titulo: string) => {
  const cta = slide.tipo === "cta";
  const bg = cta ? MOD_TPL.gold : MOD_TPL.bg;
  const canvas = document.createElement("canvas");
  canvas.width = SLIDE_W;
  canvas.height = SLIDE_H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SLIDE_W, SLIDE_H);

  beginSlideContent(ctx, SLIDE_W, SLIDE_H);

  const x = SLIDE_PAD_X;
  const maxW = SLIDE_W - SLIDE_PAD_X * 2;
  const accent = cta ? "#412402" : accentFor(slide.tipo);
  const ink = cta ? "#0A0A0A" : MOD_TPL.ink;
  const soft = cta ? "#412402" : MOD_TPL.soft;

  // Cabeçalho do módulo
  ctx.font = font(700, 26);
  ctx.fillStyle = cta ? "#633806" : MOD_TPL.gold;
  ctx.fillText(titulo.toUpperCase(), x, 110);
  ctx.font = font(500, 24);
  ctx.fillStyle = cta ? "#633806" : MOD_TPL.muted;
  ctx.textAlign = "right";
  ctx.fillText(`${index + 1}/${total}`, SLIDE_W - x, 110);
  ctx.textAlign = "left";

  let y = 230;

  if (slide.tag) {
    ctx.font = font(800, 26);
    ctx.fillStyle = accent;
    ctx.fillText(slide.tag.toUpperCase(), x, y);
    y += 60;
  }

  if (slide.titulo) {
    const size = slide.tipo === "capa" ? 84 : 62;
    y = drawText(ctx, slide.titulo, x, y + size * 0.4, {
      size,
      weight: 900,
      color: ink,
      lineHeight: size * 1.12,
      maxWidth: maxW,
    });
    y += 24;
  }

  if (slide.destaque) {
    ctx.font = font(900, 96);
    ctx.fillStyle = accent;
    ctx.fillText(String(slide.destaque).slice(0, 18), x, y + 70);
    y += 140;
  }

  if (slide.corpo) {
    y = drawText(ctx, slide.corpo, x, y + 20, {
      size: 38,
      weight: 400,
      color: soft,
      lineHeight: 58,
      maxWidth: maxW,
    });
    y += 24;
  }

  for (const item of slide.dados || []) {
    if (y + 110 > slideContentBottom()) break;
    ctx.fillStyle = cta ? "rgba(10,10,10,0.08)" : "rgba(255,255,255,0.04)";
    ctx.fillRect(x, y, maxW, 96);
    ctx.fillStyle = accent;
    ctx.fillRect(x, y, 6, 96);
    ctx.font = font(600, 26);
    ctx.fillStyle = cta ? "#633806" : MOD_TPL.muted;
    ctx.fillText(String(item.label || "").toUpperCase().slice(0, 42), x + 32, y + 40);
    ctx.font = font(800, 38);
    ctx.fillStyle = ink;
    ctx.fillText(String(item.valor || "").slice(0, 40), x + 32, y + 80);
    y += 116;
  }

  drawSlideFooter(ctx, SLIDE_W, SLIDE_H, handle, {
    ink: cta ? "#0A0A0A" : MOD_TPL.ink,
    accent: cta ? "#633806" : MOD_TPL.gold,
    handleColor: cta ? "#633806" : "#666666",
    background: bg,
  });

  return canvas.toDataURL("image/png");
};

export const renderModuleCarousel = (slides: ModuleSlide[], handle: string, tituloModulo: string): string[] =>
  slides.map((s, i) => renderSlide(s, i, slides.length, handle.replace("@", ""), tituloModulo));
