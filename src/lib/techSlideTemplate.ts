/**
 * Renderizador TECH genérico: transforma slides normalizados (`TechSlide`)
 * em PNGs 1080x1350 na identidade TECH CIENTÍFICO.
 *
 * Cada gerador do nutriON (MCE, BiomechanicsVault, módulos, treino do dia,
 * refeição, resultado + protocolo, mito/método) converte o próprio conteúdo
 * em `TechSlide[]` — nenhum dado é inventado aqui, só desenhado.
 */

import { sanitizarConteudoPublico } from "@/lib/publicLanguage";
import {
  TECH_PAD as PAD,
  TECH_TPL,
  TECH_W as W,
  drawRich,
  ensureTechFonts,
  finishTechSlide,
  headFont,
  infoCard,
  monoFont,
  newTechSlide,
  rgba,
  roundRect,
  techContentBottom,
  techHeader,
} from "@/lib/techBase";

export type TechCard = {
  /** Número/valor real (kcal, kg, %, minutos). Nunca decorativo. */
  destaque?: string;
  titulo?: string;
  texto?: string;
  /** Fonte, estudo ou observação curta. */
  nota?: string;
};

export type TechSlide = {
  tipo?: "capa" | "conteudo" | "cta";
  eyebrow?: string;
  titulo?: string;
  subtitulo?: string;
  texto?: string;
  /** Métricas reais em grade (label + valor). */
  dados?: { label: string; valor: string }[];
  cards?: TechCard[];
  bullets?: string[];
  /** Faixa de destaque no fim do slide (tradução simples, veredito etc.). */
  faixa?: { label?: string; texto: string };
  /** Rodapé de conteúdo: disclaimer ou fonte. */
  nota?: string;
  pill?: { text: string; color?: string };
};

export type TechRenderOptions = {
  handle?: string;
  /** Cor de acento alternativa (default: ciano). */
  accent?: string;
};

const bottom = () => techContentBottom();

const drawCapa = (ctx: CanvasRenderingContext2D, s: TechSlide, accent: string) => {
  let y = 150;
  if (s.eyebrow) {
    ctx.font = monoFont(400, 15);
    ctx.fillStyle = rgba(accent, 0.75);
    let lx = PAD;
    for (const ch of s.eyebrow.toUpperCase()) {
      ctx.fillText(ch, lx, y);
      lx += ctx.measureText(ch).width + 6;
    }
    y += 40;
  }
  const titulo = (s.titulo || "").toUpperCase();
  const size = titulo.length > 44 ? 66 : titulo.length > 22 ? 82 : 96;
  y = drawRich(ctx, titulo, PAD, y + size, {
    size, weight: 700, color: TECH_TPL.ink, accent, lineHeight: 1.02, maxWidth: W - PAD * 2,
  });
  if (s.subtitulo) {
    y = drawRich(ctx, s.subtitulo, PAD, y + 40, {
      size: 30, weight: 500, color: accent, lineHeight: 1.35, maxWidth: W - PAD * 2,
    });
  }
  if (s.texto) {
    y = drawRich(ctx, s.texto, PAD, y + 34, {
      size: 26, weight: 400, color: TECH_TPL.soft, lineHeight: 1.5, maxWidth: W - PAD * 2,
    });
  }
  // marcador de arraste
  ctx.font = monoFont(700, 14);
  ctx.fillStyle = rgba(accent, 0.8);
  ctx.fillText("ARRASTA  ▸", PAD, bottom() - 10);
};

const drawDados = (ctx: CanvasRenderingContext2D, dados: { label: string; valor: string }[], y: number, accent: string) => {
  const cols = dados.length >= 4 ? 2 : 1;
  const gap = 16;
  const cw = (W - PAD * 2 - gap * (cols - 1)) / cols;
  let row = 0;
  dados.slice(0, 6).forEach((d, i) => {
    const col = i % cols;
    if (col === 0 && i > 0) row++;
    const x = PAD + col * (cw + gap);
    const cy = y + row * 116;
    infoCard(ctx, x, cy, cw, 100, i % 2 === 0 ? accent : TECH_TPL.gold);
    ctx.font = monoFont(700, 12);
    ctx.fillStyle = rgba(i % 2 === 0 ? accent : TECH_TPL.gold, 0.8);
    ctx.fillText((d.label || "").toUpperCase(), x + 24, cy + 32);
    drawRich(ctx, d.valor || "", x + 24, cy + 72, {
      size: 32, weight: 700, color: TECH_TPL.ink, accent, lineHeight: 1.1, maxWidth: cw - 48,
    });
  });
  return y + (row + 1) * 116 + 8;
};

