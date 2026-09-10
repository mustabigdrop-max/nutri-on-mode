/**
 * Template proprietário "RESULTADO + PROTOCOLO" — carrossel fixo de 10 slides
 * 4:5 (1080 x 1350). Conecta o resultado físico real do coach (foto) com o
 * protocolo (APEX/TrainingON) que ele usou: capa, o que mudou, o treino,
 * aquecimento, exercícios (2 slides), método APEX, nutrição/disciplina,
 * resumo e CTA.
 *
 * A paleta é a mesma dos templates MCE e NEXUS-BIO (feed coeso). Os dados de
 * treino são REAIS (vêm de getDadosTreino em resultadoProtocoloData.ts) — a
 * IA só escreve a narrativa em cima deles, nunca inventa séries ou cargas.
 *
 * Nos textos, trechos entre **asteriscos duplos** saem destacados no acento.
 */

import { beginSlideContent, chunk, drawSlideFooter, fitTextSize, slideContentBottom } from "@/lib/slideBase";

export const RP_TPL = {
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

export type RPSet = { label?: string; detail: string };
export type RPExercicio = { nome: string; alvo?: string; tempo?: string; sets: RPSet[] };
export type RPAquecimento = { nome: string; detail: string };

export type ResultadoProtocoloContent = {
  focoLabel: string;
  handle?: string;
  fotoUrl?: string;
  capa: { tag: string; titulo: string; subtitulo: string };
  resultado: { titulo: string; corpo: string; numero?: string; numeroLabel?: string };
  treino: { nome: string; duracao: string; grupos: string[] };
  aquecimento: RPAquecimento[];
  exercicios: RPExercicio[];
  apex: { nome: string; principios: string[] };
  nutricao: { titulo: string; corpo: string };
  resumo: { protocolo: string; frase: string };
};

export const RP_CTA_SLIDE = {
  tag: "PRÓXIMO PASSO",
  titulo: "Quer um protocolo assim pra você?",
  subtitulo: "Descubra o que está travando seu resultado agora.",
  caixa: "Link na bio",
  caixaSub: "Diagnóstico gratuito · 4 minutos · resultado imediato",
} as const;

const S = 3; // 360px de referência → 1080px reais
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
  size: number;
  weight: number;
  color: string;
  accent: string;
  lineHeight: number;
  maxWidth: number;
  hiWeight?: number;
  hiItalic?: boolean;
  align?: "left" | "center";
};

