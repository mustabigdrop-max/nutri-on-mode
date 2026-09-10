import { guardTextBounds } from "@/lib/slideBase";
/**
 * Stories "RESULTADO + PROTOCOLO" — 6 frames 1080x1920 na identidade nutriON.
 * Frame 1 usa a foto real do coach; os demais são cards escuros com os dados
 * REAIS do treino (TrainingON) e da nutrição do dia (NutriPlan/NutrySync).
 */

import { STORY_TPL, W, H, wrapText } from "@/lib/photoStoryTemplates";

export type RPStoryFrame =
  | { tipo: "FOTO_RESULTADO"; texto: string; subtexto?: string }
  | { tipo: "PROTOCOLO_RESUMO"; texto: string; bullets: string[] }
  | { tipo: "EXERCICIO_DESTAQUE"; texto: string; exercicio: string; detalhe: string; dica?: string }
  | { tipo: "NUTRICAO"; texto: string; detalhe: string; pos_treino?: string }
  | { tipo: "ENQUETE"; pergunta: string; opcao1: string; opcao2: string }
  | { tipo: "CTA"; texto: string; cta: string };

export const RP_STORY_LABELS = ["FOTO", "PROTOCOLO", "EXERCÍCIO", "NUTRIÇÃO", "ENQUETE", "CTA"];

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

const footer = (ctx: CanvasRenderingContext2D, handle: string, dark: boolean) => {
  ctx.textAlign = "left";
  ctx.font = font(700, 32);
  ctx.fillStyle = dark ? "rgba(10,10,10,0.85)" : STORY_TPL.ink;
  ctx.fillText("nutri", 60, H - 80);
  const w = ctx.measureText("nutri").width;
  ctx.font = font("italic 700", 32);
  ctx.fillStyle = dark ? "rgba(10,10,10,0.85)" : STORY_TPL.gold;
  ctx.fillText("ON", 60 + w + 2, H - 80);
  ctx.font = font(400, 18);
  ctx.fillStyle = dark ? "rgba(10,10,10,0.6)" : STORY_TPL.dim;
  ctx.fillText(`@${handle.replace(/^@/, "")}`, 60, H - 50);
};

const tag = (ctx: CanvasRenderingContext2D, texto: string, cor: string) => {
  ctx.font = font(700, 20);
  ctx.fillStyle = cor;
  ctx.fillText(texto.toUpperCase(), 60, 140);
};

