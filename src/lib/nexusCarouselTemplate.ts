/**
 * Template proprietário "NEXUS-BIO" — carrossel científico de 8 a 10 slides
 * em 4:5 (1080 x 1350). Usado SOMENTE por conteúdo originado do PeptideVault
 * e do MicrobiotaVault. Nada de pilares M / C / E aqui: o foco é ciência.
 *
 * Nos textos, trechos entre **asteriscos duplos** saem destacados na cor de
 * acento do slide.
 */

export const NEXUS_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#888888",
  soft: "#CCCCCC",
  accent: "#00D4AA",
  accentAlt: "#7C6BF0",
  danger: "#EF4444",
  warning: "#EAB308",
  approved: "#22C55E",
  research: "#3B82F6",
  experimental: "#F97316",
  footerMuted: "#666666",
  ctaSub: "#04352C",
  ctaHandle: "#046B58",
} as const;

export type NexusStatus = "APROVADO" | "PESQUISA" | "EXPERIMENTAL";
export type NexusEvidencia = "FORTE" | "MODERADA" | "PRELIMINAR";

export const NEXUS_STATUS_COLOR: Record<NexusStatus, string> = {
  APROVADO: NEXUS_TPL.approved,
  PESQUISA: NEXUS_TPL.research,
  EXPERIMENTAL: NEXUS_TPL.experimental,
};

const EVID_COLOR: Record<NexusEvidencia, string> = {
  FORTE: NEXUS_TPL.approved,
  MODERADA: NEXUS_TPL.warning,
  PRELIMINAR: NEXUS_TPL.experimental,
};

export type NexusCarouselContent = {
  composto: string;
  slide1_titulo: string;
  slide1_classe: string;
  slide1_status: NexusStatus;
  slide2_oque: string;
  slide2_traducao: string;
  slide3_mecanismo: string;
  slide3_analogia: string;
  slide4_beneficios: string[];
  slide5_riscos: string[];
  slide5_nao_indicado: string;
  slide6_comparativo_com?: string;
  slide6_comparativo?: { criterio: string; composto1: string; composto2: string }[];
  slide7_evidencia: NexusEvidencia;
  slide7_estudos: string[];
  slide7_regulatorio: string;
  slide8_pratica: string[];
  slide9_resumo: { oque: string; funciona: string; beneficio_principal: string; risco_principal: string };
  legenda?: string;
  handle?: string;
};

export const NEXUS_CTA_SLIDE = {
  tag: "PRÓXIMO PASSO",
  titulo: "Quer entender se faz sentido no seu caso?",
  subtitulo: "Salva esse post e manda pra alguém que precisa ver.",
  caixa: "Diagnóstico gratuito — link na bio",
  caixaSub: "14 perguntas · 4 minutos · resultado imediato",
  disclaimer: "⚕️ Informação educacional. Consulte seu médico.",
} as const;

const S = 3; // 360px de referência → 1080px reais
const px = (v: number) => v * S;

