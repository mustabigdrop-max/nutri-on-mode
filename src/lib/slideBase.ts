/**
 * SlideBase — componente base compartilhado por TODOS os carrosséis
 * (MCE, NEXUS-BIO Peptídeos, NEXUS-BIO Microbiota e qualquer template futuro).
 *
 * Regra única e inegociável:
 *   - o rodapé ocupa a faixa fixa de 100px na base do slide;
 *   - o conteúdo para 80px antes do rodapé;
 *   - o conteúdo NUNCA pode invadir a assinatura.
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
/** Respiro obrigatório entre o último conteúdo e o rodapé. */
export const SLIDE_CONTENT_BOTTOM_PAD = 80;
/** Margem lateral padrão de todos os slides. */
export const SLIDE_PAD_X = 84;

/** Limite inferior da área de conteúdo — nada pode ser desenhado abaixo disso. */
export const slideContentBottom = (h: number = SLIDE_H) => h - SLIDE_FOOTER_H - SLIDE_CONTENT_BOTTOM_PAD;

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

/**
 * Equivalente Canvas de `.slide-content { bottom: 100px; padding-bottom: 80px; overflow: hidden }`.
 * O `restore` correspondente é executado por `drawSlideFooter` antes do rodapé.
 */
export const beginSlideContent = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, slideContentBottom(h));
  ctx.clip();
  // Os templates foram originalmente desenhados ocupando quase toda a altura.
  // Compactamos a camada de conteúdo, sem alterar o rodapé, para preservar
  // títulos, cards e listas completos dentro da nova área segura.
  // Compacta apenas na vertical: escalar também na horizontal deixava faixas
  // vazias nas laterais (o fundo do template não alcançava as bordas).
  ctx.scale(1, slideContentBottom(h) / h);
};

export type SlideFooterOpts = {
  /** cor do "nutri" */
  ink: string;
  /** cor do "ON" em itálico */
  accent: string;
  /** cor do @handle */
  handleColor: string;
  /** fundo real do slide, usado para proteger a faixa do rodapé */
  background: string;
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
  const x = 45;
  const baseline = h - 20;
  // Encerra o recorte da área de conteúdo. O rodapé passa a ocupar uma camada
  // própria, equivalente a position:absolute; bottom:20px; z-index:15.
  ctx.restore();
  ctx.save();
  // O fundo do conteúdo é recortado acima da área segura. Repinte toda essa
  // área com a cor real do slide para o PNG nunca ficar transparente nem
  // ganhar uma faixa preta em CTAs claros.
  ctx.fillStyle = o.background;
  ctx.fillRect(0, slideContentBottom(h), w, h - slideContentBottom(h));
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

/**
 * Ajuste automático de corpo de texto dentro de uma figura (card, retângulo,
 * pill, caixa arredondada). Recebe uma função que informa quantas linhas o
 * texto ocupa em um determinado tamanho e devolve o maior tamanho que ainda
 * cabe na altura disponível. Regra do projeto: a palavra NUNCA sai da figura.
 */
export const fitTextSize = (
  medir: (size: number) => number | { linhas: number; largura: number },
  o: { size: number; lineHeight: number; maxHeight: number; maxWidth?: number; min?: number; step?: number },
) => {
  const min = o.min ?? Math.max(8, o.size * 0.55);
  const step = o.step ?? 0.5;
  let size = o.size;
  const cabe = (s: number) => {
    const m = medir(s);
    const linhas = typeof m === "number" ? m : m.linhas;
    const largura = typeof m === "number" ? 0 : m.largura;
    if (linhas * s * o.lineHeight > o.maxHeight) return false;
    if (o.maxWidth && largura > o.maxWidth) return false;
    return true;
  };
  while (size > min && !cabe(size)) size -= step;
  return Math.max(min, size);
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
