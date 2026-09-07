/**
 * Renderizador de frames de Stories (9:16 — 1080x1920) na identidade nutriON.
 * Fundo escuro #0A0A0A, texto #F5F0E8, destaque #EF9F27 e rodapé com o @.
 * O frame de CTA direto inverte: fundo âmbar com texto escuro.
 */

export const STORY_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  soft: "#CCCCCC",
  muted: "#777777",
  gold: "#EF9F27",
  dark: "#0A0A0A",
} as const;

export type StoryFrame = {
  tipo?: string;
  instrucao?: string;
  texto_tela?: string;
  texto_principal?: string;
  texto_secundario?: string;
  destaque?: string;
  duracao?: string;
  sticker_sugerido?: string | null;
  pergunta?: string;
  opcao_1?: string;
  opcao_2?: string;
  texto_acima?: string;
  cta?: string;
  subtexto?: string;
  link_bio?: boolean;
  cor_fundo?: string;
  cor_texto?: string;
};

export type StoryScript = {
  tema?: string;
  frames: StoryFrame[];
  dica_gravacao?: string;
};

const W = 1080;
const H = 1920;
const PAD = 96;

const font = (weight: number, size: number) =>
  `${weight} ${size}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
};

const drawLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  o: { size: number; weight: number; color: string; lineHeight?: number },
) => {
  ctx.font = font(o.weight, o.size);
  ctx.fillStyle = o.color;
  const lh = o.size * (o.lineHeight ?? 1.18);
  let cursor = y;
  for (const line of wrap(ctx, text, W - PAD * 2)) {
    ctx.fillText(line, PAD, cursor);
    cursor += lh;
  }
  return cursor;
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

const footer = (ctx: CanvasRenderingContext2D, handle: string, dark: boolean) => {
  ctx.font = font(700, 24);
  ctx.fillStyle = dark ? "rgba(10,10,10,0.55)" : STORY_TPL.muted;
  ctx.fillText("nutriON", PAD, H - PAD);
  ctx.textAlign = "right";
  ctx.fillText(`@${handle.replace("@", "")}`, W - PAD, H - PAD);
  ctx.textAlign = "left";
};

const label = (ctx: CanvasRenderingContext2D, text: string, color: string) => {
  ctx.font = font(700, 22);
  ctx.fillStyle = color;
  const chars = [...text.toUpperCase()];
  let x = PAD;
  for (const c of chars) {
    ctx.fillText(c, x, PAD + 24);
    x += ctx.measureText(c).width + 4;
  }
};

const renderFrame = (frame: StoryFrame, handle: string): string => {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const tipo = (frame.tipo || "").toUpperCase();
  const isCta = tipo === "CTA_DIRETO" || (frame.cor_fundo || "").toUpperCase() === "#EF9F27";
  const bg = isCta ? STORY_TPL.gold : frame.cor_fundo || STORY_TPL.bg;
  const ink = isCta ? frame.cor_texto || STORY_TPL.dark : STORY_TPL.ink;
  const accent = isCta ? STORY_TPL.dark : STORY_TPL.gold;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  if (!isCta) {
    const g = ctx.createRadialGradient(W * 0.8, H * 0.18, 0, W * 0.8, H * 0.18, W * 0.9);
    g.addColorStop(0, "rgba(239,159,39,0.10)");
    g.addColorStop(1, "rgba(239,159,39,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  label(ctx, tipo.replace(/_/g, " ") || "STORY", isCta ? "rgba(10,10,10,0.55)" : STORY_TPL.gold);
  ctx.textBaseline = "alphabetic";

  let y = H * 0.34;

  if (tipo === "ENQUETE") {
    if (frame.texto_acima) y = drawLines(ctx, frame.texto_acima, y - 90, { size: 34, weight: 600, color: STORY_TPL.soft }) + 40;
    y = drawLines(ctx, frame.pergunta || "", y, { size: 68, weight: 800, color: ink }) + 60;
    for (const opt of [frame.opcao_1, frame.opcao_2].filter(Boolean) as string[]) {
      roundRect(ctx, PAD, y, W - PAD * 2, 130, 28);
      ctx.fillStyle = "rgba(239,159,39,0.10)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(239,159,39,0.5)";
      ctx.stroke();
      ctx.font = font(800, 46);
      ctx.fillStyle = STORY_TPL.ink;
      ctx.fillText(opt, PAD + 44, y + 84);
      y += 160;
    }
  } else {
    const main = frame.texto_principal || frame.texto_tela || "";
    y = drawLines(ctx, main, y, { size: 78, weight: 800, color: ink });
    if (frame.destaque) {
      y += 46;
      y = drawLines(ctx, frame.destaque, y, { size: 52, weight: 800, color: accent });
    }
    if (frame.texto_secundario) {
      y += 46;
      y = drawLines(ctx, frame.texto_secundario, y, { size: 42, weight: 500, color: isCta ? "rgba(10,10,10,0.75)" : STORY_TPL.soft });
    }
    if (frame.cta) {
      y += 70;
      const text = frame.cta;
      ctx.font = font(800, 46);
      const w = Math.min(W - PAD * 2, ctx.measureText(text).width + 80);
      roundRect(ctx, PAD, y - 10, w, 120, 26);
      ctx.fillStyle = isCta ? "rgba(10,10,10,0.9)" : STORY_TPL.gold;
      ctx.fill();
      ctx.fillStyle = isCta ? STORY_TPL.gold : STORY_TPL.dark;
      ctx.fillText(text, PAD + 40, y + 68);
      y += 150;
    }
    if (frame.subtexto) {
      y += 30;
      drawLines(ctx, frame.subtexto, y, { size: 34, weight: 500, color: isCta ? "rgba(10,10,10,0.7)" : STORY_TPL.muted });
    }
  }

  footer(ctx, handle || "diogo.mell0", isCta);
  return canvas.toDataURL("image/png");
};

export const renderStoryFrames = (script: StoryScript, handle = "diogo.mell0"): string[] =>
  (script.frames || []).map((f) => renderFrame(f, handle)).filter(Boolean);
