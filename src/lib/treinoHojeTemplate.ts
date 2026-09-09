/**
 * Carrossel e Stories "TREINO DE HOJE" — post premium montado a partir da tela
 * de exercícios real do TrainingON, com a foto do coach como capa.
 *
 * Nenhum número é inventado: séries, tempo, grupos e metas vêm do protocolo.
 */

import {
  SLIDE_W,
  SLIDE_H,
  SLIDE_PAD_X,
  beginSlideContent,
  createSlideCanvas,
  drawSlideFooter,
  slideContentBottom,
} from "@/lib/slideBase";
import { W as STORY_W, H as STORY_H } from "@/lib/photoStoryTemplates";
import type { TreinoHoje, TreinoHojeExercicio } from "@/lib/treinoHojeData";

export const TREINO_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#888888",
  soft: "#CCCCCC",
  gold: "#EF9F27",
  green: "#5DCAA5",
  purple: "#AFA9EC",
} as const;

const S = 3;
const px = (v: number) => v * S;
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

const wrap = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
  maxLines = 20,
): number => {
  const words = (text || "").split(/\s+/).filter(Boolean);
  let line = "";
  let cursor = y;
  let lines = 0;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cursor);
      lines += 1;
      if (lines >= maxLines) return cursor;
      cursor += lh;
      line = w;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, cursor);
  return cursor;
};