/** Desenha texto com quebra automática e trechos destacados. Retorna o Y final. */
const drawRich = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: RichOpts) => {
  const lh = px(o.size) * o.lineHeight;
  const words: Token[] = [];
  for (const token of tokenize(text)) {
    for (const word of token.text.split(/\s+/)) if (word) words.push({ text: word, hi: token.hi });
  }
  const styleFor = (hi: boolean) =>
    `${hi && o.hiItalic ? "italic " : ""}${hi ? o.hiWeight || o.weight : o.weight} ${px(o.size)}px Inter, system-ui, sans-serif`;

  const lines: Token[][] = [[]];
  let width = 0;
  for (const word of words) {
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

/** Pill de tag no topo. Retorna o Y da base. */
const pill = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
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
  if (opts.bg) {
    ctx.fillStyle = opts.bg;
    ctx.fill();
  }
  if (opts.border) {
    ctx.lineWidth = px(1);
    ctx.strokeStyle = opts.border;
    ctx.stroke();
  }
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

const footer = (ctx: CanvasRenderingContext2D, w: number, h: number, handle: string) =>
  drawSlideFooter(ctx, w, h, handle, {
    ink: RP_TPL.ink,
    accent: RP_TPL.gold,
    handleColor: RP_TPL.footerMuted,
    background: RP_TPL.bg,
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

/** Slide de lista simples (aquecimento, princípios APEX): tag + título + itens com marcador. */
const listSlide = (
  tag: string,
  titulo: string,
  itens: { titulo: string; detail?: string }[],
  color: string,
  handle: string,
  w: number,
  h: number,
) => {
  const { canvas, ctx } = canvasOf(w, h);
  ctx.fillStyle = RP_TPL.bg;
  ctx.fillRect(0, 0, w, h);
  orb(ctx, w - px(30), px(30), px(140), color);
  const x = px(28);
  let y = px(64);
  y = pill(ctx, tag, x, y, { color, border: `${color}40` });
  y += px(46);
  y = drawRich(ctx, titulo, x, y, {
    size: 20, weight: 900, color: RP_TPL.ink, accent: color, lineHeight: 1.2, maxWidth: w - x * 2,
  });
  y += px(24);
  for (const item of itens) {
    ctx.font = font(700, 12);
    ctx.fillStyle = color;
    ctx.fillText("▸", x, y);
    const endY = drawRich(ctx, item.titulo, x + px(18), y, {
      size: 12, weight: 700, color: RP_TPL.soft, accent: color, lineHeight: 1.5, maxWidth: w - x * 2 - px(18),
    });
    y = endY;
    if (item.detail) {
      y = drawRich(ctx, item.detail, x + px(18), y, {
        size: 10.5, weight: 300, color: RP_TPL.muted, accent: color, lineHeight: 1.6, maxWidth: w - x * 2 - px(18),
      });
    }
    y += px(16);
    if (y > slideContentBottom(h) - px(20)) break;
  }
  footer(ctx, w, h, handle);
  return canvas.toDataURL("image/png");
};

const exerciciosSlide = (
  numero: number,
  itens: RPExercicio[],
  color: string,
  handle: string,
  w: number,
  h: number,
) => {
  const { canvas, ctx } = canvasOf(w, h);
  ctx.fillStyle = RP_TPL.bg;
  ctx.fillRect(0, 0, w, h);
  orb(ctx, px(20), h - px(60), px(140), color);
  const x = px(28);
  let y = px(64);
  y = pill(ctx, `EXERCÍCIOS ${numero}`, x, y, { bg: `${color}20`, color, border: `${color}40` });
  y += px(44);

  if (!itens.length) {
    drawRich(ctx, "O protocolo completo tem mais exercícios — confira no TrainingON.", x, y, {
      size: 13, weight: 300, color: RP_TPL.muted, accent: color, lineHeight: 1.7, maxWidth: w - x * 2,
    });
    footer(ctx, w, h, handle);
    return canvas.toDataURL("image/png");
  }

  for (const ex of itens) {
    y = drawRich(ctx, ex.nome, x, y, {
      size: 15, weight: 900, color: RP_TPL.ink, accent: color, lineHeight: 1.25, maxWidth: w - x * 2,
    });
    if (ex.alvo || ex.tempo) {
      ctx.font = font(400, 9.5);
      ctx.fillStyle = RP_TPL.muted;
      ctx.fillText([ex.alvo, ex.tempo ? `Tempo ${ex.tempo}` : ""].filter(Boolean).join(" · "), x, y + px(4));
      y += px(20);
    } else {
      y += px(8);
    }
    for (const s of ex.sets.slice(0, 3)) {
      ctx.font = font(700, 10);
      ctx.fillStyle = color;
      ctx.fillText(s.label ? `${s.label.toUpperCase()}` : "SÉRIE", x + px(4), y);
      const labelW = ctx.measureText(s.label ? `${s.label.toUpperCase()} ` : "SÉRIE ").width;
      y = drawRich(ctx, s.detail, x + px(4) + labelW, y, {
        size: 10, weight: 300, color: RP_TPL.soft, accent: color, lineHeight: 1.5, maxWidth: w - x * 2 - px(4) - labelW,
      });
      y += px(4);
    }
    y += px(18);
    if (y > slideContentBottom(h) - px(30)) break;
  }
  footer(ctx, w, h, handle);
  return canvas.toDataURL("image/png");
};

/** Sempre 10 slides, na ordem: capa, resultado, treino, aquecimento, 2x exercícios, apex, nutrição, resumo, cta. */
export const renderResultadoProtocoloCarousel = (
  content: ResultadoProtocoloContent,
  fotoImg: HTMLImageElement | null,
  w = 1080,
  h = 1350,
): string[] => {
  const handle = content.handle?.startsWith("@")
    ? content.handle
    : `@${(content.handle || "diogo.mell0").replace("@", "")}`;
  const x = px(28);
  const out: string[] = [];

  // 1 — CAPA (foto do coach + resultado)
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = RP_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    if (fotoImg) {
      const scale = Math.max(w / fotoImg.width, h / fotoImg.height);
      const dw = fotoImg.width * scale;
      const dh = fotoImg.height * scale;
      ctx.drawImage(fotoImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
      const grad = ctx.createLinearGradient(0, h * 0.35, 0, h);
      grad.addColorStop(0, "rgba(10,10,10,0)");
      grad.addColorStop(0.45, "rgba(10,10,10,0.55)");
      grad.addColorStop(1, "rgba(10,10,10,0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      orb(ctx, w - px(30), h - px(40), px(125), RP_TPL.gold);
    }
    let y = px(64);
    y = pill(ctx, content.capa.tag, x, y, { bg: RP_TPL.gold, color: RP_TPL.bg });
    y += px(50);
    y = pill(ctx, content.focoLabel, x, y, { color: RP_TPL.ink, border: `${RP_TPL.ink}40` });
    y += px(36);
    y = drawRich(ctx, content.capa.titulo, x, y, {
      size: 26, weight: 900, color: RP_TPL.ink, accent: RP_TPL.gold,
      lineHeight: 1.08, maxWidth: w - x * 2, hiWeight: 900,
    });
    y += px(16);
    drawRich(ctx, content.capa.subtitulo, x, y, {
      size: 12, weight: 300, color: RP_TPL.soft, accent: RP_TPL.gold, lineHeight: 1.6, maxWidth: w - x * 2,
    });
    ctx.font = font(500, 11);
    ctx.fillStyle = RP_TPL.gold;
    ctx.fillText("ARRASTA PRA VER O PROTOCOLO ▸", x, slideContentBottom(h) - px(8));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 2 — O QUE MUDOU
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = RP_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, px(20), h - px(60), px(125), RP_TPL.green);
    let y = px(64);
    y = pill(ctx, "O RESULTADO", x, y, { color: RP_TPL.green, border: `${RP_TPL.green}40` });
    y += px(50);
    y = drawRich(ctx, content.resultado.titulo, x, y, {
      size: 22, weight: 900, color: RP_TPL.ink, accent: RP_TPL.green, lineHeight: 1.2, maxWidth: w - x * 2,
    });
    y += px(20);
    if (content.resultado.numero) {
      ctx.font = font(900, 44);
      ctx.fillStyle = RP_TPL.green;
      ctx.fillText(content.resultado.numero, x, y + px(38));
      if (content.resultado.numeroLabel) {
        ctx.font = font(400, 10);
        ctx.fillStyle = RP_TPL.muted;
        ctx.fillText(content.resultado.numeroLabel.toUpperCase(), x, y + px(58));
      }
      y += px(84);
    }
    ctx.fillStyle = `${RP_TPL.green}66`;
    ctx.fillRect(x, y - px(14), px(40), px(1.5));
    y += px(16);
    drawRich(ctx, content.resultado.corpo, x, y, {
      size: 12, weight: 300, color: RP_TPL.muted, accent: RP_TPL.green, lineHeight: 1.7, maxWidth: w - x * 2, hiWeight: 700,
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 3 — O TREINO
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = RP_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(30), px(30), px(140), RP_TPL.purple);
    let y = px(64);
    y = pill(ctx, "O TREINO", x, y, { color: RP_TPL.purple, border: `${RP_TPL.purple}40` });
    y += px(50);
    y = drawRich(ctx, content.treino.nome, x, y, {
      size: 20, weight: 900, color: RP_TPL.ink, accent: RP_TPL.purple, lineHeight: 1.25, maxWidth: w - x * 2,
    });
    y += px(22);
    ctx.font = font(700, 12);
    ctx.fillStyle = RP_TPL.purple;
    ctx.fillText(`⏱ ${content.treino.duracao}`, x, y);
    y += px(34);
    let cx = x;
    let cy = y;
    for (const grupo of content.treino.grupos) {
      ctx.font = font(700, 9.5);
      const label = grupo.toUpperCase();
      const wch = ctx.measureText(label).width + px(20);
      if (cx + wch > w - x && cx > x) {
        cx = x;
        cy += px(34);
      }
      roundRect(ctx, cx, cy, wch, px(24), px(12));
      ctx.fillStyle = `${RP_TPL.purple}20`;
      ctx.fill();
      ctx.lineWidth = px(1);
      ctx.strokeStyle = `${RP_TPL.purple}55`;
      ctx.stroke();
      ctx.fillStyle = RP_TPL.purple;
      ctx.textBaseline = "middle";
      ctx.fillText(label, cx + px(10), cy + px(12.5));
      ctx.textBaseline = "alphabetic";
      cx += wch + px(8);
    }
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 4 — AQUECIMENTO
  out.push(
    listSlide(
      "AQUECIMENTO",
      "Antes da carga, o corpo é preparado",
      content.aquecimento.map((a) => ({ titulo: a.nome, detail: a.detail })),
      RP_TPL.gold,
      handle,
      w,
      h,
    ),
  );

  // 5, 6 — EXERCÍCIOS (sempre 2 slides, mesmo com poucos itens)
  const grupos = chunk(content.exercicios, 2);
  out.push(exerciciosSlide(1, grupos[0] || [], RP_TPL.green, handle, w, h));
  out.push(exerciciosSlide(2, grupos[1] || [], RP_TPL.green, handle, w, h));

  // 7 — MÉTODO APEX
  out.push(
    listSlide(
      content.apex.nome.toUpperCase(),
      "O sistema por trás de cada série",
      content.apex.principios.map((p) => ({ titulo: p })),
      RP_TPL.purple,
      handle,
      w,
      h,
    ),
  );

  // 8 — NUTRIÇÃO / DISCIPLINA
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = RP_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(20), h / 2, px(140), RP_TPL.green);
    let y = px(64);
    y = pill(ctx, "SUSTENTA O RESULTADO", x, y, { bg: `${RP_TPL.green}20`, color: RP_TPL.green, border: `${RP_TPL.green}40` });
    y += px(50);
    y = drawRich(ctx, content.nutricao.titulo, x, y, {
      size: 19, weight: 900, color: RP_TPL.ink, accent: RP_TPL.green, lineHeight: 1.25, maxWidth: w - x * 2,
    });
    y += px(20);
    drawRich(ctx, content.nutricao.corpo, x, y, {
      size: 12, weight: 300, color: RP_TPL.muted, accent: RP_TPL.green, lineHeight: 1.7, maxWidth: w - x * 2, hiWeight: 700,
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 9 — RESUMO
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = RP_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w / 2, px(20), px(160), RP_TPL.gold);
    let y = px(64);
    y = pill(ctx, "RESUMO", x, y, { color: RP_TPL.gold, border: `${RP_TPL.gold}40` });
    y += px(56);
    y = drawRich(ctx, content.resumo.protocolo, x, y, {
      size: 16, weight: 300, color: RP_TPL.soft, accent: RP_TPL.gold, lineHeight: 1.5, maxWidth: w - x * 2, hiWeight: 700,
    });
    y += px(24);
    ctx.fillStyle = RP_TPL.gold;
    ctx.fillRect(x, y, px(40), px(2));
    y += px(30);
    drawRich(ctx, content.resumo.frase, x, y, {
      size: 20, weight: 900, color: RP_TPL.ink, accent: RP_TPL.gold, lineHeight: 1.3, maxWidth: w - x * 2, hiWeight: 900,
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 10 — CTA (fixo)
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = RP_TPL.gold;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(30), h - px(40), px(125), "#0A0A0A");
    let y = px(64);
    y = pill(ctx, RP_CTA_SLIDE.tag, x, y, { bg: RP_TPL.bg, color: RP_TPL.gold });
    y += px(56);
    y = drawRich(ctx, RP_CTA_SLIDE.titulo, x, y, {
      size: 24, weight: 900, color: RP_TPL.bg, accent: RP_TPL.bg, lineHeight: 1.15, maxWidth: w - x * 2,
    });
    y += px(14);
    y = drawRich(ctx, RP_CTA_SLIDE.subtitulo, x, y, {
      size: 13, weight: 400, color: RP_TPL.ctaSub, accent: RP_TPL.ctaSub, lineHeight: 1.5, maxWidth: w - x * 2,
    });
    y += px(28);
    const boxH = px(58);
    roundRect(ctx, x, y, w - x * 2, boxH, px(8));
    ctx.fillStyle = RP_TPL.bg;
    ctx.fill();
    ctx.font = font(700, 14);
    ctx.fillStyle = RP_TPL.gold;
    ctx.fillText(RP_CTA_SLIDE.caixa, x + px(16), y + px(26));
    ctx.font = font(400, 10);
    ctx.fillStyle = RP_TPL.muted;
    ctx.fillText(RP_CTA_SLIDE.caixaSub, x + px(16), y + px(44));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  return out;
};

export const RP_SLIDE_LABELS = [
  "Capa", "Resultado", "O treino", "Aquecimento", "Exercícios 1",
  "Exercícios 2", "Método APEX", "Sustenta o resultado", "Resumo", "CTA",
];
