/**
 * Template "CIÊNCIA DO EXERCÍCIO" — carrossel fixo de 7 slides 4:5 (1080x1350)
 * que transforma dados REAIS da BiomechanicsVault (Perplexity + Dr. BioMech,
 * com citações) em conteúdo pronto pra postar. A IA só escreve a narrativa
 * em cima do que a pesquisa real devolveu — nunca inventa estudo ou número.
 *
 * Mesma paleta dos demais templates (MCE, NEXUS-BIO, Resultado + Protocolo).
 */

import { beginSlideContent, chunk, drawSlideFooter, fitTextSize, slideContentBottom } from "@/lib/slideBase";

export const BIOMECH_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#888888",
  soft: "#CCCCCC",
  gold: "#EF9F27",
  green: "#5DCAA5",
  purple: "#AFA9EC",
  footerMuted: "#666666",
  ctaSub: "#412402",
} as const;

export type BiomechPonto = { titulo: string; corpo: string };

export type BiomechCarouselContent = {
  exercicio: string;
  focoLabel: string;
  handle?: string;
  capa: { tag: string; titulo: string; subtitulo: string };
  dado: { numero?: string; titulo: string; corpo: string };
  pontos: BiomechPonto[];
  aplicacao: { titulo: string; corpo: string };
  fontes: string[];
};

export const BIOMECH_CTA_SLIDE = {
  tag: "PRÓXIMO PASSO",
  titulo: "Quer a execução perfeita desse exercício?",
  subtitulo: "Análise biomecânica completa de cada exercício no nutriON.",
  caixa: "Link na bio",
  caixaSub: "BiomechanicsVault · estudos reais",
} as const;

