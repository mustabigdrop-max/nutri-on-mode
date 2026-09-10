/**
 * Template proprietário "NEXUS-BIO" — carrossel científico de 10 slides em 4:5
 * (1080 x 1350). Usado SOMENTE por conteúdo originado do PeptideVault e do
 * MicrobiotaVault. Nada de pilares M / C / E aqui: o foco é ciência.
 *
 * A paleta é EXATAMENTE a mesma do template MCE (feed coeso). O que muda é a
 * estrutura (ficha técnica, números grandes, tabela comparativa, perguntas pro
 * médico) e o conteúdo.
 *
 * Nos textos, trechos entre **asteriscos duplos** saem destacados no acento.
 */

import { beginSlideContent, chunk, drawSlideFooter, limitWords, slideContentBottom } from "@/lib/slideBase";

export const NEXUS_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#888888",
  soft: "#CCCCCC",
  accent: "#EF9F27",
  accentAlt: "#AFA9EC",
  green: "#5DCAA5",
  footerMuted: "#666666",
  ctaSub: "#412402",
  ctaHandle: "#633806",
} as const;

export type NexusStatus = "APROVADO" | "PESQUISA" | "EXPERIMENTAL";
export type NexusEvidencia = "FORTE" | "MODERADA" | "PRELIMINAR";

export const NEXUS_STATUS_COLOR: Record<NexusStatus, string> = {
  APROVADO: NEXUS_TPL.green,
  PESQUISA: NEXUS_TPL.accent,
  EXPERIMENTAL: NEXUS_TPL.accentAlt,
};

const EVID_FILL: Record<NexusEvidencia, number> = { FORTE: 1, MODERADA: 0.62, PRELIMINAR: 0.32 };

export type NexusFicha = {
  composto?: string;
  classe?: string;
  meia_vida?: string;
  via?: string;
  aprovacao_fda?: string;
  anvisa?: string;
  fabricante?: string;
  dose_estudada?: string;

  nivel_evidencia?: NexusEvidencia;
  num_estudos?: string;
};

export type NexusBeneficio = { numero: string; desc: string; estudo?: string; n?: string };
export type NexusRisco = { risco: string; contexto?: string };
export type NexusLinhaTabela = { criterio: string; composto1: string; composto2: string };

export type NexusCarouselContent = {
  composto: string;
  origem?: "PeptideVault" | "MicrobiotaVault" | "SteroidVault";
  slide1_gancho: string;
  slide1_classe: string;
  slide1_status: NexusStatus;
  slide2_ficha: NexusFicha;
  slide3_mecanismo: { passos: string[]; traducao_leiga: string };
  slide4_beneficios: NexusBeneficio[];
  slide5_riscos: NexusRisco[];
  slide5_nao_indicado?: string;
  slide6_comparativo_nome?: string;
  slide6_tabela?: NexusLinhaTabela[];
  slide7_faz_sentido: string[];
  slide7_nao_faz_sentido: string[];
  slide8_perguntas_medico: string[];
  slide9_resumo: {
    oque: string;
    beneficio: string;
    risco: string;
    evidencia: NexusEvidencia;
    custo?: string;
    veredicto: string;
  };
  legenda?: string;
  handle?: string;
};

export const NEXUS_CTA_SLIDE = {
  titulo: "Só o nutriON traduz ciência de verdade.",
  subtitulo: "Evidência real. Sem achismo.",
  caixa: "DIAGNÓSTICO GRATUITO",
  caixaSub: "Link na bio · 14 perguntas · 4 minutos",
  disclaimer: "⚕️ Informação educacional. Não constitui prescrição. Consulte seu médico.",
} as const;

const S = 3; // 360px de referência → 1080px reais

/** Limites rígidos de conteúdo por slide — o excedente vira slide adicional. */
export const MAX_PASSOS = 3;
export const MAX_PALAVRAS_PASSO = 15;
export const MAX_BENEFICIOS_SLIDE = 2;
export const MAX_BENEFICIOS_TOTAL = 4;
export const MAX_RISCOS_SLIDE = 3;
export const MAX_RISCOS_TOTAL = 6;
export const MAX_PERGUNTAS_SLIDE = 3;
export const MAX_PERGUNTAS_TOTAL = 6;
export const MAX_LINHAS_RESUMO = 5;
const px = (v: number) => v * S;

