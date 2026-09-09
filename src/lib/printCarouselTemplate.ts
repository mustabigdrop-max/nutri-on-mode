/**
 * Carrossel e Stories "PRINT DO nutriON" — o coach sobe UM print de tela do
 * app e o sistema monta o mockup premium (celular + anotações), os slides de
 * zoom nas features, o comparativo e o CTA. Tudo 1080x1350 (feed) e 1080x1920
 * (stories), na identidade nutriON, com rodapé fixo via `slideBase`.
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

const drawTagPill = (ctx: CanvasRenderingContext2D, texto: string, x: number, y: number, cor = PRINT_TPL.gold) => {
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

type PhoneRect = { x: number; y: number; w: number; h: number };

/** Mockup de celular com o print dentro, mantendo proporção real da imagem. */
const drawPhone = (
  ctx: CanvasRenderingContext2D,
  print: HTMLImageElement,
  cx: number,
  top: number,
  maxH: number,
): PhoneRect => {
  const ratio = print.height / print.width || 2;
  let w = px(300);
  let h = w * ratio;
  if (h > maxH) {
    h = maxH;
    w = h / ratio;
  }
  const x = cx - w / 2;
  const y = top;
  const pad = px(8);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = px(30);
  ctx.shadowOffsetY = px(12);
  roundRect(ctx, x - pad, y - pad, w + pad * 2, h + pad * 2, px(26));
  ctx.fillStyle = "#141418";
  ctx.fill();
  ctx.restore();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(239,159,39,0.45)";
  roundRect(ctx, x - pad, y - pad, w + pad * 2, h + pad * 2, px(26));
  ctx.stroke();

  ctx.save();
  roundRect(ctx, x, y, w, h, px(20));
  ctx.clip();
  ctx.drawImage(print, x, y, w, h);
  ctx.restore();

  // Notch
  roundRect(ctx, cx - px(34), y + px(4), px(68), px(10), px(5));
  ctx.fillStyle = "#141418";
  ctx.fill();

  return { x, y, w, h };
};

