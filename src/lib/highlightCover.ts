import { guardTextBounds } from "@/lib/slideBase";
/**
 * Capas de Highlights do Instagram (1080x1920) na identidade nutriON,
 * e frames de story simples para o conteúdo de cada destaque.
 */

const BG = "#0A0A0A";
const INK = "#F5F0E8";
const GOLD = "#EF9F27";
const MUTED = "#888888";

const font = (weight: number, size: number) =>
  `${weight} ${size}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  let line = "";
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
};

const base = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d")!;
  guardTextBounds(ctx, canvas.width);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, 1080, 1920);
  // textura sutil de grão
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = i % 2 ? "#ffffff" : GOLD;
    ctx.fillRect(Math.random() * 1080, Math.random() * 1920, 2, 2);
  }
  ctx.globalAlpha = 1;
  return { canvas, ctx };
};

/** Capa de highlight: círculo dourado, ícone grande e título. */
export const renderHighlightCover = (titulo: string, icone: string): string => {
  const { canvas, ctx } = base();
  ctx.textAlign = "center";

  // anéis
  ctx.strokeStyle = `${GOLD}33`;
  ctx.lineWidth = 2;
  for (const r of [280, 330]) {
    ctx.beginPath();
    ctx.arc(540, 860, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(540, 860, 210, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "190px serif";
  ctx.fillStyle = "#0A0A0A";
  ctx.fillText(icone, 540, 930);

  ctx.font = font(800, 62);
  ctx.fillStyle = INK;
  const linhas = wrap(ctx, titulo.toUpperCase(), 780);
  linhas.forEach((l, i) => ctx.fillText(l, 540, 1230 + i * 74));

  ctx.font = font(500, 26);
  ctx.fillStyle = MUTED;
  ctx.fillText("NUTRION · TRANSFORMAÇÃO É SISTEMA.", 540, 1230 + linhas.length * 74 + 60);

  ctx.textAlign = "left";
  return canvas.toDataURL("image/png");
};

/** Story simples de conteúdo do highlight (texto grande centrado). */
export const renderHighlightStory = (
  texto: string,
  indice: number,
  total: number,
  titulo: string,
  cta = false,
): string => {
  const { canvas, ctx } = base();
  ctx.textAlign = "left";

  // barra de progresso
  const gap = 10;
  const larg = (900 - gap * (total - 1)) / total;
  for (let i = 0; i < total; i++) {
    ctx.fillStyle = i <= indice ? GOLD : "#ffffff20";
    ctx.fillRect(90 + i * (larg + gap), 110, larg, 6);
  }

  ctx.font = font(700, 24);
  ctx.fillStyle = GOLD;
  ctx.fillText(titulo.toUpperCase(), 90, 190);

  ctx.font = font(800, cta ? 74 : 82);
  ctx.fillStyle = cta ? GOLD : INK;
  const linhas = wrap(ctx, texto, 900);
  const alturaLinha = cta ? 92 : 100;
  let y = 960 - (linhas.length * alturaLinha) / 2;
  for (const l of linhas) {
    ctx.fillText(l, 90, y);
    y += alturaLinha;
  }

  ctx.font = font(500, 24);
  ctx.fillStyle = MUTED;
  ctx.fillText("nutriON · @diogo.mell0", 90, 1800);

  return canvas.toDataURL("image/png");
};