const drawConteudo = (ctx: CanvasRenderingContext2D, s: TechSlide, accent: string) => {
  let y = techHeader(ctx, s.eyebrow || "", s.titulo || "", s.subtitulo);

  if (s.texto) {
    y = drawRich(ctx, s.texto, PAD, y + 20, {
      size: 26, weight: 400, color: TECH_TPL.soft, lineHeight: 1.55, maxWidth: W - PAD * 2,
    }) + 14;
  }

  if (s.dados?.length) y = drawDados(ctx, s.dados, y + 8, accent) + 6;

  const maxW = W - PAD * 2;
  (s.cards || []).forEach((c, i) => {
    if (y > bottom() - 90) return;
    const color = i % 2 === 0 ? accent : TECH_TPL.gold;
    const top = y;
    let end = top + 26;
    if (c.destaque) {
      ctx.font = headFont(700, 54);
      ctx.fillStyle = color;
      ctx.fillText(c.destaque, PAD + 30, end + 42);
      end += 62;
    }
    if (c.titulo) {
      end = drawRich(ctx, c.titulo, PAD + 30, end + 30, {
        size: 26, weight: 700, color: TECH_TPL.ink, accent: color, lineHeight: 1.3, maxWidth: maxW - 60,
      });
    }
    if (c.texto) {
      end = drawRich(ctx, c.texto, PAD + 30, end + (c.titulo ? 8 : 30), {
        size: 23, weight: 400, color: c.titulo ? TECH_TPL.soft : TECH_TPL.ink, accent: color, lineHeight: 1.5, maxWidth: maxW - 60,
      });
    }
    if (c.nota) {
      ctx.font = monoFont(400, 13);
      ctx.fillStyle = TECH_TPL.muted;
      ctx.fillText(c.nota.slice(0, 70), PAD + 30, end + 18);
      end += 28;
    }
    const h = Math.max(72, end - top + 14);
    infoCard(ctx, PAD, top, maxW, h, color);
    // redesenha o conteúdo por cima do card
    let ry = top + 26;
    if (c.destaque) {
      ctx.font = headFont(700, 54);
      ctx.fillStyle = color;
      ctx.fillText(c.destaque, PAD + 30, ry + 42);
      ry += 62;
    }
    if (c.titulo) {
      ry = drawRich(ctx, c.titulo, PAD + 30, ry + 30, {
        size: 26, weight: 700, color: TECH_TPL.ink, accent: color, lineHeight: 1.3, maxWidth: maxW - 60,
      });
    }
    if (c.texto) {
      ry = drawRich(ctx, c.texto, PAD + 30, ry + (c.titulo ? 8 : 30), {
        size: 23, weight: 400, color: c.titulo ? TECH_TPL.soft : TECH_TPL.ink, accent: color, lineHeight: 1.5, maxWidth: maxW - 60,
      });
    }
    if (c.nota) {
      ctx.font = monoFont(400, 13);
      ctx.fillStyle = TECH_TPL.muted;
      ctx.fillText(c.nota.slice(0, 70), PAD + 30, ry + 18);
    }
    y = top + h + 18;
  });

  (s.bullets || []).forEach((b, i) => {
    if (!b || y > bottom() - 60) return;
    const color = i % 2 === 0 ? accent : TECH_TPL.gold;
    ctx.beginPath();
    ctx.arc(PAD + 8, y + 12, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    y = drawRich(ctx, b, PAD + 32, y + 20, {
      size: 25, weight: 500, color: TECH_TPL.ink, accent: color, lineHeight: 1.45, maxWidth: W - PAD * 2 - 32,
    }) + 12;
  });

  if (s.faixa) {
    const top = Math.min(y + 10, bottom() - 110);
    const end = drawRich(ctx, s.faixa.texto, PAD + 30, top + (s.faixa.label ? 66 : 46), {
      size: 26, weight: 600, color: TECH_TPL.gold, accent: TECH_TPL.gold, lineHeight: 1.4, maxWidth: W - PAD * 2 - 60,
    });
    roundRect(ctx, PAD, top, W - PAD * 2, end - top + 18, 8);
    ctx.fillStyle = rgba(TECH_TPL.gold, 0.05);
    ctx.fill();
    ctx.strokeStyle = rgba(TECH_TPL.gold, 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();
    if (s.faixa.label) {
      ctx.font = monoFont(400, 12);
      ctx.fillStyle = rgba(TECH_TPL.gold, 0.7);
      ctx.fillText(s.faixa.label.toUpperCase(), PAD + 30, top + 30);
    }
    drawRich(ctx, s.faixa.texto, PAD + 30, top + (s.faixa.label ? 66 : 46), {
      size: 26, weight: 600, color: TECH_TPL.gold, accent: TECH_TPL.gold, lineHeight: 1.4, maxWidth: W - PAD * 2 - 60,
    });
    y = end + 28;
  }

  if (s.nota) {
    ctx.font = monoFont(400, 13);
    ctx.fillStyle = TECH_TPL.muted;
    drawRich(ctx, s.nota, PAD, bottom() - 12, {
      size: 13, weight: 400, color: TECH_TPL.muted, lineHeight: 1.4, maxWidth: W - PAD * 2, family: "mono",
    });
  }
};

const drawCta = (ctx: CanvasRenderingContext2D, s: TechSlide, accent: string) => {
  let y = 300;
  if (s.eyebrow) {
    ctx.font = monoFont(400, 15);
    ctx.fillStyle = rgba(accent, 0.75);
    ctx.fillText(s.eyebrow.toUpperCase(), PAD, y);
    y += 40;
  }
  y = drawRich(ctx, (s.titulo || "").toUpperCase(), PAD, y + 60, {
    size: 64, weight: 700, color: TECH_TPL.ink, accent, lineHeight: 1.06, maxWidth: W - PAD * 2,
  });
  if (s.subtitulo) {
    y = drawRich(ctx, s.subtitulo, PAD, y + 34, {
      size: 28, weight: 500, color: TECH_TPL.soft, lineHeight: 1.45, maxWidth: W - PAD * 2,
    });
  }
  if (s.texto) {
    y = drawRich(ctx, s.texto, PAD, y + 30, {
      size: 24, weight: 400, color: TECH_TPL.muted, lineHeight: 1.5, maxWidth: W - PAD * 2,
    });
  }
  // caixa dourada do CTA
  const boxTop = Math.min(y + 40, bottom() - 130);
  roundRect(ctx, PAD, boxTop, W - PAD * 2, 96, 10);
  ctx.fillStyle = rgba(TECH_TPL.gold, 0.12);
  ctx.fill();
  ctx.strokeStyle = rgba(TECH_TPL.gold, 0.45);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = headFont(700, 34);
  ctx.fillStyle = TECH_TPL.gold;
  ctx.textBaseline = "middle";
  ctx.fillText(s.faixa?.texto || "LINK NA BIO", PAD + 34, boxTop + 48);
  ctx.textBaseline = "alphabetic";
  if (s.nota) {
    ctx.font = monoFont(400, 14);
    ctx.fillStyle = TECH_TPL.muted;
    ctx.fillText(s.nota, PAD, boxTop + 140);
  }
};

/** Renderiza slides normalizados no estilo TECH CIENTÍFICO. */
export const renderTechSlides = async (
  slidesBrutos: TechSlide[],
  opts: TechRenderOptions = {},
): Promise<string[]> => {
  // Traduz termos internos para linguagem que o público entende.
  const slides = sanitizarConteudoPublico(slidesBrutos);
  await ensureTechFonts();
  const handle = opts.handle || "diogo.mell0";
  const accent = opts.accent || TECH_TPL.cyan;
  const out: string[] = [];
  slides.forEach((s, i) => {
    const { canvas, ctx } = newTechSlide(i * 1.3 + 0.4, s.pill ? { text: s.pill.text, color: s.pill.color || accent } : undefined);
    if (s.tipo === "capa") drawCapa(ctx, s, accent);
    else if (s.tipo === "cta") drawCta(ctx, s, accent);
    else drawConteudo(ctx, s, accent);
    out.push(finishTechSlide(canvas, ctx, handle));
  });
  return out;
};