const font = (weight: number, size: number) =>
  `${weight} ${px(size)}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

type Token = { text: string; hi: boolean };

const tokenize = (text: string): Token[] =>
  text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**") ? { text: part.slice(2, -2), hi: true } : { text: part, hi: false },
    );

type RichOpts = {
  size: number;
  weight: number;
  color: string;
  accent: string;
  lineHeight: number;
  maxWidth: number;
  hiWeight?: number;
  align?: "left" | "center";
};

const drawRich = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: RichOpts) => {
  const lh = px(o.size) * o.lineHeight;
  const words: Token[] = [];
  for (const token of tokenize(text || "")) {
    for (const word of token.text.split(/\s+/)) if (word) words.push({ text: word, hi: token.hi });
  }
  const styleFor = (hi: boolean) =>
    `${hi ? o.hiWeight || o.weight : o.weight} ${px(o.size)}px Inter, system-ui, sans-serif`;

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
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** Grade científica sutil no fundo. */
const grid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.strokeStyle = NEXUS_TPL.accent;
  ctx.lineWidth = 1;
  const step = px(30);
  for (let gx = step; gx < w; gx += step) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = step; gy < h; gy += step) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }
  ctx.restore();
};

const pill = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: { bg?: string; color: string; border?: string; size?: number },
) => {
  const label = (text || "").toUpperCase();
  const size = opts.size ?? 8;
  ctx.font = font(700, size);
  const spacing = px(0.2 * size);
  const chars = [...label];
  const textW = chars.reduce((sum, c) => sum + ctx.measureText(c).width + spacing, 0);
  const h = px(size + 14);
  const w = textW + px(24);
  roundRect(ctx, x, y, w, h, h / 2);
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

/** Badge de status no canto superior direito, presente em todos os slides. */
const statusBadge = (ctx: CanvasRenderingContext2D, w: number, status: NexusStatus, dark = false) => {
  const color = dark ? "#0A0A0A" : NEXUS_STATUS_COLOR[status] || NEXUS_TPL.accent;
  const label = status;
  ctx.font = font(700, 8);
  const spacing = px(1.6);
  const chars = [...label];
  const textW = chars.reduce((sum, c) => sum + ctx.measureText(c).width + spacing, 0);
  const boxW = textW + px(22);
  const boxH = px(20);
  const x = w - px(28) - boxW;
  const y = px(64);
  roundRect(ctx, x, y, boxW, boxH, boxH / 2);
  ctx.fillStyle = dark ? "rgba(10,10,10,0.12)" : `${color}1F`;
  ctx.fill();
  ctx.lineWidth = px(1);
  ctx.strokeStyle = dark ? "rgba(10,10,10,0.45)" : `${color}66`;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  let cx = x + px(11);
  for (const c of chars) {
    ctx.fillText(c, cx, y + boxH / 2 + px(0.5));
    cx += ctx.measureText(c).width + spacing;
  }
  ctx.textBaseline = "alphabetic";
};

const footer = (ctx: CanvasRenderingContext2D, w: number, h: number, handle: string, dark = false) => {
  const x = px(28);
  const y = h - px(30);
  ctx.textBaseline = "alphabetic";
  ctx.font = font(700, 13);
  ctx.fillStyle = dark ? "#0A0A0A" : NEXUS_TPL.ink;
  ctx.fillText("🧬 nutri", x, y);
  const baseW = ctx.measureText("🧬 nutri").width;
  ctx.font = `italic 700 ${px(13)}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = dark ? "#0A0A0A" : NEXUS_TPL.accent;
  ctx.fillText("ON", x + baseW, y);
  const onW = ctx.measureText("ON").width;
  ctx.font = font(400, 9);
  ctx.fillStyle = dark ? NEXUS_TPL.ctaHandle : NEXUS_TPL.footerMuted;
  ctx.fillText("  |  NEXUS-BIO", x + baseW + onW, y);

  ctx.textAlign = "right";
  ctx.fillText(handle, w - x, y);
  ctx.textAlign = "left";
};

const canvasOf = (w: number, h: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  return { canvas, ctx };
};

type SlideCtx = { w: number; h: number; handle: string; status: NexusStatus };

const baseSlide = (s: SlideCtx, orbColor = NEXUS_TPL.accent) => {
  const { canvas, ctx } = canvasOf(s.w, s.h);
  ctx.fillStyle = NEXUS_TPL.bg;
  ctx.fillRect(0, 0, s.w, s.h);
  grid(ctx, s.w, s.h);
  orb(ctx, s.w - px(30), s.h - px(60), px(140), orbColor);
  statusBadge(ctx, s.w, s.status);
  return { canvas, ctx };
};

/** Lista com bullets coloridos. Retorna o Y final. */
const bulletList = (
  ctx: CanvasRenderingContext2D,
  items: string[],
  x: number,
  y: number,
  o: { color: string; maxWidth: number; size?: number; marker?: string },
) => {
  let cursor = y;
  for (const item of items) {
    ctx.font = font(900, o.size ?? 11);
    ctx.fillStyle = o.color;
    ctx.fillText(o.marker ?? "▸", x, cursor);
    cursor = drawRich(ctx, item, x + px(18), cursor, {
      size: o.size ?? 11,
      weight: 400,
      color: NEXUS_TPL.soft,
      accent: o.color,
      lineHeight: 1.7,
      maxWidth: o.maxWidth - px(18),
      hiWeight: 800,
    });
    cursor += px(10);
  }
  return cursor;
};