const drawTextura = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const g = ctx.createRadialGradient(w * 0.85, h * 0.1, 0, w * 0.85, h * 0.1, w);
  g.addColorStop(0, "rgba(239,159,39,0.12)");
  g.addColorStop(1, "rgba(239,159,39,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let i = 0; i < 55; i += 1) {
    ctx.beginPath();
    ctx.arc((i * 137.5) % w, (i * 311.7) % h, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawPill = (
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  cor: string = TREINO_TPL.gold,
) => {
  ctx.font = font(700, px(11));
  const w = ctx.measureText(texto.toUpperCase()).width + px(28);
  roundRect(ctx, x, y, w, px(34), px(17));
  ctx.fillStyle = `${cor}1F`;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `${cor}66`;
  ctx.stroke();
  ctx.fillStyle = cor;
  ctx.fillText(texto.toUpperCase(), x + px(14), y + px(22));
  return w;
};

/** Foto full-bleed com corte "cover" + escurecimento em degradê. */
const drawFotoCover = (
  ctx: CanvasRenderingContext2D,
  foto: HTMLImageElement,
  w: number,
  h: number,
  forca = 0.9,
) => {
  const escala = Math.max(w / foto.width, h / foto.height);
  const dw = foto.width * escala;
  const dh = foto.height * escala;
  ctx.drawImage(foto, (w - dw) / 2, (h - dh) / 2.2, dw, dh);

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `rgba(10,10,10,${0.55 * forca})`);
  g.addColorStop(0.42, `rgba(10,10,10,${0.2 * forca})`);
  g.addColorStop(0.72, `rgba(10,10,10,${0.85 * forca})`);
  g.addColorStop(1, `rgba(10,10,10,${0.98 * forca})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

const setsLinha = (ex: TreinoHojeExercicio) =>
  ex.sets.map((s) => (s.label ? `${s.label}: ${s.detail}` : s.detail));

type Slide =
  | { tipo: "CAPA" }
  | { tipo: "SESSAO" }
  | { tipo: "AQUECIMENTO" }
  | { tipo: "EXERCICIO"; ex: TreinoHojeExercicio; indice: number; total: number }
  | { tipo: "NUTRI" }
  | { tipo: "CTA" };

const montarSlides = (t: TreinoHoje): Slide[] => {
  const slides: Slide[] = [{ tipo: "CAPA" }, { tipo: "SESSAO" }];
  if (t.aquecimento.length) slides.push({ tipo: "AQUECIMENTO" });
  const exs = t.exercicios.slice(0, 5);
  exs.forEach((ex, i) => slides.push({ tipo: "EXERCICIO", ex, indice: i, total: exs.length }));
  if (t.nutricao) slides.push({ tipo: "NUTRI" });
  slides.push({ tipo: "CTA" });
  return slides;
};

export const treinoHojeSlideLabels = (t: TreinoHoje): string[] =>
  montarSlides(t).map((s) => (s.tipo === "EXERCICIO" ? `EX ${s.indice + 1}` : s.tipo));

const renderSlide = (slide: Slide, t: TreinoHoje, foto: HTMLImageElement | null, handle: string): string => {
  const isCta = slide.tipo === "CTA";
  const { canvas, ctx } = createSlideCanvas(SLIDE_W, SLIDE_H, isCta ? TREINO_TPL.gold : TREINO_TPL.bg);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  if (slide.tipo === "CAPA" && foto) drawFotoCover(ctx, foto, SLIDE_W, SLIDE_H);
  else if (!isCta) drawTextura(ctx, SLIDE_W, SLIDE_H);

  beginSlideContent(ctx, SLIDE_W, SLIDE_H);
  const maxW = SLIDE_W - SLIDE_PAD_X * 2;
  const bottom = slideContentBottom(SLIDE_H);

  if (slide.tipo === "CAPA") {
    drawPill(ctx, `treino de hoje · ${t.diaSemana}`, SLIDE_PAD_X, px(50));

    let y = bottom - px(30);
    const linhas: string[] = [];
    if (t.duracao) linhas.push(t.duracao);
    if (t.agenda?.horario) linhas.push(`${t.agenda.horario}`);
    if (t.grupos.length) linhas.push(t.grupos.slice(0, 4).join(" · "));
    if (linhas.length) {
      ctx.font = font(600, px(16));
      ctx.fillStyle = TREINO_TPL.gold;
      ctx.fillText(linhas.join("  •  "), SLIDE_PAD_X, y);
      y -= px(46);
    }

    ctx.font = font(900, px(54));
    ctx.fillStyle = TREINO_TPL.ink;
    const nome = (t.nomeTreino || "Treino de hoje").toUpperCase();
    // desenha de baixo pra cima: mede quantas linhas o título ocupa
    const palavras = nome.split(/\s+/);
    const linhasTitulo: string[] = [];
    let atual = "";
    for (const p of palavras) {
      const teste = atual ? `${atual} ${p}` : p;
      if (ctx.measureText(teste).width > maxW && atual) {
        linhasTitulo.push(atual);
        atual = p;
      } else atual = teste;
    }
    if (atual) linhasTitulo.push(atual);
    const usadas = linhasTitulo.slice(-3);
    let ty = y - (usadas.length - 1) * px(60);
    usadas.forEach((l) => {
      ctx.fillText(l, SLIDE_PAD_X, ty);
      ty += px(60);
    });
    y = y - usadas.length * px(60) - px(14);

    ctx.font = font(500, px(17));
    ctx.fillStyle = TREINO_TPL.soft;
    ctx.fillText("Transformação é sistema.", SLIDE_PAD_X, y);
  }

  if (slide.tipo === "SESSAO") {
    drawPill(ctx, "a sessão", SLIDE_PAD_X, px(50), TREINO_TPL.green);
    ctx.font = font(900, px(38));
    ctx.fillStyle = TREINO_TPL.ink;
    let y = wrap(ctx, t.nomeTreino || "Sessão de hoje", SLIDE_PAD_X, px(170), maxW, px(46), 2) + px(56);

    t.exercicios.slice(0, 6).forEach((ex, i) => {
      if (y + px(96) > bottom) return;
      roundRect(ctx, SLIDE_PAD_X, y - px(34), maxW, px(84), px(16));
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(239,159,39,0.25)";
      ctx.stroke();

      ctx.font = font(800, px(20));
      ctx.fillStyle = TREINO_TPL.gold;
      ctx.fillText(String(i + 1).padStart(2, "0"), SLIDE_PAD_X + px(18), y);
      ctx.font = font(700, px(20));
      ctx.fillStyle = TREINO_TPL.ink;
      ctx.fillText(ex.nome, SLIDE_PAD_X + px(62), y);
      if (ex.alvo) {
        ctx.font = font(400, px(13));
        ctx.fillStyle = TREINO_TPL.muted;
        ctx.fillText(ex.alvo, SLIDE_PAD_X + px(62), y + px(24));
      }
      y += px(104);
    });

    ctx.font = font(600, px(14));
    ctx.fillStyle = TREINO_TPL.gold;
    if (y + px(30) < bottom) ctx.fillText("ARRASTA PRA VER SÉRIE POR SÉRIE ▸", SLIDE_PAD_X, bottom - px(10));
  }

  if (slide.tipo === "AQUECIMENTO") {
    drawPill(ctx, "aquecimento", SLIDE_PAD_X, px(50), TREINO_TPL.purple);
    ctx.font = font(900, px(40));
    ctx.fillStyle = TREINO_TPL.ink;
    let y = px(180) + px(60);
    ctx.fillText("PREPARO", SLIDE_PAD_X, px(180));

    t.aquecimento.slice(0, 4).forEach((a) => {
      if (y + px(80) > bottom) return;
      ctx.font = font(700, px(21));
      ctx.fillStyle = TREINO_TPL.ink;
      y = wrap(ctx, a.nome, SLIDE_PAD_X, y, maxW, px(28), 2) + px(30);
      const detalhes = setsLinha(a).join(" · ") || a.notas || "";
      if (detalhes) {
        ctx.font = font(400, px(16));
        ctx.fillStyle = TREINO_TPL.soft;
        y = wrap(ctx, detalhes, SLIDE_PAD_X, y, maxW, px(24), 3) + px(44);
      } else y += px(14);
    });
  }

  if (slide.tipo === "EXERCICIO") {
    const { ex, indice, total } = slide;
    drawPill(ctx, `exercício ${indice + 1}/${total}`, SLIDE_PAD_X, px(50));
    ctx.font = font(900, px(42));
    ctx.fillStyle = TREINO_TPL.ink;
    let y = wrap(ctx, ex.nome, SLIDE_PAD_X, px(180), maxW, px(52), 3) + px(34);

    const meta = [ex.alvo, ex.tempo ? `tempo ${ex.tempo}` : ""].filter(Boolean).join(" · ");
    if (meta) {
      ctx.font = font(600, px(16));
      ctx.fillStyle = TREINO_TPL.green;
      y = wrap(ctx, meta, SLIDE_PAD_X, y, maxW, px(24), 2) + px(48);
    }

    setsLinha(ex).slice(0, 5).forEach((linha) => {
      if (y + px(86) > bottom) return;
      roundRect(ctx, SLIDE_PAD_X, y - px(30), maxW, px(74), px(14));
      ctx.fillStyle = "rgba(239,159,39,0.08)";
      ctx.fill();
      ctx.font = font(600, px(19));
      ctx.fillStyle = TREINO_TPL.ink;
      wrap(ctx, linha, SLIDE_PAD_X + px(20), y, maxW - px(40), px(24), 2);
      y += px(94);
    });

    if (ex.notas && y + px(60) < bottom) {
      ctx.font = font(400, px(15));
      ctx.fillStyle = TREINO_TPL.muted;
      wrap(ctx, ex.notas, SLIDE_PAD_X, y + px(10), maxW, px(22), 3);
    }
  }

  if (slide.tipo === "NUTRI" && t.nutricao) {
    drawPill(ctx, "nutrição do dia", SLIDE_PAD_X, px(50), TREINO_TPL.green);
    ctx.font = font(900, px(40));
    ctx.fillStyle = TREINO_TPL.ink;
    let y = px(190);
    ctx.fillText("O TREINO MUDA", SLIDE_PAD_X, y);
    ctx.fillText("O PRATO.", SLIDE_PAD_X, y + px(50));
    y += px(140);

    const itens: [string, string][] = [];
    if (t.nutricao.metaDiaKcal) itens.push(["Meta do dia", `${t.nutricao.metaDiaKcal} kcal`]);
    if (t.nutricao.proteinaG) itens.push(["Proteína", `${t.nutricao.proteinaG} g`]);
    if (t.nutricao.carboG) itens.push(["Carboidrato", `${t.nutricao.carboG} g`]);
    if (t.nutricao.treinoTipo) itens.push(["Tipo de dia", t.nutricao.treinoTipo]);

    itens.forEach(([k, v]) => {
      if (y + px(70) > bottom) return;
      ctx.font = font(400, px(15));
      ctx.fillStyle = TREINO_TPL.muted;
      ctx.fillText(k.toUpperCase(), SLIDE_PAD_X, y);
      ctx.font = font(800, px(28));
      ctx.fillStyle = TREINO_TPL.gold;
      ctx.fillText(v, SLIDE_PAD_X, y + px(34));
      y += px(84);
    });
  }

  if (slide.tipo === "CTA") {
    ctx.font = font(700, px(13));
    ctx.fillStyle = "rgba(10,10,10,0.7)";
    ctx.fillText("NUTRION", SLIDE_PAD_X, px(80));
    ctx.font = font(900, px(52));
    ctx.fillStyle = "#0A0A0A";
    let y = wrap(ctx, "Treino sem sistema vira esforço perdido.", SLIDE_PAD_X, px(360), maxW, px(62), 4) + px(60);
    ctx.font = font(500, px(20));
    ctx.fillStyle = "rgba(10,10,10,0.8)";
    y = wrap(
      ctx,
      "Descubra em qual pilar você trava: diagnóstico gratuito — link na bio.",
      SLIDE_PAD_X,
      y,
      maxW,
      px(30),
      3,
    );
    ctx.font = font(700, px(15));
    ctx.fillStyle = "rgba(10,10,10,0.65)";
    ctx.fillText("14 perguntas · 4 minutos · resultado imediato", SLIDE_PAD_X, bottom - px(10));
  }

  drawSlideFooter(ctx, SLIDE_W, SLIDE_H, handle, {
    ink: isCta ? "#0A0A0A" : TREINO_TPL.ink,
    accent: isCta ? "#0A0A0A" : TREINO_TPL.gold,
    handleColor: isCta ? "rgba(10,10,10,0.7)" : TREINO_TPL.muted,
    background: isCta ? TREINO_TPL.gold : TREINO_TPL.bg,
  });

  return canvas.toDataURL("image/png");
};

export const renderTreinoHojeCarousel = (
  t: TreinoHoje,
  foto: HTMLImageElement | null,
  handle: string,
): string[] => montarSlides(t).map((s) => renderSlide(s, t, foto, handle));

export const TREINO_STORY_LABELS = ["CAPA", "SESSÃO", "CTA"];

const renderStory = (
  tipo: "CAPA" | "SESSAO" | "CTA",
  t: TreinoHoje,
  foto: HTMLImageElement | null,
  handle: string,
): string => {
  const { canvas, ctx } = createSlideCanvas(STORY_W, STORY_H, TREINO_TPL.bg);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  if (tipo === "CAPA" && foto) drawFotoCover(ctx, foto, STORY_W, STORY_H);
  else drawTextura(ctx, STORY_W, STORY_H);

  beginSlideContent(ctx, STORY_W, STORY_H);
  const maxW = STORY_W - SLIDE_PAD_X * 2;
  const bottom = slideContentBottom(STORY_H);

  if (tipo === "CAPA") {
    drawPill(ctx, `treino de hoje · ${t.diaSemana}`, SLIDE_PAD_X, px(120));
    ctx.font = font(900, px(56));
    ctx.fillStyle = TREINO_TPL.ink;
    let y = wrap(ctx, (t.nomeTreino || "Treino de hoje").toUpperCase(), SLIDE_PAD_X, STORY_H * 0.62, maxW, px(66), 3);
    const info = [t.duracao, t.agenda?.horario, t.grupos.slice(0, 3).join(" · ")].filter(Boolean).join("  •  ");
    if (info) {
      ctx.font = font(600, px(18));
      ctx.fillStyle = TREINO_TPL.gold;
      wrap(ctx, info, SLIDE_PAD_X, y + px(54), maxW, px(26), 2);
    }
  }

  if (tipo === "SESSAO") {
    drawPill(ctx, "a sessão", SLIDE_PAD_X, px(140), TREINO_TPL.green);
    ctx.font = font(900, px(46));
    ctx.fillStyle = TREINO_TPL.ink;
    let y = px(300);
    t.exercicios.slice(0, 6).forEach((ex, i) => {
      if (y + px(90) > bottom) return;
      ctx.font = font(800, px(22));
      ctx.fillStyle = TREINO_TPL.gold;
      ctx.fillText(String(i + 1).padStart(2, "0"), SLIDE_PAD_X, y);
      ctx.font = font(700, px(24));
      ctx.fillStyle = TREINO_TPL.ink;
      y = wrap(ctx, ex.nome, SLIDE_PAD_X + px(56), y, maxW - px(56), px(30), 2) + px(20);
      const linha = setsLinha(ex)[0];
      if (linha) {
        ctx.font = font(400, px(16));
        ctx.fillStyle = TREINO_TPL.muted;
        y = wrap(ctx, linha, SLIDE_PAD_X + px(56), y, maxW - px(56), px(22), 1) + px(40);
      } else y += px(26);
    });
  }

  if (tipo === "CTA") {
    ctx.font = font(900, px(52));
    ctx.fillStyle = TREINO_TPL.ink;
    const y = wrap(ctx, "Em qual pilar você trava?", SLIDE_PAD_X, STORY_H * 0.42, maxW, px(62), 3);
    ctx.font = font(500, px(20));
    ctx.fillStyle = TREINO_TPL.soft;
    wrap(ctx, "Diagnóstico gratuito — link na bio.", SLIDE_PAD_X, y + px(50), maxW, px(28), 2);
    ctx.font = font(700, px(16));
    ctx.fillStyle = TREINO_TPL.gold;
    ctx.fillText("14 perguntas · 4 minutos · resultado imediato", SLIDE_PAD_X, y + px(120));
  }

  drawSlideFooter(ctx, STORY_W, STORY_H, handle, {
    ink: TREINO_TPL.ink,
    accent: TREINO_TPL.gold,
    handleColor: TREINO_TPL.muted,
    background: TREINO_TPL.bg,
  });

  return canvas.toDataURL("image/png");
};

export const renderTreinoHojeStories = (
  t: TreinoHoje,
  foto: HTMLImageElement | null,
  handle: string,
): string[] => (["CAPA", "SESSAO", "CTA"] as const).map((tipo) => renderStory(tipo, t, foto, handle));

/** Legenda montada só com o que existe no protocolo real. */
export const treinoHojeLegenda = (t: TreinoHoje): string => {
  const partes: string[] = [];
  partes.push(`${(t.nomeTreino || "Treino de hoje").toUpperCase()} — ${t.diaSemana}, ${t.dataLabel}.`);
  if (t.grupos.length) partes.push(`Foco: ${t.grupos.slice(0, 4).join(", ")}.`);
  if (t.duracao) partes.push(`Duração planejada: ${t.duracao}.`);
  const nomes = t.exercicios.slice(0, 5).map((e) => e.nome);
  if (nomes.length) partes.push(`Sessão: ${nomes.join(" · ")}.`);
  if (t.nutricao?.metaDiaKcal) partes.push(`Meta do dia: ${t.nutricao.metaDiaKcal} kcal.`);
  partes.push("Não é motivação. É sistema: a sessão já estava definida antes do dia começar.");
  partes.push("Transformação é sistema.");
  partes.push("Diagnóstico gratuito no link da bio — 14 perguntas · 4 minutos · resultado imediato.");
  return partes.join("\n\n");
};

export const TREINO_HASHTAGS = [
  "#treino",
  "#musculacao",
  "#hipertrofia",
  "#coachdiogomello",
  "#nutrion",
];
