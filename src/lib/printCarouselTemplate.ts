/**
 * Carrossel e Stories "TELA DO nutriON" — o coach sobe uma captura como fonte
 * e o sistema reconstrói o conteúdo em uma composição editorial. A imagem é
 * tratada e recortada, sem celular, moldura ou aparência de screenshot.
 *
 * Nada é inventado aqui: os textos vêm da leitura do próprio print e os
 * recortes usam a posição vertical devolvida na análise.
 */

import {
  SLIDE_W,
  SLIDE_H,
  SLIDE_PAD_X,
  beginSlideContent,
  createSlideCanvas,
  drawSlideFooter,
  guardTextBounds,
} from "@/lib/slideBase";
import { W as STORY_W, H as STORY_H } from "@/lib/photoStoryTemplates";

export const PRINT_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#888888",
  soft: "#CCCCCC",
  gold: "#EF9F27",
  green: "#5DCAA5",
  purple: "#AFA9EC",
} as const;

export type PrintElemento = {
  elemento?: string;
  descricao?: string;
  posicao_y_percentual?: number;
  destaque?: string;
  lado_anotacao?: string;
};

export type PrintZoom = {
  titulo?: string;
  area_recorte?: string;
  posicao_y_percentual?: number;
  explicacao?: string;
  comparativo?: string;
};

export type PrintStoryFrame = {
  tipo?: string;
  texto?: string;
  subtexto?: string;
  cta?: string;
  posicao_y_percentual?: number;
};

export type PrintAnalise = {
  tipo_tela?: string;
  titulo_tela?: string;
  elementos_visiveis?: PrintElemento[];
  gancho_slide1?: string;
  subtexto_slide1?: string;
  slides_zoom?: PrintZoom[];
  comparativo?: { outros_apps?: string[]; nutrion?: string[] };
  stories?: PrintStoryFrame[];
  reels?: { hook?: string; cortes?: { segundo?: string; texto_tela?: string; acao?: string }[] };
  dados_extraidos?: { exercicios?: string[]; macros?: string; calorias?: string; treino_nome?: string };
  legenda?: string;
  self_comment?: string;
  hashtags_top5?: string[];
};