const sectionTitle = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, w: number) => {
  const end = drawRich(ctx, text, x, y, {
    size: 24, weight: 900, color: NEXUS_TPL.ink, accent: color, lineHeight: 1.1, maxWidth: w - x * 2, hiWeight: 900,
  });
  ctx.fillStyle = color;
  ctx.fillRect(x, end + px(6), px(40), px(2));
  return end + px(34);
};

/** Renderiza o carrossel NEXUS-BIO (9 ou 10 slides) em 1080x1350. */
export const renderNexusCarousel = (content: NexusCarouselContent, w = 1080, h = 1350): string[] => {
  const handle = content.handle?.startsWith("@")
    ? content.handle
    : `@${(content.handle || "diogo.mell0").replace("@", "")}`;
  const status: NexusStatus = (["APROVADO", "PESQUISA", "EXPERIMENTAL"] as const).includes(content.slide1_status)
    ? content.slide1_status
    : "PESQUISA";
  const s: SlideCtx = { w, h, handle, status };
  const x = px(28);
  const maxW = w - x * 2;
  const out: string[] = [];
  const A = NEXUS_TPL.accent;

  // 1 — CAPA
  {
    const { canvas, ctx } = baseSlide(s);
    orb(ctx, px(10), px(60), px(150), NEXUS_TPL.accentAlt);
    let y = px(64);
    y = pill(ctx, content.slide1_classe || "COMPOSTO", x, y, { bg: `${A}1F`, color: A, border: `${A}66` });
    y += px(74);
    ctx.font = font(900, 40);
    ctx.fillStyle = A;
    ctx.fillText("🧬", x, y - px(38));
    y = drawRich(ctx, content.composto, x, y, {
      size: 34, weight: 900, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.05, maxWidth: maxW, hiWeight: 900,
    });
    y += px(16);
    drawRich(ctx, content.slide1_titulo, x, y, {
      size: 15, weight: 300, color: NEXUS_TPL.soft, accent: A, lineHeight: 1.55, maxWidth: maxW, hiWeight: 700,
    });
    ctx.font = font(500, 11);
    ctx.fillStyle = A;
    ctx.fillText("ARRASTA PRA CIÊNCIA ▸", x, h - px(62));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 2 — O QUE É
  {
    const { canvas, ctx } = baseSlide(s);
    let y = px(112);
    y = sectionTitle(ctx, "O QUE É", x, y, A, w);
    y = drawRich(ctx, content.slide2_oque, x, y, {
      size: 14, weight: 400, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.65, maxWidth: maxW, hiWeight: 800,
    });
    y += px(26);
    const boxTop = y - px(18);
    const boxEnd = drawRich(ctx, content.slide2_traducao, x + px(16), y + px(16), {
      size: 12, weight: 300, color: NEXUS_TPL.soft, accent: A, lineHeight: 1.7, maxWidth: maxW - px(32), hiWeight: 700,
    });
    roundRect(ctx, x, boxTop, maxW, boxEnd - boxTop + px(4), px(10));
    ctx.strokeStyle = `${NEXUS_TPL.accentAlt}59`;
    ctx.lineWidth = px(1);
    ctx.stroke();
    ctx.font = font(700, 8);
    ctx.fillStyle = NEXUS_TPL.accentAlt;
    ctx.fillText("TRADUÇÃO", x + px(16), boxTop + px(14));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 3 — COMO FUNCIONA
  {
    const { canvas, ctx } = baseSlide(s, NEXUS_TPL.accentAlt);
    let y = px(112);
    y = sectionTitle(ctx, "COMO FUNCIONA", x, y, NEXUS_TPL.accentAlt, w);
    y = drawRich(ctx, content.slide3_mecanismo, x, y, {
      size: 13, weight: 400, color: NEXUS_TPL.ink, accent: NEXUS_TPL.accentAlt,
      lineHeight: 1.7, maxWidth: maxW, hiWeight: 800,
    });
    y += px(34);
    ctx.font = font(700, 8);
    ctx.fillStyle = A;
    ctx.fillText("NA PRÁTICA, É COMO SE...", x, y);
    y += px(24);
    drawRich(ctx, content.slide3_analogia, x, y, {
      size: 18, weight: 900, color: A, accent: A, lineHeight: 1.35, maxWidth: maxW,
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 4 — BENEFÍCIOS
  {
    const { canvas, ctx } = baseSlide(s, NEXUS_TPL.approved);
    let y = px(112);
    y = sectionTitle(ctx, "O QUE A CIÊNCIA MOSTRA", x, y, NEXUS_TPL.approved, w);
    bulletList(ctx, (content.slide4_beneficios || []).slice(0, 5), x, y, {
      color: NEXUS_TPL.approved, maxWidth: maxW, size: 12, marker: "✓",
    });
    ctx.font = font(300, 9);
    ctx.fillStyle = NEXUS_TPL.footerMuted;
    ctx.fillText("Dados de estudos citados. Resultados variam entre indivíduos.", x, h - px(62));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 5 — O QUE NINGUÉM FALA
  {
    const { canvas, ctx } = baseSlide(s, NEXUS_TPL.danger);
    let y = px(112);
    y = sectionTitle(ctx, "O QUE NINGUÉM FALA", x, y, NEXUS_TPL.danger, w);
    y = bulletList(ctx, (content.slide5_riscos || []).slice(0, 5), x, y, {
      color: NEXUS_TPL.danger, maxWidth: maxW, size: 12, marker: "▲",
    });
    y += px(14);
    const boxTop = y;
    const boxEnd = drawRich(ctx, content.slide5_nao_indicado, x + px(16), y + px(34), {
      size: 12, weight: 400, color: NEXUS_TPL.soft, accent: NEXUS_TPL.danger,
      lineHeight: 1.6, maxWidth: maxW - px(32), hiWeight: 800,
    });
    roundRect(ctx, x, boxTop, maxW, boxEnd - boxTop + px(6), px(10));
    ctx.fillStyle = `${NEXUS_TPL.danger}14`;
    ctx.fill();
    ctx.strokeStyle = `${NEXUS_TPL.danger}59`;
    ctx.lineWidth = px(1);
    ctx.stroke();
    ctx.font = font(700, 8);
    ctx.fillStyle = NEXUS_TPL.danger;
    ctx.fillText("NÃO É INDICADO PARA", x + px(16), boxTop + px(20));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 6 — COMPARATIVO (opcional)
  if (content.slide6_comparativo?.length && content.slide6_comparativo_com) {
    const { canvas, ctx } = baseSlide(s, NEXUS_TPL.accentAlt);
    let y = px(112);
    y = sectionTitle(ctx, "COMPARATIVO", x, y, NEXUS_TPL.accentAlt, w);
    const colW = (maxW - px(90)) / 2;
    const c1X = x + px(90);
    const c2X = c1X + colW + px(8);

    ctx.font = font(700, 10);
    ctx.fillStyle = A;
    ctx.fillText(content.composto.slice(0, 16), c1X, y);
    ctx.fillStyle = NEXUS_TPL.accentAlt;
    ctx.fillText(content.slide6_comparativo_com.slice(0, 16), c2X, y);
    y += px(18);

    for (const row of content.slide6_comparativo.slice(0, 5)) {
      const rowTop = y;
      ctx.font = font(700, 9);
      ctx.fillStyle = NEXUS_TPL.muted;
      ctx.fillText(row.criterio.toUpperCase().slice(0, 14), x, y + px(14));
      const e1 = drawRich(ctx, row.composto1, c1X, y + px(14), {
        size: 11, weight: 400, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.5, maxWidth: colW - px(8),
      });
      const e2 = drawRich(ctx, row.composto2, c2X, y + px(14), {
        size: 11, weight: 400, color: NEXUS_TPL.soft, accent: NEXUS_TPL.accentAlt, lineHeight: 1.5, maxWidth: colW - px(8),
      });
      y = Math.max(e1, e2) + px(10);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y - px(4));
      ctx.lineTo(w - x, y - px(4));
      ctx.stroke();
      if (rowTop === y) y += px(20);
    }
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 7 — EVIDÊNCIA CIENTÍFICA
  {
    const { canvas, ctx } = baseSlide(s);
    const evid: NexusEvidencia = (["FORTE", "MODERADA", "PRELIMINAR"] as const).includes(content.slide7_evidencia)
      ? content.slide7_evidencia
      : "PRELIMINAR";
    const evColor = EVID_COLOR[evid];
    let y = px(112);
    y = sectionTitle(ctx, "EVIDÊNCIA CIENTÍFICA", x, y, A, w);
    ctx.font = font(300, 10);
    ctx.fillStyle = NEXUS_TPL.muted;
    ctx.fillText("NÍVEL DE EVIDÊNCIA", x, y);
    y += px(38);
    ctx.font = font(900, 30);
    ctx.fillStyle = evColor;
    ctx.fillText(evid, x, y);
    y += px(20);
    const barW = maxW;
    const fill = evid === "FORTE" ? 1 : evid === "MODERADA" ? 0.62 : 0.32;
    roundRect(ctx, x, y, barW, px(6), px(3));
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fill();
    roundRect(ctx, x, y, barW * fill, px(6), px(3));
    ctx.fillStyle = evColor;
    ctx.fill();
    y += px(40);

    ctx.font = font(700, 9);
    ctx.fillStyle = NEXUS_TPL.accentAlt;
    ctx.fillText("PRINCIPAIS ESTUDOS", x, y);
    y += px(22);
    y = bulletList(ctx, (content.slide7_estudos || []).slice(0, 4), x, y, {
      color: NEXUS_TPL.accentAlt, maxWidth: maxW, size: 11, marker: "📄",
    });

    y += px(10);
    ctx.font = font(700, 9);
    ctx.fillStyle = NEXUS_TPL.muted;
    ctx.fillText("STATUS REGULATÓRIO", x, y);
    y += px(20);
    drawRich(ctx, content.slide7_regulatorio, x, y, {
      size: 12, weight: 400, color: NEXUS_TPL.soft, accent: A, lineHeight: 1.6, maxWidth: maxW, hiWeight: 800,
    });
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 8 — NA PRÁTICA
  {
    const { canvas, ctx } = baseSlide(s);
    let y = px(112);
    y = sectionTitle(ctx, "NA PRÁTICA", x, y, A, w);
    y = bulletList(ctx, (content.slide8_pratica || []).slice(0, 4), x, y, {
      color: A, maxWidth: maxW, size: 12, marker: "→",
    });
    y += px(18);
    const boxTop = y;
    const boxEnd = drawRich(
      ctx,
      "Qualquer protocolo precisa de **acompanhamento profissional integrado** — avaliação antes, monitoramento durante.",
      x + px(16),
      y + px(24),
      { size: 11, weight: 300, color: NEXUS_TPL.muted, accent: A, lineHeight: 1.7, maxWidth: maxW - px(32), hiWeight: 700 },
    );
    roundRect(ctx, x, boxTop, maxW, boxEnd - boxTop + px(4), px(10));
    ctx.strokeStyle = `${A}40`;
    ctx.lineWidth = px(1);
    ctx.stroke();
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 9 — RESUMO VISUAL
  {
    const { canvas, ctx } = baseSlide(s, NEXUS_TPL.accentAlt);
    let y = px(112);
    y = sectionTitle(ctx, "RESUMO", x, y, A, w);
    const rows: { label: string; value: string; color: string }[] = [
      { label: "O QUE É", value: content.slide9_resumo?.oque || content.slide2_oque, color: A },
      { label: "COMO FUNCIONA", value: content.slide9_resumo?.funciona || content.slide3_analogia, color: NEXUS_TPL.accentAlt },
      { label: "BENEFÍCIO PRINCIPAL", value: content.slide9_resumo?.beneficio_principal || (content.slide4_beneficios || [])[0] || "", color: NEXUS_TPL.approved },
      { label: "RISCO PRINCIPAL", value: content.slide9_resumo?.risco_principal || (content.slide5_riscos || [])[0] || "", color: NEXUS_TPL.danger },
    ];
    for (const row of rows) {
      const top = y;
      ctx.font = font(700, 8);
      ctx.fillStyle = row.color;
      ctx.fillText(row.label, x + px(16), y + px(20));
      const end = drawRich(ctx, row.value, x + px(16), y + px(42), {
        size: 12, weight: 400, color: NEXUS_TPL.ink, accent: row.color,
        lineHeight: 1.55, maxWidth: maxW - px(32), hiWeight: 800,
      });
      const boxH = end - top + px(2);
      roundRect(ctx, x, top, maxW, boxH, px(10));
      ctx.fillStyle = `${row.color}12`;
      ctx.fill();
      ctx.strokeStyle = `${row.color}3D`;
      ctx.lineWidth = px(1);
      ctx.stroke();
      ctx.fillStyle = row.color;
      ctx.fillRect(x, top + px(10), px(3), boxH - px(20));
      y = top + boxH + px(14);
    }
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 10 — CTA
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = A;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(30), h - px(40), px(130), "#0A0A0A");
    statusBadge(ctx, w, status, true);
    let y = px(64);
    y = pill(ctx, NEXUS_CTA_SLIDE.tag, x, y, { bg: NEXUS_TPL.bg, color: A });
    y += px(60);
    y = drawRich(ctx, NEXUS_CTA_SLIDE.titulo, x, y, {
      size: 26, weight: 900, color: NEXUS_TPL.bg, accent: NEXUS_TPL.bg, lineHeight: 1.12, maxWidth: maxW,
    });
    y += px(16);
    y = drawRich(ctx, NEXUS_CTA_SLIDE.subtitulo, x, y, {
      size: 13, weight: 400, color: NEXUS_TPL.ctaSub, accent: NEXUS_TPL.ctaSub, lineHeight: 1.5, maxWidth: maxW,
    });

    y += px(28);
    const boxH = px(58);
    roundRect(ctx, x, y, maxW, boxH, px(8));
    ctx.fillStyle = NEXUS_TPL.bg;
    ctx.fill();
    ctx.font = font(700, 13);
    ctx.fillStyle = A;
    ctx.fillText(NEXUS_CTA_SLIDE.caixa, x + px(16), y + px(26));
    ctx.font = font(400, 10);
    ctx.fillStyle = NEXUS_TPL.muted;
    ctx.fillText(NEXUS_CTA_SLIDE.caixaSub, x + px(16), y + px(44));

    ctx.font = font(400, 10);
    ctx.fillStyle = NEXUS_TPL.ctaHandle;
    ctx.fillText(NEXUS_CTA_SLIDE.disclaimer, x, h - px(62));

    footer(ctx, w, h, handle, true);
    out.push(canvas.toDataURL("image/png"));
  }

  return out;
};

/** Rótulos dos slides gerados, na mesma ordem do array de imagens. */
export const nexusSlideLabels = (content: NexusCarouselContent): string[] => {
  const base = ["CAPA", "O QUE É", "MECANISMO", "BENEFÍCIOS", "RISCOS"];
  if (content.slide6_comparativo?.length && content.slide6_comparativo_com) base.push("COMPARATIVO");
  return [...base, "EVIDÊNCIA", "NA PRÁTICA", "RESUMO", "CTA"];
};

/** Escolhe o template certo pela origem do conteúdo. Nunca misturar. */
export const getTemplate = (origem?: string | null): "NEXUS_BIO" | "MCE" => {
  switch (origem) {
    case "PeptideVault":
    case "MicrobiotaVault":
    case "peptide":
    case "microbiota":
      return "NEXUS_BIO";
    default:
      return "MCE";
  }
};