const font = (weight: number, size: number) =>
  `${weight} ${px(size)}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

type Token = { text: string; hi: boolean };

const tokenize = (text: string): Token[] =>
  (text || "")
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
  italic?: boolean;
  align?: "left" | "center";
};

const drawRich = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: RichOpts) => {
  const lh = px(o.size) * o.lineHeight;
  const words: Token[] = [];
  for (const token of tokenize(text)) {
    for (const word of token.text.split(/\s+/)) if (word) words.push({ text: word, hi: token.hi });
  }
  const styleFor = (hi: boolean) =>
    `${o.italic ? "italic " : ""}${hi ? o.hiWeight || o.weight : o.weight} ${px(o.size)}px Inter, system-ui, sans-serif`;

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

/** Malha molecular: pontos conectados por linhas finas. Assinatura visual do NEXUS. */
const molecule = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, seed = 1) => {
  const pts: { x: number; y: number }[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + seed;
    const r = radius * (0.42 + ((Math.sin(i * 2.7 + seed) + 1) / 2) * 0.58);
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  ctx.save();
  ctx.strokeStyle = `${NEXUS_TPL.accent}22`;
  ctx.lineWidth = px(0.6);
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d > radius * 0.9) continue;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[j].x, pts[j].y);
      ctx.stroke();
    }
  }
  ctx.fillStyle = `${NEXUS_TPL.accent}40`;
  for (const p of pts) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, px(2.2), 0, Math.PI * 2);
    ctx.fill();
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
  ctx.font = font(700, 8);
  const spacing = px(1.6);
  const chars = [...status];
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

/** Rodapé fixo — delegado ao SlideBase compartilhado (faixa de 100px na base). */
const footer = (ctx: CanvasRenderingContext2D, w: number, h: number, handle: string, dark = false) =>
  drawSlideFooter(ctx, w, h, handle, {
    ink: dark ? NEXUS_TPL.bg : NEXUS_TPL.ink,
    accent: dark ? NEXUS_TPL.bg : NEXUS_TPL.accent,
    handleColor: dark ? NEXUS_TPL.ctaHandle : NEXUS_TPL.footerMuted,
    background: dark ? NEXUS_TPL.accent : NEXUS_TPL.bg,
    scale: S,
  });

/** Referência científica discreta no rodapé do slide. */
const refLine = (ctx: CanvasRenderingContext2D, text: string, x: number, h: number, w: number) => {
  if (!text) return;
  ctx.font = `italic 400 ${px(9)}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = NEXUS_TPL.footerMuted;
  const max = w - x * 2;
  let out = text;
  while (ctx.measureText(out).width > max && out.length > 4) out = out.slice(0, -2);
  ctx.fillText(out === text ? out : `${out}…`, x, slideContentBottom(h) - px(8));
};

const canvasOf = (w: number, h: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  beginSlideContent(ctx, w, h);
  return { canvas, ctx };
};

type SlideCtx = { w: number; h: number; handle: string; status: NexusStatus; vault: string };

const baseSlide = (s: SlideCtx, seed = 1) => {
  const { canvas, ctx } = canvasOf(s.w, s.h);
  ctx.fillStyle = NEXUS_TPL.bg;
  ctx.fillRect(0, 0, s.w, s.h);
  orb(ctx, s.w - px(30), s.h - px(60), px(140), NEXUS_TPL.accent);
  molecule(ctx, s.w - px(40), s.h - px(70), px(110), seed);
  statusBadge(ctx, s.w, s.status);
  return { canvas, ctx };
};