const S = 3;
const px = (v: number) => v * S;
const font = (weight: number | string, size: number) =>
  `${weight} ${size}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

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
  maxLines = 20,
): number => {
  const words = (text || "").split(/\s+/).filter(Boolean);
  let line = "";
  let cursor = y;
  let lines = 0;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cursor);
      lines += 1;
      if (lines >= maxLines) return cursor;
      cursor += lh;
      line = w;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, cursor);
  return cursor;
};

/** Textura molecular discreta do fundo — pontos e linhas finas. */
const drawTextura = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const g = ctx.createRadialGradient(w * 0.85, h * 0.12, 0, w * 0.85, h * 0.12, w);
  g.addColorStop(0, "rgba(239,159,39,0.10)");
  g.addColorStop(1, "rgba(239,159,39,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  for (let i = 0; i < 60; i += 1) {
    const x = (i * 137.5) % w;
    const y = (i * 311.7) % h;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawTagPill = (
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  cor: string = PRINT_TPL.gold,
) => {
  ctx.font = font(700, px(11));
  const w = ctx.measureText(texto.toUpperCase()).width + px(28);
  roundRect(ctx, x, y, w, px(34), px(17));
  ctx.fillStyle = `${cor}1F`;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `${cor}66`;
  ctx.stroke();
  ctx.fillStyle = cor;
  ctx.fillText(texto.toUpperCase(), x + px(14), y + px(22));
};

/** Usa a captura como textura tratada, nunca como um print literal. */
const drawImageBackdrop = (
  ctx: CanvasRenderingContext2D,
  print: HTMLImageElement,
  w: number,
  h: number,
  opacity = 0.3,
) => {
  const scale = Math.max(w / print.width, h / print.height);
  const dw = print.width * scale;
  const dh = print.height * scale;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.filter = `blur(${px(14)}px) saturate(1.35) contrast(1.1)`;
  ctx.drawImage(print, (w - dw) / 2, (h - dh) / 2, dw, dh);
  ctx.restore();
  const veil = ctx.createLinearGradient(0, 0, 0, h);
  veil.addColorStop(0, "rgba(10,10,10,0.15)");
  veil.addColorStop(0.52, "rgba(10,10,10,0.72)");
  veil.addColorStop(1, "rgba(10,10,10,0.98)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, w, h);
};

const drawFeatureList = (ctx: CanvasRenderingContext2D, itens: PrintElemento[], y0: number, maxW: number) => {
  itens.filter((item) => item.elemento).slice(0, 3).forEach((item, index) => {
    const y = y0 + index * px(104);
    ctx.fillStyle = index === 0 ? PRINT_TPL.gold : index === 1 ? PRINT_TPL.green : PRINT_TPL.purple;
    ctx.fillRect(SLIDE_PAD_X, y, px(5), px(70));
    ctx.font = font(800, px(17));
    ctx.fillStyle = PRINT_TPL.ink;
    ctx.fillText(item.elemento || "", SLIDE_PAD_X + px(22), y + px(22));
    ctx.font = font(400, px(13));
    ctx.fillStyle = PRINT_TPL.soft;
    wrap(ctx, item.destaque || item.descricao || "", SLIDE_PAD_X + px(22), y + px(48), maxW - px(22), px(18), 2);
  });
};

/** Recorta uma faixa horizontal do print centrada na fração vertical pedida. */
const drawRecorte = (
  ctx: CanvasRenderingContext2D,
  print: HTMLImageElement,
  frac: number,
  x: number,
  y: number,
  w: number,
  h: number,
) => {
  const bandaFrac = 0.3;
  const sh = print.height * bandaFrac;
  const sy = Math.min(print.height - sh, Math.max(0, print.height * frac - sh / 2));
  const escala = Math.max(w / print.width, h / sh);
  const dw = print.width * escala;
  const dh = sh * escala;

  ctx.save();
  roundRect(ctx, x, y, w, h, px(18));
  ctx.clip();
  ctx.drawImage(print, 0, sy, print.width, sh, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(239,159,39,0.45)";
  roundRect(ctx, x, y, w, h, px(18));
  ctx.stroke();
};

type PrintSlide =
  | { tipo: "CAPA" }
  | { tipo: "ZOOM"; zoom: PrintZoom; indice: number }
  | { tipo: "COMPARATIVO" }
  | { tipo: "CTA" };

const renderSlide = (
  slide: PrintSlide,
  analise: PrintAnalise,
  print: HTMLImageElement,
  handle: string,
): string => {
  const isCta = slide.tipo === "CTA";
  const { canvas, ctx } = createSlideCanvas(SLIDE_W, SLIDE_H, isCta ? PRINT_TPL.gold : PRINT_TPL.bg);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  if (!isCta) {
    if (slide.tipo === "CAPA") drawImageBackdrop(ctx, print, SLIDE_W, SLIDE_H, 0.42);
    drawTextura(ctx, SLIDE_W, SLIDE_H);
  }

  beginSlideContent(ctx, SLIDE_W, SLIDE_H);
  const maxW = SLIDE_W - SLIDE_PAD_X * 2;
  const tela = (analise.titulo_tela || analise.tipo_tela || "nutriON").toUpperCase();

  if (slide.tipo === "CAPA") {
    drawTagPill(ctx, `nutriON · ${tela}`, SLIDE_PAD_X, px(50));
    ctx.font = font(800, px(43));
    ctx.fillStyle = PRINT_TPL.ink;
    const base = wrap(ctx, analise.gancho_slide1 || tela, SLIDE_PAD_X, px(250), maxW, px(50), 3);
    if (analise.subtexto_slide1) {
      ctx.font = font(500, px(18));
      ctx.fillStyle = PRINT_TPL.gold;
      wrap(ctx, analise.subtexto_slide1, SLIDE_PAD_X, base + px(34), maxW, px(25), 2);
    }
    drawFeatureList(ctx, analise.elementos_visiveis || [], px(600), maxW);
    ctx.font = font(600, px(14));
    ctx.fillStyle = PRINT_TPL.gold;
    ctx.fillText("ARRASTA PRA VER OS DETALHES ▸", SLIDE_PAD_X, px(1060));
  }

  if (slide.tipo === "ZOOM") {
    const { zoom, indice } = slide;
    drawTagPill(ctx, `zoom ${indice + 1}`, SLIDE_PAD_X, px(50), PRINT_TPL.green);
    ctx.font = font(800, px(30));
    ctx.fillStyle = PRINT_TPL.ink;
    let y = wrap(ctx, zoom.titulo || "Detalhe da experiência", SLIDE_PAD_X, px(160), maxW, px(38), 2) + px(44);

    const frac = Math.min(0.92, Math.max(0.08, Number(zoom.posicao_y_percentual) || (indice + 1) / 5));
    drawRecorte(ctx, print, frac, SLIDE_PAD_X, y, maxW, px(220));
    const wash = ctx.createLinearGradient(SLIDE_PAD_X, y, SLIDE_W - SLIDE_PAD_X, y + px(220));
    wash.addColorStop(0, "rgba(10,10,10,0.28)");
    wash.addColorStop(1, "rgba(10,10,10,0.78)");
    ctx.fillStyle = wash;
    roundRect(ctx, SLIDE_PAD_X, y, maxW, px(220), px(18));
    ctx.fill();
    ctx.font = font(800, px(24));
    ctx.fillStyle = PRINT_TPL.ink;
    wrap(ctx, zoom.area_recorte || zoom.titulo || "", SLIDE_PAD_X + px(24), y + px(118), maxW - px(48), px(31), 2);
    y += px(220) + px(56);

    if (zoom.explicacao) {
      ctx.font = font(500, px(18));
      ctx.fillStyle = PRINT_TPL.soft;
      y = wrap(ctx, zoom.explicacao, SLIDE_PAD_X, y, maxW, px(27), 5) + px(48);
    }
    if (zoom.comparativo) {
      roundRect(ctx, SLIDE_PAD_X, y - px(30), maxW, px(120), px(14));
      ctx.fillStyle = "rgba(239,159,39,0.10)";
      ctx.fill();
      ctx.font = font(600, px(16));
      ctx.fillStyle = PRINT_TPL.gold;
      wrap(ctx, zoom.comparativo, SLIDE_PAD_X + px(18), y, maxW - px(36), px(24), 3);
    }
  }

  if (slide.tipo === "COMPARATIVO") {
    drawTagPill(ctx, "comparativo", SLIDE_PAD_X, px(50), PRINT_TPL.purple);
    ctx.font = font(800, px(34));
    ctx.fillStyle = PRINT_TPL.ink;
    const y0 = wrap(ctx, "Outros apps vs nutriON", SLIDE_PAD_X, px(170), maxW, px(42), 2) + px(60);

    const colW = (maxW - px(24)) / 2;
    const colunas: { titulo: string; cor: string; itens: string[] }[] = [
      { titulo: "OUTROS APPS", cor: PRINT_TPL.muted, itens: (analise.comparativo?.outros_apps || []).slice(0, 5) },
      { titulo: "nutriON", cor: PRINT_TPL.gold, itens: (analise.comparativo?.nutrion || []).slice(0, 5) },
    ];
    colunas.forEach((col, i) => {
      const x = SLIDE_PAD_X + i * (colW + px(24));
      roundRect(ctx, x, y0 - px(38), colW, px(430), px(16));
      ctx.fillStyle = i === 1 ? "rgba(239,159,39,0.10)" : "rgba(255,255,255,0.04)";
      ctx.fill();
      ctx.font = font(700, px(14));
      ctx.fillStyle = col.cor;
      ctx.fillText(col.titulo, x + px(16), y0);
      let y = y0 + px(46);
      for (const item of col.itens) {
        ctx.fillStyle = col.cor;
        ctx.fillRect(x + px(16), y - px(9), px(4), px(4));
        ctx.font = font(500, px(15));
        ctx.fillStyle = i === 1 ? PRINT_TPL.ink : PRINT_TPL.soft;
        y = wrap(ctx, item, x + px(30), y, colW - px(46), px(22), 3) + px(34);
      }
    });
  }

  if (slide.tipo === "CTA") {
    ctx.font = font(700, px(11));
    ctx.fillStyle = "#633806";
    ctx.fillText("nutriON", SLIDE_PAD_X, px(58));
    ctx.font = font(800, px(38));
    ctx.fillStyle = "#0A0A0A";
    let y = wrap(ctx, "Isso é o que um sistema entrega.", SLIDE_PAD_X, px(260), maxW, px(46), 3) + px(50);
    ctx.font = font(500, px(19));
    ctx.fillStyle = "#412402";
    y = wrap(ctx, "Conheça o nutriON — link na bio.", SLIDE_PAD_X, y, maxW, px(28), 2) + px(70);
    roundRect(ctx, SLIDE_PAD_X, y - px(38), maxW, px(110), px(14));
    ctx.fillStyle = "rgba(10,10,10,0.12)";
    ctx.fill();
    ctx.font = font(800, px(24));
    ctx.fillStyle = "#0A0A0A";
    ctx.fillText("Diagnóstico gratuito", SLIDE_PAD_X + px(20), y + px(2));
    ctx.font = font(500, px(14));
    ctx.fillStyle = "#412402";
    ctx.fillText("14 perguntas · 4 minutos · resultado imediato", SLIDE_PAD_X + px(20), y + px(34));
  }

  drawSlideFooter(ctx, SLIDE_W, SLIDE_H, handle || "diogo.mell0", {
    ink: isCta ? "#0A0A0A" : PRINT_TPL.ink,
    accent: isCta ? "#412402" : PRINT_TPL.gold,
    handleColor: isCta ? "#633806" : "#666666",
    background: isCta ? PRINT_TPL.gold : PRINT_TPL.bg,
    scale: S,
  });
  return canvas.toDataURL("image/png");
};

export const PRINT_SLIDE_LABELS = (analise: PrintAnalise): string[] => [
  "CAPA",
  ...(analise.slides_zoom || []).slice(0, 4).map((_, i) => `DESTAQUE ${i + 1}`),
  "COMPARATIVO",
  "CTA",
];

/** Carrossel completo: capa editorial + destaques + comparativo + CTA. */
export const renderPrintCarousel = (
  analise: PrintAnalise,
  print: HTMLImageElement,
  handle = "diogo.mell0",
): string[] => {
  const slides: PrintSlide[] = [{ tipo: "CAPA" }];
  (analise.slides_zoom || []).slice(0, 4).forEach((zoom, indice) => slides.push({ tipo: "ZOOM", zoom, indice }));
  slides.push({ tipo: "COMPARATIVO" }, { tipo: "CTA" });
  return slides.map((s) => renderSlide(s, analise, print, handle)).filter(Boolean);
};

/* ---------------------------------- Stories --------------------------------- */

export const PRINT_STORY_LABELS = ["CAPA", "DESTAQUE", "CTA"];

const storyFooter = (ctx: CanvasRenderingContext2D, handle: string, dark: boolean) => {
  ctx.textAlign = "left";
  ctx.font = font(700, 32);
  ctx.fillStyle = dark ? "rgba(10,10,10,0.85)" : PRINT_TPL.ink;
  ctx.fillText("nutri", 60, STORY_H - 80);
  const w = ctx.measureText("nutri").width;
  ctx.font = font("italic 700", 32);
  ctx.fillStyle = dark ? "rgba(10,10,10,0.85)" : PRINT_TPL.gold;
  ctx.fillText("ON", 60 + w + 2, STORY_H - 80);
  ctx.font = font(400, 18);
  ctx.fillStyle = dark ? "rgba(10,10,10,0.6)" : PRINT_TPL.muted;
  ctx.fillText(`@${(handle || "diogo.mell0").replace(/^@/, "")}`, 60, STORY_H - 50);
};

const renderStoryFrame = (
  frame: PrintStoryFrame,
  print: HTMLImageElement,
  handle: string,
  indice: number,
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  guardTextBounds(ctx, canvas.width);
  const tipo = (frame.tipo || (indice === 2 ? "CTA" : indice === 1 ? "DESTAQUE" : "CAPA")).toUpperCase();
  const isCta = tipo.includes("CTA");

  ctx.fillStyle = isCta ? PRINT_TPL.gold : PRINT_TPL.bg;
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  if (!isCta) {
    drawImageBackdrop(ctx, print, STORY_W, STORY_H, indice === 0 ? 0.4 : 0.24);
    drawTextura(ctx, STORY_W, STORY_H);
  }

  if (tipo.includes("CAPA") || tipo.includes("MOCKUP")) {
    drawTagPill(ctx, "TRANSFORMAÇÃO É SISTEMA", 60, 120);
    ctx.font = font(800, 72);
    ctx.fillStyle = PRINT_TPL.ink;
    const base = wrap(ctx, frame.texto || "", 60, 760, 960, 84, 4);
    if (frame.subtexto) {
      ctx.font = font(600, 36);
      ctx.fillStyle = PRINT_TPL.gold;
      wrap(ctx, frame.subtexto, 60, base + 72, 960, 48, 3);
    }
  } else if (tipo.includes("ZOOM") || tipo.includes("DESTAQUE")) {
    ctx.font = font(700, 20);
    ctx.fillStyle = PRINT_TPL.green;
    ctx.fillText("COMO O SISTEMA FUNCIONA", 60, 150);
    const frac = Math.min(0.92, Math.max(0.08, Number(frame.posicao_y_percentual) || 0.5));
    const bandaH = 800;
    const bandaFrac = 0.32;
    const sh = print.height * bandaFrac;
    const sy = Math.min(print.height - sh, Math.max(0, print.height * frac - sh / 2));
    const escala = Math.max(960 / print.width, bandaH / sh);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.filter = "saturate(1.3) contrast(1.1)";
    roundRect(ctx, 60, 260, 960, bandaH, 12);
    ctx.clip();
    ctx.drawImage(
      print,
      0,
      sy,
      print.width,
      sh,
      60 + (960 - print.width * escala) / 2,
      260 + (bandaH - sh * escala) / 2,
      print.width * escala,
      sh * escala,
    );
    ctx.restore();
    const storyWash = ctx.createLinearGradient(60, 260, 60, 1060);
    storyWash.addColorStop(0, "rgba(10,10,10,0.15)");
    storyWash.addColorStop(1, "rgba(10,10,10,0.88)");
    ctx.fillStyle = storyWash;
    ctx.fillRect(60, 260, 960, bandaH);

    ctx.font = font(800, 54);
    ctx.fillStyle = PRINT_TPL.ink;
    const base = wrap(ctx, frame.texto || "", 60, 1200, 960, 66, 3);
    if (frame.subtexto) {
      ctx.font = font(600, 38);
      ctx.fillStyle = PRINT_TPL.gold;
      wrap(ctx, frame.subtexto, 60, base + 70, 960, 48, 2);
    }
  } else {
    ctx.font = font(800, 68);
    ctx.fillStyle = "#0A0A0A";
    const y = wrap(ctx, frame.texto || "Quer treinar assim?", 60, STORY_H * 0.42, 960, 82, 3) + 100;
    ctx.font = font(700, 42);
    ctx.fillStyle = "rgba(10,10,10,0.8)";
    wrap(ctx, frame.cta || "Link na bio", 60, y, 960, 56, 3);
  }

  storyFooter(ctx, handle, isCta);
  return canvas.toDataURL("image/png");
};

/** Stories reconstruídos: capa, destaque editorial e CTA. */
export const renderPrintStories = (
  frames: PrintStoryFrame[],
  print: HTMLImageElement,
  handle = "diogo.mell0",
): string[] => (frames || []).slice(0, 3).map((f, i) => renderStoryFrame(f, print, handle, i)).filter(Boolean);