const S = 3;
const px = (v: number) => v * S;
const font = (weight: number, size: number) =>
  `${weight} ${px(size)}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

type Token = { text: string; hi: boolean };

const tokenize = (text: string): Token[] =>
  (text || "")
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**")
        ? { text: part.slice(2, -2), hi: true }
        : { text: part, hi: false },
    );

type RichOpts = {
  size: number; weight: number; color: string; accent: string; lineHeight: number; maxWidth: number;
  hiWeight?: number; hiItalic?: boolean; align?: "left" | "center";
};

const drawRich = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: RichOpts) => {
  const lh = px(o.size) * o.lineHeight;
  const words: Token[] = [];
  for (const token of tokenize(text)) {
    for (const word of token.text.split(/\s+/)) if (word) words.push({ text: word, hi: token.hi });
  }
  const styleFor = (hi: boolean) =>
    `${hi && o.hiItalic ? "italic " : ""}${hi ? o.hiWeight || o.weight : o.weight} ${px(o.size)}px Inter, system-ui, sans-serif`;

  // Palavras maiores que a coluna (URLs, termos longos) precisam ser quebradas,
  // senão vazam para fora da arte.
  const quebrar = (word: Token): Token[] => {
    ctx.font = styleFor(word.hi);
    if (ctx.measureText(word.text).width <= o.maxWidth) return [word];
    const partes: Token[] = [];
    let atual = "";
    for (const ch of word.text) {
      if (atual && ctx.measureText(atual + ch).width > o.maxWidth) {
        partes.push({ text: atual, hi: word.hi });
        atual = ch;
      } else atual += ch;
    }
    if (atual) partes.push({ text: atual, hi: word.hi });
    return partes;
  };

  const lines: Token[][] = [[]];
  let width = 0;
  for (const word of words.flatMap(quebrar)) {
    ctx.font = styleFor(word.hi);
    const w = ctx.measureText(`${word.text} `).width;
    if (width + w > o.maxWidth && lines[lines.length - 1].length) {
      lines.push([word]);
      width = w;
    } else {
      lines[lines.length - 1].push(word);
      width += w;
    }
  }

  let cursorY = y;
  for (const line of lines) {
    let lineW = 0;
    for (const word of line) {
      ctx.font = styleFor(word.hi);
      lineW += ctx.measureText(`${word.text} `).width;
    }
    let cursorX = o.align === "center" ? x - lineW / 2 : x;
    for (const word of line) {
      ctx.font = styleFor(word.hi);
      ctx.fillStyle = word.hi ? o.accent : o.color;
      ctx.fillText(word.text, cursorX, cursorY);
      cursorX += ctx.measureText(`${word.text} `).width;
    }
    cursorY += lh;
  }
  return cursorY;
};

/** Corta o texto na largura disponível, sempre com reticências — nunca vaza. */
const truncar = (ctx: CanvasRenderingContext2D, texto: string, maxWidth: number) => {
  if (ctx.measureText(texto).width <= maxWidth) return texto;
  let corte = texto;
  while (corte.length > 1 && ctx.measureText(`${corte}…`).width > maxWidth) corte = corte.slice(0, -1);
  return `${corte}…`;
};

/** Transforma a URL da pesquisa em domínio legível + caminho curto. */
const fonteInfo = (fonte: string): { dominio: string; resto: string } => {
  const bruto = (fonte || "").trim();
  const m = bruto.match(/^https?:\/\/([^/]+)(\/.*)?$/i);
  if (!m) {
    const [primeira, ...rest] = bruto.split(" — ");
    return { dominio: primeira, resto: rest.join(" — ") };
  }
  const dominio = m[1].replace(/^www\./i, "");
  const caminho = decodeURIComponent(m[2] || "")
    .replace(/\.(html?|php|pdf)$/i, "")
    .replace(/[/_-]+/g, " ")
    .trim();
  return { dominio, resto: caminho };
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
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const pill = (
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
  opts: { bg?: string; color: string; border?: string },
) => {
  const label = (text || "").toUpperCase();
  ctx.font = font(700, 8);
  const spacing = px(0.2 * 8);
  const chars = [...label];
  const textW = chars.reduce((sum, c) => sum + ctx.measureText(c).width + spacing, 0);
  const h = px(22);
  const w = textW + px(24);
  roundRect(ctx, x, y, w, h, px(11));
  if (opts.bg) { ctx.fillStyle = opts.bg; ctx.fill(); }
  if (opts.border) { ctx.lineWidth = px(1); ctx.strokeStyle = opts.border; ctx.stroke(); }
  ctx.fillStyle = opts.color;
  ctx.textBaseline = "middle";
  let cx = x + px(12);
  for (const c of chars) {
    ctx.fillText(c, cx, y + h / 2 + px(0.5));
    cx += ctx.measureText(c).width + spacing;
  }
  ctx.textBaseline = "alphabetic";
  return y + h;
};

const footer = (ctx: CanvasRenderingContext2D, w: number, h: number, handle: string, dark = false) =>
  drawSlideFooter(ctx, w, h, handle, {
    ink: dark ? BIOMECH_TPL.bg : BIOMECH_TPL.ink,
    accent: dark ? BIOMECH_TPL.bg : BIOMECH_TPL.gold,
    handleColor: dark ? BIOMECH_TPL.ctaSub : BIOMECH_TPL.footerMuted,
    background: dark ? BIOMECH_TPL.gold : BIOMECH_TPL.bg,
    scale: S,
  });

const canvasOf = (w: number, h: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  beginSlideContent(ctx, w, h);
  return { canvas, ctx };
};

const pontosSlide = (numero: number, itens: BiomechPonto[], handle: string, w: number, h: number) => {
  const { canvas, ctx } = canvasOf(w, h);
  ctx.fillStyle = BIOMECH_TPL.bg;
  ctx.fillRect(0, 0, w, h);
  orb(ctx, w - px(30), px(30), px(140), BIOMECH_TPL.green);
  const x = px(28);
  let y = px(64);
  y = pill(ctx, `O QUE A CIÊNCIA MOSTRA ${numero}`, x, y, { bg: `${BIOMECH_TPL.green}20`, color: BIOMECH_TPL.green, border: `${BIOMECH_TPL.green}40` });
  y += px(48);
  const colX = x + px(46);
  const colW = w - colX - x;
  itens.forEach((item, i) => {
    if (y > h - px(90)) return;
    if (i > 0) {
      ctx.fillStyle = `${BIOMECH_TPL.green}26`;
      ctx.fillRect(x, y - px(20), w - x * 2, px(1));
    }
    ctx.beginPath();
    ctx.arc(x + px(6), y + px(10), px(5), 0, Math.PI * 2);
    ctx.fillStyle = BIOMECH_TPL.green;
    ctx.fill();
    y = drawRich(ctx, item.titulo, colX, y, {
      size: 18, weight: 900, color: BIOMECH_TPL.ink, accent: BIOMECH_TPL.green, lineHeight: 1.22, maxWidth: colW,
    });
    y += px(8);
    y = drawRich(ctx, item.corpo, colX, y, {
      size: 12.5, weight: 300, color: BIOMECH_TPL.muted, accent: BIOMECH_TPL.green, lineHeight: 1.6, maxWidth: colW, hiWeight: 700,
    });
    y += px(46);
  });
  footer(ctx, w, h, handle);
  return canvas.toDataURL("image/png");
};

/** Sempre 7 slides: capa, o dado central, 2x "o que a ciência mostra", aplicação, fontes, CTA. */
export const renderBiomechCarousel = (content: BiomechCarouselContent, w = 1080, h = 1350): string[] => {
  const handle = content.handle?.startsWith("@") ? content.handle : `@${(content.handle || "diogo.mell0").replace("@", "")}`;
  const x = px(28);
  const out: string[] = [];

  // 1 — CAPA
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = BIOMECH_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(30), h - px(40), px(125), BIOMECH_TPL.gold);
    let y = px(64);
    y = pill(ctx, content.capa.tag, x, y, { bg: BIOMECH_TPL.gold, color: BIOMECH_TPL.bg });
    y += px(36);
    y = pill(ctx, content.focoLabel, x, y, { color: BIOMECH_TPL.ink, border: `${BIOMECH_TPL.ink}40` });
    y += px(46);
    y = drawRich(ctx, content.capa.titulo, x, y, {
      size: 25, weight: 900, color: BIOMECH_TPL.ink, accent: BIOMECH_TPL.gold, lineHeight: 1.08, maxWidth: w - x * 2, hiWeight: 900,
    });
    y += px(16);
    drawRich(ctx, content.capa.subtitulo, x, y, {
      size: 12, weight: 300, color: BIOMECH_TPL.muted, accent: BIOMECH_TPL.gold, lineHeight: 1.6, maxWidth: w - x * 2,
    });
    ctx.font = font(500, 11);
    ctx.fillStyle = BIOMECH_TPL.gold;
    ctx.fillText(content.exercicio.toUpperCase(), x, h - px(18));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 2 — O DADO CENTRAL
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = BIOMECH_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, px(20), h - px(60), px(125), BIOMECH_TPL.gold);
    let y = px(64);
    y = pill(ctx, "O DADO", x, y, { color: BIOMECH_TPL.gold, border: `${BIOMECH_TPL.gold}40` });
    y += px(50);
    if (content.dado.numero) {
      ctx.font = font(900, 46);
      ctx.fillStyle = BIOMECH_TPL.gold;
      ctx.fillText(content.dado.numero, x, y + px(38));
      y += px(78);
    }
    y = drawRich(ctx, content.dado.titulo, x, y, {
      size: 18, weight: 900, color: BIOMECH_TPL.ink, accent: BIOMECH_TPL.gold, lineHeight: 1.25, maxWidth: w - x * 2,
    });
    y += px(16);
    ctx.fillStyle = `${BIOMECH_TPL.gold}66`;
    ctx.fillRect(x, y - px(10), px(40), px(1.5));
    y += px(14);
    drawRich(ctx, content.dado.corpo, x, y, {
      size: 12, weight: 300, color: BIOMECH_TPL.muted, accent: BIOMECH_TPL.gold, lineHeight: 1.7, maxWidth: w - x * 2, hiWeight: 700,
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 3, 4 — O QUE A CIÊNCIA MOSTRA (sempre 2 slides, mesmo com poucos pontos)
  const grupos = chunk(content.pontos, 2);
  out.push(pontosSlide(1, grupos[0] || [], handle, w, h));
  out.push(pontosSlide(2, grupos[1] || [], handle, w, h));

  // 5 — APLICAÇÃO PRÁTICA
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = BIOMECH_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(20), h / 2, px(140), BIOMECH_TPL.purple);
    let y = px(64);
    y = pill(ctx, "NA PRÁTICA", x, y, { bg: `${BIOMECH_TPL.purple}20`, color: BIOMECH_TPL.purple, border: `${BIOMECH_TPL.purple}40` });
    y += px(50);
    y = drawRich(ctx, content.aplicacao.titulo, x, y, {
      size: 19, weight: 900, color: BIOMECH_TPL.ink, accent: BIOMECH_TPL.purple, lineHeight: 1.25, maxWidth: w - x * 2,
    });
    y += px(20);
    drawRich(ctx, content.aplicacao.corpo, x, y, {
      size: 12, weight: 300, color: BIOMECH_TPL.muted, accent: BIOMECH_TPL.purple, lineHeight: 1.7, maxWidth: w - x * 2, hiWeight: 700,
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 6 — FONTES (o slide mais salvável: prova que não é invenção)
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = BIOMECH_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, px(20), px(30), px(140), BIOMECH_TPL.green);
    let y = px(52);
    y = pill(ctx, "FONTES", x, y, { color: BIOMECH_TPL.green, border: `${BIOMECH_TPL.green}40` });
    y += px(42);
    y = drawRich(ctx, "De onde vem esse conteúdo", x, y, {
      size: 18, weight: 900, color: BIOMECH_TPL.ink, accent: BIOMECH_TPL.green, lineHeight: 1.25, maxWidth: w - x * 2,
    });
    y += px(10);
    ctx.font = font(400, 10);
    ctx.fillStyle = BIOMECH_TPL.muted;
    ctx.fillText("Referências consultadas na análise deste exercício", x, y + px(12));
    y += px(28);

    const fontes = content.fontes.length ? content.fontes.slice(0, 5) : [];
    const colW = w - x * 2;
    if (!fontes.length) {
      drawRich(ctx, "Pesquisa em andamento — as referências completas ficam no app.", x, y + px(4), {
        size: 11, weight: 300, color: BIOMECH_TPL.soft, accent: BIOMECH_TPL.green, lineHeight: 1.6, maxWidth: colW,
      });
    }
    fontes.forEach((f, i) => {
      const { dominio, resto } = fonteInfo(f);
      const cardH = px(40);
      if (y + cardH > h - px(14)) return;
      roundRect(ctx, x, y, colW, cardH, px(10));
      ctx.fillStyle = `${BIOMECH_TPL.green}0D`;
      ctx.fill();
      ctx.lineWidth = px(1);
      ctx.strokeStyle = `${BIOMECH_TPL.green}33`;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x + px(20), y + px(15), px(4), 0, Math.PI * 2);
      ctx.fillStyle = BIOMECH_TPL.green;
      ctx.fill();

      ctx.font = font(700, 11);
      ctx.fillStyle = BIOMECH_TPL.ink;
      ctx.fillText(truncar(ctx, dominio, colW - px(60)), x + px(40), y + px(19));

      if (resto) {
        ctx.font = font(300, 9);
        ctx.fillStyle = BIOMECH_TPL.muted;
        ctx.fillText(truncar(ctx, resto, colW - px(60)), x + px(40), y + px(33));
      }
      y += cardH + px(8);
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 7 — CTA (fixo)
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = BIOMECH_TPL.gold;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(30), h - px(40), px(125), "#0A0A0A");
    let y = px(64);
    y = pill(ctx, BIOMECH_CTA_SLIDE.tag, x, y, { bg: BIOMECH_TPL.bg, color: BIOMECH_TPL.gold });
    y += px(56);
    y = drawRich(ctx, BIOMECH_CTA_SLIDE.titulo, x, y, {
      size: 22, weight: 900, color: BIOMECH_TPL.bg, accent: BIOMECH_TPL.bg, lineHeight: 1.18, maxWidth: w - x * 2,
    });
    y += px(14);
    y = drawRich(ctx, BIOMECH_CTA_SLIDE.subtitulo, x, y, {
      size: 13, weight: 400, color: BIOMECH_TPL.ctaSub, accent: BIOMECH_TPL.ctaSub, lineHeight: 1.5, maxWidth: w - x * 2,
    });
    y += px(28);
    const boxH = px(58);
    roundRect(ctx, x, y, w - x * 2, boxH, px(8));
    ctx.fillStyle = BIOMECH_TPL.bg;
    ctx.fill();
    ctx.font = font(700, 14);
    ctx.fillStyle = BIOMECH_TPL.gold;
    ctx.fillText(BIOMECH_CTA_SLIDE.caixa, x + px(16), y + px(26));
    ctx.font = font(400, 10);
    ctx.fillStyle = BIOMECH_TPL.muted;
    ctx.fillText(BIOMECH_CTA_SLIDE.caixaSub, x + px(16), y + px(44));
    footer(ctx, w, h, handle, true);
    out.push(canvas.toDataURL("image/png"));
  }

  return out;
};

export const BIOMECH_SLIDE_LABELS = [
  "Capa", "O dado", "Ciência 1", "Ciência 2", "Na prática", "Fontes", "CTA",
];
