/**
 * SlideBase — componente base compartilhado por TODOS os carrosséis
 * (MCE, NEXUS-BIO Peptídeos, NEXUS-BIO Microbiota e qualquer template futuro).
 *
 * Regra única e inegociável:
 *   - o rodapé ocupa a faixa fixa de 100px na base do slide;
 *   - o conteúdo NUNCA pode invadir essa faixa (área útil = altura - 100px).
 *
 * Equivalente ao JSX:
 *   <div class="slide">
 *     <div class="slide-content" style="bottom:100px" />
 *     <div class="slide-footer" style="bottom:0;height:100px" />
 *   </div>
 */

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;
/** Faixa reservada ao rodapé, em pixels reais do canvas. */
export const SLIDE_FOOTER_H = 100;
/** Margem lateral padrão de todos os slides. */
export const SLIDE_PAD_X = 84;

/** Limite inferior da área de conteúdo — nada pode ser desenhado abaixo disso. */
export const slideContentBottom = (h: number = SLIDE_H) => h - SLIDE_FOOTER_H;

/** Espaço vertical disponível a partir de um Y qualquer. */
export const slideRoomLeft = (y: number, h: number = SLIDE_H) => Math.max(0, slideContentBottom(h) - y);

/** true quando ainda cabe um bloco de `blockH` px sem invadir o rodapé. */
export const slideFits = (y: number, blockH: number, h: number = SLIDE_H) => y + blockH <= slideContentBottom(h);

export const createSlideCanvas = (w: number = SLIDE_W, h: number = SLIDE_H, bg = "#0A0A0A") => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  return { canvas, ctx };
};

export type SlideFooterOpts = {
  /** cor do "nutri" */
  ink: string;
  /** cor do "ON" em itálico */
  accent: string;
  /** cor do @handle */
  handleColor: string;
  /** escala do template (1 unidade de design = `scale` px reais) */
  scale?: number;
};

/**
 * Rodapé fixo: sempre na faixa inferior de 100px, nunca sobe, nunca sobrepõe
 * conteúdo. Deve ser a ÚNICA forma de desenhar a assinatura nos slides.
 */
export const drawSlideFooter = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  handle: string,
  o: SlideFooterOpts,
) => {
  const s = o.scale ?? 3;
  const x = 28 * s;
  const baseline = h - SLIDE_FOOTER_H + 60; // centro vertical da faixa do rodapé
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${15 * s}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = o.ink;
  ctx.fillText("nutri", x, baseline);
  const nutriW = ctx.measureText("nutri").width;
  ctx.font = `italic 700 ${15 * s}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = o.accent;
  ctx.fillText("ON", x + nutriW, baseline);

  ctx.font = `400 ${9 * s}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = o.handleColor;
  ctx.textAlign = "right";
  ctx.fillText(handle.startsWith("@") ? handle : `@${handle}`, w - x, baseline);
  ctx.restore();
  ctx.textAlign = "left";
};

/** Corta um texto para no máximo `max` palavras (sem reticências agressivas). */
export const limitWords = (text: string, max: number) => {
  const parts = (text || "").trim().split(/\s+/).filter(Boolean);
  return parts.length <= max ? parts.join(" ") : `${parts.slice(0, max).join(" ")}…`;
};

/** Quebra uma lista em grupos de `size` itens — vira slide adicional em vez de cortar. */
export const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};