/** Anotações laterais com linha e ponto apontando pro print. */
const drawAnotacoes = (ctx: CanvasRenderingContext2D, itens: PrintElemento[], phone: PhoneRect) => {
  const usaveis = itens.filter((i) => i.elemento).slice(0, 4);
  usaveis.forEach((item, i) => {
    const frac = Math.min(0.92, Math.max(0.08, Number(item.posicao_y_percentual) || (i + 1) / (usaveis.length + 1)));
    const y = phone.y + phone.h * frac;
    const esquerda = (item.lado_anotacao || (i % 2 === 0 ? "direita" : "esquerda")).toLowerCase().includes("esq");
    const anchorX = esquerda ? phone.x : phone.x + phone.w;
    const endX = esquerda ? SLIDE_PAD_X + px(4) : SLIDE_W - SLIDE_PAD_X - px(4);

    ctx.strokeStyle = "rgba(239,159,39,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(anchorX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(anchorX, y, px(5), 0, Math.PI * 2);
    ctx.fillStyle = PRINT_TPL.gold;
    ctx.fill();

    const maxW = esquerda ? phone.x - SLIDE_PAD_X - px(18) : SLIDE_W - SLIDE_PAD_X - (phone.x + phone.w) - px(18);
    ctx.textAlign = esquerda ? "left" : "right";
    const tx = esquerda ? SLIDE_PAD_X : SLIDE_W - SLIDE_PAD_X;
    ctx.font = font(800, px(15));
    ctx.fillStyle = PRINT_TPL.ink;
    const base = wrap(ctx, item.elemento || "", tx, y - px(10), Math.max(px(120), maxW), px(20), 2);
    if (item.destaque || item.descricao) {
      ctx.font = font(400, px(12));
      ctx.fillStyle = PRINT_TPL.muted;
      wrap(ctx, item.destaque || item.descricao || "", tx, base + px(20), Math.max(px(120), maxW), px(17), 3);
    }
    ctx.textAlign = "left";
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
  | { tipo: "MOCKUP" }
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
  if (!isCta) drawTextura(ctx, SLIDE_W, SLIDE_H);

  beginSlideContent(ctx, SLIDE_W, SLIDE_H);
  const maxW = SLIDE_W - SLIDE_PAD_X * 2;
  const tela = (analise.titulo_tela || analise.tipo_tela || "nutriON").toUpperCase();

  if (slide.tipo === "MOCKUP") {
    drawTagPill(ctx, `nutriON · ${tela}`, SLIDE_PAD_X, px(50));
    const phone = drawPhone(ctx, print, SLIDE_W / 2, px(140), px(600));
    drawAnotacoes(ctx, analise.elementos_visiveis || [], phone);

    const gY = px(860);
    ctx.font = font(800, px(28));
    ctx.fillStyle = PRINT_TPL.ink;
    const base = wrap(ctx, analise.gancho_slide1 || tela, SLIDE_PAD_X, gY, maxW, px(36), 3);
    if (analise.subtexto_slide1) {
      ctx.font = font(400, px(16));
      ctx.fillStyle = PRINT_TPL.muted;
      wrap(ctx, analise.subtexto_slide1, SLIDE_PAD_X, base + px(38), maxW, px(24), 2);
    }
    ctx.font = font(600, px(14));
    ctx.fillStyle = PRINT_TPL.gold;
    ctx.fillText("ARRASTA PRA VER OS DETALHES ▸", SLIDE_PAD_X, px(1060));
  }

  if (slide.tipo === "ZOOM") {
    const { zoom, indice } = slide;
    drawTagPill(ctx, `zoom ${indice + 1}`, SLIDE_PAD_X, px(50), PRINT_TPL.green);
    ctx.font = font(800, px(30));
    ctx.fillStyle = PRINT_TPL.ink;
    let y = wrap(ctx, zoom.titulo || "Detalhe da tela", SLIDE_PAD_X, px(160), maxW, px(38), 2) + px(44);

    const frac = Math.min(0.92, Math.max(0.08, Number(zoom.posicao_y_percentual) || (indice + 1) / 5));
    drawRecorte(ctx, print, frac, SLIDE_PAD_X, y, maxW, px(300));
    y += px(300) + px(56);

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
  "MOCKUP",
  ...(analise.slides_zoom || []).slice(0, 4).map((_, i) => `ZOOM ${i + 1}`),
  "COMPARATIVO",
  "CTA",
];

/** Carrossel completo: mockup + zooms + comparativo + CTA. */
export const renderPrintCarousel = (
  analise: PrintAnalise,
  print: HTMLImageElement,
  handle = "diogo.mell0",
): string[] => {
  const slides: PrintSlide[] = [{ tipo: "MOCKUP" }];
  (analise.slides_zoom || []).slice(0, 4).forEach((zoom, indice) => slides.push({ tipo: "ZOOM", zoom, indice }));
  slides.push({ tipo: "COMPARATIVO" }, { tipo: "CTA" });
  return slides.map((s) => renderSlide(s, analise, print, handle)).filter(Boolean);
};

/* ---------------------------------- Stories --------------------------------- */

export const PRINT_STORY_LABELS = ["MOCKUP", "ZOOM", "CTA"];

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
  const tipo = (frame.tipo || (indice === 2 ? "CTA" : indice === 1 ? "ZOOM_FEATURE" : "MOCKUP_PRINT")).toUpperCase();
  const isCta = tipo.includes("CTA");

  ctx.fillStyle = isCta ? PRINT_TPL.gold : PRINT_TPL.bg;
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  if (!isCta) drawTextura(ctx, STORY_W, STORY_H);

  if (tipo.includes("MOCKUP")) {
    const ratio = print.height / print.width || 2;
    let w = 620;
    let h = w * ratio;
    if (h > 1050) {
      h = 1050;
      w = h / ratio;
    }
    const x = (STORY_W - w) / 2;
    const y = 220;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 60;
    roundRect(ctx, x - 18, y - 18, w + 36, h + 36, 48);
    ctx.fillStyle = "#141418";
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundRect(ctx, x, y, w, h, 36);
    ctx.clip();
    ctx.drawImage(print, x, y, w, h);
    ctx.restore();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(239,159,39,0.45)";
    roundRect(ctx, x - 18, y - 18, w + 36, h + 36, 48);
    ctx.stroke();

    ctx.font = font(800, 58);
    ctx.fillStyle = PRINT_TPL.ink;
    const base = wrap(ctx, frame.texto || "", 60, Math.min(STORY_H - 340, y + h + 130), 960, 70, 3);
    if (frame.subtexto) {
      ctx.font = font(500, 34);
      ctx.fillStyle = PRINT_TPL.gold;
      wrap(ctx, frame.subtexto, 60, base + 62, 960, 44, 2);
    }
  } else if (tipo.includes("ZOOM")) {
    ctx.font = font(700, 20);
    ctx.fillStyle = PRINT_TPL.green;
    ctx.fillText("DENTRO DA TELA", 60, 150);
    const frac = Math.min(0.92, Math.max(0.08, Number(frame.posicao_y_percentual) || 0.5));
    const bandaH = 800;
    const bandaFrac = 0.32;
    const sh = print.height * bandaFrac;
    const sy = Math.min(print.height - sh, Math.max(0, print.height * frac - sh / 2));
    const escala = Math.max(960 / print.width, bandaH / sh);
    ctx.save();
    roundRect(ctx, 60, 260, 960, bandaH, 32);
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
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(239,159,39,0.45)";
    roundRect(ctx, 60, 260, 960, bandaH, 32);
    ctx.stroke();

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

/** Stories do print: 3 frames rápidos (mockup, zoom na feature, CTA). */
export const renderPrintStories = (
  frames: PrintStoryFrame[],
  print: HTMLImageElement,
  handle = "diogo.mell0",
): string[] => (frames || []).slice(0, 3).map((f, i) => renderStoryFrame(f, print, handle, i)).filter(Boolean);