const drawFoto = (ctx: CanvasRenderingContext2D, photo: HTMLImageElement) => {
  const scale = Math.max(W / photo.width, H / photo.height);
  const dw = photo.width * scale;
  const dh = photo.height * scale;
  ctx.drawImage(photo, (W - dw) / 2, (H - dh) / 2, dw, dh);
  const grad = ctx.createLinearGradient(0, H * 0.4, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.35, "rgba(0,0,0,0.45)");
  grad.addColorStop(1, "rgba(0,0,0,0.9)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
};

const renderFrame = (
  frame: RPStoryFrame,
  handle: string,
  photo?: HTMLImageElement | null,
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  guardTextBounds(ctx, canvas.width);

  const isCta = frame.tipo === "CTA";
  ctx.fillStyle = isCta ? STORY_TPL.gold : STORY_TPL.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  if (frame.tipo === "FOTO_RESULTADO" && photo) drawFoto(ctx, photo);

  if (!isCta && frame.tipo !== "FOTO_RESULTADO") {
    const g = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, W);
    g.addColorStop(0, "rgba(239,159,39,0.12)");
    g.addColorStop(1, "rgba(239,159,39,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  if (frame.tipo === "FOTO_RESULTADO") {
    ctx.font = font(800, 62);
    ctx.fillStyle = STORY_TPL.ink;
    const last = wrapText(ctx, frame.texto, 60, H * 0.68, 960, 74);
    if (frame.subtexto) {
      ctx.font = font(600, 34);
      ctx.fillStyle = STORY_TPL.gold;
      wrapText(ctx, frame.subtexto, 60, last + 66, 960, 44);
    }
  }

  if (frame.tipo === "PROTOCOLO_RESUMO") {
    tag(ctx, "PROTOCOLO REAL", STORY_TPL.gold);
    ctx.font = font(800, 62);
    ctx.fillStyle = STORY_TPL.ink;
    let y = wrapText(ctx, frame.texto, 60, 300, 960, 74) + 90;
    for (const b of (frame.bullets || []).slice(0, 5)) {
      ctx.fillStyle = STORY_TPL.gold;
      ctx.fillRect(60, y - 18, 8, 8);
      ctx.font = font(500, 36);
      ctx.fillStyle = STORY_TPL.ink;
      y = wrapText(ctx, b, 96, y, 900, 46) + 68;
    }
  }

  if (frame.tipo === "EXERCICIO_DESTAQUE") {
    tag(ctx, frame.texto || "EXERCÍCIO PRINCIPAL", STORY_TPL.green);
    ctx.font = font(800, 64);
    ctx.fillStyle = STORY_TPL.ink;
    let y = wrapText(ctx, frame.exercicio, 60, 320, 960, 76) + 70;
    ctx.font = font(500, 34);
    ctx.fillStyle = STORY_TPL.gold;
    y = wrapText(ctx, frame.detalhe, 60, y, 960, 46) + 90;
    if (frame.dica) {
      roundRect(ctx, 50, y - 60, 980, 220, 18);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fill();
      ctx.font = font(400, 30);
      ctx.fillStyle = STORY_TPL.muted;
      wrapText(ctx, frame.dica, 84, y + 10, 910, 42);
    }
  }

  if (frame.tipo === "NUTRICAO") {
    tag(ctx, "NUTRIÇÃO", STORY_TPL.purple);
    ctx.font = font(800, 58);
    ctx.fillStyle = STORY_TPL.ink;
    let y = wrapText(ctx, frame.texto, 60, 310, 960, 70) + 80;
    ctx.font = font(600, 36);
    ctx.fillStyle = STORY_TPL.gold;
    y = wrapText(ctx, frame.detalhe, 60, y, 960, 48) + 80;
    if (frame.pos_treino) {
      roundRect(ctx, 50, y - 62, 980, 190, 18);
      ctx.fillStyle = "rgba(93,202,165,0.10)";
      ctx.fill();
      ctx.font = font(500, 32);
      ctx.fillStyle = STORY_TPL.green;
      wrapText(ctx, frame.pos_treino, 84, y, 910, 44);
    }
  }

  if (frame.tipo === "ENQUETE") {
    tag(ctx, "ENQUETE", STORY_TPL.gold);
    ctx.font = font(800, 64);
    ctx.fillStyle = STORY_TPL.ink;
    let y = wrapText(ctx, frame.pergunta, 60, H * 0.36, 960, 78) + 110;
    for (const op of [frame.opcao1, frame.opcao2]) {
      roundRect(ctx, 60, y - 70, 960, 130, 26);
      ctx.fillStyle = "rgba(239,159,39,0.10)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(239,159,39,0.5)";
      ctx.stroke();
      ctx.font = font(800, 44);
      ctx.fillStyle = STORY_TPL.ink;
      ctx.fillText(op, 104, y + 12);
      y += 170;
    }
    ctx.font = font(400, 24);
    ctx.fillStyle = STORY_TPL.dim;
    ctx.fillText("Use o sticker de enquete do Instagram por cima", 60, y + 10);
  }

  if (frame.tipo === "CTA") {
    ctx.font = font(800, 66);
    ctx.fillStyle = "#0A0A0A";
    const y = wrapText(ctx, frame.texto, 60, H * 0.42, 960, 80) + 100;
    ctx.font = font(700, 42);
    ctx.fillStyle = "rgba(10,10,10,0.8)";
    wrapText(ctx, frame.cta, 60, y, 960, 56);
  }

  footer(ctx, handle || "diogo.mell0", isCta);
  return canvas.toDataURL("image/png");
};

export const renderResultadoStories = (
  frames: RPStoryFrame[],
  handle = "diogo.mell0",
  photo?: HTMLImageElement | null,
): string[] => frames.map((f) => renderFrame(f, handle, photo)).filter(Boolean);