const sectionTitle = (ctx: CanvasRenderingContext2D, tag: string, x: number, y: number) => {
  const end = pill(ctx, tag, x, y, {
    bg: `${NEXUS_TPL.accent}15`,
    color: NEXUS_TPL.accent,
    border: `${NEXUS_TPL.accent}40`,
  });
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
  const vault =
    content.origem === "MicrobiotaVault"
      ? "NEXUS-BIO | MICROBIOTAVAULT"
      : content.origem === "SteroidVault"
        ? "NEXUS-BIO | STEROIDVAULT"
        : "NEXUS-BIO | PEPTIDEVAULT";
  const s: SlideCtx = { w, h, handle, status, vault };
  const x = px(28);
  const maxW = w - x * 2;
  const out: string[] = [];
  const A = NEXUS_TPL.accent;
  const P = NEXUS_TPL.accentAlt;
  const G = NEXUS_TPL.green;

  // 1 — CAPA
  {
    const { canvas, ctx } = canvasOf(w, h);
    ctx.fillStyle = NEXUS_TPL.bg;
    ctx.fillRect(0, 0, w, h);
    orb(ctx, w - px(40), px(120), px(150), A);
    molecule(ctx, w - px(50), px(130), px(130), 0.6);
    orb(ctx, px(20), h - px(80), px(130), A);
    molecule(ctx, px(30), h - px(90), px(110), 2.4);
    statusBadge(ctx, w, status);

    let y = px(64);
    y = pill(ctx, vault, x, y, { bg: A, color: NEXUS_TPL.bg });
    y += px(90);
    y = drawRich(ctx, content.composto, x, y, {
      size: 32, weight: 900, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.05, maxWidth: maxW, hiWeight: 900,
    });
    y += px(6);
    ctx.font = font(300, 12);
    ctx.fillStyle = A;
    ctx.fillText(content.slide1_classe || "", x, y);
    y += px(40);
    drawRich(ctx, content.slide1_gancho, x, y, {
      size: 18, weight: 300, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.45, maxWidth: maxW, hiWeight: 700,
    });
    ctx.font = font(500, 11);
    ctx.fillStyle = A;
    ctx.fillText("ARRASTA PRA CIÊNCIA ▸", x, slideContentBottom(h) - px(8));
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 2 — FICHA TÉCNICA
  {
    const { canvas, ctx } = baseSlide(s, 1.2);
    let y = px(100);
    y = sectionTitle(ctx, "FICHA TÉCNICA", x, y);
    const f = content.slide2_ficha || {};
    const rows: [string, string][] = [
      ["COMPOSTO", f.composto || content.composto],
      ["CLASSE", f.classe || content.slide1_classe],
      ["MEIA-VIDA", f.meia_vida || "—"],
      ["VIA", f.via || "—"],
      ["APROVAÇÃO FDA", f.aprovacao_fda || "—"],
      ["ANVISA", f.anvisa || "—"],
      ["DOSE ESTUDADA", f.dose_estudada || "—"],
      ["FABRICANTE / FONTE", f.fabricante || "—"],

    ].filter(([, v]) => v && v !== "—") as [string, string][];

    const cardTop = y;
    let cy = y + px(26);
    for (const [label, value] of rows) {
      ctx.font = font(700, 8);
      ctx.fillStyle = A;
      ctx.fillText(label, x + px(18), cy);
      const end = drawRich(ctx, value, x + px(150), cy, {
        size: 13, weight: 500, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.35, maxWidth: maxW - px(170),
      });
      cy = Math.max(cy + px(26), end + px(8));
    }

    // Nível de evidência
    const evid: NexusEvidencia = (["FORTE", "MODERADA", "PRELIMINAR"] as const).includes(
      f.nivel_evidencia as NexusEvidencia,
    )
      ? (f.nivel_evidencia as NexusEvidencia)
      : "PRELIMINAR";
    cy += px(14);
    ctx.font = font(700, 8);
    ctx.fillStyle = A;
    ctx.fillText("NÍVEL DE EVIDÊNCIA", x + px(18), cy);
    cy += px(16);
    const barW = maxW - px(36);
    roundRect(ctx, x + px(18), cy, barW, px(8), px(4));
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();
    roundRect(ctx, x + px(18), cy, barW * EVID_FILL[evid], px(8), px(4));
    ctx.fillStyle = evid === "FORTE" ? G : evid === "MODERADA" ? A : P;
    ctx.fill();
    cy += px(28);
    ctx.font = font(900, 16);
    ctx.fillStyle = evid === "FORTE" ? G : evid === "MODERADA" ? A : P;
    ctx.fillText(evid, x + px(18), cy);
    if (f.num_estudos) {
      ctx.font = font(300, 10);
      ctx.fillStyle = NEXUS_TPL.muted;
      ctx.fillText(f.num_estudos, x + px(18) + ctx.measureText(evid).width + px(60), cy);
    }
    cy += px(18);

    roundRect(ctx, x, cardTop, maxW, cy - cardTop, px(14));
    ctx.strokeStyle = `${A}20`;
    ctx.lineWidth = px(1);
    ctx.stroke();

    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 3 — MECANISMO
  {
    const { canvas, ctx } = baseSlide(s, 2.1);
    let y = px(100);
    y = sectionTitle(ctx, "COMO FUNCIONA", x, y);
    const passos = (content.slide3_mecanismo?.passos || []).slice(0, MAX_PASSOS).map((p) => limitWords(p, MAX_PALAVRAS_PASSO));
    passos.forEach((passo, i) => {
      const top = y;
      ctx.font = font(900, 13);
      ctx.fillStyle = A;
      ctx.fillText(String(i + 1).padStart(2, "0"), x + px(16), top + px(26));
      const end = drawRich(ctx, passo, x + px(48), top + px(26), {
        size: 12, weight: 400, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.55, maxWidth: maxW - px(70), hiWeight: 800,
      });
      const boxH = Math.max(px(52), end - top);
      roundRect(ctx, x, top, maxW, boxH, px(12));
      ctx.fillStyle = `${A}0D`;
      ctx.fill();
      ctx.strokeStyle = `${A}26`;
      ctx.lineWidth = px(1);
      ctx.stroke();
      y = top + boxH;
      if (i < passos.length - 1) {
        ctx.strokeStyle = `${A}40`;
        ctx.lineWidth = px(1.4);
        ctx.beginPath();
        ctx.moveTo(x + px(28), y + px(4));
        ctx.lineTo(x + px(28), y + px(16));
        ctx.stroke();
        ctx.fillStyle = `${A}66`;
        ctx.beginPath();
        ctx.moveTo(x + px(24), y + px(14));
        ctx.lineTo(x + px(32), y + px(14));
        ctx.lineTo(x + px(28), y + px(21));
        ctx.closePath();
        ctx.fill();
        y += px(26);
      }
    });

    y += px(30);
    const boxTop = y;
    const boxEnd = drawRich(ctx, content.slide3_mecanismo?.traducao_leiga || "", x + px(16), y + px(22), {
      size: 13, weight: 400, color: NEXUS_TPL.soft, accent: P, lineHeight: 1.6, maxWidth: maxW - px(32), hiWeight: 800,
    });
    roundRect(ctx, x, boxTop, maxW, boxEnd - boxTop + px(6), px(12));
    ctx.strokeStyle = `${P}59`;
    ctx.lineWidth = px(1);
    ctx.stroke();
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 4 — BENEFÍCIOS COM DADOS (máx. 2 por slide)
  {
    const todos = (content.slide4_beneficios || []).slice(0, MAX_BENEFICIOS_TOTAL);
    const grupos: NexusBeneficio[][] = chunk(todos, MAX_BENEFICIOS_SLIDE);
    if (!grupos.length) grupos.push([]);
    grupos.forEach((grupo, gi) => {
      const { canvas, ctx } = baseSlide(s, 3.3);
      let y = px(100);
      y = sectionTitle(ctx, gi === 0 ? "O QUE A CIÊNCIA MOSTRA" : "O QUE A CIÊNCIA MOSTRA (2)", x, y);
      for (const b of grupo) {
        const top = y;
        ctx.font = font(900, 28);
        ctx.fillStyle = A;
        ctx.fillText(b.numero || "•", x + px(18), top + px(44));
        let cy = drawRich(ctx, b.desc || "", x + px(18), top + px(66), {
          size: 11, weight: 400, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.5, maxWidth: maxW - px(36), hiWeight: 800,
        });
        const fonte = [b.estudo, b.n].filter(Boolean).join(" · ");
        if (fonte) {
          ctx.font = `italic 400 ${px(9)}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = NEXUS_TPL.footerMuted;
          ctx.fillText(fonte.slice(0, 72), x + px(18), cy + px(6));
          cy += px(14);
        }
        const boxH = cy - top + px(8);
        roundRect(ctx, x, top, maxW, boxH, px(12));
        ctx.fillStyle = `${A}0A`;
        ctx.fill();
        ctx.strokeStyle = `${A}26`;
        ctx.lineWidth = px(1);
        ctx.stroke();
        y = top + boxH + px(14);
      }
      refLine(ctx, "Dados dos estudos citados. Resultados variam entre indivíduos.", x, h, w);
      footer(ctx, w, h, handle);
      out.push(canvas.toDataURL("image/png"));
    });
  }

  // 5 — O OUTRO LADO (máx. 3 riscos por slide)
  const gruposRiscos = chunk((content.slide5_riscos || []).slice(0, MAX_RISCOS_TOTAL), MAX_RISCOS_SLIDE);
  if (!gruposRiscos.length) gruposRiscos.push([]);
  gruposRiscos.forEach((grupoRisco, ri) => {
    const { canvas, ctx } = baseSlide(s, 4.5);
    let y = px(100);
    y = sectionTitle(ctx, ri === 0 ? "O OUTRO LADO" : "O OUTRO LADO (2)", x, y);
    for (const r of grupoRisco) {

      ctx.font = font(900, 12);
      ctx.fillStyle = A;
      ctx.fillText("✕", x, y);
      y = drawRich(ctx, r.risco || "", x + px(20), y, {
        size: 12, weight: 500, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.5, maxWidth: maxW - px(20), hiWeight: 800,
      });
      if (r.contexto) {
        y = drawRich(ctx, `→ ${r.contexto}`, x + px(20), y + px(4), {
          size: 10, weight: 300, color: NEXUS_TPL.muted, accent: NEXUS_TPL.muted,
          lineHeight: 1.6, maxWidth: maxW - px(20),
        });
      }
      y += px(16);
    }
    if (content.slide5_nao_indicado && ri === gruposRiscos.length - 1) {
      y += px(6);
      const boxTop = y;
      const boxEnd = drawRich(ctx, content.slide5_nao_indicado, x + px(16), y + px(34), {
        size: 11, weight: 400, color: NEXUS_TPL.soft, accent: A, lineHeight: 1.6, maxWidth: maxW - px(32), hiWeight: 800,
      });
      roundRect(ctx, x, boxTop, maxW, boxEnd - boxTop + px(6), px(12));
      ctx.fillStyle = `${A}0D`;
      ctx.fill();
      ctx.strokeStyle = `${A}40`;
      ctx.lineWidth = px(1);
      ctx.stroke();
      ctx.font = font(700, 8);
      ctx.fillStyle = A;
      ctx.fillText("NÃO É INDICADO PARA", x + px(16), boxTop + px(18));
    }
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  });

  // 6 — COMPARATIVO (opcional)
  if (content.slide6_tabela?.length && content.slide6_comparativo_nome) {
    const { canvas, ctx } = baseSlide(s, 5.2);
    let y = px(100);
    y = sectionTitle(ctx, "COMPARATIVO", x, y);
    const labelW = px(84);
    const colW = (maxW - labelW) / 2;
    const c1X = x + labelW;
    const c2X = c1X + colW;

    const headH = px(34);
    roundRect(ctx, x, y, maxW, headH, px(8));
    ctx.fillStyle = `${A}15`;
    ctx.fill();
    ctx.font = font(700, 10);
    ctx.fillStyle = A;
    ctx.fillText(content.composto.slice(0, 18), c1X + px(10), y + px(21));
    ctx.fillStyle = P;
    ctx.fillText(content.slide6_comparativo_nome.slice(0, 18), c2X + px(10), y + px(21));
    y += headH;

    for (const row of content.slide6_tabela.slice(0, 7)) {
      const top = y;
      ctx.font = font(700, 9);
      ctx.fillStyle = NEXUS_TPL.muted;
      ctx.fillText((row.criterio || "").toUpperCase().slice(0, 12), x + px(4), top + px(22));
      const e1 = drawRich(ctx, row.composto1 || "—", c1X + px(10), top + px(22), {
        size: 11, weight: 400, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.45, maxWidth: colW - px(16),
      });
      const e2 = drawRich(ctx, row.composto2 || "—", c2X + px(10), top + px(22), {
        size: 11, weight: 400, color: NEXUS_TPL.soft, accent: P, lineHeight: 1.45, maxWidth: colW - px(16),
      });
      y = Math.max(top + px(36), Math.max(e1, e2) + px(10));
      ctx.strokeStyle = `${A}10`;
      ctx.lineWidth = px(1);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(w - x, y);
      ctx.stroke();
    }
    ctx.strokeStyle = `${A}20`;
    ctx.lineWidth = px(1);
    ctx.beginPath();
    ctx.moveTo(c1X, px(134));
    ctx.lineTo(c1X, y);
    ctx.moveTo(c2X, px(134));
    ctx.lineTo(c2X, y);
    ctx.stroke();
    refLine(ctx, "Comparação baseada em dados publicados de cada composto.", x, h, w);
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 7 — PRA QUEM FAZ SENTIDO
  {
    const { canvas, ctx } = baseSlide(s, 6.1);
    let y = px(100);
    y = sectionTitle(ctx, "NA PRÁTICA", x, y);

    const block = (titulo: string, itens: string[], color: string, marker: string, startY: number) => {
      let cy = startY;
      ctx.font = font(700, 10);
      ctx.fillStyle = color;
      ctx.fillText(titulo, x, cy);
      cy += px(26);
      for (const item of itens.slice(0, 4)) {
        ctx.font = font(900, 10);
        ctx.fillStyle = color;
        ctx.fillText(marker, x, cy);
        cy = drawRich(ctx, item, x + px(18), cy, {
          size: 11, weight: 400, color: NEXUS_TPL.ink, accent: color,
          lineHeight: 1.6, maxWidth: maxW - px(18), hiWeight: 800,
        });
        cy += px(10);
      }
      return cy;
    };

    y = block("PODE FAZER SENTIDO SE", content.slide7_faz_sentido || [], G, "✓", y);
    y += px(24);
    block("NÃO FAZ SENTIDO SE", content.slide7_nao_faz_sentido || [], A, "✕", y);
    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 8 — PERGUNTAS PRO MÉDICO (máx. 3 por slide)
  const gruposPerguntas = chunk((content.slide8_perguntas_medico || []).slice(0, MAX_PERGUNTAS_TOTAL), MAX_PERGUNTAS_SLIDE);
  if (!gruposPerguntas.length) gruposPerguntas.push([]);
  gruposPerguntas.forEach((grupoPergunta, qi) => {
    const { canvas, ctx } = baseSlide(s, 7.4);
    let y = px(100);
    y = sectionTitle(ctx, qi === 0 ? "LEVE PRO SEU MÉDICO" : "LEVE PRO SEU MÉDICO (2)", x, y);
    grupoPergunta.forEach((q, i) => {
      const top = y;
      const end = drawRich(ctx, `“${q}”`, x + px(46), top + px(30), {
        size: 12, weight: 400, color: NEXUS_TPL.ink, accent: A, lineHeight: 1.55, maxWidth: maxW - px(66), hiWeight: 800,
      });
      const boxH = Math.max(px(58), end - top + px(8));
      roundRect(ctx, x, top, maxW, boxH, px(12));
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fill();
      ctx.strokeStyle = `${A}26`;
      ctx.lineWidth = px(1);
      ctx.stroke();
      ctx.font = font(900, 14);
      ctx.fillStyle = A;
      ctx.fillText(String(i + 1), x + px(18), top + px(32));
      y = top + boxH + px(14);
    });
    ctx.font = font(400, 10);
    ctx.fillStyle = NEXUS_TPL.muted;
    ctx.fillText("Salva esse slide e leva na consulta.", x, slideContentBottom(h) - px(8));

    footer(ctx, w, h, handle);
    out.push(canvas.toDataURL("image/png"));
  });

  // 9 — RESUMO VISUAL
  {
    const { canvas, ctx } = baseSlide(s, 8.8);
    let y = px(100);
    y = sectionTitle(ctx, "RESUMO", x, y);
    const r = content.slide9_resumo || ({} as NexusCarouselContent["slide9_resumo"]);
    const cardTop = y;
    let cy = y + px(34);

    ctx.font = font(900, 18);
    ctx.fillStyle = NEXUS_TPL.ink;
    ctx.fillText(content.composto.slice(0, 26).toUpperCase(), x + px(18), cy);
    cy += px(30);

    const line = (label: string, value: string, color: string) => {
      if (!value) return;
      ctx.font = font(700, 8);
      ctx.fillStyle = color;
      ctx.fillText(label, x + px(18), cy);
      cy = drawRich(ctx, value, x + px(18), cy + px(18), {
        size: 12, weight: 400, color: NEXUS_TPL.ink, accent: color,
        lineHeight: 1.5, maxWidth: maxW - px(36), hiWeight: 800,
      });
      cy += px(16);
    };

    const linhasResumo: [string, string, string][] = [
      ["O QUE É", r.oque, A],
      ["BENEFÍCIO", r.beneficio, G],
      ["RISCO", r.risco, A],
      ["EVIDÊNCIA", r.evidencia || "PRELIMINAR", P],
      ["CUSTO", r.custo || "", NEXUS_TPL.muted],
    ];
    for (const [label, value, color] of linhasResumo.filter(([, v]) => v).slice(0, MAX_LINHAS_RESUMO)) {
      line(label, value, color);
    }

    cy += px(4);
    const vTop = cy;
    const vEnd = drawRich(ctx, r.veredicto || "", x + px(30), cy + px(26), {
      size: 14, weight: 700, color: A, accent: A, lineHeight: 1.45, maxWidth: maxW - px(60),
    });
    ctx.fillStyle = A;
    ctx.fillRect(x + px(18), vTop + px(10), px(3), vEnd - vTop - px(16));
    cy = vEnd + px(14);

    roundRect(ctx, x, cardTop, maxW, cy - cardTop, px(14));
    ctx.strokeStyle = `${A}26`;
    ctx.lineWidth = px(1);
    ctx.stroke();
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
    y = pill(ctx, vault, x, y, { bg: NEXUS_TPL.bg, color: A });
    y += px(70);
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
    const disc = NEXUS_CTA_SLIDE.disclaimer;
    drawRich(ctx, disc, x, h - px(74), {
      size: 10, weight: 400, color: NEXUS_TPL.ctaHandle, accent: NEXUS_TPL.ctaHandle,
      lineHeight: 1.45, maxWidth: maxW,
    });

    footer(ctx, w, h, handle, true);
    out.push(canvas.toDataURL("image/png"));
  }

  return out;
};

/** Rótulos dos slides gerados, na mesma ordem do array de imagens. */
export const nexusSlideLabels = (content: NexusCarouselContent): string[] => {
  const labels = ["CAPA", "FICHA", "MECANISMO"];
  const nBenef = chunk((content.slide4_beneficios || []).slice(0, MAX_BENEFICIOS_TOTAL), MAX_BENEFICIOS_SLIDE).length || 1;
  for (let i = 0; i < nBenef; i++) labels.push(i === 0 ? "BENEFÍCIOS" : `BENEFÍCIOS ${i + 1}`);
  const nRisco = chunk((content.slide5_riscos || []).slice(0, MAX_RISCOS_TOTAL), MAX_RISCOS_SLIDE).length || 1;
  for (let i = 0; i < nRisco; i++) labels.push(i === 0 ? "RISCOS" : `RISCOS ${i + 1}`);
  if (content.slide6_tabela?.length && content.slide6_comparativo_nome) labels.push("COMPARATIVO");
  labels.push("PRA QUEM");
  const nPerg = chunk((content.slide8_perguntas_medico || []).slice(0, MAX_PERGUNTAS_TOTAL), MAX_PERGUNTAS_SLIDE).length || 1;
  for (let i = 0; i < nPerg; i++) labels.push(i === 0 ? "PERGUNTAS" : `PERGUNTAS ${i + 1}`);
  labels.push("RESUMO", "CTA");
  return labels;
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
